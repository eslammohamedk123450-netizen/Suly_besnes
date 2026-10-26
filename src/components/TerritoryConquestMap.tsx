import React, { useState, useEffect } from 'react';
import type { PlayerProfile } from '../domain/player';
import type { ExpansionState } from '../game/expansionEngine';
import { 
  loadSyndicateWarState, 
  executeSyndicateTactic, 
  unlockTerritory, 
  SYNDICATE_TACTICS,
  type SyndicateTactic,
  type SyndicateWarState,
  type SyndicateTerritory 
} from '../game/syndicateWarEngine';
import { formatCurrency } from '../domain/formatters';
import { triggerHaptic } from '../services/nativeMobileService';
import { playSound } from '../game/soundEffects';
import { 
  Swords, 
  ShieldCheck, 
  Building2, 
  TrendingUp, 
  AlertTriangle, 
  Award, 
  ChevronDown, 
  Sparkles,
  DollarSign
} from 'lucide-react';
import './TerritoryConquestMap.css';

interface Props {
  profile: PlayerProfile;
  expansion: ExpansionState;
  onUpdate: (updatedProfile: PlayerProfile, updatedExpansion: ExpansionState) => void;
}

export const TerritoryConquestMap: React.FC<Props> = ({ profile, expansion, onUpdate }) => {
  const [syndicateState, setSyndicateState] = useState<SyndicateWarState>(() =>
    loadSyndicateWarState(profile.id)
  );
  const [activeTab, setActiveTab] = useState<'all' | 'monopolized' | 'contested'>('all');
  const [selectedTerritoryId, setSelectedTerritoryId] = useState<string>('cairo_capital');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setSyndicateState(loadSyndicateWarState(profile.id));
  }, [profile.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const selectedTerritory = syndicateState.territories.find((t) => t.id === selectedTerritoryId) || syndicateState.territories[0];

  const handleExecuteTactic = (tacticId: SyndicateTactic) => {
    triggerHaptic('medium');
    const result = executeSyndicateTactic(profile, syndicateState, selectedTerritory.id, tacticId);
    if ('error' in result) {
      triggerHaptic('error');
      playSound('error');
      showToast(`❌ ${result.error}`);
    } else {
      triggerHaptic(result.isMonopolyNow ? 'heavy' : 'success');
      playSound(result.isMonopolyNow ? 'unlock' : 'cash');
      setSyndicateState(result.updatedState);
      onUpdate(result.updatedProfile, expansion);
      showToast(result.message);
    }
  };

  const handleUnlock = (territoryId: string) => {
    const result = unlockTerritory(profile, syndicateState, territoryId);
    if ('error' in result) {
      triggerHaptic('error');
      playSound('error');
      showToast(`❌ ${result.error}`);
    } else {
      triggerHaptic('success');
      playSound('unlock');
      setSyndicateState(result.updatedState);
      showToast(`🎉 ${result.message}`);
    }
  };

  const monopolizedCount = syndicateState.territories.filter((t) => t.playerShare >= 60).length;
  const totalTariffYield = syndicateState.territories
    .filter((t) => t.playerShare >= 60)
    .reduce((sum, t) => sum + t.dailyTariffYield, 0);

  const filteredTerritories = syndicateState.territories.filter((t) => {
    if (activeTab === 'monopolized') return t.playerShare >= 60;
    if (activeTab === 'contested') return t.unlocked && t.playerShare < 60;
    return true;
  });

  return (
    <div className="territory-conquest-container space-y-6" dir="rtl">
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-amber-300 border border-amber-500/60 px-6 py-3 rounded-2xl shadow-2xl font-bold text-xs sm:text-sm animate-bounce flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 p-5 sm:p-7 shadow-2xl overflow-hidden">
        <div className="absolute -top-16 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-xl">
                ⚔️
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                حروب الكارتيل والسيطرة على الأقاليم
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              خض حروب أسعار شرسة واشترِ مراكز التوزيع المحلية لهزيمة الكارتيلات المنافسة وبلوغ <strong>60% استحواذ</strong> لفرض رسوم جمركية واحتكار توريد الخامات!
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              جميع الأقاليم ({syndicateState.territories.length})
            </button>
            <button
              onClick={() => setActiveTab('monopolized')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'monopolized'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 font-black'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              👑 المحتكرة ({monopolizedCount})
            </button>
            <button
              onClick={() => setActiveTab('contested')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'contested'
                  ? 'bg-rose-600 text-white shadow-lg'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              ⚔️ قيد الصراع
            </button>
          </div>
        </div>

        {/* Global Syndicate Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-800/80">
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-emerald-500/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-lg">
              💰
            </div>
            <div>
              <div className="text-[11px] text-slate-400">الريع والرسوم الجمركية اليومية</div>
              <div className="text-base font-black text-emerald-400">
                +{formatCurrency(totalTariffYield)}/يومياً
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-indigo-500/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-bold text-lg">
              👑
            </div>
            <div>
              <div className="text-[11px] text-slate-400">أقاليم خاضعة للاحتكار التام (60%+)</div>
              <div className="text-base font-black text-amber-400">
                {monopolizedCount} من {syndicateState.territories.length} أقاليم
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-amber-500/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold text-lg">
              🎖️
            </div>
            <div>
              <div className="text-[11px] text-slate-400">انتصارات حروب الأسعار المسجلة</div>
              <div className="text-base font-black text-white">
                {syndicateState.totalVictories} انتصار تجاري
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive War Room */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Territories Selector List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold text-slate-400 px-1">
            اختر الإقليم للسيطرة أو إدارة الصراع:
          </div>

          {filteredTerritories.map((t) => {
            const isSelected = t.id === selectedTerritory.id;
            const isMonopoly = t.playerShare >= 60;
            const isLocked = !t.unlocked;

            return (
              <div
                key={t.id}
                onClick={() => {
                  if (!isLocked) {
                    triggerHaptic('light');
                    setSelectedTerritoryId(t.id);
                  }
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isLocked
                    ? 'bg-slate-950/40 border-slate-800 opacity-60'
                    : isSelected
                    ? 'bg-slate-900 border-indigo-500 shadow-xl ring-2 ring-indigo-500/20'
                    : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{t.icon}</span>
                    <div>
                      <h4 className="text-sm font-black text-white">{t.name}</h4>
                      <span className="text-[10px] text-slate-400">{t.nameEn}</span>
                    </div>
                  </div>
                  {isLocked ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnlock(t.id);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition"
                    >
                      فتح (مستوى {t.requiredLevel})
                    </button>
                  ) : isMonopoly ? (
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black flex items-center gap-1">
                      👑 محتكر بالكامل
                    </span>
                  ) : (
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                      ⚔️ صراع نشط ({t.playerShare}%)
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                {!isLocked && (
                  <div className="space-y-1 mt-2">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">حصتك: <strong className="text-emerald-400">{t.playerShare}%</strong></span>
                      <span className="text-slate-400">المنافس ({t.rival.name}): <strong className="text-rose-400">{t.rival.marketShare}%</strong></span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                      <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${t.playerShare}%` }} />
                      <div className="bg-slate-700 h-full" style={{ width: `${Math.max(0, 100 - t.playerShare - t.rival.marketShare)}%` }} />
                      <div className="bg-rose-500 h-full transition-all duration-500" style={{ width: `${t.rival.marketShare}%` }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Territory Tactical Command Center */}
        <div className="lg:col-span-7">
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
            {/* Header of Active Territory */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-3xl">
                  {selectedTerritory.icon}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{selectedTerritory.name}</h3>
                  <p className="text-xs text-slate-400 max-w-md mt-0.5">
                    {selectedTerritory.description}
                  </p>
                </div>
              </div>
              <div className="text-left">
                <span className="text-[11px] text-slate-400 block">حصتك الحالية</span>
                <span className="text-2xl font-black text-emerald-400">{selectedTerritory.playerShare}%</span>
              </div>
            </div>

            {/* Rival Dossier */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedTerritory.rival.avatar}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black text-rose-300">{selectedTerritory.rival.name}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                      {selectedTerritory.rival.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 italic mt-1">
                    "{selectedTerritory.rival.quote}"
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right sm:text-left">
                <span className="text-[10px] text-slate-400 block">حصة الكارتيل</span>
                <span className="text-base font-black text-rose-400">{selectedTerritory.rival.marketShare}%</span>
              </div>
            </div>

            {/* Monopoly Perks Status */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between ${
              selectedTerritory.playerShare >= 60
                ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">
                  {selectedTerritory.playerShare >= 60 ? '👑' : '🔒'}
                </span>
                <div>
                  <div className="text-xs font-black text-white">
                    {selectedTerritory.monopolyPerkTitle}
                  </div>
                  <div className="text-[11px] mt-0.5">
                    {selectedTerritory.monopolyPerkDescription}
                  </div>
                </div>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-xl ${
                selectedTerritory.playerShare >= 60
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {selectedTerritory.playerShare >= 60 ? 'مفعل وجاهز' : 'يتطلب 60% استحواذ'}
              </span>
            </div>

            {/* Tactical Strike Operations */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-400 flex items-center gap-1.5">
                  <Swords className="w-4 h-4" />
                  العمليات التكتيكية المتاحة لانتزاع السوق
                </span>
                <span className="text-[11px] text-slate-400">
                  رصيدك: <strong className="text-white">{formatCurrency(profile.bankBalance)}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(Object.keys(SYNDICATE_TACTICS) as SyndicateTactic[]).map((key) => {
                  const tactic = SYNDICATE_TACTICS[key];
                  const canAfford = profile.bankBalance >= tactic.cost;

                  return (
                    <div
                      key={key}
                      className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-2 hover:border-indigo-500/40 transition"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-black text-white flex items-center gap-1.5">
                            <span>{tactic.icon}</span>
                            {tactic.name}
                          </span>
                          <span className="text-[10px] font-extrabold text-emerald-400">
                            +{tactic.gainShare}% حصة
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2">
                          {tactic.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                        <span className="text-xs font-bold text-amber-400">
                          {formatCurrency(tactic.cost)}
                        </span>
                        <button
                          onClick={() => handleExecuteTactic(key)}
                          disabled={!canAfford}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-bold text-xs transition active:scale-95 shadow-md"
                        >
                          تنفيذ الهجوم
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
