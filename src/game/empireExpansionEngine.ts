import {
  COUNTRIES,
  findCountry,
  type CountryId,
  type IndustryId,
} from '../domain/countries';
import {
  findShopSpec,
  getBranchSpecs,
  RETAIL_SHOP_SPECS,
  type CompanyBranch,
  type RetailShop,
  type RetailShopType,
} from '../domain/branchAndShop';
import {
  findCityById,
  getCitiesForCountry,
  getDefaultEmpireExpansionState,
  type CityDefinition,
  type CityExpansionFacilityKind,
  type CityExpansionPreview,
  type CityExpansionRequest,
  type CountryExpansionAssessment,
  type CountryExpansionGatewayContract,
  type EmpireAdminReport,
  type EmpireExpansionOperationRecord,
  type EmpireExpansionState,
  type EmpireOperationalAlert,
  type ExpansionRequirementCheck,
  type FacilityFinancialRow,
  type FacilityOperationalState,
  type InternationalExpansionIntent,
  type StaffAssignmentTargetOption,
  type UnifiedEmpireFacility,
} from '../domain/empireExpansion';
import type { LicenseRecord, StaffContract } from '../domain/futureSystems';
import type { PlayerCompany, PlayerLand, PlayerProfile } from '../domain/player';
import {
  findIndustry,
  findMaterial,
  findRecipeForIndustry,
  INDUSTRY_CATALOG,
  PRODUCT_CATALOG,
  RECIPE_CATALOG,
} from './catalog';
import {
  addLedger,
  failure,
  ledgerEntry,
  resolvePurchaseDebit,
  success,
  syncTasks,
  timestampFor,
  type GameResult,
} from './engine';
import { getPlayerProgress } from './onboarding';
import { getDiscountedDiamondPrice } from './purchasePricing';
import { getOperatingCostProgression } from './economyBalance';
import { getSynergyOperatingMultiplier } from './synergy';

/** In-memory execution lock preventing concurrent double-click race conditions in the same tick. */
const activeOperationLocks = new Set<string>();

export const COUNTRY_EXPANSION_GATEWAY: CountryExpansionGatewayContract = {
  gatewayId: 'suly-cross-border-expansion-v1',
  isRuntimeExecutionEnabled: false,
  status: 'incomplete_multi_currency_runtime',
  statusLabelAr: 'واجهة ربط دولية مجهزة — التنفيذ التشغيلي العابر للحدود غير مكتمل حالياً',
  architecturalReasonAr:
    'يعتمد محرك الاقتصاد الحالي (الخزينة البنكية، المستودع المركزي، تسعير السوق اليومي، وتسوية الضرائب) على دولة أساسية واحدة لملف اللاعب. تم تجهيز حاسبة الجدوى السيادية والضرائب والعملات وواجهة الربط البرمجية بالكامل، دون خصم أموال أو إنشاء منشآت خارجية وهمية إلى حين تفعيل الخزائن متعددة العملات.',
  missingEngineCapabilities: [
    {
      code: 'multi_currency_treasury',
      title: 'خزائن بنكية متعددة العملات (FX Treasury)',
      description: 'فصل أرصدة العملات الأجنبية وتسجيل فروق الصرف في دفتر الأستاذ عند التحويل.',
    },
    {
      code: 'regional_country_warehouses',
      title: 'مستودعات إقليمية مستقلة لكل دولة',
      description: 'ربط مخزون الخامات والمنتجات الجاهزة بالدولة المضيفة بدلاً من المستودع الوطني الواحد.',
    },
    {
      code: 'sovereign_tax_settlement',
      title: 'تسوية ضريبية وجمركية مستقلة عند ترحيل اليوم',
      description: 'تطبيق ضريبة المبيعات والجمارك ومعامل التشغيل لكل دولة على حدة أثناء دورة advanceDay.',
    },
  ],
  supportedPreparationFeatures: [
    'حساب فوري لتكاليف التأسيس والتراخيص والأراضي بعملة الدولة المستهدفة وعملة اللاعب والدولار.',
    'مقارنة معدلات الضرائب والجمارك ومعامل تكلفة التشغيل من بيانات الدول الحقيقية في اللعبة.',
    'فحص جاهزية الإمبراطورية (المستوى، السيولة الاحتياطية، خلو المتأخرات) قبل التوسع الخارجي.',
    'حفظ ملف نية توسع دولي (Dossier) بمعرّف ثابت في السجل دون أي خصم مالي وهمي.',
  ],
};

function shortStableHash(input: string): string {
  let h1 = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    h1 ^= input.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193);
  }
  return (h1 >>> 0).toString(36).padStart(7, '0').slice(0, 8);
}

export function getEmpireExpansionState(profile: PlayerProfile): EmpireExpansionState {
  const raw = profile.empireExpansion;
  if (!raw) return getDefaultEmpireExpansionState();
  return {
    facilityCities: { ...(raw.facilityCities ?? {}) },
    facilityStaffAssignments: { ...(raw.facilityStaffAssignments ?? {}) },
    processedOperationIds: [...(raw.processedOperationIds ?? [])],
    operationsLog: [...(raw.operationsLog ?? [])],
    internationalIntentLog: [...(raw.internationalIntentLog ?? [])],
  };
}

export function buildExpansionOperationId(params: {
  countryId: CountryId;
  cityId: string;
  kind: CityExpansionFacilityKind;
  subType: string;
  day: number;
  sequenceHint: number;
}): string {
  const rawKey = `${params.countryId}:${params.cityId}:${params.kind}:${params.subType}:d${params.day}:s${params.sequenceHint}`;
  const hash = shortStableHash(rawKey);
  return `exp-${params.kind}-${hash}-d${params.day}-s${params.sequenceHint}`;
}

export function resolveFacilityCity(
  profile: PlayerProfile,
  entityId: string,
  linkedLandId?: string,
): CityDefinition {
  const exp = profile.empireExpansion;
  const cities = getCitiesForCountry(profile.countryId);
  const homeCity = cities[0];
  const explicitCityId =
    exp?.facilityCities?.[entityId]
    ?? (linkedLandId ? exp?.facilityCities?.[linkedLandId] : undefined);
  if (explicitCityId) {
    const found = cities.find((c) => c.id === explicitCityId) ?? findCityById(explicitCityId);
    if (found) return found;
  }
  return homeCity;
}

export function countFacilitiesInCity(profile: PlayerProfile, cityId: string): number {
  const companyCount = profile.companies.filter(
    (c) => resolveFacilityCity(profile, c.id, c.landId).id === cityId,
  ).length;
  const branchCount = (profile.branches ?? []).filter(
    (b) => resolveFacilityCity(profile, b.id, b.landId).id === cityId,
  ).length;
  const shopCount = (profile.shops ?? []).filter(
    (s) => resolveFacilityCity(profile, s.id, s.landId).id === cityId,
  ).length;
  return companyCount + branchCount + shopCount;
}

function getEffectivePlayerLevel(profile: PlayerProfile): number {
  const progressLvl = getPlayerProgress(profile).level;
  return Math.max(profile.level ?? 1, progressLvl);
}

/**
 * Transitions constructing branches/shops to 'active' once their construction day has elapsed
 * or their real-time construction timer has completed. Does not modify 3D camera/map code.
 */
export function activateReadyEmpireFacilities(profile: PlayerProfile, nowMs: number = Date.now()): GameResult<{ activatedCount: number }> {
  const constructions = profile.cityConstructions ?? {};
  let activatedCount = 0;

  const isPlotTimerDone = (plotId: string, establishedOnDay: number): boolean => {
    if (profile.day > establishedOnDay) return true;
    const timer = constructions[plotId];
    if (timer && typeof timer.completesAt === 'number' && nowMs >= timer.completesAt) {
      return true;
    }
    return false;
  };

  const nextBranches = (profile.branches ?? []).map((branch) => {
    if (branch.status === 'constructing' && isPlotTimerDone(branch.plotId, branch.establishedOnDay)) {
      activatedCount += 1;
      return { ...branch, status: 'active' as const };
    }
    return branch;
  });

  const nextShops = (profile.shops ?? []).map((shop) => {
    if (shop.status === 'constructing' && isPlotTimerDone(shop.plotId, shop.establishedOnDay)) {
      activatedCount += 1;
      return { ...shop, status: 'active' as const };
    }
    return shop;
  });

  if (activatedCount === 0) {
    return failure(profile, 'condition-not-met', 'لا توجد منشآت انتهت فترة إنشائها حالياً؛ تُستكمل الإنشاءات الجديدة في اليوم التالي.');
  }

  return success(
    {
      ...profile,
      branches: nextBranches,
      shops: nextShops,
    },
    `تم اعتماد تشغيل ${activatedCount} منشأة بعد اكتمال أعمال الإنشاء والتجهيز.`,
    { activatedCount },
  );
}

