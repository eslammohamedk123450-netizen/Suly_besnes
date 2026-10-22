import type { PlayerProfile } from '../domain/player';
import { supabase } from './supabaseClient';

export async function loadRemoteGame(accountId: string): Promise<PlayerProfile | null> {
  const { data, error } = await supabase.from('game_profiles').select('save_data').eq('user_id', accountId).maybeSingle();
  if (error || !data?.save_data || typeof data.save_data !== 'object') return null;
  return data.save_data as PlayerProfile;
}

export async function saveRemoteGame(accountId: string, profile: PlayerProfile): Promise<boolean> {
  const { error } = await supabase.from('game_profiles').upsert({ user_id: accountId, player_name: profile.name, game_day: profile.day, save_data: profile, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  return !error;
}

export async function redeemRemoteReward(accountId: string, profile: PlayerProfile, codeId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('redeem_reward_code', {
    p_code_id: codeId,
    p_user_id: accountId,
    p_player_name: profile.name,
    p_game_day: profile.day,
    p_save_data: profile,
  });
  return !error && data === true;
}
