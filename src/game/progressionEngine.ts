import type { CountryId, IndustryId } from '../domain/countries';
import type { SectionId } from '../domain/navigation';
import type { PlayerProfile } from '../domain/player';

export type ProgressionStatus = 'locked' | 'available' | 'active' | 'completed' | 'failed';

export interface SectionDependencySpec {
  sectionId: SectionId;
  requiredLevel: number;
  storyStage: number; // 1..10
  chapterNumber: number; // 1..4
  badgeLabel: string;
  storyHint: string;
  prerequisiteDescription: string;
  relatedQuestIds: readonly string[];
  allowedNotificationIds: readonly string[];
  relatedEventTypes: readonly string[];
}

export const EXPERIENCE_PER_LEVEL = 150;

export const INTRO_UNLOCKED_SECTIONS: readonly SectionId[] = [
  'home',
  'empire',
  'store',
  'profile',
  'lands',
  'companies',
  'tasks',
  'auctions',
  'obligations',
];

export const SECTION_DEPENDENCY_MAP: Record<SectionId, SectionDependencySpec> = {
  home: {
    sectionId: 'home',
    requiredLevel: 1,
    storyStage: 1,
    chapterNumber: 1,
    badgeLabel: 'متاح',
    storyHint: 'مقر القيادة متاح دائماً',
    prerequisiteDescription: 'متاح منذ اللحظة الأولى لقيادة الإمبراطورية.',
    relatedQuestIds: ['sq-repair-factory'],
    allowedNotificationIds: ['badges-earned'],
    relatedEventTypes: ['general'],
  },
  empire: {
    sectionId: 'empire',
    requiredLevel: 1,
    storyStage: 1,
    chapterNumber: 1,
    badgeLabel: 'متاح',
    storyHint: 'إدارة المنشآت والتوسع بين المدن والدول',
    prerequisiteDescription: 'متاح لمتابعة الشركات والمصانع والفروع والمحلات والأراضي والتوسع الاستراتيجي.',
    relatedQuestIds: ['sq-repair-factory', 'sq-expand-company'],
    allowedNotificationIds: ['empire-halted-facilities', 'empire-material-shortage'],
    relatedEventTypes: ['factory', 'supply-chain'],
  },
  profile: {
    sectionId: 'profile',
    requiredLevel: 1,
    storyStage: 1,
    chapterNumber: 1,
    badgeLabel: 'متاح',
    storyHint: 'الملف الشخصي وإعداداتك',
    prerequisiteDescription: 'متاح دائماً لإدارة الهوية والحفظ.',
    relatedQuestIds: [],
    allowedNotificationIds: [],
    relatedEventTypes: [],
  },
  store: {
    sectionId: 'store',
    requiredLevel: 1,
    storyStage: 1,
    chapterNumber: 1,
    badgeLabel: 'متاح',
    storyHint: 'متجر الماس والباقات الحصرية',
    prerequisiteDescription: 'متاح لشراء الذهب وبطاقات التسريع الاختيارية.',
    relatedQuestIds: [],
    allowedNotificationIds: [],
    relatedEventTypes: [],
  },
  tasks: {
    sectionId: 'tasks',
    requiredLevel: 1,
    storyStage: 1,
    chapterNumber: 1,
    badgeLabel: 'متاح',
    storyHint: 'مهام القصة والإنجازات الوطنية',
    prerequisiteDescription: 'متاح منذ بداية الفصل الأول لمتابعة خطة الإنقاذ.',
    relatedQuestIds: ['sq-repair-factory', 'sq-settle-obligation', 'sq-buy-land', 'sq-first-production', 'sq-first-sale'],
    allowedNotificationIds: ['quest-ready'],
    relatedEventTypes: ['milestone'],
  },
  companies: {
    sectionId: 'companies',
    requiredLevel: 1,
    storyStage: 2,
    chapterNumber: 1,
    badgeLabel: 'متاح',
    storyHint: 'صيانة المصنع الموروث وتأسيس شركاتك',
    prerequisiteDescription: 'متاح لفحص وصيانة المصنع الموروث وتأسيس منشآت جديدة.',
    relatedQuestIds: ['sq-repair-factory', 'sq-expand-company'],
    allowedNotificationIds: ['ownership-transfer-company'],
    relatedEventTypes: ['factory', 'energy'],
  },
  obligations: {
    sectionId: 'obligations',
    requiredLevel: 1,
    storyStage: 1,
    chapterNumber: 1,
    badgeLabel: 'متاح للرقابة',
    storyHint: 'متابعة الديون والالتزامات وفترة السماح القضائية',
    prerequisiteDescription: 'متاح لمراقبة مهلة القرض الموروث وسداد الالتزامات المستحقة.',
    relatedQuestIds: ['sq-settle-obligation'],
    allowedNotificationIds: ['payables', 'inherited-loan-grace'],
    relatedEventTypes: ['debt'],
  },
  lands: {
    sectionId: 'lands',
    requiredLevel: 1,
    storyStage: 2,
    chapterNumber: 1,
    badgeLabel: 'متاح',
    storyHint: 'شراء وتطوير الأراضي الاستثمارية (الفصل الأول)',
    prerequisiteDescription: 'متاح لشراء أراضٍ صناعية وزراعية وتجارية جديدة.',
    relatedQuestIds: ['sq-buy-land'],
    allowedNotificationIds: ['ownership-transfer-land'],
    relatedEventTypes: ['real-estate'],
  },
  auctions: {
    sectionId: 'auctions',
    requiredLevel: 1,
    storyStage: 2,
    chapterNumber: 1,
    badgeLabel: 'متاح',
    storyHint: 'المزادات العلنية على الأصول والمصانع المتعثرة',
    prerequisiteDescription: 'متاح للمنافسة على الأراضي والمصانع وشحنات الخام.',
    relatedQuestIds: [],
    allowedNotificationIds: ['auctions-open'],
    relatedEventTypes: ['auction'],
  },
  inventory: {
    sectionId: 'inventory',
    requiredLevel: 2,
    storyStage: 3,
    chapterNumber: 1,
    badgeLabel: 'يفتح في مستوى 2',
    storyHint: 'المستودعات وسلاسل إمداد المواد الخام',
    prerequisiteDescription: 'يفتح فور إتمام مقدمة القصة مع امتلاك أول مصنع أو الوصول إلى المستوى 2.',
    relatedQuestIds: ['sq-buy-materials', 'sq-first-sale'],
    allowedNotificationIds: ['global-market-open'],
    relatedEventTypes: ['supply-chain', 'raw-materials'],
  },
  production: {
    sectionId: 'production',
    requiredLevel: 2,
    storyStage: 3,
    chapterNumber: 1,
    badgeLabel: 'يفتح في مستوى 2',
    storyHint: 'تشغيل خطوط المصانع وتحويل الخامات إلى منتجات',
    prerequisiteDescription: 'يفتح فور إتمام مقدمة القصة مع امتلاك أول مصنع أو الوصول إلى المستوى 2.',
    relatedQuestIds: ['sq-first-production'],
    allowedNotificationIds: ['production-completed'],
    relatedEventTypes: ['production'],
  },
  contracts: {
    sectionId: 'contracts',
    requiredLevel: 3,
    storyStage: 4,
    chapterNumber: 1,
    badgeLabel: 'يفتح في مستوى 3',
    storyHint: 'عقود التوريد واستعادة ثقة كبار التجار',
    prerequisiteDescription: 'يفتح بعد إكمال أول إنتاج وأول عملية بيع، أو الوصول إلى المستوى 3.',
    relatedQuestIds: ['sq-first-contract'],
    allowedNotificationIds: ['contracts-due'],
    relatedEventTypes: ['contracts', 'demand'],
  },
  bank: {
    sectionId: 'bank',
    requiredLevel: 4,
    storyStage: 6,
    chapterNumber: 1,
    badgeLabel: 'يفتح في مستوى 4',
    storyHint: 'رفع التجميد البنكي واستعادة التسهيلات والقروض والودائع',
    prerequisiteDescription: 'يُرفع التجميد البنكي بعد تسليم أول عقد تجاري بنجاح أو الوصول إلى المستوى 4.',
    relatedQuestIds: ['sq-unlock-bank'],
    allowedNotificationIds: ['loans-due', 'deposit-mature'],
    relatedEventTypes: ['banking', 'interest-rates'],
  },
  investments: {
    sectionId: 'investments',
    requiredLevel: 5,
    storyStage: 6,
    chapterNumber: 2,
    badgeLabel: 'يفتح في مستوى 5',
    storyHint: 'البورصة والتداول في الأسواق المالية والاكتتاب العام',
    prerequisiteDescription: 'يفتح في المستوى 5 أو بعد إنجاز عقدين وتوسيع شركاتك إلى شركتين.',
    relatedQuestIds: ['sq-enter-market'],
    allowedNotificationIds: ['stock-dividend', 'investment-mature'],
    relatedEventTypes: ['stock-market'],
  },
  staff: {
    sectionId: 'staff',
    requiredLevel: 5,
    storyStage: 7,
    chapterNumber: 2,
    badgeLabel: 'يفتح في مستوى 5',
    storyHint: 'توظيف المديرين والمحاسبين والخبراء التنفيذيين',
    prerequisiteDescription: 'يفتح في المستوى 5 أو بعد إنجاز عقدين وامتلاك شركتين.',
    relatedQuestIds: ['sq-hire-team'],
    allowedNotificationIds: ['salary-overdue'],
    relatedEventTypes: ['payroll'],
  },
  reports: {
    sectionId: 'reports',
    requiredLevel: 5,
    storyStage: 6,
    chapterNumber: 2,
    badgeLabel: 'يفتح في مستوى 5',
    storyHint: 'التقارير المالية المتقدمة وتحليل الأداء والربحية',
    prerequisiteDescription: 'يفتح في المستوى 5 أو بعد إنجاز عقدين وامتلاك شركتين.',
    relatedQuestIds: [],
    allowedNotificationIds: ['economic-events'],
    relatedEventTypes: ['macro-report'],
  },
  tech_tree: {
    sectionId: 'tech_tree',
    requiredLevel: 6,
    storyStage: 8,
    chapterNumber: 2,
    badgeLabel: 'يفتح في مستوى 6',
    storyHint: 'شجرة التكنولوجيا وأبحاث الأتمتة الذكية للمصانع',
    prerequisiteDescription: 'يفتح عند الوصول إلى المستوى 6.',
    relatedQuestIds: ['sq-research-tech'],
    allowedNotificationIds: ['research-complete'],
    relatedEventTypes: ['automation'],
  },
  territory: {
    sectionId: 'territory',
    requiredLevel: 7,
    storyStage: 9,
    chapterNumber: 2,
    badgeLabel: 'يفتح في مستوى 7',
    storyHint: 'خريطة السيطرة والتوسع الجغرافي وحصص الأسواق',
    prerequisiteDescription: 'يفتح عند الوصول إلى المستوى 7.',
    relatedQuestIds: ['sq-regional-control'],
    allowedNotificationIds: ['territory-income'],
    relatedEventTypes: ['regional'],
  },
  luxury: {
    sectionId: 'luxury',
    requiredLevel: 8,
    storyStage: 8,
    chapterNumber: 2,
    badgeLabel: 'يفتح في مستوى 8',
    storyHint: 'أصول الهيبة والسيارات الفارهة ونفوذ المدير التنفيذي',
    prerequisiteDescription: 'يفتح عند الوصول إلى المستوى 8.',
    relatedQuestIds: [],
    allowedNotificationIds: [],
    relatedEventTypes: ['prestige'],
  },
  cartel: {
    sectionId: 'cartel',
    requiredLevel: 9,
    storyStage: 9,
    chapterNumber: 3,
    badgeLabel: 'يفتح في مستوى 9',
    storyHint: 'تأسيس الكارتيل والتحالفات التجارية وحرب الأسعار',
    prerequisiteDescription: 'يفتح عند الوصول إلى المستوى 9.',
    relatedQuestIds: ['sq-cartel-alliance'],
    allowedNotificationIds: ['cartel-alert'],
    relatedEventTypes: ['cartel'],
  },
  maritime: {
    sectionId: 'maritime',
    requiredLevel: 10,
    storyStage: 10,
    chapterNumber: 3,
    badgeLabel: 'يفتح في مستوى 10',
    storyHint: 'الأسطول التجاري البحري والشحن الدولي للموانئ',
    prerequisiteDescription: 'يفتح عند الوصول إلى المستوى 10.',
    relatedQuestIds: ['sq-maritime-fleet'],
    allowedNotificationIds: ['maritime-shipment'],
    relatedEventTypes: ['maritime'],
  },
  megaprojects: {
    sectionId: 'megaprojects',
    requiredLevel: 12,
    storyStage: 10,
    chapterNumber: 3,
    badgeLabel: 'يفتح في مستوى 12',
    storyHint: 'المشاريع القومية العملاقة والمناقصات السيادية',
    prerequisiteDescription: 'يفتح عند الوصول إلى المستوى 12.',
    relatedQuestIds: ['sq-sovereign-tender'],
    allowedNotificationIds: ['megaproject-bid'],
    relatedEventTypes: ['sovereign'],
  },
  incubator: {
    sectionId: 'incubator',
    requiredLevel: 15,
    storyStage: 10,
    chapterNumber: 4,
    badgeLabel: 'يفتح في مستوى 15',
    storyHint: 'الاستثمار الجريء ورعاية شركات اليونيكورن الناشئة',
    prerequisiteDescription: 'يفتح عند الوصول إلى المستوى 15.',
    relatedQuestIds: ['sq-unicorn-vc'],
    allowedNotificationIds: ['vc-exit'],
    relatedEventTypes: ['venture'],
  },
};

