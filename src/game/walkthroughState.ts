import type { SectionId } from '../domain/navigation';
import type { SoundEffect } from './soundEffects';
import type { PlayerProfile } from '../domain/player';
import type { CountryStoryQuest } from './countryScenarios';

export interface SubTargetResolution {
  selector: string;
  directiveLabel: string;
  subStepIndex: number; // 0 = nav, 1 = panel/tab, 2 = final action
}

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
  category: 'maintenance' | 'obligations' | 'lands' | 'inventory' | 'production' | 'contracts' | 'tasks' | 'store';
  isComplete: (profile: PlayerProfile) => boolean;
  getDiagnostic?: (profile: PlayerProfile) => string | null;
  resolveSubTarget?: (profile: PlayerProfile) => Array<{ selector: string; directiveLabel: string; subStepIndex: number }>;
}

/**
 * Finds the first visible element matching selector in the live DOM (width > 0 && height > 0),
 * preferring enabled buttons over disabled ones. Avoids hidden desktop sidebar elements on mobile.
 */
export function findVisibleElement(selector: string): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  const nodes = Array.from(document.querySelectorAll<HTMLElement>(selector));
  let fallbackVisible: HTMLElement | null = null;
  for (const el of nodes) {
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      if (!el.hasAttribute('disabled')) {
        return el;
      }
      if (!fallbackVisible) {
        fallbackVisible = el;
      }
    }
  }
  return fallbackVisible;
}

