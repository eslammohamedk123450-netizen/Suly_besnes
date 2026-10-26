import React, { useState, useEffect } from 'react';
import type { CountryDefinition } from '../domain/countries';
import { type PlayerProfile, calculateTotalAssets } from '../domain/player';
import type { SectionId } from '../domain/navigation';
import { formatMoney } from '../domain/formatters';
import { type GameCommand, type GameResult } from '../game/engine';
import { playSound } from '../game/soundEffects';
import { LeaderboardModal } from './LeaderboardModal';
import { FinanceReportModal } from './FinanceReportModal';
import { SmartOnboardingQuests } from './SmartOnboardingQuests';
import { getLuckySpinState } from '../game/luckyWheelService';
import { getCountryScenario, type CountryStoryQuest } from '../game/countryScenarios';
import {
  isSectionUnlocked,
  getSectionRequiredLevel,
  getSectionUnlockHint,
} from '../game/onboarding';
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
  Flame,
  ChevronLeft,
  Briefcase,
  Users,
  Package,
  Cpu,
  Globe,
  Award,
  Shield,
  Anchor,
  Rocket,
  Lock,
  BookOpen,
  Store,
  Target,
} from 'lucide-react';
import { StrategicPillarsModal } from './StrategicPillarsModal';
import { acceptBotMarketOffer } from '../game/economyBots';

interface DashboardProps {
  profile: PlayerProfile;
  country: CountryDefinition;
  onNavigate: (section: SectionId, target?: string) => void;
  onCommand: (command: GameCommand, fallback: (current: PlayerProfile) => GameResult<unknown>) => void;
  onClaimReward?: (cash: number, diamonds: number, questId: string) => void;
  onUpdateProfile?: (updater: (prev: PlayerProfile) => PlayerProfile) => void;
  onOpenLuckyWheel?: () => void;
  onOpenTutorial?: () => void;
  onOpenCampaignHub?: () => void;
  onOpenMorningReport?: () => void;
  onOpenCentralBank?: () => void;
  onOpenPrestige?: () => void;
  onOpenStrategicPillars?: () => void;
  onMarkBriefingSeen?: (questId: string) => void;
  onStartGuidedWalkthrough?: (quest: CountryStoryQuest) => void;
}

interface CommandItem {
  id: string;
  title: string;
  category: 'core' | 'expansion' | 'special';
  sectionId?: SectionId;
  icon: React.ReactNode;
  gradient: string;
  requiredLevel: number;
  isUnlocked: boolean;
  hint: string;
}

