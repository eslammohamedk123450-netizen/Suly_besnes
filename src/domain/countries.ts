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
  | 'japan';

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
  startingBalanceEgpEquivalent: number; // 1,000,000 EGP
  economy: {
    /** Local-currency units per Egyptian pound (e.g. 50 EGP per 1 USD -> 50) */
    exchangeRateToEgp: number;
    /** Simulation-only company formation fee. */
    companySetupFee: number;
    /** Simulation-only licence prices by industry. */
    licenseFeesByIndustry: Record<IndustryId, number>;
    /** Applied to taxable sales and selected day events. */
    taxRate: number;
    customsRate: number;
    operatingCostMultiplier: number;
  };
}

function scaleFees(rate: number, egpFee: number): number {
  return Math.max(1, Math.round(egpFee / rate));
}

function buildIndustryFees(rate: number): Record<IndustryId, number> {
  return {
    petroleum: scaleFees(rate, 140_000),
    electricity: scaleFees(rate, 105_000),
    gas: scaleFees(rate, 120_000),
    water: scaleFees(rate, 90_000),
    detergents: scaleFees(rate, 55_000),
    food: scaleFees(rate, 45_000),
    construction: scaleFees(rate, 65_000),
    electronics: scaleFees(rate, 85_000),
    transport: scaleFees(rate, 50_000),
  };
}

