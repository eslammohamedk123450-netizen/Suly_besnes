import type { SectionId } from '../domain/navigation';
import type { SoundEffect } from './soundEffects';
import type { PlayerProfile } from '../domain/player';

export interface WalkthroughStep {
  id: string;
  sectionId: SectionId;
  targetSelector: string;
  phaseBadge: string;
  title: string;
  actionGoal: string;
  targetButtonLabel: string;
  clickInstruction: string;
  whyInstruction: string;
  navSectionLabel: string;
  checklist: string[];
  message: string;
  subMessage: string;
  actionPrompt: string;
  successMessage: string;
  explorationTip: string;
  soundEffect: SoundEffect;
  category: 'maintenance' | 'obligations' | 'lands' | 'production' | 'tasks' | 'store';
  isComplete?: (profile: PlayerProfile) => boolean;
}

export const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    id: 'service_equipment',
    sectionId: 'companies',
    targetSelector: '[data-guide-target="service-company-btn"]',
    phaseBadge: 'المرحلة 1 من 5 · الصيانة والتشغيل الميداني',
    title: 'صيانة ماكينات المصنع الموروث',
    actionGoal: 'إعادة تأهيل المصنع ورفع الكفاءة التشغيلية إلى 100%',
    targetButtonLabel: 'صيانة المصنع ⚙️',
    clickInstruction: 'وجّه نظرك نحو السهم المضيء النابض واضغط بنفسك على زر «صيانة المصنع ⚙️» لإصلاح الماكينات.',
    whyInstruction: 'ماكينات المصنع مهملة وتعمل بكفاءة 25% فقط؛ الصيانة اليدوية ترفعها لـ 100% وتمنع تعطل الإنتاج والخسائر.',
    navSectionLabel: 'الشركات',
    checklist: [
      'الدخول إلى قسم الشركات واستعراض منشأتك الصناعية',
      'معاينة كفاءة الماكينات المتهالكة (25%)',
      'الضغط بنفسك على زر «صيانة المصنع ⚙️» لرفع الكفاءة إلى 100%'
    ],
    message: 'المصنع الموروث يحتاج صيانة فورية لرفع كفاءته من 25% إلى 100%!',
    subMessage: 'اتبع السهم المضيء واضغط الزر بنفسك مباشرة داخل الشاشة لتتعلم مكان الصيانة.',
    actionPrompt: 'اضغط على زر "صيانة المصنع" بنفسك لرفع كفاءة الماكينات فوراً 🛠️',
    successMessage: '🎉 ممتاز جداً! قمت بصيانة المصنع بنفسك بنجاح وارتفعت كفاءة الماكينات إلى 100%!',
    explorationTip: 'لاحظ كيف تحولت حالة الماكينات إلى اللون الأخضر. الآن سننتقل للخطوة التالية لتسوية الالتزامات المالية.',
    soundEffect: 'factory',
    category: 'maintenance',
    isComplete: (profile: PlayerProfile) => {
      const company = profile.companies[0];
      return Boolean(company && (company.maintenanceCondition ?? 100) >= 90);
    },
  },
  {
    id: 'pay_obligations',
    sectionId: 'obligations',
    targetSelector: '[data-guide-target="pay-obligation-btn"]',
    phaseBadge: 'المرحلة 2 من 5 · الحماية المالية والديون',
    title: 'سداد أول قسط بنكي وحماية الحسابات',
    actionGoal: 'تسوية الديون والرواتب لتفادي غرامات البنك والتجميد القضائي',
    targetButtonLabel: 'سداد قسط طوعي أو دفع الراتب',
    clickInstruction: 'اتبع السهم المضيء واضغط بنفسك على زر «سداد قسط طوعي» (أو دفع الراتب) لتسوية الالتزام.',
    whyInstruction: 'البنك يمنحك مهلة 7 أيام؛ سداد أول التزام يحمي رصيدك من الحجز ويزيد ثقة البنوك في منحك قروضاً لاحقاً.',
    navSectionLabel: 'الالتزامات والرواتب',
    checklist: [
      'الانتقال إلى قسم الالتزامات والرواتب',
      'مراجعة جدول الاستحقاقات والأقساط وفترة السماح',
      'الضغط بنفسك على زر السداد لإبراء ذمتك المالية'
    ],
    message: 'سدد أول التزام مالي لحماية مصنعك وخزينتك من الحجز القضائي!',
    subMessage: 'اضغط بنفسك على زر السداد الموضح بالسهم المضيء لتسوية القسط الآن.',
    actionPrompt: 'اضغط بنفسك على زر السداد لتسوية الالتزام 💳',
    successMessage: '🎉 رائع! تم سداد الالتزام بنجاح وأصبح سجلك الائتماني آمناً ونظيفاً!',
    explorationTip: 'أصبحت خزينتك آمنة من أي غرامات تأخير. الخطوة التالية هي امتلاك أرض استثمارية لبناء مصانع إضافية.',
    soundEffect: 'loan',
    category: 'obligations',
    isComplete: (profile: PlayerProfile) => {
      const remainingLoans = profile.banking?.loans?.filter((l) => l.status === 'active') ?? [];
      return profile.payables === 0 || remainingLoans.length === 0;
    },
  },
  {
    id: 'buy_land',
    sectionId: 'lands',
    targetSelector: '[data-guide-target="buy-land-btn"]',
    phaseBadge: 'المرحلة 3 من 5 · التوسع العقاري',
    title: 'تأمين وشراء أول أرض استثمارية',
    actionGoal: 'امتلاك أرض صناعية مرخصة لإقامة مصانع وشركات إضافية',
    targetButtonLabel: 'فتح عرض البداية / شراء الأرض نقدًا',
    clickInstruction: 'اتبع السهم المضيء واضغط على «فتح عرض البداية» ثم أكمل الشراء بنفسك لتسجيل الأرض باسمك.',
    whyInstruction: 'لا يمكن تأسيس شركة أو بناء مصنع مستقبلي بدون أرض مرخصة. الاستثمار العقاري هو الحصن المالي المضمون لأصولك.',
    navSectionLabel: 'الأراضي',
    checklist: [
      'الدخول إلى قسم الأراضي الاستثمارية',
      'الضغط على «فتح عرض البداية» لمعاينة الأرض المخصصة',
      'الضغط بنفسك على «شراء الأرض نقدًا» لإتمام نقل الملكية'
    ],
    message: 'اشترِ أول أرض استثمارية لتكون قاعدتك للتوسع وبناء مصانع جديدة!',
    subMessage: 'اضغط على زر فتح عرض البداية ثم تأكيد الشراء لتسجيل الأرض باسمك رسمياً.',
    actionPrompt: 'اضغط بنفسك لتملك أول قطعة أرض لمجموعتك 🏞️',
    successMessage: '🎉 مبروك! أصبحت مالكاً لأرض استثمارية مسجلة تؤهلك لتأسيس مصانع ومستودعات جديدة!',
    explorationTip: 'أصبح لديك الآن أرض إضافية مسجلة. حان الوقت لتشغيل خط الإنتاج وتصنيع أول شحنة بضائع.',
    soundEffect: 'click',
    category: 'lands',
    isComplete: (profile: PlayerProfile) => {
      return (profile.lands?.length ?? 0) >= 2;
    },
  },
  {
    id: 'run_production',
    sectionId: 'production',
    targetSelector: '[data-guide-target="start-production-btn"]',
    phaseBadge: 'المرحلة 4 من 5 · دوران الإنتاج والتصنيع',
    title: 'تشغيل خط الإنتاج وتصنيع أول دفعة سلع',
    actionGoal: 'تحويل المواد الخام إلى منتجات غذائية نهائية جاهزة للبيع',
    targetButtonLabel: 'تشغيل خط الإنتاج',
    clickInstruction: 'اتبع السهم المضيء واضغط بنفسك على زر «تشغيل خط الإنتاج» لتبدأ ماكينات المصنع بالدوران.',
    whyInstruction: 'التصنيع هو قلب إمبراطوريتك: شراء المواد الخام وتحويلها لمنتجات تبيعها بأضعاف ثمنها لجني أرباح مستمرة.',
    navSectionLabel: 'الإنتاج والمصانع',
    checklist: [
      'الانتقال إلى قسم الإنتاج والمصانع',
      'مراجعة توفر المواد الخام والطاقة التشغيلية',
      'الضغط بنفسك على زر «تشغيل خط الإنتاج» لإطلاق أول دفعة'
    ],
    message: 'المصنع جاهز الآن! أطلق أول أمر تشغيل لتصنيع السلع الغذائية!',
    subMessage: 'اضغط بنفسك على زر تشغيل خط الإنتاج الموضح بالسهم المضيء لبدء دوران الماكينات.',
    actionPrompt: 'اضغط بنفسك على زر تشغيل خط الإنتاج 🏭',
    successMessage: '🎉 ممتاز جداً! بدأت ماكينات المصنع بالدوران الفعلي وتم جدول أول دفعة تصنيع بنجاح!',
    explorationTip: 'سيبدأ إنتاج البضائع وفور اكتمالها ستبيعها في السوق. الخطوة الأخيرة هي استلام مكافأة الإنجاز لترقية مستواك.',
    soundEffect: 'factory',
    category: 'production',
    isComplete: (profile: PlayerProfile) => {
      return (profile.productionOrders?.length ?? 0) > 0;
    },
  },
  {
    id: 'claim_tasks',
    sectionId: 'tasks',
    targetSelector: '[data-guide-target="claim-task-btn"]',
    phaseBadge: 'المرحلة 5 من 5 · جني الثمار والترقية',
    title: 'استلام مكافأة الإنجاز ورفع المستوى',
    actionGoal: 'جني الكاش والماس ونقاط الخبرة لفتح المستويات والأنظمة المتقدمة',
    targetButtonLabel: 'استلام المكافأة',
    clickInstruction: 'اتبع السهم المضيء واضغط بنفسك على زر «استلام المكافأة» الذهبي لجني الأرباح ونقاط الخبرة.',
    whyInstruction: 'إنجاز المهام هو وسيلتك الأسرع لرفع مستواك وفتح البنك، المزادات، والبورصة العالمية تلقائياً.',
    navSectionLabel: 'المهام اليومية',
    checklist: [
      'فتح قسم المهام اليومية والإنجازات',
      'معاينة المهمة المنجزة ومقدار المكافأة المستحقة',
      'الضغط بنفسك على «استلام المكافأة» لجني الكاش والماس والـ XP'
    ],
    message: 'لقد أنجزت خطوات التأسيس بنفسك! استلم مكافأتك القيادية لترقية مستواك!',
    subMessage: 'اضغط بنفسك على زر استلام المكافأة الموضح بالسهم المضيء.',
    actionPrompt: 'اضغط بنفسك على زر استلام المكافأة 🎁',
    successMessage: '👑 تهانينا الحارة! أتقنت كل محاور إدارة إمبراطوريتك بنفسك ونفذت جميع الخطوات خطوة بخطوة!',
    explorationTip: 'أنت الآن مستثمر محترف تعرف أين تضغط لكل عملية: الصيانة، الالتزامات، الأراضي، الإنتاج، واستلام المكافآت.',
    soundEffect: 'levelUp',
    category: 'tasks',
    isComplete: (profile: PlayerProfile) => {
      return (profile.completedTaskIds?.length ?? 0) > 0;
    },
  },
];

const STORAGE_KEY = 'suly_mandatory_walkthrough_completed';
const STEP_INDEX_KEY = 'suly_walkthrough_current_step_index';

export function isWalkthroughCompleted(): boolean {
  if (typeof window === 'undefined') return true;
  return window.localStorage.getItem(STORAGE_KEY) === 'true';
}

export function setWalkthroughCompleted(completed: boolean): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, completed ? 'true' : 'false');
  if (completed) {
    window.localStorage.removeItem(STEP_INDEX_KEY);
  }
}

export function getSavedWalkthroughStepIndex(): number {
  if (typeof window === 'undefined') return 0;
  const raw = window.localStorage.getItem(STEP_INDEX_KEY);
  if (!raw) return 0;
  const parsed = parseInt(raw, 10);
  return Number.isInteger(parsed) && parsed >= 0 && parsed < WALKTHROUGH_STEPS.length ? parsed : 0;
}

export function setSavedWalkthroughStepIndex(index: number): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STEP_INDEX_KEY, String(index));
}

export function resetWalkthrough(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(STEP_INDEX_KEY);
}
