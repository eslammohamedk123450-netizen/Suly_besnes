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
    phaseBadge: 'الخطوة 1 من 5 · الصيانة والتشغيل',
    title: 'صيانة ماكينات المصنع الموروث',
    actionGoal: 'إعادة تأهيل المصنع ورفع الكفاءة التشغيلية إلى 100%',
    targetButtonLabel: 'صيانة المصنع ⚙️',
    clickInstruction: 'اضغط مباشرة على زر «صيانة المصنع ⚙️» المحاط بالإطار الذهبي النابض والمؤشر أعلاه.',
    whyInstruction: 'المصنع يعمل بكفاءة 25% فقط بسبب الإهمال القديم؛ الصيانة تعيد طاقته الإنتاجية كاملة وتحميه من التوقف والخسائر قبل بدء الإنتاج.',
    navSectionLabel: 'الشركات',
    message: 'المصنع الموروث يحتاج صيانة فورية لرفع كفاءته من 25% إلى 100%!',
    subMessage: 'انظر إلى زر صيانة المصنع المحدد بالسهم والإطار الذهبي واضغط عليه بنفسك.',
    actionPrompt: 'اضغط على زر "صيانة المصنع" بالأسفل لرفع كفاءة الماكينات فوراً 🛠️',
    successMessage: '🎉 رائع جداً! قمت بصيانة معدات المصنع بنفسك واستعدت كفاءته بنسبة 100%!',
    explorationTip: 'لاحظ كيف تحولت كفاءة المصنع للون الأخضر. الآن حان الوقت لحماية رصيدك الائتماني وسداد أول التزام.',
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
    phaseBadge: 'الخطوة 2 من 5 · الحماية المالية',
    title: 'سداد أول قسط بنكي وحماية الحسابات',
    actionGoal: 'تسوية الديون والرواتب لتفادي غرامات البنك والتجميد القضائي',
    targetButtonLabel: 'سداد قسط طوعي أو دفع الراتب',
    clickInstruction: 'اضغط على زر «سداد قسط طوعي» (أو دفع الراتب) المحدد بالسهم الذهبي لتسوية الالتزام.',
    whyInstruction: 'البنك منحك مهلة 7 أيام؛ سداد أول التزام يرفع تقييمك الائتماني ويجهزك لفك الحظر البنكي والحصول على تمويلات لاحقاً.',
    navSectionLabel: 'الالتزامات والرواتب',
    message: 'سدد أول التزام مالي لحماية مصنعك وخزينتك من الحجز القضائي!',
    subMessage: 'اضغط على زر السداد الموضح بالإطار والإشارة الخضراء لتسوية القسط الآن.',
    actionPrompt: 'اضغط على زر "سداد قسط طوعي" أو "دفع الراتب" لتسوية الالتزام 💳',
    successMessage: '🎉 ممتاز! تم سداد الالتزام بنجاح وأصبح سجلك الائتماني آمناً ونظيفاً!',
    explorationTip: 'استكشف قائمة ديونك، والتزامك بالسداد سيجعلك مؤهلاً للحصول على قروض عملاقة عند فتح البنك في المستوى 4.',
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
    phaseBadge: 'الخطوة 3 من 5 · التوسع العقاري',
    title: 'تأمين وشراء أول أرض استثمارية',
    actionGoal: 'امتلاك أرض صناعية مرخصة لإقامة مصانع وشركات إضافية',
    targetButtonLabel: 'فتح عرض البداية / شراء الأرض',
    clickInstruction: 'اضغط على زر «فتح عرض البداية» أو زر الشراء الذهبي المحدد بالسهم والمؤشر لتملك الأرض.',
    whyInstruction: 'لا يمكن تأسيس شركة أو بناء مصنع مستقبلي بدون أرض مرخصة. الاستثمار العقاري هو الحصن المالي المضمون لأصولك.',
    navSectionLabel: 'الأراضي',
    message: 'اشترِ أول أرض استثمارية لتكون قاعدتك للتوسع وبناء مصانع جديدة!',
    subMessage: 'اضغط على زر فتح عرض البداية ثم تأكيد الشراء لتسجيل الأرض باسمك رسمياً.',
    actionPrompt: 'اضغط على زر "فتح عرض البداية" أو شراء الأرض لتأمين قاعدتك العقارية 🏞️',
    successMessage: '🎉 مبروك! أصبحت مالكاً لأرض استثمارية مسجلة تؤهلك لتأسيس مصانع ومستودعات جديدة!',
    explorationTip: 'تفقّد تفاصيل مساحة الأرض وموقعها. الخطوة التالية هي تشغيل ماكينات المصنع لتصنيع أول دفعة إنتاج.',
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
    phaseBadge: 'الخطوة 4 من 5 · دوران الإنتاج',
    title: 'تشغيل خط الإنتاج وتصنيع أول دفعة سلع',
    actionGoal: 'تحويل المواد الخام إلى منتجات غذائية نهائية جاهزة للبيع',
    targetButtonLabel: 'تشغيل خط الإنتاج',
    clickInstruction: 'اضغط على زر «تشغيل خط الإنتاج» المحاط بالإطار والمؤشر لبدء تشغيل الماكينات.',
    whyInstruction: 'التصنيع هو المحرك الأساسي للأرباح الصافية؛ تدوير الخامات وتصنيعها يضاعف قيمتها النقدية ويمنحك نقاط XP سريعة.',
    navSectionLabel: 'الإنتاج والمصانع',
    message: 'المصنع جاهز الآن! أطلق أول أمر تشغيل لتصنيع السلع الغذائية!',
    subMessage: 'اضغط على زر تشغيل خط الإنتاج الموضح بالسهم لبدء دوران الماكينات.',
    actionPrompt: 'اضغط على "تشغيل خط الإنتاج" لبدء دوران ماكينات المصنع 🏭',
    successMessage: '🎉 رائع جداً! بدأت ماكينات المصنع بالدوران الفعلي وتم جدول أول دفعة تصنيع بنجاح!',
    explorationTip: 'تفقّد عداد اكتمال الإنتاج وسعة المستودع، وبعد اكتمال الدفعة ستبيعها لتحقيق تدفق نقدي ضخم.',
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
    phaseBadge: 'الخطوة 5 من 5 · جني الثمار والترقية',
    title: 'استلام مكافأة الإنجاز ورفع المستوى',
    actionGoal: 'جني الكاش والماس ونقاط الخبرة لفتح المستويات والأنظمة المتقدمة',
    targetButtonLabel: 'استلام المكافأة',
    clickInstruction: 'اضغط على زر «استلام المكافأة» الذهبي الموضح بالسهم والمؤشر لاستلام أرباح المهمة.',
    whyInstruction: 'كل مهمة تنجزها تمنحك XP للترقية السريعة، مما يفتح البورصة والمزادات والتجارة العالمية تلقائياً.',
    navSectionLabel: 'المهام اليومية',
    message: 'لقد أنجزت خطوات التأسيس! استلم مكافأتك القيادية لترقية مستواك!',
    subMessage: 'اضغط على زر استلام المكافأة الموضح بالسهم لجني الكاش والماس.',
    actionPrompt: 'اضغط على زر "استلام المكافأة" الآن لترقية مستواك 🎁',
    successMessage: '👑 تهانينا الحارة! أتقنت كل محاور إدارة الإمبراطورية بنفسك وتسلّمت مكافأتك القيادية كاملة!',
    explorationTip: 'أنت الآن جاهز بالكامل! أصبحت تعرف أين تضغط لكل عملية: الصيانة، الالتزامات، الأراضي، الإنتاج، والمهام.',
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