export interface PlayerProgressSummary {
  level: number;
  totalExperience: number;
  experienceInLevel: number;
  experienceForNextLevel: number;
  currentStoryStage: number; // 1..10
  currentChapter: number; // 1..4
}

export function calculatePlayerProgress(profile: PlayerProfile): PlayerProgressSummary {
  const completedProduction = profile.productionOrders.filter((order) => order.status === 'completed').length;
  const completedContracts = profile.contracts.filter((contract) => contract.status === 'completed').length;
  const totalExperience =
    profile.lands.length * 35
    + profile.companies.length * 75
    + Math.min(completedProduction, 20) * 22
    + Math.min(profile.sales.length, 30) * 12
    + Math.min(completedContracts, 20) * 45
    + Math.min(profile.completedTaskIds.length, 30) * 22
    + Math.min(profile.achievements.length, 30) * 30
    + Math.min(profile.investments.length, 20) * 15
    + Math.min(profile.staff.length, 15) * 8;

  const activityLevel = 1 + Math.floor(totalExperience / EXPERIENCE_PER_LEVEL);
  const level = Math.max(1, profile.level || 1, activityLevel);
  const experienceInLevel = level > activityLevel ? 0 : totalExperience % EXPERIENCE_PER_LEVEL;

  // Determine 1..10 Story Stage from actual player milestones
  let currentStoryStage = 1;
  const factoryRepaired = profile.companies.some((c) => (c.maintenanceCondition ?? 100) >= 90);
  if (factoryRepaired || profile.lands.length >= 2) currentStoryStage = 2;
  if (profile.inventory.length > 0 || profile.productionOrders.length > 0 || level >= 2) currentStoryStage = 3;
  if ((completedProduction > 0 && profile.sales.length > 0) || level >= 3) currentStoryStage = 4;
  if (completedContracts >= 1 || profile.banking.loans.every((l) => l.status !== 'active')) currentStoryStage = Math.max(currentStoryStage, 5);
  if (completedContracts >= 1 || level >= 4) currentStoryStage = Math.max(currentStoryStage, 6);
  if (level >= 5 || profile.staff.some((s) => s.status === 'active')) currentStoryStage = Math.max(currentStoryStage, 7);
  if (level >= 6) currentStoryStage = Math.max(currentStoryStage, 8);
  if (level >= 9) currentStoryStage = Math.max(currentStoryStage, 9);
  if (level >= 12) currentStoryStage = 10;

  let currentChapter = 1;
  if (!profile.onboarding?.introCompleted) {
    currentChapter = 0;
  } else if (level >= 5 || profile.companies.length >= 3) {
    currentChapter = 4;
  } else if (completedContracts >= 1) {
    currentChapter = 3;
  } else if (completedProduction > 0) {
    currentChapter = 2;
  }

  return {
    level,
    totalExperience,
    experienceInLevel,
    experienceForNextLevel: EXPERIENCE_PER_LEVEL,
    currentStoryStage,
    currentChapter,
  };
}

