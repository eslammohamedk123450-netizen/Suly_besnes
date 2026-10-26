import { useState } from 'react';
import type { PlayerProfile } from '../domain/player';
import { findCountry } from '../domain/countries';
import { formatMoney } from '../domain/formatters';
import { getCountryScenario } from '../game/countryScenarios';
import { AvatarPortrait } from './AvatarPortrait';
import { Building2, MapPin, Wallet, Sparkles, ArrowRight, ShieldCheck, Target, ChevronLeft } from 'lucide-react';

interface StoryIntroProps {
  profile: PlayerProfile;
  onComplete: () => void;
}

export function StoryIntro({ profile, onComplete }: StoryIntroProps) {
  const [slide, setSlide] = useState<1 | 2>(1);
  const country = findCountry(profile.countryId) ?? findCountry('egypt')!;
  const scenario = getCountryScenario(country.id);
  const elder = scenario.advisors.elder;
  const firstQuest = scenario.quests[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in" dir="rtl">
      <div className="w-full max-w-xl bg-slate-900 border-2 border-amber-500/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[92vh]">
        {/* Top bar with flag and skip */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{country.flag}</span>
            <div>
              <span className="text-[11px] text-amber-400 font-bold block">
                {country.name} · {scenario.scenarioTitle}
              </span>
              <h2 className="text-base sm:text-lg font-black text-white">
                انطلاق إمبراطورية الأعمال 👑
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onComplete}
            className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold border border-slate-700 transition cursor-pointer"
          >
            تخطي ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {slide === 1 ? (
            <div className="space-y-4 animate-fade-in">
              {/* Advisor & Mascot Card */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 flex items-center gap-3.5">
                <AvatarPortrait avatarId={profile.avatarId} size="md" />
                <div className="flex-1 text-right">
                  <div className="text-[11px] font-bold text-amber-400 mb-0.5">
                    {elder.name} · {elder.title}
                  </div>
                  <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
                    «أهلاً بك يا <strong>{profile.name}</strong>! تم تسجيلك رسمياً كرجل أعمال في أسواق {country.name}. سلّمناك الأصول التأسيسية كاملة، وسيرشدك مستشارك الذكي خطوة بخطوة بالأسهم المضيئة.»
                  </p>
                </div>
              </div>

              {/* 3 Core Starting Assets */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Cash */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-950/90 to-slate-900 border border-emerald-500/40 text-right">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                    <Wallet className="w-4 h-4 text-emerald-400" />
                    السيولة النقدية
                  </span>
                  <strong className="text-base font-black text-emerald-300 block">
                    {formatMoney(profile.bankBalance, country)}
                  </strong>
                  <span className="text-[10px] text-cyan-300 font-bold mt-1 block">
                    +{profile.diamonds} ألماسة احتياطية
                  </span>
                </div>

                {/* Inherited Factory */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-950/90 to-slate-900 border border-amber-500/40 text-right">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    المصنع الموروث
                  </span>
                  <strong className="text-xs sm:text-sm font-bold text-amber-300 block truncate">
                    {scenario.economicProfile.inheritedFactoryName}
                  </strong>
                  <span className="text-[10px] text-rose-300 font-bold mt-1 block">
                    الكفاءة: 25% (يحتاج صيانة)
                  </span>
                </div>

                {/* Registered Land */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-950/90 to-slate-900 border border-green-500/40 text-right">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                    <MapPin className="w-4 h-4 text-green-400" />
                    الأرض الصناعية
                  </span>
                  <strong className="text-xs sm:text-sm font-bold text-green-300 block truncate">
                    {scenario.economicProfile.inheritedLandName}
                  </strong>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {country.name} · مسجلة باسمك
                  </span>
                </div>
              </div>

              {/* First Quest Preview */}
              {firstQuest && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-right space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                    <span className="flex items-center gap-1.5">
                      <Target className="w-4 h-4" />
                      مهمتك الأولى: {firstQuest.title}
                    </span>
                    <span className="text-emerald-400 font-mono">
                      +{formatMoney(firstQuest.cashReward, country)}
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs">
                    {firstQuest.shortDescription}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in text-right">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/40 space-y-2">
                <span className="text-xs font-black text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  دورة الأرباح والإرشاد الميداني
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  سيرشدك الروبوت المساعد بأسهم النيون وحلقات النبض المشعة لتنفيذ 4 خطوات أساسية:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <strong className="text-amber-300 block">1. صيانة الماكينات</strong>
                    <span className="text-[11px] text-slate-400">رفع الكفاءة إلى 100%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <strong className="text-emerald-300 block">2. سداد القرض</strong>
                    <span className="text-[11px] text-slate-400">تأمين الطاقة والتشغيل</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <strong className="text-cyan-300 block">3. تشغيل الإنتاج</strong>
                    <span className="text-[11px] text-slate-400">تصنيع البضائع للبيع</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <strong className="text-yellow-300 block">4. جمع كل الأرباح</strong>
                    <span className="text-[11px] text-slate-400">سحب الأرباح لخزينتك</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Button Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>حفظ تقدمك محلياً على هذا الجهاز</span>
          </div>

          <div className="flex items-center gap-2">
            {slide === 1 ? (
              <button
                type="button"
                onClick={() => setSlide(2)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition flex items-center gap-1 cursor-pointer"
              >
                <span>التالي: خطة العمل</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setSlide(1)}
                className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                السابق
              </button>
            )}

            <button
              type="button"
              onClick={onComplete}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span>انطلق لبدء الجولة التوجيهية 🚀</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
