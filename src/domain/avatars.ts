export interface CharacterAvatar {
  id: string;
  name: string;
  title: string;
  gender: 'male' | 'female';
  tier: 'free' | 'standard' | 'executive' | 'vip';
  priceDiamonds: number;
  badgeLabel: string;
  description: string;
  quote: string;
  specialty: string;
  roleIcon: string;
  gradient: string;
  bgGradient: string;
  accentBorder: string;
}

export const AVATAR_CATALOG: CharacterAvatar[] = [
  // Free Tier (2 Men + 2 Women)
  {
    id: 'avatar_free_male_1',
    name: 'كريم المنشاوي',
    title: 'رجل أعمال استراتيجي',
    gender: 'male',
    tier: 'free',
    priceDiamonds: 0,
    badgeLabel: 'مجانية',
    description: 'رجل أعمال استراتيجي ببدلة رسمية كلاسيكية ورؤية مالية ثاقبة.',
    quote: 'الفرص الاستثمارية الكبرى تصنعها الرؤية الثاقبة والحساب الدقيق للمخاطر.',
    specialty: 'إدارة الصفقات والاستشارات',
    roleIcon: '👔',
    gradient: 'from-amber-600 via-amber-500 to-yellow-400',
    bgGradient: 'from-slate-900 via-slate-800 to-amber-950',
    accentBorder: 'border-amber-500/40',
  },
  {
    id: 'avatar_free_male_2',
    name: 'عمر الهاشمي',
    title: 'رائد أعمال صناعي',
    gender: 'male',
    tier: 'free',
    priceDiamonds: 0,
    badgeLabel: 'مجانية',
    description: 'رائد أعمال شاب متخصص في التجارة والمصانع وسلاسل الإمداد الحديثة.',
    quote: 'التصنيع الوطني وسلاسل التوريد المستقرة هما عصب أي إمبراطورية اقتصادية.',
    specialty: 'التصنيع وسلاسل الإمداد',
    roleIcon: '🏭',
    gradient: 'from-blue-600 via-cyan-500 to-teal-400',
    bgGradient: 'from-slate-900 via-slate-800 to-cyan-950',
    accentBorder: 'border-cyan-500/40',
  },
  {
    id: 'avatar_free_female_1',
    name: 'د. سارة الراوي',
    title: 'سيدة أعمال تنفيذية',
    gender: 'female',
    tier: 'free',
    priceDiamonds: 0,
    badgeLabel: 'مجانية',
    description: 'سيدة أعمال تنفيذية قيادية في قطاع الاستثمار وإدارة التكتلات والشركات.',
    quote: 'القيادة الناجحة ليست منصباً، بل صناعة أثر مستدام وازدهار مالي دائم.',
    specialty: 'الاستثمار المؤسسي والحوكمة',
    roleIcon: '💼',
    gradient: 'from-emerald-600 via-teal-500 to-emerald-400',
    bgGradient: 'from-slate-900 via-slate-800 to-emerald-950',
    accentBorder: 'border-emerald-500/40',
  },
  {
    id: 'avatar_free_female_2',
    name: 'نور الجابري',
    title: 'مستثمرة ومؤسسة مشاريع',
    gender: 'female',
    tier: 'free',
    priceDiamonds: 0,
    badgeLabel: 'مجانية',
    description: 'مستثمرة ومؤسسة مشاريع صناعية وتجارية في قطاع التجارة وسرعة النمو.',
    quote: 'الجرأة في اتخاذ القرار وسرعة التكيف هما سلاحك في تقلبات الأسواق.',
    specialty: 'تطوير الأعمال والتجزئة',
    roleIcon: '✨',
    gradient: 'from-fuchsia-600 via-pink-500 to-rose-400',
    bgGradient: 'from-slate-900 via-slate-800 to-pink-950',
    accentBorder: 'border-pink-500/40',
  },

  // Standard Tier (25 Diamonds)
  {
    id: 'avatar_std_male_1',
    name: 'الكابتن طارق سليم',
    title: 'خبير اللوجستيات والشحن الدولي',
    gender: 'male',
    tier: 'standard',
    priceDiamonds: 25,
    badgeLabel: '25 💎',
    description: 'خبير الخدمات اللوجستية والشحن الدولي وإدارة خطوط الملاحة والموانئ.',
    quote: 'من يتحكم في بوابات الموانئ ومسارات الشحن، يسيطر على حركة التجارة العالمية.',
    specialty: 'الشحن البحري والموانئ',
    roleIcon: '🚢',
    gradient: 'from-sky-500 via-blue-600 to-indigo-600',
    bgGradient: 'from-slate-900 via-slate-800 to-blue-950',
    accentBorder: 'border-sky-500/50',
  },
  {
    id: 'avatar_std_female_1',
    name: 'رانيا الشريف',
    title: 'مديرة المحافظ والائتمان البنكي',
    gender: 'female',
    tier: 'standard',
    priceDiamonds: 25,
    badgeLabel: '25 💎',
    description: 'مديرة المحافظ المالية والائتمان البنكي وهندسة الصفقات والسيولة العالية.',
    quote: 'إدارة السيولة بحكمة وحماية الأصول من الهزات تصنع الثروات التي لا تزول.',
    specialty: 'الائتمان البنكي والمحافظ',
    roleIcon: '📊',
    gradient: 'from-violet-500 via-purple-600 to-indigo-500',
    bgGradient: 'from-slate-900 via-slate-800 to-purple-950',
    accentBorder: 'border-purple-500/50',
  },

  // Executive Suite (60 Diamonds)
  {
    id: 'avatar_exec_male_1',
    name: 'زياد الفايد',
    title: 'قطب الذكاء الاصطناعي والتكنولوجيا',
    gender: 'male',
    tier: 'executive',
    priceDiamonds: 60,
    badgeLabel: '60 💎',
    description: 'قطب التكنولوجيا والذكاء الاصطناعي ومؤسس صناديق الاستثمار الجريء.',
    quote: 'المستقبل يصنعه من يحول البيانات والخوارزميات إلى تدفقات نقدية مهيمنة.',
    specialty: 'الذكاء الاصطناعي والتقنية',
    roleIcon: '⚡',
    gradient: 'from-cyan-400 via-teal-500 to-blue-600',
    bgGradient: 'from-slate-900 via-slate-850 to-teal-950',
    accentBorder: 'border-teal-500/60',
  },
  {
    id: 'avatar_exec_female_1',
    name: 'شمس المعمري',
    title: 'رئيسة تكتل العقارات والأبراج',
    gender: 'female',
    tier: 'executive',
    priceDiamonds: 60,
    badgeLabel: '60 💎',
    description: 'رئيسة تكتل العقارات والأبراج السكنية والتجارية الفاخرة بالمدن الكبرى.',
    quote: 'ناطحات السحاب لا تمثل رفاهية، بل هي بصمات قوة ومجد يُحفر في السماء.',
    specialty: 'الأبراج والعقارات الفاخرة',
    roleIcon: '🏙️',
    gradient: 'from-amber-400 via-orange-500 to-rose-600',
    bgGradient: 'from-slate-900 via-slate-850 to-amber-950',
    accentBorder: 'border-orange-500/60',
  },

  // VIP Tycoon Tier (120 Diamonds)
  {
    id: 'avatar_vip_male_1',
    name: 'سلطان العتيبي',
    title: 'الملياردير الإمبراطوري',
    gender: 'male',
    tier: 'vip',
    priceDiamonds: 120,
    badgeLabel: '120 💎',
    description: 'الملياردير الإمبراطوري ومؤسس الصناديق السيادية والكيانات القابضة الدولية.',
    quote: 'نحن لا نتنافس في الأسواق، بل نرسم معالمها ونعيد صياغة قواعد اللعبة الاقتصادية.',
    specialty: 'الصناديق السيادية والتكتلات',
    roleIcon: '👑',
    gradient: 'from-amber-300 via-yellow-400 to-amber-600',
    bgGradient: 'from-slate-900 via-yellow-950/60 to-slate-950',
    accentBorder: 'border-yellow-400/80',
  },
  {
    id: 'avatar_vip_female_1',
    name: 'الأميرة نادية الحسيني',
    title: 'رئيسة بيوت الذهب والاستثمار العالمي',
    gender: 'female',
    tier: 'vip',
    priceDiamonds: 120,
    badgeLabel: '120 💎',
    description: 'رئيسة مجلس إدارة كبرى بيوت الاستثمار وتكتلات تجارة سبائك الذهب العالمي.',
    quote: 'الذهب هو الملاذ الذي صمد آلاف السنين، والهيبة الاقتصادية تُصاغ بالسبائك.',
    specialty: 'احتياطيات الذهب والسيادة',
    roleIcon: '🪙',
    gradient: 'from-yellow-300 via-amber-400 to-amber-500',
    bgGradient: 'from-slate-900 via-amber-900/60 to-slate-950',
    accentBorder: 'border-amber-400/80',
  },
];

