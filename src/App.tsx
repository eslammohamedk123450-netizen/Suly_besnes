import { useEffect, useState } from 'react';
import { Brand } from './components/Brand';
import { AccountGate } from './components/AccountGate';
import { CountrySelection } from './components/CountrySelection';
import { Dashboard } from './components/Dashboard';
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
import { advanceDay, type GameResult } from './game/engine';
import { loadSavedGame, saveGame } from './storage/saveRepository';
import { loadNotificationTheme, saveNotificationTheme } from './storage/userPreferences';
import { loadCurrentAccount, logoutAccount, type LocalAccount } from './storage/authRepository';
import { loadRemoteGame, redeemRemoteReward, saveRemoteGame } from './storage/remoteSaveRepository';
import { StoryIntro } from './components/StoryIntro';
import { SystemGuideModal } from './components/SystemGuideModal';
import { StarterMissionDock } from './components/StarterMissionDock';
import { chapterFor, getUnlockedSectionIds, isSectionUnlocked } from './game/onboarding';

export default function App() {
  const [account, setAccount] = useState<LocalAccount | null>(null);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedCountryId, setSelectedCountryId] = useState<CountryId>(() => profile?.countryId ?? COUNTRIES[0].id);
  const [playerName, setPlayerName] = useState(() => profile?.name ?? 'أحمد المستثمر');
  const [activeSection, setActiveSection] = useState<SectionId>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationTheme, setNotificationTheme] = useState(loadNotificationTheme);
  const [notice, setNotice] = useState('');
  const [noticeTone, setNoticeTone] = useState<'success' | 'error'>('success');
  const [pendingGuide, setPendingGuide] = useState<SectionId | null>(null);

  useEffect(() => {
    loadCurrentAccount().then(async (current) => {
      setAccount(current);
      const local = current ? loadSavedGame(current.id) : null;
      const remote = current ? await loadRemoteGame(current.id) : null;
      setProfile(remote ?? local);
      setAuthLoading(false);
    });
  }, []);

  async function handleAuthenticated(nextAccount: LocalAccount) {
    setAccount(nextAccount);
    const local = loadSavedGame(nextAccount.id);
    const remote = await loadRemoteGame(nextAccount.id);
    setProfile(remote ?? local);
    setActiveSection('home');
    setNotice('تم تسجيل الدخول مباشرة.');
    setNoticeTone('success');
  }

  const country = findCountry(profile?.countryId ?? selectedCountryId) ?? COUNTRIES[0];
  const active = getSection(activeSection);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 4200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    saveNotificationTheme(notificationTheme);
  }, [notificationTheme]);

  function startNewWorld() {
    const chosenCountry = findCountry(selectedCountryId);
    if (!chosenCountry) return;
    const newProfile = createNewPlayer(chosenCountry, playerName);
    const result = saveGame(newProfile, account?.id);
    if (account) void saveRemoteGame(account.id, newProfile);
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
    if (account) void saveRemoteGame(account.id, nextProfile);
    setProfile(nextProfile);
    setNotice('بدأ الفصل الأول. ابدأ بالأرض ثم أسس شركتك الأولى.');
    setNoticeTone('success');
  }

  function handleGameResult<T>(result: GameResult<T>) {
    if (!result.ok) {
      setNotice(result.message);
      setNoticeTone('error');
      return;
    }
    const saved = saveGame(result.profile, account?.id);
    if (account) void saveRemoteGame(account.id, result.profile);
    const settledAmount = Math.max(0, (profile?.payables ?? result.profile.payables) - result.profile.payables);
    const settlementNote = settledAmount > 0 ? ` وُجّه ${formatMoney(settledAmount, country)} لسداد التزامات سابقة.` : '';
    setProfile(result.profile);
    setNotice(saved.ok ? `${result.message}${settlementNote}` : `${result.message}${settlementNote} تعذر تثبيت الحفظ على هذا الجهاز.`);
    setNoticeTone(saved.ok ? 'success' : 'error');
  }

  function runGameAction(action: (current: PlayerProfile) => GameResult<unknown>) {
    if (!profile) return;
    handleGameResult(action(profile));
  }

  async function handleRedeemed(nextProfile: PlayerProfile, message: string, codeId: string): Promise<boolean> {
    if (!account) return false;
    const committedRemotely = await redeemRemoteReward(account.id, nextProfile, codeId);
    if (!committedRemotely) return false;
    const saved = saveGame(nextProfile, account.id);
    setProfile(nextProfile);
    setNotice(saved.ok ? message : `${message} تعذر تثبيت الحفظ على هذا الجهاز.`);
    setNoticeTone(saved.ok ? 'success' : 'error');
    return true;
  }

  function handleDaysElapsed(days: number) {
    if (!profile) return;
    let current = profile;
    let completedDays = 0;
    for (let index = 0; index < days; index += 1) {
      const result = advanceDay(current);
      if (!result.ok) {
        setNotice(result.message);
        setNoticeTone('error');
        break;
      }
      current = result.profile;
      completedDays += 1;
    }
    if (completedDays === 0) return;
    const saved = saveGame(current, account?.id);
    if (account) void saveRemoteGame(account.id, current);
    setProfile(current);
    setNotice(saved.ok ? `تم ترحيل ${completedDays} ${completedDays === 1 ? 'يوم تلقائيًا' : 'أيام تلقائيًا'} بعد مرور 24 دقيقة حقيقية.` : 'تم ترحيل الأيام، لكن تعذر تثبيت الحفظ على هذا الجهاز.');
    setNoticeTone(saved.ok ? 'success' : 'error');
  }

  function navigate(section: SectionId) {
    if (!profile || !isSectionUnlocked(profile, section)) {
      setNotice('هذا النظام سيفتح تلقائيًا بعد إكمال خطوات الفصل الحالي.');
      setNoticeTone('error');
      return;
    }
    setActiveSection(section);
    if (section !== 'home' && !profile.onboarding.seenGuides.includes(section)) setPendingGuide(section);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (authLoading) return <div className="account-loading">جارٍ فتح حسابك...</div>;
  if (!account) return <AccountGate onAuthenticated={handleAuthenticated} />;

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
          <span className="player-level"><span className="avatar-initial">{profile.name.trim().charAt(0) || 'م'}</span><span><strong>{profile.name}</strong><small>المستوى {profile.level}</small></span></span>
          <button className="header-settings" type="button" onClick={() => navigate('settings')} aria-label="الإعدادات"><Icon name="settings" size={19} /></button>
        </div>
      </header>

      <div className="app-layout">
        <aside className="side-nav" aria-label="أقسام اللعبة">
          <div className="side-nav-caption">إدارة الإمبراطورية</div>
          {SECTION_GROUPS.map((group) => (
            <div className="nav-group" key={group.id}>
              <div className="nav-group-label">{group.label}</div>
              {group.sections.map((sectionId) => {
                const section = getSection(sectionId);
                const unlocked = unlockedSections.has(section.id);
                return <button className={`nav-item${activeSection === section.id ? ' is-active' : ''}${!unlocked ? ' is-locked' : ''}`} type="button" key={section.id} onClick={() => navigate(section.id)} aria-current={activeSection === section.id ? 'page' : undefined} disabled={!unlocked}>
                  <Icon name={unlocked ? section.icon : 'lock'} size={19} /><span>{section.label}</span>
                </button>;
              })}
            </div>
          ))}
          <div className="side-nav-note"><Icon name="shield" size={16} /><span>حفظ محلي<br />بدون إنترنت</span></div>
        </aside>

        <main className="main-content">
          {activeSection === 'home' ? (
            <Dashboard profile={profile} country={country} onNavigate={navigate} />
          ) : (
            <SectionPage section={active} profile={profile} country={country} notificationTheme={notificationTheme} onNotificationThemeChange={setNotificationTheme} onHome={() => navigate('home')} onAction={handleGameResult} onRedeemed={handleRedeemed} onLogout={() => { logoutAccount(); setAccount(null); setProfile(null); }} />
          )}
        </main>
      </div>

      <nav className="mobile-bottom-nav" aria-label="التنقل الرئيسي">
        {fixedBottomItems.map((sectionId) => {
          const section = getSection(sectionId);
          return <button className={`mobile-nav-item${activeSection === sectionId ? ' is-active' : ''}`} type="button" key={sectionId} onClick={() => navigate(sectionId)}><Icon name={section.icon} size={20} /><span>{section.shortLabel}</span></button>;
        })}
        <button className={`mobile-nav-item${mobileMenuOpen ? ' is-active' : ''}`} type="button" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((open) => !open)}><Icon name="menu" size={20} /><span>المزيد</span></button>
      </nav>

      {mobileMenuOpen && <div className="mobile-menu-backdrop" onClick={() => setMobileMenuOpen(false)}>
        <nav className="mobile-more-menu" aria-label="المزيد من الأقسام" onClick={(event) => event.stopPropagation()}>
          <div className="mobile-more-heading"><strong>كل الأقسام</strong><button type="button" className="icon-button" onClick={() => setMobileMenuOpen(false)} aria-label="إغلاق"><Icon name="close" /></button></div>
          {otherSections.map((section) => { const unlocked = unlockedSections.has(section.id); return <button type="button" className={`mobile-more-item${!unlocked ? ' is-locked' : ''}`} key={section.id} onClick={() => navigate(section.id)} disabled={!unlocked}><Icon name={unlocked ? section.icon : 'lock'} size={18} /><span>{section.label}</span><Icon name="chevron" size={16} /></button>; })}
        </nav>
      </div>}

      {notice && <NoticeToast message={notice} tone={noticeTone} theme={notificationTheme} onDismiss={() => setNotice('')} />}
      {pendingGuide && <SystemGuideModal section={pendingGuide} onClose={() => { if (!profile) return; const seenGuides = profile.onboarding.seenGuides.includes(pendingGuide) ? profile.onboarding.seenGuides : [...profile.onboarding.seenGuides, pendingGuide]; const nextProfile = { ...profile, onboarding: { ...profile.onboarding, chapter: chapterFor(profile), seenGuides } }; saveGame(nextProfile, account?.id); if (account) void saveRemoteGame(account.id, nextProfile); setProfile(nextProfile); setPendingGuide(null); }} />}
      <StarterMissionDock profile={profile} onNavigate={navigate} />
      <footer className="app-footer"><span>إمبراطورية الأعمال</span><span>محاكاة محلية · الأسعار والأحداث لأغراض اللعبة</span></footer>
    </div>
  );
}
