import type { CountryDefinition } from '../domain/countries';
import type { PlayerProfile } from '../domain/player';
import { calculateTotalAssets } from '../domain/player';
import { formatGold, formatMoney, formatNumber } from '../domain/formatters';
import { GAME_SECTIONS, type SectionId } from '../domain/navigation';
import { Icon } from './Icon';

interface DashboardProps {
  profile: PlayerProfile;
  country: CountryDefinition;
  onNavigate: (section: SectionId) => void;
  onAdvanceDay: () => void;
}

export function Dashboard({ profile, country, onNavigate, onAdvanceDay }: DashboardProps) {
  const totalAssets = calculateTotalAssets(profile);
  const quickSections = GAME_SECTIONS.filter((section) => section.id !== 'home');
  const latestEntries = profile.ledger.slice(-5).reverse();

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
          <button className="button button-primary dashboard-turn-button" type="button" onClick={onAdvanceDay}><Icon name="clock" size={16} /> مرّر يومًا اقتصاديًا</button>
        </div>
        <div className="hero-emblem"><Icon name="crown" size={25} /><span>BE</span></div>
      </section>

      {profile.payables > 0 && <div className="operating-warning" role="status">لديك التزامات غير مسددة بقيمة {formatMoney(profile.payables, country)}؛ أُوقفت الطاقة مؤقتًا، وتُخصم الالتزامات من السيولة الجديدة.</div>}

      <section className="stats-grid" aria-label="المؤشرات المالية">
        <article className="stat-card stat-card--balance">
          <div className="stat-heading"><span className="stat-icon"><Icon name="bank" /></span><span>رصيد البنك</span><span className="stat-tag">رأس المال</span></div>
          <strong className="stat-value">{formatMoney(profile.bankBalance, country)}</strong>
          <span className="stat-footnote">الرصيد المتاح حاليًا</span>
        </article>
        <article className="stat-card">
          <div className="stat-heading"><span className="stat-icon"><Icon name="briefcase" /></span><span>إجمالي الأصول</span></div>
          <strong className="stat-value">{formatMoney(totalAssets, country)}</strong>
          <span className="stat-footnote">النقد والأراضي والذهب والمخزون والاستثمارات</span>
        </article>
        <article className="stat-card">
          <div className="stat-heading"><span className="stat-icon"><Icon name="gold" /></span><span>احتياطي الذهب</span></div>
          <strong className="stat-value">{formatGold(profile.goldGrams)}</strong>
          <span className="stat-footnote">كمية الذهب المسجلة</span>
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
          {latestEntries.length === 0 ? <div className="empty-activity"><span className="empty-ring"><Icon name="report" size={21} /></span><div><strong>لا توجد عمليات بعد</strong><p>ابدأ بمزاد أو شركة لتظهر حركة الحساب.</p></div></div> : <div className="dashboard-ledger">{latestEntries.map((entry) => <div className="dashboard-ledger-row" key={entry.id}><span className={`ledger-dot ledger-dot--${entry.category}`} /><span className="dashboard-ledger-copy"><strong>{entry.note}</strong><small>اليوم {formatNumber(profile.day)}</small></span><b className={entry.category === 'revenue' ? 'money-positive' : entry.category === 'expense' ? 'money-negative' : ''}>{entry.category === 'revenue' ? '+' : entry.category === 'expense' ? '−' : ''}{formatMoney(entry.amount, country)}</b></div>)}</div>}
        </section>
      </div>

      <section className="sections-area">
        <div className="panel-heading sections-heading"><div><span className="section-kicker">إدارة الإمبراطورية</span><h2>أنظمة اللعبة</h2></div><span className="phase-pill">تعمل دون إنترنت</span></div>
        <div className="section-cards">
          {quickSections.map((section) => (
            <button className={`section-card${section.id === 'settings' ? ' section-card--settings' : ''}`} type="button" key={section.id} onClick={() => onNavigate(section.id)}>
              <span className="section-card-icon"><Icon name={section.icon} size={21} /></span>
              <span className="section-card-copy"><strong>{section.label}</strong><small>{section.subtitle}</small></span>
              <Icon name="chevron" size={17} className="section-chevron" />
            </button>
          ))}
        </div>
      </section>
      <p className="data-footnote">الأرصدة والأسعار والأحداث محاكاة لأغراض اللعبة <span>·</span> تقدمك محفوظ محليًا على هذا الجهاز</p>
    </div>
  );
}
