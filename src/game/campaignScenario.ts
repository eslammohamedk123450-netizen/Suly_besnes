import type { CountryId } from '../domain/countries';
import type { PlayerProfile } from '../domain/player';
import { getCountryScenario } from './countryScenarios';
import { calculatePlayerProgress } from './progressionEngine';

export interface CampaignChoice {
  id: string;
  text: string;
  effectDescription: string;
  rewardMoney?: number;
  rewardDiamonds?: number;
  reputationDelta?: number;
}

export interface CampaignChapter {
  id: number;
  title: string;
  subtitle: string;
  characterName: string;
  characterAvatar: string;
  characterTitle: string;
  dialogueText: string;
  objectiveText: string;
  requiredLevel: number;
  requiredCompanies: number;
  requiredProfit: number;
  choices: CampaignChoice[];
  rewardDiamonds: number;
  rewardGoldGrams: number;
  rewardTitle: string;
}

export const CAMPAIGN_CHAPTERS: CampaignChapter[] = [...getCountryScenario('egypt').chapters];

export function getCampaignChaptersForCountry(countryId?: CountryId): readonly CampaignChapter[] {
  return getCountryScenario(countryId).chapters;
}

export function isChapterClaimed(profile: PlayerProfile, chapterId: number): boolean {
  return Boolean(profile.onboarding?.claimedCampaignChapters?.includes(chapterId));
}

export function getPlayerCampaignChapter(profile: PlayerProfile): CampaignChapter {
  const chapters = getCampaignChaptersForCountry(profile.countryId);
  const claimed = new Set(profile.onboarding?.claimedCampaignChapters ?? []);
  const explicitChapterId =
    profile.onboarding?.campaignChapterId
    ?? (profile as unknown as { campaignChapterId?: number }).campaignChapterId;

  if (typeof explicitChapterId === 'number') {
    const match = chapters.find((c) => c.id === explicitChapterId);
    if (match && !claimed.has(match.id)) return match;
  }

  return chapters.find((c) => !claimed.has(c.id)) ?? chapters[chapters.length - 1];
}

export function isChapterCompleted(profile: PlayerProfile, chapter: CampaignChapter): boolean {
  const level = calculatePlayerProgress(profile).level;
  const companies = profile.companies.length;
  const netProfit = profile.finances.netProfit;
  return level >= chapter.requiredLevel && companies >= chapter.requiredCompanies && netProfit >= chapter.requiredProfit;
}
