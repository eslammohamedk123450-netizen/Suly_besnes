import type { SectionId } from '../domain/navigation';
import type { PlayerProfile } from '../domain/player';

export interface StarterMission {
  id: string;
  title: string;
  description: string;
  section: SectionId;
  completed: boolean;
}

export interface SystemGuide {
  title: string;
  description: string;
  steps: string[];
}

export interface PlayerProgress {
  level: number;
  totalExperience: number;
  experienceInLevel: number;
  experienceForNextLevel: number;
}

const EXPERIENCE_PER_LEVEL = 150;
const INTRO_UNLOCKS: SectionId[] = ['home', 'store', 'profile', 'lands', 'companies', 'settings', 'tasks', 'auctions'];

/** Experience is derived from durable accomplishments so old saves migrate without data loss. */
export function getPlayerProgress(profile: PlayerProfile): PlayerProgress {
  const completedProduction = profile.productionOrders.filter((order) => order.status === 'completed').length;
  const completedContracts = profile.contracts.filter((contract) => contract.status === 'completed').length;
  const totalExperience =
    profile.lands.length * 35
    + profile.companies.length * 75
    + Math.min(completedProduction, 20) * 22
    + Math.min(profile.sales.length, 30) * 12
    + Math.min(completedContracts, 20) * 45
    + Math.min(profile.completedTaskIds.length, 30) * 22
    + Math.min(profile.achievements.length, 30) * 30
    + Math.min(profile.investments.length, 20) * 15
    + Math.min(profile.staff.length, 15) * 8;
  const activityLevel = 1 + Math.floor(totalExperience / EXPERIENCE_PER_LEVEL);
  const level = Math.max(1, profile.level || 1, activityLevel);
  const experienceInLevel = level > activityLevel ? 0 : totalExperience % EXPERIENCE_PER_LEVEL;
  return { level, totalExperience, experienceInLevel, experienceForNextLevel: EXPERIENCE_PER_LEVEL };
}

export function getUnlockedSectionIds(profile: PlayerProfile): SectionId[] {
  if (!profile.onboarding?.introCompleted) return INTRO_UNLOCKS;

  const unlocked = new Set<SectionId>(INTRO_UNLOCKS);
  const progress = getPlayerProgress(profile);
  const completedProduction = profile.productionOrders.some((order) => order.status === 'completed');
  const completedSales = profile.sales.length > 0;
  const completedContracts = profile.contracts.filter((contract) => contract.status === 'completed').length;

  if (profile.companies.length >= 1) {
    unlocked.add('production');
    unlocked.add('inventory');
  }
  if (completedProduction && completedSales || progress.level >= 3) {
    unlocked.add('contracts');
  }
  if (completedContracts >= 1 || progress.level >= 4) {
    unlocked.add('bank');
    unlocked.add('investments');
    unlocked.add('obligations');
  }
  if (progress.level >= 5 || completedContracts >= 3 || profile.companies.length >= 3) {
    unlocked.add('staff');
    unlocked.add('reports');
  }
  return [...unlocked];
}

export function isSectionUnlocked(profile: PlayerProfile, section: SectionId): boolean {
  return getUnlockedSectionIds(profile).includes(section);
}

export function getSectionUnlockHint(profile: PlayerProfile, section: SectionId): string {
  if (isSectionUnlocked(profile, section)) return '';
  if (section === 'production' || section === 'inventory') return 'أسس شركتك الأولى؛ عندها يفتح الإنتاج والمخزون فورًا.';
  if (section === 'contracts') return 'أكمل أول دفعة إنتاج وبِع منتجًا واحدًا (أو بلغ المستوى 3).';
  if (section === 'bank' || section === 'investments' || section === 'obligations') return 'سلّم أول عقد تجاري بنجاح (أو بلغ المستوى 4).';
  if (section === 'staff' || section === 'reports') return 'بلغ المستوى 5، أو أكمل 3 عقود، أو أسس 3 شركات.';
  return 'أكمل خطوة عملية في قصتك لفتح هذا النظام.';
}

export function getStarterMissions(profile: PlayerProfile): StarterMission[] {
  return [
    { id: 'intro-land', title: 'استعد إرث العائلة', description: 'اشترِ أول قطعة أرض لتبدأ إعادة بناء الإمبراطورية.', section: 'lands', completed: profile.lands.length >= 1 },
    { id: 'intro-company', title: 'أعد تشغيل أول شركة', description: 'أسس شركتك الأولى واختر قطاعًا مناسبًا لرأس مالك.', section: 'companies', completed: profile.companies.length >= 1 },
    { id: 'intro-production', title: 'أثبت أن العائلة ما زالت قادرة', description: 'أكمل أمر إنتاج وحوّل المواد الخام إلى منتج قابل للبيع.', section: 'production', completed: profile.productionOrders.some((order) => order.status === 'completed') },
    { id: 'intro-contract', title: 'استعد ثقة السوق', description: 'سلّم أول طلب تجاري في موعده وابنِ سمعة العائلة.', section: 'contracts', completed: profile.contracts.some((contract) => contract.status === 'completed') },
  ];
}

