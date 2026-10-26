import { useEffect } from 'react';
import type { PlayerProfile } from '../domain/player';
import type { CountryDefinition } from '../domain/countries';
import type { SectionId } from '../domain/navigation';
import { getCountryScenario, getEligibleStoryAlerts } from '../game/countryScenarios';
import { isSectionUnlocked } from '../game/onboarding';
import { playSound } from '../game/soundEffects';
import './StoryEventPopup.css';

export interface StoryEventAlert {
  id: string;
  characterName: string;
  characterTitle: string;
  avatarEmoji: string;
  urgencyLevel: 'high' | 'medium' | 'opportunity';
  speechBubble: string;
  actionText: string;
  targetSection: SectionId;
  rewardText?: string;
}

export function getLocalizedStoryEventAlerts(profile: PlayerProfile): StoryEventAlert[] {
  const scenario = getCountryScenario(profile.countryId);
  return getEligibleStoryAlerts(profile).map((alert) => {
    const advisor = scenario.advisors[alert.advisorRole];
    return {
      id: alert.id,
      characterName: advisor.name,
      characterTitle: advisor.title,
      avatarEmoji: advisor.avatarEmoji,
      urgencyLevel: alert.urgencyLevel,
      speechBubble: alert.speechBubble,
      actionText: alert.actionText,
      targetSection: alert.targetSection,
      rewardText: alert.rewardText,
    };
  });
}

interface StoryEventPopupProps {
  profile: PlayerProfile;
  country: CountryDefinition;
  event: StoryEventAlert;
  onClose: () => void;
  onNavigate: (section: SectionId) => void;
}

export function StoryEventPopup({ profile, event, onClose, onNavigate }: StoryEventPopupProps) {
  useEffect(() => {
    playSound('unlock');
  }, []);

  const targetUnlocked = isSectionUnlocked(profile, event.targetSection);

  const handleAction = () => {
    playSound('click');
    if (targetUnlocked) {
      onNavigate(event.targetSection);
    }
    onClose();
  };

  return (
    <div className="suly-event-popup-overlay" onClick={onClose} dir="rtl">
      <div className="suly-event-popup-modal" onClick={(e) => e.stopPropagation()}>
        {/* Urgent Header */}
        <div className={`suly-event-badge suly-badge--${event.urgencyLevel}`}>
          {event.urgencyLevel === 'high' ? '🚨 تنبيه تشغيلي عاجل' : '✨ إشارة مستشار استراتيجية'}
        </div>

        {/* Character Portrait & Dialog Box */}
        <div className="suly-event-character-box">
          <div className="suly-event-avatar-ring">
            <span className="suly-event-avatar">{event.avatarEmoji}</span>
          </div>
          <div className="suly-event-character-meta">
            <strong>{event.characterName}</strong>
            <small>{event.characterTitle}</small>
          </div>
        </div>

        {/* Speech Bubble */}
        <div className="suly-speech-bubble">
          <div className="suly-bubble-tail" />
          <p>«{event.speechBubble}»</p>
        </div>

        {/* Reward / Impact Note */}
        {event.rewardText && (
          <div className="suly-event-impact-chip">
            💡 الفائدة المتوقعة: <strong>{event.rewardText}</strong>
          </div>
        )}

        {/* Action Buttons */}
        <div className="suly-event-actions">
          {targetUnlocked && (
            <button type="button" className="suly-event-action-btn" onClick={handleAction}>
              {event.actionText}
            </button>
          )}
          <button type="button" className="suly-event-dismiss-btn" onClick={onClose}>
            فهمت التوجيه (إغلاق) 👍
          </button>
        </div>
      </div>
    </div>
  );
}
