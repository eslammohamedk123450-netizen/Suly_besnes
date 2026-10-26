import React from 'react';
import { X, FileText, TrendingUp, TrendingDown, DollarSign, Wallet, Building, Box, ShieldCheck, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import type { PlayerProfile } from '../domain/player';
import { calculateTotalAssets } from '../domain/player';
import type { CountryDefinition } from '../domain/countries';
import { formatMoney } from '../domain/formatters';
import type { SectionId } from '../domain/navigation';

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
  if (!isOpen) return null;

  const totalAssets = calculateTotalAssets(profile);
  const liquidCash = profile.bankBalance || 0;
  const goldValue = (profile.goldGrams || 0) * 85000; // estimated in local currency
  const landsValue = profile.lands.reduce((sum, land) => sum + land.areaSquareMeters * 350, 0);
  const companiesValue = profile.companies.reduce((sum, c) => sum + (c.upgradeLevel || 1) * 350000, 0);
  const inventoryValue = (profile.inventory || []).reduce((sum, item) => sum + item.quantity * 250, 0);

  // Financial operating pulse
  const totalRevenue = profile.finances?.totalRevenue ?? 480000;
  const totalOperatingCost = profile.finances?.totalExpenses ?? 230000;
  const netProfit = profile.finances?.netProfit ?? (totalRevenue - totalOperatingCost);

  // Ledger transactions
  const recentTransactions = profile.ledger && profile.ledger.length > 0
    ? [...profile.ledger].reverse().slice(0, 6)
    : [
        {
          id: '1',
          category: 'revenue',
          amount: profile.bankBalance || 50000,
          occurredAt: new Date().toISOString(),
          note: 'رصيد البدء والاستثمار التأسيسي',
        },
      ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in"
      dir="rtl"
      onClick={onClose}
    >
      <div 
        className="relative bg-slate-900 border border-emerald-500/40 rounded-3xl max-w-2xl w-full p-5 sm:p-7 text-slate-100 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/20 font-black">
              <FileText className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white">
                  التقرير المالي التنفيذي 📊
                </h3>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                  اليوم {profile.day}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                ميزانية الإمبراطورية، قائمة الدخل، وتوزيع الأصول الاستثمارية
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-4">
          {/* Total Net Worth */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-amber-500/30 flex flex-col justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-amber-400" />
              صافي ثروة الإمبراطورية
            </span>
            <strong className="text-lg font-black text-amber-400 mt-1">
              {formatMoney(totalAssets, country)}
            </strong>
            <small className="text-[10px] text-slate-500">تقييم شامل لكافة الأصول</small>
          </div>

          {/* Net Profit */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-emerald-500/30 flex flex-col justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              صافي الأرباح المحققة
            </span>
            <strong className="text-lg font-black text-emerald-400 mt-1">
              + {formatMoney(netProfit, country)}
            </strong>
            <small className="text-[10px] text-emerald-500/80">عوائد تشغيلية موجبة</small>
          </div>

          {/* Liquid Cash */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-blue-500/30 flex flex-col justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-blue-400" />
              السيولة النقدية المتاحة
            </span>
            <strong className="text-lg font-black text-blue-400 mt-1">
              {formatMoney(liquidCash, country)}
            </strong>
            <small className="text-[10px] text-slate-500">رصيد بنكي جاهز للاستثمار</small>
          </div>
        </div>

        {/* Asset Distribution Breakdown */}
        <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 mb-4">
          <span className="text-xs font-bold text-slate-300 block mb-2.5">
            توزيع الأصول والممتلكات:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">الشركات والماكينات</span>
              <strong className="text-slate-200 font-bold">{formatMoney(companiesValue, country)}</strong>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">العقارات والأراضي</span>
              <strong className="text-slate-200 font-bold">{formatMoney(landsValue, country)}</strong>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">سبائك الذهب ({profile.goldGrams ?? 0}g)</span>
              <strong className="text-slate-200 font-bold">{formatMoney(goldValue, country)}</strong>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">بضائع المستودع</span>
              <strong className="text-slate-200 font-bold">{formatMoney(inventoryValue, country)}</strong>
            </div>
          </div>
        </div>

        {/* Recent Ledger Transactions */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold">آخر الحركات النقدية والعمليات:</span>
            <button
              onClick={() => {
                onClose();
                onNavigate('reports');
              }}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
            >
              <span>فتح التقرير المالي الكامل</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentTransactions.map((tx: any) => {
            const isRevenue = tx.category === 'revenue';
            return (
              <div 
                key={tx.id}
                className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isRevenue ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {isRevenue ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <strong className="text-white block text-xs">{tx.note || 'عملية مالية'}</strong>
                    <span className="text-[10px] text-slate-500">
                      {new Date(tx.occurredAt).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                </div>

                <strong className={`font-mono text-xs ${
                  isRevenue ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {isRevenue ? '+' : '-'} {Number(tx.amount).toLocaleString()} {country.currency.code}
                </strong>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