export const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    id: 'service_equipment',
    sectionId: 'companies',
    targetSelector: '[data-guide-target="service-company-btn"]',
    phaseBadge: 'المرحلة 1 من 6 · الصيانة والتأهيل',
    title: 'صيانة ماكينات المصنع الموروث',
    actionGoal: 'إعادة تأهيل المصنع الموروث ورفع الكفاءة التشغيلية من 25% إلى 100%',
    targetButtonLabel: 'صيانة المصنع ⚙️',
    clickInstruction: 'افتح لوحة شركاتك القائمة ثم اضغط بنفسك على زر «صيانة المصنع ⚙️» الموضح بالسهم الذهبي.',
    whyInstruction: 'ماكينات المصنع مهملة وتعمل بكفاءة 25% فقط؛ الصيانة ترفعها إلى 100% وتحمي جودة البضائع.',
    navSectionLabel: 'الشركات',
    checklist: [
      'الدخول إلى قسم «الشركات» من شريط التنقل أو لوحة القيادة',
      'فتح لوحة «شركاتك القائمة» لمعاينة كفاءة المصنع (25%)',
      'الضغط بنفسك على زر «صيانة المصنع ⚙️» لرفع الكفاءة إلى 100%',
    ],
    message: 'المصنع الموروث يحتاج صيانة فورية لرفع كفاءته من 25% إلى 100%.',
    subMessage: 'اتبع السهم الذهبي خطوة بخطوة واضغط بنفسك لإصلاح الماكينات.',
    actionPrompt: 'اضغط بنفسك على زر «صيانة المصنع ⚙️»',
    successMessage: 'ممتاز! تمت صيانة المصنع بنجاح وارتفعت كفاءة الماكينات إلى 100%!',
    explorationTip: 'أصبح خط الإنتاج جاهزاً فنياً. الخطوة التالية هي تسوية القسط الموروث في قسم الالتزامات.',
    soundEffect: 'factory',
    category: 'maintenance',
    isComplete: (profile: PlayerProfile) => {
      const company = profile.companies[0];
      return Boolean(company && (company.maintenanceCondition ?? 100) >= 90);
    },
    getDiagnostic: (profile: PlayerProfile) => {
      if (profile.companies.length === 0) {
        return 'لا توجد شركة مسجلة حالياً؛ انتقل لتأسيس شركتك الأولى من لوحة تأسيس شركة.';
      }
      const company = profile.companies[0];
      const cost = Math.max(5_000, Math.round((company.operatingCostPerDay ?? 0) * 0.4));
      if ((company.maintenanceCondition ?? 100) < 90 && profile.bankBalance < cost) {
        return `السيولة النقدية الحالية أقل من تكلفة الصيانة (${cost.toLocaleString('ar-EG')} $). بِع فائض المخزون أو استلم مكافآت المهام المتاحة لتوفير السيولة.`;
      }
      return null;
    },
    resolveSubTarget: () => [
      {
        selector: '[data-guide-target="service-company-btn"]',
        directiveLabel: 'اضغط بنفسك هنا: صيانة المصنع ⚙️',
        subStepIndex: 2,
      },
      {
        selector: '[data-guide-panel="companies-existing"]',
        directiveLabel: 'اضغط لفتح لوحة «شركاتك القائمة»',
        subStepIndex: 1,
      },
    ],
  },
  {
    id: 'pay_obligations',
    sectionId: 'obligations',
    targetSelector: '[data-guide-target="pay-obligation-btn"]',
    phaseBadge: 'المرحلة 2 من 6 · تسوية الالتزامات',
    title: 'سداد القرض الموروث وحماية الطاقة',
    actionGoal: 'تسوية القرض الطارئ الموروث (5,250 $) لإبراء ذمتك المالية',
    targetButtonLabel: 'سداد قسط طوعي',
    clickInstruction: 'افتح لوحة خريطة الالتزامات ثم اضغط بنفسك على «سداد قسط طوعي» لإغلاق المديونية.',
    whyInstruction: 'تأخر سداد الالتزامات يوقف إمداد الطاقة للمصانع؛ السداد المبكر ينظف سجلك الائتماني فوراً.',
    navSectionLabel: 'الالتزامات',
    checklist: [
      'الدخول إلى قسم «الالتزامات» من شريط التنقل',
      'فتح لوحة «خريطة الالتزامات والديون» ومراجعة القرض الموروث',
      'الضغط بنفسك على زر «سداد قسط طوعي» لتسوية الـ 5,250 $',
    ],
    message: 'سدّد القرض الموروث لحماية طاقة المصنع وتنظيف سجلك المالي.',
    subMessage: 'افتح خريطة الالتزامات واضغط بنفسك على زر السداد.',
    actionPrompt: 'اضغط بنفسك على «سداد قسط طوعي»',
    successMessage: 'رائع! تم سداد الالتزام الموروث وأصبح سجلك الائتماني نظيفاً بالكامل!',
    explorationTip: 'تخلصت الآن من عبء الدين الموروث. الخطوة التالية هي حيازة أرض استثمارية ثانية للتوسع.',
    soundEffect: 'loan',
    category: 'obligations',
    isComplete: (profile: PlayerProfile) => {
      const activeLoans = profile.banking?.loans?.filter((l) => l.status === 'active') ?? [];
      const loanPaidOrReduced =
        activeLoans.length === 0 || activeLoans.some((l) => l.remainingBalance < l.totalRepayment);
      return loanPaidOrReduced && profile.payables === 0;
    },
    getDiagnostic: (profile: PlayerProfile) => {
      const activeLoan = profile.banking?.loans?.find((l) => l.status === 'active');
      if (activeLoan && profile.bankBalance < activeLoan.installmentAmount) {
        return `السيولة النقدية الحالية لا تكفي لسداد القسط (${activeLoan.installmentAmount.toLocaleString('ar-EG')} $). شغّل الإنتاج وبِع السلع لتوفير المبلغ.`;
      }
      return null;
    },
    resolveSubTarget: () => [
      {
        selector: '[data-guide-target="pay-obligation-btn"]',
        directiveLabel: 'اضغط بنفسك هنا: سداد قسط طوعي',
        subStepIndex: 2,
      },
      {
        selector: '[data-guide-panel="obligations-list"]',
        directiveLabel: 'اضغط لفتح لوحة «خريطة الالتزامات والديون»',
        subStepIndex: 1,
      },
    ],
  },
  {
    id: 'buy_land',
    sectionId: 'lands',
    targetSelector: '[data-guide-target="buy-land-btn"]',
    phaseBadge: 'المرحلة 3 من 6 · التوسع العقاري',
    title: 'شراء أرض التوسع الاستثمارية',
    actionGoal: 'حيازة قطعة أرض ثانية بسعر مدعوم لتكون قاعدة شركتك القادمة',
    targetButtonLabel: 'شراء الأرض نقدًا',
    clickInstruction: 'افتح تبويب العروض المباشرة ثم لوحة عرض البداية واضغط «شراء الأرض نقدًا».',
    whyInstruction: 'كل شركة جديدة تتطلب أرضاً مملوكة غير مشغولة، وتحتاج الأرض يوماً لنقل الملكية قبل البناء عليها.',
    navSectionLabel: 'الأراضي',
    checklist: [
      'الدخول إلى قسم «الأراضي»',
      'فتح تبويب «العروض المباشرة» ولوحة «عرض البداية»',
      'الضغط بنفسك على «شراء الأرض نقدًا» لإتمام نقل الملكية',
    ],
    message: 'اشترِ أرض البداية الاستثمارية لتوسيع أصول إمبراطوريتك العقارية.',
    subMessage: 'انتقل لتبويب العروض المباشرة واضغط على شراء الأرض نقدًا.',
    actionPrompt: 'اضغط بنفسك لشراء قطعة الأرض الاستثمارية',
    successMessage: 'مبارك! أصبحت تمتلك قطعتي أرض مسجلتين باسم مجموعتك!',
    explorationTip: 'والآن قبل تشغيل المصنع، سنشتري الحبوب ومواد التغليف من قسم المواد الخام والمخازن.',
    soundEffect: 'click',
    category: 'lands',
    isComplete: (profile: PlayerProfile) => {
      return (profile.lands?.length ?? 0) >= 2;
    },
    getDiagnostic: (profile: PlayerProfile) => {
      if ((profile.lands?.length ?? 0) < 2 && profile.bankBalance < 3_600) {
        return 'رصيدك النقدي أقل من 3,600 $ المطلوبة لشراء أرض البداية الاستثمارية.';
      }
      return null;
    },
    resolveSubTarget: () => [
      {
        selector: '[data-guide-target="buy-land-btn"]',
        directiveLabel: 'اضغط بنفسك هنا: شراء الأرض نقدًا',
        subStepIndex: 2,
      },
      {
        selector: '[data-guide-panel="lands-starter-offer"]',
        directiveLabel: 'اضغط لفتح لوحة «عرض البداية»',
        subStepIndex: 1,
      },
      {
        selector: '[data-guide-panel="lands-direct-offers"]',
        directiveLabel: 'اضغط لفتح لوحة «أراضٍ معروضة مباشرة»',
        subStepIndex: 1,
      },
      {
        selector: '[data-guide-target="open-starter-land-btn"]',
        directiveLabel: 'اضغط على «فتح عرض البداية»',
        subStepIndex: 1,
      },
      {
        selector: '[data-guide-tab="lands-offers-tab"]',
        directiveLabel: 'اضغط لفتح تبويب «العروض المباشرة»',
        subStepIndex: 1,
      },
    ],
  },
  {
    id: 'buy_raw_materials',
    sectionId: 'inventory',
    targetSelector: '[data-guide-target="buy-material-grain"]',
    phaseBadge: 'المرحلة 4 من 6 · تأمين المواد الخام',
    title: 'شراء الحبوب ومواد التغليف للمصنع',
    actionGoal: 'توفير 4 وحدات حبوب زراعية + 1 وحدة مواد تغليف لتشغيل خط الأغذية',
    targetButtonLabel: 'قبول العرض نقدًا',
    clickInstruction: 'افتح لوحة السوق العالمي في المخازن واشترِ الحبوب الزراعية ثم مواد التغليف.',
    whyInstruction: 'خط إنتاج الأغذية يحتاج إلى الحبوب الزراعية ومواد التغليف في المخزن قبل بدء التصنيع.',
    navSectionLabel: 'المخازن والخامات',
    checklist: [
      'الدخول إلى قسم «المواد الخام والمخازن»',
      'فتح لوحة «السوق العالمي · عروض التجار»',
      'شراء «حبوب زراعية» (4+ كجم) ثم «مواد تغليف» (1+ وحدة)',
    ],
    message: 'أمّن مدخلات التصنيع (الحبوب الزراعية ومواد التغليف) من عروض التجار.',
    subMessage: 'اتبع السهم الذهبي لشراء الحبوب أولاً ثم التغليف.',
    actionPrompt: 'اشترِ الخامات المطلوبة لخط الإنتاج',
    successMessage: 'أحسنت! أصبحت الحبوب ومواد التغليف متوفرة في مخزنك وجاهزة للتصنيع!',
    explorationTip: 'المدخلات جاهزة الآن في المستودع. لنتوجه فوراً إلى قسم الإنتاج والمصانع لتشغيل أول دفعة!',
    soundEffect: 'click',
    category: 'inventory',
    isComplete: (profile: PlayerProfile) => {
      if ((profile.productionOrders?.length ?? 0) > 0) return true;
      const grain = profile.inventory.find((i) => i.materialOrProductId === 'grain')?.quantity ?? 0;
      const packaging = profile.inventory.find((i) => i.materialOrProductId === 'packaging')?.quantity ?? 0;
      return grain >= 4 && packaging >= 1;
    },
    getDiagnostic: (profile: PlayerProfile) => {
      if (profile.bankBalance < 80) {
        return 'رصيدك النقدي منخفض جداً لشراء المواد الخام؛ اختر كمية صغيرة (4 حبوب + 1 تغليف) لتوفير السيولة.';
      }
      return null;
    },
    resolveSubTarget: (profile: PlayerProfile) => {
      const grain = profile.inventory.find((i) => i.materialOrProductId === 'grain')?.quantity ?? 0;
      const needGrain = grain < 4;
      return [
        {
          selector: needGrain
            ? '[data-guide-target="buy-material-grain"]'
            : '[data-guide-target="buy-material-packaging"]',
          directiveLabel: needGrain
            ? 'اضغط لشراء «الحبوب الزراعية» نقدًا (الخطوة 1/2)'
            : 'اضغط لشراء «مواد التغليف» نقدًا (الخطوة 2/2)',
          subStepIndex: 2,
        },
        {
          selector: '[data-guide-panel="inventory-global-market"]',
          directiveLabel: 'اضغط لفتح لوحة «السوق العالمي · عروض التجار»',
          subStepIndex: 1,
        },
      ];
    },
  },
  {
    id: 'run_production',
    sectionId: 'production',
    targetSelector: '[data-guide-target="start-production-btn"]',
    phaseBadge: 'المرحلة 5 من 6 · تشغيل المصنع',
    title: 'تشغيل خط الإنتاج وتصنيع أول شحنة',
    actionGoal: 'إطلاق أول أمر إنتاج فعلي لتحويل الخامات إلى عبوات غذائية',
    targetButtonLabel: 'بدء أمر الإنتاج',
    clickInstruction: 'افتح لوحة خطوط الإنتاج واضغط بنفسك على زر «بدء أمر الإنتاج».',
    whyInstruction: 'التصنيع يحول المواد الخام إلى منتجات نهائية تباع بأضعاف تكلفتها في السوق والعقود.',
    navSectionLabel: 'الإنتاج والمصانع',
    checklist: [
      'الدخول إلى قسم «الإنتاج والمصانع»',
      'فتح لوحة «خطوط الإنتاج» ومراجعة الدفعة والطاقة',
      'الضغط بنفسك على «بدء أمر الإنتاج» لتشغيل الماكينات',
    ],
    message: 'الخامات والطاقة جاهزة! أطلق أول أمر تشغيل لتصنيع العبوات الغذائية.',
    subMessage: 'افتح خطوط الإنتاج واضغط بنفسك على بدء أمر الإنتاج.',
    actionPrompt: 'اضغط بنفسك على «بدء أمر الإنتاج»',
    successMessage: 'ممتاز! دارت ماكينات المصنع وتم تسجيل أول أمر إنتاج رسمي!',
    explorationTip: 'سيكتمل تصنيع البضاعة مع ترحيل اليوم. الخطوة الأخيرة الآن هي استلام مكافأة الإنجاز من المهام!',
    soundEffect: 'factory',
    category: 'production',
    isComplete: (profile: PlayerProfile) => {
      return (profile.productionOrders?.length ?? 0) > 0;
    },
    getDiagnostic: (profile: PlayerProfile) => {
      const company = profile.companies[0];
      if (!company) return 'تحتاج إلى شركة عاملة أولاً لتشغيل خط الإنتاج.';
      if ((company.maintenanceCondition ?? 100) < 25) {
        return 'كفاءة المصنع أقل من 25%؛ قم بصيانة المصنع من قسم الشركات أولاً.';
      }
      if ((company.energyUnits ?? 0) < 6) {
        return 'الطاقة المتاحة في المصنع أقل من 6 وحدات؛ خفّض عدد الدفعات إلى 1 أو انتظر تجدد الطاقة.';
      }
      return null;
    },
    resolveSubTarget: () => [
      {
        selector: '[data-guide-target="start-production-btn"]:not([disabled])',
        directiveLabel: 'اضغط بنفسك هنا: بدء أمر الإنتاج',
        subStepIndex: 2,
      },
      {
        selector: '[data-guide-target="auto-supply-produce-btn"]:not([disabled])',
        directiveLabel: 'اضغط هنا لشراء النواقص وبدء الإنتاج فوراً',
        subStepIndex: 2,
      },
      {
        selector: '[data-guide-target="start-production-btn"]',
        directiveLabel: 'راجع متطلبات بدء أمر الإنتاج هنا',
        subStepIndex: 2,
      },
      {
        selector: '[data-guide-panel="production-lines"]',
        directiveLabel: 'اضغط لفتح لوحة «خطوط الإنتاج»',
        subStepIndex: 1,
      },
    ],
  },
  {
    id: 'claim_tasks',
    sectionId: 'tasks',
    targetSelector: '[data-guide-target="claim-task-btn"]',
    phaseBadge: 'المرحلة 6 من 6 · حصاد الإنجاز',
    title: 'استلام مكافأة الإنجاز ورفع المستوى',
    actionGoal: 'تحصيل مكافأة المهام المكتملة لرفع خبرتك وفتح المراحل القادمة',
    targetButtonLabel: 'استلام المكافأة',
    clickInstruction: 'افتح لوحة المهام والإنجازات واضغط بنفسك على «استلام المكافأة».',
    whyInstruction: 'تحصيل المهام يمنحك سيولة إضافية ونقاط خبرة ترفع مستواك وتفتح العقود والبنك تدريجياً.',
    navSectionLabel: 'المهام اليومية',
    checklist: [
      'الدخول إلى قسم «المهام»',
      'فتح لوحة «المهام والإنجازات» في أسفل القسم',
      'الضغط بنفسك على زر «استلام المكافأة» الفعّال',
    ],
    message: 'أنجزت خطوات التأسيس الميدانية بيدك! استلم مكافأتك المستحقة الآن.',
    subMessage: 'افتح لوحة المهام والإنجازات واضغط على استلام المكافأة.',
    actionPrompt: 'اضغط بنفسك على «استلام المكافأة»',
    successMessage: 'تهانينا! استلمت مكافأتك بنجاح وأتقنت الدورة التشغيلية الكاملة لإمبراطوريتك!',
    explorationTip: 'أنت الآن جاهز لإكمال بيع أول شحنة بعد ترحيل اليوم، ثم توقيع أول عقد لفتح البنك!',
    soundEffect: 'levelUp',
    category: 'tasks',
    isComplete: (profile: PlayerProfile) => {
      return (profile.completedTaskIds?.length ?? 0) > 0;
    },
    resolveSubTarget: () => [
      {
        selector: '[data-guide-target="claim-task-btn"]',
        directiveLabel: 'اضغط بنفسك هنا: استلام المكافأة',
        subStepIndex: 2,
      },
      {
        selector: '[data-guide-panel="tasks-achievements"]',
        directiveLabel: 'اضغط لفتح لوحة «المهام والإنجازات»',
        subStepIndex: 1,
      },
    ],
  },
];

