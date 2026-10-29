import React from 'react';
import type { CountryDefinition } from '../domain/countries';
import type { PlayerProfile } from '../domain/player';
import type { SectionId } from '../domain/navigation';
import {
  formatCurrency,
  formatGold,
  formatMoney,
  formatNumber,
  formatCompactMoney,
  formatCompactNumber,
  formatCompactGold,
} from '../domain/formatters';
import { BUILDING_MAINTENANCE_COST, getOwnedBuildingsCount } from '../game/economyBalance';
import { getPlayerProgress, isSectionUnlocked } from '../game/onboarding';
import { AvatarPortrait } from './AvatarPortrait';
import { GameDayTimer } from './GameDayTimer';
import { NotificationBell } from './NotificationBell';
import {
  Shiny3DCashIcon,
  Shiny3DDiamondIcon,
  Shiny3DGoldIcon,
} from './ui/Shiny3DIcons';

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
  minimal3D?: boolean;
}

export function ResourceBar({
  profile,
  country,
  onNavigate,
  syncState: _syncState,
  pendingCommandCount: _pendingCommandCount,
  onDaysElapsed,
  onOpenWardrobe,
  onOpenWalkthrough: _onOpenWalkthrough,
  onOpenTutorial: _onOpenTutorial,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  forceBellVibrate = false,
  minimal3D = false,
}: ResourceBarProps) {
  const progress = getPlayerProgress(profile);
  const cashTargetSection: SectionId = isSectionUnlocked(profile, 'bank') ? 'bank' : 'obligations';
  const ownedBuildings = getOwnedBuildingsCount(profile);
  const maintenancePerMinute = ownedBuildings * BUILDING_MAINTENANCE_COST;

  return (
    <header
      className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#080e1a]/80 border-b border-amber-400/30 shadow-[0_4px_30px_rgba(0,0,0,0.65),0_1px_0_rgba(245,158,11,0.2)] transition-all"
      aria-label="شريط الأرصدة والملف الشخصي والوقت"
      dir="rtl"
    >
      {/* Delicate Golden Top Accent Sheen */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 flex flex-col gap-1.5">
        {/* ROW 1: Top Right Avatar + Adjacent Balances + Left Controls */}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Right Cluster: Avatar + Balances Right Next to it */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-0.5 min-w-0">
            {/* 1. Profile Avatar at Top Right (Glassmorphism + Gold Border) */}
            <div
              onClick={() => onNavigate('profile')}
              role="button"
              tabIndex={0}
              className="group relative flex items-center justify-center p-1 rounded-2xl bg-gradient-to-b from-[#111c30]/90 to-[#0a1220]/95 backdrop-blur-md border border-amber-400/50 hover:border-amber-300 hover:shadow-[0_0_16px_rgba(245,158,11,0.45)] transition-all shadow-md cursor-pointer shrink-0 select-none"
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
                <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 text-[10px] font-black shadow-md border border-slate-950 tabular-nums">
                  م{formatCompactNumber(progress.level)}
                </span>

                {/* Wardrobe quick button */}
                {onOpenWardrobe && !minimal3D && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenWardrobe();
                    }}
                    className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-[#0a1220] text-amber-300 hover:bg-amber-400 hover:text-slate-950 flex items-center justify-center text-[9px] font-black shadow border border-amber-400/40 transition"
                    title="خزانة وتغيير الشخصية"
                  >
                    👑
                  </button>
                )}
              </div>
            </div>

            {/* 2. Financial Balances immediately next to the Avatar (Glassmorphic 3D Metallic Cards) */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Cash Balance (السيولة النقدية مع أيقونة ثلاثية الأبعاد وصيغة مختصرة) */}
              <div
                onClick={() => onNavigate(cashTargetSection)}
                role="button"
                tabIndex={0}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-xl bg-gradient-to-b from-[#0f192b]/75 to-[#090f1c]/85 backdrop-blur-md border border-amber-400/25 hover:border-amber-400/60 hover:shadow-[0_0_12px_rgba(245,158,11,0.25)] transition shadow-sm cursor-pointer group shrink-0"
                title={`السيولة البنكية المتاحة: ${formatMoney(profile.bankBalance, country)} · صيانة المباني: ${formatCurrency(maintenancePerMinute)} $/دقيقة (${ownedBuildings} مبنى)`}
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#061e16]/80 border border-emerald-500/30 flex items-center justify-center text-xs sm:text-sm group-hover:scale-110 transition-transform">
                  <Shiny3DCashIcon size={24} />
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[9px] text-amber-200/70 font-bold leading-none">
                    السيولة
                  </span>
                  <strong className="text-xs sm:text-sm font-black text-emerald-300 tabular-nums tracking-tight leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    {formatCompactMoney(profile.bankBalance, country)}
                  </strong>
                </div>
                {!minimal3D && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate(cashTargetSection);
                    }}
                    className="w-4 h-4 rounded-md bg-[#0a1220]/90 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-400/40 hover:border-amber-400 flex items-center justify-center text-[10px] font-black transition active:scale-95 shadow-sm"
                    title="إدارة السيولة والالتزامات"
                  >
                    +
                  </button>
                )}
              </div>

              {/* Diamonds Balance (الماس مع أيقونة ثلاثية الأبعاد وصيغة مختصرة) */}
              <div
                onClick={() => onNavigate('store')}
                role="button"
                tabIndex={0}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-xl bg-gradient-to-b from-[#0f192b]/75 to-[#090f1c]/85 backdrop-blur-md border border-amber-400/25 hover:border-amber-400/60 hover:shadow-[0_0_12px_rgba(245,158,11,0.25)] transition shadow-sm cursor-pointer group shrink-0"
                title={`رصيد الماس: ${formatNumber(profile.diamonds)} - انقر لشحن الماس`}
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#082236]/80 border border-cyan-500/30 flex items-center justify-center text-xs sm:text-sm group-hover:scale-110 transition-transform">
                  <Shiny3DDiamondIcon size={24} />
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[9px] text-amber-200/70 font-bold leading-none">
                    الماس
                  </span>
                  <strong className="text-xs sm:text-sm font-black text-cyan-300 tabular-nums tracking-tight leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    {formatCompactNumber(profile.diamonds)}
                  </strong>
                </div>
                {!minimal3D && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('store');
                    }}
                    className="w-4 h-4 rounded-md bg-[#0a1220]/90 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-400/40 hover:border-amber-400 flex items-center justify-center text-[10px] font-black transition active:scale-95 shadow-sm"
                    title="شحن الماس"
                  >
                    +
                  </button>
                )}
              </div>

              {/* Gold Bullion Balance (سبائك الذهب مع أيقونة معدنية 3D وصيغة مختصرة) */}
              <div
                onClick={() => onNavigate('auctions')}
                role="button"
                tabIndex={0}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-xl bg-gradient-to-b from-[#0f192b]/75 to-[#090f1c]/85 backdrop-blur-md border border-amber-400/25 hover:border-amber-400/60 hover:shadow-[0_0_12px_rgba(245,158,11,0.25)] transition shadow-sm cursor-pointer group shrink-0"
                title={`احتياطي الذهب الخام: ${formatGold(profile.goldGrams)} - انقر لفتح المزادات والتداول`}
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#271b05]/80 border border-amber-500/30 flex items-center justify-center text-xs sm:text-sm group-hover:scale-110 transition-transform">
                  <Shiny3DGoldIcon size={24} />
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[9px] text-amber-200/70 font-bold leading-none">
                    الذهب
                  </span>
                  <strong className="text-xs sm:text-sm font-black text-amber-300 tabular-nums tracking-tight leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    {formatCompactGold(profile.goldGrams)}
                  </strong>
                </div>
                {!minimal3D && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('store');
                    }}
                    className="w-4 h-4 rounded-md bg-[#0a1220]/90 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-400/40 hover:border-amber-400 flex items-center justify-center text-[10px] font-black transition active:scale-95 shadow-sm"
                    title="شراء الذهب"
                  >
                    +
                  </button>
                )}
              </div>
            </div>
          </div>

          {!minimal3D && (
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {onOpenNotifications && (
                <NotificationBell
                  unreadCount={unreadNotificationsCount}
                  onClick={onOpenNotifications}
                  forceVibrate={forceBellVibrate}
                />
              )}
            </div>
          )}
        </div>

        {/* ROW 2: Underneath: The Days & Country (Glassmorphic) */}
        {!minimal3D && onDaysElapsed && (
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-amber-500/20">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <GameDayTimer profile={profile} onDaysElapsed={onDaysElapsed} />
            </div>

            {/* Country Flag Pill */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#0b1320]/80 backdrop-blur-md border border-amber-500/25 text-xs font-bold text-amber-200/90 shadow-sm shrink-0"
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
