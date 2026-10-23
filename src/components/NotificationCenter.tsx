import type { GameNotification } from '../game/notifications';
import { Icon } from './Icon';

interface NotificationCenterProps {
  notifications: GameNotification[];
  onNavigate: (section: GameNotification['section']) => void;
}

export function NotificationCenter({ notifications, onNavigate }: NotificationCenterProps) {
  return (
    <section className="notification-center surface" aria-label="مركز التنبيهات">
      <div className="panel-heading">
        <div><span className="section-kicker">متابعة الإمبراطورية</span><h2>مركز التنبيهات</h2></div>
        <span className="notification-count">{notifications.length} تنبيه</span>
      </div>
      {notifications.length === 0 ? <p className="notification-empty">لا توجد تنبيهات معلقة. وضع الإمبراطورية مستقر حاليًا.</p> : <div className="notification-list">{notifications.map((notification) => <button className={`notification-row notification-row--${notification.tone}`} type="button" key={notification.id} onClick={() => onNavigate(notification.section)}><span className="notification-icon"><Icon name={notification.tone === 'danger' ? 'shield' : notification.tone === 'success' ? 'target' : notification.tone === 'warning' ? 'clock' : 'report'} size={16} /></span><span className="notification-copy"><strong>{notification.title}</strong><small>{notification.detail}</small></span><Icon name="chevron" size={14} /></button>)}</div>}
    </section>
  );
}
