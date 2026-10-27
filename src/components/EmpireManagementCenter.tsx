import { useMemo, useState } from 'react';
import {
  COUNTRIES,
  findCountry,
  type CountryDefinition,
  type CountryId,
  type IndustryId,
} from '../domain/countries';
import { findShopSpec, RETAIL_SHOP_SPECS, type RetailShopType } from '../domain/branchAndShop';
import {
  getCitiesForCountry,
  type CityExpansionFacilityKind,
  type CityExpansionRequest,
  type EmpireFacilityKind,
  type FacilityOperationalState,
} from '../domain/empireExpansion';
import { formatMoney, formatNumber } from '../domain/formatters';
import type { SectionId } from '../domain/navigation';
import type { PlayerProfile } from '../domain/player';
import { transferStockToShop } from '../game/branchShopEngine';
import { INDUSTRY_CATALOG } from '../game/catalog';
import {
  activateReadyEmpireFacilities,
  assignStaffToEmpireFacility,
  buildExpansionOperationId,
  evaluateCountryExpansion,
  executeCityExpansion,
  getEmpireExpansionState,
  getStaffAssignmentTargets,
  previewCityExpansion,
  registerCountryExpansionIntent,
  selectEmpireAdminReport,
  selectEmpireOperationalAlerts,
  selectUnifiedEmpireFacilities,
} from '../game/empireExpansionEngine';
import {
  payStaffSalary,
  serviceCompany,
  type GameCommand,
  type GameResult,
} from '../game/engine';
import { Icon } from './Icon';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Coins,
  Crown,
  Factory,
  FileBarChart2,
  Globe2,
  Landmark,
  Lock,
  MapPin,
  ShieldAlert,
  Store,
  Users,
  Wrench,
  XCircle,
} from 'lucide-react';

type EmpireCenterTab =
  | 'facilities'
  | 'city_expansion'
  | 'country_expansion'
  | 'admin_reports'
  | 'staff'
  | 'alerts';

interface EmpireManagementCenterProps {
  profile: PlayerProfile;
  country: CountryDefinition;
  focus?: string;
  onNavigate: (section: SectionId) => void;
  onAction: (result: GameResult<unknown>) => void;
  onCommand: (command: GameCommand, fallback: (current: PlayerProfile) => GameResult<unknown>) => void;
}

const ROLE_LABELS: Record<string, string> = {
  manager: 'مدير منشأة',
  foreman: 'رئيس عمال ومشرف خط',
  accountant: 'محاسب مالي',
  lawyer: 'مستشار قانوني',
  hr: 'مدير موارد بشرية',
  cfo: 'مدير مالي تنفيذي (CFO)',
  general_manager: 'مدير عام تنفيذي (CEO)',
  operations_director: 'مدير عمليات (COO)',
};

