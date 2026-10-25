import React, { useState } from 'react';
import type { PlayerProfile } from '../domain/player';
import type { ExpansionState } from '../game/expansionEngine';
import { claimTerritoryRegion, upgradeTerritoryHub } from '../game/expansionEngine';
import { formatCurrency } from '../domain/formatters';
import './TerritoryConquestMap.css';

interface Props {
  profile: PlayerProfile;
  expansion: ExpansionState;
  onUpdate: (updatedProfile: PlayerProfile, updatedExpansion: ExpansionState) => void;
}

export const TerritoryConquestMap: React.FC<Props> = ({ profile, expansion, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'conquered' | 'available'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleClaim = (regionId: string) => {
    const res = claimTerritoryRegion(profile, expansion, regionId);
    if (res.error) {
      showToast(`❌ ${res.error}`);
    } else {
      onUpdate(res.updatedProfile, res.updatedExpansion);
      showToast(`🎉 تم السيطرة وتوسيع النفوذ في الإقليم بنجاح! (+5 نقاط سمعة)`);
    }
  };

  const handleUpgradeHub = (regionId: string) => {
    const res = upgradeTerritoryHub(profile, expansion, regionId);
    if (res.error) {
      showToast(`❌ ${res.error}`);
    } else {
      onUpdate(res.updatedProfile, res.updatedExpansion);
      showToast(`⚡ تم ترقية المركز اللوجستي وزيادة حصتك في السوق وريع الإقليم!`);
    }
  };

  const totalHourlyYield = expansion.territories
    .filter((r) => r.unlocked && r.playerMarketShare > 0)
    .reduce((sum, r) => sum + r.hourlyTaxYield, 0);

  const conqueredCount = expansion.territories.filter((r) => r.unlocked && r.playerMarketShare > 0).length;
  const avgMarketShare = Math.round(
    expansion.territories.reduce((sum, r) => sum + r.playerMarketShare, 0) / expansion.territories.length
  );

  const filteredRegions = expansion.territories.filter((r) => {
    if (activeTab === 'conquered') return r.unlocked && r.playerMarketShare > 0;
    if (activeTab === 'available') return !r.unlocked || r.playerMarketShare === 0;
    return true;
  });

  return (
    <div className="territory-conquest-container">
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-amber-300 border border-amber-500/50 px-6 py-3 rounded-xl shadow-2xl font-bold text-sm animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Header Banner */}
      <div className="territory-header-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">🗺️</span>
              <h2 className="text-2xl font-black text-amber-300">خريطة السيطرة والنفوذ الإقليمي</h2>
            </div>
            <p className="text-sm text-slate-300 mt-1">
              قم بالتوسع في محافظات مصر والمناطق الاقتصادية العالمية لحصد ريع حقيقي وتفعيل امتيازات إقليمية استثنائية!
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-lg'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              الكل ({expansion.territories.length})
            </button>
            <button
              onClick={() => setActiveTab('conquered')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'conquered'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              الخاضعة لنفوذك ({conqueredCount})
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
          <div className="territory-stat-badge">
            <span className="text-2xl">💰</span>
            <div>
              <div className="text-xs text-slate-400">الريع الإقليمي الساعي</div>
              <div className="text-lg font-black text-emerald-400">
                +{formatCurrency(totalHourlyYield, 'EGP')}/ساعة
              </div>
            </div>
          </div>

          <div className="territory-stat-badge">
            <span className="text-2xl">📊</span>
            <div>
              <div className="text-xs text-slate-400">متوسط السيطرة على الأسواق</div>
              <div className="text-lg font-black text-purple-300">{avgMarketShare}% من السوق</div>
            </div>
          </div>

          <div className="territory-stat-badge">
            <span className="text-2xl">🏛️</span>
            <div>
              <div className="text-xs text-slate-400">الأقاليم المحررة</div>
              <div className="text-lg font-black text-amber-400">
                {conqueredCount} من أصل {expansion.territories.length} إقليم
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Regions Grid */}
      <div className="territory-grid">
        {filteredRegions.map((region) => {
          const isConquered = region.unlocked && region.playerMarketShare > 0;
          const isLevelLocked = profile.level < region.unlockedLevel;

          return (
            <div
              key={region.id}
              className={`region-card ${isConquered ? 'conquered' : ''} ${isLevelLocked ? 'locked' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{region.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">{region.name}</h3>
                    <span className="text-xs text-slate-400 font-sans">{region.nameEn}</span>
                  </div>
                </div>
                {isConquered ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    تحت النفوذ
                  </span>
                ) : isLevelLocked ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400">
                    مغلق (مستوى {region.unlockedLevel})
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    متاح للاستحواذ
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{region.description}</p>

              {/* Market share & progress */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">حصة السوق الحالية:</span>
                  <span className="font-bold text-amber-400">{region.playerMarketShare}%</span>
                </div>
                <div className="share-bar-outer">
                  <div className="share-bar-inner" style={{ width: `${region.playerMarketShare}%` }} />
                </div>
              </div>

              {/* Region bonus badge */}
              <div className="bg-slate-900/80 border border-purple-500/30 rounded-lg p-2.5 flex items-center gap-2">
                <span className="text-xl">✨</span>
                <div>
                  <div className="text-xs font-bold text-purple-300">{region.regionBonusTitle}</div>
                  <div className="text-[11px] text-slate-300">{region.regionBonusDescription}</div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="mt-auto pt-2 flex items-center justify-between border-t border-slate-800">
                {isConquered ? (
                  <div className="w-full flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-slate-400">مراكز لوجستية: {region.hubsCount}</div>
                      <div className="text-xs font-bold text-emerald-400">
                        +{formatCurrency(region.hourlyTaxYield, 'EGP')}/ساعة
                      </div>
                    </div>
                    <button
                      onClick={() => handleUpgradeHub(region.id)}
                      disabled={profile.bankBalance < region.hubUpgradeCost}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold disabled:opacity-50 transition-all"
                    >
                      ترقية ({formatCurrency(region.hubUpgradeCost, 'EGP')})
                    </button>
                  </div>
                ) : (
                  <div className="w-full flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-slate-400">تكلفة السيطرة</div>
                      <div className="text-sm font-black text-amber-300">
                        {formatCurrency(region.conquestCost, 'EGP')}
                      </div>
                    </div>
                    <button
                      onClick={() => handleClaim(region.id)}
                      disabled={isLevelLocked || profile.bankBalance < region.conquestCost}
                      className="conquest-btn"
                    >
                      بسط السيطرة
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
