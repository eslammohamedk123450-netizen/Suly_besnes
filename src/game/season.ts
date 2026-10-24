import type { PlayerProfile } from '../domain/player';
import type { SeasonProgress } from '../domain/futureSystems';
import type { GameResult } from './engine';

export const SEASON_LENGTH_DAYS = 30;
const SEASON_ID_PREFIX = 'expansion-season-';

type ChallengeKind = 'daily' | 'weekly';
export interface SeasonChallenge {
  id: string;
  kind: ChallengeKind;
  title: string;
  description: string;
  points: number;
  reward: number;
  available: (profile: PlayerProfile, season: SeasonProgress) => boolean;
}

function happenedOnDay(day: number | undefined, profile: PlayerProfile, occurredAt?: string): boolean {
  if (day !== undefined) return day === profile.day;
  if (!occurredAt) return false;
  const createdAt = Date.parse(profile.createdAt);
  const eventAt = Date.parse(occurredAt);
  return Number.isFinite(createdAt) && Number.isFinite(eventAt)
    && Math.max(1, Math.floor((eventAt - createdAt) / 86_400_000) + 1) === profile.day;
}

function startedInSeason(day: number | undefined, season: SeasonProgress): boolean {
  return day !== undefined && day >= season.startedOnDay && day <= season.endsOnDay;
}

export const SEASON_CHALLENGES: readonly SeasonChallenge[] = [
  { id: 'daily-empire', kind: 'daily', title: 'حرّك الإمبراطورية', description: 'امتلك شركة أو أرضًا لتثبت أن الإمبراطورية تتحرك.', points: 10, reward: 10_000, available: (profile) => profile.companies.some((item) => happenedOnDay(item.foundedOnDay, profile, item.foundedAt)) || profile.lands.some((item) => happenedOnDay(item.acquiredOnDay, profile, item.acquiredAt)) },
  { id: 'daily-market', kind: 'daily', title: 'نبض السوق', description: 'نفّذ عملية بيع واحدة في السوق.', points: 15, reward: 15_000, available: (profile) => profile.sales.some((item) => happenedOnDay(item.soldOnDay, profile, item.soldAt)) },
  { id: 'daily-auction', kind: 'daily', title: 'صوت المطرقة', description: 'شارك في مزاد واحد على الأقل.', points: 15, reward: 15_000, available: (profile) => profile.auctionHistory.some((item) => item.bidder === 'player' && item.day === profile.day) },
  { id: 'weekly-builder', kind: 'weekly', title: 'موسّع الأعمال', description: 'أسس شركتين على الأقل خلال الموسم.', points: 45, reward: 45_000, available: (profile, season) => profile.companies.filter((item) => startedInSeason(item.foundedOnDay, season)).length >= 2 },
  { id: 'weekly-operator', kind: 'weekly', title: 'قائد التشغيل', description: 'شغّل أمر إنتاج واحد على الأقل.', points: 35, reward: 35_000, available: (profile, season) => profile.productionOrders.some((item) => startedInSeason(item.startedOnDay, season)) },
  { id: 'weekly-investor', kind: 'weekly', title: 'عين على المستقبل', description: 'أنشئ استثمارًا أو وديعة محاكاة.', points: 30, reward: 30_000, available: (profile, season) => profile.investments.some((item) => startedInSeason(item.startedOnDay, season)) || profile.banking.deposits.some((item) => startedInSeason(item.startedOnDay, season)) },
];

export const LOGIN_REWARDS = [
  { id: 'cash', title: 'سيولة فورية', description: '25,000 جنيه محاكاة', points: 5 },
  { id: 'gold', title: 'ذهب للمحفظة', description: '0.5 غرام ذهب محاكاة', points: 5 },
  { id: 'diamonds', title: 'ماس الإمبراطورية', description: '8 ماسات مجانية للبطاقات', points: 5 },
] as const;

export function getSeasonId(day: number): string {
  return `${SEASON_ID_PREFIX}${Math.floor(Math.max(0, day - 1) / SEASON_LENGTH_DAYS) + 1}`;
}

