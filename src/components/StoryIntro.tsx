import { useState } from 'react';
import type { PlayerProfile } from '../domain/player';
import { getStarterMissions } from '../game/onboarding';
import { Icon } from './Icon';

interface StoryIntroProps {
  profile: PlayerProfile;
  onComplete: () => void;
}

export function StoryIntro({ profile, onComplete }: StoryIntroProps) {
  const [page, setPage] = useState(0);
  const missions = getStarterMissions(profile);
  const dialogue = page === 0
    ? <>أهلًا بك يا <strong>{profile.name}</strong>… أنا وجيه العائلة. لقد كانت لعائلتنا ثروة وإمبراطورية كبيرة، لكن الزمن بدّد معظمها.</>
    : page === 1
      ? <>هذا كل ما تبقّى: رأس مال، اسم قديم، وذكريات لا تكفي وحدها. لن أعطيك إمبراطورية جاهزة؛ سأعطيك فرصة لتبنيها من جديد.</>
      : <>ابدأ بهدوء. الأرض أولًا، ثم الشركة، ثم الإنتاج. ستُفتح بقية الأنظمة عندما تثبت أنك مستعد لها.</>;

  return <main className="story-intro" aria-label="مقدمة قصة اللعبة">
    <div className="story-intro-art"><img src="/images/family-patriarch-intro.png" alt="وجيه العائلة في مكتب قديم" /><div className="story-intro-art-shade" /><div className="story-intro-art-caption"><span className="eyebrow">الفصل الأول · الإرث الضائع</span><strong>إمبراطورية الأعمال</strong><small>كل قرار يعيد اسم العائلة إلى السوق.</small></div></div>
    <section className="story-intro-panel">
      <div className="story-intro-brand"><Icon name="crown" size={20} /><span>رسالة من العائلة</span><span className="story-step">{page + 1} / 3</span></div>
      <div className="story-dialogue"><span className="story-quote">“</span><p>{dialogue}</p></div>
      {page === 2 && <div className="story-missions"><div className="story-missions-heading"><span className="section-kicker">مهمتك الأولى</span><strong>أعد بناء الأساس</strong></div>{missions.slice(0, 3).map((mission, index) => <div className="story-mission" key={mission.id}><span className={`story-mission-number${mission.completed ? ' is-done' : ''}`}>{mission.completed ? '✓' : index + 1}</span><span><strong>{mission.title}</strong><small>{mission.description}</small></span></div>)}</div>}
      <div className="story-intro-actions">{page > 0 && <button className="button button-secondary" type="button" onClick={() => setPage((value) => value - 1)}>السابق</button>}{page < 2 ? <button className="button button-primary" type="button" onClick={() => setPage((value) => value + 1)}>تابع القصة <Icon name="arrow" size={17} /></button> : <button className="button button-primary" type="button" onClick={onComplete}>أبدأ الفصل الأول <Icon name="arrow" size={17} /></button>}</div>
      <p className="story-intro-note"><Icon name="shield" size={15} /> يمكنك متابعة القصة والمهام لاحقًا من قسم المهام.</p>
    </section>
  </main>;
}
