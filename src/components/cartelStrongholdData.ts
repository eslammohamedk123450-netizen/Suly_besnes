/** بيانات معقل الكارتيل والتخزين المحلي — لا تعتمد على Three.js. */
import type { PlayerProfile } from '../domain/player';
import type { MegaExpansionState } from '../domain/expansionSystems';



export interface CartelStrongholdLevelInfo {
  level: number;
  nameAr: string;
  subTitleAr: string;
  imageSrc: string;
  upgradeCost: number;
  requiredPlayerLevel: number;
  perksAr: string[];
  totalDomes: number;
  hasWaterfall: boolean;
  hasHelipad: boolean;
  hasYachtHarbor: boolean;
  descriptionAr: string;
}

export const CARTEL_STRONGHOLD_LEVELS: CartelStrongholdLevelInfo[] = [
  {
    level: 1,
    nameAr: 'تحالف ناشئ',
    subTitleAr: 'فيلا التحالف الساحلية (Alliance Villa - Level 1)',
    imageSrc: '/images/cartel-bastion/level-01.jpg',
    upgradeCost: 0,
    requiredPlayerLevel: 1,
    perksAr: ['تأسيس مقر التحالف الساحلي في جزيرة صخرية خاصة', 'حوض سباحة بانورامي ورصيف زوارق خشبي', '+10% زيادة إيرادات عمليات التحالف'],
    totalDomes: 2,
    hasWaterfall: false,
    hasHelipad: false,
    hasYachtHarbor: true,
    descriptionAr: 'مقر تأسيسي على جزيرة صخرية تضم فيلا كلاسيكية بقبة ذهبية مركزية ومسبح ساحلي ورصيف زوارق.',
  },
  {
    level: 2,
    nameAr: 'نادي صغير',
    subTitleAr: 'المعقل الفاخر المحصن (Luxury Alliance Outpost - Level 2)',
    imageSrc: '/images/cartel-bastion/level-02.jpg',
    upgradeCost: 750000,
    requiredPlayerLevel: 2,
    perksAr: ['أسوار حجرية محصنة وأبراج مراقبة بقباب ذهبية', 'مهبط طائرات هليكوبتر تنفيذي على السطح', 'مرسى زوارق سريعة إضافي', '+20% زيادة إيرادات التحالف'],
    totalDomes: 3,
    hasWaterfall: false,
    hasHelipad: true,
    hasYachtHarbor: true,
    descriptionAr: 'توسع المعقل إلى حصن ساحلي مسوّر مع باحة داخلية وقباب ذهبية متعددة ومهبط مروحيات.',
  },
  {
    level: 3,
    nameAr: 'قصر تحالف',
    subTitleAr: 'قصر التحالف الدبلوماسي (Alliance Palace - Level 3)',
    imageSrc: '/images/cartel-bastion/level-03.jpg',
    upgradeCost: 2000000,
    requiredPlayerLevel: 3,
    perksAr: ['3 قباب ملكية ذهبية وبوابة كارتيل فخمة', 'فسيفساء ساحة الشرف الملكية المنقوشة', 'أسطول سيارات دفع رباعي فارهة عند المدخل', '+35% زيادة إيرادات التحالف'],
    totalDomes: 5,
    hasWaterfall: false,
    hasHelipad: true,
    hasYachtHarbor: true,
    descriptionAr: 'قصر نيوكلاسيكي فخم يضم 3 قباب ذهبية شامخة وبرجين دفاعيين، وفسيفساء شعار التحالف.',
  },
  {
    level: 4,
    nameAr: 'قصر متوسط',
    subTitleAr: 'قصر التحالف بالشلال الصخري (Medium Alliance Palace - Level 4)',
    imageSrc: '/images/cartel-bastion/level-04.jpg',
    upgradeCost: 5000000,
    requiredPlayerLevel: 4,
    perksAr: ['مسبح إنفينيتي زجاجي مع شلال هادر يتدفق في مياه البحر', 'يخت سياحي فاره في المرسى الخاص', 'سيارة رياضية خارقة وسيارة دفع رباعي', '+55% زيادة إيرادات التحالف'],
    totalDomes: 7,
    hasWaterfall: true,
    hasHelipad: true,
    hasYachtHarbor: true,
    descriptionAr: 'مسبح إنفينيتي زجاجي معلق على الجرف يتدفق منه شلال مائي هائل إلى البحر، مع يخت خاص ومهبط مروحيات.',
  },
  {
    level: 5,
    nameAr: 'قصر كبير',
    subTitleAr: 'القصر الإمبراطوري الكبير (Grand Alliance Palace - Level 5)',
    imageSrc: '/images/cartel-bastion/level-05.jpg',
    upgradeCost: 12000000,
    requiredPlayerLevel: 5,
    perksAr: ['شلالات متدفقة مزدوجة تنحدر للبحر المفتوح', 'نافورة رخامية مركزية في باحة القصر', 'فيلات ضيافة VIP مستقلة على محيط الجرف', '+80% زيادة إيرادات التحالف'],
    totalDomes: 8,
    hasWaterfall: true,
    hasHelipad: true,
    hasYachtHarbor: true,
    descriptionAr: 'أجنحة قصر ممتدة على شكل U ونافورة ملكية وشلالات مزدوجة وفلل ضيوف خاصة على صخور الشاطئ.',
  },
  {
    level: 6,
    nameAr: 'قصر فخم',
    subTitleAr: 'الصرح الملكي الفاخر (Luxury Alliance Palace - Level 6)',
    imageSrc: '/images/cartel-bastion/level-06.jpg',
    upgradeCost: 25000000,
    requiredPlayerLevel: 6,
    perksAr: ['حدائق متاهة نباتية وكابانات VIP فاخرة', 'أسطول متكامل من اليخوت والقوارب السريعة', 'قباب ذهبية متعددة الطبقات وشرفات شمسية واسعة', '+110% زيادة إيرادات التحالف'],
    totalDomes: 10,
    hasWaterfall: true,
    hasHelipad: true,
    hasYachtHarbor: true,
    descriptionAr: 'صرح ملكي متكامل مع حدائق نباتية مشذبة وشرفات استجمام علوية ويخوت بحرية فارهة.',
  },
  {
    level: 7,
    nameAr: 'امبراطورية',
    subTitleAr: 'قلعة الإمبراطورية السيادية (Alliance Empire - Level 7)',
    imageSrc: '/images/cartel-bastion/level-07.jpg',
    upgradeCost: 60000000,
    requiredPlayerLevel: 7,
    perksAr: ['حصون سيادية وأبراج دفاعية مزينة بالشعارات الذهبية', 'مرسى بحري عميق لليخوت الملكية العملاقة', 'تخفيض 25% في تكلفة خامات السوق والمناقصات', '+150% زيادة إيرادات التحالف'],
    totalDomes: 12,
    hasWaterfall: true,
    hasHelipad: true,
    hasYachtHarbor: true,
    descriptionAr: 'قلعة سيادية محصنة تتسع لأسطول يخوت فارهة مع قباب ذهبية مهيبة وحماية أمنية مشددة.',
  },
  {
    level: 8,
    nameAr: 'معقل الكارتيل العالمي',
    subTitleAr: 'المعقل الأسطوري الأعلى (World Cartel Stronghold - MAX Level 8)',
    imageSrc: '/images/cartel-bastion/level-08.jpg',
    upgradeCost: 150000000,
    requiredPlayerLevel: 8,
    perksAr: ['أعلى تصنيف سيادي في عالم المال والسيطرة على الأسواق', 'قبة ذهبية أسطورية عملاقة مع أهلة إسلامية مذهبة', 'تحكم استراتيجي كامل في أسعار البورصة ومضاربات الكارتيل', '+200% مضاعفة أرباح عمليات الكارتيل'],
    totalDomes: 14,
    hasWaterfall: true,
    hasHelipad: true,
    hasYachtHarbor: true,
    descriptionAr: 'قمة الفخامة والقوة الاقتصادية: القصر الذهبي الأعظم مع شلالات ضخمة، أسطول يخوت، مروحية كارتيل، وبوابات ذهبية.',
  },
];

export function getCartelStrongholdLevel(
  profile?: PlayerProfile | null,
  expansion?: MegaExpansionState | null
): number {
  if (profile?.cartelStrongholdLevel && profile.cartelStrongholdLevel >= 1) {
    return Math.min(8, Math.max(1, profile.cartelStrongholdLevel));
  }
  if (expansion?.cartel?.strongholdLevel && expansion.cartel.strongholdLevel >= 1) {
    return Math.min(8, Math.max(1, expansion.cartel.strongholdLevel));
  }
  // Try reading from localStorage as fallback
  if (profile?.id) {
    try {
      const stored = localStorage.getItem(`cartel_stronghold_level_${profile.id}`);
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 8) return parsed;
      }
    } catch {
      // Ignore
    }
  }
  // Natural progression tied to player level if not explicitly upgraded
  const pLevel = profile?.level ?? 1;
  return Math.min(8, Math.max(1, pLevel));
}

export function saveCartelStrongholdLevel(profileId: string, level: number): void {
  try {
    localStorage.setItem(`cartel_stronghold_level_${profileId}`, String(level));
  } catch {
    // Ignore
  }
}
