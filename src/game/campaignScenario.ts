import type { CountryId } from '../domain/countries';
import type { PlayerProfile } from '../domain/player';

export const GLOBAL_STORY_TITLE = 'Suly Business Empire: صعود الإمبراطورية';

export interface StoryCharacter {
  id: string;
  name: string;
  title: string;
  avatar: string;
  role: 'operations' | 'finance' | 'procurement' | 'rival' | 'mystery';
  countryId?: CountryId;
  bio: string;
}

export interface CampaignChoice {
  id: string;
  text: string;
  effectDescription: string;
  rewardMoney?: number;
  rewardDiamonds?: number;
  rewardGoldGrams?: number;
  reputationDelta?: number;
}

export interface CampaignChapter {
  id: number;
  title: string;
  subtitle: string;
  characterName: string;
  characterAvatar: string;
  characterTitle: string;
  dialogueText: string;
  objectiveText: string;
  requiredLevel: number;
  requiredCompanies: number;
  requiredProfit: number;
  choices: CampaignChoice[];
  rewardDiamonds: number;
  rewardGoldGrams: number;
  rewardTitle: string;
  horizonSecretClue: string;
}

export const COUNTRY_CHARACTERS: Record<CountryId, StoryCharacter[]> = {
  egypt: [
    { id: 'eg_adel', name: 'عادل منصور', title: 'مدير المصنع وخبير التشغيل', avatar: '👨‍🔧', role: 'operations', countryId: 'egypt', bio: 'خبير صناعي قضى ٣٠ عاماً في مجمعات العاشر من رمضان، يعلمك أسرار صيانة الماكينات والإنتاج.' },
    { id: 'eg_layan', name: 'ليان فؤاد', title: 'مستشارة الإدارة المالية', avatar: '👩‍💼', role: 'finance', countryId: 'egypt', bio: 'محللة تمويل بارعة تكشف أسرار تسوية الديون وفترات السماح المصرفية وإدارة التدفقات.' },
    { id: 'eg_shazly', name: 'كريم الشاذلي', title: 'مسؤول التوريدات والعقود', avatar: '🤝', role: 'procurement', countryId: 'egypt', bio: 'وسيط تجاري يربطك بكبار تجار القاهرة وموانئ السويس والإسكندرية.' },
    { id: 'eg_rawi', name: 'كمال الراوي', title: 'المنافس التجاري الشرس', avatar: '💼', role: 'rival', countryId: 'egypt', bio: 'رئيس تحالف منافس يسعى لابتلاع أي شركة متعثرة في السوق.' },
  ],
  jordan: [
    { id: 'jo_samer', name: 'سامر الخطيب', title: 'مستشار الأعمال والتشغيل', avatar: '👨‍💼', role: 'operations', countryId: 'jordan', bio: 'خبير استثماري في مدينة سحاب الصناعية وسلاسل الإمداد الوطنية بالأردن.' },
    { id: 'jo_rana', name: 'رنا العبدالله', title: 'الخبيرة المالية والتجارية', avatar: '👩‍💼', role: 'finance', countryId: 'jordan', bio: 'خبيرة تكاليف تساعدك على ضبط السيولة وتسوية التزامات المصنع وإبرام الصفقات.' },
    { id: 'jo_laith', name: 'ليث المجالي', title: 'منافس سوق التوريدات', avatar: '👔', role: 'rival', countryId: 'jordan', bio: 'تاجر متمرس ينافسك على عقود الشحن والتوريد في السوق الأردني والإقليمي.' },
    { id: 'jo_fadi', name: 'فادي النابلسي', title: 'رجل أعمال الصفقات التاريخية', avatar: '🧐', role: 'mystery', countryId: 'jordan', bio: 'شريك قديم يحتفظ بأوراق سرية تكشف صلة مصنع سحاب بانهيار مجموعة الأفق العالمية.' },
  ],
  saudi: [
    { id: 'sa_fahad', name: 'فهد العتيبي', title: 'مدير العمليات الصناعية', avatar: '👷‍♂️', role: 'operations', countryId: 'saudi', bio: 'مهندس سعودي مخضرم يقود مصانع الرياض وسدير بكفاءة تشغيلية عالية.' },
    { id: 'sa_noura', name: 'نورة القحطاني', title: 'مستشارة المشروعات والاستثمار', avatar: '👩‍💼', role: 'finance', countryId: 'saudi', bio: 'مستشارة اقتصادية ترشدك نحو عقود التوريد الكبرى والتوسع بالمملكة.' },
    { id: 'sa_rashed', name: 'راشد الدوسري', title: 'عملاق التوريدات والمنافس الرئيسي', avatar: '💼', role: 'rival', countryId: 'saudi', bio: 'مستثمر كبير يسيطر على حصص سوقية واسعة في قطاع المواد الخام.' },
  ],
  uae: [
    { id: 'ae_majed', name: 'ماجد المنصوري', title: 'خبير التجارة واللوجستيات', avatar: '🚢', role: 'operations', countryId: 'uae', bio: 'متخصص في إدارة الموانئ وسلاسل التوريد الحرة في جبل علي ودبي.' },
    { id: 'ae_maryam', name: 'مريم السويدي', title: 'مديرة الاستثمارات والصفقات', avatar: '👩‍💼', role: 'finance', countryId: 'uae', bio: 'خبيرة في بورصة دبي والاستحواذات المالية وتنمية رؤوس الأموال.' },
    { id: 'ae_salem', name: 'سالم الكتبي', title: 'المنافس الإقليمي بالأسواق الحرة', avatar: '👔', role: 'rival', countryId: 'uae', bio: 'مستثمر لوجستي ينافسك على كبرى عقود الشحن والتصدير البحري.' },
  ],
  usa: [
    { id: 'us_jack', name: 'جاك ميلر', title: 'كبير مديري الإنتاج', avatar: '👨‍💼', role: 'operations', countryId: 'usa', bio: 'خبير هندسة صناعية يقود كفاءة خطوط التجميع بأحدث التقنيات.' },
    { id: 'us_emily', name: 'إيميلي كارتر', title: 'محللة وول ستريت والتمويل', avatar: '👩‍💼', role: 'finance', countryId: 'usa', bio: 'مستشارة تمويل توجه استثماراتك في الأسهم وحماية السيولة من التقلبات.' },
    { id: 'us_richard', name: 'ريتشارد كول', title: 'رائد الاستحواذات الشرسة', avatar: '🎩', role: 'rival', countryId: 'usa', bio: 'ملياردير يسعى لابتلاع الشركات الناشئة وفرض احتكاره.' },
  ],
  kuwait: [
    { id: 'kw_yousef', name: 'يوسف الغانم', title: 'مستشار الاستثمار والتوريد', avatar: '👨‍💼', role: 'operations', countryId: 'kuwait', bio: 'خبير في منطقة الشويخ وميناء الأحمدي وسلاسل الإمداد الاستراتيجية.' },
    { id: 'kw_dana', name: 'دانة الصباح', title: 'خبيرة الشراكات الصناعية', avatar: '👩‍💼', role: 'finance', countryId: 'kuwait', bio: 'خبيرة اقتصادية ترسم مسارات التحالفات وحماية رأس المال الاستثماري.' },
    { id: 'kw_bader', name: 'بدر المطيري', title: 'منافس التوريدات والعقود', avatar: '👔', role: 'rival', countryId: 'kuwait', bio: 'تاجر نافذ ينافسك على عقود التوريد الكبرى في السوق الكويتي.' },
  ],
  qatar: [
    { id: 'qa_rashed', name: 'راشد الكواري', title: 'مدير المشروعات الكبرى', avatar: '👷‍♂️', role: 'operations', countryId: 'qatar', bio: 'مهندس عمليات يقود مشاريع البنية التحتية والمنطقة الصناعية بالدوحة.' },
    { id: 'qa_maryam', name: 'مريم المهندي', title: 'مستشارة العقود والسيولة', avatar: '👩‍💼', role: 'finance', countryId: 'qatar', bio: 'مستشارة مالية تساعدك على اقتناص العقود السيادية وإدارة التدفقات.' },
    { id: 'qa_khaled', name: 'خالد الأنصاري', title: 'المنافس في المناقصات الضخمة', avatar: '💼', role: 'rival', countryId: 'qatar', bio: 'مستثمر قطري بارز ينافسك على كبرى مزادات الأصول ومناقصات الدولة.' },
  ],
  uk: [
    { id: 'uk_oliver', name: 'أوليفر غراي', title: 'مدير العمليات والتصنيع', avatar: '👨‍💼', role: 'operations', countryId: 'uk', bio: 'خبير صناعي يدير مجمعات مانشستر الصناعية بدقة متناهية.' },
    { id: 'uk_sophie', name: 'صوفي بينيت', title: 'مستشارة التمويل والأسهم', avatar: '👩‍💼', role: 'finance', countryId: 'uk', bio: 'محللة في حي السيتي بلندن متخصصة في إدارة المحافظ والسيولة.' },
    { id: 'uk_edward', name: 'إدوارد هايز', title: 'المنافس الأرستقراطي', avatar: '🎩', role: 'rival', countryId: 'uk', bio: 'مستثمر بريطاني عريق يسعى لإبعاد الوجوه الجديدة عن صفقات لندن.' },
  ],
  germany: [
    { id: 'de_lukas', name: 'لوكاس شنايدر', title: 'مهندس الكفاءة والتصنيع', avatar: '👨‍🔬', role: 'operations', countryId: 'germany', bio: 'مهندس ألماني يطبق أقصى معايير الجودة وخفض الهدر بحزام الرور.' },
    { id: 'de_anna', name: 'آنا فيبر', title: 'خبيرة الأبحاث والتكنولوجيا', avatar: '👩‍💼', role: 'finance', countryId: 'germany', bio: 'مستشارة أبحاث وأتمتة تفتح آفاق التطور الذكي لمصانعك.' },
    { id: 'de_martin', name: 'مارتن كيلر', title: 'المنافس الصناعي العتيد', avatar: '👔', role: 'rival', countryId: 'germany', bio: 'قطب صناعي ألماني ينافسك على كبرى عقود التصدير الأوروبي.' },
  ],
  japan: [
    { id: 'jp_haruto', name: 'هارو ساتو', title: 'مدير الأتمتة والجودة الصارمة', avatar: '👨‍💼', role: 'operations', countryId: 'japan', bio: 'خبير ياباني يطبق فلسفة الكايزن والإنتاج الرشيق بخليج طوكيو.' },
    { id: 'jp_ai', name: 'آي ناكامورا', title: 'محللة الابتكار والاستثمار', avatar: '👩‍💼', role: 'finance', countryId: 'japan', bio: 'خبيرة تكنولوجية ترشدك لاقتناص فرص الاستثمار الجريء والنمو.' },
    { id: 'jp_kenji', name: 'كينجي تاكاهاشي', title: 'منافس التكتلات والتحالفات', avatar: '👔', role: 'rival', countryId: 'japan', bio: 'رئيس تحالف كيريتسو تجاري يسعى لحماية نفوذه من المنافسين الجدد.' },
  ],
};

