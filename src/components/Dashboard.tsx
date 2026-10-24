import type { CountryDefinition } from '../domain/countries';
import type { PlayerProfile } from '../domain/player';
import { calculateTotalAssets } from '../domain/player';
import { formatMoney, formatNumber } from '../domain/formatters';
import { GOLD_PRICE_PER_GRAM } from '../game/catalog';
import { GAME_SECTIONS, type SectionId } from '../domain/navigation';
import { Icon } from './Icon';
import { selectOperationsSnapshot } from '../game/selectors';
import { getPlayerProgress, getUnlockedSectionIds } from '../game/onboarding';
import { selectNotifications } from '../game/notifications';
import { updateNotificationState, type GameCommand, type GameResult } from '../game/engine';
import { getGameDayDurationMinutes } from '../game/time';
import { NotificationCenter } from './NotificationCenter';

interface DashboardProps {
  profile: PlayerProfile;
  country: CountryDefinition;
  onNavigate: (section: SectionId, target?: string) => void;
  onCommand: (command: GameCommand, fallback: (current: PlayerProfile) => GameResult<unknown>) => void;
}

export function Dashboard({ profile, country, onNavigate, onCommand }: DashboardProps) {
  const totalAssets = calculateTotalAssets(profile);
  const quickSections = GAME_SECTIONS.filter((section) => section.id !== 'home');
  const operations = selectOperationsSnapshot(profile, country.economy.operatingCostMultiplier ?? 1);
  const playerProgress = getPlayerProgress(profile);
  const unlockedSections = new Set(getUnlockedSectionIds(profile));
  const dayDurationMinutes = getGameDayDurationMinutes(profile.activeDaySpeedMultiplier ?? 1);
  const totalOutstanding = profile.payables + profile.staff.filter((employee) => employee.status === 'active').reduce((sum, employee) => sum + (employee.unpaidSalary ?? 0), 0);
  const notifications = selectNotifications(profile);
  const updateNotifications = (action: 'read' | 'dismiss', notificationIds: string[]) => onCommand(
    { name: 'update_notification_state', args: { action, notificationIds } },
    (current) => updateNotificationState(current, action, notificationIds),
  );

  return <div className="dashboard-page dashboard-page--compact">
    <section className="dashboard-hero dashboard-hero--compact">
      <img src="/images/cairo-skyline-lite.webp" alt="أفق القاهرة على ضفاف النيل" /><div className="hero-overlay" />
      <div className="hero-content"><span className="eyebrow"><span className="live-dot" /> {country.name} · اليوم {formatNumber(profile.day)}</span><h1>مرحبًا، {profile.name}</h1><p>لوحة قيادتك المختصرة. اختر نظامًا واحدًا وواصل بناء الإمبراطورية.</p><div className="hero-meta"><span className="country-chip">{country.flag} {country.name}</span><span className="hero-divider" /><span>المستوى {playerProgress.level}</span><span className="hero-divider" /><span>{profile.companies.length} شركات</span></div><span className="dashboard-auto-note"><Icon name="clock" size={14} /> اليوم يتقدم خلال {formatNumber(dayDurationMinutes)} دقيقة حقيقية</span><button className="dashboard-store-link" type="button" onClick={() => onNavigate('store')}><Icon name="store" size={16} /> متجر المشتريات</button></div>
      <div className="hero-emblem"><Icon name="crown" size={25} /><span>BE</span></div>
    </section>

    {totalOutstanding > 0 && <div className="operating-warning" role="status">لديك التزامات ورواتب غير مسددة بقيمة {formatMoney(totalOutstanding, country)}؛ راجعها من بطاقة الالتزامات.</div>}
    <NotificationCenter notifications={notifications} readNotificationIds={profile.readNotificationIds ?? []} onNavigate={onNavigate} onMarkRead={(id) => updateNotifications('read', [id])} onMarkAllRead={(ids) => updateNotifications('read', ids)} onDismissAll={(ids) => updateNotifications('dismiss', ids)} />

    <section className={`operations-next operations-next--${operations.nextStep.tone} dashboard-next-card`}><div className="operations-next-mark"><Icon name="target" size={21} /></div><div className="operations-next-copy"><span className="section-kicker">خطوتك المقترحة</span><h2>{operations.nextStep.title}</h2><p>{operations.nextStep.description}</p></div><button className="button button-primary operations-next-action" type="button" onClick={() => onNavigate(operations.nextStep.section)}>{operations.nextStep.actionLabel}<Icon name="chevron" size={15} /></button></section>

    <section className="compact-stats" aria-label="ملخص الإمبراطورية">
      <article className="compact-stat compact-stat--gold"><Icon name="bank" size={18} /><span><small>رصيد البنك</small><strong>{formatMoney(profile.bankBalance, country)}</strong></span></article>
      <article className="compact-stat"><Icon name="briefcase" size={18} /><span><small>إجمالي الأصول</small><strong>{formatMoney(totalAssets, country)}</strong></span></article>
      <article className="compact-stat"><Icon name="investment" size={18} /><span><small>صافي الأرباح</small><strong>{formatMoney(profile.finances.netProfit, country)}</strong></span></article>
      <article className="compact-stat"><Icon name="shield" size={18} /><span><small>السمعة التجارية</small><strong>{formatNumber(operations.reputation)} / 100</strong></span></article>
    </section>

    <section className="sections-area sections-area--luxury"><div className="panel-heading sections-heading"><div><span className="section-kicker">بوابة الإمبراطورية</span><h2>اختر نظامًا</h2></div><span className="phase-pill">اضغط للدخول</span></div><div className="section-cards section-cards--luxury">{quickSections.map((section) => { const unlocked = unlockedSections.has(section.id); return <button className={`section-card section-card--luxury${section.id === 'settings' ? ' section-card--settings' : ''}${!unlocked ? ' is-locked' : ''}`} type="button" key={section.id} disabled={!unlocked} onClick={() => onNavigate(section.id)}><span className="section-card-icon"><Icon name={unlocked ? section.icon : 'lock'} size={23} /></span><span className="section-card-copy"><strong>{section.label}</strong><small>{unlocked ? section.subtitle : 'سيفتح لاحقًا مع تقدم السيناريو'}</small></span><Icon name="chevron" size={17} className="section-chevron" /></button>; })}</div></section>
    <p className="data-footnote">الأرصدة والأسعار محاكاة لأغراض اللعبة · تقدمك محفوظ تلقائيًا</p>
  </div>;
}
