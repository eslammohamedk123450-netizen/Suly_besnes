import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockRpc = vi.hoisted(() => vi.fn());
vi.mock('./supabaseClient', () => ({ supabase: { rpc: mockRpc } }));

import { getRankedGlobalLeaderboard } from './leaderboardRepository';

beforeEach(() => vi.clearAllMocks());

describe('ranked global leaderboard', () => {
  it('requests the selected safe category and preserves the current player row outside the top ten', async () => {
    const currentPlayer = {
      rank: 17,
      public_name: 'مستثمر',
      score: 210,
      category_value: 4,
      completed_challenges: 7,
      badge_key: null,
      updated_at: '2026-10-24T00:00:00.000Z',
      player_level: 6,
      company_count: 3,
      land_count: 2,
      badge_count: 5,
      is_current_player: true,
    };
    mockRpc.mockResolvedValue({ data: [currentPlayer], error: null });

    await expect(getRankedGlobalLeaderboard('season-1', 'contracts', 10)).resolves.toEqual([currentPlayer]);
    expect(mockRpc).toHaveBeenCalledWith('get_ranked_global_leaderboard', {
      p_season_id: 'season-1',
      p_category: 'contracts',
      p_limit: 10,
    });
  });

  it('clamps requested rows to the public top-ten maximum', async () => {
    mockRpc.mockResolvedValue({ data: [], error: null });

    await getRankedGlobalLeaderboard('season-1', 'badges', 100);

    expect(mockRpc).toHaveBeenCalledWith('get_ranked_global_leaderboard', {
      p_season_id: 'season-1',
      p_category: 'badges',
      p_limit: 10,
    });
  });
});
