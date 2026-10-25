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

export interface SectionUnlockRequirement {
  sectionId: SectionId;
  requiredLevel: number;
  storyHint: string;
  badgeLabel: string;
  chapterNumber: number;
}

export const SECTION_UNLOCK_CONFIG: Record<SectionId, SectionUnlockRequirement> = {
  home: { sectionId: 'home', requiredLevel: 1, storyHint: 'مقر القيادة متاح دائماً', badgeLabel: 'متاح', chapterNumber: 1 },
  profile: { sectionId: 'profile', requiredLevel: 1, storyHint: 'الملف الشخصي وإعداداتك', badgeLabel: 'متاح', chapterNumber: 1 },
  settings: { sectionId: 'settings', requiredLevel: 1, storyHint: 'إدارة الحفظ وإعدادات اللعبة', badgeLabel: 'متاح', chapterNumber: 1 },
  store: { sectionId: 'store', requiredLevel: 1, storyHint: 'متجر الماس والباقات الحصرية', badgeLabel: 'متاح', chapterNumber: 1 },
  tasks: { sectionId: 'tasks', requiredLevel: 1, storyHint: 'مهام القصة والإنجازات الوطنية', badgeLabel: 'متاح', chapterNumber: 1 },
  lands: { sectionId: 'lands', requiredLevel: 1, storyHint: 'شراء وتطوير الأراضي الاستثمارية (الفصل الأول)', badgeLabel: 'متاح', chapterNumber: 1 },
  companies: { sectionId: 'companies', requiredLevel: 1, storyHint: 'تأسيس أول شركة في مسار الإنقاذ (الفصل الأول)', badgeLabel: 'متاح', chapterNumber: 1 },
  auctions: { sectionId: 'auctions', requiredLevel: 1, storyHint: 'المزادات العلنية على الأصول والمصانع المتعثرة', badgeLabel: 'متاح', chapterNumber: 1 },

  // المستوى 1: الأساسيات والرقابة على الالتزامات
  obligations: { sectionId: 'obligations', requiredLevel: 1, storyHint: 'متابعة الديون والالتزامات وفترة السماح القضائية', badgeLabel: 'متاح للرقابة', chapterNumber: 1 },

  // المستوى 2: الإنتاج والتصنيع والمخازن
  production: { sectionId: 'production', requiredLevel: 2, storyHint: 'تشغيل خطوط المصانع وتحويل الخامات إلى منتجات', badgeLabel: 'يفتح في مستوى 2', chapterNumber: 1 },
  inventory: { sectionId: 'inventory', requiredLevel: 2, storyHint: 'المستودعات وسلاسل إمداد المواد الخام', badgeLabel: 'يفتح في مستوى 2', chapterNumber: 1 },

  // المستوى 3: العقود والعملاء
  contracts: { sectionId: 'contracts', requiredLevel: 3, storyHint: 'عقود التوريد واستعادة ثقة كبار التجار', badgeLabel: 'يفتح في مستوى 3', chapterNumber: 1 },

  // المستوى 4: رفع الحظر البنكي واستعادة التسهيلات والودائع
  bank: { sectionId: 'bank', requiredLevel: 4, storyHint: 'رفع التجميد البنكي واستعادة التسهيلات والقروض والودائع', badgeLabel: 'يفتح في مستوى 4', chapterNumber: 1 },

  // المستوى 5: البورصة والتقارير والموظفون (الفصل الثاني)
  investments: { sectionId: 'investments', requiredLevel: 5, storyHint: 'البورصة والتداول في الأسواق المالية والاكتتاب العام', badgeLabel: 'يفتح في مستوى 5', chapterNumber: 2 },
  staff: { sectionId: 'staff', requiredLevel: 5, storyHint: 'توظيف المديرين والمحاسبين والخبراء التنفيذيين', badgeLabel: 'يفتح في مستوى 5', chapterNumber: 2 },
  reports: { sectionId: 'reports', requiredLevel: 5, storyHint: 'التقارير المالية المتقدمة وتحليل الأداء والربحية', badgeLabel: 'يفتح في مستوى 5', chapterNumber: 2 },

  // المستوى 6: الأبحاث والتكنولوجيا
  tech_tree: { sectionId: 'tech_tree', requiredLevel: 6, storyHint: 'شجرة التكنولوجيا وأبحاث الأتمتة الذكية للمصانع', badgeLabel: 'يفتح في مستوى 6', chapterNumber: 2 },

  // المستوى 7: السيطرة الإقليمية
  territory: { sectionId: 'territory', requiredLevel: 7, storyHint: 'خريطة السيطرة والتوسع الجغرافي وحصص الأسواق', badgeLabel: 'يفتح في مستوى 7', chapterNumber: 2 },

  // المستوى 8: الهيبة والرفاهية
  luxury: { sectionId: 'luxury', requiredLevel: 8, storyHint: 'أصول الهيبة والسيارات الفارهة ونفوذ المدير التنفيذي', badgeLabel: 'يفتح في مستوى 8', chapterNumber: 2 },

  // المستوى 9: الكارتيل والتحالفات
  cartel: { sectionId: 'cartel', requiredLevel: 9, storyHint: 'تأسيس الكارتيل والتحالفات التجارية وحرب الأسعار', badgeLabel: 'يفتح في مستوى 9', chapterNumber: 3 },

  // المستوى 10: الشحن الملاحي والتصدير الدولي (الفصل الثالث)
  maritime: { sectionId: 'maritime', requiredLevel: 10, storyHint: 'الأسطول التجاري البحري والشحن الدولي للموانئ', badgeLabel: 'يفتح في مستوى 10', chapterNumber: 3 },

  // المستوى 12: المناقصات ونفوذ الدولة
  megaprojects: { sectionId: 'megaprojects', requiredLevel: 12, storyHint: 'المشاريع القومية العملاقة والمناقصات السيادية', badgeLabel: 'يفتح في مستوى 12', chapterNumber: 3 },

  // المستوى 15: حاضنات الأعمال والـ VC (الفصل الرابع)
  incubator: { sectionId: 'incubator', requiredLevel: 15, storyHint: 'الاستثمار الجريء ورعاية شركات اليونيكورن الناشئة', badgeLabel: 'يفتح في مستوى 15', chapterNumber: 4 },
};

