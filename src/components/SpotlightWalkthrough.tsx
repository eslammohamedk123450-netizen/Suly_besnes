import React, { useEffect, useState, useRef, useCallback } from 'react';
import type { SectionId } from '../domain/navigation';
import { WALKTHROUGH_STEPS, type WalkthroughStep } from '../game/walkthroughState';
import { playSound } from '../game/soundEffects';
import { Sparkles, ArrowRight, FastForward, Wrench, DollarSign, Store, LandPlot, Factory, Trophy } from 'lucide-react';

interface SpotlightWalkthroughProps {
  currentStepIndex: number;
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
  store: <Store className="w-5 h-5 text-amber-400" />,
  maintenance: <Wrench className="w-5 h-5 text-amber-400" />,
  obligations: <DollarSign className="w-5 h-5 text-amber-400" />,
  lands: <LandPlot className="w-5 h-5 text-amber-400" />,
  production: <Factory className="w-5 h-5 text-amber-400" />,
  tasks: <Trophy className="w-5 h-5 text-amber-400" />,
};

export function SpotlightWalkthrough({
  currentStepIndex,
  onStepComplete,
  onSkip,
  onNavigate,
  currentSection,
}: SpotlightWalkthroughProps) {
  const currentStep = WALKTHROUGH_STEPS[currentStepIndex];
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [isElementVisible, setIsElementVisible] = useState(false);
  const targetElementRef = useRef<HTMLElement | null>(null);

  // Auto-navigate to the right section if not already there
  useEffect(() => {
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
      // Audio autoplay safe guard
    }
  }, [currentStep]);

  // Track target element position and keep in view
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

        // Scroll into view if offscreen or hidden behind headers
        const isOffscreen = rect.top < 85 || rect.bottom > window.innerHeight - 95;
        if (isOffscreen) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
    }
    setIsElementVisible(false);
  }, [currentStep]);

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

  // Handle direct click on the highlighted target element
  const handleTargetClick = () => {
    playSound('success');
    if (targetElementRef.current) {
      targetElementRef.current.click();
    }
    setTimeout(() => {
      onStepComplete();
    }, 320);
  };

  if (!currentStep) return null;

  const totalSteps = WALKTHROUGH_STEPS.length;
  // If target element is in top half of screen, place dialog near bottom; otherwise near top
  const isTargetInTopHalf = targetRect ? targetRect.top < window.innerHeight / 2 : false;

  return (
    <div
      className="fixed inset-0 z-[9990] pointer-events-auto select-none overflow-hidden"
      dir="rtl"
      aria-label="مرشد الشرح الإلزامي"
    >
      {/* Darkened backdrop overlay with cutout around target element */}
      {targetRect && isElementVisible ? (
        <>
          {/* Top dark block */}
          <div
            className="fixed left-0 right-0 top-0 bg-slate-950/85 backdrop-blur-[2px] transition-all duration-200"
            style={{ height: `${Math.max(0, targetRect.top - 8)}px` }}
          />
          {/* Bottom dark block */}
          <div
            className="fixed left-0 right-0 bottom-0 bg-slate-950/85 backdrop-blur-[2px] transition-all duration-200"
            style={{
              top: `${Math.min(window.innerHeight, targetRect.top + targetRect.height + 8)}px`,
            }}
          />
          {/* Left dark block */}
          <div
            className="fixed left-0 bg-slate-950/85 backdrop-blur-[2px] transition-all duration-200"
            style={{
              top: `${Math.max(0, targetRect.top - 8)}px`,
              height: `${targetRect.height + 16}px`,
              width: `${Math.max(0, targetRect.left - 8)}px`,
            }}
          />
          {/* Right dark block */}
          <div
            className="fixed right-0 bg-slate-950/85 backdrop-blur-[2px] transition-all duration-200"
            style={{
              top: `${Math.max(0, targetRect.top - 8)}px`,
              height: `${targetRect.height + 16}px`,
              left: `${Math.min(window.innerWidth, targetRect.left + targetRect.width + 8)}px`,
            }}
          />

          {/* Glowing spotlight frame around target element */}
          <div
            onClick={handleTargetClick}
            className="fixed cursor-pointer z-[9995] rounded-xl ring-4 ring-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.85)] animate-pulse transition-all duration-150 hover:scale-[1.02]"
            style={{
              top: `${Math.max(4, targetRect.top - 8)}px`,
              left: `${Math.max(4, targetRect.left - 8)}px`,
              width: `${targetRect.width + 16}px`,
              height: `${targetRect.height + 16}px`,
            }}
            title="اضغط هنا لتنفيذ الأمر والمتابعة"
          >
            {/* Pulsing indicator tag */}
            <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full shadow-lg flex items-center gap-1 whitespace-nowrap animate-bounce pointer-events-none">
              <span>🎯 اضغط هنا</span>
            </div>
          </div>
        </>
      ) : (
        /* Full backdrop if element still rendering or animating */
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-[2px]" />
      )}

      {/* Floating Guided Coachmark Dialog Card - Fully mobile-optimized */}
      <div
        className={`fixed z-[9999] pointer-events-auto transition-all duration-300 w-[calc(100vw-24px)] max-w-md left-3 right-3 mx-auto ${
          isTargetInTopHalf ? 'bottom-20' : 'top-16 sm:top-20'
        }`}
      >
        <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-400/90 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-amber-500/25 space-y-3 text-right relative overflow-hidden">
          {/* Glowing ambient light */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Header Row */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                {CATEGORY_ICONS[currentStep.category]}
              </div>
              <div>
                <strong className="text-white text-xs sm:text-sm font-bold block">
                  الشرح الإلزامي · {currentStep.title}
                </strong>
                <span className="text-amber-400/90 text-[11px] font-semibold">
                  الخطوة {currentStepIndex + 1} من {totalSteps}
                </span>
              </div>
            </div>

            {/* Skip Option for Veterans */}
            <button
              type="button"
              onClick={onSkip}
              className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700"
              title="تخطي الجولة والبدء فوراً"
            >
              <span>تخطي</span>
              <FastForward className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Primary Speech Bubble - Explicit Instruction */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm leading-relaxed font-bold relative z-10">
            <span className="text-amber-400 text-base ml-1">📢</span>
            {currentStep.message}
          </div>

          {/* Subtext description */}
          {currentStep.subMessage && (
            <p className="text-slate-300 text-xs leading-relaxed px-1 relative z-10">
              {currentStep.subMessage}
            </p>
          )}

          {/* Action Callout & Advancement Button */}
          <div className="pt-1 flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-1.5 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
              <span>{currentStep.actionPrompt}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                handleTargetClick();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-transform hover:scale-[1.03] active:scale-95 cursor-pointer"
            >
              <span>متابعة</span>
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
