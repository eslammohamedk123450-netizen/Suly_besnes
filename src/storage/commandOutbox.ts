import type { GameCommand } from '../game/engine';

const STORAGE_PREFIX = 'business-empire:command-outbox:v1:';

type OutboxStatus = 'pending' | 'blocked';

export interface QueuedGameCommand {
  commandKey: string;
  command: GameCommand;
  createdAt: string;
  status: OutboxStatus;
  blockedReason?: string;
}

const supportedCommandNames = new Set<GameCommand['name']>([
  'place_bid', 'buy_direct_land', 'buy_direct_company', 'sell_land', 'upgrade_land', 'sell_company', 'sell_asset',
  'buy_material', 'buy_global_material', 'found_company', 'upgrade_company', 'run_production', 'service_company',
  'cancel_production', 'use_speed_card', 'use_day_speed_card', 'buy_speed_card', 'upgrade_warehouse', 'sell_product', 'buy_gold', 'buy_gold_with_diamonds', 'sell_gold', 'hire_staff',
  'pay_staff_salary', 'terminate_staff', 'create_deposit', 'merge_deposits', 'withdraw_deposit', 'take_loan', 'repay_loan',
  'create_investment', 'advance_day', 'accept_contract', 'deliver_contract', 'negotiate_contract', 'claim_task',
  'claim_season_challenge', 'claim_login_reward', 'choose_season_event', 'update_notification_state',
]);

function storageKey(accountId: string): string {
  return `${STORAGE_PREFIX}${encodeURIComponent(accountId)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isQueuedCommand(value: unknown): value is QueuedGameCommand {
  if (!isRecord(value) || typeof value.commandKey !== 'string' || value.commandKey.length < 16 || typeof value.createdAt !== 'string') return false;
  if (value.status !== 'pending' && value.status !== 'blocked') return false;
  if (!isRecord(value.command) || typeof value.command.name !== 'string' || !supportedCommandNames.has(value.command.name as GameCommand['name']) || !isRecord(value.command.args)) return false;
  return value.status !== 'blocked' || typeof value.blockedReason === 'string';
}

function writeQueue(accountId: string, entries: QueuedGameCommand[]): boolean {
  try {
    globalThis.localStorage?.setItem(storageKey(accountId), JSON.stringify({ version: 1, entries }));
    return Boolean(globalThis.localStorage);
  } catch {
    return false;
  }
}

export function createGameCommandKey(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

export function loadQueuedGameCommands(accountId: string): QueuedGameCommand[] {
  try {
    const raw = globalThis.localStorage?.getItem(storageKey(accountId));
    if (!raw) return [];
    const envelope: unknown = JSON.parse(raw);
    if (!isRecord(envelope) || envelope.version !== 1 || !Array.isArray(envelope.entries)) return [];
    const seenKeys = new Set<string>();
    return envelope.entries.filter(isQueuedCommand).filter((entry) => {
      if (seenKeys.has(entry.commandKey)) return false;
      seenKeys.add(entry.commandKey);
      return true;
    });
  } catch {
    return [];
  }
}

export function enqueueGameCommand(accountId: string, command: GameCommand, commandKey = createGameCommandKey()): QueuedGameCommand | null {
  const entries = loadQueuedGameCommands(accountId);
  const existing = entries.find((entry) => entry.commandKey === commandKey);
  if (existing) return existing;
  const queued: QueuedGameCommand = { commandKey, command, createdAt: new Date().toISOString(), status: 'pending' };
  return writeQueue(accountId, [...entries, queued]) ? queued : null;
}

export function acknowledgeGameCommand(accountId: string, commandKey: string): void {
  const entries = loadQueuedGameCommands(accountId).filter((entry) => entry.commandKey !== commandKey);
  writeQueue(accountId, entries);
}

export function blockGameCommand(accountId: string, commandKey: string, reason: string): void {
  const entries = loadQueuedGameCommands(accountId).map((entry) => entry.commandKey === commandKey
    ? { ...entry, status: 'blocked' as const, blockedReason: reason.slice(0, 240) }
    : entry);
  writeQueue(accountId, entries);
}

/** Reopens only optimistic-concurrency conflicts; invalid gameplay commands stay blocked. */
export function retryTransientBlockedCommands(accountId: string): number {
  const entries = loadQueuedGameCommands(accountId);
  let retried = 0;
  const reopened = entries.map((entry) => {
    if (entry.status !== 'blocked' || entry.blockedReason !== 'http_409') return entry;
    retried += 1;
    return { commandKey: entry.commandKey, command: entry.command, createdAt: entry.createdAt, status: 'pending' as const };
  });
  if (retried > 0) writeQueue(accountId, reopened);
  return retried;
}
