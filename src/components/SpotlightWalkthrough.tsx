import React, { useEffect, useState, useRef, useCallback } from 'react';
import type { SectionId } from '../domain/navigation';
import type { PlayerProfile } from '../domain/player';
import {
  WALKTHROUGH_STEPS,
  resolveActiveWalkthroughTarget,
  type WalkthroughStep,
} from '../game/walkthroughState';
import { playSound } from '../game/soundEffects';
import {
  ArrowLeft,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Compass,
  LocateFixed,
  AlertTriangle,
  Check,
  X,
} from 'lucide-react';

interface SpotlightWalkthroughProps {
  currentStepIndex: number;
  overrideStep?: WalkthroughStep | null;
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

export function SpotlightWalkthrough({
  currentStepIndex,
  overrideStep,
  profile,
  onStepComplete,
  onSkip,
  onNavigate,
  currentSection,
}: SpotlightWalkthroughProps) {
  const currentStep = overrideStep ?? WALKTHROUGH_STEPS[currentStepIndex];
  const [activeRect, setActiveRect] = useState<TargetRect | null>(null);
  const [directiveLabel, setDirectiveLabel] = useState<string>('');
  const [subStepIndex, setSubStepIndex] = useState<number>(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hasActionSucceeded, setHasActionSucceeded] = useState(false);
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState<number | null>(null);
  const targetElementRef = useRef<HTMLElement | null>(null);
  const lastStepIdRef = useRef<string | undefined>(currentStep?.id);
  const lastSelectorKeyRef = useRef<string>('');

  // Reset completion state when step changes
  useEffect(() => {
    if (lastStepIdRef.current !== currentStep?.id) {
      lastStepIdRef.current = currentStep?.id;
      setHasActionSucceeded(false);
      setIsCollapsed(false);
      lastSelectorKeyRef.current = '';
      setAutoAdvanceTimer(null);
    }
  }, [currentStep?.id]);

  // Verify real state completion on profile changes
  useEffect(() => {
    if (!currentStep) return;
    if (!hasActionSucceeded && currentStep.isComplete(profile)) {
      setHasActionSucceeded(true);
      try {
        playSound('success');
      } catch {
        // Audio safe
      }
      setAutoAdvanceTimer(2);
    }
  }, [profile, currentStep, hasActionSucceeded]);

  // Countdown timer for auto advance after real state verification
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
  }, [currentStep?.id]);

  const handleGoToTarget = useCallback(() => {
    if (!currentStep) return;
    if (currentSection !== currentStep.sectionId) {
      onNavigate(currentStep.sectionId);
    }
  }, [currentStep, currentSection, onNavigate]);

  // Track visible element along the exact execution path (nav -> panel/tab -> final action button)
  const updatePosition = useCallback(() => {
    if (!currentStep) return;

    const resolved = resolveActiveWalkthroughTarget(currentStep, profile, currentSection);
    setDirectiveLabel(resolved.directiveLabel);
    setSubStepIndex(resolved.subStepIndex);

    if (resolved.element) {
      targetElementRef.current = resolved.element;
      const rect = resolved.element.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setActiveRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });

        const selectorKey = `${currentStep.id}:${currentSection}:${resolved.directiveLabel}`;
        if (lastSelectorKeyRef.current !== selectorKey) {
          lastSelectorKeyRef.current = selectorKey;
        }
        return;
      }
    }

    targetElementRef.current = null;
    setActiveRect(null);
  }, [currentStep, profile, currentSection]);

  useEffect(() => {
    updatePosition();
    const interval = setInterval(updatePosition, 250);

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [updatePosition]);

  const scrollToTargetElement = () => {
    if (targetElementRef.current) {
      targetElementRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetElementRef.current.classList.add('ring-4', 'ring-amber-400');
      setTimeout(() => {
        targetElementRef.current?.classList.remove('ring-4', 'ring-amber-400');
      }, 1500);
    } else if (currentSection !== currentStep.sectionId) {
      handleGoToTarget();
    }
  };

  if (!currentStep) return null;

  const totalSteps = overrideStep ? 1 : WALKTHROUGH_STEPS.length;
  const displayStepNumber = overrideStep ? 1 : currentStepIndex + 1;
  const isTargetInSection = currentSection === currentStep.sectionId;
  const diagnosticMessage = !hasActionSucceeded ? currentStep.getDiagnostic?.(profile) ?? null : null;

  return (
    <div
      className="fixed inset-0 z-[9990] pointer-events-none select-none overflow-hidden"
      dir="rtl"
      aria-label="المرشد التفاعلي للتوجيه الميداني خطوة بخطوة"
    >
      {/* 1. SCREEN DIMMING OVERLAY WITH APERTURE CUTOUT */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-none transition-opacity duration-200 z-[9991]"
        style={{ width: '100vw', height: '100vh' }}
      >
        <defs>
          <mask id="walkthrough-aperture-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {activeRect && (
              <rect
                x={Math.max(2, activeRect.left - 6)}
                y={Math.max(2, activeRect.top - 6)}
                width={activeRect.width + 12}
                height={activeRect.height + 12}
                rx="16"
                ry="16"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="#020617"
          opacity="0.58"
          mask="url(#walkthrough-aperture-mask)"
        />
      </svg>

      {/* 2. GOLDEN SPOTLIGHT RING + DIRECTIONAL ARROW */}
      {activeRect && (
        <div
          className={`fixed pointer-events-none z-[9992] rounded-2xl transition-opacity duration-200 ${
            hasActionSucceeded
              ? 'ring-4 ring-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.9)]'
              : 'ring-4 ring-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.95)]'
          }`}
          style={{
            top: `${Math.max(2, activeRect.top - 6)}px`,
            left: `${Math.max(2, activeRect.left - 6)}px`,
            width: `${activeRect.width + 12}px`,
            height: `${activeRect.height + 12}px`,
          }}
        >
          {!hasActionSucceeded && (
            <div
              className={`absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-[9994] ${
                activeRect.top > 130 ? '-top-20' : 'top-full mt-3'
              }`}
            >
              {activeRect.top > 130 ? (
                <div className="flex flex-col items-center animate-bounce">
                  <div className="bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-1 rounded-xl shadow-lg border-2 border-slate-950 whitespace-nowrap mb-1">
                    <span>{directiveLabel}</span>
                  </div>
                  <svg
                    className="w-9 h-9 drop-shadow-[0_0_12px_rgba(251,191,36,0.95)]"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M12 3V17M12 17L6 11M12 17L18 11"
                      stroke="#fbbf24"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polygon points="12,21 5,13 19,13" fill="#f59e0b" />
                  </svg>
                </div>
              ) : (
                <div className="flex flex-col items-center animate-bounce">
                  <svg
                    className="w-9 h-9 drop-shadow-[0_0_12px_rgba(251,191,36,0.95)] mb-1"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M12 21V7M12 7L6 13M12 7L18 13"
                      stroke="#fbbf24"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polygon points="12,3 5,11 19,11" fill="#f59e0b" />
                  </svg>
                  <div className="bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-1 rounded-xl shadow-lg border-2 border-slate-950 whitespace-nowrap">
                    <span>{directiveLabel}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {hasActionSucceeded && (
            <div className="absolute -top-11 left-1/2 -translate-x-1/2 bg-emerald-400 text-slate-950 font-black text-xs px-3.5 py-1 rounded-xl shadow-lg flex items-center gap-1.5 border-2 border-slate-950">
              <Check className="w-4 h-4 stroke-[3]" />
              <span>تم التحقق من تنفيذ الخطوة بنجاح!</span>
            </div>
          )}
        </div>
      )}

      {/* 3. DOCKED EXECUTIVE INSTRUCTION BAR */}
      <div className="fixed bottom-16 md:bottom-4 left-2 right-2 sm:left-6 sm:right-auto sm:w-[480px] pointer-events-auto z-[9995] transition-opacity duration-200">
        {isCollapsed ? (
          <div
            onClick={() => setIsCollapsed(false)}
            className="p-3 rounded-2xl bg-slate-900/95 border-2 border-amber-500/80 shadow-2xl flex items-center justify-between gap-3 backdrop-blur-xl cursor-pointer hover:border-amber-400 transition"
            title="تكبير الإرشاد الميداني"
          >
            <div className="flex items-center gap-2 min-w-0">
              <strong className="text-xs text-white truncate">{currentStep.title}</strong>
              <span className="text-[11px] text-amber-300 font-bold shrink-0 tabular-nums">
                ({displayStepNumber}/{totalSteps})
              </span>
            </div>
            <button
              type="button"
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white shrink-0"
              aria-label="تكبير الإرشاد"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="bg-slate-900/98 border-2 border-amber-500/85 rounded-2xl p-4 shadow-2xl space-y-2.5 backdrop-blur-xl relative">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[11px] text-amber-300 font-bold">
                  <span>{currentStep.phaseBadge}</span>
                  <span>·</span>
                  <span className="text-slate-400 tabular-nums">
                    خطوة {displayStepNumber} من {totalSteps}
                  </span>
                </div>
                <h3 className="text-sm font-black text-white mt-0.5">
                  {currentStep.title}
                </h3>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCollapsed(true)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                  title="تصغير اللوحة لرؤية الشاشة بالكامل"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={onSkip}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                  title="إغلاق الإرشاد البصري (دون منح أي مكافآت أو إنهاء المهمة تلقائياً)"
                >
                  <X className="w-3 h-3" />
                  <span>إغلاق الإرشاد</span>
                </button>
              </div>
            </div>

            {/* Economic Why + Action Instruction */}
            <p className="text-xs text-slate-300 leading-relaxed">
              {currentStep.whyInstruction}
            </p>

            {/* Step-by-Step Checklist synced with live subStepIndex */}
            <div className="space-y-1.5 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-xs">
              {currentStep.checklist.map((item, idx) => {
                const isItemDone = hasActionSucceeded || idx < subStepIndex;
                const isItemCurrent = !hasActionSucceeded && idx === subStepIndex;
                return (
                  <div key={idx} className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                        isItemDone
                          ? 'bg-emerald-500 text-slate-950'
                          : isItemCurrent
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isItemDone ? '✓' : idx + 1}
                    </div>
                    <span
                      className={`text-xs ${
                        isItemDone
                          ? 'text-emerald-300 font-semibold line-through opacity-80'
                          : isItemCurrent
                            ? 'text-white font-bold'
                            : 'text-slate-400'
                      }`}
                    >
                      {item}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Smart Diagnostic Warning if resources/conditions are missing */}
            {diagnosticMessage && (
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 flex items-start gap-2 text-rose-200 text-xs" role="alert">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{diagnosticMessage}</span>
              </div>
            )}

            {/* Footer Controls */}
            {hasActionSucceeded ? (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{currentStep.successMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    onStepComplete();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow transition cursor-pointer shrink-0 flex items-center gap-1"
                >
                  <span>التالي</span>
                  {autoAdvanceTimer !== null && (
                    <span className="font-mono text-[10px] tabular-nums">({autoAdvanceTimer}ث)</span>
                  )}
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2 pt-0.5">
                {!isTargetInSection ? (
                  <button
                    type="button"
                    onClick={handleGoToTarget}
                    className="w-full py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Compass className="w-4 h-4" />
                    <span>افتح قسم «{currentStep.navSectionLabel}» للمتابعة</span>
                  </button>
                ) : (
                  <div className="w-full flex items-center justify-between gap-2">
                    <span className="text-[11px] text-amber-300 font-bold truncate">
                      {directiveLabel}
                    </span>
                    <button
                      type="button"
                      onClick={scrollToTargetElement}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <LocateFixed className="w-3.5 h-3.5" />
                      <span>تحديد الموقع</span>
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
