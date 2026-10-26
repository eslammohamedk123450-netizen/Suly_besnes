import React, { useRef, useState } from 'react';
import type { CountryStoryQuest, ScenarioAdvisor } from '../game/countryScenarios';
import { Icon } from './Icon';
import { useDialogA11y } from './useDialogA11y';

interface QuestBriefingModalProps {
  quest: CountryStoryQuest;
  advisor: ScenarioAdvisor;
  countryName: string;
  countryFlag: string;
  isReplay?: boolean;
  onSkip: () => void;
  onStartExecution: () => void;
}

function AdvisorPortrait({ advisor }: { advisor: ScenarioAdvisor }) {
  const palette =
    advisor.role === 'elder'
      ? { bg1: '#451a03', bg2: '#78350f', suit: '#1c1917', accent: '#f59e0b' }
      : advisor.role === 'operations'
        ? { bg1: '#082f49', bg2: '#0e7490', suit: '#0f172a', accent: '#38bdf8' }
        : advisor.role === 'finance'
          ? { bg1: '#064e3b', bg2: '#047857', suit: '#022c22', accent: '#34d399' }
          : { bg1: '#1e1b4b', bg2: '#4338ca', suit: '#0f172a', accent: '#a78bfa' };

  return (
    <div
      className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-amber-400/50 shadow-lg shrink-0 bg-slate-900 flex items-center justify-center"
      aria-label={`${advisor.name} - ${advisor.title}`}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`adv-bg-${advisor.id}`} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor={palette.bg1} />
            <stop offset="1" stopColor={palette.bg2} />
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="18" fill={`url(#adv-bg-${advisor.id})`} />
        <circle cx="50" cy="32" r="28" fill={palette.accent} fillOpacity="0.16" />
        <path d="M12 96 C12 68, 28 60, 50 60 C72 60, 88 68, 88 96 Z" fill={palette.suit} />
        <polygon points="42,60 58,60 54,80 50,85 46,80" fill="#f8fafc" />
        <polygon points="48,62 52,62 54,80 50,90 46,80" fill={palette.accent} />
        <rect x="44" y="46" width="12" height="16" rx="4" fill="#fed7aa" />
        <path d="M33 37 C33 24, 67 24, 67 37 C67 52, 57 58, 50 58 C43 58, 33 52, 33 37 Z" fill="#fed7aa" />
        <path d="M30 33 C28 18, 44 13, 53 14 C64 14, 71 21, 69 33 C64 25, 48 23, 40 27 C35 29, 31 31, 30 33 Z" fill="#1e293b" />
        {advisor.role === 'operations' && (
          <path d="M29 31 C30 18, 70 18, 71 31 L27 31 Z" fill="#f59e0b" />
        )}
        <ellipse cx="43" cy="38" rx="2.4" ry="1.5" fill="#0f172a" />
        <ellipse cx="57" cy="38" rx="2.4" ry="1.5" fill="#0f172a" />
        <path d="M45 49 Q50 53 55 49" stroke="#7c2d12" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-slate-950/90 text-[10px] font-black text-amber-300 border border-amber-500/30">
        {advisor.initials}
      </span>
    </div>
  );
}

