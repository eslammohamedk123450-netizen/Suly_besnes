import { useState } from 'react';
import type { PlayerProfile } from '../domain/player';
import { findCountry } from '../domain/countries';
import { getStarterMissions } from '../game/onboarding';
import { Icon } from './Icon';

interface StoryIntroProps {
  profile: PlayerProfile;
  onComplete: () => void;
}

export function StoryIntro({ profile, onComplete }: StoryIntroProps) {
  const [page, setPage] = useState(0);
  const missions = getStarterMissions(profile);
  const country = findCountry(profile.countryId) ?? findCountry('egypt')!;

  const dialogue = country.storyFull[page] ?? country.storyFull[0];

  return (
    <main className="story-intro" aria-label="مقدمة قصة اللعبة" dir="rtl">
      <div className="story-intro-art">
        <img src="/images/family-patriarch-intro.png" alt="العائلة والأم الحنون" />
        <div className="story-intro-art-shade" />
        <div className="story-intro-art-caption">
          <span className="eyebrow">الفصل الأول · {country.storyTitle}</span>
          <strong>{country.flag} إمبراطورية الأعمال في {country.name}</strong>
          <small>بداية من المليون جنيه والعودة كملياردير أسطوري.</small>
        </div>
      </div>

      <section className="story-intro-panel">
        <div className="story-intro-brand">
          <Icon name="crown" size={20} />
          <span>رسالة الأم والأمل الأخير · {country.currency.code}</span>
          <span className="story-step">{page + 1} / 3</span>
        </div>

        <div className="story-dialogue">
          <span className="story-quote">“</span>
          <p>{dialogue.replace('{name}', profile.name)}</p>
        </div>

        {page === 2 && (
          <div className="story-missions">
            <div className="story-missions-heading">
              <span className="section-kicker">مهمتك الأولى</span>
              <strong>أثبت نجاحك وابنِ الأساس</strong>
            </div>
            {missions.slice(0, 3).map((mission, index) => (
              <div className="story-mission" key={mission.id}>
                <span className={`story-mission-number${mission.completed ? ' is-done' : ''}`}>
                  {mission.completed ? '✓' : index + 1}
                </span>
                <span>
                  <strong>{mission.title}</strong>
                  <small>{mission.description}</small>
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="story-intro-actions">
          {page > 0 && (
            <button className="button button-secondary" type="button" onClick={() => setPage((v) => v - 1)}>
              السابق
            </button>
          )}
          {page < 2 ? (
            <button className="button button-primary" type="button" onClick={() => setPage((v) => v + 1)}>
              تابع القصة <Icon name="arrow" size={17} />
            </button>
          ) : (
            <button className="button button-primary" type="button" onClick={onComplete}>
              أبدأ الفصل الأول <Icon name="arrow" size={17} />
            </button>
          )}
        </div>

        <p className="story-intro-note">
          <Icon name="shield" size={15} /> رأس المال البدائي: {country.currency.symbol} {country.startingBalance.toLocaleString('ar-EG')} (يعادل 1,000,000 ج.م بسعر الصرف الحقيقي)
        </p>
      </section>
    </main>
  );
}
