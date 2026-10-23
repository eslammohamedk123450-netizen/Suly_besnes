import type { SectionId } from '../domain/navigation';
import type { PlayerProfile } from '../domain/player';

export interface StarterMission {
  id: string;
  title: string;
  description: string;
  section: SectionId;
  completed: boolean;
}

export interface SystemGuide {
  title: string;
  description: string;
  steps: string[];
}

const INTRO_UNLOCKS: SectionId[] = ['home', 'lands', 'companies', 'settings'];

export function getUnlockedSectionIds(profile: PlayerProfile): SectionId[] {
  if (!profile.onboarding?.introCompleted) return INTRO_UNLOCKS;
  const unlocked = new Set<SectionId>(INTRO_UNLOCKS);
  if (profile.companies.length >= 1) {
    unlocked.add('production');
    unlocked.add('inventory');
    unlocked.add('tasks');
  }
  if (profile.day >= 2) {
    unlocked.add('contracts');
    unlocked.add('auctions');
  }
  if (profile.day >= 3) {
    unlocked.add('bank');
    unlocked.add('investments');
    unlocked.add('obligations');
  }
  if (profile.day >= 4) {
    unlocked.add('staff');
    unlocked.add('reports');
  }
  return [...unlocked];
}

export function isSectionUnlocked(profile: PlayerProfile, section: SectionId): boolean {
  return getUnlockedSectionIds(profile).includes(section);
}

export function getStarterMissions(profile: PlayerProfile): StarterMission[] {
  return [
    { id: 'intro-land', title: 'استعد إرث العائلة', description: 'اشترِ أول قطعة أرض لتبدأ إعادة بناء الإمبراطورية.', section: 'lands', completed: profile.lands.length >= 1 },
    { id: 'intro-company', title: 'أعد تشغيل أول شركة', description: 'أسس شركتك الأولى واختر قطاعًا مناسبًا لرأس مالك.', section: 'companies', completed: profile.companies.length >= 1 },
    { id: 'intro-production', title: 'أثبت أن العائلة ما زالت قادرة', description: 'شغّل أول أمر إنتاج وحوّل المواد الخام إلى منتج.', section: 'production', completed: profile.productionOrders.length >= 1 || profile.sales.length >= 1 },
    { id: 'intro-contract', title: 'استعد ثقة السوق', description: 'افتح العقود لاحقًا وقبل أول طلب تستطيع تسليمه.', section: 'contracts', completed: profile.contracts.some((contract) => contract.status === 'completed') },
  ];
}

