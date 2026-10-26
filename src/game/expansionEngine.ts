import type { PlayerProfile } from '../domain/player';
import {
  INITIAL_TERRITORIES,
  TECH_TREE_NODES,
  LUXURY_ASSETS_CATALOG,
  INITIAL_RIVAL_COMPANIES,
  DYNAMIC_ECONOMIC_EVENTS,
} from './expansionCatalog';
import type {
  TerritoryRegion,
  TechNode,
  LuxuryAsset,
  RivalStockCompany,
  PlayerIPOState,
  EconomicDilemmaEvent,
  EconomicDilemmaOption,
} from '../domain/expansionSystems';

const EXPANSION_STORAGE_KEY = 'suly_besnes_expansion_v1';

export interface ExpansionState {
  territories: TerritoryRegion[];
  researchedTechIds: string[];
  ownedLuxuryAssetIds: string[];
  ipoState: PlayerIPOState;
  rivalCompanies: RivalStockCompany[];
  activeDilemma: EconomicDilemmaEvent | null;
  dilemmaHistoryCount: number;
}

export function getDefaultExpansionState(profileName: string): ExpansionState {
  const ticker = profileName.slice(0, 3).toUpperCase() || 'EMP';
  return {
    territories: INITIAL_TERRITORIES,
    researchedTechIds: [],
    ownedLuxuryAssetIds: [],
    ipoState: {
      isPublic: false,
      ticker: `${ticker}INC`,
      sharesTotal: 1000000,
      playerShares: 1000000,
      publicShares: 0,
      sharePrice: 50.0,
      dividendRatePercent: 5.0,
      totalDividendsPaid: 0,
      marketCap: 50000000,
      shareholdersCount: 0,
      companyRating: 'AA',
    },
    rivalCompanies: INITIAL_RIVAL_COMPANIES,
    activeDilemma: null,
    dilemmaHistoryCount: 0,
  };
}