export function Dashboard({
  profile,
  country,
  onNavigate,
  onCommand,
  onClaimReward,
  onOpenLuckyWheel,
  onOpenTutorial,
  onOpenCampaignHub,
  onOpenMorningReport,
  onOpenCentralBank,
  onOpenPrestige,
  onOpenStrategicPillars,
  onMarkBriefingSeen,
  onStartGuidedWalkthrough,
}: DashboardProps) {
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isFinanceModalOpen, setIsFinanceModalOpen] = useState(false);
  const [isStrategicPillarsOpen, setIsStrategicPillarsOpen] = useState(false);
  const [spinState, setSpinState] = useState(() => getLuckySpinState(profile.lastSpinTimestamp));
  const [opsFilter, setOpsFilter] = useState<'all' | 'available' | 'core' | 'expansion'>('all');
  const [lockedGateModal, setLockedGateModal] = useState<{
    title: string;
    sectionId: SectionId;
    requiredLevel: number;
    hint: string;
  } | null>(null);

  const scenario = getCountryScenario(country.id);

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
          amount: profile.bankBalance || 25_000,
          occurredAt: new Date().toISOString(),
          note: 'رأس مال التأسيس والتشغيل الأولي',
        },
      ];

  const openLockedGate = (title: string, sectionId: SectionId) => {
    playSound('click');
    setLockedGateModal({
      title,
      sectionId,
      requiredLevel: getSectionRequiredLevel(sectionId),
      hint: getSectionUnlockHint(profile, sectionId),
    });
  };

  const handleNav = (section: SectionId, target?: string) => {
    if (!isSectionUnlocked(profile, section)) {
      openLockedGate(section, section);
      return;
    }
    playSound('click');
    onNavigate(section, target);
  };

  const bankUnlocked = isSectionUnlocked(profile, 'bank');
  const territoryUnlocked = isSectionUnlocked(profile, 'territory');
  const prestigeUnlocked = isSectionUnlocked(profile, 'luxury');
  const reportsUnlocked = isSectionUnlocked(profile, 'reports');

  // Build the complete Command Operations items with story unlock levels
  const commandItems: CommandItem[] = [
    {
      id: 'leaderboard',
      title: 'المتصدرين',
      category: 'special',
      icon: <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950" />,
      gradient: 'bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400',
      requiredLevel: 1,
      isUnlocked: true,
      hint: 'متاح للجميع لمتابعة تصنيف كبار المستثمرين عالمياً.',
    },
    {
      id: 'lucky_wheel',
      title: 'عجلة الحظ',
      category: 'special',
      icon: <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950" />,
      gradient: 'bg-gradient-to-tr from-amber-500 to-yellow-400',
      requiredLevel: 1,
      isUnlocked: true,
      hint: 'فرصة دوران مجانية كل 50 دقيقة لدعم السيولة والذهب.',
    },
    {
      id: 'story_campaign',
      title: 'مسار المهام',
      category: 'special',
      icon: <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950" />,
      gradient: 'bg-gradient-to-tr from-amber-500 to-yellow-300',
      requiredLevel: 1,
      isUnlocked: true,
      hint: 'استعراض مسار المهام الوطنية وتحديات بناء الإمبراطورية.',
    },
    {
      id: 'companies',
      title: 'الشركات',
      category: 'core',
      sectionId: 'companies',
      icon: <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />,
      gradient: 'bg-gradient-to-tr from-blue-600 to-indigo-500',
      requiredLevel: 1,
      isUnlocked: isSectionUnlocked(profile, 'companies'),
      hint: getSectionUnlockHint(profile, 'companies'),
    },
    {
      id: 'lands',
      title: 'الأراضي',
      category: 'core',
      sectionId: 'lands',
      icon: <Map className="w-5 h-5 sm:w-6 sm:h-6 text-white" />,
      gradient: 'bg-gradient-to-tr from-green-600 to-emerald-600',
      requiredLevel: 1,
      isUnlocked: isSectionUnlocked(profile, 'lands'),
      hint: getSectionUnlockHint(profile, 'lands'),
    },
    {
      id: 'auctions',
      title: 'المزادات',
      category: 'core',
      sectionId: 'auctions',
      icon: <Gavel className="w-5 h-5 sm:w-6 sm:h-6 text-white" />,
      gradient: 'bg-gradient-to-tr from-amber-700 to-orange-500',
      requiredLevel: 1,
      isUnlocked: isSectionUnlocked(profile, 'auctions'),
      hint: getSectionUnlockHint(profile, 'auctions'),
    },
    {
      id: 'tasks',
      title: 'المهام اليومية',
      category: 'core',
      sectionId: 'tasks',
      icon: <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />,
      gradient: 'bg-gradient-to-tr from-yellow-600 to-amber-500',
      requiredLevel: 1,
      isUnlocked: isSectionUnlocked(profile, 'tasks'),
      hint: getSectionUnlockHint(profile, 'tasks'),
    },
    {
      id: 'obligations',
      title: 'الالتزامات والرواتب',
      category: 'core',
      sectionId: 'obligations',
      icon: <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />,
      gradient: 'bg-gradient-to-tr from-rose-600 to-orange-500',
      requiredLevel: 1,
      isUnlocked: isSectionUnlocked(profile, 'obligations'),
      hint: getSectionUnlockHint(profile, 'obligations'),
    },
    {
      id: 'strategic_pillars',
      title: 'المحاور الاستراتيجية',
      category: 'core',
      sectionId: 'home',
      icon: <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />,
      gradient: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600',
      requiredLevel: 1,
      isUnlocked: true,
      hint: 'أرباح الغياب · السياسة النقدية · التنافس الإقليمي · الصندوق السيادي',
    },
    {
      id: 'store',
      title: 'المتجر',
      category: 'core',
      sectionId: 'store',
      icon: <Gem className="w-5 h-5 sm:w-6 sm:h-6 text-white" />,
      gradient: 'bg-gradient-to-tr from-cyan-600 to-blue-400',
      requiredLevel: 1,
      isUnlocked: isSectionUnlocked(profile, 'store'),
      hint: getSectionUnlockHint(profile, 'store'),
    },
    {
      id: 'production',
      title: 'الإنتاج والمصانع',
      category: 'core',
      sectionId: 'production',
      icon: <Factory className="w-5 h-5 sm:w-6 sm:h-6 text-white" />,
      gradient: 'bg-gradient-to-tr from-teal-600 to-emerald-500',
      requiredLevel: 2,
      isUnlocked: isSectionUnlocked(profile, 'production'),
      hint: getSectionUnlockHint(profile, 'production'),
    },
    {
      id: 'inventory',
      title: 'السوق',
      category: 'core',
      sectionId: 'inventory',
      icon: <Store className="w-5 h-5 sm:w-6 sm:h-6 text-white" />,
      gradient: 'bg-gradient-to-tr from-emerald-600 to-teal-600',
      requiredLevel: 2,
      isUnlocked: isSectionUnlocked(profile, 'inventory'),
      hint: getSectionUnlockHint(profile, 'inventory'),
    },
    {
      id: 'contracts',
      title: 'العقود والعملاء',
      category: 'core',
      sectionId: 'contracts',
      icon: <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-white" />,
      gradient: 'bg-gradient-to-tr from-emerald-600 to-green-500',
      requiredLevel: 3,
      isUnlocked: isSectionUnlocked(profile, 'contracts'),
      hint: getSectionUnlockHint(profile, 'contracts'),
    },
    {
      id: 'bank',
      title: 'البنك والتمويل',
      category: 'core',
      sectionId: 'bank',
      icon: <Landmark className="w-5 h-5 sm:w-6 sm:h-6 text-white" />,
      gradient: 'bg-gradient-to-tr from-sky-600 to-blue-500',
      requiredLevel: 4,
      isUnlocked: bankUnlocked,
      hint: getSectionUnlockHint(profile, 'bank'),
    },
    {
      id: 'investments',
      title: 'البورصة والأسهم',
      category: 'core',
      sectionId: 'investments',
      icon: <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />,
      gradient: 'bg-gradient-to-tr from-purple-600 to-pink-500',
      requiredLevel: 5,
      isUnlocked: isSectionUnlocked(profile, 'investments'),
      hint: getSectionUnlockHint(profile, 'investments'),
    },
    {
      id: 'finance_modal',
      title: 'التقارير المالية',
      category: 'core',
      sectionId: 'reports',
      icon: <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />,
      gradient: 'bg-gradient-to-tr from-emerald-600 to-teal-400',
      requiredLevel: 5,
      isUnlocked: reportsUnlocked,
      hint: getSectionUnlockHint(profile, 'reports'),
    },
    {
      id: 'staff',
      title: 'الموظفون والإدارة',
      category: 'core',
      sectionId: 'staff',
      icon: <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />,
      gradient: 'bg-gradient-to-tr from-violet-600 to-indigo-500',
      requiredLevel: 5,
      isUnlocked: isSectionUnlocked(profile, 'staff'),
      hint: getSectionUnlockHint(profile, 'staff'),
    },
    {
      id: 'tech_tree',
      title: 'الأبحاث والأتمتة',
      category: 'expansion',
      sectionId: 'tech_tree',
      icon: <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-white" />,
      gradient: 'bg-gradient-to-tr from-cyan-600 to-teal-500',
      requiredLevel: 6,
      isUnlocked: isSectionUnlocked(profile, 'tech_tree'),
      hint: getSectionUnlockHint(profile, 'tech_tree'),
    },
    {
      id: 'territory',
      title: 'السيطرة الإقليمية',
      category: 'expansion',
      sectionId: 'territory',
      icon: <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-white" />,
      gradient: 'bg-gradient-to-tr from-blue-700 to-cyan-500',
      requiredLevel: 7,
      isUnlocked: territoryUnlocked,
      hint: getSectionUnlockHint(profile, 'territory'),
    },
    {
      id: 'luxury',
      title: 'الهيبة والرفاهية',
      category: 'expansion',
      sectionId: 'luxury',
      icon: <Award className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950" />,
      gradient: 'bg-gradient-to-tr from-yellow-500 to-amber-300',
      requiredLevel: 8,
      isUnlocked: prestigeUnlocked,
      hint: getSectionUnlockHint(profile, 'luxury'),
    },
    {
      id: 'cartel',
      title: 'الكارتيل والتحالف',
      category: 'expansion',
      sectionId: 'cartel',
      icon: <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />,
      gradient: 'bg-gradient-to-tr from-rose-700 to-red-500',
      requiredLevel: 9,
      isUnlocked: isSectionUnlocked(profile, 'cartel'),
      hint: getSectionUnlockHint(profile, 'cartel'),
    },
    {
      id: 'maritime',
      title: 'الأسطول والشحن',
      category: 'expansion',
      sectionId: 'maritime',
      icon: <Anchor className="w-5 h-5 sm:w-6 sm:h-6 text-white" />,
      gradient: 'bg-gradient-to-tr from-indigo-700 to-blue-600',
      requiredLevel: 10,
      isUnlocked: isSectionUnlocked(profile, 'maritime'),
      hint: getSectionUnlockHint(profile, 'maritime'),
    },
    {
      id: 'megaprojects',
      title: 'المناقصات الكبرى',
      category: 'expansion',
      sectionId: 'megaprojects',
      icon: <Landmark className="w-5 h-5 sm:w-6 sm:h-6 text-white" />,
      gradient: 'bg-gradient-to-tr from-emerald-700 to-teal-600',
      requiredLevel: 12,
      isUnlocked: isSectionUnlocked(profile, 'megaprojects'),
      hint: getSectionUnlockHint(profile, 'megaprojects'),
    },
    {
      id: 'incubator',
      title: 'حاضنات الـ VC',
      category: 'expansion',
      sectionId: 'incubator',
      icon: <Rocket className="w-5 h-5 sm:w-6 sm:h-6 text-white" />,
      gradient: 'bg-gradient-to-tr from-purple-700 to-pink-600',
      requiredLevel: 15,
      isUnlocked: isSectionUnlocked(profile, 'incubator'),
      hint: getSectionUnlockHint(profile, 'incubator'),
    },
  ];

  const availableCount = commandItems.filter((item) => item.isUnlocked).length;

  const filteredItems = commandItems.filter((item) => {
    if (opsFilter === 'available') return item.isUnlocked;
    if (opsFilter === 'core') return item.category === 'core' || item.category === 'special';
    if (opsFilter === 'expansion') return item.category === 'expansion';
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in" dir="rtl">
      {/* 1. Sleek News, Country Scenario & Campaign Map Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 rounded-2xl p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2 overflow-hidden text-xs sm:text-sm min-w-0">
          <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-slate-950 font-black text-[11px] shrink-0 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 fill-slate-950" />
            {scenario.scenarioTitle}
          </span>
          <span className="text-slate-200 truncate">
            {scenario.economicProfile.headline} · دورة اليوم {profile.day} في أسواق {country.name}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onOpenCampaignHub && (
            <button
              type="button"
              onClick={() => {
                playSound('click');
                onOpenCampaignHub();
              }}
              className="px-3 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>فصول القصة والمنافسون</span>
            </button>
          )}
          {onOpenTutorial && (
            <button
              type="button"
              onClick={() => {
                playSound('click');
                onOpenTutorial();
              }}
              className="px-2.5 py-1 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition cursor-pointer whitespace-nowrap"
            >
              مقدمة {country.name}
            </button>
          )}
        </div>
      </div>

      {/* 2. Executive Wealth Overview (4 Premium Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-4 shadow-xl shadow-amber-950/20 relative overflow-hidden group hover:border-amber-400/80 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold">صافي الثروة الإجمالية</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
              <Crown className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <strong className="text-lg sm:text-xl font-black text-amber-400 block tracking-tight tabular-nums">
            {formatMoney(totalAssets, country)}
          </strong>
          <span className="text-[10px] text-slate-400 mt-1 block">
            تقييم الشركات والأراضي والسيولة
          </span>
        </div>

        <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-4 shadow-xl shadow-emerald-950/20 relative overflow-hidden group hover:border-emerald-400/80 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold">السيولة النقدية المتاحة</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <strong className="text-lg sm:text-xl font-black text-emerald-400 block tracking-tight tabular-nums">
            {formatMoney(profile.bankBalance, country)}
          </strong>
          <span className="text-[10px] text-slate-400 mt-1 block">
            جاهزة للتشغيل والتوسع الفوري
          </span>
        </div>

        <div className="bg-slate-900/90 border border-yellow-500/40 rounded-2xl p-4 shadow-xl shadow-yellow-950/20 relative overflow-hidden group hover:border-yellow-400/80 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold">احتياطي الذهب الخالص</span>
            <div className="w-8 h-8 rounded-xl bg-yellow-500/20 text-yellow-300 flex items-center justify-center font-bold">
              <Coins className="w-4 h-4 text-yellow-400" />
            </div>
          </div>
          <strong className="text-lg sm:text-xl font-black text-yellow-300 block tracking-tight tabular-nums">
            {(profile.goldGrams ?? 0).toFixed(2)} غرام
          </strong>
          <span className="text-[10px] text-slate-400 mt-1 block">
            ملاذ آمن ضد تقلبات التضخم
          </span>
        </div>

        <div className="bg-slate-900/90 border border-cyan-500/40 rounded-2xl p-4 shadow-xl shadow-cyan-950/20 relative overflow-hidden group hover:border-cyan-400/80 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold">رصيد الماس الإمبراطوري</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold">
              <Gem className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <strong className="text-lg sm:text-xl font-black text-cyan-300 block tracking-tight tabular-nums">
            {profile.diamonds ?? 0} 💎
          </strong>
          <span className="text-[10px] text-slate-400 mt-1 block">
            للتسريع والترقيات والفرص النادرة
          </span>
        </div>
      </div>

      {/* 2.1. Country-Specific Story Quests & Practical Guidance */}
      <SmartOnboardingQuests
        profile={profile}
        onNavigate={handleNav}
        onClaimReward={(cash, diamonds, questId) => onClaimReward?.(cash, diamonds, questId)}
        onMarkBriefingSeen={onMarkBriefingSeen}
        onStartGuidedWalkthrough={onStartGuidedWalkthrough}
      />

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
                type="button"
                onClick={() => handleNav('companies')}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <span>إدارة الكل</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {profile.companies.length > 0 ? (
              (() => {
                const featured = profile.companies[0];
                const condition = featured.maintenanceCondition ?? 100;
                const level = featured.upgradeLevel ?? 1;
                const cost = featured.operatingCostPerDay ?? 80;
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
                      <span className={`text-xs font-bold ${
                        condition >= 70 ? 'text-emerald-300' : 'text-rose-300'
                      }`}>
                        كفاءة {condition}%
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs my-3 p-2.5 bg-slate-900 rounded-xl border border-slate-800/80">
                      <div>
                        <span className="text-[10px] text-slate-400 block">التكلفة اليومية</span>
                        <strong className="text-slate-200 tabular-nums">{formatMoney(cost, country)}</strong>
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
                        type="button"
                        onClick={() => handleNav('production')}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition text-center cursor-pointer"
                      >
                        تشغيل خط الإنتاج ⚡
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNav('companies')}
                        className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition border border-slate-700 cursor-pointer"
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
                  ابدأ مسار استعادة الإرث: اشترِ أول قطعة أرض صناعية وأسس شركتك الأولى لتبدأ دورة الإنتاج.
                </p>
                <button
                  type="button"
                  onClick={() => handleNav('companies')}
                  className="py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition active:scale-95 cursor-pointer"
                >
                  تأسيس شركتك الأولى الآن 🚀
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              الإنتاج الفعال: <strong className="text-white">{profile.productionOrders.filter((o) => o.status === 'active').length} دفعات</strong>
            </span>
            <button
              type="button"
              onClick={() => handleNav('production')}
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>متابعة خطوط الإنتاج</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Recent Financial Activity & Quick Actions */}
        <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white">
                    سجل المعاملات والسيولة
                  </h3>
                  <small className="text-xs text-slate-400">
                    آخر العمليات المسجلة في دفتر حسابك
                  </small>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!reportsUnlocked) {
                    openLockedGate('التقارير المالية المتقدمة', 'reports');
                    return;
                  }
                  playSound('click');
                  setIsFinanceModalOpen(true);
                }}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <span>{reportsUnlocked ? 'التقرير المفصل' : 'التقارير (مستوى 5)'}</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5 mb-4">
              {recentTransactions.map((tx, idx) => {
                const isPositive = tx.category === 'revenue';
                return (
                  <div
                    key={tx.id || idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${
                        isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {isPositive ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white leading-tight">
                          {tx.note || 'معاملة تشغيلية'}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(tx.occurredAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <strong className={`text-xs font-black dir-ltr tabular-nums ${
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {isPositive ? '+' : '-'}{formatMoney(Math.abs(tx.amount), country)}
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
              type="button"
              onClick={() => handleNav('lands')}
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
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

      {reportsUnlocked && (
        <FinanceReportModal
          isOpen={isFinanceModalOpen}
          onClose={() => setIsFinanceModalOpen(false)}
          profile={profile}
          country={country}
          onNavigate={handleNav}
        />
      )}

      {isStrategicPillarsOpen && (
        <StrategicPillarsModal
          isOpen={isStrategicPillarsOpen}
          onClose={() => setIsStrategicPillarsOpen(false)}
          profile={profile}
          country={country}
          onNavigate={handleNav}
          onAcceptBotOffer={(offerId) => {
            onCommand?.(
              { name: 'accept_bot_offer', args: { offerId } },
              (curr) => acceptBotMarketOffer(curr, offerId),
            );
          }}
        />
      )}

      {/* 6. Story Level Locked Gate Modal */}
      {lockedGateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in" dir="rtl">
          <div className="bg-slate-900 border border-amber-500/50 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border-2 border-amber-500/50 text-amber-400 mx-auto flex items-center justify-center text-3xl shadow-xl shadow-amber-500/20">
              🔒
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                نظام {lockedGateModal.title} مقفل
              </h3>
              <span className="inline-block mt-1 text-amber-300 text-xs font-black">
                يفتح عند بلوغ المستوى {lockedGateModal.requiredLevel} أو تحقق شرط القصة
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-right">
              📖 <strong>شرط سيناريو القصة:</strong>
              <br />
              <span className="text-slate-400 mt-1 block">
                {lockedGateModal.hint}
              </span>
            </p>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setLockedGateModal(null);
                  handleNav('tasks');
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs shadow-md hover:brightness-110 transition active:scale-95 cursor-pointer"
              >
                عرض مهام القصة 📜
              </button>
              <button
                type="button"
                onClick={() => setLockedGateModal(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
