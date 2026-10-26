import { SpotlightWalkthrough } from './components/SpotlightWalkthrough';
import {
  WALKTHROUGH_STEPS,
  isWalkthroughCompleted,
  setWalkthroughCompleted,
  getSavedWalkthroughStepIndex,
  setSavedWalkthroughStepIndex,
  resolveQuestWalkthroughTarget,
  resetWalkthrough,
  type WalkthroughStep,
} from './game/walkthroughState';
import { useEffect, useMemo, useRef, useState } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { AccountGate } from './components/AccountGate';
import { CountrySelection } from './components/CountrySelection';
import { Dashboard } from './components/Dashboard';
import { ProfilePage } from './components/ProfilePage';
import { Icon } from './components/Icon';
import { FlyingToast, type ToastAlert } from './components/FlyingToast';
import { NotificationModal } from './components/NotificationModal';
import { selectNotifications, type GameNotification } from './game/notifications';
import { SectionPage } from './components/SectionPage';
import { COUNTRIES, findCountry } from './domain/countries';
import type { CountryId } from './domain/countries';
import { DEFAULT_AVATAR_ID } from './domain/avatars';
import { getSection, SECTION_GROUPS, type SectionId } from './domain/navigation';
import { createNewPlayer } from './domain/player';
import type { PlayerProfile } from './domain/player';
import { formatMoney } from './domain/formatters';
import type { FinanceLedgerEntry } from './domain/futureSystems';
import { advanceDay, sellProduct, type GameCommand, type GameResult } from './game/engine';
import { loadStockMarketState, disburseHybridDividends } from './game/stockMarket';
import { loadSavedGame, saveGame } from './storage/saveRepository';
import { loadNotificationTheme, saveNotificationTheme } from './storage/userPreferences';
import { createGuestAccount, handlePasswordRecoveryCallback, loadCurrentAccount, logoutAccount, type LocalAccount } from './storage/authRepository';
import { executeRemoteGameCommand, loadRemoteGame, redeemRemoteReward, saveRemoteGame, type RemoteGameCommandAttempt } from './storage/remoteSaveRepository';
import { PasswordResetGate } from './components/PasswordResetGate';
import { supabase } from './storage/supabaseClient';
import { StoryIntro } from './components/StoryIntro';
import { StoryCampaignHub } from './components/StoryCampaignHub';
import { SystemGuideModal } from './components/SystemGuideModal';
import { chapterFor, getSectionUnlockHint, getUnlockedSectionIds, isSectionUnlocked, getSectionRequiredLevel } from './game/onboarding';
import { resolveSafeSection } from './game/progressionEngine';
import { getCountryScenario, type CountryStoryQuest } from './game/countryScenarios';
import { normalizeAccountFeatures } from './domain/accountFeatures';
import { claimDailySeasonLogin, getVisibleSeasons, recordVerifiedGameTransaction } from './storage/leaderboardRepository';
import { ResourceBar, type ResourceSyncState } from './components/ResourceBar';
import { acknowledgeGameCommand, blockGameCommand, createGameCommandKey, enqueueGameCommand, loadQueuedGameCommands } from './storage/commandOutbox';
import { clearPendingInitialProfile, loadPendingInitialProfile, queueInitialProfile } from './storage/pendingInitialProfile';
import { playSound } from './game/soundEffects';
import { RightActionHub } from './components/RightActionHub';
import { StoryEventPopup, getLocalizedStoryEventAlerts, type StoryEventAlert } from './components/StoryEventPopup';
import { DynamicEconomyEvents } from './components/DynamicEconomyEvents';
import { loadExpansionState } from './game/expansionEngine';
import { DailyLuckySpinModal } from './components/DailyLuckySpinModal';
import { CelebrationModal, type CelebrationData } from './components/CelebrationModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { getLuckySpinState } from './game/luckyWheelService';
import { AvatarWardrobeModal } from './components/AvatarWardrobeModal';
import { calculateOfflineIdleProgress, applyOfflineReportToProfile, recordOfflineHeartbeat, type OfflineIdleReport } from './game/offlineIdleEngine';
import { MorningAbsenceReportModal } from './components/MorningAbsenceReportModal';
import { CentralBankModal } from './components/CentralBankModal';
import { PrestigeExpansionModal } from './components/PrestigeExpansionModal';
import { StrategicPillarsModal } from './components/StrategicPillarsModal';
import { acceptBotMarketOffer } from './game/economyBots';
import { triggerHaptic } from './services/nativeMobileService';

function getPendingSyncCount(accountId: string): number {
  return loadQueuedGameCommands(accountId).length + (loadPendingInitialProfile(accountId) ? 1 : 0);
}

function clearWebRecoveryMarker() {
  const url = new URL(window.location.href);
  if (url.searchParams.get('auth') !== 'recovery') return;
  url.searchParams.delete('auth');
  url.hash = '';
  window.history.replaceState(null, '', `${url.pathname}${url.search}`);
}