export function getSectionRequiredLevel(section: SectionId): number {
  return SECTION_UNLOCK_CONFIG[section]?.requiredLevel ?? 1;
}

export function getSectionUnlockBadge(section: SectionId): string {
  return SECTION_UNLOCK_CONFIG[section]?.badgeLabel ?? 'متاح';
}

const EXPERIENCE_PER_LEVEL = 150;
const INTRO_UNLOCKS: SectionId[] = ['home', 'store', 'profile', 'lands', 'companies', 'settings', 'tasks', 'auctions', 'obligations'];

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
  const level = progress.level;
  const completedProduction = profile.productionOrders.some((order) => order.status === 'completed');
  const completedSales = profile.sales.length > 0;
  const completedContracts = profile.contracts.filter((contract) => contract.status === 'completed').length;

  // Level 2: Production & Inventory
  if (profile.companies.length >= 1 || level >= 2) {
    unlocked.add('production');
    unlocked.add('inventory');
  }

  // Level 3: Contracts
  if ((completedProduction && completedSales) || level >= 3) {
    unlocked.add('contracts');
  }

  // Level 4: Bank (رفع الحظر البنكي)
  if (completedContracts >= 1 || level >= 4) {
    unlocked.add('bank');
  }

  // Level 5: Investments, Staff, Reports
  if (level >= 5 || (completedContracts >= 2 && profile.companies.length >= 2)) {
    unlocked.add('investments');
    unlocked.add('staff');
    unlocked.add('reports');
  }

  // Expansion systems
  if (level >= 6) unlocked.add('tech_tree');
  if (level >= 7) unlocked.add('territory');
  if (level >= 8) unlocked.add('luxury');
  if (level >= 9) unlocked.add('cartel');
  if (level >= 10) unlocked.add('maritime');
  if (level >= 12) unlocked.add('megaprojects');
  if (level >= 15) unlocked.add('incubator');

  return [...unlocked];
}

