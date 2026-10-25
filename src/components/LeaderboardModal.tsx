import React, { useState } from 'react';
import { X, Trophy, Crown, Medal, Award, Sparkles, TrendingUp, Users } from 'lucide-react';
import type { PlayerProfile } from '../domain/player';
import { calculateTotalAssets } from '../domain/player';
import type { CountryDefinition } from '../domain/countries';
import { formatNumber } from '../domain/formatters';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  country: CountryDefinition;
}

interface Competitor {
  name: string;
  wealth: number;
  production: number;
  contracts: number;
  avatar: string;
  country: string;
  title: string;
  isPlayer: boolean;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  profile,
  country,
}) => {
  const [activeTab, setActiveTab] = useState<'wealth' | 'production' | 'contracts'>('wealth');

  if (!isOpen) return null;

  const playerTotalAssets = calculateTotalAssets(profile);
  const playerProductionOrders = profile.companies.reduce((sum, c) => sum + (c.upgradeLevel ?? 1) * 12, 5);
  const playerContracts = profile.contracts?.length ?? 3;

  // Real mock + player competitors
  const competitors: Competitor[] = [
    { name: 'صالح ثونة', wealth: 3_500_000, production: 124, contracts: 28, avatar: '👳‍♂️', country: 'مصر', title: 'إمبراطور الصناعة', isPlayer: false },
    { name: 'داوود الهزاع', wealth: 2_850_000, production: 98, contracts: 22, avatar: '👨‍💼', country: 'السعودية', title: 'حوت الأسهم', isPlayer: false },
    { name: 'تقى الشمري', wealth: 2_150_000, production: 85, contracts: 19, avatar: '👩‍💼', country: 'الإمارات', title: 'رائدة التكنولوجيا', isPlayer: false },
    { name: 'فارس الماجد', wealth: 1_650_000, production: 62, contracts: 15, avatar: '🧑‍💼', country: 'الكويت', title: 'عملاق التعدين', isPlayer: false },
    { name: 'سالم الرويس', wealth: 1_250_000, production: 48, contracts: 12, avatar: '🧔', country: 'قطر', title: 'تاجر الموانئ', isPlayer: false },
    { name: 'ياسر المستثمر', wealth: 950_000, production: 36, contracts: 9, avatar: '👨‍💻', country: 'مصر', title: 'مؤسس الشركات', isPlayer: false },
    { name: 'ليلى القاسمي', wealth: 720_000, production: 28, contracts: 7, avatar: '🧕', country: 'الإمارات', title: 'سيدة الأعمال', isPlayer: false },
    { name: 'مريم التنمية', wealth: 550_000, production: 22, contracts: 6, avatar: '👩‍💼', country: 'عمان', title: 'مستثمرة ريادية', isPlayer: false },
  ];

  const allPlayers: Competitor[] = [
    ...competitors,
    {
      name: `${profile.name || 'المستثمر الصاعد'} (أنت)`,
      wealth: playerTotalAssets,
      production: playerProductionOrders,
      contracts: playerContracts,
      avatar: '👑',
      country: country.name,
      title: 'رائد أعمال طموح',
      isPlayer: true,
    },
  ].sort((a, b) => {
    if (activeTab === 'wealth') return b.wealth - a.wealth;
    if (activeTab === 'production') return b.production - a.production;
    return b.contracts - a.contracts;
  });

  const playerRankIndex = allPlayers.findIndex((p) => (p as any).isPlayer);
  const playerRank = playerRankIndex !== -1 ? playerRankIndex + 1 : 1;

  const top3 = allPlayers.slice(0, 3);
  const others = allPlayers.slice(3);

  const getMetricValue = (item: typeof allPlayers[0]) => {
    if (activeTab === 'wealth') return `${item.wealth.toLocaleString()} $`;
    if (activeTab === 'production') return `${item.production} دورة إنتاج`;
    return `${item.contracts} عقود تجارية`;
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in"
      dir="rtl"
      onClick={onClose}
    >
      <div 
        className="relative bg-slate-900 border border-amber-500/40 rounded-3xl max-w-2xl w-full p-5 sm:p-7 text-slate-100 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20 font-black">
              <Trophy className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white">
                  المتصدرون وقادة الأعمال 🏆
                </h3>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                  الموسم الأول
                </span>
              </div>
              <p className="text-xs text-slate-400">
                أقوى رواد الأعمال والمستثمرين في العالم العربي
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="grid grid-cols-3 gap-2 my-4 p-1.5 bg-slate-950/70 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('wealth')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'wealth'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>صافي الثروة</span>
          </button>

          <button
            onClick={() => setActiveTab('production')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'production'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>حجم الإنتاج</span>
          </button>

          <button
            onClick={() => setActiveTab('contracts')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'contracts'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>العقود والصفقات</span>
          </button>
        </div>

        {/* Player Current Standout Card */}
        <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border border-amber-500/50 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center font-black text-sm">
              #{playerRank}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white">
                  {profile.name || 'المستثمر الصاعد'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  أنت
                </span>
              </div>
              <small className="text-xs text-slate-400">
                {country.name} · المستوى {profile.level ?? 1}
              </small>
            </div>
          </div>
          <div className="text-left">
            <span className="text-[10px] text-slate-400 block">إنجازك في هذا التصنيف</span>
            <strong className="text-sm font-black text-amber-400">
              {getMetricValue(allPlayers[playerRankIndex])}
            </strong>
          </div>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 my-2 text-center items-end">
          {/* Rank 2 (Silver) */}
          {top3[1] && (
            <div className={`p-3 rounded-2xl border flex flex-col items-center bg-slate-800/60 ${top3[1].isPlayer ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-slate-700'}`}>
              <div className="text-2xl mb-1">{top3[1].avatar}</div>
              <div className="w-6 h-6 rounded-full bg-slate-400 text-slate-950 flex items-center justify-center font-black text-xs mb-1">
                2
              </div>
              <span className="font-bold text-xs text-white truncate max-w-full">
                {top3[1].name}
              </span>
              <span className="text-[10px] text-slate-400">{top3[1].country}</span>
              <strong className="text-xs text-slate-300 font-bold mt-1">
                {getMetricValue(top3[1])}
              </strong>
            </div>
          )}

          {/* Rank 1 (Gold - Center) */}
          {top3[0] && (
            <div className={`p-4 rounded-2xl border flex flex-col items-center bg-gradient-to-b from-amber-950/60 to-slate-900 ${top3[0].isPlayer ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-amber-500/50 shadow-lg shadow-amber-500/10'}`}>
              <Crown className="w-5 h-5 text-amber-400 mb-0.5 animate-bounce" />
              <div className="text-3xl mb-1">{top3[0].avatar}</div>
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center font-black text-xs mb-1 shadow-md">
                1
              </div>
              <span className="font-extrabold text-xs sm:text-sm text-amber-300 truncate max-w-full">
                {top3[0].name}
              </span>
              <span className="text-[10px] text-slate-400">{top3[0].country}</span>
              <strong className="text-xs sm:text-sm text-amber-400 font-black mt-1">
                {getMetricValue(top3[0])}
              </strong>
            </div>
          )}

          {/* Rank 3 (Bronze) */}
          {top3[2] && (
            <div className={`p-3 rounded-2xl border flex flex-col items-center bg-slate-800/60 ${top3[2].isPlayer ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-slate-700'}`}>
              <div className="text-2xl mb-1">{top3[2].avatar}</div>
              <div className="w-6 h-6 rounded-full bg-amber-700 text-slate-100 flex items-center justify-center font-black text-xs mb-1">
                3
              </div>
              <span className="font-bold text-xs text-white truncate max-w-full">
                {top3[2].name}
              </span>
              <span className="text-[10px] text-slate-400">{top3[2].country}</span>
              <strong className="text-xs text-slate-300 font-bold mt-1">
                {getMetricValue(top3[2])}
              </strong>
            </div>
          )}
        </div>

        {/* Scrollable list for rank 4+ */}
        <div className="flex-1 overflow-y-auto mt-3 space-y-2 pr-1 custom-scrollbar">
          <span className="text-xs text-slate-400 font-bold block mb-1">بقية المتنافسين:</span>
          {others.map((player, idx) => (
            <div 
              key={player.name}
              className={`p-2.5 sm:p-3 rounded-xl flex items-center justify-between border transition ${
                player.isPlayer 
                  ? 'bg-amber-950/40 border-amber-500/60 shadow-md' 
                  : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-center font-bold text-xs text-slate-400">
                  #{idx + 4}
                </span>
                <span className="text-lg">{player.avatar}</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <strong className="text-xs sm:text-sm text-white">
                      {player.name}
                    </strong>
                    {player.isPlayer && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                        أنت
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {player.country} · {player.title}
                  </span>
                </div>
              </div>

              <strong className="text-xs font-bold text-slate-200">
                {getMetricValue(player)}
              </strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
