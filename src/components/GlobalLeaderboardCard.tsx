import { useEffect, useState } from 'react';
import { formatNumber } from '../domain/formatters';
import { getGlobalLeaderboard, getVisibleSeasons, type LeaderboardRow } from '../storage/leaderboardRepository';
import { Icon } from './Icon';

export function GlobalLeaderboardCard() {
  const [seasonTitle, setSeasonTitle] = useState('الموسم الحالي');
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const seasons = await getVisibleSeasons();
        const season = seasons[0];
        if (!season) {
          if (!cancelled) setUnavailable(true);
          return;
        }
        const leaderboard = await getGlobalLeaderboard(season.id, 10, 0);
        if (cancelled) return;
        setSeasonTitle(season.title);
        setRows(leaderboard);
      } catch {
        if (!cancelled) setUnavailable(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  return <section className="surface global-leaderboard-panel" aria-label="المتصدر العالمي"><div className="panel-heading"><div><span className="section-kicker">منافسة موثوقة · أعلى 10</span><h2>المتصدر العالمي</h2></div><span className="panel-country"><Icon name="crown" size={14} /> {seasonTitle}</span></div>{loading ? <p className="notification-empty">جارٍ تحميل الترتيب...</p> : unavailable ? <p className="notification-empty">المتصدر غير متاح الآن؛ ستبقى بيانات إمبراطوريتك محفوظة محليًا.</p> : rows.length === 0 ? <p className="notification-empty">لم تُسجل نتائج عالمية بعد. كن أول إمبراطور في الموسم.</p> : <div className="leaderboard-list">{rows.map((row) => <div className="leaderboard-row" key={`${row.rank}-${row.public_name}`}><span className={`leaderboard-rank leaderboard-rank--${row.rank}`}>{row.rank}</span><span className="leaderboard-player"><strong>{row.public_name}</strong><small>{formatNumber(row.completed_challenges)} تحديات موثقة · آخر تحديث {new Date(row.updated_at).toLocaleDateString('ar-EG')}</small></span><b>{formatNumber(row.score)} نقطة</b></div>)}</div>}</section>;
}
