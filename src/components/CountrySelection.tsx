import React from 'react';
import { COUNTRIES, findCountry } from '../domain/countries';
import type { CountryId } from '../domain/countries';
import { Icon } from './Icon';
import { Brand } from './Brand';
import './CountrySelection.css';

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
  const selectedCountry = findCountry(selectedCountryId) ?? COUNTRIES[0];

  return (
    <main className="setup-page" dir="rtl">
      <header className="setup-topbar">
        <Brand compact />
        <span className="offline-badge">
          <span /> تعمل على جهازك 100%
        </span>
      </header>

      <div className="setup-layout">
        {/* Left / Visual Side */}
        <section className="setup-visual" aria-label="مشهد القصة والانطلاق">
          <img src="/images/cairo-skyline-lite.webp" alt="أفق المدينة والتحدي والاستثمار" />
          <div className="setup-visual-shade" />
          <div className="setup-visual-copy">
            <span className="eyebrow">رحلة طرد العائلة والتحدي</span>
            <h1>من ابنٍ مَطرود…<br />إلى أسطورة الأسواق.</h1>
            <p>
              طردتك عائلتك واعتبروك فاشلاً، لكن أمك الحنون سلمتك ما يعادل <strong>1,000,000 $</strong> بعملة البلد لتنطلق بأسطورتك!
            </p>
          </div>
          <div className="setup-visual-footer">
            <span>١</span>
            <span className="step-line" />
            <span>اختر مقرك وعملتك</span>
          </div>
        </section>

        {/* Right / Selection Panel */}
        <section className="setup-panel">
          <div className="setup-heading">
            <span className="section-kicker">تأسيس الإمبراطورية</span>
            <h2>اختر دولتك وعملتك المحلية</h2>
            <p>تم تحويل المليون جنيه مصري بسعر الصرف الحقيقي لجميع العملات الدولية.</p>
          </div>

          {/* Investor Name */}
          <div className="field-group">
            <label htmlFor="player-name">اسم المستثمر القادم</label>
            <input
              id="player-name"
              value={playerName}
              onChange={(event) => onPlayerNameChange(event.target.value)}
              maxLength={28}
              autoComplete="name"
              placeholder="اكتب اسمك في عالم الأعمال"
            />
          </div>

          {/* Country Selection Grid */}
          <div className="field-group">
            <div className="field-label-row">
              <span>اختر الدولة والعملة ({COUNTRIES.length} دول)</span>
              <span className="field-hint">أسعار صرف حقيقية متوازنة</span>
            </div>

            <div className="country-grid-scroll">
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
                    <span className="country-flag" aria-hidden="true">
                      {country.flag}
                    </span>
                    <span className="country-main">
                      <strong>{country.name}</strong>
                      <small>{country.currency.name}</small>
                    </span>
                    <span className="country-currency-badge">
                      {country.currency.symbol} {country.startingBalance.toLocaleString('ar-EG')}
                    </span>
                    <span className="country-radio" aria-hidden="true">
                      {active ? <span /> : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Story Preview Card */}
          {selectedCountry && (
            <div className="story-preview-card">
              <div className="spc-head">
                <span>{selectedCountry.flag} قصة البداية في {selectedCountry.name}</span>
                <span className="spc-currency">{selectedCountry.currency.code}</span>
              </div>
              <h4>{selectedCountry.storyTitle}</h4>
              <p>{selectedCountry.storySummary}</p>
              <div className="spc-balance-row">
                <span>رأس المال المبدئي (من الأم):</span>
                <strong>
                  {selectedCountry.currency.symbol} {selectedCountry.startingBalance.toLocaleString('ar-EG')}
                </strong>
              </div>
            </div>
          )}

          <button className="button button-primary button-start" type="button" onClick={onStart}>
            <span>ابدأ التحدي وابنِ إمبراطوريتك</span>
            <Icon name="arrow" size={19} />
          </button>

          <p className="privacy-note">
            <Icon name="shield" size={15} /> تقدمك محفوظ محلياً وعالمياً بحسب الدولة والعملة المختارة.
          </p>
        </section>
      </div>

      <footer className="setup-footer">إمبراطورية الأعمال <span>•</span> نظام الدول والعملات الموحد</footer>
    </main>
  );
}
