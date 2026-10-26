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

export type LeaderboardCategory = 'points' | 'production' | 'contracts' | 'badges' | 'net_worth' | 'prestige' | 'sovereignty' | 'season';

export interface RankedLeaderboardRow extends LeaderboardRow {
  category_value: number;
  player_level: number;
  company_count: number;
  land_count: number;
  badge_count: number;
  is_current_player: boolean;
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

export async function getRankedGlobalLeaderboard(
  seasonId: string,
  category: LeaderboardCategory = 'points',
  limit = 10,
): Promise<RankedLeaderboardRow[]> {
  const { data, error } = await supabase.rpc('get_ranked_global_leaderboard', {
    p_season_id: seasonId,
    p_category: category,
    p_limit: Math.min(Math.max(limit, 1), 10),
  });
  if (error) throw error;
  return (data ?? []) as RankedLeaderboardRow[];
}

export async function claimDailySeasonLogin(seasonId: string): Promise<LeaderboardRow | null> {
  const { data, error } = await supabase.functions.invoke('season-event', {
    body: { seasonId, eventType: 'login_reward' },
  });
  if (error) throw error;
  return (data?.seasonScore ?? null) as LeaderboardRow | null;
}

export type VerifiedGameTransactionType = 'production_completed' | 'sale_completed' | 'contract_delivered' | 'auction_won';

export async function recordVerifiedGameTransaction(
  seasonId: string,
  transactionType: VerifiedGameTransactionType,
  sourceId: string,
): Promise<boolean> {
  const { data, error } = await supabase.functions.invoke('game-transaction', {
    body: {
      seasonId,
      eventType: transactionType,
      sourceId,
      idempotencyKey: `${transactionType}:${sourceId}`,
    },
  });
  if (error) throw error;
  return data?.ok === true;
}