export const NADER_AL_SALMI: StoryCharacter = {
  id: 'global_nader',
  name: 'نادر السالمي',
  title: 'رجل الأعمال الغامض (مفتاح سر مجموعة الأفق)',
  avatar: '🕵️‍♂️',
  role: 'mystery',
  bio: 'مستثمر غامض يظهر في اللحظات الحاسمة، وكان أحد كبار التنفيذيين في مجموعة الأفق العالمية قبل انهيارها المريب.',
};

export function getCountryCharacters(countryId: CountryId): StoryCharacter[] {
  return [...(COUNTRY_CHARACTERS[countryId] ?? COUNTRY_CHARACTERS.egypt), NADER_AL_SALMI];
}

export function getLeadAdvisor(countryId: CountryId): StoryCharacter {
  const chars = COUNTRY_CHARACTERS[countryId] ?? COUNTRY_CHARACTERS.egypt;
  return chars.find((c) => c.role === 'operations') ?? chars[0];
}

export function getFinanceAdvisor(countryId: CountryId): StoryCharacter {
  const chars = COUNTRY_CHARACTERS[countryId] ?? COUNTRY_CHARACTERS.egypt;
  return chars.find((c) => c.role === 'finance') ?? chars[1] ?? chars[0];
}

export function getRivalCharacter(countryId: CountryId): StoryCharacter {
  const chars = COUNTRY_CHARACTERS[countryId] ?? COUNTRY_CHARACTERS.egypt;
  return chars.find((c) => c.role === 'rival') ?? chars[chars.length - 1];
}

