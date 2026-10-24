export const GAME_DAY_MS = 24 * 60 * 1000;
export const AUCTION_BID_STEP = 10_000;
export const AUCTION_DEFAULT_LEAD = 20_000;

export function getGameDayDurationMs(multiplier: 1 | 2 | 3 = 1): number {
  return GAME_DAY_MS / multiplier;
}

export function getGameDayDurationMinutes(multiplier: 1 | 2 | 3 = 1): number {
  return getGameDayDurationMs(multiplier) / 60_000;
}