export default function App() {
  const [account, setAccount] = useState<LocalAccount | null>(null);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedCountryId, setSelectedCountryId] = useState<CountryId>(() => profile?.countryId ?? COUNTRIES[0].id);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(() => profile?.avatarId ?? DEFAULT_AVATAR_ID);
  const [playerName, setPlayerName] = useState(() => profile?.name ?? '');
  const [activeSection, setActiveSection] = useState<SectionId>('home');
  const [sectionFocus, setSectionFocus] = useState<string | undefined>();
  const [, setMobileMenuOpen] = useState(false);
  const [notificationTheme, setNotificationTheme] = useState(loadNotificationTheme);
  const [notice, setNotice] = useState('');
  const [, setNoticeTone] = useState<'success' | 'error'>('success');
  const [pendingGuide, setPendingGuide] = useState<SectionId | null>(null);
  const [linkingAccount, setLinkingAccount] = useState(false);
  const [syncState, setSyncState] = useState<ResourceSyncState>('synced');
  const [pendingCommandCount, setPendingCommandCount] = useState(0);
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  const [activeStoryEvent, setActiveStoryEvent] = useState<StoryEventAlert | null>(null);
  const [expansion, setExpansion] = useState(() => (profile ? loadExpansionState(profile) : null));
  const [isLuckyWheelOpen, setIsLuckyWheelOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isCampaignHubOpen, setIsCampaignHubOpen] = useState(false);
  const [isAvatarWardrobeOpen, setIsAvatarWardrobeOpen] = useState(false);
  const [isWalkthroughActive, setIsWalkthroughActive] = useState(false);
  const [walkthroughStepIndex, setWalkthroughStepIndex] = useState(0);
  const [walkthroughOverrideStep, setWalkthroughOverrideStep] = useState<WalkthroughStep | null>(null);
  const [celebrationData, setCelebrationData] = useState<CelebrationData | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [activeToastAlert, setActiveToastAlert] = useState<ToastAlert | null>(null);
  const [forceBellVibrate, setForceBellVibrate] = useState(false);
  const [customNotifications, setCustomNotifications] = useState<GameNotification[]>([]);
  const [isMorningReportOpen, setIsMorningReportOpen] = useState(false);
  const [offlineReport, setOfflineReport] = useState<OfflineIdleReport | null>(null);
  const [isCentralBankModalOpen, setIsCentralBankModalOpen] = useState(false);
  const [isPrestigeModalOpen, setIsPrestigeModalOpen] = useState(false);
  const [isStrategicPillarsOpen, setIsStrategicPillarsOpen] = useState(false);
  const syncLock = useRef(false);
  const remoteCommandAttempts = useRef(new Map<string, Promise<RemoteGameCommandAttempt>>());

  const applyLoadedProfileState = (loadedProfile: PlayerProfile | null) => {
    setProfile(loadedProfile);
    if (!loadedProfile) {
      setIsWalkthroughActive(false);
      setWalkthroughOverrideStep(null);
      return;
    }
    setSelectedCountryId(loadedProfile.countryId);
    setSelectedAvatarId(loadedProfile.avatarId ?? DEFAULT_AVATAR_ID);
    const introAlreadySeen = Boolean(
      loadedProfile.onboarding?.countryIntroSeen || loadedProfile.onboarding?.introCompleted,
    );
    if (!introAlreadySeen) {
      setIsTutorialOpen(true);
      setIsWalkthroughActive(false);
    } else {
      setIsTutorialOpen(false);
      const stepIdx = getSavedWalkthroughStepIndex(loadedProfile);
      setWalkthroughStepIndex(stepIdx);
      setIsWalkthroughActive(!isWalkthroughCompleted(loadedProfile));
    }
  };

  useEffect(() => {
    if (!profile) {
      setExpansion(null);
      return;
    }
    setExpansion(loadExpansionState(profile));
  }, [profile?.id]);

  const triggerNotification = (
    message: string,
    tone: 'success' | 'warning' | 'info' | 'danger' = 'info',
    title?: string,
    section?: SectionId,
    target?: string,
  ) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const inferredTitle = title || (
      tone === 'danger' ? 'تنبيه عاجل' :
      tone === 'warning' ? 'تحذير هام' :
      tone === 'success' ? 'تمت العملية بنجاح' :
      'إشعار إمبراطورية الأعمال'
    );

    const safeSection: SectionId = profile
      ? resolveSafeSection(profile, section)
      : (section ?? 'home');
    const safeTarget = safeSection === section ? target : undefined;

    setActiveToastAlert({
      id,
      title: inferredTitle,
      message,
      tone,
      section: safeSection,
      target: safeTarget,
    });

    const newNotif: GameNotification = {
      id,
      title: inferredTitle,
      detail: message,
      tone,
      section: safeSection,
      target: safeTarget,
    };

    setCustomNotifications((prev) => [newNotif, ...prev.slice(0, 30)]);
    setForceBellVibrate(true);
    setTimeout(() => setForceBellVibrate(false), 2400);
  };

  const showNotice = (
    msg: string,
    tone: 'success' | 'warning' | 'info' | 'danger' = 'info',
    title?: string,
    sec?: SectionId,
    tgt?: string,
  ) => {
    setNotice(msg);
    setNoticeTone(tone === 'danger' ? 'error' : 'success');
    triggerNotification(msg, tone, title, sec, tgt);
  };

  const allNotifications = useMemo(() => {
    if (!profile) return customNotifications;
    const dynamic = selectNotifications(profile);
    const map = new Map<string, GameNotification>();
    for (const rawItem of [...customNotifications, ...dynamic]) {
      const safeSec = resolveSafeSection(profile, rawItem.section);
      const item: GameNotification = safeSec === rawItem.section
        ? rawItem
        : { ...rawItem, section: safeSec, target: undefined };
      if (!map.has(item.id)) {
        map.set(item.id, item);
      }
    }
    const dismissed = new Set(profile.dismissedNotificationIds ?? []);
    return Array.from(map.values()).filter((n) => !dismissed.has(n.id));
  }, [profile, customNotifications]);

  const unreadNotificationsCount = useMemo(() => {
    const readSet = new Set(profile?.readNotificationIds ?? []);
    return allNotifications.filter((n) => !readSet.has(n.id)).length;
  }, [allNotifications, profile?.readNotificationIds]);

  const handleMarkNotificationRead = (notifId: string) => {
    if (!profile) return;
    const currentRead = new Set(profile.readNotificationIds ?? []);
    currentRead.add(notifId);
    const updated = {
      ...profile,
      readNotificationIds: Array.from(currentRead),
    };
    setProfile(updated);
    saveGame(updated, account?.id);
  };

  const handleMarkAllNotificationsRead = () => {
    if (!profile) return;
    const allIds = allNotifications.map((n) => n.id);
    const updated = {
      ...profile,
      readNotificationIds: Array.from(new Set([...(profile.readNotificationIds ?? []), ...allIds])),
    };
    setProfile(updated);
    saveGame(updated, account?.id);
  };

  const handleClearAllNotifications = () => {
    if (!profile) return;
    const allIds = allNotifications.map((n) => n.id);
    const updated = {
      ...profile,
      dismissedNotificationIds: Array.from(new Set([...(profile.dismissedNotificationIds ?? []), ...allIds])),
    };
    setCustomNotifications([]);
    setProfile(updated);
    saveGame(updated, account?.id);
  };

  const handleLuckySpinReward = (reward: { type: 'cash' | 'gold' | 'diamonds' | 'speed_card'; amount: number; label: string; wasFree?: boolean }) => {
    if (!profile) return;
    const next: PlayerProfile = {
      ...profile,
      lastSpinDay: profile.day,
      lastSpinTimestamp: reward.wasFree ? Date.now() : profile.lastSpinTimestamp,
      diamonds: reward.wasFree ? profile.diamonds : Math.max(0, (profile.diamonds ?? 0) - 2),
      ledger: [...(profile.ledger ?? [])],
      finances: { ...profile.finances },
    };
    if (reward.type === 'cash') {
      next.bankBalance = (next.bankBalance ?? 0) + reward.amount;
      next.finances.netProfit += reward.amount;
      next.finances.totalRevenue += reward.amount;
      next.ledger.push({
        id: `spin-cash-${Date.now()}`,
        category: 'revenue',
        amount: reward.amount,
        countryId: next.countryId,
        occurredAt: new Date().toISOString(),
        note: `مكافأة نقدية من عجلة الحظ (${reward.label})`,
      });
    } else if (reward.type === 'gold') {
      next.goldGrams = Number(((next.goldGrams ?? 0) + reward.amount).toFixed(2));
    } else if (reward.type === 'diamonds') {
      next.diamonds = (next.diamonds ?? 0) + reward.amount;
    } else if (reward.type === 'speed_card') {
      const existingCards = next.speedCards ? next.speedCards.map((c) => ({ ...c })) : [];
      const idx = existingCards.findIndex((c) => c.kind === 'production-instant');
      if (idx >= 0) existingCards[idx].quantity += 1;
      else existingCards.push({ kind: 'production-instant', quantity: 1 });
      next.speedCards = existingCards;
    }
    setProfile(next);
    saveGame(next, account?.id);
    showNotice(`🎉 مبروك! ربحت ${reward.label} من عجلة الحظ!`, 'success', 'مكافأة عجلة الحظ');
  };

  async function claimDailyLogin(nextAccount: LocalAccount) {
    if (nextAccount.isGuest) return;
    try {
      const seasons = await getVisibleSeasons();
      if (seasons[0]) await claimDailySeasonLogin(seasons[0].id);
    } catch {
      // Leaderboard availability must never block local gameplay or login.
    }
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryError('');
        setPasswordRecovery(true);
        setAuthLoading(false);
        clearWebRecoveryMarker();
      }
    });

    let disposed = false;
    let removeDeepLinkListener: (() => void) | undefined;

    async function handleRecoveryUrl(url: string) {
      const result = await handlePasswordRecoveryCallback(url);
      if (result.kind === 'ignored' || disposed) return;
      setRecoveryError(result.kind === 'error' ? result.message : '');
      setPasswordRecovery(true);
      setAuthLoading(false);
    }

    if (Capacitor.isNativePlatform()) {
      void (async () => {
        const listener = await CapacitorApp.addListener('appUrlOpen', ({ url }) => {
          void handleRecoveryUrl(url);
        });
        if (disposed) {
          void listener.remove();
          return;
        }
        removeDeepLinkListener = () => { void listener.remove(); };
        const launch = await CapacitorApp.getLaunchUrl();
        if (launch?.url) await handleRecoveryUrl(launch.url);
      })().catch(() => undefined);
    } else {
      const returnUrl = new URL(window.location.href);
      if (returnUrl.searchParams.get('auth') === 'recovery') {
        const callbackParams = new URLSearchParams(returnUrl.hash.replace(/^#/, ''));
        const hasCallbackError = Boolean(
          returnUrl.searchParams.get('error_description')
          ?? returnUrl.searchParams.get('error_code')
          ?? returnUrl.searchParams.get('error')
          ?? callbackParams.get('error_description')
          ?? callbackParams.get('error_code')
          ?? callbackParams.get('error'),
        );
        void supabase.auth.getSession().then(({ data }) => {
          if (disposed) return;
          setRecoveryError(hasCallbackError || !data.session
            ? 'رابط الاستعادة غير صالح أو انتهت صلاحيته. ارجع إلى تسجيل الدخول واطلب رابطًا جديدًا.'
            : '');
          setPasswordRecovery(true);
          setAuthLoading(false);
          clearWebRecoveryMarker();
        }).catch(() => {
          if (disposed) return;
          setRecoveryError('تعذر التحقق من رابط الاستعادة. تحقق من اتصالك ثم اطلب رابطًا جديدًا.');
          setPasswordRecovery(true);
          setAuthLoading(false);
        });
      }
    }

    return () => {
      disposed = true;
      subscription.unsubscribe();
      removeDeepLinkListener?.();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function initializeAccount() {
      try {
        let current = await loadCurrentAccount();
        if (cancelled) return;

        if (!current) {
          current = createGuestAccount();
        }
        setAccount(current);

        const local = loadSavedGame(current.id) ?? loadPendingInitialProfile(current.id)?.profile ?? null;
        if (local) {
          const loadedProfile = normalizeAccountFeatures(local, current.id);
          applyLoadedProfileState(loadedProfile);
          setAuthLoading(false);

          try {
            const idleRep = calculateOfflineIdleProgress(loadedProfile);
            if (idleRep && (idleRep.elapsedSeconds >= 120 || idleRep.isTampered)) {
              setOfflineReport(idleRep);
              setIsMorningReportOpen(true);
            }
          } catch (e) {
            console.error('Idle progress error', e);
          }
          recordOfflineHeartbeat(current.id);
        } else if (current.isGuest) {
          // New player without a save: proceed through the 7-step CountrySelection & Character Setup flow!
          applyLoadedProfileState(null);
          setAuthLoading(false);
          return;
        }

        if (current.isGuest) {
          void claimDailyLogin(current);
          return;
        }

        const localSnapshot = local ? JSON.stringify(local) : null;
        const remote = await loadRemoteGame(current.id);
        if (cancelled) return;
        const latestLocal = loadSavedGame(current.id);
        const queue = loadQueuedGameCommands(current.id);
        const initialPending = loadPendingInitialProfile(current.id);
        const localUnchanged = JSON.stringify(latestLocal) === localSnapshot;
        if (remote && !queue.length && !initialPending && localUnchanged) {
          applyLoadedProfileState(normalizeAccountFeatures(remote, current.id));
        } else if (!local && !remote) {
          applyLoadedProfileState(null);
        }
        setAuthLoading(false);
        void claimDailyLogin(current);
      } catch {
        if (!cancelled) setAuthLoading(false);
      }
    }
    void initializeAccount();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!account) {
      setPendingCommandCount(0);
      setSyncState('synced');
      return;
    }
    if (account.isGuest) {
      setPendingCommandCount(0);
      setSyncState('local');
      return;
    }
    const refreshStatus = () => {
      const queue = loadQueuedGameCommands(account.id);
      const initialProfile = loadPendingInitialProfile(account.id);
      const pendingCount = getPendingSyncCount(account.id) + Number(Boolean(initialProfile));
      setPendingCommandCount(pendingCount);
      if (queue.some((entry) => entry.status === 'blocked') || initialProfile?.status === 'blocked') setSyncState('blocked');
      else if (pendingCount && typeof navigator !== 'undefined' && !navigator.onLine) setSyncState('offline');
      else if (pendingCount) setSyncState('syncing');
      else setSyncState('synced');
    };
    const handleOnline = () => { void synchronizePendingCommands(false); };
    const handleOffline = () => refreshStatus();
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    refreshStatus();
    if (typeof navigator === 'undefined' || navigator.onLine) void synchronizePendingCommands(false);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [account?.id, account?.isGuest]);

  async function handleAuthenticated(nextAccount: LocalAccount) {
    setAccount(nextAccount);
    const local = loadSavedGame(nextAccount.id) ?? loadPendingInitialProfile(nextAccount.id)?.profile ?? null;
    if (local) applyLoadedProfileState(normalizeAccountFeatures(local, nextAccount.id));
    const localSnapshot = local ? JSON.stringify(local) : null;
    const remote = nextAccount.isGuest ? null : await loadRemoteGame(nextAccount.id);
    const latestLocal = loadSavedGame(nextAccount.id);
    const hasPendingSync = getPendingSyncCount(nextAccount.id) > 0;
    if (remote && !hasPendingSync && JSON.stringify(latestLocal) === localSnapshot) {
      applyLoadedProfileState(normalizeAccountFeatures(remote, nextAccount.id));
    } else if (!local && remote) {
      applyLoadedProfileState(normalizeAccountFeatures(remote, nextAccount.id));
    } else if (!local && !remote) {
      applyLoadedProfileState(null);
    }
    setActiveSection('home');
    setNotice('تم تسجيل الدخول مباشرة.');
    setNoticeTone('success');
    void claimDailyLogin(nextAccount);
  }

  async function recordVerifiedTransactions(previous: PlayerProfile, next: PlayerProfile) {
    if (!account || account.isGuest || !next.season?.seasonId) return;
    const productionIds = next.productionOrders
      .filter((order) => order.status === 'completed' && !previous.productionOrders.some((item) => item.id === order.id && item.status === 'completed'))
      .map((order) => order.id);
    const saleIds = next.sales.filter((sale) => !previous.sales.some((item) => item.id === sale.id)).map((sale) => sale.id);
    const contractIds = next.contracts
      .filter((contract) => contract.status === 'completed' && !previous.contracts.some((item) => item.id === contract.id && item.status === 'completed'))
      .map((contract) => contract.id);
    const auctionIds = next.auctionHistory
      .filter((bid) => bid.bidder === 'player' && !previous.auctionHistory.some((item) => item.id === bid.id))
      .map((bid) => bid.listingId);
    const transactions = [
      ...productionIds.map((sourceId) => ['production_completed', sourceId] as const),
      ...saleIds.map((sourceId) => ['sale_completed', sourceId] as const),
      ...contractIds.map((sourceId) => ['contract_delivered', sourceId] as const),
      ...auctionIds.map((sourceId) => ['auction_won', sourceId] as const),
    ];
    for (const [transactionType, sourceId] of transactions) {
      try {
        await recordVerifiedGameTransaction(next.season.seasonId, transactionType, sourceId);
      } catch {
        // Leaderboard outages must never block local gameplay.
      }
    }
  }

  function executeRemoteWithTimeout(command: GameCommand, commandKey: string): Promise<RemoteGameCommandAttempt> {
    const existing = remoteCommandAttempts.current.get(commandKey);
    if (existing) return existing;
    const attempt = new Promise<RemoteGameCommandAttempt>((resolve) => {
      const timer = window.setTimeout(() => resolve({ kind: 'unavailable' }), 3_500);
      void executeRemoteGameCommand(command, commandKey).then((attempt) => {
        window.clearTimeout(timer);
        resolve(attempt);
      }).catch(() => {
        window.clearTimeout(timer);
        resolve({ kind: 'unavailable' });
      });
    });
    remoteCommandAttempts.current.set(commandKey, attempt);
    void attempt.then(() => {
      if (remoteCommandAttempts.current.get(commandKey) === attempt) remoteCommandAttempts.current.delete(commandKey);
    }, () => {
      if (remoteCommandAttempts.current.get(commandKey) === attempt) remoteCommandAttempts.current.delete(commandKey);
    });
    return attempt;
  }

  async function synchronizePendingCommands(showSyncNotice = false): Promise<boolean> {
    if (!account || account.isGuest) return true;
    if (syncLock.current) return false;
    syncLock.current = true;
    let synchronizedCount = 0;
    try {
      const initialProfile = loadPendingInitialProfile(account.id);
      if (initialProfile?.status === 'blocked') {
        setSyncState('blocked');
        return false;
      }
      if (initialProfile) {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          setSyncState('offline');
          return false;
        }
        const initialized = await saveRemoteGame(account.id, initialProfile.profile);
        const authoritative = initialized ?? await loadRemoteGame(account.id);
        if (!authoritative) {
          setSyncState('offline');
          return false;
        }
        const savedInitial = saveGame(authoritative, account.id);
        if (!savedInitial.ok) {
          setSyncState('blocked');
          return false;
        }
        clearPendingInitialProfile(account.id);
        setProfile(normalizeAccountFeatures(authoritative, account.id));
        synchronizedCount += 1;
      }
      while (true) {
        const queue = loadQueuedGameCommands(account.id);
        setPendingCommandCount(queue.length + (loadPendingInitialProfile(account.id) ? 1 : 0));
        if (!queue.length) {
          setSyncState('synced');
          if (showSyncNotice && synchronizedCount > 0) {
            setNotice(`تمت مزامنة ${synchronizedCount} من خطوات عالمك.`);
            setNoticeTone('success');
          }
          return true;
        }
        const next = queue[0];
        if (next.status === 'blocked') {
          setSyncState('blocked');
          return false;
        }
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          setSyncState('offline');
          return false;
        }
        const attempt = await executeRemoteWithTimeout(next.command, next.commandKey);
        if (attempt.kind === 'unavailable') {
          setSyncState('offline');
          return false;
        }
        if (attempt.kind === 'rejected') {
          blockGameCommand(account.id, next.commandKey, `http_${attempt.status}`);
          setPendingCommandCount(getPendingSyncCount(account.id));
          setSyncState('blocked');
          return false;
        }
        if (!attempt.result.ok) {
          blockGameCommand(account.id, next.commandKey, attempt.result.reason);
          setPendingCommandCount(getPendingSyncCount(account.id));
          setSyncState('blocked');
          return false;
        }
        const saved = saveGame(attempt.result.profile, account.id);
        if (!saved.ok) {
          blockGameCommand(account.id, next.commandKey, 'local_save_failed');
          setPendingCommandCount(getPendingSyncCount(account.id));
          setSyncState('blocked');
          return false;
        }
        setProfile(normalizeAccountFeatures(attempt.result.profile, account.id));
        acknowledgeGameCommand(account.id, next.commandKey);
        synchronizedCount += 1;
      }
    } finally {
      syncLock.current = false;
      const remaining = loadQueuedGameCommands(account.id);
      setPendingCommandCount(getPendingSyncCount(account.id));
      if (remaining.some((entry) => entry.status === 'blocked') || loadPendingInitialProfile(account.id)?.status === 'blocked') setSyncState('blocked');
    }
  }

  async function refreshAuthoritativeProfile() {
    if (!account || account.isGuest) return;
    if (getPendingSyncCount(account.id) > 0) {
      const synchronized = await synchronizePendingCommands(false);
      if (!synchronized || getPendingSyncCount(account.id) > 0) return;
    }
    if (syncLock.current) return;
    const latest = await loadRemoteGame(account.id);
    if (!latest || getPendingSyncCount(account.id) > 0) return;
    const normalized = normalizeAccountFeatures(latest, account.id);
    const saved = saveGame(normalized, account.id);
    if (!saved.ok) return;
    setProfile(normalized);
    setSyncState('synced');
  }

  function handlePlayAsGuest() {
    const guest = createGuestAccount();
    setAccount(guest);
    const guestProfile = loadSavedGame(guest.id);
    if (!guestProfile) {
      setPlayerName('');
      setSelectedCountryId(COUNTRIES[0].id);
      setSelectedAvatarId(DEFAULT_AVATAR_ID);
    }
    applyLoadedProfileState(guestProfile ? normalizeAccountFeatures(guestProfile, guest.id) : null);
    setLinkingAccount(false);
    setNotice(guestProfile ? 'أهلاً بك مجدداً في جلسة الضيف.' : 'جلسة ضيف جديدة. اختر اسمك وشخصيتك ودولتك للبدء.');
    setNoticeTone('success');
  }

  function handleResetToCountrySelection() {
    resetWalkthrough();
    applyLoadedProfileState(null);
    setPlayerName('');
    setSelectedCountryId(COUNTRIES[0].id);
    setSelectedAvatarId(DEFAULT_AVATAR_ID);
    setNotice('اختر اسمك ومظهرك ودولتك لبدء عالم جديد مستقل.');
    setNoticeTone('success');
  }

  function handleAccountDeleted() {
    resetWalkthrough();
    applyLoadedProfileState(null);
    setPlayerName('');
    setSelectedCountryId(COUNTRIES[0].id);
    setSelectedAvatarId(DEFAULT_AVATAR_ID);
    const freshGuest = createGuestAccount();
    setAccount(freshGuest);
    setNotice('تم مسح الحساب والبيانات بنجاح. مرحباً بك في بداية جديدة لإمبراطوريتك!');
    setNoticeTone('success');
    setActiveSection('home');
  }

  async function handleLinkedAccount(nextAccount: LocalAccount) {
    if (!account?.isGuest) {
      setLinkingAccount(false);
      await handleAuthenticated(nextAccount);
      return;
    }
    const guestProfile = profile ?? loadSavedGame(account.id);
    let linkTone: 'success' | 'error' = 'success';
    const existingCloudProfile = await loadRemoteGame(nextAccount.id);
    if (existingCloudProfile) {
      applyLoadedProfileState(normalizeAccountFeatures(existingCloudProfile, nextAccount.id));
      setNotice('تم فتح عالم الحساب الموجود. حفظ الضيف لم يُحذف من هذا الجهاز.');
    } else if (guestProfile) {
      const guestCountry = findCountry(guestProfile.countryId) ?? COUNTRIES[0];
      const freshCloudProfile = normalizeAccountFeatures(
        createNewPlayer(guestCountry, guestProfile.name, new Date(), guestProfile.avatarId),
        nextAccount.id,
      );
      const localCreated = saveGame(freshCloudProfile, nextAccount.id);
      const queued = localCreated.ok && queueInitialProfile(nextAccount.id, freshCloudProfile);
      applyLoadedProfileState(freshCloudProfile);
      if (queued) setSyncState(typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'syncing');
      else {
        setSyncState('blocked');
        linkTone = 'error';
      }
      setNotice(queued
        ? 'تم ربط الحساب وبدأ عالم جديد لحماية الأرصدة. حفظ الضيف السابق ما زال على هذا الجهاز ولم يُنقل.'
        : 'تم ربط الحساب، لكن تعذر تجهيز مزامنة العالم الجديد. لم يُرفع حفظ الضيف؛ تحقق من مساحة التخزين ثم أعد المحاولة.');
    } else {
      applyLoadedProfileState(null);
      setNotice('تم ربط الحساب. ابدأ عالمك الجديد الآن.');
    }
    setAccount(nextAccount);
    setActiveSection('home');
    setLinkingAccount(false);
    setNoticeTone(linkTone);
  }

  const country = findCountry(profile?.countryId ?? selectedCountryId) ?? COUNTRIES[0];

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 4200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    saveNotificationTheme(notificationTheme);
  }, [notificationTheme]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest('button, [role="button"]') as HTMLButtonElement | null;
      if (!button || button.disabled || button.dataset.sound === 'none') return;
      playSound('click');
    };
    document.addEventListener('pointerdown', handlePointerDown, { passive: true });
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  function startNewWorld() {
    const chosenCountry = findCountry(selectedCountryId);
    if (!chosenCountry) return;
    resetWalkthrough();
    const newProfile = normalizeAccountFeatures(
      createNewPlayer(chosenCountry, playerName, new Date(), selectedAvatarId),
      account?.id,
    );
    const result = saveGame(newProfile, account?.id);
    recordOfflineHeartbeat(account?.id ?? newProfile.id);
    if (account && !account.isGuest) {
      const queued = queueInitialProfile(account.id, newProfile);
      setPendingCommandCount(getPendingSyncCount(account.id) + Number(Boolean(loadPendingInitialProfile(account.id))));
      setSyncState(queued ? (typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'syncing') : 'blocked');
      if (queued) void synchronizePendingCommands(false);
    }
    setProfile(newProfile);
    setActiveSection('home');
    setMobileMenuOpen(false);
    // Step 5 of the 7-Step Flow: Open Country-Specific StoryIntro once!
    setIsTutorialOpen(true);
    setIsWalkthroughActive(false);
    setWalkthroughOverrideStep(null);
    setWalkthroughStepIndex(0);
    showNotice(
      result.ok ? `تم استلام أصول البداية في ${chosenCountry.name} وحفظ عالمك بنجاح! 🌍` : 'تعذر حفظ البيانات محليًا؛ قد لا يستمر التقدم بعد إغلاق الصفحة.',
      result.ok ? 'success' : 'danger',
      'بداية إمبراطورية جديدة',
      'home',
    );
  }

  function completeIntro() {
    if (!profile) return;
    const alreadyCompleted = Boolean(profile.onboarding.introCompleted && profile.onboarding.countryIntroSeen);
    const nextProfile: PlayerProfile = {
      ...profile,
      onboarding: {
        ...profile.onboarding,
        introCompleted: true,
        countryIntroSeen: true,
        chapter: Math.max(1, profile.onboarding.chapter || 1),
      },
    };
    saveGame(nextProfile, account?.id);
    if (account && !account.isGuest) setSyncState('local');
    setProfile(nextProfile);
    setIsTutorialOpen(false);
    playSound('success');

    // Step 7 of the 7-Step Flow: Begin Chapter 1 + First Main Quest + Interactive Spotlight Walkthrough
    if (!isWalkthroughCompleted(nextProfile)) {
      const stepIdx = getSavedWalkthroughStepIndex(nextProfile);
      setWalkthroughStepIndex(stepIdx);
      setWalkthroughOverrideStep(null);
      setIsWalkthroughActive(true);
    }
    if (!alreadyCompleted) {
      showNotice(
        `انطلق الفصل الأول في ${country.name}: ابدأ بصيانة المصنع الموروث ومتابعة المهمة الرئيسية الأولى.`,
        'success',
        'انطلاق الفصل الأول',
        'companies',
      );
    }
  }

  function handleGameResult<T>(result: GameResult<T>, options: { syncRemote?: boolean } = {}) {
    if (!result.ok) {
      playSound('error');
      showNotice(result.message, 'danger', 'تنبيه النظام');
      return;
    }
    const saved = saveGame(result.profile, account?.id);
    if (options.syncRemote !== false && account && !account.isGuest) setSyncState('local');
    const settledAmount = Math.max(0, (profile?.payables ?? result.profile.payables) - result.profile.payables);
    const settlementNote = settledAmount > 0 ? ` وُجّه ${formatMoney(settledAmount, country)} لسداد التزامات سابقة.` : '';
    setProfile(result.profile);
    playSound('success');
    showNotice(
      saved.ok ? `${result.message}${settlementNote}` : `${result.message}${settlementNote} تعذر تثبيت الحفظ على هذا الجهاز.`,
      saved.ok ? 'success' : 'danger',
      'تحديث العملية',
    );
  }

  async function executeCommandForProfile(
    baseProfile: PlayerProfile,
    command: GameCommand,
    fallback: (current: PlayerProfile) => GameResult<unknown>,
  ): Promise<{ result: GameResult<unknown>; source: 'remote' | 'queued' | 'local' | 'blocked' }> {
    if (!account || account.isGuest) return { result: fallback(baseProfile), source: 'local' };
    const isOnline = () => typeof navigator === 'undefined' || navigator.onLine;
    let currentProfile = baseProfile;
    let priorSyncSucceeded = true;
    let pendingBefore = loadQueuedGameCommands(account.id);
    let initialPending = loadPendingInitialProfile(account.id);
    if ((pendingBefore.length || initialPending) && isOnline()) {
      priorSyncSucceeded = await synchronizePendingCommands(false);
      currentProfile = loadSavedGame(account.id) ?? currentProfile;
      pendingBefore = loadQueuedGameCommands(account.id);
      initialPending = loadPendingInitialProfile(account.id);
    }

    const commandKey = createGameCommandKey();
    const queued = enqueueGameCommand(account.id, command, commandKey);
    setPendingCommandCount(getPendingSyncCount(account.id));
    let networkUnavailable = false;
    if (!pendingBefore.length && !initialPending && isOnline()) {
      const attempt = await executeRemoteWithTimeout(command, commandKey);
      if (attempt.kind === 'result') {
        if (queued) acknowledgeGameCommand(account.id, commandKey);
        const remaining = loadQueuedGameCommands(account.id);
        setPendingCommandCount(getPendingSyncCount(account.id));
        setSyncState(remaining.some((entry) => entry.status === 'blocked') || loadPendingInitialProfile(account.id)?.status === 'blocked' ? 'blocked' : getPendingSyncCount(account.id) ? 'syncing' : 'synced');
        return { result: attempt.result, source: 'remote' };
      }
      if (attempt.kind === 'rejected') {
        if (queued && attempt.status === 409) blockGameCommand(account.id, commandKey, `http_${attempt.status}`);
        else if (queued) acknowledgeGameCommand(account.id, commandKey);
        const remaining = loadQueuedGameCommands(account.id);
        setPendingCommandCount(getPendingSyncCount(account.id));
        setSyncState(remaining.some((entry) => entry.status === 'blocked') || loadPendingInitialProfile(account.id)?.status === 'blocked' ? 'blocked' : getPendingSyncCount(account.id) ? 'syncing' : 'synced');
        return {
          result: { ok: false, profile: currentProfile, reason: 'condition-not-met', message: attempt.message },
          source: 'blocked',
        };
      }
      networkUnavailable = true;
    }

    const result = fallback(currentProfile);
    if (!result.ok && queued) acknowledgeGameCommand(account.id, commandKey);
    const remaining = loadQueuedGameCommands(account.id);
    setPendingCommandCount(getPendingSyncCount(account.id));
    if (remaining.some((entry) => entry.status === 'blocked') || loadPendingInitialProfile(account.id)?.status === 'blocked') setSyncState('blocked');
    else if (getPendingSyncCount(account.id)) setSyncState(networkUnavailable || !priorSyncSucceeded || !isOnline() ? 'offline' : 'syncing');
    else if (networkUnavailable || !isOnline() || !queued) setSyncState('offline');
    return { result, source: queued ? 'queued' : 'local' };
  }

  async function handleGameCommand(command: GameCommand, fallback: (current: PlayerProfile) => GameResult<unknown>) {
    if (!profile) return;
    const previousProfile = profile;
    const execution = await executeCommandForProfile(profile, command, fallback);
    if (execution.source === 'remote' && execution.result.ok) void recordVerifiedTransactions(previousProfile, execution.result.profile);
    if (execution.source === 'blocked' && !execution.result.ok) return;
    handleGameResult(execution.result, { syncRemote: false });
  }

  async function handleRedeemed(_nextProfile: PlayerProfile, message: string, _codeId: string, rawCode: string): Promise<boolean> {
    if (!account || account.isGuest) {
      setNotice('استرداد الأكواد يحتاج حسابًا؛ يمكنك ربط حساب من الإعدادات.');
      setNoticeTone('error');
      return false;
    }
    const authoritative = await redeemRemoteReward(rawCode);
    if (!authoritative) return false;
    const saved = saveGame(authoritative, account.id);
    setProfile(authoritative);
    setNotice(saved.ok ? message : `${message} تعذر تثبيت الحفظ على هذا الجهاز.`);
    setNoticeTone(saved.ok ? 'success' : 'error');
    return true;
  }

  async function handleDaysElapsed(days: number) {
    if (!profile) return;
    let current = profile;
    let completedDays = 0;
    let latestDayMessage = '';
    for (let index = 0; index < days; index += 1) {
      const previousProfile = current;
      const execution = await executeCommandForProfile(current, { name: 'advance_day', args: {} }, advanceDay);
      const result = execution.result;
      if (!result.ok) {
        setNotice(result.message);
        setNoticeTone('error');
        break;
      }
      if (execution.source === 'remote') void recordVerifiedTransactions(previousProfile, result.profile);
      current = result.profile;
      saveGame(current, account?.id);
      completedDays += 1;
      latestDayMessage = result.message;
    }
    if (completedDays === 0) return;

    const stockState = loadStockMarketState(current.id);
    const isSeasonalMilestone = current.day % 5 === 0;
    const dividendRes = disburseHybridDividends(current, stockState, isSeasonalMilestone);
    if (dividendRes.payout > 0) {
      current = dividendRes.updatedProfile;
    }

    const saved = saveGame(current, account?.id);
    setProfile(current);
    const elapsedLabel = `${completedDays} ${completedDays === 1 ? 'يوم' : 'أيام'}`;
    let summary = completedDays > 1 ? `تم ترحيل ${elapsedLabel}. آخر ملخص: ${latestDayMessage}` : latestDayMessage;
    if (dividendRes.payout > 0) {
      summary += ` | أرباح الأسهم المودعة: +${formatMoney(dividendRes.payout, country)}`;
    }
    setNotice(saved.ok ? summary : `${summary} تعذر تثبيت الحفظ على هذا الجهاز.`);
    setNoticeTone(saved.ok ? 'success' : 'error');

    // Trigger country-isolated, progression-gated advisor alert
    const eligibleAlerts = getLocalizedStoryEventAlerts(current);
    if (eligibleAlerts.length > 0) {
      const alertIndex = current.day % eligibleAlerts.length;
      setActiveStoryEvent(eligibleAlerts[alertIndex]);
    }
  }

  function navigate(section: SectionId, focus?: string) {
    if (!profile || !isSectionUnlocked(profile, section)) {
      playSound('error');
      setNotice(profile ? getSectionUnlockHint(profile, section) : 'ابدأ عالمك أولًا لفتح أنظمة اللعبة.');
      setNoticeTone('error');
      return;
    }
    const isDifferentSection = activeSection !== section;
    setActiveSection(section);
    setSectionFocus(focus);
    if (!isWalkthroughActive && section !== 'home' && section !== 'profile' && !profile.onboarding.seenGuides.includes(section)) {
      setPendingGuide(section);
      playSound('unlock');
    }
    setMobileMenuOpen(false);
    if (isDifferentSection && !focus) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleLogout() {
    if (account && !account.isGuest) void logoutAccount();
    setAccount(null);
    applyLoadedProfileState(null);
    setLinkingAccount(false);
  }

  const handleRestartWalkthrough = () => {
    if (!profile) return;
    resetWalkthrough();
    const stepIdx = getSavedWalkthroughStepIndex({
      ...profile,
      onboarding: { ...profile.onboarding, walkthroughStepId: undefined },
    });
    const nextProfile: PlayerProfile = {
      ...profile,
      onboarding: {
        ...profile.onboarding,
        walkthroughCompleted: false,
        walkthroughSkipped: false,
        walkthroughStepId: WALKTHROUGH_STEPS[stepIdx]?.id ?? WALKTHROUGH_STEPS[0].id,
      },
    };
    setProfile(nextProfile);
    saveGame(nextProfile, account?.id);
    setWalkthroughOverrideStep(null);
    setWalkthroughStepIndex(stepIdx);
    setIsWalkthroughActive(true);
  };

  if (passwordRecovery) {
    return (
      <PasswordResetGate
        errorMessage={recoveryError || undefined}
        onBack={() => { setPasswordRecovery(false); setRecoveryError(''); }}
        onComplete={(recoveredAccount) => {
          setPasswordRecovery(false);
          setRecoveryError('');
          void handleAuthenticated(recoveredAccount);
        }}
      />
    );
  }
  if (authLoading) return <div className="account-loading">جارٍ فتح حسابك...</div>;
  if (linkingAccount && account?.isGuest) return <AccountGate onAuthenticated={handleLinkedAccount} onPlayAsGuest={() => setLinkingAccount(false)} onCancel={() => setLinkingAccount(false)} />;
  if (!account) return <AccountGate onAuthenticated={handleAuthenticated} onPlayAsGuest={handlePlayAsGuest} />;

  if (!profile) {
    return (
      <>
        <CountrySelection
          selectedCountryId={selectedCountryId}
          selectedAvatarId={selectedAvatarId}
          playerName={playerName}
          onCountryChange={setSelectedCountryId}
          onAvatarChange={setSelectedAvatarId}
          onPlayerNameChange={setPlayerName}
          onStart={startNewWorld}
        />
        <FlyingToast
          alert={activeToastAlert}
          onDismiss={() => setActiveToastAlert(null)}
          onOpenNotifications={() => setIsNotificationModalOpen(true)}
          onNavigate={navigate}
        />
      </>
    );
  }

  const showStoryIntroModal = isTutorialOpen || (!profile.onboarding.countryIntroSeen && !profile.onboarding.introCompleted);
  const unlockedSections = new Set(getUnlockedSectionIds(profile));

  return (
    <div className="app-frame">
      <ResourceBar
        profile={profile}
        country={country}
        onNavigate={navigate}
        syncState={!account || account.isGuest ? 'local' : syncState}
        pendingCommandCount={pendingCommandCount}
        onDaysElapsed={handleDaysElapsed}
        onOpenWardrobe={() => setIsAvatarWardrobeOpen(true)}
        onOpenWalkthrough={handleRestartWalkthrough}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        forceBellVibrate={forceBellVibrate}
      />

      <div className="app-layout w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <aside className="side-nav hidden lg:flex" aria-label="أقسام اللعبة">
          <div className="side-nav-caption">إدارة الإمبراطورية</div>
          {SECTION_GROUPS.map((group) => (
            <div className="nav-group" key={group.id}>
              <div className="nav-group-label">{group.label}</div>
              {group.sections.map((sectionId) => {
                const section = getSection(sectionId);
                const unlocked = unlockedSections.has(section.id);
                const reqLevel = getSectionRequiredLevel(section.id);
                return (
                  <button
                    className={`nav-item${activeSection === section.id ? ' is-active' : ''}${!unlocked ? ' is-locked' : ''}`}
                    type="button"
                    key={section.id}
                    data-guide-nav={section.id}
                    onClick={() => navigate(section.id)}
                    aria-current={activeSection === section.id ? 'page' : undefined}
                    title={unlocked ? section.label : getSectionUnlockHint(profile, section.id)}
                  >
                    <Icon name={unlocked ? section.icon : 'lock'} size={19} />
                    <span className="flex-1 text-right">{section.label}</span>
                    {!unlocked && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/40">
                        مستوى {reqLevel}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
          <div className="side-nav-note"><Icon name="shield" size={16} /><span>{!account || account.isGuest ? <>حفظ<br />على هذا الجهاز</> : syncState === 'offline' ? <>اللعب مستمر<br />بانتظار الاتصال</> : syncState === 'blocked' ? <>حماية التقدم<br />مراجعة الحفظ</> : syncState === 'syncing' ? <>جارٍ حفظ<br />خطواتك</> : <>حفظ آمن<br />ومحدّث</>}</span></div>
        </aside>

        <main className="main-content flex-1 w-full min-w-0 pb-24 md:pb-8">
          {activeSection === 'home' ? (
            <Dashboard
              profile={profile}
              country={country}
              onNavigate={navigate}
              onCommand={handleGameCommand}
              onOpenLuckyWheel={() => setIsLuckyWheelOpen(true)}
              onOpenTutorial={() => setIsTutorialOpen(true)}
              onOpenCampaignHub={() => setIsCampaignHubOpen(true)}
              onOpenMorningReport={() => {
                triggerHaptic('light');
                const rep = offlineReport || calculateOfflineIdleProgress(profile);
                if (rep && (rep.elapsedSeconds >= 120 || rep.isTampered)) {
                  setOfflineReport(rep);
                  setIsMorningReportOpen(true);
                } else {
                  showNotice(
                    'لا توجد أرباح غياب متراكمة حالياً؛ تُحتسب أرباح المصانع والأسهم تلقائياً عند إغلاق اللعبة لأكثر من دقيقتين.',
                    'info',
                    'تقرير الصباح لغياب المدير',
                  );
                }
              }}
              onOpenCentralBank={() => {
                if (!isSectionUnlocked(profile, 'bank')) {
                  showNotice(getSectionUnlockHint(profile, 'bank'), 'warning', 'البنك مقفل حالياً');
                  return;
                }
                triggerHaptic('light');
                setIsCentralBankModalOpen(true);
              }}
              onOpenPrestige={() => {
                if (!isSectionUnlocked(profile, 'luxury')) {
                  showNotice(getSectionUnlockHint(profile, 'luxury'), 'warning', 'نظام الهيبة مقفل حالياً');
                  return;
                }
                triggerHaptic('light');
                setIsPrestigeModalOpen(true);
              }}
              onOpenStrategicPillars={() => {
                triggerHaptic('light');
                setIsStrategicPillarsOpen(true);
              }}
              onUpdateProfile={(updater) => {
                setProfile((prev) => {
                  if (!prev) return prev;
                  const next = updater(prev);
                  saveGame(next, account?.id);
                  return next;
                });
              }}
              onMarkBriefingSeen={(questId) => {
                setProfile((prev) => {
                  if (!prev) return prev;
                  if (prev.onboarding.seenQuestBriefings?.includes(questId)) return prev;
                  const next: PlayerProfile = {
                    ...prev,
                    onboarding: {
                      ...prev.onboarding,
                      seenQuestBriefings: [...(prev.onboarding.seenQuestBriefings ?? []), questId],
                    },
                  };
                  saveGame(next, account?.id);
                  return next;
                });
              }}
              onStartGuidedWalkthrough={(quest: CountryStoryQuest) => {
                const resolved = resolveQuestWalkthroughTarget(quest, profile);
                if (resolved.mode === 'core') {
                  setWalkthroughOverrideStep(null);
                  setWalkthroughStepIndex(resolved.stepIndex);
                  setIsWalkthroughActive(true);
                } else {
                  setWalkthroughOverrideStep(resolved.step);
                  setIsWalkthroughActive(true);
                }
              }}
              onClaimReward={(cash, diamonds, questId) => {
                let claimedOk = false;
                setProfile((prev) => {
                  if (!prev) return prev;
                  const alreadyClaimed = prev.onboarding.claimedStoryQuestIds?.includes(questId);
                  const scenarioQuest = getCountryScenario(prev.countryId).quests.find((q) => q.id === questId);
                  if (alreadyClaimed || (scenarioQuest && !scenarioQuest.isCompleted(prev))) {
                    return prev;
                  }
                  claimedOk = true;
                  const nextLedger = [...(prev.ledger ?? [])];
                  if (cash > 0) {
                    nextLedger.push({
                      id: `story-quest-${questId}-${prev.ledger.length}`,
                      category: 'revenue',
                      amount: cash,
                      countryId: prev.countryId,
                      occurredAt: new Date().toISOString(),
                      note: `مكافأة إنجاز مهمة القصة: ${scenarioQuest?.title ?? questId}`,
                    });
                  }
                  const next: PlayerProfile = {
                    ...prev,
                    bankBalance: prev.bankBalance + cash,
                    diamonds: prev.diamonds + diamonds,
                    finances: {
                      ...prev.finances,
                      netProfit: prev.finances.netProfit + cash,
                      totalRevenue: prev.finances.totalRevenue + cash,
                    },
                    ledger: nextLedger,
                    onboarding: {
                      ...prev.onboarding,
                      claimedStoryQuestIds: [...(prev.onboarding.claimedStoryQuestIds ?? []), questId],
                    },
                  };
                  saveGame(next, account?.id);
                  return next;
                });
                if (claimedOk) {
                  showNotice(`تم استلام مكافأة المهمة: +${cash.toLocaleString()} $ و +${diamonds} ألماسة! 🎁`, 'success', 'مكافأة مهمة القصة');
                }
              }}
            />
          ) : activeSection === 'profile' ? (
            <ProfilePage
              profile={profile}
              country={country}
              accountId={account.id}
              isGuest={Boolean(account.isGuest)}
              isSynced={!account.isGuest && syncState === 'synced' && pendingCommandCount === 0}
              userEmail={account?.isGuest ? '' : (account?.email || '')}
              onLinkAccount={() => setLinkingAccount(true)}
              onLogout={handleLogout}
              onResetWorld={handleResetToCountrySelection}
              onAccountDeleted={handleAccountDeleted}
              onRestartWalkthrough={handleRestartWalkthrough}
              onOpenWardrobe={() => setIsAvatarWardrobeOpen(true)}
              onUpdateProfile={(updater) => {
                setProfile((prev) => {
                  if (!prev) return prev;
                  const next = updater(prev);
                  saveGame(next, account?.id);
                  return next;
                });
              }}
            />
          ) : (
            <SectionPage
              section={getSection(activeSection)}
              profile={profile}
              country={country}
              focus={sectionFocus}
              notificationTheme={notificationTheme}
              isGuest={Boolean(account.isGuest)}
              onNotificationThemeChange={setNotificationTheme}
              onHome={() => navigate('home')}
              onNavigate={(section) => navigate(section)}
              onAction={handleGameResult}
              onCommand={handleGameCommand}
              onRedeemed={handleRedeemed}
              onRefreshProfile={refreshAuthoritativeProfile}
              onLinkAccount={() => setLinkingAccount(true)}
              onLogout={handleLogout}
              onShowGuide={() => setPendingGuide(activeSection)}
              onProfileUpdate={(updated) => {
                setProfile(updated);
                saveGame(updated, account?.id);
              }}
            />
          )}
        </main>
      </div>

      <RightActionHub
        profile={profile}
        country={country}
        onNavigate={navigate}
        onOpenLuckyWheel={() => setIsLuckyWheelOpen(true)}
        onCollectActualProfit={(amount: number) => {
          if (!profile || amount <= 0) return;
          const nextBalance = profile.bankBalance + amount;
          const newEntry: FinanceLedgerEntry = {
            id: `ledger-actual-profit-${profile.day}-${Date.now()}`,
            category: 'revenue',
            amount,
            countryId: profile.countryId,
            occurredAt: new Date().toISOString(),
            note: `الجمع الفعلي لأرباح الشركات والمنشآت (${profile.companies.length} شركات)`,
          };
          const nextFinances = {
            ...profile.finances,
            netProfit: (profile.finances?.netProfit ?? 0) + amount,
            totalRevenue: (profile.finances?.totalRevenue ?? 0) + amount,
          };
          const nextProfile: PlayerProfile = {
            ...profile,
            bankBalance: nextBalance,
            finances: nextFinances,
            ledger: [newEntry, ...(profile.ledger ?? [])],
          };
          saveGame(nextProfile, account?.id);
          setProfile(nextProfile);
          showNotice(
            `تم تحصيل الأرباح الفعلية بنجاح! تم إيداع +${formatMoney(amount, country)} في خزينتك.`,
            'success',
            'تحصيل أرباح الشركات',
            isSectionUnlocked(nextProfile, 'bank') ? 'bank' : 'home',
          );
        }}
        onSellProduct={(productId: string, quantity: number) => {
          void handleGameCommand(
            { name: 'sell_product', args: { productId, quantity } },
            (curr) => sellProduct(curr, productId, quantity),
          );
        }}
        onAdvanceDay={() => void handleDaysElapsed(1)}
        onOpenStoryCampaign={() => {
          triggerHaptic('light');
          setIsCampaignHubOpen(true);
        }}
        onOpenStrategicPillars={() => {
          triggerHaptic('light');
          setIsStrategicPillarsOpen(true);
        }}
        onAcceptBotOffer={(offerId) => {
          void handleGameCommand(
            { name: 'accept_bot_offer', args: { offerId } },
            (curr) => acceptBotMarketOffer(curr, offerId),
          );
        }}
        onProfileUpdate={(updated) => {
          setProfile(updated);
          saveGame(updated, account?.id);
        }}
      />

      <FlyingToast
        alert={activeToastAlert}
        onDismiss={() => setActiveToastAlert(null)}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        onNavigate={navigate}
      />

      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notifications={allNotifications}
        readNotificationIds={profile.readNotificationIds ?? []}
        onNavigate={navigate}
        onMarkRead={handleMarkNotificationRead}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onClearAll={handleClearAllNotifications}
      />
      {pendingGuide && (
        <SystemGuideModal
          section={pendingGuide}
          onClose={() => {
            if (!profile) return;
            const seenGuides = profile.onboarding.seenGuides.includes(pendingGuide)
              ? profile.onboarding.seenGuides
              : [...profile.onboarding.seenGuides, pendingGuide];
            const nextProfile: PlayerProfile = {
              ...profile,
              onboarding: { ...profile.onboarding, chapter: chapterFor(profile), seenGuides },
            };
            saveGame(nextProfile, account?.id);
            if (account && !account.isGuest) setSyncState('local');
            setProfile(nextProfile);
            setPendingGuide(null);
          }}
        />
      )}
      {activeStoryEvent && (
        <StoryEventPopup
          event={activeStoryEvent}
          profile={profile}
          country={country}
          onClose={() => setActiveStoryEvent(null)}
          onNavigate={(sec) => navigate(sec)}
        />
      )}
      {expansion && !showStoryIntroModal && (
        <DynamicEconomyEvents
          profile={profile}
          expansion={expansion}
          onUpdate={(updatedProf, updatedExp) => {
            setExpansion(updatedExp);
            setProfile(updatedProf);
            saveGame(updatedProf, account?.id);
          }}
        />
      )}

      <DailyLuckySpinModal
        isOpen={isLuckyWheelOpen}
        onClose={() => setIsLuckyWheelOpen(false)}
        profile={profile}
        onRewardWon={handleLuckySpinReward}
      />

      <CelebrationModal
        data={celebrationData}
        onClose={() => setCelebrationData(null)}
      />

      <MobileBottomNav
        activeSection={activeSection}
        onNavigate={navigate}
        onOpenLuckyWheel={() => setIsLuckyWheelOpen(true)}
        isFreeSpinAvailable={getLuckySpinState(profile.lastSpinTimestamp).isFree}
        profile={profile}
      />

      {/* Interactive Multi-Step Spotlight Guided Walkthrough (Never grants rewards on skip or arrow click) */}
      {!showStoryIntroModal && isWalkthroughActive && (
        <SpotlightWalkthrough
          currentStepIndex={walkthroughStepIndex}
          overrideStep={walkthroughOverrideStep}
          profile={profile}
          currentSection={activeSection}
          onNavigate={(sec) => navigate(sec)}
          onStepComplete={() => {
            if (walkthroughOverrideStep) {
              setWalkthroughOverrideStep(null);
              setIsWalkthroughActive(false);
              playSound('success');
              showNotice(
                'أحسنت! أتممت خطوة المهمة بيدك — يمكنك استلام مكافأة المهمة من لوحة مهام القصة.',
                'success',
                'اكتمل الإرشاد العملي',
                'home',
              );
              return;
            }
            if (walkthroughStepIndex < WALKTHROUGH_STEPS.length - 1) {
              const nextIdx = walkthroughStepIndex + 1;
              const nextStepId = WALKTHROUGH_STEPS[nextIdx]?.id;
              setWalkthroughStepIndex(nextIdx);
              setSavedWalkthroughStepIndex(nextIdx);
              setProfile((prev) => {
                if (!prev) return prev;
                const updated: PlayerProfile = {
                  ...prev,
                  onboarding: {
                    ...prev.onboarding,
                    walkthroughStepId: nextStepId,
                  },
                };
                saveGame(updated, account?.id);
                return updated;
              });
            } else {
              setIsWalkthroughActive(false);
              setWalkthroughCompleted(true);
              setProfile((prev) => {
                if (!prev) return prev;
                const updated: PlayerProfile = {
                  ...prev,
                  onboarding: {
                    ...prev.onboarding,
                    walkthroughCompleted: true,
                    walkthroughSkipped: false,
                    walkthroughStepId: undefined,
                  },
                };
                saveGame(updated, account?.id);
                return updated;
              });
              playSound('levelUp');
              setCelebrationData({
                title: 'أكملت الجولة الإرشادية العملية بنجاح! 👑',
                subtitle: 'أحسنت! أتقنت بيدك صيانة المصنع، وتسوية الالتزامات، وشراء الأراضي والخامات، وتشغيل الإنتاج وتحصيل المهام.',
                rewardText: 'جاهزية قيادية كاملة · تابع مهام القصة في الرئيسية لاستلام مكافآتها الفعلية',
              });
            }
          }}
          onSkip={() => {
            if (walkthroughOverrideStep) {
              setWalkthroughOverrideStep(null);
              setIsWalkthroughActive(false);
              return;
            }
            setIsWalkthroughActive(false);
            setWalkthroughCompleted(true);
            setProfile((prev) => {
              if (!prev) return prev;
              const updated: PlayerProfile = {
                ...prev,
                onboarding: {
                  ...prev.onboarding,
                  walkthroughSkipped: true,
                  walkthroughStepId: WALKTHROUGH_STEPS[walkthroughStepIndex]?.id,
                },
              };
              saveGame(updated, account?.id);
              return updated;
            });
          }}
        />
      )}

      {/* Country-Specific Story Intro Modal (Shown Once After Character/Country Creation, or On-Demand via Help) */}
      {showStoryIntroModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-md overflow-y-auto">
          <StoryIntro
            profile={profile}
            onComplete={completeIntro}
          />
        </div>
      )}

      {/* Country-Specific 4-Chapter Campaign & Rivals Hub */}
      {isCampaignHubOpen && (
        <StoryCampaignHub
          profile={profile}
          country={country}
          onClose={() => setIsCampaignHubOpen(false)}
          onClaimReward={(diamonds, gold, money, reputationDelta = 0, chapterId = 1) => {
            let rewarded = false;
            setProfile((prev) => {
              if (!prev) return prev;
              if (prev.onboarding.claimedCampaignChapters?.includes(chapterId)) return prev;
              rewarded = true;
              const nextLedger = [...(prev.ledger ?? [])];
              if (money > 0) {
                nextLedger.push({
                  id: `campaign-chapter-${chapterId}-${prev.ledger.length}`,
                  category: 'revenue',
                  amount: money,
                  countryId: prev.countryId,
                  occurredAt: new Date().toISOString(),
                  note: `مكافأة حسم الفصل ${chapterId} من سيناريو ${country.name}`,
                });
              }
              const next: PlayerProfile = {
                ...prev,
                bankBalance: prev.bankBalance + money,
                diamonds: prev.diamonds + diamonds,
                goldGrams: Number(((prev.goldGrams ?? 0) + gold).toFixed(2)),
                reputation: Math.max(0, Math.min(100, prev.reputation + reputationDelta)),
                finances: {
                  ...prev.finances,
                  netProfit: prev.finances.netProfit + money,
                  totalRevenue: prev.finances.totalRevenue + money,
                },
                ledger: nextLedger,
                onboarding: {
                  ...prev.onboarding,
                  claimedCampaignChapters: [...(prev.onboarding.claimedCampaignChapters ?? []), chapterId],
                  campaignChapterId: Math.min(4, chapterId + 1),
                },
              };
              saveGame(next, account?.id);
              return next;
            });
            if (rewarded) {
              showNotice(
                `تم توثيق قرار الفصل ${chapterId} واستلام مكافأة الإمبراطورية بنجاح! 🏆`,
                'success',
                'تقدم سيناريو القصة',
              );
            }
          }}
        />
      )}

      {/* Executive Avatar Wardrobe Modal */}
      <AvatarWardrobeModal
        profile={profile}
        isOpen={isAvatarWardrobeOpen}
        onClose={() => setIsAvatarWardrobeOpen(false)}
        onSelectAvatar={(avatarId) => {
          setProfile((prev) => {
            if (!prev) return prev;
            const next = { ...prev, avatarId };
            saveGame(next, account?.id);
            return next;
          });
          showNotice('تم اعتماد صورة الشخصية بنجاح! 👑', 'success', 'تغيير الصورة الرمزية');
        }}
        onUnlockAvatar={(avatar) => {
          if ((profile.diamonds ?? 0) < avatar.priceDiamonds) {
            showNotice(`رصيدك الحالي غير كافٍ لاقتناء هذه الشخصية. تحتاج إلى ${avatar.priceDiamonds} 💎`, 'danger', 'رصيد غير كافٍ');
            return false;
          }
          const nextDiamonds = (profile.diamonds ?? 0) - avatar.priceDiamonds;
          const nextUnlocked = Array.from(new Set([...(profile.unlockedAvatarIds || []), avatar.id]));
          const nextProfile: PlayerProfile = {
            ...profile,
            diamonds: nextDiamonds,
            unlockedAvatarIds: nextUnlocked,
            avatarId: avatar.id,
          };
          setProfile(nextProfile);
          saveGame(nextProfile, account?.id);
          showNotice(`🎉 مبروك! تم اقتناء شخصية "${avatar.name}" بنجاح بـ ${avatar.priceDiamonds} 💎 وتفعيلها كصورتك المعتمدة.`, 'success', 'اقتناء شخصية فاخرة');
          return true;
        }}
        onOpenStore={() => navigate('store')}
      />

      {/* 1. Morning Absence Report Modal (Smart Offline Idle Engine) */}
      {offlineReport && (
        <MorningAbsenceReportModal
          isOpen={isMorningReportOpen}
          report={offlineReport}
          onClaim={() => {
            const updated = applyOfflineReportToProfile(profile, offlineReport);
            setProfile(updated);
            saveGame(updated, account?.id);
            recordOfflineHeartbeat(account?.id ?? updated.id);
            setIsMorningReportOpen(false);
            setOfflineReport(null);
            showNotice('تم استلام أرباح وسلع فترة الغياب بنجاح! 🌅', 'success', 'تقرير غياب المدير');
          }}
          onClose={() => setIsMorningReportOpen(false)}
        />
      )}

      {/* 2. Central Bank Decrees & Macroeconomic Shocks Modal */}
      {isSectionUnlocked(profile, 'bank') && (
        <CentralBankModal
          isOpen={isCentralBankModalOpen}
          onClose={() => setIsCentralBankModalOpen(false)}
          profile={profile}
          onNavigate={(sec) => navigate(sec)}
        />
      )}

      {/* 3. Prestige & Global Sovereign Expansion Modal */}
      {isSectionUnlocked(profile, 'luxury') && (
        <PrestigeExpansionModal
          isOpen={isPrestigeModalOpen}
          onClose={() => setIsPrestigeModalOpen(false)}
          profile={profile}
          onExpansionSuccess={(updated) => {
            setProfile(updated);
            saveGame(updated, account?.id);
            playSound('levelUp');
            setCelebrationData({
              title: 'تأسس الصندوق السيادي بنجاح! 👑',
              subtitle: 'انطلقت إمبراطوريتك نحو العواصم العالمية مع الاحتفاظ بكافة امتيازات وأوسمة الهيبة الدائمة.',
              rewardText: 'توسّع دولي مع نقاط هيبة ورصيد انطلاق جديد',
            });
          }}
        />
      )}

      {/* 4. Strategic Operations & Empire Pillars Modal */}
      {isStrategicPillarsOpen && (
        <StrategicPillarsModal
          isOpen={isStrategicPillarsOpen}
          onClose={() => setIsStrategicPillarsOpen(false)}
          profile={profile}
          country={country}
          onNavigate={(sec) => navigate(sec)}
          onAcceptBotOffer={(offerId) => {
            void handleGameCommand(
              { name: 'accept_bot_offer', args: { offerId } },
              (curr) => acceptBotMarketOffer(curr, offerId),
            );
          }}
        />
      )}

      <footer className="app-footer pb-14 md:pb-3"><span>إمبراطورية الأعمال</span><span>محاكاة محلية · الأسعار والأحداث لأغراض اللعبة</span></footer>
    </div>
  );
}
