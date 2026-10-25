import React from 'react';
import { 
  Landmark, 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  Flame, 
  Coins, 
  ShieldCheck, 
  AlertCircle, 
  ArrowUpRight, 
  X,
  ExternalLink
} from 'lucide-react';
import type { PlayerProfile } from '../domain/player';
import type { SectionId } from '../domain/navigation';
import { getCurrentCentralBankShock } from '../game/centralBankEngine';
import { formatCurrency } from '../domain/formatters';
import { triggerHaptic } from '../services/nativeMobileService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  onNavigate?: (section: SectionId) => void;
}

export const CentralBankModal: React.FC<Props> = ({
  isOpen,
  onClose,
  profile,
  onNavigate,
}) => {
  if (!isOpen) return null;

  const shock = getCurrentCentralBankShock(profile.day);

  const handleAction = (section: SectionId) => {
    triggerHaptic('light');
    onClose();
    if (onNavigate) {
      onNavigate(section);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fade-in"
      dir="rtl"
      onClick={onClose}
    >
      <div 
        className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/40 rounded-3xl max-w-2xl w-full p-5 sm:p-7 text-slate-100 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/20 font-black text-2xl">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  بيان البنك المركزي ولجنة السياسة النقدية
                </h3>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                  رسمي • اليوم {profile.day}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                النشرة الاقتصادية الدورية لتأثير الفائدة والتضخم على استثماراتك
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto space-y-4 my-4 pr-1 pl-1 scrollbar-thin">
          {/* Breaking News Banner */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/30 flex items-start gap-3">
            <span className="text-2xl shrink-0">📢</span>
            <div>
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                شريط الأخبار العاجلة للأسواق
              </div>
              <p className="text-sm font-black text-white mt-0.5">
                {shock.newsHeadline}
              </p>
            </div>
          </div>

          {/* Official Decree Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Landmark className="w-4 h-4" />
                نص القرار التنفيذي الصادر عن محافظ البنك
              </span>
              <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                {shock.badge}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              "{shock.officialStatement}"
            </p>
          </div>

          {/* Macro Indicators Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block mb-1">سعر الفائدة الأساسي</span>
              <div className="text-lg font-black text-emerald-400 flex items-center justify-center gap-1">
                <Percent className="w-4 h-4" />
                <span>{shock.interestRate}%</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block mb-1">معدل التضخم السنوي</span>
              <div className="text-lg font-black text-rose-400 flex items-center justify-center gap-1">
                <Flame className="w-4 h-4" />
                <span>{shock.inflationRate}%</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block mb-1">مؤشر البورصة العام</span>
              <div className={`text-lg font-black flex items-center justify-center gap-1 ${
                shock.stockIndexChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {shock.stockIndexChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{shock.stockIndexChange >= 0 ? '+' : ''}{shock.stockIndexChange}%</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block mb-1">معامل أسعار الخامات</span>
              <div className="text-lg font-black text-amber-400 flex items-center justify-center gap-1">
                <span>×{shock.rawMaterialMultiplier}</span>
              </div>
            </div>
          </div>

          {/* Impact Matrix & Strategic Advice */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              كيف يؤثر هذا القرار مباشرة على إمبراطوريتك الآن؟
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span>عائد الودائع البنكية الحالية:</span>
                <strong className="text-emerald-400">
                  {Math.round(12 * shock.depositYieldMultiplier)}% سنوياً (معدل متكيف)
                </strong>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span>تكلفة الفائدة على القروض الجديدة:</span>
                <strong className={shock.loanCostMultiplier > 1 ? 'text-rose-400' : 'text-emerald-400'}>
                  {Math.round(10 * shock.loanCostMultiplier)}% سنوياً
                </strong>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span>تقييم أسهمك والشركات بالبورصة:</span>
                <strong className="text-amber-400">
                  {shock.stockMarketMultiplier > 1 ? `+${Math.round((shock.stockMarketMultiplier - 1) * 100)}% صعود` : `${Math.round((shock.stockMarketMultiplier - 1) * 100)}% تصحيح`}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Quick Access */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-slate-400">
            استغل الظروف الاقتصادية واقتنص الفرص:
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAction('bank')}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Coins className="w-3.5 h-3.5" />
              صالة البنك
            </button>
            <button
              onClick={() => handleAction('investments')}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              البورصة
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs transition"
            >
              حسناً، فهمت
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