export const CAMPAIGN_CHAPTERS: readonly CampaignChapter[] = [
  // الفصل 1
  {
    id: 1,
    title: 'المشروع الأخير - صدمة الانهيار واستلام الموقع',
    subtitle: 'الفصل 1: استلام المشروع ومعاينة الماكينات والسيولة',
    characterName: 'عادل منصور / سامر الخطيب',
    characterAvatar: '👨‍💼',
    characterTitle: 'كبير مستشاري التشغيل',
    dialogueText:
      'أهلاً بك في موقع العمل! استلمنا هذا المشروع الصناعي المتعثر بعد عاصفة عائلية قاسية. الماكينات مهملة وتعمل بكفاءة ٢٥٪ فقط، وتوجد التزامات معلقة، لكن السيولة النقدية التي زودتنا بها الوالدة (٢٥,٠٠٠$) كافية لإعادة التشغيل إذا أحسنا التدبير!',
    objectiveText: 'استلم المشروع، تفقد الماكينات وخزينة السيولة، وافهم أول خطوة لإعادة التشغيل.',
    requiredLevel: 1,
    requiredCompanies: 1,
    requiredProfit: 0,
    rewardDiamonds: 50,
    rewardGoldGrams: 5,
    rewardTitle: 'الوريث الصامد 🛡️',
    horizonSecretClue: 'وجدت وثيقة ممزقة في مكتب المصنع تحمل ختم «مجموعة الأفق العالمية» مع عبارة: "مشروع الطوارئ رقم ٧".',
    choices: [
      {
        id: 'c1_choice_1',
        text: 'فحص دفاتر الحسابات وتخصيص السيولة لصيانة المعدات',
        effectDescription: 'استقرار تشغيلي مباشر +٥ سمعة تجارية',
        reputationDelta: 5,
        rewardMoney: 10_000,
      },
      {
        id: 'c1_choice_2',
        text: 'التحفظ النقدي والبدء بحذر لمنع أي استنزاف مالي',
        effectDescription: 'مكافأة حماية نقدية +١٥ ماسة',
        rewardDiamonds: 15,
      },
    ],
  },

  // الفصل 2
  {
    id: 2,
    title: 'الإنقاذ - صيانة المعدات وحماية الخزينة',
    subtitle: 'الفصل 2: إصلاح الأعطال الميكانيكية وتسوية الالتزام',
    characterName: 'ليان فؤاد / رنا العبدالله',
    characterAvatar: '👩‍💼',
    characterTitle: 'مستشارة الإدارة المالية والديون',
    dialogueText:
      'لقد قمت بخطوة شجاعة! الماكينات بحاجة لصيانة فورية لرفع كفاءتها من ٢٥٪ إلى ١٠٠٪ لتفادي الخسائر وتوقف خطوط الإنتاج. كما أن سداد أول التزام مالي يحمي حساباتك من الحجز ويمنحنا ثقة تجارية صلبة.',
    objectiveText: 'قم بصيانة المصنع لرفع الكفاءة إلى ٩٠٪+، وسدد أول التزام مالي لإبراء ذمتك.',
    requiredLevel: 1,
    requiredCompanies: 1,
    requiredProfit: 10_000,
    rewardDiamonds: 80,
    rewardGoldGrams: 8,
    rewardTitle: 'منقذ الأصول 🛠️',
    horizonSecretClue: 'فاتورة صيانة قديمة موقعة من رجل الأعمال "نادر السالمي" تشير إلى تحويل أصول قبل إفلاس مجموعة الأفق بأيام.',
    choices: [
      {
        id: 'c2_choice_1',
        text: 'إبرام عقد صيانة دورية وقائية منتظمة',
        effectDescription: 'رفع السمعة +١٠ واستقرار كفاءة الماكينات',
        reputationDelta: 10,
        rewardMoney: 15_000,
      },
      {
        id: 'c2_choice_2',
        text: 'الاعتماد على الصيانة الذاتية وادخار الفارق للإنتاج',
        effectDescription: 'مكافأة ادخار نقدية +٢٥ ماسة',
        rewardDiamonds: 25,
      },
    ],
  },

  // الفصل 3
  {
    id: 3,
    title: 'أول نجاح - دوران الماكينات وتدفق الأرباح',
    subtitle: 'الفصل 3: تشغيل أول خط إنتاج وبيع البضائع بالسوق',
    characterName: 'عادل منصور / سامر الخطيب',
    characterAvatar: '👨‍🔧',
    characterTitle: 'مدير التشغيل والإنتاج',
    dialogueText:
      'المصنع عاد للحياة! حان الوقت لشراء المواد الخام وتشغيل أول دفعة تصنيع بأيدينا. عندما تكتمل البضائع وتصل إلى المستودع، سنطرحها بالسوق لتحقيق أول ربح حقيقي يعيد إثبات كفاءتك!',
    objectiveText: 'شغل دفعة إنتاج غذائي، استلم البضائع في المستودع، ونفّذ أول صفقة بيع.',
    requiredLevel: 2,
    requiredCompanies: 1,
    requiredProfit: 30_000,
    rewardDiamonds: 120,
    rewardGoldGrams: 12,
    rewardTitle: 'الصانع الواعد 🏭',
    horizonSecretClue: 'تجار السوق يتحدثون عن أن خط إنتاجك كان المورد السري للوجستيات مجموعة الأفق قبل انهيارها.',
    choices: [
      {
        id: 'c3_choice_1',
        text: 'إعادة تدوير الأرباح مباشرة لشراء كميات أكبر من الخامات',
        effectDescription: 'مكافأة سيولة تشغيلية +٢٠,٠٠٠ $',
        rewardMoney: 20_000,
      },
      {
        id: 'c3_choice_2',
        text: 'تنويع باقة السلع المصنعة لبناء اسم تجاري موثوق',
        effectDescription: 'زيادة السمعة التجارية +١٢ و٣٠ ماسة',
        reputationDelta: 12,
        rewardDiamonds: 30,
      },
    ],
  },

  // الفصل 4
  {
    id: 4,
    title: 'بناء السمعة - استعادة ثقة كبار التجار',
    subtitle: 'الفصل 4: الالتزام بالمواعيد وإنجاز أول عقد تجاري',
    characterName: 'كريم الشاذلي / ليث المجالي',
    characterAvatar: '🤝',
    characterTitle: 'مسؤول التوريدات والعملاء',
    dialogueText:
      'السوق بدأ يلاحظ عودتك القوية! كبار العملاء يطلبون عقود توريد مجزية، لكنهم يشترطون التسليم في الموعد النهائي بدقة. إتمام عقد تجاري ناجح سيرفع تصنيفك ويفتح لك آفاق التوسع التجاري الواسع.',
    objectiveText: 'اقبل عقد توريد تجاري، جهز الكمية المطلوبة بالمستودع، وسلمها بنجاح.',
    requiredLevel: 3,
    requiredCompanies: 1,
    requiredProfit: 75_000,
    rewardDiamonds: 180,
    rewardGoldGrams: 18,
    rewardTitle: 'شريك الثقة التجارية 📜',
    horizonSecretClue: 'العميل الذي وقع العقد معك اعترف بأنه كان أكبر دائني مجموعة الأفق، وأن نجاحك أعاد له الأمل.',
    choices: [
      {
        id: 'c4_choice_1',
        text: 'تخصيص مكافأة التزام وسرعة تسليم لفرق العمل',
        effectDescription: 'رفع السمعة التجارية +١٥ ومكافأة نقدية',
        reputationDelta: 15,
        rewardMoney: 35_000,
      },
      {
        id: 'c4_choice_2',
        text: 'استثمار أرباح العقد في شراء أرض استثمارية جديدة',
        effectDescription: 'مكافأة توسع عقاري +٤٠ ماسة',
        rewardDiamonds: 40,
      },
    ],
  },

  // الفصل 5
  {
    id: 5,
    title: 'دخول عالم الأعمال - رفع الحظر المصرفي والنمو',
    subtitle: 'الفصل 5: فتح التسهيلات البنكية وإدارة السيولة بحكمة',
    characterName: 'ليان فؤاد / رنا العبدالله',
    characterAvatar: '🏛️',
    characterTitle: 'خبيرة التمويل والمصارف',
    dialogueText:
      'إنجاز أسطوري! بفضل أرباحك وعقودك الناجحة، أعلن البنك رسمياً رفع التجميد الائتماني عن حساباتك! الآن يمكنك فتح ودائع ذات عائد يومي، والحصول على تسهيلات وقروض بضمان أراضيك لتأسيس شركتك الثانية.',
    objectiveText: 'بلغ المستوى ٤، وأسس شركتك الثانية لتدخل رسميًا مرحلة المجموعات التجارية.',
    requiredLevel: 4,
    requiredCompanies: 2,
    requiredProfit: 200_000,
    rewardDiamonds: 250,
    rewardGoldGrams: 25,
    rewardTitle: 'المستثمر المعتمد 💼',
    horizonSecretClue: 'مدير البنك كشف لك سراً: الحساب الذي فك عنه الحظر كان يحتوي على محفظة أسهم سرية تركتها مجموعة الأفق.',
    choices: [
      {
        id: 'c5_choice_1',
        text: 'إيداع فائض السيولة في وديعة مصرفية بعائد مركب',
        effectDescription: 'أمان مالي ونمو مستمر +٥٠,٠٠٠ $',
        rewardMoney: 50_000,
      },
      {
        id: 'c5_choice_2',
        text: 'تمويل خط إنتاج صناعي ثانٍ لتوسيع الحصة السوقية',
        effectDescription: 'مكافأة سرعة التوسع الصناعي +٦٠ ماسة',
        rewardDiamonds: 60,
      },
    ],
  },

  // الفصل 6
  {
    id: 6,
    title: 'المنافسة - معركة المزادات والبورصة',
    subtitle: 'الفصل 6: مواجهة كمال الراوي والمنافسة على الأصول الحية',
    characterName: 'كمال الراوي / ريتشارد كول',
    characterAvatar: '💼',
    characterTitle: 'زعيم التكتل المنافس',
    dialogueText:
      'ظننت أنك مجرد هاوٍ محظوظ! لكنك الآن تنافسني في المزادات المباشرة وبورصة الأسهم. لن أسمح لك بالسيطرة على مصانع المنطقة بسهولة.. الميدان المالي بيننا وسنرى من يملك النفس الأطول!',
    objectiveText: 'نافس في المزادات أو تداول في البورصة، وارفع عدد شركاتك إلى ٣ ومستواك إلى ٥.',
    requiredLevel: 5,
    requiredCompanies: 3,
    requiredProfit: 500_000,
    rewardDiamonds: 350,
    rewardGoldGrams: 35,
    rewardTitle: 'فارس المزادات والصفقات 🔨',
    horizonSecretClue: 'اكتشفت أن كمال الراوي كان الذراع التنفيذي الذي دبر الاستحواذ القسري على أصول مجموعة الأفق.',
    choices: [
      {
        id: 'c6_choice_1',
        text: 'المزايدة بذكاء واقتناص أصول متعثرة بأسعار تفضيلية',
        effectDescription: 'صفقة رابحة +٧٥,٠٠٠ $ وسيادة سوقية',
        rewardMoney: 75_000,
      },
      {
        id: 'c6_choice_2',
        text: 'التحالف مع صغار المستثمرين وكسر احتكار المنافسين',
        effectDescription: 'قفزة في السمعة التجارية +٢٠ و٨٠ ماسة',
        reputationDelta: 20,
        rewardDiamonds: 80,
      },
    ],
  },

  // الفصل 7
  {
    id: 7,
    title: 'التكنولوجيا - ثورة الأتمتة والأبحاث الذكية',
    subtitle: 'الفصل 7: فتح شجرة الأبحاث وخفض تكاليف الإنتاج',
    characterName: 'آنا فيبر / هارو ساتو',
    characterAvatar: '🔬',
    characterTitle: 'كبير مهندسي التكنولوجيا والأتمتة',
    dialogueText:
      'المستقبل لمن يملك التقنية! المصانع التقليدية لم تعد تكفي لهزيمة المنافسين. لقد فتحنا شجرة الأبحاث R&D: سنطور روبوتات الأتمتة الذكية لخفض تكاليف التشغيل بنسبة ٤٠٪ ومضاعفة الطاقة الإنتاجية.',
    objectiveText: 'بلغ المستوى ٦، وافتح تقنيات الأتمتة لترقية كفاءة مصانعك إلى القمة.',
    requiredLevel: 6,
    requiredCompanies: 3,
    requiredProfit: 1_000_000,
    rewardDiamonds: 500,
    rewardGoldGrams: 50,
    rewardTitle: 'رائد الابتكار الصناعي ⚡',
    horizonSecretClue: 'وجدت مخططات أبحاث سرية غير مكتملة كان يعمل عليها علماء مجموعة الأفق قبل اختفائهم المفاجئ.',
    choices: [
      {
        id: 'c7_choice_1',
        text: 'تمويل مركز أبحاث وتطوير متقدم داخل مصانعك',
        effectDescription: 'خفض دائري لتكاليف الإنتاج ومكافأة ١٠٠,٠٠٠ $',
        rewardMoney: 100_000,
      },
      {
        id: 'c7_choice_2',
        text: 'تسجيل براءات اختراع تكنولوجية حصرية لبيع التراخيص',
        effectDescription: 'مكافأة ملكية فكرية +١٢٠ ماسة',
        rewardDiamonds: 120,
      },
    ],
  },

  // الفصل 8
  {
    id: 8,
    title: 'التوسع الإقليمي - الموانئ والأسطول والتصدير',
    subtitle: 'الفصل 8: بناء الأسطول الملاحي واقتحام الأسواق الدولية',
    characterName: 'ماجد المنصوري / أوليفر غراي',
    characterAvatar: '🚢',
    characterTitle: 'مدير العمليات البحرية واللوجستيات',
    dialogueText:
      'إمبراطوريتك تجاوزت الحدود المحلية! بضائعنا أصبحت مطلوبة في موانئ العقبة ودبي وهامبورغ وسنغافورة. إذا أطلقنا سفن الشحن وفتحنا خطوط التصدير الإقليمية، ستصبح المورد الأول بلا منازع في الشرق الأوسط والعالم!',
    objectiveText: 'تصل للمستوى ٨ مع أرباح تجاوزت ٢,٠٠٠,٠٠٠ $ والسيطرة على خطوط إمداد كبرى.',
    requiredLevel: 8,
    requiredCompanies: 4,
    requiredProfit: 2_000_000,
    rewardDiamonds: 700,
    rewardGoldGrams: 70,
    rewardTitle: 'أمير التجارة الدولية 🌊',
    horizonSecretClue: 'سفينة شحن عتيقة وصلت الميناء تحمل حاويات مقفلة مسجلة باسم "صندوق الأفق السيادي".',
    choices: [
      {
        id: 'c8_choice_1',
        text: 'تأسيس خط ملاحي بحري مستقل يربط كبرى موانئ التجارة',
        effectDescription: 'أرباح شحن قياسية +٢٠٠,٠٠٠ $ وسمعة +٢٥',
        reputationDelta: 25,
        rewardMoney: 200_000,
      },
      {
        id: 'c8_choice_2',
        text: 'توقيع معاهدات توريد حصرية بالعملات الدولية الصعبة',
        effectDescription: 'مكافأة سيادة دولية +٢٠٠ ماسة',
        rewardDiamonds: 200,
      },
    ],
  },

  // الفصل 9
  {
    id: 9,
    title: 'سر مجموعة الأفق - كشف المستندات ومواجهة الماضي',
    subtitle: 'الفصل 9: فك شفرة الانهيار ومواجهة نادر السالمي',
    characterName: 'نادر السالمي',
    characterAvatar: '🕵️‍♂️',
    characterTitle: 'مفتاح سر مجموعة الأفق',
    dialogueText:
      'كنت أراقب صعودك المذهل منذ البداية.. لقد أثبت أنك الوريث الحقيقي الذي يستحق معرفة الحقيقة. مجموعة الأفق لم تفلس صدفة، بل كانت مؤامرة مدبرة من تحالف كمال الراوي لتقسيم ثرواتها. هذه الوثائق هي دليلك الحاسم لاسترداد كل ما سُلب!',
    objectiveText: 'اجمع الأدلة، وتجاوز أرباح ٥,٠٠٠,٠٠٠ $، واستعد لحسم المعركة التجارية الكبرى.',
    requiredLevel: 10,
    requiredCompanies: 4,
    requiredProfit: 5_000_000,
    rewardDiamonds: 1000,
    rewardGoldGrams: 100,
    rewardTitle: 'كاشف الأسرار العظمى 🔍',
    horizonSecretClue: 'أصبحت تملك السجل الكامل للتحويلات والأسهم التي تُثبت ملكيتك الشرعية لأصول مجموعة الأفق!',
    choices: [
      {
        id: 'c9_choice_1',
        text: 'تقديم الوثائق لهيئات أسواق المال ومصادرة أصول المنافسين',
        effectDescription: 'استرداد أصول كبرى ومكافأة ٥٠٠,٠٠٠ $',
        rewardMoney: 500_000,
      },
      {
        id: 'c9_choice_2',
        text: 'التفاوض المباشر وفرض تسوية تاريخية تلزمهم بالتعويض',
        effectDescription: 'أقصى سمعة تجارية +٣٠ و٣٠٠ ماسة أسطورية',
        reputationDelta: 30,
        rewardDiamonds: 300,
      },
    ],
  },

  // الفصل 10
  {
    id: 10,
    title: 'الإمبراطورية العالمية - عرش التجارة والخلود المالي',
    subtitle: 'الفصل 10: حسم النزاعات وتتويج إمبراطور الأعمال',
    characterName: 'السفير كمال / نادر السالمي / ليان فؤاد',
    characterAvatar: '👑',
    characterTitle: 'مجلس السيادة الاقتصادية العالمية',
    dialogueText:
      'يا لها من ملحمة أسطورية! من مصنع موروث مهمل وديون مهددة بالحجز، إلى إمبراطورية اقتصادية تهتز لها عواصم العالم والبورصات الدولية. العائلة التي طردتك تقف اليوم إجلالاً لنجاحك، والمنافسون يطلبون التحالف تحت رايتك. لقد بنيت إمبراطورية لا تغيب عنها الشمس!',
    objectiveText: 'تصل للمستوى ١٢+، وترأس قمة المتصدرين بأرباح تتجاوز ١٠,٠٠٠,٠٠٠ $ لتخليد اسمك.',
    requiredLevel: 12,
    requiredCompanies: 4,
    requiredProfit: 10_000_000,
    rewardDiamonds: 2500,
    rewardGoldGrams: 250,
    rewardTitle: 'إمبراطور الأعمال الأسطوري 👑',
    horizonSecretClue: 'تم إعلان دمج مجموعة الأفق مع إمبراطوريتك الخاصة لتصبح الكيان الاقتصادي الأضخم عالمياً.',
    choices: [
      {
        id: 'c10_choice_1',
        text: 'تأسيس صندوق سيادي خيري وتنمية المدن الصناعية الكبرى',
        effectDescription: 'أعلى شرف تجاري وخلود في تاريخ الأسواق ومكافأة ١,٠٠٠,٠٠٠ $',
        reputationDelta: 50,
        rewardMoney: 1_000_000,
      },
      {
        id: 'c10_choice_2',
        text: 'طرح أسهم الإمبراطورية في اكتتاب تاريخي بجميع بورصات العالم',
        effectDescription: 'سيادة مالية مطلقة ومكافأة ٥٠٠ ماسة ملكية',
        rewardDiamonds: 500,
      },
    ],
  },
];