function activeSeason(profile: PlayerProfile): SeasonProgress {
  const seasonId = getSeasonId(profile.day);
  const start = Math.floor(Math.max(0, profile.day - 1) / SEASON_LENGTH_DAYS) * SEASON_LENGTH_DAYS + 1;
  const current = profile.season;
  if (current?.seasonId === seasonId) return current;
  return { seasonId, startedOnDay: start, endsOnDay: start + SEASON_LENGTH_DAYS - 1, points: 0, claimedChallengeKeys: [] };
}

export function getSeasonSnapshot(profile: PlayerProfile) {
  const season = activeSeason(profile);
  const challenges = SEASON_CHALLENGES.map((challenge) => {
    const key = `${profile.day}:${challenge.id}`;
    const claimed = challenge.kind === 'daily'
      ? season.claimedChallengeKeys.includes(key)
      : season.claimedChallengeKeys.includes(challenge.id);
    return { ...challenge, claimed, available: !claimed && challenge.available(profile, season) };
  });
  const nextReward = Math.min(100, 100 - (season.points % 100));
  return { season, challenges, nextReward, progressPercent: Math.min(100, season.points % 100), loginRewardClaimed: season.claimedLoginRewardDay === profile.day };
}

function withLedger(profile: PlayerProfile, amount: number, note: string, extra: Partial<PlayerProfile> = {}): PlayerProfile {
  const entry = { id: `season-${profile.day}-${(profile.ledger ?? []).length + 1}`, category: 'revenue' as const, amount, countryId: profile.countryId, occurredAt: new Date().toISOString(), note };
  const ledger = [...profile.ledger, entry];
  const totalRevenue = ledger.filter((item) => item.category === 'revenue').reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = ledger.filter((item) => item.category === 'expense').reduce((sum, item) => sum + item.amount, 0);
  return { ...profile, ...extra, bankBalance: profile.bankBalance + amount, ledger, finances: { netProfit: totalRevenue - totalExpenses, totalRevenue, totalExpenses } };
}

export function claimSeasonChallenge(profile: PlayerProfile, challengeId: string): GameResult<{ challengeId: string; points: number }> {
  const snapshot = getSeasonSnapshot(profile);
  const challenge = snapshot.challenges.find((item) => item.id === challengeId);
  if (!challenge) return { ok: false, profile, reason: 'not-found', message: 'تحدي الموسم غير موجود.' };
  if (challenge.claimed) return { ok: false, profile, reason: 'already-claimed', message: 'تم تحصيل هذا التحدي في هذه الفترة.' };
  if (!challenge.available) return { ok: false, profile, reason: 'condition-not-met', message: 'لم يتحقق شرط التحدي بعد.' };
  const key = challenge.kind === 'daily' ? `${profile.day}:${challenge.id}` : challenge.id;
  const season = { ...snapshot.season, points: snapshot.season.points + challenge.points, claimedChallengeKeys: [...snapshot.season.claimedChallengeKeys, key] };
  const nextProfile = withLedger(profile, challenge.reward, `مكافأة موسم التوسع: ${challenge.title}`, { season });
  return { ok: true, profile: nextProfile, message: `أحسنت! حصلت على ${challenge.points} نقطة و${challenge.reward.toLocaleString('ar-EG')} ج.م من الموسم.`, data: { challengeId, points: challenge.points } };
}

