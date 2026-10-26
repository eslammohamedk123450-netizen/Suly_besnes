import { useEffect, useState } from 'react';
import { formatNumber } from '../domain/formatters';
import { getRankedGlobalLeaderboard, getVisibleSeasons, type LeaderboardCategory, type RankedLeaderboardRow } from '../storage/leaderboardRepository';
import { Icon } from './Icon';

const categories: Array<{ id: LeaderboardCategory; label: string; unit: string }> = [
  { id: 'net_worth', label: 'صافي الثروة', unit: 'وحدة' },
  { id: 'prestige', label: 'الهيبة', unit: 'نقطة' },
  { id: 'sovereignty', label: 'السيادة', unit: 'نقطة' },
  { id: 'season', label: 'الموسم', unit: 'نقطة' },
  { id: 'production', label: 'الإنتاج', unit: 'عملية إنتاج' },
  { id: 'contracts', label: 'العقود', unit: 'عقد مكتمل' },
];

const badgeLabels: Record<string, string> = { industrialist: 'الصناعي الصاعد', 'contract-master': 'سيد العقود', 'trusted-partner': 'الشريك الموثوق', 'first-contract': 'أول صفقة موثوقة' };
function formatBadge(key: string | null): string { return key ? (badgeLabels[key] ?? key.replaceAll('-', ' ')) : 'لا توجد شارة موسم بعد'; }

export function GlobalLeaderboardCard() {
  const [seasonTitle, setSeasonTitle] = useState('الموسم الحالي');
  const [category, setCategory] = useState<LeaderboardCategory>('points');
  const [rows, setRows] = useState<RankedLeaderboardRow[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<RankedLeaderboardRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const selectedCategory = categories.find((item) => item.id === category) ?? categories[0];

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setUnavailable(false);
      try {
        const seasons = await getVisibleSeasons();
        const season = seasons[0];
        if (!season) {
          if (!cancelled) {
            setUnavailable(true);
            setRows([]);
          }
          return;
        }
        const leaderboard = await getRankedGlobalLeaderboard(season.id, category, 10);
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
  }, [category]);

  const topRows = rows.filter((row) => row.rank <= 10);
  const playerOutsideTopTen = rows.find((row) => row.is_current_player && row.rank > 10);
  const renderRow = (row: RankedLeaderboardRow) => <button className={`leaderboard-row leaderboard-row--button${row.is_current_player ? ' leaderboard-row--current' : ''}`} type="button" key={`${row.rank}-${row.public_name}`} onClick={() => setSelectedPlayer(row)}>
    <span className={`leaderboard-rank leaderboard-rank--${row.rank}`}>{formatNumber(row.rank)}</span>
    <span className="leaderboard-player"><strong>{row.public_name}{row.is_current_player ? ' · أنت' : ''}</strong><small>{row.is_current_player ? 'مركزك الحالي · ' : ''}المستوى {formatNumber(row.player_level)} · {formatNumber(row.company_count)} شركات · {formatNumber(row.land_count)} أراضٍ</small></span>
    <b>{formatNumber(row.category_value)} {selectedCategory.unit}</b>
    <Icon name="chevron" size={14} />
  </button>;

  return <>
    <section className="surface global-leaderboard-panel" aria-label="المتصدرون العالميون">
      <div className="panel-heading"><div><span className="section-kicker">مستخدمون حقيقيون · أعلى 10</span><h2>المتصدرون العالميون</h2></div><span className="panel-country"><Icon name="crown" size={14} /> {seasonTitle}</span></div>
      <div className="leaderboard-categories" role="group" aria-label="تصنيف المتصدرين">{categories.map((item) => <button className={`leaderboard-category${category === item.id ? ' leaderboard-category--active' : ''}`} type="button" key={item.id} aria-pressed={category === item.id} onClick={() => { setCategory(item.id); setSelectedPlayer(null); }}>{item.label}</button>)}</div>
      {loading ? <p className="notification-empty">جارٍ تحميل الترتيب...</p> : unavailable ? <p className="notification-empty">المتصدر غير متاح الآن؛ ستبقى بيانات إمبراطوريتك محفوظة.</p> : topRows.length === 0 ? <p className="notification-empty">لم تُسجل نتائج عامة في هذا التصنيف بعد.</p> : <>
        <div className="leaderboard-list">{topRows.map(renderRow)}</div>
        {playerOutsideTopTen && <div className="leaderboard-own-position"><span>مركزك الحالي خارج أعلى 10 ويظهر لك وحدك</span>{renderRow(playerOutsideTopTen)}</div>}
      </>}
    </section>
    {selectedPlayer && <div className="public-profile-backdrop" role="presentation" onClick={() => setSelectedPlayer(null)}><section className="public-profile-modal" role="dialog" aria-modal="true" aria-labelledby="public-profile-title" onClick={(event) => event.stopPropagation()}><button className="public-profile-close" type="button" onClick={() => setSelectedPlayer(null)} aria-label="إغلاق الملف">×</button><div className="public-profile-avatar"><Icon name="user" size={28} /></div><span className="section-kicker">ملف عام · مستخدم حقيقي</span><h2 id="public-profile-title">{selectedPlayer.public_name}</h2><p>يعرض هذا الملف معلومات عامة آمنة فقط، دون أي أرصدة أو أصول مالية أو تفاصيل خاصة.</p><div className="public-profile-stats"><div><strong>#{formatNumber(selectedPlayer.rank)}</strong><span>المركز في {selectedCategory.label}</span></div><div><strong>{formatNumber(selectedPlayer.category_value)}</strong><span>{selectedCategory.unit}</span></div><div><strong>{formatNumber(selectedPlayer.score)}</strong><span>نقطة الموسم</span></div></div><div className="public-profile-stats public-profile-stats--details"><div><strong>{formatNumber(selectedPlayer.player_level)}</strong><span>المستوى</span></div><div><strong>{formatNumber(selectedPlayer.company_count)}</strong><span>الشركات</span></div><div><strong>{formatNumber(selectedPlayer.land_count)}</strong><span>الأراضي</span></div><div><strong>{formatNumber(selectedPlayer.badge_count)}</strong><span>الشارات</span></div></div><div className="public-profile-badges"><span>شارة الموسم</span><strong>{formatBadge(selectedPlayer.badge_key)}</strong></div><small className="public-profile-updated">آخر تحديث {new Date(selectedPlayer.updated_at).toLocaleDateString('ar-EG')}</small></section></div>}
  </>;
}