export function previewCityExpansion(
  profile: PlayerProfile,
  request: CityExpansionRequest,
): CityExpansionPreview | null {
  const country = findCountry(profile.countryId);
  if (!country) return null;

  const countryCities = getCitiesForCountry(profile.countryId);
  const city = countryCities.find((c) => c.id === request.cityId);
  if (!city) return null;

  const effectiveLevel = getEffectivePlayerLevel(profile);
  const currentFacilitiesInCity = countFacilitiesInCity(profile, city.id);
  const paymentMethod = request.paymentMethod ?? 'cash';

  let landCost = Math.round(city.landBaseCost * (country.economy.operatingCostMultiplier ?? 1));
  let setupCost = 0;
  let licenseFee = 0;
  let requiresNewLicense = false;
  let dailyOperatingCost = 0;
  let requiredFacilityLevel = 1;
  let facilityLabel = '';
  const requirements: ExpansionRequirementCheck[] = [];

  requirements.push({
    id: 'city-slot',
    label: `سعة التوسع في ${city.name}`,
    met: currentFacilitiesInCity < city.maxFacilities,
    detail: `${currentFacilitiesInCity} / ${city.maxFacilities} منشآت قائمة في المدينة`,
  });

  if (request.kind === 'branch') {
    const parentCompany = profile.companies.find((c) => c.id === request.parentCompanyId);
    const branchSpec = getBranchSpecs(1);
    requiredFacilityLevel = Math.max(city.requiredLevel, branchSpec.requiredPlayerLevel);
    setupCost = Math.round(branchSpec.setupCost * city.setupMultiplier);
    landCost = Math.round(city.landBaseCost * 0.65);
    dailyOperatingCost = Math.round(branchSpec.dailyOperatingCost * city.operatingMultiplier);
    facilityLabel = parentCompany
      ? `فرع إقليمي لشركة «${parentCompany.name}»`
      : 'فرع شركة إقليمي';

    requirements.push({
      id: 'parent-company',
      label: 'امتلاك شركة أم نشطة لربط الفرع بها',
      met: Boolean(parentCompany),
      detail: parentCompany
        ? `مرتبط بـ ${parentCompany.name}`
        : 'يجب اختيار شركة مملوكة لفتح فرع تابع لها',
    });
    requirements.push({
      id: 'land-commercial',
      label: 'توفر تصنيف أراضٍ تجارية بالمدينة',
      met: city.supportedLandTypes.includes('commercial'),
      detail: 'الأراضي التجارية متاحة للتخصيص الفوري',
    });
  } else if (request.kind === 'factory') {
    const targetIndustryId = request.industryId ?? 'food';
    const industry = findIndustry(targetIndustryId);
    requiredFacilityLevel = city.requiredLevel;
    const hasExistingLicense = profile.licenses.some(
      (lic) => lic.countryId === profile.countryId && lic.industryId === targetIndustryId,
    );
    requiresNewLicense = !hasExistingLicense;
    const rawLicenseFee =
      country.economy.licenseFeesByIndustry[targetIndustryId]
      ?? industry?.licenseFee
      ?? 1500;
    licenseFee = hasExistingLicense ? 0 : rawLicenseFee;
    const baseSetup = country.economy.companySetupFee ?? industry?.setupFee ?? 2000;
    setupCost = Math.round((baseSetup + 3500) * city.setupMultiplier);
    dailyOperatingCost = Math.round((industry?.dailyOperatingCost ?? 180) * city.operatingMultiplier);
    facilityLabel = industry ? `مصنع ومنشأة قطاع ${industry.name}` : 'منشأة صناعية جديدة';

    requirements.push({
      id: 'valid-industry',
      label: 'صلاحية القطاع الصناعي ونوع الأرض',
      met: Boolean(industry && city.supportedLandTypes.includes(industry.requiredLandType)),
      detail: industry
        ? `يتطلب أرضاً (${industry.requiredLandType === 'industrial' ? 'صناعية' : industry.requiredLandType === 'agricultural' ? 'زراعية' : 'تجارية'})`
        : 'قطاع غير معروف',
    });
    requirements.push({
      id: 'industry-license',
      label: `الترخيص الحكومي لقطاع ${industry?.name ?? ''}`,
      met: true,
      detail: hasExistingLicense
        ? 'تمتلك ترخيص هذا القطاع مسبقاً (لن يُخصم رسم ترخيص مكرر)'
        : `سيُصدر ترخيص رسمي تلقائياً بتكلفة ${rawLicenseFee.toLocaleString('ar-EG')} $`,
    });
  } else {
    const targetShopType = request.shopType ?? 'groceries';
    const shopSpec = findShopSpec(targetShopType);
    requiredFacilityLevel = Math.max(city.requiredLevel, shopSpec?.requiredPlayerLevel ?? 1);
    setupCost = Math.round((shopSpec?.setupCost ?? 8500) * city.setupMultiplier);
    landCost = Math.round(city.landBaseCost * 0.6);
    dailyOperatingCost = Math.round(120 * city.operatingMultiplier);
    facilityLabel = shopSpec?.title ?? 'محل بيع تجزئة';

    const parentCompany = request.parentCompanyId
      ? profile.companies.find((c) => c.id === request.parentCompanyId)
      : undefined;
    const parentValid =
      !request.parentCompanyId
      || Boolean(
        parentCompany
        && shopSpec?.compatibleIndustries.includes(parentCompany.industryId),
      );

    requirements.push({
      id: 'shop-spec',
      label: 'توافق نشاط التجزئة والتوريد',
      met: Boolean(shopSpec) && parentValid,
      detail: request.parentCompanyId
        ? parentValid
          ? `مرتبط بمورد متوافق (${parentCompany?.name})`
          : 'الشركة المختارة لا تنتج سلعاً متوافقة مع هذا المحل'
        : 'محل تجزئة مستقل يقبل التوريد من مستودعك المركزي',
    });
  }

  requirements.push({
    id: 'player-level',
    label: `المستوى الإداري المطلوب (${requiredFacilityLevel})`,
    met: effectiveLevel >= requiredFacilityLevel,
    detail: `مستواك الحالي: ${effectiveLevel} / المطلوب: ${requiredFacilityLevel}`,
  });

  const totalCashCost = landCost + setupCost + licenseFee;
  const diamondCost = Math.max(4, getDiscountedDiamondPrice(totalCashCost));
  const remainingBalanceAfterCash = profile.bankBalance - totalCashCost;

  const canAffordSelectedPayment =
    paymentMethod === 'diamonds'
      ? profile.diamonds >= diamondCost
      : profile.bankBalance >= totalCashCost;

  requirements.push({
    id: 'liquidity-check',
    label: paymentMethod === 'diamonds' ? 'توفر رصيد الماس الكافي' : 'توفر السيولة النقدية في البنك',
    met: canAffordSelectedPayment,
    detail:
      paymentMethod === 'diamonds'
        ? `المطلوب ${diamondCost} ماسة · المتاح ${profile.diamonds} ماسة`
        : `الإجمالي ${totalCashCost.toLocaleString('ar-EG')} $ · المتاح ${Math.round(profile.bankBalance).toLocaleString('ar-EG')} $`,
  });

  const allRequirementsMet = requirements.every((req) => req.met);

  return {
    city,
    kind: request.kind,
    facilityLabel,
    landCost,
    setupCost,
    licenseFee,
    requiresNewLicense,
    totalCashCost,
    diamondCost,
    dailyOperatingCost,
    remainingBalanceAfterCash,
    requirements,
    allRequirementsMet,
    canAffordSelectedPayment,
  };
}

export interface CityExpansionOutcome {
  operationId: string;
  facilityId: string;
  landId: string;
  cityId: string;
  kind: CityExpansionFacilityKind;
  totalCashPaid: number;
  diamondsSpent: number;
}

