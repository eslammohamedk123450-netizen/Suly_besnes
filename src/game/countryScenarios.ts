import type { CountryId, IndustryId } from '../domain/countries';
import type { SectionId } from '../domain/navigation';
import type { BusinessContract } from '../domain/futureSystems';
import type { PlayerProfile } from '../domain/player';
import type { CampaignChapter } from './campaignScenario';
import type { EconomicEventTemplate } from './economicEvents';
import { computeUnlockedSections } from './progressionEngine';

export type AdvisorRole = 'elder' | 'operations' | 'finance' | 'logistics';

export interface ScenarioAdvisor {
  id: string;
  role: AdvisorRole;
  name: string;
  title: string;
  avatarEmoji: string;
  initials: string;
  accentGradient: string;
}

export interface CountryEconomicProfile {
  headline: string;
  strengths: readonly [string, string, string];
  challenges: readonly [string, string];
  signatureSectors: readonly [string, string, string];
  bankName: string;
  exchangeName: string;
  industrialHub: string;
  portHub: string;
  inheritedFactoryName: string;
  inheritedLandName: string;
  strategicTip: string;
}

export interface StoryStageSummary {
  stageNumber: number; // 1..10
  title: string;
  focus: string;
  unlockSection: SectionId;
  requiredLevel: number;
}

export interface QuestBriefingSpec {
  advisorRole: AdvisorRole;
  pages: readonly string[];
  goal: string;
  whyItMatters: string;
  steps: readonly string[];
  requiredResources: string;
  expectedOutcome: string;
  riskWarning: string;
}

export interface CountryStoryQuest {
  id: string;
  countryId: CountryId;
  stepNumber: number;
  stageNumber: number;
  title: string;
  shortDescription: string;
  icon: string;
  targetSection: SectionId;
  cashReward: number;
  diamondReward: number;
  briefing: QuestBriefingSpec;
  isAvailable: (profile: PlayerProfile) => boolean;
  isCompleted: (profile: PlayerProfile) => boolean;
  getProgressText: (profile: PlayerProfile) => string;
}

export interface CountryClientDefinition {
  name: string;
  type: BusinessContract['clientType'];
  multiplier: number;
  minimumQuality: number;
  description: string;
}

export interface CountryStoryAlert {
  id: string;
  countryId: CountryId;
  advisorRole: AdvisorRole;
  urgencyLevel: 'high' | 'medium' | 'opportunity';
  speechBubble: string;
  actionText: string;
  targetSection: SectionId;
  rewardText: string;
  requiresStockUnlock?: boolean;
  requiresActiveCompany?: boolean;
  requiresContractUnlock?: boolean;
  requiresBankUnlock?: boolean;
}

export interface CountryRivalDefinition {
  id: string;
  name: string;
  avatar: string;
  activeSector: string;
  netWorth: number;
}

export interface CountryScenarioDefinition {
  countryId: CountryId;
  scenarioTitle: string;
  economicProfile: CountryEconomicProfile;
  advisors: Record<AdvisorRole, ScenarioAdvisor>;
  stages: readonly StoryStageSummary[];
  chapters: readonly CampaignChapter[];
  rivals: readonly CountryRivalDefinition[];
  quests: readonly CountryStoryQuest[];
  clients: readonly CountryClientDefinition[];
  economicEvents: readonly EconomicEventTemplate[];
  storyAlerts: readonly CountryStoryAlert[];
}

interface CountryFlavorSeed {
  countryId: CountryId;
  scenarioTitle: string;
  cityShort: string;
  industrialHub: string;
  portHub: string;
  bankName: string;
  exchangeName: string;
  inheritedFactoryName: string;
  inheritedLandName: string;
  starterLandOfferName: string;
  headline: string;
  strengths: readonly [string, string, string];
  challenges: readonly [string, string];
  signatureSectors: readonly [string, string, string];
  strategicTip: string;
  elder: { name: string; title: string; initials: string };
  operations: { name: string; title: string; initials: string };
  finance: { name: string; title: string; initials: string };
  logistics: { name: string; title: string; initials: string };
  rivals: readonly [CountryRivalDefinition, CountryRivalDefinition, CountryRivalDefinition];
  clients: readonly [CountryClientDefinition, CountryClientDefinition, CountryClientDefinition, CountryClientDefinition];
  eventExportTitle?: string;
}

