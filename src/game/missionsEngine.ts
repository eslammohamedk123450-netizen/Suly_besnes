import type { SectionId } from '../domain/navigation';
import type { PlayerProfile } from '../domain/player';
import type { CountryId } from '../domain/countries';
import { isSectionUnlocked } from './onboarding';
import { getLeadAdvisor, getFinanceAdvisor, getRivalCharacter } from './campaignScenario';

export interface MissionBriefing {
  storyReason: string;
  targetGoal: string;
  practicalSteps: string[];
  costsAndRisks: string;
  successCriteria: string;
  rewardsSummary: string;
}

export interface GameMission {
  id: string;
  countryId: CountryId | 'all';
  chapter: number;
  title: string;
  description: string;
  requiredSection: SectionId;
  requiredLevel: number;
  prerequisites: string[];
  practicalSteps: string[];
  briefing: MissionBriefing;
  rewards: {
    money: number;
    diamonds: number;
    goldGrams: number;
    experience: number;
    reputation?: number;
  };
  isCompleted: (profile: PlayerProfile) => boolean;
  successMessage: string;
  hint: string;
}

export const CENTRAL_MISSIONS_CATALOG: GameMission[] = [
  // 1. فحص المشروع الموروث
  {
    id: 'mission-inspect-factory',
    countryId: 'all',
    chapter: 1,
    title: 'فحص المشروع والتعرف على الأرصدة',
    description: 'ادخل إلى قسم الشركات، وعاين حالة المصنع الموروث والسيولة النقدية المتوفرة بالخزينة.',
    requiredSection: 'companies',
    requiredLevel: 1,
    prerequisites: [],
    practicalSteps: [
      'افتح قسم «الشركات» من القائمة الرئيسية.',
      'عاين المصنع الموروث واقرأ كفاءته المتدنية (٢٥٪).',
      'تأكد من رصيد السيولة النقدية الحرة المتاحة للتشغيل.',
    ],
    briefing: {
      storyReason: 'قبل البدء في أي إنفاق أو تشغيل، يجب على المستثمر الناجح فحص موقعه بدقة ومعرفة حجم السيولة وكفاءة الماكينات.',
      targetGoal: 'معاينة حالة المصنع الموروث والاطلاع على تفاصيل حالته التشغيلية.',
      practicalSteps: ['فتح قسم الشركات', 'فحص كفاءة المصنع الموروث', 'الاطلاع على السيولة المبدئية'],
      costsAndRisks: 'لا توجد تكاليف؛ مجرد جولة فحص ميداني.',
      successCriteria: 'وجود مصنع مسجل باسمك ومعاينة حالته.',
      rewardsSummary: '٥,٠٠٠ $ + ١٠ ماسات + ٥٠ نقطة خبرة',
    },
    rewards: { money: 5_000, diamonds: 10, goldGrams: 1, experience: 50, reputation: 2 },
    isCompleted: (profile) => profile.companies.length >= 1,
    successMessage: 'ممتاز! تم فحص المشروع الموروث وتحديد نقاط الضعف الأساسية.',
    hint: 'ادخل إلى قسم الشركات لمعاينة مصنعك الموروث.',
  },

  // 2. صيانة الماكينات وإعادة التأهيل
  {
    id: 'mission-repair-factory',
    countryId: 'all',
    chapter: 2,
    title: 'الصيانة الميكانيكية الشاملة',
    description: 'أصلح ماكينات المصنع المتهالكة بنفسك لرفع الكفاءة التشغيلية إلى ٩٠٪ فما فوق.',
    requiredSection: 'companies',
    requiredLevel: 1,
    prerequisites: ['mission-inspect-factory'],
    practicalSteps: [
      'افتح قسم «الشركات».',
      'اختر المصنع الموروث المتعثر.',
      'اضغط بنفسك على زر «صيانة المصنع ⚙️».',
      'تأكد من ارتفاع كفاءة الماكينات إلى ١٠٠٪.',
    ],
    briefing: {
      storyReason: 'ماكينات المصنع مهملة وتعمل بربع طاقتها؛ تشغيل الإنتاج في هذه الحالة يسبب هدر المواد وتلف خطوط الإنتاج.',
      targetGoal: 'رفع كفاءة المصنع إلى ٩٠٪ فما فوق عبر الصيانة الميدانية.',
      practicalSteps: ['الذهاب للمصنع', 'الضغط على زر الصيانة', 'مراجعة التكلفة والخصم', 'التأكد من الكفاءة الخضراء'],
      costsAndRisks: 'تكلفة الصيانة اليدوية رمزية وتخصم من الكاش المتاح.',
      successCriteria: 'كفاءة المصنع maintenanceCondition تصل ٩٠٪ أو أعلى.',
      rewardsSummary: '١٠,٠٠٠ $ + ٢٠ ماسة + ٧٥ نقطة خبرة',
    },
    rewards: { money: 10_000, diamonds: 20, goldGrams: 2, experience: 75, reputation: 5 },
    isCompleted: (profile) => {
      const company = profile.companies[0];
      return Boolean(company && (company.maintenanceCondition ?? 100) >= 90);
    },
    successMessage: 'رائع جداً! تم إصلاح الماكينات بنجاح وأصبح المصنع بكامل كفاءته الإنتاجية.',
    hint: 'اضغط على زر صيانة المصنع في قسم الشركات لرفع كفاءة الماكينات.',
  },

  // 3. تسوية الالتزام المالي الأول
  {
    id: 'mission-pay-obligation',
    countryId: 'all',
    chapter: 2,
    title: 'تسوية الالتزام وحماية الحسابات',
    description: 'سدد أول التزام مالي أو قسط بنكي لحماية سجلك الائتماني من الحجز القضائي.',
    requiredSection: 'obligations',
    requiredLevel: 1,
    prerequisites: ['mission-repair-factory'],
    practicalSteps: [
      'افتح قسم «الالتزامات والرواتب».',
      'راجع جدول الأقساط وفترة السماح الممنوحة لك (٧ أيام).',
      'اضغط بنفسك على زر «سداد قسط طوعي» لإبراء ذمتك المالية.',
    ],
    briefing: {
      storyReason: 'تراكم الديون القديمة كان سبب انهيار العائلة السابق؛ تسديد أول قسط طوعي يثبت للجهات المالية أنك شريك موثوق.',
      targetGoal: 'سداد قسط القرض أو خفض الالتزامات المستحقة.',
      practicalSteps: ['فتح قسم الالتزامات', 'مراجعة الاستحقاق', 'الضغط على زر السداد'],
      costsAndRisks: 'خصم قيمة القسط المستحق من السيولة النقدية.',
      successCriteria: 'سداد القسط وخلو الذمة من الالتزامات المتأخرة.',
      rewardsSummary: '١٥,٠٠٠ $ + ٢٥ ماسة + ٨٠ نقطة خبرة',
    },
    rewards: { money: 15_000, diamonds: 25, goldGrams: 2, experience: 80, reputation: 8 },
    isCompleted: (profile) => {
      const remainingLoans = profile.banking?.loans?.filter((l) => l.status === 'active') ?? [];
      return profile.payables === 0 || remainingLoans.length === 0;
    },
    successMessage: 'ممتاز! تم سداد الالتزام بنجاح وأصبح مصنعك محمياً تماماً من أي إجراءات قضائية.',
    hint: 'توجه إلى قسم الالتزامات وسدد القسط المستحق طوعاً.',
  },

  // 4. تأمين أرض استثمارية إضافية
  {
    id: 'mission-buy-starter-land',
    countryId: 'all',
    chapter: 2,
    title: 'تأمين أول أرض استثمارية جديدة',
    description: 'اشترِ قطعة أرض استثمارية لتكون قاعدة لتأسيس مصانع وشركات إضافية في المستقبل.',
    requiredSection: 'lands',
    requiredLevel: 1,
    prerequisites: ['mission-pay-obligation'],
    practicalSteps: [
      'افتح قسم «الأراضي».',
      'عاين قطعة الأرض المخصصة للتوسع.',
      'اضغط بنفسك على «شراء الأرض نقدًا» لإتمام نقل الملكية.',
    ],
    briefing: {
      storyReason: 'لا يمكن بناء مصنع ثانٍ دون أرض مرخصة؛ الأراضي هي الأصل الثابت الأكثر أماناً ضد تقلبات الأسواق.',
      targetGoal: 'امتلاك قطعتي أرض استثمارية على الأقل.',
      practicalSteps: ['فتح قسم الأراضي', 'اختيار الأرض', 'تأكيد الشراء نقدًا'],
      costsAndRisks: 'سعر شراء الأرض يخصم من الكاش؛ احرص على إبقاء سيولة للتشغيل.',
      successCriteria: 'امتلاك قطعتي أرض (profile.lands.length >= 2).',
      rewardsSummary: '٢٠,٠٠٠ $ + ٣٠ ماسة + ١٠٠ نقطة خبرة',
    },
    rewards: { money: 20_000, diamonds: 30, goldGrams: 3, experience: 100, reputation: 10 },
    isCompleted: (profile) => profile.lands.length >= 2,
    successMessage: 'مبروك! أصبحت مالكاً لأرض استثمارية جديدة تؤهلك لتأسيس شركتك الثانية.',
    hint: 'توجه إلى قسم الأراضي واشترِ قطعة أرض مرخصة.',
  },

  // 5. تشغيل أول خط إنتاج
  {
    id: 'mission-produce-first-batch',
    countryId: 'all',
    chapter: 3,
    title: 'تشغيل خط الإنتاج وتصنيع السلع',
    description: 'شغّل دفعة تصنيع في مصنعك لتحويل الخامات إلى سلع غذائية جاهزة للبيع.',
    requiredSection: 'production',
    requiredLevel: 2,
    prerequisites: ['mission-buy-starter-land'],
    practicalSteps: [
      'افتح قسم «الإنتاج».',
      'تأكد من توفر المواد الخام والطاقة الكافية.',
      'اضغط بنفسك على «تشغيل خط الإنتاج».',
      'انتظر اكتمال دورة التصنيع واستلام السلع في المستودع.',
    ],
    briefing: {
      storyReason: 'المصانع الحقيقية لا تجني المال من الوقوف صامتة؛ دوران الماكينات هو مصدر القيمة المضافة الحقيقية.',
      targetGoal: 'إطلاق وإنجاز أمر إنتاج واحد على الأقل.',
      practicalSteps: ['فتح قسم الإنتاج', 'اختيار وصفة المنتجات', 'بدء خط الإنتاج', 'استلام المنتجات بالمخزن'],
      costsAndRisks: 'استهلاك المواد الخام ووحدات الطاقة.',
      successCriteria: 'وجود أمر إنتاج مكتمل في سجلات المصنع.',
      rewardsSummary: '٢٥,٠٠٠ $ + ٤٠ ماسة + ١٢٠ نقطة خبرة',
    },
    rewards: { money: 25_000, diamonds: 40, goldGrams: 4, experience: 120, reputation: 10 },
    isCompleted: (profile) => profile.productionOrders.some((order) => order.status === 'completed'),
    successMessage: 'أحسنت صنعاً! دارت الماكينات ووصلت أول دفعة سلع مصنعة إلى مستودعك.',
    hint: 'ادخل إلى قسم الإنتاج واضغط زر تشغيل خط الإنتاج.',
  },

  // 6. أول صفقة بيع في السوق
  {
    id: 'mission-first-market-sale',
    countryId: 'all',
    chapter: 3,
    title: 'طرح البضائع بالسوق وتحقيق أول ربح',
    description: 'بع جزءاً من السلع المصنعة في السوق لجني الكاش وتحقيق أول تدفق نقدي تجاري.',
    requiredSection: 'inventory',
    requiredLevel: 2,
    prerequisites: ['mission-produce-first-batch'],
    practicalSteps: [
      'افتح قسم «المستودع والمخازن» أو لوحة العمليات السريعة.',
      'اختر السلعة الجاهزة للبيع.',
      'اضغط على «بيع في السوق» أو «طرح بالسوق».',
      'تأكد من دخول العائد النقدي إلى رصيدك.',
    ],
    briefing: {
      storyReason: 'السلع المخزنة تمثل سيولة مجمدة؛ البيع في الوقت المناسب بالسعر المناسب يحول الجهد إلى أرباح حية.',
      targetGoal: 'تنفيذ أول عملية بيع بضائع تامة الصنع.',
      practicalSteps: ['معاينة المستودع', 'اختيار الكمية والسلعة', 'تأكيد البيع'],
      costsAndRisks: 'خصم السلع من المخزن مقابل دخول الكاش فوراً.',
      successCriteria: 'تسجيل عملية بيع واحدة على الأقل في profile.sales.',
      rewardsSummary: '٣٠,٠٠٠ $ + ٥٠ ماسة + ١٥٠ نقطة خبرة',
    },
    rewards: { money: 30_000, diamonds: 50, goldGrams: 5, experience: 150, reputation: 12 },
    isCompleted: (profile) => profile.sales.length >= 1,
    successMessage: 'ممتاز! تم تنفيذ أول عملية بيع وحققت أرباحاً تجارية مباشرة من إنتاجك.',
    hint: 'بع دفعة من بضائعك تامة الصنع في السوق من خلال قسم المستودع أو اللوحة الجانبية.',
  },

  // 7. إنجاز أول عقد تجاري رسمي
  {
    id: 'mission-first-contract',
    countryId: 'all',
    chapter: 4,
    title: 'استعادة ثقة كبار التجار (أول عقد تجاري)',
    description: 'اقبل عقد توريد تجاري من كبار العملاء، جهز المنتجات في المستودع، وسلمها بنجاح.',
    requiredSection: 'contracts',
    requiredLevel: 3,
    prerequisites: ['mission-first-market-sale'],
    practicalSteps: [
      'افتح قسم «العقود والعملاء».',
      'اختر عقداً تجارياً يناسب طاقتك الإنتاجية.',
      'اقبل العقد بنفسك.',
      'سلّم الكمية المطلوبة قبل حلول الموعد النهائي.',
    ],
    briefing: {
      storyReason: 'عقود التوريد تمنحك هامش ربح أعلى ومكافآت سمعة ضخمة تفتح لك الأبواب المغلقة في مجتمع الأعمال.',
      targetGoal: 'إتمام تسليم عقد تجاري واحد بنجاح.',
      practicalSteps: ['فحص العروض', 'قبول العقد', 'توفير السلع', 'الضغط على تسليم العقد'],
      costsAndRisks: 'غرامة مالية إذا انتهت المهلة دون تسليم البضائع.',
      successCriteria: 'وجود عقد بحالة completed في سجل العقود.',
      rewardsSummary: '٥٠,٠٠٠ $ + ٧٥ ماسة + ٢٠٠ نقطة خبرة',
    },
    rewards: { money: 50_000, diamonds: 75, goldGrams: 8, experience: 200, reputation: 15 },
    isCompleted: (profile) => profile.contracts.some((c) => c.status === 'completed'),
    successMessage: 'رائع جداً! استعدت ثقة كبار التجار وأنجزت أول عقد تجاري باحترافية تامة.',
    hint: 'اقبل عقداً تجارياً من قسم العقود وسلّم الكمية المطلوبة.',
  },

  // 8. تأسيس الشركة الثانية وتوسيع المجموعة
  {
    id: 'mission-found-second-company',
    countryId: 'all',
    chapter: 5,
    title: 'تأسيس الشركة الثانية وبناء التكتل',
    description: 'أسس شركتك الثانية على الأرض الجديدة لتدخل رسميًا نادي المجموعات الصناعية.',
    requiredSection: 'companies',
    requiredLevel: 4,
    prerequisites: ['mission-first-contract'],
    practicalSteps: [
      'افتح قسم «الشركات».',
      'اختر قطاعاً استثمارياً جديداً (نقل، طاقة، أو مواد بناء).',
      'اختر الأرض المرخصة وادفع رسوم التأسيس والتراخيص.',
      'أكد تأسيس الشركة الجديدة.',
    ],
    briefing: {
      storyReason: 'الشركات المتعددة تتيح لك التنوع الصناعي والتكامل الدائري: خامات ومصانع وخطوط نقل مستقلة.',
      targetGoal: 'امتلاك شركتين نشطتين في سجلات مجموعتك.',
      practicalSteps: ['فتح الشركات', 'تأسيس شركة جديدة', 'ربطها بالأرض المرخصة'],
      costsAndRisks: 'رسوم تأسيس وترخيص تخصم لمرة واحدة.',
      successCriteria: 'profile.companies.length >= 2.',
      rewardsSummary: '٧٥,٠٠٠ $ + ١٠٠ ماسة + ٢٥٠ نقطة خبرة',
    },
    rewards: { money: 75_000, diamonds: 100, goldGrams: 10, experience: 250, reputation: 20 },
    isCompleted: (profile) => profile.companies.length >= 2,
    successMessage: 'مبروك! أصبحت رئيساً لمجموعة شركات صناعية وتجارية صاعدة بقوة.',
    hint: 'أسس شركتك الثانية من قسم الشركات على إحدى أراضيك المرخصة.',
  },

  // 9. فتح أول وديعة مصرفية
  {
    id: 'mission-bank-deposit',
    countryId: 'all',
    chapter: 5,
    title: 'إيداع الفائض في وديعة مصرفية ذات عائد',
    description: 'استغل رفع الحظر البنكي وأنشئ وديعة مصرفية لجني أرباح وعوائد يومية ثابتة.',
    requiredSection: 'bank',
    requiredLevel: 4,
    prerequisites: ['mission-found-second-company'],
    practicalSteps: [
      'افتح قسم «البنك والتمويل» بعد رفع الحظر عنه.',
      'اختر خيار «إنشاء وديعة جديدة».',
      'حدد المبلغ المراد استثماره ومدة الوديعة.',
      'أكد الوديعة للاستمتاع بالأرباح اليومية المركبة.',
    ],
    briefing: {
      storyReason: 'السيولة الزائدة التي لا تُشغل في المصانع تفقد قيمتها بالتضخم؛ الودائع تضمن عائداً يومياً دون مخاطرة.',
      targetGoal: 'إنشاء وديعة بنكية واحدة على الأقل.',
      practicalSteps: ['فتح البنك', 'اختيار الودائع', 'تحديد القيمة والمدة', 'التأكيد'],
      costsAndRisks: 'المال المودع يجمد حتى تاريخ الاستحقاق لجني الفائدة.',
      successCriteria: '(profile.banking?.deposits?.length ?? 0) >= 1.',
      rewardsSummary: '١٠٠,٠٠٠ $ + ١٢٠ ماسة + ٣٠٠ نقطة خبرة',
    },
    rewards: { money: 100_000, diamonds: 120, goldGrams: 15, experience: 300, reputation: 20 },
    isCompleted: (profile) => (profile.banking?.deposits?.length ?? 0) >= 1,
    successMessage: 'ممتاز! تم إنشاء الوديعة وأصبحت أموالك تولد عوائد يومية مضمونة.',
    hint: 'توجه إلى قسم البنك وأنشئ أول وديعة استثمارية ذات عائد.',
  },

  // 10. المنافسة في المزادات المباشرة
  {
    id: 'mission-win-auction',
    countryId: 'all',
    chapter: 6,
    title: 'اقتناص الفرص ومنافسة الجبابرة بالمزادات',
    description: 'ادخل إلى صالة المزادات العلنية وقدم عطاءً للفوز بأصل متعثر بسعر مغرٍ.',
    requiredSection: 'auctions',
    requiredLevel: 5,
    prerequisites: ['mission-bank-deposit'],
    practicalSteps: [
      'افتح قسم «المزادات العلنية».',
      'عاين الأصول المعروضة (أراضي أو مصانع أو شحنات خامات).',
      'قدم عرض مزايدة يتجاوز عروض المنافسين.',
      'احسم المزاد لصالحك.',
    ],
    briefing: {
      storyReason: 'المزادات هي المكان الذي تستولي فيه على أصول المنافسين المفلسين بأقل من نصف قيمتها الحقيقية.',
      targetGoal: 'المشاركة والفوز في مزاد علني مباشر.',
      practicalSteps: ['دخول المزادات', 'دراسة القيمة الحقيقية', 'تقديم العطاء المالي'],
      costsAndRisks: 'المزايدة تستهلك كاش؛ لا ترفع السعر بدافع العناد.',
      successCriteria: 'profile.auctionHistory.length >= 1.',
      rewardsSummary: '١٥٠,٠٠٠ $ + ١٥٠ ماسة + ٣٥٠ نقطة خبرة',
    },
    rewards: { money: 150_000, diamonds: 150, goldGrams: 20, experience: 350, reputation: 25 },
    isCompleted: (profile) => profile.auctionHistory.length >= 1,
    successMessage: 'رائع! نافست كبار المستثمرين في المزاد وحققت صفقة استثمارية رابحة.',
    hint: 'توجه إلى قسم المزادات وقدم عطاءً للفوز بأحد الأصول المعروضة.',
  },

  // 11. الأبحاث والأتمتة الذكية
  {
    id: 'mission-tech-research',
    countryId: 'all',
    chapter: 7,
    title: 'الأتمتة وثورة الإنتاج الذكي',
    description: 'بلغ المستوى السادس وافتح شجرة الأبحاث لتطوير كفاءة المصانع وتقليل التكاليف.',
    requiredSection: 'tech_tree',
    requiredLevel: 6,
    prerequisites: ['mission-win-auction'],
    practicalSteps: [
      'افتح قسم «شجرة التكنولوجيا والأبحاث».',
      'استعرض فروع الأتمتة والروبوتات الصناعية والطاقة النظيفة.',
      'طوّر خطوط إنتاجك بأحدث الابتكارات.',
    ],
    briefing: {
      storyReason: 'التكنولوجيا هي السلاح السري لمضاعفة الإنتاجية وسحق التكاليف التشغيلية للمنافسين.',
      targetGoal: 'بلوغ المستوى ٦ وفتح شجرة التكنولوجيا.',
      practicalSteps: ['الترقية للمستوى ٦', 'فتح قسم الأبحاث', 'الاستثمار في التقنية'],
      costsAndRisks: 'نقاط أبحاث وكاش مخصص للتطوير.',
      successCriteria: 'profile.level >= 6.',
      rewardsSummary: '٢٠٠,٠٠٠ $ + ٢٠٠ ماسة + ٤٠٠ نقطة خبرة',
    },
    rewards: { money: 200_000, diamonds: 200, goldGrams: 25, experience: 400, reputation: 30 },
    isCompleted: (profile) => profile.level >= 6,
    successMessage: 'مبروك! فتحت عصر الأتمتة الصناعية وأصبحت مصانعك في صدارة التكنولوجيا.',
    hint: 'ارفع مستواك إلى ٦ لفتح قسم شجرة التكنولوجيا والأبحاث.',
  },

  // 12. سر مجموعة الأفق
  {
    id: 'mission-horizon-clues',
    countryId: 'all',
    chapter: 9,
    title: 'كشف سر مجموعة الأفق والعرش الاقتصادي',
    description: 'تجاوز أرباح مليون دولار واكشف خيوط المؤامرة التاريخية التي أسقطت مجموعة الأفق.',
    requiredSection: 'reports',
    requiredLevel: 8,
    prerequisites: ['mission-tech-research'],
    practicalSteps: [
      'واصل إدارة شركاتك وعقودك حتى تتجاوز صافي أرباحك ١,٠٠٠,٠٠٠ $.',
      'اطلع على التقرير المالي المتقدم في قسم التقارير.',
      'التقِ بنادر السالمي لحسم ملكية أصول مجموعة الأفق.',
    ],
    briefing: {
      storyReason: 'لقد تجمعت كل الخيوط: نجاحك المالي فضح المتآمرين وأعاد الأصول الشرعية إلى يدك.',
      targetGoal: 'تحقيق صافي أرباح مليون دولار ومستوى ٨ فما فوق.',
      practicalSteps: ['توسيع الإنتاج والعقود', 'متابعة صافي الأرباح', 'كشف المستندات'],
      costsAndRisks: 'مواجهة منافسين شرسين في المراحل المتقدمة.',
      successCriteria: 'profile.finances.netProfit >= 1_000_000 && profile.level >= 8.',
      rewardsSummary: '٥٠٠,٠٠٠ $ + ٥٠٠ ماسة + ٥٠ غرام ذهب',
    },
    rewards: { money: 500_000, diamonds: 500, goldGrams: 50, experience: 1000, reputation: 50 },
    isCompleted: (profile) => profile.finances.netProfit >= 1_000_000 && profile.level >= 8,
    successMessage: 'ملحمة تاريخية! كشفت أسرار مجموعة الأفق وأصبحت إمبراطور الأسواق بلا منازع!',
    hint: 'حقق أرباحاً تتجاوز مليون دولار وبلغ المستوى ٨ لحسم سر مجموعة الأفق.',
  },
];

