import React, { useState } from 'react';
import { findCountry } from '../domain/countries';
import type { SectionId } from '../domain/navigation';
import type { PlayerProfile } from '../domain/player';
import { getCountryScenario, type CountryStoryQuest } from '../game/countryScenarios';
import { isSectionUnlocked } from '../game/onboarding';
import { playSound } from '../game/soundEffects';
import { QuestBriefingModal } from './QuestBriefingModal';

interface SmartOnboardingQuestsProps {
  profile: PlayerProfile;
  onNavigate: (section: SectionId, target?: string) => void;
  onClaimReward: (cash: number, diamonds: number, questId: string) => void;
  onMarkBriefingSeen?: (questId: string) => void;
  onStartGuidedWalkthrough?: (quest: CountryStoryQuest) => void;
}

export interface QuestStep {
  id: string;
  stepNumber: number;
  title: string;
  desc: string;
  icon: string;
  targetSection: SectionId;
  cashReward: number;
  diamondReward: number;
  isCompleted: (p: PlayerProfile) => boolean;
}

export const SmartOnboardingQuests: React.FC<SmartOnboardingQuestsProps> = ({
  profile,
  onNavigate,
  onClaimReward,
  onMarkBriefingSeen,
  onStartGuidedWalkthrough,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeBriefingQuest, setActiveBriefingQuest] = useState<{
    quest: CountryStoryQuest;
    isReplay: boolean;
  } | null>(null);

  const country = findCountry(profile.countryId) ?? findCountry('egypt')!;
  const scenario = getCountryScenario(country.id);
  const quests = scenario.quests;

  const claimedSet = new Set<string>([
    ...(profile.onboarding?.claimedStoryQuestIds ?? []),
  ]);
  const seenBriefings = new Set<string>(profile.onboarding?.seenQuestBriefings ?? []);

  const completedCount = quests.filter((q) => q.isCompleted(profile)).length;
  const claimableQuests = quests.filter((q) => q.isCompleted(profile) && !claimedSet.has(q.id));

  const handleClaim = (quest: CountryStoryQuest) => {
    if (!quest.isCompleted(profile) || claimedSet.has(quest.id)) return;
    playSound('cash');
    playSound('levelUp');
    onClaimReward(quest.cashReward, quest.diamondReward, quest.id);
  };

  const handleClaimAll = () => {
    if (claimableQuests.length === 0) return;
    playSound('cash');
    claimableQuests.forEach((quest) => onClaimReward(quest.cashReward, quest.diamondReward, quest.id));
  };

  const handleOpenBriefing = (quest: CountryStoryQuest, isReplay: boolean) => {
    playSound('click');
    setActiveBriefingQuest({ quest, isReplay });
  };

  const handleExecuteQuest = (quest: CountryStoryQuest) => {
    playSound('click');
    if (!seenBriefings.has(quest.id)) {
      setActiveBriefingQuest({ quest, isReplay: false });
      return;
    }
    if (isSectionUnlocked(profile, quest.targetSection)) {
      onStartGuidedWalkthrough?.(quest);
      onNavigate(quest.targetSection);
    }
  };

  return (
    <div className="space-y-3" dir="rtl">
      <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-4 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{country.flag}</span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  المهام التعليمية المستمرة · {country.name}
                </h3>
                <span className="text-[11px] text-emerald-300 font-bold font-mono">
                  ({completedCount} / {quests.length} مكتمل)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                اختر أي مهمة متاحة وتعلّم نظامًا جديدًا بالوتيرة المناسبة لك؛ المهام لا تُفرض كسلسلة قصصية متتابعة
              </p>
            </div>
          </div>

          {claimableQuests.length > 0 && (
            <button
              type="button"
              onClick={handleClaimAll}
              className="w-full mb-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg cursor-pointer"
            >
              جمع الكل · {claimableQuests.length} مكافآت جاهزة 🎁
            </button>
          )}

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="text-xs text-emerald-400 hover:text-emerald-300 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 cursor-pointer"
          >
            {collapsed ? 'عرض المهام ▼' : 'طي ▲'}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
          <div
            className="bg-gradient-to-r from-emerald-500 via-teal-400 to-lime-400 h-full transition-all duration-500"
            style={{ width: `${(completedCount / Math.max(1, quests.length)) * 100}%` }}
          />
        </div>

        {!collapsed && (
          <div className="space-y-2.5">
            {quests.map((quest) => {
              const available = quest.isAvailable(profile);
              const completed = quest.isCompleted(profile);
              const claimed = claimedSet.has(quest.id);
              const isCurrent = false;
              const advisor = scenario.advisors[quest.briefing.advisorRole];

              return (
                <div
                  key={quest.id}
                  className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    completed
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : isCurrent
                      ? 'bg-slate-800/90 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                      : available
                      ? 'bg-slate-900/70 border-slate-800'
                      : 'bg-slate-950/40 border-slate-800/70 opacity-65'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="text-xl p-2 rounded-xl bg-slate-800 border border-slate-700 shrink-0">
                      {available || completed ? quest.icon : '🔒'}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          المهمة {quest.stepNumber}: {quest.title}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          · {advisor.name}
                        </span>
                        {completed && (
                          <span className="text-[10px] text-emerald-400 font-bold">
                            ✓ مكتملة
                          </span>
                        )}
                        {isCurrent && (
                          <span className="text-[10px] text-amber-300 font-bold">
                            ◀ نشطة الآن
                          </span>
                        )}
                        {!available && !completed && (
                          <span className="text-[10px] text-slate-400">
                            · تفتح في المرحلة {quest.stageNumber}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-300 mt-1 max-w-xl leading-relaxed">
                        {quest.shortDescription}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                        <span className="text-amber-300 font-semibold">
                          الحالة: {quest.getProgressText(profile)}
                        </span>
                        <span>·</span>
                        <span className="text-emerald-400 font-mono">
                          مكافأة: +{quest.cashReward.toLocaleString('ar-EG')} $
                        </span>
                        <span>·</span>
                        <span className="text-cyan-300 font-mono">
                          +{quest.diamondReward} ماسة
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-end sm:self-center shrink-0">
                    {(available || completed) && (
                      <button
                        type="button"
                        onClick={() => handleOpenBriefing(quest, seenBriefings.has(quest.id))}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-700 cursor-pointer"
                        title="قراءة أو إعادة عرض حوار المستشار وخطة التنفيذ"
                      >
                          {seenBriefings.has(quest.id) ? 'مراجعة الشرح 📖' : 'شرح المهمة 📖'}
                      </button>
                    )}

                    {completed ? (
                      claimed ? (
                        <span className="text-xs font-bold text-slate-400 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
                          تم استلام المكافأة ✓
                        </span>
                      ) : (
                        <button
                          type="button"
                          data-guide-target="claim-story-quest-btn"
                          onClick={() => handleClaim(quest)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg cursor-pointer"
                        >
                          استلم المكافأة 🎁
                        </button>
                      )
                    ) : available ? (
                      <button
                        type="button"
                        onClick={() => handleExecuteQuest(quest)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          isCurrent
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md font-extrabold'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                        }`}
                      >
                        <span>{seenBriefings.has(quest.id) ? 'انتقل للتنفيذ' : 'ابدأ المهمة'}</span>
                        <span>←</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500 px-2.5 py-1">مغلقة حالياً</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {activeBriefingQuest && (
        <QuestBriefingModal
          quest={activeBriefingQuest.quest}
          advisor={scenario.advisors[activeBriefingQuest.quest.briefing.advisorRole]}
          countryName={country.name}
          countryFlag={country.flag}
          isReplay={activeBriefingQuest.isReplay}
          onSkip={() => {
            onMarkBriefingSeen?.(activeBriefingQuest.quest.id);
            setActiveBriefingQuest(null);
          }}
          onStartExecution={() => {
            const q = activeBriefingQuest.quest;
            onMarkBriefingSeen?.(q.id);
            setActiveBriefingQuest(null);
            if (isSectionUnlocked(profile, q.targetSection)) {
              onStartGuidedWalkthrough?.(q);
              onNavigate(q.targetSection);
            }
          }}
        />
      )}
    </div>
  );
};
