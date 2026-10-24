import type { GameNotification } from '../game/notifications';
import { Icon } from './Icon';

interface NotificationCenterProps {
  notifications: GameNotification[];
  readNotificationIds: string[];
  onNavigate: (section: GameNotification['section'], target?: string) => void;
  onMarkRead: (notificationId: string) => void;
  onMarkAllRead: (notificationIds: string[]) => void;
  onDismissAll: (notificationIds: string[]) => void;
}

export function NotificationCenter({ notifications, readNotificationIds, onNavigate, onMarkRead, onMarkAllRead, onDismissAll }: NotificationCenterProps) {
  const read = new Set(readNotificationIds);
  const notificationIds = notifications.map((notification) => notification.id);
  const unreadCount = notifications.filter((notification) => !read.has(notification.id)).length;
  return (
    <section className="notification-center surface" aria-label="مركز التنبيهات">
      <div className="notification-heading">
        <div className="panel-heading">
          <div><span className="section-kicker">تنبيهات مجمعة</span><h2>مركز التنبيهات</h2></div>
          <span className="notification-count">{notifications.length} مجموعات · {unreadCount} جديدة</span>
        </div>
        <div className="notification-actions">
          <button className="button button-secondary" type="button" disabled={unreadCount === 0} onClick={() => onMarkAllRead(notificationIds)}>تعليم الكل كمقروء</button>
          <button className="button button-secondary" type="button" disabled={notifications.length === 0} onClick={() => onDismissAll(notificationIds)}>إخفاء الكل</button>
        </div>
      </div>
      {notifications.length === 0 ? <p className="notification-empty">لا توجد تنبيهات معلقة. وضع الإمبراطورية مستقر حاليًا.</p> : <div className="notification-list">{notifications.map((notification) => { const isRead = read.has(notification.id); return <button className={`notification-row notification-row--${notification.tone}${isRead ? ' notification-row--read' : ''}`} type="button" key={notification.id} onClick={() => { onMarkRead(notification.id); onNavigate(notification.section, notification.target); }}><span className="notification-icon"><Icon name={notification.tone === 'danger' ? 'shield' : notification.tone === 'success' ? 'target' : notification.tone === 'warning' ? 'clock' : 'report'} size={16} /></span><span className="notification-copy"><strong>{notification.title}{notification.count ? <em>{notification.count}</em> : null}{isRead && <small className="notification-read-label">مقروء</small>}</strong><small>{notification.detail}</small></span><Icon name="chevron" size={14} /></button>; })}</div>}
    </section>
  );
}
