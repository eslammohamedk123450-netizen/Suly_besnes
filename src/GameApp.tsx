import { useEffect, useMemo, useRef, useState } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Brand } from './components/Brand';
import { AccountGate } from './components/AccountGate';
import { CountrySelection } from './components/CountrySelection';
import { Dashboard } from './components/Dashboard';
import { ProfilePage } from './components/ProfilePage';
import { GameDayTimer } from './components/GameDayTimer';
import { Icon } from './components/Icon';
import { FlyingToast, type ToastAlert } from './components/FlyingToast';
import { NotificationBell } from './components/NotificationBell';
import { NotificationModal } from './components/NotificationModal';
import { selectNotifications, type GameNotification } from './game/notifications';
import { SectionPage } from './components/SectionPage';
import { COUNTRIES, findCountry } from './domain/countries';
import type { CountryId } from './domain/countries';
import { GAME_SECTIONS, getSection, SECTION_GROUPS, type SectionId } from './domain/navigation';
import { createNewPlayer } from './domain/player';
import type { PlayerProfile } from './domain/player';
import { formatMoney } from './domain/formatters';
import type { FinanceLedgerEntry } from './domain/futureSystems';
import { advanceDay, sellProduct, type GameCommand, type GameResult } from './game/engine';
import { loadSavedGame, saveGame } from './storage/saveRepository';
import { loadNotificationTheme, saveNotificationTheme } from './storage/userPreferences';
import { createGuestAccount, handlePasswordRecoveryCallback, loadCurrentAccount, logoutAccount, type LocalAccount } from './storage/authRepository';
import { executeRemoteGameCommand, loadRemoteGame, redeemRemoteReward, saveRemoteGame, type RemoteGameCommandAttempt } from './storage/remoteSaveRepository';
import { PasswordResetGate } from './components/PasswordResetGate';
import { supabase } from './storage/supabaseClient';
import { StoryIntro } from './components/StoryIntro';
import { SystemGuideModal } from './components/SystemGuideModal';
import { chapterFor, getPlayerProgress, getSectionUnlockHint, getUnlockedSectionIds, isSectionUnlocked } from './game/onboarding';
import { normalizeAccountFeatures } from './domain/accountFeatures';
import { claimDailySeasonLogin, getVisibleSeasons, recordVerifiedGameTransaction } from './storage/leaderboardRepository';
import { ResourceBar, type ResourceSyncState } from './components/ResourceBar';
import { acknowledgeGameCommand, blockGameCommand, createGameCommandKey, enqueueGameCommand, loadQueuedGameCommands } from './storage/commandOutbox';
import { clearPendingInitialProfile, loadPendingInitialProfile, queueInitialProfile } from './storage/pendingInitialProfile';
import { playSound } from './game/soundEffects';
import { RightActionHub } from './components/RightActionHub';
import { StoryEventPopup, GAME_STORY_EVENTS, type StoryEventAlert } from './components/StoryEventPopup';
import { DynamicEconomyEvents } from './components/DynamicEconomyEvents';
import { loadExpansionState } from './game/expansionEngine';
import { DailyLuckySpinModal } from './components/DailyLuckySpinModal';
import { CelebrationModal, type CelebrationData } from './components/CelebrationModal';
import { MobileBottomNav } from './components/MobileBottomNav';

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
  const [playerName, setPlayerName] = useState(() => profile?.name ?? '');
  const [activeSection, setActiveSection] = useState<SectionId>('home');
  const [sectionFocus, setSectionFocus] = useState<string | undefined>();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationTheme, setNotificationTheme] = useState(loadNotificationTheme);
  const [notice, setNotice] = useState('');
  const [noticeTone, setNoticeTone] = useState<'success' | 'error'>('success');
  const [pendingGuide, setPendingGuide] = useState<SectionId | null>(null);
  const [linkingAccount, setLinkingAccount] = useState(false);
  const [syncState, setSyncState] = useState<ResourceSyncState>('synced');
  const [pendingCommandCount, setPendingCommandCount] = useState(0);
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');
  const [activeStoryEvent, setActiveStoryEvent] = useState<StoryEventAlert | null>(null);
  const [expansion, setExpansion] = useState(() => profile ? loadExpansionState(profile) : null);
  const [isLuckyWheelOpen, setIsLuckyWheelOpen] = useState(false);
  const [celebrationData, setCelebrationData] = useState<CelebrationData | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [activeToastAlert, setActiveToastAlert] = useState<ToastAlert | null>(null);
  const [forceBellVibrate, setForceBellVibrate] = useState(false);
  const [customNotifications, setCustomNotifications] = useState<GameNotification[]>([]);
  const syncLock = useRef(false);
  const remoteCommandAttempts = useRef(new Map<string, Promise<RemoteGameCommandAttempt>>());

  const triggerNotification = (
    message: string,
    tone: 'success' | 'warning' | 'info' | 'danger' = 'info',
    title?: string,
    section?: SectionId,
    target?: string
  ) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const inferredTitle = title || (
      tone === 'danger' ? 'تنبيه عاجل' :
      tone === 'warning' ? 'تحذير هام' :
      tone === 'success' ? 'تمت العملية بنجاح' :
      'إشعار إمبراطورية الأعمال'
    );

    setActiveToastAlert({
      id,
      title: inferredTitle,
      message,
      tone,
      section,
      target,
    });

    const newNotif: GameNotification = {
      id,
      title: inferredTitle,
      detail: message,
      tone,
      section: (section ?? 'home') as any,
      target,
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
    tgt?: string
  ) => {
    setNotice(msg);
    setNoticeTone(tone === 'danger' ? 'error' : (tone as any));
    triggerNotification(msg, tone, title, sec, tgt);
  };

  const allNotifications = useMemo(() => {
    if (!profile) return customNotifications;
    const dynamic = selectNotifications(profile);
    const map = new Map<string, GameNotification>();
    for (const item of [...customNotifications, ...dynamic]) {
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

  const handleLuckySpinReward = (reward: { type: 'cash' | 'gold' | 'diamonds' | 'speed_card'; amount: number; label: string }) => {
    if (!profile) return;
    let next: any = { ...profile, lastSpinDay: profile.day };
    if (reward.type === 'cash') {
      next.bankBalance = (next.bankBalance ?? 0) + reward.amount;
    } else if (reward.type === 'gold') {
      next.goldGrams = Number(((next.goldGrams ?? 0) + reward.amount).toFixed(2));
    } else if (reward.type === 'diamonds') {
      next.diamonds = (next.diamonds ?? 0) + reward.amount;
    } else if (reward.type === 'speed_card') {
      const existingCards = next.speedCards ? [...next.speedCards] : [];
      const idx = existingCards.findIndex((c: any) => c.kind === 'production-instant');
      if (idx >= 0) existingCards[idx].quantity += 1;
      else existingCards.push({ kind: 'production-instant', quantity: 1 });
      next.speedCards = existingCards;
    }
    setProfile(next);
    saveGame(next, account?.id);
    showNotice(`🎉 مبروك! ربحت ${reward.label} من عجلة الحظ اليومية!`, 'success', 'مكافأة عجلة الحظ');
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

        // Auto-create guest session if none exists so player can play immediately
        if (!current) {
          current = createGuestAccount();
        }
        setAccount(current);

        let local = loadSavedGame(current.id) ?? loadPendingInitialProfile(current.id)?.profile ?? null;
        
        // Auto-create the initial struggle world if no save exists yet
        if (!local) {
          const egyptCountry = COUNTRIES[0];
          local = normalizeAccountFeatures(createNewPlayer(egyptCountry, 'إسلام محمد'), current.id);
          saveGame(local, current.id);
        }

        setProfile(normalizeAccountFeatures(local, current.id));
        setAuthLoading(false);

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
        if (remote && !queue.length && !initialPending && localUnchanged) setProfile(normalizeAccountFeatures(remote, current.id));
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
    // Sync silently when connectivity returns. Never interrupt gameplay with a toast.
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
    if (local) setProfile(normalizeAccountFeatures(local, nextAccount.id));
    const localSnapshot = local ? JSON.stringify(local) : null;
    const remote = nextAccount.isGuest ? null : await loadRemoteGame(nextAccount.id);
    const latestLocal = loadSavedGame(nextAccount.id);
    const hasPendingSync = getPendingSyncCount(nextAccount.id) > 0;
    if (remote && !hasPendingSync && JSON.stringify(latestLocal) === localSnapshot) setProfile(normalizeAccountFeatures(remote, nextAccount.id));
    else if (!local && remote) setProfile(normalizeAccountFeatures(remote, nextAccount.id));
    else if (!local && !remote) setProfile(null);
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

  async function synchronizePendingCommands(showNotice = false): Promise<boolean> {
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
          if (showNotice && synchronizedCount > 0) {
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
    }
    setProfile(guestProfile ? normalizeAccountFeatures(guestProfile, guest.id) : null);
    setLinkingAccount(false);
    setNotice(guestProfile ? 'أهلاً بك مجدداً في جلسة الضيف.' : 'جلسة ضيف جديدة. اختر اسمك ودولتك للبدء.');
    setNoticeTone('success');
  }

  function handleResetToCountrySelection() {
    setProfile(null);
    setPlayerName('');
    setSelectedCountryId(COUNTRIES[0].id);
    setNotice('اختر دولتك واسمك الجديد للبدء.');
    setNoticeTone('success');
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
      setProfile(existingCloudProfile ? normalizeAccountFeatures(existingCloudProfile, nextAccount.id) : null);
      setNotice('تم فتح عالم الحساب الموجود. حفظ الضيف لم يُحذف من هذا الجهاز.');
    } else if (guestProfile) {
      const guestCountry = findCountry(guestProfile.countryId) ?? COUNTRIES[0];
      const freshCloudProfile = normalizeAccountFeatures(createNewPlayer(guestCountry, guestProfile.name), nextAccount.id);
      const localCreated = saveGame(freshCloudProfile, nextAccount.id);
      const queued = localCreated.ok && queueInitialProfile(nextAccount.id, freshCloudProfile);
      setProfile(freshCloudProfile);
      if (queued) setSyncState(typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'syncing');
      else {
        setSyncState('blocked');
        linkTone = 'error';
      }
      setNotice(queued
        ? 'تم ربط الحساب وبدأ عالم جديد لحماية الأرصدة. حفظ الضيف السابق ما زال على هذا الجهاز ولم يُنقل.'
        : 'تم ربط الحساب، لكن تعذر تجهيز مزامنة العالم الجديد. لم يُرفع حفظ الضيف؛ تحقق من مساحة التخزين ثم أعد المحاولة.');
    } else {
      setProfile(null);
      setNotice('تم ربط الحساب. ابدأ عالمك الجديد الآن.');
    }
    setAccount(nextAccount);
    setActiveSection('home');
    setLinkingAccount(false);
    setNoticeTone(linkTone);
  }

  const country = findCountry(profile?.countryId ?? selectedCountryId) ?? COUNTRIES[0];
  const active = getSection(activeSection);
  const playerProgress = profile ? getPlayerProgress(profile) : null;

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
    const newProfile = normalizeAccountFeatures(createNewPlayer(chosenCountry, playerName), account?.id);
    const result = saveGame(newProfile, account?.id);
    if (account && !account.isGuest) {
    const queued = queueInitialProfile(account.id, newProfile);
      setPendingCommandCount(getPendingSyncCount(account.id) + Number(Boolean(loadPendingInitialProfile(account.id))));
      setSyncState(queued ? (typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'syncing') : 'blocked');
      if (queued) void synchronizePendingCommands(false);
    }
    setProfile(newProfile);
    setActiveSection('home');
    setMobileMenuOpen(false);
    showNotice(
      result.ok ? 'تم إنشاء عالمك وحفظه على هذا الجهاز بنجاح! 🌍' : 'تعذر حفظ البيانات محليًا؛ قد لا يستمر التقدم بعد إغلاق الصفحة.',
      result.ok ? 'success' : 'danger',
      'بداية إمبراطورية جديدة'
    );
  }

  function completeIntro() {
    if (!profile) return;
    const nextProfile = { ...profile, onboarding: { ...profile.onboarding, introCompleted: true, chapter: 1 } };
    saveGame(nextProfile, account?.id);
    if (account && !account.isGuest) setSyncState('local');
    setProfile(nextProfile);
    playSound('success');
    showNotice('بدأ الفصل الأول: خطة الإنقاذ. ابدأ بالأرض ثم أسس شركتك الأولى.', 'success', 'انطلاق الفصل الأول', 'lands');
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
      'تحديث العملية'
    );
  }

  function runGameAction(action: (current: PlayerProfile) => GameResult<unknown>) {
    if (!profile) return;
    handleGameResult(action(profile));
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
    // Sync failures are kept in the local outbox and must never interrupt gameplay.
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
    const saved = saveGame(current, account?.id);
    setProfile(current);
    const elapsedLabel = `${completedDays} ${completedDays === 1 ? 'يوم' : 'أيام'}`;
    const summary = completedDays > 1 ? `تم ترحيل ${elapsedLabel}. آخر ملخص: ${latestDayMessage}` : latestDayMessage;
    setNotice(saved.ok ? summary : `${summary} تعذر تثبيت الحفظ على هذا الجهاز.`);
    setNoticeTone(saved.ok ? 'success' : 'error');

    // Trigger dynamic advisor story popup
    const eventIndex = Math.floor(Math.random() * GAME_STORY_EVENTS.length);
    setActiveStoryEvent(GAME_STORY_EVENTS[eventIndex]);
  }

  function navigate(section: SectionId, focus?: string) {
    if (!profile || !isSectionUnlocked(profile, section)) {
      playSound('error');
      setNotice(profile ? getSectionUnlockHint(profile, section) : 'ابدأ عالمك أولًا لفتح أنظمة اللعبة.');
      setNoticeTone('error');
      return;
    }
    setActiveSection(section);
    setSectionFocus(focus);
    if (section !== 'home' && section !== 'profile' && !profile.onboarding.seenGuides.includes(section)) { setPendingGuide(section); playSound('unlock'); }
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleLogout() {
    if (account && !account.isGuest) void logoutAccount();
    setAccount(null);
    setProfile(null);
    setLinkingAccount(false);
  }

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
          playerName={playerName}
          onCountryChange={setSelectedCountryId}
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

  if (!profile.onboarding?.introCompleted) return <StoryIntro profile={profile} onComplete={completeIntro} />;

  const unlockedSections = new Set(getUnlockedSectionIds(profile));
  const fixedBottomItems: SectionId[] = ['home', 'companies', 'auctions', 'staff', 'profile'];
  const otherSections = GAME_SECTIONS.filter((section) => !fixedBottomItems.includes(section.id));

  return (
    <div className="app-frame">
      <header className="app-header">
        <button className="header-brand-button" type="button" onClick={() => navigate('home')} aria-label="العودة إلى الرئيسية"><Brand compact /></button>
          <div className="header-actions">
          <GameDayTimer profile={profile} onDaysElapsed={handleDaysElapsed} />
          <div className="header-location"><span>{country.flag}</span><span>{country.name}</span><small>{country.currency.code}</small></div>
          <span className="header-divider" />
          <button className="player-level player-level--button" type="button" onClick={() => navigate('profile')} aria-label="فتح الملف الشخصي"><span className="avatar-initial">{profile.name.trim().charAt(0) || 'م'}</span><span><strong>{profile.name}</strong><small>المستوى {playerProgress?.level ?? profile.level}</small></span></button>
          
          {/* Notification Bell with Red Badge & Periodic Vibration */}
          <NotificationBell
            unreadCount={unreadNotificationsCount}
            onClick={() => setIsNotificationModalOpen(true)}
            forceVibrate={forceBellVibrate}
          />

          <button className="header-settings" type="button" onClick={() => navigate('settings')} aria-label="الإعدادات"><Icon name="settings" size={19} /></button>
        </div>
      </header>
      <ResourceBar profile={profile} country={country} onNavigate={navigate} syncState={!account || account.isGuest ? 'local' : syncState} pendingCommandCount={pendingCommandCount} />

      <div className="app-layout">
        <aside className="side-nav" aria-label="أقسام اللعبة">
          <div className="side-nav-caption">إدارة الإمبراطورية</div>
          {SECTION_GROUPS.map((group) => (
            <div className="nav-group" key={group.id}>
              <div className="nav-group-label">{group.label}</div>
              {group.sections.map((sectionId) => {
                const section = getSection(sectionId);
                const unlocked = unlockedSections.has(section.id);
                return <button className={`nav-item${activeSection === section.id ? ' is-active' : ''}${!unlocked ? ' is-locked' : ''}`} type="button" key={section.id} onClick={() => navigate(section.id)} aria-current={activeSection === section.id ? 'page' : undefined} aria-disabled={!unlocked} title={unlocked ? section.label : getSectionUnlockHint(profile, section.id)}>
                  <Icon name={unlocked ? section.icon : 'lock'} size={19} /><span>{section.label}</span>
                </button>;
              })}
            </div>
          ))}
          <div className="side-nav-note"><Icon name="shield" size={16} /><span>{!account || account.isGuest ? <>حفظ<br />على هذا الجهاز</> : syncState === 'offline' ? <>اللعب مستمر<br />بانتظار الاتصال</> : syncState === 'blocked' ? <>حماية التقدم<br />مراجعة الحفظ</> : syncState === 'syncing' ? <>جارٍ حفظ<br />خطواتك</> : <>حفظ آمن<br />ومحدّث</>}</span></div>
        </aside>

        <main className="main-content">
          {activeSection === 'home' ? (
            <Dashboard 
              profile={profile} 
              country={country} 
              onNavigate={navigate} 
              onCommand={handleGameCommand}
              onOpenLuckyWheel={() => setIsLuckyWheelOpen(true)}
              onUpdateProfile={(updater) => {
                setProfile((prev) => {
                  if (!prev) return prev;
                  const next = updater(prev);
                  saveGame(next, account?.id);
                  return next;
                });
              }}
              onClaimReward={(cash, diamonds) => {
                setProfile((prev) => {
                  if (!prev) return prev;
                  const next = {
                    ...prev,
                    bankBalance: prev.bankBalance + cash,
                    diamonds: prev.diamonds + diamonds,
                  };
                  saveGame(next, account?.id);
                  showNotice(`تم استلام المكافأة: +${cash.toLocaleString()} $ و +${diamonds} ألماسة! 🎁`, 'success', 'مكافأة إنجاز');
                  return next;
                });
              }}
              onRequestEmergencyLoan={() => {
                setProfile((prev) => {
                  if (!prev) return prev;
                  const next = {
                    ...prev,
                    bankBalance: prev.bankBalance + 250000,
                  };
                  saveGame(next, account?.id);
                  showNotice('تم إيداع تسهيل ائتماني طارئ بقيمة 250,000 $ من بنك مصر للأعمال! 🏦', 'success', 'تسهيل ائتماني طارئ', 'bank');
                  return next;
                });
              }}
            />
          ) : activeSection === 'profile' ? (
            <ProfilePage profile={profile} country={country} accountId={account.id} isGuest={Boolean(account.isGuest)} isSynced={!account.isGuest && syncState === 'synced' && pendingCommandCount === 0} onLinkAccount={() => setLinkingAccount(true)} onResetWorld={handleResetToCountrySelection} />
          ) : (
            <SectionPage section={getSection(activeSection)} profile={profile} country={country} focus={sectionFocus} notificationTheme={notificationTheme} isGuest={Boolean(account.isGuest)} onNotificationThemeChange={setNotificationTheme} onHome={() => navigate('home')} onNavigate={(section) => navigate(section)} onAction={handleGameResult} onCommand={handleGameCommand} onRedeemed={handleRedeemed} onRefreshProfile={refreshAuthoritativeProfile} onLinkAccount={() => setLinkingAccount(true)} onLogout={handleLogout} onShowGuide={() => setPendingGuide(activeSection)} />
          )}
        </main>
      </div>

      <nav className="mobile-bottom-nav" aria-label="التنقل الرئيسي">
        {fixedBottomItems.map((sectionId) => {
          const section = getSection(sectionId);
          const unlocked = unlockedSections.has(sectionId);
          return <button className={`mobile-nav-item${activeSection === sectionId ? ' is-active' : ''}${unlocked ? '' : ' is-locked'}`} type="button" key={sectionId} onClick={() => navigate(sectionId)} aria-disabled={!unlocked} title={unlocked ? section.label : getSectionUnlockHint(profile, sectionId)}><Icon name={unlocked ? section.icon : 'lock'} size={20} /><span>{section.shortLabel}</span></button>;
        })}
        <button className={`mobile-nav-item${mobileMenuOpen ? ' is-active' : ''}`} type="button" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((open) => !open)}><Icon name="menu" size={20} /><span>المزيد</span></button>
      </nav>

      {mobileMenuOpen && <div className="mobile-menu-backdrop" onClick={() => setMobileMenuOpen(false)}>
        <nav className="mobile-more-menu" aria-label="المزيد من الأقسام" onClick={(event) => event.stopPropagation()}>
          <div className="mobile-more-heading"><strong>كل الأقسام</strong><button type="button" className="icon-button" onClick={() => setMobileMenuOpen(false)} aria-label="إغلاق"><Icon name="close" /></button></div>
          {otherSections.map((section) => { const unlocked = unlockedSections.has(section.id); return <button type="button" className={`mobile-more-item${!unlocked ? ' is-locked' : ''}`} key={section.id} onClick={() => navigate(section.id)} aria-disabled={!unlocked} title={unlocked ? section.label : getSectionUnlockHint(profile, section.id)}><Icon name={unlocked ? section.icon : 'lock'} size={18} /><span>{section.label}{!unlocked && <small>{getSectionUnlockHint(profile, section.id)}</small>}</span><Icon name="chevron" size={16} /></button>; })}
        </nav>
      </div>}

      <RightActionHub
        profile={profile}
        country={country}
        onNavigate={navigate}
        onCollectActualProfit={(amount: number) => {
          if (!profile) return;
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
          showNotice(`تم تحصيل الأرباح الفعلية بنجاح! تم إيداع +${formatMoney(amount, country)} في حسابك البنكي.`, 'success', 'تحصيل أرباح الشركات', 'bank');
        }}
        onSellProduct={(productId: string, quantity: number) => {
          void handleGameCommand(
            { name: 'sell_product', args: { productId, quantity } },
            (curr) => sellProduct(curr, productId, quantity),
          );
        }}
        onAdvanceDay={() => void handleDaysElapsed(1)}
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
      {pendingGuide && <SystemGuideModal section={pendingGuide} onClose={() => { if (!profile) return; const seenGuides = profile.onboarding.seenGuides.includes(pendingGuide) ? profile.onboarding.seenGuides : [...profile.onboarding.seenGuides, pendingGuide]; const nextProfile = { ...profile, onboarding: { ...profile.onboarding, chapter: chapterFor(profile), seenGuides } }; saveGame(nextProfile, account?.id); if (account && !account.isGuest) setSyncState('local'); setProfile(nextProfile); setPendingGuide(null); }} />}
      {activeStoryEvent && (
        <StoryEventPopup
          event={activeStoryEvent}
          profile={profile}
          country={country}
          onClose={() => setActiveStoryEvent(null)}
          onNavigate={(sec) => navigate(sec)}
        />
      )}
      {expansion && (
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

      {/* Interactive Daily Lucky Wheel */}
      <DailyLuckySpinModal
        isOpen={isLuckyWheelOpen}
        onClose={() => setIsLuckyWheelOpen(false)}
        profile={profile}
        onRewardWon={handleLuckySpinReward}
      />

      {/* Major Milestone Celebration Modal */}
      <CelebrationModal
        data={celebrationData}
        onClose={() => setCelebrationData(null)}
      />

      {/* Streamlined Mobile Bottom Navigation */}
      <MobileBottomNav
        activeSection={activeSection}
        onNavigate={navigate}
        onOpenLuckyWheel={() => setIsLuckyWheelOpen(true)}
        isFreeSpinAvailable={((profile as any).lastSpinDay ?? -1) !== profile.day}
      />

      <footer className="app-footer pb-14 md:pb-3"><span>إمبراطورية الأعمال</span><span>محاكاة محلية · الأسعار والأحداث لأغراض اللعبة</span></footer>
    </div>
  );
}