export function executeCityExpansion(
  profile: PlayerProfile,
  request: CityExpansionRequest,
): GameResult<CityExpansionOutcome> {
  const cleanOperationId = (request.operationId ?? '').trim();
  if (!cleanOperationId || cleanOperationId.length > 96) {
    return failure(profile, 'invalid-input', 'معرّف عملية التوسع غير صالح.');
  }

  const expState = getEmpireExpansionState(profile);
  if (
    activeOperationLocks.has(cleanOperationId)
    || expState.processedOperationIds.includes(cleanOperationId)
  ) {
    return failure(
      profile,
      'already-claimed',
      'تم تنفيذ طلب التوسع هذا بالفعل؛ تم إيقاف التكرار وحماية رصيدك من الخصم المزدوج.',
    );
  }

  activeOperationLocks.add(cleanOperationId);
  try {
    const country = findCountry(profile.countryId);
    if (!country) {
      return failure(profile, 'wrong-country', 'دولة اللاعب الحالية غير صالحة.');
    }

    const countryCities = getCitiesForCountry(profile.countryId);
    if (!countryCities.some((c) => c.id === request.cityId)) {
      return failure(
        profile,
        'wrong-country',
        'المدينة المختارة لا تتبع دولتك الحالية؛ استخدم بوابة التوسع بين الدول لمعاينة الأسواق الخارجية.',
      );
    }

    const preview = previewCityExpansion(profile, request);
    if (!preview) {
      return failure(profile, 'not-found', 'تعذر حساب متطلبات المدينة المختارة.');
    }

    if (!preview.allRequirementsMet) {
      const firstUnmet = preview.requirements.find((r) => !r.met);
      const isMoneyError = firstUnmet?.id === 'liquidity-check';
      return failure(
        profile,
        isMoneyError ? 'insufficient-funds' : 'condition-not-met',
        firstUnmet
          ? `لا يمكن إتمام التوسع: ${firstUnmet.label} (${firstUnmet.detail}).`
          : 'المتطلبات الأساسية لفتح المنشأة غير مستوفاة.',
      );
    }

    const paymentMethod = request.paymentMethod ?? 'cash';
    const debit = resolvePurchaseDebit(
      profile,
      preview.totalCashCost,
      paymentMethod,
      preview.diamondCost,
    );
    if ('message' in debit) {
      return failure(profile, 'insufficient-funds', debit.message);
    }

    const opHash = shortStableHash(`${cleanOperationId}:${profile.day}:${expState.operationsLog.length + 1}`);
    const nowIso = timestampFor(profile);
    const landId = `emp-land-${opHash}`;
    const plotId = `city-plot-${preview.city.id}-${opHash}`;

    let requiredLandType: PlayerLand['landType'] = 'commercial';
    if (request.kind === 'factory') {
      const ind = findIndustry(request.industryId ?? 'food');
      requiredLandType = ind?.requiredLandType ?? 'industrial';
    }

    const newLand: PlayerLand = {
      id: landId,
      label: `أرض توسع (${preview.city.name}) — ${preview.facilityLabel}`,
      areaSquareMeters: preview.city.defaultAreaSqm,
      purchasePrice: preview.landCost,
      acquiredAt: nowIso,
      acquiredOnDay: profile.day,
      availableForCompanyOnDay: profile.day + 1,
      landType: requiredLandType,
      upgradeLevel: 1,
      plotId,
    };

    const nextLands = [...profile.lands, newLand];
    let nextCompanies = [...profile.companies];
    let nextLicenses = [...profile.licenses];
    let nextBranches = [...(profile.branches ?? [])];
    let nextShops = [...(profile.shops ?? [])];

    let facilityId = '';
    let facilityName = '';

    if (request.kind === 'factory') {
      const industryId = request.industryId ?? 'food';
      const industry = findIndustry(industryId);
      if (!industry) {
        return failure(profile, 'not-found', 'القطاع الصناعي غير موجود.');
      }
      facilityId = `emp-comp-${opHash}`;
      facilityName =
        request.customName?.trim()
        || `مصنع ${industry.name} · ${preview.city.name}`;

      let licenseRecord = nextLicenses.find(
        (lic) => lic.countryId === profile.countryId && lic.industryId === industryId,
      );
      if (!licenseRecord) {
        licenseRecord = {
          id: `emp-lic-${opHash}`,
          countryId: profile.countryId,
          industryId,
          feePaid: preview.licenseFee,
          issuedAt: nowIso,
        } satisfies LicenseRecord;
        nextLicenses = [...nextLicenses, licenseRecord];
      }

      const newCompany: PlayerCompany = {
        id: facilityId,
        name: facilityName.slice(0, 110),
        industryId,
        countryId: profile.countryId,
        foundedAt: nowIso,
        foundedOnDay: profile.day,
        operationalFromDay: profile.day + 1,
        landId,
        licenseIds: [licenseRecord.id],
        energyCapacity: industry.energyCapacity,
        energyUnits: industry.dailyEnergySupply,
        operatingCostPerDay: preview.dailyOperatingCost,
        maintenanceCondition: 100,
        upgradeLevel: 1,
      };
      nextCompanies = [...nextCompanies, newCompany];
    } else if (request.kind === 'branch') {
      const parentCompany = profile.companies.find((c) => c.id === request.parentCompanyId);
      if (!parentCompany) {
        return failure(profile, 'not-found', 'الشركة الأم المطلوبة لفتح الفرع غير موجودة.');
      }
      const branchSpec = getBranchSpecs(1);
      facilityId = `emp-br-${opHash}`;
      facilityName =
        request.customName?.trim()
        || `فرع ${preview.city.name} — ${parentCompany.name}`;

      const newBranch: CompanyBranch = {
        id: facilityId,
        companyId: parentCompany.id,
        parentCompanyName: parentCompany.name,
        name: facilityName.slice(0, 110),
        industryId: parentCompany.industryId,
        plotId,
        landId,
        level: 1,
        status: 'constructing',
        establishedOnDay: profile.day,
        establishedAt: nowIso,
        dailyOperatingCost: preview.dailyOperatingCost,
        revenueBonusRate: Number((branchSpec.bonusRate + preview.city.demandBonusRate * 0.25).toFixed(2)),
        performance: {
          totalRevenue: 0,
          totalExpenses: 0,
          totalOrdersServed: 0,
        },
      };
      nextBranches = [...nextBranches, newBranch];
    } else {
      const shopType = request.shopType ?? 'groceries';
      const shopSpec = findShopSpec(shopType);
      if (!shopSpec) {
        return failure(profile, 'not-found', 'نوع المحل التجاري غير موجود.');
      }
      const parentCompany = request.parentCompanyId
        ? profile.companies.find((c) => c.id === request.parentCompanyId)
        : undefined;
      facilityId = `emp-shop-${opHash}`;
      facilityName =
        request.customName?.trim()
        || `${shopSpec.title} · ${preview.city.name}`;

      const newShop: RetailShop = {
        id: facilityId,
        name: facilityName.slice(0, 110),
        shopType,
        ...(parentCompany ? { companyId: parentCompany.id, parentCompanyName: parentCompany.name } : {}),
        plotId,
        landId,
        level: 1,
        status: 'constructing',
        shelfCapacity: shopSpec.shelfBaseCapacity,
        inventory: [],
        linkedFactoryIds: parentCompany ? [parentCompany.id] : [],
        establishedOnDay: profile.day,
        establishedAt: nowIso,
        dailyOperatingCost: preview.dailyOperatingCost,
        performance: {
          totalSalesRevenue: 0,
          totalCostOfGoods: 0,
          totalProfit: 0,
          totalUnitsSold: 0,
        },
      };
      nextShops = [...nextShops, newShop];
    }

    const cashExpensePortion = preview.setupCost + preview.licenseFee;
    const ledgerEntries =
      paymentMethod === 'cash'
        ? [
            ledgerEntry(
              profile,
              'asset',
              preview.landCost,
              `شراء أرض توسع في ${preview.city.name} لـ ${facilityName} [${cleanOperationId}]`,
              0,
            ),
            ledgerEntry(
              profile,
              'expense',
              cashExpensePortion,
              `تكلفة تأسيس وتجهيز ${facilityName} في ${preview.city.name} [${cleanOperationId}]`,
              1,
            ),
          ]
        : [
            ledgerEntry(
              profile,
              'asset',
              preview.landCost,
              `تخصيص أرض توسع بالماس (${debit.diamondsSpent} ماسة) لـ ${facilityName} [${cleanOperationId}]`,
              0,
            ),
          ];

    const opRecord: EmpireExpansionOperationRecord = {
      operationId: cleanOperationId,
      kind: request.kind,
      cityId: preview.city.id,
      cityName: preview.city.name,
      countryId: profile.countryId,
      facilityId,
      facilityName,
      landId,
      amountPaidCash: paymentMethod === 'cash' ? preview.totalCashCost : 0,
      diamondsSpent: debit.diamondsSpent,
      paymentMethod,
      day: profile.day,
      occurredAt: nowIso,
    };

    const nextExpansionState: EmpireExpansionState = {
      ...expState,
      facilityCities: {
        ...expState.facilityCities,
        [landId]: preview.city.id,
        [facilityId]: preview.city.id,
      },
      processedOperationIds: [...expState.processedOperationIds, cleanOperationId],
      operationsLog: [opRecord, ...expState.operationsLog].slice(0, 250),
    };

    const updatedWithLedger = addLedger(
      {
        ...profile,
        lands: nextLands,
        companies: nextCompanies,
        licenses: nextLicenses,
        branches: nextBranches,
        shops: nextShops,
        empireExpansion: nextExpansionState,
      },
      ledgerEntries,
      debit.bankBalance,
      { diamonds: debit.diamonds },
    );

    const syncedProfile = syncTasks(updatedWithLedger);

    return success(
      syncedProfile,
      `تم اعتماد إنشاء «${facilityName}» في ${preview.city.name} بنجاح (معرّف العملية: ${cleanOperationId}). يبدأ التشغيل الفعلي بعد استكمال التجهيز في اليوم ${profile.day + 1}.`,
      {
        operationId: cleanOperationId,
        facilityId,
        landId,
        cityId: preview.city.id,
        kind: request.kind,
        totalCashPaid: opRecord.amountPaidCash,
        diamondsSpent: debit.diamondsSpent,
      },
    );
  } finally {
    activeOperationLocks.delete(cleanOperationId);
  }
}