export function getPlayerCampaignChapter(profile: PlayerProfile): CampaignChapter {
  const currentChapterId = profile.campaignChapterId ?? 1;
  const chapter = CAMPAIGN_CHAPTERS.find((c) => c.id === currentChapterId) ?? CAMPAIGN_CHAPTERS[0];

  // Tailor character and dialogue to current country
  const leadChar = getLeadAdvisor(profile.countryId);
  const finChar = getFinanceAdvisor(profile.countryId);
  const rivalChar = getRivalCharacter(profile.countryId);

  let characterName = chapter.characterName;
  let characterAvatar = chapter.characterAvatar;
  let characterTitle = chapter.characterTitle;

  if (chapter.id === 1 || chapter.id === 3) {
    characterName = leadChar.name;
    characterAvatar = leadChar.avatar;
    characterTitle = leadChar.title;
  } else if (chapter.id === 2 || chapter.id === 5) {
    characterName = finChar.name;
    characterAvatar = finChar.avatar;
    characterTitle = finChar.title;
  } else if (chapter.id === 6) {
    characterName = rivalChar.name;
    characterAvatar = rivalChar.avatar;
    characterTitle = rivalChar.title;
  } else if (chapter.id === 9) {
    characterName = NADER_AL_SALMI.name;
    characterAvatar = NADER_AL_SALMI.avatar;
    characterTitle = NADER_AL_SALMI.title;
  }

  return {
    ...chapter,
    characterName,
    characterAvatar,
    characterTitle,
  };
}

export function isChapterCompleted(profile: PlayerProfile, chapter: CampaignChapter): boolean {
  const level = profile.level ?? 1;
  const companies = profile.companies?.length ?? 0;
  const netProfit = profile.finances?.netProfit ?? 0;
  return level >= chapter.requiredLevel && companies >= chapter.requiredCompanies && netProfit >= chapter.requiredProfit;
}

export function canAdvanceChapter(profile: PlayerProfile): boolean {
  const currentChapter = getPlayerCampaignChapter(profile);
  return isChapterCompleted(profile, currentChapter) && currentChapter.id < CAMPAIGN_CHAPTERS.length;
}
