import type { PlayerProfile } from '../domain/player';
import { calculateTotalAssets } from '../domain/player';
import { triggerHaptic } from '../services/nativeMobileService';
import { playSound } from './soundEffects';

export interface GlobalCapital {
  id: string;
  name: string;
  nameEn: string;
  country: string;
  flag: string;
  focusTitle: string;
  description: string;
  bonusMultiplierTitle: string;
  bonusMultiplierDesc: string;
  requiredPrestigeLevel: number;
}

export interface SovereignPerk {
  id: string;
  title: string;
  costTokens: number;
  icon: string;
  description: string;
  effectType: 'loan_discount' | 'production_speed' | 'warehouse_cap' | 'profit_boost';
}

export interface PrestigeData {
  prestigeLevel: number; // 0 for base game, 1+ for new game+
  prestigeTokens: number;
  currentCapitalId: string;
  unlockedCapitalIds: string[];
  activePerkIds: string[];
  totalExpansionsCompleted: number;
}

const PRESTIGE_STORAGE_PREFIX = 'suly_prestige_v1_';

export const GLOBAL_CAPITALS: GlobalCapital[] = [
  {
    id: 'cairo_base',
    name: 'القاهرة',
    nameEn: 'Cairo',
    country: 'جمهورية مصر العربية',
    flag: '🇪🇬',
    focusTitle: 'مهد الإمبراطورية والصناعة',
    description: 'السوق التأسيسي الأكبر من حيث القوة العاملة والمصانع المتنوعة.',
    bonusMultiplierTitle: 'الأصل التأسيسي',
    bonusMultiplierDesc: 'سوق متوازن لجميع قطاعات التغذية والتشييد والتجارة.',
    requiredPrestigeLevel: 0,
  },
  {
    id: 'riyadh',
    name: 'الرياض',
    nameEn: 'Riyadh',
    country: 'المملكة العربية السعودية',
    flag: '🇸🇦',
    focusTitle: 'عاصمة الطاقة والعقارات الكبرى',
    description: 'مشاريع عملاقة وصناديق سيادية مليارية توفر عوائد استثنائية لمشاريع المقاولات والبتروكيماويات.',
    bonusMultiplierTitle: '+25% أرباح العقارات والمقاولات',
    bonusMultiplierDesc: 'مشاريع رؤية 2030 ترفع وتيرة التعاقدات والسيولة الاستثمارية.',
    requiredPrestigeLevel: 1,
  },
  {
    id: 'dubai',
    name: 'دبي',
    nameEn: 'Dubai',
    country: 'الإمارات العربية المتحدة',
    flag: '🇦🇪',
    focusTitle: 'ملتقى التجارة والـ Fintech والمزادات الحرة',
    description: 'أعلى سرعة لدوران رأس المال، صفر ضرائب على الأرباح التجارية، ومزادات عالمية لأندر الأصول.',
    bonusMultiplierTitle: '+30% أرباح التجارة الحرة والموانئ',
    bonusMultiplierDesc: 'إعفاء جمركي وتدفقات سيولة عالمية للمشاريع الرقمية واللوجستية.',
    requiredPrestigeLevel: 2,
  },
  {
    id: 'london',
    name: 'لندن',
    nameEn: 'London',
    country: 'المملكة المتحدة',
    flag: '🇬🇧',
    focusTitle: 'عاصمة المال والتحوط المصرفي الدولي',
    description: 'أقدم البورصات المالية في العالم وملاذات الذهب وسندات الخزانة ذات العائد الآمن.',
    bonusMultiplierTitle: '+20% عوائد الأسهم والودائع المصرفية',
    bonusMultiplierDesc: 'أسواق مالية عريقة توفر حماية فائقة واستقراراً نقدياً ضد الصدمات.',
    requiredPrestigeLevel: 3,
  },
  {
    id: 'new_york',
    name: 'نيويورك',
    nameEn: 'New York',
    country: 'الولايات المتحدة الأمريكية',
    flag: '🇺🇸',
    focusTitle: 'معقل وول ستريت وعمالقة التكنولوجيا',
    description: 'قمة الهرم الاقتصادي العالمي، حاضنات اليونيكورن، وأكبر طروحات الاكتتاب العام IPO.',
    bonusMultiplierTitle: '+35% تقييمات الشركات الناشئة والـ IPO',
    bonusMultiplierDesc: 'سيولة مالية مطلقة مع إمكانية مضاعفة القيمة السوقية 10 أضعاف.',
    requiredPrestigeLevel: 4,
  },
];

export const SOVEREIGN_PERKS: SovereignPerk[] = [
  {
    id: 'perk_banking_immunity',
    title: 'الحصانة المصرفية السيادية',
    costTokens: 2,
    icon: '🏛️',
    description: '-25% تخفيض دائم على فوائد القروض المصرفية وتسهيلات ائتمانية فورية.',
    effectType: 'loan_discount',
  },
  {
    id: 'perk_industrial_overdrive',
    title: 'الكفاءة الصناعية الفائقة',
    costTokens: 3,
    icon: '⚡',
    description: '+30% سرعة إنتاج وتشغيل دائمة لجميع المصانع في جميع العواصم.',
    effectType: 'production_speed',
  },
  {
    id: 'perk_global_logistics',
    title: 'نفوذ سلاسل التوريد العالمية',
    costTokens: 2,
    icon: '📦',
    description: '+50% سعة مستودعات أساسية وتأمين مباشر ضد نقص المواد الخام.',
    effectType: 'warehouse_cap',
  },
  {
    id: 'perk_titan_monopoly',
    title: 'لقب الحوت المالي العالمي',
    costTokens: 5,
    icon: '🐋',
    description: '+15% مضاعف أرباح صافية دائم لجميع الشركات ومبيعات العقود.',
    effectType: 'profit_boost',
  },
];

