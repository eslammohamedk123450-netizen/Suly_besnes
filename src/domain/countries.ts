export type CurrencyCode = string;
export type CountryId =
  | 'egypt'
  | 'saudi'
  | 'uae'
  | 'usa'
  | 'kuwait'
  | 'qatar'
  | 'uk'
  | 'germany'
  | 'japan'
  | 'jordan';

export type IndustryId =
  | 'petroleum'
  | 'electricity'
  | 'gas'
  | 'water'
  | 'detergents'
  | 'food'
  | 'construction'
  | 'electronics'
  | 'transport';

export interface CountryDefinition {
  id: CountryId;
  name: string;
  flag: string;
  storyTitle: string;
  storySummary: string;
  storyFull: [string, string, string];
  currency: {
    code: CurrencyCode;
    symbol: string;
    name: string;
  };
  startingBalance: number;
  startingBalanceEgpEquivalent: number;
  economy: {
    /** Exchange rate normalized to USD (1.0 for all) */
    exchangeRateToEgp: number;
    /** Simulation-only company formation fee in USD */
    companySetupFee: number;
    /** Simulation-only licence prices by industry in USD */
    licenseFeesByIndustry: Record<IndustryId, number>;
    /** Applied to taxable sales and selected day events */
    taxRate: number;
    customsRate: number;
    operatingCostMultiplier: number;
  };
}

function buildIndustryFees(): Record<IndustryId, number> {
  return {
    petroleum: 3_500,
    electricity: 2_600,
    gas: 3_000,
    water: 2_200,
    detergents: 1_400,
    food: 1_200,
    construction: 1_800,
    electronics: 2_400,
    transport: 1_500,
  };
}