export const COUNTRIES: readonly CountryDefinition[] = [
  // 1. Egypt
  {
    id: 'egypt',
    name: 'مصر',
    flag: '🇪🇬',
    storyTitle: 'الإرث والمحاولة الأخيرة في القاهرة',
    storySummary: 'طردتك عائلتك ذات النفوذ من القصر بتهمة الجبن والفشل المالي. سرّبت لك أمك 1,000,000 ج.م كاش لتثبت جدارتك وتبني إمبراطوريتك من جديد.',
    storyFull: [
      'أهلًا بك يا بني… لقد قرر والدك وإخوتك طردك نهائياً من العائلة وتجريدك من كل شيء، واعتبروك فاشلاً وجباناً لا يستطيع إدارة أموال العائلة.',
      'لكنني مؤمنة بك! تسللت إليك سراً وأعطيتك مليون جنيه مصري (1,000,000 ج.م) كانت مدخراتي الخاصة… اذهب إلى أسواق القاهرة والدلتا وابنِ إمبراطورية تجارية تهز الأسواق!',
      'لا ترجع إلينا إلا وأنت الأسطورة التي يركع لها المنافسون وتثبت لوالدك وعائلتك أنك السند الحقيقي والقائد المالي الأعظم.',
    ],
    currency: { code: 'EGP', symbol: 'ج.م', name: 'الجنيه المصري' },
    startingBalance: 1_000_000,
    startingBalanceEgpEquivalent: 1_000_000,
    economy: {
      exchangeRateToEgp: 1.0,
      companySetupFee: 75_000,
      licenseFeesByIndustry: buildIndustryFees(1.0),
      taxRate: 0.12,
      customsRate: 0,
      operatingCostMultiplier: 1.0,
    },
  },

  // 2. Saudi Arabia
  {
    id: 'saudi',
    name: 'المملكة العربية السعودية',
    flag: '🇸🇦',
    storyTitle: 'تحدي الرياض ومشاريع المملكة',
    storySummary: 'طردتك العائلة من مجلس الرياض المرموق. سلّمتك أمك ما يعادل المليون جنيه بالريال السعودي (75,188 ر.س) لتتصدى للتحدي وتقتحم الأسواق.',
    storyFull: [
      'يا بني… اتهمك أهلك في الرياض بالجبن وعدم المسؤولية الماليّة، وجرّدوك من مناصب العائلة وطردوك من المجلس الكبير.',
      'لكن قلبي معك! هربت لك سراً ما يعادل المليون جنيه مصري بسعر الصرف المباشر (75,188 ريال سعودي)… انطلق نحو الرياض وجدة والشرقية!',
      'اقتحم مشاريع الرؤية والتعدين والعقارات المليارية وأثبت لوالدك وعائلتك أنك أقوى تجار المملكة القادمون!',
    ],
    currency: { code: 'SAR', symbol: 'ر.س', name: 'الريال السعودي' },
    startingBalance: 75_188,
    startingBalanceEgpEquivalent: 1_000_000,
    economy: {
      exchangeRateToEgp: 13.3,
      companySetupFee: scaleFees(13.3, 75_000),
      licenseFeesByIndustry: buildIndustryFees(13.3),
      taxRate: 0.15,
      customsRate: 0.05,
      operatingCostMultiplier: 1.1,
    },
  },

  // 3. UAE
  {
    id: 'uae',
    name: 'الإمارات العربية المتحدة',
    flag: '🇦🇪',
    storyTitle: 'أبراج دبي ومركز المال المالي',
    storySummary: 'طُرِدت من برج العائلة بدبي بعد وصمك بالضعف. أعطتك أمك ما يعادل المليون جنيه بالدرهم (73,529 د.إ) لتبدأ صعودك القوي.',
    storyFull: [
      'لقد أخرجك إخوتك من برج العائلة في دبي واعتبروك عاجزاً عن إدارة ثروة العائلة ومنافسة كبار المليارديرات.',
      'لكنني لم أستسلم! سلّمتك سراً ما يعادل المليون جنيه مصري بالدرهم الإماراتي (73,529 درهم)… انطلق إلى مركز دبي المالي والموانئ!',
      'ابنِ أساطيلك وشركاتك وارفه اسمك فوق نطاحات السحاب لترجع لهم منتصراً وتنتزع صدارة الأسواق.',
    ],
    currency: { code: 'AED', symbol: 'د.إ', name: 'الدرهم الإماراتي' },
    startingBalance: 73_529,
    startingBalanceEgpEquivalent: 1_000_000,
    economy: {
      exchangeRateToEgp: 13.6,
      companySetupFee: scaleFees(13.6, 75_000),
      licenseFeesByIndustry: buildIndustryFees(13.6),
      taxRate: 0.09,
      customsRate: 0.05,
      operatingCostMultiplier: 1.15,
    },
  },

  // 4. USA
  {
    id: 'usa',
    name: 'الولايات المتحدة الأمريكية',
    flag: '🇺🇸',
    storyTitle: 'غزو وول ستريت بنيويورك',
    storySummary: 'طردتك العائلة المليارديرة من قصر نيويورك. قامت أمك بتحويل ما يعادل المليون جنيه بالدولار ($20,000 USD عند سعر 50 ج/$) لتقتحم عالم المال.',
    storyFull: [
      'لقد طردك والدك وإخوتك من قصر نيويورك وسحبوا منك جميع البطاقات، معتبرين أنك فاشل وجبان ولا تفهم شيئاً في لغة المليارات.',
      'ولكنني أعلم معدنك الحقيقي! حولت لك سراً المليون جنيه مصري بسعر الصرف المباشر (20,000 دولار أمريكي عند سعر 50 ج.م/ دولار)… اتجه إلى وول ستريت ووادي السيليكون!',
      'تداول، وابنِ شركاتك، واحتل الأسهم العالمية حتى يعلم الجميع أنك الأسطورة المالية القادمة التي تهز العالم.',
    ],
    currency: { code: 'USD', symbol: '$', name: 'الدولار الأمريكي' },
    startingBalance: 20_000,
    startingBalanceEgpEquivalent: 1_000_000,
    economy: {
      exchangeRateToEgp: 50.0,
      companySetupFee: scaleFees(50.0, 75_000),
      licenseFeesByIndustry: buildIndustryFees(50.0),
      taxRate: 0.21,
      customsRate: 0.03,
      operatingCostMultiplier: 1.25,
    },
  },

  // 5. Kuwait
  {
    id: 'kuwait',
    name: 'دولة الكويت',
    flag: '🇰🇼',
    storyTitle: 'ديوانية العاصمة واستثمار النفط',
    storySummary: 'طُرِدت من ديوانية العائلة بالعاصمة. أعطتك أمك ما يعادل المليون جنيه بالدينار الكويتي (6,135 د.ك) لتثبت نجاحك واستقلاليتك.',
    storyFull: [
      'حرمتك العائلة من نصيبك في تجارة العاصمة وطردوك من الديوانية بتهمة الجبن وعدم الكفاءة المالية.',
      'لكن أُمك لن تتركك! حولت لك قيمة المليون جنيه بالدينار الكويتي الفعلي (6,135 دينار كويتي بسعر 163 ج.م/دينار)… ابدأ فوراً في الاستثمار!',
      'اقتحم عقود النفط ومشاريع الإنتاج والبورصة الكويتية لتصبح الرقم الأهم والملياردير الأول في السوق.',
    ],
    currency: { code: 'KWD', symbol: 'د.ك', name: 'الدينار الكويتي' },
    startingBalance: 6_135,
    startingBalanceEgpEquivalent: 1_000_000,
    economy: {
      exchangeRateToEgp: 163.0,
      companySetupFee: scaleFees(163.0, 75_000),
      licenseFeesByIndustry: buildIndustryFees(163.0),
      taxRate: 0.15,
      customsRate: 0.05,
      operatingCostMultiplier: 1.1,
    },
  },

  // 6. Qatar
  {
    id: 'qatar',
    name: 'دولة قطر',
    flag: '🇶🇦',
    storyTitle: 'مشاريع الدوحة والغاز',
    storySummary: 'طُرِدت من مجلس العائلة بالدوحة. سلّمتك أمك ما يعادل المليون جنيه بالريال القطري (72,992 ر.ق) لتقتحم مشاريع اللؤلؤة والموانئ.',
    storyFull: [
      'تم طردك من مجلس العائلة بالدوحة واعتبارك غير قادر على مواكبة صفقات العائلة الضخمة وتسيير أموالها.',
      'سلّمتك سراً ما يعادل المليون جنيه مصري بالريال القطري (72,992 ريال قطري)… انطلق في أسواق الدوحة واللؤلؤة والموانئ!',
      'شيد المصانع والعقارات وأعد صياغة تاريخ العائلة بأسلوبك الاستثماري الفذ والسيطرة الشاملة.',
    ],
    currency: { code: 'QAR', symbol: 'ر.ق', name: 'الريال القطري' },
    startingBalance: 72_992,
    startingBalanceEgpEquivalent: 1_000_000,
    economy: {
      exchangeRateToEgp: 13.7,
      companySetupFee: scaleFees(13.7, 75_000),
      licenseFeesByIndustry: buildIndustryFees(13.7),
      taxRate: 0.1,
      customsRate: 0.05,
      operatingCostMultiplier: 1.1,
    },
  },

  // 7. United Kingdom
  {
    id: 'uk',
    name: 'المملكة المتحدة (بريطانيا)',
    flag: '🇬🇧',
    storyTitle: 'قلعة لندن وحي المال والأعمال',
    storySummary: 'طُرِدت من القصر بمدينة لندن. زودتك أمك بما يعادل المليون جنيه بالباوند (£15,384 GBP) لتقتحم حي المال والأعمال.',
    storyFull: [
      'طردتك عائلتك الأرستقراطية من قصر لندن ووصفوك بالجبن وعدم القدرة على إدارة ثرواتهم الضخمة.',
      'لكنني معك! حولت لك قيمة المليون جنيه بالباوند الإسترليني (£15,384 باوند استرليني)… اتجه فوراً لـ City of London!',
      'استثمر في التجارة البحرية والأسهم والشركات لتجبرهم على احترام إمبراطوريتك وإعادة اعتبارك أمام الجميع.',
    ],
    currency: { code: 'GBP', symbol: '£', name: 'الجنيه الإسترليني' },
    startingBalance: 15_384,
    startingBalanceEgpEquivalent: 1_000_000,
    economy: {
      exchangeRateToEgp: 65.0,
      companySetupFee: scaleFees(65.0, 75_000),
      licenseFeesByIndustry: buildIndustryFees(65.0),
      taxRate: 0.19,
      customsRate: 0.04,
      operatingCostMultiplier: 1.2,
    },
  },

  // 8. Germany
  {
    id: 'germany',
    name: 'ألمانيا والاتحاد الأوروبي',
    flag: '🇪🇺',
    storyTitle: 'صناعات فرانكفورت والقوة الأوروبية',
    storySummary: 'طُرِدت من فرانكفورت متهماً بالفشل. سلمتك أمك ما يعادل المليون جنيه باليورو (€18,348 EUR) لتغزو القلاع الصناعية.',
    storyFull: [
      'اتهمتك العائلة بفرانكفورت بالضعف وعدم الفهم في الصناعة، وطردوك دون فلس واحد من أموال القصر.',
      'سلّمتك سراً ما يعادل المليون جنيه باليورو الأوروبي (€18,348 يورو)… انطلق إلى القلاع الصناعية ومراكز التكنولوجيا!',
      'أطلق خطوط الإنتاج والحلول الذكية لتبرهن للجميع أنك العقل المدبر الحقيقي والمستثمر الأقوى في أوروبا.',
    ],
    currency: { code: 'EUR', symbol: '€', name: 'اليورو الأوروبي' },
    startingBalance: 18_348,
    startingBalanceEgpEquivalent: 1_000_000,
    economy: {
      exchangeRateToEgp: 54.5,
      companySetupFee: scaleFees(54.5, 75_000),
      licenseFeesByIndustry: buildIndustryFees(54.5),
      taxRate: 0.2,
      customsRate: 0.02,
      operatingCostMultiplier: 1.2,
    },
  },

  // 9. Japan
  {
    id: 'japan',
    name: 'كوكب اليابان',
    flag: '🇯🇵',
    storyTitle: 'ابتكارات طوكيو والأتمتة',
    storySummary: 'طُرِدت من مقر طوكيو. أعطتك أمك ما يعادل المليون جنيه بالين الياباني (3,030,303 ¥) لتستثمر في التكنولوجيا والأتمتة.',
    storyFull: [
      'طردك والدك وكبار العائلة في طوكيو واعتبروك غير مؤهل لإدارة التكتلات التقنية المعقدة.',
      'هربت لك سراً ما يعادل المليون جنيه مصري بالين الياباني (3,030,303 ين ياباني)… ابدأ في أبحاث الأتمتة والروبوتات!',
      'ابنِ إمبراطورية يابانية تكنولوجية لا تُقهر لتثبت للعائلة أن المستقبل بيدك وأنك الأسطورة التي لا تتكرر.',
    ],
    currency: { code: 'JPY', symbol: '¥', name: 'الين الياباني' },
    startingBalance: 3_030_303,
    startingBalanceEgpEquivalent: 1_000_000,
    economy: {
      exchangeRateToEgp: 0.33,
      companySetupFee: scaleFees(0.33, 75_000),
      licenseFeesByIndustry: buildIndustryFees(0.33),
      taxRate: 0.15,
      customsRate: 0.02,
      operatingCostMultiplier: 1.15,
    },
  },
];

export function findCountry(countryId: CountryId): CountryDefinition | undefined {
  return COUNTRIES.find((country) => country.id === countryId);
}
