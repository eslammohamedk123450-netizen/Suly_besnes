import React, { useState, useEffect } from 'react';
import type { CountryDefinition } from '../domain/countries';
import { type PlayerProfile, calculateTotalAssets } from '../domain/player';
import type { SectionId } from '../domain/navigation';
import { formatMoney } from '../domain/formatters';
import { type GameCommand, type GameResult } from '../game/engine';
import { playSound } from '../game/soundEffects';
import { LeaderboardModal } from './LeaderboardModal';
import { FinanceReportModal } from './FinanceReportModal';
import { getLuckySpinState } from '../game/luckyWheelService';
import { 
  Trophy, 
  FileText, 
  Sparkles, 
  Building2, 
  Factory, 
  TrendingUp, 
  Gavel, 
  Map, 
  Landmark, 
  Gem, 
  Crown, 
  Coins, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Flame, 
  ChevronLeft,
  Briefcase
} from 'lucide-react';

interface DashboardProps {
  profile: PlayerProfile;
  country: CountryDefinition;
  onNavigate: (section: SectionId, target?: string) => void;
  onCommand: (command: GameCommand, fallback: (current: PlayerProfile) => GameResult<unknown>) => void;
  onClaimReward?: (cash: number, diamonds: number, questId: string) => void;
  onRequestEmergencyLoan?: () => void;
  onUpdateProfile?: (updater: (prev: PlayerProfile) => PlayerProfile) => void;
  onOpenLuckyWheel?: () => void;
}