export const COUNTRIES: readonly CountryDefinition[] = [
  // 1. Egypt
  {
    id: 'egypt',
    name: 'جمهورية مصر العربية',
    flag: '🇪🇬',
    storyTitle: 'الإرث وتحدي العاشر من رمضان والقاهرة',
    storySummary: 'طردتك عائلتك ذات النفوذ من القصر بتهمة الجبن والفشل المالي. سرّبت لك أمك 25,000$ كاش لتثبت جدارتك وتبني إمبراطوريتك من جديد.',
    storyFull: [
      'أهلًا بك يا بني… لقد قرر والدك وإخوتك طردك نهائياً من العائلة وتجريدك من كل شيء، واعتبروك فاشلاً لا يستطيع إدارة أموال العائلة.',
      'لكنني مؤمنة بك! تسللت إليك سراً وأعطيتك خمسة وعشرين ألف دولار (25,000$) كانت مدخراتي الخاصة… اذهب إلى العاشر من رمضان وموانئ السويس وبورسعيد وابنِ إمبراطورية تهز الأسواق!',
      'لا ترجع إلينا إلا وأنت الأسطورة المالية التي يركع لها المنافسون وتثبت لوالدك أنك السند الحقيقي والقائد الأعظم.',
    ],
    currency: { code: 'USD', symbol: '$', name: 'الدولار الأمريكي' },
    startingBalance: 25_000,
    startingBalanceEgpEquivalent: 25_000,
    economy: {
      exchangeRateToEgp: 1.0,
      companySetupFee: 2_000,
      licenseFeesByIndustry: buildIndustryFees(),
      taxRate: 0.12,
      customsRate: 0.02,
      operatingCostMultiplier: 1.0,
    },
  },

  // 2. Saudi Arabia
  {
    id: 'saudi',
    name: 'المملكة العربية السعودية',
    flag: '🇸🇦',
    storyTitle: 'تحدي الرياض ومشاريع المملكة الكبرى',
    storySummary: 'طردتك العائلة من مجلس الرياض المرموق. سلّمتك أمك 25,000$ لتتصدى للتحدي وتقتحم مدن الصناعة والجبيل وسدير.',
    storyFull: [
      'يا بني… اتهمك أهلك في الرياض بعدم الكفاءة الماليّة، وجرّدوك من مناصب العائلة وطردوك من المجلس الكبير.',
      'لكن قلبي معك! هربت لك سراً 25,000 دولار كاش… انطلق نحو مدن الرياض الصناعية وموانئ جدة والجبيل!',
      'اقتحم مشاريع الرؤية والتعدين والعقارات المليارية وأثبت لوالدك وعائلتك أنك أقوى تجار المملكة القادمون!',
    ],
    currency: { code: 'USD', symbol: '$', name: 'الدولار الأمريكي' },
    startingBalance: 25_000,
    startingBalanceEgpEquivalent: 25_000,
    economy: {
      exchangeRateToEgp: 1.0,
      companySetupFee: 2_000,
      licenseFeesByIndustry: buildIndustryFees(),
      taxRate: 0.15,
      customsRate: 0.03,
      operatingCostMultiplier: 1.05,
    },
  },

  // 3. United Arab Emirates
  {
    id: 'uae',
    name: 'الإمارات العربية المتحدة',
    flag: '🇦🇪',
    storyTitle: 'أبراج دبي وموانئ جبل علي وأبوظبي',
    storySummary: 'جرّدتك عائلتك من حصتك في شركات دبي. زوّدتك أمك بـ 25,000$ لتنطلق في موانئ جبل علي الحرة وكيزاد بأبوظبي.',
    storyFull: [
      'سحب إخوتك ووالدك كل صلاحياتك في مكاتب دبي الفاخرة، ووصفوك بالعجز المالي وطردوك من مجالس الإدارة.',
      'لكنني أعلم أنك العقل المالي الحقيقي! حولت لك سراً 25,000 دولار أمريكي… اتجه فوراً إلى منطقة جبل علي الحرة JAFZA وموانئ أبوظبي!',
      'ابنِ مجمعاتك اللوجستية وتداول في بورصة دبي العالمية حتى تستعيد مكانتك وتجبر الجميع على احترامك.',
    ],
    currency: { code: 'USD', symbol: '$', name: 'الدولار الأمريكي' },
    startingBalance: 25_000,
    startingBalanceEgpEquivalent: 25_000,
    economy: {
      exchangeRateToEgp: 1.0,
      companySetupFee: 2_200,
      licenseFeesByIndustry: buildIndustryFees(),
      taxRate: 0.09,
      customsRate: 0.02,
      operatingCostMultiplier: 1.1,
    },
  },

  // 4. USA
  {
    id: 'usa',
    name: 'الولايات المتحدة الأمريكية',
    flag: '🇺🇸',
    storyTitle: 'وول ستريت ووادي السيليكون',
    storySummary: 'طُردت من قصر العائلة بنيويورك. سلّمتك والدتك 25,000$ لتقتحم وول ستريت ومراكز التكنولوجيا بهيوستن وشيكاغو.',
    storyFull: [
      'لقد طردك والدك وإخوتك من قصر نيويورك وسحبوا منك جميع البطاقات، معتبرين أنك فاشل ولا تفهم شيئاً في لغة المليارات.',
      'ولكنني أعلم معدنك الحقيقي! حولت لك سراً 25,000 دولار أمريكي… اتجه إلى وادي السيليكون ووول ستريت وهي Houston Energy Corridor!',
      'تداول، وابنِ شركاتك، واحتل الأسهم العالمية حتى يعلم الجميع أنك الأسطورة المالية القادمة التي تهز العالم.',
    ],
    currency: { code: 'USD', symbol: '$', name: 'الدولار الأمريكي' },
    startingBalance: 25_000,
    startingBalanceEgpEquivalent: 25_000,
    economy: {
      exchangeRateToEgp: 1.0,
      companySetupFee: 2_500,
      licenseFeesByIndustry: buildIndustryFees(),
      taxRate: 0.21,
      customsRate: 0.02,
      operatingCostMultiplier: 1.15,
    },
  },

  // 5. Kuwait
  {
    id: 'kuwait',
    name: 'دولة الكويت',
    flag: '🇰🇼',
    storyTitle: 'ديوانية العاصمة واستثمارات الشويخ والأحمدي',
    storySummary: 'طُرِدت من ديوانية العائلة بالعاصمة. أعطتك أمك 25,000$ لتثبت نجاحك في منطقة الشويخ وميناء الأحمدي.',
    storyFull: [
      'حرمتك العائلة من نصيبك في تجارة العاصمة وطردوك من الديوانية بتهمة عدم الكفاءة المالية.',
      'لكن أُمك لن تتركك! حولت لك 25,000 دولار أمريكي كاش… ابدأ فوراً في الاستثمار!',
      'اقتحم مجمعات الشويخ ومشاريع النفط بالأحمدي والبورصة لتصبح الرقم الأهم والملياردير الأول في السوق.',
    ],
    currency: { code: 'USD', symbol: '$', name: 'الدولار الأمريكي' },
    startingBalance: 25_000,
    startingBalanceEgpEquivalent: 25_000,
    economy: {
      exchangeRateToEgp: 1.0,
      companySetupFee: 2_000,
      licenseFeesByIndustry: buildIndustryFees(),
      taxRate: 0.15,
      customsRate: 0.03,
      operatingCostMultiplier: 1.05,
    },
  },

  // 6. Qatar
  {
    id: 'qatar',
    name: 'دولة قطر',
    flag: '🇶🇦',
    storyTitle: 'مشاريع الدوحة والغاز برأس لفان',
    storySummary: 'طُرِدت من مجلس العائلة بالدوحة. سلّمتك أمك 25,000$ لتقتحم مشاريع رأس لفان والمنطقة الصناعية وميناء حمد.',
    storyFull: [
      'تم طردك من مجلس العائلة بالدوحة واعتبارك غير قادر على مواكبة صفقات العائلة الضخمة وتسيير أموالها.',
      'سلّمتك سراً 25,000 دولار أمريكي… انطلق في أسواق الدوحة واللؤلؤة ورأس لفان وميناء حمد!',
      'شيد المصانع والعقارات وأعد صياغة تاريخ العائلة بأسلوبك الاستثماري الفذ والسيطرة الشاملة.',
    ],
    currency: { code: 'USD', symbol: '$', name: 'الدولار الأمريكي' },
    startingBalance: 25_000,
    startingBalanceEgpEquivalent: 25_000,
    economy: {
      exchangeRateToEgp: 1.0,
      companySetupFee: 2_100,
      licenseFeesByIndustry: buildIndustryFees(),
      taxRate: 0.1,
      customsRate: 0.03,
      operatingCostMultiplier: 1.05,
    },
  },

  // 7. United Kingdom
  {
    id: 'uk',
    name: 'المملكة المتحدة (بريطانيا)',
    flag: '🇬🇧',
    storyTitle: 'قلعة لندن وحي السيتي وترافورد مانشستر',
    storySummary: 'طُرِدت من القصر بمدينة لندن. زودتك أمك بـ 25,000$ لتقتحم حي كاناري وارف ومجمعات مانشستر الصناعية.',
    storyFull: [
      'طردتك عائلتك الأرستقراطية من قصر لندن ووصفوك بعدم القدرة على إدارة ثرواتهم الضخمة.',
      'لكنني معك! حولت لك 25,000 دولار أمريكي… اتجه فوراً لـ City of London ومجمعات مانشستر وليفربول!',
      'استثمر في التجارة البحرية والأسهم والشركات لتجبرهم على احترام إمبراطوريتك وإعادة اعتبارك أمام الجميع.',
    ],
    currency: { code: 'USD', symbol: '$', name: 'الدولار الأمريكي' },
    startingBalance: 25_000,
    startingBalanceEgpEquivalent: 25_000,
    economy: {
      exchangeRateToEgp: 1.0,
      companySetupFee: 2_300,
      licenseFeesByIndustry: buildIndustryFees(),
      taxRate: 0.19,
      customsRate: 0.02,
      operatingCostMultiplier: 1.1,
    },
  },

  // 8. Germany
  {
    id: 'germany',
    name: 'ألمانيا والاتحاد الأوروبي',
    flag: '🇩🇪',
    storyTitle: 'صناعات الرور والقلاع الألمانية',
    storySummary: 'طُرِدت من فرانكفورت متهماً بالفشل. سلمتك أمك 25,000$ لتغزو قلاع الصناعة في حزام الرور وميناء هامبورغ.',
    storyFull: [
      'اتهمتك العائلة بفرانكفورت بالضعف وعدم الفهم في الصناعة، وطردوك دون فلس واحد من أموال القصر.',
      'سلّمتك سراً 25,000 دولار أمريكي… انطلق إلى قلاع حزام الرور الصناعي وميناء هامبورغ وميونيخ!',
      'أطلق خطوط الإنتاج والحلول الذكية لتبرهن للجميع أنك العقل المدبر الحقيقي والمستثمر الأقوى في أوروبا.',
    ],
    currency: { code: 'USD', symbol: '$', name: 'الدولار الأمريكي' },
    startingBalance: 25_000,
    startingBalanceEgpEquivalent: 25_000,
    economy: {
      exchangeRateToEgp: 1.0,
      companySetupFee: 2_300,
      licenseFeesByIndustry: buildIndustryFees(),
      taxRate: 0.19,
      customsRate: 0.02,
      operatingCostMultiplier: 1.1,
    },
  },

  // 9. Japan
  {
    id: 'japan',
    name: 'كوكب اليابان',
    flag: '🇯🇵',
    storyTitle: 'ابتكارات خليج طوكيو ويوكوهاما وأوساكا',
    storySummary: 'طُرِدت من مقر طوكيو. أعطتك أمك 25,000$ لتستثمر في التكنولوجيا والأتمتة بخليج طوكيو ويوكوهاما.',
    storyFull: [
      'طردك والدك وكبار العائلة في طوكيو واعتبروك غير مؤهل لإدارة التكتلات التقنية المعقدة.',
      'هربت لك سراً 25,000 دولار أمريكي… ابدأ في مجمعات خليج طوكيو وموانئ يوكوهاما الصناعية!',
      'ابنِ إمبراطورية يابانية تكنولوجية لا تُقهر لتثبت للعائلة أن المستقبل بيدك وأنك الأسطورة التي لا تتكرر.',
    ],
    currency: { code: 'USD', symbol: '$', name: 'الدولار الأمريكي' },
    startingBalance: 25_000,
    startingBalanceEgpEquivalent: 25_000,
    economy: {
      exchangeRateToEgp: 1.0,
      companySetupFee: 2_200,
      licenseFeesByIndustry: buildIndustryFees(),
      taxRate: 0.15,
      customsRate: 0.02,
      operatingCostMultiplier: 1.1,
    },
  },

  // 10. The Hashemite Kingdom of Jordan
  {
    id: 'jordan',
    name: 'المملكة الأردنية الهاشمية',
    flag: '🇯🇴',
    storyTitle: 'تحدي عمان وميناء العقبة ومنطقة التعدين',
    storySummary: 'طردتك العائلة من مجلس عمان المالي متهماً بالإخفاق. سرّبت لك أمك 25,000$ كاش لتنطلق في مشاريع العقبة، سحاب الصناعية، وتعدين الفوسفات والبوتاس.',
    storyFull: [
      'أهلاً بك يا بني… لقد قرر كبار العائلة في عمان تجريدك من حصص التجارة وطردك بدعوى عدم قدرتك على إدارة الأصول والاستثمارات الكبرى.',
      'لكنني واثقة من ذكائك المالي! سلّمتك سراً 25,000 دولار أمريكي… انطلق فوراً نحو مدينة سحاب الصناعية وميناء العقبة الاقتصادي الخاص!',
      'استثمر في الصناعات الدوائية، وتعدين البوتاس والفوسفات، وسلاسل الإمداد اللوجستية حتى تبني صرحاً استثمارياً يفرض احترامك ويعيدك إلى القمة.',
    ],
    currency: { code: 'USD', symbol: '$', name: 'الدولار الأمريكي' },
    startingBalance: 25_000,
    startingBalanceEgpEquivalent: 25_000,
    economy: {
      exchangeRateToEgp: 1.0,
      companySetupFee: 2_100,
      licenseFeesByIndustry: buildIndustryFees(),
      taxRate: 0.14,
      customsRate: 0.025,
      operatingCostMultiplier: 1.02,
    },
  },
];

export function findCountry(countryId: CountryId): CountryDefinition | undefined {
  return COUNTRIES.find((country) => country.id === countryId);
}