export function loadPrestigeData(profileId: string): PrestigeData {
  try {
    const raw = localStorage.getItem(`${PRESTIGE_STORAGE_PREFIX}${profileId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load prestige data', e);
  }
  return {
    prestigeLevel: 0,
    prestigeTokens: 0,
    currentCapitalId: 'cairo_base',
    unlockedCapitalIds: ['cairo_base'],
    activePerkIds: [],
    totalExpansionsCompleted: 0,
  };
}

export function savePrestigeData(profileId: string, data: PrestigeData): void {
  try {
    localStorage.setItem(`${PRESTIGE_STORAGE_PREFIX}${profileId}`, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save prestige data', e);
  }
}

/**
 * Checks if the player is eligible for Global Sovereign Prestige Expansion.
 */
export function checkPrestigeEligibility(profile: PlayerProfile): {
  eligible: boolean;
  requiredAssets: number;
  currentAssets: number;
  earnedTokens: number;
  reason?: string;
} {
  const currentAssets = calculateTotalAssets(profile);
  const requiredAssets = 25000000; // 25 Million EGP minimum
  const requiredLevel = 8; // Level 8+

  if (profile.level < requiredLevel) {
    return {
      eligible: false,
      requiredAssets,
      currentAssets,
      earnedTokens: 0,
      reason: `يتطلب بلوغ المستوى ${requiredLevel} على الأقل (أنت حالياً مستوى ${profile.level})`,
    };
  }

  if (currentAssets < requiredAssets) {
    return {
      eligible: false,
      requiredAssets,
      currentAssets,
      earnedTokens: 0,
      reason: `يتطلب صافي ثروة يتجاوز 25,000,000 ج.م (ثروتك الحالية ${currentAssets.toLocaleString('ar-EG')} ج.م)`,
    };
  }

  // Calculate earned tokens: 2 tokens base + 1 token for each 20M above 25M
  const extraTokens = Math.floor((currentAssets - requiredAssets) / 20000000);
  const earnedTokens = Math.min(10, 2 + extraTokens);

  return {
    eligible: true,
    requiredAssets,
    currentAssets,
    earnedTokens,
  };
}

/**
 * Executes the Prestige Expansion to a new global capital.
 */
export function executePrestigeExpansion(
  profile: PlayerProfile,
  targetCapitalId: string
): { updatedProfile: PlayerProfile; updatedPrestige: PrestigeData; message: string } | { error: string } {
  const eligibility = checkPrestigeEligibility(profile);
  if (!eligibility.eligible) {
    return { error: eligibility.reason || 'الشروط غير مكتملة للتوسع الدولي' };
  }

  const currentPrestige = loadPrestigeData(profile.id);
  const capital = GLOBAL_CAPITALS.find((c) => c.id === targetCapitalId);
  if (!capital) return { error: 'العاصمة المختارة غير صالحة' };

  const nextPrestigeLevel = currentPrestige.prestigeLevel + 1;
  const newTokens = currentPrestige.prestigeTokens + eligibility.earnedTokens;

  const unlockedCapitals = Array.from(new Set([...currentPrestige.unlockedCapitalIds, targetCapitalId]));

  const updatedPrestige: PrestigeData = {
    ...currentPrestige,
    prestigeLevel: nextPrestigeLevel,
    prestigeTokens: newTokens,
    currentCapitalId: targetCapitalId,
    unlockedCapitalIds: unlockedCapitals,
    totalExpansionsCompleted: currentPrestige.totalExpansionsCompleted + 1,
  };

  savePrestigeData(profile.id, updatedPrestige);

  // Reset domestic businesses & loans for New Game+, but give generous starter cash & retain inventory/prestige
  const starterCash = 5000000 + nextPrestigeLevel * 2000000;

  const updatedProfile: PlayerProfile = {
    ...profile,
    level: Math.max(5, profile.level - 3), // Soft reset level for progression loop
    bankBalance: starterCash,
    banking: {
      deposits: [],
      loans: [],
    },
    companies: [],
    lands: [],
    day: 1, // Reset game day
    reputation: Math.min(100, profile.reputation + 15),
  };

  return {
    updatedProfile,
    updatedPrestige,
    message: `🎉 تهانينا! تم تأسيس صندوق استثماري عابر للقارات بنجاح في ${capital.name}! حصلت على ${eligibility.earnedTokens} نقطة هيبة سيادية و${starterCash.toLocaleString('ar-EG')} رصيد انطلاق.`,
  };
}

/**
 * Purchase a sovereign perk using prestige tokens.
 */
export function purchaseSovereignPerk(
  profileId: string,
  perkId: string
): { updatedPrestige: PrestigeData; message: string } | { error: string } {
  const prestige = loadPrestigeData(profileId);
  const perk = SOVEREIGN_PERKS.find((p) => p.id === perkId);
  if (!perk) return { error: 'الميزة غير موجودة' };
  if (prestige.activePerkIds.includes(perkId)) {
    return { error: 'هذه الميزة مفعلة لديك بالفعل' };
  }
  if (prestige.prestigeTokens < perk.costTokens) {
    return { error: 'نقاط الهيبة غير كافية لشراء هذا الامتياز السيادي' };
  }

  const updatedPrestige: PrestigeData = {
    ...prestige,
    prestigeTokens: prestige.prestigeTokens - perk.costTokens,
    activePerkIds: [...prestige.activePerkIds, perkId],
  };

  savePrestigeData(profileId, updatedPrestige);
  return { updatedPrestige, message: `تم تفعيل امتياز "${perk.title}" الدائم بنجاح!` };
}