export function isSectionUnlocked(profile: PlayerProfile, section: SectionId): boolean {
  return getUnlockedSectionIds(profile).includes(section);
}

export function getSectionUnlockHint(profile: PlayerProfile, section: SectionId): string {
  if (isSectionUnlocked(profile, section)) return '';
  const config = SECTION_UNLOCK_CONFIG[section];
  if (!config) return 'أكمل خطوات في سيناريو القصة لفتح هذا النظام.';
  return `يفتح في مستوى ${config.requiredLevel} · ${config.storyHint}`;
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
    tech_tree: { title: 'الأبحاث والأتمتة: ثورة الإنتاج الذكي', description: 'طوّر تقنيات الذكاء الاصطناعي والأتمتة لخفض تكاليف المصانع وزيادة الإنتاجية.', steps: ['استثمر نقاط الأبحاث في الفروع الأساسية.', 'ركز على أتمتة خطوط الإنتاج أولاً.', 'افتح تقنيات الطاقة المستدامة.'] },
    territory: { title: 'السيطرة الإقليمية: التوسع الجغرافي', description: 'افتح فروعاً وامتلك حصصاً سوقية في المدن والمحافظات الرئيسية.', steps: ['اختر المحافظة المناسبة لرأس مالك.', 'ضخ استثمارات لرفع حصتك السوقية.', 'حقق السيطرة الإقليمية لجني عوائد يومية.'] },
    luxury: { title: 'الهيبة والرفاهية: أصول المدير التنفيذي', description: 'امتلك القصور والسيارات الفاخرة والطائرات لرفع نقاط الهيبة ونفوذك التجاري.', steps: ['اشترِ أصول الهيبة تدريجياً.', 'كل أصل يرفع نقاط الهيبة وسقف التسهيلات.', 'تباهَ بإمبراطوريتك أمام المنافسين.'] },
    cartel: { title: 'الكارتيل والتحالفات: قوة التكتلات', description: 'أنشئ تحالفات تجارية مع كبار رجال الأعمال للسيطرة على الأسعار وسحق المنافسين.', steps: ['انضم إلى كارتيل أو أسس تحالفك الخاص.', 'شارك في حروب الأسعار لانتزاع العقود.', 'استفد من الحماية المتبادلة والخصومات.'] },
    maritime: { title: 'الشحن الملاحي: أسطول البحار والموانئ', description: 'امتلك سفن الشحن العملاقة وافتح خطوط التصدير عبر كبرى الموانئ الدولية.', steps: ['اشترِ أول سفينة شحن بضائع.', 'عيّن أطقماً ملاحية ذات خبرة.', 'صدّر منتجاتك للأسواق العالمية بأعلى عائد.'] },
    megaprojects: { title: 'المشاريع القومية: مناقصات السيادة', description: 'شارك في مناقصات الدولة للمشاريع الكبرى ونل إعفاءات ضريبية ونفوذاً هائلاً.', steps: ['راجع شروط المناقصات الحكومية المتاحة.', 'قدّم عطاءك المالي المدعوم بضمان بنكي.', 'أنجز المشروع لرفع تصنيفك السيادي.'] },
    incubator: { title: 'حاضنات الأعمال: استثمار الـ VC واليونيكورن', description: 'استثمر في الشركات الناشئة الواعدة وحوّلها إلى مليارات عند الطرح العام.', steps: ['افحص طلبات التمويل من رواد الأعمال.', 'ضخ رأس المال الجريء في شركات التكنولوجيا.', 'احصد عوائد مضاعفة عند استحواذ الكيانات الكبرى.'] },
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
