import React, { useEffect, useState } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  X, 
  ArrowLeft,
  Sparkles,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import type { SectionId } from '../domain/navigation';

export interface ToastAlert {
  id: string;
  title: string;
  message: string;
  tone?: 'success' | 'warning' | 'info' | 'danger';
  section?: SectionId;
  target?: string;
}

interface FlyingToastProps {
  alert: ToastAlert | null;
  onDismiss: () => void;
  onOpenNotifications: () => void;
  onNavigate?: (section: SectionId, target?: string) => void;
}

export const FlyingToast: React.FC<FlyingToastProps> = ({
  alert,
  onDismiss,
  onOpenNotifications,
  onNavigate,
}) => {
  const [isLeaving, setIsLeaving] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!alert) {
      setIsLeaving(false);
      setProgress(100);
      return;
    }

    setIsLeaving(false);
    setProgress(100);

    const DURATION = 4200; // 4.2 seconds
    const intervalStep = 50;
    const stepPercent = (intervalStep / DURATION) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          setIsLeaving(true);
          setTimeout(() => {
            onDismiss();
          }, 350);
          return 0;
        }
        return Math.max(0, prev - stepPercent);
      });
    }, intervalStep);

    return () => clearInterval(timer);
  }, [alert?.id, onDismiss]);

  if (!alert) return null;

  const tone = alert.tone || 'info';

  const toneConfig = {
    success: {
      border: 'border-emerald-500/50',
      bg: 'bg-slate-900/95',
      glow: 'shadow-emerald-950/50 shadow-xl',
      accent: 'from-emerald-500 to-teal-400',
      iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      progressBar: 'bg-emerald-400',
      badgeText: 'نجاح العملية',
      IconComponent: CheckCircle2,
    },
    warning: {
      border: 'border-amber-500/50',
      bg: 'bg-slate-900/95',
      glow: 'shadow-amber-950/50 shadow-xl',
      accent: 'from-amber-500 to-yellow-400',
      iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      progressBar: 'bg-amber-400',
      badgeText: 'تنبيه مهم',
      IconComponent: AlertTriangle,
    },
    danger: {
      border: 'border-rose-500/50',
      bg: 'bg-slate-900/95',
      glow: 'shadow-rose-950/50 shadow-xl',
      accent: 'from-rose-500 to-red-400',
      iconBg: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
      progressBar: 'bg-rose-500',
      badgeText: 'استحقاق عاجل',
      IconComponent: AlertTriangle,
    },
    info: {
      border: 'border-sky-500/50',
      bg: 'bg-slate-900/95',
      glow: 'shadow-sky-950/50 shadow-xl',
      accent: 'from-sky-500 to-blue-400',
      iconBg: 'bg-sky-500/20 text-sky-400 border border-sky-500/30',
      progressBar: 'bg-sky-400',
      badgeText: 'إشعار جديد',
      IconComponent: Bell,
    },
  }[tone];

  const { IconComponent } = toneConfig;

  const handleAction = () => {
    if (alert.section && onNavigate) {
      onNavigate(alert.section, alert.target);
      onDismiss();
    } else {
      onOpenNotifications();
      onDismiss();
    }
  };

  return (
    <div 
      className="fixed top-3 sm:top-5 inset-x-0 z-[120] pointer-events-none flex justify-center px-3"
      dir="rtl"
    >
      <div
        className={`pointer-events-auto w-full max-w-md ${toneConfig.bg} backdrop-blur-xl border ${toneConfig.border} rounded-2xl ${toneConfig.glow} overflow-hidden transition-all duration-300 ease-out transform ${
          isLeaving
            ? '-translate-y-8 opacity-0 scale-95'
            : 'translate-y-0 opacity-100 scale-100 shadow-2xl'
        }`}
        style={{
          boxShadow: '0 16px 40px -8px rgba(0,0,0,0.65), 0 0 20px -2px rgba(217,184,91,0.15)',
        }}
      >
        {/* Subtle Accent Glow Header Line */}
        <div className={`h-1 w-full bg-gradient-to-r ${toneConfig.accent}`} />

        <div className="p-3.5 sm:p-4 flex items-start gap-3">
          {/* Tone Icon Badge */}
          <div className={`w-10 h-10 rounded-xl ${toneConfig.iconBg} flex items-center justify-center shrink-0 shadow-inner`}>
            <IconComponent className="w-5 h-5" />
          </div>

          {/* Copy Area */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60 shrink-0">
                  {toneConfig.badgeText}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                  {alert.title}
                </h4>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  setIsLeaving(true);
                  setTimeout(onDismiss, 200);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/80 transition-colors shrink-0"
                aria-label="إغلاق التنبيه"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 select-text">
              {alert.message}
            </p>

            {/* Quick Action Navigation */}
            <div className="mt-2.5 flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={handleAction}
                className="font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 hover:underline transition-all"
              >
                <span>{alert.section ? 'الانتقال للقسم مباشرة' : 'فتح مركز الإشعارات'}</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] text-slate-400 font-mono">
                يختفي تلقائياً
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar (Timer indicator) */}
        <div className="h-0.5 w-full bg-slate-800/60">
          <div
            className={`h-full ${toneConfig.progressBar} transition-all duration-75 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
