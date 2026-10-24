import { useEffect, useRef, useState } from 'react';
import type { PlayerProfile } from '../domain/player';
import { formatNumber } from '../domain/formatters';
import { Icon } from './Icon';
import { GAME_DAY_MS } from '../game/time';

const DAY_MS = GAME_DAY_MS;
const CLOCK_KEY = 'business-empire-real-time-clock-v2';
const MAX_CATCH_UP_DAYS = 30;

interface SavedClock {
  profileId: string;
  nextDayAt: number;
}

interface GameDayTimerProps {
  profile: PlayerProfile;
  onDaysElapsed: (days: number) => void;
}

function readClock(profileId: string): SavedClock {
  try {
    const raw = localStorage.getItem(CLOCK_KEY);
    const saved = raw ? JSON.parse(raw) as SavedClock : null;
    if (saved?.profileId === profileId && Number.isFinite(saved.nextDayAt)) return saved;
  } catch {
    // Fall back to a fresh local clock if storage is unavailable or corrupted.
  }
  const fresh = { profileId, nextDayAt: Date.now() + DAY_MS };
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
  const [clock, setClock] = useState<SavedClock>(() => readClock(profile.id));
  const [now, setNow] = useState(() => Date.now());
  const processedClockRef = useRef(0);

  useEffect(() => {
    const nextClock = readClock(profile.id);
    setClock(nextClock);
    setNow(Date.now());
  }, [profile.id]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (now < clock.nextDayAt || processedClockRef.current === clock.nextDayAt) return;
    processedClockRef.current = clock.nextDayAt;
    const elapsedDays = Math.min(MAX_CATCH_UP_DAYS, Math.floor((now - clock.nextDayAt) / DAY_MS) + 1);
    const nextClock = { ...clock, nextDayAt: clock.nextDayAt + elapsedDays * DAY_MS };
    writeClock(nextClock);
    setClock(nextClock);
    onDaysElapsed(elapsedDays);
  }, [clock, now, onDaysElapsed]);

  const remaining = clock.nextDayAt - now;
  return (
    <div className="game-day-timer" aria-live="off" aria-label={`اليوم ${profile.day}. الوقت المتبقي لليوم التالي ${countdown(remaining)}`}>
      <span className="game-day-timer-icon"><Icon name="clock" size={15} /></span>
      <span className="game-day-timer-copy"><small>اليوم {formatNumber(profile.day)} · الوقت المتبقي لليوم التالي</small><strong>{countdown(remaining)}</strong></span>
    </div>
  );
}
