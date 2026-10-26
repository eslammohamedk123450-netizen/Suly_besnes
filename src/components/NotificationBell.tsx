import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';

interface NotificationBellProps {
  unreadCount: number;
  onClick: () => void;
  /** When true, forces a shake sequence (e.g. on new notification arrival) */
  forceVibrate?: boolean;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  unreadCount,
  onClick,
  forceVibrate,
}) => {
  const [isVibrating, setIsVibrating] = useState(false);

  // Trigger vibration when forceVibrate turns true
  useEffect(() => {
    if (forceVibrate) {
      setIsVibrating(true);
      const timer = setTimeout(() => setIsVibrating(false), 2400);
      return () => clearTimeout(timer);
    }
  }, [forceVibrate]);

  // Periodic vibration every 2 minutes (120 seconds) if there are unread notifications
  useEffect(() => {
    if (unreadCount <= 0) {
      setIsVibrating(false);
      return;
    }

    const TWO_MINUTES_MS = 2 * 60 * 1000;
    const interval = setInterval(() => {
      setIsVibrating(true);
      setTimeout(() => {
        setIsVibrating(false);
      }, 2500);
    }, TWO_MINUTES_MS);

    return () => clearInterval(interval);
  }, [unreadCount]);

  return (
    <>
      <style>{`
        @keyframes bell-shake-vibrate {
          0% { transform: rotate(0deg); }
          5% { transform: rotate(18deg) scale(1.1); }
          10% { transform: rotate(-18deg) scale(1.1); }
          15% { transform: rotate(14deg); }
          20% { transform: rotate(-14deg); }
          25% { transform: rotate(10deg); }
          30% { transform: rotate(-10deg); }
          35% { transform: rotate(6deg); }
          40% { transform: rotate(-6deg); }
          45% { transform: rotate(2deg); }
          50% { transform: rotate(0deg); }
          60% { transform: rotate(12deg) scale(1.05); }
          65% { transform: rotate(-12deg) scale(1.05); }
          70% { transform: rotate(8deg); }
          75% { transform: rotate(-8deg); }
          80% { transform: rotate(4deg); }
          85% { transform: rotate(-4deg); }
          90% { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }
        .bell-vibrating {
          animation: bell-shake-vibrate 1.8s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
          transform-origin: top center;
        }
      `}</style>

      <button
        type="button"
        onClick={onClick}
        className={`relative p-2 rounded-xl border transition-all duration-200 flex items-center justify-center ${
          unreadCount > 0
            ? 'bg-slate-900 border-amber-500/40 text-amber-300 hover:bg-slate-800 shadow-md shadow-amber-950/30'
            : 'bg-slate-900/80 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
        }`}
        title={unreadCount > 0 ? `مركز الإشعارات (${unreadCount} غير مقروءة)` : 'مركز الإشعارات والتنبيهات'}
        aria-label="الإشعارات"
      >
        <div className={isVibrating ? 'bell-vibrating' : ''}>
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
        </div>

        {/* Red Dot & Counter Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center">
            {/* Pulsing ring */}
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            {/* Solid badge */}
            <span className="relative inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black leading-none text-white bg-rose-600 border border-slate-950 rounded-full shadow-md">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>
    </>
  );
};