const COUNTRY_SEEDS: Record<CountryId, CountryFlavorSeed> = {
  egypt: {
    countryId: 'egypt',
    scenarioTitle: 'نهضة العاشر من رمضان وموانئ القناة',
    cityShort: 'القاهرة والعاشر',
    industrialHub: 'مجمع العاشر من رمضان الصناعي',
    portHub: 'محور موانئ بورسعيد والعين السخنة',
    bankName: 'بنك مصر',
    exchangeName: 'البورصة المصرية EGX',
    inheritedFactoryName: 'مصنع الأغذية النموذجي · العاشر من رمضان',
    inheritedLandName: 'أرض مجمع العاشر من رمضان الصناعي',
    starterLandOfferName: 'أرض المنطقة الصناعية الأولى · العاشر من رمضان',
    headline: 'سوق استهلاكي ضخم وتكاليف تشغيل تنافسية بربط مباشر مع قناة السويس.',
    strengths: [
      'أقل مضاعف تكلفة تشغيل يومي (1.0x) وضريبة مبيعات معتدلة (12%)',
      'طلب داخلي قوي ومستقر على الأغذية ومواد البناء والمنظفات',
      'موقع محوري بين موانئ بورسعيد والسخنة للتصدير البحري السريع',
    ],
    challenges: [
      'المصنع الموروث يعمل بكفاءة 25% ويحتاج صيانة فورية قبل التوسع',
      'قرض موروث بقيمة 2,100 $ لدى بنك مصر يستحق بعد مهلة 7 أيام',
    ],
    signatureSectors: ['الأغذية والزراعة', 'اللوجستيات وقناة السويس', 'البتروكيماويات والطاقة'],
    strategicTip: 'استفد من انخفاض تكاليف التشغيل في مصر لبناء فائض نقدي مبكر قبل دخول المزادات.',
    elder: { name: 'الحاج إبراهيم المنشاوي', title: 'كبير مستشاري عائلة النيل', initials: 'إم' },
    operations: { name: 'المهندس فاروق عبدالحميد', title: 'مدير تشغيل مصانع العاشر', initials: 'فع' },
    finance: { name: 'د. سلمى الشاذلي', title: 'مستشارة الائتمان وبورصة القاهرة', initials: 'سش' },
    logistics: { name: 'القبطان طارق دمياطي', title: 'مدير اللوجستيات ومحور القناة', initials: 'طد' },
    rivals: [
      { id: 'eg-rival-1', name: 'تكتل الأهرام الصناعي', avatar: '🏛️', activeSector: 'الأغذية والصوامع الكبرى', netWorth: 1_450_000 },
      { id: 'eg-rival-2', name: 'مجموعة الدلتا للملاحة', avatar: '🚢', activeSector: 'موانئ بورسعيد والسخنة', netWorth: 2_800_000 },
      { id: 'eg-rival-3', name: 'القابضة المالية بالقاهرة', avatar: '🏦', activeSector: 'البنوك والأسهم القيادية', netWorth: 5_200_000 },
    ],
    clients: [
      { name: 'سلاسل أسواق المحروسة الاقتصادية', type: 'budget', multiplier: 0.94, minimumQuality: 0, description: 'توريد منتظم للأحياء السكنية في القاهرة الكبرى بسعر تنافسي.' },
      { name: 'فنادق ومنتجعات النيل الفاخرة', type: 'quality', multiplier: 1.18, minimumQuality: 90, description: 'تشترط جودة إنتاج لا تقل عن 90% مقابل علاوة سعرية ممتازة.' },
      { name: 'مخازن الجملة الإقليمية بالعاشر', type: 'bulk', multiplier: 1.05, minimumQuality: 75, description: 'تستوعب كميات كبيرة لتوزيعها على محافظات الدلتا والصعيد.' },
      { name: 'هيئة تموين سفن محور قناة السويس', type: 'urgent', multiplier: 1.28, minimumQuality: 70, description: 'طلبية عاجلة لعبور القوافل الملاحية بمكافأة التزام مرتفعة.' },
    ],
    eventExportTitle: 'فرصة تصدير استثنائية',
  },

  saudi: {
    countryId: 'saudi',
    scenarioTitle: 'صعود الرياض الصناعي وعمالقة الجبيل',
    cityShort: 'الرياض والجبيل',
    industrialHub: 'المدينة الصناعية الثانية بالرياض وسدير',
    portHub: 'ميناء جدة الإسلامي وميناء الملك عبدالعزيز بالدمام',
    bankName: 'مصرف الراجحي',
    exchangeName: 'السوق المالية السعودية (تداول)',
    inheritedFactoryName: 'مصنع نجد للأغذية والتموين · الرياض',
    inheritedLandName: 'أرض المدينة الصناعية الثانية بالرياض',
    starterLandOfferName: 'أرض المدينة الصناعية الثانية · الرياض',
    headline: 'مشاريع كبرى وتمويل قوي وطلب متسارع على التموين ومواد البناء والطاقة.',
    strengths: [
      'قوة شرائية عالية وعقود توريد ضخمة للمدن الصناعية والمشاريع الكبرى',
      'رسوم تأسيس شركات تنافسية (2,000 $) وبنية لوجستية حديثة',
      'فرص توسع صناعي استثنائية في الجبيل وسدير والدمام',
    ],
    challenges: [
      'ضريبة قيمة مضافة 15% تتطلب إدارة دقيقة لهوامش ربح العقود',
      'مصنع نجد الموروث متهالك (25%) وعليه قسط 2,100 $ لدى مصرف الراجحي',
    ],
    signatureSectors: ['البتروكيماويات والطاقة', 'مواد البناء والمشاريع', 'الأغذية والتموين'],
    strategicTip: 'ركز على عقود الجملة عالية القيمة لتعويض ضريبة الـ 15% وبناء سيولة سريعة.',
    elder: { name: 'الشيخ عبدالعزيز السديري', title: 'مستشار مجلس الأعمال بالرياض', initials: 'عس' },
    operations: { name: 'المهندس فهد القحطاني', title: 'مدير تشغيل مدن سدير والرياض', initials: 'فق' },
    finance: { name: 'أ. نورة العليان', title: 'خبيرة التمويل وسوق تداول', initials: 'نع' },
    logistics: { name: 'الكابتن بندر الحربي', title: 'مدير إمدادات جدة والدمام', initials: 'بح' },
    rivals: [
      { id: 'sa-rival-1', name: 'مجموعة اليمامة للتعمير', avatar: '🏗️', activeSector: 'المقاولات ومواد البناء', netWorth: 1_850_000 },
      { id: 'sa-rival-2', name: 'شركة الخليج للبتروكيماويات', avatar: '⛽', activeSector: 'الطاقة وتكرير الجبيل', netWorth: 3_400_000 },
      { id: 'sa-rival-3', name: 'تكتل نجد القابضة للاستثمار', avatar: '👑', activeSector: 'التمويل والمشاريع العملاقة', netWorth: 6_100_000 },
    ],
    clients: [
      { name: 'أسواق التموين المركزية بالرياض', type: 'budget', multiplier: 0.94, minimumQuality: 0, description: 'طلبيات يومية سريعة الدوران لمتاجر التجزئة في العاصمة.' },
      { name: 'منتجعات وفنادق البحر الأحمر', type: 'quality', multiplier: 1.2, minimumQuality: 90, description: 'تشترط معايير جودة فاخرة مقابل أسعار مجزية.' },
      { name: 'مراكز إمداد مشاريع الجبيل وسدير', type: 'bulk', multiplier: 1.06, minimumQuality: 75, description: 'عقود توريد بكميات كبيرة لتغذية المدن الصناعية.' },
      { name: 'تموين محطات ميناء جدة الإسلامي', type: 'urgent', multiplier: 1.28, minimumQuality: 70, description: 'توريد فوري بمهلة قصيرة وعلاوة التزام عالية.' },
    ],
  },

  uae: {
    countryId: 'uae',
    scenarioTitle: 'بوابة جبل علي وأبراج المال في دبي وأبوظبي',
    cityShort: 'دبي وأبوظبي',
    industrialHub: 'منطقة جبل علي الحرة (JAFZA) وكيزاد',
    portHub: 'ميناء جبل علي العالمي وموانئ أبوظبي',
    bankName: 'بنك الإمارات دبي الوطني',
    exchangeName: 'سوق دبي المالي وسوق أبوظبي ADX',
    inheritedFactoryName: 'مصنع دبي للأغذية والضيافة · جبل علي',
    inheritedLandName: 'أرض منطقة جبل علي الحرة JAFZA بدبي',
    starterLandOfferName: 'مجمع منطقة جبل علي الحرة (JAFZA) · دبي',
    headline: 'أقل ضريبة شركات (9%) ومركز إعادة تصدير عالمي يربط الشرق بالغرب.',
    strengths: [
      'ضريبة منخفضة جداً (9%) تمنحك صافي ربح أعلى في كل عملية بيع وعقد',
      'منطقة حرة عالمية في جبل علي وكيزاد تسرّع حركة التجارة والشحن',
      'بيئة مثالية للتوسع في الضيافة واللوجستيات والأسهم العقارية',
    ],
    challenges: [
      'تكلفة تأسيس وتشغيل أعلى نسبياً (1.10x) تتطلب عدم ترك المصانع خاملة',
      'مصنع جبل علي الموروث يحتاج صيانة عاجلة وقرض 2,100 $ يقترب من الاستحقاق',
    ],
    signatureSectors: ['اللوجستيات والمناطق الحرة', 'الأغذية والضيافة', 'الطاقة النظيفة والعقار'],
    strategicTip: 'ضريبة الـ 9% تجعل كل عقد مكتمل في دبي أكثر ربحية؛ حافظ على دوران مستمر للمخزون.',
    elder: { name: 'راشد بن ماجد الفلاسي', title: 'حكيم التجار في خور دبي وجبل علي', initials: 'رف' },
    operations: { name: 'المهندس حمدان المزروعي', title: 'مدير العمليات الصناعية في JAFZA', initials: 'حم' },
    finance: { name: 'مريم السويدي', title: 'مستشارة المصارف وسوق دبي المالي', initials: 'مس' },
    logistics: { name: 'القبطان سلطان الشامسي', title: 'مدير خطوط الشحن بموانئ الإمارات', initials: 'سش' },
    rivals: [
      { id: 'ae-rival-1', name: 'مجموعة المدار للمناطق الحرة', avatar: '🏙️', activeSector: 'اللوجستيات والتخزين الدولي', netWorth: 2_100_000 },
      { id: 'ae-rival-2', name: 'تكتل الخليج للضيافة والتموين', avatar: '✨', activeSector: 'تموين الفنادق والطيران', netWorth: 3_600_000 },
      { id: 'ae-rival-3', name: 'قابضة أبراج المارينا المالية', avatar: '💎', activeSector: 'الاستثمارات والعقارات الفاخرة', netWorth: 6_800_000 },
    ],
    clients: [
      { name: 'مراكز تسوق الديرة والشارقة', type: 'budget', multiplier: 0.94, minimumQuality: 0, description: 'سحب مستمر للسلع الاستهلاكية بأسعار تنافسية.' },
      { name: 'أبراج الضيافة والطيران بدبي', type: 'quality', multiplier: 1.2, minimumQuality: 90, description: 'عقود مرموقة تتطلب جودة فائقة والتزاماً صارماً.' },
      { name: 'مستودعات إعادة التصدير في جبل علي', type: 'bulk', multiplier: 1.06, minimumQuality: 75, description: 'شحنات جملة ضخمة موجهة للأسواق الإقليمية.' },
      { name: 'مركز الإمداد السريع بميناء كيزاد', type: 'urgent', multiplier: 1.29, minimumQuality: 70, description: 'طلبية شحن عاجلة بعائد ممتاز لمن يملك مخزوناً جاهزاً.' },
    ],
  },

  usa: {
    countryId: 'usa',
    scenarioTitle: 'معركة وول ستريت والمجمعات الصناعية الأمريكية',
    cityShort: 'نيويورك وهيوستن',
    industrialHub: 'مجمع كوينز الصناعي وممر الطاقة بهيوستن',
    portHub: 'موانئ نيويورك وشيكاغو وميامي',
    bankName: 'جي بي مورغان تشيس',
    exchangeName: 'بورصة نيويورك Wall Street (NYSE)',
    inheritedFactoryName: 'مصنع مانهاتن للسلع الغذائية · نيويورك',
    inheritedLandName: 'أرض مجمع كوينز الصناعي واللوجستي · نيويورك',
    starterLandOfferName: 'مجمع كوينز الصناعي واللوجستي · نيويورك',
    headline: 'أكبر سوق مالي وتكنولوجي في العالم بمنافسة شرسة وعوائد ضخمة للأكفأ.',
    strengths: [
      'أعمق سوق أسهم واستثمار جريء (VC) وشركات ناشئة في مراحل التوسع',
      'تنوع هائل بين زراعة كاليفورنيا وطاقة تكساس وتقنية وادي السيليكون',
      'عقود شركات كبرى ترفع سمعتك التجارية بسرعة عند الالتزام بالجودة',
    ],
    challenges: [
      'أعلى ضريبة شركات (21%) وتكلفة تشغيل مرتفعة (1.15x) تعاقب سوء الإدارة',
      'التزام ائتماني موروث بـ 2,100 $ لدى جي بي مورغان تشيس ومصنع متعثر بكوينز',
    ],
    signatureSectors: ['الإلكترونيات ووادي السيليكون', 'الطاقة والنفط (تكساس)', 'السلع الاستهلاكية والتمويل'],
    strategicTip: 'في السوق الأمريكي لا مجال للهدر: عيّن محاسباً ومديراً فور فتح الموظفين لتخفيف الضرائب وتكلفة التشغيل.',
    elder: { name: 'آرثر فاندربيلت', title: 'المستشار المخضرم في مانهاتن', initials: 'أف' },
    operations: { name: 'ماركوس رينولدز', title: 'مدير الهندسة الصناعية بكوينز', initials: 'مر' },
    finance: { name: 'إيلينا ستيرلنغ', title: 'محللة الائتمان في وول ستريت', initials: 'إس' },
    logistics: { name: 'الكابتن جاك هاربر', title: 'مدير الشحن الأطلسي وسلاسل الإمداد', initials: 'جه' },
    rivals: [
      { id: 'us-rival-1', name: 'تكتل أطلس للصناعات الاستهلاكية', avatar: '🦅', activeSector: 'الأغذية وسلاسل التوزيع', netWorth: 2_600_000 },
      { id: 'us-rival-2', name: 'هيوستن تكساس للطاقة القابضة', avatar: '🛢️', activeSector: 'النفط والكهرباء الثقيلة', netWorth: 4_500_000 },
      { id: 'us-rival-3', name: 'وول ستريت كابيتال بارتنرز', avatar: '📈', activeSector: 'البورصة وصناديق الـ VC', netWorth: 8_900_000 },
    ],
    clients: [
      { name: 'متاجر مترو كوينز التوفيرية', type: 'budget', multiplier: 0.93, minimumQuality: 0, description: 'طلبيات مستمرة للأحياء السكنية في نيويورك.' },
      { name: 'سلسلة متاجر مانهاتن العضوية الفاخرة', type: 'quality', multiplier: 1.22, minimumQuality: 92, description: 'تدفع بسخاء مقابل أعلى درجات الجودة المعتمدة.' },
      { name: 'مراكز التوزيع الفيدرالية بشيكاغو', type: 'bulk', multiplier: 1.07, minimumQuality: 75, description: 'عقود توريد قارية بكميات كبيرة.' },
      { name: 'إمداد موانئ الساحل الشرقي العاجل', type: 'urgent', multiplier: 1.3, minimumQuality: 72, description: 'شحنة سريعة بجدول زمني صارم ومكافأة فورية.' },
    ],
  },

  kuwait: {
    countryId: 'kuwait',
    scenarioTitle: 'عودة الهيبة من الشويخ الصناعية إلى ميناء الأحمدي',
    cityShort: 'الكويت والشويخ',
    industrialHub: 'منطقة الشويخ الصناعية وصبحان',
    portHub: 'ميناء الشويخ وميناء الأحمدي النفطي',
    bankName: 'بنك الكويت الوطني',
    exchangeName: 'بورصة الكويت للمال والأعمال',
    inheritedFactoryName: 'مصنع الديرة للمنتجات الغذائية · الشويخ',
    inheritedLandName: 'أرض منطقة الشويخ الصناعية · العاصمة',
    starterLandOfferName: 'أرض منطقة الشويخ الصناعية · العاصمة',
    headline: 'تاريخ تجاري عريق وسيولة نفطية ومصرفية تدعم التاجر الملتزم بسمعته.',
    strengths: [
      'رسوم تأسيس شركات معتدلة (2,000 $) وتكلفة تشغيل متوازنة (1.05x)',
      'قرب المجمعات الصناعية في الشويخ وصبحان من موانئ التصدير',
      'فرص ممتازة في قطاعات الطاقة والتموين الغذائي والخدمات اللوجستية',
    ],
    challenges: [
      'منافسة قوية من التكتلات العائلية الكبرى في المزادات والعقود',
      'مصنع الديرة الموروث بحاجة لإصلاح فوري مع قرض مستحق لبنك الكويت الوطني',
    ],
    signatureSectors: ['النفط وتكرير الأحمدي', 'الصناعات الغذائية والتموين', 'التجارة البحرية والمصارف'],
    strategicTip: 'السمعة التجارية في سوق الكويت تفتح لك أفضل العقود؛ لا تقبل عقداً لا تضمن تسليمه بالموعد.',
    elder: { name: 'العم جاسم الخرافي', title: 'مستشار ديوانية التجار بالعاصمة', initials: 'جخ' },
    operations: { name: 'المهندس مشاري المطيري', title: 'مدير تشغيل مصانع الشويخ', initials: 'مم' },
    finance: { name: 'دلال الصقر', title: 'مستشارة الائتمان وبورصة الكويت', initials: 'دص' },
    logistics: { name: 'النوخذة بدر العوضي', title: 'مدير الملاحة وموانئ الشويخ والأحمدي', initials: 'بع' },
    rivals: [
      { id: 'kw-rival-1', name: 'مجموعة الديرة للتجارة والتموين', avatar: '🏢', activeSector: 'الأغذية والمستودعات', netWorth: 1_700_000 },
      { id: 'kw-rival-2', name: 'شركة برقان للخدمات النفطية', avatar: '⛽', activeSector: 'البترول والطاقة', netWorth: 3_250_000 },
      { id: 'kw-rival-3', name: 'تكتل الأبراج الاستثماري الكويتي', avatar: '🏦', activeSector: 'البنوك والأسهم العقارية', netWorth: 5_600_000 },
    ],
    clients: [
      { name: 'الجمعيات التعاونية الاستهلاكية', type: 'budget', multiplier: 0.95, minimumQuality: 0, description: 'سوق استهلاكي مضمون ومستقر في مختلف مناطق الكويت.' },
      { name: 'فنادق وأبراج الخليج بالعاصمة', type: 'quality', multiplier: 1.19, minimumQuality: 90, description: 'توريد عالي الجودة لقطاع الضيافة الفاخرة.' },
      { name: 'مستودعات الجملة بالصليبية والشويخ', type: 'bulk', multiplier: 1.06, minimumQuality: 75, description: 'طلبيات جملة كبيرة للتوزيع المحلي والإقليمي.' },
      { name: 'تموين ناقلات ميناء الأحمدي العاجل', type: 'urgent', multiplier: 1.28, minimumQuality: 70, description: 'عقد تموين سريع بعلاوة نقدية وسمعة مرتفعة.' },
    ],
  },

  qatar: {
    countryId: 'qatar',
    scenarioTitle: 'مشاريع الدوحة وعملاق الغاز في رأس لفان وميناء حمد',
    cityShort: 'الدوحة ورأس لفان',
    industrialHub: 'المنطقة الصناعية الجديدة بالدوحة ورأس لفان',
    portHub: 'ميناء حمد الدولي',
    bankName: 'بنك قطر الوطني QNB',
    exchangeName: 'بورصة قطر للأوراق المالية',
    inheritedFactoryName: 'مصنع الدوحة للتعبئة والمنتجات الغذائية',
    inheritedLandName: 'أرض المنطقة الصناعية الجديدة بالدوحة',
    starterLandOfferName: 'أرض المنطقة الصناعية الجديدة · الدوحة',
    headline: 'ضريبة منخفضة (10%) وبنية تحتية فائقة في الغاز الطبيعي والشحن البحري.',
    strengths: [
      'معدل ضريبي جاذب للاستثمار (10% فقط) يعزز صافي أرباح المبيعات',
      'تكلفة تشغيل مستقرة (1.05x) مع تفوق استراتيجي في الغاز والطاقة',
      'ميناء حمد الدولي يمنحك منصة مثالية لعقود التصدير والمناقصات الكبرى',
    ],
    challenges: [
      'حاجة عاجلة لإعادة تأهيل مصنع الدوحة الموروث قبل نفاد مهلة الـ 7 أيام',
      'قرض تأسيسي بقيمة 2,100 $ مسجل لدى بنك قطر الوطني QNB',
    ],
    signatureSectors: ['الغاز الطبيعي والطاقة (رأس لفان)', 'الشحن اللوجستي (ميناء حمد)', 'التعمير والأغذية'],
    strategicTip: 'استغل الضريبة المنخفضة (10%) للتوسع المبكر من قطاع الأغذية نحو الغاز والكهرباء.',
    elder: { name: 'الشيخ حمد بن جبر الكواري', title: 'كبير مستشاري مجلس الدوحة', initials: 'حك' },
    operations: { name: 'المهندس تميم المهندي', title: 'مدير عمليات المنطقة الصناعية', initials: 'تم' },
    finance: { name: 'عائشة المسند', title: 'مستشارة المصارف وبورصة قطر', initials: 'عم' },
    logistics: { name: 'القبطان جاسم السليطي', title: 'مدير إمدادات ميناء حمد الدولي', initials: 'جس' },
    rivals: [
      { id: 'qa-rival-1', name: 'مجموعة اللؤلؤة للتطوير والتجارة', avatar: '🏙️', activeSector: 'العقارات والتموين التجاري', netWorth: 1_900_000 },
      { id: 'qa-rival-2', name: 'شركة الشمال للغاز والبتروكيماويات', avatar: '🔥', activeSector: 'الغاز الطبيعي والطاقة', netWorth: 3_900_000 },
      { id: 'qa-rival-3', name: 'قابضة الخليج للاستثمار السيادي', avatar: '👑', activeSector: 'المناقصات والأسهم الكبرى', netWorth: 6_400_000 },
    ],
    clients: [
      { name: 'أسواق الدوحة المركزية للتموين', type: 'budget', multiplier: 0.95, minimumQuality: 0, description: 'طلب يومي منتظم لتغطية احتياجات السوق المحلي.' },
      { name: 'فنادق ومرافق اللؤلؤة ولوسيل', type: 'quality', multiplier: 1.2, minimumQuality: 90, description: 'تطلب منتجات فائقة الجودة بمعايير عالمية.' },
      { name: 'مجمع التوزيع اللوجستي بميناء حمد', type: 'bulk', multiplier: 1.06, minimumQuality: 75, description: 'عقود توريد ضخمة للشحن الإقليمي.' },
      { name: 'إمداد منشآت رأس لفان العاجل', type: 'urgent', multiplier: 1.28, minimumQuality: 70, description: 'طلبية تشغيلية مستعجلة بمكافأة نقدية ممتازة.' },
    ],
  },

  uk: {
    countryId: 'uk',
    scenarioTitle: 'استعادة المجد بين مانشستر الصناعية وحي المال بلندن',
    cityShort: 'لندن ومانشستر',
    industrialHub: 'ترافورد بارك مانشستر وحوض ليفربول',
    portHub: 'موانئ ليفربول وساوثهامبتون',
    bankName: 'بنك باركليز',
    exchangeName: 'بورصة لندن العالمية (LSE)',
    inheritedFactoryName: 'مصنع التايمز للصناعات الغذائية · مانشستر',
    inheritedLandName: 'أرض مجمع ترافورد بارك الصناعي · مانشستر',
    starterLandOfferName: 'مجمع مانشستر الصناعي (Trafford Park)',
    headline: 'عراقة صناعية في مانشستر وأسواق تمويل وملاحة دولية في قلب لندن.',
    strengths: [
      'سوق عقود عالي الموثوقية يكافئ الجودة والانضباط المالي',
      'تكامل قوي بين الصناعة في الشمال والملاحة البحرية والتمويل في لندن',
      'فرص ممتازة في الشحن البحري وطاقة بحر الشمال والاستثمار المؤسسي',
    ],
    challenges: [
      'ضريبة شركات 19% وتكلفة تشغيل 1.10x تتطلب تخطيطاً دقيقاً للسيولة',
      'مصنع مانشستر الموروث يعمل بـ 25% فقط وعليه قرض مستحق لبنك باركليز',
    ],
    signatureSectors: ['الملاحة والتجارة البحرية', 'التمويل وبورصة لندن', 'الصناعات الغذائية والطاقة'],
    strategicTip: 'احرص على رفع جودة الإنتاج لصيد عقود لندن عالية الهامش وتجاوز أثر ضريبة الـ 19%.',
    elder: { name: 'اللورد إدوارد كينغزلي', title: 'مستشار الأصول العائلية بلندن', initials: 'إك' },
    operations: { name: 'المهندس أوليفر كراوفورد', title: 'مدير مصانع ترافورد بارك بمانشستر', initials: 'أك' },
    finance: { name: 'فيكتوريا بيلغريف', title: 'مديرة الائتمان في حي السيتي بلندن', initials: 'فب' },
    logistics: { name: 'القبطان هنري نيلسون', title: 'مدير أساطيل ليفربول وساوثهامبتون', initials: 'هن' },
    rivals: [
      { id: 'uk-rival-1', name: 'مجموعة التاج للسلع والأغذية', avatar: '🎩', activeSector: 'الصناعات الاستهلاكية', netWorth: 2_200_000 },
      { id: 'uk-rival-2', name: 'ألبين للشحن وطاقة بحر الشمال', avatar: '⚓', activeSector: 'الملاحة والنفط البحري', netWorth: 4_100_000 },
      { id: 'uk-rival-3', name: 'كاناري وارف المالية القابضة', avatar: '🏛️', activeSector: 'المصارف وبورصة لندن', netWorth: 7_500_000 },
    ],
    clients: [
      { name: 'سلاسل متاجر ميدلاندز الاقتصادية', type: 'budget', multiplier: 0.94, minimumQuality: 0, description: 'عقود توريد منتظمة لمدن الوسط والشمال الإنجليزي.' },
      { name: 'متاجر نايتسبريدج ومايفير الفاخرة', type: 'quality', multiplier: 1.21, minimumQuality: 92, description: 'تشترط جودة استثنائية وتمنح أعلى هامش ربح.' },
      { name: 'مراكز إمداد حوض ليفربول التجاري', type: 'bulk', multiplier: 1.06, minimumQuality: 75, description: 'طلبيات جملة كبيرة للتوزيع عبر المملكة المتحدة.' },
      { name: 'تموين سفن ساوثهامبتون العاجل', type: 'urgent', multiplier: 1.29, minimumQuality: 70, description: 'طلبية شحن بحري عاجلة بمكافأة التزام مجزية.' },
    ],
  },

  germany: {
    countryId: 'germany',
    scenarioTitle: 'قلاع حزام الرور الصناعية وبوابة هامبورغ الأوروبية',
    cityShort: 'دوسلدورف وفرانكفورت',
    industrialHub: 'حزام الرور الصناعي وشتوتغارت',
    portHub: 'ميناء هامبورغ الدولي',
    bankName: 'دويتشه بنك',
    exchangeName: 'بورصة فرانكفورت (DAX)',
    inheritedFactoryName: 'مصنع بافاريا للصناعات الغذائية · الرور',
    inheritedLandName: 'أرض حزام الرور الصناعي · دوسلدورف',
    starterLandOfferName: 'حزام الرور الصناعي الحديث · دوسلدورف',
    headline: 'قلب الهندسة والأتمتة الصناعية في أوروبا بمعايير جودة لا تقبل المساومة.',
    strengths: [
      'بيئة مثالية للصناعات التحويلية والكيماويات والأبحاث والأتمتة الذكية',
      'ميناء هامبورغ يفتح عقود تصدير أوروبية ضخمة ومستقرة',
      'استقرار مالي قوي في فرانكفورت يدعم التوسع المدروس',
    ],
    challenges: [
      'ضريبة 19% وتكلفة تشغيل 1.10x تجعل الصيانة الكاملة للمصانع ضرورة قصوى',
      'مصنع الرور الموروث متعثر بكفاءة 25% وقرض دويتشه بنك يستحق خلال 7 أيام',
    ],
    signatureSectors: ['الهندسة والصناعات الكيماوية', 'الأتمتة والتكنولوجيا', 'اللوجستيات الأوروبية'],
    strategicTip: 'لا تترك كفاءة ماكيناتك تهبط في ألمانيا؛ الجودة العالية تفتح لك عقود الاتحاد الأوروبي الأكثر ربحاً.',
    elder: { name: 'هانز فريدريش شتيرن', title: 'كبير مستشاري الصناعة في فرانكفورت', initials: 'هش' },
    operations: { name: 'المهندس كلاوس فاغنر', title: 'مدير الهندسة والتشغيل في حزام الرور', initials: 'كف' },
    finance: { name: 'أنهاليزا براندت', title: 'خبيرة المصارف وبورصة فرانكفورت', initials: 'أب' },
    logistics: { name: 'القبطان لوكاس ماير', title: 'مدير الشحن الدولي بميناء هامبورغ', initials: 'لم' },
    rivals: [
      { id: 'de-rival-1', name: 'راينلاند للصناعات المتكاملة', avatar: '⚙️', activeSector: 'الإنتاج الصناعي والكيماويات', netWorth: 2_400_000 },
      { id: 'de-rival-2', name: 'هانزا هامبورغ للخطوط البحرية', avatar: '🚢', activeSector: 'الشحن الأوروبي واللوجستيات', netWorth: 4_200_000 },
      { id: 'de-rival-3', name: 'فرانكفورت يونيون كابيتال', avatar: '🏦', activeSector: 'التمويل ومؤشر DAX', netWorth: 7_800_000 },
    ],
    clients: [
      { name: 'سلاسل التجزئة الاقتصادية في الرور', type: 'budget', multiplier: 0.94, minimumQuality: 0, description: 'توريد منتظم للمدن الصناعية في غرب ألمانيا.' },
      { name: 'مؤسسات الجودة البافارية المعتمدة', type: 'quality', multiplier: 1.22, minimumQuality: 92, description: 'تشترط دقة تصنيع لا تقل عن 92% بعائد ممتاز.' },
      { name: 'مركز التوزيع الأوروبي في هامبورغ', type: 'bulk', multiplier: 1.07, minimumQuality: 78, description: 'شحنات جملة ضخمة لأسواق الاتحاد الأوروبي.' },
      { name: 'خط الإمداد الصناعي السريع بشتوتغارت', type: 'urgent', multiplier: 1.29, minimumQuality: 72, description: 'عقد عاجل لتفادي توقف سلاسل التوريد بمكافأة كبيرة.' },
    ],
  },

  japan: {
    countryId: 'japan',
    scenarioTitle: 'إمبراطورية خليج طوكيو والأتمتة الفائقة في يوكوهاما',
    cityShort: 'طوكيو ويوكوهاما',
    industrialHub: 'مجمع يوكوهاما البحري وأوساكا الصناعي',
    portHub: 'موانئ يوكوهاما وناغويا وخليج طوكيو',
    bankName: 'ميتسوبيشي يو إف جيه',
    exchangeName: 'بورصة طوكيو للأوراق المالية (TSE)',
    inheritedFactoryName: 'مصنع طوكيو للمنتجات الغذائية · يوكوهاما',
    inheritedLandName: 'أرض مجمع يوكوهاما البحري الصناعي · خليج طوكيو',
    starterLandOfferName: 'مجمع يوكوهاما البحري الصناعي · خليج طوكيو',
    headline: 'انضباط تشغيلي صارم وضريبة متوازنة (15%) وتفوق في الإلكترونيات والموانئ.',
    strengths: [
      'ضريبة معتدلة (15%) مقارنة بالاقتصادات الصناعية الكبرى',
      'عوائد استثنائية عند التوسع نحو الإلكترونيات وشجرة التكنولوجيا والأتمتة',
      'ربط بحري مباشر عبر خليج طوكيو ويوكوهاما وناغويا للتجارة الآسيوية',
    ],
    challenges: [
      'العملاء اليابانيون حساسون جداً للجودة ومواعيد التسليم دون أي تأخير',
      'مصنع يوكوهاما الموروث يعمل بكفاءة 25% وقرض ميتسوبيشي يستحق باليوم السابع',
    ],
    signatureSectors: ['الإلكترونيات ورقائق السيليكون', 'الأتمتة الذكية والأبحاث', 'الشحن البحري (يوكوهاما)'],
    strategicTip: 'طبّق فلسفة التحسين المستمر (Kaizen): حافظ على صيانة المصنع 100% لبناء سمعة سريعة في طوكيو.',
    elder: { name: 'كينجي تاكاهاشي', title: 'كبير مستشاري التكتل في طوكيو', initials: 'كت' },
    operations: { name: 'المهندس هيروشي ساتو', title: 'مدير الجودة والتشغيل في يوكوهاما', initials: 'هس' },
    finance: { name: 'أكاري ياماموتو', title: 'مستشارة الائتمان وبورصة طوكيو', initials: 'أي' },
    logistics: { name: 'القبطان ريو ناكامورا', title: 'مدير أساطيل خليج طوكيو وناغويا', initials: 'رن' },
    rivals: [
      { id: 'jp-rival-1', name: 'مجموعة كانساي للصناعات الدقيقة', avatar: '🏭', activeSector: 'التصنيع الغذائي والإمداد', netWorth: 2_300_000 },
      { id: 'jp-rival-2', name: 'نيبون باسيفيك للملاحة البحرية', avatar: '🛳️', activeSector: 'موانئ يوكوهاما وناغويا', netWorth: 4_300_000 },
      { id: 'jp-rival-3', name: 'زايباتسو طوكيو للتقنية والمال', avatar: '⚡', activeSector: 'الإلكترونيات وبورصة طوكيو', netWorth: 8_200_000 },
    ],
    clients: [
      { name: 'متاجر طوكيو اليومية السريعة (Konbini)', type: 'budget', multiplier: 0.95, minimumQuality: 0, description: 'سحب يومي منتظم لآلاف الفروع في طوكيو ويوكوهاما.' },
      { name: 'مراكز التسوق الفاخرة في غينزا', type: 'quality', multiplier: 1.22, minimumQuality: 92, description: 'تشترط إتقاناً تاماً بالجودة مقابل أسعار ممتازة.' },
      { name: 'شبكة التوزيع الصناعي في أوساكا وناغويا', type: 'bulk', multiplier: 1.07, minimumQuality: 78, description: 'عقود جملة كبرى لتغطية الأرخبيل الياباني.' },
      { name: 'تموين سفن الشحن السريع بخليج طوكيو', type: 'urgent', multiplier: 1.3, minimumQuality: 72, description: 'توريد دقيق الموعد بعلاوة التزام وسمعة عالية.' },
    ],
  },

  jordan: {
    countryId: 'jordan',
    scenarioTitle: 'نهضة سحاب الصناعية وميناء العقبة ومنطقة التعدين',
    cityShort: 'عمان والعقبة',
    industrialHub: 'مدينة الملك عبدالله الثاني الصناعية · سحاب',
    portHub: 'منطقة العقبة الاقتصادية الخاصة (ASEZA)',
    bankName: 'البنك العربي · الأردن',
    exchangeName: 'بورصة عمان للأوراق المالية (ASE)',
    inheritedFactoryName: 'مصنع الأغذية النموذجي · سحاب',
    inheritedLandName: 'أرض المنطقة الصناعية المؤهلة · سحاب',
    starterLandOfferName: 'قطعة سحاب الصناعية الأولى',
    headline: 'بوابة الشام والخليج، وتفوق في الأدوية والتعدين واللوجستيات البحرية عبر خليج العقبة.',
    strengths: [
      'منطقة العقبة الحرة والمنفذ البحري الاستراتيجي على البحر الأحمر',
      'صناعات دوائية وتعدين بوتاس وفوسفات ذات سمعة وموثوقية إقليمية',
      'قطاع تكنولوجيا وخدمات مصرفية متطورة وكفاءات بشرية وهندسية عالية',
    ],
    challenges: [
      'كلفة استيراد الطاقة والمياه تتطلب إدارة تشغيلية متقدمة وحوكمة للهدر',
      'مصنع سحاب الموروث يعمل بنسبة 25% وقرض البنك العربي يستحق خلال 7 أيام',
    ],
    signatureSectors: ['الصناعات الغذائية والدوائية', 'التعدين والمواد البتروكيماوية', 'الخدمات اللوجستية والنقل البحري بالعقبة'],
    strategicTip: 'استغل المنفذ البحري بالعقبة لتصدير البضائع واستيراد الخامات بتكاليف شحن وجمرك مخفضة.',
    elder: { name: 'أبو طارق الهاشمي', title: 'عميد تجار عمان وسوق السكر', initials: 'طه' },
    operations: { name: 'المهندس ليث المجالي', title: 'كبير مهندسي مجمع سحاب الصناعي', initials: 'لم' },
    finance: { name: 'رانية القاسم', title: 'مستشارة الائتمان وبورصة عمان', initials: 'رق' },
    logistics: { name: 'الكابتن بشار العقباوي', title: 'مدير عمليات ميناء الحاويات بالعقبة', initials: 'بع' },
    rivals: [
      { id: 'jo-rival-1', name: 'شركة فوسفات وبوتاس الجنوب', avatar: '⛏️', activeSector: 'التعدين والكيماويات', netWorth: 2_150_000 },
      { id: 'jo-rival-2', name: 'مجموعة فيلادلفيا الدوائية والصناعية', avatar: '💊', activeSector: 'الصناعات الغذائية والدوائية', netWorth: 3_900_000 },
      { id: 'jo-rival-3', name: 'العقبة القابضة للملاحة والتجارة', avatar: '🛳️', activeSector: 'اللوجستيات والشحن وبورصة عمان', netWorth: 7_600_000 },
    ],
    clients: [
      { name: 'شبكة أسواق التموين في عمان والزرقاء', type: 'budget', multiplier: 0.96, minimumQuality: 0, description: 'سحب استهلاكي واسع ومستقر في أكبر مدن المملكة.' },
      { name: 'سلطة منطقة العقبة الاقتصادية والمستشفيات', type: 'quality', multiplier: 1.2, minimumQuality: 90, description: 'توريد معتمد بمواصفات قياسية وعلاوة جودة عالية.' },
      { name: 'مجمع سحاب اللوجستي للشحن الإقليمي', type: 'bulk', multiplier: 1.08, minimumQuality: 78, description: 'صفقات شحن وتوزيع كبرى للأسواق المجاورة.' },
      { name: 'تموين سفن الشحن بميناء الحاويات بالعقبة', type: 'urgent', multiplier: 1.28, minimumQuality: 75, description: 'عقود تموين بحري سريعة بعلاوة تسليم فورية.' },
    ],
  },
  palestine: {
    countryId: 'palestine',
    scenarioTitle: 'نهضة الأعمال الفلسطينية بين القدس ورام الله وغزة',
    cityShort: 'القدس ورام الله',
    industrialHub: 'منطقة بيت لحم الصناعية ومنطقة جنين الصناعية',
    portHub: 'ميناء غزة البحري والمعابر التجارية',
    bankName: 'بنك فلسطين',
    exchangeName: 'بورصة فلسطين (PEX)',
    inheritedFactoryName: 'مصنع الأغذية الفلسطيني · رام الله',
    inheritedLandName: 'أرض المنطقة الصناعية في بيت لحم',
    starterLandOfferName: 'قطعة إنتاجية في منطقة بيت لحم الصناعية',
    headline: 'سوق محلي متنوع يعتمد على الزراعة والصناعات الغذائية والخدمات والتجارة.',
    strengths: [
      'قاعدة زراعية وغذائية محلية تدعم سلاسل توريد قصيرة',
      'مراكز حضرية نشطة في القدس ورام الله ونابلس وغزة',
      'فرص نمو في الصناعات الخفيفة والخدمات واللوجستيات',
    ],
    challenges: [
      'تحديات النقل والوصول التجاري قد تؤثر في زمن التوريد',
      'حافظ على احتياطي نقدي لمواجهة تقلب الطلب وتكاليف التشغيل',
    ],
    signatureSectors: ['الأغذية والزراعة', 'الصناعات الخفيفة', 'الخدمات واللوجستيات'],
    strategicTip: 'ابدأ بعقود الغذاء والمواد الاستهلاكية، ثم وسّع الطاقة الإنتاجية بعد استقرار التدفق النقدي.',
    elder: { name: 'لي وي', title: 'مستشار الأعمال في شنغهاي', initials: 'عخ' },
    operations: { name: 'المهندسة ليان شاهين', title: 'مديرة تشغيل منطقة بيت لحم الصناعية', initials: 'لش' },
    finance: { name: 'د. سامر البرغوثي', title: 'مستشار التمويل وبورصة فلسطين', initials: 'سب' },
    logistics: { name: 'الكابتن يزن الكرمي', title: 'مدير الإمداد والتوزيع المحلي', initials: 'يك' },
    rivals: [
      { id: 'ps-rival-1', name: 'مجموعة القدس للصناعات الغذائية', avatar: '🌿', activeSector: 'الأغذية والزراعة', netWorth: 1_300_000 },
      { id: 'ps-rival-2', name: 'شركة الساحل للخدمات اللوجستية', avatar: '🚚', activeSector: 'النقل والتوزيع', netWorth: 2_100_000 },
      { id: 'ps-rival-3', name: 'تكتل الزيتون للصناعات الخفيفة', avatar: '🏭', activeSector: 'الصناعات الخفيفة', netWorth: 3_400_000 },
    ],
    clients: [
      { name: 'أسواق القدس التعاونية', type: 'budget', multiplier: 0.95, minimumQuality: 0, description: 'توريد سلع أساسية لمتاجر الأحياء في القدس.' },
      { name: 'فنادق بيت لحم والقدس', type: 'quality', multiplier: 1.16, minimumQuality: 88, description: 'توريدات غذائية وخدمات بجودة مرتفعة.' },
      { name: 'مراكز التوزيع في نابلس', type: 'bulk', multiplier: 1.04, minimumQuality: 72, description: 'عقود جملة لتغذية الأسواق المحلية.' },
      { name: 'مؤسسات الإغاثة والخدمات المجتمعية', type: 'urgent', multiplier: 1.22, minimumQuality: 68, description: 'طلبات عاجلة للمواد الأساسية والخدمات.' },
    ],
  },
  china: {
    countryId: 'china',
    scenarioTitle: 'نهضة الأعمال الالصينية بين شنغهاي وشنتشن وشنغهاي',
    cityShort: 'شنغهاي وشنتشن',
    industrialHub: 'منطقة سوتشو الصناعية ومنطقة جنين الصناعية',
    portHub: 'ميناء شنغهاي البحري والمعابر التجارية',
    bankName: 'بنك الصين',
    exchangeName: 'بورصة الصين (PEX)',
    inheritedFactoryName: 'مصنع الأغذية الالصيني · شنتشن',
    inheritedLandName: 'أرض المنطقة الصناعية في سوتشو',
    starterLandOfferName: 'قطعة إنتاجية في منطقة سوتشو الصناعية',
    headline: 'سوق محلي متنوع يعتمد على الزراعة والصناعات الغذائية والخدمات والتجارة.',
    strengths: [
      'قاعدة زراعية وغذائية محلية تدعم سلاسل توريد قصيرة',
      'مراكز حضرية نشطة في شنغهاي وشنتشن وبكين وشنغهاي',
      'فرص نمو في الصناعات الخفيفة والخدمات واللوجستيات',
    ],
    challenges: [
      'تحديات النقل والوصول التجاري قد تؤثر في زمن التوريد',
      'حافظ على احتياطي نقدي لمواجهة تقلب الطلب وتكاليف التشغيل',
    ],
    signatureSectors: ['الأغذية والزراعة', 'الصناعات الخفيفة', 'الخدمات واللوجستيات'],
    strategicTip: 'ابدأ بعقود الغذاء والمواد الاستهلاكية، ثم وسّع الطاقة الإنتاجية بعد استقرار التدفق النقدي.',
    elder: { name: 'أبو عادل الخالدي', title: 'مستشار الأعمال في شنتشن', initials: 'عخ' },
    operations: { name: 'المهندسة ليان شاهين', title: 'مديرة تشغيل منطقة سوتشو الصناعية', initials: 'لش' },
    finance: { name: 'د. سامر البرغوثي', title: 'مستشار التمويل وبورصة الصين', initials: 'سب' },
    logistics: { name: 'الكابتن يزن الكرمي', title: 'مدير الإمداد والتوزيع المحلي', initials: 'يك' },
    rivals: [
      { id: 'cn-rival-1', name: 'مجموعة شنغهاي للصناعات الغذائية', avatar: '🌿', activeSector: 'الأغذية والزراعة', netWorth: 1_300_000 },
      { id: 'cn-rival-2', name: 'شركة الساحل للخدمات اللوجستية', avatar: '🚚', activeSector: 'النقل والتوزيع', netWorth: 2_100_000 },
      { id: 'cn-rival-3', name: 'تكتل الزيتون للصناعات الخفيفة', avatar: '🏭', activeSector: 'الصناعات الخفيفة', netWorth: 3_400_000 },
    ],
    clients: [
      { name: 'أسواق شنغهاي التعاونية', type: 'budget', multiplier: 0.95, minimumQuality: 0, description: 'توريد سلع أساسية لمتاجر الأحياء في شنغهاي.' },
      { name: 'فنادق سوتشو وشنغهاي', type: 'quality', multiplier: 1.16, minimumQuality: 88, description: 'توريدات غذائية وخدمات بجودة مرتفعة.' },
      { name: 'مراكز التوزيع في بكين', type: 'bulk', multiplier: 1.04, minimumQuality: 72, description: 'عقود جملة لتغذية الأسواق المحلية.' },
      { name: 'مؤسسات الإغاثة والخدمات المجتمعية', type: 'urgent', multiplier: 1.22, minimumQuality: 68, description: 'طلبات عاجلة للمواد الأساسية والخدمات.' },
    ],
  },
  spain: {
    countryId: 'spain',
    scenarioTitle: 'نهضة الأعمال الإسبانياية بين مدريد وبرشلونة وبرشلونة',
    cityShort: 'مدريد وبرشلونة',
    industrialHub: 'منطقة فالنسيا الصناعية ومنطقة جنين الصناعية',
    portHub: 'ميناء برشلونة البحري والمعابر التجارية',
    bankName: 'بنك إسبانيا',
    exchangeName: 'بورصة إسبانيا (PEX)',
    inheritedFactoryName: 'مصنع الأغذية الإسبانياي · برشلونة',
    inheritedLandName: 'أرض المنطقة الصناعية في فالنسيا',
    starterLandOfferName: 'قطعة إنتاجية في منطقة فالنسيا الصناعية',
    headline: 'سوق محلي متنوع يعتمد على الزراعة والصناعات الغذائية والخدمات والتجارة.',
    strengths: [
      'قاعدة زراعية وغذائية محلية تدعم سلاسل توريد قصيرة',
      'مراكز حضرية نشطة في مدريد وبرشلونة وإشبيلية وبرشلونة',
      'فرص نمو في الصناعات الخفيفة والخدمات واللوجستيات',
    ],
    challenges: [
      'تحديات النقل والوصول التجاري قد تؤثر في زمن التوريد',
      'حافظ على احتياطي نقدي لمواجهة تقلب الطلب وتكاليف التشغيل',
    ],
    signatureSectors: ['الأغذية والزراعة', 'الصناعات الخفيفة', 'الخدمات واللوجستيات'],
    strategicTip: 'ابدأ بعقود الغذاء والمواد الاستهلاكية، ثم وسّع الطاقة الإنتاجية بعد استقرار التدفق النقدي.',
    elder: { name: 'كارلوس مارتين', title: 'مستشار الأعمال في برشلونة', initials: 'عخ' },
    operations: { name: 'المهندسة ليان شاهين', title: 'مديرة تشغيل منطقة فالنسيا الصناعية', initials: 'لش' },
    finance: { name: 'د. سامر البرغوثي', title: 'مستشار التمويل وبورصة إسبانيا', initials: 'سب' },
    logistics: { name: 'الكابتن يزن الكرمي', title: 'مدير الإمداد والتوزيع المحلي', initials: 'يك' },
    rivals: [
      { id: 'es-rival-1', name: 'مجموعة مدريد للصناعات الغذائية', avatar: '🌿', activeSector: 'الأغذية والزراعة', netWorth: 1_300_000 },
      { id: 'es-rival-2', name: 'شركة الساحل للخدمات اللوجستية', avatar: '🚚', activeSector: 'النقل والتوزيع', netWorth: 2_100_000 },
      { id: 'es-rival-3', name: 'تكتل الزيتون للصناعات الخفيفة', avatar: '🏭', activeSector: 'الصناعات الخفيفة', netWorth: 3_400_000 },
    ],
    clients: [
      { name: 'أسواق مدريد التعاونية', type: 'budget', multiplier: 0.95, minimumQuality: 0, description: 'توريد سلع أساسية لمتاجر الأحياء في مدريد.' },
      { name: 'فنادق فالنسيا ومدريد', type: 'quality', multiplier: 1.16, minimumQuality: 88, description: 'توريدات غذائية وخدمات بجودة مرتفعة.' },
      { name: 'مراكز التوزيع في إشبيلية', type: 'bulk', multiplier: 1.04, minimumQuality: 72, description: 'عقود جملة لتغذية الأسواق المحلية.' },
      { name: 'مؤسسات الإغاثة والخدمات المجتمعية', type: 'urgent', multiplier: 1.22, minimumQuality: 68, description: 'طلبات عاجلة للمواد الأساسية والخدمات.' },
    ],
  },
  russia: {
    countryId: 'russia',
    scenarioTitle: 'نهضة الأعمال الروسياية بين موسكو وسانت بطرسبرغ وموسكو',
    cityShort: 'موسكو وسانت بطرسبرغ',
    industrialHub: 'منطقة الأورال الصناعية ومنطقة جنين الصناعية',
    portHub: 'ميناء موسكو البحري والمعابر التجارية',
    bankName: 'بنك روسيا',
    exchangeName: 'بورصة روسيا (PEX)',
    inheritedFactoryName: 'مصنع الأغذية الروسياي · سانت بطرسبرغ',
    inheritedLandName: 'أرض المنطقة الصناعية في الأورال',
    starterLandOfferName: 'قطعة إنتاجية في منطقة الأورال الصناعية',
    headline: 'سوق محلي متنوع يعتمد على الزراعة والصناعات الغذائية والخدمات والتجارة.',
    strengths: [
      'قاعدة زراعية وغذائية محلية تدعم سلاسل توريد قصيرة',
      'مراكز حضرية نشطة في موسكو وسانت بطرسبرغ وقازان وموسكو',
      'فرص نمو في الصناعات الخفيفة والخدمات واللوجستيات',
    ],
    challenges: [
      'تحديات النقل والوصول التجاري قد تؤثر في زمن التوريد',
      'حافظ على احتياطي نقدي لمواجهة تقلب الطلب وتكاليف التشغيل',
    ],
    signatureSectors: ['الأغذية والزراعة', 'الصناعات الخفيفة', 'الخدمات واللوجستيات'],
    strategicTip: 'ابدأ بعقود الغذاء والمواد الاستهلاكية، ثم وسّع الطاقة الإنتاجية بعد استقرار التدفق النقدي.',
    elder: { name: 'أليكسي إيفانوف', title: 'مستشار الأعمال في سانت بطرسبرغ', initials: 'عخ' },
    operations: { name: 'المهندسة ليان شاهين', title: 'مديرة تشغيل منطقة الأورال الصناعية', initials: 'لش' },
    finance: { name: 'د. سامر البرغوثي', title: 'مستشار التمويل وبورصة روسيا', initials: 'سب' },
    logistics: { name: 'الكابتن يزن الكرمي', title: 'مدير الإمداد والتوزيع المحلي', initials: 'يك' },
    rivals: [
      { id: 'ru-rival-1', name: 'مجموعة موسكو للصناعات الغذائية', avatar: '🌿', activeSector: 'الأغذية والزراعة', netWorth: 1_300_000 },
      { id: 'ru-rival-2', name: 'شركة الساحل للخدمات اللوجستية', avatar: '🚚', activeSector: 'النقل والتوزيع', netWorth: 2_100_000 },
      { id: 'ru-rival-3', name: 'تكتل الزيتون للصناعات الخفيفة', avatar: '🏭', activeSector: 'الصناعات الخفيفة', netWorth: 3_400_000 },
    ],
    clients: [
      { name: 'أسواق موسكو التعاونية', type: 'budget', multiplier: 0.95, minimumQuality: 0, description: 'توريد سلع أساسية لمتاجر الأحياء في موسكو.' },
      { name: 'فنادق الأورال وموسكو', type: 'quality', multiplier: 1.16, minimumQuality: 88, description: 'توريدات غذائية وخدمات بجودة مرتفعة.' },
      { name: 'مراكز التوزيع في قازان', type: 'bulk', multiplier: 1.04, minimumQuality: 72, description: 'عقود جملة لتغذية الأسواق المحلية.' },
      { name: 'مؤسسات الإغاثة والخدمات المجتمعية', type: 'urgent', multiplier: 1.22, minimumQuality: 68, description: 'طلبات عاجلة للمواد الأساسية والخدمات.' },
    ],
  },
};
function buildStagesForSeed(seed: CountryFlavorSeed): readonly StoryStageSummary[] {
  return [
    { stageNumber: 1, title: `البداية المتعثرة في ${seed.cityShort}`, focus: `استلام سيولة الإنقاذ (10,000 $) وفحص ${seed.inheritedFactoryName}.`, unlockSection: 'home', requiredLevel: 1 },
    { stageNumber: 2, title: 'إصلاح الأصل الموروث وتأمين الأرض', focus: `رفع كفاءة الماكينات إلى 100% وضم أرض جديدة في ${seed.industrialHub}.`, unlockSection: 'companies', requiredLevel: 1 },
    { stageNumber: 3, title: 'سلاسل الإمداد ودوران الإنتاج', focus: 'شراء الحبوب والتغليف وتشغيل أول خط إنتاج فعلي.', unlockSection: 'production', requiredLevel: 2 },
    { stageNumber: 4, title: 'أول صفقة سوقية وعقود التجار', focus: `بيع البضائع وإبرام أول عقد رسمي مع عملاء ${seed.cityShort}.`, unlockSection: 'contracts', requiredLevel: 3 },
    { stageNumber: 5, title: 'حماية التدفق النقدي وتسوية الديون', focus: `سداد قرض ${seed.bankName} قبل نهاية مهلة الـ 7 أيام وتفادي توقف الطاقة.`, unlockSection: 'obligations', requiredLevel: 3 },
    { stageNumber: 6, title: `رفع التجميد البنكي ودخول ${seed.exchangeName}`, focus: `فتح تسهيلات ${seed.bankName} والودائع والانطلاق نحو الاستثمار المالي.`, unlockSection: 'bank', requiredLevel: 4 },
    { stageNumber: 7, title: 'بناء الفريق التنفيذي والحوكمة', focus: 'تعيين مدير تشغيل ومحاسب ومحامٍ لحماية الهوامش وتقليل الضرائب.', unlockSection: 'staff', requiredLevel: 5 },
    { stageNumber: 8, title: 'الأبحاث والأتمتة والهيبة التنفيذية', focus: 'تطوير تكنولوجيا المصانع الذكية وبناء أصول الهيبة.', unlockSection: 'tech_tree', requiredLevel: 6 },
    { stageNumber: 9, title: 'السيطرة الإقليمية والتحالفات', focus: 'الاستحواذ على حصص المدن وتأسيس الكارتيل التجاري.', unlockSection: 'territory', requiredLevel: 7 },
    { stageNumber: 10, title: `سيادة ${seed.portHub} والمشاريع القومية`, focus: 'امتلاك أساطيل الشحن والمناقصات السيادية وصناديق اليونيكورن.', unlockSection: 'maritime', requiredLevel: 10 },
  ];
}

