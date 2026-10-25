import React, { useState } from 'react';
import type { PlayerProfile } from '../domain/player';
import type { SectionId } from '../domain/navigation';
import { formatMoney } from '../domain/formatters';
import { playSound } from '../game/soundEffects';

interface SmartOnboardingQuestsProps {
  profile: PlayerProfile;
  onNavigate: (section: SectionId, target?: string) => void;
  onClaimReward: (cash: number, diamonds: number, questId: string) => void;
  onRequestEmergencyLoan?: () => void;
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

export const QUEST_STEPS: QuestStep[] = [
  {
    id: 'quest-buy-land',
    stepNumber: 1,
    title: 'الاستحواذ على أول قطعة أرض',
    desc: 'اشترِ أول أرض (صناعية أو زراعية) في القاهرة من سوق الأراضي لتضع عليها حجر الأساس لمصانعك.',
    icon: '🗺️',
    targetSection: 'lands',
    cashReward: 60000,
    diamondReward: 5,
    isCompleted: (p) => (p.lands?.length ?? 0) > 0,
  },
  {
    id: 'quest-found-company',
    stepNumber: 2,
    title: 'تأسيس أول منشأة صناعية',
    desc: 'قم بترخيص وبناء مصنع في قطاع آمن للمبتدئين (مثل المواد الغذائية أو المنظفات) على أرضك.',
    icon: '🏭',
    targetSection: 'companies',
    cashReward: 80000,
    diamondReward: 10,
    isCompleted: (p) => (p.companies?.length ?? 0) > 0,
  },
  {
    id: 'quest-buy-materials',
    stepNumber: 3,
    title: 'تأمين المواد الخام للإنتاج',
    desc: 'ادخل إلى سوق الخامات واشترِ المواد الأساسية التي يحتاجها مصنعك لبدء التصنيع.',
    icon: '📦',
    targetSection: 'materials',
    cashReward: 50000,
    diamondReward: 5,
    isCompleted: (p) => {
      const mats = p.warehouse?.materials;
      if (!mats) return false;
      return Object.values(mats).some((qty) => (Number(qty) || 0) > 0);
    },
  },
  {
    id: 'quest-start-production',
    stepNumber: 4,
    title: 'تشغيل خط الإنتاج الأول',
    desc: 'شغّل الماكينات وحوّل المواد الخام إلى منتجات تامة الصنع قابلة للبيع في المستودع.',
    icon: '⚙️',
    targetSection: 'production',
    cashReward: 120000,
    diamondReward: 15,
    isCompleted: (p) => {
      const prods = p.warehouse?.products;
      if (!prods) return false;
      return Object.values(prods).some((qty) => (Number(qty) || 0) > 0);
    },
  },
  {
    id: 'quest-sell-market',
    stepNumber: 5,
    title: 'بيع أول شحنة وتحقيق الأرباح',
    desc: 'اعرض منتجاتك في السوق المحلي وجني أول إيراد نقدي لتبدأ أرباح إمبراطوريتك بالتدفق!',
    icon: '💰',
    targetSection: 'market',
    cashReward: 180000,
    diamondReward: 25,
    isCompleted: (p) => {
      // Completed if player has made at least one sales transaction or advanced several days with revenue
      return (p.ledger?.totalSalesRevenue ?? 0) > 0 || (p.stats?.totalProductsSold ?? 0) > 0;
    },
  },
];

export const SmartOnboardingQuests: React.FC<SmartOnboardingQuestsProps> = ({
  profile,
  onNavigate,
  onClaimReward,
  onRequestEmergencyLoan,
}) => {
  const [claimedQuests, setClaimedQuests] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`suly-claimed-quests-${profile.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [collapsed, setCollapsed] = useState(false);

  const completedCount = QUEST_STEPS.filter((q) => q.isCompleted(profile)).length;
  const currentStep = QUEST_STEPS.find((q) => !q.isCompleted(profile)) || QUEST_STEPS[QUEST_STEPS.length - 1];
  const allCompleted = completedCount === QUEST_STEPS.length;

  const handleClaim = (quest: QuestStep) => {
    playSound('cash');
    playSound('levelUp');
    const updated = [...claimedQuests, quest.id];
    setClaimedQuests(updated);
    try {
      localStorage.setItem(`suly-claimed-quests-${profile.id}`, JSON.stringify(updated));
    } catch {
      // ignore
    }
    onClaimReward(quest.cashReward, quest.diamondReward, quest.id);
  };

  const isLowBalance = (profile.bankBalance ?? 0) < 65000 && (profile.day ?? 1) <= 15;

  return (
    <div className="space-y-3" dir="rtl">
      {/* Emergency Bank Loan Alert if Balance is Dangerously Low */}
      {isLowBalance && onRequestEmergencyLoan && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/80 via-amber-950/70 to-slate-900 border border-amber-500/50 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏦</span>
            <div className="text-right">
              <h4 className="text-sm font-bold text-amber-300">
                تسهيل ائتماني طارئ من «بنك مصر للأعمال»
              </h4>
              <p className="text-xs text-amber-200/90 mt-0.5">
                رصيدك الحالي ({formatMoney(profile.bankBalance, profile.countryId)}) قارب على النفاد! اسحب 250,000 ج.م لحماية مصانعك من التوقف.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playSound('loan');
              onRequestEmergencyLoan();
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg transition-transform active:scale-95 shrink-0"
          >
            سحب 250,000 ج.م قرض إنقاذ
          </button>
        </div>
      )}

      {/* Main Guided Quests Panel */}
      <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🏆</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  مسار الانطلاق السريع للإمبراطورية (دليل المبتدئ)
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 font-mono">
                  {completedCount} / {QUEST_STEPS.length} مكتمل
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                اتبع هذه الخطوات الـ 5 الذهبية لتأسيس أول دورة إنتاج وربح حقيقي في القاهرة
              </p>
            </div>
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-xs text-emerald-400 hover:text-emerald-300 p-1.5 rounded-lg bg-slate-800 border border-slate-700"
          >
            {collapsed ? 'عرض المهام ▼' : 'طي ▲'}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
          <div
            className="bg-gradient-to-r from-emerald-500 via-teal-400 to-lime-400 h-full transition-all duration-500"
            style={{ width: `${(completedCount / QUEST_STEPS.length) * 100}%` }}
          />
        </div>

        {!collapsed && (
          <div className="space-y-2.5">
            {QUEST_STEPS.map((quest) => {
              const completed = quest.isCompleted(profile);
              const claimed = claimedQuests.includes(quest.id);
              const isCurrent = currentStep?.id === quest.id && !completed;

              return (
                <div
                  key={quest.id}
                  className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    completed
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : isCurrent
                      ? 'bg-slate-800/90 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                      : 'bg-slate-950/40 border-slate-800 opacity-75'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl p-2 rounded-xl bg-slate-800 border border-slate-700 shrink-0">
                      {quest.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          الخطوة {quest.stepNumber}: {quest.title}
                        </span>
                        {completed && (
                          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            ✓ مكتملة
                          </span>
                        )}
                        {isCurrent && (
                          <span className="text-[10px] text-amber-300 font-bold bg-amber-500/20 px-1.5 py-0.5 rounded animate-pulse">
                            ◀ الخطوة التالية
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 max-w-xl leading-relaxed">
                        {quest.desc}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                        <span className="text-emerald-400 font-mono">
                          مكافأة: +{quest.cashReward.toLocaleString()} ج.م
                        </span>
                        <span>•</span>
                        <span className="text-cyan-300 font-mono">
                          +{quest.diamondReward} ألماسة 💎
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {completed ? (
                      claimed ? (
                        <span className="text-xs font-bold text-slate-400 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
                          تم استلام الجائزة ✓
                        </span>
                      ) : (
                        <button
                          onClick={() => handleClaim(quest)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 animate-bounce"
                        >
                          استلم المكافأة 🎁
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => {
                          playSound('click');
                          onNavigate(quest.targetSection);
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                          isCurrent
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md font-extrabold'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                        }`}
                      >
                        <span>انتقل للخطوة</span>
                        <span>←</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
