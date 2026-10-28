import React, { useState, useId } from 'react';
import {
  Users,
  Briefcase,
  UserPlus,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Building,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Sparkles,
  BarChart3,
  Flame,
  ArrowUpRight,
  UserCheck,
  Zap,
  Award,
  Trash2,
} from 'lucide-react';
import type { PlayerProfile } from '../domain/player';
import type { CountryDefinition } from '../domain/countries';
import type { StaffContract, StaffRole, AutomationDirectives } from '../domain/futureSystems';
import {
  STAFF_ROLE_OPTIONS,
  staffLevel,
  staffExperience,
  getStaffUpgradeCost,
  hireStaff,
  upgradeStaff,
  payStaffSalary,
  terminateStaff,
  updateAutomationDirectives,
  getCompanyStaffingAnalysis,
  type GameCommandHandler,
} from '../game/engine';
import { formatMoney, formatNumber } from '../domain/formatters';
import { StaffAcademyBuilding } from './StaffAcademyBuilding';

interface StaffManagementViewProps {
  profile: PlayerProfile;
  country: CountryDefinition;
  onCommand: GameCommandHandler;
  onOpenFinancialReports?: () => void;
  onHome: () => void;
}

export const StaffManagementView: React.FC<StaffManagementViewProps> = ({
  profile,
  country,
  onCommand,
  onOpenFinancialReports,
  onHome,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'executive' | 'advisory' | 'operations'>('all');
  const [showHireModal, setShowHireModal] = useState(false);
  const [selectedRoleToHire, setSelectedRoleToHire] = useState<StaffRole>('foreman');
  const [hireName, setHireName] = useState('');
  const [hireCompanyId, setHireCompanyId] = useState('');
  const [showDirectivesModal, setShowDirectivesModal] = useState(false);
  const [confirmTerminateId, setConfirmTerminateId] = useState<string | null>(null);

  const activeStaff = profile.staff.filter((m) => m.status === 'active');
  const totalPayroll = activeStaff.reduce((sum, m) => sum + m.dailySalary, 0);
  const overdueStaff = activeStaff.filter((m) => (m.unpaidSalary ?? 0) > 0);
  const totalArrears = overdueStaff.reduce((sum, m) => sum + (m.unpaidSalary ?? 0), 0);

  const hasGeneralManager = activeStaff.some((m) => m.role === 'general_manager');
  const hasOperationsDirector = activeStaff.some((m) => m.role === 'operations_director');
  const hasCFO = activeStaff.some((m) => m.role === 'cfo');
  const hasAccountant = activeStaff.some((m) => m.role === 'accountant');
  const hasLawyer = activeStaff.some((m) => m.role === 'lawyer');
  const hasHR = activeStaff.some((m) => m.role === 'hr');

  const directives: AutomationDirectives = profile.automationDirectives ?? {
    autoPaySalaries: false,
    autoPurchaseMaterials: false,
    autoPurchaseThreshold: 50,
    autoPurchaseBudget: 50_000,
    autoRunProduction: false,
    autoProduceCompanyIds: [],
  };

  const handleToggleDirective = (key: keyof AutomationDirectives, value: any) => {
    const updated = { ...directives, [key]: value };
    onCommand(
      { name: 'update_automation_directives', args: { directives: updated } },
      (curr) => updateAutomationDirectives(curr, updated),
    );
  };

  const handleHireSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hireName.trim().length < 2) return;
    const option = STAFF_ROLE_OPTIONS[selectedRoleToHire];
    if (option.companyRequired && !hireCompanyId) return;

    onCommand(
      {
        name: 'hire_staff',
        args: {
          role: selectedRoleToHire,
          name: hireName.trim(),
          companyId: option.companyRequired ? hireCompanyId : undefined,
        },
      },
      (curr) =>
        hireStaff(
          curr,
          selectedRoleToHire,
          hireName.trim(),
          option.companyRequired ? hireCompanyId : undefined,
        ),
    );

    setHireName('');
    setShowHireModal(false);
  };

  const getRoleCategory = (role: StaffRole): 'executive' | 'advisory' | 'operations' => {
    if (role === 'general_manager' || role === 'operations_director' || role === 'cfo') return 'executive';
    if (role === 'accountant' || role === 'lawyer' || role === 'hr') return 'advisory';
    return 'operations';
  };

  const filteredStaff = profile.staff.filter((m) => {
    if (activeTab === 'all') return true;
    return getRoleCategory(m.role) === activeTab;
  });

  const getInitials = (name: string) => {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0] ?? '')
      .join('');
  };

  const getCompanyLabel = (companyId?: string) => {
    if (!companyId) return 'الإدارة العامة والمقر الرئيسي';
    const comp = profile.companies.find((c) => c.id === companyId);
    return comp ? comp.name : 'شركة تابعة';
  };

  const hrMember = activeStaff.find((m) => m.role === 'hr');
  const hrDiscountRate = hrMember ? Math.min(0.32, 0.20 + (staffLevel(hrMember) - 1) * 0.03) : 0;
  const staffBuildingLevel = activeStaff.reduce((highest, member) => Math.max(highest, staffLevel(member)), 1);

  return (
    <div className="space-y-5 animate-fade-in text-slate-100" dir="rtl">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/60 border border-indigo-500/30 p-5 sm:p-7 shadow-2xl">
        <div className="absolute top-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-indigo-500/25">
              <Users className="w-7 h-7 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  منظومة القيادة التنفيذية والموظفين
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-bold">
                  {activeStaff.length} موظف نشط
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                عيّن كبار التنفيذيين، فوّض المهام الروتينية، وأتمت خطوط الإنتاج والرواتب تلقائياً.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {onOpenFinancialReports && (hasCFO || hasAccountant || profile.level >= 5) && (
              <button
                type="button"
                onClick={onOpenFinancialReports}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition cursor-pointer"
              >
                <BarChart3 className="w-4 h-4" />
                <span>التقارير المالية والذكاء المحاسبي</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowHireModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black text-xs shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>تعيين كادر جديد</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800">
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-0.5">إجمالي الرواتب اليومية</span>
            <strong className="text-base font-black text-indigo-400">
              {formatMoney(totalPayroll, country)}
            </strong>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-0.5">المستحقات المتأخرة</span>
            <strong className={`text-base font-black ${totalArrears > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {totalArrears > 0 ? `${formatMoney(totalArrears, country)} ⚠️` : 'منتظمة بالكامل ✓'}
            </strong>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-0.5">تفويض المدير التنفيذي</span>
            <strong className="text-base font-black text-cyan-400">
              {hasGeneralManager ? (directives.autoPaySalaries ? 'مؤتمت نشط ⚡' : 'متاح للتفويض') : 'غير معيّن'}
            </strong>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-0.5">أتمتة تشغيل المصانع</span>
            <strong className="text-base font-black text-amber-400">
              {hasOperationsDirector ? (directives.autoRunProduction ? 'دوران متواصل ⚙️' : 'جاهز للتشغيل') : 'غير معيّن'}
            </strong>
          </div>
        </div>
      </div>

      <StaffAcademyBuilding level={staffBuildingLevel} activeStaffCount={activeStaff.length} />

      {/* 2. Automation Directives Panel (Executive Suite Control) */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>لوحة تفويضات الإدارة المؤتمتة (Directives)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                  تحكم ذكي
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                فوّض المهام الروتينية لمديرك التنفيذي ومدير التشغيل لتعمل الإمبراطورية دون توقف
              </p>
            </div>
          </div>

          {(!hasGeneralManager || !hasOperationsDirector) && (
            <button
              type="button"
              onClick={() => {
                setSelectedRoleToHire(!hasGeneralManager ? 'general_manager' : 'operations_director');
                setShowHireModal(true);
              }}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 transition"
            >
              <span>تعيين قيادة تنفيذية لتفعيل كامل الأتمتة</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Directive 1: Auto Pay Salaries */}
          <div className={`p-4 rounded-2xl border transition ${
            hasGeneralManager ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-950/40 border-slate-800/60 opacity-70'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                أتمتة سداد الرواتب
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!hasGeneralManager}
                  checked={Boolean(directives.autoPaySalaries)}
                  onChange={(e) => handleToggleDirective('autoPaySalaries', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
            <p className="text-[11px] text-slate-400">
              دفع رواتب الموظفين فور استحقاقها يومياً لتفادي توقف الطاقة وتعطل خطوط الإنتاج.
            </p>
            {!hasGeneralManager && (
              <small className="text-[10px] text-amber-400/90 block mt-2">
                🔒 يتطلب تعيين المدير التنفيذي المفوض (CEO).
              </small>
            )}
          </div>

          {/* Directive 2: Auto Purchase Raw Materials */}
          <div className={`p-4 rounded-2xl border transition ${
            hasGeneralManager ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-950/40 border-slate-800/60 opacity-70'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                أتمتة شراء الخامات
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!hasGeneralManager}
                  checked={Boolean(directives.autoPurchaseMaterials)}
                  onChange={(e) => handleToggleDirective('autoPurchaseMaterials', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>
            <p className="text-[11px] text-slate-400">
              إعادة شراء الخامات آلياً عندما يقل المخزون عن {directives.autoPurchaseThreshold || 50} وحدة بميزانية تصل إلى {formatMoney(directives.autoPurchaseBudget || 50000, country)}.
            </p>
            {hasGeneralManager && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[10px] text-slate-400">الحد الأدنى:</span>
                <select
                  value={directives.autoPurchaseThreshold || 50}
                  onChange={(e) => handleToggleDirective('autoPurchaseThreshold', Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 rounded-lg text-xs p-1 text-slate-200"
                >
                  <option value={20}>20 وحدة</option>
                  <option value={50}>50 وحدة</option>
                  <option value={100}>100 وحدة</option>
                  <option value={200}>200 وحدة</option>
                </select>
              </div>
            )}
            {!hasGeneralManager && (
              <small className="text-[10px] text-amber-400/90 block mt-2">
                🔒 يتطلب تعيين المدير التنفيذي المفوض (CEO).
              </small>
            )}
          </div>

          {/* Directive 3: Auto Run Continuous Production */}
          <div className={`p-4 rounded-2xl border transition ${
            hasOperationsDirector ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-950/40 border-slate-800/60 opacity-70'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                التشغيل الذاتي للمصانع
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!hasOperationsDirector}
                  checked={Boolean(directives.autoRunProduction)}
                  onChange={(e) => handleToggleDirective('autoRunProduction', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>
            <p className="text-[11px] text-slate-400">
              بدء دفعات إنتاج جديدة فور اكتمال الدورة السابقة تلقائياً طالما تتوفر الخامات والطاقة.
            </p>
            {!hasOperationsDirector && (
              <small className="text-[10px] text-amber-400/90 block mt-2">
                🔒 يتطلب تعيين مدير تشغيل المصانع (COO).
              </small>
            )}
          </div>
        </div>
      </div>

      {/* 2.5 Factory Staffing Analysis & Operational Health */}
      {profile.companies.length > 0 && (
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-black text-white">تغطية كوادر المصانع والشركات التابعة</h3>
            </div>
            <span className="text-[11px] text-slate-400">
              احتياجات العمال والمديرين بحسب قطاع النشاط والحجم
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {profile.companies.map((company) => {
              const analysis = getCompanyStaffingAnalysis(company, profile);
              const categoryLabel =
                analysis.industryCategory === 'heavy'
                  ? 'صناعة ثقيلة'
                  : analysis.industryCategory === 'medium'
                  ? 'صناعة متوسطة'
                  : 'صناعة خفيفة';

              return (
                <div
                  key={company.id}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <strong className="text-xs font-black text-white">{company.name}</strong>
                      <span className="text-[10px] text-slate-400 block">
                        {categoryLabel} · مستوى {analysis.upgradeLevel}
                      </span>
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-black text-emerald-400 block">
                        كفاءة: {analysis.operationalEfficiencyPercent}%
                      </span>
                      {analysis.materialWasteReductionPercent > 0 && (
                        <span className="text-[10px] text-sky-400">
                          وفر هدر: -{analysis.materialWasteReductionPercent}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800/60 flex items-center justify-between">
                      <span className="text-slate-400">مدير الشركة:</span>
                      <span className={analysis.hasManager ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                        {analysis.hasManager ? `✓ ${analysis.manager?.name}` : 'غير معيّن'}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800/60 flex items-center justify-between">
                      <span className="text-slate-400">رئيس العمال:</span>
                      <span className={analysis.hasForeman ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                        {analysis.hasForeman ? `✓ ${analysis.foreman?.name}` : 'غير معيّن'}
                      </span>
                    </div>
                  </div>

                  {analysis.recommendations.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/20 text-[10px] text-amber-200/90 space-y-1">
                      {analysis.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-400 shrink-0">•</span>
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Filter Segment Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1" role="tablist">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'all'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          كافة الكوادر ({profile.staff.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('executive')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'executive'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          القيادة التنفيذية (CEO · COO · CFO)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('advisory')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'advisory'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          المستشارون والمالية (محاسب · محامٍ · HR)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('operations')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'operations'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          المصانع والتشغيل (مديرو الشركات ورؤساء العمال)
        </button>
      </div>

      {/* 4. Staff Cards Grid */}
      {filteredStaff.length === 0 ? (
        <div className="rounded-3xl bg-slate-900/60 border border-dashed border-slate-800 p-10 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 mx-auto flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-white">لا يوجد موظفون في هذا القسم بعد</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            وظّف كوادر تنفيذية أو رؤساء عمال لتعزيز قدرة شركتك على الإنتاج وخفض الضرائب.
          </p>
          <button
            type="button"
            onClick={() => setShowHireModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition cursor-pointer"
          >
            تعيين كادر الآن
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredStaff.slice().reverse().map((member, index) => {
            const roleDef = STAFF_ROLE_OPTIONS[member.role] ?? {
              label: member.role,
              dailySalary: member.dailySalary,
              perks: [],
              description: '',
            };
            const level = staffLevel(member);
            const exp = staffExperience(member);
            const upgradeCost = getStaffUpgradeCost(member);
            const isOverdue = (member.unpaidSalary ?? 0) > 0;
            const canAffordUpgrade = profile.bankBalance >= upgradeCost && level < 5;

            return (
              <div
                key={member.id}
                className={`relative rounded-3xl bg-slate-900 border p-5 transition flex flex-col justify-between ${
                  member.status === 'active'
                    ? isOverdue
                      ? 'border-rose-500/50 shadow-rose-950/20'
                      : 'border-slate-800 hover:border-indigo-500/40 shadow-xl'
                    : 'border-slate-800/60 opacity-60'
                }`}
              >
                <div>
                  {/* Top Row: Avatar + Title + Status */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm text-slate-950 shadow-md ${
                        index % 4 === 0
                          ? 'bg-gradient-to-tr from-indigo-400 to-indigo-600 text-white'
                          : index % 4 === 1
                          ? 'bg-gradient-to-tr from-cyan-400 to-teal-500 text-slate-950'
                          : index % 4 === 2
                          ? 'bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950'
                          : 'bg-gradient-to-tr from-emerald-400 to-emerald-600 text-slate-950'
                      }`}>
                        {getInitials(member.name)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-white">{member.name}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            member.status === 'active'
                              ? isOverdue
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-slate-800 text-slate-500'
                          }`}>
                            {member.status === 'active' ? (isOverdue ? 'راتب متأخر' : 'نشط') : 'منتهٍ'}
                          </span>
                        </div>
                        <span className="text-xs text-indigo-300 font-semibold block mt-0.5">
                          {roleDef.label}
                        </span>
                      </div>
                    </div>

                    <div className="text-left">
                      <span className="text-[10px] text-slate-400 block">الراتب اليومي</span>
                      <strong className="text-xs font-mono font-bold text-white">
                        {formatMoney(member.dailySalary, country)}
                      </strong>
                    </div>
                  </div>

                  {/* Company Assignment Badge */}
                  <div className="mb-3 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      الجهة: {getCompanyLabel(member.companyId)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      يوم التعيين: {member.hiredOnDay}
                    </span>
                  </div>

                  {/* Level & XP Progress Track */}
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300 font-bold flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        المستوى {level} / 5
                      </span>
                      <small className="text-slate-400 font-mono">
                        {level >= 5 ? 'أقصى كفاءة' : `${exp}% خبرة`}
                      </small>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
                        style={{ width: `${level >= 5 ? 100 : exp}%` }}
                      />
                    </div>
                  </div>

                  {/* Real Perks in Numbers */}
                  <div className="space-y-1 mb-4">
                    {roleDef.perks.map((perk, pIdx) => (
                      <div key={pIdx} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {member.status === 'active' && level < 5 && (
                      <button
                        type="button"
                        disabled={!canAffordUpgrade}
                        onClick={() =>
                          onCommand(
                            { name: 'upgrade_staff', args: { staffId: member.id } },
                            (curr) => upgradeStaff(curr, member.id),
                          )
                        }
                        className="px-3 py-1.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>ترقية · {formatMoney(upgradeCost, country)}</span>
                      </button>
                    )}

                    {member.status === 'active' && isOverdue && (
                      <button
                        type="button"
                        disabled={profile.bankBalance < (member.unpaidSalary ?? 0)}
                        onClick={() =>
                          onCommand(
                            { name: 'pay_staff_salary', args: { staffId: member.id } },
                            (curr) => payStaffSalary(curr, member.id),
                          )
                        }
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs transition cursor-pointer"
                      >
                        دفع {formatMoney(member.unpaidSalary ?? 0, country)}
                      </button>
                    )}
                  </div>

                  {member.status === 'active' && (
                    <button
                      type="button"
                      onClick={() => setConfirmTerminateId(member.id)}
                      className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                      aria-label="إنهاء العقد"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Hire Modal */}
      {showHireModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          dir="rtl"
          onClick={() => setShowHireModal(false)}
        >
          <div
            className="bg-slate-900 border border-indigo-500/40 rounded-3xl w-full max-w-xl p-6 text-slate-100 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">تعيين كادر جديد في الإمبراطورية</h3>
                  <p className="text-xs text-slate-400">اختر الوظيفة المناسبة وعيّن كفاءة تساند نموك</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHireModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleHireSubmit} className="flex-1 overflow-y-auto pr-1 py-4 space-y-4 custom-scrollbar">
              {/* Role Selector Grid */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">اختر الوظيفة / الكادر:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(Object.keys(STAFF_ROLE_OPTIONS) as StaffRole[]).map((r) => {
                    const opt = STAFF_ROLE_OPTIONS[r];
                    const isAlreadyHired = ['general_manager', 'operations_director', 'cfo', 'hr', 'accountant', 'lawyer'].includes(r)
                      && activeStaff.some((m) => m.role === r);
                    const isSelected = selectedRoleToHire === r;
                    const contractCost = Math.round(opt.dailySalary * (1 - hrDiscountRate));

                    return (
                      <button
                        type="button"
                        key={r}
                        disabled={isAlreadyHired}
                        onClick={() => setSelectedRoleToHire(r)}
                        className={`p-3 rounded-2xl border text-right transition cursor-pointer flex flex-col justify-between ${
                          isAlreadyHired
                            ? 'bg-slate-950/40 border-slate-800 opacity-50 cursor-not-allowed'
                            : isSelected
                            ? 'bg-indigo-950/50 border-indigo-500 text-white shadow-md'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <strong className="text-xs font-black">{opt.label}</strong>
                          {isAlreadyHired && <span className="text-[10px] text-amber-400 font-bold">معيّن بالفعل</span>}
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-2 mb-2">{opt.description}</p>
                        <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-800/80">
                          <span className="text-slate-400">الراتب: {formatMoney(opt.dailySalary, country)}/يوم</span>
                          <span className="text-indigo-400 font-bold">العقد: {formatMoney(contractCost, country)}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Employee Name */}
              <div className="space-y-1.5">
                <label htmlFor="hire-name-input" className="text-xs font-bold text-slate-300 block">اسم الموظف / المسؤول:</label>
                <input
                  id="hire-name-input"
                  type="text"
                  required
                  value={hireName}
                  onChange={(e) => setHireName(e.target.value)}
                  placeholder="مثال: م. طارق الصاوي"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Company Picker (if required) */}
              {STAFF_ROLE_OPTIONS[selectedRoleToHire]?.companyRequired && (
                <div className="space-y-1.5">
                  <label htmlFor="hire-company-select" className="text-xs font-bold text-slate-300 block">الشركة أو المصنع المستهدف:</label>
                  <select
                    id="hire-company-select"
                    required
                    value={hireCompanyId}
                    onChange={(e) => setHireCompanyId(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">اختر الشركة...</option>
                    {profile.companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Perks preview */}
              <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs space-y-1">
                <span className="text-[11px] text-indigo-300 font-bold block mb-1">المزايا التشغيلية المباشرة:</span>
                {STAFF_ROLE_OPTIONS[selectedRoleToHire]?.perks.map((p, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>{p}</span>
                  </div>
                ))}
                {hrDiscountRate > 0 && (
                  <div className="text-[11px] text-emerald-400 font-bold pt-1">
                    ✓ خصم الموارد البشرية ({Math.round(hrDiscountRate * 100)}%) مُطبّق على تكلفة توقيع العقد.
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={hireName.trim().length < 2 || (STAFF_ROLE_OPTIONS[selectedRoleToHire]?.companyRequired && !hireCompanyId)}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-black text-sm shadow-xl transition cursor-pointer"
                >
                  توقيع العقد واعتماد المخصصات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Terminate Confirmation Dialog */}
      {confirmTerminateId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          dir="rtl"
          onClick={() => setConfirmTerminateId(null)}
        >
          <div
            className="bg-slate-900 border border-rose-500/40 rounded-3xl w-full max-w-sm p-6 text-slate-100 shadow-2xl text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">هل أنت متأكد من إنهاء العقد؟</h3>
              <p className="text-xs text-slate-400 mt-1">
                سيتوقف تأثير ومزايا الموظف فوراً ولن يتم احتساب راتبه في الأيام القادمة.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmTerminateId(null)}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={() => {
                  onCommand(
                    { name: 'terminate_staff', args: { staffId: confirmTerminateId } },
                    (curr) => terminateStaff(curr, confirmTerminateId),
                  );
                  setConfirmTerminateId(null);
                }}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition"
              >
                تأكيد الإنهاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