export function claimLoginReward(profile: PlayerProfile, rewardId: (typeof LOGIN_REWARDS)[number]['id']): GameResult<{ rewardId: string }> {
  const snapshot = getSeasonSnapshot(profile);
  if (snapshot.loginRewardClaimed) return { ok: false, profile, reason: 'already-claimed', message: 'استلمت مكافأة الدخول اليوم.' };
  const reward = LOGIN_REWARDS.find((item) => item.id === rewardId);
  if (!reward) return { ok: false, profile, reason: 'not-found', message: 'مكافأة الدخول غير موجودة.' };
  const season = { ...snapshot.season, points: snapshot.season.points + reward.points, claimedLoginRewardDay: profile.day };
  if (rewardId === 'gold') {
    const nextProfile = withLedger(profile, 0, 'مكافأة دخول الموسم: 0.5 غرام ذهب', { season, goldGrams: Math.round((profile.goldGrams + 0.5) * 10) / 10, goldCostBasis: profile.goldCostBasis + 3_000 });
    return { ok: true, profile: nextProfile, message: 'تمت إضافة 0.5 غرام ذهب محاكاة إلى محفظتك.', data: { rewardId } };
  }
  if (rewardId === 'diamonds') {
    const nextProfile = withLedger(profile, 0, 'مكافأة دخول الموسم: 8 ماسات', { season, diamonds: profile.diamonds + 8 });
    return { ok: true, profile: nextProfile, message: 'تمت إضافة 8 ماسات مجانية إلى حسابك.', data: { rewardId } };
  }
  const nextProfile = withLedger(profile, 25_000, 'مكافأة دخول الموسم: سيولة فورية', { season });
  return { ok: true, profile: nextProfile, message: 'تمت إضافة 25,000 ج.م محاكاة إلى رصيدك.', data: { rewardId } };
}

export const SEASON_EVENTS = [
  { title: 'فرصة توريد عاجلة', description: 'وصل طلب كبير من السوق، لكن القرار يحتاج سرعة.', choices: [{ id: 'safe', label: 'بيع من المخزون', description: '12,000 ج.م و5 نقاط', reward: 12_000, points: 5 }, { id: 'bold', label: 'اقبل الطلب الكبير', description: '24,000 ج.م و10 نقاط', reward: 24_000, points: 10 }] },
  { title: 'موقع توسعة جديد', description: 'ظهر موقع مناسب قرب منشآتك ويمكن استغلاله اليوم.', choices: [{ id: 'reserve', label: 'احجز الموقع', description: '18,000 ج.م و8 نقاط', reward: 18_000, points: 8 }, { id: 'wait', label: 'انتظر فرصة أفضل', description: '8,000 ج.م و4 نقاط', reward: 8_000, points: 4 }] },
  { title: 'منافس يضغط السوق', description: 'خفض منافس أسعاره، ويمكنك الرد بهدوء أو بالمخاطرة.', choices: [{ id: 'steady', label: 'حافظ على السعر', description: '10,000 ج.م و5 نقاط', reward: 10_000, points: 5 }, { id: 'compete', label: 'نافس بقوة', description: '22,000 ج.م و9 نقاط', reward: 22_000, points: 9 }] },
] as const;

export function getSeasonEventSnapshot(profile: PlayerProfile) {
  const season = getSeasonSnapshot(profile);
  const event = SEASON_EVENTS[(profile.day - 1) % SEASON_EVENTS.length];
  return { event, claimed: season.season.claimedChallengeKeys.includes(`event:${profile.day}`) };
}

export function chooseSeasonEvent(profile: PlayerProfile, choiceId: string): GameResult<{ choiceId: string }> {
  const snapshot = getSeasonEventSnapshot(profile);
  if (snapshot.claimed) return { ok: false, profile, reason: 'already-claimed', message: 'اتخذت قرار حدث اليوم بالفعل.' };
  const choice = snapshot.event.choices.find((item) => item.id === choiceId);
  if (!choice) return { ok: false, profile, reason: 'not-found', message: 'خيار الحدث غير موجود.' };
  const currentSeason = getSeasonSnapshot(profile).season;
  const season = { ...currentSeason, points: currentSeason.points + choice.points, claimedChallengeKeys: [...currentSeason.claimedChallengeKeys, `event:${profile.day}`] };
  const nextProfile = withLedger(profile, choice.reward, `قرار موسم التوسع: ${snapshot.event.title} · ${choice.label}`, { season });
  return { ok: true, profile: nextProfile, message: `تم تنفيذ القرار وحصلت على ${choice.reward.toLocaleString('ar-EG')} ج.م و${choice.points} نقاط موسم.`, data: { choiceId } };
}
