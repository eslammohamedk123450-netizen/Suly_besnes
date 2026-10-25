import React, { useEffect, useState, useRef, useCallback } from 'react';
import type { SectionId } from '../domain/navigation';
import type { PlayerProfile } from '../domain/player';
import { WALKTHROUGH_STEPS, type WalkthroughStep } from '../game/walkthroughState';
import { playSound } from '../game/soundEffects';
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Compass,
  LocateFixed,
  AlertTriangle,
  Flame,
  Check
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

  // Reset completion state on step change
  useEffect(() => {
    if (lastStepIndexRef.current !== currentStepIndex) {
      lastStepIndexRef.current = currentStepIndex;
      setHasActionSucceeded(false);
      setIsCollapsed(false);
      hasScrolledRef.current = false;
      setAutoAdvanceTimer(null);
    }
  }, [currentStepIndex]);

  // Check if current step condition is satisfied naturally by user interaction
  useEffect(() => {
    if (!currentStep) return;
    if (!hasActionSucceeded && currentStep.isComplete?.(profile)) {
      setHasActionSucceeded(true);
      try {
        playSound('success');
      } catch {
        // Audio safe
      }
      setAutoAdvanceTimer(3);
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

          // Smooth scroll into center if not in viewport
          if (!hasScrolledRef.current && (rect.top < 100 || rect.bottom > window.innerHeight - 100)) {
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

  // Focus and scroll to target element manually
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

  const totalSteps = WALKTHROUGH_STEPS.length;
  const isTargetInSection = currentSection === currentStep.sectionId;
  const activeRect = isTargetInSection ? targetRect : navTargetRect;

  return (
    <div
      className="fixed inset-0 z-[9990] pointer-events-none select-none overflow-hidden"
      dir="rtl"
      aria-label="المرشد التفاعلي للتوجيه الميداني خطوة بخطوة"
    >
      {/* 1. SCREEN DIMMING OVERLAY WITH APERTURE CUTOUT (تعتيم الشاشة قليلاً مع تفريغ بؤرة الزر المستهدف) */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-none transition-opacity duration-300 z-[9991]"
        style={{ width: '100vw', height: '100vh' }}
      >
        <defs>
          <mask id="walkthrough-aperture-mask">
            {/* White area = dimmed backdrop */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black area = clear hole/cutout over the button */}
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
        {/* Dimming background plane: 55% dark slate */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="#020617"
          opacity="0.55"
          mask="url(#walkthrough-aperture-mask)"
        />
      </svg>

      {/* 2. GLOWING NEON ARROW + PULSING TARGET BEACON (سهم مضيء بتوهج نيون حقيقي ونابض) */}
      {activeRect && (
        <div
          className={`fixed pointer-events-none z-[9992] rounded-2xl transition-all duration-300 ${
            hasActionSucceeded
              ? 'ring-4 ring-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.9),0_0_70px_rgba(16,185,129,0.5)]'
              : 'ring-4 ring-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.95),0_0_80px_rgba(245,158,11,0.6)] animate-pulse'
          }`}
          style={{
            top: `${Math.max(2, activeRect.top - 6)}px`,
            left: `${Math.max(2, activeRect.left - 6)}px`,
            width: `${activeRect.width + 12}px`,
            height: `${activeRect.height + 12}px`,
          }}
        >
          {/* THE LUMINOUS GLOWING NEON ARROW (سهم مضيء متحرك يشير مباشرة على الزر) */}
          {!hasActionSucceeded && (
            <div
              className={`absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-[9994] transition-all ${
                activeRect.top > 120 ? '-top-20' : 'top-full mt-3'
              }`}
            >
              {/* If arrow points downwards (button is below arrow) */}
              {activeRect.top > 120 ? (
                <div className="flex flex-col items-center animate-bounce">
                  {/* Glowing Floating Directive Tag */}
                  <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs px-3.5 py-1 rounded-full shadow-[0_0_20px_rgba(251,191,36,0.9)] border-2 border-slate-950 flex items-center gap-1.5 whitespace-nowrap mb-1">
                    <Sparkles className="w-3.5 h-3.5 fill-slate-950 animate-spin" />
                    <span>
                      {isTargetInSection
                        ? `اضغط بنفسك هنا: ${currentStep.targetButtonLabel}`
                        : `اضغط للدخول إلى قسم «${currentStep.navSectionLabel}»`}
                    </span>
                  </div>

                  {/* SVG Neon Arrow Downwards */}
                  <svg
                    className="w-10 h-10 filter drop-shadow-[0_0_15px_rgba(251,191,36,1)] drop-shadow-[0_0_25px_rgba(245,158,11,0.8)]"
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
                /* If button is near top, arrow points upwards */
                <div className="flex flex-col items-center animate-bounce">
                  {/* SVG Neon Arrow Upwards */}
                  <svg
                    className="w-10 h-10 filter drop-shadow-[0_0_15px_rgba(251,191,36,1)] drop-shadow-[0_0_25px_rgba(245,158,11,0.8)] mb-1"
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

                  {/* Glowing Floating Directive Tag */}
                  <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs px-3.5 py-1 rounded-full shadow-[0_0_20px_rgba(251,191,36,0.9)] border-2 border-slate-950 flex items-center gap-1.5 whitespace-nowrap">
                    <Sparkles className="w-3.5 h-3.5 fill-slate-950 animate-spin" />
                    <span>
                      {isTargetInSection
                        ? `اضغط بنفسك هنا: ${currentStep.targetButtonLabel}`
                        : `اضغط للدخول إلى قسم «${currentStep.navSectionLabel}»`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Success Checkmark Burst on Target */}
          {hasActionSucceeded && (
            <div className="absolute -top-11 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-green-400 text-slate-950 font-black text-xs px-3.5 py-1 rounded-full shadow-[0_0_25px_rgba(52,211,153,1)] flex items-center gap-1.5 border-2 border-slate-950 animate-bounce">
              <Check className="w-4 h-4 stroke-[3]" />
              <span>أحسنت! تمت العملية بيدك بنجاح!</span>
            </div>
          )}
        </div>
      )}

      {/* 3. DOCKED TOP/BOTTOM EXECUTIVE INSTRUCTION BAR (توضيح صريح للقيام بكل خطوة بنفسه) */}
      <div className="fixed top-2 sm:top-4 left-2 right-2 sm:left-auto sm:right-6 sm:w-[520px] pointer-events-auto z-[9995] transition-all duration-300">
        {isCollapsed ? (
          /* Minimized Capsule */
          <div
            onClick={() => setIsCollapsed(false)}
            className="p-3 rounded-2xl bg-slate-900/95 border-2 border-amber-500/80 shadow-[0_0_30px_rgba(0,0,0,0.8)] flex items-center justify-between gap-3 backdrop-blur-xl cursor-pointer hover:border-amber-400 transition"
            title="تكبير الإرشاد الميداني"
          >
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
              <strong className="text-xs text-white">التدريب الميداني: نفّذ الخطوات بنفسك</strong>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                {currentStepIndex + 1}/{totalSteps}
              </span>
            </div>
            <button
              type="button"
              className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Full Rich Interactive Directive Bar */
          <div className="bg-gradient-to-b from-slate-900 via-slate-900/98 to-slate-950 border-2 border-amber-500/90 rounded-3xl p-4 sm:p-5 shadow-[0_0_50px_rgba(0,0,0,0.9)] space-y-3 backdrop-blur-2xl relative overflow-hidden">
            {/* Top Amber Ray */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />
            <div className="absolute -top-12 -right-12 w-44 h-44 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Header: Title, Step Counter & Minimize */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-black border border-amber-500/30">
                      {currentStep.phaseBadge}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      خطوة {currentStepIndex + 1} من {totalSteps}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-white mt-0.5">
                    {currentStep.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsCollapsed(true)}
                  className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                  title="تصغير الإرشاد"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Mandatory Action Notice (تنبيه للمستخدم بالقيام بالخطوات بنفسه) */}
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/35 flex items-start gap-2 text-amber-200 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed font-semibold">
                <strong>تعليمات الإدارة الميدانية:</strong> يجب عليك تنفيذ كل خطوة بنفسك داخل اللعبة لتتعلم إدارة أصولك، ولن تكتمل الخطوة إلا بالنقر الفعلي على الزر المطلوب الموضح بالسهم المضيء.
              </p>
            </div>

            {/* Step-by-Step Checklist of what to do by hand (قائمة الخطوات اليدوية) */}
            <div className="space-y-1.5 bg-slate-950/70 p-3 rounded-2xl border border-slate-800 text-xs">
              <span className="text-[11px] font-bold text-slate-400 block mb-1">
                📋 مسار التنفيذ اليدوي المطلوب منك:
              </span>
              {currentStep.checklist.map((item, idx) => {
                const isItemDone = hasActionSucceeded || (idx === 0 && isTargetInSection);
                return (
                  <div key={idx} className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                        isItemDone
                          ? 'bg-emerald-500 text-slate-950'
                          : idx === (isTargetInSection ? 2 : 0)
                          ? 'bg-amber-500 text-slate-950 animate-pulse'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isItemDone ? '✓' : idx + 1}
                    </div>
                    <span
                      className={`text-xs ${
                        isItemDone
                          ? 'text-emerald-300 font-semibold line-through opacity-80'
                          : idx === (isTargetInSection ? 2 : 0)
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

            {/* State: Completed Success */}
            {hasActionSucceeded ? (
              <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{currentStep.successMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    onStepComplete();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg transition cursor-pointer shrink-0 flex items-center gap-1"
                >
                  <span>التالي</span>
                  {autoAdvanceTimer !== null && (
                    <span className="font-mono text-[10px]">({autoAdvanceTimer}ث)</span>
                  )}
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              /* State: Active Instruction Helpers */
              <div className="flex items-center justify-between gap-2 pt-0.5">
                {!isTargetInSection ? (
                  <button
                    type="button"
                    onClick={handleGoToTarget}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-lg transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Compass className="w-4 h-4" />
                    <span>توجّه إلى قسم «{currentStep.navSectionLabel}» الآن 🎯</span>
                  </button>
                ) : (
                  <div className="w-full flex items-center justify-between gap-2">
                    <span className="text-[11px] text-amber-300 font-bold flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      انظر للسهم المضيء واضغط الزر بيدك
                    </span>
                    <button
                      type="button"
                      onClick={scrollToTargetElement}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
                      title="تحديد مكان الزر بدقة"
                    >
                      <LocateFixed className="w-3.5 h-3.5" />
                      <span>تحديد مكان الزر 🎯</span>
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
