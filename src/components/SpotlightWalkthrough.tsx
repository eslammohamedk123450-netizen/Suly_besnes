import React, { useEffect, useState, useRef, useCallback } from 'react';
import type { SectionId } from '../domain/navigation';
import type { PlayerProfile } from '../domain/player';
import { WALKTHROUGH_STEPS, type WalkthroughStep } from '../game/walkthroughState';
import { playSound } from '../game/soundEffects';
import {
  Sparkles,
  ArrowLeft,
  FastForward,
  Wrench,
  DollarSign,
  LandPlot,
  Factory,
  Trophy,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Compass,
  Store,
  LocateFixed,
  HelpCircle
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
  const [navTargetRect, setNavTargetRect] = useState<TargetRect | null>(null);
  const [isElementVisible, setIsElementVisible] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hasActionSucceeded, setHasActionSucceeded] = useState(false);
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState<number | null>(null);
  const targetElementRef = useRef<HTMLElement | null>(null);
  const lastStepIndexRef = useRef(currentStepIndex);
  const hasScrolledRef = useRef(false);

  // Reset completion state when step changes
  useEffect(() => {
    if (lastStepIndexRef.current !== currentStepIndex) {
      lastStepIndexRef.current = currentStepIndex;
      setHasActionSucceeded(false);
      setIsCollapsed(false);
      hasScrolledRef.current = false;
      setAutoAdvanceTimer(null);
    }
  }, [currentStepIndex]);

  // Check if current step condition is satisfied naturally by the user
  useEffect(() => {
    if (!currentStep) return;
    if (!hasActionSucceeded && currentStep.isComplete?.(profile)) {
      setHasActionSucceeded(true);
      try {
        playSound('success');
      } catch {
        // Audio safe
      }
      // Start auto advance timer of 4 seconds so user can read or proceed manually
      setAutoAdvanceTimer(4);
    }
  }, [profile, currentStep, hasActionSucceeded]);

  // Countdown timer for auto advance on completion
  useEffect(() => {
    if (autoAdvanceTimer === null) return;
    if (autoAdvanceTimer <= 0) {
      onStepComplete();
      setAutoAdvanceTimer(null);
      return;
    }
    const timer = setInterval(() => {
      setAutoAdvanceTimer((prev) => (prev !== null && prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [autoAdvanceTimer, onStepComplete]);

  // Play step prompt sound on step change
  useEffect(() => {
    if (!currentStep) return;
    try {
      playSound(currentStep.soundEffect);
    } catch {
      // Audio safe
    }
  }, [currentStepIndex]);

  // Navigate to target section if player is elsewhere
  const handleGoToTarget = useCallback(() => {
    if (!currentStep) return;
    if (currentSection !== currentStep.sectionId) {
      onNavigate(currentStep.sectionId);
    }
  }, [currentStep, currentSection, onNavigate]);

  // Locate and track target element or navigation element
  const updatePosition = useCallback(() => {
    if (!currentStep) return;

    const isTargetInSection = currentSection === currentStep.sectionId;

    if (isTargetInSection) {
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

          // Auto-scroll once into view smoothly
          if (!hasScrolledRef.current && (rect.top < 80 || rect.bottom > window.innerHeight - 80)) {
            hasScrolledRef.current = true;
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          return;
        }
      }
      setIsElementVisible(false);
      setTargetRect(null);
    } else {
      // Not in target section: try to find navigation element to highlight
      const navEl = document.querySelector<HTMLElement>(`[data-guide-nav="${currentStep.sectionId}"]`);
      if (navEl) {
        const rect = navEl.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setNavTargetRect({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          });
          return;
        }
      }
      setNavTargetRect(null);
    }
  }, [currentStep, currentSection]);

  useEffect(() => {
    updatePosition();
    const interval = setInterval(updatePosition, 300);

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [updatePosition]);

  // Scroll to element manually if requested by user
  const scrollToTargetElement = () => {
    if (targetElementRef.current) {
      targetElementRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Pulse animation trigger
      targetElementRef.current.classList.add('ring-4', 'ring-amber-400');
      setTimeout(() => {
        targetElementRef.current?.classList.remove('ring-4', 'ring-amber-400');
      }, 1500);
    } else if (currentSection !== currentStep.sectionId) {
      handleGoToTarget();
    }
  };

  if (!currentStep) return null;

  const totalSteps = WALKTHROUGH_STEPS.length;
  const isTargetInSection = currentSection === currentStep.sectionId;

  return (
    <div
      className="fixed inset-0 z-[9990] pointer-events-none select-none overflow-hidden"
      dir="rtl"
      aria-label="المرشد التفاعلي للتوجيه الميداني"
    >
      {/* 1. In-section Spotlight: Dark backdrop cutout + Animated Glowing Frame around exact target button */}
      {isTargetInSection && targetRect && isElementVisible && (
        <div
          className={`fixed pointer-events-none z-[9992] rounded-2xl transition-all duration-300 ${
            hasActionSucceeded
              ? 'ring-4 ring-emerald-400 shadow-[0_0_0_9999px_rgba(2,6,23,0.75),0_0_35px_rgba(52,211,153,0.9)]'
              : 'ring-4 ring-amber-400 shadow-[0_0_0_9999px_rgba(2,6,23,0.78),0_0_35px_rgba(251,191,36,0.9)] animate-pulse'
          }`}
          style={{
            top: `${Math.max(4, targetRect.top - 6)}px`,
            left: `${Math.max(4, targetRect.left - 6)}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`,
          }}
        >
          {/* Animated Bouncing Pointer Callout Badge */}
          {!hasActionSucceeded && (
            <div
              className={`absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-[9994] whitespace-nowrap animate-bounce pointer-events-none ${
                targetRect.top > 90 ? '-top-12' : 'top-full mt-2'
              }`}
            >
              <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-full shadow-2xl border-2 border-slate-950 flex items-center gap-1.5">
                <span className="text-base">{targetRect.top > 90 ? '👇' : '👆'}</span>
                <span>اضغط هنا بالضبط: {currentStep.targetButtonLabel}</span>
              </div>
            </div>
          )}

          {/* Success Marker Badge on Target */}
          {hasActionSucceeded && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-xl flex items-center gap-1 border-2 border-slate-950">
              <span>✓ تمت العملية بنجاح!</span>
            </div>
          )}
        </div>
      )}

      {/* 2. Out-of-section Spotlight: Highlights navigation button to guide user where to click to open the section */}
      {!isTargetInSection && navTargetRect && (
        <div
          className="fixed pointer-events-none z-[9992] rounded-2xl ring-4 ring-amber-400 shadow-[0_0_0_9999px_rgba(2,6,23,0.78),0_0_35px_rgba(251,191,36,0.9)] animate-pulse transition-all duration-300"
          style={{
            top: `${Math.max(4, navTargetRect.top - 6)}px`,
            left: `${Math.max(4, navTargetRect.left - 6)}px`,
            width: `${navTargetRect.width + 12}px`,
            height: `${navTargetRect.height + 12}px`,
          }}
        >
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs px-3 py-1.5 rounded-full shadow-2xl border-2 border-slate-950 flex items-center gap-1.5 whitespace-nowrap animate-bounce">
            <span className="text-base">👇</span>
            <span>اضغط هنا للدخول إلى قسم «{currentStep.navSectionLabel}»</span>
          </div>
        </div>
      )}

      {/* 3. Floating Guidance Explanation Card (Docked at bottom/right, interactive, non-blocking) */}
      <div className="fixed bottom-3 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:w-[500px] pointer-events-auto z-[9995] transition-all duration-300">
        {isCollapsed ? (
          /* Minimized Compact Capsule */
          <div
            onClick={() => setIsCollapsed(false)}
            className="p-3.5 rounded-2xl bg-slate-900/95 border-2 border-amber-500/80 shadow-2xl flex items-center justify-between gap-3 backdrop-blur-md cursor-pointer hover:border-amber-400 transition group"
            title="انقر لتكبير بطاقة الإرشاد"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Compass className="w-4 h-4 animate-spin" />
              </div>
              <div className="text-right">
                <div className="text-xs font-black text-white flex items-center gap-2">
                  <span>التوجيه الإلزامي التفاعلي</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    خطوة {currentStepIndex + 1}/{totalSteps}
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
          /* Full Rich Guided Instruction Card */
          <div className="bg-gradient-to-b from-slate-900 via-slate-900/98 to-slate-950 border-2 border-amber-500/90 rounded-3xl p-4 sm:p-5 shadow-2xl shadow-black/90 space-y-3.5 backdrop-blur-2xl relative overflow-hidden">
            {/* Ambient gold gradient line */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Header: Badge, Step Number & Header Controls */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shadow-inner">
                  {CATEGORY_ICONS[currentStep.category]}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30">
                      {currentStep.phaseBadge}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {currentStepIndex + 1} من {totalSteps}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-black text-white mt-0.5">
                    {currentStep.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsCollapsed(true)}
                  className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                  title="تصغير البطاقة"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={onSkip}
                  className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1 rounded-xl hover:bg-slate-800 transition flex items-center gap-1"
                  title="تخطي الجولة"
                >
                  <span>تخطي</span>
                  <FastForward className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Content State: After real action was completed */}
            {hasActionSucceeded ? (
              <div className="space-y-3 relative z-10 animate-fade-in">
                <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs sm:text-sm leading-relaxed flex items-start gap-2.5 shadow-inner">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-emerald-300 font-extrabold mb-1">
                      {currentStep.successMessage}
                    </strong>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {currentStep.explorationTip}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      playSound('click');
                      onStepComplete();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/25 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>الانتقال للمهمة التالية</span>
                    {autoAdvanceTimer !== null && (
                      <span className="px-1.5 py-0.2 rounded-full bg-slate-950/20 text-slate-950 text-[10px] font-bold">
                        ({autoAdvanceTimer} ث)
                      </span>
                    )}
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Content State: Active Instruction explaining WHERE TO CLICK and WHY */
              <div className="space-y-2.5 relative z-10">
                {/* 1. Target Action & Where to click (Prominent Instruction) */}
                <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/35 text-amber-100 text-xs sm:text-sm leading-relaxed space-y-2">
                  <div className="flex items-center gap-1.5 font-black text-amber-300 text-xs">
                    <span className="text-base">📍</span>
                    <span>أين تضغط للقيام بهذا الإجراء؟</span>
                  </div>
                  <p className="text-xs text-amber-100 font-bold leading-relaxed pr-1">
                    {currentStep.clickInstruction}
                  </p>
                </div>

                {/* 2. Why click here? (Clear practical benefit) */}
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-slate-300 text-xs leading-relaxed space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-sky-400 text-[11px]">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>لماذا نقوم بهذا الإجراء؟</span>
                  </div>
                  <p className="text-[11px] text-slate-300 pr-1">
                    {currentStep.whyInstruction}
                  </p>
                </div>

                {/* 3. Action bar if player is on another section */}
                {!isTargetInSection ? (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleGoToTarget}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Compass className="w-4 h-4" />
                      <span>الانتقال المباشر إلى قسم «{currentStep.navSectionLabel}» 🚀</span>
                    </button>
                  </div>
                ) : (
                  /* In section helper tools */
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
                      <span className="text-[11px]">انظر للإطار الذهبي النابض واضغط الزر بنفسك</span>
                    </div>

                    <button
                      type="button"
                      onClick={scrollToTargetElement}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold transition flex items-center gap-1 shadow-sm shrink-0"
                      title="التركيز على مكان الزر"
                    >
                      <LocateFixed className="w-3.5 h-3.5" />
                      <span>أين الزر؟ 🎯</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
