import React, { useState } from 'react';
import { X, Sparkles, Trophy, Award, RefreshCw, Coins, Zap } from 'lucide-react';
import type { PlayerProfile } from '../domain/player';
import { playSound } from '../game/soundEffects';

interface DailyLuckySpinModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  onRewardWon: (reward: { type: 'cash' | 'gold' | 'diamonds' | 'speed_card'; amount: number; label: string }) => void;
}

interface Prize {
  id: number;
  label: string;
  type: 'cash' | 'gold' | 'diamonds' | 'speed_card';
  amount: number;
  icon: string;
  color: string;
}

const PRIZES: Prize[] = [
  { id: 0, label: '50,000 ج.م', type: 'cash', amount: 50000, icon: '💵', color: '#10b981' },
  { id: 1, label: '5 ماسات', type: 'diamonds', amount: 5, icon: '💎', color: '#06b6d4' },
  { id: 2, label: '0.5 غرام ذهب', type: 'gold', amount: 0.5, icon: '🥇', color: '#f59e0b' },
  { id: 3, label: 'تسريع فوري', type: 'speed_card', amount: 1, icon: '⚡', color: '#8b5cf6' },
  { id: 4, label: '120,000 ج.م', type: 'cash', amount: 120000, icon: '💰', color: '#10b981' },
  { id: 5, label: '10 ماسات', type: 'diamonds', amount: 10, icon: '💎', color: '#38bdf8' },
  { id: 6, label: '1.0 غرام ذهب', type: 'gold', amount: 1.0, icon: '👑', color: '#eab308' },
  { id: 7, label: '25,000 ج.م', type: 'cash', amount: 25000, icon: '💵', color: '#34d399' },
];

export const DailyLuckySpinModal: React.FC<DailyLuckySpinModalProps> = ({
  isOpen,
  onClose,
  profile,
  onRewardWon,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<Prize | null>(null);

  if (!isOpen) return null;

  const lastSpinDay = (profile as any).lastSpinDay ?? -1;
  const isFreeSpinAvailable = lastSpinDay !== profile.day;

  const handleSpin = () => {
    if (isSpinning) return;
    if (!isFreeSpinAvailable && (profile.diamonds ?? 0) < 2) {
      playSound('error');
      return;
    }

    setIsSpinning(true);
    setWonPrize(null);
    playSound('auction');

    // Pick a random prize index
    const prizeIndex = Math.floor(Math.random() * PRIZES.length);
    const targetPrize = PRIZES[prizeIndex];

    // Compute rotation degrees (8 slices = 45 deg per slice)
    const extraRounds = 5 + Math.floor(Math.random() * 3);
    const sliceAngle = 360 / PRIZES.length;
    // Align target slice to the top pointer
    const targetAngle = (360 - (prizeIndex * sliceAngle)) - (sliceAngle / 2);
    const newRotation = rotation + (extraRounds * 360) + targetAngle - (rotation % 360);

    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setWonPrize(targetPrize);
      playSound('cash');
      playSound('levelUp');
      onRewardWon({
        type: targetPrize.type,
        amount: targetPrize.amount,
        label: targetPrize.label,
      });
    }, 4500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in" dir="rtl">
      <div className="relative bg-slate-900 border border-amber-500/40 rounded-3xl max-w-md w-full p-6 text-center text-slate-100 shadow-2xl overflow-hidden shadow-amber-500/15 flex flex-col items-center">
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

        <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm mb-1">
          <Sparkles className="w-4 h-4" />
          <span>عجلة الحظ والاستثمار اليومية</span>
        </div>

        <h3 className="text-xl font-black text-white mb-1">
          دوّر العجلة واربح موارد فورية! 🎡
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          {isFreeSpinAvailable 
            ? '✨ دورة مجانية متاحة لك اليوم!' 
            : 'يمكنك التدوير مجدداً مقابل 2 ماسة فقط 💎'}
        </p>

        {/* Wheel Container */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-2 flex items-center justify-center">
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
            {PRIZES.map((prize, idx) => {
              const angle = idx * 45 + 22.5;
              return (
                <div
                  key={prize.id}
                  className="absolute top-0 left-1/2 w-14 -ml-7 h-full flex flex-col items-center pt-3 origin-center text-xs font-bold"
                  style={{
                    transform: `rotate(${angle}deg)`,
                  }}
                >
                  <span className="text-lg mb-0.5">{prize.icon}</span>
                  <span 
                    className="text-[10px] text-white font-extrabold whitespace-nowrap px-1 py-0.5 rounded shadow-sm"
                    style={{ color: prize.color }}
                  >
                    {prize.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Wheel Center Hub */}
          <div className="absolute w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 border-4 border-slate-900 shadow-xl flex items-center justify-center text-slate-950 font-black text-xs z-10">
            SULY
          </div>
        </div>

        {/* Won Prize Notification */}
        {wonPrize && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-bold flex items-center gap-2 animate-bounce">
            <Trophy className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>مبروك! ربحت {wonPrize.label} تمت إضافتها إلى رصيدك فوراً! 🎁</span>
          </div>
        )}

        {/* Spin Action Button */}
        <div className="w-full mt-6 space-y-2">
          <button
            onClick={handleSpin}
            disabled={isSpinning || (!isFreeSpinAvailable && (profile.diamonds ?? 0) < 2)}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-50 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            {isSpinning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>جاري التدوير...</span>
              </>
            ) : isFreeSpinAvailable ? (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>تدوير مجاني الآن! 🎯</span>
              </>
            ) : (
              <>
                <Coins className="w-4 h-4 text-slate-950" />
                <span>تدوير إضافي (2 💎)</span>
              </>
            )}
          </button>

          {!isFreeSpinAvailable && (
            <p className="text-[11px] text-slate-400">
              رصيدك الحالي: <strong className="text-cyan-400">{profile.diamonds ?? 0} 💎</strong>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
