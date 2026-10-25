import type { CountryDefinition } from '../domain/countries';
import type { PlayerProfile } from '../domain/player';
import type { SectionId } from '../domain/navigation';
import { formatGold, formatMoney, formatNumber } from '../domain/formatters';
import { getPlayerProgress } from '../game/onboarding';
import { Icon } from './Icon';

export type ResourceSyncState = 'synced' | 'syncing' | 'offline' | 'blocked' | 'local';

interface ResourceBarProps {
  profile: PlayerProfile;
  country: CountryDefinition;
  onNavigate: (section: SectionId) => void;
  syncState: ResourceSyncState;
  pendingCommandCount: number;
}

export function ResourceBar({ profile, country, onNavigate }: ResourceBarProps) {
  const progress = getPlayerProgress(profile);
  const progressPercent = Math.min(100, (progress.experienceInLevel / progress.experienceForNextLevel) * 100);

  return (
    <section className="empire-top-header" aria-label="رأس الإمبراطورية والموارد">
      {/* Title & Slogan */}
      <div className="empire-header-brand">
        <div className="empire-brand-title">
          <Icon name="crown" size={24} className="empire-crown-icon" />
          <h1>إمبراطورية الأعمال</h1>
        </div>
        <p className="empire-brand-slogan">بناء أكبر إمبراطورية في العالم العربي</p>
      </div>

      {/* Profile & Level Bar (Top Left) */}
      <div className="empire-profile-widget" onClick={() => onNavigate('profile')} role="button" tabIndex={0}>
        <div className="empire-avatar-circle">
          <span className="empire-avatar-initial">{profile.name.trim().charAt(0) || 'م'}</span>
          <span className="empire-avatar-crown">👑</span>
        </div>
        <div className="empire-level-info">
          <div className="empire-level-title">
            <strong>مستوى {formatNumber(progress.level)}</strong>
          </div>
          <div className="empire-level-track">
            <span style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* 3-Card Resource Bar (Top Right) */}
      <div className="empire-resource-cards">
        {/* Money Card */}
        <div className="empire-resource-card empire-resource-card--money" onClick={() => onNavigate('bank')}>
          <div className="empire-resource-icon">💵</div>
          <div className="empire-resource-details">
            <small>الرصيد</small>
            <strong>{formatMoney(profile.bankBalance, country)}</strong>
          </div>
          <button className="empire-resource-add" type="button" onClick={(e) => { e.stopPropagation(); onNavigate('store'); }} aria-label="إضافة رصيد">+</button>
        </div>

        {/* Diamonds Card */}
        <div className="empire-resource-card empire-resource-card--diamonds" onClick={() => onNavigate('store')}>
          <div className="empire-resource-icon">💎</div>
          <div className="empire-resource-details">
            <small>الماس</small>
            <strong>{formatNumber(profile.diamonds)}</strong>
          </div>
          <button className="empire-resource-add" type="button" onClick={(e) => { e.stopPropagation(); onNavigate('store'); }} aria-label="إضافة ماس">+</button>
        </div>

        {/* Gold Card */}
        <div className="empire-resource-card empire-resource-card--gold" onClick={() => onNavigate('auctions')}>
          <div className="empire-resource-icon">🪙</div>
          <div className="empire-resource-details">
            <small>الذهب</small>
            <strong>{formatGold(profile.goldGrams)}</strong>
          </div>
          <button className="empire-resource-add" type="button" onClick={(e) => { e.stopPropagation(); onNavigate('store'); }} aria-label="إضافة ذهب">+</button>
        </div>
      </div>
    </section>
  );
}
