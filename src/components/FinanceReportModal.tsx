import React, { useState } from 'react';
import {
  X,
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Building,
  Box,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart,
  BarChart3,
  Percent,
  AlertCircle,
  Sparkles,
  Briefcase,
} from 'lucide-react';
import type { PlayerProfile } from '../domain/player';
import { calculateTotalAssets } from '../domain/player';
import type { CountryDefinition } from '../domain/countries';
import { formatMoney } from '../domain/formatters';
import type { SectionId } from '../domain/navigation';
import { staffLevel } from '../game/engine';

interface FinanceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  country: CountryDefinition;
  onNavigate: (section: SectionId) => void;
}

export const FinanceReportModal: React.FC<FinanceReportModalProps> = ({
  isOpen,
  onClose,
  profile,
  country,
  onNavigate,
}) => {
  const [activeReportTab, setActiveReportTab] = useState<'overview' | 'breakdown' | 'transactions'>('overview');

  if (!isOpen) return null;

  const totalAssets = calculateTotalAssets(profile);
  const liquidCash = profile.bankBalance || 0;
  const goldValue = (profile.goldGrams || 0) * 85000;
  const landsValue = profile.lands.reduce((sum, land) => sum + land.areaSquareMeters * 350, 0);
  const companiesValue = profile.companies.reduce((sum, c) => sum + (c.upgradeLevel || 1) * 350000, 0);
  const inventoryValue = (profile.inventory || []).reduce((sum, item) => sum + item.quantity * 250, 0);

  // Financial operating pulse
  const totalRevenue = profile.finances?.totalRevenue ?? 480000;
  const totalExpenses = profile.finances?.totalExpenses ?? 230000;
  const netProfit = profile.finances?.netProfit ?? (totalRevenue - totalExpenses);
  const netMarginPercent = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  // Key staff members
  const cfo = profile.staff.find((m) => m.status === 'active' && m.role === 'cfo');
  const accountant = profile.staff.find((m) => m.status === 'active' && m.role === 'accountant');
  const cfoLvl = staffLevel(cfo);
  const accLvl = staffLevel(accountant);

  // Categorize ledger for detailed income & cost streams
  const ledgerEntries = profile.ledger ?? [];
  let factoryRevenue = 0;
  let contractRevenue = 0;
  let investmentRevenue = 0;
  let otherRevenue = 0;

  let salaryExpenses = 0;
  let materialsExpenses = 0;
  let operatingExpenses = 0;
  let taxesAndInterest = 0;

  ledgerEntries.forEach((entry) => {
    const note = entry.note || '';
    if (entry.category === 'revenue') {
      if (note.includes('بيع') || note.includes('إنتاج') || note.includes('محصول')) {
        factoryRevenue += entry.amount;
      } else if (note.includes('عقد') || note.includes('تصدير')) {
        contractRevenue += entry.amount;
      } else if (note.includes('استثمار') || note.includes('وديعة') || note.includes('أرباح')) {
        investmentRevenue += entry.amount;
      } else {
        otherRevenue += entry.amount;
      }
    } else if (entry.category === 'expense' || entry.category === 'liability') {
      if (note.includes('راتب') || note.includes('عقد')) {
        salaryExpenses += entry.amount;
      } else if (note.includes('خامات') || note.includes('مواد') || note.includes('شراء')) {
        materialsExpenses += entry.amount;
      } else if (note.includes('تشغيل') || note.includes('صيانة') || note.includes('طاقة')) {
        operatingExpenses += entry.amount;
      } else if (note.includes('ضريبة') || note.includes('فائدة') || note.includes('غرامة')) {
        taxesAndInterest += entry.amount;
      }
    }
  });

  // Fallback defaults if new profile
  const displayFactoryRev = factoryRevenue > 0 ? factoryRevenue : Math.round(totalRevenue * 0.55);
  const displayContractRev = contractRevenue > 0 ? contractRevenue : Math.round(totalRevenue * 0.25);
  const displayInvRev = investmentRevenue > 0 ? investmentRevenue : Math.round(totalRevenue * 0.15);
  const displayOtherRev = otherRevenue > 0 ? otherRevenue : Math.round(totalRevenue * 0.05);

  const displaySalaryExp = salaryExpenses > 0 ? salaryExpenses : Math.round(totalExpenses * 0.35);
  const displayMatExp = materialsExpenses > 0 ? materialsExpenses : Math.round(totalExpenses * 0.30);
  const displayOpExp = operatingExpenses > 0 ? operatingExpenses : Math.round(totalExpenses * 0.20);
  const displayTaxExp = taxesAndInterest > 0 ? taxesAndInterest : Math.round(totalExpenses * 0.15);

  const totalRevStreams = displayFactoryRev + displayContractRev + displayInvRev + displayOtherRev;
  const totalExpStreams = displaySalaryExp + displayMatExp + displayOpExp + displayTaxExp;

  // Recent transactions
  const recentTransactions = ledgerEntries.length > 0
    ? [...ledgerEntries].reverse().slice(0, 10)
    : [
        {
          id: '1',
          category: 'revenue' as const,
          amount: profile.bankBalance || 50000,
          occurredAt: new Date().toISOString(),
          note: 'رصيد البدء والاستثمار التأسيسي',
        },
      ];

  // Liquidity health rating
  const urgentObligations = profile.payables + profile.staff.filter((s) => s.status === 'active').reduce((sum, s) => sum + (s.unpaidSalary ?? 0), 0);
  const liquidityRatio = urgentObligations > 0 ? liquidCash / urgentObligations : 10;
  const healthStatus = liquidityRatio >= 2.0 ? 'ممتازة' : liquidityRatio >= 1.0 ? 'مستقرة' : 'حرجة - تتطلب سيولة';
  const healthColor = liquidityRatio >= 2.0 ? 'text-emerald-400' : liquidityRatio >= 1.0 ? 'text-cyan-400' : 'text-rose-400';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="relative bg-slate-900 border border-emerald-500/40 rounded-3xl max-w-3xl w-full p-5 sm:p-7 text-slate-100 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/20 font-black">
              <FileText className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white">
                  لوحة التقارير والتحليلات المالية الذكية 📊
                </h3>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                  اليوم {profile.day}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                تدقيق محاسبي شامل، تدفقات الدخل، توزيع التكاليف، وهامش الربحية
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 my-3 border-b border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveReportTab('overview')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeReportTab === 'overview'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            المؤشرات وهامش الربحية
          </button>
          <button
            type="button"
            onClick={() => setActiveReportTab('breakdown')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeReportTab === 'breakdown'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            تفصيل الإيرادات والمصروفات
          </button>
          <button
            type="button"
            onClick={() => setActiveReportTab('transactions')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeReportTab === 'transactions'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            دفتر القيود والمعاملات
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
          {activeReportTab === 'overview' && (
            <>
              {/* Executive Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-amber-500/30 flex flex-col justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-amber-400" />
                    صافي الثروة الكلية
                  </span>
                  <strong className="text-base font-black text-amber-400 mt-1">
                    {formatMoney(totalAssets, country)}
                  </strong>
                  <small className="text-[10px] text-slate-500">تقييم كامل الأصول</small>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-emerald-500/30 flex flex-col justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    صافي الأرباح المحققة
                  </span>
                  <strong className="text-base font-black text-emerald-400 mt-1">
                    + {formatMoney(netProfit, country)}
                  </strong>
                  <small className="text-[10px] text-emerald-400/80">إيرادات مطروحة التكاليف</small>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-blue-500/30 flex flex-col justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-blue-400" />
                    السيولة النقدية المتاحة
                  </span>
                  <strong className="text-base font-black text-blue-400 mt-1">
                    {formatMoney(liquidCash, country)}
                  </strong>
                  <small className="text-[10px] text-slate-500">رصيد بالبنك والخزينة</small>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-teal-500/30 flex flex-col justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-teal-400" />
                    مؤشر صافي الربحية
                  </span>
                  <strong className="text-base font-black text-teal-400 mt-1">
                    {netMarginPercent}%
                  </strong>
                  <small className="text-[10px] text-teal-400/80">Daily Net Margin</small>
                </div>
              </div>

              {/* CFO & Accountant Advisory Callout */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/50 border border-indigo-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    توجيهات الاستقرار المالي (CFO & Accountant):
                  </span>
                  <span className={`text-xs font-black ${healthColor}`}>
                    ملاءة السيولة: {healthStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  {cfo
                    ? `المدير المالي التنفيذي (${cfo.name} · مستوى ${cfoLvl}) يعزز عوائد الودائع ويخفض فوائد القروض المركبة.`
                    : 'نصيحة: عيّن مديراً مالياً (CFO) لرفع فوائد ودائعك البنكية والحصول على تحذيرات استباقية قبل استحقاق الأقساط.'}
                </p>
                {accountant && (
                  <p className="text-[11px] text-emerald-400">
                    ✓ المحاسب القانوني ({accountant.name} · مستوى {accLvl}) يمنحك خفض ضرائب مبيعات يصل إلى {15 + accLvl * 5}% ويحميك من غرامات الفحص الضريبي.
                  </p>
                )}
              </div>

              {/* Asset Distribution */}
              <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
                <span className="text-xs font-bold text-slate-300 block mb-2.5">
                  هيكل توزيع الأصول والممتلكات:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">الشركات والمصانع</span>
                    <strong className="text-slate-200 font-bold">{formatMoney(companiesValue, country)}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">الأراضي والعقارات</span>
                    <strong className="text-slate-200 font-bold">{formatMoney(landsValue, country)}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">سبائك الذهب ({profile.goldGrams ?? 0}g)</span>
                    <strong className="text-slate-200 font-bold">{formatMoney(goldValue, country)}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">بضائع وخامات المستودع</span>
                    <strong className="text-slate-200 font-bold">{formatMoney(inventoryValue, country)}</strong>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeReportTab === 'breakdown' && (
            <div className="space-y-4">
              {/* Income Streams */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                    <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                    تدفقات الدخل والإيرادات (+{formatMoney(totalRevStreams, country)})
                  </strong>
                  <span className="text-[10px] text-slate-400">توزيع مصادر الربح</span>
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>مبيعات المصانع والمنتجات المحلية</span>
                      <strong className="font-mono">{formatMoney(displayFactoryRev, country)} ({Math.round((displayFactoryRev / totalRevStreams) * 100)}%)</strong>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${Math.round((displayFactoryRev / totalRevStreams) * 100)}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>العقود التجارية ومناقصات التوريد</span>
                      <strong className="font-mono">{formatMoney(displayContractRev, country)} ({Math.round((displayContractRev / totalRevStreams) * 100)}%)</strong>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-teal-400" style={{ width: `${Math.round((displayContractRev / totalRevStreams) * 100)}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>عوائد الودائع البنكية والاستثمارات</span>
                      <strong className="font-mono">{formatMoney(displayInvRev, country)} ({Math.round((displayInvRev / totalRevStreams) * 100)}%)</strong>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-cyan-400" style={{ width: `${Math.round((displayInvRev / totalRevStreams) * 100)}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>إيرادات وعلاوات أخرى</span>
                      <strong className="font-mono">{formatMoney(displayOtherRev, country)} ({Math.round((displayOtherRev / totalRevStreams) * 100)}%)</strong>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-blue-400" style={{ width: `${Math.round((displayOtherRev / totalRevStreams) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Expense Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-rose-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-black text-rose-400 flex items-center gap-1.5">
                    <ArrowUpRight className="w-4 h-4 text-rose-400" />
                    تفصيل التكاليف والمصروفات (-{formatMoney(totalExpStreams, country)})
                  </strong>
                  <span className="text-[10px] text-slate-400">توزيع الالتزامات</span>
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>رواتب الموظفين والكوادر الإدارية</span>
                      <strong className="font-mono text-rose-400">{formatMoney(displaySalaryExp, country)} ({Math.round((displaySalaryExp / totalExpStreams) * 100)}%)</strong>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-rose-500" style={{ width: `${Math.round((displaySalaryExp / totalExpStreams) * 100)}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>تكلفة المواد الخام وقطع الغيار</span>
                      <strong className="font-mono text-rose-400">{formatMoney(displayMatExp, country)} ({Math.round((displayMatExp / totalExpStreams) * 100)}%)</strong>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-orange-400" style={{ width: `${Math.round((displayMatExp / totalExpStreams) * 100)}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>مصروفات التشغيل اليومية وصيانة المصانع</span>
                      <strong className="font-mono text-rose-400">{formatMoney(displayOpExp, country)} ({Math.round((displayOpExp / totalExpStreams) * 100)}%)</strong>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-amber-400" style={{ width: `${Math.round((displayOpExp / totalExpStreams) * 100)}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>الضرائب وفوائد القروض والالتزامات</span>
                      <strong className="font-mono text-rose-400">{formatMoney(displayTaxExp, country)} ({Math.round((displayTaxExp / totalExpStreams) * 100)}%)</strong>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-red-400" style={{ width: `${Math.round((displayTaxExp / totalExpStreams) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeReportTab === 'transactions' && (
            <div className="space-y-2">
              <span className="text-xs text-slate-400 font-bold block mb-1">
                سجل آخر العمليات النقدية والقيود المالية:
              </span>
              {recentTransactions.map((tx: any) => {
                const isRev = tx.category === 'revenue';
                return (
                  <div
                    key={tx.id}
                    className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold ${
                          isRev
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {isRev ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <strong className="text-white block text-xs">
                          {tx.note || 'عملية مالية'}
                        </strong>
                        <span className="text-[10px] text-slate-500">
                          {new Date(tx.occurredAt).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    </div>

                    <strong
                      className={`font-mono text-xs ${
                        isRev ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isRev ? '+' : '-'} {Number(tx.amount).toLocaleString('ar-EG')}{' '}
                      {country.currency.code}
                    </strong>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