/**
 * Returns only missions that are currently valid, synchronized with actual unlocked sections,
 * current country campaign, and prerequisite completions.
 */
export function getAvailableMissions(profile: PlayerProfile): GameMission[] {
  const completedIds = new Set(profile.completedMissionIds ?? []);

  return CENTRAL_MISSIONS_CATALOG.filter((mission) => {
    // 1. Country match
    if (mission.countryId !== 'all' && mission.countryId !== profile.countryId) {
      return false;
    }

    // 2. Section MUST be unlocked
    if (!isSectionUnlocked(profile, mission.requiredSection)) {
      return false;
    }

    // 3. Prerequisites must be completed
    for (const prereqId of mission.prerequisites) {
      if (!completedIds.has(prereqId)) {
        return false;
      }
    }

    return true;
  });
}

export function getMissionStatus(profile: PlayerProfile, mission: GameMission): 'locked' | 'available' | 'in_progress' | 'completed' {
  const completedIds = new Set(profile.completedMissionIds ?? []);
  if (completedIds.has(mission.id)) return 'completed';

  if (!isSectionUnlocked(profile, mission.requiredSection)) return 'locked';

  for (const prereq of mission.prerequisites) {
    if (!completedIds.has(prereq)) return 'locked';
  }

  if (mission.isCompleted(profile)) return 'available'; // Ready to claim reward
  return 'in_progress';
}