export const QUEST_SPECIFIC_WALKTHROUGH_STEPS: Record<'sell' | 'contract', WalkthroughStep> = {
  sell: {
    id: 'sell_product',
    sectionId: 'inventory',
    targetSelector: '[data-guide-target="sell-product-btn"]',
    phaseBadge: 'إرشاد المهمة 5 · البيع والتدفق النقدي',
    title: 'بيع المنتجات النهائية في السوق المحلي',
    actionGoal: 'تحويل المنتجات المصنّعة في المخزن إلى إيراد نقدي فعلي',
    targetButtonLabel: 'بيع بسعر السوق',
    clickInstruction: 'افتح لوحة المنتجات الجاهزة للبيع في المخازن واضغط «بيع بسعر السوق».',
    whyInstruction: 'إتمام أول عملية بيع بعد التصنيع يحقق ربحاً تشغيلياً ويفتح قسم العقود والعملاء.',
    navSectionLabel: 'المخازن والخامات',
    checklist: [
      'الدخول إلى قسم «المواد الخام والمخازن»',
      'فتح لوحة «المنتجات الجاهزة للبيع»',
      'تحديد الكمية المناسبة للطلب والضغط على «بيع بسعر السوق»',
    ],
    message: 'بِع المنتجات المكتملة في مخزنك لتحقيق أول إيراد تجاري وفتح العقود.',
    subMessage: 'افتح لوحة المنتجات الجاهزة للبيع واضغط بيع بسعر السوق.',
    actionPrompt: 'اضغط بنفسك على «بيع بسعر السوق»',
    successMessage: 'أحسنت! تمت عملية البيع بنجاح ودخلت العوائد إلى خزينتك!',
    explorationTip: 'بإتمام الإنتاج والبيع معاً، يُفتح أمامك قسم العقود والعملاء!',
    soundEffect: 'cash',
    category: 'inventory',
    isComplete: (profile: PlayerProfile) => (profile.sales?.length ?? 0) > 0,
    getDiagnostic: (profile: PlayerProfile) => {
      const hasProduct = profile.inventory.some(
        (lot) => !['grain', 'packaging', 'steel', 'cement', 'fuel', 'chemicals', 'silicon', 'copper'].includes(lot.materialOrProductId) && lot.quantity > 0,
      );
      if (!hasProduct) {
        const activeOrder = profile.productionOrders.find((o) => o.status === 'active');
        if (activeOrder) {
          return `أمر إنتاج «${activeOrder.productName}» قيد التصنيع حالياً وسيكتمل في اليوم ${activeOrder.completesOnDay}. انتظر ترحيل اليوم ثم عد هنا للبيع.`;
        }
        return 'لا توجد منتجات جاهزة للبيع في المخزن حالياً؛ شغّل دفعة إنتاج من قسم المصانع والإنتاج أولاً.';
      }
      return null;
    },
    resolveSubTarget: () => [
      {
        selector: '[data-guide-target="sell-product-btn"]',
        directiveLabel: 'اضغط بنفسك هنا: بيع بسعر السوق',
        subStepIndex: 2,
      },
      {
        selector: '[data-guide-panel="inventory-sales"]',
        directiveLabel: 'اضغط لفتح لوحة «المنتجات الجاهزة للبيع»',
        subStepIndex: 1,
      },
    ],
  },
  contract: {
    id: 'deliver_contract',
    sectionId: 'contracts',
    targetSelector: '[data-guide-target="deliver-contract-btn"]',
    phaseBadge: 'إرشاد المهمة 6 · العقود ورفع الحظر البنكي',
    title: 'قبول وتسليم أول عقد تجاري رسمي',
    actionGoal: 'تسليم طلبية عميل بالموعد لرفع التجميد عن قسم البنك والتمويل',
    targetButtonLabel: 'قبول / تسليم العقد',
    clickInstruction: 'اقبل عقداً مناسباً من مركز العملاء ثم سلّم الكمية المطلوبة من لوحة العقود المقبولة.',
    whyInstruction: 'تسليم أول عقد يرفع سمعتك التجارية ويفتح قسم البنك والتمويل رسمياً.',
    navSectionLabel: 'العقود والعملاء',
    checklist: [
      'الدخول إلى قسم «العقود والعملاء»',
      'فتح «مركز العملاء والعقود» وقبول عقد مناسب لقدرتك الإنتاجية',
      'توفير البضاعة في المخزن ثم فتح «العقود المقبولة» والضغط على «تسليم العقد الآن»',
    ],
    message: 'اقبل عقداً تجارياً وسلّم البضاعة المطلوبة لرفع الحظر المصرفي.',
    subMessage: 'اتبع السهم الذهبي لقبول العقد أولاً ثم تسليمه فور توفر المخزون.',
    actionPrompt: 'نفّذ خطوة العقد الموضحة بالسهم الذهبي',
    successMessage: 'إنجاز استراتيجي! تم تسليم العقد الأول ورفع التجميد عن البنك والتمويل!',
    explorationTip: 'أصبح قسم البنك مفتوحاً الآن للودائع والتسهيلات الائتمانية.',
    soundEffect: 'levelUp',
    category: 'contracts',
    isComplete: (profile: PlayerProfile) => profile.contracts.some((c) => c.status === 'completed'),
    getDiagnostic: (profile: PlayerProfile) => {
      const activeContract = profile.contracts.find((c) => c.status === 'active');
      if (activeContract) {
        const stock = profile.inventory.find((i) => i.materialOrProductId === activeContract.productId)?.quantity ?? 0;
        if (stock < activeContract.quantity) {
          return `العقد النشط يتطلب ${activeContract.quantity} وحدة من «${activeContract.productName}» (المتوفر حالياً في المخزن: ${stock}). صنّع الكمية المتبقية ثم عد لتسليم العقد.`;
        }
      }
      return null;
    },
    resolveSubTarget: (profile: PlayerProfile) => {
      const hasActive = profile.contracts.some((c) => c.status === 'active');
      if (!hasActive) {
        return [
          {
            selector: '[data-guide-target="accept-contract-btn"]:not([disabled])',
            directiveLabel: 'اضغط لقبول عقد مناسب لإنتاجك (الخطوة 1/2)',
            subStepIndex: 2,
          },
          {
            selector: '[data-guide-panel="contracts-offers"]',
            directiveLabel: 'اضغط لفتح لوحة «مركز العملاء والعقود»',
            subStepIndex: 1,
          },
        ];
      }
      return [
        {
          selector: '[data-guide-target="deliver-contract-btn"]',
          directiveLabel: 'اضغط بنفسك هنا: تسليم العقد الآن (الخطوة 2/2)',
          subStepIndex: 2,
        },
        {
          selector: '[data-guide-panel="contracts-active"]',
          directiveLabel: 'اضغط لفتح لوحة «العقود المقبولة»',
          subStepIndex: 1,
        },
      ];
    },
  },
};

