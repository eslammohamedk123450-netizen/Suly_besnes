import { useEffect, useState } from 'react';
import type { PlayerProfile } from '../domain/player';
import type { CountryDefinition } from '../domain/countries';
import type { SectionId } from '../domain/navigation';
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

export const GAME_STORY_EVENTS: StoryEventAlert[] = [
  {
    id: 'event_inflation_alert',
    characterName: 'سالم - خبير الأسواق المالية',
    characterTitle: 'كبير المحللين الاقتصاديين',
    avatarEmoji: '👨‍💼',
    urgencyLevel: 'high',
    speechBubble:
      '🚨 تحذير عاجل من البنك المركزي! هناك موجة تضخم مرتفعة ستضرب الأسواق غداً وتتسبب في قفزة بأسعار المواد الخام بـ 40%! ننصحك بشراء وتخزين المواد الخام بأي سعر الآن قبل إعادة التسعير!',
    actionText: 'شراء وتخزين مواد خام فوراً 📦',
    targetSection: 'inventory',
    rewardText: 'تجنب ارتفاع الأسعار بـ 40%',
  },
  {
    id: 'event_energy_crisis',
    characterName: 'المهندس طارق - مدير العمليات',
    characterTitle: 'كبير مهندسي الإمبراطورية',
    avatarEmoji: '👷‍♂️',
    urgencyLevel: 'high',
    speechBubble:
      '⚡ أزمة طاقة طارئة! محطات الكهرباء ترفع تعرفة التشغيل بالمصانع. استخدم بطاقات التسريع لتوسعة الإنتاج أو تزويد مصانعك بالطاقة المستقلة فوراً لتفادي غرامات التشغيل!',
    actionText: 'فتح متجر بطاقات التسريع ⚡',
    targetSection: 'store',
    rewardText: 'حماية أرباحك وتجنب غرامات الطاقة',
  },
  {
    id: 'event_stock_opportunity',
    characterName: 'نادية - مديرة المخاطر والبورصة',
    characterTitle: 'مستشارة الاستثمارات',
    avatarEmoji: '👩‍💼',
    urgencyLevel: 'opportunity',
    speechBubble:
      '📈 فرصة ذهبية في البورصة! أسهم قطاع البترول والغاز تتصاعد بقوة بسبب عقود جديدة. خصص جزءاً من سيولتك الآن للاستثمار وتحقيق أرباح خيالية خلال الأيام القادمة!',
    actionText: 'الدخول لاستثمارات البورصة 📈',
    targetSection: 'investments',
    rewardText: 'عائد استثماري مضاعف',
  },
  {
    id: 'event_harvest_boom',
    characterName: 'الحاج إبراهيم - كبير العائلة',
    characterTitle: 'مستشار عائلة النيل',
    avatarEmoji: '👴',
    urgencyLevel: 'opportunity',
    speechBubble:
      '🌾 موسم حصاد استثنائي على ضفاف النيل! الطلب على الأغذية في أوج نشاطه. فرصة لتنفيذ عقود تجارية مع كبار العملاء وتحقيق أرباح طائلة لإمبراطوريتك!',
    actionText: 'توقيع العقود التجارية 📜',
    targetSection: 'contracts',
    rewardText: 'مكافأة أرباح مضاعفة',
  },
];

interface StoryEventPopupProps {
  profile: PlayerProfile;
  country: CountryDefinition;
  event: StoryEventAlert;
  onClose: () => void;
  onNavigate: (section: SectionId) => void;
}

export function StoryEventPopup({ event, onClose, onNavigate }: StoryEventPopupProps) {
  useEffect(() => {
    playSound('unlock');
  }, []);

  const handleAction = () => {
    playSound('click');
    onNavigate(event.targetSection);
    onClose();
  };

  return (
    <div className="suly-event-popup-overlay" onClick={onClose}>
      <div className="suly-event-popup-modal" onClick={(e) => e.stopPropagation()}>
        {/* Urgent Header */}
        <div className={`suly-event-badge suly-badge--${event.urgencyLevel}`}>
          {event.urgencyLevel === 'high' ? '🚨 حدث سيناريو عاجل' : '✨ فرصة استراتيجية طارئة'}
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
          <p>"{event.speechBubble}"</p>
        </div>

        {/* Reward / Impact Note */}
        {event.rewardText && (
          <div className="suly-event-impact-chip">
            💡 تأثير النصيحة: <strong>{event.rewardText}</strong>
          </div>
        )}

        {/* Action Buttons */}
        <div className="suly-event-actions">
          <button type="button" className="suly-event-action-btn" onClick={handleAction}>
            {event.actionText}
          </button>
          <button type="button" className="suly-event-dismiss-btn" onClick={onClose}>
            فهمت النصيحة (إغلاق) 👍
          </button>
        </div>
      </div>
    </div>
  );
}