function buildChaptersForSeed(seed: CountryFlavorSeed): readonly CampaignChapter[] {
  return [
    {
      id: 1,
      title: `خطة الإنقاذ في ${seed.industrialHub}`,
      subtitle: `الفصل الأول: استعادة الكرامة الصناعية في ${seed.cityShort}`,
      characterName: seed.elder.name,
      characterAvatar: '👔',
      characterTitle: seed.elder.title,
      dialogueText: `المنافسون في «${seed.rivals[0].name}» يراهنون على سقوطك قبل اليوم السابع! أصلح ${seed.inheritedFactoryName}، وسدّد قرض ${seed.bankName}، وأثبت للجميع أنك القائد الشرعي للإمبراطورية.`,
      objectiveText: 'امتلك شركتين أو طور أعمالك وحقق صافي أرباح بقيمة 15,000 $ في الفصل الأول',
      requiredLevel: 2,
      requiredCompanies: 1,
      requiredProfit: 15_000,
      rewardDiamonds: 15,
      rewardGoldGrams: 5,
      rewardTitle: `رائد ${seed.cityShort} الصاعد`,
      choices: [
        {
          id: `${seed.countryId}_c1_local_suppliers`,
          text: `توثيق شراكة مع موردي ${seed.industrialHub} المحليين`,
          effectDescription: 'رفع السمعة التجارية +5 ودعم نقدي تشغيلي +3,500 $',
          reputationDelta: 5,
          rewardMoney: 3_500,
        },
        {
          id: `${seed.countryId}_c1_quality_push`,
          text: 'الاستثمار في ضبط الجودة لكسب عقود الفئة الممتازة',
          effectDescription: 'مكافأة +8 ماسات إضافية لتسريع خطوط الإنتاج',
          rewardDiamonds: 8,
        },
      ],
    },
    {
      id: 2,
      title: `كسر الحصار المالي ودخول ${seed.exchangeName}`,
      subtitle: 'الفصل الثاني: التوسع الصناعي ورفع الحظر المصرفي',
      characterName: seed.finance.name,
      characterAvatar: '📊',
      characterTitle: seed.finance.title,
      dialogueText: `أداؤك المالي لفت أنظار ${seed.bankName}! الآن وقد اقتربنا من المستوى الخامس، تحالف «${seed.rivals[1].name}» يحاول احتكار عقود الطاقة. وسّع شركاتك لنفرض كلمتنا في ${seed.exchangeName}.`,
      objectiveText: 'بلوغ المستوى 5 وامتلاك شركتين مع تحقيق صافي أرباح 75,000 $',
      requiredLevel: 5,
      requiredCompanies: 2,
      requiredProfit: 75_000,
      rewardDiamonds: 30,
      rewardGoldGrams: 12,
      rewardTitle: `قطب الصناعة في ${seed.cityShort}`,
      choices: [
        {
          id: `${seed.countryId}_c2_energy_shield`,
          text: 'تأمين احتياطي تشغيلي لمواجهة تقلبات الطاقة',
          effectDescription: 'دعم سيولة +10,000 $ ورفع السمعة +5',
          rewardMoney: 10_000,
          reputationDelta: 5,
        },
        {
          id: `${seed.countryId}_c2_auction_expansion`,
          text: 'توجيه الفائض لاقتناص الفرص في المزادات الصناعية',
          effectDescription: 'مكافأة +15 ماسة استراتيجية',
          rewardDiamonds: 15,
        },
      ],
    },
    {
      id: 3,
      title: `معركة ${seed.portHub} والتجارة العابرة للحدود`,
      subtitle: 'الفصل الثالث: الأساطيل والتحالفات التجارية',
      characterName: seed.logistics.name,
      characterAvatar: '🚢',
      characterTitle: seed.logistics.title,
      dialogueText: `بوابات التصدير في ${seed.portHub} أصبحت ساحة المنافسة الحقيقية! بامتلاك 3 شركات وبلوغ المستوى 10، سنفتح خطوط الشحن البحري ونكسر احتكار «${seed.rivals[1].name}» نهائياً.`,
      objectiveText: 'بلوغ المستوى 10 وامتلاك 3 شركات مع تحقيق صافي أرباح 300,000 $',
      requiredLevel: 10,
      requiredCompanies: 3,
      requiredProfit: 300_000,
      rewardDiamonds: 60,
      rewardGoldGrams: 25,
      rewardTitle: `سيد موانئ ${seed.cityShort}`,
      choices: [
        {
          id: `${seed.countryId}_c3_fleet_launch`,
          text: `تدشين خط شحن مباشر من ${seed.portHub}`,
          effectDescription: 'رفع السمعة +12 ومكافأة +25,000 $',
          reputationDelta: 12,
          rewardMoney: 25_000,
        },
        {
          id: `${seed.countryId}_c3_global_hedge`,
          text: 'تنويع الاحتياطي بالماس والذهب للتحوط الدولي',
          effectDescription: 'مكافأة +30 ماسة إضافية',
          rewardDiamonds: 30,
        },
      ],
    },
    {
      id: 4,
      title: `عرش السيادة الاقتصادية في ${seed.cityShort}`,
      subtitle: 'الفصل الرابع: المناقصات العملاقة وصناديق اليونيكورن',
      characterName: seed.elder.name,
      characterAvatar: '👑',
      characterTitle: seed.elder.title,
      dialogueText: `لقد تحققت نبوءة والدتك! حتى «${seed.rivals[2].name}» يطلبون اليوم التحالف معك. حان وقت قيادة المناقصات السيادية ورعاية شركات المستقبل من عرش ${seed.exchangeName}.`,
      objectiveText: 'بلوغ المستوى 15 وامتلاك 4 شركات مع صافي أرباح 1,000,000 $',
      requiredLevel: 15,
      requiredCompanies: 4,
      requiredProfit: 1_000_000,
      rewardDiamonds: 120,
      rewardGoldGrams: 50,
      rewardTitle: 'الإمبراطور الاقتصادي الأعلى',
      choices: [
        {
          id: `${seed.countryId}_c4_sovereign_fund`,
          text: 'إطلاق ذراع استحواذ استراتيجي على المنافسين',
          effectDescription: 'مكافأة +75,000 $ نقدية لتعزيز السيولة السيادية',
          rewardMoney: 75_000,
        },
        {
          id: `${seed.countryId}_c4_legacy_foundation`,
          text: 'تأسيس وقف ابتكار وطني لقيادة الجيل القادم',
          effectDescription: 'سمعة قصوى +20 ومكافأة +50 ماسة ملكية',
          reputationDelta: 20,
          rewardDiamonds: 50,
        },
      ],
    },
  ];
}

