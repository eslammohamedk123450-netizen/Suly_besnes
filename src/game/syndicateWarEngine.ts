import type { PlayerProfile } from '../domain/player';
import { triggerHaptic } from '../services/nativeMobileService';
import { playSound } from './soundEffects';

export interface RegionalSyndicateRival {
  id: string;
  name: string;
  avatar: string;
  title: string;
  aggression: 'high' | 'medium' | 'defensive';
  quote: string;
  marketShare: number; // percentage
}

export interface SyndicateTerritory {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  description: string;
  requiredLevel: number;
  unlocked: boolean;
  playerShare: number; // 0 - 100%
  rival: RegionalSyndicateRival;
  dailyTariffYield: number; // Daily bonus cash when monopolized (>= 60%)
  monopolyPerkTitle: string;
  monopolyPerkDescription: string;
  materialDiscountPercent: number;
  logisticsHubsCount: number;
}

export interface SyndicateWarState {
  territories: SyndicateTerritory[];
  totalVictories: number;
  lastWarDay: number;
}

const SYNDICATE_STORAGE_PREFIX = 'suly_syndicate_wars_v1_';

export const INITIAL_SYNDICATE_TERRITORIES: SyndicateTerritory[] = [
  {
    id: 'cairo_capital',
    name: 'إقليم القاهرة والمركز المالي',
    nameEn: 'Greater Cairo Financial District',
    icon: '🏛️',
    description: 'قلب المعاملات البنكية ومقرات البورصة الكبرى. المنافسة هنا على أشدها ضد كارتيل المال.',
    requiredLevel: 1,
    unlocked: true,
    playerShare: 25,
    rival: {
      id: 'rival_hossam',
      name: 'مجموعة الحسام للاستثمار',
      avatar: '👔',
      title: 'حوت البورصة والعقارات',
      aggression: 'high',
      quote: 'القاهرة ملعبنا منذ عقود، ولن نسمح لأي وافد جديد بالاستحواذ على سوق العاصمة!',
      marketShare: 60,
    },
    dailyTariffYield: 35000,
    monopolyPerkTitle: 'سيادة العاصمة المالية',
    monopolyPerkDescription: '+15% عائد سنوي على الودائع وضريبة جمركية يومية 35,000 ج.م',
    materialDiscountPercent: 10,
    logisticsHubsCount: 1,
  },
  {
    id: 'alex_ports',
    name: 'إقليم الإسكندرية والموانئ البحرية',
    nameEn: 'Alexandria & Mediterranean Ports',
    icon: '⚓',
    description: 'بوابة الاستيراد والتصدير والشحن البحري. السيطرة هنا تعني التحكم في تدفق البضائع المستوردة.',
    requiredLevel: 2,
    unlocked: true,
    playerShare: 10,
    rival: {
      id: 'rival_ports_consortium',
      name: 'تحالف موانئ المتوسط',
      avatar: '🚢',
      title: 'أباطرة الشحن اللوجستي',
      aggression: 'medium',
      quote: 'كل حاوية تدخل الميناء تدفع لنا رسوماً.. إذا أردت حصة فادفع ثمنها نقداً!',
      marketShare: 70,
    },
    dailyTariffYield: 48000,
    monopolyPerkTitle: 'احتكار الملاحة والشحن',
    monopolyPerkDescription: '-25% تكاليف الشحن الدولي وتدفق بضائع مباشر إلى مخازنك',
    materialDiscountPercent: 15,
    logisticsHubsCount: 0,
  },
  {
    id: 'delta_agri',
    name: 'إقليم الدلتا والوفرة الغذائية',
    nameEn: 'Nile Delta Agro-Industrial Belt',
    icon: '🌾',
    description: 'أراضي الخصوبة والمصانع الغذائية ومزارع الدواجن والتعبئة. مورد الخام الأول لجميع المدن.',
    requiredLevel: 3,
    unlocked: false,
    playerShare: 0,
    rival: {
      id: 'rival_delta_combine',
      name: 'كارتيل المحاصيل والدلتا',
      avatar: '🚜',
      title: 'تكتل كبار الموردين',
      aggression: 'defensive',
      quote: 'المحاصيل ومخازن الحبوب تحت سيطرتنا.. مصانع الأغذية لن تعمل بدون مباركتنا.',
      marketShare: 80,
    },
    dailyTariffYield: 30000,
    monopolyPerkTitle: 'احتكار سلاسل الغذاء',
    monopolyPerkDescription: '-30% خصم على شراء المواد الخام الغذائية وزيادة سعة المخازن',
    materialDiscountPercent: 20,
    logisticsHubsCount: 0,
  },
  {
    id: 'suez_logistics',
    name: 'إقليم قناة السويس والترانزيت العالمي',
    nameEn: 'Suez Canal Global Transit Zone',
    icon: '🧭',
    description: 'شريان التجارة العالمية. رسوم عبور الحاويات والمستودعات الجمركية الحرة.',
    requiredLevel: 5,
    unlocked: false,
    playerShare: 0,
    rival: {
      id: 'rival_global_transit',
      name: 'صندوق الأفق للوجستيات العابرة',
      avatar: '🌐',
      title: 'تكتل الخدمات الملاحية',
      aggression: 'high',
      quote: 'القناة لا تنام، والمليارات تتحرك في ثوانٍ.. هل تمتلك السيولة لمجاراتنا؟',
      marketShare: 85,
    },
    dailyTariffYield: 85000,
    monopolyPerkTitle: 'رسوم المرور الدولية',
    monopolyPerkDescription: 'تحصيل 85,000 ج.م رسوم ترانزيت يومياً + مضاعفة أرباح عقود التصدير',
    materialDiscountPercent: 25,
    logisticsHubsCount: 0,
  },
  {
    id: 'upper_egypt_mining',
    name: 'إقليم الصعيد والتعدين والطاقة',
    nameEn: 'Upper Egypt Mining & Energy Basin',
    icon: '⛏️',
    description: 'مناجم الذهب والفوسفات، ومحطات الطاقة الشمسية والصناعات الثقيلة ومصانع الأسمنت.',
    requiredLevel: 7,
    unlocked: false,
    playerShare: 0,
    rival: {
      id: 'rival_sheikh_fahad',
      name: 'مجموعة فهد الناصر للتعدين',
      avatar: '⛰️',
      title: 'عملاق الثروات المعدنية',
      aggression: 'high',
      quote: 'الصعيد أرض الرجال والمناجم الثقيلة.. لا مكان للهواة بين كسارات الجبال!',
      marketShare: 90,
    },
    dailyTariffYield: 120000,
    monopolyPerkTitle: 'احتكار الذهب والمعادن',
    monopolyPerkDescription: '+20% إنتاجية الذهب وخصم 30% على حديد التسليح ومواد البناء',
    materialDiscountPercent: 30,
    logisticsHubsCount: 0,
  },
];

