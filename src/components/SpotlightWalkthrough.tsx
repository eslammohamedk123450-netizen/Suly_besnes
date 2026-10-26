import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import type { SectionId } from '../domain/navigation';
import type { PlayerProfile } from '../domain/player';
import {
  WALKTHROUGH_STEPS,
  resolveActiveWalkthroughTarget,
  type WalkthroughStep,
} from '../game/walkthroughState';
import { playSound } from '../game/soundEffects';
import {
  Check,
  CheckCircle2,
  Compass,
  LocateFixed,
  AlertTriangle,
  X,
  Coins,
  Gem,
  Crown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { findCountry } from '../domain/countries';
import { formatMoney } from '../domain/formatters';

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

/**
 * High-tech cute vector chibi robot mascot inspired by Image 1
 */
function CuteMascotRobot({ className = '' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Ambient thruster blue glow */}
      <div className="absolute -bottom-2 w-12 h-6 bg-cyan-400/40 rounded-full blur-md animate-pulse pointer-events-none" />

      <svg
        viewBox="0 0 120 120"
        className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-[0_8px_20px_rgba(34,211,238,0.45)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Antennas / Ear Pods with glowing blue lights */}
        <circle cx="24" cy="55" r="9" fill="#1e293b" stroke="#38bdf8" strokeWidth="2.5" />
        <circle cx="24" cy="55" r="4" fill="#38bdf8" className="animate-pulse" />
        <circle cx="96" cy="55" r="9" fill="#1e293b" stroke="#38bdf8" strokeWidth="2.5" />
        <circle cx="96" cy="55" r="4" fill="#38bdf8" className="animate-pulse" />

        {/* Small top antenna */}
        <path d="M60 25 V14" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
        <circle cx="60" cy="12" r="4" fill="#38bdf8" className="animate-ping" />
        <circle cx="60" cy="12" r="4" fill="#38bdf8" />

        {/* Head Outer Shell */}
        <rect
          x="28"
          y="26"
          width="64"
          height="54"
          rx="26"
          fill="#f8fafc"
          stroke="#0f172a"
          strokeWidth="3"
        />
        {/* Gloss highlight on head */}
        <path
          d="M38 34 C44 30 76 30 82 34"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Glossy Black Visor */}
        <rect
          x="34"
          y="35"
          width="52"
          height="34"
          rx="15"
          fill="#090d16"
          stroke="#1e293b"
          strokeWidth="2"
        />

        {/* Visor Grid / Reflection Accent */}
        <path d="M40 39 L78 39" stroke="#38bdf8" strokeWidth="1" opacity="0.3" />

        {/* Friendly Glowing Cyan Visor Eyes */}
        <g className="animate-pulse">
          {/* Left Eye */}
          <ellipse cx="49" cy="51" rx="6.5" ry="7" fill="#38bdf8" />
          <circle cx="51" cy="49" r="2.5" fill="#ffffff" />
          {/* Right Eye */}
          <ellipse cx="71" cy="51" rx="6.5" ry="7" fill="#38bdf8" />
          <circle cx="73" cy="49" r="2.5" fill="#ffffff" />
        </g>

        {/* Smiling Cyan Mouth */}
        <path
          d="M55 58 Q60 62 65 58"
          stroke="#38bdf8"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Cute Blushing Cheeks */}
        <circle cx="41" cy="55" r="2.5" fill="#38bdf8" opacity="0.4" />
        <circle cx="79" cy="55" r="2.5" fill="#38bdf8" opacity="0.4" />

        {/* Robot Body */}
        <path
          d="M44 80 C44 76 76 76 76 80 L73 95 C73 98 47 98 47 95 Z"
          fill="#e2e8f0"
          stroke="#0f172a"
          strokeWidth="2.5"
        />
        {/* Center chest energy core */}
        <circle cx="60" cy="87" r="4" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />

        {/* Little Floating Hands */}
        {/* Left hand (waving) */}
        <circle
          cx="33"
          cy="78"
          r="6.5"
          fill="#f8fafc"
          stroke="#0f172a"
          strokeWidth="2"
          className="animate-bounce"
        />
        {/* Right hand pointing downward */}
        <circle
          cx="87"
          cy="82"
          r="6.5"
          fill="#f8fafc"
          stroke="#0f172a"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

/**
 * Animated Tap / Touch Hand Gesture inspired by Image 2
 */
