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
    title: 'الشرارة الأولى - وصية الجد وتأسيس عائلة النيل',
    subtitle: 'الفصل الأول: البداية في ضفاف النيل',
    characterName: 'الحاج إبراهيم (مستشار العائلة)',
    characterAvatar: '👴',
    characterTitle: 'كبير مستشاري عائلة النيل',
    dialogueText:
      'مرحباً بك يا بني! لقد عشتُ أرافق جدك رحمة الله عليه وهو يؤسس أولى صوامع النيل. تداعت الأعمال بسبب منافسة "مجمع الأهرام" الاحتكاري، ولكنك الآن أملنا الأخير لإعادة المجد وصنع إمبراطورية أسطورية!',
    objectiveText: 'أسس أول شركة وشراء أرض زراعية وحقق أرباحاً بقيمة 100,000 $',
    requiredLevel: 1,
    requiredCompanies: 1,
    requiredProfit: 100_000,
    rewardDiamonds: 100,
    rewardGoldGrams: 10,
    rewardTitle: 'المستثمر الواعد 🌟',
    choices: [
      {
        id: 'c1_choice_1',
        text: 'الاعتماد على الموردين المحليين لتقليل المخاطر',
        effectDescription: 'زيادة السمعة التجارية +5 واستقرار التكاليف',
        reputationDelta: 5,
        rewardMoney: 25000,
      },
      {
        id: 'c1_choice_2',
        text: 'شراء أرض مستقلة فوراً للإنتاج الذاتي المباشر',
        effectDescription: 'احتمالية أرباح أكبر بـ +15% ومكافأة 20 ماسة',
        rewardDiamonds: 20,
      },
    ],
  },
  {
    id: 2,
    title: 'التحول الصناعي وأزمة الطاقة الكبرى',
    subtitle: 'الفصل الثاني: الدخول في الصناعة الثقيلة',
    characterName: 'المهندس فاروق (مدير التشغيل)',
    characterAvatar: '👨‍💼',
    characterTitle: 'خبير الطاقة والصناعة',
    dialogueText:
      'أهلاً بمديرنا! أسعار الطاقة العالمية في ارتفاع مفاجئ بسبب الأحداث السوقية. المنافسون في "تحالف الدلتا" يرفعون تكاليف التشغيل علينا. نحتاج لتوسيع مصانعنا وبناء محطة طاقة خاصة لتأمين إمبراطوريتك!',
    objectiveText: 'امتلك 2 شركات على الأقل ووصل لمستوى 5 مع تحقيق أرباح 500,000 $',
    requiredLevel: 5,
    requiredCompanies: 2,
    requiredProfit: 500_000,
    rewardDiamonds: 250,
    rewardGoldGrams: 25,
    rewardTitle: 'رائد الصناعة الوطنية ⚙️',
    choices: [
      {
        id: 'c2_choice_1',
        text: 'استثمار أرباحك لبناء محطة طاقة نظيفة خاصة',
        effectDescription: 'توفير دائري في تكاليف الطاقة المباشرة',
        rewardMoney: 50000,
      },
      {
        id: 'c2_choice_2',
        text: 'المزايدة في المزادات المباشرة لشراء عقود بترول رخيصة',
        effectDescription: 'مكافأة 50 ماسة فورية مع فتح مزادات المصانع',
        rewardDiamonds: 50,
      },
    ],
  },
  {
    id: 3,
    title: 'معركة الموانئ والتصدير العالمي',
    subtitle: 'الفصل الثالث: التوسع العابر للحدود',
    characterName: 'الكابتن طارق (مدير أسطول الشحن)',
    characterAvatar: '🛳️',
    characterTitle: 'مدير اللوجستيات والموانئ',
    dialogueText:
      'الإمبراطورية أصبحت حديث السوق! شركات المنافسين تحاول حظر شحناتنا في ميناء العاصمة. إذا نجحنا في تأسيس خط شحن وتوقيع أول عقد تجاري عالمي، سنصبح المورد الأول بالشرق الأوسط!',
    objectiveText: 'تصل للمستوى 10 وامتلك 3 شركات مع تحقيق صافي أرباح 2,000,000 $',
    requiredLevel: 10,
    requiredCompanies: 3,
    requiredProfit: 2_000_000,
    rewardDiamonds: 500,
    rewardGoldGrams: 50,
    rewardTitle: 'ملك التجارة واللوجستيات 🚢',
    choices: [
      {
        id: 'c3_choice_1',
        text: 'تأسيس أسطول شحن بحري محلي وكسر الاحتكار',
        effectDescription: 'زيادة السمعة بـ +15 ومكافأة 100,000 $',
        reputationDelta: 15,
        rewardMoney: 100000,
      },
      {
        id: 'c3_choice_2',
        text: 'توقيع عقود توريد حصري في البورصة العالمية',
        effectDescription: 'مكافأة 100 ماسة إضافية',
        rewardDiamonds: 100,
      },
    ],
  },
  {
    id: 4,
    title: 'عرش الإمبراطورية - القمة والسيادة المالية',
    subtitle: 'الفصل الرابع: السيطرة على الأسواق العالمية',
    characterName: 'السفير كمال (المستشار المالي)',
    characterAvatar: '👑',
    characterTitle: 'رئيس تحالف رجال الأعمال',
    dialogueText:
      'يا لها من إمبراطورية عظمى! لقد تجاوزت كل الجبابرة والمنافسين. العرش الاقتصادي الآن بين يديك. حان الوقت لطرح أسهم شركتك والاكتتاب العام بالبورصة والسيطرة الكاملة على الأسواق!',
    objectiveText: 'تصل للمستوى 15 وترأس قائمة المتصدرين مع أرباح تجاوزت 10,000,000 $',
    requiredLevel: 15,
    requiredCompanies: 4,
    requiredProfit: 10_000_000,
    rewardDiamonds: 1000,
    rewardGoldGrams: 100,
    rewardTitle: 'إمبراطور الاقتصاد والسيادة 👑',
    choices: [
      {
        id: 'c4_choice_1',
        text: 'الاستحواذ الشامل على أسهم الشركات المنافسة',
        effectDescription: 'سيطرة تامة ومكافأة 500,000 $',
        rewardMoney: 500000,
      },
      {
        id: 'c4_choice_2',
        text: 'إنشاء صندوق استثماري خيري لتطوير المجتمع والمدن',
        effectDescription: 'أقصى سمعة تجارية +30 و250 ماسة ملكية',
        reputationDelta: 30,
        rewardDiamonds: 250,
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
