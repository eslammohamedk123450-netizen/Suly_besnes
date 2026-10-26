import type { PlayerProfile } from '../domain/player';
import type {
  MegaExpansionState,
  PlayerCartelState,
  MaritimeFleetState,
  PoliticalLobbyState,
  PlayerVCState,
} from '../domain/expansionSystems';
import {
  CARTEL_CATALOG,
  TRADE_VESSELS_CATALOG,
  TRADE_ROUTES_CATALOG,
  MEGAPROJECTS_CATALOG,
  STARTUP_DEALS_CATALOG,
} from './expansionCatalog';
import { saveGame } from '../storage/saveRepository';

const MEGA_EXPANSION_STORAGE_KEY = 'suly_besnes_mega_expansion_v2_';

export const INITIAL_MEGA_EXPANSION: MegaExpansionState = {
  cartel: {
    joinedCartelId: null,
    userRank: 'none',
    contributedFunds: 0,
    activeAgreement: null,
    warVictoryCount: 0,
  },
  maritime: {
    ownedVesselIds: ['vessel_cargo_m'],
    activeVoyages: [],
    securityLevel: 1,
    portConcessions: 1,
  },
  political: {
    influenceLevel: 1,
    influencePoints: 10,
    taxExemptionActive: false,
    activeTenderIds: [],
    totalGovernmentPayouts: 0,
  },
  vc: {
    incubatorLevel: 1,
    investedStartupIds: [],
    startupValuations: {},
    totalExitsProfit: 0,
  },
};

export function loadMegaExpansionState(profile: PlayerProfile): MegaExpansionState {
  try {
    const raw = localStorage.getItem(MEGA_EXPANSION_STORAGE_KEY + profile.id);
    if (raw) {
      const parsed = JSON.parse(raw) as MegaExpansionState;
      return {
        cartel: { ...INITIAL_MEGA_EXPANSION.cartel, ...parsed.cartel },
        maritime: { ...INITIAL_MEGA_EXPANSION.maritime, ...parsed.maritime },
        political: { ...INITIAL_MEGA_EXPANSION.political, ...parsed.political },
        vc: { ...INITIAL_MEGA_EXPANSION.vc, ...parsed.vc },
      };
    }
  } catch (e) {
    console.error('Failed to load mega expansion v2 state:', e);
  }
  return INITIAL_MEGA_EXPANSION;
}