export function selectStaffAssignedToFacility(
  profile: PlayerProfile,
  facilityId: string,
): StaffContract[] {
  const expAssignments = profile.empireExpansion?.facilityStaffAssignments ?? {};
  const branch = (profile.branches ?? []).find((b) => b.id === facilityId);

  return profile.staff.filter((member) => {
    if (member.status !== 'active') return false;
    const explicitFacility = expAssignments[member.id];
    if (explicitFacility) return explicitFacility === facilityId;
    if (branch?.managerStaffId === member.id) return true;
    return member.companyId === facilityId;
  });
}

export function getStaffAssignmentTargets(profile: PlayerProfile): StaffAssignmentTargetOption[] {
  const homeCity = getCitiesForCountry(profile.countryId)[0];
  const targets: StaffAssignmentTargetOption[] = [
    {
      targetId: 'hq',
      targetName: 'المقر الرئيسي للإمبراطورية (إدارة عامة)',
      kind: 'hq',
      cityName: homeCity.name,
      acceptedRoles: ['accountant', 'lawyer', 'hr', 'cfo', 'general_manager', 'operations_director', 'manager', 'foreman'],
    },
  ];

  for (const company of profile.companies) {
    const city = resolveFacilityCity(profile, company.id, company.landId);
    targets.push({
      targetId: company.id,
      targetName: company.name,
      kind: 'company',
      cityName: city.name,
      acceptedRoles: ['manager', 'foreman'],
    });
  }

  for (const branch of profile.branches ?? []) {
    const city = resolveFacilityCity(profile, branch.id, branch.landId);
    targets.push({
      targetId: branch.id,
      targetName: branch.name,
      kind: 'branch',
      cityName: city.name,
      acceptedRoles: ['manager', 'foreman'],
    });
  }

  for (const shop of profile.shops ?? []) {
    const city = resolveFacilityCity(profile, shop.id, shop.landId);
    targets.push({
      targetId: shop.id,
      targetName: shop.name,
      kind: 'shop',
      cityName: city.name,
      acceptedRoles: ['manager', 'foreman'],
    });
  }

  return targets;
}

/**
 * Reassigns an existing active employee/manager to a company, branch, shop, or HQ
 * using the existing `profile.staff` contract without creating any duplicate payroll loop.
 */
export function assignStaffToEmpireFacility(
  profile: PlayerProfile,
  staffId: string,
  targetId: string,
): GameResult<{ staffId: string; targetId: string }> {
  const staffMember = profile.staff.find((s) => s.id === staffId && s.status === 'active');
  if (!staffMember) {
    return failure(profile, 'not-found', 'الموظف غير موجود أو عقده منتهٍ.');
  }

  const targets = getStaffAssignmentTargets(profile);
  const target = targets.find((t) => t.targetId === targetId);
  if (!target) {
    return failure(profile, 'not-found', 'المنشأة المستهدفة للتوزيع غير موجودة.');
  }

  if (target.kind !== 'hq' && !target.acceptedRoles.includes(staffMember.role)) {
    return failure(
      profile,
      'condition-not-met',
      'أدوار المحاسبة والشؤون القانونية والقيادة العليا تعمل على مستوى الإمبراطورية بالكامل من المقر الرئيسي ولا تُحصر في منشأة واحدة.',
    );
  }

  if (target.kind !== 'hq') {
    const alreadyAssignedSameRole = selectStaffAssignedToFacility(profile, target.targetId).find(
      (other) => other.id !== staffMember.id && other.role === staffMember.role,
    );
    if (alreadyAssignedSameRole) {
      return failure(
        profile,
        'already-owned',
        `يوجد بالفعل موظف بنفس الدور (${alreadyAssignedSameRole.name}) مخصص لـ «${target.targetName}». انقله أولاً قبل التبديل.`,
      );
    }
  }

  const expState = getEmpireExpansionState(profile);
  const nextFacilityAssignments = { ...expState.facilityStaffAssignments };

  if (target.kind === 'hq') {
    delete nextFacilityAssignments[staffMember.id];
  } else {
    nextFacilityAssignments[staffMember.id] = target.targetId;
  }

  const nextStaff = profile.staff.map((member) => {
    if (member.id !== staffMember.id) return member;
    if (target.kind === 'company') {
      return { ...member, companyId: target.targetId };
    }
    if (target.kind === 'branch') {
      const parentBr = (profile.branches ?? []).find((b) => b.id === target.targetId);
      const { companyId: _prev, ...rest } = member;
      return parentBr ? { ...rest, companyId: parentBr.companyId } : rest;
    }
    const { companyId: _removed, ...rest } = member;
    return rest;
  });

  const nextBranches = (profile.branches ?? []).map((branch) => {
    if (target.kind === 'branch' && branch.id === target.targetId && staffMember.role === 'manager') {
      return { ...branch, managerStaffId: staffMember.id };
    }
    if (branch.managerStaffId === staffMember.id && branch.id !== target.targetId) {
      const { managerStaffId: _old, ...rest } = branch;
      return rest;
    }
    return branch;
  });

  return success(
    {
      ...profile,
      staff: nextStaff,
      branches: nextBranches,
      empireExpansion: {
        ...expState,
        facilityStaffAssignments: nextFacilityAssignments,
      },
    },
    `تم توزيع «${staffMember.name}» للعمل في «${target.targetName}» دون تغيير عقد راتبه الحالي (${staffMember.dailySalary.toLocaleString('ar-EG')} $/يوم).`,
    { staffId: staffMember.id, targetId: target.targetId },
  );
}