export function computeUnlockedSections(profile: PlayerProfile): SectionId[] {
  if (!profile.onboarding?.introCompleted) {
    return [...INTRO_UNLOCKED_SECTIONS];
  }

  const unlocked = new Set<SectionId>(INTRO_UNLOCKED_SECTIONS);
  const progress = calculatePlayerProgress(profile);
  const level = progress.level;
  const completedProduction = profile.productionOrders.some((order) => order.status === 'completed');
  const completedSales = profile.sales.length > 0;
  const completedContracts = profile.contracts.filter((contract) => contract.status === 'completed').length;

  // Stage 3 / Level 2: Production & Inventory
  if (profile.companies.length >= 1 || level >= 2) {
    unlocked.add('production');
    unlocked.add('inventory');
  }

  // Stage 4 / Level 3: Contracts
  if ((completedProduction && completedSales) || level >= 3) {
    unlocked.add('contracts');
  }

  // Stage 6 / Level 4: Bank (Lift Banking Freeze)
  if (completedContracts >= 1 || level >= 4) {
    unlocked.add('bank');
  }

  // Stage 6-7 / Level 5: Investments, Staff, Reports
  if (level >= 5 || (completedContracts >= 2 && profile.companies.length >= 2)) {
    unlocked.add('investments');
    unlocked.add('staff');
    unlocked.add('reports');
  }

  // Advanced Empire Expansion Systems
  if (level >= 6) unlocked.add('tech_tree');
  if (level >= 7) unlocked.add('territory');
  if (level >= 8) unlocked.add('luxury');
  if (level >= 9) unlocked.add('cartel');
  if (level >= 10) unlocked.add('maritime');
  if (level >= 12) unlocked.add('megaprojects');
  if (level >= 15) unlocked.add('incubator');

  return [...unlocked];
}

