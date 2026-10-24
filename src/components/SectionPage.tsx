import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import type { CountryDefinition, IndustryId } from '../domain/countries';
import type { PlayerProfile } from '../domain/player';
import type { GameCommand } from '../game/engine';
import type { NotificationTheme } from '../storage/userPreferences';
import type { SectionId, SectionItem } from '../domain/navigation';
import { formatMoney, formatNumber } from '../domain/formatters';
import { acceptContract, buyDirectCompany, buyDirectLand, buyGlobalMaterial, buyGold, buyGoldWithDiamonds, buySpeedCard, cancelProductionOrder, claimTask, createDeposit, createInvestment, deliverContract, foundCompany, getDepositExpectedInterest, getDepositMaturityRange, hasMaturedDepositTranche, hireStaff, mergeDeposits, negotiateContract, payStaffSalary, placeBid, repayLoan, runProduction, sellAsset, sellCompany, sellGold, sellLand, sellProduct, serviceCompany, takeLoan, terminateStaff, upgradeCompany, upgradeLand, upgradeWarehouse, useDaySpeedCard, useProductionSpeedCard, withdrawDeposit, type GameResult } from '../game/engine';
import type { StaffRole } from '../domain/futureSystems';
import { AUCTION_CATALOG, DIRECT_COMPANY_CATALOG, DIRECT_LAND_CATALOG, GOLD_PRICE_PER_GRAM, INDUSTRY_CATALOG, INVESTMENT_CATALOG, MATERIAL_CATALOG, PRODUCT_CATALOG, RECIPE_CATALOG } from '../game/catalog';
import { getMarketQuote } from '../game/market';
import { formatAuctionCountdown, getAuctionCloseAt } from '../game/auctions';
import { getInvestmentPayoutRate, getOperatingCostProgression } from '../game/economyBalance';
import { getContractOffers, getCustomerSegmentLabel } from '../game/contracts';
import { selectActiveInvestments, selectAdvancedStatistics, selectAvailableAuctions, selectCompanyPerformance, selectEmpirePoints, selectFinancialReport, selectInventorySummary, selectObligations, selectSalesSummary, selectTaskBoard } from '../game/selectors';
import { Icon } from './Icon';
import { isSoundEnabled, setSoundEnabled } from '../game/soundEffects';
import { EconomyEmpty, EconomyPageShell, EconomyPanel, EconomyStat } from './EconomyUI';
import { DiamondStore } from './DiamondStore';
import { PurchaseOptions } from './PurchaseOptions';
import { AuctionRoom } from './AuctionRoom';
import { claimLoginReward, claimSeasonChallenge, chooseSeasonEvent, getSeasonEventSnapshot, getSeasonSnapshot, LOGIN_REWARDS } from '../game/season';
import { getSynergyProductionMultiplier } from '../game/synergy';
import { getGlobalMarketOffers, negotiateGlobalMarketOffer } from '../game/globalMarket';
import { getWarehouseCapacity, getWarehouseItemCapacity, getWarehouseUsage, normalizeWarehouseLevel, WAREHOUSE_UPGRADE_REQUIREMENTS } from '../game/warehouse';
import { getGameDayDurationMinutes } from '../game/time';
import { getDiscountedDiamondPrice, type PurchasePaymentMethod } from '../game/purchasePricing';

interface SectionPageProps {
  section: SectionItem;
  profile: PlayerProfile;
  country: CountryDefinition;
  focus?: string;
  notificationTheme: NotificationTheme;
  isGuest: boolean;
  onNotificationThemeChange: (theme: NotificationTheme) => void;
  onHome: () => void;
  onNavigate: (section: SectionId) => void;
  onAction: (result: GameResult<unknown>) => void;
  onCommand: (command: GameCommand, fallback: (current: PlayerProfile) => GameResult<unknown>) => void;
  onRedeemed: (profile: PlayerProfile, message: string, codeId: string, rawCode: string) => Promise<boolean>;
  onRefreshProfile: () => Promise<void>;
  onLinkAccount: () => void;
  onLogout: () => void;
  onShowGuide: () => void;
}

const landTypeNames = { industrial: 'صناعية', agricultural: 'زراعية', commercial: 'تجارية' } as const;
const ledgerLabels = { revenue: 'إيراد', expense: 'مصروف', asset: 'أصل', liability: 'التزام', settlement: 'سداد التزام' } as const;

function landTransferStatus(land: PlayerProfile['lands'][number], currentDay: number): string {
  const availableOn = land.availableForCompanyOnDay ?? land.acquiredOnDay ?? 1;
  return availableOn > currentDay ? `قيد نقل الملكية حتى اليوم ${formatNumber(availableOn)}` : 'متاحة للتأسيس';
}

function economicEventDetails(event: PlayerProfile['events'][number], currentDay: number): string[] {
  const details: string[] = [];
  const industry = INDUSTRY_CATALOG.find((item) => item.id === event.industryId);
  const material = MATERIAL_CATALOG.find((item) => item.id === event.materialId);
  const product = PRODUCT_CATALOG.find((item) => item.id === event.productId);
  if (industry) details.push(`القطاع: ${industry.name}`);
  if (material && event.materialPriceMultiplier !== undefined) details.push(`${material.name}: السعر +${formatNumber(Math.round((event.materialPriceMultiplier - 1) * 100))}٪`);
  if (product && event.demandMultiplier !== undefined) details.push(`${product.name}: الطلب +${formatNumber(Math.round((event.demandMultiplier - 1) * 100))}٪`);
  if (event.effectExpiresOnDay !== undefined) details.push(event.effectExpiresOnDay >= currentDay ? `ساري حتى اليوم ${formatNumber(event.effectExpiresOnDay)}` : `انتهى تأثيره في اليوم ${formatNumber(event.effectExpiresOnDay)}`);
  return details;
}

