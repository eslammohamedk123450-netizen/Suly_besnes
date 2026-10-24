import type { CountryDefinition } from '../domain/countries';
import type { PlayerProfile } from '../domain/player';
import type { SectionId } from '../domain/navigation';
import { formatGold, formatMoney, formatNumber } from '../domain/formatters';
import { getPlayerProgress, getStarterMissions } from '../game/onboarding';
import { Icon } from './Icon';
import { useDaySpeedCard, type GameCommand, type GameResult } from '../game/engine';

export type ResourceSyncState = 'synced' | 'syncing' | 'offline' | 'blocked' | 'local';

interface ResourceBarProps {
  profile: PlayerProfile;
  country: CountryDefinition;
  onNavigate: (section: SectionId) => void;
  syncState: ResourceSyncState;
  pendingCommandCount: number;
  onCommand: (command: GameCommand, fallback: (current: PlayerProfile) => GameResult<unknown>) => void;
}

export function ResourceBar({ profile, country, onNavigate, syncState, pendingCommandCount, onCommand }: ResourceBarProps) {
  const progress = getPlayerProgress(profile);
  const missionsLeft = getStarterMissions(profile).filter((mission) => !mission.completed).length;
  const progressPercent = Math.min(100, (progress.experienceInLevel / progress.experienceForNextLevel) * 100);
  const daySpeedCards = profile.speedCards.find((card) => card.kind === 'day-speed-2x')?.quantity ?? 0;
  const daySpeedActive = (profile.activeDaySpeedMultiplier ?? 1) > 1;
  const syncCopy: Record<ResourceSyncState, { title: string; detail: string }> = {
    local: { title: 'لعب محلي', detail: 'محفوظ على الجهاز' },
    synced: { title: 'المزامنة جاهزة', detail: 'حفظ تلقائي مباشر' },
    syncing: { title: 'جارٍ المزامنة', detail: pendingCommandCount ? `${formatNumber(pendingCommandCount)} أوامر` : 'تحديث العالم' },
    offline: { title: 'تلعب دون اتصال', detail: pendingCommandCount ? `${formatNumber(pendingCommandCount)} تنتظر الشبكة` : 'الحفظ محلي' },
    blocked: { title: 'المزامنة متوقفة', detail: `${formatNumber(pendingCommandCount)} تحتاج مراجعة` },
  };

  return (
    <section className="resource-bar" aria-label="موارد الإمبراطورية وتقدم اللاعب">
      <div className="resource-bar-head">
        <div className="resource-level" aria-label={`المستوى ${formatNumber(progress.level)}`}>
          <span className="resource-level-emblem"><Icon name="crown" size={19} /></span>
          <span className="resource-level-copy">
            <span className="resource-level-line"><strong>المستوى {formatNumber(progress.level)}</strong><small>{formatNumber(progress.experienceInLevel)} / {formatNumber(progress.experienceForNextLevel)} خبرة</small></span>
            <span className="resource-experience-track"><span style={{ width: `${progressPercent}%` }} /></span>
          </span>
        </div>
        <div className={`resource-sync resource-sync--${syncState}`} role="status" aria-live="polite">
          <span className="resource-sync-dot" aria-hidden="true" />
          <span><small>{syncCopy[syncState].title}</small><strong>{syncCopy[syncState].detail}</strong></span>
        </div>
      </div>
      <div className="resource-pills">
        <div className="resource-pill resource-pill--money"><span className="resource-pill-icon"><Icon name="bank" size={16} /></span><span><small>الرصيد</small><strong>{formatMoney(profile.bankBalance, country)}</strong></span></div>
        <div className="resource-pill resource-pill--diamonds"><span className="resource-pill-icon">◆</span><span><small>الماس</small><strong>{formatNumber(profile.diamonds)}</strong></span></div>
        <div className="resource-pill resource-pill--gold"><span className="resource-pill-icon"><Icon name="gold" size={16} /></span><span><small>الذهب</small><strong>{formatGold(profile.goldGrams)}</strong></span></div>
        <button className="resource-pill resource-pill--missions" type="button" onClick={() => onNavigate('tasks')} aria-label={`المهام، المتبقي ${missionsLeft}`}>
          <span className="resource-pill-icon"><Icon name="tasks" size={16} /></span><span><small>المهام</small><strong>{missionsLeft ? `${formatNumber(missionsLeft)} متبقية` : 'عرض الكل'}</strong></span><Icon className="resource-pill-chevron" name="chevron" size={13} />
        </button>
      </div>
      <button className={`resource-speed-action${daySpeedActive ? ' is-active' : ''}`} type="button" disabled={!daySpeedCards || daySpeedActive} onClick={() => onCommand(
        { name: 'use_day_speed_card', args: { kind: 'day-speed-2x' } },
        (current) => useDaySpeedCard(current, 'day-speed-2x'),
      )}>
        <span className="resource-speed-action-icon">×2</span>
        <span><small>{daySpeedActive ? 'السرعة مفعلة' : 'بطاقة اليوم'}</small><strong>{daySpeedActive ? 'نشطة' : `${formatNumber(daySpeedCards)} متاحة`}</strong></span>
      </button>
    </section>
  );
}
