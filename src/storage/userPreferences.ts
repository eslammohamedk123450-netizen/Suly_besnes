export type NotificationTheme = 'dark' | 'light';

const NOTICE_THEME_KEY = 'business-empire.notice-theme.v1';

export function loadNotificationTheme(): NotificationTheme {
  try {
    return globalThis.localStorage?.getItem(NOTICE_THEME_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function saveNotificationTheme(theme: NotificationTheme): void {
  try {
    globalThis.localStorage?.setItem(NOTICE_THEME_KEY, theme);
  } catch {
    // The preference is optional; the default dark notification remains available in memory.
  }
}
