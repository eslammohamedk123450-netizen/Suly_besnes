import type { PlayerProfile } from '../domain/player';
import type { GameCommand, GameResult } from '../game/engine';
import { supabase } from './supabaseClient';
import { normalizeSavedProfile } from './saveRepository';

export async function loadRemoteGame(accountId: string): Promise<PlayerProfile | null> {
  const { data, error } = await supabase.from('game_profiles').select('save_data').eq('user_id', accountId).maybeSingle();
  if (error || !data?.save_data || typeof data.save_data !== 'object') return null;
  return normalizeSavedProfile(data.save_data);
}

export async function saveRemoteGame(accountId: string, profile: PlayerProfile): Promise<boolean> {
  void accountId;
  const { data, error } = await supabase.functions.invoke('game-save', {
    body: { playerName: profile.name, gameDay: profile.day, saveData: profile },
  });
  return !error && data?.ok === true;
}

export async function redeemRemoteReward(accountId: string, profile: PlayerProfile, codeId: string): Promise<boolean> {
  const { data, error } = await supabase.functions.invoke('reward-code', {
    body: {
      codeId,
      playerName: profile.name,
      gameDay: profile.day,
      saveData: profile,
    },
  });
  return !error && data?.ok === true;
}

export type RemoteGameCommandAttempt =
  | { kind: 'result'; result: GameResult<unknown> }
  | { kind: 'unavailable' }
  | { kind: 'rejected'; message: string; status: number };

function responseStatus(error: unknown): number | null {
  if (!error || typeof error !== 'object' || !('context' in error)) return null;
  const context = (error as { context?: unknown }).context;
  if (typeof Response !== 'undefined' && context instanceof Response) return context.status;
  if (context && typeof context === 'object' && 'status' in context && typeof (context as { status?: unknown }).status === 'number') return (context as { status: number }).status;
  return null;
}

/** Authenticated command path: only intents reach the server; the caller supplies a durable idempotency key. */
export async function executeRemoteGameCommand(command: GameCommand, commandKey: string): Promise<RemoteGameCommandAttempt> {
  const { data, error } = await supabase.functions.invoke('game-command', { body: { command, commandKey } });
  if (error) {
    const status = responseStatus(error);
    if (status === null || status === 404 || status === 408 || status === 429 || status >= 500) return { kind: 'unavailable' };
    return { kind: 'rejected', status, message: status === 409
      ? 'تعارضت هذه الخطوة مع نسخة أحدث من عالمك؛ أوقفنا مزامنتها لحماية تقدمك.'
      : 'رفض الخادم هذه الخطوة؛ لم يتغير العالم السحابي.' };
  }
  if (data?.ok === true && data.result && typeof data.result === 'object' && typeof data.result.ok === 'boolean' && data.result.profile) {
    const result = data.result as GameResult<unknown>;
    if (result.ok && data.profile) {
      const authoritativeProfile = normalizeSavedProfile(data.profile);
      if (authoritativeProfile) return { kind: 'result', result: { ...result, profile: authoritativeProfile } };
    }
    return { kind: 'result', result };
  }
  return { kind: 'rejected', status: 400, message: 'تعذر اعتماد صيغة هذه الخطوة؛ لم يُنفّذها الخادم.' };
}
