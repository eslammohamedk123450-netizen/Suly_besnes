import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { LocalNotifications } from '@capacitor/local-notifications';

export type HapticVariant = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

/**
 * Triggers native haptic vibration with graceful fallback for web browsers.
 */
export async function triggerHaptic(variant: HapticVariant = 'light'): Promise<void> {
  try {
    switch (variant) {
      case 'light':
        await Haptics.impact({ style: ImpactStyle.Light });
        break;
      case 'medium':
        await Haptics.impact({ style: ImpactStyle.Medium });
        break;
      case 'heavy':
        await Haptics.impact({ style: ImpactStyle.Heavy });
        break;
      case 'success':
        await Haptics.notification({ type: NotificationType.Success });
        break;
      case 'warning':
        await Haptics.notification({ type: NotificationType.Warning });
        break;
      case 'error':
        await Haptics.notification({ type: NotificationType.Error });
        break;
    }
  } catch {
    // Web Fallback via navigator.vibrate
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        if (variant === 'light') navigator.vibrate(25);
        else if (variant === 'medium') navigator.vibrate(50);
        else if (variant === 'heavy') navigator.vibrate(100);
        else if (variant === 'success') navigator.vibrate([40, 50, 80]);
        else if (variant === 'warning') navigator.vibrate([80, 40, 80]);
        else if (variant === 'error') navigator.vibrate([100, 50, 100, 50, 100]);
      } catch {
        // Ignore if user has not interacted
      }
    }
  }
}

/**
 * Request notification permissions (for native mobile or browser).
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const res = await LocalNotifications.requestPermissions();
    if (res.display === 'granted') return true;
  } catch {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const res = await Notification.requestPermission();
      return res === 'granted';
    }
  }
  return false;
}

/**
 * Schedules an offline local notification (e.g. factory completion, loan maturity).
 */
export async function scheduleLocalNotification(options: {
  id: number;
  title: string;
  body: string;
  secondsFromNow: number;
}): Promise<void> {
  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: options.id,
          title: options.title,
          body: options.body,
          schedule: { at: new Date(Date.now() + options.secondsFromNow * 1000) },
          sound: 'beep.wav',
          smallIcon: 'ic_stat_icon_config_sample',
        },
      ],
    });
  } catch {
    // If not running in native Capacitor, schedule browser notification timeout if permission is granted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      setTimeout(() => {
        try {
          new Notification(options.title, { body: options.body, icon: '/icons/app-icon.svg' });
        } catch {
          // ignore
        }
      }, options.secondsFromNow * 1000);
    }
  }
}
