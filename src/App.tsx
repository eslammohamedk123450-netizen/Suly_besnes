import { useEffect, useRef, useState } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Brand } from './components/Brand';
import { AccountGate } from './components/AccountGate';
import { CountrySelection } from './components/CountrySelection';
import { Dashboard } from './components/Dashboard';
import { ProfilePage } from './components/ProfilePage';
import { GameDayTimer } from './components/GameDayTimer';
import { Icon } from './components/Icon';
import { NoticeToast } from './components/NoticeToast';
import { SectionPage } from './components/SectionPage';
import { COUNTRIES, findCountry } from './domain/countries';
import type { CountryId } from './domain/countries';
import { GAME_SECTIONS, getSection, SECTION_GROUPS, type SectionId } from './domain/navigation';
import { createNewPlayer } from './domain/player';
import type { PlayerProfile } from './domain/player';
import { formatMoney } from './domain/formatters';
import { advanceDay, type GameCommand, type GameResult } from './game/engine';
import { loadSavedGame, saveGame } from './storage/saveRepository';
import { loadNotificationTheme, saveNotificationTheme } from './storage/userPreferences';
import { createGuestAccount, handlePasswordRecoveryCallback, loadCurrentAccount, logoutAccount, type LocalAccount } from './storage/authRepository';
import { executeRemoteGameCommand, loadRemoteGame, redeemRemoteReward, saveRemoteGame, type RemoteGameCommandAttempt } from './storage/remoteSaveRepository';
import { PasswordResetGate } from './components/PasswordResetGate';
import { supabase } from './storage/supabaseClient';
import { StoryIntro } from './components/StoryIntro';
import { SystemGuideModal } from './components/SystemGuideModal';
import { StarterMissionDock } from './components/StarterMissionDock';
import { chapterFor, getPlayerProgress, getSectionUnlockHint, getUnlockedSectionIds, isSectionUnlocked } from './game/onboarding';
import { normalizeAccountFeatures } from './domain/accountFeatures';
import { claimDailySeasonLogin, getVisibleSeasons, recordVerifiedGameTransaction } from './storage/leaderboardRepository';
import { ResourceBar, type ResourceSyncState } from './components/ResourceBar';
import { acknowledgeGameCommand, blockGameCommand, createGameCommandKey, enqueueGameCommand, loadQueuedGameCommands, retryTransientBlockedCommands } from './storage/commandOutbox';
import { clearPendingInitialProfile, loadPendingInitialProfile, queueInitialProfile } from './storage/pendingInitialProfile';
import { playSound } from './game/soundEffects';

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
  const [playerName, setPlayerName] = useState(() => profile?.name ?? 'أحمد المستثمر');
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
  const syncLock = useRef(false);

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
        const current = await loadCurrentAccount();
        if (cancelled) return;
        setAccount(current);
        const local = current ? loadSavedGame(current.id) ?? loadPendingInitialProfile(current.id)?.profile ?? null : null;
        if (local) {
          setProfile(normalizeAccountFeatures(local, current?.id));
          setAuthLoading(false);
        }
        if (!current) {
          setAuthLoading(false);
          return;
        }
        if (current.isGuest) {
          setProfile(local ? normalizeAccountFeatures(local, current.id) : null);
          setAuthLoading(false);
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
    const handleOnline = () => { void synchronizePendingCommands(true); };
    const handleOffline = () => refreshStatus();
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    refreshStatus();
    if (typeof navigator === 'undefined' || navigator.onLine) void synchronizePendingCommands(false);
    const syncTimer = window.setInterval(() => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        refreshStatus();
        return;
      }
      retryTransientBlockedCommands(account.id);
      void synchronizePendingCommands(false);
    }, 3_000);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.clearInterval(syncTimer);
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
    return new Promise((resolve) => {
      const timer = window.setTimeout(() => resolve({ kind: 'unavailable' }), 3_500);
      void executeRemoteGameCommand(command, commandKey).then((attempt) => {
        window.clearTimeout(timer);
        resolve(attempt);
      }).catch(() => {
        window.clearTimeout(timer);
        resolve({ kind: 'unavailable' });
      });
    });
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
          setNotice('أنشأ الخادم عالمك بأمان، لكن تعذر حفظ نسخته على هذا الجهاز. لم نحذف بيانات المزامنة؛ تحقق من مساحة التخزين.');
          setNoticeTone('error');
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
          setNotice(attempt.message);
          setNoticeTone('error');
          return false;
        }
        if (!attempt.result.ok) {
          blockGameCommand(account.id, next.commandKey, attempt.result.reason);
          setPendingCommandCount(getPendingSyncCount(account.id));
          setSyncState('blocked');
          setNotice(`تعذر اعتماد خطوة محفوظة: ${attempt.result.message} لم نحذفها أو نستبدل عالمك.`);
          setNoticeTone('error');
          return false;
        }
        const saved = saveGame(attempt.result.profile, account.id);
        if (!saved.ok) {
          blockGameCommand(account.id, next.commandKey, 'local_save_failed');
          setPendingCommandCount(getPendingSyncCount(account.id));
          setSyncState('blocked');
          setNotice('اعتمد الخادم الخطوة، لكن تعذر تحديث النسخة المحلية؛ أبقينا إيصال المزامنة للمراجعة.');
          setNoticeTone('error');
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
    setProfile(guestProfile ? normalizeAccountFeatures(guestProfile, guest.id) : null);
    setLinkingAccount(false);
    setNotice('بدأت جلسة ضيف. تقدمك محفوظ محليًا على هذا الجهاز فقط.');
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
    setNotice(result.ok ? 'تم إنشاء عالمك وحفظه على هذا الجهاز.' : 'تعذر حفظ البيانات محليًا؛ قد لا يستمر التقدم بعد إغلاق الصفحة.');
    setNoticeTone(result.ok ? 'success' : 'error');
  }

  function completeIntro() {
    if (!profile) return;
    const nextProfile = { ...profile, onboarding: { ...profile.onboarding, introCompleted: true, chapter: 1 } };
    saveGame(nextProfile, account?.id);
    if (account && !account.isGuest) setSyncState('local');
    setProfile(nextProfile);
    playSound('success');
    setNotice('بدأ الفصل الأول. ابدأ بالأرض ثم أسس شركتك الأولى.');
    setNoticeTone('success');
  }

  function handleGameResult<T>(result: GameResult<T>, options: { syncRemote?: boolean } = {}) {
    if (!result.ok) {
      playSound('error');
      setNotice(result.message);
      setNoticeTone('error');
      return;
    }
    const saved = saveGame(result.profile, account?.id);
    if (options.syncRemote !== false && account && !account.isGuest) setSyncState('local');
    const settledAmount = Math.max(0, (profile?.payables ?? result.profile.payables) - result.profile.payables);
    const settlementNote = settledAmount > 0 ? ` وُجّه ${formatMoney(settledAmount, country)} لسداد التزامات سابقة.` : '';
    setProfile(result.profile);
    playSound('success');
    setNotice(saved.ok ? `${result.message}${settlementNote}` : `${result.message}${settlementNote} تعذر تثبيت الحفظ على هذا الجهاز.`);
    setNoticeTone(saved.ok ? 'success' : 'error');
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
        {notice && <NoticeToast message={notice} tone={noticeTone} theme={notificationTheme} onDismiss={() => setNotice('')} />}
      </>
    );
  }

  if (!profile.onboarding?.introCompleted) return <StoryIntro profile={profile} onComplete={completeIntro} />;

  const unlockedSections = new Set(getUnlockedSectionIds(profile));
  const fixedBottomItems: SectionId[] = ['home', 'auctions', 'companies', 'lands'];
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
            <Dashboard profile={profile} country={country} onNavigate={navigate} onCommand={handleGameCommand} />
          ) : activeSection === 'profile' ? (
            <ProfilePage profile={profile} country={country} accountId={account.id} isGuest={Boolean(account.isGuest)} isSynced={!account.isGuest && syncState === 'synced' && pendingCommandCount === 0} onLinkAccount={() => setLinkingAccount(true)} />
          ) : (
            <SectionPage section={active} profile={profile} country={country} focus={sectionFocus} notificationTheme={notificationTheme} isGuest={Boolean(account.isGuest)} onNotificationThemeChange={setNotificationTheme} onHome={() => navigate('home')} onNavigate={(section) => navigate(section)} onAction={handleGameResult} onCommand={handleGameCommand} onRedeemed={handleRedeemed} onRefreshProfile={refreshAuthoritativeProfile} onLinkAccount={() => setLinkingAccount(true)} onLogout={handleLogout} onShowGuide={() => setPendingGuide(activeSection)} />
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

      {notice && <NoticeToast message={notice} tone={noticeTone} theme={notificationTheme} onDismiss={() => setNotice('')} />}
      {pendingGuide && <SystemGuideModal section={pendingGuide} onClose={() => { if (!profile) return; const seenGuides = profile.onboarding.seenGuides.includes(pendingGuide) ? profile.onboarding.seenGuides : [...profile.onboarding.seenGuides, pendingGuide]; const nextProfile = { ...profile, onboarding: { ...profile.onboarding, chapter: chapterFor(profile), seenGuides } }; saveGame(nextProfile, account?.id); if (account && !account.isGuest) setSyncState('local'); setProfile(nextProfile); setPendingGuide(null); }} />}
      <StarterMissionDock profile={profile} onNavigate={navigate} />
      <footer className="app-footer"><span>إمبراطورية الأعمال</span><span>محاكاة محلية · الأسعار والأحداث لأغراض اللعبة</span></footer>
    </div>
  );
}
