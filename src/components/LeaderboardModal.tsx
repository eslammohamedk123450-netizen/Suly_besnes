import React, { useEffect, useState } from 'react';
import { X, Trophy, Crown, TrendingUp, ShieldCheck, Star, RefreshCw } from 'lucide-react';
import type { PlayerProfile } from '../domain/player';
import type { CountryDefinition } from '../domain/countries';
import { formatNumber } from '../domain/formatters';
import { getRankedGlobalLeaderboard, getVisibleSeasons, type LeaderboardCategory, type RankedLeaderboardRow } from '../storage/leaderboardRepository';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  country: CountryDefinition;
}

const categories: Array<{ id: LeaderboardCategory; label: string; unit: string; icon: React.ReactNode }> = [
  { id: 'net_worth', label: 'صافي الثروة', unit: 'وحدة', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'prestige', label: 'الهيبة', unit: 'نقطة', icon: <Star className="w-4 h-4" /> },
  { id: 'sovereignty', label: 'السيادة', unit: 'نقطة', icon: <ShieldCheck className="w-4 h-4" /> },
  { id: 'season', label: 'نقاط الموسم', unit: 'نقطة', icon: <Trophy className="w-4 h-4" /> },
];

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose, profile, country }) => {
  const [category, setCategory] = useState<LeaderboardCategory>('net_worth');
  const [rows, setRows] = useState<RankedLeaderboardRow[]>([]);
  const [seasonTitle, setSeasonTitle] = useState('الموسم الحالي');
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const selectedCategory = categories.find((item) => item.id === category) ?? categories[0];

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    let hasLoaded = false;
    const refresh = async () => {
      if (!hasLoaded && !cancelled) setLoading(true);
      try {
        const seasons = await getVisibleSeasons();
        const season = seasons.find((item) => item.status === 'active') ?? seasons[0];
        if (!season) throw new Error('season_not_found');
        const leaderboard = await getRankedGlobalLeaderboard(season.id, category, 10);
        if (cancelled) return;
        setSeasonTitle(season.title);
        setRows(leaderboard);
        setUnavailable(false);
        setLastUpdated(new Date());
        hasLoaded = true;
      } catch {
        if (!cancelled) setUnavailable(true);
      } finally {
        if (!cancelled && !hasLoaded) setLoading(false);
        else if (!cancelled) setLoading(false);
      }
    };
    const onOnline = () => { void refresh(); };
    const onVisible = () => { if (document.visibilityState === 'visible') void refresh(); };
    void refresh();
    const interval = window.setInterval(() => { if (navigator.onLine) void refresh(); }, 15_000);
    window.addEventListener('online', onOnline);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener('online', onOnline);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [isOpen, category, profile, country]);

  if (!isOpen) return null;
  const topRows = rows.filter((row) => row.rank <= 10);
  const playerRank = rows.find((row) => row.is_current_player);
  const metric = (row: RankedLeaderboardRow) => `${formatNumber(row.category_value)} ${selectedCategory.unit}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md" dir="rtl" onClick={onClose}>
      <section className="relative bg-slate-900 border border-amber-500/40 rounded-3xl max-w-2xl w-full p-5 sm:p-7 text-slate-100 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col" role="dialog" aria-modal="true" aria-labelledby="global-leaderboard-title" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 text-slate-950 flex items-center justify-center"><Crown className="w-6 h-6" /></div>
            <div>
              <h2 id="global-leaderboard-title" className="text-lg sm:text-xl font-black text-white">المتصدرون الحقيقيون</h2>
              <p className="text-xs text-slate-400">لاعبون حقيقيون · {seasonTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800" aria-label="إغلاق"><X className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-4 p-1.5 bg-slate-950/70 rounded-2xl border border-slate-800">
          {categories.map((item) => <button key={item.id} onClick={() => setCategory(item.id)} aria-pressed={category === item.id} className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${category === item.id ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>{item.icon}<span>{item.label}</span></button>)}
        </div>

        {playerRank && <div className="mb-3 p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between gap-3">
          <div><strong className="text-white">ترتيبك: #{formatNumber(playerRank.rank)}</strong><small className="block text-slate-400">{profile.name || 'أنت'} · {country.name}</small></div>
          <strong className="text-amber-300 text-sm">{metric(playerRank)}</strong>
        </div>}

        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
          <span>تحديث كل 15 ثانية وعند عودة الاتصال · الهيبة للإنجازات والسيادة للانتشار التجاري.</span>
          <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3" />{lastUpdated ? lastUpdated.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}</span>
        </div>
        <div className="flex-1 min-h-24 overflow-y-auto space-y-2">
          {loading && rows.length === 0 ? <p className="text-center text-slate-400 py-8">جارٍ تحميل ترتيب اللاعبين...</p> : unavailable && rows.length === 0 ? <p className="text-center text-slate-400 py-8">تعذر الاتصال الآن. حاول مجدداً عند عودة الإنترنت.</p> : topRows.length === 0 ? <p className="text-center text-slate-400 py-8">لا توجد نتائج مسجلة لهذا التصنيف بعد.</p> : topRows.map((row) => <div key={`${row.rank}-${row.public_name}`} className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${row.is_current_player ? 'bg-amber-950/40 border-amber-500/60' : 'bg-slate-800/50 border-slate-700/70'}`}>
            <div className="flex items-center gap-3 min-w-0"><span className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-black text-sm ${row.rank === 1 ? 'bg-amber-400 text-slate-950' : row.rank === 2 ? 'bg-slate-300 text-slate-950' : row.rank === 3 ? 'bg-amber-700 text-white' : 'bg-slate-700 text-slate-200'}`}>{formatNumber(row.rank)}</span><div className="min-w-0"><strong className="block truncate text-sm text-white">{row.public_name}{row.is_current_player ? ' · أنت' : ''}</strong><small className="text-slate-400">المستوى {formatNumber(row.player_level)} · {formatNumber(row.company_count)} شركات</small></div></div>
            <strong className="shrink-0 text-sm text-amber-300">{metric(row)}</strong>
          </div>)}
          {unavailable && rows.length > 0 && <p className="text-center text-xs text-amber-300 py-2">انقطع الاتصال؛ تعرض آخر نتائج تم تحميلها.</p>}
          {playerRank && playerRank.rank > 10 && <p className="text-center text-xs text-slate-400 py-2">ترتيبك الحالي خارج العشرة الأوائل: #{formatNumber(playerRank.rank)}</p>}
        </div>
      </section>
    </div>
  );
};
