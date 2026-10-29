import { useState } from 'react';
import type { PlayerProfile } from '../domain/player';
import type { CountryDefinition } from '../domain/countries';
import type { SectionId } from '../domain/navigation';
import { formatMoney } from '../domain/formatters';
import { Icon } from './Icon';
import { playSound } from '../game/soundEffects';
import { playCash, playClick } from '../utils/soundManager';

interface QuickActionFABProps {
  profile: PlayerProfile;
  country: CountryDefinition;
  onNavigate: (section: SectionId) => void;
  onCollectProfit: () => void;
}

export function QuickActionFAB({ profile, country, onNavigate, onCollectProfit }: QuickActionFABProps) {
  const [expanded, setExpanded] = useState(false);

  // Calculate estimated daily net profit across all companies
  const dailyIncome = profile.companies.reduce((sum, c) => sum + ((c.upgradeLevel ?? 1) * 15000), 12500);

  const handleCollect = () => {
    playCash();
    playSound('success');
    onCollectProfit();
    setExpanded(false);
  };

  return (
    <div className={`quick-fab-container ${expanded ? 'is-expanded' : ''}`}>
      {/* Expanded Quick Options */}
      {expanded && (
        <div className="quick-fab-menu" role="menu" aria-label="اختصارات السريعة">
          <button
            type="button"
            className="quick-fab-item quick-fab-item--collect"
            onClick={handleCollect}
          >
            <span className="quick-fab-icon">⚡</span>
            <div className="quick-fab-text">
              <strong>جمع الأرباح بنقرة واحدة</strong>
              <small>+ {formatMoney(dailyIncome, country)} اليوم</small>
            </div>
          </button>

          <button
            type="button"
            className="quick-fab-item"
            onClick={() => {
              onNavigate('auctions');
              setExpanded(false);
            }}
          >
            <span className="quick-fab-icon">🔨</span>
            <div className="quick-fab-text">
              <strong>المزادات المباشرة</strong>
              <small>فرص شراء الأراضي والمصانع</small>
            </div>
          </button>

          <button
            type="button"
            className="quick-fab-item"
            onClick={() => {
              onNavigate('companies');
              setExpanded(false);
            }}
          >
            <span className="quick-fab-icon">🏢</span>
            <div className="quick-fab-text">
              <strong>تأسيس وتوسعة الشركات</strong>
              <small>زيادة الطاقة الإنتاجية</small>
            </div>
          </button>

          <button
            type="button"
            className="quick-fab-item"
            onClick={() => {
              onNavigate('store');
              setExpanded(false);
            }}
          >
            <span className="quick-fab-icon">💎</span>
            <div className="quick-fab-text">
              <strong>متجر الألماس والعروض</strong>
              <small>بطاقات التسريع وتسهيلات البنك</small>
            </div>
          </button>
        </div>
      )}

      {/* Main Trigger Button */}
      <div className="quick-fab-main-group">
        <button
          type="button"
          className="quick-fab-collect-direct"
          onClick={handleCollect}
          title="جمع أرباحك اليومية فوراً"
        >
          <span className="fab-bolt">⚡</span>
          <span className="fab-collect-label">جمع الأرباح</span>
        </button>

        <button
          type="button"
          className={`quick-fab-trigger ${expanded ? 'is-active' : ''}`}
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-label="اختصارات اللعب السريع"
        >
          <Icon name={expanded ? 'close' : 'menu'} size={20} />
        </button>
      </div>
    </div>
  );
}
