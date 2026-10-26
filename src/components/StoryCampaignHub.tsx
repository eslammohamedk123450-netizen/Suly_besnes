import { useState } from 'react';
import type { PlayerProfile } from '../domain/player';
import type { CountryDefinition } from '../domain/countries';
import type { SectionId } from '../domain/navigation';
import { 
  GLOBAL_STORY_TITLE,
  CAMPAIGN_CHAPTERS, 
  getPlayerCampaignChapter, 
  isChapterCompleted, 
  getCountryCharacters,
  type CampaignChoice,
  type StoryCharacter
} from '../game/campaignScenario';
import { formatMoney } from '../domain/formatters';
import { playSound } from '../game/soundEffects';
import { 
  FastForward, 
  CheckCircle2, 
  Lock, 
  FileText, 
  Users, 
  Compass, 
  Award, 
  Sparkles, 
  X,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import './StoryCampaignHub.css';

interface StoryCampaignHubProps {
  profile: PlayerProfile;
  country: CountryDefinition;
  onClose: () => void;
  onClaimReward: (diamonds: number, gold: number, money: number, reputationDelta?: number, rewardId?: string) => void;
  onNavigate?: (section: SectionId) => void;
}

export function StoryCampaignHub({ 
  profile, 
  country, 
  onClose, 
  onClaimReward,
  onNavigate 
}: StoryCampaignHubProps) {
  const currentChapter = getPlayerCampaignChapter(profile);
  const [activeTab, setActiveTab] = useState<'chapters' | 'dossier' | 'characters'>('chapters');
  const [inspectedChapterId, setInspectedChapterId] = useState<number>(currentChapter.id);
  const [selectedChoice, setSelectedChoice] = useState<CampaignChoice | null>(null);

  const inspectedChapter = CAMPAIGN_CHAPTERS.find((c) => c.id === inspectedChapterId) ?? currentChapter;
  const isCurrentInspected = inspectedChapter.id === currentChapter.id;
  const isInspectedCompleted = isChapterCompleted(profile, inspectedChapter);
  const rewardKey = `chapter_reward_${inspectedChapter.id}`;
  const alreadyClaimed = profile.claimedRewardIds?.includes(rewardKey);

  const characters = getCountryCharacters(country.id);

  const handleApplyChoice = (choice: CampaignChoice) => {
    if (alreadyClaimed) return;
    setSelectedChoice(choice);
    playSound('success');
    const money = choice.rewardMoney ?? 0;
    const diamonds = (choice.rewardDiamonds ?? 0) + inspectedChapter.rewardDiamonds;
    const gold = inspectedChapter.rewardGoldGrams;
    const rep = choice.reputationDelta ?? 0;

    onClaimReward(diamonds, gold, money, rep, rewardKey);
  };

  const handleSkipDialogue = () => {
    playSound('click');
    onClose();
  };

  const handleGoToSection = (section: SectionId) => {
    playSound('click');
    onClose();
    onNavigate?.(section);
  };

  return (
    <div className="suly-campaign-overlay" onClick={onClose} dir="rtl">
      <div className="suly-campaign-modal" onClick={(e) => e.stopPropagation()}>
        {/* Top Accent Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 rounded-t-2xl -mt-5 -mx-5 mb-3" />

        {/* Modal Header */}
        <div className="suly-campaign-head">
          <div>
            <div className="flex items-center gap-2">
              <span className="section-kicker">السيناريو القصصي والمسار الإمبراطوري</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                {country.flag} {country.name}
              </span>
            </div>
            <h2>📜 {GLOBAL_STORY_TITLE}</h2>
            <small>الفصل الحالي {currentChapter.id} من {CAMPAIGN_CHAPTERS.length}: {currentChapter.title}</small>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSkipDialogue}
              className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              title="تخطي الحوار والرجوع للعب الميداني دون تنفيذ تلقائي أو مكافآت"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>تخطي الحوار</span>
            </button>
            <button 
              type="button" 
              className="suly-campaign-close" 
              onClick={onClose}
              title="إغلاق"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('chapters')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'chapters'
                ? 'bg-amber-500 text-slate-950 font-black shadow'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <span>فصول القصة العشرة (10)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dossier')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'dossier'
                ? 'bg-amber-500 text-slate-950 font-black shadow'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>ملف سر «مجموعة الأفق العالمية» 🕵️‍♂️</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('characters')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'characters'
                ? 'bg-amber-500 text-slate-950 font-black shadow'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>شخصيات ومنافسو {country.name} 👥</span>
          </button>
        </div>

        {/* TAB 1: CHAPTERS & STORY PROGRESSION */}
        {activeTab === 'chapters' && (
          <div className="space-y-4">
            {/* Chapters Horizon Horizontal Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {CAMPAIGN_CHAPTERS.map((ch) => {
                const isSelected = ch.id === inspectedChapter.id;
                const isPast = ch.id < currentChapter.id;
                const isCurrent = ch.id === currentChapter.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => {
                      playSound('click');
                      setInspectedChapterId(ch.id);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition shrink-0 border flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md'
                        : isPast
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : isCurrent
                        ? 'bg-slate-800 border-amber-500/50 text-white animate-pulse'
                        : 'bg-slate-900/50 border-slate-800 text-slate-500 opacity-60'
                    }`}
                  >
                    <span>{isPast ? '✓' : ch.id}</span>
                    <span>فصل {ch.id}</span>
                  </button>
                );
              })}
            </div>

            {/* Story Dialogue Card */}
            <div className="suly-dialogue-card">
              <div className="suly-character-avatar">
                <span className="suly-avatar-emoji">{inspectedChapter.characterAvatar}</span>
              </div>
              <div className="suly-character-info">
                <strong className="suly-character-name">{inspectedChapter.characterName}</strong>
                <small className="suly-character-title">{inspectedChapter.characterTitle}</small>
                <p className="suly-dialogue-quote">"{inspectedChapter.dialogueText}"</p>
              </div>
            </div>

            {/* Chapter Objectives Progress */}
            <div className="suly-objective-card">
              <div className="suly-objective-head">
                <strong>🎯 هدف الفصل {inspectedChapter.id}: {inspectedChapter.subtitle}</strong>
                <span className={`suly-status-badge ${isInspectedCompleted ? 'is-completed' : 'is-ongoing'}`}>
                  {isInspectedCompleted ? '✨ الهدف مكتمل!' : '⏳ جاري التقدم...'}
                </span>
              </div>
              <p className="suly-objective-desc">{inspectedChapter.objectiveText}</p>

              <div className="suly-objective-metrics">
                <div>
                  <small>المستوى المطلوب</small>
                  <strong>{profile.level} / {inspectedChapter.requiredLevel}</strong>
                </div>
                <div>
                  <small>عدد الشركات</small>
                  <strong>{profile.companies.length} / {inspectedChapter.requiredCompanies}</strong>
                </div>
                <div>
                  <small>صافي الأرباح</small>
                  <strong>{formatMoney(profile.finances?.netProfit ?? 0, country)}</strong>
                </div>
              </div>

              {/* Clue discovered */}
              <div className="mt-3 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex items-start gap-2">
                <span className="text-amber-400 text-base">🔍</span>
                <div>
                  <strong className="text-amber-300 block">وثيقة سر الأفق المكتشفة بهذا الفصل:</strong>
                  <span className="text-slate-300">{inspectedChapter.horizonSecretClue}</span>
                </div>
              </div>
            </div>

            {/* Decisions and Rewards */}
            <div className="suly-decisions-section">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-black text-white">القرارات الإستراتيجية والمكافآت ⚖️</h3>
                <span className="text-xs text-amber-300">
                  مكافأة الفصل: 💎 {inspectedChapter.rewardDiamonds} ماسة · 🪙 {inspectedChapter.rewardGoldGrams}غ ذهب
                </span>
              </div>

              {alreadyClaimed || selectedChoice ? (
                <div className="suly-claimed-box">
                  <span className="suly-claimed-icon">🏆</span>
                  <div>
                    <strong>تم اتخاذ القرار بنجاح واستلام مكافأة الفصل!</strong>
                    <p>{selectedChoice?.effectDescription ?? 'مكافأة معتمدة مسجلة بحسابك الإمبراطوري.'}</p>
                    <small>💎 {inspectedChapter.rewardDiamonds} ماسة · 🪙 {inspectedChapter.rewardGoldGrams}غ ذهب الخالص</small>
                  </div>
                </div>
              ) : (
                <div className="suly-choices-grid">
                  {inspectedChapter.choices.map((choice) => (
                    <button
                      type="button"
                      key={choice.id}
                      className="suly-choice-card"
                      disabled={!isInspectedCompleted}
                      onClick={() => handleApplyChoice(choice)}
                    >
                      <strong>{choice.text}</strong>
                      <p>{choice.effectDescription}</p>
                      <span className="suly-choice-cta">
                        {isInspectedCompleted ? 'اتخذ القرار واحصل على المكافأة ✨' : 'أكمل متطلبات الفصل لفتح القرار'}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: HORIZON GLOBAL GROUP DOSSIER */}
        {activeTab === 'dossier' && (
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
              <strong>ملف التحقيقات الاستقصائي:</strong> انهارت «مجموعة الأفق العالمية» بعد صفقات مشبوهة وتفككت أصولها بين عدة دول. يرشدك المستثمر الغامض <strong>نادر السالمي</strong> وشركاؤه تدريجياً لفك شفرة سقوط المجموعة وكيف ترتبط بمشروعك الحالي.
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {CAMPAIGN_CHAPTERS.map((ch) => {
                const isUnlocked = ch.id <= currentChapter.id;
                return (
                  <div
                    key={ch.id}
                    className={`p-3 rounded-2xl border transition ${
                      isUnlocked
                        ? 'bg-slate-900/90 border-slate-700/80'
                        : 'bg-slate-950/40 border-slate-900 opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isUnlocked ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {ch.id}
                        </span>
                        <strong className="text-xs text-white">وثيقة الفصل {ch.id}: {ch.title}</strong>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {isUnlocked ? 'مكشوفة وموثقة ✓' : 'مشفرة 🔒'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mr-7">
                      {isUnlocked ? ch.horizonSecretClue : 'يتطلب التقدم في أحداث القصة ورفع المستوى لفك تشفير هذه الوثيقة.'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: COUNTRY ADVISORS & RIVALS */}
        {activeTab === 'characters' && (
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
              شخصيات قطاع الأعمال والشركاء والمنافسون المحليون في <strong>{country.name}</strong>. يرافقونك في قرارات المصانع، التمويل، العقود، والمزادات.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {characters.map((char) => (
                <div
                  key={char.id}
                  className="p-3.5 rounded-2xl bg-slate-900/95 border border-slate-800 hover:border-amber-500/40 transition flex items-start gap-3"
                >
                  <span className="w-11 h-11 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl shrink-0 border border-slate-700">
                    {char.avatar}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-xs text-white">{char.name}</strong>
                      <span className={`text-[9px] px-2 py-0.2 rounded-full font-bold ${
                        char.role === 'operations' ? 'bg-blue-500/20 text-blue-300' :
                        char.role === 'finance' ? 'bg-emerald-500/20 text-emerald-300' :
                        char.role === 'procurement' ? 'bg-amber-500/20 text-amber-300' :
                        char.role === 'rival' ? 'bg-rose-500/20 text-rose-300' :
                        'bg-purple-500/20 text-purple-300'
                      }`}>
                        {char.role === 'operations' ? 'تشغيل' :
                         char.role === 'finance' ? 'تمويل' :
                         char.role === 'procurement' ? 'توريدات' :
                         char.role === 'rival' ? 'منافس' : 'لغز الأفق'}
                      </span>
                    </div>
                    <small className="text-[10px] text-amber-300 block mt-0.5">{char.title}</small>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{char.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
