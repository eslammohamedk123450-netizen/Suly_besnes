import React, { useState } from 'react';
import type { PlayerProfile } from '../domain/player';
import type { MegaExpansionState } from '../domain/expansionSystems';
import { MEGAPROJECTS_CATALOG } from '../game/expansionCatalog';
import {
  upgradePoliticalLobby,
  bidOnMegaproject,
  deliverProjectMilestone,
} from '../game/expansionV2Engine';
import './GovernmentMegaprojects.css';

interface Props {
  profile: PlayerProfile;
  expansion: MegaExpansionState;
  onUpdate: (updatedProf: PlayerProfile, updatedExp: MegaExpansionState) => void;
}

export const GovernmentMegaprojects: React.FC<Props> = ({ profile, expansion, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'tenders' | 'my_projects' | 'lobby'>('tenders');

  const polState = expansion.political;

  const handleUpgradeLobby = () => {
    const res = upgradePoliticalLobby(profile, expansion);
    if (res) {
      onUpdate(res.profile, res.expansion);
    }
  };

  const handleBid = (tenderId: string) => {
    const res = bidOnMegaproject(profile, expansion, tenderId);
    if (res) {
      onUpdate(res.profile, res.expansion);
    }
  };

  const handleMilestone = (tenderId: string) => {
    const res = deliverProjectMilestone(profile, expansion, tenderId);
    if (res) {
      onUpdate(res.profile, res.expansion);
    }
  };

  return (
    <div className="megaprojects-container" dir="rtl">
      {/* Header */}
      <div className="megaprojects-header">
        <div className="megaprojects-header-copy">
          <span className="megaprojects-kicker">🏛️ المناقصات القومية والنفوذ السياسي</span>
          <h2>المشاريع العملاقة وعقود الدولة</h2>
          <p>بناء خطوط المونوريل، مجمعات الطاقة الشمسية، ومراكز السوبركومبيوتر بمليارات الدولارات!</p>
        </div>
        <div className="megaprojects-header-badge">🏛️</div>
      </div>

      {/* Lobby Influence Bar */}
      <div className="lobby-bar-card">
        <div className="lobby-bar-info">
          <div>
            <span>مستوى النفوذ السياسي والعلاقات العامة</span>
            <strong>المستوى {polState.influenceLevel} / 10</strong>
          </div>
          <div>
            <span>نقاط الهيبة السياسية</span>
            <strong>⭐ {polState.influencePoints} نقطة</strong>
          </div>
          <div>
            <span>الإعفاء الضريبي</span>
            <strong className={polState.taxExemptionActive ? 'green' : 'gray'}>
              {polState.taxExemptionActive ? '✅ مفعل (0% ضرائب)' : '❌ غير مفعل (يتطلب لفل 5)'}
            </strong>
          </div>
        </div>
        <button
          className="upgrade-lobby-btn"
          disabled={polState.influenceLevel >= 10 || profile.bankBalance < polState.influenceLevel * 500000}
          onClick={handleUpgradeLobby}
        >
          {polState.influenceLevel >= 10
            ? 'المستوى الأقصى'
            : `رفع النفوذ بـ ${(polState.influenceLevel * 500000).toLocaleString('ar-EG')} $`}
        </button>
      </div>

      {/* Tabs */}
      <div className="megaprojects-tabs">
        <button
          className={`mp-tab-btn ${activeTab === 'tenders' ? 'active' : ''}`}
          onClick={() => setActiveTab('tenders')}
        >
          📋 المناقصات الحكومية المتاحة ({MEGAPROJECTS_CATALOG.length})
        </button>
        <button
          className={`mp-tab-btn ${activeTab === 'my_projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('my_projects')}
        >
          🏗️ مناقصاتي وفواتير المستخلصات ({polState.activeTenderIds.length})
        </button>
      </div>

      {/* Tenders List */}
      {activeTab === 'tenders' && (
        <div className="tenders-grid">
          {MEGAPROJECTS_CATALOG.map((tender) => {
            const isWon = polState.activeTenderIds.includes(tender.id);
            const hasInfluence = polState.influenceLevel >= tender.requiredInfluenceLevel;
            const depositCost = Math.round(tender.totalBudget * 0.05);
            const canAfford = profile.bankBalance >= depositCost;

            return (
              <div key={tender.id} className={`tender-card ${isWon ? 'won' : ''}`}>
                <div className="tender-card-head">
                  <span className="tender-icon">{tender.icon}</span>
                  <div>
                    <h3>{tender.title}</h3>
                    <span className="sponsor-pill">🏛️ {tender.sponsorMinistry}</span>
                  </div>
                </div>

                <p className="tender-desc">{tender.description}</p>

                <div className="tender-stats">
                  <div className="tstat">
                    <span>ميزانية المشروع الإجمالية</span>
                    <strong className="budget-text">💰 {tender.totalBudget.toLocaleString('ar-EG')} $</strong>
                  </div>
                  <div className="tstat">
                    <span>عدد مراحل التسليم</span>
                    <strong>🧱 {tender.milestonesCount} مراحل</strong>
                  </div>
                  <div className="tstat">
                    <span>المستخلص لكل مرحلة</span>
                    <strong>💵 {tender.payoutPerMilestone.toLocaleString('ar-EG')} $</strong>
                  </div>
                  <div className="tstat">
                    <span>النفوذ المطلوبة</span>
                    <strong className={hasInfluence ? 'green' : 'red'}>
                      المستوى {tender.requiredInfluenceLevel}
                    </strong>
                  </div>
                </div>

                <div className="tender-card-foot">
                  <div className="deposit-info">
                    <span>تأمين المناقصة (5%):</span>
                    <strong>{depositCost.toLocaleString('ar-EG')} $</strong>
                  </div>

                  {isWon ? (
                    <span className="won-badge">✅ تم الترسية وبدء التشييد</span>
                  ) : (
                    <button
                      className="bid-btn"
                      disabled={!hasInfluence || !canAfford}
                      onClick={() => handleBid(tender.id)}
                    >
                      {!hasInfluence
                        ? 'النفوذ غير كافٍ'
                        : !canAfford
                        ? 'تأمين التأمين لا يكفي'
                        : 'تقديم العرض وفوز بالمناقصة'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* My Projects */}
      {activeTab === 'my_projects' && (
        <div className="my-projects-section">
          {polState.activeTenderIds.length === 0 ? (
            <div className="no-projects">
              <span>🏗️</span>
              <h3>لا تملك أي مناقصات قيد التشييد حالياً</h3>
              <p>انتقل إلى تبويب "المناقصات المتاحة" وقدم عروضك للفوز بالمشاريع القومية.</p>
            </div>
          ) : (
            <div className="projects-list">
              {polState.activeTenderIds.map((tId) => {
                const tender = MEGAPROJECTS_CATALOG.find((item) => item.id === tId);
                if (!tender) return null;

                return (
                  <div key={tender.id} className="active-project-card">
                    <div className="ap-head">
                      <span className="ap-icon">{tender.icon}</span>
                      <div>
                        <h4>{tender.title}</h4>
                        <span className="ap-sponsor">{tender.sponsorMinistry}</span>
                      </div>
                    </div>

                    <div className="ap-body">
                      <span>إجمالي المستخلصات المحصلة من المشروع:</span>
                      <strong>💵 {tender.payoutPerMilestone.toLocaleString('ar-EG')} $ لكل مرحلة</strong>
                    </div>

                    <button
                      className="deliver-milestone-btn"
                      onClick={() => handleMilestone(tender.id)}
                    >
                      🧱 تسليم المرحلة التالية وتحصيل المستخلص القومي
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