export function loadSyndicateWarState(profileId: string): SyndicateWarState {
  try {
    const raw = localStorage.getItem(`${SYNDICATE_STORAGE_PREFIX}${profileId}`);
    if (raw) {
      const parsed = JSON.parse(raw) as SyndicateWarState;
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load syndicate war state', e);
  }
  return {
    territories: INITIAL_SYNDICATE_TERRITORIES,
    totalVictories: 0,
    lastWarDay: 1,
  };
}

export function saveSyndicateWarState(profileId: string, state: SyndicateWarState): void {
  try {
    localStorage.setItem(`${SYNDICATE_STORAGE_PREFIX}${profileId}`, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save syndicate war state', e);
  }
}

export type SyndicateTactic = 'price_war' | 'ad_campaign' | 'exclusive_supply' | 'build_hub';

export interface TacticDefinition {
  id: SyndicateTactic;
  name: string;
  cost: number;
  gainShare: number; // percentage gained
  rivalLossShare: number; // percentage rival loses
  icon: string;
  description: string;
}

export const SYNDICATE_TACTICS: Record<SyndicateTactic, TacticDefinition> = {
  price_war: {
    id: 'price_war',
    name: 'حرب الأسعار والتخفيض الجائر',
    cost: 150000,
    gainShare: 8,
    rivalLossShare: 10,
    icon: '⚔️',
    description: 'تخفيض أسعار سلعك محلياً لانتزاع حصة فورية من المستهلكين وإجبار المنافس على التراجع.',
  },
  ad_campaign: {
    id: 'ad_campaign',
    name: 'حملة إعلانات ونفوذ تسويقي',
    cost: 85000,
    gainShare: 5,
    rivalLossShare: 5,
    icon: '📢',
    description: 'لوحات إعلانية وحملات ترويجية مكثفة تعزز ولائك التجاري في الإقليم.',
  },
  exclusive_supply: {
    id: 'exclusive_supply',
    name: 'تأمين عقود توريد حصرية',
    cost: 280000,
    gainShare: 12,
    rivalLossShare: 14,
    icon: '🤝',
    description: 'توقيع اتفاقيات حصرية مع كبار تجار الجملة لمنع المنافس من تصريف بضائعه.',
  },
  build_hub: {
    id: 'build_hub',
    name: 'بناء مركز توزيع لوجستي',
    cost: 450000,
    gainShare: 15,
    rivalLossShare: 12,
    icon: '🏬',
    description: 'إنشاء مركز تخزين وتوزيع إقليمي حديث يرسخ سيادتك ويرفع عوائدك بشكل دائم.',
  },
};

/**
 * Execute tactical operation against rival syndicate in a territory.
 */
export function executeSyndicateTactic(
  profile: PlayerProfile,
  state: SyndicateWarState,
  territoryId: string,
  tacticId: SyndicateTactic
): { updatedProfile: PlayerProfile; updatedState: SyndicateWarState; message: string; isMonopolyNow: boolean } | { error: string } {
  const territory = state.territories.find((t) => t.id === territoryId);
  if (!territory) return { error: 'الإقليم غير موجود' };
  if (!territory.unlocked) return { error: 'هذا الإقليم لم يتم فتحه بعد' };

  const tactic = SYNDICATE_TACTICS[tacticId];
  if (profile.bankBalance < tactic.cost) {
    return { error: 'الرصيد البنكي غير كافٍ لشن هذه العملية التكتيكية' };
  }

  // Calculate new shares
  const oldPlayerShare = territory.playerShare;
  const newPlayerShare = Math.min(100, territory.playerShare + tactic.gainShare);
  const newRivalShare = Math.max(0, territory.rival.marketShare - tactic.rivalLossShare);

  const becameMonopoly = oldPlayerShare < 60 && newPlayerShare >= 60;

  const updatedTerritory: SyndicateTerritory = {
    ...territory,
    playerShare: newPlayerShare,
    rival: {
      ...territory.rival,
      marketShare: newRivalShare,
    },
    logisticsHubsCount: tacticId === 'build_hub' ? territory.logisticsHubsCount + 1 : territory.logisticsHubsCount,
  };

  const updatedTerritories = state.territories.map((t) => (t.id === territoryId ? updatedTerritory : t));

  const updatedProfile: PlayerProfile = {
    ...profile,
    bankBalance: profile.bankBalance - tactic.cost,
    reputation: Math.min(100, profile.reputation + (becameMonopoly ? 8 : 2)),
  };

  const updatedState: SyndicateWarState = {
    ...state,
    territories: updatedTerritories,
    totalVictories: becameMonopoly ? state.totalVictories + 1 : state.totalVictories,
  };

  saveSyndicateWarState(profile.id, updatedState);

  return {
    updatedProfile,
    updatedState,
    message: becameMonopoly
      ? `🎉 مبروك! بلغت حصتك ${newPlayerShare}% وفرضت احتكاراً كاملاً على ${territory.name}! تم تفعيل امتيازات الجمارك الحصرية.`
      : `نجحت العملية! ارتفعت حصتك في ${territory.name} إلى ${newPlayerShare}% وتراجعت حصة ${territory.rival.name}.`,
    isMonopolyNow: becameMonopoly,
  };
}

/**
 * Unlock a new regional territory when player reaches the required level.
 */
export function unlockTerritory(
  profile: PlayerProfile,
  state: SyndicateWarState,
  territoryId: string
): { updatedState: SyndicateWarState; message: string } | { error: string } {
  const territory = state.territories.find((t) => t.id === territoryId);
  if (!territory) return { error: 'الإقليم غير موجود' };
  if (profile.level < territory.requiredLevel) {
    return { error: `يتطلب فتح هذا الإقليم بلوغ المستوى ${territory.requiredLevel}` };
  }

  const updatedTerritories = state.territories.map((t) =>
    t.id === territoryId ? { ...t, unlocked: true } : t
  );

  const updatedState: SyndicateWarState = {
    ...state,
    territories: updatedTerritories,
  };

  saveSyndicateWarState(profile.id, updatedState);
  return { updatedState, message: `تم فتح إقليم ${territory.name} للمنافسة والاستحواذ!` };
}
