import { afterEach, describe, expect, it, vi } from 'vitest';
import { COUNTRIES } from '../domain/countries';
import { createNewPlayer } from '../domain/player';
import { normalizeAccountFeatures } from '../domain/accountFeatures';
import { blockInitialProfile, clearPendingInitialProfile, loadPendingInitialProfile, queueInitialProfile } from './pendingInitialProfile';

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

afterEach(() => vi.unstubAllGlobals());

describe('pending initial cloud profile', () => {
  it('retains a valid local world until initialization succeeds', () => {
    vi.stubGlobal('localStorage', new MemoryStorage());
    const profile = normalizeAccountFeatures(createNewPlayer(COUNTRIES[0], 'نور', new Date('2026-01-01T00:00:00.000Z')), 'account-1');

    expect(queueInitialProfile('account-1', profile)).toBe(true);
    expect(loadPendingInitialProfile('account-1')?.profile).toMatchObject({ id: profile.id, name: 'نور' });
    blockInitialProfile('account-1', 'remote_conflict');
    expect(loadPendingInitialProfile('account-1')).toMatchObject({ status: 'blocked', blockedReason: 'remote_conflict' });

    clearPendingInitialProfile('account-1');
    expect(loadPendingInitialProfile('account-1')).toBeNull();
  });

  it('does not replace a different pending world for the same account', () => {
    vi.stubGlobal('localStorage', new MemoryStorage());
    const first = normalizeAccountFeatures(createNewPlayer(COUNTRIES[0], 'نور', new Date('2026-01-01T00:00:00.000Z')), 'account-1');
    const second = normalizeAccountFeatures(createNewPlayer(COUNTRIES[0], 'ليلى', new Date('2026-01-02T00:00:00.000Z')), 'account-1');

    expect(queueInitialProfile('account-1', first)).toBe(true);
    expect(queueInitialProfile('account-1', second)).toBe(false);
    expect(loadPendingInitialProfile('account-1')?.profile.id).toBe(first.id);
  });
});
