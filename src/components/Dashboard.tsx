import type { CountryDefinition } from '../domain/countries';
import type { PlayerProfile } from '../domain/player';
import { calculateTotalAssets } from '../domain/player';
import { formatGold, formatMoney, formatNumber } from '../domain/formatters';
import { GOLD_PRICE_PER_GRAM } from '../game/catalog';
import { GAME_SECTIONS, type SectionId } from '../domain/navigation';
import { Icon } from './Icon';
import { selectEmpirePoints, selectEmpirePulse, selectOperationsSnapshot } from '../game/selectors';
import { getSectionUnlockHint, getUnlockedSectionIds } from '../game/onboarding';
import { selectNotifications } from '../game/notifications';
import { NotificationCenter } from './NotificationCenter';
import { getSynergyBonuses } from '../game/synergy';

interface DashboardProps {
  profile: PlayerProfile;
  country: CountryDefinition;
  onNavigate: (section: SectionId) => void;
}

export function Dashboard({ profile, country, onNavigate }: DashboardProps) {
  const totalAssets = calculateTotalAssets(profile);
  const goldMarketValue = Math.round(profile.goldGrams * GOLD_PRICE_PER_GRAM);
  const quickSections = GAME_SECTIONS.filter((section) => section.id !== 'home');
  const unlockedSections = new Set(getUnlockedSectionIds(profile));
  const latestEntries = profile.ledger.slice(-5).reverse();
  const operations = selectOperationsSnapshot(profile, country.economy.operatingCostMultiplier ?? 1);
  const pulse = selectEmpirePulse(profile);
  const empirePoints = selectEmpirePoints(profile);
  const unpaidSalary = profile.staff.filter((employee) => employee.status === 'active').reduce((sum, employee) => sum + (employee.unpaidSalary ?? 0), 0);
  const totalOutstanding = profile.payables + unpaidSalary;
  const notifications = selectNotifications(profile);
  const synergies = getSynergyBonuses(profile);
  const ledgerDay = (occurredAt: string) => {
    const createdAt = Date.parse(profile.createdAt);
    const entryAt = Date.parse(occurredAt);
    if (!Number.isFinite(createdAt) || !Number.isFinite(entryAt)) return profile.day;
    return Math.max(1, Math.floor((entryAt - createdAt) / 86_400_000) + 1);
  };

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <img src="/images/cairo-skyline-lite.webp" alt="أفق القاهرة على ضفاف النيل" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <span className="eyebrow"><span className="live-dot" /> {country.name} · اليوم {formatNumber(profile.day)}</span>
          <h1>مرحبًا، {profile.name}</h1>
          <p>الثروة بداية الحكاية؛ قراراتك هي ما يبني الإمبراطورية.</p>
          <div className="hero-meta"><span className="country-chip">{country.flag} {country.name}</span><span className="hero-divider" /><span>المستوى {profile.level}</span><span className="hero-divider" /><span>{profile.companies.length} شركات</span></div>
          <span className="dashboard-auto-note"><Icon name="clock" size={15} /> اليوم يتقدم تلقائيًا كل 24 دقيقة حقيقية</span>
        </div>
        <div className="hero-emblem"><Icon name="crown" size={25} /><span>BE</span></div>
      </section>

      {totalOutstanding > 0 && <div className="operating-warning" role="status">لديك التزامات ورواتب غير مسددة بقيمة {formatMoney(totalOutstanding, country)}؛ أُوقفت الطاقة مؤقتًا، وتُخصم الالتزامات من السيولة الجديدة.</div>}

      <NotificationCenter notifications={notifications} onNavigate={onNavigate} />

      {synergies.length > 0 && <section className="surface synergy-panel"><div className="panel-heading"><div><span className="section-kicker">ميزة تشغيلية</span><h2>التآزر بين الشركات</h2></div><span className="notification-count">{synergies.length} نشط</span></div><div className="economy-list">{synergies.map((synergy) => <article className="economy-card economy-card--soft" key={synergy.id}><div className="economy-card-head"><div className="economy-card-title"><span className="economy-card-icon"><Icon name="company" size={17} /></span><span><strong>{synergy.title}</strong><small>{synergy.description}</small></span></div><span className="economy-pill economy-pill--green">تكلفة −{Math.round((1 - synergy.costMultiplier) * 100)}%</span></div></article>)}</div></section>}

      <section className={`operations-next operations-next--${operations.nextStep.tone}`}>
        <div className="operations-next-mark"><Icon name="target" size={21} /></div>
        <div className="operations-next-copy">
          <span className="section-kicker">قرارك التشغيلي التالي</span>
          <h2>{operations.nextStep.title}</h2>
          <p>{operations.nextStep.description}</p>
        </div>
        <button className="button button-primary operations-next-action" type="button" onClick={() => onNavigate(operations.nextStep.section)}>{operations.nextStep.actionLabel}<Icon name="chevron" size={15} /></button>
      </section>

      <section className="operations-metrics" aria-label="مؤشرات التشغيل">
        <div className="operations-metric"><span><Icon name="clock" size={15} /> تكلفة التشغيل اليومية</span><strong>{operations.dailyOperatingCost > 0 ? formatMoney(operations.dailyOperatingCost, country) : 'لا توجد شركات'}</strong></div>
        <div className={`operations-metric${operations.runwayDays !== null && operations.runwayDays < 5 ? ' operations-metric--warning' : ''}`}><span><Icon name="bank" size={15} /> مدة الصمود بالنقد</span><strong>{operations.runwayDays === null ? '—' : `${formatNumber(operations.runwayDays)} يوم`}</strong></div>
        <div className="operations-metric"><span><Icon name="factory" size={15} /> خطوط جاهزة للتشغيل</span><strong>{formatNumber(operations.readyProductionCompanies)}</strong></div>
        <div className="operations-metric"><span><Icon name="briefcase" size={15} /> منتجات قابلة للبيع</span><strong>{formatNumber(operations.productUnits)}</strong></div>
        <div className="operations-metric"><span><Icon name="target" size={15} /> عقود نشطة</span><strong>{formatNumber(operations.activeContracts)}</strong></div>
        <div className="operations-metric"><span><Icon name="shield" size={15} /> السمعة التجارية</span><strong>{formatNumber(operations.reputation)} / 100</strong></div>
      </section>

      <section className="empire-points-card" aria-label="نقاط الإمبراطورية">
        <div className="empire-points-heading">
          <div className="empire-points-title"><span className="empire-points-icon"><Icon name="crown" size={20} /></span><div><span className="section-kicker">التقييم الموحد للحساب</span><h2>نقاط الإمبراطورية</h2></div></div>
          <div className="empire-points-total"><strong>{formatNumber(empirePoints.total)} نقطة</strong><span>{empirePoints.title}</span></div>
        </div>
        <div className="empire-points-breakdown">
          <div><span>الثروة والأصول</span><strong>{formatNumber(empirePoints.wealth)} نقطة</strong></div>
          <div><span>الأداء المالي</span><strong>{formatNumber(empirePoints.performance)} نقطة</strong></div>
          <div><span>السمعة</span><strong>{formatNumber(empirePoints.reputation)} نقطة</strong></div>
          <div><span>الاستقرار</span><strong>{formatNumber(empirePoints.stability)} نقطة</strong></div>
          <div><span>التوسع</span><strong>{formatNumber(empirePoints.expansion)} نقطة</strong></div>
        </div>
        <p className="empire-points-note"><Icon name="shield" size={14} /> تُعاد حساباتها مباشرة من بيانات الحساب عند العرض، ولا تُحفظ كرصيد قابل للتعديل.</p>
      </section>

      <section className={`empire-pulse empire-pulse--${pulse.rankTone}`}>
        <div className="empire-pulse-rank"><span className="section-kicker">نبض الإمبراطورية</span><strong>{pulse.rank}</strong><small>{formatNumber(pulse.score)} نقطة قيادة · الهدف التالي {pulse.nextRank}</small><div className="empire-pulse-progress"><span style={{ width: `${Math.min(100, Math.round(pulse.score / Math.max(1, pulse.nextRankScore) * 100))}%` }} /></div></div>
        <div className="empire-pulse-focus"><span className="section-kicker">تركيز اليوم</span><h3>{pulse.focusTitle}</h3><p>{pulse.focusDescription}</p></div>
        <div className="empire-badges" aria-label="شارات الإمبراطورية">{pulse.badges.map((badge) => <span className={`empire-badge${badge.earned ? ' empire-badge--earned' : ''}`} key={badge.id}>{badge.earned ? '◆' : '◇'} {badge.label}</span>)}</div>
      </section>

      <section className="stats-grid" aria-label="المؤشرات المالية">
        <article className="stat-card stat-card--balance">
          <div className="stat-heading"><span className="stat-icon"><Icon name="bank" /></span><span>رصيد البنك</span><span className="stat-tag">رأس المال</span></div>
          <strong className="stat-value">{formatMoney(profile.bankBalance, country)}</strong>
          <span className="stat-footnote">الرصيد المتاح حاليًا</span>
        </article>
        <article className="stat-card">
          <div className="stat-heading"><span className="stat-icon"><Icon name="briefcase" /></span><span>إجمالي الأصول</span></div>
          <strong className="stat-value">{formatMoney(totalAssets, country)}</strong>
          <span className="stat-footnote">النقد والأراضي والمخزون والاستثمارات والقيمة الدفترية للذهب</span>
        </article>
        <article className="stat-card">
          <div className="stat-heading"><span className="stat-icon"><Icon name="gold" /></span><span>احتياطي الذهب</span></div>
          <strong className="stat-value">{formatGold(profile.goldGrams)}</strong>
          <span className="stat-footnote">تقديريًا {formatMoney(goldMarketValue, country)} بسعر اللعبة {formatMoney(GOLD_PRICE_PER_GRAM, country)} لكل غرام</span>
        </article>
        <article className="stat-card">
          <div className="stat-heading"><span className="stat-icon"><Icon name="investment" /></span><span>صافي الأرباح</span></div>
          <strong className="stat-value">{formatMoney(profile.finances.netProfit, country)}</strong>
          <span className="stat-footnote">من دفتر الإيرادات والمصروفات</span>
        </article>
      </section>

      <div className="dashboard-columns">
        <section className="surface ownership-panel">
          <div className="panel-heading"><div><span className="section-kicker">نظرة عامة</span><h2>أصول الإمبراطورية</h2></div><span className="panel-country">{country.flag} {country.currency.code}</span></div>
          <div className="ownership-row">
            <div className="ownership-item"><span className="ownership-icon"><Icon name="company" /></span><span><strong>{formatNumber(profile.companies.length)}</strong><small>شركة مملوكة</small></span></div>
            <span className="ownership-separator" />
            <div className="ownership-item"><span className="ownership-icon"><Icon name="land" /></span><span><strong>{formatNumber(profile.lands.length)}</strong><small>أرض مملوكة</small></span></div>
          </div>
          <div className="ownership-note"><Icon name="shield" size={16} /><span>تُعرض هنا الأصول المسجلة فعلًا في ملفك فقط.</span></div>
        </section>

        <section className="surface activity-panel">
          <div className="panel-heading"><div><span className="section-kicker">سجل الحساب</span><h2>آخر العمليات</h2></div><button className="text-link" type="button" onClick={() => onNavigate('reports')}>التقارير <Icon name="chevron" size={14} /></button></div>
          {latestEntries.length === 0 ? <div className="empty-activity"><span className="empty-ring"><Icon name="report" size={21} /></span><div><strong>لا توجد عمليات بعد</strong><p>ابدأ بمزاد أو شركة لتظهر حركة الحساب.</p></div></div> : <div className="dashboard-ledger">{latestEntries.map((entry) => <div className="dashboard-ledger-row" key={entry.id}><span className={`ledger-dot ledger-dot--${entry.category}`} /><span className="dashboard-ledger-copy"><strong>{entry.note}</strong><small>اليوم {formatNumber(ledgerDay(entry.occurredAt))}</small></span><b className={entry.category === 'revenue' ? 'money-positive' : entry.category === 'expense' ? 'money-negative' : ''}>{entry.category === 'revenue' ? '+' : entry.category === 'expense' ? '−' : ''}{formatMoney(entry.amount, country)}</b></div>)}</div>}
        </section>
      </div>

      <section className="sections-area">
        <div className="panel-heading sections-heading"><div><span className="section-kicker">إدارة الإمبراطورية</span><h2>أنظمة اللعبة</h2></div><span className="phase-pill">تعمل دون إنترنت</span></div>
        <div className="section-cards">
          {quickSections.map((section) => {
            const unlocked = unlockedSections.has(section.id);
            return <button className={`section-card${section.id === 'settings' ? ' section-card--settings' : ''}${unlocked ? '' : ' is-locked'}`} type="button" key={section.id} onClick={() => onNavigate(section.id)} aria-disabled={!unlocked} title={unlocked ? section.subtitle : getSectionUnlockHint(profile, section.id)}>
              <span className="section-card-copy"><strong>{section.label}</strong><small>{unlocked ? section.subtitle : getSectionUnlockHint(profile, section.id)}</small></span>
              <Icon name={unlocked ? 'chevron' : 'lock'} size={17} className="section-chevron" />
            </button>;
          })}
        </div>
      </section>
      <p className="data-footnote">الأرصدة والأسعار والأحداث محاكاة لأغراض اللعبة <span>·</span> تقدمك محفوظ محليًا على هذا الجهاز</p>
    </div>
  );
}