export function getSystemGuide(section: SectionId): SystemGuide {
  const guides: Partial<Record<SectionId, SystemGuide>> = {
    lands: { title: 'الأراضي: أول حجر في الإمبراطورية', description: 'كل شركة تحتاج موقعًا مناسبًا. طابق نوع الأرض مع القطاع قبل الشراء.', steps: ['قارن نوع الأرض بالقطاع المطلوب.', 'راقب السعر والمساحة قبل تأكيد الشراء.', 'اترك جزءًا من السيولة للتراخيص والتشغيل.'] },
    companies: { title: 'الشركات: حوّل الإرث إلى نشاط', description: 'أسس شركة واحدة أولًا، ثم تعلّم الإنتاج قبل التوسع.', steps: ['اختر اسمًا واضحًا للشركة.', 'اختر قطاعًا يناسب الأرض والمواد المتاحة.', 'لا تستهلك كل رأس المال في التأسيس.'] },
    production: { title: 'الإنتاج: هنا يبدأ الدخل الحقيقي', description: 'حوّل المواد إلى منتجات، ثم تابع الجودة والطاقة ووقت الإنجاز.', steps: ['اشترِ المواد المطلوبة.', 'راجع الطلب والسعر قبل تشغيل الدفعة.', 'انتظر اكتمال الإنتاج ثم بع أو سلّم عقدًا.'] },
    inventory: { title: 'المخازن: سيولتك المجمّدة', description: 'المخزون أصل مفيد لكنه يستهلك رأس المال ومساحة التخزين.', steps: ['راقب الكميات بدل الشراء العشوائي.', 'استخدم المخزون للعقود ذات الهامش الأفضل.', 'بع الفائض عندما تكون الأسعار مناسبة.'] },
    contracts: { title: 'العقود: ابنِ سمعة العائلة', description: 'كل طلب فرصة للربح والثقة، لكنه يحمل موعدًا نهائيًا وغرامة عند الفشل.', steps: ['اقبل عقدًا تستطيع إنتاجه.', 'افحص الكمية والموعد قبل القبول.', 'سلّم المنتج يدويًا من صفحة العقود.'] },
    auctions: { title: 'المزادات: توسع محسوب', description: 'المزاد قد يمنحك أصلًا مهمًا، لكنه قد يستهلك سيولتك بسرعة.', steps: ['حدد سقفًا قبل دخول المزاد.', 'لا تزايد بدافع المنافسة فقط.', 'احتفظ بسيولة للتشغيل بعد الفوز.'] },
    bank: { title: 'البنك والتمويل: استخدم الدين بحذر', description: 'التمويل يساعد على التوسع، لكنه يضيف التزامات يومية.', steps: ['قارن القسط بالسيولة اليومية.', 'استخدم أصلًا مؤهلًا كضمان.', 'اترك هامش أمان قبل طلب القرض.'] },
    investments: { title: 'الاستثمارات: نوّع المخاطر', description: 'ضع الفائض الذي لا تحتاجه للتشغيل في استثمار بمدة واضحة.', steps: ['لا تستثمر رأس مال التشغيل.', 'قارن المدة بالعائد والمخاطرة.', 'خطط مسبقًا ليوم الاستحقاق.'] },
    obligations: { title: 'الالتزامات: لا تتركها للمفاجآت', description: 'هنا ترى ما سيُخصم من سيولتك ومتى.', steps: ['راجع الأقساط والرواتب يوميًا.', 'سدّد المتأخرات قبل أن توقف الطاقة.', 'احتفظ باحتياطي نقدي.'] },
    staff: { title: 'الإدارة والرواتب: كفاءتك البشرية', description: 'الموظفون يضيفون قدرات، لكن رواتبهم التزام متكرر.', steps: ['وظّف الدور الذي تحتاجه فعلًا.', 'طابق الموظف مع الشركة المناسبة.', 'تابع الرواتب قبل ترحيل اليوم.'] },
    reports: { title: 'التقارير: قرارات على أرقام', description: 'اقرأ دفتر الحساب لتعرف هل تكبر أم تستهلك رأس المال.', steps: ['راجع الإيرادات والمصروفات.', 'قارن الربح بين القطاعات.', 'استخدم التقرير قبل أي توسع كبير.'] },
    tasks: { title: 'المهام والإنجازات: مكافآت التقدم', description: 'المهام تحول الخطوات الأولى إلى أهداف واضحة ومكافآت.', steps: ['افتح المهمة لمعرفة الشرط.', 'نفذها أثناء لعبك الطبيعي.', 'استلم المكافأة بعد تحقق الشرط.'] },
  };
  return guides[section] ?? { title: 'نظام جديد في الإمبراطورية', description: 'استخدم هذا القسم بحذر وتابع أثر قراراتك على السيولة.', steps: ['اقرأ الأرقام قبل التأكيد.', 'ابدأ بعملية صغيرة.', 'ارجع إلى التقارير لقياس النتيجة.'] };
}

export function chapterFor(profile: PlayerProfile): number {
  if (!profile.onboarding?.introCompleted) return 0;
  const progress = getPlayerProgress(profile);
  const completedContracts = profile.contracts.filter((contract) => contract.status === 'completed').length;
  const completedProduction = profile.productionOrders.some((order) => order.status === 'completed');
  if (progress.level >= 5 || profile.companies.length >= 3) return 4;
  if (completedContracts >= 1) return 3;
  if (completedProduction) return 2;
  return 1;
}
