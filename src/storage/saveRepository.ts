import { findCountry } from '../domain/countries';
import type { IndustryId } from '../domain/countries';
import type { PlayerAsset, PlayerCompany, PlayerLand, PlayerProfile } from '../domain/player';

const SAVE_KEY = 'business-empire.save.v1';
const SAVE_VERSION = 1;
const INDUSTRY_IDS = new Set<string>([
  'petroleum',
  'electricity',
  'gas',
  'water',
  'detergents',
  'food',
  'construction',
  'electronics',
  'transport',
]);

interface SaveEnvelope {
  version: number;
  savedAt: string;
  profile: PlayerProfile;
}

export type StorageResult = { ok: true } | { ok: false; reason: 'unavailable' | 'invalid' };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isFiniteNonNegative(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isAsset(value: unknown): value is PlayerAsset {
  if (!value || typeof value !== 'object') return false;
  const asset = value as Partial<PlayerAsset>;
  return (
    isNonEmptyString(asset.id) &&
    isNonEmptyString(asset.label) &&
    isFiniteNonNegative(asset.value) &&
    isNonEmptyString(asset.acquiredAt) &&
    Number.isFinite(Date.parse(asset.acquiredAt))
  );
}

function isLand(value: unknown): value is PlayerLand {
  if (!value || typeof value !== 'object') return false;
  const land = value as Partial<PlayerLand>;
  return (
    isNonEmptyString(land.id) &&
    isNonEmptyString(land.label) &&
    isFiniteNonNegative(land.areaSquareMeters) &&
    isFiniteNonNegative(land.purchasePrice) &&
    isNonEmptyString(land.acquiredAt) &&
    Number.isFinite(Date.parse(land.acquiredAt))
  );
}

function isCompany(value: unknown): value is PlayerCompany {
  if (!value || typeof value !== 'object') return false;
  const company = value as Partial<PlayerCompany>;
  return (
    isNonEmptyString(company.id) &&
    isNonEmptyString(company.name) &&
    typeof company.industryId === 'string' &&
    INDUSTRY_IDS.has(company.industryId) &&
    typeof company.countryId === 'string' &&
    findCountry(company.countryId) !== undefined &&
    isNonEmptyString(company.foundedAt) &&
    Number.isFinite(Date.parse(company.foundedAt))
  );
}

function isProfile(value: unknown): value is PlayerProfile {
  if (!value || typeof value !== 'object') return false;
  const profile = value as Partial<PlayerProfile>;
  const finances = profile.finances;
  return (
    isNonEmptyString(profile.id) &&
    isNonEmptyString(profile.name) &&
    typeof profile.level === 'number' &&
    Number.isInteger(profile.level) &&
    Number.isFinite(profile.level) &&
    profile.level >= 1 &&
    typeof profile.countryId === 'string' &&
    findCountry(profile.countryId) !== undefined &&
    isNonEmptyString(profile.createdAt) &&
    Number.isFinite(Date.parse(profile.createdAt)) &&
    isFiniteNonNegative(profile.bankBalance) &&
    isFiniteNonNegative(profile.goldGrams) &&
    Array.isArray(profile.assets) &&
    profile.assets.every(isAsset) &&
    Array.isArray(profile.lands) &&
    profile.lands.every(isLand) &&
    Array.isArray(profile.companies) &&
    profile.companies.every(isCompany) &&
    typeof finances === 'object' &&
    finances !== null &&
    Number.isFinite(finances.netProfit)
  );
}

export function loadSavedGame(): PlayerProfile | null {
  try {
    const raw = globalThis.localStorage?.getItem(SAVE_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') return null;
    const envelope = value as Partial<SaveEnvelope>;
    if (
      envelope.version !== SAVE_VERSION ||
      !isNonEmptyString(envelope.savedAt) ||
      !Number.isFinite(Date.parse(envelope.savedAt)) ||
      !isProfile(envelope.profile)
    ) {
      return null;
    }
    return envelope.profile;
  } catch {
    return null;
  }
}

export function saveGame(profile: PlayerProfile): StorageResult {
  if (!isProfile(profile)) return { ok: false, reason: 'invalid' };
  try {
    const envelope: SaveEnvelope = {
      version: SAVE_VERSION,
      savedAt: new Date().toISOString(),
      profile,
    };
    globalThis.localStorage.setItem(SAVE_KEY, JSON.stringify(envelope));
    return { ok: true };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}

export function clearSavedGame(): StorageResult {
  try {
    globalThis.localStorage.removeItem(SAVE_KEY);
    return { ok: true };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}
