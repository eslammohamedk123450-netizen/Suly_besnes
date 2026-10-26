import { useState } from 'react';
import type { PlayerProfile } from '../domain/player';
import { findCountry } from '../domain/countries';
import { formatMoney } from '../domain/formatters';
import { getCountryScenario } from '../game/countryScenarios';
import { AvatarPortrait } from './AvatarPortrait';
import { Sparkles, Building2, MapPin, Wallet, ChevronDown, ChevronUp, ArrowRight, ShieldCheck, Target } from 'lucide-react';

interface StoryIntroProps {
  profile: PlayerProfile;
  onComplete: () => void;
}

export function StoryIntro({ profile, onComplete }: StoryIntroProps) {
  const [showDetails, setShowDetails] = useState(false);
  const country = findCountry(profile.countryId) ?? findCountry('egypt')!;
  const scenario = getCountryScenario(country.id);
  const elder = scenario.advisors.elder;
  const firstQuest = scenario.quests[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in" dir="rtl">
      <div className="w-full max-w-xl bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[92vh]">
        {/* Compact Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{country.flag}</span>
            <div>
              <span className="text-[11px] text-amber-400 font-bold block">
                {country.name} · {scenario.scenarioTitle}
              </span>
              <h2 className="text-base sm:text-lg font-black text-white">
                الإيجاز التنفيذي لبدء إمبراطورية الأعمال
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onComplete}
            className="text-xs px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold border border-slate-700 transition"
          >
            تخطي ✕
          </button>
        </div>

        {/* Executive Summary Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Advisor Intro Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 flex items-center gap-3.5">
            <AvatarPortrait avatarId={profile.avatarId} size="md" />
            <div className="flex-1 text-right">
              <div className="text-[11px] font-bold text-amber-400 mb-0.5">
                {elder.name} · {elder.title}
              </div>
              <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
                «مرحباً بك يا <strong>{profile.name}</strong>! سلّمناك الأصول القانونية الأولية كاملة: السيولة النقدية، المصنع الموروث، والأرض المسجلة باسمك. مهمتك الأولى هي إعادة تشغيل خط الإنتاج وتحقيق أول أرباح فعلية.»
              </p>
            </div>
          </div>

          {/* Starting Assets Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-400 flex items-center gap-1 mb-1">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                السيولة الحرة
              </span>
              <strong className="text-sm sm:text-base text-emerald-400 font-black block">
                {formatMoney(profile.bankBalance, country)}
              </strong>
              <span className="text-[10px] text-cyan-400 font-bold mt-0.5 block">
                + {profile.diamonds} ماسات احتياطية
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-400 flex items-center gap-1 mb-1">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                المصنع التأسيسي
              </span>
              <strong className="text-xs sm:text-sm text-amber-300 font-bold block truncate">
                {scenario.economicProfile.inheritedFactoryName}
              </strong>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                كفاءة المعدات: 25% (يحتاج صيانة)
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-400 flex items-center gap-1 mb-1">
                <MapPin className="w-3.5 h-3.5 text-green-400" />
                الأرض المسجلة
              </span>
              <strong className="text-xs sm:text-sm text-green-300 font-bold block truncate">
                {scenario.economicProfile.inheritedLandName}
              </strong>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {country.name} · ملكية تامة
              </span>
            </div>
          </div>

          {/* First Mission Preview Card */}
          {firstQuest && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-right space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                <span className="flex items-center gap-1.5">
                  <Target className="w-4 h-4" />
                  المهمة الأولى: {firstQuest.title}
                </span>
                <span className="text-emerald-400 font-mono">
                  +{formatMoney(firstQuest.cashReward, country)} · +{firstQuest.diamondReward} 💎
                </span>
              </div>
              <p className="text-slate-300 text-xs">
                {firstQuest.shortDescription}
              </p>
            </div>
          )}

          {/* Expandable Technical Details Button */}
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full text-center text-xs text-slate-400 hover:text-amber-300 py-1 flex items-center justify-center gap-1 transition"
          >
            <span>{showDetails ? 'إخفاء المؤشرات الاقتصادية التفصيلية' : 'عرض المؤشرات الاقتصادية التفصيلية للدولة'}</span>
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Expandable Panel */}
          {showDetails && (
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs text-slate-300 animate-fade-in">
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">الضريبة المفروضة على المبيعات:</span>
                <strong className="text-amber-300 font-mono">{Math.round(country.economy.taxRate * 100)}%</strong>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">معامل تكاليف التشغيل والصيانة:</span>
                <strong className="text-amber-300 font-mono">{country.economy.operatingCostMultiplier}x</strong>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">المركز الصناعي الإقليمي:</span>
                <strong className="text-slate-200">{scenario.economicProfile.industrialHub}</strong>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">ميناء التصدير اللوجستي:</span>
                <strong className="text-slate-200">{scenario.economicProfile.portHub}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Footer Single Action Button */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>بيانات المحفظة مؤمنة ومحفوظة بنجاح</span>
          </div>

          <button
            type="button"
            onClick={onComplete}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <span>استلام الإيجاز والبدء في المهام</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
