import React, { useState } from 'react';
import type { PlayerProfile } from '../domain/player';
import type { ExpansionState } from '../game/expansionEngine';
import { resolveDilemmaOption } from '../game/expansionEngine';
import type { EconomicDilemmaOption } from '../domain/expansionSystems';
import { formatMoney } from '../domain/formatters';
import './DynamicEconomyEvents.css';

interface Props {
  profile: PlayerProfile;
  expansion: ExpansionState;
  onUpdate: (updatedProfile: PlayerProfile, updatedExpansion: ExpansionState) => void;
}

export const DynamicEconomyEvents: React.FC<Props> = ({ profile, expansion, onUpdate }) => {
  const [resultToast, setResultToast] = useState<string | null>(null);
  const dilemma = expansion.activeDilemma;

  if (!dilemma) return null;

  const handleSelectOption = (option: EconomicDilemmaOption) => {
    const res = resolveDilemmaOption(profile, expansion, option);
    onUpdate(res.updatedProfile, res.updatedExpansion);
    setResultToast(res.resultMessage);
    setTimeout(() => setResultToast(null), 4000);
  };

  return (
    <div className="dilemma-modal-overlay">
      <div className="dilemma-modal-card animate-fadeIn">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <span className="text-4xl animate-bounce">{dilemma.icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                حدث اقتصادي طارئ ⚡
              </span>
              <span className="text-xs text-slate-400">قرار المدير التنفيذي</span>
            </div>
            <h3 className="text-xl font-black text-amber-300 mt-0.5">{dilemma.title}</h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-200 leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-slate-800">
          {dilemma.description}
        </p>

        {/* Options */}
        <div className="flex flex-col gap-2.5">
          <div className="text-xs font-bold text-slate-400">اختر الاستراتيجية المناسبة لإدارة القرار:</div>

          {dilemma.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelectOption(option)}
              className="dilemma-option-btn group"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-sky-300 group-hover:text-amber-300 transition-colors">
                  {option.label}
                </span>
                <div className="flex items-center gap-2 text-xs font-bold">
                  {option.moneyChange !== 0 && (
                    <span className={option.moneyChange > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {option.moneyChange > 0 ? '+' : ''}
                      {formatMoney(option.moneyChange, profile.countryId)}
                    </span>
                  )}
                  {option.reputationChange !== 0 && (
                    <span className={option.reputationChange > 0 ? 'text-blue-400' : 'text-rose-400'}>
                      سمعة: {option.reputationChange > 0 ? '+' : ''}
                      {option.reputationChange}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-300 font-normal">{option.description}</p>
            </button>
          ))}
        </div>

        {resultToast && (
          <div className="bg-emerald-950 text-emerald-200 border border-emerald-500/50 p-3 rounded-lg text-xs font-bold text-center animate-pulse">
            {resultToast}
          </div>
        )}
      </div>
    </div>
  );
};