export function Dashboard({ 
  profile, 
  country, 
  onNavigate, 
  onCommand,
  onOpenLuckyWheel,
}: DashboardProps) {
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isFinanceModalOpen, setIsFinanceModalOpen] = useState(false);
  const [spinState, setSpinState] = useState(() => getLuckySpinState(profile.lastSpinTimestamp));

  // Keep countdown updated
  useEffect(() => {
    setSpinState(getLuckySpinState(profile.lastSpinTimestamp));
    const timer = setInterval(() => {
      setSpinState(getLuckySpinState(profile.lastSpinTimestamp));
    }, 1000);
    return () => clearInterval(timer);
  }, [profile.lastSpinTimestamp]);

  const totalAssets = calculateTotalAssets(profile);
  const companyCount = profile.companies.length;
  const landsCount = profile.lands.length;

  // Real recent transactions from ledger
  const recentTransactions = profile.ledger && profile.ledger.length > 0
    ? [...profile.ledger].reverse().slice(0, 4)
    : [
        {
          id: 'initial-setup',
          category: 'revenue',
          amount: profile.bankBalance || 50000,
          occurredAt: new Date().toISOString(),
          note: 'رأس مال التأسيس والتشغيل الأولي',
        },
      ];

  const handleNav = (section: SectionId, target?: string) => {
    playSound('click');
    onNavigate(section, target);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in" dir="rtl">
      {/* 1. Sleek News & Market Ticker Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2 overflow-hidden text-xs sm:text-sm">
          <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-slate-950 font-black text-[11px] shrink-0 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 fill-slate-950" />
            عاجل الأسواق
          </span>
          <span className="text-slate-200 truncate">
            ارتفاع الطلب على المواد الأولية في {country.name} · دورة اليوم {profile.day} بدأت الآن بعوائد استثمارية واعدة
          </span>
        </div>
        <div className="text-[11px] text-amber-300 font-bold shrink-0 hidden sm:block">
          {country.flag} {country.name}
        </div>
      </div>

      {/* 2. Executive Wealth Overview (4 Premium Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Net Worth */}
        <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-4 shadow-xl shadow-amber-950/20 relative overflow-hidden group hover:border-amber-400/80 transition">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition" />
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold">صافي الثروة الإجمالية</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
              <Crown className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <strong className="text-lg sm:text-xl font-black text-amber-400 block tracking-tight">
            {formatMoney(totalAssets, country)}
          </strong>
          <span className="text-[10px] text-slate-400 mt-1 block">
            تقييم الشركات والأراضي والسيولة
          </span>
        </div>

        {/* Bank Cash Balance */}
        <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-4 shadow-xl shadow-emerald-950/20 relative overflow-hidden group hover:border-emerald-400/80 transition">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition" />
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold">السيولة النقدية المتاحة</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <strong className="text-lg sm:text-xl font-black text-emerald-400 block tracking-tight">
            {formatMoney(profile.bankBalance, country)}
          </strong>
          <span className="text-[10px] text-slate-400 mt-1 block">
            جاهزة للمزايدة والتوسع الفوري
          </span>
        </div>

        {/* Pure Gold Bullion */}
        <div className="bg-slate-900/90 border border-yellow-500/40 rounded-2xl p-4 shadow-xl shadow-yellow-950/20 relative overflow-hidden group hover:border-yellow-400/80 transition">
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl group-hover:bg-yellow-500/20 transition" />
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold">احتياطي الذهب الخالص</span>
            <div className="w-8 h-8 rounded-xl bg-yellow-500/20 text-yellow-300 flex items-center justify-center font-bold">
              <Coins className="w-4 h-4 text-yellow-400" />
            </div>
          </div>
          <strong className="text-lg sm:text-xl font-black text-yellow-300 block tracking-tight">
            {(profile.goldGrams ?? 0).toFixed(2)} غرام
          </strong>
          <span className="text-[10px] text-slate-400 mt-1 block">
            ملاذ آمن ضد تقلبات التضخم
          </span>
        </div>

        {/* Diamonds */}
        <div className="bg-slate-900/90 border border-cyan-500/40 rounded-2xl p-4 shadow-xl shadow-cyan-950/20 relative overflow-hidden group hover:border-cyan-400/80 transition">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition" />
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold">رصيد الماس الإمبراطوري</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold">
              <Gem className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <strong className="text-lg sm:text-xl font-black text-cyan-300 block tracking-tight">
            {profile.diamonds ?? 0} 💎
          </strong>
          <span className="text-[10px] text-slate-400 mt-1 block">
            للتسريع والترقيات والفرص النادرة
          </span>
        </div>
      </div>

      {/* 3. Executive Command Operations Bar (Clean Icons with Names Underneath) */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <h3 className="font-extrabold text-sm sm:text-base text-white">
              غرفة العمليات المركزية
            </h3>
            <span className="text-xs text-slate-400 hidden sm:inline">
              (انقر على أيقونة لفتح الخدمة)
            </span>
          </div>
          <span className="text-xs text-amber-400/90 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
            المستوى {profile.level ?? 1} · {profile.name || 'المستثمر الصاعد'}
          </span>
        </div>

        {/* Icons Grid with Names Underneath */}
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-2 sm:gap-3">
          {/* 1. المتصدرون (Opens Leaderboard Modal) */}
          <button
            onClick={() => {
              playSound('click');
              setIsLeaderboardOpen(true);
            }}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-950/60 border border-amber-500/40 hover:border-amber-400 hover:bg-amber-950/30 transition group cursor-pointer shadow-md"
            title="فتح قائمة المتصدرين وقادة الأعمال"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform">
              <Trophy className="w-6 h-6 text-slate-950" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-slate-200 mt-2 text-center group-hover:text-amber-300">
              المتصدرين
            </span>
          </button>

          {/* 2. التقارير المالية (Opens Finance Report Modal) */}
          <button
            onClick={() => {
              playSound('click');
              setIsFinanceModalOpen(true);
            }}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-950/60 border border-emerald-500/40 hover:border-emerald-400 hover:bg-emerald-950/30 transition group cursor-pointer shadow-md"
            title="عرض التقارير المالية وقوائم الأرباح"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
              <FileText className="w-6 h-6 text-slate-950" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-slate-200 mt-2 text-center group-hover:text-emerald-300">
              التقارير المالية
            </span>
          </button>

          {/* 3. عجلة الحظ (Opens Lucky Spin Modal - Free every 50 mins) */}
          <button
            onClick={() => {
              playSound('click');
              onOpenLuckyWheel?.();
            }}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-950/60 border border-yellow-500/40 hover:border-yellow-400 hover:bg-yellow-950/30 transition group cursor-pointer shadow-md relative"
            title="عجلة الحظ والاستثمار - مجانية كل 50 دقيقة"
          >
            {spinState.isFree ? (
              <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white font-extrabold text-[9px] shadow-sm animate-pulse">
                مجاناً
              </span>
            ) : (
              <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-slate-800 text-amber-300 font-bold text-[8px] border border-amber-500/30 font-mono">
                {spinState.formattedCountdown}
              </span>
            )}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center shadow-lg shadow-yellow-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 text-slate-950" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-slate-200 mt-2 text-center group-hover:text-yellow-300">
              عجلة الحظ
            </span>
          </button>

          {/* 4. الشركات */}
          <button
            onClick={() => handleNav('companies')}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition group cursor-pointer shadow-md"
            title="إدارة وتطوير الشركات والمؤسسات"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-slate-200 mt-2 text-center group-hover:text-blue-300">
              الشركات
            </span>
          </button>

          {/* 5. المصانع والإنتاج */}
          <button
            onClick={() => handleNav('production')}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition group cursor-pointer shadow-md"
            title="تشغيل خطوط الإنتاج والتصنيع"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Factory className="w-6 h-6 text-white" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-slate-200 mt-2 text-center group-hover:text-teal-300">
              الإنتاج
            </span>
          </button>

          {/* 6. البورصة والاستثمار */}
          <button
            onClick={() => handleNav('investments')}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition group cursor-pointer shadow-md"
            title="البورصة وأسواق المال والاكتتابات"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-slate-200 mt-2 text-center group-hover:text-purple-300">
              البورصة
            </span>
          </button>

          {/* 7. المزادات */}
          <button
            onClick={() => handleNav('auctions')}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition group cursor-pointer shadow-md"
            title="المزادات العلنية على الأصول والمصانع"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-700 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Gavel className="w-6 h-6 text-white" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-slate-200 mt-2 text-center group-hover:text-orange-300">
              المزادات
            </span>
          </button>

          {/* 8. الأراضي والعقارات */}
          <button
            onClick={() => handleNav('lands')}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition group cursor-pointer shadow-md"
            title="المواقع العقارية وتراخيص البناء"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-green-600 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:scale-105 transition-transform">
              <Map className="w-6 h-6 text-white" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-slate-200 mt-2 text-center group-hover:text-green-300">
              الأراضي
            </span>
          </button>

          {/* 9. البنك والتمويل */}
          <button
            onClick={() => handleNav('bank')}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition group cursor-pointer shadow-md"
            title="البنك، الودائع، والقروض الميسرة"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Landmark className="w-6 h-6 text-white" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-slate-200 mt-2 text-center group-hover:text-sky-300">
              البنك
            </span>
          </button>

          {/* 10. متجر الماس والعروض */}
          <button
            onClick={() => handleNav('store')}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition group cursor-pointer shadow-md"
            title="متجر الماس والبطاقات والباقات الحصرية"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-400 text-white flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Gem className="w-6 h-6 text-white" />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-slate-200 mt-2 text-center group-hover:text-cyan-300">
              المتجر
            </span>
          </button>
        </div>
      </div>

      {/* 4. Balanced Two-Column Operational Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* LEFT COLUMN: Active Companies & Factories Status */}
        <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white">
                    شركاتك الصناعية والتجارية
                  </h3>
                  <small className="text-xs text-slate-400">
                    {companyCount > 0 ? `${companyCount} شركات قيد النشاط والتشغيل` : 'لم يتم تأسيس شركات بعد'}
                  </small>
                </div>
              </div>

              <button
                onClick={() => handleNav('companies')}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition"
              >
                <span>إدارة الكل</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Featured Active Company or Get Started Callout */}
            {profile.companies.length > 0 ? (
              (() => {
                const featured = profile.companies[0];
                const condition = featured.maintenanceCondition ?? 100;
                const level = featured.upgradeLevel ?? 1;
                const cost = featured.operatingCostPerDay ?? 15000;
                return (
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-xl">
                          {featured.industryId.includes('food') ? '🌾' : featured.industryId.includes('energy') ? '⚡' : '🏭'}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-white text-sm">
                            {featured.name}
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            قطاع {featured.industryId} · المستوى {level}
                          </span>
                        </div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                        condition >= 70 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}>
                        كفاءة {condition}%
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs my-3 p-2.5 bg-slate-900 rounded-xl border border-slate-800/80">
                      <div>
                        <span className="text-[10px] text-slate-400 block">التكلفة اليومية</span>
                        <strong className="text-slate-200">{cost.toLocaleString()} {country.currency.code}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">حالة الماكينات</span>
                        <strong className={condition < 50 ? 'text-rose-400' : 'text-emerald-400'}>{condition}%</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">المستوى</span>
                        <strong className="text-amber-400">{level} / 5</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleNav('production')}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition text-center"
                      >
                        تشغيل خط الإنتاج ⚡
                      </button>
                      <button
                        onClick={() => handleNav('companies')}
                        className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition border border-slate-700"
                      >
                        تطوير وصيانة ⚙️
                      </button>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="bg-slate-950/60 border border-dashed border-slate-800 rounded-2xl p-6 text-center my-2">
                <span className="text-3xl block mb-2">🏭</span>
                <h4 className="font-extrabold text-sm text-white mb-1">
                  لا توجد شركات مؤسسة بعد
                </h4>
                <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
                  اختر القطاع المناسب وأطلق أول مشروع استثماري لك لبدء دوران عجلة الأرباح اليومية.
                </p>
                <button
                  onClick={() => handleNav('companies')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-lg transition"
                >
                  تأسيس أول شركة الآن 🚀
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => handleNav('companies')}
            className="w-full mt-3 py-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>تأسيس شركة جديدة والتوسع في قطاعات أخرى</span>
          </button>
        </div>

        {/* RIGHT COLUMN: Recent Financial Movements & Ledger */}
        <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white">
                    آخر المعاملات النقدية
                  </h3>
                  <small className="text-xs text-slate-400">
                    حركة الإيرادات والمصروفات المسجلة
                  </small>
                </div>
              </div>

              <button
                onClick={() => {
                  playSound('click');
                  setIsFinanceModalOpen(true);
                }}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition"
              >
                <span>التقرير التفصيلي</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Transactions List */}
            <div className="space-y-2.5">
              {recentTransactions.map((tx: any) => {
                const isRevenue = tx.category === 'revenue';
                return (
                  <div
                    key={tx.id}
                    className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isRevenue ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {isRevenue ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <strong className="text-xs text-white block">
                          {tx.note || 'عملية مالية'}
                        </strong>
                        <span className="text-[10px] text-slate-500">
                          {new Date(tx.occurredAt).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    </div>

                    <strong className={`font-mono text-xs font-bold ${
                      isRevenue ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {isRevenue ? '+' : '-'} {Number(tx.amount).toLocaleString()} {country.currency.code}
                    </strong>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              الأراضي المسجلة: <strong className="text-white">{landsCount} قطعة</strong>
            </span>
            <button
              onClick={() => handleNav('lands')}
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
            >
              <span>معاينة الأراضي</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Modals for Leaderboard & Financial Reports */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        profile={profile}
        country={country}
      />

      <FinanceReportModal
        isOpen={isFinanceModalOpen}
        onClose={() => setIsFinanceModalOpen(false)}
        profile={profile}
        country={country}
        onNavigate={handleNav}
      />
    </div>
  );
}
