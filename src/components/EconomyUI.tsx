import type { ReactNode } from 'react';
import { Icon } from './Icon';

interface EconomyPageShellProps {
  dayLabel: string;
  balanceLabel: string;
  children: ReactNode;
}

export function EconomyPageShell({ dayLabel, balanceLabel, children }: EconomyPageShellProps) {
  return (
    <div className="economy-page">
      <div className="economy-toolbar">
        <div className="economy-toolbar-copy">
          <strong>إدارة الإمبراطورية</strong>
          <small>{balanceLabel} · تقدمك محفوظ محليًا</small>
        </div>
        <span className="economy-day"><Icon name="clock" size={15} />{dayLabel}</span>
        <span className="economy-auto-note"><Icon name="clock" size={14} /> مدة اليوم 24 دقيقة</span>
      </div>
      {children}
    </div>
  );
}

interface EconomyPanelProps {
  id?: string;
  title: string;
  description?: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function EconomyPanel({ id, title, description, aside, children, className = '' }: EconomyPanelProps) {
  return (
    <section id={id} className={`economy-panel${className ? ` ${className}` : ''}`}>
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
