import type { CountryDefinition } from '../domain/countries';
import type { PlayerProfile } from '../domain/player';
import type { DayBriefing, DayOutcome } from '../game/engine';
import { formatMoney, formatNumber } from '../domain/formatters';
import { Icon } from './Icon';

interface DailyBriefingProps {
  profile: PlayerProfile;
  country: CountryDefinition;
  briefing: DayBriefing;
  outcome?: DayOutcome | null;
  onConfirm: () => void;
  onClose: () => void;
}

export function DailyBriefing({ profile, country, briefing, outcome, onConfirm, onClose }: DailyBriefingProps) {
  const isResult = Boolean(outcome);
  const eventImpact = outcome?.event.cashImpact ?? briefing.event.cashImpact;
  const eventIsPositive = eventImpact > 0;
  const eventIsNegative = eventImpact < 0;

  return (
    <div className="daily-briefing-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="daily-briefing" role="dialog" aria-modal="true" aria-labelledby="daily-briefing-title">
        <div className="daily-briefing-head">
          <div>
            <span className="section-kicker">{isResult ? 'تقرير غرفة العمليات' : 'قبل اعتماد القرار'}</span>
            <h2 id="daily-briefing-title">{isResult ? `ملخص اليوم ${formatNumber(outcome?.day ?? briefing.day)}` : `معاينة اليوم ${formatNumber(briefing.day)}`}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="إغلاق ملخص اليوم"><Icon name="close" size={18} /></button>
        </div>

        {!isResult ? (
          <>
            <p className="daily-briefing-lead">مرور اليوم ليس زرًا محايدًا؛ سيُحاسب التشغيل وتُراجع الالتزامات ويُحسم الحدث التالي.</p>
            <div className="daily-briefing-grid">
              <BriefingItem icon="clock" label="مصروف التشغيل" value={formatMoney(briefing.operatingCost, country)} tone="expense" />
              <BriefingItem icon="shield" label="التزامات قائمة" value={formatMoney(briefing.existingPayables, country)} tone={briefing.existingPayables > 0 ? 'warning' : 'neutral'} />
              <BriefingItem icon="investment" label="استثمارات تستحق" value={formatNumber(briefing.maturingInvestments.length)} tone="neutral" />
              <BriefingItem icon="factory" label="الطاقة المتاحة" value={formatNumber(briefing.availableEnergy)} tone={briefing.energyPaused ? 'warning' : 'neutral'} />
            </div>
            <div className={`daily-event-preview${eventIsPositive ? ' daily-event-preview--positive' : eventIsNegative ? ' daily-event-preview--negative' : ''}`}>
              <span className="daily-event-icon"><Icon name={eventIsPositive ? 'arrow' : eventIsNegative ? 'shield' : 'clock'} size={17} /></span>
              <div><strong>الحدث المتوقع: {briefing.event.title}</strong><p>{eventIsPositive ? `أثر نقدي متوقع +${formatMoney(eventImpact, country)}` : eventIsNegative ? `تكلفة محاكاة متوقعة ${formatMoney(Math.abs(eventImpact), country)}` : 'لا يوجد أثر نقدي مباشر في هذا اليوم.'}</p></div>
            </div>
            {briefing.existingPayables > 0 && <div className="daily-briefing-warning"><Icon name="shield" size={16} /><span>لديك التزامات قائمة؛ ستُستخدم السيولة الجديدة للسداد أولًا وقد تظل الطاقة متوقفة.</span></div>}
            <div className="daily-briefing-actions"><button className="button button-secondary" type="button" onClick={onClose}>العودة للقرارات</button><button className="button button-primary" type="button" onClick={onConfirm}><Icon name="clock" size={16} /> اعتماد مرور اليوم</button></div>
          </>
        ) : (
          <>
            <p className="daily-briefing-lead">تم تسجيل اليوم في ملفك المحلي. هذه هي التغييرات التي حدثت فعليًا، وليست توقعات.</p>
            <div className="daily-briefing-grid">
              <BriefingItem icon="bank" label="الرصيد بعد التسوية" value={formatMoney(profile.bankBalance, country)} tone="neutral" />
              <BriefingItem icon="clock" label="مصروف التشغيل المسجل" value={formatMoney(outcome?.operatingCost ?? 0, country)} tone="expense" />
              <BriefingItem icon="investment" label="عائد الاستثمارات" value={formatMoney(outcome?.investmentPayout ?? 0, country)} tone="positive" />
              <BriefingItem icon="shield" label="الالتزامات المتبقية" value={formatMoney(outcome?.payables ?? profile.payables, country)} tone={(outcome?.payables ?? profile.payables) > 0 ? 'warning' : 'positive'} />
            </div>
            <div className={`daily-event-preview${eventIsPositive ? ' daily-event-preview--positive' : eventIsNegative ? ' daily-event-preview--negative' : ''}`}>
              <span className="daily-event-icon"><Icon name={eventIsPositive ? 'arrow' : eventIsNegative ? 'shield' : 'clock'} size={17} /></span>
              <div><strong>{outcome?.event.title}</strong><p>{eventIsPositive ? `أضاف ${formatMoney(eventImpact, country)} إلى السيولة` : eventIsNegative ? `سُجلت تكلفة ${formatMoney(Math.abs(eventImpact), country)}` : 'مرّ اليوم دون أثر نقدي مباشر من الحدث.'}</p></div>
            </div>
            <div className="daily-briefing-result-note"><Icon name={profile.payables > 0 ? 'shield' : 'report'} size={16} /><span>{profile.payables > 0 ? 'راجع السيولة قبل بدء إنتاج جديد حتى لا تتوقف الطاقة.' : 'راجع بطاقة الخطوة التالية في لوحة العمليات قبل اتخاذ القرار القادم.'}</span></div>
            <div className="daily-briefing-actions"><button className="button button-primary" type="button" onClick={onClose}>العودة إلى غرفة العمليات</button></div>
          </>
        )}
      </section>
    </div>
  );
}

function BriefingItem({ icon, label, value, tone }: { icon: 'clock' | 'shield' | 'investment' | 'factory' | 'bank'; label: string; value: string; tone: 'expense' | 'warning' | 'neutral' | 'positive' }) {
  return <div className={`daily-briefing-item daily-briefing-item--${tone}`}><span><Icon name={icon} size={15} />{label}</span><strong>{value}</strong></div>;
}
