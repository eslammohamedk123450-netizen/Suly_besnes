import React, { useEffect, useState, useRef, useCallback } from 'react';
import type { SectionId } from '../domain/navigation';
import { WALKTHROUGH_STEPS, type WalkthroughStep } from '../game/walkthroughState';
import { playSound } from '../game/soundEffects';
import { Sparkles, ArrowDown, ArrowUp, ArrowRight, CheckCircle2, FastForward, Wrench, DollarSign, Store, LandPlot, Factory, Trophy } from 'lucide-react';

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
  const [attemptCount, setAttemptCount] = useState(0);
  const targetElementRef = useRef<HTMLElement | null>(null);

  // Auto-navigate to the right section if needed
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

  // Measure and track target element position
  const updatePosition = useCallback(() => {
    if (!currentStep) return;
    const el = document.querySelector<HTMLElement>(currentStep.targetSelector);
    if (el) {
      targetElementRef.current = el;
      const rect = el.getBoundingClientRect();
      // Ensure element has dimensions and is in DOM
      if (rect.width > 0 && rect.height > 0) {
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
        setIsElementVisible(true);
        // Gently scroll into view if offscreen
        const isOffscreen = rect.top < 70 || rect.bottom > window.innerHeight - 80;
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
    const interval = setInterval(() => {
      updatePosition();
      setAttemptCount((prev) => prev + 1);
    }, 250);

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [updatePosition]);

  // Handle direct click on the highlighted target element
  const handleTargetClick = (e: React.MouseEvent) => {
    // Play sound and advance step
    playSound('success');
    // If the element has a native click, trigger it
    if (targetElementRef.current) {
      targetElementRef.current.click();
    }
    setTimeout(() => {
      onStepComplete();
    }, 280);
  };

  if (!currentStep) return null;

  const totalSteps = WALKTHROUGH_STEPS.length;
  const isTopHalf = targetRect ? targetRect.top > window.innerHeight / 2 : false;

  return (
    <div
      className="fixed inset-0 z-[9990] pointer-events-auto select-none overflow-hidden"
      dir="rtl"
      aria-label="مرشد الشرح الإلزامي"
    >
      {/* Darkened backdrop overlay with punch-through hole */}
      {targetRect && isElementVisible ? (
        <>
          {/* Top dark block */}
          <div
            className="fixed left-0 right-0 top-0 bg-slate-950/85 backdrop-blur-[2px] transition-all duration-200"
            style={{ height: `${Math.max(0, targetRect.top - 6)}px` }}
          />
          {/* Bottom dark block */}
          <div
            className="fixed left-0 right-0 bottom-0 bg-slate-950/85 backdrop-blur-[2px] transition-all duration-200"
            style={{
              top: `${Math.min(window.innerHeight, targetRect.top + targetRect.height + 6)}px`,
            }}
          />
          {/* Left dark block */}
          <div
            className="fixed left-0 bg-slate-950/85 backdrop-blur-[2px] transition-all duration-200"
            style={{
              top: `${Math.max(0, targetRect.top - 6)}px`,
              height: `${targetRect.height + 12}px`,
              width: `${Math.max(0, targetRect.left - 6)}px`,
            }}
          />
          {/* Right dark block */}
          <div
            className="fixed right-0 bg-slate-950/85 backdrop-blur-[2px] transition-all duration-200"
            style={{
              top: `${Math.max(0, targetRect.top - 6)}px`,
              height: `${targetRect.height + 12}px`,
              left: `${Math.min(window.innerWidth, targetRect.left + targetRect.width + 6)}px`,
            }}
          />

          {/* Glowing spotlight frame around target element */}
          <div
            onClick={handleTargetClick}
            className="fixed cursor-pointer z-[9995] rounded-xl ring-4 ring-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.85)] animate-pulse transition-all duration-150 hover:scale-[1.02]"
            style={{
              top: `${Math.max(4, targetRect.top - 6)}px`,
              left: `${Math.max(4, targetRect.left - 6)}px`,
              width: `${targetRect.width + 12}px`,
              height: `${targetRect.height + 12}px`,
            }}
            title="اضغط هنا لتنفيذ الأمر والمتابعة"
          >
            {/* Pulsing indicator tag */}
            <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full shadow-lg flex items-center gap-1 whitespace-nowrap animate-bounce">
              <span>🎯 اضغط هنا</span>
            </div>
          </div>
        </>
      ) : (
        /* Full backdrop if element still rendering */
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-[2px]" />
      )}

      {/* Floating Guided Coachmark Dialog Card */}
      <div
        className="fixed z-[9999] pointer-events-auto transition-all duration-300 w-[94vw] max-w-lg left-1/2 -translate-x-1/2"
        style={{
          top: targetRect && isElementVisible
            ? isTopHalf
              ? `${Math.max(16, targetRect.top - 210)}px`
              : `${Math.min(window.innerHeight - 230, targetRect.top + targetRect.height + 24)}px`
            : '50%',
          transform: !targetRect || !isElementVisible ? 'translate(-50%, -50%)' : 'translateX(-50%)',
        }}
      >
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-400/90 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-amber-500/25 space-y-3.5 text-right relative overflow-hidden">
          {/* Glowing ambient light */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Header Row */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
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
              className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700"
              title="تخطي الجولة والبدء فوراً"
            >
              <span>تخطي</span>
              <FastForward className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Primary Speech Bubble - Explicit Instruction */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm leading-relaxed font-bold relative z-10">
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
                playSound('success');
                onStepComplete();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-transform hover:scale-[1.03]"
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