export function selectUnifiedEmpireFacilities(profile: PlayerProfile): UnifiedEmpireFacility[] {
  const facilities: UnifiedEmpireFacility[] = [];
  const hasOverdueSalary = profile.staff.some((s) => s.status === 'active' && (s.unpaidSalary ?? 0) > 0);
  const energyPausedByDebt = profile.payables > 0 || hasOverdueSalary;

  const occupiedLandMap = new Map<string, string>();

  // 1. Companies / Factories
  for (const company of profile.companies) {
    if (company.landId) occupiedLandMap.set(company.landId, company.name);
    const city = resolveFacilityCity(profile, company.id, company.landId);
    const industry = findIndustry(company.industryId);
    const recipe = findRecipeForIndustry(company.industryId);
    const activeOrders = profile.productionOrders.filter(
      (o) => o.companyId === company.id && o.status === 'active',
    );
    const assignedStaff = selectStaffAssignedToFacility(profile, company.id);
    const cond = company.maintenanceCondition ?? 100;
    const energy = company.energyUnits ?? 0;
    const energyCap = company.energyCapacity ?? industry?.energyCapacity ?? 50;

    let operationalState: FacilityOperationalState = 'active';
    let stateLabel = 'عاملة';
    const haltReasons: string[] = [];

    if ((company.operationalFromDay ?? 1) > profile.day) {
      operationalState = 'constructing';
      stateLabel = 'تحت الإنشاء / نقل الملكية';
      haltReasons.push(`تكتمل إجراءات الإنشاء ونقل الملكية في اليوم ${company.operationalFromDay}`);
    } else {
      if (cond < 25) {
        haltReasons.push(`تعطل الآلات بسبب انخفاض الكفاءة إلى ${Math.round(cond)}% (الحد الأدنى للتشغيل 25%)`);
      }
      if (recipe && energy < recipe.energyUnits) {
        if (energyPausedByDebt) {
          haltReasons.push('توقف شحن الطاقة اليومية بسبب وجود التزامات مالية أو رواتب متأخرة');
        } else {
          haltReasons.push(`نقص وحدات الطاقة المتاحة (${energy}/${recipe.energyUnits} وحدة مطلوبة للدفعة)`);
        }
      }
      if (recipe && activeOrders.length === 0) {
        const missingInputs = recipe.inputs.filter((inp) => {
          const stock = profile.inventory.find((lot) => lot.materialOrProductId === inp.materialId)?.quantity ?? 0;
          return stock < inp.quantity;
        });
        if (missingInputs.length > 0) {
          const names = missingInputs
            .map((inp) => findMaterial(inp.materialId)?.name ?? inp.materialId)
            .join('، ');
          haltReasons.push(`نقص المواد الخام اللازمة لدورة الإنتاج (${names})`);
        }
      }

      if (haltReasons.length > 0 && activeOrders.length === 0) {
        operationalState = 'halted';
        stateLabel = 'متوقفة';
      } else if (activeOrders.length > 0) {
        operationalState = 'active';
        stateLabel = `عاملة (${activeOrders.length} أمر إنتاج جارٍ)`;
      } else {
        operationalState = 'active';
        stateLabel = 'عاملة وجاهزة للتشغيل';
      }
    }

    facilities.push({
      id: company.id,
      kind: 'company',
      name: company.name,
      subtitle: `شركة ومصنع · قطاع ${industry?.name ?? company.industryId}`,
      countryId: company.countryId,
      cityId: city.id,
      cityName: city.name,
      operationalState,
      stateLabel,
      haltReasons,
      level: company.upgradeLevel ?? 1,
      dailyOperatingCost: company.operatingCostPerDay ?? industry?.dailyOperatingCost ?? 0,
      assignedStaffIds: assignedStaff.map((s) => s.id),
      assignedStaffNames: assignedStaff.map((s) => `${s.name} (${s.role === 'manager' ? 'مدير' : 'مشرف'})`),
      linkedLandId: company.landId,
      industryId: company.industryId,
      maintenanceCondition: cond,
      energyUnits: energy,
      energyCapacity: energyCap,
      readyOnDay: company.operationalFromDay,
    });
  }

  // 2. Branches
  for (const branch of profile.branches ?? []) {
    if (branch.landId) occupiedLandMap.set(branch.landId, branch.name);
    const city = resolveFacilityCity(profile, branch.id, branch.landId);
    const assignedStaff = selectStaffAssignedToFacility(profile, branch.id);
    const parentCompany = profile.companies.find((c) => c.id === branch.companyId);

    let operationalState: FacilityOperationalState = 'active';
    let stateLabel = 'عاملة';
    const haltReasons: string[] = [];

    if (branch.status === 'constructing') {
      operationalState = 'constructing';
      stateLabel = 'تحت الإنشاء';
      haltReasons.push(
        profile.day > branch.establishedOnDay
          ? 'اكتملت المدة الزمنية وبانتظار التفعيل من لوحة المنشآت'
          : `تحت الإنشاء والتجهيز (تأسس في اليوم ${branch.establishedOnDay})`,
      );
    } else if (branch.status === 'maintenance') {
      operationalState = 'halted';
      stateLabel = 'متوقفة للصيانة';
      haltReasons.push('الفرع متوقف مؤقتاً لأعمال الصيانة الدورية');
    } else if (branch.status === 'closed') {
      operationalState = 'halted';
      stateLabel = 'مغلق';
      haltReasons.push('الفرع مغلق إدارياً');
    } else if (!parentCompany) {
      operationalState = 'halted';
      stateLabel = 'متوقفة';
      haltReasons.push('الشركة الأم المرتبطة بالفرع لم تعد مملوكة');
    } else if ((parentCompany.maintenanceCondition ?? 100) < 25) {
      operationalState = 'halted';
      stateLabel = 'متوقفة تبعاً للمصنع الأم';
      haltReasons.push(`توقف إمداد الفرع بسبب تعطل آلات الشركة الأم (${parentCompany.name})`);
    } else {
      stateLabel = `عاملة (+${Math.round(branch.revenueBonusRate * 100)}% عائد تشغيلي)`;
    }

    facilities.push({
      id: branch.id,
      kind: 'branch',
      name: branch.name,
      subtitle: `فرع إقليمي تابع لـ ${branch.parentCompanyName}`,
      countryId: profile.countryId,
      cityId: city.id,
      cityName: city.name,
      operationalState,
      stateLabel,
      haltReasons,
      level: branch.level,
      dailyOperatingCost: branch.dailyOperatingCost,
      assignedStaffIds: assignedStaff.map((s) => s.id),
      assignedStaffNames: assignedStaff.map((s) => `${s.name} (${s.role === 'manager' ? 'مدير' : 'مشرف'})`),
      linkedLandId: branch.landId,
      parentCompanyId: branch.companyId,
      industryId: branch.industryId,
      readyOnDay: branch.establishedOnDay + 1,
    });
  }

  // 3. Retail Shops
  for (const shop of profile.shops ?? []) {
    if (shop.landId) occupiedLandMap.set(shop.landId, shop.name);
    const city = resolveFacilityCity(profile, shop.id, shop.landId);
    const spec = findShopSpec(shop.shopType);
    const assignedStaff = selectStaffAssignedToFacility(profile, shop.id);
    const totalShelfUnits = shop.inventory.reduce((sum, item) => sum + item.quantity, 0);

    let operationalState: FacilityOperationalState = 'active';
    let stateLabel = 'عاملة';
    const haltReasons: string[] = [];

    if (shop.status === 'constructing') {
      operationalState = 'constructing';
      stateLabel = 'تحت الإنشاء';
      haltReasons.push(
        profile.day > shop.establishedOnDay
          ? 'اكتملت المدة الزمنية وبانتظار التفعيل من لوحة المنشآت'
          : `تحت الإنشاء وتجهيز الأرفف (تأسس في اليوم ${shop.establishedOnDay})`,
      );
    } else if (shop.status === 'maintenance' || shop.status === 'closed') {
      operationalState = 'halted';
      stateLabel = shop.status === 'maintenance' ? 'متوقفة للصيانة' : 'مغلق';
      haltReasons.push(shop.status === 'maintenance' ? 'المحل في وضع الصيانة' : 'المحل مغلق إدارياً');
    } else if (totalShelfUnits <= 0) {
      operationalState = 'halted';
      stateLabel = 'متوقفة (الأرفف فارغة)';
      haltReasons.push('نفاد البضائع الجاهزة من أرفف المحل؛ يلزم تزويده بالمنتجات لبدء البيع للمستهلكين');
    } else {
      stateLabel = `عاملة (${totalShelfUnits}/${shop.shelfCapacity} وحدة معروضة)`;
    }

    facilities.push({
      id: shop.id,
      kind: 'shop',
      name: shop.name,
      subtitle: `${spec?.title ?? 'محل تجزئة'}${shop.parentCompanyName ? ` · مرتبط بـ ${shop.parentCompanyName}` : ''}`,
      countryId: profile.countryId,
      cityId: city.id,
      cityName: city.name,
      operationalState,
      stateLabel,
      haltReasons,
      level: shop.level,
      dailyOperatingCost: shop.dailyOperatingCost,
      assignedStaffIds: assignedStaff.map((s) => s.id),
      assignedStaffNames: assignedStaff.map((s) => `${s.name} (${s.role === 'manager' ? 'مدير' : 'مشرف'})`),
      linkedLandId: shop.landId,
      parentCompanyId: shop.companyId,
      shopType: shop.shopType,
      shelfOccupancy: { used: totalShelfUnits, capacity: shop.shelfCapacity },
      readyOnDay: shop.establishedOnDay + 1,
    });
  }

  // 4. Owned Lands
  const landTypeAr = { industrial: 'صناعية', agricultural: 'زراعية', commercial: 'تجارية' } as const;
  for (const land of profile.lands) {
    const city = resolveFacilityCity(profile, land.id);
    const occupant = occupiedLandMap.get(land.id);
    const availableDay = land.availableForCompanyOnDay ?? land.acquiredOnDay ?? 1;

    let operationalState: FacilityOperationalState = 'active';
    let stateLabel = occupant ? `مستغلة (${occupant})` : 'شاغرة وجاهزة للبناء';
    const haltReasons: string[] = [];

    if (availableDay > profile.day && !occupant) {
      operationalState = 'constructing';
      stateLabel = 'قيد نقل الملكية';
      haltReasons.push(`تكتمل إجراءات التسجيل العقاري ونقل الملكية في اليوم ${availableDay}`);
    }

    facilities.push({
      id: land.id,
      kind: 'land',
      name: land.label,
      subtitle: `أرض ${landTypeAr[land.landType ?? 'industrial']} · المساحة ${land.areaSquareMeters.toLocaleString('ar-EG')} م²`,
      countryId: profile.countryId,
      cityId: city.id,
      cityName: city.name,
      operationalState,
      stateLabel,
      haltReasons,
      level: land.upgradeLevel ?? 1,
      dailyOperatingCost: 0,
      assignedStaffIds: [],
      assignedStaffNames: [],
      readyOnDay: availableDay,
    });
  }

  return facilities;
}

/**
 * Computes exact per-facility revenues, expenses, and net profits strictly from real ledger,
 * sales, production orders, staff contracts, branches, and shops, reconciling 100% with profile.finances.
 */
