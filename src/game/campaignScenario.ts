import type { PlayerProfile } from '../domain/player';

export interface CampaignChoice {
  id: string;
  text: string;
  effectDescription: string;
  rewardMoney?: number;
  rewardDiamonds?: number;
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
}

export const CAMPAIGN_CHAPTERS: CampaignChapter[] = [
  {
    id: 1,
    title: 'الإنقاذ والبداية من قلب الأزمة',
    subtitle: 'الفصل الأول: صدمة الميراث وتعطل الماكينات',
    characterName: 'عادل منصور',
    characterAvatar: '👨‍🔧',
    characterTitle: 'مدير المصنع والمشرف الميداني',
    dialogueText:
      'أهلاً بك يا رئيسنا الجديد في هذا المصنع المنهك! الماكينات تعمل بكفاءة 25% فقط، وقسط بنك مصر المستحق بقيمة 52,500 ج.م يدق أبوابنا في اليوم السابع. هذا الصرح كان جزءاً من ممتلكات «مجموعة الأفق العالمية» قبل انهيارها المريب بسبب صفقات سرية غامضة. فلنبدأ فوراً بصيانة الخطوط وضخ الإنتاج قبل فوات الأوان!',
    objectiveText: 'إصلاح الماكينات وتشغيل خطوط الإنتاج وتحقيق أول رصيد أرباح بقيمة 150,000 ج.م',
    requiredLevel: 1,
    requiredCompanies: 1,
    requiredProfit: 150_000,
    rewardDiamonds: 150,
    rewardGoldGrams: 15,
    rewardTitle: 'منقذ الصرح الصناعي 🛠️',
    choices: [
      {
        id: 'c1_choice_1',
        text: 'التركيز على إصلاح الماكينات وتخفيض الفاقد مع عادل منصور',
        effectDescription: 'زيادة جودة المنتجات بنسبة +15% ومكافأة سيولة 35,000 ج.م',
        reputationDelta: 5,
        rewardMoney: 35000,
      },
      {
        id: 'c1_choice_2',
        text: 'البحث في أرشيف المصنع عن وثائق وسجلات مجموعة الأفق القديمة',
        effectDescription: 'كشف خيوط صفقات الأفق ومكافأة 30 ماسة فورية',
        rewardDiamonds: 30,
      },
    ],
  },
  {
    id: 2,
    title: 'التثبيت وهندسة السيولة',
    subtitle: 'الفصل الثاني: ميزانية النجاة وتأمين مسير الرواتب',
    characterName: 'ليان فؤاد',
    characterAvatar: '👩‍💼',
    characterTitle: 'المستشارة المالية وإدارة المخاطر',
    dialogueText:
      'النجاة من سداد القسط الأول كان إنجازاً مبهراً! لكن أمامنا تحدٍ مالي ضخم: المصروفات التشغيلية ومسير الرواتب الشهري للموظفين يلتهم السيولة. قمت بفحص دفاتر مجموعة الأفق واكتشفت أن سبب انهيارهم كان سوء إدارة التدفقات النقدية والمضاربات العشوائية. نحتاج إلى تعيين مدير مالي وتأمين ودائع استثمارية لحماية شركتك!',
    objectiveText: 'الوصول للمستوى 3 وامتلاك شركتين أو أرض توسعة وتحقيق صافي أرباح 600,000 ج.م',
    requiredLevel: 3,
    requiredCompanies: 2,
    requiredProfit: 600_000,
    rewardDiamonds: 300,
    rewardGoldGrams: 30,
    rewardTitle: 'مهندس السيولة الذكية 📊',
    choices: [
      {
        id: 'c2_choice_1',
        text: 'ربط مسير الرواتب الشهري بالمدير المالي وتأسيس وديعة مصرفية',
        effectDescription: 'استقرار السيولة وتقليل المخاطر مع مكافأة 70,000 ج.م',
        reputationDelta: 10,
        rewardMoney: 70000,
      },
      {
        id: 'c2_choice_2',
        text: 'استثمار السيولة في بورصة الذهب العالمية والمضاربة الإستراتيجية',
        effectDescription: 'شراء سبائك ذهبية ومكافأة 60 ماسة ملكية',
        rewardDiamonds: 60,
      },
    ],
  },
  {
    id: 3,
    title: 'معركة العقود وحصار الراوي',
    subtitle: 'الفصل الثالث: اصطدام الكبار والمزادات الحارقة',
    characterName: 'كمال الراوي',
    characterAvatar: '🤵‍♂️',
    characterTitle: 'رئيس تحالف الراوي للصناعات والمزادات',
    dialogueText:
      'كنت أظنك ستفلس خلال أسبوع كمن سبقوك في مصانع الأفق! لكنك أثبت أنك عنيد. اسمعني جيداً: هذه الأسواق ملك لتحالفي، ولن أسمح لك بالسيطرة على عقود التصدير ومزادات المواد الخام. السوق لا يتسع إلا لإمبراطور واحد، وسأرى إن كنت قادراً على كسر حصاري التجاري!',
    objectiveText: 'الوصول للمستوى 7 وإنجاز عقود تجارية وتحقيق أرباح تراكمية بقيمة 2,500,000 ج.م',
    requiredLevel: 7,
    requiredCompanies: 2,
    requiredProfit: 2_500_000,
    rewardDiamonds: 600,
    rewardGoldGrams: 60,
    rewardTitle: 'كاسر الاحتكار التجاري ⚡',
    choices: [
      {
        id: 'c3_choice_1',
        text: 'الدخول في مزادات الأراضي المفتوحة وكسر احتكار تحالف الراوي',
        effectDescription: 'زيادة السمعة التجارية +20 ومكافأة 150,000 ج.م',
        reputationDelta: 20,
        rewardMoney: 150000,
      },
      {
        id: 'c3_choice_2',
        text: 'إبرام عقود توريد حصرية طويلة الأجل مع الأسواق العالمية',
        effectDescription: 'مكافأة 120 ماسة ممتازة وتأمين حصص التصدير',
        rewardDiamonds: 120,
      },
    ],
  },
  {
    id: 4,
    title: 'كشف خيوط مجموعة الأفق العالمية',
    subtitle: 'الفصل الرابع: الأسرار المدفونة والربط الإقليمي',
    characterName: 'نادر السالمي',
    characterAvatar: '🕵️‍♂️',
    characterTitle: 'المستثمر الدولي وحافظ أسرار مجموعة الأفق',
    dialogueText:
      'لقد راقبت خطواتك بدقة! صمودك أمام كمال الراوي أثبت أنك الوريث الشرعي الحقيقي لإرث الأفق. مجموعة الأفق لم تكن مجرد مصانع، بل كانت شبكة إمداد عالمية تربط الموانئ واللوجستيات بين مصر والأردن والخليج وأوروبا. تم إسقاطها بمؤامرة استيلاء قادها منافسون جشعون. والآن، بين يديك ملفات الشبكة لإعادة ربط الإمبراطورية!',
    objectiveText: 'الوصول للمستوى 12 وامتلاك 3 شركات على الأقل وتحقيق أرباح 8,000,000 ج.م',
    requiredLevel: 12,
    requiredCompanies: 3,
    requiredProfit: 8_000_000,
    rewardDiamonds: 1200,
    rewardGoldGrams: 100,
    rewardTitle: 'سيد شبكة الأفق العالمية 🌐',
    choices: [
      {
        id: 'c4_choice_1',
        text: 'إعادة إحياء شريان النقل اللوجستي العابر للحدود مع نادر السالمي',
        effectDescription: 'فتح شراكات إقليمية ومكافأة 400,000 ج.م',
        reputationDelta: 25,
        rewardMoney: 400000,
      },
      {
        id: 'c4_choice_2',
        text: 'الاستحواذ على الأصول التقنية والمصانع المغلقة لمجموعة الأفق',
        effectDescription: 'مكافأة 250 ماسة ملكية وترقية شاملة لسعة المخازن',
        rewardDiamonds: 250,
      },
    ],
  },
  {
    id: 5,
    title: 'صعود الإمبراطورية والسيادة الاقتصادية',
    subtitle: 'الفصل الخامس: التاج الإمبراطوري والسيطرة الشاملة',
    characterName: 'مجلس قيادة الإمبراطورية',
    characterAvatar: '👑',
    characterTitle: 'عادل منصور · ليان فؤاد · نادر السالمي · كمال الراوي',
    dialogueText:
      'يا لها من ملحمة خالدة! بدأت من مصنع منهك مهدد بالحجز والإفلاس، وها أنت اليوم تقف على عرش الاقتصاد العالمي، تدير صروحاً عملاقة، وتتحكم في سلاسل التوريد عبر القارات. كمال الراوي يقف محترماً لقوتك، ونادر السالمي يعلن عودة مجد الأفق باسمك، وليان تؤكد أن ميزانيتك تتفوق على كبرى الصناديق السيادية. لقد صعدت إمبراطورية Suly Business Empire لتصبح الرقم واحد!',
    objectiveText: 'الوصول للمستوى 15 وامتلاك 4 شركات مطورة على الأقل وأرباح تتجاوز 20,000,000 ج.م',
    requiredLevel: 15,
    requiredCompanies: 4,
    requiredProfit: 20_000_000,
    rewardDiamonds: 2500,
    rewardGoldGrams: 250,
    rewardTitle: 'إمبراطور الاقتصاد والسيادة المطلقة 👑',
    choices: [
      {
        id: 'c5_choice_1',
        text: 'تأسيس الصندوق السيادي العالمي للإمبراطورية وطرح الأسهم للاكتتاب',
        effectDescription: 'سيادة تجارية مطلقة ومكافأة 1,000,000 ج.م',
        reputationDelta: 35,
        rewardMoney: 1000000,
      },
      {
        id: 'c5_choice_2',
        text: 'إنشاء مدينة صناعية متكاملة ومراكز أبحاث للطاقة والذكاء الاصطناعي',
        effectDescription: 'مكافأة 500 ماسة أسطورية ولقب صانع المستقبل',
        reputationDelta: 30,
        rewardDiamonds: 500,
      },
    ],
  },
];

export function getPlayerCampaignChapter(profile: PlayerProfile): CampaignChapter {
  const currentChapterId = (profile as unknown as { campaignChapterId?: number }).campaignChapterId ?? 1;
  return CAMPAIGN_CHAPTERS.find((c) => c.id === currentChapterId) ?? CAMPAIGN_CHAPTERS[0];
}

export function isChapterCompleted(profile: PlayerProfile, chapter: CampaignChapter): boolean {
  const level = profile.level ?? 1;
  const companies = profile.companies.length;
  const netProfit = profile.finances.netProfit;
  return level >= chapter.requiredLevel && companies >= chapter.requiredCompanies && netProfit >= chapter.requiredProfit;
}
