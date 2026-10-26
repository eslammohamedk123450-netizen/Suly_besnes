import { useId, type ReactNode } from 'react';
import { formatNumber } from '../domain/formatters';
import { Icon, type IconName } from './Icon';

interface EconomyPageShellProps {
  dayLabel: string;
  balanceLabel: string;
  dayDurationMinutes: number;
  daySpeedMultiplier: 1 | 2 | 3;
  compact?: boolean;
  children: ReactNode;
}

export function EconomyPageShell({ dayLabel, balanceLabel, dayDurationMinutes, daySpeedMultiplier, compact = false, children }: EconomyPageShellProps) {
  return (
    <div className={`economy-page${compact ? ' economy-page--compact' : ''}`}>
      <div className="economy-toolbar">
        <div className="economy-toolbar-copy">
          <strong>إدارة الإمبراطورية</strong>
          <small>{balanceLabel} · تقدمك محفوظ محليًا</small>
        </div>
        <span className="economy-day"><Icon name="clock" size={15} />{dayLabel}</span>
        <span className="economy-auto-note"><Icon name="clock" size={14} /> مدة اليوم {daySpeedMultiplier > 1 ? `×${formatNumber(daySpeedMultiplier)} · ` : ''}{formatNumber(dayDurationMinutes)} دقيقة</span>
      </div>
      {children}
    </div>
  );
}

export interface EconomyPanelProps {
  id?: string;
  title: string;
  description?: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
  compact?: boolean;
  icon?: IconName;
  expanded?: boolean;
  onToggle?: () => void;
  badge?: ReactNode;
  iconVariant?: 'gold' | 'cyan' | 'yellow' | 'green' | 'purple' | 'orange';
}

export function EconomyPanel({ id, title, description, aside, children, className = '', compact = false, icon = 'briefcase', expanded = false, onToggle, badge, iconVariant }: EconomyPanelProps) {
  const contentId = useId();
  const autoVariant = iconVariant 
    ? `economy-panel-tile--${iconVariant}`
    : icon === 'lightning'
    ? 'economy-panel-tile--yellow'
    : icon === 'conveyor'
    ? 'economy-panel-tile--cyan'
    : icon === 'factory'
    ? 'economy-panel-tile--gold'
    : icon === 'users' || icon === 'user'
    ? 'economy-panel-tile--green'
    : icon === 'warehouse'
    ? 'economy-panel-tile--orange'
    : '';

  if (compact) {
    return (
      <section id={id} className={`economy-panel economy-panel--compact${expanded ? ' is-expanded' : ''}${className ? ` ${className}` : ''} ${autoVariant}`}>
        <button className="economy-panel-tile" type="button" aria-expanded={expanded} aria-controls={contentId} onClick={onToggle}>
          <div className="economy-panel-tile-top">
            <span className={`economy-panel-tile-icon icon-glow--${icon}`}>
              <Icon name={icon} size={25} />
            </span>
            {badge && <div className="economy-panel-tile-badge">{badge}</div>}
          </div>
          <span className="economy-panel-tile-copy">
            <strong>{title}</strong>
            {description && <small>{description}</small>}
          </span>
          <span className="economy-panel-tile-arrow"><Icon name={expanded ? 'close' : 'chevron'} size={16} /></span>
        </button>
        <div id={contentId} className="economy-panel-content" hidden={!expanded}>
          <div className="economy-panel-heading economy-panel-heading--compact">
            <div><h2>{title}</h2>{description && <p>{description}</p>}</div>
            {aside}
          </div>
          {children}
        </div>
      </section>
    );
  }
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
