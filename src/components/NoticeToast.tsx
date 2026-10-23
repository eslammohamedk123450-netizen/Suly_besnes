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
    <div className="notice-overlay" role="presentation" onClick={onDismiss}>
      <div
        className={`toast toast--${tone} toast--${theme}`}
        role={tone === 'error' ? 'alertdialog' : 'status'}
        aria-live={tone === 'error' ? 'assertive' : 'polite'}
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="toast-icon" aria-hidden="true"><Icon name={tone === 'error' ? 'close' : 'shield'} size={24} /></span>
        <div className="toast-copy"><strong>{tone === 'error' ? 'تعذر تنفيذ العملية' : 'تم تنفيذ العملية'}</strong><span className="toast-message">{message}</span><small>سيختفي هذا الإشعار تلقائيًا، أو اضغط إغلاق.</small></div>
        <button className="toast-close" type="button" onClick={onDismiss} aria-label="إغلاق الإشعار"><Icon name="close" size={18} /></button>
      </div>
    </div>
  );
}
