import React, { useState } from 'react';
import type { PlayerCompany, PlayerLand, PlayerProfile } from '../domain/player';
import type { CountryDefinition, IndustryId } from '../domain/countries';
import type { SectionId } from '../domain/navigation';
import type { StaffContract, StaffRole } from '../domain/futureSystems';
import { formatMoney, formatNumber } from '../domain/formatters';
import { findIndustry } from '../game/catalog';
import { playSound } from '../game/soundEffects';
import { getPlayerProgress } from '../game/onboarding';
import './CompaniesEmpireHub.css';

// Pre-imported high resolution 3D renders matching the mockup
import bannerSkyline from '../assets/images/cairo_nile_skyline_banner_1792934674143.jpg';
import foodFactoryImg from '../assets/images/food_factory_facility_1792934672856.jpg';
import energyPlantImg from '../assets/images/energy_power_plant_1792934672742.jpg';
import maritimePortImg from '../assets/images/maritime_shipping_port_1792934673623.jpg';
import chemFacilityImg from '../assets/images/chemical_detergents_facility_1792934866484.jpg';
import techFacilityImg from '../assets/images/tech_electronics_facility_1792934881305.jpg';

import {
  Building2,
  Users,
  ShieldCheck,
  Briefcase,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Plus,
  Sparkles,
  CheckCircle2,
  Wallet,
  Landmark,
  FileText,
  BadgeCheck,
  Factory,
  Zap,
  Hammer,
  HelpCircle,
} from 'lucide-react';

interface CompaniesEmpireHubProps {
  profile: PlayerProfile;
  country: CountryDefinition;
  onNavigate: (section: SectionId) => void;
  onUpdateProfile: (updater: (prev: PlayerProfile) => PlayerProfile) => void;
  onNotice?: (msg: string, tone?: 'success' | 'error') => void;
}

