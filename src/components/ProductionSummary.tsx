import type { PlayerProfile } from '../domain/player';
import type { SectionId } from '../domain/navigation';
import { formatNumber } from '../domain/formatters';
import { INDUSTRY_CATALOG, PRODUCT_CATALOG } from '../game/catalog';
import { selectCompanyPerformance } from '../game/selectors';
import { Icon } from './Icon';
import './ProductionSummary.css';

interface ProductionSummaryProps {
  profile: PlayerProfile;
  onNavigate: (section: SectionId, target?: string) => void;
}

export function ProductionSummary({ profile, onNavigate }: ProductionSummaryProps) {
  const performance = profile.companies.map((company) => ({
    company,
    report: selectCompanyPerformance(profile, company.id),
  }));
  const activeOrders = performance.reduce((total, item) => total + item.report.activeOrders, 0);
  const productIds = new Set(PRODUCT_CATALOG.map((product) => product.id));
  const stockUnits = (profile.inventory ?? []).reduce(
    (total, lot) => total + (productIds.has(lot.materialOrProductId) ? lot.quantity : 0),
    0,
  );

  return (
    <section className="production-summary surface" aria-labelledby="production-summary-title" dir="rtl">
      <div className="production-summary__heading">
        <div className="production-summary__title">
          <span className="production-summary__icon"><Icon name="factory" size={18} /></span>
          <div>
            <span className="section-kicker">لمحة تشغيلية</span>
            <h2 id="production-summary-title">الإنتاج</h2>
          </div>
        </div>
        <button
          className="production-summary__link"
          type="button"
          onClick={() => onNavigate('production')}
        >
          صفحة الإنتاج <Icon name="chevron" size={14} />
        </button>
      </div>

      <div className="production-summary__metrics" aria-label="ملخص الإنتاج">
        <div className="production-summary__metric">
          <span>أوامر نشطة</span>
          <strong>{formatNumber(activeOrders)}</strong>
        </div>
        <div className="production-summary__metric">
          <span>وحدات منتجات مكتملة بالمخزون</span>
          <strong>{formatNumber(stockUnits)}</strong>
        </div>
      </div>

      {performance.length === 0 ? (
        <p className="production-summary__empty" role="status">
          لا توجد شركات أو خطوط إنتاج بعد. أسّس شركة لتبدأ الإنتاج.
        </p>
      ) : (
        <div className="production-summary__companies" aria-label="تفاصيل الإنتاج حسب الشركة">
          {performance.map(({ company, report }) => {
            const industryName = INDUSTRY_CATALOG.find((industry) => industry.id === company.industryId)?.name;
            return (
              <details className="production-summary__company" key={company.id}>
                <summary>
                  <span className="production-summary__company-name">
                    <strong>{company.name}</strong>
                    <small>{industryName ?? 'شركة إنتاج'}</small>
                  </span>
                  <span className="production-summary__company-status">
                    {formatNumber(report.activeOrders)} نشط
                  </span>
                  <span className="production-summary__toggle" aria-hidden="true">
                    <Icon name="chevron" size={15} />
                  </span>
                </summary>
                <div className="production-summary__details">
                  <span>أوامر مكتملة <strong>{formatNumber(report.completedOrders)}</strong></span>
                  <span>إنتاج مكتمل <strong>{formatNumber(report.outputUnits)}</strong></span>
                  {report.quality > 0 && (
                    <span>متوسط الجودة <strong>{formatNumber(Math.round(report.quality))}%</strong></span>
                  )}
                </div>
              </details>
            );
          })}
        </div>
      )}
    </section>
  );
}