export const QuestBriefingModal: React.FC<QuestBriefingModalProps> = ({
  quest,
  advisor,
  countryName,
  countryFlag,
  isReplay = false,
  onSkip,
  onStartExecution,
}) => {
  const [pageIndex, setPageIndex] = useState(0);
  const dialogRef = useRef<HTMLElement | null>(null);
  useDialogA11y(dialogRef, onSkip);

  const pages = quest.briefing.pages;
  const isLastPage = pageIndex >= pages.length - 1;

  return (
    <div
      className="fixed inset-0 z-[9995] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5"
      dir="rtl"
      onClick={onSkip}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quest-briefing-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Top Bar */}
        <header className="px-4 sm:px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span>{countryFlag}</span>
            <span>{countryName}</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-400 font-bold">
              المرحلة {quest.stageNumber} · المهمة {quest.stepNumber}
            </span>
            {isReplay && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-cyan-300">إعادة عرض الإيجاز</span>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={onSkip}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition cursor-pointer"
          >
            تخطي الحوار ✕
          </button>
        </header>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Title */}
          <div>
            <h2 id="quest-briefing-title" className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span>{quest.icon}</span>
              <span>{quest.title}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">{quest.shortDescription}</p>
          </div>

          {/* Advisor Character & Paginated Dialogue */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start gap-4">
            <AdvisorPortrait advisor={advisor} />
            <div className="flex-1 min-w-0 w-full">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div>
                  <strong className="text-sm font-black text-amber-300 block">{advisor.name}</strong>
                  <span className="text-[11px] text-slate-400">{advisor.title}</span>
                </div>
                {pages.length > 1 && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    حوار {pageIndex + 1} / {pages.length}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-100 leading-relaxed bg-slate-900/90 p-3 rounded-lg border border-slate-800/90">
                «{pages[pageIndex]}»
              </p>

              {pages.length > 1 && (
                <div className="flex items-center justify-between mt-2.5">
                  <button
                    type="button"
                    disabled={pageIndex === 0}
                    onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                    className="text-xs font-bold text-slate-300 disabled:opacity-40 hover:text-white px-2.5 py-1 rounded bg-slate-800 border border-slate-700 cursor-pointer disabled:cursor-not-allowed"
                  >
                    السابق
                  </button>
                  <div className="flex items-center gap-1">
                    {pages.map((_, idx) => (
                      <span
                        key={idx}
                        className={`h-1.5 rounded-full transition-all ${
                          idx === pageIndex ? 'w-5 bg-amber-400' : 'w-1.5 bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled={isLastPage}
                    onClick={() => setPageIndex((p) => Math.min(pages.length - 1, p + 1))}
                    className="text-xs font-bold text-amber-300 disabled:opacity-40 hover:text-amber-200 px-2.5 py-1 rounded bg-slate-800 border border-amber-500/30 cursor-pointer disabled:cursor-not-allowed"
                  >
                    التالي ←
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Operational Briefing Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-right">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <strong className="text-xs font-bold text-emerald-400 block mb-1">الهدف التنفيذي</strong>
              <p className="text-xs text-slate-200 leading-relaxed">{quest.briefing.goal}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <strong className="text-xs font-bold text-cyan-400 block mb-1">الأهمية الاقتصادية</strong>
              <p className="text-xs text-slate-200 leading-relaxed">{quest.briefing.whyItMatters}</p>
            </div>
          </div>

          {/* Practical Steps */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <strong className="text-xs font-bold text-amber-300 block mb-2">خطوات التنفيذ العملية (تُنفَّذ بيدك داخل القسم):</strong>
            <ol className="space-y-1.5">
              {quest.briefing.steps.map((step, idx) => (
                <li key={step} className="flex items-start gap-2 text-xs text-slate-200">
                  <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Resources, Expected Outcome & Risk */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block mb-0.5 font-semibold">الموارد والسيولة المطلوبة</span>
              <strong className="text-slate-100 font-bold leading-snug block">{quest.briefing.requiredResources}</strong>
            </div>
            <div className="p-3 rounded-xl bg-emerald-950/25 border border-emerald-500/25">
              <span className="text-emerald-300/80 block mb-0.5 font-semibold">النتيجة المتوقعة</span>
              <strong className="text-emerald-200 font-bold leading-snug block">{quest.briefing.expectedOutcome}</strong>
            </div>
            <div className="p-3 rounded-xl bg-rose-950/25 border border-rose-500/25">
              <span className="text-rose-300/80 block mb-0.5 font-semibold">تحذير المخاطر</span>
              <strong className="text-rose-200 font-bold leading-snug block">{quest.briefing.riskWarning}</strong>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-4 sm:px-6 py-3.5 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400">
            مكافأة الإنجاز الفعلي: <strong className="text-emerald-400">+{quest.cashReward.toLocaleString('ar-EG')} $</strong> ·{' '}
            <strong className="text-cyan-300">+{quest.diamondReward} ماسة</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSkip}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition cursor-pointer"
            >
              إغلاق بدون تنفيذ
            </button>
            <button
              type="button"
              onClick={onStartExecution}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>ابدأ التنفيذ العملي</span>
              <Icon name="arrow" size={15} />
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
};