function buildQuestsForSeed(seed: CountryFlavorSeed): readonly CountryStoryQuest[] {
  return [
    {
      id: `${seed.countryId}-quest-1-repair`,
      countryId: seed.countryId,
      stepNumber: 1,
      stageNumber: 2,
      title: `إعادة تأهيل ${seed.inheritedFactoryName}`,
      shortDescription: `ارفع كفاءة ماكينات المصنع الموروث من 25% إلى 100% من قسم الشركات لبدء خطة الإنقاذ في ${seed.cityShort}.`,
      icon: '⚙️',
      targetSection: 'companies',
      cashReward: 1_500,
      diamondReward: 3,
      briefing: {
        advisorRole: 'operations',
        pages: [
          `أهلاً بك في أرض الميدان بـ ${seed.industrialHub}. المصنع الذي تركته الإدارة السابقة يعاني إهمالاً شديداً وكفاءة خطوطه متوقفة عند 25% فقط.`,
          'إذا حاولنا تشغيل الإنتاج بهذه الحالة فستتعطل الماكينات وتهبط جودة السلع. ادخل الآن إلى قسم «الشركات»، وافتح لوحة شركاتك القائمة، واضغط بنفسك على زر صيانة المصنع.',
        ],
        goal: 'صيانة المصنع الموروث ورفع كفاءة الماكينات إلى 100%.',
        whyItMatters: 'الكفاءة الكاملة تحمي خط الإنتاج من التعطل المفاجئ وترفع جودة السلع لتلبية شروط كبار العملاء.',
        steps: [
          'انتقل إلى قسم «الشركات» من شريط التنقل أو لوحة القيادة.',
          'افتح لوحة «شركاتك القائمة» لمعاينة حالة المصنع الموروث (25%).',
          'اضغط على زر «صيانة المصنع» لتنفيذ الإصلاح الفعلي.',
        ],
        requiredResources: '1,500 $ من السيولة النقدية المتاحة (رصيد البداية 10,000 $).',
        expectedOutcome: 'ترتفع كفاءة المصنع إلى 100% وتصبح خطوطه جاهزة لاستقبال المواد الخام.',
        riskWarning: 'إهمال الصيانة تحت 25% يمنع تشغيل أوامر الإنتاج ويخفض جودة البضائع.',
      },
      isAvailable: () => true,
      isCompleted: (p) => p.companies.some((c) => (c.maintenanceCondition ?? 100) >= 90),
      getProgressText: (p) => {
        const cond = Math.round(p.companies[0]?.maintenanceCondition ?? 0);
        return `كفاءة المصنع الحالية: ${cond}% / 100%`;
      },
    },
    {
      id: `${seed.countryId}-quest-2-debt`,
      countryId: seed.countryId,
      stepNumber: 2,
      stageNumber: 2,
      title: `تسوية قيد ${seed.bankName} الموروث`,
      shortDescription: `سدّد القسط الموروث (2,100 $) من قسم الالتزامات لحماية طاقة المصنع وتنظيف سجلك المالي.`,
      icon: '🛡️',
      targetSection: 'obligations',
      cashReward: 1_800,
      diamondReward: 3,
      briefing: {
        advisorRole: 'finance',
        pages: [
          `راجعنا دفاتر المجموعة في ${seed.cityShort}: هناك قرض طارئ موروث بقيمة 2,100 $ لصالح ${seed.bankName} مشمول بمهلة سماح 7 أيام.`,
          'رغم أن قسم البنك مقفل حالياً بسبب التجميد الائتماني، يمكنك إبراء ذمتك فوراً من قسم «الالتزامات» المتاح لك، لتتفرغ للتوسع دون تهديد بتوقف الطاقة في اليوم السابع.',
        ],
        goal: `سداد القرض الموروث بقيمة 2,100 $ عبر قسم الالتزامات.`,
        whyItMatters: 'أي التزام متأخر غير مسدد يوقف إمداد الطاقة اليومي للمصانع ويجمد نمو الإمبراطورية.',
        steps: [
          'افتح قسم «الالتزامات» من القائمة.',
          'افتح لوحة «خريطة الالتزامات والديون» واستعرض القرض الموروث.',
          'اضغط على زر «سداد قسط طوعي» لإغلاق المديونية بالكامل.',
        ],
        requiredResources: '2,100 $ كاش لتسوية أصل القرض وفائدته.',
        expectedOutcome: 'إغلاق المديونية الموروثة بالكامل وحماية طاقة مصانعك من أي تجميد مستقبلي.',
        riskWarning: 'ترك القرض دون سيولة كافية عند اليوم السابع يحوله إلى التزام متأخر يوقف طاقة المصانع.',
      },
      isAvailable: (p) => computeUnlockedSections(p).includes('obligations'),
      isCompleted: (p) => {
        const activeLoans = p.banking?.loans?.filter((l) => l.status === 'active') ?? [];
        return activeLoans.length === 0 && p.payables === 0;
      },
      getProgressText: (p) => {
        const activeLoans = p.banking?.loans?.filter((l) => l.status === 'active') ?? [];
        return activeLoans.length === 0 ? 'تم إغلاق القرض الموروث بالكامل' : `متبقي قرض نشط بقيمة ${activeLoans[0].remainingBalance.toLocaleString('ar-EG')} $`;
      },
    },
    {
      id: `${seed.countryId}-quest-3-land`,
      countryId: seed.countryId,
      stepNumber: 3,
      stageNumber: 2,
      title: `حيازة أرض التوسع في ${seed.cityShort}`,
      shortDescription: `اشترِ «${seed.starterLandOfferName}» من قسم الأراضي لتأمين موقع للتوسع القادم.`,
      icon: '🏞️',
      targetSection: 'lands',
      cashReward: 1_500,
      diamondReward: 4,
      briefing: {
        advisorRole: 'elder',
        pages: [
          `مصنع واحد لا يصنع إمبراطورية يا بني! وجدنا فرصة ممتازة بسعر مدعوم للمستثمرين الجدد: «${seed.starterLandOfferName}» مقابل 3,600 $ فقط.`,
          'لاحظ قاعدة اقتصادية مهمة في عالم الأعمال: الأرض المشتراة اليوم تخضع لإجراءات نقل الملكية وتصبح جاهزة لتأسيس شركة في اليوم التالي، لذا فإن حجزها مبكراً خطوة ذكية.',
        ],
        goal: 'شراء قطعة أرض ثانية ترفع إجمالي أراضيك المملوكة إلى قطعتين.',
        whyItMatters: 'كل شركة جديدة تشترط أرضاً مملوكة غير مشغولة ومطابقة لنوع القطاع (صناعي أو زراعي أو تجاري).',
        steps: [
          'انتقل إلى قسم «الأراضي».',
          'اضغط على «فتح عرض البداية» لمعاينة المساحة والسعر ونوع الأرض.',
          'اضغط على «شراء الأرض نقدًا» لإتمام نقل الملكية.',
        ],
        requiredResources: '3,600 $ كاش لعرض البداية (أو عرض أرض مباشر).',
        expectedOutcome: 'ارتفاع أصولك العقارية إلى قطعتي أرض واكتساب نقاط خبرة تقربك من المستوى التالي.',
        riskWarning: 'إنفاق كل السيولة على أراضٍ باهظة قد يحرمك من سيولة شراء المواد الخام للتشغيل.',
      },
      isAvailable: (p) => computeUnlockedSections(p).includes('lands'),
      isCompleted: (p) => (p.lands?.length ?? 0) >= 2,
      getProgressText: (p) => `الأراضي المسجلة باسمك: ${p.lands?.length ?? 0} / 2`,
    },
    {
      id: `${seed.countryId}-quest-4-produce`,
      countryId: seed.countryId,
      stepNumber: 4,
      stageNumber: 3,
      title: 'تأمين الخامات وتشغيل خط الإنتاج الأول',
      shortDescription: 'اشترِ الحبوب ومواد التغليف من المخازن (أو التوريد الفوري) وأطلق أول أمر إنتاج للعبوات الغذائية.',
      icon: '🏭',
      targetSection: 'production',
      cashReward: 2_000,
      diamondReward: 5,
      briefing: {
        advisorRole: 'operations',
        pages: [
          `حان وقت دوران عجلة الإنتاج في ${seed.inheritedFactoryName}! وصفة العبوات الغذائية تحتاج إلى 4 كجم حبوب زراعية + 1 وحدة مواد تغليف + 6 وحدات طاقة لكل دفعة.`,
          'يمكنك شراء الحبوب والتغليف بأفضل سعر من «المواد الخام والمخازن» ثم تشغيل الدفعة من «المصانع والإنتاج»، أو استخدام التوريد والتشغيل الفوري بعد مراجعة التكلفة.',
        ],
        goal: 'إطلاق أول أمر إنتاج فعلي في مصنعك.',
        whyItMatters: 'الإنتاج يحول السيولة الساكنة إلى بضائع قابلة للبيع بربح صافٍ ويكسبك نقاط خبرة لفتح العقود.',
        steps: [
          'تأكد من توفر الحبوب الزراعية ومواد التغليف في قسم «المواد الخام والمخازن».',
          'انتقل إلى قسم «المصانع والإنتاج» وافتح لوحة «خطوط الإنتاج».',
          'حدد المصنع وعدد الدفعات ثم اضغط لتشغيل خط الإنتاج.',
        ],
        requiredResources: 'نحو 60–300 $ حسب عدد الدفعات لتغطية الخامات والطاقة والصيانة الوقائية.',
        expectedOutcome: 'جدولة أمر إنتاج فعلي يكتمل مع ترحيل اليوم ويضيف عبوات غذائية جاهزة لمخزنك.',
        riskWarning: 'تشغيل دفعات تفوق سعة المخزن أو الطاقة المتاحة سيُرفض لحماية مواردك.',
      },
      isAvailable: (p) => computeUnlockedSections(p).includes('production'),
      isCompleted: (p) => (p.productionOrders?.length ?? 0) > 0,
      getProgressText: (p) => `أوامر الإنتاج المسجلة: ${p.productionOrders?.length ?? 0} / 1`,
    },
    {
      id: `${seed.countryId}-quest-5-sell`,
      countryId: seed.countryId,
      stepNumber: 5,
      stageNumber: 4,
      title: `إتمام أول صفقة بيع في سوق ${seed.cityShort}`,
      shortDescription: 'انتظر اكتمال الإنتاج في اليوم التالي، ثم بِع العبوات الغذائية من قسم المخازن لتحقيق أول إيراد تجاري.',
      icon: '💰',
      targetSection: 'inventory',
      cashReward: 2_400,
      diamondReward: 5,
      briefing: {
        advisorRole: 'logistics',
        pages: [
          `السلع المخزنة في المستودع هي رأس مال مجمّد إلى أن تتحول إلى نقد في خزينتك! بمجرد ترحيل اليوم واكتمال أمر الإنتاج، ستجد العبوات الغذائية في قسم «المواد الخام والمخازن».`,
          `راقب السعر اليومي والطلب المتاح في سوق ${seed.cityShort}، ثم نفّذ أول عملية بيع لفتح باب «العقود والعملاء» في المرحلة التالية!`,
        ],
        goal: 'إكمال إنتاج شحنة وبيعها فعلياً في السوق المحلي.',
        whyItMatters: 'إتمام الإنتاج مع أول عملية بيع يفتح قسم «العقود والعملاء» تلقائياً ويحقق أول تدفق نقدي تشغيلي.',
        steps: [
          'إذا كان أمر الإنتاج لا يزال قيد التنفيذ، انتظر أو رحّل اليوم حتى يكتمل.',
          'افتح قسم «المواد الخام والمخازن» ثم لوحة «بيع المنتجات».',
          'حدد الكمية المناسبة للطلب اليومي واضغط «بيع بالسعر الحالي».',
        ],
        requiredResources: 'منتجات مكتملة الصنع داخل المخزن (مثل العبوات الغذائية).',
        expectedOutcome: 'تحصيل إيراد نقدي بعد الضريبة وفتح نظام العقود التجارية مع كبار العملاء.',
        riskWarning: 'محاولة بيع كمية تتجاوز حجم الطلب اليومي للسوق ستُرفض؛ بِع على قدر استيعاب السوق.',
      },
      isAvailable: (p) => computeUnlockedSections(p).includes('inventory'),
      isCompleted: (p) => (p.sales?.length ?? 0) > 0,
      getProgressText: (p) => `عمليات البيع المكتملة: ${p.sales?.length ?? 0} / 1`,
    },
    {
      id: `${seed.countryId}-quest-6-contract`,
      countryId: seed.countryId,
      stepNumber: 6,
      stageNumber: 6,
      title: `تسليم أول عقد رسمي ورفع حظر ${seed.bankName}`,
      shortDescription: `اقبل عقداً تجارياً مناسباً من قسم العقود وسلّم البضاعة المطلوبة بالموعد لرفع الحظر عن ${seed.bankName}.`,
      icon: '📜',
      targetSection: 'contracts',
      cashReward: 3_500,
      diamondReward: 8,
      briefing: {
        advisorRole: 'logistics',
        pages: [
          `سمعتك بدأت تنتشر بين تجار ${seed.cityShort}! قسم «العقود والعملاء» أصبح مفتوحاً الآن ويعرض طلبيات حقيقية من عملاء السوق المحلي.`,
          `إنجاز أول عقد وتسليمه قبل موعده النهائي سيقنع إدارة ${seed.bankName} برفع التجميد المصرفي فوراً وفتح قسم البنك والتمويل!`,
        ],
        goal: 'قبول عقد تجاري وتصنيع الكمية المطلوبة وتسليمها بنجاح قبل انتهاء المهلة.',
        whyItMatters: 'العقود تمنح علاوة ربح إضافية + نقاط سمعة تجارية + فتح قسم البنك والتمويل رسمياً.',
        steps: [
          'ادخل إلى قسم «العقود والعملاء» وراجع المنتج والكمية والجودة والمهلة.',
          'اقبل عقداً تستطيع إنتاجه (مثل عقد عبوات غذائية).',
          'وفّر الكمية المطلوبة في مخزنك ثم اضغط «تسليم العقد» من لوحة العقود النشطة.',
        ],
        requiredResources: 'مخزون مطابق للمنتج والكمية والحد الأدنى للجودة قبل يوم انتهاء العقد.',
        expectedOutcome: `تحصيل قيمة العقد + علاوة الالتزام + رفع التجميد عن قسم «البنك والتمويل».`,
        riskWarning: 'التأخر عن موعد التسليم يوقع غرامة 2,000 $ ويخصم 6 نقاط من سمعتك التجارية.',
      },
      isAvailable: (p) => computeUnlockedSections(p).includes('contracts'),
      isCompleted: (p) => p.contracts.some((c) => c.status === 'completed'),
      getProgressText: (p) => {
        const done = p.contracts.filter((c) => c.status === 'completed').length;
        const active = p.contracts.filter((c) => c.status === 'active').length;
        if (done > 0) return 'تم تسليم العقد الأول بنجاح!';
        if (active > 0) return `لديك ${active} عقد نشط بانتظار التسليم اليدوي`;
        return 'لم يتم تسليم عقد بعد (0 / 1)';
      },
    },
  ];
}