function GestureHand({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none select-none ${className}`}>
      <svg
        viewBox="0 0 60 70"
        className="w-12 h-14 drop-shadow-[0_4px_12px_rgba(56,189,248,0.7)] animate-bounce"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Glowing Touch Circle */}
        <circle cx="30" cy="12" r="8" fill="#38bdf8" opacity="0.4" className="animate-ping" />
        <circle cx="30" cy="12" r="4" fill="#ffffff" />

        {/* Pointing Hand Silhouette with glossy gradient */}
        <path
          d="M30 14 C27 14 26 17 26 23 L26 38 C26 38 23 37 20 37 C17 37 15 39 15 42 C15 46 22 55 25 58 C28 61 34 64 42 64 C48 64 52 60 52 53 L52 38 C52 35 50 33 47 33 C45 33 44 34 43 35 C42 33 40 31 37 31 C35 31 34 32 33 33 L33 23 C33 17 33 14 30 14 Z"
          fill="url(#hand-gradient)"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="hand-gradient" x1="15" y1="12" x2="52" y2="64" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f8fafc" stopOpacity="0.95" />
            <stop offset="1" stopColor="#94a3b8" stopOpacity="0.85" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
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
  const [hasActionSucceeded, setHasActionSucceeded] = useState(false);
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState<number | null>(null);
  const targetElementRef = useRef<HTMLElement | null>(null);
  const lastStepIdRef = useRef<string | undefined>(currentStep?.id);

  const country = useMemo(
    () => findCountry(profile.countryId) ?? findCountry('egypt')!,
    [profile.countryId],
  );

  // Reset completion state when step changes
  useEffect(() => {
    if (lastStepIdRef.current !== currentStep?.id) {
      lastStepIdRef.current = currentStep?.id;
      setHasActionSucceeded(false);
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
        // Safe
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
      // Safe
    }
  }, [currentStep?.id]);

  const handleGoToTarget = useCallback(() => {
    if (!currentStep) return;
    if (currentSection !== currentStep.sectionId) {
      onNavigate(currentStep.sectionId);
    }
  }, [currentStep, currentSection, onNavigate]);

  // Track visible element along the exact execution path
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
    } else if (currentSection !== currentStep?.sectionId) {
      handleGoToTarget();
    }
  };

  if (!currentStep) return null;

  const totalSteps = overrideStep ? 1 : WALKTHROUGH_STEPS.length;
  const displayStepNumber = overrideStep ? 1 : currentStepIndex + 1;
  const isFinalStep = displayStepNumber === totalSteps;
  const isTargetInSection = currentSection === currentStep.sectionId;
  const diagnosticMessage = !hasActionSucceeded ? currentStep.getDiagnostic?.(profile) ?? null : null;

  // Calculate Empire Progress Percentage (e.g. 25% + (step * 9%))
  const completionPct = Math.min(96, Math.max(15, Math.round((displayStepNumber / totalSteps) * 100)));

  // Dynamic coaching speech text for the robot mascot matching Image 1
  const mascotSpeechText = hasActionSucceeded
    ? 'ممتاز جداً! خطوة رائعة 👑'
    : !isTargetInSection
      ? `اضغط هنا لفتح قسم «${currentStep.navSectionLabel}»`
      : currentStep.id === 'service_equipment'
        ? 'اضغط هنا لصيانة المصنع الآن!'
        : currentStep.id === 'pay_obligations'
          ? 'سدد القرض لفتح الطاقة وحماية مصنعك!'
          : currentStep.id === 'claim_tasks'
            ? 'ممتاز! اضغط هنا الآن'
            : currentStep.targetButtonLabel
              ? `اضغط هنا: ${currentStep.targetButtonLabel}`
              : 'ممتاز! اضغط هنا الآن';

  // Calculate center of target aperture
  const targetCenterX = activeRect ? activeRect.left + activeRect.width / 2 : window.innerWidth / 2;
  const targetCenterY = activeRect ? activeRect.top + activeRect.height / 2 : window.innerHeight / 2;

  // Decide if the robot fits above or to the side of the target
  const robotFitsAbove = activeRect && activeRect.top > 230;

  return (
    <div
      className="fixed inset-0 z-[9990] pointer-events-none select-none overflow-hidden"
      dir="rtl"
      aria-label="المرشد التفاعلي السلس لإدارة إمبراطورية الأعمال"
    >
      {/* 1. SCREEN DIMMING OVERLAY WITH SHAPED APERTURE CUTOUT (Image 1 style) */}
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
                rx="20"
                ry="20"
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
          fill="#030712"
          opacity="0.75"
          mask="url(#walkthrough-aperture-mask)"
        />
      </svg>

      {/* 2. TOP STATUS BAR & STEP INDICATOR (MATCHING IMAGE 1 EXACTLY) */}
      <header className="fixed top-2 sm:top-4 left-0 right-0 z-[9995] pointer-events-auto px-3 max-w-xl mx-auto flex flex-col items-center gap-2">
        {/* Top Resource Capsules & Level */}
        <div className="w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-md">
          {/* Gold Coin Pill */}
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-300">
            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
              🪙
            </span>
            <span className="tabular-nums font-mono">{formatMoney(profile.bankBalance, country)}</span>
          </div>

          {/* Diamonds Pill */}
          <div className="flex items-center gap-1.5 text-xs font-black text-cyan-300">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40">
              💎
            </span>
            <span className="tabular-nums font-mono">{profile.diamonds ?? 0}</span>
          </div>

          {/* Level Crown Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-200 text-xs font-black">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>المستوى {profile.level ?? 1}</span>
          </div>
        </div>

        {/* Empire Completion Progress Bar (Image 1) */}
        <div className="w-full px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-[11px] font-bold text-amber-300/90 mb-1">
            <span>إمبراطوريتك: {completionPct}% مكتملة</span>
            <span className="text-[10px] text-slate-400">{country.flag} {country.name}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>

        {/* Step Badge Pill Card (Image 1: الخطوة 4 • الخطوة النهائية 2/2) */}
        <div className="w-full text-center space-y-1.5 pt-1">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-950/90 via-indigo-900/90 to-blue-950/90 border border-cyan-400/60 shadow-[0_0_20px_rgba(34,211,238,0.35)] backdrop-blur-md">
            <div className="w-4 h-4 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-[10px] font-black shrink-0">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <strong className="text-xs sm:text-sm font-black text-white tracking-wide">
              الخطوة {displayStepNumber} • {isFinalStep ? 'الخطوة النهائية' : currentStep.title} ({displayStepNumber}/{totalSteps})
            </strong>
          </div>

          {/* Subtitle Directive Prompt */}
          <div className="px-4 py-1.5 rounded-2xl bg-slate-950/90 border border-slate-800 max-w-md mx-auto shadow-lg">
            <p className="text-xs sm:text-sm font-bold text-slate-100 leading-relaxed">
              {hasActionSucceeded
                ? currentStep.successMessage
                : currentStep.actionPrompt || currentStep.message}
            </p>
          </div>
        </div>
      </header>

      {/* 3. NEON CURVED ARROW, RIPPLE RINGS & HIGHLIGHTED AURA (MATCHING IMAGE 1 & 2) */}
      {activeRect && (
        <>
          {/* A. Concentric Ripple Pulse Rings directly centered over the target */}
          <div
            className="fixed pointer-events-none z-[9992] rounded-2xl flex items-center justify-center"
            style={{
              top: `${Math.max(2, activeRect.top - 6)}px`,
              left: `${Math.max(2, activeRect.left - 6)}px`,
              width: `${activeRect.width + 12}px`,
              height: `${activeRect.height + 12}px`,
            }}
          >
            {/* Outer Pulsing Wave Ring */}
            <div className="absolute inset-[-14px] rounded-3xl border-2 border-cyan-400/60 animate-ping pointer-events-none" />

            {/* Glowing Golden Action Aura */}
            <div
              className={`absolute inset-0 rounded-2xl transition-all duration-300 pointer-events-none ${
                hasActionSucceeded
                  ? 'ring-4 ring-emerald-400 shadow-[0_0_40px_rgba(52,211,153,0.95)]'
                  : 'ring-4 ring-amber-400 shadow-[0_0_45px_rgba(251,191,36,0.95)] animate-pulse'
              }`}
            />

            {/* Animated gesture hand right at target (Image 2) */}
            {!hasActionSucceeded && (
              <GestureHand className="absolute -bottom-6 -right-6 z-[9995]" />
            )}
          </div>

          {/* B. Curved Neon Arrow Beam & Ripple Discs (Image 1: السهم المنحني النيون المشع) */}
          {!hasActionSucceeded && (
            <div className="fixed inset-0 pointer-events-none z-[9993]">
              <svg className="w-full h-full" style={{ width: '100vw', height: '100vh' }}>
                <defs>
                  {/* Linear gradient for neon arrow beam */}
                  <linearGradient id="neon-cyan-beam" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
                    <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="1" />
                  </linearGradient>

                  {/* Filter for extreme glowing energy */}
                  <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="5" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Vertical / Curved Glowing Beam pointing down into the target */}
                {robotFitsAbove ? (
                  <g filter="url(#neon-glow)">
                    {/* Concentric oval rings above target */}
                    <ellipse
                      cx={targetCenterX}
                      cy={Math.max(10, activeRect.top - 24)}
                      rx="36"
                      ry="12"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="3.5"
                      strokeDasharray="6 3"
                      className="animate-pulse"
                    />
                    <ellipse
                      cx={targetCenterX}
                      cy={Math.max(10, activeRect.top - 18)}
                      rx="26"
                      ry="8"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="3"
                    />

                    {/* Massive Downward Chevron Arrow (Image 1 style) */}
                    <path
                      d={`M ${targetCenterX - 45} ${Math.max(10, activeRect.top - 110)}
                          C ${targetCenterX - 30} ${Math.max(10, activeRect.top - 70)},
                            ${targetCenterX - 20} ${Math.max(10, activeRect.top - 50)},
                            ${targetCenterX} ${Math.max(4, activeRect.top - 16)}`}
                      fill="none"
                      stroke="url(#neon-cyan-beam)"
                      strokeWidth="20"
                      strokeLinecap="round"
                    />

                    {/* Arrow Head V */}
                    <polygon
                      points={`${targetCenterX},${Math.max(2, activeRect.top - 8)} ${targetCenterX - 24},${Math.max(2, activeRect.top - 36)} ${targetCenterX + 24},${Math.max(2, activeRect.top - 36)}`}
                      fill="#38bdf8"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  </g>
                ) : (
                  <g filter="url(#neon-glow)">
                    {/* Concentric oval rings below target */}
                    <ellipse
                      cx={targetCenterX}
                      cy={activeRect.top + activeRect.height + 24}
                      rx="36"
                      ry="12"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="3.5"
                      strokeDasharray="6 3"
                      className="animate-pulse"
                    />

                    {/* Upward Arrow Head */}
                    <polygon
                      points={`${targetCenterX},${activeRect.top + activeRect.height + 8} ${targetCenterX - 24},${activeRect.top + activeRect.height + 36} ${targetCenterX + 24},${activeRect.top + activeRect.height + 36}`}
                      fill="#38bdf8"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  </g>
                )}
              </svg>
            </div>
          )}

          {/* C. THE ROBOT MASCOT WITH SPEECH BUBBLE (MATCHING IMAGE 1) */}
          <div
            className="fixed pointer-events-none z-[9994] flex flex-col items-center transition-all duration-300"
            style={{
              top: robotFitsAbove
                ? `${Math.max(130, activeRect.top - 175)}px`
                : `${Math.min(window.innerHeight - 180, activeRect.top + activeRect.height + 40)}px`,
              left: `${Math.min(window.innerWidth - 180, Math.max(20, targetCenterX - 90))}px`,
            }}
          >
            {/* Mascot Speech Bubble (Image 1: ممتاز! اضغط هنا الآن) */}
            <div className="relative mb-2 animate-bounce">
              <div className="bg-white text-slate-950 font-black text-xs sm:text-sm px-4 py-2 rounded-2xl shadow-[0_8px_25px_rgba(0,0,0,0.5)] border-2 border-slate-900 whitespace-nowrap flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                <span>{mascotSpeechText}</span>
              </div>
              {/* Bubble Pointer Tail */}
              <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white mx-auto" />
            </div>

            {/* Floating Robot */}
            <CuteMascotRobot />
          </div>
        </>
      )}

      {/* 4. DOCKED BOTTOM NAVIGATION & ACTION BAR (MATCHING IMAGE 2: خطوة 1 من 3 • اسحب للأعلى | تخطي) */}
      <footer className="fixed bottom-3 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-auto sm:w-[500px] sm:mx-auto z-[9995] pointer-events-auto">
        <div className="bg-slate-900/95 border-2 border-amber-500/70 rounded-2xl p-3 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center text-xs font-black shrink-0">
              {displayStepNumber}
            </span>
            <div className="min-w-0">
              <div className="text-[10px] text-amber-400/90 font-bold">
                خطوة {displayStepNumber} من {totalSteps}
              </div>
              <strong className="text-xs text-white truncate block">
                {currentStep.actionPrompt || currentStep.title}
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isTargetInSection ? (
              <button
                type="button"
                onClick={handleGoToTarget}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-md transition flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>انتقل لقسم «{currentStep.navSectionLabel}»</span>
              </button>
            ) : hasActionSucceeded ? (
              <button
                type="button"
                onClick={() => {
                  playSound('click');
                  onStepComplete();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg transition flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>متابعة {autoAdvanceTimer !== null ? `(${autoAdvanceTimer}ث)` : ''}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={scrollToTargetElement}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                title="تحديد وإبراز مكان الزر على الشاشة"
              >
                <LocateFixed className="w-3.5 h-3.5" />
                <span>حدد مكانه</span>
              </button>
            )}

            {/* Skip Button (Image 2 style: تخطي) */}
            <button
              type="button"
              onClick={onSkip}
              className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition border border-slate-700 cursor-pointer"
              title="تخطي الجولة التوجيهية والبدء المباشر"
            >
              تخطي
            </button>
          </div>
        </div>

        {/* Diagnostic alert if player is missing resources */}
        {diagnosticMessage && (
          <div className="mt-2 p-2 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="leading-snug">{diagnosticMessage}</span>
          </div>
        )}
      </footer>
    </div>
  );
}
