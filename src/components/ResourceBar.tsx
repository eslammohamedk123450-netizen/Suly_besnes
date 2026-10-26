import type { CountryDefinition } from '../domain/countries';
import type { PlayerProfile } from '../domain/player';
import type { SectionId } from '../domain/navigation';
import { formatGold, formatMoney, formatNumber } from '../domain/formatters';
import { getPlayerProgress } from '../game/onboarding';
import { playSound } from '../game/soundEffects';
import './ClashHUD.css';

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
  const progressPercent = Math.min(100, Math.round((progress.experienceInLevel / Math.max(1, progress.experienceForNextLevel)) * 100));

  // Visual filling percentages for Clash-style resource gauges
  const maxCashVault = Math.max(2000000, profile.bankBalance * 1.5);
  const cashPercent = Math.min(100, Math.round((profile.bankBalance / maxCashVault) * 100));

  const maxGoldVault = Math.max(100, profile.goldGrams * 2);
  const goldPercent = Math.min(100, Math.round((profile.goldGrams / maxGoldVault) * 100));

  const diamondPercent = Math.min(100, Math.round((profile.diamonds / 1000) * 100));

  return (
    <header className="clash-hud-header" aria-label="رأس الإمبراطورية وموارد كلاش">
      <div className="clash-hud-container">
        {/* Left Side: Level Star Badge + Builders + Shield */}
        <div className="clash-hud-left">
          {/* Blue CoC Star XP Badge */}
          <div
            className="clash-xp-badge"
            onClick={() => {
              playSound('click');
              onNavigate('profile');
            }}
            title="الملف الشخصي والمستوى"
          >
            <div className="clash-xp-star">
              <span>{formatNumber(progress.level)}</span>
            </div>
            <div className="clash-xp-bar-wrap">
              <div className="clash-xp-title">
                <span>المستوى {formatNumber(progress.level)}</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="clash-xp-progress">
                <div className="clash-xp-fill" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </div>

          {/* In-Game Monthly Cycle Pill */}
          <div
            className="clash-meter-pill is-active"
            onClick={() => {
              playSound('click');
              onNavigate('companies');
            }}
            title="تقويم الشهر الافتراضي ومسير الرواتب"
          >
            <span className="clash-meter-icon">📅</span>
            <span>شهر {Math.ceil(profile.day / 30)}: <strong className="text-amber-300">يوم {((profile.day - 1) % 30) + 1}/30</strong></span>
          </div>

          {/* Mega-Corp Power Pill */}
          <div
            className="clash-meter-pill"
            onClick={() => {
              playSound('click');
              onNavigate('production');
            }}
            title="طاقة تشغيل مجمع الشركات"
          >
            <span className="clash-meter-icon">⚡</span>
            <span>طاقة: <strong className="text-cyan-300">{profile.companies[0]?.energyUnits ?? 100} و</strong></span>
          </div>
        </div>

        {/* Right Side: Clash Resource Containers */}
        <div className="clash-hud-right">
          {/* Cash Container */}
          <div
            className="clash-resource-capsule is-money"
            onClick={() => {
              playSound('cash');
              onNavigate('bank');
            }}
            title="خزينة السيولة النقدية"
          >
            <div className="clash-resource-icon-badge">💵</div>
            <div className="clash-resource-body">
              <div className="clash-resource-top">
                <span className="clash-resource-label">السيولة</span>
                <span className="clash-resource-value">{formatMoney(profile.bankBalance, country)}</span>
              </div>
              <div className="clash-resource-bar">
                <div className="clash-resource-fill" style={{ width: `${cashPercent}%` }} />
              </div>
            </div>
            <button
              className="clash-resource-add-btn"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                playSound('click');
                onNavigate('bank');
              }}
              title="إيداع أو اقتراض"
            >
              +
            </button>
          </div>

          {/* Gold Vault Container */}
          <div
            className="clash-resource-capsule is-gold"
            onClick={() => {
              playSound('click');
              onNavigate('auctions');
            }}
            title="خزينة سبائك الذهب"
          >
            <div className="clash-resource-icon-badge">🪙</div>
            <div className="clash-resource-body">
              <div className="clash-resource-top">
                <span className="clash-resource-label">الذهب</span>
                <span className="clash-resource-value">{formatGold(profile.goldGrams)}</span>
              </div>
              <div className="clash-resource-bar">
                <div className="clash-resource-fill" style={{ width: `${goldPercent}%` }} />
              </div>
            </div>
            <button
              className="clash-resource-add-btn"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                playSound('click');
                onNavigate('auctions');
              }}
              title="تداول وشراء الذهب"
            >
              +
            </button>
          </div>

          {/* Diamonds Depot Container */}
          <div
            className="clash-resource-capsule is-diamonds"
            onClick={() => {
              playSound('click');
              onNavigate('store');
            }}
            title="رصيد الماس النادر"
          >
            <div className="clash-resource-icon-badge">💎</div>
            <div className="clash-resource-body">
              <div className="clash-resource-top">
                <span className="clash-resource-label">الماس</span>
                <span className="clash-resource-value">{formatNumber(profile.diamonds)}</span>
              </div>
              <div className="clash-resource-bar">
                <div className="clash-resource-fill" style={{ width: `${diamondPercent}%` }} />
              </div>
            </div>
            <button
              className="clash-resource-add-btn"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                playSound('click');
                onNavigate('store');
              }}
              title="شراء الماس وحزم التسريع"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