export function EmpireManagementCenter({
  profile,
  country,
  focus,
  onNavigate,
  onAction,
  onCommand,
}: EmpireManagementCenterProps) {
  const initialTab: EmpireCenterTab =
    focus === 'alerts'
      ? 'alerts'
      : focus === 'reports'
        ? 'admin_reports'
        : focus === 'staff'
          ? 'staff'
          : focus === 'expand'
            ? 'city_expansion'
            : 'facilities';

  const [activeTab, setActiveTab] = useState<EmpireCenterTab>(initialTab);
  const [kindFilter, setKindFilter] = useState<'all' | EmpireFacilityKind>('all');
  const [stateFilter, setStateFilter] = useState<'all' | FacilityOperationalState>('all');

  // Inter-City Expansion Form State
  const countryCities = useMemo(() => getCitiesForCountry(profile.countryId), [profile.countryId]);
  const [selectedCityId, setSelectedCityId] = useState<string>(
    () => countryCities[1]?.id ?? countryCities[0]?.id ?? '',
  );
  const [expansionKind, setExpansionKind] = useState<CityExpansionFacilityKind>('branch');
  const [parentCompanyId, setParentCompanyId] = useState<string>(
    () => profile.companies[0]?.id ?? '',
  );
  const [selectedIndustryId, setSelectedIndustryId] = useState<IndustryId>('food');
  const [selectedShopType, setSelectedShopType] = useState<RetailShopType>('groceries');
  const [customFacilityName, setCustomFacilityName] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'diamonds'>('cash');
  const [confirmingRequest, setConfirmingRequest] = useState<CityExpansionRequest | null>(null);
  const [submittingOpId, setSubmittingOpId] = useState<string | null>(null);

  // Inter-Country Expansion State
  const foreignCountries = useMemo(
    () => COUNTRIES.filter((c) => c.id !== profile.countryId),
    [profile.countryId],
  );
  const [targetCountryId, setTargetCountryId] = useState<CountryId>(
    () => foreignCountries[0]?.id ?? 'saudi',
  );
  const targetCountryCities = useMemo(
    () => getCitiesForCountry(targetCountryId),
    [targetCountryId],
  );
  const [targetForeignCityId, setTargetForeignCityId] = useState<string>(
    () => getCitiesForCountry(foreignCountries[0]?.id ?? 'saudi')[0]?.id ?? '',
  );
  const [foreignActivityKind, setForeignActivityKind] =
    useState<CityExpansionFacilityKind>('factory');
  const [foreignIndustryId, setForeignIndustryId] = useState<IndustryId>('food');
  const [foreignShopType, setForeignShopType] = useState<RetailShopType>('groceries');

  // Derived real data
  const facilities = useMemo(() => selectUnifiedEmpireFacilities(profile), [profile]);
  const adminReport = useMemo(() => selectEmpireAdminReport(profile), [profile]);
  const alerts = useMemo(() => selectEmpireOperationalAlerts(profile), [profile]);
  const expState = useMemo(() => getEmpireExpansionState(profile), [profile]);
  const staffTargets = useMemo(() => getStaffAssignmentTargets(profile), [profile]);

  const counts = useMemo(() => {
    const companies = facilities.filter((f) => f.kind === 'company').length;
    const branches = facilities.filter((f) => f.kind === 'branch').length;
    const shops = facilities.filter((f) => f.kind === 'shop').length;
    const lands = facilities.filter((f) => f.kind === 'land').length;
    const active = facilities.filter((f) => f.operationalState === 'active').length;
    const halted = facilities.filter((f) => f.operationalState === 'halted').length;
    const constructing = facilities.filter((f) => f.operationalState === 'constructing').length;
    return { companies, branches, shops, lands, active, halted, constructing };
  }, [facilities]);

  const readyToActivateCount = useMemo(() => {
    const readyBranches = (profile.branches ?? []).filter(
      (b) => b.status === 'constructing' && profile.day > b.establishedOnDay,
    ).length;
    const readyShops = (profile.shops ?? []).filter(
      (s) => s.status === 'constructing' && profile.day > s.establishedOnDay,
    ).length;
    return readyBranches + readyShops;
  }, [profile.branches, profile.shops, profile.day]);

  const filteredFacilities = useMemo(() => {
    return facilities.filter((item) => {
      if (kindFilter !== 'all' && item.kind !== kindFilter) return false;
      if (stateFilter !== 'all' && item.operationalState !== stateFilter) return false;
      return true;
    });
  }, [facilities, kindFilter, stateFilter]);

  // Stable Operation ID for current draft
  const draftOperationId = useMemo(() => {
    const subType =
      expansionKind === 'factory'
        ? selectedIndustryId
        : expansionKind === 'shop'
          ? selectedShopType
          : parentCompanyId || 'none';
    const seq = expState.operationsLog.length + 1;
    return buildExpansionOperationId({
      countryId: profile.countryId,
      cityId: selectedCityId,
      kind: expansionKind,
      subType,
      day: profile.day,
      sequenceHint: seq,
    });
  }, [
    profile.countryId,
    selectedCityId,
    expansionKind,
    selectedIndustryId,
    selectedShopType,
    parentCompanyId,
    profile.day,
    expState.operationsLog.length,
  ]);

  const draftRequest: CityExpansionRequest = useMemo(
    () => ({
      operationId: draftOperationId,
      cityId: selectedCityId,
      kind: expansionKind,
      customName: customFacilityName.trim() || undefined,
      paymentMethod,
      parentCompanyId:
        expansionKind === 'branch'
          ? parentCompanyId || profile.companies[0]?.id
          : expansionKind === 'shop' && parentCompanyId
            ? parentCompanyId
            : undefined,
      industryId: expansionKind === 'factory' ? selectedIndustryId : undefined,
      shopType: expansionKind === 'shop' ? selectedShopType : undefined,
    }),
    [
      draftOperationId,
      selectedCityId,
      expansionKind,
      customFacilityName,
      paymentMethod,
      parentCompanyId,
      profile.companies,
      selectedIndustryId,
      selectedShopType,
    ],
  );

  const cityPreview = useMemo(
    () => previewCityExpansion(profile, draftRequest),
    [profile, draftRequest],
  );

  const countryAssessment = useMemo(
    () =>
      evaluateCountryExpansion(
        profile,
        targetCountryId,
        targetForeignCityId,
        foreignActivityKind,
        { industryId: foreignIndustryId, shopType: foreignShopType },
      ),
    [
      profile,
      targetCountryId,
      targetForeignCityId,
      foreignActivityKind,
      foreignIndustryId,
      foreignShopType,
    ],
  );

  const handleConfirmCityExpansion = () => {
    if (!confirmingRequest) return;
    if (submittingOpId === confirmingRequest.operationId) return;
    setSubmittingOpId(confirmingRequest.operationId);
    try {
      const result = executeCityExpansion(profile, confirmingRequest);
      onAction(result);
      if (result.ok) {
        setConfirmingRequest(null);
        setCustomFacilityName('');
      }
    } finally {
      setSubmittingOpId(null);
    }
  };

  const stateBadge = (state: FacilityOperationalState, label: string) => {
    if (state === 'active') {
      return (
        <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {label}
        </span>
      );
    }
    if (state === 'halted') {
      return (
        <span className="inline-flex items-center gap-1 rounded-lg border border-rose-500/45 bg-rose-500/15 px-2.5 py-1 text-xs font-bold text-rose-300">
          <XCircle className="h-3.5 w-3.5" />
          {label}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-lg border border-amber-500/45 bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-300">
        <Wrench className="h-3.5 w-3.5" />
        {label}
      </span>
    );
  };

  const activeStaff = profile.staff.filter((s) => s.status === 'active');

  return (
    <div className="space-y-5 text-slate-100" dir="rtl">
      {/* Imperial Command Summary Strip */}
      <div className="rounded-2xl border border-amber-500/35 bg-gradient-to-l from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-5 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/90 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-400/45 bg-amber-500/15 text-amber-400 shadow-inner">
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-wide text-amber-400">
                غرفة القيادة الاستراتيجية الموحدة · {country.flag} {country.name}
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white">
                مركز إدارة وتوسّع الإمبراطورية
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {readyToActivateCount > 0 && (
              <button
                type="button"
                onClick={() => onAction(activateReadyEmpireFacilities(profile))}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-black text-slate-950 shadow-lg hover:bg-emerald-400 transition cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                تفعيل المنشآت المكتملة ({formatNumber(readyToActivateCount)})
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('city_expansion')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-black text-slate-950 shadow-lg hover:bg-amber-400 transition cursor-pointer"
            >
              <MapPin className="h-4 w-4" />
              فتح توسّع في مدينة جديدة
            </button>
          </div>
        </div>

        {/* Asset & Operational Status Metrics */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-right">
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
            <span className="block text-[11px] text-slate-400">الشركات والمصانع</span>
            <strong className="text-base font-black text-white">
              {formatNumber(counts.companies)}
            </strong>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
            <span className="block text-[11px] text-slate-400">الفروع الإقليمية</span>
            <strong className="text-base font-black text-white">
              {formatNumber(counts.branches)}
            </strong>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
            <span className="block text-[11px] text-slate-400">المحلات التجارية</span>
            <strong className="text-base font-black text-white">
              {formatNumber(counts.shops)}
            </strong>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
            <span className="block text-[11px] text-slate-400">الأراضي المملوكة</span>
            <strong className="text-base font-black text-white">
              {formatNumber(counts.lands)}
            </strong>
          </div>
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/25 p-3">
            <span className="block text-[11px] text-emerald-300">منشآت عاملة</span>
            <strong className="text-base font-black text-emerald-300">
              {formatNumber(counts.active)}
            </strong>
          </div>
          <div className="rounded-xl border border-rose-500/30 bg-rose-950/25 p-3">
            <span className="block text-[11px] text-rose-300">منشآت متوقفة</span>
            <strong className="text-base font-black text-rose-300">
              {formatNumber(counts.halted)}
            </strong>
          </div>
          <div className="rounded-xl border border-amber-500/30 bg-amber-950/25 p-3 col-span-2 sm:col-span-1">
            <span className="block text-[11px] text-amber-300">تحت الإنشاء</span>
            <strong className="text-base font-black text-amber-300">
              {formatNumber(counts.constructing)}
            </strong>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 p-2">
        {[
          {
            id: 'facilities' as const,
            label: 'المنشآت وحالتها',
            icon: <Building2 className="h-4 w-4" />,
            badge: facilities.length,
          },
          {
            id: 'city_expansion' as const,
            label: 'التوسّع بين المدن',
            icon: <MapPin className="h-4 w-4" />,
            badge: countryCities.length,
          },
          {
            id: 'country_expansion' as const,
            label: 'التوسّع بين الدول',
            icon: <Globe2 className="h-4 w-4" />,
          },
          {
            id: 'admin_reports' as const,
            label: 'التقارير الإدارية',
            icon: <FileBarChart2 className="h-4 w-4" />,
          },
          {
            id: 'staff' as const,
            label: 'إدارة وتوزيع الموظفين',
            icon: <Users className="h-4 w-4" />,
            badge: activeStaff.length,
          },
          {
            id: 'alerts' as const,
            label: 'التنبيهات التشغيلية',
            icon: <ShieldAlert className="h-4 w-4" />,
            badge: alerts.length,
            urgent: alerts.some((a) => a.severity === 'critical'),
          },
        ].map((tab) => {
          const isCurrent = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold transition cursor-pointer ${
                isCurrent
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-950/60 text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[11px] font-black ${
                    isCurrent
                      ? 'bg-slate-950/20 text-slate-950'
                      : tab.urgent
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-800 text-amber-300'
                  }`}
                >
                  {formatNumber(tab.badge)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: UNIFIED FACILITIES & OPERATIONAL STATUS */}
      {activeTab === 'facilities' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-400 ml-1">النوع:</span>
              {(
                [
                  { id: 'all', label: 'الكل' },
                  { id: 'company', label: 'الشركات والمصانع' },
                  { id: 'branch', label: 'الفروع' },
                  { id: 'shop', label: 'المحلات' },
                  { id: 'land', label: 'الأراضي' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setKindFilter(opt.id)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                    kindFilter === opt.id
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-amber-500/40'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-400 ml-1">الحالة:</span>
              {(
                [
                  { id: 'all', label: 'كل الحالات' },
                  { id: 'active', label: 'عاملة' },
                  { id: 'halted', label: 'متوقفة' },
                  { id: 'constructing', label: 'تحت الإنشاء' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setStateFilter(opt.id)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                    stateFilter === opt.id
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-amber-500/40'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {filteredFacilities.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center">
              <p className="text-sm font-bold text-slate-300">
                لا توجد منشآت مطابقة لفلتر البحث الحالي.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
              {filteredFacilities.map((facility) => {
                const kindIcon =
                  facility.kind === 'company' ? (
                    <Factory className="h-5 w-5 text-amber-400" />
                  ) : facility.kind === 'branch' ? (
                    <Building2 className="h-5 w-5 text-cyan-400" />
                  ) : facility.kind === 'shop' ? (
                    <Store className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <Landmark className="h-5 w-5 text-amber-300" />
                  );

                const compatibleStockForShop =
                  facility.kind === 'shop' && facility.shopType
                    ? (() => {
                        const spec = findShopSpec(facility.shopType);
                        if (!spec) return undefined;
                        return profile.inventory.find(
                          (lot) =>
                            spec.compatibleProductIds.includes(lot.materialOrProductId)
                            && lot.quantity > 0,
                        );
                      })()
                    : undefined;

                return (
                  <article
                    key={`${facility.kind}-${facility.id}`}
                    className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-lg flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-950">
                            {kindIcon}
                          </div>
                          <div>
                            <h3 className="text-sm sm:text-base font-black text-white">
                              {facility.name}
                            </h3>
                            <p className="text-xs text-slate-400">{facility.subtitle}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-amber-300/90">
                              <span>📍 {facility.cityName}</span>
                              <span>· المستوى {formatNumber(facility.level)}</span>
                              {facility.dailyOperatingCost > 0 && (
                                <span>
                                  · تشغيل يومي {formatMoney(facility.dailyOperatingCost, country)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {stateBadge(facility.operationalState, facility.stateLabel)}
                      </div>

                      {/* Facility Technical Bars */}
                      {facility.kind === 'company' && (
                        <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-800 bg-slate-950/70 p-2.5 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[11px]">كفاءة المعدات</span>
                            <strong
                              className={
                                (facility.maintenanceCondition ?? 100) < 25
                                  ? 'text-rose-400 font-black'
                                  : (facility.maintenanceCondition ?? 100) < 60
                                    ? 'text-amber-300 font-bold'
                                    : 'text-emerald-300 font-bold'
                              }
                            >
                              {formatNumber(Math.round(facility.maintenanceCondition ?? 100))}%
                            </strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[11px]">وحدات الطاقة</span>
                            <strong className="text-cyan-300 font-bold">
                              {formatNumber(facility.energyUnits ?? 0)} /{' '}
                              {formatNumber(facility.energyCapacity ?? 0)}
                            </strong>
                          </div>
                        </div>
                      )}

                      {facility.kind === 'shop' && facility.shelfOccupancy && (
                        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-2.5 text-xs flex items-center justify-between">
                          <span className="text-slate-400">مخزون أرفف البيع بالتجزئة:</span>
                          <strong className="text-amber-300">
                            {formatNumber(facility.shelfOccupancy.used)} /{' '}
                            {formatNumber(facility.shelfOccupancy.capacity)} وحدة
                          </strong>
                        </div>
                      )}

                      {/* Explicit Halt / Construction Reasons */}
                      {facility.haltReasons.length > 0 && (
                        <div
                          className={`rounded-xl border p-2.5 text-xs space-y-1 ${
                            facility.operationalState === 'halted'
                              ? 'border-rose-500/35 bg-rose-950/30 text-rose-200'
                              : 'border-amber-500/35 bg-amber-950/25 text-amber-200'
                          }`}
                        >
                          <strong className="block font-bold">
                            {facility.operationalState === 'halted'
                              ? 'أسباب التوقف المسجلة:'
                              : 'حالة الإنشاء والتجهيز:'}
                          </strong>
                          {facility.haltReasons.map((reason, idx) => (
                            <p key={idx} className="leading-relaxed">
                              • {reason}
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Assigned Staff */}
                      {facility.kind !== 'land' && (
                        <div className="text-xs text-slate-300 flex flex-wrap items-center gap-1.5">
                          <span className="text-slate-400">الكادر المكلّف:</span>
                          {facility.assignedStaffNames.length > 0 ? (
                            facility.assignedStaffNames.map((label, i) => (
                              <span
                                key={i}
                                className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-200 font-semibold"
                              >
                                {label}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-500">بدون مدير مخصص حالياً</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Direct Facility Remedies & Shortcuts */}
                    <div className="flex flex-wrap items-center gap-2 border-t border-slate-800/80 pt-2.5">
                      {facility.kind === 'company' &&
                        (facility.maintenanceCondition ?? 100) < 95 && (
                          <button
                            type="button"
                            onClick={() =>
                              onCommand(
                                {
                                  name: 'service_company',
                                  args: { companyId: facility.id },
                                },
                                (curr) => serviceCompany(curr, facility.id),
                              )
                            }
                            className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-black text-slate-950 hover:bg-amber-400 transition cursor-pointer"
                          >
                            🔧 صيانة المصنع الآن
                          </button>
                        )}

                      {facility.kind === 'company' &&
                        facility.operationalState === 'active' && (
                          <button
                            type="button"
                            onClick={() => onNavigate('production')}
                            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition cursor-pointer"
                          >
                            فتح خط الإنتاج
                          </button>
                        )}

                      {facility.kind === 'company' &&
                        facility.haltReasons.some((r) => r.includes('خام')) && (
                          <button
                            type="button"
                            onClick={() => onNavigate('inventory')}
                            className="rounded-lg border border-amber-500/40 bg-amber-500/15 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/25 transition cursor-pointer"
                          >
                            شراء خامات من السوق
                          </button>
                        )}

                      {facility.kind === 'shop' &&
                        facility.operationalState !== 'constructing' &&
                        compatibleStockForShop && (
                          <button
                            type="button"
                            onClick={() => {
                              const freeSpace = Math.max(
                                0,
                                (facility.shelfOccupancy?.capacity ?? 150)
                                  - (facility.shelfOccupancy?.used ?? 0),
                              );
                              const qty = Math.min(compatibleStockForShop.quantity, freeSpace || 25);
                              if (qty > 0) {
                                onAction(
                                  transferStockToShop(
                                    profile,
                                    facility.id,
                                    compatibleStockForShop.materialOrProductId,
                                    qty,
                                  ),
                                );
                              }
                            }}
                            className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-black text-slate-950 hover:bg-emerald-400 transition cursor-pointer"
                          >
                            📦 تزويد الأرفف من المستودع
                          </button>
                        )}

                      {(facility.kind === 'branch' || facility.kind === 'shop') &&
                        facility.operationalState === 'constructing' &&
                        (facility.readyOnDay ?? profile.day + 1) <= profile.day && (
                          <button
                            type="button"
                            onClick={() => onAction(activateReadyEmpireFacilities(profile))}
                            className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-black text-slate-950 hover:bg-emerald-400 transition cursor-pointer"
                          >
                            تفعيل التشغيل الآن
                          </button>
                        )}

                      {facility.kind === 'land' && (
                        <button
                          type="button"
                          onClick={() => onNavigate('lands')}
                          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition cursor-pointer"
                        >
                          إدارة العقار
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INTER-CITY EXPANSION */}
      {activeTab === 'city_expansion' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-500/35 bg-slate-900/90 p-4 sm:p-5">
            <h3 className="text-base font-black text-amber-400 mb-1">
              1. اختر المدينة المستهدفة داخل {country.name}
            </h3>
            <p className="text-xs text-slate-300 mb-4">
              كل مدينة تمنح معامل طلب محلي وسعة منشآت وتكلفة أراضٍ حقيقية. تُعرض جميع المتطلبات والتكاليف قبل أي خصم.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {countryCities.map((city) => {
                const isSelected = city.id === selectedCityId;
                const cityUsed = facilities.filter(
                  (f) => f.kind !== 'land' && f.cityId === city.id,
                ).length;
                return (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => {
                      setSelectedCityId(city.id);
                      setConfirmingRequest(null);
                    }}
                    className={`rounded-2xl border p-3.5 text-right transition cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/15 shadow-lg shadow-amber-500/10'
                        : 'border-slate-800 bg-slate-950/75 hover:border-amber-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <strong className="text-sm font-black text-white">{city.name}</strong>
                      {city.isHomeHub ? (
                        <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                          المقر الأول
                        </span>
                      ) : (
                        <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                          مستوى {formatNumber(city.requiredLevel)}+
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mb-2">{city.regionLabel}</p>
                    <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-300 border-t border-slate-800/80 pt-2">
                      <span>أرض أساسية: {formatMoney(city.landBaseCost, country)}</span>
                      <span className="text-emerald-300 font-bold">
                        حافز طلب +{formatNumber(Math.round(city.demandBonusRate * 100))}%
                      </span>
                      <span>
                        الإشغال: {formatNumber(cityUsed)}/{formatNumber(city.maxFacilities)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Configure Facility & Inspect Requirements */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 space-y-4">
              <h3 className="text-base font-black text-white">
                2. حدّد نوع النشاط التوسعي في المدينة
              </h3>

              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'branch', label: 'فرع شركة', sub: 'يعزز عائد شركة مملوكة' },
                    { id: 'factory', label: 'مصنع إنتاجي', sub: 'أرض + ترخيص + خط إنتاج' },
                    { id: 'shop', label: 'محل تجزئة', sub: 'بيع مباشر للمستهلكين' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setExpansionKind(item.id);
                      setConfirmingRequest(null);
                    }}
                    className={`rounded-xl border p-3 text-right transition cursor-pointer ${
                      expansionKind === item.id
                        ? 'border-amber-400 bg-amber-500/15 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <strong className="block text-xs sm:text-sm font-black">{item.label}</strong>
                    <small className="text-[11px] text-slate-400">{item.sub}</small>
                  </button>
                ))}
              </div>

              {expansionKind === 'branch' && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    الشركة الأم المرتبط بها الفرع:
                  </label>
                  <select
                    value={parentCompanyId}
                    onChange={(e) => {
                      setParentCompanyId(e.target.value);
                      setConfirmingRequest(null);
                    }}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white"
                  >
                    {profile.companies.length === 0 ? (
                      <option value="">لا توجد شركات مملوكة حالياً</option>
                    ) : (
                      profile.companies.map((comp) => (
                        <option key={comp.id} value={comp.id}>
                          {comp.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              )}

              {expansionKind === 'factory' && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    القطاع الصناعي للمنشأة الجديدة:
                  </label>
                  <select
                    value={selectedIndustryId}
                    onChange={(e) => {
                      setSelectedIndustryId(e.target.value as IndustryId);
                      setConfirmingRequest(null);
                    }}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white"
                  >
                    {INDUSTRY_CATALOG.map((ind) => (
                      <option key={ind.id} value={ind.id}>
                        {ind.name} — تشغيل يومي أساسي {formatMoney(ind.dailyOperatingCost, country)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {expansionKind === 'shop' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      تخصص المحل التجاري:
                    </label>
                    <select
                      value={selectedShopType}
                      onChange={(e) => {
                        setSelectedShopType(e.target.value as RetailShopType);
                        setConfirmingRequest(null);
                      }}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white"
                    >
                      {RETAIL_SHOP_SPECS.map((spec) => (
                        <option key={spec.type} value={spec.type}>
                          {spec.title} (مستوى {spec.requiredPlayerLevel}+)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      ربط بمصنع مموّن (اختياري):
                    </label>
                    <select
                      value={parentCompanyId}
                      onChange={(e) => {
                        setParentCompanyId(e.target.value);
                        setConfirmingRequest(null);
                      }}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white"
                    >
                      <option value="">مستقل (توريد عام من المستودع)</option>
                      {profile.companies.map((comp) => (
                        <option key={comp.id} value={comp.id}>
                          {comp.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    اسم مخصص للمنشأة (اختياري):
                  </label>
                  <input
                    type="text"
                    maxLength={80}
                    value={customFacilityName}
                    onChange={(e) => setCustomFacilityName(e.target.value)}
                    placeholder="يُولَّد اسم رسمي تلقائياً عند تركه فارغاً"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    وسيلة السداد المعتمدة:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('cash');
                        setConfirmingRequest(null);
                      }}
                      className={`rounded-xl border py-2 px-3 text-xs font-bold cursor-pointer ${
                        paymentMethod === 'cash'
                          ? 'border-amber-400 bg-amber-500 text-slate-950'
                          : 'border-slate-700 bg-slate-950 text-slate-300'
                      }`}
                    >
                      نقداً من البنك
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('diamonds');
                        setConfirmingRequest(null);
                      }}
                      className={`rounded-xl border py-2 px-3 text-xs font-bold cursor-pointer ${
                        paymentMethod === 'diamonds'
                          ? 'border-cyan-400 bg-cyan-500 text-slate-950'
                          : 'border-slate-700 bg-slate-950 text-slate-300'
                      }`}
                    >
                      بالماس 💎
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Pre-Confirmation Cost & Requirements Verification Box */}
            <div className="lg:col-span-5 rounded-2xl border border-amber-500/40 bg-slate-950/95 p-4 sm:p-5 flex flex-col justify-between space-y-4">
              {cityPreview ? (
                <>
                  <div className="space-y-3">
                    <div className="border-b border-slate-800 pb-2.5">
                      <span className="text-[11px] font-bold text-amber-400">
                        بيان التكلفة والمتطلبات قبل التأكيد
                      </span>
                      <h4 className="text-sm font-black text-white mt-0.5">
                        {cityPreview.facilityLabel} — {cityPreview.city.name}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400">
                        معرّف التتبع: {draftRequest.operationId}
                      </span>
                    </div>

                    <div className="space-y-1.5 rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">تخصيص الأرض بالمدينة:</span>
                        <strong className="text-white">
                          {formatMoney(cityPreview.landCost, country)}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">تكلفة الإنشاء والتجهيز:</span>
                        <strong className="text-white">
                          {formatMoney(cityPreview.setupCost, country)}
                        </strong>
                      </div>
                      {cityPreview.licenseFee > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">رسوم إصدار ترخيص القطاع:</span>
                          <strong className="text-amber-300">
                            {formatMoney(cityPreview.licenseFee, country)}
                          </strong>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-slate-800 pt-2 text-sm">
                        <span className="font-bold text-amber-300">الإجمالي المطلوب:</span>
                        <strong className="font-black text-amber-400">
                          {paymentMethod === 'diamonds'
                            ? `${formatNumber(cityPreview.diamondCost)} ماسة 💎`
                            : formatMoney(cityPreview.totalCashCost, country)}
                        </strong>
                      </div>
                      {paymentMethod === 'cash' && (
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>الرصيد المتبقي بعد التنفيذ:</span>
                          <span
                            className={
                              cityPreview.remainingBalanceAfterCash >= 0
                                ? 'text-emerald-300 font-bold'
                                : 'text-rose-400 font-bold'
                            }
                          >
                            {formatMoney(Math.max(0, cityPreview.remainingBalanceAfterCash), country)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>المصروف التشغيلي اليومي المتوقع:</span>
                        <span className="text-slate-200 font-semibold">
                          {formatMoney(cityPreview.dailyOperatingCost, country)} / يوم
                        </span>
                      </div>
                    </div>

                    {/* Requirements Checklist */}
                    <div className="space-y-1.5">
                      <span className="block text-xs font-bold text-slate-300">
                        فحص المتطلبات الإلزامية:
                      </span>
                      {cityPreview.requirements.map((req) => (
                        <div
                          key={req.id}
                          className={`flex items-start gap-2 rounded-xl border p-2 text-xs ${
                            req.met
                              ? 'border-emerald-500/25 bg-emerald-950/20 text-emerald-200'
                              : 'border-rose-500/35 bg-rose-950/30 text-rose-200'
                          }`}
                        >
                          {req.met ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                          ) : (
                            <XCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                          )}
                          <div>
                            <strong className="block font-bold">{req.label}</strong>
                            <span className="text-[11px] opacity-90">{req.detail}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Two-Step Confirmation Control (Prevents Accidental or Duplicate Execution) */}
                  {!confirmingRequest ? (
                    <button
                      type="button"
                      disabled={!cityPreview.allRequirementsMet}
                      onClick={() => setConfirmingRequest(draftRequest)}
                      className={`w-full rounded-xl py-3 px-4 text-sm font-black transition ${
                        cityPreview.allRequirementsMet
                          ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/20 cursor-pointer'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      }`}
                    >
                      {cityPreview.allRequirementsMet
                        ? 'مراجعة وتأكيد افتتاح المنشأة'
                        : 'استوفِ المتطلبات أعلاه للمتابعة'}
                    </button>
                  ) : (
                    <div className="rounded-xl border border-amber-400 bg-amber-500/10 p-3 space-y-2.5">
                      <p className="text-xs font-bold text-amber-200">
                        تأكيد نهائي: سيتم خصم{' '}
                        {confirmingRequest.paymentMethod === 'diamonds'
                          ? `${formatNumber(cityPreview.diamondCost)} ماسة`
                          : formatMoney(cityPreview.totalCashCost, country)}{' '}
                        مرة واحدة فقط وتوثيق العملية بالمعرّف ({confirmingRequest.operationId}).
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={submittingOpId !== null}
                          onClick={handleConfirmCityExpansion}
                          className="rounded-xl bg-emerald-500 py-2 text-xs font-black text-slate-950 hover:bg-emerald-400 disabled:opacity-50 cursor-pointer"
                        >
                          {submittingOpId ? 'جارٍ التنفيذ...' : 'تأكيد الخصم والإنشاء ✓'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingRequest(null)}
                          className="rounded-xl border border-slate-700 bg-slate-900 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 cursor-pointer"
                        >
                          تراجع
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-slate-400">اختر مدينة صالحة لعرض التكلفة.</p>
              )}
            </div>
          </div>

          {/* Audit Log of Completed City Expansions */}
          {expState.operationsLog.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <h4 className="text-xs font-black text-amber-400 mb-2.5">
                سجل عمليات التوسع الموثقة بمعرّفات ثابتة ({formatNumber(expState.operationsLog.length)})
              </h4>
              <div className="space-y-2">
                {expState.operationsLog.slice(0, 6).map((op) => (
                  <div
                    key={op.operationId}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-950/75 px-3 py-2 text-xs"
                  >
                    <div>
                      <strong className="text-white">{op.facilityName}</strong>
                      <span className="text-slate-400 mr-2">
                        · {op.cityName} · اليوم {formatNumber(op.day)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[11px] text-slate-400">{op.operationId}</span>
                      <span className="font-bold text-amber-300">
                        {op.paymentMethod === 'diamonds'
                          ? `${formatNumber(op.diamondsSpent)} ماسة`
                          : formatMoney(op.amountPaidCash, country)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: INTER-COUNTRY EXPANSION GATEWAY */}
      {activeTab === 'country_expansion' && (
        <div className="space-y-4">
          {/* Explicit Disclosure Banner per Rule 3 */}
          <div className="rounded-2xl border border-amber-500/50 bg-amber-950/30 p-4 text-right">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-sm font-black text-amber-300">
                    {countryAssessment?.gateway.statusLabelAr}
                  </strong>
                  <span className="rounded-md border border-amber-400/40 bg-amber-500/20 px-2 py-0.5 text-[10px] font-black text-amber-200">
                    غير مكتمل تشغيلياً — واجهة ربط مجهزة
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {countryAssessment?.gateway.architecturalReasonAr}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Country & Activity Selector */}
            <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 space-y-4">
              <h3 className="text-base font-black text-white">
                محرك الجدوى والربط الدولي (الضرائب · الجمارك · العملات)
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {foreignCountries.map((fc) => {
                  const selected = fc.id === targetCountryId;
                  return (
                    <button
                      key={fc.id}
                      type="button"
                      onClick={() => {
                        setTargetCountryId(fc.id);
                        const firstCity = getCitiesForCountry(fc.id)[0];
                        if (firstCity) setTargetForeignCityId(firstCity.id);
                      }}
                      className={`rounded-xl border p-2.5 text-right transition cursor-pointer ${
                        selected
                          ? 'border-amber-400 bg-amber-500/15 text-white'
                          : 'border-slate-800 bg-slate-950/75 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span>
                          {fc.flag} {fc.name}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                        <span>{fc.currency.code}</span>
                        <span>ضريبة {Math.round(fc.economy.taxRate * 100)}%</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    المدينة المستهدفة في {findCountry(targetCountryId)?.name}:
                  </label>
                  <select
                    value={targetForeignCityId}
                    onChange={(e) => setTargetForeignCityId(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                  >
                    {targetCountryCities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.regionLabel})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    نوع النشاط المزمع فتحه مستقبلاً:
                  </label>
                  <select
                    value={foreignActivityKind}
                    onChange={(e) =>
                      setForeignActivityKind(e.target.value as CityExpansionFacilityKind)
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                  >
                    <option value="factory">مصنع إقليمي كامل</option>
                    <option value="branch">فرع تمثيل تجاري وتوزيع</option>
                    <option value="shop">منفذ بيع تجزئة دولي</option>
                  </select>
                </div>

                {foreignActivityKind === 'factory' && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      القطاع الصناعي:
                    </label>
                    <select
                      value={foreignIndustryId}
                      onChange={(e) => setForeignIndustryId(e.target.value as IndustryId)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                    >
                      {INDUSTRY_CATALOG.map((ind) => (
                        <option key={ind.id} value={ind.id}>
                          {ind.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {foreignActivityKind === 'shop' && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      تخصص متجر التجزئة:
                    </label>
                    <select
                      value={foreignShopType}
                      onChange={(e) => setForeignShopType(e.target.value as RetailShopType)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                    >
                      {RETAIL_SHOP_SPECS.map((sp) => (
                        <option key={sp.type} value={sp.type}>
                          {sp.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Missing Subsystem Contract List */}
              {countryAssessment && (
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 space-y-2">
                  <strong className="block text-xs font-black text-amber-400">
                    متطلبات الربط البرمجي المتبقية لتفعيل التشغيل الدولي المباشر:
                  </strong>
                  {countryAssessment.gateway.missingEngineCapabilities.map((cap) => (
                    <div key={cap.code} className="text-xs text-slate-300">
                      <span className="font-bold text-white">• {cap.title}: </span>
                      <span className="text-slate-400">{cap.description}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sovereign Tax, FX & Capital Assessment Card */}
            {countryAssessment && (
              <div className="lg:col-span-5 rounded-2xl border border-amber-500/35 bg-slate-950 p-4 sm:p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] font-bold text-amber-400">
                      تقدير الضرائب والعملات الحقيقي من نظام الدول
                    </span>
                    <h4 className="text-base font-black text-white">
                      {findCountry(countryAssessment.targetCountryId)?.flag}{' '}
                      {findCountry(countryAssessment.targetCountryId)?.name} —{' '}
                      {countryAssessment.targetCity.name}
                    </h4>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-2">
                      <span className="block text-[10px] text-slate-400">ضريبة المبيعات</span>
                      <strong className="text-amber-300">
                        {formatNumber(countryAssessment.taxRatePercent)}%
                      </strong>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-2">
                      <span className="block text-[10px] text-slate-400">الرسوم الجمركية</span>
                      <strong className="text-cyan-300">
                        {formatNumber(countryAssessment.customsRatePercent)}%
                      </strong>
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-900 p-2">
                      <span className="block text-[10px] text-slate-400">معامل التشغيل</span>
                      <strong className="text-white">
                        ×{countryAssessment.operatingCostMultiplier}
                      </strong>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">تكلفة الأرض والتأسيس والترخيص:</span>
                      <strong className="text-white">
                        {formatNumber(
                          countryAssessment.costsInUsd.landCost
                            + countryAssessment.costsInUsd.setupFee
                            + countryAssessment.costsInUsd.sovereignLicenseFee,
                        )}{' '}
                        $
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">احتياطي الجمارك السيادي:</span>
                      <strong className="text-white">
                        {formatNumber(countryAssessment.costsInUsd.customsReserve)} $
                      </strong>
                    </div>
                    <div className="border-t border-slate-800 pt-2 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-amber-300 font-bold">
                          بـ {countryAssessment.costsInTargetCurrency.currencyName}:
                        </span>
                        <strong className="text-amber-400 font-black">
                          {formatNumber(
                            countryAssessment.costsInTargetCurrency.totalInitialCapitalLocal,
                          )}{' '}
                          {countryAssessment.costsInTargetCurrency.currencySymbol} (
                          {countryAssessment.costsInTargetCurrency.currencyCode})
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">بعملة مقرك الحالي:</span>
                        <strong className="text-slate-200">
                          {formatMoney(countryAssessment.costsInUsd.totalInitialCapitalUsd, country)}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">التشغيل اليومي المقدر بالعملة المحلية:</span>
                        <span className="text-slate-300">
                          {formatNumber(
                            countryAssessment.costsInTargetCurrency.estimatedDailyOperatingLocal,
                          )}{' '}
                          {countryAssessment.costsInTargetCurrency.currencySymbol} / يوم
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {countryAssessment.readinessChecks.map((chk) => (
                      <div
                        key={chk.id}
                        className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-xs ${
                          chk.met
                            ? 'border-emerald-500/25 bg-emerald-950/20 text-emerald-200'
                            : 'border-slate-800 bg-slate-900 text-slate-400'
                        }`}
                      >
                        <span>{chk.label}</span>
                        <span className="font-bold">{chk.met ? 'مستوفى ✓' : 'غير مستوفى'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    disabled
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 px-4 text-xs font-bold text-slate-400 cursor-not-allowed"
                  >
                    🔒 التأسيس الفعلي المباشر (بانتظار استكمال نظام الخزائن متعددة العملات)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onAction(
                        registerCountryExpansionIntent(profile, {
                          intentId: `intl-${targetCountryId}-${targetForeignCityId}-d${profile.day}`,
                          targetCountryId,
                          targetCityId: targetForeignCityId,
                          activityKind: foreignActivityKind,
                          industryId: foreignIndustryId,
                          shopType: foreignShopType,
                        }),
                      )
                    }
                    className="w-full rounded-xl border border-amber-500/45 bg-amber-500/15 py-2.5 px-4 text-xs font-bold text-amber-300 hover:bg-amber-500/25 transition cursor-pointer"
                  >
                    حفظ ملف جدوى التوسع الدولي في السجل (دون خصم مالي)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ADMINISTRATIVE FINANCIAL REPORTS */}
      {activeTab === 'admin_reports' && (
        <div className="space-y-4">
          {/* Grand Totals Reconciled with Real Economy Ledger */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/90 p-4">
              <span className="block text-xs text-slate-400">إجمالي الإيرادات الفعلية المسجلة</span>
              <strong className="text-lg font-black text-emerald-300">
                {formatMoney(adminReport.grandTotal.revenue, country)}
              </strong>
            </div>
            <div className="rounded-2xl border border-rose-500/30 bg-slate-900/90 p-4">
              <span className="block text-xs text-slate-400">إجمالي المصروفات الفعلية المسجلة</span>
              <strong className="text-lg font-black text-rose-300">
                {formatMoney(adminReport.grandTotal.expenses, country)}
              </strong>
            </div>
            <div className="rounded-2xl border border-amber-500/35 bg-slate-900/90 p-4">
              <span className="block text-xs text-slate-400">صافي الربح المحاسبي الفعلي</span>
              <strong
                className={`text-lg font-black ${
                  adminReport.grandTotal.netProfit >= 0 ? 'text-amber-300' : 'text-rose-400'
                }`}
              >
                {adminReport.grandTotal.netProfit >= 0 ? '+' : '−'}
                {formatMoney(Math.abs(adminReport.grandTotal.netProfit), country)}
              </strong>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
              <span className="block text-xs text-slate-400">العبء التشغيلي والرواتب اليومي</span>
              <strong className="text-lg font-black text-white">
                {formatMoney(adminReport.dailyCommitments.totalDailyBurn, country)} / يوم
              </strong>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 overflow-x-auto">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-base font-black text-white">
                  تقرير أداء المنشآت التفصيلي (من واقع دفتر الأستاذ والمبيعات الفعلية)
                </h3>
                <p className="text-xs text-slate-400">
                  لا تُحتسب أي إيرادات تقديرية أو أرباح افتراضية؛ جميع الأرقام مستخرجة من العمليات الفعلية ومطابقة لإجمالي المالية.
                </p>
              </div>
              <span className="rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-300">
                {adminReport.grandTotal.reconciledWithLedger
                  ? '✓ مطابق 100% لدفتر الأستاذ العام'
                  : 'مراجعة دفتر الأستاذ'}
              </span>
            </div>

            <table className="w-full min-w-[680px] text-right text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-2">المنشأة والمدينة</th>
                  <th className="py-2.5 px-2">الحالة</th>
                  <th className="py-2.5 px-2">الإيرادات الفعلية</th>
                  <th className="py-2.5 px-2">المصروفات الفعلية</th>
                  <th className="py-2.5 px-2">صافي الربح / الخسارة</th>
                  <th className="py-2.5 px-2">التزام يومي (تشغيل + رواتب)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {adminReport.facilities.map((row) => (
                  <tr key={row.facilityId} className="hover:bg-slate-950/50">
                    <td className="py-3 px-2">
                      <strong className="block text-white font-bold">{row.facilityName}</strong>
                      <span className="text-[11px] text-slate-400">
                        {row.cityName} · {row.activitySummary}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                          row.operationalState === 'active'
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : row.operationalState === 'halted'
                              ? 'bg-rose-500/15 text-rose-300'
                              : 'bg-amber-500/15 text-amber-300'
                        }`}
                      >
                        {row.operationalState === 'active'
                          ? 'عاملة'
                          : row.operationalState === 'halted'
                            ? 'متوقفة'
                            : 'تحت الإنشاء'}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-bold text-emerald-300">
                      {formatMoney(row.revenue, country)}
                    </td>
                    <td className="py-3 px-2 font-bold text-rose-300">
                      {formatMoney(row.expenses, country)}
                    </td>
                    <td
                      className={`py-3 px-2 font-black ${
                        row.netProfit >= 0 ? 'text-amber-300' : 'text-rose-400'
                      }`}
                    >
                      {row.netProfit >= 0 ? '+' : '−'}
                      {formatMoney(Math.abs(row.netProfit), country)}
                    </td>
                    <td className="py-3 px-2 text-slate-300">
                      {formatMoney(
                        row.dailyOperatingCommitment + row.dailyStaffPayroll,
                        country,
                      )}{' '}
                      / يوم
                    </td>
                  </tr>
                ))}

                {/* Central Treasury Row */}
                <tr className="bg-slate-950/60">
                  <td className="py-3 px-2">
                    <strong className="block text-amber-200 font-bold">
                      الخزينة المركزية والعمليات المشتركة
                    </strong>
                    <span className="text-[11px] text-slate-400">
                      {adminReport.unallocatedTreasury.description}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-slate-400">مشترك</td>
                  <td className="py-3 px-2 font-bold text-emerald-300">
                    {formatMoney(adminReport.unallocatedTreasury.revenue, country)}
                  </td>
                  <td className="py-3 px-2 font-bold text-rose-300">
                    {formatMoney(adminReport.unallocatedTreasury.expenses, country)}
                  </td>
                  <td
                    className={`py-3 px-2 font-black ${
                      adminReport.unallocatedTreasury.netProfit >= 0
                        ? 'text-amber-300'
                        : 'text-rose-400'
                    }`}
                  >
                    {adminReport.unallocatedTreasury.netProfit >= 0 ? '+' : '−'}
                    {formatMoney(Math.abs(adminReport.unallocatedTreasury.netProfit), country)}
                  </td>
                  <td className="py-3 px-2 text-slate-400">—</td>
                </tr>

                {/* Grand Total Row */}
                <tr className="border-t-2 border-amber-500/40 bg-amber-500/10 text-sm">
                  <td className="py-3 px-2 font-black text-amber-300" colSpan={2}>
                    الإجمالي العام الموحد للإمبراطورية
                  </td>
                  <td className="py-3 px-2 font-black text-emerald-300">
                    {formatMoney(adminReport.grandTotal.revenue, country)}
                  </td>
                  <td className="py-3 px-2 font-black text-rose-300">
                    {formatMoney(adminReport.grandTotal.expenses, country)}
                  </td>
                  <td className="py-3 px-2 font-black text-amber-300">
                    {adminReport.grandTotal.netProfit >= 0 ? '+' : '−'}
                    {formatMoney(Math.abs(adminReport.grandTotal.netProfit), country)}
                  </td>
                  <td className="py-3 px-2 font-black text-white">
                    {formatMoney(adminReport.dailyCommitments.totalDailyBurn, country)} / يوم
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: STAFF DISTRIBUTION & MANAGEMENT */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
            <div>
              <h3 className="text-base font-black text-white">
                توزيع الموظفين والمديرين على المنشآت
              </h3>
              <p className="text-xs text-slate-400">
                يعتمد هذا التوزيع مباشرةً على عقود الموظفين الحالية في قسم الموارد البشرية دون إنشاء أي نظام رواتب مكرر.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('staff')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-black text-slate-950 hover:bg-amber-400 transition cursor-pointer"
            >
              <Coins className="h-4 w-4" />
              تعيين موظفين جدد أو ترقيتهم
            </button>
          </div>

          {activeStaff.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-center space-y-3">
              <p className="text-sm font-bold text-slate-200">
                لا يوجد موظفون أو مديرون نشطون في إمبراطوريتك حالياً.
              </p>
              <p className="text-xs text-slate-400">
                عيّن مدير مصنع أو رئيس عمال من قسم «الإدارة والرواتب» لتوزيعهم على المصانع والفروع والمحلات.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('staff')}
                className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-black text-slate-950 hover:bg-amber-400 cursor-pointer"
              >
                الانتقال لقسم الإدارة والرواتب
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {activeStaff.map((member) => {
                const explicitTarget = expState.facilityStaffAssignments[member.id];
                const branchMatch = (profile.branches ?? []).find(
                  (b) => b.managerStaffId === member.id,
                )?.id;
                const currentTargetId = explicitTarget ?? branchMatch ?? member.companyId ?? 'hq';
                const canAssignToFieldFacility =
                  member.role === 'manager' || member.role === 'foreman';

                return (
                  <div
                    key={member.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <strong className="text-sm font-black text-white block">
                          {member.name}
                        </strong>
                        <span className="text-xs text-amber-300 font-semibold">
                          {ROLE_LABELS[member.role] ?? member.role} · المستوى{' '}
                          {formatNumber(member.level ?? 1)}
                        </span>
                      </div>
                      <div className="text-left text-xs">
                        <span className="block text-slate-400">الراتب اليومي الحالي</span>
                        <strong className="text-white">
                          {formatMoney(member.dailySalary, country)}
                        </strong>
                      </div>
                    </div>

                    {(member.unpaidSalary ?? 0) > 0 && (
                      <div className="flex items-center justify-between rounded-xl border border-rose-500/40 bg-rose-950/35 px-3 py-2 text-xs text-rose-200">
                        <span>راتب متأخر: {formatMoney(member.unpaidSalary ?? 0, country)}</span>
                        <button
                          type="button"
                          onClick={() =>
                            onCommand(
                              { name: 'pay_staff_salary', args: { staffId: member.id } },
                              (curr) => payStaffSalary(curr, member.id),
                            )
                          }
                          className="rounded-lg bg-rose-500 px-2.5 py-1 text-[11px] font-black text-white hover:bg-rose-400 cursor-pointer"
                        >
                          سداد الآن
                        </button>
                      </div>
                    )}

                    {canAssignToFieldFacility ? (
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          تخصيص المنشأة المسندة إليه:
                        </label>
                        <select
                          value={currentTargetId}
                          onChange={(e) =>
                            onAction(
                              assignStaffToEmpireFacility(profile, member.id, e.target.value),
                            )
                          }
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                        >
                          {staffTargets.map((target) => (
                            <option key={target.targetId} value={target.targetId}>
                              {target.targetName} ({target.cityName})
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-slate-300">
                        يعمل من <strong>المقر الرئيسي للإمبراطورية</strong> ويغطي جميع الشركات والمنشآت تلقائياً.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: ACTIONABLE OPERATIONAL ALERTS */}
      {activeTab === 'alerts' && (
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-8 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400 mb-2" />
              <h3 className="text-base font-black text-white">
                لا توجد تنبيهات حرجة — جميع سلاسل الإمداد والالتزامات مستقرة
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                المخزون الكافي متوفر، ولا توجد متأخرات مالية أو مصانع متوقفة حالياً.
              </p>
            </div>
          ) : (
            alerts.map((alert) => {
              const categoryLabel =
                alert.category === 'inventory'
                  ? 'المخزون والإمداد'
                  : alert.category === 'production'
                    ? 'الإنتاج والمصانع'
                    : 'الالتزامات المالية';

              return (
                <div
                  key={alert.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-4 ${
                    alert.severity === 'critical'
                      ? 'border-rose-500/45 bg-rose-950/30'
                      : 'border-amber-500/40 bg-amber-950/25'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      className={`h-5 w-5 shrink-0 mt-0.5 ${
                        alert.severity === 'critical' ? 'text-rose-400' : 'text-amber-400'
                      }`}
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-slate-950/70 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                          {categoryLabel}
                        </span>
                        <strong className="text-sm font-black text-white">{alert.title}</strong>
                      </div>
                      <p className="mt-1 text-xs text-slate-200 leading-relaxed">{alert.detail}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {alert.id.startsWith('emp-alert-maint-halt-') && alert.facilityId ? (
                      <button
                        type="button"
                        onClick={() =>
                          onCommand(
                            {
                              name: 'service_company',
                              args: { companyId: alert.facilityId! },
                            },
                            (curr) => serviceCompany(curr, alert.facilityId!),
                          )
                        }
                        className="rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-black text-slate-950 hover:bg-amber-400 transition cursor-pointer"
                      >
                        🔧 صيانة فورية
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onNavigate(alert.targetSection)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-black text-slate-950 hover:bg-amber-400 transition cursor-pointer"
                      >
                        <span>{alert.recommendedActionLabel}</span>
                        <Icon name="arrow" size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
