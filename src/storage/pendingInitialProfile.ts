import type { PlayerProfile } from '../domain/player';
import { normalizeSavedProfile } from './saveRepository';

const STORAGE_PREFIX = 'business-empire:pending-initial-profile:v1:';

export interface PendingInitialProfile {
  profile: PlayerProfile;
  createdAt: string;
  status: 'pending' | 'blocked';
  blockedReason?: string;
}

function storageKey(accountId: string): string {
  return `${STORAGE_PREFIX}${encodeURIComponent(accountId)}`;
}

export function loadPendingInitialProfile(accountId: string): PendingInitialProfile | null {
  try {
    const raw = globalThis.localStorage?.getItem(storageKey(accountId));
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const record = value as Record<string, unknown>;
    const profile = normalizeSavedProfile(record.profile);
    if (!profile || typeof record.createdAt !== 'string' || (record.status !== 'pending' && record.status !== 'blocked')) return null;
    return { profile, createdAt: record.createdAt, status: record.status, ...(typeof record.blockedReason === 'string' ? { blockedReason: record.blockedReason } : {}) };
  } catch {
    return null;
  }
}

export function queueInitialProfile(accountId: string, profile: PlayerProfile): boolean {
  const existing = loadPendingInitialProfile(accountId);
  if (existing && (existing.profile.id !== profile.id || existing.profile.createdAt !== profile.createdAt)) return false;
  try {
    globalThis.localStorage?.setItem(storageKey(accountId), JSON.stringify({ profile, createdAt: new Date().toISOString(), status: 'pending' } satisfies PendingInitialProfile));
    return Boolean(globalThis.localStorage);
  } catch {
    return false;
  }
}

export function blockInitialProfile(accountId: string, reason: string): void {
  const pending = loadPendingInitialProfile(accountId);
  if (!pending) return;
  try {
    globalThis.localStorage?.setItem(storageKey(accountId), JSON.stringify({ ...pending, status: 'blocked', blockedReason: reason.slice(0, 240) }));
  } catch {
    // The local profile remains available even if diagnostic metadata cannot be stored.
  }
}

export function clearPendingInitialProfile(accountId: string): void {
  try {
    globalThis.localStorage?.removeItem(storageKey(accountId));
  } catch {
    // A duplicate initialization is safe: game-save refuses to replace an existing profile.
  }
}
