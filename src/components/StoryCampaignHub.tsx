import { useState } from 'react';
import type { PlayerProfile } from '../domain/player';
import type { CountryDefinition } from '../domain/countries';
import {
  getCampaignChaptersForCountry,
  getPlayerCampaignChapter,
  isChapterClaimed,
  isChapterCompleted,
  type CampaignChoice,
} from '../game/campaignScenario';
import { getCountryScenario } from '../game/countryScenarios';
import { calculatePlayerProgress } from '../game/progressionEngine';
import { formatMoney } from '../domain/formatters';
import { playSound } from '../game/soundEffects';
import './StoryCampaignHub.css';

interface StoryCampaignHubProps {
  profile: PlayerProfile;
  country: CountryDefinition;
  onClose: () => void;
  onClaimReward: (
    diamonds: number,
    gold: number,
    money: number,
    reputationDelta?: number,
    chapterId?: number,
  ) => void;
}

export function StoryCampaignHub({ profile, country, onClose, onClaimReward }: StoryCampaignHubProps) {
  const scenario = getCountryScenario(country.id);
  const chapters = getCampaignChaptersForCountry(country.id);
  const currentChapter = getPlayerCampaignChapter(profile);
  const alreadyClaimed = isChapterClaimed(profile, currentChapter.id);
  const completed = isChapterCompleted(profile, currentChapter);
  const currentLevel = calculatePlayerProgress(profile).level;
  const [selectedChoice, setSelectedChoice] = useState<CampaignChoice | null>(null);

  const handleApplyChoice = (choice: CampaignChoice) => {
    if (!completed || alreadyClaimed || selectedChoice) return;
    setSelectedChoice(choice);
    playSound('success');
    const money = choice.rewardMoney ?? 0;
    const diamonds = (choice.rewardDiamonds ?? 0) + currentChapter.rewardDiamonds;
    const gold = currentChapter.rewardGoldGrams;
    const rep = choice.reputationDelta ?? 0;

    onClaimReward(diamonds, gold, money, rep, currentChapter.id);
  };

  return (
    <div className="suly-campaign-overlay" onClick={onClose} dir="rtl">
      <div className="suly-campaign-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="suly-campaign-head">
          <div>
            <span className="section-kicker">سيناريو القصة والمسار الإمبراطوري · {country.flag} {country.name}</span>
            <h2>📜 خريطة سيناريو: {scenario.scenarioTitle}</h2>
            <small>الفصل {currentChapter.id} من {chapters.length}</small>
          </div>
          <button type="button" className="suly-campaign-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Story Dialogue Card */}
        <div className="suly-dialogue-card">
          <div className="suly-character-avatar">
            <span className="suly-avatar-emoji">{currentChapter.characterAvatar}</span>
          </div>
          <div className="suly-character-info">
            <strong className="suly-character-name">{currentChapter.characterName}</strong>
            <small className="suly-character-title">{currentChapter.characterTitle}</small>
            <p className="suly-dialogue-quote">«{currentChapter.dialogueText}»</p>
          </div>
        </div>

        {/* Chapter Objectives Progress */}
        <div className="suly-objective-card">
          <div className="suly-objective-head">
            <strong>🎯 هدف الفصل {currentChapter.id}: {currentChapter.subtitle}</strong>
            <span className={`suly-status-badge ${completed ? 'is-completed' : 'is-ongoing'}`}>
              {alreadyClaimed
                ? '✓ تم استلام مكافأة هذا الفصل'
                : completed
                  ? '✨ الهدف مكتمل!'
                  : '⏳ جاري التقدم...'}
            </span>
          </div>
          <p className="suly-objective-desc">{currentChapter.objectiveText}</p>

          <div className="suly-objective-metrics">
            <div>
              <small>المستوى المطلوب</small>
              <strong>{currentLevel} / {currentChapter.requiredLevel}</strong>
            </div>
            <div>
              <small>عدد الشركات</small>
              <strong>{profile.companies.length} / {currentChapter.requiredCompanies}</strong>
            </div>
            <div>
              <small>صافي الأرباح المحقق</small>
              <strong>{formatMoney(profile.finances.netProfit, country)} / {formatMoney(currentChapter.requiredProfit, country)}</strong>
            </div>
          </div>
        </div>

        {/* Decisions and Rewards */}
        <div className="suly-decisions-section">
          <h3>القرارات الإستراتيجية والمكافآت ⚖️</h3>
          {alreadyClaimed || selectedChoice ? (
            <div className="suly-claimed-box">
              <span className="suly-claimed-icon">🏆</span>
              <div>
                <strong>تم حسم قرار الفصل واستلام المكافآت المعتمدة!</strong>
                {selectedChoice && <p>{selectedChoice.effectDescription}</p>}
                <small>مكافأة الفصل: 💎 {currentChapter.rewardDiamonds} ماسة · 🪙 {currentChapter.rewardGoldGrams}غ ذهب</small>
              </div>
            </div>
          ) : (
            <div className="suly-choices-grid">
              {currentChapter.choices.map((choice) => (
                <button
                  type="button"
                  key={choice.id}
                  className="suly-choice-card"
                  disabled={!completed}
                  onClick={() => handleApplyChoice(choice)}
                >
                  <strong>{choice.text}</strong>
                  <p>{choice.effectDescription}</p>
                  <span className="suly-choice-cta">
                    {completed ? 'اتخذ القرار واحصل على المكافأة ✨' : 'أكمل شروط الفصل أعلاه لفتح القرار'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Country-Specific AI Rivals */}
        <div className="suly-rivals-section">
          <h3>التكتلات المنافسة في أسواق {country.name} 🏛️</h3>
          <div className="suly-rivals-grid">
            {scenario.rivals.map((rival) => (
              <div className="suly-rival-card" key={rival.id}>
                <span className="suly-rival-avatar">{rival.avatar}</span>
                <div className="suly-rival-details">
                  <strong>{rival.name}</strong>
                  <small>{rival.activeSector}</small>
                  <span>ثروة التكتل: {formatMoney(rival.netWorth, country)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
