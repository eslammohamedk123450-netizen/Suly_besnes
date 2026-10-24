import { describe, expect, it } from 'vitest';
import { getGameDayDurationMinutes, getGameDayDurationMs } from './time';

describe('game day speed', () => {
  it('keeps the standard day at 24 real minutes', () => {
    expect(getGameDayDurationMinutes(1)).toBe(24);
    expect(getGameDayDurationMs(1)).toBe(24 * 60 * 1000);
  });

  it('shows the correct accelerated day durations', () => {
    expect(getGameDayDurationMinutes(2)).toBe(12);
    expect(getGameDayDurationMinutes(3)).toBe(8);
  });
});