export function getSystemGuide(section: SectionId): SystemGuide {
  const guides: Partial<Record<SectionId, SystemGuide>> = {
    lands: { title: 'الأراضي: أول حجر في الإمبراطورية', description: 'كل شركة تحتاج موقعًا مناسبًا. طابق نوع الأرض مع القطاع قبل الشراء.', steps: ['قارن نوع الأرض بالقطاع المطلوب.', 'راقب السعر والمساحة قبل تأكيد الشراء.', 'اترك جزءًا من السيولة للتراخيص والتشغيل.'] },
    companies: { title: 'الشركات: حوّل الإرث إلى نشاط', description: 'أسس شركة واحدة أولًا، ثم تعلّم الإنتاج قبل التوسع.', steps: ['اختر اسمًا واضحًا للشركة.', 'اختر قطاعًا يناسب الأرض والمواد المتاحة.', 'لا تستهلك كل رأس المال في التأسيس.'] },
    production: { title: 'الإنتاج: هنا يبدأ الدخل الحقيقي', description: 'حوّل المواد إلى منتجات، ثم تابع الجودة والطاقة ووقت الإنجاز.', steps: ['اشترِ المواد المطلوبة.', 'راجع الطلب والسعر قبل تشغيل الدفعة.', 'انتظر اكتمال الإنتاج ثم بع أو سلّم عقدًا.'] },
    inventory: { title: 'المخازن: سيولتك المجمّدة', description: 'المخزون أصل مفيد لكنه يستهلك رأس المال ومساحة التخزين.', steps: ['راقب الكميات بدل الشراء العشوائي.', 'استخدم المخزون للعقود ذات الهامش الأفضل.', 'بع الفائض عندما تكون الأسعار مناسبة.'] },
    contracts: { title: 'العقود: ابنِ سمعة العائلة', description: 'كل طلب فرصة للربح والثقة، لكنه يحمل موعدًا نهائيًا وغرامة عند الفشل.', steps: ['اقبل عقدًا تستطيع إنتاجه.', 'افحص الكمية والموعد قبل القبول.', 'سلّم المنتج يدويًا من صفحة العقود.'] },
    auctions: { title: 'المزادات: توسع محسوب', description: 'المزاد قد يمنحك أصلًا مهمًا، لكنه قد يستهلك سيولتك بسرعة.', steps: ['حدد سقفًا قبل دخول المزاد.', 'لا تزايد بدافع المنافسة فقط.', 'احتفظ بسيولة للتشغيل بعد الفوز.'] },
    bank: { title: 'البنك والتمويل: استخدم الدين بحذر', description: 'التمويل يساعد على التوسع، لكنه يضيف التزامات يومية.', steps: ['قارن القسط بالسيولة اليومية.', 'استخدم أصلًا مؤهلًا كضمان.', 'اترك هامش أمان قبل طلب القرض.'] },
    investments: { title: 'الاستثمارات: نوّع المخاطر', description: 'ضع الفائض الذي لا تحتاجه للتشغيل في استثمار بمدة واضحة.', steps: ['لا تستثمر رأس مال التشغيل.', 'قارن المدة بالعائد والمخاطرة.', 'خطط مسبقًا ليوم الاستحقاق.'] },
    obligations: { title: 'الالتزامات: لا تتركها للمفاجآت', description: 'هنا ترى ما سيُخصم من سيولتك ومتى.', steps: ['راجع الأقساط والرواتب يوميًا.', 'سدّد المتأخرات قبل أن توقف الطاقة.', 'احتفظ باحتياطي نقدي.'] },
    staff: { title: 'الإدارة والرواتب: كفاءتك البشرية', description: 'الموظفون يضيفون قدرات، لكن رواتبهم التزام متكرر.', steps: ['وظّف الدور الذي تحتاجه فعلًا.', 'طابق الموظف مع الشركة المناسبة.', 'تابع الرواتب قبل ترحيل اليوم.'] },
    reports: { title: 'التقارير: قرارات على أرقام', description: 'اقرأ دفتر الحساب لتعرف هل تكبر أم تستهلك رأس المال.', steps: ['راجع الإيرادات والمصروفات.', 'قارن الربح بين القطاعات.', 'استخدم التقرير قبل أي توسع كبير.'] },
    tasks: { title: 'المهام والإنجازات: مكافآت التقدم', description: 'المهام تحول الخطوات الأولى إلى أهداف واضحة ومكافآت.', steps: ['افتح المهمة لمعرفة الشرط.', 'نفذها أثناء لعبك الطبيعي.', 'استلم المكافأة بعد تحقق الشرط.'] },
  };
  return guides[section] ?? { title: 'نظام جديد في الإمبراطورية', description: 'استخدم هذا القسم بحذر وتابع أثر قراراتك على السيولة.', steps: ['اقرأ الأرقام قبل التأكيد.', 'ابدأ بعملية صغيرة.', 'ارجع إلى التقارير لقياس النتيجة.'] };
}

export function chapterFor(profile: PlayerProfile): number {
  if (!profile.onboarding?.introCompleted) return 0;
  if (profile.day >= 4 || profile.companies.length >= 2) return 4;
  if (profile.day >= 3 || profile.companies.length >= 1) return 3;
  if (profile.day >= 2) return 2;
  return 1;
}
