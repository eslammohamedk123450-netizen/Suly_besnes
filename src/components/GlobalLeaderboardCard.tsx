import { useEffect, useState } from 'react';
import { formatNumber } from '../domain/formatters';
import { getGlobalLeaderboard, getVisibleSeasons, type LeaderboardRow } from '../storage/leaderboardRepository';
import { Icon } from './Icon';

const badgeLabels: Record<string, string> = { industrialist: 'الصناعي الصاعد', 'contract-master': 'سيد العقود', 'trusted-partner': 'الشريك الموثوق', 'first-contract': 'أول صفقة موثوقة' };
function formatBadge(key: string | null): string { return key ? (badgeLabels[key] ?? key.replaceAll('-', ' ')) : 'لا توجد شارة ظاهرة بعد'; }

export function GlobalLeaderboardCard() {
  const [seasonTitle, setSeasonTitle] = useState('الموسم الحالي');
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<LeaderboardRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const seasons = await getVisibleSeasons();
        const season = seasons[0];
        if (!season) { if (!cancelled) setUnavailable(true); return; }
        const leaderboard = await getGlobalLeaderboard(season.id, 10, 0);
        if (cancelled) return;
        setSeasonTitle(season.title);
        setRows(leaderboard);
      } catch { if (!cancelled) setUnavailable(true); }
      finally { if (!cancelled) setLoading(false); }
    }
    void load();
    return () => { cancelled = true; };
  }, []);
  return <>
    <section className="surface global-leaderboard-panel" aria-label="المتصدر العالمي">
      <div className="panel-heading"><div><span className="section-kicker">مستخدمون حقيقيون · أعلى 10</span><h2>المتصدر العالمي</h2></div><span className="panel-country"><Icon name="crown" size={14} /> {seasonTitle}</span></div>
      {loading ? <p className="notification-empty">جارٍ تحميل الترتيب...</p> : unavailable ? <p className="notification-empty">المتصدر غير متاح الآن؛ ستبقى بيانات إمبراطوريتك محفوظة محليًا.</p> : rows.length === 0 ? <p className="notification-empty">لم تُسجل نتائج عالمية بعد. كن أول إمبراطور في الموسم.</p> : <div className="leaderboard-list">{rows.map((row) => <button className="leaderboard-row leaderboard-row--button" type="button" key={`${row.rank}-${row.public_name}`} onClick={() => setSelectedPlayer(row)}><span className={`leaderboard-rank leaderboard-rank--${row.rank}`}>{row.rank}</span><span className="leaderboard-player"><strong>{row.public_name}</strong><small>{formatNumber(row.completed_challenges)} تحديات موثقة · اضغط لعرض الملف العام</small></span><b>{formatNumber(row.score)} نقطة</b><Icon name="chevron" size={14} /></button>)}</div>}
    </section>
    {selectedPlayer && <div className="public-profile-backdrop" role="presentation" onClick={() => setSelectedPlayer(null)}><section className="public-profile-modal" role="dialog" aria-modal="true" aria-labelledby="public-profile-title" onClick={(event) => event.stopPropagation()}><button className="public-profile-close" type="button" onClick={() => setSelectedPlayer(null)} aria-label="إغلاق الملف">×</button><div className="public-profile-avatar"><Icon name="user" size={28} /></div><span className="section-kicker">ملف عام · مستخدم حقيقي</span><h2 id="public-profile-title">{selectedPlayer.public_name}</h2><p>بيانات المنافسة العامة فقط، ولا يتم عرض أي رصيد أو بيانات خاصة.</p><div className="public-profile-stats"><div><strong>#{selectedPlayer.rank}</strong><span>الترتيب</span></div><div><strong>{formatNumber(selectedPlayer.score)}</strong><span>نقاط الموسم</span></div><div><strong>{formatNumber(selectedPlayer.completed_challenges)}</strong><span>تحديات موثقة</span></div></div><div className="public-profile-badges"><span>شارة الموسم</span><strong>{formatBadge(selectedPlayer.badge_key)}</strong></div><small className="public-profile-updated">آخر تحديث {new Date(selectedPlayer.updated_at).toLocaleDateString('ar-EG')}</small></section></div>}
  </>;
}