export function CompaniesEmpireHub({
  profile,
  country,
  onNavigate,
  onUpdateProfile,
  onNotice,
}: CompaniesEmpireHubProps) {
  const playerProgress = getPlayerProgress(profile);

  // Tabs: 'empire' (overview & company building), 'management' (C-Suite & Payroll), 'bailout' (financial lifeline)
  const [activeTab, setActiveTab] = useState<'empire' | 'management' | 'bailout'>('empire');

  // Modals
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showHireModal, setShowHireModal] = useState<'workers' | 'accountants' | 'lawyers' | 'cfo' | 'coo' | null>(null);

  // Get the single Mega-Corporation
  const primaryCompany: PlayerCompany = profile.companies[0] ?? {
    id: 'inherited-food-company',
    name: 'صرح سولي للصناعات الكبرى',
    industryId: 'food',
    countryId: profile.countryId,
    foundedAt: profile.createdAt,
    foundedOnDay: 1,
    landId: 'inherited-factory-land',
    energyUnits: 150,
    energyCapacity: 200,
    operatingCostPerDay: 4500,
    maintenanceCondition: 85,
    upgradeLevel: 1,
  };

  const level = primaryCompany.upgradeLevel ?? 1;

  // Attached physical land
  const attachedLand: PlayerLand = profile.lands.find((l) => l.id === primaryCompany.landId) ?? {
    id: primaryCompany.landId ?? 'attached-mega-land',
    label: `أرض مجمع ${primaryCompany.name} (العاشر من رمضان)`,
    areaSquareMeters: 1200 + (level - 1) * 800,
    purchasePrice: 450000,
    acquiredAt: primaryCompany.foundedAt,
    landType: 'industrial',
    upgradeLevel: level,
  };

  // Staffing Counts
  const activeStaff = profile.staff.filter((m) => m.status === 'active');
  const workersCount = (primaryCompany.assignedWorkersCount ?? 0) + activeStaff.filter((m) => m.role === 'worker').length;
  const accountantsCount = (primaryCompany.assignedAccountantsCount ?? 0) + activeStaff.filter((m) => m.role === 'accountant').length;
  const lawyersCount = (primaryCompany.assignedLawyersCount ?? 0) + activeStaff.filter((m) => m.role === 'lawyer').length;

  // C-Suite Executives
  const cfo = activeStaff.find((m) => m.role === 'cfo_payroll') ?? (primaryCompany.cfoPayrollAssigned ? {
    id: 'cfo-default',
    role: 'cfo_payroll' as const,
    name: 'أ. سامح عبد الفتاح (CFO)',
    dailySalary: 600,
    monthlySalary: 18000,
    level: 2,
    hiredOnDay: 1,
    nextPayDay: 30,
    status: 'active' as const,
  } : null);

  const coo = activeStaff.find((m) => m.role === 'manager') ?? (primaryCompany.cooAssigned ? {
    id: 'coo-default',
    role: 'manager' as const,
    name: 'م. حسام الشربيني (COO)',
    dailySalary: 800,
    monthlySalary: 24000,
    level: 2,
    hiredOnDay: 1,
    nextPayDay: 30,
    status: 'active' as const,
  } : null);

  const isAutoPayrollOn = Boolean(primaryCompany.autoPayrollEnabled || cfo);

  const supervisor = activeStaff.find((m) => m.role === 'production_supervisor') ?? (primaryCompany.productionSupervisorAssigned ? {
    id: 'supervisor-default',
    role: 'production_supervisor' as const,
    name: 'م. إبراهيم شكري (مدير رقابة الإنتاج)',
    dailySalary: 500,
    monthlySalary: 15000,
    level: 2,
    hiredOnDay: 1,
    nextPayDay: 30,
    status: 'active' as const,
  } : null);

  const isContinuousProductionOn = Boolean(primaryCompany.continuousProductionEnabled || supervisor);

  // Upgrade Requirements for Next Level
  const nextLevel = level + 1;
  const requiredWorkers = Math.max(10, level * 12);
  const requiredAccountants = 2; // Exactly 2 accountants required by user prompt
  const requiredLawyers = 2;     // 2 lawyers for legal and contract matters
  const requiredBatches = Math.max(1, (level - 1) * 2);
  const completedBatches = profile.productionOrders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.batches, 0);

  const upgradeCost = Math.round(120000 * Math.pow(1.5, level - 1));
  const upgradeDiamondCost = Math.max(15, level * 10);
  const newLandArea = attachedLand.areaSquareMeters + 800;

  const hasEnoughWorkers = workersCount >= requiredWorkers;
  const hasEnoughAccountants = accountantsCount >= requiredAccountants;
  const hasEnoughLawyers = lawyersCount >= requiredLawyers;
  const hasEnoughBatches = completedBatches >= requiredBatches;
  const canAffordCash = profile.bankBalance >= upgradeCost;
  const canAffordDiamonds = profile.diamonds >= upgradeDiamondCost;
  const allRequirementsMet = hasEnoughWorkers && hasEnoughAccountants && hasEnoughLawyers && hasEnoughBatches && (canAffordCash || canAffordDiamonds);

  // Monthly Payroll Calculation
  const currentDayInMonth = ((profile.day - 1) % 30) + 1;
  const daysUntilPayroll = 30 - currentDayInMonth;
  const currentMonthNumber = Math.ceil(profile.day / 30);

  const totalMonthlyPayroll = activeStaff.reduce((sum, m) => sum + (m.monthlySalary ?? (m.dailySalary * 30)), 0)
    + (workersCount * 4500)
    + (accountantsCount * 13500)
    + (lawyersCount * 12000)
    + (cfo ? 18000 : 0)
    + (coo ? 24000 : 0);

  // Industry Visuals
  function getVisuals(industryId: IndustryId) {
    switch (industryId) {
      case 'food':
        return { img: foodFactoryImg, title: 'صناعات غذائية كبرى', slogan: 'صرح الأمن الغذائي والتصدير' };
      case 'electricity':
      case 'gas':
      case 'petroleum':
        return { img: energyPlantImg, title: 'طاقة ومحطات كبرى', slogan: 'محطة توليد متطورة وإمداد مستدام' };
      case 'transport':
        return { img: maritimePortImg, title: 'لوجستيات وموانئ', slogan: 'مركز الشحن والتجارة الدولية' };
      case 'detergents':
      case 'water':
        return { img: chemFacilityImg, title: 'صناعات كيميائية', slogan: 'مجمع التكرير والنقاء المتقدم' };
      case 'electronics':
      case 'construction':
      default:
        return { img: techFacilityImg, title: 'تكنولوجيا وصناعات ثقيلة', slogan: 'ريادة التصنيع الوطني' };
    }
  }

  const visuals = getVisuals(primaryCompany.industryId);

  // Level Stage Names
  function getLevelTitle(lvl: number) {
    if (lvl === 1) return 'المرحلة 1: ورشة تأسيسية معتمدة';
    if (lvl === 2) return 'المرحلة 2: مصنع آلي متطور';
    if (lvl === 3) return 'المرحلة 3: مجمع صناعي متكامل';
    if (lvl === 4) return 'المرحلة 4: صرح إنتاجي عملاق';
    return `المرحلة ${lvl}: إمبراطورية صناعية عابرة للمدن`;
  }

  // Handle Hiring Staff Direct
  function handleHireStaff(role: 'workers' | 'accountants' | 'lawyers') {
    if (role === 'workers') {
      const hireCost = 25000;
      if (profile.bankBalance < hireCost) {
        onNotice?.('لا تملك سيولة كافية لتوظيف طاقم عمال (+10 عمال)!', 'error');
        return;
      }
      onUpdateProfile((prev) => {
        const nextStaff: StaffContract = {
          id: `worker-crew-${Date.now()}`,
          name: `طاقم عمال الوردية (${(prev.staff.filter((m) => m.role === 'worker').length + 1)})`,
          role: 'worker',
          dailySalary: 150,
          monthlySalary: 4500,
          hiredOnDay: prev.day,
          nextPayDay: Math.ceil(prev.day / 30) * 30,
          status: 'active',
          companyId: primaryCompany.id,
          level: 1,
          experience: 0,
        };
        const updatedCompanies = prev.companies.map((c) =>
          c.id === primaryCompany.id ? { ...c, assignedWorkersCount: (c.assignedWorkersCount ?? 0) + 10 } : c
        );
        return {
          ...prev,
          bankBalance: prev.bankBalance - hireCost,
          staff: [...prev.staff, nextStaff],
          companies: updatedCompanies,
          ledger: [
            {
              id: `ledger-hire-worker-${Date.now()}`,
              category: 'expense',
              amount: hireCost,
              countryId: prev.countryId,
              occurredAt: new Date().toISOString(),
              note: `توظيف وتجهيز طاقم عمال خط الإنتاج (+10 عمال)`,
            },
            ...(prev.ledger ?? []),
          ],
        };
      });
      playSound('cash');
      onNotice?.('✅ تم تعيين طاقم عمال جديد بنجاح (+10 عمال)! ارتفعت القدرة التشغيلية.', 'success');
      setShowHireModal(null);
    } else if (role === 'accountants') {
      const hireCost = 18000;
      if (profile.bankBalance < hireCost) {
        onNotice?.('لا تملك سيولة كافية لتعيين محاسب قانوني!', 'error');
        return;
      }
      onUpdateProfile((prev) => {
        const nextStaff: StaffContract = {
          id: `accountant-${Date.now()}`,
          name: `محاسب قانوني معتمد (${accountantsCount + 1})`,
          role: 'accountant',
          dailySalary: 450,
          monthlySalary: 13500,
          hiredOnDay: prev.day,
          nextPayDay: Math.ceil(prev.day / 30) * 30,
          status: 'active',
          companyId: primaryCompany.id,
          level: 1,
          experience: 0,
        };
        const updatedCompanies = prev.companies.map((c) =>
          c.id === primaryCompany.id ? { ...c, assignedAccountantsCount: (c.assignedAccountantsCount ?? 0) + 1 } : c
        );
        return {
          ...prev,
          bankBalance: prev.bankBalance - hireCost,
          staff: [...prev.staff, nextStaff],
          companies: updatedCompanies,
          ledger: [
            {
              id: `ledger-hire-acc-${Date.now()}`,
              category: 'expense',
              amount: hireCost,
              countryId: prev.countryId,
              occurredAt: new Date().toISOString(),
              note: `تعيين محاسب قانوني معتمد لتدقيق ميزانية الصرح`,
            },
            ...(prev.ledger ?? []),
          ],
        };
      });
      playSound('cash');
      onNotice?.('✅ تم تعيين المحاسب القانوني بنجاح! تم اعتماد تدقيق الميزانية.', 'success');
      setShowHireModal(null);
    } else if (role === 'lawyers') {
      const hireCost = 20000;
      if (profile.bankBalance < hireCost) {
        onNotice?.('لا تملك سيولة كافية لتعيين مستشار قانوني!', 'error');
        return;
      }
      onUpdateProfile((prev) => {
        const nextStaff: StaffContract = {
          id: `lawyer-${Date.now()}`,
          name: `مستشار عقود وتراخيص (${lawyersCount + 1})`,
          role: 'lawyer',
          dailySalary: 400,
          monthlySalary: 12000,
          hiredOnDay: prev.day,
          nextPayDay: Math.ceil(prev.day / 30) * 30,
          status: 'active',
          companyId: primaryCompany.id,
          level: 1,
          experience: 0,
        };
        const updatedCompanies = prev.companies.map((c) =>
          c.id === primaryCompany.id ? { ...c, assignedLawyersCount: (c.assignedLawyersCount ?? 0) + 1 } : c
        );
        return {
          ...prev,
          bankBalance: prev.bankBalance - hireCost,
          staff: [...prev.staff, nextStaff],
          companies: updatedCompanies,
          ledger: [
            {
              id: `ledger-hire-lawyer-${Date.now()}`,
              category: 'expense',
              amount: hireCost,
              countryId: prev.countryId,
              occurredAt: new Date().toISOString(),
              note: `تعيين مستشار قانوني لحماية عقود وتراخيص الشركة`,
            },
            ...(prev.ledger ?? []),
          ],
        };
      });
      playSound('cash');
      onNotice?.('✅ تم تعيين المستشار القانوني بنجاح! أصبحت التراخيص محمية.', 'success');
      setShowHireModal(null);
    }
  }

  // Handle Appointing CFO (Payroll Manager)
  function handleAppointCFO() {
    const fee = 30000;
    if (profile.bankBalance < fee) {
      onNotice?.('تحتاج إلى 30,000 ج.م كرسوم تعيين المدير المالي التنفيذي!', 'error');
      return;
    }
    onUpdateProfile((prev) => {
      const newCFO: StaffContract = {
        id: `cfo-${Date.now()}`,
        name: 'د. سامح عبد الفتاح (CFO)',
        role: 'cfo_payroll',
        dailySalary: 600,
        monthlySalary: 18000,
        hiredOnDay: prev.day,
        nextPayDay: Math.ceil(prev.day / 30) * 30,
        status: 'active',
        companyId: primaryCompany.id,
        level: 2,
        experience: 0,
      };
      const updatedCompanies = prev.companies.map((c) =>
        c.id === primaryCompany.id ? { ...c, cfoPayrollAssigned: true, autoPayrollEnabled: true } : c
      );
      return {
        ...prev,
        bankBalance: prev.bankBalance - fee,
        staff: [...prev.staff, newCFO],
        companies: updatedCompanies,
        ledger: [
          {
            id: `ledger-cfo-${Date.now()}`,
            category: 'expense',
            amount: fee,
            countryId: prev.countryId,
            occurredAt: new Date().toISOString(),
            note: 'تعيين المدير المالي وشؤون الرواتب وتفعيل الصرف الآلي',
          },
          ...(prev.ledger ?? []),
        ],
      };
    });
    playSound('levelUp');
    onNotice?.('💼 تم تعيين المدير المالي (CFO) بنجاح! سيتولى دفع الرواتب الشهرية آلياً نيابة عنك.', 'success');
  }

  // Handle Appointing COO (General Manager)
  function handleAppointCOO() {
    const fee = 35000;
    if (profile.bankBalance < fee) {
      onNotice?.('تحتاج إلى 35,000 ج.م لتعيين المدير التنفيذي للتشغيل!', 'error');
      return;
    }
    onUpdateProfile((prev) => {
      const newCOO: StaffContract = {
        id: `coo-${Date.now()}`,
        name: 'م. حسام الشربيني (COO)',
        role: 'manager',
        dailySalary: 800,
        monthlySalary: 24000,
        hiredOnDay: prev.day,
        nextPayDay: Math.ceil(prev.day / 30) * 30,
        status: 'active',
        companyId: primaryCompany.id,
        level: 2,
        experience: 0,
      };
      const updatedCompanies = prev.companies.map((c) =>
        c.id === primaryCompany.id ? { ...c, cooAssigned: true } : c
      );
      return {
        ...prev,
        bankBalance: prev.bankBalance - fee,
        staff: [...prev.staff, newCOO],
        companies: updatedCompanies,
        ledger: [
          {
            id: `ledger-coo-${Date.now()}`,
            category: 'expense',
            amount: fee,
            countryId: prev.countryId,
            occurredAt: new Date().toISOString(),
            note: 'تعيين مدير التشغيل والإنتاج العام (COO)',
          },
          ...(prev.ledger ?? []),
        ],
      };
    });
    playSound('levelUp');
    onNotice?.('🏭 تم تعيين المدير التشغيلي العام (COO)! زادت كفاءة المصنع بنسبة +25%.', 'success');
  }

  // Toggle Auto Payroll by CFO
  function handleToggleAutoPayroll() {
    onUpdateProfile((prev) => {
      const updatedCompanies = prev.companies.map((c) =>
        c.id === primaryCompany.id ? { ...c, autoPayrollEnabled: !c.autoPayrollEnabled } : c
      );
      return { ...prev, companies: updatedCompanies };
    });
    playSound('click');
    onNotice?.(
      isAutoPayrollOn
        ? 'تم إيقاف الدفع التلقائي للرواتب؛ يلزم الصرف اليدوي نهاية كل شهر.'
        : 'تم تفعيل الدفع التلقائي للرواتب الشهرية بواسطة المدير المالي نيابة عنك.',
      'success'
    );
  }

  // Handle Appointing Production Supervisor
  function handleAppointSupervisor() {
    const fee = 25000;
    if (profile.bankBalance < fee) {
      onNotice?.('تحتاج إلى 25,000 ج.م كرسوم تعاقد لتعيين مدير رقابة الإنتاج المستمر!', 'error');
      return;
    }
    onUpdateProfile((prev) => {
      const newSupervisor: StaffContract = {
        id: `supervisor-${Date.now()}`,
        name: 'م. إبراهيم شكري (مدير رقابة الإنتاج)',
        role: 'production_supervisor',
        dailySalary: 500,
        monthlySalary: 15000,
        hiredOnDay: prev.day,
        nextPayDay: Math.ceil(prev.day / 30) * 30,
        status: 'active',
        companyId: primaryCompany.id,
        level: 2,
        experience: 0,
      };
      const updatedCompanies = prev.companies.map((c) =>
        c.id === primaryCompany.id
          ? { ...c, productionSupervisorAssigned: true, continuousProductionEnabled: true }
          : c
      );
      return {
        ...prev,
        bankBalance: prev.bankBalance - fee,
        staff: [...prev.staff, newSupervisor],
        companies: updatedCompanies,
        ledger: [
          {
            id: `ledger-supervisor-${Date.now()}`,
            category: 'expense',
            amount: fee,
            countryId: prev.countryId,
            occurredAt: new Date().toISOString(),
            note: 'تعيين مدير رقابة الإنتاج وتفعيل خطوط الإنتاج المستمر',
          },
          ...(prev.ledger ?? []),
        ],
      };
    });
    playSound('levelUp');
    onNotice?.('⚙️ تم تعيين مدير رقابة الإنتاج للإنتاج المستمر بنجاح!', 'success');
  }

  // Toggle Continuous Production
  function handleToggleContinuousProduction() {
    onUpdateProfile((prev) => {
      const updatedCompanies = prev.companies.map((c) =>
        c.id === primaryCompany.id ? { ...c, continuousProductionEnabled: !c.continuousProductionEnabled } : c
      );
      return { ...prev, companies: updatedCompanies };
    });
    playSound('click');
    onNotice?.('تم تحديث حالة دورة الإنتاج المستمر بنجاح.', 'success');
  }

  // Disburse Monthly Payroll Manually Now
  function handleDisburseMonthlyPayrollNow() {
    const totalToPay = Math.round(totalMonthlyPayroll * 0.4); // Pro-rated current settlement
    if (profile.bankBalance < totalToPay) {
      onNotice?.('لا تملك سيولة كافية في حسابك البنكي لصرف هذا المبلغ!', 'error');
      return;
    }
    onUpdateProfile((prev) => {
      const nextStaff = prev.staff.map((m) => ({ ...m, unpaidSalary: 0, nextPayDay: prev.day + 30 }));
      return {
        ...prev,
        bankBalance: prev.bankBalance - totalToPay,
        payables: Math.max(0, prev.payables - totalToPay),
        staff: nextStaff,
        ledger: [
          {
            id: `ledger-payroll-${Date.now()}`,
            category: 'settlement',
            amount: totalToPay,
            countryId: prev.countryId,
            occurredAt: new Date().toISOString(),
            note: `صرف مسير الرواتب الشهري المعتمد لجميع الكوادر والعمال`,
          },
          ...(prev.ledger ?? []),
        ],
      };
    });
    playSound('cash');
    onNotice?.(`💵 تم صرف مسير الرواتب الشهري بنجاح بقيمة ${totalToPay.toLocaleString('ar-EG')} ج.م!`, 'success');
  }

  // Execute Upgrade & Land Expansion
  function handleExecuteUpgrade(paymentMethod: 'cash' | 'diamonds') {
    if (!hasEnoughWorkers) {
      onNotice?.(`يلزم تعيين ${requiredWorkers} عاملاً لتشغيل توسعة المستوى ${nextLevel}!`, 'error');
      return;
    }
    if (!hasEnoughAccountants) {
      onNotice?.('يلزم تعيين 2 محاسبين قانونيين معتمدين لإدارة وتدقيق ميزانية التوسعة!', 'error');
      return;
    }
    if (!hasEnoughLawyers) {
      onNotice?.('يلزم تعيين 2 محامين للشؤون القانونية والعقود والتراخيص!', 'error');
      return;
    }
    if (!hasEnoughBatches) {
      onNotice?.(`أكمل ${requiredBatches} دفعات إنتاج أولاً في المصنع للترقية!`, 'error');
      return;
    }

    if (paymentMethod === 'cash' && profile.bankBalance < upgradeCost) {
      onNotice?.('السيولة النقدية غير كافية لرسوم التوسعة والترقية!', 'error');
      return;
    }
    if (paymentMethod === 'diamonds' && profile.diamonds < upgradeDiamondCost) {
      onNotice?.('رصيد الماس غير كافٍ!', 'error');
      return;
    }

    onUpdateProfile((prev) => {
      const energyBonus = 50 * level;
      const updatedCompanies = prev.companies.map((c) =>
        c.id === primaryCompany.id
          ? {
              ...c,
              upgradeLevel: nextLevel,
              energyCapacity: (c.energyCapacity ?? 150) + energyBonus,
              energyUnits: (c.energyUnits ?? 150) + energyBonus,
              maintenanceCondition: 100,
              assignedWorkersCount: Math.max(c.assignedWorkersCount ?? 0, requiredWorkers),
              assignedAccountantsCount: Math.max(c.assignedAccountantsCount ?? 0, 2),
              assignedLawyersCount: Math.max(c.assignedLawyersCount ?? 0, 2),
            }
          : c
      );

      const updatedLands = prev.lands.map((l) =>
        l.id === attachedLand.id
          ? { ...l, upgradeLevel: nextLevel, areaSquareMeters: newLandArea }
          : l
      );

      const nextBank = paymentMethod === 'cash' ? prev.bankBalance - upgradeCost : prev.bankBalance;
      const nextDiamonds = paymentMethod === 'diamonds' ? prev.diamonds - upgradeDiamondCost : prev.diamonds;

      return {
        ...prev,
        companies: updatedCompanies,
        lands: updatedLands,
        bankBalance: nextBank,
        diamonds: nextDiamonds,
        ledger: [
          {
            id: `ledger-mega-upgrade-${Date.now()}`,
            category: 'expense',
            amount: paymentMethod === 'cash' ? upgradeCost : 0,
            countryId: prev.countryId,
            occurredAt: new Date().toISOString(),
            note: `توسيع صرح ${primaryCompany.name} وأرضها إلى المستوى ${nextLevel} (+800 م²)`,
          },
          ...(prev.ledger ?? []),
        ],
      };
    });

    playSound('levelUp');
    onNotice?.(
      `🎉 مبروك! تم توسيع صرح ${primaryCompany.name} وأرضها إلى المستوى ${nextLevel}! أصبحت المساحة ${newLandArea.toLocaleString('ar-EG')} م² وارتفعت الطاقة والإنتاج!`,
      'success'
    );
    setShowUpgradeModal(false);
  }

  // Financial Lifeline: Instant Emergency Bailout Loan (+100,000 EGP)
  function handleEmergencyBailoutLoan() {
    const loanAmount = 100000;
    onUpdateProfile((prev) => {
      return {
        ...prev,
        bankBalance: prev.bankBalance + loanAmount,
        payables: prev.payables + Math.round(loanAmount * 1.05), // 5% soft emergency interest
        ledger: [
          {
            id: `ledger-bailout-${Date.now()}`,
            category: 'revenue',
            amount: loanAmount,
            countryId: prev.countryId,
            occurredAt: new Date().toISOString(),
            note: 'سلفة طوارئ بنكية ميسرة لإنقاذ السيولة ودعم خطوط الإنتاج',
          },
          ...(prev.ledger ?? []),
        ],
      };
    });
    playSound('cash');
    onNotice?.('🏦 تم إيداع 100,000 ج.م في حسابك البنكي كسلفة طوارئ ميسرة فوراً!', 'success');
  }

  // Financial Lifeline: Quick Inventory Liquidation
  function handleQuickInventoryLiquidation() {
    if (!profile.inventory || profile.inventory.length === 0) {
      onNotice?.('المستودع فارغ؛ لا توجد بضائع لتسييلها!', 'error');
      return;
    }
    let totalCashReceived = 0;
    onUpdateProfile((prev) => {
      const liquidatedInventory = prev.inventory.map((lot) => {
        const cashValue = Math.round(lot.quantity * lot.unitCost * 0.75); // 75% rapid clearance
        totalCashReceived += cashValue;
        return { ...lot, quantity: Math.floor(lot.quantity * 0.5) };
      }).filter((lot) => lot.quantity > 0);

      return {
        ...prev,
        bankBalance: prev.bankBalance + totalCashReceived,
        inventory: liquidatedInventory,
        ledger: [
          {
            id: `ledger-liquidate-${Date.now()}`,
            category: 'revenue',
            amount: totalCashReceived,
            countryId: prev.countryId,
            occurredAt: new Date().toISOString(),
            note: `تسييل عاجل لـ 50% من بضائع المستودع لإنقاذ السيولة`,
          },
          ...(prev.ledger ?? []),
        ],
      };
    });
    playSound('cash');
    onNotice?.(`📦 تم تسييل بضائع عاجلة وإيداع ${totalCashReceived.toLocaleString('ar-EG')} ج.م سيولة فورية!`, 'success');
  }

  return (
    <div className="companies-empire-hub rtl" dir="rtl">
      {/* 1. Cinematic Hero Banner */}
      <div className="empire-hero-banner" style={{ backgroundImage: `url(${bannerSkyline})` }}>
        <div className="empire-hero-overlay" />
        <div className="empire-hero-content">
          <div className="empire-badge-row">
            <span className="empire-gold-tag">
              <Sparkles className="w-3.5 h-3.5 inline mr-1 text-amber-300" />
              صرح الكيان الواحد المركزي
            </span>
            <span className="empire-level-tag">المستوى {formatNumber(level)}</span>
            <span className="empire-country-tag">🇪🇬 جمهورية مصر العربية</span>
          </div>

          <h1 className="empire-hero-title">{primaryCompany.name}</h1>
          <p className="empire-hero-subtitle">{visuals.slogan} · مجمع صناعي متكامل ينمو ويتوسع مع أرضه</p>

          <div className="empire-hero-stats-bar">
            <div className="hero-stat-box">
              <span className="stat-label">مساحة الأرض الكلية</span>
              <span className="stat-value text-amber-300">{formatNumber(attachedLand.areaSquareMeters)} م²</span>
            </div>
            <div className="hero-stat-sep" />
            <div className="hero-stat-box">
              <span className="stat-label">المرحلة المعمارية</span>
              <span className="stat-value text-emerald-300">{getLevelTitle(level)}</span>
            </div>
            <div className="hero-stat-sep" />
            <div className="hero-stat-box">
              <span className="stat-label">طاقة المجمع</span>
              <span className="stat-value text-cyan-300">
                {formatNumber(primaryCompany.energyUnits ?? 100)} / {formatNumber(primaryCompany.energyCapacity ?? 150)} وحدة
              </span>
            </div>
            <div className="hero-stat-sep" />
            <div className="hero-stat-box">
              <span className="stat-label">شؤون الرواتب الشهرية</span>
              <span className="stat-value text-purple-300">
                {isAutoPayrollOn ? 'آلي بواسطة المدير المالي ⚡' : 'يدوي مطلوب'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Hub Section Tabs */}
      <div className="empire-nav-tabs">
        <button
          type="button"
          className={`empire-tab-btn ${activeTab === 'empire' ? 'is-active' : ''}`}
          onClick={() => {
            playSound('click');
            setActiveTab('empire');
          }}
        >
          <Building2 className="w-4 h-4 inline ml-1.5" />
          صرح الشركة والأرض والترقية
        </button>

        <button
          type="button"
          className={`empire-tab-btn ${activeTab === 'management' ? 'is-active' : ''}`}
          onClick={() => {
            playSound('click');
            setActiveTab('management');
          }}
        >
          <Briefcase className="w-4 h-4 inline ml-1.5" />
          مجلس الإدارة وشؤون الرواتب الشهرية
        </button>

        <button
          type="button"
          className={`empire-tab-btn ${activeTab === 'bailout' ? 'is-active' : ''}`}
          onClick={() => {
            playSound('click');
            setActiveTab('bailout');
          }}
        >
          <Landmark className="w-4 h-4 inline ml-1.5" />
          شريان الإنقاذ والسيولة السريعة
        </button>
      </div>

      {/* 3. Main Content Panes */}
      {activeTab === 'empire' && (
        <div className="empire-main-pane">
          {/* Top Info Banner Explaining Single Mega-Company Policy */}
          <div className="single-corp-notice-card">
            <div className="notice-icon-circle">
              <Building2 className="w-6 h-6 text-amber-400" />
            </div>
            <div className="notice-text">
              <h3>حد الكيان: صرح الشركة الواحدة المركزية (Mega-Corporation)</h3>
              <p>
                تم تصميم نظام الإمبراطورية ليركز كل مواردك وطاقتك في بناء وتوسيع صرح صناعي واحد ضخم لا يتشتت،
                حيث تزيد مساحة أرضه مع كل مستوى، وتتوسع خطوط إنتاجه، وتتطلب ترقيته هيكلاً وظيفياً محكماً
                (زيادة عمال الإنتاج، ومحاسبين 2 فقط معتمدين، ومحامين 2 للشؤون القانونية).
              </p>
            </div>
          </div>

          {/* Mega-Corporation 3D Building & Parcel Card */}
          <div className="mega-corp-card">
            <div className="mega-corp-visual-col">
              <img src={visuals.img} alt={primaryCompany.name} className="mega-corp-image" />
              <div className="mega-corp-level-badge">
                <Factory className="w-4 h-4 inline ml-1" />
                المستوى {formatNumber(level)}
              </div>
            </div>

            <div className="mega-corp-details-col">
              <div className="corp-header-row">
                <div>
                  <h2 className="corp-title">{primaryCompany.name}</h2>
                  <span className="corp-subtitle">{visuals.title} · {attachedLand.label}</span>
                </div>
                <button
                  type="button"
                  className="corp-service-btn"
                  onClick={() => {
                    playSound('cash');
                    onUpdateProfile((prev) => ({
                      ...prev,
                      bankBalance: prev.bankBalance - 10000,
                      companies: prev.companies.map((c) =>
                        c.id === primaryCompany.id ? { ...c, maintenanceCondition: 100 } : c
                      ),
                    }));
                    onNotice?.('🛠️ تمت صيانة الماكينات بالكامل بنسبة 100%!', 'success');
                  }}
                  title="صيانة شاملة للماكينات"
                >
                  <Hammer className="w-4 h-4 inline ml-1 text-amber-300" />
                  صيانة الماكينات (10,000 ج.م)
                </button>
              </div>

              {/* Land & Physical Attributes */}
              <div className="corp-land-strip">
                <div className="land-mini-item">
                  <span className="land-label">قطعة الأرض المرتبطة:</span>
                  <span className="land-val">{attachedLand.label}</span>
                </div>
                <div className="land-mini-item">
                  <span className="land-label">المساحة الإجمالية:</span>
                  <span className="land-val text-amber-300">{formatNumber(attachedLand.areaSquareMeters)} م²</span>
                </div>
                <div className="land-mini-item">
                  <span className="land-label">حالة الماكينات:</span>
                  <span className="land-val text-emerald-300">{primaryCompany.maintenanceCondition ?? 90}% كفاءة</span>
                </div>
              </div>

              {/* Staffing Checklist for Next Expansion */}
              <div className="corp-staff-requirements-box">
                <div className="req-header">
                  <h4>
                    <Users className="w-4 h-4 inline ml-1 text-amber-400" />
                    الهيكل الوظيفي ومتطلبات التوسعة للمستوى {formatNumber(nextLevel)}:
                  </h4>
                  <span className="req-sub">يشترط النظام توفير الكوادر التالية قبل فتح التوسعة:</span>
                </div>

                <div className="req-grid">
                  {/* Workers Meter */}
                  <div className={`req-card ${hasEnoughWorkers ? 'is-satisfied' : 'is-missing'}`}>
                    <div className="req-card-top">
                      <span className="req-card-title">عمال خط الإنتاج والصيانة</span>
                      <span className="req-card-count">
                        {workersCount} / {requiredWorkers} عامل
                      </span>
                    </div>
                    <div className="req-progress-bar">
                      <div
                        className="req-progress-fill"
                        style={{ width: `${Math.min(100, Math.round((workersCount / requiredWorkers) * 100))}%` }}
                      />
                    </div>
                    <div className="req-card-footer">
                      {hasEnoughWorkers ? (
                        <span className="text-emerald-400 text-xs flex items-center">
                          <CheckCircle2 className="w-3.5 h-3.5 inline ml-1" />
                          مكتمل للمستوى الحالي
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="req-hire-btn"
                          onClick={() => handleHireStaff('workers')}
                        >
                          <Plus className="w-3 h-3 inline ml-0.5" />
                          توظيف +10 عمال (25,000 ج.م)
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Accountants (Exactly 2 required) */}
                  <div className={`req-card ${hasEnoughAccountants ? 'is-satisfied' : 'is-missing'}`}>
                    <div className="req-card-top">
                      <span className="req-card-title">محاسبين 2 فقط معتمدين</span>
                      <span className="req-card-count">
                        {accountantsCount} / 2 محاسب
                      </span>
                    </div>
                    <div className="req-progress-bar">
                      <div
                        className="req-progress-fill"
                        style={{ width: `${Math.min(100, Math.round((accountantsCount / 2) * 100))}%` }}
                      />
                    </div>
                    <div className="req-card-footer">
                      {hasEnoughAccountants ? (
                        <span className="text-emerald-400 text-xs flex items-center">
                          <CheckCircle2 className="w-3.5 h-3.5 inline ml-1" />
                          المحاسبان معتمدان
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="req-hire-btn"
                          onClick={() => handleHireStaff('accountants')}
                        >
                          <Plus className="w-3 h-3 inline ml-0.5" />
                          تعيين محاسب قانوني (18,000 ج.م)
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Lawyers (2 Legal Counsel) */}
                  <div className={`req-card ${hasEnoughLawyers ? 'is-satisfied' : 'is-missing'}`}>
                    <div className="req-card-top">
                      <span className="req-card-title">محامين للشؤون والعقود</span>
                      <span className="req-card-count">
                        {lawyersCount} / 2 محامٍ
                      </span>
                    </div>
                    <div className="req-progress-bar">
                      <div
                        className="req-progress-fill"
                        style={{ width: `${Math.min(100, Math.round((lawyersCount / 2) * 100))}%` }}
                      />
                    </div>
                    <div className="req-card-footer">
                      {hasEnoughLawyers ? (
                        <span className="text-emerald-400 text-xs flex items-center">
                          <CheckCircle2 className="w-3.5 h-3.5 inline ml-1" />
                          الشؤون القانونية مكتملة
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="req-hire-btn"
                          onClick={() => handleHireStaff('lawyers')}
                        >
                          <Plus className="w-3 h-3 inline ml-0.5" />
                          تعيين محامٍ ومستشار (20,000 ج.م)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Big Upgrade & Expansion CTA Button */}
              <div className="corp-actions-bar">
                <button
                  type="button"
                  className={`corp-upgrade-cta-btn ${allRequirementsMet ? 'can-upgrade' : 'is-locked'}`}
                  onClick={() => {
                    playSound('click');
                    setShowUpgradeModal(true);
                  }}
                >
                  <Sparkles className="w-5 h-5 inline ml-2 text-amber-300" />
                  توسيع الصرح وتطوير الأرض إلى المستوى {formatNumber(nextLevel)} (+800 م²)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. C-Suite Management & Monthly Payroll Pane */}
      {activeTab === 'management' && (
        <div className="empire-management-pane">
          {/* Top Monthly Calendar Card */}
          <div className="payroll-calendar-card">
            <div className="calendar-left">
              <span className="cal-title">تقويم دورة الرواتب الشهرية</span>
              <span className="cal-subtitle">
                الرواتب تُصرف كل 30 يوماً فقط (شهرياً) بدلاً من الخصم اليومي المربك.
              </span>
            </div>
            <div className="calendar-right">
              <div className="cal-stat-pill">
                <span>الشهر الحالي:</span>
                <strong>شهر {formatNumber(currentMonthNumber)}</strong>
              </div>
              <div className="cal-stat-pill">
                <span>اليوم من الشهر:</span>
                <strong>{currentDayInMonth} من 30</strong>
              </div>
              <div className="cal-stat-pill is-highlight">
                <span>المتبقي على مسير الرواتب:</span>
                <strong className="text-amber-300">{daysUntilPayroll} أيام</strong>
              </div>
            </div>
          </div>

          {/* C-Suite Executive Roles Grid */}
          <div className="csuite-section-title">
            <Briefcase className="w-5 h-5 inline ml-1 text-amber-400" />
            مجلس إدارة الكيان والقيادة التنفيذية
          </div>

          <div className="csuite-grid">
            {/* CFO / Payroll Director */}
            <div className={`csuite-card ${cfo ? 'is-appointed' : 'is-vacant'}`}>
              <div className="csuite-card-badge">
                {cfo ? 'معتمد في مجلس الإدارة' : 'شاغر - مطلوب للتعيين'}
              </div>
              <div className="csuite-avatar">💼</div>
              <h3 className="csuite-name">{cfo ? cfo.name : 'المدير المالي وشؤون الرواتب (CFO)'}</h3>
              <p className="csuite-desc">
                يتولى إدارة السيولة، ودفع مسير الرواتب الشهري نيابة عنك تلقائياً دون انقطاع الطاقة أو تعطل العمال.
              </p>
              <div className="csuite-salary-line">
                <span>الراتب الشهري:</span>
                <strong className="text-amber-300">18,000 ج.م / شهر</strong>
              </div>

              {cfo ? (
                <div className="csuite-active-controls">
                  <div className="auto-payroll-toggle-row">
                    <span>الدفع التلقائي للرواتب نيابة عنك:</span>
                    <button
                      type="button"
                      className={`toggle-switch-btn ${isAutoPayrollOn ? 'is-on' : 'is-off'}`}
                      onClick={handleToggleAutoPayroll}
                    >
                      {isAutoPayrollOn ? 'مفعّل ⚡' : 'معطل ⏸️'}
                    </button>
                  </div>
                  <span className="csuite-status-note text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 inline ml-1" />
                    المدير المالي يدفع الرواتب تلقائياً نهاية كل شهر
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  className="csuite-appoint-btn"
                  onClick={handleAppointCFO}
                >
                  تعيين مدير شؤون رواتب (30,000 ج.م رسوم عقد)
                </button>
              )}
            </div>

            {/* COO / General Manager */}
            <div className={`csuite-card ${coo ? 'is-appointed' : 'is-vacant'}`}>
              <div className="csuite-card-badge">
                {coo ? 'معتمد في مجلس الإدارة' : 'شاغر - متاح للتعيين'}
              </div>
              <div className="csuite-avatar">🏭</div>
              <h3 className="csuite-name">{coo ? coo.name : 'المدير التنفيذي للتشغيل (COO)'}</h3>
              <p className="csuite-desc">
                يرفع كفاءة خطوط الإنتاج وجودة المنتجات بنسبة +25% ويقلل من استهلاك الكهرباء والصيانة.
              </p>
              <div className="csuite-salary-line">
                <span>الراتب الشهري:</span>
                <strong className="text-amber-300">24,000 ج.م / شهر</strong>
              </div>

              {coo ? (
                <span className="csuite-status-note text-emerald-400 mt-auto">
                  <CheckCircle2 className="w-3.5 h-3.5 inline ml-1" />
                  المدير التشغيلي يرفع كفاءة المصنع بنسبة +25%
                </span>
              ) : (
                <button
                  type="button"
                  className="csuite-appoint-btn mt-auto"
                  onClick={handleAppointCOO}
                >
                  تعيين مدير تشغيل تنفيذي (35,000 ج.م رسوم عقد)
                </button>
              )}
            </div>

            {/* Production Supervision Director */}
            <div className={`csuite-card ${supervisor ? 'is-appointed' : 'is-vacant'}`}>
              <div className="csuite-card-badge">
                {supervisor ? 'معتمد في خطوط الإنتاج' : 'شاغر - متاح للتعيين'}
              </div>
              <div className="csuite-avatar">⚙️</div>
              <h3 className="csuite-name">{supervisor ? supervisor.name : 'مدير رقابة إنتاج'}</h3>
              <p className="csuite-desc">
                قم بتعيين مدير الإنتاج للإنتاج المستمر، يراقب الماكينات ويطلق دفعات الإنتاج تلقائياً كل يوم دون إجهاد اللاعب.
              </p>
              <div className="csuite-salary-line">
                <span>الراتب الشهري:</span>
                <strong className="text-amber-300">15,000 ج.م / شهر</strong>
              </div>

              {supervisor ? (
                <div className="csuite-active-controls">
                  <div className="auto-payroll-toggle-row">
                    <span>الإنتاج المستمر التلقائي:</span>
                    <button
                      type="button"
                      className={`toggle-switch-btn ${isContinuousProductionOn ? 'is-on' : 'is-off'}`}
                      onClick={handleToggleContinuousProduction}
                    >
                      {isContinuousProductionOn ? 'مفعّل ⚡' : 'معطل ⏸️'}
                    </button>
                  </div>
                  <span className="csuite-status-note text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 inline ml-1" />
                    الإنتاج المستمر يعمل تلقائياً يومياً عبر مدير الرقابة
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  className="csuite-appoint-btn mt-auto"
                  onClick={handleAppointSupervisor}
                >
                  تعيين مدير رقابة إنتاج (25,000 ج.م رسوم عقد)
                </button>
              )}
            </div>
          </div>

          {/* Monthly Payroll Ledger Card */}
          <div className="payroll-ledger-card">
            <div className="ledger-card-header">
              <div>
                <h4 className="text-white font-bold text-base flex items-center">
                  <FileText className="w-4 h-4 inline ml-1.5 text-amber-400" />
                  كشف مسير الرواتب الشهري المجمع
                </h4>
                <span className="text-slate-400 text-xs">
                  إجمالي الرواتب الشهرية المستحقة لجميع كوادر الصرح وعمال الإنتاج
                </span>
              </div>
              <div className="text-left">
                <span className="text-xs text-slate-400 block">إجمالي الرواتب الشهرية:</span>
                <span className="text-xl font-bold text-emerald-300">
                  {formatMoney(totalMonthlyPayroll, country)}
                </span>
              </div>
            </div>

            <div className="payroll-breakdown-list">
              <div className="breakdown-row">
                <span>طواقم عمال الإنتاج والصيانة ({workersCount} عامل):</span>
                <span>{formatMoney(workersCount * 4500, country)} / شهر</span>
              </div>
              <div className="breakdown-row">
                <span>المحاسبون القانونيون ({accountantsCount} محاسب):</span>
                <span>{formatMoney(accountantsCount * 13500, country)} / شهر</span>
              </div>
              <div className="breakdown-row">
                <span>الشؤون القانونية والمحامون ({lawyersCount} محامٍ):</span>
                <span>{formatMoney(lawyersCount * 12000, country)} / شهر</span>
              </div>
              {cfo && (
                <div className="breakdown-row">
                  <span>المدير المالي وشؤون الرواتب (CFO):</span>
                  <span>{formatMoney(18000, country)} / شهر</span>
                </div>
              )}
              {coo && (
                <div className="breakdown-row">
                  <span>المدير التنفيذي للتشغيل (COO):</span>
                  <span>{formatMoney(24000, country)} / شهر</span>
                </div>
              )}
              {supervisor && (
                <div className="breakdown-row">
                  <span>مدير رقابة الإنتاج المستمر:</span>
                  <span>{formatMoney(15000, country)} / شهر</span>
                </div>
              )}
            </div>

            <div className="payroll-action-row">
              <div className="text-xs text-slate-300">
                {isAutoPayrollOn ? (
                  <span className="text-emerald-300 flex items-center">
                    <CheckCircle2 className="w-4 h-4 inline ml-1" />
                    المدير المالي سيتولى دفع هذا المسير تلقائياً من الأرباح في اليوم 30.
                  </span>
                ) : (
                  <span className="text-amber-300 flex items-center">
                    <AlertTriangle className="w-4 h-4 inline ml-1" />
                    الدفع الآلي معطل؛ يمكنك صرف المسير الآن يدوياً لتفادي أي التزامات.
                  </span>
                )}
              </div>

              <button
                type="button"
                className="disburse-now-btn"
                onClick={handleDisburseMonthlyPayrollNow}
              >
                <DollarSign className="w-4 h-4 inline ml-1 text-emerald-300" />
                صرف مسير الرواتب الآن يدوياً
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Emergency Bailout & Liquidity Lifeline Pane */}
      {activeTab === 'bailout' && (
        <div className="empire-bailout-pane">
          <div className="bailout-hero-card">
            <div className="bailout-icon-box">
              <Landmark className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                شريان الإنقاذ والسيولة السريعة (حل المأزق المالي)
              </h3>
              <p className="text-sm text-slate-300">
                إذا نفدت السيولة النقدية أو واجهت أزمة التزامات غير مسددة تعطل الطاقة أو الماكينات،
                يمكنك استخدام أحد خيارات الدعم الطارئ الفوري هنا دون الحاجة لإعادة اللعبة من البداية.
              </p>
            </div>
          </div>

          <div className="bailout-options-grid">
            {/* Option 1: Emergency Bank Bailout Loan */}
            <div className="bailout-card">
              <div className="bailout-card-badge text-emerald-300 bg-emerald-950/80 border border-emerald-500/40">
                إيداع فوري مضمون
              </div>
              <h4 className="text-base font-bold text-white mb-2">سلفة طوارئ بنكية ميسرة (+100,000 ج.م)</h4>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                قرض إنقاذ عاجل من البنك الوطني المصري يُضاف فوراً لرصيدك مع فائدة رمزية 5% مؤجلة،
                مما يتيح لك تشغيل المولدات وشراء المواد الخام فوراً.
              </p>
              <button
                type="button"
                className="bailout-action-btn bg-emerald-600 hover:bg-emerald-500"
                onClick={handleEmergencyBailoutLoan}
              >
                <Landmark className="w-4 h-4 inline ml-1.5" />
                طلب سلفة الطوارئ البنكية الآن (+100,000 ج.م)
              </button>
            </div>

            {/* Option 2: Quick Inventory Liquidation */}
            <div className="bailout-card">
              <div className="bailout-card-badge text-amber-300 bg-amber-950/80 border border-amber-500/40">
                تسييل عاجل
              </div>
              <h4 className="text-base font-bold text-white mb-2">تسييل عاجل لـ 50% من بضائع المستودع</h4>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                بيع فوري لنصف مخزونك من المنتجات بسعر الجملة السريع لتحويل البضائع الراكدة إلى كاش سائل في ثوانٍ.
              </p>
              <button
                type="button"
                className="bailout-action-btn bg-amber-600 hover:bg-amber-500"
                onClick={handleQuickInventoryLiquidation}
              >
                <Wallet className="w-4 h-4 inline ml-1.5" />
                تسييل 50% من المخزون فوراً لكاش
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Upgrade & Expansion Modal */}
      {showUpgradeModal && (
        <div className="empire-modal-backdrop" onClick={() => setShowUpgradeModal(false)}>
          <div className="empire-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="modal-title">توسيع الصرح وتطوير الأرض إلى المستوى {formatNumber(nextLevel)}</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowUpgradeModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="upgrade-summary-banner">
                <div className="summary-item">
                  <span>مساحة الأرض الحالية:</span>
                  <strong>{formatNumber(attachedLand.areaSquareMeters)} م²</strong>
                </div>
                <div className="summary-arrow">➡️</div>
                <div className="summary-item">
                  <span>المساحة بعد التوسعة:</span>
                  <strong className="text-emerald-400">{formatNumber(newLandArea)} م² (+800 م²)</strong>
                </div>
              </div>

              {/* Requirements Checklist */}
              <div className="modal-checklist-card">
                <h4 className="checklist-title">فحص استيفاء متطلبات التوسعة:</h4>

                <div className="checklist-item">
                  <div className="flex items-center gap-2">
                    {hasEnoughWorkers ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    )}
                    <span>زيادة عمال الإنتاج (المطلوب: {requiredWorkers} عامل)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={hasEnoughWorkers ? 'text-emerald-400' : 'text-amber-400 font-bold'}>
                      {workersCount} / {requiredWorkers}
                    </span>
                    {!hasEnoughWorkers && (
                      <button
                        type="button"
                        className="modal-quick-hire-btn"
                        onClick={() => handleHireStaff('workers')}
                      >
                        + توظيف
                      </button>
                    )}
                  </div>
                </div>

                <div className="checklist-item">
                  <div className="flex items-center gap-2">
                    {hasEnoughAccountants ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    )}
                    <span>محاسبين 2 فقط معتمدين للشؤون المالية</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={hasEnoughAccountants ? 'text-emerald-400' : 'text-amber-400 font-bold'}>
                      {accountantsCount} / 2
                    </span>
                    {!hasEnoughAccountants && (
                      <button
                        type="button"
                        className="modal-quick-hire-btn"
                        onClick={() => handleHireStaff('accountants')}
                      >
                        + تعيين
                      </button>
                    )}
                  </div>
                </div>

                <div className="checklist-item">
                  <div className="flex items-center gap-2">
                    {hasEnoughLawyers ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    )}
                    <span>2 محامين للشؤون القانونية والعقود والتراخيص</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={hasEnoughLawyers ? 'text-emerald-400' : 'text-amber-400 font-bold'}>
                      {lawyersCount} / 2
                    </span>
                    {!hasEnoughLawyers && (
                      <button
                        type="button"
                        className="modal-quick-hire-btn"
                        onClick={() => handleHireStaff('lawyers')}
                      >
                        + تعيين
                      </button>
                    )}
                  </div>
                </div>

                <div className="checklist-item">
                  <div className="flex items-center gap-2">
                    {hasEnoughBatches ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    )}
                    <span>دفعات الإنتاج المكتملة بالمصنع ({requiredBatches} مطلوبة)</span>
                  </div>
                  <span className={hasEnoughBatches ? 'text-emerald-400' : 'text-amber-400 font-bold'}>
                    {completedBatches} / {requiredBatches}
                  </span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="modal-payment-options">
                <button
                  type="button"
                  className={`modal-pay-btn ${canAffordCash && allRequirementsMet ? 'can-pay' : 'cant-pay'}`}
                  disabled={!allRequirementsMet || !canAffordCash}
                  onClick={() => handleExecuteUpgrade('cash')}
                >
                  <span className="pay-btn-label">الدفع نقدًا (كاش)</span>
                  <span className="pay-btn-amount">{formatMoney(upgradeCost, country)}</span>
                </button>

                <button
                  type="button"
                  className={`modal-pay-btn is-diamonds ${canAffordDiamonds && allRequirementsMet ? 'can-pay' : 'cant-pay'}`}
                  disabled={!allRequirementsMet || !canAffordDiamonds}
                  onClick={() => handleExecuteUpgrade('diamonds')}
                >
                  <span className="pay-btn-label">ترقية فورية بالماس</span>
                  <span className="pay-btn-amount">{upgradeDiamondCost} 💎</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
