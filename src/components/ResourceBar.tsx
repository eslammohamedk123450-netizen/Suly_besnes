import React from 'react';
import type { CountryDefinition } from '../domain/countries';
import type { PlayerProfile } from '../domain/player';
import type { SectionId } from '../domain/navigation';
import { formatGold, formatMoney, formatNumber } from '../domain/formatters';
import { getPlayerProgress, isSectionUnlocked } from '../game/onboarding';
import { AvatarPortrait } from './AvatarPortrait';
import { GameDayTimer } from './GameDayTimer';
import { NotificationBell } from './NotificationBell';

export type ResourceSyncState = 'synced' | 'syncing' | 'offline' | 'blocked' | 'local';

export interface ResourceBarProps {
  profile: PlayerProfile;
  country: CountryDefinition;
  onNavigate: (section: SectionId) => void;
  syncState: ResourceSyncState;
  pendingCommandCount: number;
  onDaysElapsed?: (days: number) => void;
  onOpenWardrobe?: () => void;
  onOpenWalkthrough?: () => void;
  onOpenTutorial?: () => void;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
  forceBellVibrate?: boolean;
}

export function ResourceBar({
  profile,
  country,
  onNavigate,
  syncState,
  pendingCommandCount,
  onDaysElapsed,
  onOpenWardrobe,
  onOpenWalkthrough,
  onOpenTutorial,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  forceBellVibrate = false,
}: ResourceBarProps) {
  const progress = getPlayerProgress(profile);
  const cashTargetSection: SectionId = isSectionUnlocked(profile, 'bank') ? 'bank' : 'obligations';

  return (
    <header
      className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-950/95 border-b border-slate-800/80 shadow-2xl transition-all"
      aria-label="شريط الأرصدة والملف الشخصي والوقت"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 flex flex-col gap-1.5">
        {/* ROW 1: Top Right Avatar + Adjacent Balances + Left Controls (No Game Name) */}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Right Cluster: Avatar + Balances Right Next to it */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-0.5 min-w-0">
            {/* 1. Profile Avatar at Top Right (الصورة الشخصية بالأعلى على اليمين) */}
            <div
              onClick={() => onNavigate('profile')}
              role="button"
              tabIndex={0}
              className="group relative flex items-center justify-center p-1 rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-850 to-slate-900 border-2 border-amber-500/50 hover:border-amber-400 hover:shadow-[0_0_15px_rgba(251,191,36,0.4)] transition-all shadow-md cursor-pointer shrink-0 select-none"
              title="الملف الشخصي وتخصيص الهوية"
            >
              <div className="relative">
                <AvatarPortrait
                  avatarId={profile.avatarId}
                  size="md"
                  showBorder={false}
                  className="rounded-xl group-hover:scale-105 transition-transform"
                />

                {/* Level Badge overlaid on bottom-right of avatar */}
                <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[10px] font-black shadow-md border border-slate-950 tabular-nums">
                  م{formatNumber(progress.level)}
                </span>

                {/* Wardrobe quick button */}
                {onOpenWardrobe && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenWardrobe();
                    }}
                    className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-slate-900 text-amber-300 hover:bg-amber-500 hover:text-slate-950 flex items-center justify-center text-[9px] font-black shadow border border-slate-700 transition"
                    title="خزانة وتغيير الشخصية"
                  >
                    👑
                  </button>
                )}
              </div>
            </div>

            {/* 2. Financial Balances immediately next to the Avatar (الأرصدة بجانب الصورة) */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Cash Balance (السيولة النقدية) */}
              <div
                onClick={() => onNavigate(cashTargetSection)}
                role="button"
                tabIndex={0}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-emerald-500/35 hover:border-emerald-400 hover:bg-slate-800/90 transition shadow-sm cursor-pointer group shrink-0"
                title="السيولة البنكية المتاحة - انقر لإدارة السيولة والالتزامات"
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-xs sm:text-sm group-hover:scale-110 transition-transform">
                  💵
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[9px] text-slate-400 font-bold leading-none">
                    السيولة
                  </span>
                  <strong className="text-xs sm:text-sm font-black text-emerald-400 tabular-nums tracking-tight leading-tight">
                    {formatMoney(profile.bankBalance, country)}
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate(cashTargetSection);
                  }}
                  className="w-4 h-4 rounded-md bg-emerald-600/80 hover:bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black transition active:scale-95"
                  title="إدارة السيولة والالتزامات"
                >
                  +
                </button>
              </div>

              {/* Diamonds Balance (الماس) */}
              <div
                onClick={() => onNavigate('store')}
                role="button"
                tabIndex={0}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/35 hover:border-cyan-400 hover:bg-slate-800/90 transition shadow-sm cursor-pointer group shrink-0"
                title="رصيد الماس - انقر لفتح المتجر السريع"
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-xs sm:text-sm group-hover:scale-110 transition-transform">
                  💎
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[9px] text-slate-400 font-bold leading-none">
                    الماس
                  </span>
                  <strong className="text-xs sm:text-sm font-black text-cyan-300 tabular-nums tracking-tight leading-tight">
                    {formatNumber(profile.diamonds)}
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('store');
                  }}
                  className="w-4 h-4 rounded-md bg-cyan-600/80 hover:bg-cyan-500 text-white flex items-center justify-center text-[10px] font-black transition active:scale-95"
                  title="شحن الماس"
                >
                  +
                </button>
              </div>

              {/* Gold Bullion Balance (سبائك الذهب) */}
              <div
                onClick={() => onNavigate('auctions')}
                role="button"
                tabIndex={0}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-amber-500/35 hover:border-amber-400 hover:bg-slate-800/90 transition shadow-sm cursor-pointer group shrink-0"
                title="احتياطي الذهب الخام - انقر لفتح المزادات والتداول"
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-xs sm:text-sm group-hover:scale-110 transition-transform">
                  🪙
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[9px] text-slate-400 font-bold leading-none">
                    الذهب
                  </span>
                  <strong className="text-xs sm:text-sm font-black text-amber-300 tabular-nums tracking-tight leading-tight">
                    {formatGold(profile.goldGrams)}
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('store');
                  }}
                  className="w-4 h-4 rounded-md bg-amber-600/80 hover:bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-black transition active:scale-95"
                  title="شراء الذهب"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Left Cluster: Notifications */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {onOpenNotifications && (
              <NotificationBell
                unreadCount={unreadNotificationsCount}
                onClick={onOpenNotifications}
                forceVibrate={forceBellVibrate}
              />
            )}
          </div>
        </div>

        {/* ROW 2: Underneath: The Days & Country (تحتها الأيام) */}
        {onDaysElapsed && (
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <GameDayTimer profile={profile} onDaysElapsed={onDaysElapsed} />
            </div>

            {/* Country Flag Pill */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-bold text-slate-300 shadow-sm shrink-0"
              title={`${country.name} (${country.currency.code})`}
            >
              <span>{country.flag}</span>
              <span className="text-[11px] font-semibold">{country.name}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