function buildEconomicEventsForSeed(seed: CountryFlavorSeed): readonly EconomicEventTemplate[] {
  const exportTitle = seed.eventExportTitle ?? `فرصة تصدير عبر ${seed.portHub}`;
  return [
    {
      title: `طلب محلي مرتفع في ${seed.cityShort}`,
      description: `يزداد الطلب اليومي على عبوات الأغذية في أسواق ${seed.cityShort} بنسبة ٢٠٪ لمدة ٣ أيام.`,
      cashImpact: 18_000,
      industryId: 'food',
      productId: 'food-pack',
      demandMultiplier: 1.2,
      durationDays: 3,
    },
    {
      title: `ضغط لوجستي في ${seed.portHub}`,
      description: `يرتفع سعر وقود التشغيل بنسبة ١٠٪ لمدة يومين بسبب ازدحام الشحن في ${seed.portHub}.`,
      cashImpact: -14_000,
      industryId: 'transport',
      materialId: 'fuel',
      materialPriceMultiplier: 1.1,
      durationDays: 2,
    },
    {
      title: `يوم استقرار اقتصادي في ${seed.cityShort}`,
      description: `مؤشرات ${seed.exchangeName} وسلاسل التوريد مستقرة اليوم دون صدمات سعرية إضافية.`,
      cashImpact: 0,
    },
    {
      title: `حافز دعم صناعي في ${seed.industrialHub}`,
      description: `منحة تحفيزية لدعم خطوط الإنتاج الغذائي المنتظمة في ${seed.industrialHub}.`,
      cashImpact: 26_000,
      industryId: 'food',
    },
    {
      title: 'نقص مؤقت في الفولاذ الصناعي',
      description: `تراجع المعروض من الفولاذ في ${seed.cityShort} يرفع سعره بنسبة ٢٥٪ لمدة ٤ أيام.`,
      cashImpact: -22_000,
      industryId: 'construction',
      materialId: 'steel',
      materialPriceMultiplier: 1.25,
      durationDays: 4,
    },
    {
      title: exportTitle,
      description: `طلبيات خارجية عبر ${seed.portHub} ترفع الطلب على الأجهزة الإلكترونية بنسبة ٢٠٪ لمدة ٣ أيام.`,
      cashImpact: 34_000,
      industryId: 'electronics',
      productId: 'electronics',
      demandMultiplier: 1.2,
      durationDays: 3,
    },
    {
      title: 'مراجعة امتثال ومعايير بيئية',
      description: `رسوم فحص تنظيمي ومعايير سلامة إضافية على المنشآت النفطية في ${seed.industrialHub}.`,
      cashImpact: -18_000,
      industryId: 'petroleum',
    },
    {
      title: `موسم تجاري مزدهر في ${seed.cityShort}`,
      description: `انتعاش القوة الشرائية يرفع الطلب على العبوات الغذائية بنسبة ٢٥٪ لمدة ٥ أيام.`,
      cashImpact: 42_000,
      industryId: 'food',
      productId: 'food-pack',
      demandMultiplier: 1.25,
      durationDays: 5,
    },
  ];
}

