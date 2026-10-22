import type { ReactNode } from 'react';
import { Icon } from './Icon';

interface EconomyPageShellProps {
  dayLabel: string;
  balanceLabel: string;
  onAdvanceDay: () => void;
  busy?: boolean;
  children: ReactNode;
}

export function EconomyPageShell({ dayLabel, balanceLabel, onAdvanceDay, busy = false, children }: EconomyPageShellProps) {
  return (
    <div className="economy-page">
      <div className="economy-toolbar">
        <div className="economy-toolbar-copy">
          <strong>إدارة الإمبراطورية</strong>
          <small>{balanceLabel} · تقدمك محفوظ محليًا</small>
        </div>
        <span className="economy-day"><Icon name="clock" size={15} />{dayLabel}</span>
        <button className="button button-primary" type="button" onClick={onAdvanceDay} disabled={busy}>
          {busy ? 'جارٍ الحساب…' : 'مرور يوم'}
        </button>
      </div>
      {children}
    </div>
  );
}

interface EconomyPanelProps {
  title: string;
  description?: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function EconomyPanel({ title, description, aside, children, className = '' }: EconomyPanelProps) {
  return (
    <section className={`economy-panel${className ? ` ${className}` : ''}`}>
      <div className="economy-panel-heading">
        <div><h2>{title}</h2>{description && <p>{description}</p>}</div>
        {aside}
      </div>
      {children}
    </section>
  );
}

interface EconomyStatProps {
  label: string;
  value: string;
  note?: string;
}

export function EconomyStat({ label, value, note }: EconomyStatProps) {
  return (
    <div className="economy-stat">
      <span className="economy-stat-label">{label}</span>
      <strong>{value}</strong>
      {note && <small>{note}</small>}
    </div>
  );
}

export function EconomyNotice({ message, tone = 'neutral' }: { message: string; tone?: 'neutral' | 'success' | 'error' }) {
  return (
    <div className={`economy-notice${tone === 'neutral' ? '' : ` economy-notice--${tone}`}`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon name={tone === 'error' ? 'shield' : 'report'} size={15} />
      <span>{message}</span>
    </div>
  );
}

export function EconomyEmpty({ title, message }: { title: string; message: string }) {
  return (
    <div className="economy-empty">
      <Icon name="warehouse" size={20} />
      <strong>{title}</strong>
      <p>{message}</p>
    </div>
  );
}
