import { useState } from 'react';
import type { CountryDefinition } from '../domain/countries';
import type { PlayerProfile } from '../domain/player';
import { accountCodeFromSeed } from '../domain/accountFeatures';
import { formatGold, formatMoney, formatNumber } from '../domain/formatters';
import { getPlayerProgress } from '../game/onboarding';

interface ProfilePageProps {
  profile: PlayerProfile;
  country: CountryDefinition;
  accountId: string;
  isGuest: boolean;
  isSynced: boolean;
  onLinkAccount: () => void;
}

async function copyTextWithFallback(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Clipboard API may be unavailable or rejected in embedded Android WebViews.
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

export function ProfilePage({ profile, country, accountId, isGuest, isSynced, onLinkAccount }: ProfilePageProps) {
  const [copyMessage, setCopyMessage] = useState<{ text: string; success: boolean } | null>(null);
  const progress = getPlayerProgress(profile);
  const accountCode = accountCodeFromSeed(accountId);
  const badges = (profile.badges ?? []).filter((badge) => badge.trim().length > 0);
  const progressPercent = Math.min(
    100,
    Math.max(0, (progress.experienceInLevel / progress.experienceForNextLevel) * 100),
  );

  async function copyAccountCode() {
    const copied = await copyTextWithFallback(accountCode);
    setCopyMessage({
      text: copied ? 'تم نسخ معرف اللاعب بنجاح.' : 'تعذر نسخ المعرف. حدده وانسخه يدويًا.',
      success: copied,
    });
  }

  return (
    <main className="profile-page" dir="rtl" aria-labelledby="profile-page-title">
      <header className="profile-page-header">
        <span className="profile-page-kicker">ملف اللاعب</span>
        <h1 id="profile-page-title">ملفي الشخصي</h1>
        <p>ملخص هويتك وتقدمك وأصولك في عالم الأعمال.</p>
      </header>

      <section className="profile-identity" aria-label="هوية اللاعب">
        <div className="profile-identity-copy">
          <span className="profile-eyebrow">المستثمر</span>
          <h2>{profile.name}</h2>
          <span className="profile-country">الدولة: {country.name}</span>
        </div>
        <button
          className="profile-account-code"
          type="button"
          onClick={() => void copyAccountCode()}
          aria-label={`نسخ معرف اللاعب ${accountCode}`}
        >
          <span>معرف اللاعب</span>
          <strong dir="ltr">{accountCode}</strong>
          <small>اضغط لنسخ المعرف</small>
        </button>
        {copyMessage && (
          <p className={`profile-copy-message${copyMessage.success ? '' : ' is-error'}`} role="status" aria-live="polite">
            {copyMessage.text}
          </p>
        )}
      </section>

      {isGuest ? (
        <section className="profile-sync-notice profile-sync-notice--guest" role="status">
          <div>
            <strong>هذا معرف ضيف محلي — لا يظهر في لوحة الإدارة</strong>
            <p>عالم الضيف محفوظ على هذا الجهاز. أنشئ حسابًا سحابيًا للحصول على معرف قابل للبحث؛ سيبدأ الحساب السحابي بعالم جديد وتبقى نسخة الضيف محلية هنا.</p>
          </div>
          <button className="profile-sync-link" type="button" onClick={onLinkAccount}>إنشاء حساب سحابي</button>
        </section>
      ) : !isSynced ? (
        <section className="profile-sync-notice profile-sync-notice--pending" role="status">
          <strong>لم يكتمل حفظ العالم في السحابة بعد</strong>
          <p>سيصبح هذا المعرف قابلًا للبحث في لوحة الإدارة بعد اكتمال المزامنة. تحقق من الاتصال وحالة الحفظ أعلى الشاشة.</p>
        </section>
      ) : (
        <section className="profile-sync-notice profile-sync-notice--ready" role="status">
          <strong>الحساب السحابي متصل</strong>
          <p>هذا هو معرف الحساب الحالي الذي تستخدمه لوحة الإدارة للبحث عن اللاعب.</p>
        </section>
      )}

      <section className="profile-progress" aria-label="المستوى والخبرة">
        <div className="profile-section-heading">
          <div>
            <span className="profile-eyebrow">التقدم</span>
            <h2>المستوى {formatNumber(progress.level)}</h2>
          </div>
          <strong className="profile-experience-count">
            {formatNumber(progress.totalExperience)} خبرة إجمالية
          </strong>
        </div>
        <div
          className="profile-progress-track"
          role="progressbar"
          aria-label="الخبرة نحو المستوى التالي"
          aria-valuemin={0}
          aria-valuemax={progress.experienceForNextLevel}
          aria-valuenow={progress.experienceInLevel}
        >
          <span style={{ width: `${progressPercent}%` }} />
        </div>
        <p className="profile-progress-caption">
          {formatNumber(progress.experienceInLevel)} من {formatNumber(progress.experienceForNextLevel)} خبرة للمستوى التالي
        </p>
      </section>

      <section className="profile-stat-grid" aria-label="موارد اللاعب">
        <article className="profile-stat profile-stat--day">
          <span>اليوم</span>
          <strong>{formatNumber(profile.day)}</strong>
        </article>
        <article className="profile-stat profile-stat--money">
          <span>المال</span>
          <strong>{formatMoney(profile.bankBalance, country)}</strong>
        </article>
        <article className="profile-stat profile-stat--gold">
          <span>الذهب</span>
          <strong>{formatGold(profile.goldGrams)}</strong>
        </article>
        <article className="profile-stat profile-stat--diamonds">
          <span>الماس</span>
          <strong>{formatNumber(profile.diamonds)}</strong>
        </article>
      </section>

      <section className="profile-stat-grid profile-stat-grid--ownership" aria-label="أصول اللاعب والشارات">
        <article className="profile-stat profile-stat--companies">
          <span>الشركات</span>
          <strong>{formatNumber(profile.companies.length)}</strong>
        </article>
        <article className="profile-stat profile-stat--lands">
          <span>الأراضي</span>
          <strong>{formatNumber(profile.lands.length)}</strong>
        </article>
        <article className="profile-stat profile-stat--badges-count">
          <span>الشارات</span>
          <strong>{formatNumber(badges.length)}</strong>
        </article>
      </section>

      <section className="profile-badges" aria-labelledby="profile-badges-title">
        <div className="profile-section-heading">
          <div>
            <span className="profile-eyebrow">المكتسبات</span>
            <h2 id="profile-badges-title">شاراتي</h2>
          </div>
          <span className="profile-badges-total">{formatNumber(badges.length)}</span>
        </div>
        {badges.length > 0 ? (
          <ul className="profile-badge-list">
            {badges.map((badge, index) => (
              <li className="profile-badge" key={`${badge}-${index}`}>{badge}</li>
            ))}
          </ul>
        ) : (
          <p className="profile-badges-empty">لا توجد شارات مكتسبة بعد.</p>
        )}
      </section>
    </main>
  );
}