function buildStoryAlertsForSeed(seed: CountryFlavorSeed): readonly CountryStoryAlert[] {
  return [
    {
      id: `${seed.countryId}_alert_raw_materials`,
      countryId: seed.countryId,
      advisorRole: 'operations',
      urgencyLevel: 'high',
      speechBubble: `تحذير تشغيلي من ${seed.industrialHub}: تجار الجملة يتوقعون تحركاً في أسعار الحبوب والتغليف غداً. راجع مخزونك في المستودع وأمّن احتياجات خط الإنتاج بذكاء.`,
      actionText: 'مراجعة المواد الخام والمخزن 📦',
      targetSection: 'inventory',
      rewardText: 'حماية خط الإنتاج من التوقف ونقص المدخلات',
      requiresActiveCompany: true,
    },
    {
      id: `${seed.countryId}_alert_maintenance`,
      countryId: seed.countryId,
      advisorRole: 'operations',
      urgencyLevel: 'medium',
      speechBubble: `تقرير فني من ${seed.inheritedFactoryName}: فحص كفاءة الماكينات بانتظام يحافظ على جودة السلع فوق 90% ويحميك من رفض العقود.`,
      actionText: 'فحص كفاءة الشركات ⚙️',
      targetSection: 'companies',
      rewardText: 'ضمان أعلى جودة إنتاج وربحية بيع',
      requiresActiveCompany: true,
    },
    {
      id: `${seed.countryId}_alert_contracts`,
      countryId: seed.countryId,
      advisorRole: 'logistics',
      urgencyLevel: 'opportunity',
      speechBubble: `فرصة تجارية في ${seed.cityShort}! كبار المشترين عبر ${seed.portHub} طرحوا عقود توريد بعلاوات مجزية لمن يلتزم بموعد التسليم.`,
      actionText: 'استعراض العقود المتاحة 📜',
      targetSection: 'contracts',
      rewardText: 'علاوة نقدية فورية + نقاط سمعة تجارية',
      requiresContractUnlock: true,
    },
    {
      id: `${seed.countryId}_alert_banking`,
      countryId: seed.countryId,
      advisorRole: 'finance',
      urgencyLevel: 'opportunity',
      speechBubble: `تحديث مصرفي من ${seed.bankName}: يمكنك استثمار السيولة الفائضة عن حاجة التشغيل في ودائع قصيرة الأجل بدلاً من تركها مجمدة بلا عائد.`,
      actionText: 'فتح البنك والتمويل 🏦',
      targetSection: 'bank',
      rewardText: 'عائد فائدة مضمون عند الاستحقاق',
      requiresBankUnlock: true,
    },
    {
      id: `${seed.countryId}_alert_stocks`,
      countryId: seed.countryId,
      advisorRole: 'finance',
      urgencyLevel: 'opportunity',
      speechBubble: `حركة نشطة في ${seed.exchangeName}! الصناديق اللوجستية وسندات الخزينة تسجل عوائد جاذبة لمن يملك فائضاً نقدياً فوق سيولة التشغيل.`,
      actionText: 'فتح الاستثمارات والبورصة 📈',
      targetSection: 'investments',
      rewardText: 'تنويع مصادر الدخل خارج المصانع',
      requiresStockUnlock: true,
    },
  ];
}

