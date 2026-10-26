import React, { useState } from 'react';
import type { PlayerProfile } from '../domain/player';
import type { MegaExpansionState } from '../domain/expansionSystems';
import { CARTEL_CATALOG } from '../game/expansionCatalog';
import { joinCartel, contributeToCartel } from '../game/expansionV2Engine';
import './CartelSyndicate.css';

interface Props {
  profile: PlayerProfile;
  expansion: MegaExpansionState;
  onUpdate: (updatedProf: PlayerProfile, updatedExp: MegaExpansionState) => void;
}

export const CartelSyndicate: React.FC<Props> = ({ profile, expansion, onUpdate }) => {
  const [donateAmount, setDonateAmount] = useState('250000');
  const [activeTab, setActiveTab] = useState<'catalog' | 'my_cartel'>('catalog');

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
                    <strong>{cartel.joinCost.toLocaleString('ar-EG')} ج.م</strong>
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
                  <strong>💰 {expansion.cartel.contributedFunds.toLocaleString('ar-EG')} ج.م</strong>
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
    </div>
  );
};