export function saveMegaExpansionState(profile: PlayerProfile, state: MegaExpansionState): void {
  try {
    localStorage.setItem(MEGA_EXPANSION_STORAGE_KEY + profile.id, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save mega expansion v2 state:', e);
  }
}

// -------------------------------------------------------------
// Cartel Actions
// -------------------------------------------------------------
export function joinCartel(
  profile: PlayerProfile,
  expansion: MegaExpansionState,
  cartelId: string
): { profile: PlayerProfile; expansion: MegaExpansionState; message: string } | null {
  const cartel = CARTEL_CATALOG.find((c) => c.id === cartelId);
  if (!cartel) return null;

  if (profile.bankBalance < cartel.joinCost) return null;

  const updatedProf: PlayerProfile = {
    ...profile,
    bankBalance: profile.bankBalance - cartel.joinCost,
  };

  const updatedExp: MegaExpansionState = {
    ...expansion,
    cartel: {
      joinedCartelId: cartel.id,
      userRank: 'member',
      contributedFunds: cartel.joinCost,
      activeAgreement: 'اتفاقية تثبيت الأسعار والتنظيم',
      warVictoryCount: expansion.cartel.warVictoryCount,
    },
  };

  saveMegaExpansionState(updatedProf, updatedExp);
  saveGame(updatedProf, profile.id);

  return {
    profile: updatedProf,
    expansion: updatedExp,
    message: `تهانينا! انضممت بنجاح إلى "${cartel.name}" وتفعيل ميزة ${cartel.perkTitle}`,
  };
}

export function contributeToCartel(
  profile: PlayerProfile,
  expansion: MegaExpansionState,
  amount: number
): { profile: PlayerProfile; expansion: MegaExpansionState; message: string } | null {
  if (profile.bankBalance < amount || amount <= 0) return null;
  if (!expansion.cartel.joinedCartelId) return null;

  const newContributed = expansion.cartel.contributedFunds + amount;
  const newRank = newContributed >= 5000000 ? 'leader' : newContributed >= 1500000 ? 'senior' : 'member';

  const updatedProf: PlayerProfile = {
    ...profile,
    bankBalance: profile.bankBalance - amount,
  };

  const updatedExp: MegaExpansionState = {
    ...expansion,
    cartel: {
      ...expansion.cartel,
      contributedFunds: newContributed,
      userRank: newRank,
    },
  };

  saveMegaExpansionState(updatedProf, updatedExp);
  saveGame(updatedProf, profile.id);

  return {
    profile: updatedProf,
    expansion: updatedExp,
    message: `تم التبرع بـ ${amount.toLocaleString('ar-EG')} ج.م لصندوق التكتل وترقية رتبتك إلى (${newRank === 'leader' ? 'رئيس التحالف' : newRank === 'senior' ? 'عضو قيادي' : 'عضو'})`,
  };
}

// -------------------------------------------------------------
// Maritime Actions
// -------------------------------------------------------------
export function buyVessel(
  profile: PlayerProfile,
  expansion: MegaExpansionState,
  vesselId: string
): { profile: PlayerProfile; expansion: MegaExpansionState; message: string } | null {
  const vessel = TRADE_VESSELS_CATALOG.find((v) => v.id === vesselId);
  if (!vessel) return null;

  if (profile.bankBalance < vessel.price) return null;

  const updatedProf: PlayerProfile = {
    ...profile,
    bankBalance: profile.bankBalance - vessel.price,
  };

  const updatedExp: MegaExpansionState = {
    ...expansion,
    maritime: {
      ...expansion.maritime,
      ownedVesselIds: [...expansion.maritime.ownedVesselIds, vessel.id],
    },
  };

  saveMegaExpansionState(updatedProf, updatedExp);
  saveGame(updatedProf, profile.id);

  return {
    profile: updatedProf,
    expansion: updatedExp,
    message: `تم شراء ${vessel.name} بنجاح وإضافتها لأسطولك الملاحي!`,
  };
}

export function startVoyage(
  profile: PlayerProfile,
  expansion: MegaExpansionState,
  vesselId: string,
  routeId: string
): { profile: PlayerProfile; expansion: MegaExpansionState; message: string } | null {
  const vessel = TRADE_VESSELS_CATALOG.find((v) => v.id === vesselId);
  const route = TRADE_ROUTES_CATALOG.find((r) => r.id === routeId);
  if (!vessel || !route) return null;

  if (!expansion.maritime.ownedVesselIds.includes(vesselId)) return null;

  // Check if vessel is currently on voyage
  const isBusy = expansion.maritime.activeVoyages.some((av) => av.vesselId === vesselId && !av.claimed);
  if (isBusy) return null;

  const durationMs = vessel.speedVoyageHours * 60 * 1000; // Simulated speed (minutes scaled for gameplay)
  const expectedProfit = Math.round(vessel.baseProfitPerVoyage * route.profitMultiplier * (1 + expansion.maritime.portConcessions * 0.1));

  const newVoyage = {
    id: 'voyage_' + Date.now(),
    vesselId: vessel.id,
    vesselName: vessel.name,
    routeId: route.id,
    routeName: route.name,
    startTime: Date.now(),
    durationMs,
    expectedProfit,
    claimed: false,
  };

  const updatedExp: MegaExpansionState = {
    ...expansion,
    maritime: {
      ...expansion.maritime,
      activeVoyages: [...expansion.maritime.activeVoyages, newVoyage],
    },
  };

  saveMegaExpansionState(profile, updatedExp);

  return {
    profile,
    expansion: updatedExp,
    message: `أبحرت ${vessel.name} متجهة نحو "${route.name}"! الأرباح المتوقعة: ${expectedProfit.toLocaleString('ar-EG')} ج.م`,
  };
}

export function claimVoyageProfit(
  profile: PlayerProfile,
  expansion: MegaExpansionState,
  voyageId: string
): { profile: PlayerProfile; expansion: MegaExpansionState; message: string } | null {
  const voyage = expansion.maritime.activeVoyages.find((v) => v.id === voyageId);
  if (!voyage || voyage.claimed) return null;

  const updatedProf: PlayerProfile = {
    ...profile,
    bankBalance: profile.bankBalance + voyage.expectedProfit,
  };

  const updatedVoyages = expansion.maritime.activeVoyages.map((v) =>
    v.id === voyageId ? { ...v, claimed: true } : v
  );

  const updatedExp: MegaExpansionState = {
    ...expansion,
    maritime: {
      ...expansion.maritime,
      activeVoyages: updatedVoyages,
    },
  };

  saveMegaExpansionState(updatedProf, updatedExp);
  saveGame(updatedProf, profile.id);

  return {
    profile: updatedProf,
    expansion: updatedExp,
    message: `تم استلام أرباح رحلة ${voyage.vesselName} بقيمة +${voyage.expectedProfit.toLocaleString('ar-EG')} ج.م!`,
  };
}

// -------------------------------------------------------------
// Political Megaproject Actions
// -------------------------------------------------------------
export function upgradePoliticalLobby(
  profile: PlayerProfile,
  expansion: MegaExpansionState
): { profile: PlayerProfile; expansion: MegaExpansionState; message: string } | null {
  const currentLvl = expansion.political.influenceLevel;
  if (currentLvl >= 10) return null;

  const cost = currentLvl * 500000;
  if (profile.bankBalance < cost) return null;

  const updatedProf: PlayerProfile = {
    ...profile,
    bankBalance: profile.bankBalance - cost,
  };

  const updatedExp: MegaExpansionState = {
    ...expansion,
    political: {
      ...expansion.political,
      influenceLevel: currentLvl + 1,
      influencePoints: expansion.political.influencePoints + 25,
      taxExemptionActive: currentLvl + 1 >= 5 ? true : expansion.political.taxExemptionActive,
    },
  };

  saveMegaExpansionState(updatedProf, updatedExp);
  saveGame(updatedProf, profile.id);

  return {
    profile: updatedProf,
    expansion: updatedExp,
    message: `تم رفع نفوذك السياسي والتنفيذي إلى المستوى ${currentLvl + 1}!`,
  };
}

export function bidOnMegaproject(
  profile: PlayerProfile,
  expansion: MegaExpansionState,
  tenderId: string
): { profile: PlayerProfile; expansion: MegaExpansionState; message: string } | null {
  const tender = MEGAPROJECTS_CATALOG.find((t) => t.id === tenderId);
  if (!tender) return null;

  if (expansion.political.influenceLevel < tender.requiredInfluenceLevel) return null;
  if (expansion.political.activeTenderIds.includes(tenderId)) return null;

  const initialBidCost = Math.round(tender.totalBudget * 0.05); // 5% bid deposit
  if (profile.bankBalance < initialBidCost) return null;

  const updatedProf: PlayerProfile = {
    ...profile,
    bankBalance: profile.bankBalance - initialBidCost,
  };

  const updatedExp: MegaExpansionState = {
    ...expansion,
    political: {
      ...expansion.political,
      activeTenderIds: [...expansion.political.activeTenderIds, tenderId],
    },
  };

  saveMegaExpansionState(updatedProf, updatedExp);
  saveGame(updatedProf, profile.id);

  return {
    profile: updatedProf,
    expansion: updatedExp,
    message: `فزت بترسية مناقصة "${tender.title}"! تم دفع عربون التأمين وضمان الدفع المستقبلي.`,
  };
}

export function deliverProjectMilestone(
  profile: PlayerProfile,
  expansion: MegaExpansionState,
  tenderId: string
): { profile: PlayerProfile; expansion: MegaExpansionState; message: string } | null {
  const tender = MEGAPROJECTS_CATALOG.find((t) => t.id === tenderId);
  if (!tender) return null;

  if (!expansion.political.activeTenderIds.includes(tenderId)) return null;

  const payout = tender.payoutPerMilestone;

  const updatedProf: PlayerProfile = {
    ...profile,
    bankBalance: profile.bankBalance + payout,
  };

  const updatedExp: MegaExpansionState = {
    ...expansion,
    political: {
      ...expansion.political,
      totalGovernmentPayouts: expansion.political.totalGovernmentPayouts + payout,
    },
  };

  saveMegaExpansionState(updatedProf, updatedExp);
  saveGame(updatedProf, profile.id);

  return {
    profile: updatedProf,
    expansion: updatedExp,
    message: `تم تسليم المرحلة بنجاح! تحصيل المستخلص الحكومي بقيمة +${payout.toLocaleString('ar-EG')} ج.م`,
  };
}

// -------------------------------------------------------------
// Venture Capital & Incubator Actions
// -------------------------------------------------------------
export function investInStartup(
  profile: PlayerProfile,
  expansion: MegaExpansionState,
  startupId: string
): { profile: PlayerProfile; expansion: MegaExpansionState; message: string } | null {
  const startup = STARTUP_DEALS_CATALOG.find((s) => s.id === startupId);
  if (!startup) return null;

  if (expansion.vc.investedStartupIds.includes(startupId)) return null;
  if (profile.bankBalance < startup.investmentCost) return null;

  const updatedProf: PlayerProfile = {
    ...profile,
    bankBalance: profile.bankBalance - startup.investmentCost,
  };

  const updatedExp: MegaExpansionState = {
    ...expansion,
    vc: {
      ...expansion.vc,
      investedStartupIds: [...expansion.vc.investedStartupIds, startupId],
      startupValuations: {
        ...expansion.vc.startupValuations,
        [startupId]: startup.currentValuation,
      },
    },
  };

  saveMegaExpansionState(updatedProf, updatedExp);
  saveGame(updatedProf, profile.id);

  return {
    profile: updatedProf,
    expansion: updatedExp,
    message: `استثمرت بنجاح في "${startup.name}" واستهلكت ${startup.equityPercent}% من الملكية!`,
  };
}

export function exitStartupBuyout(
  profile: PlayerProfile,
  expansion: MegaExpansionState,
  startupId: string
): { profile: PlayerProfile; expansion: MegaExpansionState; message: string } | null {
  const startup = STARTUP_DEALS_CATALOG.find((s) => s.id === startupId);
  if (!startup) return null;

  if (!expansion.vc.investedStartupIds.includes(startupId)) return null;

  const exitPayout = Math.round(startup.investmentCost * startup.exitMultiple);

  const updatedProf: PlayerProfile = {
    ...profile,
    bankBalance: profile.bankBalance + exitPayout,
  };

  const updatedExp: MegaExpansionState = {
    ...expansion,
    vc: {
      ...expansion.vc,
      investedStartupIds: expansion.vc.investedStartupIds.filter((id) => id !== startupId),
      totalExitsProfit: expansion.vc.totalExitsProfit + (exitPayout - startup.investmentCost),
    },
  };

  saveMegaExpansionState(updatedProf, updatedExp);
  saveGame(updatedProf, profile.id);

  return {
    profile: updatedProf,
    expansion: updatedExp,
    message: `استحواذ خرافي! تمت التصفية وبيع أسهمك في "${startup.name}" بقيمة +${exitPayout.toLocaleString('ar-EG')} ج.م (${startup.exitMultiple}x)!`,
  };
}