export function resolveActiveWalkthroughTarget(
  step: WalkthroughStep,
  profile: PlayerProfile,
  currentSection: SectionId,
): { element: HTMLElement | null; directiveLabel: string; subStepIndex: number } {
  if (currentSection !== step.sectionId) {
    const directNav = findVisibleElement(`[data-guide-nav="${step.sectionId}"]`);
    if (directNav) {
      return {
        element: directNav,
        directiveLabel: `اضغط للدخول إلى قسم «${step.navSectionLabel}»`,
        subStepIndex: 0,
      };
    }
    // Mobile fallback: if inside another section where target nav pill isn't in current HubSubNav, point to Home or hub sibling
    const homeNav = findVisibleElement('[data-guide-nav="home"]');
    if (homeNav) {
      return {
        element: homeNav,
        directiveLabel: `ارجع للرئيسية للانتقال إلى «${step.navSectionLabel}»`,
        subStepIndex: 0,
      };
    }
    return {
      element: null,
      directiveLabel: `انتقل إلى قسم «${step.navSectionLabel}»`,
      subStepIndex: 0,
    };
  }

  const candidates = step.resolveSubTarget
    ? step.resolveSubTarget(profile)
    : [{ selector: step.targetSelector, directiveLabel: `اضغط بنفسك هنا: ${step.targetButtonLabel}`, subStepIndex: 2 }];

  for (const candidate of candidates) {
    const el = findVisibleElement(candidate.selector);
    if (el) {
      return {
        element: el,
        directiveLabel: candidate.directiveLabel,
        subStepIndex: candidate.subStepIndex,
      };
    }
  }

  return {
    element: null,
    directiveLabel: `اضغط بنفسك هنا: ${step.targetButtonLabel}`,
    subStepIndex: 1,
  };
}

