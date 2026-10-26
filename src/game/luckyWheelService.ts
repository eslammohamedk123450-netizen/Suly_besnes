/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const LUCKY_SPIN_COOLDOWN_MS = 50 * 60 * 1000; // 50 minutes

export interface LuckySpinState {
  isFree: boolean;
  remainingMs: number;
  minutes: number;
  seconds: number;
  formattedCountdown: string;
  cooldownMinutes: number;
}

export function getLuckySpinState(lastSpinTimestamp?: number): LuckySpinState {
  let ts = lastSpinTimestamp;
  if (!ts && typeof window !== 'undefined') {
    const stored = Number(window.localStorage.getItem('suly_last_spin_time') || 0);
    if (stored > 0) ts = stored;
  }

  const now = Date.now();
  const elapsed = ts ? now - ts : LUCKY_SPIN_COOLDOWN_MS + 1000;
  const isFree = !ts || elapsed >= LUCKY_SPIN_COOLDOWN_MS;
  const remainingMs = isFree ? 0 : Math.max(0, LUCKY_SPIN_COOLDOWN_MS - elapsed);
  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);
  const formattedCountdown = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return {
    isFree,
    remainingMs,
    minutes,
    seconds,
    formattedCountdown,
    cooldownMinutes: 50,
  };
}

export function recordLuckySpinUsed(): number {
  const now = Date.now();
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('suly_last_spin_time', String(now));
  }
  return now;
}
