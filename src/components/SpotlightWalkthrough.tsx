import React, { useEffect, useState, useRef, useCallback } from 'react';
import type { SectionId } from '../domain/navigation';
import type { PlayerProfile } from '../domain/player';
import { WALKTHROUGH_STEPS, type WalkthroughStep } from '../game/walkthroughState';
import { playSound } from '../game/soundEffects';
import {
  Sparkles,
  ArrowRight,
  FastForward,
  Wrench,
  DollarSign,
  LandPlot,
  Factory,
  Trophy,
  CheckCircle2,
  Eye,
  Minimize2,
  Maximize2,
  Compass,
  Store,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface SpotlightWalkthroughProps {
  currentStepIndex: number;
  profile: PlayerProfile;
  onStepComplete: () => void;
  onSkip: () => void;
  onNavigate: (section: SectionId) => void;
  currentSection: SectionId;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const CATEGORY_ICONS: Record<WalkthroughStep['category'], React.ReactNode> = {
  maintenance: <Wrench className="w-5 h-5 text-amber-400" />,
  obligations: <DollarSign className="w-5 h-5 text-emerald-400" />,
  lands: <LandPlot className="w-5 h-5 text-sky-400" />,
  production: <Factory className="w-5 h-5 text-amber-400" />,
  tasks: <Trophy className="w-5 h-5 text-yellow-400" />,
  store: <Store className="w-5 h-5 text-cyan-400" />,
};

export function SpotlightWalkthrough({
  currentStepIndex,
  profile,
  onStepComplete,
  onSkip,
  onNavigate,
  currentSection,
}: SpotlightWalkthroughProps) {
  const currentStep = WALKTHROUGH_STEPS[currentStepIndex];
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [isElementVisible, setIsElementVisible] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hasActionSucceeded, setHasActionSucceeded] = useState(false);
  const targetElementRef = useRef<HTMLElement | null>(null);
  const lastStepIndexRef = useRef(currentStepIndex);

  // Reset completion state when step changes
  useEffect(() => {
    if (lastStepIndexRef.current !== currentStepIndex) {
      lastStepIndexRef.current = currentStepIndex;
      setHasActionSucceeded(false);
      setIsCollapsed(false);
    }
  }, [currentStepIndex]);

  // Check if current step condition is satisfied
  useEffect(() => {
    if (!currentStep) return;
    if (!hasActionSucceeded && currentStep.isComplete?.(profile)) {
      setHasActionSucceeded(true);
      try {
        playSound('success');
      } catch {
        // Audio safe
      }
    }
  }, [profile, currentStep, hasActionSucceeded]);

  // Navigate to target section if player is elsewhere and hasn't completed
  const handleGoToTarget = useCallback(() => {
    if (!currentStep) return;
    if (currentSection !== currentStep.sectionId) {
      onNavigate(currentStep.sectionId);
    }
  }, [currentStep, currentSection, onNavigate]);

  // Play step prompt sound on step change
  useEffect(() => {
    if (!currentStep) return;
    try {
      playSound(currentStep.soundEffect);
    } catch {
      // Audio safe
    }
  }, [currentStepIndex]);

  // Track target element position without blocking interaction
  const updatePosition = useCallback(() => {
    if (!currentStep) return;
    const el = document.querySelector<HTMLElement>(currentStep.targetSelector);
    if (el) {
      targetElementRef.current = el;
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
        setIsElementVisible(true);
        return;
      }
    }
    setIsElementVisible(false);
  }, [currentStep]);

  useEffect(() => {
    updatePosition();
    const interval = setInterval(updatePosition, 350);

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [updatePosition]);

  if (!currentStep) return null;

  const totalSteps = WALKTHROUGH_STEPS.length;
  const isTargetInSection = currentSection === currentStep.sectionId;

  return (
    <div
      className="fixed inset-0 z-[9990] pointer-events-none select-none overflow-hidden"
      dir="rtl"
      aria-label="المرشد التفاعلي للاستكشاف والمهام"
    >
      {/* 1. Subtle, non-blocking highlight ring around target button if visible in current section */}
      {isTargetInSection && targetRect && isElementVisible && !hasActionSucceeded && (
        <div
          className="fixed pointer-events-none z-[9992] rounded-xl ring-4 ring-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.7)] animate-pulse transition-all duration-200"
          style={{
            top: `${Math.max(4, targetRect.top - 6)}px`,
            left: `${Math.max(4, targetRect.left - 6)}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`,
          }}
        >
          {/* Animated pointer callout tag */}
          <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-xl flex items-center gap-1.5 whitespace-nowrap animate-bounce border border-slate-950">
            <span>🎯 اضغط هنا للمتابعة</span>
          </div>
        </div>
      )}

      {/* 2. Floating Interactive Mission Guide Card */}
      <div className="fixed bottom-3 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:w-[480px] pointer-events-auto z-[9995] transition-all duration-300">
        {isCollapsed ? (
          /* Minimized Compact Pill for Full Unobstructed Exploration */
          <div
            onClick={() => setIsCollapsed(false)}
            className="p-3 rounded-2xl bg-slate-900/95 border-2 border-amber-500/60 shadow-2xl flex items-center justify-between gap-3 backdrop-blur-md cursor-pointer hover:border-amber-400 transition group"
            title="انقر لتكبير بطاقة الإرشاد"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Compass className="w-4 h-4 animate-spin" />
              </div>
              <div className="text-right">
                <div className="text-xs font-black text-white flex items-center gap-1.5">
                  <span>وضع الاستكشاف المعرفي</span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    الخطوة {currentStepIndex + 1}/{totalSteps}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">{currentStep.title}</p>
              </div>
            </div>

            <button
              type="button"
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              aria-label="تكبير البطاقة"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Full Rich Discovery Guide Card */
          <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/80 rounded-3xl p-4 sm:p-5 shadow-2xl shadow-black/80 space-y-3 backdrop-blur-xl relative overflow-hidden">
            {/* Top Amber Ambient Ray */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Header: Phase Title + Step Counter + Controls */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shadow-inner">
                  {CATEGORY_ICONS[currentStep.category]}
                </div>
                <div className="text-right">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30 inline-block mb-0.5">
                    {currentStep.phaseBadge}
                  </span>
                  <h3 className="text-xs sm:text-sm font-black text-white">
                    {currentStep.title}
                  </h3>
                </div>
              </div>

              {/* Action Tools: Minimize & Skip */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsCollapsed(true)}
                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                  title="تصغير البطاقة لإتاحة مساحة للاستكشاف"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={onSkip}
                  className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1 rounded-lg hover:bg-slate-800/80 transition flex items-center gap-1"
                  title="تخطي الجولة والبدء فوراً"
                >
                  <span>تخطي</span>
                  <FastForward className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Content State A: Completed Action / Exploration Space */}
            {hasActionSucceeded ? (
              <div className="space-y-3 relative z-10 animate-fade-in">
                <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs sm:text-sm font-bold leading-relaxed flex items-start gap-2 shadow-inner">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-emerald-300 mb-1">{currentStep.successMessage}</strong>
                    <p className="text-xs text-slate-300 font-normal leading-relaxed">
                      {currentStep.explorationTip}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCollapsed(true)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>البقاء لاستكشاف المكان</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playSound('click');
                      onStepComplete();
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>متابعة للمهمة التالية</span>
                    <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  </button>
                </div>
              </div>
            ) : (
              /* Content State B: Active Guidance & Instruction */
              <div className="space-y-3 relative z-10">
                {/* Speech Bubble / Mission Statement */}
                <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs sm:text-sm font-bold leading-relaxed shadow-inner">
                  <span className="text-amber-400 ml-1 text-base">📢</span>
                  {currentStep.message}
                </div>

                {/* Sub-text explanation */}
                <p className="text-xs text-slate-300 leading-relaxed px-1">
                  {currentStep.subMessage}
                </p>

                {/* Target Navigation & Action Bar */}
                <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                  {!isTargetInSection ? (
                    <button
                      type="button"
                      onClick={handleGoToTarget}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Compass className="w-4 h-4" />
                      <span>توجّه إلى القسم المطلوب الآن 🎯</span>
                    </button>
                  ) : (
                    <div className="w-full flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold">
                        <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
                        <span className="line-clamp-1">{currentStep.actionPrompt}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setIsCollapsed(true)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition flex items-center gap-1"
                          title="تصغير والتجول بحرية"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                          <span>استكشاف حر</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (targetElementRef.current) {
                              targetElementRef.current.click();
                            }
                            setHasActionSucceeded(true);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition active:scale-95"
                          title="تنفيذ الإجراء المطلوب فوراً"
                        >
                          تنفيذ ⚡
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
