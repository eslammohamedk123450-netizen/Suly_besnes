import { useState } from 'react';
import type { CountryDefinition } from '../domain/countries';
import type { PlayerProfile } from '../domain/player';
import { accountCodeFromSeed } from '../domain/accountFeatures';
import { formatGold, formatMoney, formatNumber } from '../domain/formatters';
import { getPlayerProgress } from '../game/onboarding';
import { selectEmpirePulse } from '../game/selectors';
import { Icon } from './Icon';
import './ProfilePage.css';

interface ProfilePageProps {
  profile: PlayerProfile;
  country: CountryDefinition;
  accountId: string;
  isGuest: boolean;
  isSynced: boolean;
  onLinkAccount: () => void;
  onResetWorld?: () => void;
}

async function copyTextWithFallback(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Clipboard API may be unavailable or rejected in embedded WebViews.
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.setAttribute('aria-hidden', 'true');
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.right = '-10000px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
}

export function ProfilePage({ profile, country, accountId, isGuest, isSynced, onLinkAccount, onResetWorld }: ProfilePageProps) {
  const [copyMessage, setCopyMessage] = useState<{ text: string; success: boolean } | null>(null);
  const progress = getPlayerProgress(profile);
  const accountCode = accountCodeFromSeed(accountId);
  const badgeCatalog = selectEmpirePulse(profile).badges;
  const earnedBadges = badgeCatalog.filter((badge) => badge.earned);
  const progressPercent = Math.min(
    100,
    Math.max(0, (progress.experienceInLevel / progress.experienceForNextLevel) * 100),
  );

  async function copyAccountCode() {
    const copied = await copyTextWithFallback(accountCode);
    setCopyMessage({
      text: copied ? 'تم نسخ المعرف بنجاح!' : 'تعذر النسخ تلقائياً.',
      success: copied,
    });
    setTimeout(() => setCopyMessage(null), 3000);
  }

  const initialLetter = profile.name.trim().charAt(0) || 'م';

  return (
    <main className="lux-profile-container" dir="rtl">
      {/* 1. VIP Executive Hero Card */}
      <section className="lux-profile-hero" aria-label="هوية اللاعب المتميزة">
        <div className="lux-profile-hero-top">
          <div className="lux-profile-identity">
            <div className="lux-profile-avatar-wrapper">
              <div className="lux-profile-avatar-ring">
                <div className="lux-profile-avatar-inner">{initialLetter}</div>
              </div>
              <span className="lux-profile-level-badge">Lvl {progress.level}</span>
            </div>

            <div className="lux-profile-meta">
              <div className="lux-profile-title-row">
                <h1>{profile.name}</h1>
                <span className={`lux-profile-status-tag ${isGuest ? 'lux-profile-status-tag--guest' : 'lux-profile-status-tag--verified'}`}>
                  {isGuest ? '⚡ حساب ضيف محلي' : '👑 مستثمر موثق'}
                </span>
              </div>
              <div className="lux-profile-subtitle">
                <span>{country.flag}</span>
                <span>{country.name}</span>
                <span>•</span>
                <span>قائد إمبراطورية الأعمال</span>
              </div>
            </div>
          </div>

          {/* Account Code Box */}
          <div className="lux-profile-id-box" onClick={() => void copyAccountCode()} title="اضغط لنسخ معرف الحساب">
            <div className="lux-profile-id-info">
              <label>معرف اللاعب (ID)</label>
              <code dir="ltr">{accountCode}</code>
            </div>
            <button type="button" className="lux-copy-icon-btn" aria-label="نسخ المعرف">
              <Icon name="shield" size={16} />
            </button>
          </div>
        </div>

        {copyMessage && (
          <div className={`lux-sync-banner ${copyMessage.success ? 'lux-sync-banner--ready' : 'lux-sync-banner--guest'}`} style={{ marginTop: 12 }}>
            <span>{copyMessage.text}</span>
          </div>
        )}

        {/* Sync Status Banner */}
        {isGuest ? (
          <div className="lux-sync-banner lux-sync-banner--guest">
            <div>
              <strong>جلسة ضيف محلي ({country.name})</strong>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', opacity: 0.9 }}>
                تقدمك محفوظ محلياً. يمكنك اختيار دولة واسم جديدين أو ربط الحساب.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {onResetWorld && (
                <button type="button" className="lux-btn-link-account" style={{ background: '#2563eb' }} onClick={onResetWorld}>
                  تغيير الدولة والاسم 🌍
                </button>
              )}
              <button type="button" className="lux-btn-link-account" onClick={onLinkAccount}>
                ترقية لحساب متصل ⚡
              </button>
            </div>
          </div>
        ) : !isSynced ? (
          <div className="lux-sync-banner lux-sync-banner--pending">
            <span>جارٍ مزامنة بيانات العالم مع السحابة الإمبراطورية...</span>
          </div>
        ) : (
          <div className="lux-sync-banner lux-sync-banner--ready">
            <span>✓ الحساب متصل ومُزامن بالكامل مع السحابة الإمبراطورية</span>
          </div>
        )}
      </section>

      {/* 2. Level Progress Card */}
      <section className="lux-card">
        <div className="lux-progress-header">
          <div className="lux-progress-title">
            <Icon name="crown" size={20} />
            <span>المستوى {formatNumber(progress.level)}</span>
          </div>
          <span className="lux-xp-count">
            إجمالي الخبرة: <strong>{formatNumber(progress.totalExperience)} XP</strong>
          </span>
        </div>

        <div className="lux-progress-track-wrapper">
          <div className="lux-progress-bar-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        <p className="lux-progress-caption">
          {formatNumber(progress.experienceInLevel)} من {formatNumber(progress.experienceForNextLevel)} XP للوصول للمستوى القادم ({Math.round(progressPercent)}%)
        </p>
      </section>

      {/* 3. Compact High-Density Stat Grid */}
      <section>
        <div className="lux-section-title">
          <Icon name="bank" size={18} />
          <span>الأصول والموارد الإمبراطورية</span>
        </div>

        <div className="lux-stats-grid">
          {/* Cash Balance */}
          <div className="lux-stat-card">
            <div className="lux-stat-icon-badge lux-stat-icon--green">
              <Icon name="bank" size={18} />
            </div>
            <div className="lux-stat-content">
              <span className="lux-stat-label">السيولة النقدية</span>
              <strong className="lux-stat-value">{formatMoney(profile.bankBalance, country)}</strong>
            </div>
          </div>

          {/* Gold Holdings */}
          <div className="lux-stat-card">
            <div className="lux-stat-icon-badge lux-stat-icon--gold">
              <Icon name="gold" size={18} />
            </div>
            <div className="lux-stat-content">
              <span className="lux-stat-label">الذهب الخالص</span>
              <strong className="lux-stat-value">{formatGold(profile.goldGrams)}</strong>
            </div>
          </div>

          {/* Diamonds */}
          <div className="lux-stat-card">
            <div className="lux-stat-icon-badge lux-stat-icon--cyan">
              <Icon name="crown" size={18} />
            </div>
            <div className="lux-stat-content">
              <span className="lux-stat-label">الماس الإمبراطوري</span>
              <strong className="lux-stat-value">{formatNumber(profile.diamonds)} 💎</strong>
            </div>
          </div>

          {/* Days Elapsed */}
          <div className="lux-stat-card">
            <div className="lux-stat-icon-badge lux-stat-icon--amber">
              <Icon name="clock" size={18} />
            </div>
            <div className="lux-stat-content">
              <span className="lux-stat-label">اليوم الإمبراطوري</span>
              <strong className="lux-stat-value">اليوم {formatNumber(profile.day)}</strong>
            </div>
          </div>

          {/* Companies Count */}
          <div className="lux-stat-card">
            <div className="lux-stat-icon-badge lux-stat-icon--gold">
              <Icon name="company" size={18} />
            </div>
            <div className="lux-stat-content">
              <span className="lux-stat-label">الشركات التابعة</span>
              <strong className="lux-stat-value">{formatNumber(profile.companies.length)} شركات</strong>
            </div>
          </div>

          {/* Land Holdings */}
          <div className="lux-stat-card">
            <div className="lux-stat-icon-badge lux-stat-icon--green">
              <Icon name="land" size={18} />
            </div>
            <div className="lux-stat-content">
              <span className="lux-stat-label">الأراضي والمساحات</span>
              <strong className="lux-stat-value">{formatNumber(profile.lands.length)} عقار</strong>
            </div>
          </div>

          {/* Reputation */}
          <div className="lux-stat-card">
            <div className="lux-stat-icon-badge lux-stat-icon--purple">
              <Icon name="target" size={18} />
            </div>
            <div className="lux-stat-content">
              <span className="lux-stat-label">السمعة التجارية</span>
              <strong className="lux-stat-value">{formatNumber(profile.reputation ?? 50)}/100</strong>
            </div>
          </div>

          {/* Badges Earned */}
          <div className="lux-stat-card">
            <div className="lux-stat-icon-badge lux-stat-icon--cyan">
              <Icon name="shield" size={18} />
            </div>
            <div className="lux-stat-content">
              <span className="lux-stat-label">الشارات والوسامات</span>
              <strong className="lux-stat-value">{formatNumber(earnedBadges.length)} وسام</strong>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Badges Showcase Section */}
      <section className="lux-card">
        <div className="lux-section-title" style={{ marginBottom: 16 }}>
          <Icon name="shield" size={18} />
          <span>معرض الشارات والوسامات</span>
        </div>

        {earnedBadges.length > 0 ? (
          <div className="lux-badges-grid">
            {earnedBadges.map((badge) => (
              <div className="lux-badge-chip" key={badge.id}>
                <span className="lux-badge-symbol">◆</span>
                <span className="lux-badge-name">{badge.label}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="lux-badges-empty">
            لم تحصل على وسامات إمبراطورية بعد. واصل توسعة أعمالك لفتح الوسامات!
          </p>
        )}
      </section>
    </main>
  );
}