export function getSectionProgressionStatus(profile: PlayerProfile, sectionId: SectionId): ProgressionStatus {
  const unlocked = computeUnlockedSections(profile).includes(sectionId);
  if (!unlocked) return 'locked';

  switch (sectionId) {
    case 'companies':
      return profile.companies.some((c) => (c.maintenanceCondition ?? 100) < 50) ? 'active' : 'available';
    case 'obligations':
      return profile.payables > 0 || profile.banking.loans.some((l) => l.status === 'active') ? 'active' : 'completed';
    case 'production':
      return profile.productionOrders.some((o) => o.status === 'active')
        ? 'active'
        : profile.productionOrders.some((o) => o.status === 'completed')
          ? 'completed'
          : 'available';
    case 'contracts':
      if (profile.contracts.some((c) => c.status === 'active')) return 'active';
      if (profile.contracts.some((c) => c.status === 'failed') && !profile.contracts.some((c) => c.status === 'completed')) return 'failed';
      return profile.contracts.some((c) => c.status === 'completed') ? 'completed' : 'available';
    default:
      return profile.onboarding?.seenGuides?.includes(sectionId) ? 'active' : 'available';
  }
}

/**
 * Central guard preventing notifications, toasts, or popups from leaking
 * locked sections, unowned assets, or foreign country events.
 */
