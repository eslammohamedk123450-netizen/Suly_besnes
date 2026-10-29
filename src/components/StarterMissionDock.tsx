import { useState } from 'react';
import type { PlayerProfile } from '../domain/player';
import type { SectionId } from '../domain/navigation';
import {
  getStarterMissions,
  getCompletedStarterMissions,
  getCurrentStarterMissionStage,
  claimStarterMission,
  isSectionUnlocked,
} from '../game/onboarding';
import { Icon } from './Icon';
import { playSound } from '../game/soundEffects';
import { playCash, playClick } from '../utils/soundManager';

interface StarterMissionDockProps {
  profile: PlayerProfile;
  onNavigate: (section: SectionId) => void;
  onProfileUpdate?: (profile: PlayerProfile) => void;
}

export function StarterMissionDock({ profile, onNavigate, onProfileUpdate }: StarterMissionDockProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'current' | 'completed'>('current');

  const currentStage = getCurrentStarterMissionStage(profile);
  const currentMissions = getStarterMissions(profile);
  const completedMissions = getCompletedStarterMissions(profile);

  const claimableCount = currentMissions.filter((m) => m.completed && !m.claimed).length;
  const stageName = currentMissions[0]?.stageName || (currentStage <= 3 ? `المرحلة ${currentStage}` : 'جميع المراحل مكتملة');

  const handleClaim = (missionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const result = claimStarterMission(profile, missionId);
    if (result.ok) {
      playCash();
      playSound('cash');
      playSound('levelUp');
      if (onProfileUpdate) {
        onProfileUpdate(result.profile);
      }
    }
  };

  return (
    <div className={`mission-dock${open ? ' is-open' : ''}`} dir="rtl">
      <button
        className="mission-dock-toggle"
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="فتح المهام الأولية"
      >
        <Icon name="tasks" size={22} />
        <span>المهام الأولية</span>
        {claimableCount > 0 ? (
          <b className="bg-emerald-500 text-slate-950 animate-pulse">{claimableCount}</b>
        ) : currentMissions.length > 0 ? (
          <b>{currentMissions.length}</b>
        ) : null}
      </button>

      {open && (
        <section className="mission-dock-panel" aria-label="المهام الأولية">
          <div className="mission-dock-heading">
            <div>
              <span className="section-kicker">نظام المهام المرحلية</span>
              <strong>{stageName}</strong>
            </div>
            <button
              className="icon-button"
              type="button"
              onClick={() => setOpen(false)}
              aria-label="إغلاق المهام"
            >
              <Icon name="close" size={17} />
            </button>
          </div>

          {/* Sub Tabs: Current vs Completed Archive */}
          <div className="flex gap-2 p-1 bg-slate-950/80 rounded-xl mb-3 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('current')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition ${
                activeTab === 'current'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              المهام الحالية ({currentMissions.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('completed')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition ${
                activeTab === 'completed'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              سجل المكتملة ({completedMissions.length})
            </button>
          </div>

          {activeTab === 'current' ? (
            <>
              {currentMissions.length === 0 ? (
                <div className="text-center py-6 px-3 bg-slate-900/50 rounded-2xl border border-emerald-500/30">
                  <span className="text-3xl block mb-2">🏆</span>
                  <strong className="text-amber-400 text-sm block">تهانينا! لقد أتممت مهام هذه المرحلة بنجاح</strong>
                  <p className="text-xs text-slate-400 mt-1">
                    {currentStage > 3
                      ? 'تم إنجاز كافة المراحل الأولية بالكامل وفتح كامل مزايا الإمبراطورية.'
                      : 'المرحلة التالية قيد التجهيز والفتح التلقائي.'}
                  </p>
                </div>
              ) : (
                <div className="mission-dock-list">
                  {currentMissions.map((mission) => {
                    const unlocked = isSectionUnlocked(profile, mission.section);
                    return (
                      <div
                        key={mission.id}
                        className={`mission-dock-item ${mission.completed ? 'is-complete border-emerald-500/50 bg-emerald-950/20' : ''}`}
                        onClick={() => {
                          if (unlocked && !mission.completed) {
                            setOpen(false);
                            onNavigate(mission.section);
                          }
                        }}
                      >
                        <span className="mission-dock-check">
                          {mission.completed ? '✓' : <Icon name={unlocked ? 'arrow' : 'lock'} size={14} />}
                        </span>
                        <div className="flex-1 min-w-0 pr-1">
                          <div className="flex items-center justify-between gap-1">
                            <strong className="truncate text-xs text-white">{mission.title}</strong>
                            <span className="text-[10px] text-amber-400 font-mono font-bold shrink-0">
                              +{mission.cashReward.toLocaleString()} $ | +{mission.diamondReward} 💎
                            </span>
                          </div>
                          <small className="line-clamp-2 text-[11px] text-slate-400">{mission.description}</small>
                          {mission.completed && (
                            <button
                              type="button"
                              onClick={(e) => handleClaim(mission.id, e)}
                              className="mt-2 w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-xs shadow-md transition transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <span>استلام المكافأة الآن 🎉</span>
                            </button>
                          )}
                        </div>
                        {!mission.completed && <Icon name="chevron" size={15} />}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            /* Completed Archive */
            <div className="mission-dock-list max-h-[300px] overflow-y-auto">
              {completedMissions.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  لا توجد مهام مكتملة في السجل بعد. أكمل أول مهمة في مرحلتك الحالية!
                </div>
              ) : (
                completedMissions.map((mission) => (
                  <div
                    key={mission.id}
                    className="p-2.5 rounded-xl bg-slate-900/60 border border-emerald-500/30 flex items-start justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <strong className="text-slate-200">{mission.title}</strong>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{mission.stageName}</p>
                    </div>
                    <span className="text-[10px] text-emerald-300 font-mono bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full shrink-0">
                      مكتملة ومحصّلة
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