export function loadExpansionState(profile: PlayerProfile): ExpansionState {
  try {
    const raw = globalThis.localStorage?.getItem(`${EXPANSION_STORAGE_KEY}_${profile.id}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...getDefaultExpansionState(profile.name),
        ...parsed,
      };
    }
  } catch (e) {
    console.error('Failed to load expansion state:', e);
  }
  return getDefaultExpansionState(profile.name);
}

export function saveExpansionState(profileId: string, state: ExpansionState): void {
  try {
    globalThis.localStorage?.setItem(`${EXPANSION_STORAGE_KEY}_${profileId}`, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save expansion state:', e);
  }
}

// Territory Actions
export function claimTerritoryRegion(
  profile: PlayerProfile,
  expansion: ExpansionState,
  regionId: string
): { updatedProfile: PlayerProfile; updatedExpansion: ExpansionState; error?: string } {
  const region = expansion.territories.find((r) => r.id === regionId);
  if (!region) return { updatedProfile: profile, updatedExpansion: expansion, error: 'الإقليم غير موجود' };
  if (profile.bankBalance < region.conquestCost) {
    return { updatedProfile: profile, updatedExpansion: expansion, error: 'الرصيد غير كافٍ للسيطرة على هذا الإقليم' };
  }

  const updatedProfile: PlayerProfile = {
    ...profile,
    bankBalance: profile.bankBalance - region.conquestCost,
    reputation: Math.min(100, profile.reputation + 5),
  };

  const updatedTerritories = expansion.territories.map((r) => {
    if (r.id === regionId) {
      return {
        ...r,
        hubsCount: Math.max(1, r.hubsCount),
        playerMarketShare: Math.min(100, r.playerMarketShare + 25),
        unlocked: true,
      };
    }
    return r;
  });

  const updatedExpansion: ExpansionState = {
    ...expansion,
    territories: updatedTerritories,
  };

  saveExpansionState(profile.id, updatedExpansion);
  return { updatedProfile, updatedExpansion };
}

export function upgradeTerritoryHub(
  profile: PlayerProfile,
  expansion: ExpansionState,
  regionId: string
): { updatedProfile: PlayerProfile; updatedExpansion: ExpansionState; error?: string } {
  const region = expansion.territories.find((r) => r.id === regionId);
  if (!region) return { updatedProfile: profile, updatedExpansion: expansion, error: 'الإقليم غير موجود' };
  if (profile.bankBalance < region.hubUpgradeCost) {
    return { updatedProfile: profile, updatedExpansion: expansion, error: 'الرصيد غير كافٍ لترقية المركز اللوجستي' };
  }

  const updatedProfile: PlayerProfile = {
    ...profile,
    bankBalance: profile.bankBalance - region.hubUpgradeCost,
  };

  const updatedTerritories = expansion.territories.map((r) => {
    if (r.id === regionId) {
      return {
        ...r,
        hubsCount: r.hubsCount + 1,
        playerMarketShare: Math.min(100, r.playerMarketShare + 15),
        hourlyTaxYield: Math.round(r.hourlyTaxYield * 1.3),
        hubUpgradeCost: Math.round(r.hubUpgradeCost * 1.4),
      };
    }
    return r;
  });

  const updatedExpansion: ExpansionState = {
    ...expansion,
    territories: updatedTerritories,
  };

  saveExpansionState(profile.id, updatedExpansion);
  return { updatedProfile, updatedExpansion };
}

// Tech Tree Actions
export function unlockTechNode(
  profile: PlayerProfile,
  expansion: ExpansionState,
  techId: string
): { updatedProfile: PlayerProfile; updatedExpansion: ExpansionState; error?: string } {
  const node = TECH_TREE_NODES.find((t) => t.id === techId);
  if (!node) return { updatedProfile: profile, updatedExpansion: expansion, error: 'التقنية غير موجودة' };
  if (expansion.researchedTechIds.includes(techId)) {
    return { updatedProfile: profile, updatedExpansion: expansion, error: 'تم تمويل وأبحاث هذه التقنية بالفعل' };
  }

  // Check prerequisites
  for (const pre of node.prerequisites) {
    if (!expansion.researchedTechIds.includes(pre)) {
      return { updatedProfile: profile, updatedExpansion: expansion, error: 'يجب تطوير التقنية السابقة أولاً' };
    }
  }

  if (profile.bankBalance < node.costMoney) {
    return { updatedProfile: profile, updatedExpansion: expansion, error: 'الرصيد المالي غير كافٍ للأبحاث' };
  }
  if (profile.diamonds < node.costDiamonds) {
    return { updatedProfile: profile, updatedExpansion: expansion, error: 'عدد الماس غير كافٍ للتمويل' };
  }

  const updatedProfile: PlayerProfile = {
    ...profile,
    bankBalance: profile.bankBalance - node.costMoney,
    diamonds: profile.diamonds - node.costDiamonds,
  };

  const updatedExpansion: ExpansionState = {
    ...expansion,
    researchedTechIds: [...expansion.researchedTechIds, techId],
  };

  saveExpansionState(profile.id, updatedExpansion);
  return { updatedProfile, updatedExpansion };
}

// Luxury Asset Actions
export function buyLuxuryAsset(
  profile: PlayerProfile,
  expansion: ExpansionState,
  assetId: string
): { updatedProfile: PlayerProfile; updatedExpansion: ExpansionState; error?: string } {
  const asset = LUXURY_ASSETS_CATALOG.find((a) => a.id === assetId);
  if (!asset) return { updatedProfile: profile, updatedExpansion: expansion, error: 'الأصل غير موجود' };
  if (expansion.ownedLuxuryAssetIds.includes(assetId)) {
    return { updatedProfile: profile, updatedExpansion: expansion, error: 'تمتلك هذا الأصل بالفعل' };
  }
  if (profile.bankBalance < asset.price) {
    return { updatedProfile: profile, updatedExpansion: expansion, error: 'الرصيد غير كافٍ لشراء هذا الأصل الفاخر' };
  }

  const updatedProfile: PlayerProfile = {
    ...profile,
    bankBalance: profile.bankBalance - asset.price,
    reputation: Math.min(100, profile.reputation + 4),
    assets: [
      ...profile.assets,
      {
        id: `luxury-${Date.now()}`,
        label: asset.name,
        value: asset.price,
        acquiredAt: new Date().toISOString(),
      },
    ],
  };

  const updatedExpansion: ExpansionState = {
    ...expansion,
    ownedLuxuryAssetIds: [...expansion.ownedLuxuryAssetIds, assetId],
  };

  saveExpansionState(profile.id, updatedExpansion);
  return { updatedProfile, updatedExpansion };
}

// IPO & Stock Actions
export function launchPlayerIPO(
  profile: PlayerProfile,
  expansion: ExpansionState,
  sharesToOfferPercent: number // e.g. 30%
): { updatedProfile: PlayerProfile; updatedExpansion: ExpansionState; error?: string } {
  if (expansion.ipoState.isPublic) {
    return { updatedProfile: profile, updatedExpansion: expansion, error: 'الشركة مدرجة في البورصة بالفعل' };
  }
  if (profile.bankBalance < 500000) {
    return { updatedProfile: profile, updatedExpansion: expansion, error: 'يجب توفير 500,000 ج.م رسوم الطرح والاكتتاب' };
  }

  const publicSharesCount = Math.round((expansion.ipoState.sharesTotal * sharesToOfferPercent) / 100);
  const playerSharesRemaining = expansion.ipoState.sharesTotal - publicSharesCount;
  const ipoCapitalRaised = publicSharesCount * expansion.ipoState.sharePrice;

  const updatedProfile: PlayerProfile = {
    ...profile,
    bankBalance: profile.bankBalance - 500000 + ipoCapitalRaised,
    reputation: Math.min(100, profile.reputation + 15),
  };

  const updatedIPO: PlayerIPOState = {
    ...expansion.ipoState,
    isPublic: true,
    playerShares: playerSharesRemaining,
    publicShares: publicSharesCount,
    shareholdersCount: Math.round(publicSharesCount / 50),
    marketCap: expansion.ipoState.sharesTotal * expansion.ipoState.sharePrice,
  };

  const updatedExpansion: ExpansionState = {
    ...expansion,
    ipoState: updatedIPO,
  };

  saveExpansionState(profile.id, updatedExpansion);
  return { updatedProfile, updatedExpansion };
}

export function buyRivalCompanyShares(
  profile: PlayerProfile,
  expansion: ExpansionState,
  companyId: string,
  sharesCount: number
): { updatedProfile: PlayerProfile; updatedExpansion: ExpansionState; error?: string } {
  const company = expansion.rivalCompanies.find((c) => c.id === companyId);
  if (!company) return { updatedProfile: profile, updatedExpansion: expansion, error: 'الشركة غير موجودة' };

  const totalCost = company.sharePrice * sharesCount;
  if (profile.bankBalance < totalCost) {
    return { updatedProfile: profile, updatedExpansion: expansion, error: 'السيولة غير كافية لشراء الأسهم' };
  }

  const updatedProfile: PlayerProfile = {
    ...profile,
    bankBalance: profile.bankBalance - totalCost,
  };

  const updatedRivals = expansion.rivalCompanies.map((c) => {
    if (c.id === companyId) {
      return {
        ...c,
        playerSharesOwned: c.playerSharesOwned + sharesCount,
      };
    }
    return c;
  });

  const updatedExpansion: ExpansionState = {
    ...expansion,
    rivalCompanies: updatedRivals,
  };

  saveExpansionState(profile.id, updatedExpansion);
  return { updatedProfile, updatedExpansion };
}

export function sellRivalCompanyShares(
  profile: PlayerProfile,
  expansion: ExpansionState,
  companyId: string,
  sharesCount: number
): { updatedProfile: PlayerProfile; updatedExpansion: ExpansionState; error?: string } {
  const company = expansion.rivalCompanies.find((c) => c.id === companyId);
  if (!company) return { updatedProfile: profile, updatedExpansion: expansion, error: 'الشركة غير موجودة' };
  if (company.playerSharesOwned < sharesCount) {
    return { updatedProfile: profile, updatedExpansion: expansion, error: 'لا تملك هذا العدد من الأسهم' };
  }

  const totalRevenue = company.sharePrice * sharesCount;

  const updatedProfile: PlayerProfile = {
    ...profile,
    bankBalance: profile.bankBalance + totalRevenue,
  };

  const updatedRivals = expansion.rivalCompanies.map((c) => {
    if (c.id === companyId) {
      return {
        ...c,
        playerSharesOwned: c.playerSharesOwned - sharesCount,
      };
    }
    return c;
  });

  const updatedExpansion: ExpansionState = {
    ...expansion,
    rivalCompanies: updatedRivals,
  };

  saveExpansionState(profile.id, updatedExpansion);
  return { updatedProfile, updatedExpansion };
}

// Dilemma Decision Action
export function resolveDilemmaOption(
  profile: PlayerProfile,
  expansion: ExpansionState,
  option: EconomicDilemmaOption
): { updatedProfile: PlayerProfile; updatedExpansion: ExpansionState; resultMessage: string } {
  let netMoneyChange = option.moneyChange;
  let resultMsg = `تم اتخاذ القرار: ${option.label}. `;

  // Check risk
  if (option.riskPercent && Math.random() * 100 < option.riskPercent) {
    netMoneyChange = Math.round(netMoneyChange * 0.5);
    resultMsg += `حدث تعثر بسيط! النتيجة: ${option.riskOutcomeText || 'تم تكبد بعض الخسائر الجزئية.'}`;
  } else {
    resultMsg += `نجحت الاستراتيجية بنجاح تام!`;
  }

  const updatedProfile: PlayerProfile = {
    ...profile,
    bankBalance: Math.max(0, profile.bankBalance + netMoneyChange),
    reputation: Math.min(100, Math.max(0, profile.reputation + option.reputationChange)),
    diamonds: profile.diamonds + (option.diamondsReward || 0),
  };

  const updatedExpansion: ExpansionState = {
    ...expansion,
    activeDilemma: null,
    dilemmaHistoryCount: expansion.dilemmaHistoryCount + 1,
  };

  saveExpansionState(profile.id, updatedExpansion);
  return { updatedProfile, updatedExpansion, resultMessage: resultMsg };
}

export function triggerRandomDilemma(
  expansion: ExpansionState
): ExpansionState {
  if (expansion.activeDilemma) return expansion;
  const randomIndex = Math.floor(Math.random() * DYNAMIC_ECONOMIC_EVENTS.length);
  return {
    ...expansion,
    activeDilemma: DYNAMIC_ECONOMIC_EVENTS[randomIndex],
  };
}