function createScenarioFromSeed(seed: CountryFlavorSeed): CountryScenarioDefinition {
  const advisors: Record<AdvisorRole, ScenarioAdvisor> = {
    elder: {
      id: `${seed.countryId}-advisor-elder`,
      role: 'elder',
      name: seed.elder.name,
      title: seed.elder.title,
      avatarEmoji: '👔',
      initials: seed.elder.initials,
      accentGradient: 'from-amber-500 to-yellow-600',
    },
    operations: {
      id: `${seed.countryId}-advisor-ops`,
      role: 'operations',
      name: seed.operations.name,
      title: seed.operations.title,
      avatarEmoji: '👷‍♂️',
      initials: seed.operations.initials,
      accentGradient: 'from-cyan-500 to-blue-600',
    },
    finance: {
      id: `${seed.countryId}-advisor-fin`,
      role: 'finance',
      name: seed.finance.name,
      title: seed.finance.title,
      avatarEmoji: '💼',
      initials: seed.finance.initials,
      accentGradient: 'from-emerald-500 to-teal-600',
    },
    logistics: {
      id: `${seed.countryId}-advisor-log`,
      role: 'logistics',
      name: seed.logistics.name,
      title: seed.logistics.title,
      avatarEmoji: '🚢',
      initials: seed.logistics.initials,
      accentGradient: 'from-indigo-500 to-purple-600',
    },
  };

  return {
    countryId: seed.countryId,
    scenarioTitle: seed.scenarioTitle,
    economicProfile: {
      headline: seed.headline,
      strengths: seed.strengths,
      challenges: seed.challenges,
      signatureSectors: seed.signatureSectors,
      bankName: seed.bankName,
      exchangeName: seed.exchangeName,
      industrialHub: seed.industrialHub,
      portHub: seed.portHub,
      inheritedFactoryName: seed.inheritedFactoryName,
      inheritedLandName: seed.inheritedLandName,
      strategicTip: seed.strategicTip,
    },
    advisors,
    stages: buildStagesForSeed(seed),
    chapters: buildChaptersForSeed(seed),
    rivals: seed.rivals,
    quests: buildQuestsForSeed(seed),
    clients: seed.clients,
    economicEvents: buildEconomicEventsForSeed(seed),
    storyAlerts: buildStoryAlertsForSeed(seed),
  };
}

