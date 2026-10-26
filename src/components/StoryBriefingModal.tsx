import React from 'react';
import type { GameMission } from '../game/missionsEngine';
import type { CountryDefinition } from '../domain/countries';
import { formatMoney, formatNumber } from '../domain/formatters';
import { playSound } from '../game/soundEffects';
import { Icon } from './Icon';
import { 
  X, 
  FastForward, 
  CheckCircle2, 
  AlertTriangle, 
  Target, 
  HelpCircle, 
  ArrowLeft,
  Sparkles,
  ShieldAlert,
  Compass
} from 'lucide-react';

interface StoryBriefingModalProps {
  mission: GameMission;
  country: CountryDefinition;
  character: {
    name: string;
    title: string;
    avatar: string;
  };
  onClose: () => void;
  onSkipDialogue: () => void;
  onStartExecution: () => void;
}

export const StoryBriefingModal: React.FC<StoryBriefingModalProps> = ({
  mission,
  country,
  character,
  onClose,
  onSkipDialogue,
  onStartExecution,
}) => {
  const briefing = mission.briefing;

  const handleSkip = () => {
    playSound('click');
    onSkipDialogue();
  };

  const handleStart = () => {
    playSound('click');
    onStartExecution();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fade-in" 
      dir="rtl"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-900/98 to-slate-950 border-2 border-amber-500/80 rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gold Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-3xl shadow-inner">
              {character.avatar}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  توجيه المهمة · الفصل {mission.chapter}
                </span>
                <span className="text-xs text-slate-400 font-bold">
                  {country.flag} {country.name}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                {mission.title}
              </h2>
            </div>
          </div>

          {/* Action Buttons: Skip and Close */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSkip}
              className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
              title="تخطي الحوار والانتقال للعب مباشرة دون تنفيذ تلقائي"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>تخطي الحوار</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-slate-200 text-sm">
          {/* Character Speech Quote */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
            <div className="flex-1">
              <strong className="text-amber-400 text-sm block mb-1">
                {character.name} ({character.title}):
              </strong>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed italic border-r-2 border-amber-500 pr-2.5">
                "{briefing.storyReason}"
              </p>
            </div>
          </div>

          {/* Target Goal Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <Target className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white text-xs sm:text-sm block">الهدف المطلوب تحقيقه:</strong>
              <p className="text-amber-200 text-xs mt-0.5 leading-relaxed font-semibold">
                {briefing.targetGoal}
              </p>
            </div>
          </div>

          {/* Practical Steps Checklist */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>الخطوات العملية المطلوبة منك ميدانياً:</span>
            </div>
            <div className="space-y-2">
              {briefing.practicalSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs">
                  <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    {idx + 1}
                  </span>
                  <span className="text-slate-300 leading-relaxed font-medium">
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Risks & Costs */}
          <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-start gap-2.5 text-xs">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200">المتطلبات والتكاليف والمخاطر:</strong>
              <p className="text-slate-400 mt-0.5">{briefing.costsAndRisks}</p>
            </div>
          </div>

          {/* Rewards Summary */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <div>
                <strong className="text-white block">مكافأة الإنجاز الحقيقي:</strong>
                <span className="text-emerald-300 font-bold">{briefing.rewardsSummary}</span>
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-400">
              <span>تُمنح بعد التحقق من الشرط</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleSkip}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition cursor-pointer"
          >
            <span>تخطي والتوجه للشاشة</span>
          </button>

          <button
            type="button"
            onClick={handleStart}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <span>فهمت المطلوب، لنبدأ الآن!</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
