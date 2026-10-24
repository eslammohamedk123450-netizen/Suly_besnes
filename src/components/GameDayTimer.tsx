import { useEffect, useRef, useState } from 'react';
import type { PlayerProfile } from '../domain/player';
import { formatNumber } from '../domain/formatters';
import { Icon } from './Icon';
import { GAME_DAY_MS, getGameDayDurationMs } from '../game/time';

const DAY_MS = GAME_DAY_MS;
const CLOCK_KEY = 'business-empire-real-time-clock-v2';
const MAX_CATCH_UP_DAYS = 30;

interface SavedClock {
  profileId: string;
  nextDayAt: number;
  activeMultiplier: 1 | 2 | 3;
}

interface GameDayTimerProps {
  profile: PlayerProfile;
  onDaysElapsed: (days: number) => void;
}

function readClock(profileId: string, activeMultiplier: 1 | 2 | 3): SavedClock {
  try {
    const raw = localStorage.getItem(CLOCK_KEY);
    const saved = raw ? JSON.parse(raw) as SavedClock : null;
    if (saved?.profileId === profileId && Number.isFinite(saved.nextDayAt)) {
      const previousMultiplier = saved.activeMultiplier === 2 || saved.activeMultiplier === 3 ? saved.activeMultiplier : 1;
      if (previousMultiplier === activeMultiplier) return { ...saved, activeMultiplier };
      const remaining = Math.max(0, saved.nextDayAt - Date.now());
      const adjusted = { profileId, nextDayAt: Date.now() + remaining * previousMultiplier / activeMultiplier, activeMultiplier };
      localStorage.setItem(CLOCK_KEY, JSON.stringify(adjusted));
      return adjusted;
    }
  } catch {
    // Fall back to a fresh local clock if storage is unavailable or corrupted.
  }
  const fresh = { profileId, nextDayAt: Date.now() + getGameDayDurationMs(activeMultiplier), activeMultiplier };
  try { localStorage.setItem(CLOCK_KEY, JSON.stringify(fresh)); } catch { /* best effort */ }
  return fresh;
}

function writeClock(clock: SavedClock): void {
  try { localStorage.setItem(CLOCK_KEY, JSON.stringify(clock)); } catch { /* best effort */ }
}

function countdown(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':');
}

export function GameDayTimer({ profile, onDaysElapsed }: GameDayTimerProps) {
  const [clock, setClock] = useState<SavedClock>(() => readClock(profile.id, profile.activeDaySpeedMultiplier ?? 1));
  const [now, setNow] = useState(() => Date.now());
  const processedClockRef = useRef(0);

  useEffect(() => {
    const nextClock = readClock(profile.id, profile.activeDaySpeedMultiplier ?? 1);
    setClock(nextClock);
    setNow(Date.now());
  }, [profile.id, profile.activeDaySpeedMultiplier]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (now < clock.nextDayAt || processedClockRef.current === clock.nextDayAt) return;
    processedClockRef.current = clock.nextDayAt;
    const elapsedDays = Math.min(MAX_CATCH_UP_DAYS, Math.floor((now - clock.nextDayAt) / DAY_MS) + 1);
    const nextClock = { profileId: profile.id, nextDayAt: clock.nextDayAt + elapsedDays * DAY_MS, activeMultiplier: 1 as const };
    writeClock(nextClock);
    setClock(nextClock);
    onDaysElapsed(elapsedDays);
  }, [clock, now, onDaysElapsed]);

  const remaining = clock.nextDayAt - now;
  return (
    <div className="game-day-timer" aria-live="off" aria-label={`اليوم ${profile.day}${clock.activeMultiplier > 1 ? ` بسرعة ×${formatNumber(clock.activeMultiplier)}` : ''}. الوقت المتبقي لليوم التالي ${countdown(remaining)}`}>
      <span className="game-day-timer-icon"><Icon name="clock" size={15} /></span>
      <span className="game-day-timer-copy"><small>اليوم {formatNumber(profile.day)}{clock.activeMultiplier > 1 ? ` · سرعة ×${formatNumber(clock.activeMultiplier)}` : ''} · الوقت المتبقي لليوم التالي</small><strong>{countdown(remaining)}</strong></span>
    </div>
  );
}
