import type { SectionId } from '../domain/navigation';
import type { SoundEffect } from './soundEffects';
import type { PlayerProfile } from '../domain/player';

export interface WalkthroughStep {
  id: string;
  sectionId: SectionId;
  targetSelector: string;
  phaseBadge: string;
  title: string;
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
    phaseBadge: 'المرحلة 1: كفاءة المصنع والشركات',
    title: 'صيانة معدات شركتك وتطويرها',
    message: 'من هنا يمكنك صيانة معدات شركتك بشكل دوري لرفع كفاءة المصنع إلى 100% وحماية خطوط الإنتاج من التوقف أو تعطل الماكينات!',
    subMessage: 'المصنع الموروث يعمل حالياً بكفاءة 25% فقط بسبب الإهمال السابق، وإجراء الصيانة الفورية سيعيد طاقته الإنتاجية بالكامل ويجهزه للإنتاج.',
    actionPrompt: 'اضغط على زر "صيانة المصنع" بالأسفل لرفع كفاءة الماكينات فوراً 🛠️',
    successMessage: '🎉 رائع جداً! تم صيانة معدات المصنع بنجاح واستعادة كفاءته الكاملة 100%!',
    explorationTip: 'خذ وقتك الآن لاستكشاف واجهة شركتك، تفقّد استهلاك الطاقة وتكاليف التشغيل اليومية، وعندما تنتهي اضغط "متابعة للمهمة التالية".',
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
    phaseBadge: 'المرحلة 2: الحماية المالية والالتزامات',
    title: 'سداد قسط البنك ودفع الرواتب',
    message: 'من هنا يمكنك دفع الرواتب والالتزامات وسداد الأقساط لحماية حساباتك وأصولك من التجميد البنكي أو الحجز القضائي!',
    subMessage: 'البنك يمنحك مهلة 7 أيام لسداد القسط الأول الموروث. الالتزام بالسداد يرفع تصنيفك الائتماني ويمنع تطبيق غرامات التأخير الصارمة.',
    actionPrompt: 'اضغط على زر "دفع الراتب" أو "سداد القسط" لتسوية الالتزام 💳',
    successMessage: '🎉 ممتاز! تم سداد الالتزام المالي بنجاح وحماية سمعتك الائتمانية لدى البنك!',
    explorationTip: 'استكشف قائمة الديون والأقساط المستقبلية وحالة الخزينة، وعندما تصبح جاهزاً اضغط متابعة لتوسيع أراضيك الاستثمارية.',
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
    phaseBadge: 'المرحلة 3: القاعدة العقارية والتوسع',
    title: 'شراء وتوسيع الأراضي الاستثمارية',
    message: 'من هنا يمكنك شراء وتوسيع الأراضي الاستثمارية لتشييد المصانع والمستودعات وتأسيس شركات جديدة ومضاعفة ثروتك العقارية!',
    subMessage: 'كل مصنع جديد يحتاج إلى قطعة أرض صناعية مرخصة لإقامته. الاستثمار العقاري هو الحصن الآمن لثروتك في فترات تقلبات السوق.',
    actionPrompt: 'اضغط على زر "فتح عرض البداية" أو شراء الأرض لتأمين قاعدتك العقارية 🏞️',
    successMessage: '🎉 مبروك! أصبحت مالكاً لأرض استثمارية جديدة تؤهلك لتأسيس منشآت ومصانع إضافية!',
    explorationTip: 'استكشف أنواع الأراضي المتاحة (صناعية، زراعية، وتجارية) وعروض الاستحواذ المباشرة، ثم اضغط متابعة لتشغيل خطوط الإنتاج.',
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
    phaseBadge: 'المرحلة 4: التصنيع وتدفق الأرباح',
    title: 'تشغيل خطوط الإنتاج والتصنيع',
    message: 'من هنا يمكنك شراء الخامات وتشغيل خطوط الإنتاج لتحويل المواد الخام إلى منتجات صناعية غذائية مربحة وبيعها بالأسواق الحرة!',
    subMessage: 'التصنيع يضاعف قيمة المواد الخام ويولد تدفقات نقدية مستمرة ترفع أرباحك الصافية يومياً وتزيد نقاط هيبتك الاقتصادية.',
    actionPrompt: 'اضغط على "تشغيل دفعة الإنتاج" لبدء دوران ماكينات المصنع 🏭',
    successMessage: '🎉 رائع! بدأت خطوط الإنتاج بالعمل الفعلي وتم جدول أول دفعة تصنيع بنجاح!',
    explorationTip: 'تفقّد تفاصيل الخامات ووحدات الطاقة المطلوبة وسعة المستودع، ثم اضغط متابعة لاستلام مكافآت المهام الأولى.',
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
    phaseBadge: 'المرحلة 5: الإنجازات وفتح المستويات',
    title: 'متابعة المهام واستلام المكافآت',
    message: 'من هنا تتابع مهام القصة والإنجازات اليومية وتستلم مكافآت الكاش والماس ونقاط الخبرة لفتح المستويات والأنظمة المتقدمة!',
    subMessage: 'إنجاز المهام هو أسرع طريق لرفع رتبتك الاقتصادية وفتح البورصة، المزادات، والتجارة الملاحية الدولية والذكاء الاصطناعي.',
    actionPrompt: 'اضغط على زر "استلام المكافأة" الآن لترقية مستواك 🎁',
    successMessage: '👑 تهانينا الحارة! أكملت الجولة التأسيسية لإمبراطورية الأعمال بنجاح وتسلّمت مكافأتك القيادية!',
    explorationTip: 'لقد أصبحت الآن مستثمراً متمكناً! يمكنك إدارة مصانعك، المشاركة في المزادات، ومنافسة كبار رجال الأعمال حول العالم.',
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
