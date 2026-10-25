import React, { useState } from 'react';
import type { PlayerProfile } from '../domain/player';
import type { MegaExpansionState } from '../domain/expansionSystems';
import { TRADE_VESSELS_CATALOG, TRADE_ROUTES_CATALOG } from '../game/expansionCatalog';
import { buyVessel, startVoyage, claimVoyageProfit } from '../game/expansionV2Engine';
import { playSound } from '../game/soundEffects';
import './MaritimeTradeRoutes.css';

interface Props {
  profile: PlayerProfile;
  expansion: MegaExpansionState;
  onUpdate: (updatedProf: PlayerProfile, updatedExp: MegaExpansionState) => void;
}

export const MaritimeTradeRoutes: React.FC<Props> = ({ profile, expansion, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'fleet' | 'routes' | 'voyages'>('fleet');
  const [selectedVessel, setSelectedVessel] = useState<string>(TRADE_VESSELS_CATALOG[0]?.id ?? '');
  const [selectedRoute, setSelectedRoute] = useState<string>(TRADE_ROUTES_CATALOG[0]?.id ?? '');

  const ownedVesselIds = expansion.maritime.ownedVesselIds;

  const handleBuyShip = (vesselId: string) => {
    const res = buyVessel(profile, expansion, vesselId);
    if (res) {
      playSound('ship');
      onUpdate(res.profile, res.expansion);
    } else {
      playSound('error');
    }
  };

  const handleLaunchVoyage = () => {
    if (!selectedVessel || !selectedRoute) return;
    const res = startVoyage(profile, expansion, selectedVessel, selectedRoute);
    if (res) {
      playSound('ship');
      onUpdate(res.profile, res.expansion);
    } else {
      playSound('error');
    }
  };

  const handleClaim = (voyageId: string) => {
    const res = claimVoyageProfit(profile, expansion, voyageId);
    if (res) {
      playSound('cash');
      onUpdate(res.profile, res.expansion);
    }
  };

  return (
    <div className="maritime-container" dir="rtl">
      {/* Header */}
      <div className="maritime-header">
        <div className="maritime-header-copy">
          <span className="maritime-kicker">⚓ التجارة البحرية وسلاسل الإمداد الدولية</span>
          <h2>أسطول الشحن والخطوط البحرية العالمية</h2>
          <p>املك ناقلات النفط العملاقة وسفن الحاويات، وسَيّر رحلات تجارية عبر قناة السويس وروتردام!</p>
        </div>
        <div className="maritime-header-badge">🚢</div>
      </div>

      {/* Tabs */}
      <div className="maritime-tabs">
        <button
          className={`maritime-tab-btn ${activeTab === 'fleet' ? 'active' : ''}`}
          onClick={() => setActiveTab('fleet')}
        >
          🚢 أسطولي الملاحي ({ownedVesselIds.length})
        </button>
        <button
          className={`maritime-tab-btn ${activeTab === 'routes' ? 'active' : ''}`}
          onClick={() => setActiveTab('routes')}
        >
          🗺️ الخطوط البحرية والموانئ
        </button>
        <button
          className={`maritime-tab-btn ${activeTab === 'voyages' ? 'active' : ''}`}
          onClick={() => setActiveTab('voyages')}
        >
          📦 الرحلات النشطة ({expansion.maritime.activeVoyages.filter((v) => !v.claimed).length})
        </button>
      </div>

      {/* Fleet Catalog / Owned */}
      {activeTab === 'fleet' && (
        <div className="vessels-grid">
          {TRADE_VESSELS_CATALOG.map((vessel) => {
            const countOwned = ownedVesselIds.filter((id) => id === vessel.id).length;
            const canAfford = profile.bankBalance >= vessel.price;

            return (
              <div key={vessel.id} className="vessel-card">
                <div className="vessel-card-head">
                  <span className="vessel-icon">{vessel.icon}</span>
                  <div>
                    <h3>{vessel.name}</h3>
                    <span className="vessel-type-pill">{vessel.typeLabel}</span>
                  </div>
                </div>

                <div className="vessel-stats">
                  <div className="vstat">
                    <span>السعة الاستيعابية</span>
                    <strong>📦 {vessel.capacityContainers.toLocaleString('ar-EG')} حاوية</strong>
                  </div>
                  <div className="vstat">
                    <span>سرعة الإبحار</span>
                    <strong>⚡ {vessel.speedVoyageHours} ساعات / رحلة</strong>
                  </div>
                  <div className="vstat">
                    <span>أرباح الرحلة الأساسية</span>
                    <strong className="profit-text">💰 {vessel.baseProfitPerVoyage.toLocaleString('ar-EG')} $</strong>
                  </div>
                </div>

                <div className="vessel-card-foot">
                  <div className="vessel-owned-count">
                    <span>تمتلك حالياً:</span>
                    <strong>{countOwned} سفينة</strong>
                  </div>
                  <button
                    className="buy-vessel-btn"
                    disabled={!canAfford}
                    onClick={() => handleBuyShip(vessel.id)}
                  >
                    {canAfford ? `شراء بـ ${vessel.price.toLocaleString('ar-EG')} $` : 'السيولة لا تكفي'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Routes & Voyage Launch */}
      {activeTab === 'routes' && (
        <div className="routes-launch-section">
          <div className="launch-box">
            <h3>🚀 تسيير رحلة شحن بحرية جديدة</h3>
            <p>اختر إحدى سفن أسطولك والخط الملاكي لبدء الشحن وحصد الأرباح.</p>

            <div className="launch-form">
              <div className="form-field">
                <label>اختر السفينة:</label>
                <select value={selectedVessel} onChange={(e) => setSelectedVessel(e.target.value)}>
                  {ownedVesselIds.map((vId, idx) => {
                    const v = TRADE_VESSELS_CATALOG.find((item) => item.id === vId);
                    return (
                      <option key={idx} value={vId}>
                        {v ? `${v.name} (${v.typeLabel})` : vId}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="form-field">
                <label>اختر الوجهة والخط الملاحي:</label>
                <select value={selectedRoute} onChange={(e) => setSelectedRoute(e.target.value)}>
                  {TRADE_ROUTES_CATALOG.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.icon} {r.name} ({r.destination}) - تضاعف {r.profitMultiplier}x
                    </option>
                  ))}
                </select>
              </div>

              <button className="launch-btn" onClick={handleLaunchVoyage}>
                ⚓ إطلاق الرحلة البحرية الان
              </button>
            </div>
          </div>

          <div className="routes-list">
            <h4>🗺️ قائمة الخطوط والتسهيلات البحرية</h4>
            <div className="routes-grid">
              {TRADE_ROUTES_CATALOG.map((r) => (
                <div key={r.id} className="route-card">
                  <div className="route-head">
                    <span className="route-flag">{r.icon}</span>
                    <div>
                      <h5>{r.name}</h5>
                      <span className="route-dest">{r.destination}</span>
                    </div>
                  </div>
                  <div className="route-info">
                    <span>مسافة الملاحة: <strong>{r.distanceKm.toLocaleString('ar-EG')} كم</strong></span>
                    <span>نسبة مخاطرة القراصنة: <strong className="risk-text">{r.riskPercent}%</strong></span>
                    <span>معامل الأرباح: <strong className="mult-text">+{r.profitMultiplier}x</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Voyages */}
      {activeTab === 'voyages' && (
        <div className="voyages-section">
          {expansion.maritime.activeVoyages.length === 0 ? (
            <div className="no-voyages">
              <span>⚓</span>
              <h3>لا توجد رحلات ملاحية جارية الان</h3>
              <p>انتقل إلى تبويب "الخطوط البحرية" وابدأ بتسيير أولى شحناتك الملاحية!</p>
            </div>
          ) : (
            <div className="voyages-list">
              {expansion.maritime.activeVoyages.slice().reverse().map((voyage) => {
                const isClaimed = voyage.claimed;

                return (
                  <div key={voyage.id} className={`voyage-card ${isClaimed ? 'claimed' : 'active'}`}>
                    <div className="voyage-info">
                      <span className="voyage-ship-icon">🚢</span>
                      <div>
                        <h4>{voyage.vesselName}</h4>
                        <span className="voyage-route-name">الوجهة: {voyage.routeName}</span>
                      </div>
                    </div>

                    <div className="voyage-profit">
                      <span>الأرباح المتوقعة</span>
                      <strong>💰 {voyage.expectedProfit.toLocaleString('ar-EG')} $</strong>
                    </div>

                    <div className="voyage-action">
                      {isClaimed ? (
                        <span className="claimed-badge">✅ تم تحصيل الأرباح</span>
                      ) : (
                        <button className="claim-voyage-btn" onClick={() => handleClaim(voyage.id)}>
                          💰 تحصيل عوائد الرحلة
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