export const COUNTRY_SCENARIOS: Record<CountryId, CountryScenarioDefinition> = {
  egypt: createScenarioFromSeed(COUNTRY_SEEDS.egypt),
  saudi: createScenarioFromSeed(COUNTRY_SEEDS.saudi),
  uae: createScenarioFromSeed(COUNTRY_SEEDS.uae),
  usa: createScenarioFromSeed(COUNTRY_SEEDS.usa),
  kuwait: createScenarioFromSeed(COUNTRY_SEEDS.kuwait),
  qatar: createScenarioFromSeed(COUNTRY_SEEDS.qatar),
  uk: createScenarioFromSeed(COUNTRY_SEEDS.uk),
  germany: createScenarioFromSeed(COUNTRY_SEEDS.germany),
  japan: createScenarioFromSeed(COUNTRY_SEEDS.japan),
  jordan: createScenarioFromSeed(COUNTRY_SEEDS.jordan),
  palestine: createScenarioFromSeed(COUNTRY_SEEDS.palestine),
  china: createScenarioFromSeed(COUNTRY_SEEDS.china),
  spain: createScenarioFromSeed(COUNTRY_SEEDS.spain),
  russia: createScenarioFromSeed(COUNTRY_SEEDS.russia),
};

export function getCountryScenario(countryId?: CountryId): CountryScenarioDefinition {
  const id = countryId && countryId in COUNTRY_SCENARIOS ? countryId : 'egypt';
  return COUNTRY_SCENARIOS[id];
}

/**
 * Returns only story advisor alerts that strictly belong to the player's country
 * AND whose target section and prerequisites are already unlocked.
 */
export function getEligibleStoryAlerts(profile: PlayerProfile): CountryStoryAlert[] {
  const scenario = getCountryScenario(profile.countryId);
  const unlocked = new Set(computeUnlockedSections(profile));

  return scenario.storyAlerts.filter((alert) => {
    if (alert.countryId !== profile.countryId) return false;
    if (!unlocked.has(alert.targetSection)) return false;
    if (alert.requiresActiveCompany && profile.companies.length === 0) return false;
    if (alert.requiresContractUnlock && !unlocked.has('contracts')) return false;
    if (alert.requiresBankUnlock && !unlocked.has('bank')) return false;
    if (alert.requiresStockUnlock && !unlocked.has('investments')) return false;
    return true;
  });
}

export function getCountryEconomicEvent(day: number, countryId?: CountryId): EconomicEventTemplate {
  const scenario = getCountryScenario(countryId);
  const events = scenario.economicEvents;
  const baseIndex = Math.max(0, Math.floor(day) - 1) % events.length;
  return events[baseIndex];
}