export const DEFAULT_AVATAR_ID = 'avatar_free_male_1';

export const FREE_AVATAR_IDS = [
  'avatar_free_male_1',
  'avatar_free_male_2',
  'avatar_free_female_1',
  'avatar_free_female_2',
];

export function getAvatarById(avatarId?: string | null): CharacterAvatar {
  if (!avatarId) return AVATAR_CATALOG[0];
  const found = AVATAR_CATALOG.find((a) => a.id === avatarId);
  return found || AVATAR_CATALOG[0];
}

export function isAvatarUnlocked(avatarId: string, unlockedIds?: string[]): boolean {
  if (FREE_AVATAR_IDS.includes(avatarId)) return true;
  if (!unlockedIds || !Array.isArray(unlockedIds)) return false;
  return unlockedIds.includes(avatarId);
}

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_RENAMES_PER_WEEK = 2;

export function getPlayerRenameStatus(
  renameCountThisWeek?: number,
  lastRenameWeekTimestamp?: number
): {
  canRename: boolean;
  remainingRenames: number;
  maxPerWeek: number;
  timeUntilResetMs: number;
  isNewWeek: boolean;
} {
  const now = Date.now();
  const lastTs = lastRenameWeekTimestamp || 0;
  const elapsed = now - lastTs;
  const isNewWeek = lastTs === 0 || elapsed >= ONE_WEEK_MS;

  const currentCount = isNewWeek ? 0 : (renameCountThisWeek || 0);
  const remaining = Math.max(0, MAX_RENAMES_PER_WEEK - currentCount);
  const canRename = remaining > 0;
  const timeUntilResetMs = isNewWeek ? 0 : Math.max(0, ONE_WEEK_MS - elapsed);

  return {
    canRename,
    remainingRenames: remaining,
    maxPerWeek: MAX_RENAMES_PER_WEEK,
    timeUntilResetMs,
    isNewWeek,
  };
}

export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return 'الآن';
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (days > 0) {
    return `${days} يوم و ${remainingHours} ساعة`;
  }
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours} ساعة و ${minutes} دقيقة`;
}
