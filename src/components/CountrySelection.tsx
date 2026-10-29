import React, { useState } from 'react';
import { COUNTRIES, findCountry } from '../domain/countries';
import type { CountryId } from '../domain/countries';
import { DEFAULT_AVATAR_ID, FREE_AVATAR_IDS, getAvatarById } from '../domain/avatars';
import { getCountryScenario } from '../game/countryScenarios';
import { AvatarPortrait } from './AvatarPortrait';
import { Icon } from './Icon';
import { Brand } from './Brand';
import { formatCurrency } from '../domain/formatters';
import './CountrySelection.css';

interface CountrySelectionProps {
  selectedCountryId: CountryId;
  selectedAvatarId?: string;
  playerName: string;
  onCountryChange: (countryId: CountryId) => void;
  onAvatarChange?: (avatarId: string) => void;
  onPlayerNameChange: (name: string) => void;
  onStart: () => void;
}

export function CountrySelection({
  selectedCountryId,
  selectedAvatarId = DEFAULT_AVATAR_ID,
  playerName,
  onCountryChange,
  onAvatarChange,
  onPlayerNameChange,
  onStart,
}: CountrySelectionProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [nameError, setNameError] = useState<string | null>(null);

  const selectedCountry = findCountry(selectedCountryId) ?? COUNTRIES[0];
  const scenario = getCountryScenario(selectedCountry.id);
  const activeAvatar = getAvatarById(selectedAvatarId);
  const trimmedName = playerName.trim();

  const goToNextStep = () => {
    if (step === 1) {
      if (trimmedName.length < 2) {
        setNameError('أدخل اسم شخصيتك التجارية (حرفان على الأقل) للمتابعة.');
        return;
      }
      setNameError(null);
      setStep(2);
      return;
    }
    if (step === 2) {
      setStep(3);
      return;
    }
    if (step === 3) {
      setStep(4);
    }
  };

  const handleFinalStart = () => {
    if (trimmedName.length < 2) {
      setStep(1);
      setNameError('أدخل اسم شخصيتك التجارية (حرفان على الأقل) قبل بدء الرحلة.');
      return;
    }
    onStart();
  };

  return (
    <main className="setup-page" dir="rtl">
      <header className="setup-topbar">
        <Brand compact />
        <span className="offline-badge">
          <span /> حفظ تلقائي ومستقل لكل دولة
        </span>
      </header>

      <div className="setup-layout">
        {/* Left / Visual Side */}
        <section className="setup-visual" aria-label="مشهد القصة والانطلاق">
          <img src="/images/cairo-skyline-lite.webp" alt="أفق المدينة والتحدي والاستثمار" />
          <div className="setup-visual-shade" />
          <div className="setup-visual-copy">
            <span className="eyebrow">{selectedCountry.flag} {scenario.scenarioTitle}</span>
            <h1>من مصنعٍ متعثر…<br />إلى إمبراطورية اقتصادية.</h1>
            <p>
              ابدأ برأس مال تأسيسي قدره <strong>{formatCurrency(selectedCountry.startingBalance)} $</strong>، مصنع موروث بكفاءة 25%، وأرض صناعية حقيقية في{' '}
              <strong>{selectedCountry.name}</strong>، وأعد بناء مجدك خطوة بخطوة.
            </p>
          </div>
          <div className="setup-visual-footer">
            <span>{step} / 4</span>
            <span className="step-line" />
            <span>
              {step === 1
                ? 'اسم المؤسس'
                : step === 2
                  ? 'المظهر التنفيذي'
                  : step === 3
                    ? 'اختيار الدولة'
                    : 'بطاقة الدولة والأصول'}
            </span>
          </div>
        </section>

        {/* Right / 4-Step Creation Panel */}
        <section className="setup-panel">
          {/* Interactive Step Tabs */}
          <div className="flex items-center gap-1.5 mb-2" role="tablist" aria-label="مراحل إنشاء الشخصية">
            {[
              { id: 1 as const, label: '1. الاسم' },
              { id: 2 as const, label: '2. الشخصية' },
              { id: 3 as const, label: '3. الدولة' },
              { id: 4 as const, label: '4. بطاقة الدولة' },
            ].map((item) => {
              const unlocked = item.id === 1 || trimmedName.length >= 2;
              const isCurrent = step === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={!unlocked}
                  onClick={() => unlocked && setStep(item.id)}
                  className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold transition border cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* STEP 1: Character Name */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="setup-heading">
                <span className="section-kicker">الخطوة 1 من 4 · هوية المؤسس</span>
                <h2>أدخل اسم شخصيتك في عالم الأعمال</h2>
                <p>سيظهر هذا الاسم في العقود التجارية، سجلات الشركات، وتصنيف أباطرة الاقتصاد.</p>
              </div>

              <div className="field-group">
                <label htmlFor="player-name">اسم المؤسس / المدير التنفيذي</label>
                <input
                  id="player-name"
                  value={playerName}
                  onChange={(event) => {
                    onPlayerNameChange(event.target.value);
                    if (nameError && event.target.value.trim().length >= 2) {
                      setNameError(null);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      goToNextStep();
                    }
                  }}
                  maxLength={28}
                  autoComplete="name"
                  placeholder="مثال: كريم المنشاوي"
                />
                {nameError && (
                  <p className="text-xs text-rose-400 font-bold mt-1.5" role="alert">
                    {nameError}
                  </p>
                )}
              </div>

              <button className="button button-primary button-start" type="button" onClick={goToNextStep}>
                <span>التالي: اختيار المظهر التنفيذي</span>
                <Icon name="arrow" size={18} />
              </button>
            </div>
          )}

          {/* STEP 2: Avatar / Appearance */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="setup-heading">
                <span className="section-kicker">الخطوة 2 من 4 · المظهر التنفيذي</span>
                <h2>اختر مظهر شخصيتك القيادية</h2>
                <p>اختر المظهر المناسب لأسلوبك في الإدارة؛ ويمكنك فتح مظاهر إضافية لاحقاً من ملفك الشخصي.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {FREE_AVATAR_IDS.map((avatarId) => {
                  const avatar = getAvatarById(avatarId);
                  const active = avatar.id === selectedAvatarId;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => onAvatarChange?.(avatar.id)}
                      aria-pressed={active}
                      className={`p-3 rounded-xl border text-right flex items-center gap-3 transition cursor-pointer ${
                        active
                          ? 'bg-slate-800/95 border-amber-400 ring-1 ring-amber-400/40'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <AvatarPortrait avatarId={avatar.id} size="md" />
                      <div className="min-w-0 flex-1">
                        <strong className="text-sm font-bold text-white block truncate">{avatar.name}</strong>
                        <span className="text-[11px] text-amber-300 block">{avatar.title}</span>
                        <span className="text-[10px] text-slate-400 block truncate">{avatar.specialty}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
                <strong className="text-amber-300">{activeAvatar.name}:</strong> «{activeAvatar.quote}»
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer"
                >
                  السابق
                </button>
                <button className="button button-primary button-start flex-1" type="button" onClick={goToNextStep}>
                  <span>التالي: اختيار دولة التأسيس</span>
                  <Icon name="arrow" size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Country Selection */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="setup-heading">
                <span className="section-kicker">الخطوة 3 من 4 · المقر السيادي</span>
                <h2>اختر الدولة التي ستبني فيها إمبراطوريتك</h2>
                <p>لكل دولة سيناريو مستقل، مستشارون محليون، ضرائب وتكاليف تشغيل واقعية، ولا يمكن تغييرها وسط الحفظ.</p>
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
                        <small>
                          ضريبة مبيعات {Math.round(country.economy.taxRate * 100)}% · تشغيل {country.economy.operatingCostMultiplier}x
                        </small>
                      </span>
                      <span className="country-currency-badge">
                        {formatCurrency(country.startingBalance)} $
                      </span>
                      <span className="country-radio" aria-hidden="true">
                        {active ? <span /> : null}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer"
                >
                  السابق
                </button>
                <button className="button button-primary button-start flex-1" type="button" onClick={goToNextStep}>
                  <span>التالي: بطاقة خصائص {selectedCountry.name}</span>
                  <Icon name="arrow" size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Country Definition Card & Actual Starting Assets */}
          {step === 4 && (
            <div className="space-y-3.5">
              <div className="setup-heading">
                <span className="section-kicker">الخطوة 4 من 4 · ملف الدولة وأصول البداية</span>
                <h2>{selectedCountry.flag} {selectedCountry.name} — {scenario.scenarioTitle}</h2>
                <p>{scenario.economicProfile.headline}</p>
              </div>

              {/* Strengths & Challenges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
                  <strong className="text-emerald-300 block font-bold">نقاط القوة والفرص</strong>
                  {scenario.economicProfile.strengths.map((s) => (
                    <p key={s} className="text-slate-200 leading-relaxed">• {s}</p>
                  ))}
                </div>
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-1">
                  <strong className="text-amber-300 block font-bold">التحديات الاقتصادية</strong>
                  {scenario.economicProfile.challenges.map((c) => (
                    <p key={c} className="text-slate-200 leading-relaxed">• {c}</p>
                  ))}
                  <p className="text-cyan-300 pt-1">💡 {scenario.economicProfile.strategicTip}</p>
                </div>
              </div>

              {/* Exact Starting Assets */}
              <div className="story-preview-card">
                <div className="spc-head">
                  <span>📦 حزمة أصول البداية الفعلية لـ {trimmedName || 'المؤسس'}</span>
                  <span className="spc-currency">اليوم 1 · المستوى 1</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mt-1">
                  <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">السيولة النقدية والماس</span>
                    <strong className="text-emerald-400 font-bold">10,000 $ + 0 ماسة</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">المنشأة والأرض الموروثة</span>
                    <strong className="text-amber-300 font-bold">{scenario.economicProfile.inheritedFactoryName} (25%)</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">الالتزام الموروث</span>
                    <strong className="text-rose-300 font-bold">قرض 2,100 $ (سماح 7 أيام)</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">المؤسسات الوطنية</span>
                    <strong className="text-sky-300 font-bold">{scenario.economicProfile.bankName} · {scenario.economicProfile.exchangeName}</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer"
                >
                  تعديل الدولة
                </button>
                <button className="button button-primary button-start flex-1" type="button" onClick={handleFinalStart}>
                  <span>استلام الأصول وبدء اللعب</span>
                  <Icon name="arrow" size={19} />
                </button>
              </div>
            </div>
          )}

          <p className="privacy-note">
            <Icon name="shield" size={15} /> سيناريو كل دولة ومهامها ومستشاروها مستقلون تماماً طوال رحلة الحفظ.
          </p>
        </section>
      </div>

      <footer className="setup-footer">إمبراطورية الأعمال <span>•</span> نظام السيناريوهات المستقلة للدول</footer>
    </main>
  );
}