export function selectEmpireAdminReport(profile: PlayerProfile): EmpireAdminReport {
  const country = findCountry(profile.countryId);
  const operatingMultiplier = country?.economy.operatingCostMultiplier ?? 1;
  const unifiedFacilities = selectUnifiedEmpireFacilities(profile);
  const facilityStateMap = new Map(unifiedFacilities.map((f) => [f.id, f]));

  const revenueMap = new Map<string, number>();
  const expenseMap = new Map<string, number>();

  const addRev = (id: string, amount: number) => {
    revenueMap.set(id, (revenueMap.get(id) ?? 0) + amount);
  };
  const addExp = (id: string, amount: number) => {
    expenseMap.set(id, (expenseMap.get(id) ?? 0) + amount);
  };

  let unallocatedRevenue = 0;
  let unallocatedExpenses = 0;

  // Precompute output shares per productId across player's companies for proportional attribution of product sales/production notes
  const companiesByProductId = new Map<string, { companyId: string; weight: number }[]>();
  for (const recipe of RECIPE_CATALOG) {
    const matchingCompanies = profile.companies.filter((c) => c.industryId === recipe.industryId);
    if (matchingCompanies.length === 0) continue;
    const weights = matchingCompanies.map((c) => {
      const completedOutput = profile.productionOrders
        .filter((o) => o.companyId === c.id && o.status === 'completed')
        .reduce((sum, o) => sum + o.outputQuantity, 0);
      return { companyId: c.id, weight: completedOutput > 0 ? completedOutput : 1 };
    });
    companiesByProductId.set(recipe.productId, weights);
  }

  // Staff -> facility lookup for salary attribution
  const staffFacilityMap = new Map<string, { name: string; facilityId?: string }>();
  for (const member of profile.staff) {
    const explicit = profile.empireExpansion?.facilityStaffAssignments?.[member.id];
    const branchMatch = (profile.branches ?? []).find((b) => b.managerStaffId === member.id)?.id;
    const resolvedFacilityId = explicit ?? branchMatch ?? member.companyId;
    staffFacilityMap.set(member.id, { name: member.name, facilityId: resolvedFacilityId });
  }

  const branches = profile.branches ?? [];
  const shops = profile.shops ?? [];
  const companies = profile.companies;

  // Partition every revenue & expense entry in profile.ledger into exactly one bucket
  for (const entry of profile.ledger) {
    if (entry.category !== 'revenue' && entry.category !== 'expense') continue;
    const isRev = entry.category === 'revenue';
    const note = entry.note;

    // 1. Direct match on Branch ID or Branch Name
    const matchedBranch = branches.find((b) => note.includes(b.id) || note.includes(b.name));
    if (matchedBranch) {
      if (isRev) addRev(matchedBranch.id, entry.amount);
      else addExp(matchedBranch.id, entry.amount);
      continue;
    }

    // 2. Direct match on Shop ID or Shop Name
    const matchedShop = shops.find((s) => note.includes(s.id) || note.includes(s.name));
    if (matchedShop) {
      if (isRev) addRev(matchedShop.id, entry.amount);
      else addExp(matchedShop.id, entry.amount);
      continue;
    }

    // 3. Direct match on Company ID or Company Name
    const matchedCompany = companies.find((c) => note.includes(c.id) || note.includes(c.name));
    if (matchedCompany) {
      if (isRev) addRev(matchedCompany.id, entry.amount);
      else addExp(matchedCompany.id, entry.amount);
      continue;
    }

    // 4. Staff salary payment attribution ("دفع راتب ...")
    if (!isRev && note.includes('راتب')) {
      const matchedStaff = profile.staff.find((s) => note.includes(s.name));
      const targetFacilityId = matchedStaff ? staffFacilityMap.get(matchedStaff.id)?.facilityId : undefined;
      if (
        targetFacilityId
        && (companies.some((c) => c.id === targetFacilityId)
          || branches.some((b) => b.id === targetFacilityId)
          || shops.some((s) => s.id === targetFacilityId))
      ) {
        addExp(targetFacilityId, entry.amount);
        continue;
      }
    }

    // 5. Product sale, tax, contract delivery, or production energy/maintenance matching a catalog product
    const matchedProduct = PRODUCT_CATALOG.find((p) => note.includes(p.name));
    if (matchedProduct) {
      const shares = companiesByProductId.get(matchedProduct.id);
      if (shares && shares.length > 0) {
        const totalWeight = shares.reduce((sum, s) => sum + s.weight, 0);
        let distributed = 0;
        shares.forEach((share, idx) => {
          const portion =
            idx === shares.length - 1
              ? entry.amount - distributed
              : Math.round((entry.amount * share.weight) / totalWeight);
          distributed += portion;
          if (isRev) addRev(share.companyId, portion);
          else addExp(share.companyId, portion);
        });
        continue;
      }
    }

    // 6. Daily company operating cost ("تشغيل الشركات") distributed proportionally to operatingCostPerDay
    if (!isRev && note.includes('تشغيل') && companies.length > 0) {
      const totalOpWeight = companies.reduce((sum, c) => sum + Math.max(1, c.operatingCostPerDay ?? 100), 0);
      let distributed = 0;
      companies.forEach((company, idx) => {
        const weight = Math.max(1, company.operatingCostPerDay ?? 100);
        const portion =
          idx === companies.length - 1
            ? entry.amount - distributed
            : Math.round((entry.amount * weight) / totalOpWeight);
        distributed += portion;
        addExp(company.id, portion);
      });
      continue;
    }

    // 7. License fee matching an industry owned by a company
    if (!isRev && note.includes('ترخيص')) {
      const matchedInd = INDUSTRY_CATALOG.find((ind) => note.includes(ind.name));
      const indCompany = matchedInd ? companies.find((c) => c.industryId === matchedInd.id) : undefined;
      if (indCompany) {
        addExp(indCompany.id, entry.amount);
        continue;
      }
    }

    // 8. Otherwise belongs to Central Treasury / Non-facility items (bank interest, missions, macro events, etc.)
    if (isRev) unallocatedRevenue += entry.amount;
    else unallocatedExpenses += entry.amount;
  }

  const managedCompanyIds = new Set(
    profile.staff
      .filter((s) => s.status === 'active' && s.role === 'manager' && s.companyId)
      .map((s) => s.companyId),
  );
  const costProgression = getOperatingCostProgression(profile.day);
  const synergyMult = getSynergyOperatingMultiplier(profile);

  const rows: FacilityFinancialRow[] = [];

  for (const company of companies) {
    const unified = facilityStateMap.get(company.id);
    const assignedStaff = selectStaffAssignedToFacility(profile, company.id);
    const staffPayroll = assignedStaff.reduce((sum, s) => sum + s.dailySalary, 0);
    const completedOrders = profile.productionOrders.filter(
      (o) => o.companyId === company.id && o.status === 'completed',
    );
    const outputUnits = completedOrders.reduce((sum, o) => sum + o.outputQuantity, 0);
    const dailyOp = Math.round(
      (company.operatingCostPerDay ?? 0)
        * (managedCompanyIds.has(company.id) ? 0.92 : 1)
        * operatingMultiplier
        * costProgression
        * synergyMult,
    );
    const rev = revenueMap.get(company.id) ?? 0;
    const exp = expenseMap.get(company.id) ?? 0;

    rows.push({
      facilityId: company.id,
      facilityName: company.name,
      kind: 'company',
      cityName: unified?.cityName ?? resolveFacilityCity(profile, company.id, company.landId).name,
      operationalState: unified?.operationalState ?? 'active',
      revenue: rev,
      expenses: exp,
      netProfit: rev - exp,
      dailyOperatingCommitment: dailyOp,
      dailyStaffPayroll: staffPayroll,
      activitySummary: `${completedOrders.length} دفعة مكتملة · ${outputUnits.toLocaleString('ar-EG')} وحدة منتجة`,
    });
  }

  for (const branch of branches) {
    const unified = facilityStateMap.get(branch.id);
    const assignedStaff = selectStaffAssignedToFacility(profile, branch.id);
    const staffPayroll = assignedStaff.reduce((sum, s) => sum + s.dailySalary, 0);
    const rev = revenueMap.get(branch.id) ?? branch.performance.totalRevenue ?? 0;
    const exp = expenseMap.get(branch.id) ?? branch.performance.totalExpenses ?? 0;

    rows.push({
      facilityId: branch.id,
      facilityName: branch.name,
      kind: 'branch',
      cityName: unified?.cityName ?? resolveFacilityCity(profile, branch.id, branch.landId).name,
      operationalState: unified?.operationalState ?? 'active',
      revenue: rev,
      expenses: exp,
      netProfit: rev - exp,
      dailyOperatingCommitment: branch.status === 'active' ? branch.dailyOperatingCost : 0,
      dailyStaffPayroll: staffPayroll,
      activitySummary: `${branch.performance.totalOrdersServed} دورة خدمة · مكافأة +${Math.round(branch.revenueBonusRate * 100)}%`,
    });
  }

  for (const shop of shops) {
    const unified = facilityStateMap.get(shop.id);
    const assignedStaff = selectStaffAssignedToFacility(profile, shop.id);
    const staffPayroll = assignedStaff.reduce((sum, s) => sum + s.dailySalary, 0);
    const rev = revenueMap.get(shop.id) ?? shop.performance.totalSalesRevenue ?? 0;
    const exp = expenseMap.get(shop.id) ?? 0;

    rows.push({
      facilityId: shop.id,
      facilityName: shop.name,
      kind: 'shop',
      cityName: unified?.cityName ?? resolveFacilityCity(profile, shop.id, shop.landId).name,
      operationalState: unified?.operationalState ?? 'active',
      revenue: rev,
      expenses: exp,
      netProfit: rev - exp,
      dailyOperatingCommitment: shop.status === 'active' ? shop.dailyOperatingCost : 0,
      dailyStaffPayroll: staffPayroll,
      activitySummary: `${shop.performance.totalUnitsSold.toLocaleString('ar-EG')} وحدة مباعة بالتجزئة`,
    });
  }

  const facilitiesRevenue = rows.reduce((sum, r) => sum + r.revenue, 0);
  const facilitiesExpenses = rows.reduce((sum, r) => sum + r.expenses, 0);
  const grandRevenue = facilitiesRevenue + unallocatedRevenue;
  const grandExpenses = facilitiesExpenses + unallocatedExpenses;
  const grandNet = grandRevenue - grandExpenses;

  const facilitiesOperating = rows.reduce((sum, r) => sum + r.dailyOperatingCommitment, 0);
  const totalStaffPayroll = profile.staff
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + s.dailySalary, 0);

  return {
    facilities: rows,
    facilitiesSubtotal: {
      revenue: facilitiesRevenue,
      expenses: facilitiesExpenses,
      netProfit: facilitiesRevenue - facilitiesExpenses,
    },
    unallocatedTreasury: {
      revenue: unallocatedRevenue,
      expenses: unallocatedExpenses,
      netProfit: unallocatedRevenue - unallocatedExpenses,
      description: 'عوائد الودائع والاستثمارات ومكافآت المهام ورواتب الإدارة العليا والأحداث العامة',
    },
    grandTotal: {
      revenue: grandRevenue,
      expenses: grandExpenses,
      netProfit: grandNet,
      reconciledWithLedger:
        Math.abs(grandRevenue - profile.finances.totalRevenue) <= 1
        && Math.abs(grandExpenses - profile.finances.totalExpenses) <= 1,
    },
    dailyCommitments: {
      facilitiesOperating,
      staffPayroll: totalStaffPayroll,
      totalDailyBurn: facilitiesOperating + totalStaffPayroll,
    },
  };
}

