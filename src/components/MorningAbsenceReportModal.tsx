import React from 'react';
import { 
  Building2, 
  TrendingUp, 
  Clock, 
  ShieldAlert, 
  Coins, 
  PackageCheck, 
  ReceiptText, 
  Sparkles, 
  AlertTriangle,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import type { OfflineIdleReport } from '../game/offlineIdleEngine';
import { formatCurrency } from '../domain/formatters';
import { triggerHaptic } from '../services/nativeMobileService';
import { playSound } from '../game/soundEffects';

interface Props {
  isOpen: boolean;
  report: OfflineIdleReport;
  onClaim: () => void;
  onClose: () => void;
}

export const MorningAbsenceReportModal: React.FC<Props> = ({
  isOpen,
  report,
  onClaim,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleClaim = () => {
    triggerHaptic('success');
    playSound('cash');
    onClaim();
  };

  const totalValueProduced = report.goodsProduced.reduce((sum, g) => sum + g.value, 0);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fade-in"
      dir="rtl"
    >
      <div 
        className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl max-w-xl w-full p-5 sm:p-7 text-slate-100 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/25 font-black text-2xl">
              🌅
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  تقرير الصباح لغياب المدير
                </h2>
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  إمبراطوريتك كانت تعمل
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>فترة الغياب المحسوبة: <strong>{report.elapsedHours} ساعة</strong></span>
              </p>
            </div>
          </div>
        </div>

        {/* Anti-Tampering Warning if any */}
        {report.isTampered && (
          <div className="my-3 p-3 rounded-2xl bg-rose-950/60 border border-rose-500/50 flex items-center gap-3 text-rose-200 text-xs">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{report.tamperMessage}</span>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="overflow-y-auto space-y-4 my-4 pr-1 pl-1 scrollbar-thin">
          {/* Net Result Highlight Card */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            report.netCashChange >= 0
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
          }`}>
            <div>
              <span className="text-xs font-bold text-slate-400 block mb-0.5">
                صافي التغير المالي أثناء غيابك
              </span>
              <div className="text-2xl font-black">
                {report.netCashChange >= 0 ? '+' : ''}{formatCurrency(report.netCashChange)}
              </div>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              report.netCashChange >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              <Coins className="w-6 h-6" />
            </div>
          </div>

          {/* Factory Production Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-400" />
                إنتاج المصانع وخطوط التشغيل الآلية
              </span>
              <span className="text-xs font-bold text-amber-400">
                قيمة تقديرية: {formatCurrency(totalValueProduced)}
              </span>
            </div>

            {report.goodsProduced.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2 text-center">
                لم تنتج المصانع سلعاً خلال هذه الفترة (تحقق من كفاءة الماكينات أو توفر مساحة المستودع).
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {report.goodsProduced.map((g, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{g.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-white">{g.name}</div>
                        <div className="text-[11px] text-slate-400">+{g.quantity} {g.unit} للمخزن</div>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-400">
                      {formatCurrency(g.value)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Raw Materials Consumed & Auto-Purchased Breakdown */}
          {((report.materialsConsumed && report.materialsConsumed.length > 0) || (report.materialsAutoPurchased && report.materialsAutoPurchased.length > 0)) && (
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              {report.materialsConsumed && report.materialsConsumed.length > 0 && (
                <div>
                  <span className="text-xs font-extrabold text-amber-300 block mb-2">
                    📦 مواد خام تم استهلاكها في خطوط الإنتاج:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {report.materialsConsumed.map((m, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                        {m.name}: <strong className="text-amber-400">-{m.quantity} {m.unit}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {report.materialsAutoPurchased && report.materialsAutoPurchased.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-extrabold text-sky-400">
                      🛒 شراء آلي بتوجيه المدير التنفيذي:
                    </span>
                    <span className="text-xs font-bold text-rose-400">
                      تكلفة: -{formatCurrency(report.autoPurchaseTotalCost)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {report.materialsAutoPurchased.map((m, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-sky-950/40 border border-sky-800/40 text-[11px] text-sky-200">
                        {m.name}: +{m.quantity} {m.unit} ({formatCurrency(m.cost)})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Revenue & Deductions Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Passive returns */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-300">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>عوائد الودائع والأسهم المستمرة</span>
              </div>
              <div className="text-sm font-black text-emerald-400">
                +{formatCurrency(report.bankInterestEarned + report.passiveDividends)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                توزيعات نقدية تودع تلقائياً في حسابك
              </p>
            </div>

            {/* Expenses */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-300">
                <ReceiptText className="w-4 h-4 text-rose-400" />
                <span>رواتب الموظفين وصيانة المصانع</span>
              </div>
              <div className="text-sm font-black text-rose-400">
                -{formatCurrency(report.operatingExpensesDeducted)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                تم خصم مستحقات التشغيل تلقائياً
              </p>
            </div>
          </div>

          {/* Urgent Loan Alert if any */}
          {report.urgentObligationsCount > 0 && (
            <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center gap-3 text-amber-200 text-xs">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                تنبيه عاجل: لديك <strong>{report.urgentObligationsCount} أقساط أو قروض بنكية</strong> اقترب موعد استحقاقها. تفقد صالة البنك لتجنب غرامات التعثر!
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleClaim}
            className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>استلام الأرباح والسلع المجمعة</span>
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs active:scale-[0.98] transition"
          >
            إغلاق المراجعة
          </button>
        </div>
      </div>
    </div>
  );
};
