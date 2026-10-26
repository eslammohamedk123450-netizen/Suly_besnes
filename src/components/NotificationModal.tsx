import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  CheckCheck, 
  Trash2, 
  ArrowLeft, 
  ShieldAlert, 
  Clock, 
  Factory, 
  TrendingUp, 
  Building2, 
  Award, 
  Sparkles,
  DollarSign
} from 'lucide-react';
import type { GameNotification } from '../game/notifications';
import type { SectionId } from '../domain/navigation';
import { playSound } from '../game/soundEffects';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: GameNotification[];
  readNotificationIds: string[];
  onNavigate: (section: SectionId, target?: string) => void;
  onMarkRead: (notificationId: string) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  readNotificationIds,
  onNavigate,
  onMarkRead,
  onMarkAllRead,
  onClearAll,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'production' | 'finance' | 'market'>('all');

  if (!isOpen) return null;

  const readSet = new Set(readNotificationIds);
  const unreadCount = notifications.filter((n) => !readSet.has(n.id)).length;

  const filteredNotifications = notifications.filter((item) => {
    const isRead = readSet.has(item.id);
    if (filter === 'unread') return !isRead;
    if (filter === 'production') return item.section === 'production' || item.section === 'lands' || item.section === 'companies';
    if (filter === 'finance') return item.section === 'bank' || item.section === 'obligations' || item.section === 'staff' || item.section === 'reports';
    if (filter === 'market') return item.section === 'contracts' || item.section === 'inventory' || item.section === 'auctions';
    return true;
  });

  const getNotificationIcon = (item: GameNotification) => {
    switch (item.section) {
      case 'production':
        return <Factory className="w-4 h-4 text-emerald-400" />;
      case 'bank':
      case 'obligations':
        return <DollarSign className="w-4 h-4 text-amber-400" />;
      case 'staff':
        return <Clock className="w-4 h-4 text-rose-400" />;
      case 'companies':
      case 'lands':
        return <Building2 className="w-4 h-4 text-blue-400" />;
      case 'contracts':
      case 'inventory':
      case 'auctions':
        return <TrendingUp className="w-4 h-4 text-teal-400" />;
      default:
        return item.tone === 'danger' ? (
          <ShieldAlert className="w-4 h-4 text-rose-400" />
        ) : (
          <Sparkles className="w-4 h-4 text-amber-400" />
        );
    }
  };

  const getToneBadge = (tone: GameNotification['tone']) => {
    switch (tone) {
      case 'danger':
        return { bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40', text: 'استحقاق عاجل' };
      case 'warning':
        return { bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40', text: 'تنبيه' };
      case 'success':
        return { bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', text: 'جاهز' };
      default:
        return { bg: 'bg-sky-500/20 text-sky-300 border-sky-500/40', text: 'معلومات' };
    }
  };

  const handleItemClick = (item: GameNotification) => {
    playSound('click');
    onMarkRead(item.id);
    if (item.section) {
      onNavigate(item.section as SectionId, item.target);
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      dir="rtl"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xl bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
              <Bell className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">
                  مركز الإشعارات والتنبيهات
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-mono text-[10px] font-bold">
                    {unreadCount} جديد
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                متابعة حركة الإنتاج، التزامات الشركات، وفرص السوق الحالية
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Category Tabs */}
        <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filter === 'all'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              الكل ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                filter === 'unread'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${unreadCount > 0 ? 'bg-rose-500' : 'bg-slate-500'}`} />
              غير مقروء ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('production')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filter === 'production'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              الإنتاج
            </button>
            <button
              onClick={() => setFilter('finance')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filter === 'finance'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              المالية
            </button>
            <button
              onClick={() => setFilter('market')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filter === 'market'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              السوق والعقود
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={unreadCount === 0}
              onClick={() => {
                playSound('click');
                onMarkAllRead();
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-bold flex items-center gap-1 transition-all"
              title="تحديد كل التنبيهات كمقروءة"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>تعليم الكل كمقروء</span>
            </button>
            <button
              type="button"
              disabled={notifications.length === 0}
              onClick={() => {
                playSound('click');
                onClearAll();
              }}
              className="p-1 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 transition-colors"
              title="مسح جميع الإشعارات"
              aria-label="مسح الكل"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mx-auto text-slate-500">
                <Bell className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">لا توجد إشعارات في هذا التصنيف</h4>
                <p className="text-xs text-slate-400 mt-1">
                  إمبراطوريتك مستقرة حالياً، وأي مستجدات في السوق أو خطوط الإنتاج ستصلك فوراً هنا.
                </p>
              </div>
            </div>
          ) : (
            filteredNotifications.map((item) => {
              const isRead = readSet.has(item.id);
              const toneBadge = getToneBadge(item.tone);

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 relative ${
                    !isRead
                      ? 'bg-slate-950/80 border-amber-500/40 hover:border-amber-400 shadow-md shadow-amber-950/20'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60'
                  }`}
                >
                  {/* Unread indicator dot */}
                  {!isRead && (
                    <span className="absolute top-3 left-3 w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/60" />
                  )}

                  {/* Icon */}
                  <div className="w-9 h-9 rounded-xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center shrink-0">
                    {getNotificationIcon(item)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${toneBadge.bg}`}>
                        {toneBadge.text}
                      </span>
                      <h4 className={`text-xs sm:text-sm font-bold truncate ${!isRead ? 'text-white' : 'text-slate-300'}`}>
                        {item.title}
                      </h4>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {item.detail}
                    </p>

                    {/* Navigation action hint */}
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/60">
                      <span className="text-amber-400/90 font-medium flex items-center gap-1 hover:text-amber-300">
                        <span>انتقل إلى القسم</span>
                        <ArrowLeft className="w-3 h-3" />
                      </span>
                      {!isRead ? (
                        <span className="text-rose-400 font-bold text-[10px]">
                          غير مقروء
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">
                          مقروء
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>نظام الإشعارات الموحد</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