export function evaluateCountryExpansion(
  profile: PlayerProfile,
  targetCountryId: CountryId,
  targetCityId?: string,
  activityKind: CityExpansionFacilityKind = 'factory',
  options: { industryId?: IndustryId; shopType?: RetailShopType } = {},
): CountryExpansionAssessment | null {
  const homeCountry = findCountry(profile.countryId);
  const targetCountry = findCountry(targetCountryId) ?? COUNTRIES.find((c) => c.id !== profile.countryId);
  if (!homeCountry || !targetCountry) return null;

  const targetCities = getCitiesForCountry(targetCountry.id);
  const targetCity = targetCities.find((c) => c.id === targetCityId) ?? targetCities[0];
  const effectiveLevel = getEffectivePlayerLevel(profile);

  const industryId = options.industryId ?? 'food';
  const shopType = options.shopType ?? 'groceries';
  const industry = findIndustry(industryId);
  const shopSpec = findShopSpec(shopType);

  const opMult = targetCountry.economy.operatingCostMultiplier ?? 1;
  const landCost = Math.round(
    targetCity.landBaseCost * opMult * (activityKind === 'factory' ? 1.15 : 0.8),
  );
  const setupFee =
    activityKind === 'factory'
      ? Math.round((targetCountry.economy.companySetupFee + 5000) * targetCity.setupMultiplier)
      : activityKind === 'branch'
        ? Math.round(getBranchSpecs(1).setupCost * targetCity.setupMultiplier * 1.15)
        : Math.round((shopSpec?.setupCost ?? 9000) * targetCity.setupMultiplier * 1.1);

  const sovereignLicenseFee =
    activityKind === 'factory'
      ? targetCountry.economy.licenseFeesByIndustry[industryId] ?? 2000
      : Math.round(targetCountry.economy.companySetupFee * 0.75);

  const customsReserve = Math.round((landCost + setupFee) * targetCountry.economy.customsRate);
  const totalInitialCapitalUsd = landCost + setupFee + sovereignLicenseFee + customsReserve;

  const baseDailyUsd =
    activityKind === 'factory'
      ? industry?.dailyOperatingCost ?? 200
      : activityKind === 'branch'
        ? getBranchSpecs(1).dailyOperatingCost
        : 130;
  const estimatedDailyOperatingUsd = Math.round(baseDailyUsd * opMult * targetCity.operatingMultiplier);

  const usdToTarget = targetCountry.economy.usdToLocalRate;
  const usdToHome = homeCountry.economy.usdToLocalRate;

  const readinessChecks: ExpansionRequirementCheck[] = [
    {
      id: 'foreign-country-distinct',
      label: 'اختيار دولة خارجية مختلفة عن دولة المقر',
      met: targetCountry.id !== profile.countryId,
      detail:
        targetCountry.id !== profile.countryId
          ? `التوسع من ${homeCountry.name} إلى ${targetCountry.name}`
          : 'أنت تعمل بالفعل داخل هذه الدولة؛ استخدم التوسع بين المدن',
    },
    {
      id: 'sovereign-level',
      label: 'بلوغ المستوى الإداري 3 للتوسع العابر للحدود',
      met: effectiveLevel >= 3,
      detail: `مستواك الحالي: ${effectiveLevel} / المطلوب: 3`,
    },
    {
      id: 'clean-payables',
      label: 'سداد الالتزامات المتأخرة قبل التوسع الخارجي',
      met: profile.payables <= 0,
      detail:
        profile.payables <= 0
          ? 'السجل الائتماني خالٍ من المتأخرات'
          : `يوجد متأخرات بقيمة ${Math.round(profile.payables).toLocaleString('ar-EG')} $`,
    },
    {
      id: 'foreign-capital-buffer',
      label: 'توفر رأس المال التأسيسي بالدولار',
      met: profile.bankBalance >= totalInitialCapitalUsd,
      detail: `المطلوب ${totalInitialCapitalUsd.toLocaleString('ar-EG')} $ · المتاح ${Math.round(profile.bankBalance).toLocaleString('ar-EG')} $`,
    },
  ];

  return {
    homeCountryId: homeCountry.id,
    targetCountryId: targetCountry.id,
    targetCity,
    activityKind,
    ...(activityKind === 'factory' ? { industryId } : {}),
    ...(activityKind === 'shop' ? { shopType } : {}),
    taxRatePercent: Math.round(targetCountry.economy.taxRate * 1000) / 10,
    customsRatePercent: Math.round(targetCountry.economy.customsRate * 1000) / 10,
    operatingCostMultiplier: opMult,
    exchangeRateUsdToTarget: usdToTarget,
    exchangeRateUsdToHome: usdToHome,
    costsInUsd: {
      landCost,
      setupFee,
      sovereignLicenseFee,
      customsReserve,
      totalInitialCapitalUsd,
      estimatedDailyOperatingUsd,
    },
    costsInTargetCurrency: {
      currencyCode: targetCountry.currency.code,
      currencySymbol: targetCountry.currency.symbol,
      currencyName: targetCountry.currency.name,
      totalInitialCapitalLocal: Math.round(totalInitialCapitalUsd * usdToTarget),
      estimatedDailyOperatingLocal: Math.round(estimatedDailyOperatingUsd * usdToTarget),
    },
    costsInHomeCurrency: {
      currencyCode: homeCountry.currency.code,
      currencySymbol: homeCountry.currency.symbol,
      totalInitialCapitalHome: Math.round(totalInitialCapitalUsd * usdToHome),
    },
    readinessChecks,
    allReadinessChecksMet: readinessChecks.every((c) => c.met),
    gateway: COUNTRY_EXPANSION_GATEWAY,
  };
}

/**
 * Registers an auditable cross-border expansion dossier WITHOUT deducting money or faking foreign execution,
 * honoring Rule 3 ("جهّز واجهة ربط واضحة واذكر أنها غير مكتملة؛ لا تعرضها على أنها تعمل").
 */
export function registerCountryExpansionIntent(
  profile: PlayerProfile,
  params: {
    intentId: string;
    targetCountryId: CountryId;
    targetCityId: string;
    activityKind: CityExpansionFacilityKind;
    industryId?: IndustryId;
    shopType?: RetailShopType;
  },
): GameResult<{ intent: InternationalExpansionIntent }> {
  const assessment = evaluateCountryExpansion(
    profile,
    params.targetCountryId,
    params.targetCityId,
    params.activityKind,
    { industryId: params.industryId, shopType: params.shopType },
  );
  if (!assessment) {
    return failure(profile, 'not-found', 'تعذر تقييم الدولة المستهدفة.');
  }
  if (params.targetCountryId === profile.countryId) {
    return failure(profile, 'invalid-input', 'هذه دولتك الحالية؛ استخدم تبويب التوسع بين المدن لفتح المنشأة فعلياً.');
  }

  const expState = getEmpireExpansionState(profile);
  const cleanIntentId = params.intentId.trim() || `intl-${shortStableHash(`${params.targetCountryId}:${params.targetCityId}:${profile.day}`)}`;
  if (expState.internationalIntentLog.some((item) => item.intentId === cleanIntentId)) {
    return failure(profile, 'already-claimed', 'تم حفظ ملف دراسة التوسع الدولي هذا مسبقاً.');
  }

  const intent: InternationalExpansionIntent = {
    intentId: cleanIntentId,
    targetCountryId: assessment.targetCountryId,
    targetCityId: assessment.targetCity.id,
    activityKind: assessment.activityKind,
    ...(assessment.industryId ? { industryId: assessment.industryId } : {}),
    ...(assessment.shopType ? { shopType: assessment.shopType } : {}),
    estimatedTotalUsd: assessment.costsInUsd.totalInitialCapitalUsd,
    estimatedTotalTargetLocal: assessment.costsInTargetCurrency.totalInitialCapitalLocal,
    targetCurrencyCode: assessment.costsInTargetCurrency.currencyCode,
    registeredOnDay: profile.day,
    registeredAt: timestampFor(profile),
    gatewayStatus: 'incomplete_multi_currency_runtime',
  };

  return success(
    {
      ...profile,
      empireExpansion: {
        ...expState,
        internationalIntentLog: [intent, ...expState.internationalIntentLog].slice(0, 100),
      },
    },
    `تم تسجيل ملف الجدوى الدولي لدولة ${findCountry(params.targetCountryId)?.name ?? ''} بدون خصم أي رصيد (بوابة التشغيل متعدد العملات قيد الاستكمال البرمجي).`,
    { intent },
  );
}

