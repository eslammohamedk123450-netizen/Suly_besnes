import type { PlayerProfile } from '../domain/player';
import { supabase } from './supabaseClient';
import { normalizeSavedProfile } from './saveRepository';

export async function loadRemoteGame(accountId: string): Promise<PlayerProfile | null> {
  const { data, error } = await supabase.from('game_profiles').select('save_data').eq('user_id', accountId).maybeSingle();
  if (error || !data?.save_data || typeof data.save_data !== 'object') return null;
  return normalizeSavedProfile(data.save_data);
}

export async function saveRemoteGame(accountId: string, profile: PlayerProfile): Promise<boolean> {
  const { error } = await supabase.from('game_profiles').upsert({ user_id: accountId, account_code: profile.accountCode, player_name: profile.name, game_day: profile.day, save_data: profile, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  return !error;
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
