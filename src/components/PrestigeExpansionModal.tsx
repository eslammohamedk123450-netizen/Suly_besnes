import React, { useState, useEffect } from 'react';
import { 
  Globe2, 
  Sparkles, 
  Award, 
  Crown, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Coins, 
  Building, 
  ShieldCheck, 
  X,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import type { PlayerProfile } from '../domain/player';
import { 
  GLOBAL_CAPITALS, 
  SOVEREIGN_PERKS, 
  loadPrestigeData, 
  checkPrestigeEligibility, 
  executePrestigeExpansion, 
  purchaseSovereignPerk,
  type PrestigeData 
} from '../game/prestigeEngine';
import { formatCurrency } from '../domain/formatters';
import { triggerHaptic } from '../services/nativeMobileService';
import { playSound } from '../game/soundEffects';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  onExpansionSuccess: (updatedProfile: PlayerProfile) => void;
}

export const PrestigeExpansionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  profile,
  onExpansionSuccess,
}) => {
  const [prestige, setPrestige] = useState<PrestigeData>(() => loadPrestigeData(profile.id));
  const [selectedCapitalId, setSelectedCapitalId] = useState<string>('riyadh');
  const [activeTab, setActiveTab] = useState<'capitals' | 'perks'>('capitals');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setPrestige(loadPrestigeData(profile.id));
  }, [profile.id, isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const eligibility = checkPrestigeEligibility(profile);
  const selectedCapital = GLOBAL_CAPITALS.find((c) => c.id === selectedCapitalId) || GLOBAL_CAPITALS[1];

  const handleExpand = () => {
    triggerHaptic('heavy');
    const result = executePrestigeExpansion(profile, selectedCapital.id);
    if ('error' in result) {
      triggerHaptic('error');
      playSound('error');
      showToast(`❌ ${result.error}`);
    } else {
      triggerHaptic('success');
      playSound('unlock');
      setPrestige(result.updatedPrestige);
      onExpansionSuccess(result.updatedProfile);
      showToast(result.message);
      onClose();
    }
  };

  const handleBuyPerk = (perkId: string) => {
    const result = purchaseSovereignPerk(profile.id, perkId);
    if ('error' in result) {
      triggerHaptic('error');
      playSound('error');
      showToast(`❌ ${result.error}`);
    } else {
      triggerHaptic('success');
      playSound('cash');
      setPrestige(result.updatedPrestige);
      showToast(result.message);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fade-in"
      dir="rtl"
      onClick={onClose}
    >
      <div 
        className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/50 rounded-3xl max-w-2xl w-full p-5 sm:p-7 text-slate-100 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toast Alert */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-amber-300 border border-amber-500/60 px-4 py-2 rounded-xl text-xs font-bold shadow-2xl animate-bounce">
            {toastMessage}
          </div>
        )}

        {/* Ambient Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/25 font-black text-2xl">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  نظام الهيبة والتوسع في عواصم جديدة (Prestige)
                </h3>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black">
                  رتبة الهيبة: {prestige.prestigeLevel}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                تأسيس صندوق استثماري عابر للقارات وتوريث امتيازات وأوسمة سيادية دائمة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs & Tokens Bar */}
        <div className="flex items-center justify-between my-3 gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('capitals')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'capitals'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🌍 العواصم العالمية
            </button>
            <button
              onClick={() => setActiveTab('perks')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'perks'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🎖️ الامتيازات الدائمة ({prestige.activePerkIds.length})
            </button>
          </div>

          <div className="px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>نقاط الهيبة المتاحة: {prestige.prestigeTokens}</span>
          </div>
        </div>

        {/* Scrollable Tab Body */}
        <div className="overflow-y-auto space-y-4 my-2 pr-1 pl-1 scrollbar-thin">
          {activeTab === 'capitals' ? (
            <>
              {/* Eligibility Box */}
              <div className={`p-4 rounded-2xl border ${
                eligibility.eligible
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                  : 'bg-slate-950/70 border-amber-500/30 text-slate-300'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs font-black">
                    {eligibility.eligible ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                    )}
                    <span>
                      {eligibility.eligible
                        ? 'أنت مؤهل الآن لتأسيس الصندوق السيادي والتوسع الدولي!'
                        : 'شروط التوسع الدولي في عاصمة جديدة:'}
                    </span>
                  </div>
                  {eligibility.eligible && (
                    <span className="text-xs font-extrabold text-amber-400">
                      +{eligibility.earnedTokens} نقاط هيبة سيادية عند الانتقال
                    </span>
                  )}
                </div>

                {!eligibility.eligible && (
                  <p className="text-xs text-amber-300/90 leading-relaxed">
                    {eligibility.reason}
                  </p>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
                  <span>صافي الثروة الحالية: <strong className="text-white">{formatCurrency(eligibility.currentAssets)}</strong></span>
                  <span>الهدف الأدنى: <strong className="text-amber-400">{formatCurrency(eligibility.requiredAssets)}</strong></span>
                </div>
              </div>

              {/* Capitals Cards Grid */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-400 px-1">
                  اختر عاصمة الانطلاق الجديدة:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {GLOBAL_CAPITALS.filter((c) => c.id !== 'cairo_base').map((capital) => {
                    const isSelected = capital.id === selectedCapital.id;
                    const isUnlocked = prestige.unlockedCapitalIds.includes(capital.id) || prestige.prestigeLevel >= capital.requiredPrestigeLevel;

                    return (
                      <div
                        key={capital.id}
                        onClick={() => {
                          if (isUnlocked) {
                            triggerHaptic('light');
                            setSelectedCapitalId(capital.id);
                          }
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          !isUnlocked
                            ? 'bg-slate-950/40 border-slate-800 opacity-60'
                            : isSelected
                            ? 'bg-slate-900 border-amber-500 shadow-xl ring-2 ring-amber-500/20'
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">{capital.flag}</span>
                            <div>
                              <h4 className="text-sm font-black text-white">{capital.name}</h4>
                              <span className="text-[10px] text-slate-400">{capital.country}</span>
                            </div>
                          </div>
                          {!isUnlocked ? (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              هيبة {capital.requiredPrestigeLevel}
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                              متاحة
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-300 leading-relaxed mb-2.5">
                          {capital.description}
                        </p>

                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800/90 text-xs">
                          <span className="font-extrabold text-amber-400 block mb-0.5">
                            {capital.bonusMultiplierTitle}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {capital.bonusMultiplierDesc}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* Sovereign Perks Tree */
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-400 px-1">
                امتيازات سيادية تورّث معك إلى الأبد ولا تُفقد أبداً عند إعادة اللعب:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SOVEREIGN_PERKS.map((perk) => {
                  const isOwned = prestige.activePerkIds.includes(perk.id);
                  const canAfford = prestige.prestigeTokens >= perk.costTokens;

                  return (
                    <div
                      key={perk.id}
                      className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 ${
                        isOwned
                          ? 'bg-amber-950/25 border-amber-500/40 text-amber-200'
                          : 'bg-slate-950/70 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-black text-white flex items-center gap-2">
                            <span className="text-xl">{perk.icon}</span>
                            {perk.title}
                          </span>
                          <span className="text-xs font-extrabold text-amber-400">
                            {perk.costTokens} نقاط هيبة
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {perk.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        {isOwned ? (
                          <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            مفعل ودائم عبر جميع العوالم
                          </span>
                        ) : (
                          <button
                            onClick={() => handleBuyPerk(perk.id)}
                            disabled={!canAfford}
                            className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black text-xs transition"
                          >
                            تفعيل الامتياز ({perk.costTokens} نقاط)
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Expansion CTA */}
        {activeTab === 'capitals' && (
          <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-400">
              الانطلاق إلى: <strong className="text-white">{selectedCapital.flag} {selectedCapital.name}</strong>
            </div>

            <button
              onClick={handleExpand}
              disabled={!eligibility.eligible}
              className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 disabled:opacity-40 disabled:hover:from-amber-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition"
            >
              <Crown className="w-5 h-5" />
              <span>تأسيس الصندوق والانطلاق نحو {selectedCapital.name}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