export function claimMissionReward(
  profile: PlayerProfile,
  missionId: string,
): { ok: boolean; profile: PlayerProfile; error?: string } {
  const mission = CENTRAL_MISSIONS_CATALOG.find((m) => m.id === missionId);
  if (!mission) {
    return { ok: false, profile, error: 'المهمة غير موجودة' };
  }

  const claimedIds = new Set(profile.claimedRewardIds ?? []);
  if (claimedIds.has(missionId)) {
    return { ok: false, profile, error: 'تم استلام مكافأة هذه المهمة مسبقاً لمنع التكرار' };
  }

  // Verify real success condition
  if (!mission.isCompleted(profile)) {
    return { ok: false, profile, error: 'لم يتم استيفاء شروط المهمة الفعلية بعد' };
  }

  const newClaimed = [...claimedIds, missionId];
  const completedIds = new Set(profile.completedMissionIds ?? []);
  completedIds.add(missionId);

  const updatedBankBalance = profile.bankBalance + mission.rewards.money;
  const updatedDiamonds = profile.diamonds + mission.rewards.diamonds;
  const updatedGold = profile.goldGrams + mission.rewards.goldGrams;
  const updatedReputation = Math.min(100, (profile.reputation ?? 50) + (mission.rewards.reputation ?? 0));

  const ledgerEntry = {
    id: `mission-reward-${missionId}-${Date.now()}`,
    category: 'revenue' as const,
    amount: mission.rewards.money,
    countryId: profile.countryId,
    occurredAt: new Date().toISOString(),
    note: `مكافأة إنجاز مهمة: ${mission.title}`,
  };

  const updatedProfile: PlayerProfile = {
    ...profile,
    bankBalance: updatedBankBalance,
    diamonds: updatedDiamonds,
    goldGrams: updatedGold,
    reputation: updatedReputation,
    claimedRewardIds: newClaimed,
    completedMissionIds: Array.from(completedIds),
    ledger: [ledgerEntry, ...(profile.ledger ?? [])],
  };

  return { ok: true, profile: updatedProfile };
}