export function isNotificationAllowedForProfile(
  profile: PlayerProfile,
  options: {
    section: SectionId;
    countryId?: CountryId;
    requiresOwnedCompanyIndustry?: IndustryId;
    requiresActiveStaff?: boolean;
    requiresActiveLoans?: boolean;
    requiresActiveContracts?: boolean;
    requiresInvestments?: boolean;
  },
): boolean {
  // 1. Country isolation check
  if (options.countryId && options.countryId !== profile.countryId) {
    return false;
  }

  // 2. Section must be unlocked for this player
  const unlockedSections = computeUnlockedSections(profile);
  if (!unlockedSections.includes(options.section)) {
    return false;
  }

  // 3. Asset/entity ownership checks
  if (options.requiresOwnedCompanyIndustry) {
    const ownsSector = profile.companies.some((c) => c.industryId === options.requiresOwnedCompanyIndustry);
    if (!ownsSector) return false;
  }

  if (options.requiresActiveStaff) {
    const hasStaff = profile.staff.some((s) => s.status === 'active');
    if (!hasStaff) return false;
  }

  if (options.requiresActiveLoans) {
    const hasLoan = profile.banking.loans.some((l) => l.status === 'active');
    if (!hasLoan) return false;
  }

  if (options.requiresActiveContracts) {
    const hasContract = profile.contracts.some((c) => c.status === 'active');
    if (!hasContract) return false;
  }

  if (options.requiresInvestments) {
    const hasInvestment = profile.investments.some((i) => i.status === 'active');
    if (!hasInvestment) return false;
  }

  return true;
}

/**
 * Resolves a safe unlocked destination section for navigation/notifications.
 * Never returns a locked section.
 */
export function resolveSafeSection(profile: PlayerProfile, requestedSection?: SectionId): SectionId {
  if (!requestedSection) return 'home';
  const unlocked = computeUnlockedSections(profile);
  if (unlocked.includes(requestedSection)) return requestedSection;
  if (requestedSection === 'bank' && unlocked.includes('obligations')) return 'obligations';
  return 'home';
}
