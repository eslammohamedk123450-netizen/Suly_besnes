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
}

export function Dashboard({ profile, country, onNavigate }: DashboardProps) {
  const totalAssets = calculateTotalAssets(profile);
  const quickSections = GAME_SECTIONS.filter((section) => section.id !== 'home');

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <img src="/images/cairo-skyline.webp" alt="أفق القاهرة على ضفاف النيل" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <span className="eyebrow"><span className="live-dot" /> رحلتك الاستثمارية بدأت</span>
          <h1>مرحبًا، {profile.name}</h1>
          <p>الثروة بداية الحكاية؛ قراراتك هي ما يبني الإمبراطورية.</p>
          <div className="hero-meta"><span className="country-chip">{country.flag} {country.name}</span><span className="hero-divider" /><span>المستوى {profile.level}</span></div>
        </div>
        <div className="hero-emblem"><Icon name="crown" size={25} /><span>BE</span></div>
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
          <span className="stat-footnote">النقد والأصول المسجلة</span>
        </article>
        <article className="stat-card">
          <div className="stat-heading"><span className="stat-icon"><Icon name="gold" /></span><span>احتياطي الذهب</span></div>
          <strong className="stat-value">{formatGold(profile.goldGrams)}</strong>
          <span className="stat-footnote">كمية الذهب المسجلة</span>
        </article>
        <article className="stat-card">
          <div className="stat-heading"><span className="stat-icon"><Icon name="investment" /></span><span>صافي الأرباح</span></div>
          <strong className="stat-value">{formatMoney(profile.finances.netProfit, country)}</strong>
          <span className="stat-footnote">لا توجد معاملات مالية بعد</span>
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
          <div className="panel-heading"><div><span className="section-kicker">سجل الحساب</span><h2>آخر العمليات</h2></div><span className="activity-icon"><Icon name="clock" /></span></div>
          <div className="empty-activity"><span className="empty-ring"><Icon name="report" size={21} /></span><div><strong>لا توجد عمليات بعد</strong><p>ستظهر هنا حركاتك المالية عند تفعيل أنظمة الأعمال.</p></div></div>
        </section>
      </div>

      <section className="sections-area">
        <div className="panel-heading sections-heading"><div><span className="section-kicker">مسارات التوسع</span><h2>أقسام الإمبراطورية</h2></div><span className="phase-pill">المرحلة الأولى</span></div>
        <div className="section-cards">
          {quickSections.map((section) => (
            <button className={`section-card${section.id === 'settings' ? ' section-card--settings' : ''}`} type="button" key={section.id} onClick={() => onNavigate(section.id)}>
              <span className="section-card-icon"><Icon name={section.icon} size={21} /></span>
              <span className="section-card-copy"><strong>{section.label}</strong><small>{section.id === 'settings' ? section.subtitle : 'غير منفذ في هذه المرحلة'}</small></span>
              {section.id !== 'settings' && <span className="section-lock"><Icon name="lock" size={14} /></span>}
              <Icon name="chevron" size={17} className="section-chevron" />
            </button>
          ))}
        </div>
      </section>
      <p className="data-footnote">بيانات اللعبة محفوظة على هذا الجهاز <span>·</span> لا يلزم اتصال بالإنترنت للمتابعة</p>
    </div>
  );
}
