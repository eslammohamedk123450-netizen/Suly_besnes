import React, { useState } from 'react';
import type { PlayerProfile } from '../domain/player';
import type { MegaExpansionState } from '../domain/expansionSystems';
import { STARTUP_DEALS_CATALOG } from '../game/expansionCatalog';
import { investInStartup, exitStartupBuyout } from '../game/expansionV2Engine';
import './StartupIncubatorVC.css';

interface Props {
  profile: PlayerProfile;
  expansion: MegaExpansionState;
  onUpdate: (updatedProf: PlayerProfile, updatedExp: MegaExpansionState) => void;
}

export const StartupIncubatorVC: React.FC<Props> = ({ profile, expansion, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'dealflow' | 'portfolio'>('dealflow');

  const vcState = expansion.vc;

  const handleInvest = (startupId: string) => {
    const res = investInStartup(profile, expansion, startupId);
    if (res) {
      onUpdate(res.profile, res.expansion);
    }
  };

  const handleExit = (startupId: string) => {
    const res = exitStartupBuyout(profile, expansion, startupId);
    if (res) {
      onUpdate(res.profile, res.expansion);
    }
  };

  return (
    <div className="vc-container" dir="rtl">
      {/* Header */}
      <div className="vc-header">
        <div className="vc-header-copy">
          <span className="vc-kicker">🦄 الاستثمار الجريء وحاضنات التكنولوجيا</span>
          <h2>صندوق الاستثمار الجريء والشركات الناشئة (Venture Capital)</h2>
          <p>استثمر في مراحل Seed و Series A لشركات الذكاء الاصطناعي والحوسبة الكمية، وحقق خروجاً بـ 15 أضعاف رأس المال!</p>
        </div>
        <div className="vc-header-badge">🦄</div>
      </div>

      {/* Stats Header */}
      <div className="vc-stats-bar">
        <div className="vc-stat-box">
          <span>إجمالي أرباح الخروج والتصفية</span>
          <strong className="green-text">💰 {vcState.totalExitsProfit.toLocaleString('ar-EG')} ج.م</strong>
        </div>
        <div className="vc-stat-box">
          <span>عدد استثمارات المحفظة</span>
          <strong>🚀 {vcState.investedStartupIds.length} شركات ناشئة</strong>
        </div>
        <div className="vc-stat-box">
          <span>مستوى حاضنة الأعمال (Incubator)</span>
          <strong>⚡ المستوى {vcState.incubatorLevel}</strong>
        </div>
      </div>

      {/* Tabs */}
      <div className="vc-tabs">
        <button
          className={`vc-tab-btn ${activeTab === 'dealflow' ? 'active' : ''}`}
          onClick={() => setActiveTab('dealflow')}
        >
          💡 الفرص الاستثمارية (Deal Flow) ({STARTUP_DEALS_CATALOG.length})
        </button>
        <button
          className={`vc-tab-btn ${activeTab === 'portfolio' ? 'active' : ''}`}
          onClick={() => setActiveTab('portfolio')}
        >
          📂 محفظتي الاستثمارية ({vcState.investedStartupIds.length})
        </button>
      </div>

      {/* Deal Flow Grid */}
      {activeTab === 'dealflow' && (
        <div className="startups-grid">
          {STARTUP_DEALS_CATALOG.map((startup) => {
            const isInvested = vcState.investedStartupIds.includes(startup.id);
            const canAfford = profile.bankBalance >= startup.investmentCost;

            return (
              <div key={startup.id} className={`startup-card ${isInvested ? 'invested' : ''}`}>
                <div className="startup-card-head">
                  <span className="startup-icon">{startup.icon}</span>
                  <div>
                    <h3>{startup.name}</h3>
                    <span className="stage-pill">
                      {startup.stage === 'seed'
                        ? '🌱 مرحلة البذرة (Seed)'
                        : startup.stage === 'series_a'
                        ? '🚀 Series A'
                        : startup.stage === 'series_b'
                        ? '⚡ Series B'
                        : '🦄 شركة ملياريه (Unicorn)'}
                    </span>
                  </div>
                </div>

                <p className="startup-tagline">{startup.tagline}</p>

                <div className="startup-stats">
                  <div className="sstat">
                    <span>التقييم الحالي للشركة</span>
                    <strong>💎 {startup.currentValuation.toLocaleString('ar-EG')} ج.م</strong>
                  </div>
                  <div className="sstat">
                    <span>حجم التمويل المطلوب</span>
                    <strong>💰 {startup.investmentCost.toLocaleString('ar-EG')} ج.م</strong>
                  </div>
                  <div className="sstat">
                    <span>الحصة المقابلة للملكية</span>
                    <strong>📊 {startup.equityPercent}% من الأسهم</strong>
                  </div>
                  <div className="sstat">
                    <span>عائد الخروج المتوقع (Exit)</span>
                    <strong className="exit-text">🔥 {startup.exitMultiple}x تضاعف رأس المال</strong>
                  </div>
                </div>

                <div className="startup-card-foot">
                  {isInvested ? (
                    <span className="invested-badge">✅ تم الاستثمار في المحفظة</span>
                  ) : (
                    <button
                      className="invest-btn"
                      disabled={!canAfford}
                      onClick={() => handleInvest(startup.id)}
                    >
                      {canAfford ? 'ضخ التمويل والاستثمار الان' : 'السيولة لا تكفي'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Portfolio Grid */}
      {activeTab === 'portfolio' && (
        <div className="portfolio-section">
          {vcState.investedStartupIds.length === 0 ? (
            <div className="no-portfolio">
              <span>🦄</span>
              <h3>محفظتك الاستثمارية فارغة حالياً</h3>
              <p>تصفح صفقات الـ Deal Flow وضخ تمويلاتك في شركات التكنولوجيا الناشئة للحصول على تضاعف خرافي.</p>
            </div>
          ) : (
            <div className="portfolio-grid">
              {vcState.investedStartupIds.map((sId) => {
                const startup = STARTUP_DEALS_CATALOG.find((item) => item.id === sId);
                if (!startup) return null;

                const exitPayout = Math.round(startup.investmentCost * startup.exitMultiple);

                return (
                  <div key={startup.id} className="portfolio-card">
                    <div className="port-head">
                      <span className="port-icon">{startup.icon}</span>
                      <div>
                        <h4>{startup.name}</h4>
                        <span className="port-equity">تستحوذ على {startup.equityPercent}% من الملكية</span>
                      </div>
                    </div>

                    <div className="port-body">
                      <div>
                        <span>الاستثمار الأولي:</span>
                        <strong>{startup.investmentCost.toLocaleString('ar-EG')} ج.م</strong>
                      </div>
                      <div>
                        <span>قيمة الخروج والاستحواذ:</span>
                        <strong className="green-text">+{exitPayout.toLocaleString('ar-EG')} ج.م ({startup.exitMultiple}x)</strong>
                      </div>
                    </div>

                    <button className="exit-btn" onClick={() => handleExit(startup.id)}>
                      🔥 إتمام عملية الخروج والتصفية (Exit & Cashout)
                    </button>
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
