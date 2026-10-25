import React from 'react';
import { Trophy, Sparkles, X, ArrowRight, Award } from 'lucide-react';
import { playSound } from '../game/soundEffects';

export interface CelebrationData {
  title: string;
  subtitle: string;
  rewardText?: string;
  quote?: string;
  speaker?: string;
}

interface CelebrationModalProps {
  data: CelebrationData | null;
  onClose: () => void;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({ data, onClose }) => {
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in" dir="rtl">
      <div className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-3xl max-w-md w-full p-6 text-center text-slate-100 shadow-2xl overflow-hidden shadow-amber-500/20">
        {/* Glow backdrop */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800/60 transition"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Trophy icon with celebration ring */}
        <div className="relative mx-auto w-20 h-20 mb-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-300 animate-spin opacity-40 blur-sm" style={{ animationDuration: '6s' }} />
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/40">
            <Trophy className="w-9 h-9" />
          </div>
        </div>

        <span className="inline-block px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold mb-2">
          ✨ إنجاز تاريخي في الإمبراطورية!
        </span>

        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
          {data.title}
        </h3>

        <p className="text-sm text-slate-300 mb-5 leading-relaxed">
          {data.subtitle}
        </p>

        {data.quote && (
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 mb-5 text-right relative">
            <span className="text-xs font-bold text-amber-400 block mb-1">
              💬 {data.speaker || 'عم إبراهيم'}:
            </span>
            <p className="text-xs text-slate-300 italic leading-relaxed">
              "{data.quote}"
            </p>
          </div>
        )}

        {data.rewardText && (
          <div className="py-2.5 px-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm font-bold flex items-center justify-center gap-2 mb-6">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>المكافأة: {data.rewardText}</span>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 transition-transform active:scale-95 flex items-center justify-center gap-2"
        >
          <span>متابعة التوسع في الإمبراطورية 🚀</span>
        </button>
      </div>
    </div>
  );
};
