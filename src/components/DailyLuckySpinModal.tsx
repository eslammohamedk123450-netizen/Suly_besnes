import React, { useState, useEffect } from 'react';
import { X, Sparkles, Trophy, RefreshCw, Coins, Clock, ChevronUp, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { PlayerProfile } from '../domain/player';
import { playSound } from '../game/soundEffects';
import {
  getLuckySpinState,
  recordLuckySpinUsed,
  getLuckyWheelTier,
  LUCKY_WHEEL_TIERS,
  selectWeightedPrize,
  type LuckyWheelPrize,
} from '../game/luckyWheelService';

interface DailyLuckySpinModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  onRewardWon: (reward: {
    type: 'cash' | 'gold' | 'diamonds' | 'speed_card';
    amount: number;
    label: string;
    wasFree: boolean;
    costDiamonds?: number;
  }) => void;
  onUpgradeWheel?: (newLevel: number, diamondCost: number) => void;
}

export const DailyLuckySpinModal: React.FC<DailyLuckySpinModalProps> = ({
  isOpen,
  onClose,
  profile,
  onRewardWon,
  onUpgradeWheel,
}) => {
  const currentLevel = profile.luckyWheelLevel ?? 1;
  const currentTier = getLuckyWheelTier(currentLevel);
  const nextTier = currentLevel < 5 ? getLuckyWheelTier(currentLevel + 1) : null;

  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<LuckyWheelPrize | null>(null);
  const [spinState, setSpinState] = useState(() => getLuckySpinState(profile.lastSpinTimestamp, currentLevel));
  const [showOddsModal, setShowOddsModal] = useState(false);
  const [showUpgradeConfirm, setShowUpgradeConfirm] = useState(false);

  // Ticking countdown timer
  useEffect(() => {
    if (!isOpen) return;
    setSpinState(getLuckySpinState(profile.lastSpinTimestamp, currentLevel));
    const timer = setInterval(() => {
      setSpinState(getLuckySpinState(profile.lastSpinTimestamp, currentLevel));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, profile.lastSpinTimestamp, currentLevel]);

  if (!isOpen) return null;

  const isFreeSpinAvailable = spinState.isFree;
  const prizes = currentTier.prizes;

  const handleSpin = () => {
    if (isSpinning) return;
    if (!isFreeSpinAvailable && (profile.diamonds ?? 0) < currentTier.spinCostDiamonds) {
      playSound('error');
      return;
    }

    const wasFree = isFreeSpinAvailable;
    setIsSpinning(true);
    setWonPrize(null);
    playSound('auction');

    // Pick target prize using transparent weighted chances
    const targetPrize = selectWeightedPrize(prizes);
    const prizeIndex = prizes.findIndex((p) => p.id === targetPrize.id);

    // Compute rotation degrees (8 slices = 45 deg per slice)
    const extraRounds = 5 + Math.floor(Math.random() * 3);
    const sliceAngle = 360 / prizes.length;
    // Align target slice to the top pointer
    const targetAngle = (360 - (prizeIndex * sliceAngle)) - (sliceAngle / 2);
    const newRotation = rotation + (extraRounds * 360) + targetAngle - (rotation % 360);

    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setWonPrize(targetPrize);
      playSound('cash');
      playSound('levelUp');

      if (wasFree) {
        recordLuckySpinUsed();
        setSpinState(getLuckySpinState(Date.now(), currentLevel));
      }

      onRewardWon({
        type: targetPrize.type,
        amount: targetPrize.amount,
        label: targetPrize.label,
        wasFree,
        costDiamonds: wasFree ? 0 : currentTier.spinCostDiamonds,
      });
    }, 4500);
  };

  const handleConfirmUpgrade = () => {
    if (!nextTier) return;
    if ((profile.diamonds ?? 0) < nextTier.upgradeCostDiamonds) {
      playSound('error');
      return;
    }
    playSound('levelUp');
    onUpgradeWheel?.(nextTier.level, nextTier.upgradeCostDiamonds);
    setShowUpgradeConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in" dir="rtl">
      <div className="relative bg-slate-900 border border-amber-500/40 rounded-3xl max-w-md w-full p-5 sm:p-6 text-center text-slate-100 shadow-2xl overflow-hidden shadow-amber-500/15 flex flex-col items-center max-h-[95vh] overflow-y-auto">
        {/* Ambient glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          disabled={isSpinning}
          className="absolute top-4 left-4 p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800 transition"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Level & Tier Badge */}
        <div className="flex items-center gap-2 mb-1">
          <span className="px-3 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 flex items-center gap-1 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            المستوى {currentTier.level}: {currentTier.name} ({currentTier.badge})
          </span>
          <button
            type="button"
            onClick={() => setShowOddsModal(true)}
            className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold flex items-center gap-1 border border-amber-500/30 transition"
            title="عرض نسب الاحتمالات الشفافة"
          >
            <Info className="w-3 h-3" />
            النسب
          </button>
        </div>

        <h3 className="text-xl font-black text-white mb-0.5">
          دوّر العجلة واربح موارد فورية! 🎡
        </h3>
        <p className="text-[11px] text-slate-400 mb-2">
          {currentTier.subtitle}
        </p>

        {/* Free Spin Timer Status */}
        <div className="mb-2 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-2 border shadow-sm">
          {isFreeSpinAvailable ? (
            <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/60 border-emerald-500/50 px-3 py-1 rounded-full border">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>دورة مجانية متاحة الآن! 🎉</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-300 bg-amber-950/50 border-amber-500/40 px-3 py-1 rounded-full border">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>الدورة المجانية القادمة بعد: <strong className="font-mono text-amber-200">{spinState.formattedCountdown}</strong></span>
            </span>
          )}
        </div>

        {/* Wheel Container */}
        <div className="relative w-60 h-60 sm:w-64 sm:h-64 my-1 flex items-center justify-center">
          {/* Top Pointer */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-amber-400 filter drop-shadow-[0_4px_6px_rgba(245,158,11,0.5)]" />

          {/* Rotating Wheel Body */}
          <div
            className="w-full h-full rounded-full border-4 border-amber-500 shadow-2xl relative overflow-hidden transition-all duration-[4500ms] ease-out"
            style={{
              transform: `rotate(${rotation}deg)`,
              background: 'conic-gradient(#1e293b 0deg 45deg, #0f172a 45deg 90deg, #1e293b 90deg 135deg, #0f172a 135deg 180deg, #1e293b 180deg 225deg, #0f172a 225deg 270deg, #1e293b 270deg 315deg, #0f172a 315deg 360deg)',
            }}
          >
            {prizes.map((prize, idx) => {
              const angle = idx * 45 + 22.5;
              return (
                <div
                  key={prize.id}
                  className="absolute top-0 left-1/2 w-14 -ml-7 h-full flex flex-col items-center pt-2.5 origin-center text-xs font-bold"
                  style={{
                    transform: `rotate(${angle}deg)`,
                  }}
                >
                  <span className="text-base mb-0.5">{prize.icon}</span>
                  <span
                    className="text-[9px] text-white font-extrabold whitespace-nowrap px-1 py-0.5 rounded shadow-sm"
                    style={{ color: prize.color }}
                  >
                    {prize.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Wheel Center Hub */}
          <div className="absolute w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 border-4 border-slate-900 shadow-xl flex items-center justify-center text-slate-950 font-black text-[10px] z-10">
            L{currentTier.level}
          </div>
        </div>

        {/* Won Prize Notification */}
        {wonPrize && (
          <div className="mt-3 p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-2 animate-bounce">
            <Trophy className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>مبروك! ربحت {wonPrize.label} تمت إضافتها فوراً! 🎁</span>
          </div>
        )}

        {/* Spin Action Button */}
        <div className="w-full mt-4 space-y-2">
          <button
            onClick={handleSpin}
            disabled={isSpinning || (!isFreeSpinAvailable && (profile.diamonds ?? 0) < currentTier.spinCostDiamonds)}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-50 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSpinning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>جاري التدوير...</span>
              </>
            ) : isFreeSpinAvailable ? (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>تدوير مجاني الآن! 🎯 (كل {currentTier.cooldownMinutes} دقيقة)</span>
              </>
            ) : (
              <>
                <Coins className="w-4 h-4 text-slate-950" />
                <span>تدوير إضافي بـ {currentTier.spinCostDiamonds} ماسة (أو انتظر {spinState.formattedCountdown})</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>رصيدك: <strong className="text-cyan-400">{profile.diamonds ?? 0} 💎</strong></span>
            {nextTier && (
              <button
                type="button"
                onClick={() => setShowUpgradeConfirm(true)}
                className="text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 underline underline-offset-2"
              >
                <ChevronUp className="w-3.5 h-3.5" />
                ترقية إلى {nextTier.name} ({nextTier.upgradeCostDiamonds} 💎)
              </button>
            )}
          </div>
        </div>

        {/* Transparent Odds Modal */}
        {showOddsModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-sm w-full p-4 text-right space-y-3 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="font-black text-amber-400 text-sm flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  نسب الاحتمالات الشفافة (المستوى {currentTier.level}: {currentTier.name})
                </h4>
                <button
                  type="button"
                  onClick={() => setShowOddsModal(false)}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {prizes.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                    <span className="flex items-center gap-2">
                      <span>{p.icon}</span>
                      <span className="font-bold text-slate-200">{p.label}</span>
                    </span>
                    <span className="font-black px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {p.chancePercent}%
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 text-center">
                الاحتمالات مبرمجة وموزعة بنزاهة تامة 100% ولا تخضع لأي تلاعب.
              </p>
            </div>
          </div>
        )}

        {/* Upgrade Confirmation Modal */}
        {showUpgradeConfirm && nextTier && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-amber-500/50 rounded-2xl max-w-sm w-full p-5 text-right space-y-4 shadow-2xl">
              <div className="flex items-center gap-2 text-amber-400 font-black text-base border-b border-slate-800 pb-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>تأكيد ترقية عجلة الحظ</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2 text-xs">
                <p className="text-slate-200 font-bold">
                  هل تريد ترقية العجلة من <strong className="text-amber-300">{currentTier.name}</strong> إلى <strong className="text-emerald-400">{nextTier.name}</strong>؟
                </p>
                <div className="space-y-1 text-slate-300 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>مكافآت مضاعفة تليق بنمو إمبراطوريتك</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>تقليل وقت الدورة المجانية إلى {nextTier.cooldownMinutes} دقيقة</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-cyan-400" />
                    <span>التكلفة: <strong className="text-cyan-300">{nextTier.upgradeCostDiamonds} ماسة</strong> (رصيدك الحالي: {profile.diamonds ?? 0} 💎)</span>
                  </div>
                </div>
              </div>

              {(profile.diamonds ?? 0) < nextTier.upgradeCostDiamonds && (
                <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>رصيد الماس غير كافٍ لإتمام الترقية.</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleConfirmUpgrade}
                  disabled={(profile.diamonds ?? 0) < nextTier.upgradeCostDiamonds}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs disabled:opacity-40 transition cursor-pointer"
                >
                  تأكيد وخصم {nextTier.upgradeCostDiamonds} 💎
                </button>
                <button
                  type="button"
                  onClick={() => setShowUpgradeConfirm(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