export function getFirstIncompleteWalkthroughIndex(profile: PlayerProfile): number {
  const idx = WALKTHROUGH_STEPS.findIndex((step) => !step.isComplete(profile));
  return idx >= 0 ? idx : 0;
}

export function resolveQuestWalkthroughTarget(
  quest: CountryStoryQuest,
  profile: PlayerProfile,
): { mode: 'core'; stepIndex: number } | { mode: 'quest'; step: WalkthroughStep } {
  if (quest.stepNumber === 1) return { mode: 'core', stepIndex: 0 };
  if (quest.stepNumber === 2) return { mode: 'core', stepIndex: 1 };
  if (quest.stepNumber === 3) return { mode: 'core', stepIndex: 2 };
  if (quest.stepNumber === 4) {
    const needsRaw = !WALKTHROUGH_STEPS[3].isComplete(profile);
    return { mode: 'core', stepIndex: needsRaw ? 3 : 4 };
  }
  if (quest.stepNumber === 5) {
    return { mode: 'quest', step: QUEST_SPECIFIC_WALKTHROUGH_STEPS.sell };
  }
  return { mode: 'quest', step: QUEST_SPECIFIC_WALKTHROUGH_STEPS.contract };
}

const STORAGE_KEY = 'suly_mandatory_walkthrough_completed';
const STEP_INDEX_KEY = 'suly_walkthrough_current_step_index';

export function isWalkthroughCompleted(profile?: PlayerProfile | null): boolean {
  if (profile?.onboarding) {
    if (profile.onboarding.walkthroughCompleted || profile.onboarding.walkthroughSkipped) {
      return true;
    }
    return false;
  }
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

export function getSavedWalkthroughStepIndex(profile?: PlayerProfile | null): number {
  if (profile?.onboarding?.walkthroughStepId) {
    const byId = WALKTHROUGH_STEPS.findIndex((s) => s.id === profile.onboarding.walkthroughStepId);
    if (byId >= 0) return byId;
  }
  if (profile) {
    return getFirstIncompleteWalkthroughIndex(profile);
  }
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
