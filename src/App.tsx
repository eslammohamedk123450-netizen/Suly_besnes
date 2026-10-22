import { useEffect, useState } from 'react';
import { Brand } from './components/Brand';
import { CountrySelection } from './components/CountrySelection';
import { DailyBriefing } from './components/DailyBriefing';
import { Dashboard } from './components/Dashboard';
import { Icon } from './components/Icon';
import { NoticeToast } from './components/NoticeToast';
import { SectionPage } from './components/SectionPage';
import { COUNTRIES, findCountry } from './domain/countries';
import type { CountryId } from './domain/countries';
import { GAME_SECTIONS, getSection, type SectionId } from './domain/navigation';
import { createNewPlayer } from './domain/player';
import type { PlayerProfile } from './domain/player';
import { formatMoney } from './domain/formatters';
import { advanceDay, getDayBriefing, type DayBriefing, type DayOutcome, type GameResult } from './game/engine';
import { loadSavedGame, saveGame } from './storage/saveRepository';
import { loadNotificationTheme, saveNotificationTheme } from './storage/userPreferences';

export default function App() {
  const [profile, setProfile] = useState<PlayerProfile | null>(() => loadSavedGame());
  const [selectedCountryId, setSelectedCountryId] = useState<CountryId>(() => profile?.countryId ?? COUNTRIES[0].id);
  const [playerName, setPlayerName] = useState(() => profile?.name ?? 'أحمد المستثمر');
  const [activeSection, setActiveSection] = useState<SectionId>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationTheme, setNotificationTheme] = useState(loadNotificationTheme);
  const [notice, setNotice] = useState('');
  const [noticeTone, setNoticeTone] = useState<'success' | 'error'>('success');
  const [dayBriefing, setDayBriefing] = useState<DayBriefing | null>(null);
  const [dayOutcome, setDayOutcome] = useState<DayOutcome | null>(null);

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
    const result = saveGame(newProfile);
    setProfile(newProfile);
    setActiveSection('home');
    setMobileMenuOpen(false);
    setNotice(result.ok ? 'تم إنشاء عالمك وحفظه على هذا الجهاز.' : 'تعذر حفظ البيانات محليًا؛ قد لا يستمر التقدم بعد إغلاق الصفحة.');
    setNoticeTone(result.ok ? 'success' : 'error');
  }

  function handleGameResult<T>(result: GameResult<T>) {
    if (!result.ok) {
      setNotice(result.message);
      setNoticeTone('error');
      return;
    }
    const saved = saveGame(result.profile);
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

  function openDayBriefing() {
    if (!profile) return;
    setDayOutcome(null);
    setDayBriefing(getDayBriefing(profile));
  }

  function closeDayBriefing() {
    setDayBriefing(null);
    setDayOutcome(null);
  }

  function confirmDay() {
    if (!profile) return;
    const result = advanceDay(profile);
    if (!result.ok) {
      handleGameResult(result);
      closeDayBriefing();
      return;
    }
    const saved = saveGame(result.profile);
    const settledAmount = Math.max(0, profile.payables - result.profile.payables);
    const settlementNote = settledAmount > 0 ? ` وُجّه ${formatMoney(settledAmount, country)} لسداد التزامات سابقة.` : '';
    setProfile(result.profile);
    setDayOutcome(result.data);
    setNotice(saved.ok ? `${result.message}${settlementNote}` : `${result.message}${settlementNote} تعذر تثبيت الحفظ على هذا الجهاز.`);
    setNoticeTone(saved.ok ? 'success' : 'error');
  }

  function navigate(section: SectionId) {
    setActiveSection(section);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

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

  const fixedBottomItems: SectionId[] = ['home', 'auctions', 'companies', 'lands'];
  const otherSections = GAME_SECTIONS.filter((section) => !fixedBottomItems.includes(section.id));

  return (
    <div className="app-frame">
      <header className="app-header">
        <button className="header-brand-button" type="button" onClick={() => navigate('home')} aria-label="العودة إلى الرئيسية"><Brand compact /></button>
        <div className="header-actions">
          <div className="header-location"><span>{country.flag}</span><span>{country.name}</span><small>{country.currency.code}</small></div>
          <span className="header-divider" />
          <span className="player-level"><span className="avatar-initial">{profile.name.trim().charAt(0) || 'م'}</span><span><strong>{profile.name}</strong><small>المستوى {profile.level}</small></span></span>
          <button className="header-settings" type="button" onClick={() => navigate('settings')} aria-label="الإعدادات"><Icon name="settings" size={19} /></button>
        </div>
      </header>

      <div className="app-layout">
        <aside className="side-nav" aria-label="أقسام اللعبة">
          <div className="side-nav-caption">إدارة الإمبراطورية</div>
          {GAME_SECTIONS.map((section) => (
            <button className={`nav-item${activeSection === section.id ? ' is-active' : ''}`} type="button" key={section.id} onClick={() => navigate(section.id)}>
              <Icon name={section.icon} size={19} /><span>{section.label}</span>
            </button>
          ))}
          <div className="side-nav-note"><Icon name="shield" size={16} /><span>حفظ محلي<br />بدون إنترنت</span></div>
        </aside>

        <main className="main-content">
          {activeSection === 'home' ? (
            <Dashboard profile={profile} country={country} onNavigate={navigate} onAdvanceDay={openDayBriefing} />
          ) : (
            <SectionPage section={active} profile={profile} country={country} notificationTheme={notificationTheme} onNotificationThemeChange={setNotificationTheme} onHome={() => navigate('home')} onAdvanceDay={openDayBriefing} onAction={handleGameResult} />
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
          {otherSections.map((section) => <button type="button" className="mobile-more-item" key={section.id} onClick={() => navigate(section.id)}><Icon name={section.icon} size={18} /><span>{section.label}</span><Icon name="chevron" size={16} /></button>)}
        </nav>
      </div>}

      {notice && <NoticeToast message={notice} tone={noticeTone} theme={notificationTheme} onDismiss={() => setNotice('')} />}
      {dayBriefing && <DailyBriefing profile={profile} country={country} briefing={dayBriefing} outcome={dayOutcome} onConfirm={confirmDay} onClose={closeDayBriefing} />}
      <footer className="app-footer"><span>إمبراطورية الأعمال</span><span>محاكاة محلية · الأسعار والأحداث لأغراض اللعبة</span></footer>
    </div>
  );
}
