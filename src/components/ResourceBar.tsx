import React from 'react';
import type { CountryDefinition } from '../domain/countries';
import type { PlayerProfile } from '../domain/player';
import type { SectionId } from '../domain/navigation';
import { formatGold, formatMoney, formatNumber } from '../domain/formatters';
import { getPlayerProgress } from '../game/onboarding';
import { AvatarPortrait } from './AvatarPortrait';
import { GameDayTimer } from './GameDayTimer';
import { NotificationBell } from './NotificationBell';
import { Brand } from './Brand';
import { Icon } from './Icon';
import { Sparkles, Crown, Gem, Coins, Plus, Calendar, Compass, BookOpen } from 'lucide-react';

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
  const progressPercent = Math.min(
    100,
    Math.max(0, (progress.experienceInLevel / progress.experienceForNextLevel) * 100)
  );

  return (
    <header
      className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-950/95 border-b border-slate-800/80 shadow-2xl transition-all"
      aria-label="شريط الأرصدة والهوية العلوي المثبت"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 flex flex-col gap-2">
        {/* Main Row: Brand, Primary Cards, Profile, Tools */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 flex-wrap lg:flex-nowrap">
          {/* 1. Left Cluster: Brand / Home Logo + Profile Quick Pill */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Brand Logo */}
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-900 transition cursor-pointer"
              title="العودة للشاشة الرئيسية"
            >
              <Brand compact />
            </button>

            {/* Quick Profile Pill with Real Selected Avatar + Compact Level Badge */}
            <div
              onClick={() => onNavigate('profile')}
              role="button"
              tabIndex={0}
              className="group flex items-center gap-2.5 p-1.5 pl-3 rounded-2xl bg-slate-900/90 border border-amber-500/30 hover:border-amber-400 hover:bg-slate-800/90 transition shadow-lg cursor-pointer select-none"
              title="عرض الملف الشخصي وتخصيص الهوية"
            >
              {/* Avatar with Direct Click for Wardrobe */}
              <div
                onClick={(e) => {
                  if (onOpenWardrobe) {
                    e.stopPropagation();
                    onOpenWardrobe();
                  }
                }}
                className="relative"
                title="تغيير واقتناء صورة الشخصية"
              >
                <AvatarPortrait
                  avatarId={profile.avatarId}
                  size="sm"
                  showBorder
                  className="group-hover:scale-105 transition-transform"
                />
                <button
                  type="button"
                  className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[9px] font-black shadow border border-slate-950"
                  title="خزانة الشخصيات"
                >
                  📷
                </button>
              </div>

              {/* Name & Compact Level Badge */}
              <div className="flex flex-col text-right">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-black text-white line-clamp-1 max-w-[100px] sm:max-w-[130px]">
                    {profile.name}
                  </span>
                  {/* Compact Level Badge */}
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/40 tabular-nums">
                    مستوى {formatNumber(progress.level)}
                  </span>
                </div>
                {/* Mini XP Progress Bar */}
                <div className="w-full h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Center: 3-Card Financial HUD (Cash, Diamonds, Gold) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-1 justify-center sm:justify-end lg:justify-center overflow-x-auto no-scrollbar py-0.5">
            {/* Direct Bank Liquidity / Cash Card */}
            <div
              onClick={() => onNavigate('bank')}
              role="button"
              tabIndex={0}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/60 border border-emerald-500/30 hover:border-emerald-400 hover:bg-slate-800/80 transition shadow-md cursor-pointer group min-w-[110px] sm:min-w-[135px]"
              title="السيولة البنكية المباشرة - انقر لإدارة البنك والقروض"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-sm sm:text-base group-hover:scale-110 transition-transform">
                💵
              </div>
              <div className="flex flex-col text-right flex-1 min-w-0">
                <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold line-clamp-1">
                  السيولة البنكية
                </span>
                <strong className="text-xs sm:text-sm font-black text-white tabular-nums tracking-tight line-clamp-1">
                  {formatMoney(profile.bankBalance, country)}
                </strong>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate('bank');
                }}
                className="w-5 h-5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center text-xs font-black shadow transition active:scale-95"
                aria-label="إدارة البنك والسيولة"
                title="إيداع أو سحب"
              >
                +
              </button>
            </div>

            {/* Glowing Diamonds Card */}
            <div
              onClick={() => onNavigate('store')}
              role="button"
              tabIndex={0}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/60 border border-cyan-500/30 hover:border-cyan-400 hover:bg-slate-800/80 transition shadow-md cursor-pointer group min-w-[95px] sm:min-w-[115px]"
              title="رصيد الماس المضيء - انقر لفتح المتجر السريع"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-sm sm:text-base group-hover:scale-110 transition-transform">
                💎
              </div>
              <div className="flex flex-col text-right flex-1 min-w-0">
                <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold line-clamp-1">
                  الماس
                </span>
                <strong className="text-xs sm:text-sm font-black text-cyan-300 tabular-nums tracking-tight line-clamp-1">
                  {formatNumber(profile.diamonds)}
                </strong>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate('store');
                }}
                className="w-5 h-5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center text-xs font-black shadow transition active:scale-95"
                aria-label="متجر الماس"
                title="شحن الماس"
              >
                +
              </button>
            </div>

            {/* Raw Gold Card */}
            <div
              onClick={() => onNavigate('auctions')}
              role="button"
              tabIndex={0}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/60 border border-amber-500/30 hover:border-amber-400 hover:bg-slate-800/80 transition shadow-md cursor-pointer group min-w-[95px] sm:min-w-[115px]"
              title="رصيد الذهب الخام - انقر لفتح المزادات والتداول"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 text-sm sm:text-base group-hover:scale-110 transition-transform">
                🪙
              </div>
              <div className="flex flex-col text-right flex-1 min-w-0">
                <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold line-clamp-1">
                  الذهب الخام
                </span>
                <strong className="text-xs sm:text-sm font-black text-amber-300 tabular-nums tracking-tight line-clamp-1">
                  {formatGold(profile.goldGrams)}
                </strong>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate('store');
                }}
                className="w-5 h-5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black shadow transition active:scale-95"
                aria-label="شراء سبائك الذهب"
                title="شراء ذهب"
              >
                +
              </button>
            </div>
          </div>

          {/* 3. Right Cluster: Simulation Day + Action Shortcuts + Bell */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* World Day & Simulation Clock */}
            {onDaysElapsed && (
              <GameDayTimer profile={profile} onDaysElapsed={onDaysElapsed} />
            )}

            {/* Country Flag Pill */}
            <div
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-bold text-slate-300 shadow-sm"
              title={`${country.name} (${country.currency.code})`}
            >
              <span>{country.flag}</span>
              <span className="hidden md:inline text-[11px]">{country.name}</span>
            </div>

            {/* Walkthrough Button */}
            {onOpenWalkthrough && (
              <button
                type="button"
                onClick={onOpenWalkthrough}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
                title="بدء الجولة الإرشادية التفاعلية"
              >
                <Compass className="w-3.5 h-3.5" />
                <span className="hidden xl:inline text-[11px]">الجولة 🎯</span>
              </button>
            )}

            {/* Story Button */}
            {onOpenTutorial && (
              <button
                type="button"
                onClick={onOpenTutorial}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition shadow-sm active:scale-95 cursor-pointer"
                title="سيناريو القصة والمهام"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden xl:inline text-[11px]">القصة 📜</span>
              </button>
            )}

            {/* Notification Bell */}
            {onOpenNotifications && (
              <NotificationBell
                unreadCount={unreadNotificationsCount}
                onClick={onOpenNotifications}
                forceVibrate={forceBellVibrate}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
