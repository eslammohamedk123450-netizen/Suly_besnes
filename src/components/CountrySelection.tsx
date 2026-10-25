import { COUNTRIES, findCountry } from '../domain/countries';
import type { CountryId } from '../domain/countries';
import { Icon } from './Icon';
import { Brand } from './Brand';

interface CountrySelectionProps {
  selectedCountryId: CountryId;
  playerName: string;
  onCountryChange: (countryId: CountryId) => void;
  onPlayerNameChange: (name: string) => void;
  onStart: () => void;
}

export function CountrySelection({
  selectedCountryId,
  playerName,
  onCountryChange,
  onPlayerNameChange,
  onStart,
}: CountrySelectionProps) {
  const selectedCountry = findCountry(selectedCountryId);

  return (
    <main className="setup-page">
      <header className="setup-topbar"><Brand compact /><span className="offline-badge"><span /> تعمل على جهازك</span></header>
      <div className="setup-layout">
        <section className="setup-visual" aria-label="مشهد القاهرة">
          <img src="/images/cairo-skyline-lite.webp" alt="أفق القاهرة والنيل عند الغروب" />
          <div className="setup-visual-shade" />
          <div className="setup-visual-copy">
            <span className="eyebrow">رحلتك تبدأ بقرار</span>
            <h1>من فكرة صغيرة…<br />إلى إمبراطورية أعمال.</h1>
            <p>ابدأ في مصر، وابنِ أعمالك خطوة بخطوة.</p>
          </div>
          <div className="setup-visual-footer"><span>١</span><span className="step-line" /><span>اختر موطن البداية</span></div>
        </section>

        <section className="setup-panel">
          <div className="setup-heading">
            <span className="section-kicker">تأسيس العالم</span>
            <h2>أين تبدأ إمبراطوريتك؟</h2>
            <p>اختر الدولة التي سيكون فيها أول نشاط تجاري لك.</p>
          </div>

          <div className="field-group">
            <label htmlFor="player-name">اسم المستثمر</label>
            <input
              id="player-name"
              value={playerName}
              onChange={(event) => onPlayerNameChange(event.target.value)}
              maxLength={28}
              autoComplete="name"
              placeholder="اكتب اسمك داخل اللعبة"
            />
          </div>

          <div className="field-group">
            <div className="field-label-row"><span>الدولة الأساسية</span><span className="field-hint">مصر متاحة الآن؛ تُضاف دول أخرى لاحقًا</span></div>
            <div className="country-list">
              {COUNTRIES.map((country) => {
                const active = country.id === selectedCountryId;
                return (
                  <button
                    className={`country-card${active ? ' is-selected' : ''}`}
                    type="button"
                    key={country.id}
                    aria-pressed={active}
                    onClick={() => onCountryChange(country.id)}
                  >
                    <span className="country-flag" aria-hidden="true">{country.flag}</span>
                    <span className="country-main"><strong>{country.name}</strong><small>{country.currency.name}</small></span>
                    <span className="country-currency">{country.currency.code}</span>
                    <span className="country-radio" aria-hidden="true">{active ? <span /> : null}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="starting-funds">
            <span className="funds-icon"><Icon name="bank" size={20} /></span>
            <span><small>رصيد البداية</small><strong>{selectedCountry?.currency.symbol ?? 'ج.م'} 1,000,000</strong></span>
            <span className="funds-note">إرث البداية</span>
          </div>

          <button className="button button-primary button-start" type="button" onClick={onStart}>
            <span>ابدأ إمبراطوريتك</span><Icon name="arrow" size={19} />
          </button>
          <p className="privacy-note"><Icon name="shield" size={15} /> تقدمك محفوظ محليًا على هذا الجهاز</p>
        </section>
      </div>
      <footer className="setup-footer">إمبراطورية الأعمال <span>•</span> المرحلة الأولى</footer>
    </main>
  );
}
