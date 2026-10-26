import { useState } from 'react';
import type { PlayerProfile } from '../domain/player';
import { findCountry } from '../domain/countries';
import { formatMoney } from '../domain/formatters';
import { getCountryScenario } from '../game/countryScenarios';
import { AvatarPortrait } from './AvatarPortrait';
import { Icon } from './Icon';

interface StoryIntroProps {
  profile: PlayerProfile;
  onComplete: () => void;
}

export function StoryIntro({ profile, onComplete }: StoryIntroProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const country = findCountry(profile.countryId) ?? findCountry('egypt')!;
  const scenario = getCountryScenario(country.id);
  const elder = scenario.advisors.elder;
  const ops = scenario.advisors.operations;
  const firstQuest = scenario.quests[0];

  const steps = [
    {
      id: 'catastrophe',
      badge: `${country.flag} ${country.name} · ${scenario.scenarioTitle}`,
      title: 'بداية الفصل الأول واستلام الأصول التأسيسية',
      icon: 'crown' as const,
    },
    {
      id: 'financial_clarity',
      badge: `الوضع الائتماني · ${scenario.economicProfile.bankName}`,
      title: 'حقيقة الوضع المالي ومهلة القرض الموروث',
      icon: 'bank' as const,
    },
    {
      id: 'roadmap',
      badge: `خريطة الصعود · 10 مراحل في ${country.name}`,
      title: 'المراحل العشر لفتح أنظمة الإمبراطورية',
      icon: 'tasks' as const,
    },
    {
      id: 'first_action',
      badge: 'المهمة الرئيسية الأولى · التدريب العملي',
      title: `${firstQuest?.title ?? 'صيانة المصنع الموروث'} والانطلاق`,
      icon: 'factory' as const,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-3 sm:p-6" dir="rtl">
      <div className="w-full max-w-3xl bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl flex flex-col">
        {/* Top Header with Progress */}
        <header className="p-4 sm:p-6 border-b border-slate-800/80 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Icon name={steps[currentStep].icon} size={22} />
            </div>
            <div>
              <span className="text-xs text-amber-400 font-semibold tracking-wide block">
                {steps[currentStep].badge}
              </span>
              <h1 className="text-lg sm:text-xl font-black text-white">
                {steps[currentStep].title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onComplete}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              title="تخطي المقدمة وبدء الفصل الأول"
            >
              <span>تخطي المقدمة ✕</span>
            </button>
            <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-700/60 text-xs">
              <span className="text-slate-400">مشهد</span>
              <span className="font-extrabold text-amber-400">{currentStep + 1}</span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-400">{steps.length}</span>
            </div>
          </div>
        </header>

        {/* Step Progress Bar */}
        <nav aria-label="خطوات المقدمة القصصية" className="flex items-center gap-1.5 px-4 sm:px-6 pt-4">
          {steps.map((step, idx) => (
            <button
              key={step.id}
              type="button"
              onClick={() => setCurrentStep(idx)}
              className={`flex-1 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentStep
                  ? 'bg-amber-400 shadow-md shadow-amber-500/50 scale-y-125'
                  : idx < currentStep
                  ? 'bg-emerald-500/80'
                  : 'bg-slate-800'
              }`}
              title={step.title}
              aria-label={step.title}
            />
          ))}
        </nav>

        {/* Step Content */}
        <section className="p-5 sm:p-8 flex-1 overflow-y-auto max-h-[68vh]">
          {/* STEP 1: Country Story & Actual Starting Assets */}
          {currentStep === 0 && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 flex flex-col sm:flex-row gap-4 items-center">
                <AvatarPortrait avatarId={profile.avatarId} size="lg" />
                <div className="text-right flex-1">
                  <div className="text-xs font-bold text-amber-400 mb-1">
                    {elder.name} · {elder.title}
                  </div>
                  <blockquote className="text-slate-200 text-sm sm:text-base leading-relaxed border-r-2 border-amber-500 pr-3">
                    «أهلاً بك يا <strong>{profile.name}</strong> في <strong>{scenario.economicProfile.industrialHub}</strong>! {country.storySummary} لقد حفظنا لك أصول البداية القانونية: <strong>{formatMoney(profile.bankBalance, country)}</strong> سيولة حرة، وملكية <strong>{scenario.economicProfile.inheritedFactoryName}</strong> على <strong>{scenario.economicProfile.inheritedLandName}</strong>.»
                  </blockquote>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-right">
                  <span className="text-xs text-slate-400 block mb-1">السيولة المستلمة فعلياً</span>
                  <strong className="text-lg text-emerald-400 font-black">{formatMoney(profile.bankBalance, country)}</strong>
                  <p className="text-[11px] text-slate-400 mt-1">+ {profile.diamonds} ماسة احتياطية في خزينتك</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-right">
                  <span className="text-xs text-slate-400 block mb-1">المصنع والأرض المستلمة</span>
                  <strong className="text-sm text-amber-400 font-black block">{scenario.economicProfile.inheritedFactoryName}</strong>
                  <p className="text-[11px] text-slate-400 mt-1">كفاءة المعدات 25% — يحتاج صيانة عاجلة لرفع الجودة</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-right">
                  <span className="text-xs text-slate-400 block mb-1">الخصائص الاقتصادية لـ {country.name}</span>
                  <strong className="text-sm text-cyan-400 font-black block">
                    ضريبة {Math.round(country.economy.taxRate * 100)}% · تشغيل {country.economy.operatingCostMultiplier}x
                  </strong>
                  <p className="text-[11px] text-slate-400 mt-1">{scenario.economicProfile.portHub}</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Financial Clarity */}
          {currentStep === 1 && (
            <div className="space-y-4 text-right">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm leading-relaxed">
                <strong className="text-amber-400 block mb-1 font-bold">
                  إيجاز المستشار المالي ({scenario.advisors.finance.name}):
                </strong>
                قواعدك المالية في {country.name} واضحة منذ اللحظة الأولى دون أي مفاجآت مخفية:
              </div>

              <div className="space-y-3">
                <article className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3.5">
                  <span className="text-2xl">🔒</span>
                  <div>
                    <strong className="text-white text-sm sm:text-base block mb-1">
                      1. التجميد المؤقت لدى {scenario.economicProfile.bankName} (يفتح في المستوى 4)
                    </strong>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                      بسبب تعثر الإدارة السابقة، لا تتاح القروض الجديدة أو الودائع حتى تنجز أول عقد تجاري ناجح أو تصل إلى المستوى 4، ولن يزعجك أي إشعار بنكي قبل فتح القسم.
                    </p>
                  </div>
                </article>

                <article className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3.5">
                  <span className="text-2xl">⏳</span>
                  <div>
                    <strong className="text-white text-sm sm:text-base block mb-1">
                      2. القرض الموروث (5,250 $) مشمول بمهلة سماح 7 أيام
                    </strong>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                      أول استحقاق للقرض الموروث في اليوم 8 بقيمة قسط 750 $، ويمكنك فحصه وسداد دفعة مبكرة منه في أي وقت عبر قسم <strong>الالتزامات</strong> المتاح لك منذ اليوم الأول.
                    </p>
                  </div>
                </article>

                <article className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3.5">
                  <span className="text-2xl">👥</span>
                  <div>
                    <strong className="text-white text-sm sm:text-base block mb-1">
                      3. الرواتب التنفيذية صفر حالياً حتى المستوى 5
                    </strong>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                      يعمل مصنعك التأسيسي بتشغيل ذاتي منخفض التكلفة دون كادر إداري مكلف حتى تفتح قسم الإدارة والرواتب في المستوى 5 وتختار التوظيف بنفسك.
                    </p>
                  </div>
                </article>
              </div>
            </div>
          )}

          {/* STEP 3: 10 Stages Progression Roadmap */}
          {currentStep === 2 && (
            <div className="space-y-3 text-right">
              <p className="text-slate-300 text-xs sm:text-sm">
                خارطة المراحل العشر المترابطة لسيناريو <strong>{country.name}</strong> (كل مرحلة تفتح أنظمة ومهام جديدة بناءً على إنجازك الفعلي):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {scenario.stages.map((stage) => (
                  <div
                    key={stage.stageNumber}
                    className={`p-3 rounded-xl border ${
                      stage.stageNumber === 1
                        ? 'bg-emerald-950/30 border-emerald-500/40'
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <strong className="text-xs font-black text-white">
                        المرحلة {stage.stageNumber}: {stage.title}
                      </strong>
                      <span className="text-[10px] text-amber-300 font-mono">
                        مستوى {stage.requiredLevel}+
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{stage.focus}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Chapter 1 & First Main Quest */}
          {currentStep === 3 && (
            <div className="space-y-4 text-right">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-sm leading-relaxed">
                <strong className="text-emerald-400 font-bold block mb-1">
                  {ops.name} ({ops.title}):
                </strong>
                «سأرافقك الآن عبر نظام الإرشاد التفاعلي خطوة بخطوة: سنشير بالسهم الذهبي إلى كل زر ولوحة مطلوبة، لكنك أنت من سينفذ الصيانة، السداد، الشراء، والإنتاج بيدك!»
              </div>

              <div className="space-y-2.5">
                {scenario.quests.slice(0, 4).map((q) => (
                  <div key={q.id} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
                    <span className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                      {q.stepNumber}
                    </span>
                    <div>
                      <strong className="text-white text-xs sm:text-sm block">{q.title}</strong>
                      <p className="text-slate-400 text-xs mt-0.5">{q.shortDescription}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Footer Actions */}
        <footer className="p-4 sm:p-6 border-t border-slate-800/80 bg-slate-950/70 flex items-center justify-between gap-3">
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold transition-all border border-slate-700 cursor-pointer"
            >
              السابق
            </button>
          ) : (
            <div />
          )}

          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev + 1)}
              className="inline-flex items-center gap-2 px-5 sm:px-7 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              التالي <Icon name="arrow" size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={onComplete}
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 text-xs sm:text-sm font-black shadow-xl shadow-emerald-500/25 transition-all cursor-pointer"
            >
              ابدء الفصل الأول والمهمة الرئيسية الأولى 🚀
            </button>
          )}
        </footer>
      </div>
    </main>
  );
}
