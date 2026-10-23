import { useState } from 'react';
import type { PlayerProfile } from '../domain/player';
import type { SectionId } from '../domain/navigation';
import { getStarterMissions, isSectionUnlocked } from '../game/onboarding';
import { Icon } from './Icon';

interface StarterMissionDockProps {
  profile: PlayerProfile;
  onNavigate: (section: SectionId) => void;
}

export function StarterMissionDock({ profile, onNavigate }: StarterMissionDockProps) {
  const [open, setOpen] = useState(false);
  const missions = getStarterMissions(profile);
  const remaining = missions.filter((mission) => !mission.completed).length;
  return <div className={`mission-dock${open ? ' is-open' : ''}`}>
    <button className="mission-dock-toggle" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="فتح المهام الأولية"><Icon name="tasks" size={22} /><span>المهام</span>{remaining > 0 && <b>{remaining}</b>}</button>
    {open && <section className="mission-dock-panel" aria-label="المهام الأولية"><div className="mission-dock-heading"><div><span className="section-kicker">الفصل الأول</span><strong>إعادة بناء الإرث</strong></div><button className="icon-button" type="button" onClick={() => setOpen(false)} aria-label="إغلاق المهام"><Icon name="close" size={17} /></button></div><p>ابدأ بهذه الخطوات، واضغط على أي مهمة للانتقال مباشرة إلى مكان تنفيذها.</p><div className="mission-dock-list">{missions.map((mission) => { const unlocked = isSectionUnlocked(profile, mission.section); return <button className={`mission-dock-item${mission.completed ? ' is-complete' : ''}`} type="button" key={mission.id} disabled={!unlocked} onClick={() => { setOpen(false); onNavigate(mission.section); }}><span className="mission-dock-check">{mission.completed ? '✓' : <Icon name={unlocked ? 'arrow' : 'lock'} size={14} />}</span><span><strong>{mission.title}</strong><small>{mission.description}</small></span><Icon name="chevron" size={15} /></button>; })}</div></section>}
  </div>;
}