/**
 * Generates actionable operational alerts from real inventory, factory status, and financial obligations.
 */
export function selectEmpireOperationalAlerts(profile: PlayerProfile): EmpireOperationalAlert[] {
  const alerts: EmpireOperationalAlert[] = [];

  // 1. Financial Obligations: Overdue Payables
  if (profile.payables > 0) {
    alerts.push({
      id: 'emp-alert-payables',
      category: 'finance',
      severity: 'critical',
      title: 'التزامات مالية متأخرة توقف شحن الطاقة',
      detail: `يوجد متأخرات مستحقة بقيمة ${Math.round(profile.payables).toLocaleString('ar-EG')} $ تؤدي إلى تجميد إمدادات الطاقة اليومية للمصانع.`,
      recommendedActionLabel: 'مراجعة وسداد الالتزامات',
      targetSection: 'obligations',
    });
  }

  // 2. Financial Obligations: Overdue Staff Salaries
  const unpaidStaff = profile.staff.filter((s) => s.status === 'active' && (s.unpaidSalary ?? 0) > 0);
  if (unpaidStaff.length > 0) {
    const unpaidTotal = unpaidStaff.reduce((sum, s) => sum + (s.unpaidSalary ?? 0), 0);
    alerts.push({
      id: 'emp-alert-unpaid-salaries',
      category: 'finance',
      severity: 'critical',
      title: `رواتب متأخرة لـ ${unpaidStaff.length} من الموظفين`,
      detail: `إجمالي الرواتب المتأخرة ${Math.round(unpaidTotal).toLocaleString('ar-EG')} $؛ استمرار التأخير يوقف الطاقة ويضعف الإدارة.`,
      recommendedActionLabel: 'سداد الرواتب المتأخرة',
      targetSection: 'staff',
    });
  }

  // 3. Financial Obligations: Bank Loans Due Soon or Overdue
  const dueLoans = profile.banking.loans.filter(
    (loan) => loan.status === 'active' && loan.nextPaymentDay - profile.day <= 2,
  );
  if (dueLoans.length > 0) {
    const totalInstallments = dueLoans.reduce(
      (sum, l) => sum + Math.min(l.remainingBalance, l.installmentAmount),
      0,
    );
    const nearestDay = Math.min(...dueLoans.map((l) => l.nextPaymentDay));
    alerts.push({
      id: `emp-alert-loans-due-${nearestDay}`,
      category: 'finance',
      severity: nearestDay <= profile.day ? 'critical' : 'warning',
      title: nearestDay <= profile.day ? 'قسط قرض مستحق اليوم' : 'اقتراب موعد قسط قرض بنكي',
      detail: `يستحق ${Math.round(totalInstallments).toLocaleString('ar-EG')} $ على ${dueLoans.length} قرض (أقرب استحقاق: اليوم ${nearestDay}).`,
      recommendedActionLabel: 'فتح الالتزامات والبنك',
      targetSection: 'obligations',
    });
  }

  // 4. Production Halt: Broken / Critical Maintenance or Depleted Energy
  for (const company of profile.companies) {
    if ((company.operationalFromDay ?? 1) > profile.day) continue;
    const cond = company.maintenanceCondition ?? 100;
    if (cond < 25) {
      alerts.push({
        id: `emp-alert-maint-halt-${company.id}`,
        category: 'production',
        severity: 'critical',
        title: `توقف الإنتاج في «${company.name}» بسبب عطل الآلات`,
        detail: `كفاءة المعدات هبطت إلى ${Math.round(cond)}% (أقل من الحد التشغيلي 25%). أجرِ صيانة فورية لاستئناف التصنيع.`,
        facilityId: company.id,
        facilityName: company.name,
        recommendedActionLabel: 'صيانة المصنع الآن',
        targetSection: 'companies',
      });
    } else if (cond < 55) {
      alerts.push({
        id: `emp-alert-maint-warn-${company.id}`,
        category: 'production',
        severity: 'warning',
        title: `تراجع كفاءة آلات «${company.name}» (${Math.round(cond)}%)`,
        detail: 'انخفاض الصيانة دون 60% يخصم من جودة المنتجات المصنعة ويقرب المصنع من التوقف.',
        facilityId: company.id,
        facilityName: company.name,
        recommendedActionLabel: 'فحص وصيانة الشركة',
        targetSection: 'companies',
      });
    }

    const recipe = findRecipeForIndustry(company.industryId);
    const hasActiveOrder = profile.productionOrders.some(
      (o) => o.companyId === company.id && o.status === 'active',
    );
    if (recipe && !hasActiveOrder && (company.energyUnits ?? 0) < recipe.energyUnits) {
      alerts.push({
        id: `emp-alert-energy-${company.id}`,
        category: 'production',
        severity: 'warning',
        title: `نقص الطاقة في «${company.name}»`,
        detail: `الطاقة المتاحة (${company.energyUnits ?? 0} وحدة) أقل من متطلب تشغيل دفعة جديدة (${recipe.energyUnits} وحدة).`,
        facilityId: company.id,
        facilityName: company.name,
        recommendedActionLabel: 'مراجعة المصنع والطاقة',
        targetSection: 'production',
      });
    }
  }

  // 5. Inventory Shortages: Raw Materials Needed by Operational Companies
  const missingMaterialsSummary: { companyName: string; companyId: string; materials: string[] }[] = [];
  for (const company of profile.companies) {
    if ((company.operationalFromDay ?? 1) > profile.day) continue;
    const hasActiveOrder = profile.productionOrders.some(
      (o) => o.companyId === company.id && o.status === 'active',
    );
    if (hasActiveOrder) continue;
    const recipe = findRecipeForIndustry(company.industryId);
    if (!recipe) continue;
    const missing = recipe.inputs
      .filter((inp) => {
        const qty = profile.inventory.find((lot) => lot.materialOrProductId === inp.materialId)?.quantity ?? 0;
        return qty < inp.quantity;
      })
      .map((inp) => {
        const mat = findMaterial(inp.materialId);
        const have = profile.inventory.find((lot) => lot.materialOrProductId === inp.materialId)?.quantity ?? 0;
        return `${mat?.name ?? inp.materialId} (${have}/${inp.quantity})`;
      });
    if (missing.length > 0) {
      missingMaterialsSummary.push({
        companyName: company.name,
        companyId: company.id,
        materials: missing,
      });
    }
  }

  for (const item of missingMaterialsSummary) {
    alerts.push({
      id: `emp-alert-raw-shortage-${item.companyId}`,
      category: 'inventory',
      severity: 'warning',
      title: `نقص مخزون الخامات لتشغيل «${item.companyName}»`,
      detail: `الخامات الناقصة في المستودع: ${item.materials.join('، ')}.`,
      facilityId: item.companyId,
      facilityName: item.companyName,
      recommendedActionLabel: 'شراء خامات من السوق',
      targetSection: 'inventory',
    });
  }

  // 6. Retail Shop Empty Shelves
  for (const shop of profile.shops ?? []) {
    if (shop.status !== 'active') continue;
    const shelfQty = shop.inventory.reduce((sum, i) => sum + i.quantity, 0);
    if (shelfQty <= 0) {
      alerts.push({
        id: `emp-alert-shop-empty-${shop.id}`,
        category: 'inventory',
        severity: 'warning',
        title: `نفاد البضائع من أرفف «${shop.name}»`,
        detail: 'المحل مفتوح ويدفع مصاريف تشغيل دون بضائع معروضة للبيع.',
        facilityId: shop.id,
        facilityName: shop.name,
        recommendedActionLabel: 'توفير منتجات في المستودع',
        targetSection: 'inventory',
      });
    }
  }

  // 7. Contracts Approaching Deadline with Insufficient Finished Stock
  for (const contract of profile.contracts) {
    if (contract.status !== 'active') continue;
    const daysLeft = contract.deadlineDay - profile.day;
    const stock = profile.inventory.find((lot) => lot.materialOrProductId === contract.productId)?.quantity ?? 0;
    if (daysLeft <= 2 && stock < contract.quantity) {
      alerts.push({
        id: `emp-alert-contract-stock-${contract.id}`,
        category: 'inventory',
        severity: daysLeft <= 1 ? 'critical' : 'warning',
        title: `عقد «${contract.clientName}» مهدد بنقص المخزون`,
        detail: `المطلوب ${contract.quantity} من ${contract.productName} قبل اليوم ${contract.deadlineDay} · المتوفر بالمخزن: ${stock}.`,
        recommendedActionLabel: 'متابعة العقود والإنتاج',
        targetSection: 'contracts',
      });
    }
  }

  return alerts;
}

export { RETAIL_SHOP_SPECS };
