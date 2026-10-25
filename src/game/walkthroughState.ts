import type { SectionId } from '../domain/navigation';
import type { SoundEffect } from './soundEffects';

export interface WalkthroughStep {
  id: string;
  sectionId: SectionId;
  targetSelector: string;
  title: string;
  message: string;
  subMessage?: string;
  actionPrompt: string;
  soundEffect: SoundEffect;
  category: 'store' | 'maintenance' | 'obligations' | 'lands' | 'production' | 'tasks';
}

export const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    id: 'buy_starter_offer',
    sectionId: 'store',
    targetSelector: '[data-guide-target="starter-offer-btn"]',
    title: 'شراء العرض المناسب لبداية قوية',
    message: 'اشتري هذا العرض، إنه مناسب جداً لبدء بناء إمبراطوريتك وتأمين بطاقات التسريع والسيولة الأولى!',
    subMessage: 'هذا العرض يوفر لك بطاقات إنجاز فوري ويوفر موارد حيوية لدعم خطوط إنتاجك من اليوم الأول.',
    actionPrompt: 'اضغط على زر شراء العرض المحدد الآن',
    soundEffect: 'cash',
    category: 'store',
  },
  {
    id: 'service_equipment',
    sectionId: 'production',
    targetSelector: '[data-guide-target="service-company-btn"]',
    title: 'صيانة المعدات والماكينات',
    message: 'من هنا يمكنك صيانة المعدات بشكل دوري لرفع كفاءة المصنع إلى 100% وحماية خطوط الإنتاج من التوقف أو تعطل الماكينات!',
    subMessage: 'المصنع الموروث يعمل حالياً بكفاءة 25% فقط بسبب الإهمال السابق، وإجراء الصيانة الفورية سيعيد طاقته الإنتاجية بالكامل.',
    actionPrompt: 'اضغط على زر "صيانة المصنع" لإصلاح الماكينات فوراً',
    soundEffect: 'factory',
    category: 'maintenance',
  },
  {
    id: 'pay_obligations',
    sectionId: 'obligations',
    targetSelector: '[data-guide-target="pay-obligation-btn"]',
    title: 'دفع الرواتب والالتزامات المالية',
    message: 'من هنا يمكنك دفع الرواتب والالتزامات وسداد الأقساط لحماية حساباتك وأصولك من التجميد البنكي أو الحجز القضائي!',
    subMessage: 'الالتزام بسداد رواتب العمال وأقساط التمويل يرفع تصنيفك الائتماني ويمنع تطبيق غرامات التأخير الصارمة.',
    actionPrompt: 'اضغط على زر "دفع الراتب" أو "سداد القسط" لتسوية الالتزام',
    soundEffect: 'loan',
    category: 'obligations',
  },
  {
    id: 'buy_land',
    sectionId: 'lands',
    targetSelector: '[data-guide-target="buy-land-btn"]',
    title: 'شراء وتوسيع الأراضي الاستثمارية',
    message: 'من هنا يمكنك شراء وتوسيع الأراضي الاستثمارية لتشييد المصانع والمستودعات ومضاعفة ثروتك العقارية!',
    subMessage: 'كل مصنع جديد يحتاج إلى قطعة أرض صناعية مرخصة لإقامته، والاستثمار العقاري هو الحصن الآمن لثروتك.',
    actionPrompt: 'اضغط على شراء الأرض لتأمين قاعدتك العقارية',
    soundEffect: 'click',
    category: 'lands',
  },
  {
    id: 'run_production',
    sectionId: 'production',
    targetSelector: '[data-guide-target="start-production-btn"]',
    title: 'تشغيل خطوط الإنتاج والتصنيع',
    message: 'من هنا يمكنك شراء الخامات وتشغيل خطوط الإنتاج لتحويل المواد الخام إلى منتجات صناعية مربحة وبيعها بالأسواق!',
    subMessage: 'التصنيع يضاعف قيمة المواد الخام ويولد تدفقات نقدية مستمرة ترفع أرباحك الصافية يومياً.',
    actionPrompt: 'اضغط على تشغيل دفعة الإنتاج للبدء في التصنيع',
    soundEffect: 'factory',
    category: 'production',
  },
  {
    id: 'claim_tasks',
    sectionId: 'tasks',
    targetSelector: '[data-guide-target="claim-task-btn"]',
    title: 'متابعة المهام واستلام المكافآت',
    message: 'من هنا تتابع مهام القصة والإنجازات اليومية وتستلم مكافآت الكاش والماس ونقاط الخبرة لفتح المستويات والأنظمة المتقدمة!',
    subMessage: 'إنجاز المهام هو أسرع طريق لرفع رتبتك الاقتصادية وفتح البورصة، المزادات، والتجارة الملاحية الدولية.',
    actionPrompt: 'اضغط على استلام المكافأة الآن',
    soundEffect: 'levelUp',
    category: 'tasks',
  },
];

const STORAGE_KEY = 'suly_mandatory_walkthrough_completed';

export function isWalkthroughCompleted(): boolean {
  if (typeof window === 'undefined') return true;
  return window.localStorage.getItem(STORAGE_KEY) === 'true';
}

export function setWalkthroughCompleted(completed: boolean): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, completed ? 'true' : 'false');
}

export function resetWalkthrough(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}
