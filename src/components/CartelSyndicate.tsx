import React, { useState } from 'react';
import type { PlayerProfile } from '../domain/player';
import type { MegaExpansionState } from '../domain/expansionSystems';
import { CARTEL_CATALOG } from '../game/expansionCatalog';
import { joinCartel, contributeToCartel } from '../game/expansionV2Engine';
import {
  CARTEL_STRONGHOLD_LEVELS,
  getCartelStrongholdLevel,
  saveCartelStrongholdLevel,
} from './cartelStrongholdData';
import { formatMoney } from '../domain/formatters';
import { Sparkles, Shield, Trophy } from 'lucide-react';
import './CartelSyndicate.css';


interface Props {
  profile: PlayerProfile;
  expansion: MegaExpansionState;
  onUpdate: (updatedProf: PlayerProfile, updatedExp: MegaExpansionState) => void;
}

export const CartelSyndicate: React.FC<Props> = ({ profile, expansion, onUpdate }) => {
  const [donateAmount, setDonateAmount] = useState('250000');
  const [activeTab, setActiveTab] = useState<'catalog' | 'my_cartel' | 'stronghold_3d'>('stronghold_3d');
  const [previewLevel, setPreviewLevel] = useState<number>(() =>
    getCartelStrongholdLevel(profile, expansion)
  );
  const currentStrongholdLevel = getCartelStrongholdLevel(profile, expansion);

  const currentCartelId = expansion.cartel.joinedCartelId;
  const myCartel = CARTEL_CATALOG.find((c) => c.id === currentCartelId);

  const handleJoin = (cartelId: string) => {
    const res = joinCartel(profile, expansion, cartelId);
    if (res) {
      onUpdate(res.profile, res.expansion);
    }
  };

  const handleContribute = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(donateAmount, 10);
    if (isNaN(val) || val <= 0) return;

    const res = contributeToCartel(profile, expansion, val);
    if (res) {
      onUpdate(res.profile, res.expansion);
    }
  };

  const handleUpgradeStronghold = (targetLevel: number) => {
    const targetInfo = CARTEL_STRONGHOLD_LEVELS.find((l) => l.level === targetLevel);
    if (!targetInfo) return;
    if (profile.bankBalance < targetInfo.upgradeCost) return;

    const updatedProfile: PlayerProfile = {
      ...profile,
      bankBalance: profile.bankBalance - targetInfo.upgradeCost,
      cartelStrongholdLevel: targetLevel,
    };
    const updatedExpansion: MegaExpansionState = {
      ...expansion,
      cartel: {
        ...expansion.cartel,
        strongholdLevel: targetLevel,
      },
    };
    saveCartelStrongholdLevel(profile.id, targetLevel);
    onUpdate(updatedProfile, updatedExpansion);
    setPreviewLevel(targetLevel);
  };

  return (
    <div className="cartel-container" dir="rtl">
      {/* Header Banner */}
      <div className="cartel-header">
        <div className="cartel-header-copy">
          <span className="cartel-kicker">💼 عمالقة الأسواق والتكتلات</span>
          <h2>الكارتيل التجاري والتحالفات الاقتصادية</h2>
          <p>شكل أو انضم لتكتلات صناعية عالمية، انزع أسعار المواد الخام من الأسواق، وهيمن على المنافسين!</p>
        </div>
        <div className="cartel-header-badge">🤝</div>
      </div>

      {/* Tabs */}
      <div className="cartel-tabs">
        <button
          className={`cartel-tab-btn ${activeTab === 'stronghold_3d' ? 'active' : ''}`}
          onClick={() => setActiveTab('stronghold_3d')}
        >
          🏰 معقل الكارتيل (مستوى {currentStrongholdLevel})
        </button>
        <button
          className={`cartel-tab-btn ${activeTab === 'catalog' ? 'active' : ''}`}
          onClick={() => setActiveTab('catalog')}
        >
          🌐 دليل التكتلات المتاحة ({CARTEL_CATALOG.length})
        </button>
        <button
          className={`cartel-tab-btn ${activeTab === 'my_cartel' ? 'active' : ''}`}
          onClick={() => setActiveTab('my_cartel')}
        >
          👑 تكتلي الحالي {myCartel ? `(${myCartel.name})` : '(غير منضم)'}
        </button>
      </div>

      {/* Tab: Catalog */}
      {activeTab === 'catalog' && (
        <div className="cartel-grid">
          {CARTEL_CATALOG.map((cartel) => {
            const isJoined = currentCartelId === cartel.id;
            const canAfford = profile.bankBalance >= cartel.joinCost;

            return (
              <div key={cartel.id} className={`cartel-card ${isJoined ? 'joined' : ''}`}>
                <div className="cartel-card-top">
                  <span className="cartel-badge-icon">{cartel.badge}</span>
                  <div className="cartel-title-area">
                    <h3>{cartel.name}</h3>
                    <span className="cartel-category-pill">{cartel.categoryLabel}</span>
                  </div>
                </div>

                <p className="cartel-desc">{cartel.description}</p>

                <div className="cartel-stats-row">
                  <div className="cartel-stat">
                    <span>القوة الاقتصادية</span>
                    <strong>⚡ {cartel.totalPower.toLocaleString('ar-EG')} MW</strong>
                  </div>
                  <div className="cartel-stat">
                    <span>عدد الأعضاء</span>
                    <strong>👥 {cartel.memberCount} شركة</strong>
                  </div>
                </div>

                <div className="cartel-perk-box">
                  <strong>✨ الامتياز التجاري: {cartel.perkTitle}</strong>
                  <p>{cartel.perkDescription}</p>
                </div>

                <div className="cartel-card-footer">
                  <div className="cartel-cost">
                    <span>رسوم الانضمام:</span>
                    <strong>{cartel.joinCost.toLocaleString('ar-EG')} $</strong>
                  </div>

                  {isJoined ? (
                    <span className="cartel-status-joined">✅ أنت عضو في هذا الكارتيل</span>
                  ) : (
                    <button
                      className="cartel-join-btn"
                      disabled={!canAfford || !!currentCartelId}
                      onClick={() => handleJoin(cartel.id)}
                    >
                      {currentCartelId
                        ? 'أنت في تكتل آخر'
                        : canAfford
                        ? 'انضم للتكتل الان'
                        : 'السيولة لا تكفي'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: My Cartel */}
      {activeTab === 'my_cartel' && (
        <div className="my-cartel-section">
          {myCartel ? (
            <div className="my-cartel-panel">
              <div className="my-cartel-hero">
                <span className="my-cartel-big-icon">{myCartel.badge}</span>
                <div>
                  <h3>{myCartel.name}</h3>
                  <p>{myCartel.description}</p>
                </div>
              </div>

              <div className="my-cartel-stats">
                <div className="mstat">
                  <span>رتبتك في التكتل</span>
                  <strong className="rank-highlight">
                    {expansion.cartel.userRank === 'leader'
                      ? '👑 رئيس التحالف'
                      : expansion.cartel.userRank === 'senior'
                      ? '⭐ عضو قيادي'
                      : '🛡️ عضو متضامن'}
                  </strong>
                </div>
                <div className="mstat">
                  <span>إجمالي مساهماتك المالية</span>
                  <strong>💰 {expansion.cartel.contributedFunds.toLocaleString('ar-EG')} $</strong>
                </div>
                <div className="mstat">
                  <span>الاتفاقية النشطة</span>
                  <strong>📜 {expansion.cartel.activeAgreement ?? 'تثبيت الأسعار'}</strong>
                </div>
              </div>

              {/* Fund Contribution Form */}
              <div className="cartel-donate-box">
                <h4>💰 ضخ سيولة في صندوق التكتل (رفع الرتبة والقوة)</h4>
                <form onSubmit={handleContribute} className="cartel-donate-form">
                  <input
                    type="number"
                    min="100000"
                    step="50000"
                    value={donateAmount}
                    onChange={(e) => setDonateAmount(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="cartel-donate-btn"
                    disabled={profile.bankBalance < parseInt(donateAmount, 10)}
                  >
                    ضخ السيولة الآن
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="cartel-empty-state">
              <span>🤝</span>
              <h3>لم تنضم إلى أي تكتل تجاري بعد!</h3>
              <p>تصفح دليل التكتلات المتاحة وانضم لتكتل يقوي موقفك المالي وينسق الأسعار في البورصة.</p>
              <button onClick={() => setActiveTab('catalog')} className="cartel-tab-btn active">
                تصفح الكارتيلات
              </button>
            </div>
          )}
        </div>
      )}
      {/* Tab: Stronghold Progression */}
      {activeTab === 'stronghold_3d' && (
        <div className="space-y-4 my-2">

          {/* Stronghold Status & Controls Card */}
          {(() => {
            const previewInfo =
              CARTEL_STRONGHOLD_LEVELS.find((l) => l.level === previewLevel) ??
              CARTEL_STRONGHOLD_LEVELS[0];
            const isCurrentActive = previewInfo.level === currentStrongholdLevel;
            const canUpgrade = previewInfo.level === currentStrongholdLevel + 1;
            const canAfford = profile.bankBalance >= previewInfo.upgradeCost;

            return (
              <div className="rounded-2xl border border-amber-500/30 bg-slate-900/90 p-5 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5" />
                        <span>معقل الكارتيل والتحالف</span>
                      </span>
                      <h3 className="text-base font-black text-white">
                        {previewInfo.nameAr} - المستوى {previewInfo.level}
                      </h3>
                      {isCurrentActive && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                          المستوى المعتمد الحالي 👑
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-amber-300/90 mt-1">{previewInfo.subTitleAr}</p>
                  </div>

                  {canUpgrade ? (
                    <button
                      onClick={() => handleUpgradeStronghold(previewInfo.level)}
                      disabled={!canAfford}
                      className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all ${
                        canAfford
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:brightness-110 active:scale-95'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>ترقية المعقل لمستوى {previewInfo.level} ({formatMoney(previewInfo.upgradeCost)})</span>
                    </button>
                  ) : previewInfo.level > currentStrongholdLevel ? (
                    <span className="text-xs px-3 py-1.5 rounded-lg bg-slate-800/80 text-slate-400 border border-slate-700">
                      🔒 يتطلب ترقية المستوى {currentStrongholdLevel + 1} أولاً
                    </span>
                  ) : null}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {previewInfo.descriptionAr}
                </p>

                {/* Features & Dome Count */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-950/60 text-amber-200 border border-amber-500/30 font-bold">
                    🕌 {previewInfo.totalDomes} قباب ذهبية بهلال إسلامي
                  </span>
                  {previewInfo.hasWaterfall && (
                    <span className="px-2.5 py-1 rounded-lg bg-cyan-950/60 text-cyan-200 border border-cyan-400/40 font-bold">
                      🌊 شلال مائي هادر على الجرف الصخري
                    </span>
                  )}
                  {previewInfo.hasHelipad && (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 text-emerald-200 border border-emerald-400/40 font-bold">
                      🚁 مهبط مروحيات تنفيذي على السطح
                    </span>
                  )}
                  {previewInfo.hasYachtHarbor && (
                    <span className="px-2.5 py-1 rounded-lg bg-sky-950/60 text-sky-200 border border-sky-400/40 font-bold">
                      🛥️ مرسى ويخوت سياحية خاصة
                    </span>
                  )}
                </div>

                {/* Level Perks */}
                <div className="pt-3 border-t border-slate-800">
                  <span className="text-xs font-black text-amber-200 block mb-2">
                    الامتيازات والعوائد الاقتصادية للمستوى {previewInfo.level}:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                    {previewInfo.perksAr.map((perk, i) => (
                      <div key={i} className="flex items-center gap-2 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                        <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Matching Photo Comparison */}
                <div className="pt-3 border-t border-slate-800">
                  <span className="text-xs font-black text-slate-300 block mb-2">
                    الصورة المعمارية المطابقة للمستوى {previewInfo.level}:
                  </span>
                  <div className="relative rounded-xl overflow-hidden border border-amber-500/30 max-w-md mx-auto aspect-video">
                    <img
                      src={previewInfo.imageSrc}
                      alt={previewInfo.nameAr}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-slate-950/85 px-3 py-1.5 flex items-center justify-between text-xs font-bold text-white border-t border-slate-800">
                      <span>{previewInfo.nameAr}</span>
                      <span className="text-amber-400 font-mono">LEVEL {previewInfo.level}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
