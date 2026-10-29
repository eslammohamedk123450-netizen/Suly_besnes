/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import type { PlayerProfile } from '../domain/player';
import {
  type QuestTask,
  DEFAULT_QUEST_TASKS,
  loadQuestTasks,
  saveQuestTasks,
  syncQuestTasksWithGame,
} from '../domain/questSystem';
import { playSound } from '../game/soundEffects';
import { formatMoney } from '../domain/formatters';
import {
  Trophy,
  CheckCircle2,
  Gift,
  X,
  Sparkles,
  ChevronLeft,
  Flame,
  Award,
} from 'lucide-react';

export type { QuestTask };

interface QuestManagerProps {
  profile: PlayerProfile;
  onUpdateProfile?: (updatedProfile: PlayerProfile) => void;
  isOpen?: boolean;
  onClose?: () => void;
  showFloatingButton?: boolean;
}

export const QuestManager: React.FC<QuestManagerProps> = ({
  profile,
  onUpdateProfile,
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  showFloatingButton = true,
}) => {
  // إدارة حالة الفتح والإغلاق محلياً أو خارجياً
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const handleClose = () => {
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
  };
  const handleOpen = () => setInternalIsOpen(true);

  // إدارة حالة المهام (Quest State)
  const [tasks, setTasks] = useState<QuestTask[]>(() => {
    const loaded = loadQuestTasks(profile.id);
    return syncQuestTasksWithGame(profile, loaded);
  });

  const [claimToast, setClaimToast] = useState<{ title: string; reward: string } | null>(null);

  // 4. ربط أحداث اللعبة تلقائياً عند تغير بيانات اللاعب (مثل بناء مبنى أو جمع المال أو الترقية)
  useEffect(() => {
    setTasks((prevTasks) => {
      const updated = syncQuestTasksWithGame(profile, prevTasks);
      saveQuestTasks(profile.id, updated);
      return updated;
    });
  }, [
    profile.companies?.length,
    profile.bankBalance,
    profile.warehouseLevel,
    profile.level,
    profile.cartelStrongholdLevel,
  ]);

  // عدد المهام الجاهزة للاستلام حالياً
  const claimableCount = tasks.filter((t) => t.isCompleted && !t.isClaimed).length;
  const completedCount = tasks.filter((t) => t.isCompleted).length;

  // استلام المكافأة (Claim Reward)
  const handleClaimReward = (task: QuestTask) => {
    if (!task.isCompleted || task.isClaimed) return;

    // تشغيل المؤثرات الصوتية
    playSound('cash');
    playSound('success');

    // تحديث بيانات اللاعب وإضافة المكافأة
    const updatedProfile: PlayerProfile = {
      ...profile,
      bankBalance:
        task.reward.type === 'gold'
          ? profile.bankBalance + task.reward.amount
          : profile.bankBalance,
      diamonds:
        task.reward.type === 'diamonds'
          ? profile.diamonds + task.reward.amount
          : profile.diamonds,
    };

    // تحديث حالة المهمة كمستلمة
    const nextTasks = tasks.map((t) =>
      t.id === task.id ? { ...t, isClaimed: true } : t
    );
    setTasks(nextTasks);
    saveQuestTasks(profile.id, nextTasks);

    // إشعار استلام الجائزة
    setClaimToast({
      title: task.title,
      reward: task.reward.label,
    });
    setTimeout(() => {
      setClaimToast(null);
    }, 3500);

    if (onUpdateProfile) {
      onUpdateProfile(updatedProfile);
    }
  };

  return (
    <>
      {/* الزر العائم لفتح شريط المهام (Floating Gold Trigger) */}
      {showFloatingButton && (
        <div className="fixed bottom-24 right-4 z-40 sm:bottom-6 sm:right-6">
          <button
            onClick={handleOpen}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-xs shadow-xl shadow-amber-500/25 border border-amber-300 hover:brightness-110 active:scale-95 transition-all select-none"
            aria-label="نظام المهام"
          >
            <div className="relative">
              <Trophy className="w-5 h-5 text-slate-950" />
              {claimableCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-black text-white animate-bounce shadow">
                  {claimableCount}
                </span>
              )}
            </div>
            <span className="tracking-wide">المهام اليومية</span>
            {claimableCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-md bg-slate-950/20 text-slate-950 text-[10px] font-black">
                {claimableCount} جاهزة!
              </span>
            )}
          </button>
        </div>
      )}

      {/* النافذة المنزلقة / الشريط الجانبي (Sidebar / Modal) بتصميم Dark Mode ولمسات ذهبية */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/80 backdrop-blur-md transition-opacity animate-fade-in" dir="rtl">
          {/* خلفية قابلة للنقر للإغلاق */}
          <div className="absolute inset-0" onClick={handleClose} />

          {/* الحاوية الجانبية للمهام */}
          <div className="relative w-full max-w-md bg-slate-950 border-r border-amber-500/30 text-slate-100 flex flex-col h-full shadow-2xl overflow-hidden z-10 animate-slide-left">
            {/* الشريط العلوي الفخم */}
            <div className="p-4 bg-gradient-to-b from-slate-900 to-slate-950 border-b border-amber-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950">
                  <Trophy className="w-5 h-5 font-bold" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white">نظام المهام وتوجيه اللاعب</h3>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                      Quest System
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    أهداف واضحة ومكافآت فورية لبناء وتطوير إمبراطوريتك
                  </p>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                aria-label="إغلاق المهام"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* شريط الإنجاز العام */}
            <div className="px-5 py-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-slate-300">التقدم في المهام:</span>
                <span className="text-amber-400 font-mono font-bold">
                  {completedCount} من {tasks.length} مكتملة
                </span>
              </div>
              <div className="w-28 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full transition-all duration-500"
                  style={{ width: `${(completedCount / tasks.length) * 100}%` }}
                />
              </div>
            </div>

            {/* رسالة التهنئة المنبثقة عند استلام المكافأة */}
            {claimToast && (
              <div className="mx-4 mt-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-emerald-500/20 border border-amber-400/50 flex items-center gap-2.5 animate-bounce">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="text-xs">
                  <span className="font-black text-amber-200 block">مبروك! استلمت مكافأة مهمة:</span>
                  <span className="text-white font-bold">{claimToast.title} ({claimToast.reward})</span>
                </div>
              </div>
            )}

            {/* قائمة المهام (Quest List) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {tasks.map((task) => {
                const progressPercent = Math.min(
                  100,
                  Math.floor((task.currentAmount / task.targetAmount) * 100)
                );
                const canClaim = task.isCompleted && !task.isClaimed;

                return (
                  <div
                    key={task.id}
                    className={`rounded-2xl border p-4 transition-all ${
                      task.isClaimed
                        ? 'bg-slate-950/60 border-slate-800/80 opacity-75'
                        : canClaim
                        ? 'bg-gradient-to-b from-amber-950/30 to-slate-900 border-amber-400 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/40'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* رأس بطاقة المهمة */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{task.icon ?? '🎯'}</span>
                        <div>
                          <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                            <span>{task.title}</span>
                            {task.isClaimed && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            )}
                          </h4>
                          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                            {task.description}
                          </p>
                        </div>
                      </div>

                      {/* شارة المكافأة الذهبية */}
                      <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs">
                        <Gift className="w-3.5 h-3.5 text-amber-400" />
                        <span>{task.reward.label}</span>
                      </div>
                    </div>

                    {/* شريط التقدم */}
                    <div className="space-y-1.5 my-3">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>التقدم الحالي:</span>
                        <span className="font-mono font-bold text-slate-200">
                          {task.currentAmount.toLocaleString('ar-EG')} / {task.targetAmount.toLocaleString('ar-EG')}
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-800 border border-slate-700/80 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            task.isClaimed
                              ? 'bg-emerald-500'
                              : canClaim
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow'
                              : 'bg-amber-500/70'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* زر استلام المكافأة أو حالة الإنجاز */}
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        {task.isClaimed
                          ? '✅ تم استلام المكافأة بنجاح'
                          : canClaim
                          ? '✨ المهمة مكتملة! المكافأة جاهزة'
                          : '⏳ قيد التقدم...'}
                      </span>

                      {task.isClaimed ? (
                        <button
                          disabled
                          className="px-3.5 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-400 text-xs font-bold flex items-center gap-1 cursor-default"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>تم الاستلام</span>
                        </button>
                      ) : (
                        <button
                          disabled={!canClaim}
                          onClick={() => handleClaimReward(task)}
                          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md ${
                            canClaim
                              ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 hover:brightness-110 active:scale-95 animate-pulse cursor-pointer shadow-amber-500/20'
                              : 'bg-slate-800 text-slate-500 border border-slate-700/80 cursor-not-allowed'
                          }`}
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>استلام المكافأة (Claim)</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* التذييل السفلي */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>تُحتسب الإنجازات فورياً من مجريات اللعبة</span>
              <button
                onClick={handleClose}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
