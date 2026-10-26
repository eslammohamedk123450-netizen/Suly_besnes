import React, { useState } from 'react';
import type { PlayerProfile } from '../domain/player';
import type { ExpansionState } from '../game/expansionEngine';
import { buyLuxuryAsset } from '../game/expansionEngine';
import { LUXURY_ASSETS_CATALOG } from '../game/expansionCatalog';
import { formatCurrency } from '../domain/formatters';
import './CeoLuxurySuite.css';

interface Props {
  profile: PlayerProfile;
  expansion: ExpansionState;
  onUpdate: (updatedProfile: PlayerProfile, updatedExpansion: ExpansionState) => void;
}

export const CeoLuxurySuite: React.FC<Props> = ({ profile, expansion, onUpdate }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'hypercar' | 'private_jet' | 'yacht' | 'mansion' | 'art_watches'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleBuy = (assetId: string) => {
    const res = buyLuxuryAsset(profile, expansion, assetId);
    if (res.error) {
      showToast(`❌ ${res.error}`);
    } else {
      onUpdate(res.updatedProfile, res.updatedExpansion);
      showToast(`👑 مبروك! امتلكت أصلاً فاخراً زاد من نقاط هيبتك ووقارك الاجتماعي!`);
    }
  };

  const ownedAssets = LUXURY_ASSETS_CATALOG.filter((a) => expansion.ownedLuxuryAssetIds.includes(a.id));
  const totalPrestigePoints = ownedAssets.reduce((sum, a) => sum + a.prestigePoints, 0);

  const getPrestigeRank = (points: number) => {
    if (points >= 5000) return { title: '👑 الحاكم الاقتصادي الأعلى', color: 'text-amber-400' };
    if (points >= 3000) return { title: '💎 أيقونة الرفاهية العالمية', color: 'text-purple-400' };
    if (points >= 1500) return { title: '🏛️ ملياردير مرموق', color: 'text-blue-400' };
    if (points >= 500) return { title: '🌟 رائد أعمال VIP', color: 'text-emerald-400' };
    return { title: '💼 مستثمر طموح', color: 'text-slate-300' };
  };

  const rankInfo = getPrestigeRank(totalPrestigePoints);

  const filteredCatalog = LUXURY_ASSETS_CATALOG.filter((a) => {
    if (selectedCategory === 'all') return true;
    return a.category === selectedCategory;
  });

  return (
    <div className="luxury-suite-container">
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-amber-300 border border-amber-500/50 px-6 py-3 rounded-xl shadow-2xl font-bold text-sm animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="luxury-header-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">👑</span>
              <h2 className="text-2xl font-black text-amber-300">جناح الرفاهية والهيبة للمدير التنفيذي</h2>
            </div>
            <p className="text-sm text-slate-300 mt-1">
              استعرض واقتنِ أحدث السيارات الفائقة، الطائرات الخاصة، اليخوت، والقصور التي تمنحك نفوذاً ورتباً استثمارية رفيعة.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-amber-500/40 rounded-xl p-3 flex items-center gap-4">
            <div>
              <div className="text-xs text-slate-400">مقام ورتبة المدير:</div>
              <div className={`text-lg font-black ${rankInfo.color}`}>{rankInfo.title}</div>
            </div>
            <div className="text-left border-r border-slate-800 pr-3">
              <div className="text-xs text-slate-400">نقاط الهيبة (Prestige)</div>
              <div className="text-lg font-black text-amber-400">+{totalPrestigePoints} نقطة</div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-lg'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            جميع المعروضات ({LUXURY_ASSETS_CATALOG.length})
          </button>
          <button
            onClick={() => setSelectedCategory('hypercar')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              selectedCategory === 'hypercar'
                ? 'bg-amber-500 text-slate-950 shadow-lg'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            🏎️ سيارات فائقة
          </button>
          <button
            onClick={() => setSelectedCategory('private_jet')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              selectedCategory === 'private_jet'
                ? 'bg-amber-500 text-slate-950 shadow-lg'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            ✈️ طائرات خاصة
          </button>
          <button
            onClick={() => setSelectedCategory('yacht')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              selectedCategory === 'yacht'
                ? 'bg-amber-500 text-slate-950 shadow-lg'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            🛥️ يخوت فاخرة
          </button>
          <button
            onClick={() => setSelectedCategory('mansion')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              selectedCategory === 'mansion'
                ? 'bg-amber-500 text-slate-950 shadow-lg'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            🏰 قصور وفيلات
          </button>
          <button
            onClick={() => setSelectedCategory('art_watches')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              selectedCategory === 'art_watches'
                ? 'bg-amber-500 text-slate-950 shadow-lg'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            🎨 تحف وساعات
          </button>
        </div>
      </div>

      {/* Luxury Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCatalog.map((item) => {
          const isOwned = expansion.ownedLuxuryAssetIds.includes(item.id);
          const canAfford = profile.bankBalance >= item.price;

          return (
            <div key={item.id} className={`luxury-card ${isOwned ? 'owned' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{item.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">{item.name}</h3>
                    <span className="text-xs text-amber-400/90">{item.categoryLabel}</span>
                  </div>
                </div>
                {isOwned ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    مقتنى شخصي 👑
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400">
                    معروض للبيع
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>

              {/* VIP Perk & Prestige */}
              <div className="bg-slate-950/80 border border-amber-500/20 rounded-lg p-2.5 flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">نقاط الهيبة المكتسبة:</span>
                  <span className="font-bold text-amber-400">+{item.prestigePoints} نقطة</span>
                </div>
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                  <span>✨</span> {item.vipPerk}
                </div>
              </div>

              {/* Price & Buy Button */}
              <div className="mt-auto pt-2 flex flex-col gap-2 border-t border-slate-800">
                {!isOwned && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">السعر المطلوب:</span>
                    <span className="text-base font-black text-amber-300">{formatCurrency(item.price, 'EGP')}</span>
                  </div>
                )}

                {isOwned ? (
                  <div className="w-full text-center py-2 bg-amber-950/40 text-amber-300 rounded-lg text-xs font-bold border border-amber-500/30">
                    في كراجك ومجموعتك الخاصة 🏆
                  </div>
                ) : (
                  <button
                    onClick={() => handleBuy(item.id)}
                    disabled={!canAfford}
                    className="buy-luxury-btn"
                  >
                    {!canAfford ? 'السيولة الماليّة غير كافية' : 'الشراء والاقتناء الفوري'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
