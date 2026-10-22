import { Icon } from './Icon';
import type { NotificationTheme } from '../storage/userPreferences';

interface NoticeToastProps {
  message: string;
  tone: 'success' | 'error';
  theme: NotificationTheme;
  onDismiss: () => void;
}

export function NoticeToast({ message, tone, theme, onDismiss }: NoticeToastProps) {
  return (
    <div
      className={`toast toast--${tone} toast--${theme}`}
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
    >
      <span className="toast-message">{message}</span>
      <button className="toast-close" type="button" onClick={onDismiss} aria-label="إغلاق الإشعار">
        <Icon name="close" size={16} />
      </button>
    </div>
  );
}