export function SectionPage({ section, profile, country, focus, notificationTheme, isGuest, onNotificationThemeChange, onHome, onNavigate, onAction, onCommand, onRedeemed, onRefreshProfile, onLinkAccount, onLogout, onShowGuide }: SectionPageProps) {
  const playerProgress = getPlayerProgress(profile);
  const [bidAmounts, setBidAmounts] = useState<Record<string, string>>({});
  const [companyName, setCompanyName] = useState('شركة جديدة');
  const [industryId, setIndustryId] = useState<IndustryId>('food');
  const [landId, setLandId] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [productionBatches, setProductionBatches] = useState('1');
  const [materialQuantities, setMaterialQuantities] = useState<Record<string, string>>({});
  const [productQuantities, setProductQuantities] = useState<Record<string, string>>({});
  const [investmentAmounts, setInvestmentAmounts] = useState<Record<string, string>>({});
  const [goldAmount, setGoldAmount] = useState('1.0');
  const [depositAmount, setDepositAmount] = useState('50000');
  const [depositDuration, setDepositDuration] = useState('7');
  const [bankTab, setBankTab] = useState<'deposits' | 'loans'>('deposits');
  const [loanAmount, setLoanAmount] = useState('25000');
  const [loanTerm, setLoanTerm] = useState('14');
  const [loanCollateral, setLoanCollateral] = useState('');
  const [loanRepaymentCounts, setLoanRepaymentCounts] = useState<Record<string, string>>({});
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState<StaffRole>('manager');
  const [staffCompany, setStaffCompany] = useState('');
  const [auctionCompanyIds, setAuctionCompanyIds] = useState<Record<string, string>>({});
  const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(null);
  const [negotiatedMarketPrices, setNegotiatedMarketPrices] = useState<Record<string, number>>({});
  const [expandedCompanyId, setExpandedCompanyId] = useState<string | null>(null);
  const [expandedLandId, setExpandedLandId] = useState<string | null>(null);
  const [speedCardQuantities, setSpeedCardQuantities] = useState<Record<string, string>>({});
  const [, setAuctionTick] = useState(0);

  useEffect(() => {
    if (section.id !== 'auctions') return undefined;
    const timer = window.setInterval(() => setAuctionTick((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [section.id]);

  useEffect(() => {
    if (section.id === 'bank' && focus === 'loans') setBankTab('loans');
    if (!focus) return;
    const timer = window.setTimeout(() => document.getElementById(focus)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
    return () => window.clearTimeout(timer);
  }, [section.id, focus]);

  const dayLabel = `اليوم ${formatNumber(profile.day)}`;
  const balanceLabel = `الرصيد ${formatMoney(profile.bankBalance, country)}`;
  const daySpeedMultiplier = profile.activeDaySpeedMultiplier ?? 1;
  const dayDurationMinutes = getGameDayDurationMinutes(daySpeedMultiplier);
  const run = (action: (current: PlayerProfile) => GameResult<unknown>) => onAction(action(profile));
  const runCommand = (command: GameCommand, fallback: (current: PlayerProfile) => GameResult<unknown>) => onCommand(command, fallback);
  const pageShell = (children: ReactNode) => (
    <EconomyPageShell dayLabel={dayLabel} balanceLabel={balanceLabel} dayDurationMinutes={dayDurationMinutes} daySpeedMultiplier={daySpeedMultiplier}>
      {children}
    </EconomyPageShell>
  );
  const heading = (
    <div className="page-heading">
      <span className="heading-icon"><Icon name={section.icon} size={23} /></span>
      <div className="page-heading-copy"><span className="section-kicker">إدارة الإمبراطورية</span><h1>{section.label}</h1><p className="page-subtitle">{section.subtitle}</p></div>
      <button className="page-help-button" type="button" onClick={onShowGuide}><Icon name="target" size={15} /> شرح للمبتدئين</button>
    </div>
  );

  if (section.id === 'obligations') {
    const obligations = selectObligations(profile, country.economy.operatingCostMultiplier ?? 1);
    const categoryLabels = { payable: 'متأخر', salary: 'راتب', loan: 'قسط قرض', operating: 'تشغيل' } as const;
    return <div className="section-page">{heading}{pageShell(
      <>
        <div className="economy-grid economy-grid--three-mobile"><EconomyStat label="إجمالي الاستحقاقات" value={formatMoney(obligations.totalDue, country)} /><EconomyStat label="متأخر عن السداد" value={formatMoney(obligations.overdueAmount, country)} /><EconomyStat label="الرواتب اليومية" value={formatMoney(obligations.dailyPayroll, country)} /></div>
        <EconomyPanel id="obligations-list" title="خريطة الالتزامات" description="تُسدد الأقساط والتشغيل عند ترحيل اليوم، أما الرواتب فتحتاج قرار دفع يدوي. إذا لم تكفِ السيولة، يظهر الالتزام بوضوح.">
          {obligations.rows.length === 0 ? <EconomyEmpty title="لا توجد التزامات مسجلة" message="ابدأ التشغيل أو التوظيف أو التمويل حتى تظهر المواعيد والتكاليف هنا." /> : <div className="economy-list">{obligations.rows.map((row) => <article className={`economy-card economy-card--soft${row.overdue ? ' obligation-card--overdue' : ''}`} key={row.id}><div className="economy-card-head"><div className="economy-card-title"><span><strong>{row.label}</strong><small>{categoryLabels[row.category]} · موعد السداد {row.overdue ? 'متأخر' : `اليوم ${formatNumber(row.dueDay)}`}</small></span></div><span className={`economy-pill ${row.overdue ? 'economy-pill--red' : 'economy-pill--gold'}`}>{formatMoney(row.amount, country)}</span></div></article>)}</div>}
        </EconomyPanel>
      </>,
    )}</div>;
  }

  if (section.id === 'store') {
    return <div className="section-page store-page">{heading}{pageShell(
      <>
        <div className="store-hero"><div><span className="section-kicker">متجر المشتريات</span><h2>اشترِ الماس فقط</h2><p>اختر باقتك، راجع السعر، ثم أرسل طلب الشحن للمراجعة.</p></div><Icon name="store" size={38} /></div>
        <EconomyPanel title="باقات الماس" description="كل بطاقة تعرض عدد الماسات وسعرها بوضوح. الماس هو المنتج المدفوع الأساسي في اللعبة.">
          <DiamondStore profile={profile} isGuest={isGuest} onLinkAccount={onLinkAccount} onRefreshProfile={onRefreshProfile} />
        </EconomyPanel>
      </>,
    )}</div>;
  }

  if (section.id === 'settings') {
    const empirePoints = selectEmpirePoints(profile);
    return <div className="section-page">{heading}{pageShell(
      <EconomyPanel title="ملف اللاعب" description="إعدادات هذا العالم المحلي المحفوظ على الجهاز.">
        <div className="settings-card settings-card--inner">
          <div className="settings-row"><span>اسم المستثمر</span><strong>{profile.name}</strong></div>
          <div className="settings-row"><span>معرّف الحساب للدعم</span><strong className="account-code-value">{profile.accountCode}</strong></div>
          <div className="settings-row"><span>الدولة الأساسية</span><strong>{country.flag} {country.name} · {country.currency.code}</strong></div>
          <div className="settings-row"><span>اليوم داخل العالم</span><strong>{formatNumber(profile.day)}</strong></div>
          <div className="settings-row"><span>المستوى / الخبرة</span><strong>{formatNumber(playerProgress.level)} · {formatNumber(playerProgress.totalExperience)} XP</strong></div>
          <div className="settings-row settings-row--highlight"><span>نقاط الإمبراطورية</span><strong>{formatNumber(empirePoints.total)} نقطة · {empirePoints.title}</strong></div>
          <div className="settings-row"><span>الماس</span><strong>{formatNumber(profile.diamonds)}</strong></div>
          <div className="settings-row"><span>بطاقات التسريع</span><strong>{formatNumber(profile.speedCards.reduce((sum, stack) => sum + stack.quantity, 0))}</strong></div>
          <div className="settings-row"><span>الشارات الخاصة</span><strong>{formatNumber(profile.badges.length)}</strong></div>
          <div className="settings-row"><span>طريقة الحفظ</span><strong className="saved-status"><span /> {isGuest ? 'ضيف · محلي فقط' : 'حفظ متصل'}</strong></div>
          <div className="settings-note"><Icon name="shield" size={17} /><p>{isGuest ? 'عالم الضيف محفوظ على هذا الجهاز. اربط حسابًا لاستعادة العالم على أجهزة أخرى.' : 'يُحفظ العالم على جهازك ويتزامن عند الاتصال؛ اللعب الأساسي متاح دون اتصال.'}</p></div>
          {isGuest && <button className="button button-primary account-link-button" type="button" onClick={onLinkAccount}>ربط الحساب ونسخ العالم واستعادته</button>}
          <button className="button button-secondary settings-store-link" type="button" onClick={() => onNavigate('store')}><Icon name="store" size={16} /> فتح متجر المشتريات</button>
          <div className="settings-notice-theme">
            <span>المؤثرات الصوتية</span>
            <div className="settings-theme-switch" role="group" aria-label="تشغيل المؤثرات الصوتية">
              <button className={isSoundEnabled() ? 'is-selected' : ''} type="button" aria-pressed={isSoundEnabled()} onClick={() => setSoundEnabled(true)}>تشغيل</button>
              <button className={!isSoundEnabled() ? 'is-selected' : ''} type="button" aria-pressed={!isSoundEnabled()} onClick={() => setSoundEnabled(false)}>كتم</button>
            </div>
          </div>
          <div className="settings-notice-theme">
            <span>مظهر الإشعارات</span>
            <div className="settings-theme-switch" role="group" aria-label="اختيار مظهر الإشعارات">
              <button className={notificationTheme === 'dark' ? 'is-selected' : ''} type="button" aria-pressed={notificationTheme === 'dark'} onClick={() => onNotificationThemeChange('dark')}>داكن</button>
              <button className={notificationTheme === 'light' ? 'is-selected' : ''} type="button" aria-pressed={notificationTheme === 'light'} onClick={() => onNotificationThemeChange('light')}>فاتح</button>
            </div>
          </div>
          <div className="settings-actions"><button className="button button-secondary" type="button" onClick={onHome}>العودة للرئيسية</button><button className="button button-danger" type="button" onClick={onLogout}><Icon name="logout" size={16} /> تسجيل الخروج</button></div>
          <div className="settings-credit">تطوير شركة <strong>Suly- Technologies</strong></div>
        </div>
      </EconomyPanel>,
    )}</div>;
  }

  if (section.id === 'bank') {
    const collateralOptions = [
      ...profile.lands.map((land) => ({ id: land.id, label: land.label, type: 'land' as const, value: land.purchasePrice })),
      ...profile.companies.map((company) => ({ id: company.id, label: company.name, type: 'company' as const, value: 0 })),
    ];
    const selectedCollateral = collateralOptions.find((item) => item.id === (loanCollateral || collateralOptions[0]?.id));
    const activeLoans = profile.banking.loans.filter((loan) => loan.status === 'active');
    const activeDeposits = profile.banking.deposits.filter((deposit) => deposit.status === 'active');
    const totalDeposits = activeDeposits.reduce((sum, deposit) => sum + deposit.principal, 0);
    const expectedInterest = activeDeposits.reduce((sum, deposit) => sum + getDepositExpectedInterest(deposit), 0);
    const depositLimitReached = activeDeposits.length >= 5;
    const loanLimitReached = activeLoans.length >= 3;
    const loanRate = Number(loanTerm) === 7 ? 0.18 : Number(loanTerm) === 14 ? 0.22 : 0.28;
    const estimatedRepayment = Math.round(Number(loanAmount) * (1 + loanRate * Number(loanTerm) / 30));
    return <div className="section-page bank-page">{heading}{pageShell(
      <>
        <div className="bank-hero"><div><span className="section-kicker">إدارة السيولة</span><h2>إمبراطورية الأعمال</h2><p>تابع ودائعك وقروضك من مكان واحد.</p></div><Icon name="bank" size={42} /></div>
        <div className="bank-tabs" role="tablist" aria-label="أنظمة البنك"><button className={bankTab === 'deposits' ? 'is-active' : ''} type="button" role="tab" aria-selected={bankTab === 'deposits'} onClick={() => setBankTab('deposits')}><Icon name="bank" size={21} /> الودائع</button><button className={bankTab === 'loans' ? 'is-active' : ''} type="button" role="tab" aria-selected={bankTab === 'loans'} onClick={() => setBankTab('loans')}><Icon name="briefcase" size={21} /> القروض</button></div>
        <div className="bank-summary-grid"><article><span>إجمالي الودائع</span><strong>{formatMoney(totalDeposits, country)}</strong></article><article><span>الأرباح المتوقعة</span><strong>+{formatMoney(expectedInterest, country)}</strong></article></div>
        {bankTab === 'deposits' ? <>
          <section className="bank-section"><div className="bank-section-heading"><div><span className="section-kicker">{formatNumber(activeDeposits.length)}/5 ودائع نشطة</span><h3>الودائع النشطة</h3></div><div className="bank-section-count">{formatNumber(activeDeposits.length)}</div></div>{activeDeposits.length === 0 ? <EconomyEmpty title="لا توجد ودائع نشطة" message="افتح أول وديعة وابدأ بتنمية السيولة المحجوزة." /> : <div className="bank-deposit-grid">{activeDeposits.slice().reverse().map((deposit) => { const interest = getDepositExpectedInterest(deposit); const maturity = getDepositMaturityRange(deposit); const merged = Boolean(deposit.tranches); return <article className="bank-deposit-card" key={deposit.id}><span className="bank-status">{merged ? 'وديعة مدمجة' : 'نشطة'}</span><strong>{formatMoney(deposit.principal, country)}</strong><div><span>عائد تقريبي {Math.round(deposit.annualRate * 100)}%</span><span>ربح متوقع +{formatMoney(interest, country)}</span></div><small>{maturity.firstDay === maturity.lastDay ? `تستحق في اليوم ${formatNumber(maturity.firstDay)}` : `استحقاق الأجزاء من اليوم ${formatNumber(maturity.firstDay)} إلى ${formatNumber(maturity.lastDay)}`}</small>{hasMaturedDepositTranche(deposit, profile.day) && <button className="button button-secondary" type="button" onClick={() => runCommand({ name: 'withdraw_deposit', args: { depositId: deposit.id } }, (current) => withdrawDeposit(current, deposit.id))}>استرداد المستحق</button>}</article>; })}</div>}{activeDeposits.length > 1 && <button className="button button-secondary" type="button" onClick={() => runCommand({ name: 'merge_deposits', args: { depositIds: activeDeposits.map((deposit) => deposit.id) } }, (current) => mergeDeposits(current, activeDeposits.map((deposit) => deposit.id)))}>دمج كل الودائع النشطة في وديعة واحدة</button>}</section>
          <section className="bank-section bank-open-section"><div className="bank-section-heading"><div><span className="section-kicker">استثمار محاكى</span><h3>فتح وديعة جديدة</h3></div><Icon name="plus" size={24} /></div>{depositLimitReached && <p className="economy-meta">وصلت إلى الحد الأقصى البالغ 5 ودائع نشطة. ادمج الودائع أو استرد مستحقًا لإضافة وديعة.</p>}<form className="bank-deposit-form" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); runCommand({ name: 'create_deposit', args: { amount: Number(depositAmount), durationDays: Number(depositDuration) } }, (current) => createDeposit(current, Number(depositAmount), Number(depositDuration))); }}><div className="economy-field"><label htmlFor="deposit-amount">مبلغ الوديعة</label><input id="deposit-amount" type="number" min="50000" step="1000" value={depositAmount} onChange={(event) => setDepositAmount(event.target.value)} /></div><div className="economy-field"><label htmlFor="deposit-duration">المدة والعائد</label><select id="deposit-duration" value={depositDuration} onChange={(event) => setDepositDuration(event.target.value)}><option value="3">3 أيام · عائد 5%</option><option value="7">7 أيام · عائد 8%</option><option value="14">14 يومًا · عائد 12%</option></select></div><button className="button button-primary bank-open-button" type="submit" disabled={depositLimitReached || Number(depositAmount) < 50000 || Number(depositAmount) > profile.bankBalance}><Icon name="plus" size={18} /> فتح وديعة جديدة</button></form></section>
        </> : <>
          <section className="bank-section"><div className="bank-section-heading"><div><span className="section-kicker">{formatNumber(activeLoans.length)}/3 قروض نشطة</span><h3>القروض النشطة</h3></div><span className="bank-section-count">{formatNumber(activeLoans.length)}</span></div>{activeLoans.length === 0 ? <EconomyEmpty title="لا توجد قروض نشطة" message="يمكنك طلب قرض بضمان أرض أو شركة مؤهلة." /> : <div className="bank-deposit-grid">{activeLoans.map((loan) => { const repaymentCount = loanRepaymentCounts[loan.id] ?? '1'; return <article className="bank-deposit-card bank-loan-card" key={loan.id}><span className="bank-status bank-status--loan">قسط يوم {formatNumber(loan.nextPaymentDay)}</span><strong>{formatMoney(loan.principal, country)}</strong><div><span>المتبقي {formatMoney(loan.remainingBalance, country)}</span><span>القسط {formatMoney(loan.installmentAmount, country)}</span></div><small>الضمان: {loan.collateralType === 'land' ? 'أرض' : 'شركة'} · مدة {formatNumber(loan.termDays)} يوم</small><div className="loan-repayment-row"><input type="number" min="1" max={Math.ceil(loan.remainingBalance / loan.installmentAmount)} step="1" value={repaymentCount} onChange={(event) => setLoanRepaymentCounts((previous) => ({ ...previous, [loan.id]: event.target.value }))} aria-label="عدد الأقساط" /><button className="button button-secondary" type="button" disabled={Number(repaymentCount) < 1 || profile.bankBalance < Math.min(loan.remainingBalance, loan.installmentAmount * Number(repaymentCount))} onClick={() => runCommand({ name: 'repay_loan', args: { loanId: loan.id, installments: Number(repaymentCount) } }, (current) => repayLoan(current, loan.id, Number(repaymentCount)))}>سداد الأقساط</button><button className="button button-primary" type="button" disabled={profile.bankBalance < loan.remainingBalance} onClick={() => runCommand({ name: 'repay_loan', args: { loanId: loan.id, installments: 'all' } }, (current) => repayLoan(current, loan.id, 'all'))}>سداد كامل</button></div></article>; })}</div>}</section>
          <section className="bank-section bank-open-section"><div className="bank-section-heading"><div><span className="section-kicker">تمويل بضمان</span><h3>طلب قرض جديد</h3></div><Icon name="briefcase" size={24} /></div>{loanLimitReached && <p className="economy-meta">وصلت إلى الحد الأقصى البالغ 3 قروض نشطة. سدّد قرضًا قائمًا قبل طلب قرض جديد.</p>}{selectedCollateral ? <form className="bank-deposit-form" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); runCommand({ name: 'take_loan', args: { collateralType: selectedCollateral.type, collateralId: selectedCollateral.id, amount: Number(loanAmount), termDays: Number(loanTerm) } }, (current) => takeLoan(current, selectedCollateral.type, selectedCollateral.id, Number(loanAmount), Number(loanTerm))); }}><div className="economy-field"><label htmlFor="loan-collateral">الضمان</label><select id="loan-collateral" value={selectedCollateral.id} onChange={(event) => setLoanCollateral(event.target.value)}>{collateralOptions.map((item) => <option value={item.id} key={item.id}>{item.label} · {item.type === 'land' ? 'أرض' : 'شركة'}</option>)}</select></div><div className="economy-field"><label htmlFor="loan-amount">مبلغ القرض</label><input id="loan-amount" type="number" min="25000" step="1000" value={loanAmount} onChange={(event) => setLoanAmount(event.target.value)} /></div><div className="economy-field"><label htmlFor="loan-term">مدة السداد</label><select id="loan-term" value={loanTerm} onChange={(event) => setLoanTerm(event.target.value)}><option value="7">7 أيام · 18%</option><option value="14">14 يومًا · 22%</option><option value="30">30 يومًا · 28%</option></select></div><button className="button button-primary bank-open-button" type="submit" disabled={loanLimitReached || Number(loanAmount) < 25000}>طلب القرض</button><div className="economy-meta"><span>إجمالي السداد المتوقع {formatMoney(estimatedRepayment, country)}</span><span>القسط التقريبي {formatMoney(Math.ceil(estimatedRepayment / Math.max(1, Number(loanTerm))), country)} يوميًا</span></div></form> : <EconomyEmpty title="لا يوجد ضمان مؤهل" message="اشترِ أرضًا أو أسس شركة أولًا حتى يظهر خيار التمويل." />}</section>
        </>}
      </>,
    )}</div>;
  }

  if (section.id === 'staff') {
    const activeStaff = profile.staff.filter((member) => member.status === 'active');
    const roleLabels: Record<StaffRole, string> = { manager: 'مدير شركة', accountant: 'محاسب', lawyer: 'محامٍ', hr: 'مدير موارد بشرية' };
    return <div className="section-page">{heading}{pageShell(
      <>
        <div className="economy-grid economy-grid--three-mobile"><EconomyStat label="موظفون نشطون" value={formatNumber(activeStaff.length)} /><EconomyStat label="الرواتب اليومية" value={formatMoney(activeStaff.reduce((sum, member) => sum + member.dailySalary, 0), country)} /><EconomyStat label="الراتب القادم" value={activeStaff.length > 0 ? `اليوم ${formatNumber(Math.min(...activeStaff.map((member) => member.nextPayDay)))}` : '—'} /></div>
        <EconomyPanel id="staff-list" title="التعيين والإدارة" description="كل عقد له راتب يومي وموعد دفع وصلاحية واضحة. المدير المرتبط بشركة يخفض مصروف تشغيلها محاكيًا مقابل أجره.">
          <form className="economy-form" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); runCommand({ name: 'hire_staff', args: { role: staffRole, name: staffName, companyId: staffRole === 'manager' ? staffCompany : undefined } }, (current) => hireStaff(current, staffRole, staffName, staffRole === 'manager' ? staffCompany : undefined)); }}>
            <div className="economy-form-row"><div className="economy-field"><label htmlFor="staff-name">اسم الموظف</label><input id="staff-name" value={staffName} onChange={(event) => setStaffName(event.target.value)} placeholder="مثال: أحمد سالم" /></div><div className="economy-field"><label htmlFor="staff-role">الدور</label><select id="staff-role" value={staffRole} onChange={(event) => setStaffRole(event.target.value as StaffRole)}>{Object.entries(roleLabels).map(([role, label]) => <option value={role} key={role}>{label}</option>)}</select></div>{staffRole === 'manager' && <div className="economy-field"><label htmlFor="staff-company">الشركة</label><select id="staff-company" value={staffCompany} onChange={(event) => setStaffCompany(event.target.value)}><option value="">اختر شركة</option>{profile.companies.map((company) => <option value={company.id} key={company.id}>{company.name}</option>)}</select></div>}</div>
            <button className="button button-primary" type="submit" disabled={staffName.trim().length < 2 || (staffRole === 'manager' && !staffCompany)}>توقيع العقد ودفع يوم التعاقد</button>
          </form>
        </EconomyPanel>
        <EconomyPanel title="العقود والرواتب" description="يصبح الراتب مستحقًا عند انتقال اليوم؛ سدّده من زر الموظف لإدارة السيولة.">
          {profile.staff.length === 0 ? <EconomyEmpty title="لا يوجد موظفون" message="ابدأ بمدير لشركة قائمة أو وظّف محاسبًا ومحاسبيًا عند اتساع العمليات." /> : <div className="economy-list">{profile.staff.slice().reverse().map((member) => <article className="economy-card economy-card--soft" key={member.id}><div className="economy-card-head"><div className="economy-card-title"><span><strong>{member.name}</strong><small>{roleLabels[member.role]} · {formatMoney(member.dailySalary, country)} يوميًا · الراتب التالي يوم {formatNumber(member.nextPayDay)}</small></span></div><span className={`economy-pill ${member.status === 'active' ? 'economy-pill--gold' : 'economy-pill--red'}`}>{member.status === 'active' ? 'عقد نشط' : 'منتهٍ'}</span></div>{member.status === 'active' && <div className="economy-button-row"><button className="button button-primary" type="button" disabled={!member.unpaidSalary || profile.bankBalance < member.unpaidSalary} onClick={() => runCommand({ name: 'pay_staff_salary', args: { staffId: member.id } }, (current) => payStaffSalary(current, member.id))}>{member.unpaidSalary ? `دفع مستحقات ${formatMoney(member.unpaidSalary, country)}` : 'لا يوجد مستحق حاليًا'}</button><button className="button button-secondary" type="button" onClick={() => runCommand({ name: 'terminate_staff', args: { staffId: member.id } }, (current) => terminateStaff(current, member.id))}>إنهاء العقد</button></div>}</article>)}</div>}
        </EconomyPanel>
      </>,
    )}</div>;
  }

  if (section.id === 'auctions') {
    const listings = selectAvailableAuctions(profile);
    const selectedAuction = selectedAuctionId ? listings.find((listing) => listing.id === selectedAuctionId) : undefined;
    return <div className="section-page">{heading}{pageShell(
      <>
        <div className="economy-grid economy-grid--three-mobile">
          <EconomyStat label="الأراضي المملوكة" value={formatNumber(profile.lands.length)} />
          <EconomyStat label="المتاح بالمزادات" value={formatNumber(listings.length)} />
          <EconomyStat label="ميزانية البنك" value={formatMoney(profile.bankBalance, country)} />
        </div>
        <EconomyPanel id="auctions-list" title="مزادات الأراضي والمصانع والمواد الخام" description="قدّم عرضًا وتنافس مع شخصيات داخل اللعبة. يُخصم المبلغ فقط عند فوزك.">
          {listings.length === 0 ? <EconomyEmpty title="لا توجد مزادات متاحة" message="عد لاحقًا لمتابعة الفرص الجديدة." /> : <div className="economy-list">
            {listings.map((listing, index) => {
              const recommended = listing.minimumBid + listing.bidIncrement;
              const value = bidAmounts[listing.id] ?? String(recommended);
              const material = MATERIAL_CATALOG.find((item) => item.id === listing.materialId);
              const closeAt = getAuctionCloseAt(profile, listing);
              const listingHistory = profile.auctionHistory.filter((bid) => bid.listingId === listing.id);
              const highestBid = listingHistory.reduce((highest, bid) => Math.max(highest, bid.amount), 0);
              const bidHistory = listingHistory.slice(-3).reverse();
              const lotSummary = listing.lotType === 'land'
                ? `${formatNumber(listing.areaSquareMeters)} م² · أرض ${landTypeNames[listing.landType]}`
                : listing.lotType === 'factory'
                  ? `توسعة طاقة مصنع بمقدار ${formatNumber(listing.energyCapacityBonus ?? 0)} وحدة`
                  : `شحنة ${formatNumber(listing.quantity ?? 0)} ${material?.unit ?? 'وحدة'} من ${material?.name ?? 'مواد خام'}`;
              const canBuyLot = listing.lotType !== 'factory' || profile.companies.length > 0;
              return <article className="economy-card" key={listing.id}>
                <div className="economy-card-head">
                  <div className="economy-card-title"><span className="economy-card-icon"><Icon name={listing.lotType === 'land' ? 'land' : listing.lotType === 'factory' ? 'factory' : 'warehouse'} size={19} /></span><span><strong>{listing.label}</strong><small>{lotSummary}</small></span></div>
                  <span className="economy-price">{formatMoney(listing.minimumBid, country)}</span>
                </div>
                <div className="economy-card-body">
                  <div className="economy-meta"><span>الحد الأدنى للعرض {formatMoney(listing.minimumBid, country)}</span><span>أعلى عرض حالي {highestBid > 0 ? formatMoney(highestBid, country) : 'لا يوجد'}</span><span>الزيادة {formatMoney(listing.bidIncrement, country)}</span><span className="economy-pill economy-pill--gold">الإغلاق خلال {formatAuctionCountdown(closeAt)}</span></div>
                  {bidHistory.length > 0 && <div className="economy-inline-note">آخر المنافسات: {bidHistory.map((bid) => `${bid.bidder === 'player' ? 'أنت' : 'منافس'} ${formatMoney(bid.amount, country)}`).join(' · ')}</div>}
                  <div className="economy-form">
                    <div className="economy-form-row"><div className="economy-field"><label>عرض افتتاحي مقترح</label><input value={formatMoney(recommended, country)} readOnly /></div><div className="economy-field"><label>نظام الجلسة</label><input value="طاولة مزاد مباشرة" readOnly /></div></div>
                    {!canBuyLot && <div className="economy-alert"><Icon name="shield" size={16} />أسس شركة أولًا حتى تربط بها المصنع الفائز.</div>}
                    <button className="button button-primary" type="button" disabled={!canBuyLot || profile.bankBalance < listing.minimumBid} onClick={() => setSelectedAuctionId(listing.id)}><Icon name="gavel" size={16} /> فتح طاولة المزاد</button>
                  </div>
                </div>
              </article>;
            })}
          </div>}
        </EconomyPanel>
        <EconomyPanel title="شراء مباشر من السوق" description="عروض أراضٍ وشركات يطرحها التطبيق مباشرة. يمكنك الشراء فورًا دون انتظار مزاد، وتختفي السلعة من قائمتك بعد الشراء.">
          <div className="economy-list">
            {DIRECT_LAND_CATALOG.filter((listing) => listing.id !== 'starter-village-land' && !profile.lands.some((land) => land.id === listing.id)).map((listing) => <article className="economy-card economy-card--soft" key={listing.id}><div className="economy-card-head"><div className="economy-card-title"><span className="economy-card-icon"><Icon name="land" size={18} /></span><span><strong>{listing.label}</strong><small>{formatNumber(listing.areaSquareMeters)} م² · أرض {landTypeNames[listing.landType]}</small></span></div><span className="economy-price">{formatMoney(listing.price, country)}</span></div><PurchaseOptions country={country} cashPrice={listing.price} bankBalance={profile.bankBalance} diamondsBalance={profile.diamonds} onPurchase={(paymentMethod) => runCommand({ name: 'buy_direct_land', args: { listingId: listing.id, paymentMethod } }, (current) => buyDirectLand(current, listing.id, paymentMethod))} /></article>)}
            {DIRECT_COMPANY_CATALOG.filter((listing) => !profile.companies.some((company) => company.id === listing.id)).map((listing) => { const industry = INDUSTRY_CATALOG.find((item) => item.id === listing.industryId); return <article className="economy-card economy-card--soft" key={listing.id}><div className="economy-card-head"><div className="economy-card-title"><span className="economy-card-icon"><Icon name="factory" size={18} /></span><span><strong>{listing.name}</strong><small>{industry?.name ?? listing.industryId} · شركة مع أرض وتجهيز أولي</small></span></div><span className="economy-price">{formatMoney(listing.price, country)}</span></div><PurchaseOptions country={country} cashPrice={listing.price} bankBalance={profile.bankBalance} diamondsBalance={profile.diamonds} onPurchase={(paymentMethod) => runCommand({ name: 'buy_direct_company', args: { listingId: listing.id, paymentMethod } }, (current) => buyDirectCompany(current, listing.id, paymentMethod))} /></article>; })}
          </div>
        </EconomyPanel>
        <EconomyPanel title="بيع الأصول" description="يمكنك تصفية الأرض أو الشركة أو أي أصل متحرك. سعر التصفية يساوي 50% من القيمة المسجلة، والأرض المرتبطة بشركة تُباع مع الشركة.">
          <div className="economy-list">
            {profile.companies.map((company) => { const industry = INDUSTRY_CATALOG.find((item) => item.id === company.industryId); const land = company.landId ? profile.lands.find((item) => item.id === company.landId) : undefined; const value = (industry?.setupFee ?? 0) + (industry?.licenseFee ?? 0) + (land?.purchasePrice ?? 0); return <article className="economy-card economy-card--soft" key={`sell-company-${company.id}`}><div className="economy-card-head"><div className="economy-card-title"><span className="economy-card-icon"><Icon name="factory" size={18} /></span><span><strong>{company.name}</strong><small>قيمة تقديرية {formatMoney(value, country)} · عائد التصفية {formatMoney(Math.floor(value * 0.5), country)}</small></span></div><button className="button button-secondary" type="button" onClick={() => runCommand({ name: 'sell_company', args: { companyId: company.id } }, (current) => sellCompany(current, company.id))}>بيع الشركة</button></div></article>; })}
            {profile.lands.filter((land) => !profile.companies.some((company) => company.landId === land.id)).map((land) => <article className="economy-card economy-card--soft" key={`sell-land-${land.id}`}><div className="economy-card-head"><div className="economy-card-title"><span className="economy-card-icon"><Icon name="land" size={18} /></span><span><strong>{land.label}</strong><small>قيمة الشراء {formatMoney(land.purchasePrice, country)} · التصفية {formatMoney(Math.floor(land.purchasePrice * 0.5), country)}</small></span></div><button className="button button-secondary" type="button" onClick={() => runCommand({ name: 'sell_land', args: { landId: land.id } }, (current) => sellLand(current, land.id))}>بيع الأرض</button></div></article>)}
            {profile.assets.map((asset) => <article className="economy-card economy-card--soft" key={`sell-asset-${asset.id}`}><div className="economy-card-head"><div className="economy-card-title"><span className="economy-card-icon"><Icon name="briefcase" size={18} /></span><span><strong>{asset.label}</strong><small>قيمة الأصل {formatMoney(asset.value, country)} · التصفية {formatMoney(Math.floor(asset.value * 0.5), country)}</small></span></div><button className="button button-secondary" type="button" onClick={() => runCommand({ name: 'sell_asset', args: { assetId: asset.id } }, (current) => sellAsset(current, asset.id))}>بيع الأصل</button></div></article>)}
            {profile.companies.length === 0 && profile.lands.length === 0 && profile.assets.length === 0 && <EconomyEmpty title="لا توجد أصول للبيع" message="اشترِ أرضًا أو شركة أو أصلًا من المزادات أولًا." />}
          </div>
        </EconomyPanel>
        <EconomyPanel title="سجل المنافسة" description="آخر العروض المسجلة داخل المزادات المحلية دون كشف سقف العروض المنافسة.">
          {profile.auctionHistory.length === 0 ? <EconomyEmpty title="لا توجد منافسات مسجلة" message="ستظهر عروضك والمنافسات بعد أول عرض ناجح." /> : <div className="economy-table-wrap"><table className="economy-table"><thead><tr><th>المزاد</th><th>المنافس</th><th>العرض</th><th>اليوم</th></tr></thead><tbody>{profile.auctionHistory.slice().reverse().slice(0, 12).map((bid) => <tr key={bid.id}><td><strong>{AUCTION_CATALOG.find((item) => bid.listingId.startsWith(item.id))?.label ?? bid.listingId}</strong></td><td>{bid.bidder === 'player' ? 'أنت' : 'منافس'}</td><td>{formatMoney(bid.amount, country)}</td><td>{formatNumber(bid.day)}</td></tr>)}</tbody></table></div>}
        </EconomyPanel>
        <EconomyPanel title="سجل الملكيات" description="تظهر هنا الأراضي التي فزت بها فعليًا.">
          {profile.lands.length === 0 ? <EconomyEmpty title="لا توجد أراضٍ مملوكة بعد" message="افتح مزادًا وقدّم عرضًا لتسجيل أول أصل عقاري." /> : <div className="economy-list">{profile.lands.map((land) => <article className="economy-card economy-card--soft" key={land.id}><div className="economy-card-head"><div className="economy-card-title"><span className="economy-card-icon"><Icon name="land" size={18} /></span><span><strong>{land.label}</strong><small>{formatNumber(land.areaSquareMeters)} م² · {land.landType ? landTypeNames[land.landType] : 'أرض'}</small></span></div><span className="economy-price">{formatMoney(land.purchasePrice, country)}</span></div></article>)}</div>}
        </EconomyPanel>
      </>,
    )}{selectedAuction && <AuctionRoom profile={profile} country={country} listing={selectedAuction} onClose={() => setSelectedAuctionId(null)} onBid={(amount, targetCompanyId) => { const result = placeBid(profile, selectedAuction.id, amount, targetCompanyId); onAction(result); if (result.ok) setSelectedAuctionId(null); return result; }} />}</div>;
  }

  if (section.id === 'lands') {
    const usedLandIds = new Set(profile.companies.map((company) => company.landId).filter(Boolean));
    const totalLandValue = profile.lands.reduce((sum, land) => sum + land.purchasePrice, 0);
    return <div className="section-page">{heading}{pageShell(
      <>
        <div className="economy-grid economy-grid--three-mobile"><EconomyStat label="قطع الأراضي" value={formatNumber(profile.lands.length)} /><EconomyStat label="أراضٍ مرتبطة بشركات" value={formatNumber(usedLandIds.size)} /><EconomyStat label="القيمة الدفترية" value={formatMoney(totalLandValue, country)} /></div>
        {!profile.lands.some((land) => land.id === 'starter-village-land') && <EconomyPanel title="عرض البداية · أرض قرية النخيل" description="وصلتك رسالة من وجيه القرية: يريد بيع أرض عائلته لتبدأ مشروعك. هذا العرض الافتتاحي مضمون ولا يحتاج مزادًا أو منافسة."><article className="economy-card starter-land-offer"><div className="economy-card-head"><div className="economy-card-title"><span className="economy-card-icon"><Icon name="land" size={21} /></span><span><strong>الوجيه سالم من قرية النخيل</strong><small>أرض زراعية 520 م² · عرض مباشر للاعب الجديد</small></span></div><span className="economy-price">{formatMoney(180_000, country)}</span></div><div className="economy-card-body"><p className="economy-card-description">«أعرف أن عائلتك تبدأ من جديد. سأقبل هذا السعر كما هو، لكن لا أستطيع البيع بأقل من 150,000 ج.م.»</p><div className="economy-meta"><span className="economy-pill economy-pill--gold">لا مزاد</span><span className="economy-pill economy-pill--green">عرض مضمون</span><span>الحد الأدنى 150,000 ج.م</span></div><PurchaseOptions country={country} cashPrice={180_000} bankBalance={profile.bankBalance} diamondsBalance={profile.diamonds} cashLabel="شراء الأرض نقدًا" onPurchase={(paymentMethod) => runCommand({ name: 'buy_direct_land', args: { listingId: 'starter-village-land', paymentMethod } }, (current) => buyDirectLand(current, 'starter-village-land', paymentMethod))} /></div></article></EconomyPanel>}
        <EconomyPanel title="أراضي الإمبراطورية" description="تُسجل قيمة الشراء ضمن أصولك، ويمكن تخصيص كل أرض لشركة واحدة.">
          {profile.lands.length === 0 ? <div className="economy-list"><EconomyEmpty title="ابدأ بشراء أول أرض" message="الأرض شرط لتأسيس شركة. افتح عرض البداية من أعلى الصفحة، ولا تحتاج للمزاد في أول خطوة." /><button className="button button-primary" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>عرض أرض القرية أعلاه</button></div> : <div className="economy-list">{profile.lands.map((land) => {
            const owner = profile.companies.find((company) => company.landId === land.id);
            const isExpanded = expandedLandId === land.id;
            return <article className={`economy-card asset-detail-card${isExpanded ? ' asset-detail-card--expanded' : ''}`} key={land.id}><button className="asset-detail-trigger" type="button" aria-expanded={isExpanded} onClick={() => setExpandedLandId(isExpanded ? null : land.id)}><span className="economy-card-title"><span className="economy-card-icon"><Icon name={owner ? 'factory' : 'land'} size={19} /></span><span><strong>{land.label}</strong><small>{formatNumber(land.areaSquareMeters)} م² · {land.landType ? landTypeNames[land.landType] : 'نوع عام'} · مستوى {formatNumber(land.upgradeLevel ?? 1)}</small></span></span><span className={`economy-pill ${owner ? 'economy-pill--green' : 'economy-pill--gold'}`}>{owner ? `تشغلها ${owner.name}` : landTransferStatus(land, profile.day)}</span></button>{isExpanded && <div className="asset-detail-body"><div className="economy-meta"><span>سعر الشراء {formatMoney(land.purchasePrice, country)}</span><span>تاريخ التسجيل {new Date(land.acquiredAt).toLocaleDateString('ar-EG')}</span><span>الحالة {owner ? 'مرتبطة بشركة' : landTransferStatus(land, profile.day)}</span></div>{owner ? <div className="asset-detail-summary"><Icon name="factory" size={17} /><span>تدعم هذه الأرض شركة <strong>{owner.name}</strong> في قطاع {INDUSTRY_CATALOG.find((item) => item.id === owner.industryId)?.name ?? owner.industryId}.</span></div> : <p className="economy-card-description">هذه الأرض غير مرتبطة بأي شركة ويمكن اختيارها من نموذج التأسيس إذا وافق نوعها القطاع المطلوب.</p>}{(land.upgradeLevel ?? 1) >= 5 ? <p className="economy-meta">الأرض في أعلى مستوى تطوير.</p> : <PurchaseOptions country={country} cashPrice={Math.round(80_000 * Math.pow(1.55, (land.upgradeLevel ?? 1) - 1))} bankBalance={profile.bankBalance} diamondsBalance={profile.diamonds} cashLabel={`تطوير الأرض · نقدًا`} onPurchase={(paymentMethod) => runCommand({ name: 'upgrade_land', args: { landId: land.id, paymentMethod } }, (current) => upgradeLand(current, land.id, paymentMethod))} /> }</div>}</article>;
          })}</div>}
        </EconomyPanel>
      </>,
    )}</div>;
  }

  if (section.id === 'companies') {
    const industry = INDUSTRY_CATALOG.find((item) => item.id === industryId) ?? INDUSTRY_CATALOG[0];
    const usedLandIds = new Set(profile.companies.map((company) => company.landId).filter(Boolean));
    const eligibleLands = profile.lands.filter((land) => !usedLandIds.has(land.id) && (land.availableForCompanyOnDay ?? land.acquiredOnDay ?? 1) <= profile.day && (!land.landType || land.landType === industry.requiredLandType));
    const pendingLandCount = profile.lands.filter((land) => !usedLandIds.has(land.id) && (land.availableForCompanyOnDay ?? land.acquiredOnDay ?? 1) > profile.day).length;
    const selectedLandId = eligibleLands.some((land) => land.id === landId) ? landId : eligibleLands[0]?.id ?? '';
    const setupFee = country.economy.companySetupFee ?? industry.setupFee;
    const licenseFee = country.economy.licenseFeesByIndustry[industry.id] ?? industry.licenseFee;
    return <div className="section-page">{heading}{pageShell(
      <>
        <div className="economy-grid economy-grid--three-mobile"><EconomyStat label="الشركات" value={formatNumber(profile.companies.length)} /><EconomyStat label="تكلفة تأسيس القطاع" value={formatMoney(setupFee + licenseFee, country)} /><EconomyStat label="الأرض المتاحة" value={formatNumber(eligibleLands.length)} /></div>
        <div className="economy-layout">
          <EconomyPanel title="تأسيس شركة" description="اختر قطاعًا، واسمًا، وأرضًا مناسبة. تُخصم رسوم التأسيس والترخيص عند نجاح العملية.">
            {profile.lands.length === 0 ? <div className="economy-list"><EconomyEmpty title="تحتاج إلى أرض أولًا" message="اشترِ أرضًا من المزادات؛ بعدها يمكنك تأسيس شركة وتشغيل مصنعها." /><button className="button button-primary" type="button" onClick={onHome}>عرض ملخص الإمبراطورية</button></div> : <div className="economy-form">
              <div className="economy-field"><label htmlFor="industry-select">القطاع الاقتصادي</label><select id="industry-select" value={industry.id} onChange={(event) => setIndustryId(event.target.value as IndustryId)}>{INDUSTRY_CATALOG.map((item) => <option value={item.id} key={item.id}>{item.name} · {formatMoney((country.economy.companySetupFee ?? item.setupFee) + (country.economy.licenseFeesByIndustry[item.id] ?? item.licenseFee), country)}</option>)}</select></div>
              <div className="economy-field"><label htmlFor="company-name">اسم الشركة</label><input id="company-name" value={companyName} maxLength={36} onChange={(event) => setCompanyName(event.target.value)} /></div>
              <div className="economy-field"><label htmlFor="land-select">الأرض المناسبة ({landTypeNames[industry.requiredLandType]})</label><select id="land-select" value={selectedLandId} onChange={(event) => setLandId(event.target.value)} disabled={eligibleLands.length === 0}><option value="">اختر أرضًا</option>{eligibleLands.map((land) => <option key={land.id} value={land.id}>{land.label} · {formatNumber(land.areaSquareMeters)} م²</option>)}</select></div>
              <div className="economy-meta"><span>رسوم تأسيس {formatMoney(setupFee, country)}</span><span>ترخيص {formatMoney(licenseFee, country)}</span><span>تشغيل يومي {formatMoney(industry.dailyOperatingCost, country)}</span></div>
              {eligibleLands.length === 0 && <div className="economy-alert"><Icon name="shield" size={16} />{pendingLandCount > 0 ? `توجد ${formatNumber(pendingLandCount)} أرض قيد إنهاء عقود نقل الملكية؛ ستكون متاحة بعد يوم داخل اللعبة.` : `لا تملك أرضًا من النوع المناسب لهذا النشاط؛ اشترِ موقعًا ${landTypeNames[industry.requiredLandType]}.`}</div>}
              <PurchaseOptions country={country} cashPrice={setupFee + licenseFee} bankBalance={profile.bankBalance} diamondsBalance={profile.diamonds} disabled={!selectedLandId || companyName.trim().length < 1} cashLabel="تأسيس الشركة نقدًا" onPurchase={(paymentMethod) => runCommand({ name: 'found_company', args: { industryId: industry.id, landId: selectedLandId, name: companyName, paymentMethod } }, (current) => foundCompany(current, industry.id, selectedLandId, companyName, paymentMethod))} />
            </div>}
          </EconomyPanel>
          <EconomyPanel title="شركاتك القائمة" description="الطاقة والمصروفات تتحدث مع تقدم الأيام.">
            {profile.companies.length === 0 ? <EconomyEmpty title="لم تؤسس شركة بعد" message="ابدأ بشراء أرض مناسبة ثم أكمل نموذج التأسيس." /> : <div className="economy-list">{profile.companies.map((company) => {
              const definition = INDUSTRY_CATALOG.find((item) => item.id === company.industryId);
              const land = profile.lands.find((item) => item.id === company.landId);
              const level = company.upgradeLevel ?? 1;
              const upgradeCost = Math.round(120_000 * Math.pow(1.55, level - 1));
              const completedBatches = profile.productionOrders.filter((order) => order.companyId === company.id && order.status === 'completed').reduce((sum, order) => sum + order.batches, 0);
              const requiredBatches = level * 2;
              const canUpgrade = level < 5 && completedBatches >= requiredBatches;
              const staff = profile.staff.filter((member) => member.companyId === company.id && member.status === 'active');
              const activeOrders = profile.productionOrders.filter((order) => order.companyId === company.id && order.status === 'active');
              const completedOutput = profile.productionOrders.filter((order) => order.companyId === company.id && order.status === 'completed').reduce((sum, order) => sum + order.outputQuantity, 0);
              const companyReport = selectCompanyPerformance(profile, company.id);
              const isExpanded = expandedCompanyId === company.id;
              return <article className={`economy-card asset-detail-card${isExpanded ? ' asset-detail-card--expanded' : ''}`} key={company.id}><button className="asset-detail-trigger" type="button" aria-expanded={isExpanded} onClick={() => setExpandedCompanyId(isExpanded ? null : company.id)}><span className="economy-card-title"><span className="economy-card-icon"><Icon name="factory" size={19} /></span><span><strong>{company.name}</strong><small>{definition?.name ?? company.industryId} · {land?.label ?? 'دون أرض مسجلة'}</small></span></span><span className="economy-pill economy-pill--green">مستوى {formatNumber(level)}</span></button><div className="economy-card-body"><div className="economy-meta"><span>طاقة {formatNumber(company.energyUnits ?? 0)} / {formatNumber(company.energyCapacity ?? definition?.energyCapacity ?? 0)}</span><span>تشغيل يومي {formatMoney(company.operatingCostPerDay ?? 0, country)}</span><span>الإنتاج {formatNumber(completedBatches)} / {formatNumber(requiredBatches)} دفعات</span></div><div className="economy-progress"><span style={{ width: `${Math.min(100, 100 * (company.energyUnits ?? 0) / Math.max(1, company.energyCapacity ?? 1))}%` }} /></div>{isExpanded && <div className="asset-detail-body"><div className="asset-detail-grid"><div><strong>{formatNumber(staff.length)}</strong><small>موظفون نشطون</small></div><div><strong>{formatNumber(activeOrders.length)}</strong><small>أوامر إنتاج نشطة</small></div><div><strong>{formatNumber(completedOutput)}</strong><small>وحدة مكتملة</small></div><div><strong>{formatNumber(company.maintenanceCondition ?? 100)}%</strong><small>حالة المصنع</small></div></div><div className="company-report-strip"><span>تكلفة الإنتاج <b>{formatMoney(companyReport.productionCost, country)}</b></span><span>رواتب يومية <b>{formatMoney(companyReport.payroll, country)}</b></span><span>تكلفة يومية <b>{formatMoney(companyReport.dailyOperatingCost + companyReport.payroll, country)}</b></span><span>جودة متوسطة <b>{formatNumber(Math.round(companyReport.quality))}%</b></span></div><div className="economy-meta"><span>الأرض: {land?.label ?? 'غير مسجلة'}</span><span>القطاع: {definition?.name ?? company.industryId}</span><span>التطوير التالي {level < 5 ? formatMoney(upgradeCost, country) : 'مكتمل'}</span></div>{activeOrders.length > 0 && <div className="asset-detail-list">{activeOrders.slice(0, 3).map((order) => <span key={order.id}><Icon name="play" size={13} />{order.productName} · {formatNumber(order.outputQuantity)} وحدة · يوم {formatNumber(order.completesOnDay)}</span>)}</div>}</div>}{level >= 5 ? <p className="economy-meta">وصلت الشركة إلى أعلى مستوى.</p> : completedBatches < requiredBatches ? <p className="economy-meta">أكمل {formatNumber(requiredBatches - completedBatches)} دفعات إنتاج قبل التطوير.</p> : <PurchaseOptions country={country} cashPrice={upgradeCost} bankBalance={profile.bankBalance} diamondsBalance={profile.diamonds} disabled={!canUpgrade} cashLabel="تطوير الشركة نقدًا" onPurchase={(paymentMethod) => runCommand({ name: 'upgrade_company', args: { companyId: company.id, paymentMethod } }, (current) => upgradeCompany(current, company.id, paymentMethod))} />}</div></article>;
            })}</div>}
          </EconomyPanel>
        </div>
      </>,
    )}</div>;
  }

  if (section.id === 'production') {
    const selectedCompany = profile.companies.find((item) => item.id === companyId) ?? profile.companies[0];
    const companyTransferPending = Boolean(selectedCompany && (selectedCompany.operationalFromDay ?? 1) > profile.day);
    const recipe = selectedCompany ? RECIPE_CATALOG.find((item) => item.industryId === selectedCompany.industryId) : undefined;
    const selectedBatches = Math.max(1, Number(productionBatches) || 1);
    const hasManager = Boolean(selectedCompany && profile.staff.some((member) => member.status === 'active' && member.role === 'manager' && member.companyId === selectedCompany.id));
    const estimatedDuration = Math.min(3, Math.max(1, Math.ceil(selectedBatches / 3) - (hasManager ? 1 : 0)));
    const marketForecast = recipe ? getMarketQuote(profile, recipe.productId, profile.day + estimatedDuration) : null;
    const estimatedOutput = recipe ? Math.max(recipe.outputQuantity, Math.round(selectedBatches * recipe.outputQuantity * getSynergyProductionMultiplier(profile))) : 0;
    const estimatedUnitCost = recipe ? ((recipe.inputs.reduce((sum, input) => sum + input.quantity * (profile.inventory.find((lot) => lot.materialOrProductId === input.materialId)?.unitCost ?? 0), 0) + selectedBatches * recipe.energyCost + Math.round((selectedCompany?.operatingCostPerDay ?? 0) * 0.15 * getOperatingCostProgression(profile.day))) / Math.max(1, estimatedOutput)) : 0;
    return <div className="section-page">{heading}{pageShell(
      <>
        <EconomyPanel title="خطوط الإنتاج" description="ابدأ أمرًا يحجز المواد والطاقة، ثم يستلم المنتج عند اكتماله في يوم لاحق.">
          {profile.companies.length === 0 ? <EconomyEmpty title="لا توجد مصانع عاملة" message="أسس شركة أولًا؛ يتضمن ترخيصها خط إنتاج للقطاع الذي اخترته." /> : <div className="economy-layout">
            {companyTransferPending && <div className="economy-alert"><Icon name="clock" size={16} /> يجري إنهاء عقود نقل الملكية؛ يبدأ تشغيل هذه الشركة في اليوم {formatNumber(selectedCompany?.operationalFromDay ?? profile.day)}.</div>}<form className="economy-form" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (selectedCompany) runCommand({ name: 'run_production', args: { companyId: selectedCompany.id, batches: Number(productionBatches) } }, (current) => runProduction(current, selectedCompany.id, Number(productionBatches))); }}>
              <div className="economy-field"><label htmlFor="factory-select">الشركة / المصنع</label><select id="factory-select" value={selectedCompany?.id ?? ''} onChange={(event) => setCompanyId(event.target.value)}>{profile.companies.map((company) => <option key={company.id} value={company.id}>{company.name} · {INDUSTRY_CATALOG.find((item) => item.id === company.industryId)?.name}</option>)}</select></div>
              <div className="economy-field"><label htmlFor="production-batches">دفعات الإنتاج</label><input id="production-batches" type="number" min="1" max="100" step="1" value={productionBatches} onChange={(event) => setProductionBatches(event.target.value)} /></div>
              <button className="button button-primary" type="submit" disabled={!recipe || companyTransferPending}><Icon name="play" size={16} /> بدء أمر الإنتاج</button>
            </form>
            {recipe && selectedCompany ? <div className="economy-card economy-card--soft"><div className="economy-card-head"><div className="economy-card-title"><span className="economy-card-icon"><Icon name="factory" size={18} /></span><span><strong>{recipe.productName}</strong><small>{formatNumber(estimatedOutput)} {recipe.outputUnit} متوقعة · {formatNumber(estimatedDuration)} يوم</small></span></div><span className="economy-pill economy-pill--gold">{formatNumber(selectedCompany.energyUnits ?? 0)} طاقة</span></div><div className="economy-card-body"><p className="economy-card-description">متطلبات الدفعة: {recipe.inputs.map((input) => `${input.quantity} ${MATERIAL_CATALOG.find((material) => material.id === input.materialId)?.unit ?? ''} ${MATERIAL_CATALOG.find((material) => material.id === input.materialId)?.name ?? input.materialId}`).join('، ')}. هذه معاينة قبل حجز السيولة والمخزون.</p><div className="economy-meta">{recipe.inputs.map((input) => { const material = MATERIAL_CATALOG.find((item) => item.id === input.materialId); const lot = profile.inventory.find((item) => item.materialOrProductId === input.materialId); return <span key={input.materialId}>{material?.name}: {formatNumber(lot?.quantity ?? 0)} / {input.quantity} لكل دفعة</span>; })}</div><div className="economy-meta"><span>تكلفة الوحدة المتوقعة {formatMoney(estimatedUnitCost, country)}</span><span>الإيراد المتوقع {formatMoney(Math.round(estimatedOutput * (marketForecast?.currentPrice ?? 0)), country)}</span><span>السيولة بعد الحجز تقريبًا {formatMoney(Math.max(0, profile.bankBalance - selectedBatches * recipe.energyCost), country)}</span><span>الطلب المتوقع عند التسليم {formatNumber(marketForecast?.demandUnits ?? 0)} {recipe.outputUnit}</span><span>الجودة {formatNumber(Math.max(70, Math.min(100, 86 + (hasManager ? 10 : 0) - ((selectedCompany.maintenanceCondition ?? 100) < 60 ? 10 : 0))))}%</span></div></div></div> : <EconomyEmpty title="لا توجد وصفة متاحة" message="لا تتوفر وصفة إنتاج لهذا القطاع حاليًا." />}
          </div>}
        </EconomyPanel>
        <EconomyPanel id="production-queue" title="طابور الإنتاج" description="المواد والطاقة المحجوزة لا تعود للمخزن حتى يكتمل الأمر أو يُلغى في مرحلة لاحقة.">
          {profile.productionOrders.length === 0 ? <EconomyEmpty title="لا توجد أوامر إنتاج" message="ابدأ أول أمر من لوحة خطوط الإنتاج لتظهر هنا مواعيد التسليم." /> : <div className="economy-list">{profile.productionOrders.slice().reverse().map((order) => { const forecastPrice = getMarketQuote(profile, order.productId, order.completesOnDay)?.currentPrice ?? 0; const qualityMultiplier = 0.85 + order.qualityScore / 100 * 0.15; const expectedMargin = Math.round(order.outputQuantity * forecastPrice * qualityMultiplier - order.materialCost - order.energyCost - order.maintenanceCost); return <article className="economy-card economy-card--soft" key={order.id}><div className="economy-card-head"><div className="economy-card-title"><span><strong>{order.productName}</strong><small>{formatNumber(order.outputQuantity)} {order.outputUnit} · بدأ في اليوم {formatNumber(order.startedOnDay)}</small></span></div><span className={`economy-pill ${order.status === 'active' ? 'economy-pill--gold' : order.status === 'completed' ? 'economy-pill--green' : 'economy-pill--red'}`}>{order.status === 'active' ? `يكتمل يوم ${formatNumber(order.completesOnDay)}` : order.status === 'completed' ? 'اكتمل' : 'ملغى'}</span></div><div className="economy-meta"><span>تكلفة الوحدة {formatMoney(order.expectedUnitCost, country)}</span><span>طلب متوقع {formatNumber(order.demandForecast)} {order.outputUnit}</span><span>جودة {formatNumber(order.qualityScore)}%</span><span className={expectedMargin >= 0 ? 'economy-pill economy-pill--green' : 'economy-pill economy-pill--red'}>هامش متوقع {formatMoney(expectedMargin, country)}</span></div>{order.status === 'active' && <div className="economy-actions"><button className="button button-secondary" type="button" onClick={() => runCommand({ name: 'cancel_production', args: { orderId: order.id } }, (current) => cancelProductionOrder(current, order.id))}>إلغاء الأمر واسترداد جزئي</button>{(['production-25', 'production-50', 'production-instant'] as const).map((kind) => { const available = profile.speedCards.find((card) => card.kind === kind)?.quantity ?? 0; return available > 0 && <button className="button button-secondary" type="button" key={kind} onClick={() => runCommand({ name: 'use_speed_card', args: { orderId: order.id, kind } }, (current) => useProductionSpeedCard(current, order.id, kind))}>{kind === 'production-25' ? 'بطاقة 25%' : kind === 'production-50' ? 'بطاقة 50%' : 'إكمال فوري'} ({available})</button>; })}</div>}</article>; })}</div>}
        </EconomyPanel>
        <EconomyPanel title="الطاقة المتاحة" description="تُستعاد الطاقة عند انتقال اليوم.">
          {profile.companies.length === 0 ? <EconomyEmpty title="لا توجد طاقة صناعية" message="تظهر الطاقة بعد تأسيس أول شركة." /> : <div className="economy-list">{profile.companies.map((company) => { const condition = company.maintenanceCondition ?? 100; const maintenanceCost = Math.max(5_000, Math.round((company.operatingCostPerDay ?? 0) * 0.4)); return <div className="economy-card" key={company.id}><div className="economy-card-head"><div className="economy-card-title"><span className="economy-card-icon"><Icon name="factory" size={17} /></span><span><strong>{company.name}</strong><small>{INDUSTRY_CATALOG.find((item) => item.id === company.industryId)?.name}</small></span></div><span className={`economy-pill ${condition < 25 ? 'economy-pill--red' : condition < 60 ? 'economy-pill--gold' : 'economy-pill--green'}`}>صيانة {formatNumber(condition)}%</span></div><div className="economy-card-body"><div className="economy-meta"><span>طاقة {formatNumber(company.energyUnits ?? 0)} / {formatNumber(company.energyCapacity ?? 0)}</span><span>خدمة كاملة {formatMoney(maintenanceCost, country)}</span></div><div className="economy-progress"><span style={{ width: `${Math.min(100, 100 * condition / 100)}%` }} /></div><button className="button button-secondary" type="button" onClick={() => runCommand({ name: 'service_company', args: { companyId: company.id } }, (current) => serviceCompany(current, company.id))} disabled={profile.bankBalance < maintenanceCost || condition >= 100}>صيانة المصنع</button></div></div>; })}</div>}
        </EconomyPanel>
      </>,
    )}</div>;
  }

  if (section.id === 'inventory') {
    const inventorySummary = selectInventorySummary(profile);
    const productRows = inventorySummary.rows.filter((row) => row.kind === 'product');
    const materialStock = new Map(inventorySummary.rows.filter((row) => row.kind === 'material').map((row) => [row.itemId, row]));
    const warehouseLevel = normalizeWarehouseLevel(profile.warehouseLevel);
    const warehouseCapacity = getWarehouseCapacity(warehouseLevel);
    const warehouseUsage = getWarehouseUsage(profile.inventory, profile.productionOrders);
    const upgradeRequirement = WAREHOUSE_UPGRADE_REQUIREMENTS[warehouseLevel + 1];
    const missingUpgradeMaterials = upgradeRequirement ? Object.entries(upgradeRequirement.materials).filter(([materialId, required]) => (materialStock.get(materialId)?.quantity ?? 0) < required) : [];
    const canUpgradeWarehouse = Boolean(upgradeRequirement && missingUpgradeMaterials.length === 0);
    return <div className="section-page">{heading}{pageShell(
      <>
        <div className="economy-grid economy-grid--three-mobile"><EconomyStat label="أنواع المخزون" value={formatNumber(inventorySummary.rows.length)} /><EconomyStat label="مواد خام" value={formatNumber(inventorySummary.rows.filter((row) => row.kind === 'material').length)} /><EconomyStat label="قيمة المخزون" value={formatMoney(inventorySummary.totalValue, country)} /></div>
        <EconomyPanel id="warehouse-overview" title={`المخزن · المستوى ${formatNumber(warehouseLevel)}`} description="السعة مشتركة بين أنواع المواد الخام وبين المنتجات. تطوير المستوى يوسّع الفئتين ويرفع حد كل صنف، مقابل نقد ومواد محددة.">
          <div className="warehouse-capacity-grid">
            <article><span>المواد الخام</span><strong>{formatNumber(warehouseUsage.materials)} / {formatNumber(warehouseCapacity.materials)}</strong><div className="economy-progress"><span style={{ width: `${Math.min(100, warehouseUsage.materials / warehouseCapacity.materials * 100)}%` }} /></div></article>
            <article><span>المنتجات مع الإنتاج المحجوز</span><strong>{formatNumber(warehouseUsage.products)} / {formatNumber(warehouseCapacity.products)}</strong><div className="economy-progress"><span style={{ width: `${Math.min(100, warehouseUsage.products / warehouseCapacity.products * 100)}%` }} /></div></article>
          </div>
          {upgradeRequirement ? <div className="warehouse-upgrade-card"><div><strong>تطوير إلى المستوى {formatNumber(warehouseLevel + 1)}</strong><small>التكلفة {formatMoney(upgradeRequirement.cash, country)} · المتطلبات:</small></div><div className="economy-meta">{Object.entries(upgradeRequirement.materials).map(([materialId, required]) => { const material = MATERIAL_CATALOG.find((item) => item.id === materialId); const owned = materialStock.get(materialId)?.quantity ?? 0; return <span className={owned >= required ? 'economy-pill economy-pill--green' : 'economy-pill economy-pill--gold'} key={materialId}>{material?.name ?? materialId} {formatNumber(owned)} / {formatNumber(required)}</span>; })}</div><PurchaseOptions country={country} cashPrice={upgradeRequirement.cash} bankBalance={profile.bankBalance} diamondsBalance={profile.diamonds} disabled={!canUpgradeWarehouse} cashLabel="تطوير المخزن نقدًا" onPurchase={(paymentMethod) => runCommand({ name: 'upgrade_warehouse', args: { paymentMethod } }, (current) => upgradeWarehouse(current, paymentMethod))} /></div> : <p className="economy-card-description">وصل المخزن إلى أعلى مستوى تطوير.</p>}
        </EconomyPanel>
        <EconomyPanel title="مخزون المواد الخام" description="تظهر هنا المواد الموجودة في مخزونك. تُتاح مشتريات المواد عبر عروض السوق والمزادات فقط.">
          <div className="economy-list">{MATERIAL_CATALOG.map((material) => {
            const stock = materialStock.get(material.id);
            if (!stock) return null;
            return <article className="economy-card economy-card--soft" key={material.id}><div className="economy-card-head"><div className="economy-card-title"><span className="economy-card-icon"><Icon name="warehouse" size={18} /></span><span><strong>{material.name}</strong><small>قيمة المخزون {formatMoney(stock.totalValue, country)}</small></span></div><span className="economy-pill">{formatNumber(stock.quantity)} {material.unit}</span></div></article>;
          })}</div>
        </EconomyPanel>
        <EconomyPanel title="السوق العالمي · عروض التجار" description="يعرض السوق عروضًا متجددة للمواد الخام. بعض العروض تقبل التفاوض وبعضها بسعر ثابت.">
          <div className="economy-list">{getGlobalMarketOffers(profile).map((offer) => { const material = MATERIAL_CATALOG.find((item) => item.id === offer.materialId); const quantity = materialQuantities[`global-${offer.id}`] ?? '10'; const agreedPrice = negotiatedMarketPrices[offer.id] ?? offer.unitPrice; const negotiated = negotiatedMarketPrices[offer.id] !== undefined; const currentQuantity = materialStock.get(offer.materialId)?.quantity ?? 0; const maxQuantity = Math.max(0, Math.min((getWarehouseItemCapacity(offer.materialId, warehouseLevel) ?? 0) - currentQuantity, warehouseCapacity.materials - warehouseUsage.materials)); const totalCost = Math.max(1, Number(quantity) || 0) * agreedPrice; const canPurchaseQuantity = Number.isInteger(Number(quantity)) && Number(quantity) >= 1 && Number(quantity) <= maxQuantity; return <article className="economy-card economy-card--soft" key={offer.id}><div className="economy-card-head"><div className="economy-card-title"><span className="economy-card-icon"><Icon name="briefcase" size={18} /></span><span><strong>{material?.name ?? offer.materialId}</strong><small>{offer.sellerName} · {material?.unit ?? 'وحدة'} · جودة العرض {offer.confidence === 'high' ? 'موثوق' : offer.confidence === 'medium' ? 'متوازن' : 'انتهازي'}</small></span></div><span className={`economy-pill ${offer.negotiable ? 'economy-pill--green' : 'economy-pill--gold'}`}>{offer.negotiable ? 'يقبل التفاوض' : 'سعر ثابت'}</span></div><div className="economy-card-body"><div className="economy-meta"><span>السعر {formatMoney(agreedPrice, country)} / {material?.unit ?? 'وحدة'}</span><span>السعر الأصلي {formatMoney(offer.unitPrice, country)}</span><span>المخزون الحالي {formatNumber(materialStock.get(offer.materialId)?.quantity ?? 0)}</span></div><div className="economy-form-row"><div className="economy-field"><label htmlFor={`global-qty-${offer.id}`}>الكمية (المتاح {formatNumber(maxQuantity)} {material?.unit ?? 'وحدة'})</label><input id={`global-qty-${offer.id}`} type="number" min="1" max={maxQuantity} step="1" value={quantity} onChange={(event) => setMaterialQuantities((previous) => ({ ...previous, [`global-${offer.id}`]: event.target.value }))} /></div><div className="economy-field"><label>إجمالي الصفقة</label><input value={formatMoney(Math.max(0, Number(quantity) || 0) * agreedPrice, country)} readOnly /></div></div><div className="economy-actions"><button className="button button-secondary" type="button" disabled={!offer.negotiable} onClick={() => { const result = negotiateGlobalMarketOffer(profile, offer.id); if (result.unitPrice !== undefined && result.accepted) setNegotiatedMarketPrices((previous) => ({ ...previous, [offer.id]: result.unitPrice! })); onAction(result.accepted ? { ok: true, profile, message: result.message, data: undefined } : { ok: false, profile, message: result.message, reason: 'condition-not-met' }); }}>{negotiated ? 'تم التفاوض' : offer.negotiable ? 'التفاوض مع التاجر' : 'غير قابل للتفاوض'}</button><PurchaseOptions country={country} cashPrice={totalCost} bankBalance={profile.bankBalance} diamondsBalance={profile.diamonds} disabled={!canPurchaseQuantity} cashLabel="قبول العرض نقدًا" onPurchase={(paymentMethod) => runCommand({ name: 'buy_global_material', args: { offerId: offer.id, quantity: Number(quantity), negotiatedUnitPrice: negotiated ? agreedPrice : undefined, paymentMethod } }, (current) => buyGlobalMaterial(current, offer.id, Number(quantity), negotiated ? agreedPrice : undefined, paymentMethod))} /></div></div></article>; })}</div>
        </EconomyPanel>
        <EconomyPanel title="المنتجات الجاهزة للبيع" description="الطلب والسعر يتغيران يوميًا داخل محاكاة اللعبة؛ تُخصم الضريبة من حصيلة البيع.">
          {productRows.length === 0 ? <EconomyEmpty title="لا توجد منتجات جاهزة" message="أنشئ شركة، اشترِ مدخلاتها، ثم شغّل خط الإنتاج." /> : <div className="economy-list">{productRows.map((row) => {
            const product = PRODUCT_CATALOG.find((item) => item.id === row.itemId);
            const quantity = productQuantities[row.itemId] ?? '1';
            const marketQuote = getMarketQuote(profile, row.itemId);
            const maxSellable = Math.min(row.quantity, marketQuote?.demandUnits ?? row.quantity);
            return <article className="economy-card" key={row.id}><div className="economy-card-head"><div className="economy-card-title"><span className="economy-card-icon"><Icon name="briefcase" size={18} /></span><span><strong>{row.name}</strong><small>المخزون {formatNumber(row.quantity)} {row.unit} · سعر السوق {formatMoney(marketQuote?.currentPrice ?? product?.baseSellPrice ?? 0, country)}</small></span></div><span className={`economy-pill economy-pill--${marketQuote?.trend === 'up' ? 'green' : marketQuote?.trend === 'down' ? 'red' : 'gold'}`}>{marketQuote?.trendLabel ?? 'السوق'}</span></div><div className="economy-card-body"><div className="economy-meta"><span>الطلب المتاح اليوم {formatNumber(marketQuote?.demandUnits ?? 0)} {row.unit}</span><span>القيمة الدفترية {formatMoney(row.totalValue, country)}</span></div><form className="economy-form" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); runCommand({ name: 'sell_product', args: { productId: row.itemId, quantity: Number(quantity) } }, (current) => sellProduct(current, row.itemId, Number(quantity))); }}><div className="economy-field"><label htmlFor={`sell-${row.itemId}`}>كمية البيع ({row.unit})</label><input id={`sell-${row.itemId}`} type="number" min="1" max={maxSellable} step="1" value={quantity} onChange={(event) => setProductQuantities((previous) => ({ ...previous, [row.itemId]: event.target.value }))} /></div><button className="button button-primary" type="submit" disabled={!quantity || Number(quantity) < 1 || Number(quantity) > maxSellable}><Icon name="investment" size={15} /> بيع بسعر السوق</button></form></div></article>;
          })}</div>}
        </EconomyPanel>
      </>,
    )}</div>;
  }

  if (section.id === 'investments') {
    const activeInvestments = selectActiveInvestments(profile);
    const sales = selectSalesSummary(profile);
    const goldQuantity = Number(goldAmount);
    const goldBuyEstimate = Math.round(goldQuantity * GOLD_PRICE_PER_GRAM);
    const goldSellEstimate = Math.round(goldQuantity * GOLD_PRICE_PER_GRAM * 0.97);
    const goldHoldingMarketValue = Math.round(profile.goldGrams * GOLD_PRICE_PER_GRAM);
    const goldHoldingSellEstimate = Math.round(profile.goldGrams * GOLD_PRICE_PER_GRAM * 0.97);
    return <div className="section-page">{heading}{pageShell(
      <>
        <div className="economy-grid economy-grid--three-mobile"><EconomyStat label="استثمارات نشطة" value={formatNumber(activeInvestments.length)} /><EconomyStat label="إجمالي المبيعات" value={formatMoney(sales.grossRevenue, country)} /><EconomyStat label="صافي بعد الضريبة" value={formatMoney(sales.netRevenue, country)} /></div>
        <EconomyPanel title="تداول الذهب" description="احتياطي داخل اللعبة فقط؛ السعر ثابت ومحاكى ولا يتصل بأسعار السوق أو بجهة مالية.">
          <div className="economy-grid economy-grid--three-mobile">
            <EconomyStat label="الذهب المملوك" value={`${formatNumber(profile.goldGrams)} غ`} />
            <EconomyStat label="سعر اللعبة للغرام" value={formatMoney(GOLD_PRICE_PER_GRAM, country)} />
            <EconomyStat label="قيمة الاحتياطي بالسعر المحاكى" value={formatMoney(goldHoldingMarketValue, country)} />
          </div>
          <div className="economy-meta"><span>القيمة الدفترية للذهب {formatMoney(profile.goldCostBasis, country)}</span><span>المتحصل المتوقع عند بيع الاحتياطي الآن بعد فرق 3%: {formatMoney(goldHoldingSellEstimate, country)}</span></div>
          <div className="economy-card-body">
            <div className="economy-form-row">
              <div className="economy-field"><label htmlFor="gold-quantity">الكمية (غرام، بخطوة 0.1)</label><input id="gold-quantity" type="number" min="0.1" step="0.1" value={goldAmount} onChange={(event) => setGoldAmount(event.target.value)} /></div>
              <div className="economy-field"><label>شراء تقديري</label><input value={formatMoney(goldBuyEstimate, country)} readOnly /></div>
              <div className="economy-field"><label>بيع تقديري بعد فرق 3%</label><input value={formatMoney(goldSellEstimate, country)} readOnly /></div>
            </div>
            <div className="economy-form-actions">
              <PurchaseOptions country={country} cashPrice={goldBuyEstimate} diamondPrice={Number.isInteger(goldQuantity * 0.5) ? goldQuantity * 0.5 : 0} bankBalance={profile.bankBalance} diamondsBalance={profile.diamonds} disabled={!Number.isFinite(goldQuantity) || goldQuantity <= 0} cashLabel="شراء الذهب نقدًا" diamondLabel="شراء الذهب بالماس" note="سعر الصرف: ١٠٠ غرام = ٥٠ ماسة، مقابل ٦٬٠٠٠ ج.م لكل غرام نقدًا." onPurchase={(paymentMethod) => paymentMethod === 'diamonds' ? runCommand({ name: 'buy_gold_with_diamonds', args: { grams: goldQuantity } }, (current) => buyGoldWithDiamonds(current, goldQuantity)) : runCommand({ name: 'buy_gold', args: { grams: goldQuantity } }, (current) => buyGold(current, goldQuantity))} />
              <button className="button button-secondary" type="button" disabled={!Number.isFinite(goldQuantity) || goldQuantity <= 0 || goldQuantity > profile.goldGrams} onClick={() => runCommand({ name: 'sell_gold', args: { grams: goldQuantity } }, (current) => sellGold(current, goldQuantity))}>بيع كمية</button>
            </div>
          </div>
        </EconomyPanel>
        <EconomyPanel title="أدوات الاستثمار داخل اللعبة" description="تُحجز المبالغ حتى موعد الاستحقاق. كل العوائد والمخاطر افتراضية ولا تمثل منتجًا ماليًا حقيقيًا.">
          <div className="economy-list">{INVESTMENT_CATALOG.map((investment) => {
            const amount = investmentAmounts[investment.id] ?? String(investment.minimumAmount);
            return <article className="economy-card" key={investment.id}><div className="economy-card-head"><div className="economy-card-title"><span className="economy-card-icon"><Icon name="investment" size={18} /></span><span><strong>{investment.name}</strong><small>{formatNumber(investment.durationDays)} أيام · عائد متوقع {Math.round(getInvestmentPayoutRate(investment.returnRate, investment.durationDays) * 100)}%</small></span></div><span className={`economy-pill ${investment.riskRate > 0 ? 'economy-pill--gold' : 'economy-pill--green'}`}>{investment.riskRate > 0 ? `مخاطرة ${Math.round(investment.riskRate * 100)}%` : 'مخاطر منخفضة'}</span></div><div className="economy-card-body"><form className="economy-form" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); runCommand({ name: 'create_investment', args: { investmentId: investment.id, amount: Number(amount) } }, (current) => createInvestment(current, investment.id, Number(amount))); }}><div className="economy-form-row"><div className="economy-field"><label htmlFor={`invest-${investment.id}`}>مبلغ الاستثمار</label><input id={`invest-${investment.id}`} type="number" min={investment.minimumAmount} max={investment.maximumAmount} step="1000" value={amount} onChange={(event) => setInvestmentAmounts((previous) => ({ ...previous, [investment.id]: event.target.value }))} /></div><div className="economy-field"><label>المتاح في البنك</label><input value={formatMoney(profile.bankBalance, country)} readOnly /></div></div><div className="economy-meta"><span>الحد {formatMoney(investment.minimumAmount, country)}</span><span>الحد الأعلى {formatMoney(investment.maximumAmount, country)}</span></div><button className="button button-primary" type="submit" disabled={Number(amount) < investment.minimumAmount || Number(amount) > investment.maximumAmount || Number(amount) > profile.bankBalance}>إنشاء استثمار</button></form></div></article>;
          })}</div>
        </EconomyPanel>
        <EconomyPanel title="محفظتك" description="يُعاد رأس المال والعائد عند استحقاق الاستثمار بعد مرور الأيام.">
          {profile.investments.length === 0 ? <EconomyEmpty title="لا توجد استثمارات مسجلة" message="اختر أداة من الأعلى لتبدأ بتنويع رأس المال." /> : <div className="economy-list">{profile.investments.slice().reverse().map((investment) => {
            const definition = INVESTMENT_CATALOG.find((item) => item.id === investment.investmentTypeId);
            return <article className="economy-card economy-card--soft" key={investment.id}><div className="economy-card-head"><div className="economy-card-title"><span className="economy-card-icon"><Icon name="investment" size={18} /></span><span><strong>{definition?.name ?? investment.investmentTypeId}</strong><small>{formatMoney(investment.principal, country)} · يستحق يوم {formatNumber(investment.maturityDay)}</small></span></div><span className={`economy-pill ${investment.status === 'active' ? 'economy-pill--gold' : 'economy-pill--green'}`}>{investment.status === 'active' ? 'نشط' : investment.status === 'paid' ? 'تمت التسوية' : 'تسوية بخسارة'}</span></div>{investment.settledAmount !== undefined && <div className="economy-card-body"><div className="economy-meta"><span>قيمة التسوية {formatMoney(investment.settledAmount, country)}</span></div></div>}</article>;
          })}</div>}
        </EconomyPanel>
      </>,
    )}</div>;
  }

  if (section.id === 'reports') {
    const report = selectFinancialReport(profile);
    const sales = selectSalesSummary(profile);
    const advanced = selectAdvancedStatistics(profile);
    const categoryClass = (category: keyof typeof ledgerLabels) => category === 'revenue' ? 'money-positive' : category === 'expense' ? 'money-negative' : '';
    return <div className="section-page">{heading}{pageShell(
      <>
        <div className="economy-grid economy-grid--three-mobile"><EconomyStat label="رصيد البنك" value={formatMoney(report.balance, country)} /><EconomyStat label="إجمالي الأصول" value={formatMoney(report.totalAssets, country)} /><EconomyStat label="التزامات مستحقة" value={formatMoney(report.liabilities, country)} /><EconomyStat label="صافي الربح" value={formatMoney(report.netProfit, country)} /></div>
        <div className="economy-grid economy-grid--two"><EconomyStat label="إجمالي الإيرادات" value={formatMoney(report.revenue, country)} note="من دفتر الحساب المحلي" /><EconomyStat label="إجمالي المصروفات" value={formatMoney(report.expenses, country)} note="يشمل التأسيس والتشغيل والضرائب" /><EconomyStat label="إجمالي المبيعات" value={formatMoney(sales.grossRevenue, country)} /><EconomyStat label="ضريبة المبيعات" value={formatMoney(sales.tax, country)} /></div>
        <EconomyPanel title="لوحة الأداء المتقدمة" description="تحليل تفصيلي للإنتاج والمبيعات والهامش من العمليات المسجلة في دفتر اللعبة.">
          <div className="advanced-stat-tabs"><span className="advanced-stat-tab advanced-stat-tab--active">الإنتاج</span><span className="advanced-stat-tab">المبيعات</span><span className="advanced-stat-tab">الربحية</span></div>
          <div className="economy-grid economy-grid--three-mobile"><EconomyStat label="أوامر الإنتاج" value={formatNumber(advanced.production.totalOrders)} note={`${formatNumber(advanced.production.completedOrders)} مكتمل · ${formatNumber(advanced.production.activeOrders)} نشط`} /><EconomyStat label="إجمالي الإنتاج" value={formatNumber(advanced.production.totalOutput)} note={`${formatNumber(advanced.production.totalBatches)} دفعات`} /><EconomyStat label="متوسط الجودة" value={`${advanced.production.averageQuality.toFixed(1)}%`} note={`تكلفة الإنتاج ${formatMoney(advanced.production.totalProductionCost, country)}`} /><EconomyStat label="الوحدات المباعة" value={formatNumber(advanced.sales.totalUnits)} note={`متوسط الوحدة ${formatMoney(advanced.sales.averageUnitPrice, country)}`} /><EconomyStat label="صافي المبيعات" value={formatMoney(advanced.sales.netRevenue, country)} note={`قبل تكلفة البضاعة`} /><EconomyStat label="هامش الربح" value={formatMoney(advanced.profit.grossMargin, country)} note={`${advanced.profit.marginPercent.toFixed(1)}% من الإيراد`} /></div>
          <div className="advanced-stat-columns"><div><div className="advanced-stat-heading"><strong>أداء المصانع</strong><span>حسب الشركة</span></div>{advanced.production.companies.length === 0 ? <div className="economy-empty"><span>لا توجد بيانات إنتاج بعد.</span></div> : <div className="advanced-stat-list">{advanced.production.companies.map((company) => <article className="advanced-stat-row" key={company.id}><div className="advanced-stat-row-head"><strong>{company.name}</strong><span>مستوى {formatNumber(company.level)} · جودة {company.quality.toFixed(0)}%</span></div><div className="advanced-stat-bar"><span style={{ width: `${Math.min(100, company.utilization)}%` }} /></div><div className="advanced-stat-row-meta"><span>{formatNumber(company.completedOrders)} أوامر مكتملة · {formatNumber(company.output)} وحدة</span><b>{formatMoney(company.cost, country)}</b></div></article>)}</div>}</div><div><div className="advanced-stat-heading"><strong>أداء المبيعات</strong><span>حسب المنتج</span></div>{advanced.sales.products.length === 0 ? <div className="economy-empty"><span>لا توجد مبيعات مسجلة بعد.</span></div> : <div className="advanced-stat-list">{advanced.sales.products.map((product) => <article className="advanced-stat-row" key={product.id}><div className="advanced-stat-row-head"><strong>{product.name}</strong><span>{formatNumber(product.units)} وحدة</span></div><div className="advanced-stat-bar advanced-stat-bar--sales"><span style={{ width: `${Math.min(100, advanced.sales.totalRevenue > 0 ? product.revenue / advanced.sales.totalRevenue * 100 : 0)}%` }} /></div><div className="advanced-stat-row-meta"><span>متوسط {formatMoney(product.averagePrice, country)} · ضريبة {formatMoney(product.tax, country)}</span><b>{formatMoney(product.revenue, country)}</b></div></article>)}</div>}</div></div>
          <div className="advanced-profit-breakdown"><div className="advanced-stat-heading"><strong>تفصيل الربحية والمصروفات</strong><span>من دفتر الحساب</span></div><div className="economy-meta"><span className="economy-pill economy-pill--green">هامش إجمالي {formatMoney(advanced.profit.grossMargin, country)}</span><span>رواتب {formatMoney(advanced.profit.payroll, country)}</span><span>إنتاج وصيانة {formatMoney(advanced.profit.productionExpenses, country)}</span><span>تشغيل {formatMoney(advanced.profit.operatingExpenses, country)}</span><span>مصروفات أخرى {formatMoney(advanced.profit.otherExpenses, country)}</span><span>دخل استثماري {formatMoney(advanced.profit.investmentIncome, country)}</span></div></div>
        </EconomyPanel>
        <EconomyPanel title="دفتر الحساب" description="كل الأرقام مستخرجة من معاملات اللاعب المسجلة.">
          {report.recentEntries.length === 0 ? <EconomyEmpty title="لا توجد حركات مالية بعد" message="تظهر هنا العمليات بعد أول مزاد أو شراء أو إنتاج أو بيع." /> : <div className="economy-table-wrap"><table className="economy-table"><thead><tr><th>الحركة</th><th>النوع</th><th>القيمة</th><th>التاريخ</th></tr></thead><tbody>{report.recentEntries.map((entry) => <tr key={entry.id}><td><strong>{entry.note}</strong></td><td>{ledgerLabels[entry.category]}</td><td className={categoryClass(entry.category)}>{entry.category === 'expense' ? '−' : entry.category === 'revenue' ? '+' : ''}{formatMoney(entry.amount, country)}</td><td>{new Date(entry.occurredAt).toLocaleDateString('ar-EG')}</td></tr>)}</tbody></table></div>}
        </EconomyPanel>
        {profile.events.length > 0 && <EconomyPanel id="economic-events" title="الأحداث الاقتصادية الأخيرة" description="يعرض التقرير الأثر المالي والقطاع أو الخام المستهدف ومدة تأثير السعر والطلب."><div className="economy-list">{profile.events.slice().reverse().slice(0, 5).map((event) => <article className="economy-card economy-card--soft" key={event.id}><div className="economy-card-head"><div className="economy-card-title"><span className="economy-card-icon"><Icon name="globe" size={18} /></span><span><strong>{event.title}</strong><small>اليوم {formatNumber(event.day)}</small></span></div><span className={`economy-pill ${event.cashImpact >= 0 ? 'economy-pill--green' : 'economy-pill--red'}`}>{event.cashImpact >= 0 ? '+' : '−'}{formatMoney(Math.abs(event.cashImpact), country)}</span></div><div className="economy-card-body"><p>{event.description ?? 'لا يوجد وصف إضافي لهذا الحدث.'}</p>{economicEventDetails(event, profile.day).length > 0 && <div className="economy-meta">{economicEventDetails(event, profile.day).map((detail) => <span key={detail}>{detail}</span>)}</div>}</div></article>)}</div></EconomyPanel>}
      </>,
    )}</div>;
  }

  if (section.id === 'contracts') {
    const offers = getContractOffers(profile);
    const activeContracts = (profile.contracts ?? []).filter((contract) => contract.status === 'active');
    const completedContracts = (profile.contracts ?? []).filter((contract) => contract.status === 'completed');
    const failedContracts = (profile.contracts ?? []).filter((contract) => contract.status === 'failed');
    return <div className="section-page">{heading}{pageShell(
      <>
        <div className="economy-grid economy-grid--three-mobile"><EconomyStat label="السمعة التجارية" value={`${formatNumber(profile.reputation ?? 50)} / 100`} /><EconomyStat label="عقود نشطة" value={`${formatNumber(activeContracts.length)} / 3`} /><EconomyStat label="عقود مكتملة" value={formatNumber(completedContracts.length)} /></div>
        <EconomyPanel title="مركز العملاء والعقود" description="كل عقد يربط الإنتاج والمخزون والسعر والسمعة. اختر ما تستطيع تنفيذه قبل الموعد بدل قبول كل الطلبات.">
          <div className="economy-list">{offers.map((offer) => { const existingContract = (profile.contracts ?? []).find((contract) => contract.id === offer.id); const accepted = existingContract?.status === 'active'; const consumed = existingContract?.status === 'completed' || existingContract?.status === 'failed'; const expectedRevenue = offer.quantity * offer.unitPrice + offer.reward; const estimatedCost = (profile.inventory.find((item) => item.materialOrProductId === offer.productId)?.unitCost ?? 0) * offer.quantity; return <article className="economy-card" key={offer.id}><div className="economy-card-head"><div className="economy-card-title"><span className="economy-card-icon"><Icon name="briefcase" size={18} /></span><span><strong>{offer.clientName}</strong><small>{getCustomerSegmentLabel(offer.clientType)} · {offer.description}</small></span></div><span className="economy-price">{formatMoney(expectedRevenue, country)}</span></div><div className="economy-card-body"><div className="economy-meta"><span>المنتج: {offer.productName}</span><span>الكمية: {formatNumber(offer.quantity)}</span><span>التسليم قبل اليوم {formatNumber(offer.deadlineDay)}</span><span>{offer.minimumQuality ? `الجودة المطلوبة: ${formatNumber(offer.minimumQuality)}%` : 'الجودة: قياسية'}</span><span>سمعة +{formatNumber(offer.reputationReward)}</span><span className="economy-pill economy-pill--green">المعاينة: إيراد {formatMoney(expectedRevenue, country)} · تكلفة مخزون تقديرية {formatMoney(estimatedCost, country)}</span></div><button className="button button-primary" type="button" disabled={accepted || consumed || activeContracts.length >= 3} onClick={() => runCommand({ name: 'accept_contract', args: { offerId: offer.id } }, (current) => acceptContract(current, offer.id))}>{accepted ? 'العقد مقبول' : consumed ? existingContract?.status === 'completed' ? 'تم تنفيذ العرض' : 'انتهى العرض' : activeContracts.length >= 3 ? 'أكمل عقدًا أولًا' : 'قبول العقد'}</button></div></article>; })}</div>
        </EconomyPanel>
        <EconomyPanel id="contracts-active" title="العقود المقبولة" description="التسليم يدوي من المنتجات الموجودة في المخزن. لا يُحتسب العقد مكتملًا بمجرد الإنتاج.">
          {activeContracts.length === 0 ? <EconomyEmpty title="لا توجد عقود نشطة" message="اقبل عرضًا من لوحة العملاء عندما تتأكد من قدرتك على الإنتاج والتسليم." /> : <div className="economy-list">{activeContracts.map((contract) => <article className="economy-card economy-card--soft" key={contract.id}><div className="economy-card-head"><div className="economy-card-title"><span><strong>{contract.clientName}</strong><small>{contract.productName} · {formatNumber(contract.quantity)} وحدة · المتبقي {formatNumber(Math.max(0, contract.deadlineDay - profile.day))} يوم</small></span></div><span className="economy-pill economy-pill--gold">{formatMoney(contract.quantity * contract.unitPrice + contract.reward, country)}</span></div><div className="economy-meta"><span>السيولة بعد التسليم تقريبًا {formatMoney(profile.bankBalance + contract.quantity * contract.unitPrice + contract.reward, country)}</span><span>{contract.negotiated ? contract.negotiationNote : 'يمكنك اختيار مقايضة واحدة قبل التسليم.'}</span></div><div className="economy-button-row"><button className="button button-secondary" type="button" onClick={() => runCommand({ name: 'deliver_contract', args: { contractId: contract.id } }, (current) => deliverContract(current, contract.id))}>تسليم العقد الآن</button>{!contract.negotiated && <><button className="button button-secondary" type="button" onClick={() => runCommand({ name: 'negotiate_contract', args: { contractId: contract.id, mode: 'price' } }, (current) => negotiateContract(current, contract.id, 'price'))}>تفاوض على السعر +8%</button><button className="button button-secondary" type="button" onClick={() => runCommand({ name: 'negotiate_contract', args: { contractId: contract.id, mode: 'deadline' } }, (current) => negotiateContract(current, contract.id, 'deadline'))}>تمديد يوم −5%</button></>}</div></article>)}</div>}
        </EconomyPanel>
        <EconomyPanel title="سجل السمعة والإنجازات" description="الالتزام بالعقود يفتح ثقة العملاء ويمنح مكافآت إضافية. التأخر يخفض السمعة ويضيف غرامة."><div className="economy-meta"><span className="economy-pill economy-pill--green">سمعة {formatNumber(profile.reputation ?? 50)}%</span><span>مكتملة {formatNumber(completedContracts.length)}</span><span className="economy-pill economy-pill--red">فاشلة {formatNumber(failedContracts.length)}</span></div>{(profile.achievements ?? []).length > 0 && <div className="economy-list">{profile.achievements.map((achievement) => <article className="economy-task" key={achievement.id}><span className="economy-task-icon"><Icon name="shield" size={18} /></span><span className="economy-task-copy"><strong>{achievement.title}</strong><small>تم فتحها في اليوم {formatNumber(achievement.earnedAtDay)}</small></span><span className="economy-pill economy-pill--green">مكتملة</span></article>)}</div>}</EconomyPanel>
      </>,
    )}</div>;
  }

  if (section.id === 'tasks') {
    const tasks = selectTaskBoard(profile);
    const completed = tasks.filter((task) => task.claimed).length;
    const season = getSeasonSnapshot(profile);
    const seasonEvent = getSeasonEventSnapshot(profile);
    return <div className="section-page">{heading}{pageShell(
      <>
        <div className="economy-grid economy-grid--three-mobile"><EconomyStat label="إنجازات مكتملة" value={`${formatNumber(completed)} / ${formatNumber(tasks.length)}`} /><EconomyStat label="مكافآت متاحة" value={formatNumber(tasks.filter((task) => task.available && !task.claimed).length)} /><EconomyStat label="المكافآت المستلمة" value={formatNumber(profile.completedTaskIds.length)} /></div>
        <EconomyPanel title="موسم التوسع الأول" description={`الموسم من اليوم ${season.season.startedOnDay} إلى اليوم ${season.season.endsOnDay}. اجمع النقاط وافتح مكافآت متكررة.`}>
          <div className="season-progress-head"><strong>{formatNumber(season.season.points)} نقطة موسم</strong><span>المرحلة التالية بعد {formatNumber(season.nextReward)} نقطة</span></div>
          <div className="season-progress"><span style={{ width: `${season.progressPercent}%` }} /></div>
          <div className="economy-list season-challenges">{season.challenges.map((challenge) => <article className="economy-task" key={challenge.id}><span className="economy-task-icon"><Icon name={challenge.kind === 'daily' ? 'clock' : 'tasks'} size={18} /></span><span className="economy-task-copy"><strong>{challenge.title} · {challenge.kind === 'daily' ? 'يومي' : 'أسبوعي'}</strong><small>{challenge.description} · {formatNumber(challenge.points)} نقطة · {formatMoney(challenge.reward, country)}</small></span>{challenge.claimed ? <span className="economy-pill economy-pill--green">تم الاستلام</span> : <button className="button button-primary" type="button" disabled={!challenge.available} onClick={() => onCommand({ name: 'claim_season_challenge', args: { challengeId: challenge.id } }, (current) => claimSeasonChallenge(current, challenge.id))}>{challenge.available ? 'استلام' : 'لم تكتمل'}</button>}</article>)}</div>
        </EconomyPanel>
        <EconomyPanel title="مكافأة الدخول" description="اختر مكافأتك مرة واحدة في كل يوم من الموسم.">
          <div className="economy-button-row season-rewards">{LOGIN_REWARDS.map((reward) => <button className="button button-secondary" type="button" key={reward.id} disabled={season.loginRewardClaimed} onClick={() => onCommand({ name: 'claim_login_reward', args: { rewardId: reward.id } }, (current) => claimLoginReward(current, reward.id))}><strong>{reward.title}</strong><span>{reward.description}</span></button>)}</div>
          {season.loginRewardClaimed && <div className="economy-notice economy-notice--success">تم استلام مكافأة الدخول لهذا اليوم. عد غدًا لاختيار مكافأة جديدة.</div>}
        </EconomyPanel>
        <EconomyPanel title="المتصدرون العالميون" description="الترتيب العام يعرض نتائج مستخدمين حقيقيين فقط، دون منافسين وهميين أو بيانات مالية خاصة.">
          <div className="economy-button-row"><span>اختر تصنيف النقاط أو الإنتاج أو العقود أو الشارات من بطاقة المتصدرين.</span><button className="button button-secondary" type="button" onClick={onHome}>عرض المتصدرين في الرئيسية</button></div>
        </EconomyPanel>
        <EconomyPanel title={`حدث اليوم · ${seasonEvent.event.title}`} description={seasonEvent.claimed ? 'تم تنفيذ قرار اليوم. سيظهر حدث جديد عند انتقال اليوم.' : seasonEvent.event.description}>
          {seasonEvent.claimed ? <div className="economy-notice economy-notice--success">تم اتخاذ القرار اليومي. استمر في إدارة إمبراطوريتك حتى يبدأ الحدث التالي.</div> : <div className="season-event-choices">{seasonEvent.event.choices.map((choice) => <button className="button button-secondary" type="button" key={choice.id} onClick={() => onCommand({ name: 'choose_season_event', args: { choiceId: choice.id } }, (current) => chooseSeasonEvent(current, choice.id))}><strong>{choice.label}</strong><span>{choice.description}</span></button>)}</div>}
        </EconomyPanel>
        <EconomyPanel title="المهام والإنجازات" description="تحقق من شروط المهام ثم استلم كل مكافأة مرة واحدة.">
          <div className="economy-list">{tasks.map((task) => <article className="economy-task" key={task.id}><span className="economy-task-icon"><Icon name={task.claimed ? 'shield' : 'tasks'} size={18} /></span><span className="economy-task-copy"><strong>{task.title}</strong><small>{task.description} المكافأة {formatMoney(task.reward, country)}</small></span>{task.claimed ? <span className="economy-pill economy-pill--green">مكتملة</span> : <button className="button button-primary" type="button" disabled={!task.available} onClick={() => runCommand({ name: 'claim_task', args: { taskId: task.id } }, (current) => claimTask(current, task.id))}>{task.available ? 'استلام المكافأة' : 'لم تكتمل'}</button>}</article>)}</div>
        </EconomyPanel>
      </>,
    )}</div>;
  }

  return <div className="section-page">{heading}{pageShell(
    <>
      <EconomyPanel title="نظرة سريعة" description="ملخص النشاط المسجل في عالمك.">
        <div className="economy-grid economy-grid--three-mobile"><EconomyStat label="الشركات" value={formatNumber(profile.companies.length)} /><EconomyStat label="الأراضي" value={formatNumber(profile.lands.length)} /><EconomyStat label="الذهب" value={`${formatNumber(profile.goldGrams)} جم`} /></div>
      </EconomyPanel>
      <div className="economy-button-row"><button className="button button-secondary" type="button" onClick={onHome}>العودة إلى الرئيسية</button></div>
    </>,
  )}</div>;
}
import { getPlayerProgress } from '../game/onboarding';
