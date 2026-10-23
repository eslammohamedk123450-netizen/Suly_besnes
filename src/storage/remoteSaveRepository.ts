import type { PlayerProfile } from '../domain/player';
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
