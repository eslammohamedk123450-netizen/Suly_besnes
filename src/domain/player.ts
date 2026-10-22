import type { CountryDefinition, CountryId, IndustryId } from './countries';

export interface PlayerAsset {
  id: string;
  label: string;
  value: number;
  acquiredAt: string;
}

export interface PlayerLand {
  id: string;
  label: string;
  areaSquareMeters: number;
  purchasePrice: number;
  acquiredAt: string;
}

export interface PlayerCompany {
  id: string;
  name: string;
  industryId: IndustryId;
  countryId: CountryId;
  foundedAt: string;
}

export interface PlayerProfile {
  id: string;
  name: string;
  level: number;
  countryId: CountryId;
  createdAt: string;
  bankBalance: number;
  goldGrams: number;
  assets: PlayerAsset[];
  lands: PlayerLand[];
  companies: PlayerCompany[];
  finances: {
    netProfit: number;
  };
}

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `player-${Date.now()}`;
}

export function createNewPlayer(
  country: CountryDefinition,
  playerName: string,
  now: Date = new Date(),
): PlayerProfile {
  const createdAt = now.toISOString();
  return {
    id: createId(),
    name: playerName.trim() || 'المستثمر الجديد',
    level: 1,
    countryId: country.id,
    createdAt,
    bankBalance: country.startingBalance,
    goldGrams: 0,
    assets: [],
    lands: [],
    companies: [],
    finances: { netProfit: 0 },
  };
}

export function calculateTotalAssets(profile: PlayerProfile): number {
  const movableAssets = profile.assets.reduce((sum, asset) => sum + asset.value, 0);
  const landAssets = profile.lands.reduce((sum, land) => sum + land.purchasePrice, 0);
  return profile.bankBalance + movableAssets + landAssets;
}
