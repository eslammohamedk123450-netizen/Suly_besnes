import { supabase } from './supabaseClient';

export interface PublicSeason {
  id: string;
  season_key: string;
  title: string;
  starts_at: string;
  ends_at: string;
  status: 'active' | 'finalized';
}

export interface LeaderboardRow {
  rank: number;
  public_name: string;
  score: number;
  completed_challenges: number;
  badge_key: string | null;
  updated_at: string;
}

export async function getVisibleSeasons(): Promise<PublicSeason[]> {
  const { data, error } = await supabase
    .from('visible_game_seasons')
    .select('id, season_key, title, starts_at, ends_at, status')
    .order('starts_at', { ascending: false })
    .limit(10);
  if (error) throw error;
  return (data ?? []) as PublicSeason[];
}

export async function getGlobalLeaderboard(seasonId: string, limit = 100, offset = 0): Promise<LeaderboardRow[]> {
  const { data, error } = await supabase.rpc('get_global_leaderboard', {
    p_season_id: seasonId,
    p_limit: Math.min(Math.max(limit, 1), 100),
    p_offset: Math.max(offset, 0),
  });
  if (error) throw error;
  return (data ?? []) as LeaderboardRow[];
}

export async function claimDailySeasonLogin(seasonId: string): Promise<LeaderboardRow | null> {
  const { data, error } = await supabase.functions.invoke('season-event', {
    body: { seasonId, eventType: 'login_reward' },
  });
  if (error) throw error;
  return (data?.seasonScore ?? null) as LeaderboardRow | null;
}
