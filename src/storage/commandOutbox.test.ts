import { afterEach, describe, expect, it, vi } from 'vitest';
import type { GameCommand } from '../game/engine';
import { acknowledgeGameCommand, blockGameCommand, enqueueGameCommand, loadQueuedGameCommands } from './commandOutbox';

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

afterEach(() => vi.unstubAllGlobals());

describe('local game command outbox', () => {
  it('stores only intent and reuses an existing idempotency key', () => {
    vi.stubGlobal('localStorage', new MemoryStorage());
    const command = { name: 'buy_material', args: { materialId: 'steel', quantity: 2 } } as const;

    const first = enqueueGameCommand('account-1', command, 'stable-command-key-0001');
    const repeated = enqueueGameCommand('account-1', command, 'stable-command-key-0001');

    expect(first?.commandKey).toBe('stable-command-key-0001');
    expect(repeated?.commandKey).toBe(first?.commandKey);
    expect(loadQueuedGameCommands('account-1')).toHaveLength(1);
    expect(loadQueuedGameCommands('account-1')[0].command).toEqual(command);
  });

  it('keeps commands isolated by account and preserves queue order', () => {
    vi.stubGlobal('localStorage', new MemoryStorage());
    enqueueGameCommand('account-1', { name: 'advance_day', args: {} }, 'stable-command-key-0001');
    enqueueGameCommand('account-1', { name: 'buy_gold', args: { grams: 1 } }, 'stable-command-key-0002');

    expect(loadQueuedGameCommands('account-1').map((item) => item.command.name)).toEqual(['advance_day', 'buy_gold']);
    expect(loadQueuedGameCommands('account-2')).toEqual([]);
  });

  it('queues notification read state as a validated game intent', () => {
    vi.stubGlobal('localStorage', new MemoryStorage());
    const command: GameCommand = { name: 'update_notification_state', args: { action: 'read', notificationIds: ['salary-overdue'] } };
    expect(enqueueGameCommand('account-1', command, 'stable-command-key-0003')?.command).toEqual(command);
  });

  it('blocks a conflicting command until explicit recovery and acknowledges successful commands', () => {
    vi.stubGlobal('localStorage', new MemoryStorage());
    enqueueGameCommand('account-1', { name: 'advance_day', args: {} }, 'stable-command-key-0001');
    blockGameCommand('account-1', 'stable-command-key-0001', 'version_conflict');
    expect(loadQueuedGameCommands('account-1')[0]).toMatchObject({ status: 'blocked', blockedReason: 'version_conflict' });

    acknowledgeGameCommand('account-1', 'stable-command-key-0001');
    expect(loadQueuedGameCommands('account-1')).toEqual([]);
  });
});
