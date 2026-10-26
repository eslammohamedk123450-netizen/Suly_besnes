import { useState } from 'react';
import type { PlayerProfile } from '../domain/player';
import type { CountryDefinition } from '../domain/countries';
import type { SectionId } from '../domain/navigation';
import { formatMoney } from '../domain/formatters';
import { getStarterMissions, isSectionUnlocked } from '../game/onboarding';
import { Icon } from './Icon';
import { playSound } from '../game/soundEffects';
import './RightActionHub.css';

interface RightActionHubProps {
  profile: PlayerProfile;
  country: CountryDefinition;
  onNavigate: (section: SectionId) => void;
  onCollectProfit: () => void;
}

export function RightActionHub({ profile, country, onNavigate, onCollectProfit }: RightActionHubProps) {
  const [open, setOpen] = useState(false);

  // Starter missions and incomplete count
  const missions = getStarterMissions(profile);
  const remainingMissions = missions.filter((m) => !m.completed);
  const remainingCount = remainingMissions.length;

  // Calculate estimated daily net profit
  const dailyIncome = profile.companies.reduce(
    (sum, c) => sum + (c.upgradeLevel ?? 1) * 15000,
    12500,
  );

  const handleCollect = () => {
    playSound('success');
    onCollectProfit();
    setOpen(false);
  };

  const handleNavigate = (section: SectionId) => {
    playSound('click');
    onNavigate(section);
    setOpen(false);
  };

  return (
    <>
      {/* 1. Resting Handle (Right Docked Handle) */}
      {!open && (
        <button
          type="button"
          className="right-hub-handle"
          onClick={() => setOpen(true)}
          aria-label="المركز السريع للعمليات والمهام"
          title="المركز الإمبراطوري السريع"
        >
          <span className="right-hub-handle-icon">⚡</span>
          {remainingCount > 0 && (
            <span className="right-hub-badge" title={`${remainingCount} مهام متبقية`}>
              {remainingCount}
            </span>
          )}
          <div className="right-hub-label-dots">
            <span />
            <span />
            <span />
          </div>
        </button>
      )}

      {/* 2. Expanded Drawer Modal */}
      {open && (
        <div className="right-hub-backdrop" onClick={() => setOpen(false)}>
          <div className="right-hub-drawer" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="right-hub-header">
              <h3>
                <Icon name="crown" size={20} />
                المركز الإمبراطوري السريع
              </h3>
              <button
                type="button"
                className="right-hub-close-btn"
                onClick={() => setOpen(false)}
                aria-label="إغلاق"
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            {/* 1-Tap Collect Profit Banner */}
            <button type="button" className="right-hub-collect-btn" onClick={handleCollect}>
              <div className="right-hub-collect-left">
                <span className="right-hub-collect-icon">⚡</span>
                <div className="right-hub-collect-text">
                  <strong>جمع الأرباح بنقرة واحدة</strong>
                  <small>+ {formatMoney(dailyIncome, country)} أرباح متوقعة اليوم</small>
                </div>
              </div>
              <Icon name="chevron" size={18} />
            </button>

            {/* Starter Missions Section */}
            {missions.length > 0 && (
              <div className="right-hub-section">
                <div className="right-hub-section-title">
                  <Icon name="tasks" size={16} />
                  <span>المهام الأولية المتبقية ({remainingCount})</span>
                </div>

                <div className="right-hub-missions-list">
                  {missions.map((mission) => {
                    const unlocked = isSectionUnlocked(profile, mission.section);
                    return (
                      <div
                        key={mission.id}
                        className={`right-hub-mission-item ${mission.completed ? 'is-completed' : ''}`}
                        onClick={() => {
                          if (unlocked && !mission.completed) handleNavigate(mission.section);
                        }}
                      >
                        <div className="right-hub-mission-info">
                          <strong>{mission.title}</strong>
                          <small>{mission.description}</small>
                        </div>
                        <span className="right-hub-mission-check">
                          {mission.completed ? (
                            '✓'
                          ) : (
                            <Icon name={unlocked ? 'arrow' : 'lock'} size={14} />
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Shortcuts Section */}
            <div className="right-hub-section">
              <div className="right-hub-section-title">
                <Icon name="briefcase" size={16} />
                <span>اختصارات التوسع السريع</span>
              </div>

              <div className="right-hub-shortcuts-grid">
                <div
                  className="right-hub-shortcut-card"
                  onClick={() => handleNavigate('auctions')}
                >
                  <span className="right-hub-shortcut-icon">🔨</span>
                  <span>المزادات المباشرة</span>
                </div>

                <div
                  className="right-hub-shortcut-card"
                  onClick={() => handleNavigate('companies')}
                >
                  <span className="right-hub-shortcut-icon">🏢</span>
                  <span>تأسيس الشركات</span>
                </div>

                <div
                  className="right-hub-shortcut-card"
                  onClick={() => handleNavigate('store')}
                >
                  <span className="right-hub-shortcut-icon">💎</span>
                  <span>متجر العروض</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
