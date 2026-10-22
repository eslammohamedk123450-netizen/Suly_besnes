import { useEffect, useState } from 'react';
import { Brand } from './components/Brand';
import { CountrySelection } from './components/CountrySelection';
import { Dashboard } from './components/Dashboard';
import { Icon } from './components/Icon';
import { SectionPage } from './components/SectionPage';
import { COUNTRIES, findCountry } from './domain/countries';
import type { CountryId } from './domain/countries';
import { GAME_SECTIONS, getSection, type SectionId } from './domain/navigation';
import { createNewPlayer } from './domain/player';
import type { PlayerProfile } from './domain/player';
import { clearSavedGame, loadSavedGame, saveGame } from './storage/saveRepository';

export default function App() {
  const [profile, setProfile] = useState<PlayerProfile | null>(() => loadSavedGame());
  const [selectedCountryId, setSelectedCountryId] = useState<CountryId>(() => loadSavedGame()?.countryId ?? COUNTRIES[0].id);
  const [playerName, setPlayerName] = useState(() => loadSavedGame()?.name ?? 'أحمد المستثمر');
  const [activeSection, setActiveSection] = useState<SectionId>('home');
  const [confirmNewGame, setConfirmNewGame] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notice, setNotice] = useState('');

  const country = findCountry(profile?.countryId ?? selectedCountryId) ?? COUNTRIES[0];
  const active = getSection(activeSection);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 4200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  function startNewWorld() {
    const chosenCountry = findCountry(selectedCountryId);
    if (!chosenCountry) return;
    const newProfile = createNewPlayer(chosenCountry, playerName);
    const result = saveGame(newProfile);
    setProfile(newProfile);
    setActiveSection('home');
    setMobileMenuOpen(false);
    setNotice(result.ok ? 'تم إنشاء عالمك وحفظه على هذا الجهاز.' : 'تعذر حفظ البيانات محليًا؛ قد لا يستمر التقدم بعد إغلاق الصفحة.');
  }

  function confirmRestart() {
    const result = clearSavedGame();
    if (!result.ok) {
      setNotice('تعذر مسح ملف الحفظ من هذا المتصفح.');
      setConfirmNewGame(false);
      return;
    }
    if (profile) {
      setSelectedCountryId(profile.countryId);
      setPlayerName(profile.name);
    }
    setProfile(null);
    setActiveSection('home');
    setMobileMenuOpen(false);
    setConfirmNewGame(false);
    setNotice('تم مسح التقدم بعد التأكيد. اختر الدولة لبدء عالم جديد.');
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
        {notice && <div className="toast" role="status">{notice}</div>}
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
              <Icon name={section.icon} size={19} /><span>{section.label}</span>{section.id !== 'home' && section.id !== 'settings' && <Icon name="lock" size={13} className="nav-lock" />}
            </button>
          ))}
          <div className="side-nav-note"><Icon name="shield" size={16} /><span>حفظ محلي<br />بدون إنترنت</span></div>
        </aside>

        <main className="main-content">
          {activeSection === 'home' ? (
            <Dashboard profile={profile} country={country} onNavigate={navigate} />
          ) : (
            <SectionPage section={active} profile={profile} country={country} onHome={() => navigate('home')} onNewGame={() => setConfirmNewGame(true)} />
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

      {confirmNewGame && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirmNewGame(false); }}>
        <section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <span className="dialog-icon"><Icon name="shield" size={24} /></span>
          <h2 id="confirm-title">بدء لعبة جديدة؟</h2>
          <p>سيُحذف ملف التقدم الحالي من هذا الجهاز، ثم تعود لاختيار الدولة وإنشاء لاعب جديد. لا يمكن التراجع عن الحذف.</p>
          <div className="dialog-actions"><button className="button button-secondary" type="button" onClick={() => setConfirmNewGame(false)}>إلغاء</button><button className="button button-danger" type="button" onClick={confirmRestart}>نعم، ابدأ من جديد</button></div>
        </section>
      </div>}

      {notice && <div className="toast" role="status">{notice}</div>}
      <footer className="app-footer"><span>إمبراطورية الأعمال</span><span>النسخة الأولية · البيانات محفوظة محليًا</span></footer>
    </div>
  );
}
