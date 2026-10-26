import React, { useState } from 'react';
import type { PlayerProfile } from '../domain/player';
import type { CountryDefinition } from '../domain/countries';
import type { SectionId } from '../domain/navigation';
import { formatMoney } from '../domain/formatters';
import { playSound } from '../game/soundEffects';
import { getDayBriefing } from '../game/engine';
import { getAdaptiveBots } from '../game/economyBots';
import { normalizeWarehouseLevel, getWarehouseCapacity, getWarehouseUsage } from '../game/warehouse';
import {
  TrendingUp,
  ShieldAlert,
  Building,
  Target,
  Users,
  ChevronLeft,
  X,
  Factory,
  Sparkles,
  Zap,
  Briefcase,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

interface StrategicPillarsModalProps {
  profile: PlayerProfile;
  country: CountryDefinition;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: SectionId, target?: string) => void;
  onOpenMorningReport?: () => void;
  onOpenCentralBank?: () => void;
  onOpenPrestige?: () => void;
  onAcceptBotOffer?: (offerId: string) => void;
}

export function StrategicPillarsModal({
  profile,
  country,
  isOpen,
  onClose,
  onNavigate,
  onOpenMorningReport,
  onOpenCentralBank,
  onOpenPrestige,
  onAcceptBotOffer,
}: StrategicPillarsModalProps) {
  const [activePillarTab, setActivePillarTab] = useState<'overview' | 'financial' | 'industrial' | 'expansion' | 'governance'>('overview');

  if (!isOpen) return null;

  const briefing = getDayBriefing(profile);
  const bots = getAdaptiveBots(profile);
  const warehouseLevel = normalizeWarehouseLevel(profile.warehouseLevel);
  const warehouseCap = getWarehouseCapacity(warehouseLevel);
  const warehouseUse = getWarehouseUsage(profile.inventory, profile.productionOrders);

  // Computed Strategic Metrics
  const totalLandCount = profile.lands?.length ?? 0;
  const totalCompanyCount = profile.companies?.length ?? 0;
  const activeStaffCount = profile.staff?.filter((s) => s.status === 'active').length ?? 0;
  const activeContractsCount = profile.contracts?.filter((c) => c.status === 'active').length ?? 0;

  // Average Maintenance Condition of factories
  const avgMaintenance = totalCompanyCount > 0
    ? Math.round(profile.companies.reduce((sum, c) => sum + (c.maintenanceCondition ?? 100), 0) / totalCompanyCount)
    : 100;

  // Liquidity Coverage Ratio (Cash / Daily Outflows)
  const dailyOutflow = briefing.operatingCost + (profile.staff?.reduce((sum, s) => sum + s.dailySalary, 0) ?? 0);
  const daysCoverage = dailyOutflow > 0 ? Math.round((profile.bankBalance / dailyOutflow) * 10) / 10 : 99;

  // Strategic Alerts
  const alerts: { id: string; level: 'critical' | 'warning' | 'info'; title: string; desc: string; actionSection?: SectionId }[] = [];

  if (profile.bankBalance < dailyOutflow * 1.5 && dailyOutflow > 0) {
    alerts.push({
      id: 'alert-cash-buffer',
      level: 'critical',
      title: 'تحذير سيولة نقدية: تغطية المصروفات أقل من يومين',
      desc: 'الرصيد النقدي لا يغطي مصاريف التشغيل والرواتب القادمة. بادر بطرح منتجات في السوق أو استرداد ودائع.',
      actionSection: 'inventory',
    });
  }

  if (profile.companies.some((c) => (c.maintenanceCondition ?? 100) < 80)) {
    alerts.push({
      id: 'alert-maintenance-low',
      level: 'warning',
      title: 'تنبيه صيانة مصانع: كفاءة بعض الآلات أقل من 80%',
      desc: 'انخفاض الكفاءة التشغيلية يرفع احتمالية تلف الخامات وهدر الإنتاج. أجرِ صيانة وقائية للمصانع.',
      actionSection: 'companies',
    });
  }

  if (profile.contracts.some((c) => c.status === 'active' && c.deadlineDay <= profile.day + 1)) {
    alerts.push({
      id: 'alert-contract-urgent',
      level: 'warning',
      title: 'مهلة تسليم عقد تجاري قاربت على الانتهاء',
      desc: 'لديك عقد تجاري نشط يوشك على انتهاء موعده النهائي. تأكد من تجهيز الشحنة في المخزن لتفادي الغرامات.',
      actionSection: 'contracts',
    });
  }

  if (warehouseUse.materials >= warehouseCap.materials * 0.9) {
    alerts.push({
      id: 'alert-warehouse-full',
      level: 'info',
      title: 'امتلاء مستودع الخامات والمواد الأولية',
      desc: 'المستودع يقترب من السعة القصوى. شغّل خطوط الإنتاج لتحويل الخامات إلى سلع أو طوّر المستودع.',
      actionSection: 'production',
    });
  }

  // Executive Recommendations based on real metrics
  const recommendations: { title: string; role: string; desc: string; actionText: string; section?: SectionId; customAction?: () => void }[] = [];

  const cfo = profile.staff?.find((s) => s.role === 'cfo' && s.status === 'active');
  const coo = profile.staff?.find((s) => s.role === 'operations_director' && s.status === 'active');
  const gm = profile.staff?.find((s) => s.role === 'general_manager' && s.status === 'active');

  if (profile.bankBalance >= 100_000 && (profile.banking?.deposits?.filter((d) => d.status === 'active').length ?? 0) === 0) {
    recommendations.push({
      title: 'استثمار السيولة الفائضة في ودائع بنكية عالية العائد',
      role: cfo ? 'المدير المالي CFO' : 'المستشار المالي',
      desc: `لديك سيولة غير مستغلة تزيد عن ${profile.bankBalance.toLocaleString()} $. ربط وديعة بنكية لمدة 7 أو 14 يوماً يوفر عائداً ثابتاً يمول الرواتب.`,
      actionText: 'فتح نافذة البنك والودائع',
      section: 'bank',
    });
  }

  if (profile.companies.length > 0 && !coo) {
    recommendations.push({
      title: 'تعيين مدير تشغيل المصانع (COO) لأتمتة دورات الإنتاج',
      role: 'مستشار الموارد البشرية',
      desc: 'تعيين مدير العمليات يتيح تشغيل المصانع بصورة آلية متواصلة ودفعات إضافية أثناء الغياب بنسبة +35%.',
      actionText: 'التوجه لقسم الموظفين',
      section: 'staff',
    });
  } else if (coo && !profile.automationDirectives?.autoRunProduction) {
    recommendations.push({
      title: 'تفعيل تفويض التشغيل الآلي للمصانع مع مدير العمليات',
      role: 'مدير تشغيل المصانع (COO)',
      desc: 'لديك مدير عمليات معيّن ولكن التفويض التلقائي متوقف. فعّل خيار التشغيل المستمر لضمان عدم توقف الماكينات.',
      actionText: 'ضبط تفويضات الأتمتة',
      section: 'staff',
    });
  }

  if (!gm) {
    recommendations.push({
      title: 'تعيين مدير تنفيذي (CEO) لأتمتة سداد الرواتب وحماية الطاقة',
      role: 'حوكمة الإمبراطورية',
      desc: 'تفويض المدير التنفيذي يضمن سداد الرواتب تلقائياً وتفادي توقف محطات الكهرباء أو إضراب العمال.',
      actionText: 'تعيين مدير تنفيذي',
      section: 'staff',
    });
  }

  const handleAction = (section?: SectionId, custom?: () => void) => {
    playSound('click');
    onClose();
    if (custom) {
      custom();
    } else if (section) {
      onNavigate(section);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fade-in" dir="rtl">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col text-slate-100 relative">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-2xl shadow-lg border border-amber-500/30">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-black text-white">
                  الشركة الأم · المركز المحوري الإمبراطوري
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                  نظام الإدارة المركزية
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                مركز موحّد لمؤشرات الأداء والتنبيهات وتوصيات المستشارين التنفيذيين وإدارة نمو الإمبراطورية
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Strategic KPIs Row */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950/50 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              السيولة وصافي الثروة
            </span>
            <strong className="text-sm sm:text-base font-black text-emerald-300 mt-1">
              {formatMoney(profile.bankBalance, country)}
            </strong>
            <small className="text-[10px] text-slate-400 mt-0.5">
              تغطي {daysCoverage} يوماً من المصاريف
            </small>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <Factory className="w-3.5 h-3.5 text-amber-400" />
              المصانع والكفاءة
            </span>
            <strong className="text-sm sm:text-base font-black text-amber-300 mt-1">
              {totalCompanyCount} شركات · {avgMaintenance}%
            </strong>
            <small className="text-[10px] text-slate-400 mt-0.5">
              متوسط كفاءة تشغيل الآلات
            </small>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              الفريق التنفيذي
            </span>
            <strong className="text-sm sm:text-base font-black text-purple-300 mt-1">
              {activeStaffCount} موظفون نشطون
            </strong>
            <small className="text-[10px] text-slate-400 mt-0.5">
              رواتب {formatMoney(profile.staff?.reduce((acc, s) => acc + s.dailySalary, 0) ?? 0, country)} / يوم
            </small>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              المستودع والمخزون
            </span>
            <strong className="text-sm sm:text-base font-black text-cyan-300 mt-1">
              {warehouseUse.materials} / {warehouseCap.materials} وحدة
            </strong>
            <small className="text-[10px] text-slate-400 mt-0.5">
              مستوى المستودع {warehouseLevel}
            </small>
          </div>
        </div>

        {/* Four Core Strategic Operations Pillars */}
        <div className="p-4 sm:p-6 pb-2 border-b border-slate-800 bg-slate-950/30">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>🎯</span>
              <span>المحاور التشغيلية المركزية لإدارة الإمبراطورية</span>
            </h3>
            <span className="text-[11px] text-slate-400">تحكم فوري بكافة أذرع الإدارة</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5">
            {/* Pillar 1: Smart Offline Idle Report */}
            <button
              type="button"
              onClick={() => {
                playSound('click');
                onClose();
                onOpenMorningReport?.();
              }}
              className="p-2.5 sm:p-3 rounded-2xl bg-slate-900/90 border border-amber-500/40 hover:border-amber-400 hover:bg-slate-900 transition text-right flex flex-col justify-between group active:scale-95 cursor-pointer shadow-lg min-h-[152px] sm:min-h-[166px]"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl">🌅</span>
                  <span className="text-[10px] font-bold text-amber-300 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30">
                    متاح دائماً
                  </span>
                </div>
                <h4 className="text-xs font-black text-white group-hover:text-amber-300 transition">
                  تقرير الصباح لغياب المدير
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  حصيلة سلع المصانع وأرباح الأسهم المتراكمة أثناء غيابك عن اللعبة.
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-bold text-amber-400">
                <span>فحص حصيلة الغياب</span>
                <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition" />
              </div>
            </button>

            {/* Pillar 2: Central Bank & Monetary Policy */}
            <button
              type="button"
              onClick={() => {
                playSound('click');
                onClose();
                if (onOpenCentralBank) {
                  onOpenCentralBank();
                } else {
                  onNavigate('bank');
                }
              }}
              className="p-2.5 sm:p-3 rounded-2xl bg-slate-900/90 border border-emerald-500/40 hover:border-emerald-400 hover:bg-slate-900 transition text-right flex flex-col justify-between group active:scale-95 cursor-pointer shadow-lg min-h-[152px] sm:min-h-[166px]"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl">🏛️</span>
                  <span className="text-[10px] font-bold text-emerald-300 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                    البنك والتمويل
                  </span>
                </div>
                <h4 className="text-xs font-black text-white group-hover:text-emerald-300 transition">
                  بيان البنك المركزي والسياسة النقدية
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  قرارات الفائدة والتضخم والسيولة وتأثيرها على العوائد والقروض.
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-bold text-emerald-400">
                <span>نشرة الفائدة والتمويل</span>
                <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition" />
              </div>
            </button>

            {/* Pillar 3: Regional Syndicate Wars & Territory */}
            <button
              type="button"
              onClick={() => {
                playSound('click');
                onClose();
                onNavigate('territory');
              }}
              className="p-2.5 sm:p-3 rounded-2xl bg-slate-900/90 border border-indigo-500/40 hover:border-indigo-400 hover:bg-slate-900 transition text-right flex flex-col justify-between group active:scale-95 cursor-pointer shadow-lg min-h-[152px] sm:min-h-[166px]"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl">⚔️</span>
                  <span className="text-[10px] font-bold text-indigo-300 px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30">
                    السيطرة وحصص السوق
                  </span>
                </div>
                <h4 className="text-xs font-black text-white group-hover:text-indigo-300 transition">
                  التنافس الإقليمي وحرب الكارتيل
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  توسيع المراكز اللوجستية ومواجهة تحالفات المنافسين في الأقاليم.
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-bold text-indigo-400">
                <span>خريطة الأقاليم والنفوذ</span>
                <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition" />
              </div>
            </button>

            {/* Pillar 4: Prestige System & International Expansion */}
            <button
              type="button"
              onClick={() => {
                playSound('click');
                onClose();
                if (onOpenPrestige) {
                  onOpenPrestige();
                } else {
                  onNavigate('luxury');
                }
              }}
              className="p-2.5 sm:p-3 rounded-2xl bg-slate-900/90 border border-purple-500/40 hover:border-purple-400 hover:bg-slate-900 transition text-right flex flex-col justify-between group active:scale-95 cursor-pointer shadow-lg min-h-[152px] sm:min-h-[166px]"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl">👑</span>
                  <span className="text-[10px] font-bold text-purple-300 px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30">
                    الصندوق السيادي
                  </span>
                </div>
                <h4 className="text-xs font-black text-white group-hover:text-purple-300 transition">
                  نظام الهيبة والتوسع الدولي
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  تأسيس محفظة عالمية عابرة للقارات مع امتيازات دائمة لكل دولتك.
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-bold text-purple-400">
                <span>الصندوق السيادي والامتيازات</span>
                <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition" />
              </div>
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="px-4 sm:px-6 pt-4 flex gap-2 overflow-x-auto pb-2 border-b border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActivePillarTab('overview')}
            className={`py-2 px-3.5 rounded-xl font-bold transition cursor-pointer whitespace-nowrap ${
              activePillarTab === 'overview'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            📊 النظرة الشاملة والتوصيات
          </button>
          <button
            type="button"
            onClick={() => setActivePillarTab('financial')}
            className={`py-2 px-3.5 rounded-xl font-bold transition cursor-pointer whitespace-nowrap ${
              activePillarTab === 'financial'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            💰 الاستقرار المالي والسيولة
          </button>
          <button
            type="button"
            onClick={() => setActivePillarTab('industrial')}
            className={`py-2 px-3.5 rounded-xl font-bold transition cursor-pointer whitespace-nowrap ${
              activePillarTab === 'industrial'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            ⚙️ التشغيل الصناعي وسلاسل الإمداد
          </button>
          <button
            type="button"
            onClick={() => setActivePillarTab('expansion')}
            className={`py-2 px-3.5 rounded-xl font-bold transition cursor-pointer whitespace-nowrap ${
              activePillarTab === 'expansion'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            ⚔️ التوسع والتنافس في السوق ({bots.length} منافسين)
          </button>
          <button
            type="button"
            onClick={() => setActivePillarTab('governance')}
            className={`py-2 px-3.5 rounded-xl font-bold transition cursor-pointer whitespace-nowrap ${
              activePillarTab === 'governance'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            👑 الحوكمة والتفويض التنفيذي
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 space-y-6 flex-1">
          {/* Active Alerts Banner */}
          {alerts.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                تنبيهات استباقية تستلزم المتابعة ({alerts.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-2xl border flex items-start justify-between gap-3 ${
                      alert.level === 'critical'
                        ? 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                        : alert.level === 'warning'
                        ? 'bg-amber-950/60 border-amber-500/40 text-amber-200'
                        : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-200'
                    }`}
                  >
                    <div>
                      <strong className="text-xs font-black block">{alert.title}</strong>
                      <p className="text-[11px] opacity-90 mt-0.5 leading-relaxed">{alert.desc}</p>
                    </div>
                    {alert.actionSection && (
                      <button
                        type="button"
                        onClick={() => handleAction(alert.actionSection)}
                        className="py-1 px-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-white text-[11px] font-bold shrink-0 transition cursor-pointer"
                      >
                        معالجة
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* OVERVIEW TAB */}
          {(activePillarTab === 'overview' || activePillarTab === 'financial') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  توصيات المستشارين التنفيذيين للأهداف الاستراتيجية
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/40 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                          {rec.role}
                        </span>
                        <span className="text-xs text-slate-400">توصية أولوية</span>
                      </div>
                      <h4 className="text-xs font-black text-white">{rec.title}</h4>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{rec.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAction(rec.section, rec.customAction)}
                      className="mt-3 py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>{rec.actionText}</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INDUSTRIAL TAB */}
          {(activePillarTab === 'overview' || activePillarTab === 'industrial') && (
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Factory className="w-4 h-4 text-amber-400" />
                محور التشغيل الصناعي وسلاسل الإمداد
              </h3>
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">الأراضي التوسعية</span>
                    <strong className="text-base text-white">{totalLandCount} قطع أراضٍ</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">المصانع القائمة</span>
                    <strong className="text-base text-white">{totalCompanyCount} شركات مسجلة</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">أوامر الإنتاج الجارية</span>
                    <strong className="text-base text-white">
                      {profile.productionOrders?.filter((o) => o.status === 'active').length ?? 0} أوامر
                    </strong>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleAction('production')}
                    className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
                  >
                    🏭 فتح خطوط الإنتاج
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction('companies')}
                    className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
                  >
                    🏢 صيانة وتطوير الشركات
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction('inventory')}
                    className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
                  >
                    📦 إدارة مخزون الخامات
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* EXPANSION & COMPETITORS TAB */}
          {(activePillarTab === 'overview' || activePillarTab === 'expansion') && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-400" />
                  المنافسون الاقتصاديون والبيئة التنافسية النشطة
                </h3>
                <span className="text-xs text-slate-400">
                  ميزانيات متكيفة مع مستوى ثروتك
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {bots.map((bot) => (
                  <div
                    key={bot.id}
                    className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{bot.avatar}</span>
                          <div>
                            <strong className="text-xs font-black text-white block">{bot.name}</strong>
                            <small className="text-[10px] text-slate-400">{bot.title}</small>
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                        «{bot.dialogueGreeting}»
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">الميزانية النشطة:</span>
                      <strong className="text-amber-400 font-mono font-bold">
                        {formatMoney(bot.currentBudget, country)}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GOVERNANCE TAB */}
          {(activePillarTab === 'governance') && (
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                الحوكمة والتفويض الإداري المؤتمت
              </h3>
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 text-xs">
                <p className="text-slate-300 leading-relaxed">
                  يسمح تعيين القيادات التنفيذية (المدير العام CEO، مدير العمليات COO، المدير المالي CFO، والمحاسب القانوني) بتفويض العمليات اليومية وتفادي أخطاء الغياب وتوفير الضرائب.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="font-bold text-white block mb-1">سداد الرواتب المؤتمت</span>
                    <span className={profile.automationDirectives?.autoPaySalaries ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {profile.automationDirectives?.autoPaySalaries ? 'مفعل ومفوّض ✓' : 'غير مفعل'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="font-bold text-white block mb-1">دوران الإنتاج المستمر</span>
                    <span className={profile.automationDirectives?.autoRunProduction ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {profile.automationDirectives?.autoRunProduction ? 'مفعل ومفوّض ✓' : 'غير مفعل'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="font-bold text-white block mb-1">إعادة تموين الخامات</span>
                    <span className={profile.automationDirectives?.autoPurchaseMaterials ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {profile.automationDirectives?.autoPurchaseMaterials ? 'مفعل ومفوّض ✓' : 'غير مفعل'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAction('staff')}
                  className="mt-3 py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>إدارة طاقم القيادة والتفويضات</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-slate-400">
            بيانات استراتيجية حية مستندة إلى إحصاءات اليوم {profile.day} في {country.name}.
          </span>
          <div className="flex items-center gap-2">
            {onOpenCentralBank && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCentralBank();
                }}
                className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold transition cursor-pointer"
              >
                🏛️ بيان البنك المركزي
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="py-1.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition cursor-pointer"
            >
              إغلاق اللوحة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
