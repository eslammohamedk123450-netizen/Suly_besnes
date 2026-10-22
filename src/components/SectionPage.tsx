import { useState, type FormEvent, type ReactNode } from 'react';
import type { CountryDefinition, IndustryId } from '../domain/countries';
import type { PlayerProfile } from '../domain/player';
import type { NotificationTheme } from '../storage/userPreferences';
import type { SectionItem } from '../domain/navigation';
import { formatMoney, formatNumber } from '../domain/formatters';
import { buyGold, buyMaterial, claimTask, createDeposit, createInvestment, foundCompany, hireStaff, placeBid, runProduction, sellGold, sellProduct, takeLoan, terminateStaff, withdrawDeposit, type GameResult } from '../game/engine';
import type { StaffRole } from '../domain/futureSystems';
import { AUCTION_CATALOG, GOLD_PRICE_PER_GRAM, INDUSTRY_CATALOG, INVESTMENT_CATALOG, MATERIAL_CATALOG, PRODUCT_CATALOG, RECIPE_CATALOG } from '../game/catalog';
import { getMarketQuote } from '../game/market';
import { selectActiveInvestments, selectAvailableAuctions, selectFinancialReport, selectInventorySummary, selectObligations, selectSalesSummary, selectTaskBoard } from '../game/selectors';
import { Icon } from './Icon';
import { EconomyEmpty, EconomyPageShell, EconomyPanel, EconomyStat } from './EconomyUI';

interface SectionPageProps {
  section: SectionItem;
  profile: PlayerProfile;
  country: CountryDefinition;
  notificationTheme: NotificationTheme;
  onNotificationThemeChange: (theme: NotificationTheme) => void;
  onHome: () => void;
  onAction: (result: GameResult<unknown>) => void;
}

const landTypeNames = { industrial: 'صناعية', agricultural: 'زراعية', commercial: 'تجارية' } as const;
const ledgerLabels = { revenue: 'إيراد', expense: 'مصروف', asset: 'أصل', liability: 'التزام', settlement: 'سداد التزام' } as const;

export function SectionPage({ section, profile, country, notificationTheme, onNotificationThemeChange, onHome, onAction }: SectionPageProps) {
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
  const [loanAmount, setLoanAmount] = useState('25000');
  const [loanTerm, setLoanTerm] = useState('14');
  const [loanCollateral, setLoanCollateral] = useState('');
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState<StaffRole>('manager');
  const [staffCompany, setStaffCompany] = useState('');

  const dayLabel = `اليوم ${formatNumber(profile.day)}`;
  const balanceLabel = `الرصيد ${formatMoney(profile.bankBalance, country)}`;
  const run = (action: (current: PlayerProfile) => GameResult<unknown>) => onAction(action(profile));
  const pageShell = (children: ReactNode) => (
    <EconomyPageShell dayLabel={dayLabel} balanceLabel={balanceLabel}>
      {children}
    </EconomyPageShell>
  );
  const heading = (
    <div className="page-heading">
      <span className="heading-icon"><Icon name={section.icon} size={23} /></span>
      <div><span className="section-kicker">إدارة واقتصاد اللعبة</span><h1>{section.label}</h1></div>
    </div>
  );

  if (section.id === 'obligations') {
    const obligations = selectObligations(profile, country.economy.operatingCostMultiplier ?? 1);
    const categoryLabels = { payable: 'متأخر', salary: 'راتب', loan: 'قسط قرض', operating: 'تشغيل' } as const;
    return <div className="section-page">{heading}{pageShell(
      <>
        <div className="economy-grid economy-grid--three-mobile"><EconomyStat label="إجمالي الاستحقاقات" value={formatMoney(obligations.totalDue, country)} /><EconomyStat label="متأخر عن السداد" value={formatMoney(obligations.overdueAmount, country)} /><EconomyStat label="الرواتب اليومية" value={formatMoney(obligations.dailyPayroll, country)} /></div>
        <EconomyPanel title="خريطة الالتزامات" description="تُسدد الرواتب والأقساط والتشغيل تلقائيًا عند ترحيل اليوم. إذا لم تكفِ السيولة، يظهر الجزء غير المدفوع كالتزام ويوقف الطاقة عند الحاجة.">
          {obligations.rows.length === 0 ? <EconomyEmpty title="لا توجد التزامات مسجلة" message="ابدأ التشغيل أو التوظيف أو التمويل حتى تظهر المواعيد والتكاليف هنا." /> : <div className="economy-list">{obligations.rows.map((row) => <article className={`economy-card economy-card--soft${row.overdue ? ' obligation-card--overdue' : ''}`} key={row.id}><div className="economy-card-head"><div className="economy-card-title"><span><strong>{row.label}</strong><small>{categoryLabels[row.category]} · موعد السداد {row.overdue ? 'متأخر' : `اليوم ${formatNumber(row.dueDay)}`}</small></span></div><span className={`economy-pill ${row.overdue ? 'economy-pill--red' : 'economy-pill--gold'}`}>{formatMoney(row.amount, country)}</span></div></article>)}</div>}
        </EconomyPanel>
      </>,
    )}</div>;
  }

  if (section.id === 'settings') {
    return <div className="section-page">{heading}{pageShell(
      <EconomyPanel title="ملف اللاعب" description="إعدادات هذا العالم المحلي المحفوظ على الجهاز.">
        <div className="settings-card settings-card--inner">
          <div className="settings-row"><span>اسم المستثمر</span><strong>{profile.name}</strong></div>
          <div className="settings-row"><span>الدولة الأساسية</span><strong>{country.flag} {country.name} · {country.currency.code}</strong></div>
          <div className="settings-row"><span>اليوم داخل العالم</span><strong>{formatNumber(profile.day)}</strong></div>
          <div className="settings-row"><span>المستوى</span><strong>{formatNumber(profile.level)}</strong></div>
          <div className="settings-row"><span>طريقة الحفظ</span><strong className="saved-status"><span /> على هذا الجهاز</strong></div>
          <div className="settings-note"><Icon name="shield" size={17} /><p>لا يوجد خادم أو تسجيل دخول. تقدمك محفوظ محليًا على هذا الجهاز.</p></div>
          <div className="settings-notice-theme">
            <span>مظهر الإشعارات</span>
            <div className="settings-theme-switch" role="group" aria-label="اختيار مظهر الإشعارات">
              <button className={notificationTheme === 'dark' ? 'is-selected' : ''} type="button" aria-pressed={notificationTheme === 'dark'} onClick={() => onNotificationThemeChange('dark')}>داكن</button>
              <button className={notificationTheme === 'light' ? 'is-selected' : ''} type="button" aria-pressed={notificationTheme === 'light'} onClick={() => onNotificationThemeChange('light')}>فاتح</button>
            </div>
          </div>
          <div className="settings-actions"><button className="button button-secondary" type="button" onClick={onHome}>العودة للرئيسية</button></div>
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
    return <div className="section-page">{heading}{pageShell(
      <>
        <div className="economy-grid economy-grid--three-mobile"><EconomyStat label="الرصيد المتاح" value={formatMoney(profile.bankBalance, country)} /><EconomyStat label="ودائع نشطة" value={formatNumber(activeDeposits.length)} /><EconomyStat label="أقساط قروض نشطة" value={formatNumber(activeLoans.length)} /></div>
        <EconomyPanel title="حساب البنك" description="محاكاة مصرفية محلية: أموالك المودعة تُحجز حتى الاستحقاق، ولا تمثل فائدة أو خدمة مالية حقيقية.">
          <form className="economy-form" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); run((current) => createDeposit(current, Number(depositAmount), Number(depositDuration))); }}>
            <div className="economy-form-row"><div className="economy-field"><label htmlFor="deposit-amount">مبلغ الوديعة</label><input id="deposit-amount" type="number" min="50000" step="1000" value={depositAmount} onChange={(event) => setDepositAmount(event.target.value)} /></div><div className="economy-field"><label htmlFor="deposit-duration">المدة</label><select id="deposit-duration" value={depositDuration} onChange={(event) => setDepositDuration(event.target.value)}><option value="3">3 أيام · عائد محاكى 5%</option><option value="7">7 أيام · عائد محاكى 8%</option><option value="14">14 يومًا · عائد محاكى 12%</option></select></div></div>
            <button className="button button-primary" type="submit" disabled={Number(depositAmount) < 50000 || Number(depositAmount) > profile.bankBalance}>فتح وديعة</button>
          </form>
          <div className="economy-list">{profile.banking.deposits.slice().reverse().map((deposit) => <article className="economy-card economy-card--soft" key={deposit.id}><div className="economy-card-head"><div className="economy-card-title"><span><strong>{formatMoney(deposit.principal, country)}</strong><small>تستحق في اليوم {formatNumber(deposit.maturityDay)} · عائد {Math.round(deposit.annualRate * 100)}%</small></span></div><span className={`economy-pill ${deposit.status === 'active' ? 'economy-pill--gold' : 'economy-pill--green'}`}>{deposit.status === 'active' ? 'نشطة' : 'تمت التسوية'}</span></div>{deposit.status === 'active' && <button className="button button-secondary" type="button" disabled={profile.day < deposit.maturityDay} onClick={() => run((current) => withdrawDeposit(current, deposit.id))}>{profile.day < deposit.maturityDay ? `تستحق بعد ${formatNumber(deposit.maturityDay - profile.day)} يوم` : 'استرداد الوديعة'}</button>}</article>)}</div>
        </EconomyPanel>
        <EconomyPanel title="قرض بضمان" description="يمكن تمويل 60% كحد أقصى من قيمة أرض أو شركة مؤهلة. لكل ضمان قرض نشط واحد وجدول قسط واضح.">
          {selectedCollateral ? <form className="economy-form" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); run((current) => takeLoan(current, selectedCollateral.type, selectedCollateral.id, Number(loanAmount), Number(loanTerm))); }}><div className="economy-form-row"><div className="economy-field"><label htmlFor="loan-collateral">الضمان</label><select id="loan-collateral" value={selectedCollateral.id} onChange={(event) => setLoanCollateral(event.target.value)}>{collateralOptions.map((item) => <option value={item.id} key={item.id}>{item.label} · {item.type === 'land' ? 'أرض' : 'شركة'}</option>)}</select></div><div className="economy-field"><label htmlFor="loan-amount">مبلغ القرض</label><input id="loan-amount" type="number" min="25000" step="1000" value={loanAmount} onChange={(event) => setLoanAmount(event.target.value)} /></div><div className="economy-field"><label htmlFor="loan-term">مدة السداد</label><select id="loan-term" value={loanTerm} onChange={(event) => setLoanTerm(event.target.value)}><option value="7">7 أيام · 18%</option><option value="14">14 يومًا · 22%</option><option value="30">30 يومًا · 28%</option></select></div></div><div className="economy-meta"><span>القسط يبدأ في اليوم التالي</span><span>القيمة المسجلة للضمان {selectedCollateral.value > 0 ? formatMoney(selectedCollateral.value, country) : 'تُحسب حسب القطاع'}</span></div><button className="button button-primary" type="submit" disabled={Number(loanAmount) < 25000}>طلب القرض</button></form> : <EconomyEmpty title="لا يوجد ضمان مؤهل" message="اشترِ أرضًا أو أسس شركة أولًا حتى يظهر خيار التمويل بضمان." />}
          <div className="economy-list">{profile.banking.loans.slice().reverse().map((loan) => <article className="economy-card economy-card--soft" key={loan.id}><div className="economy-card-head"><div className="economy-card-title"><span><strong>{formatMoney(loan.principal, country)}</strong><small>المتبقي {formatMoney(loan.remainingBalance, country)} · القسط {formatMoney(loan.installmentAmount, country)}</small></span></div><span className={`economy-pill ${loan.status === 'active' ? 'economy-pill--red' : 'economy-pill--green'}`}>{loan.status === 'active' ? `القسط يوم ${formatNumber(loan.nextPaymentDay)}` : 'مغلق'}</span></div></article>)}</div>
        </EconomyPanel>
      </>,
    )}</div>;
  }

  if (section.id === 'staff') {
    const activeStaff = profile.staff.filter((member) => member.status === 'active');
    const roleLabels: Record<StaffRole, string> = { manager: 'مدير شركة', accountant: 'محاسب', lawyer: 'محامٍ', hr: 'مدير موارد بشرية' };
    return <div className="section-page">{heading}{pageShell(
      <>
        <div className="economy-grid economy-grid--three-mobile"><EconomyStat label="موظفون نشطون" value={formatNumber(activeStaff.length)} /><EconomyStat label="الرواتب اليومية" value={formatMoney(activeStaff.reduce((sum, member) => sum + member.dailySalary, 0), country)} /><EconomyStat label="الراتب القادم" value={activeStaff.length > 0 ? `اليوم ${formatNumber(Math.min(...activeStaff.map((member) => member.nextPayDay)))}` : '—'} /></div>
        <EconomyPanel title="التعيين والإدارة" description="كل عقد له راتب يومي وموعد دفع وصلاحية واضحة. المدير المرتبط بشركة يخفض مصروف تشغيلها محاكيًا مقابل أجره.">
          <form className="economy-form" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); run((current) => hireStaff(current, staffRole, staffName, staffRole === 'manager' ? staffCompany : undefined)); }}>
            <div className="economy-form-row"><div className="economy-field"><label htmlFor="staff-name">اسم الموظف</label><input id="staff-name" value={staffName} onChange={(event) => setStaffName(event.target.value)} placeholder="مثال: أحمد سالم" /></div><div className="economy-field"><label htmlFor="staff-role">الدور</label><select id="staff-role" value={staffRole} onChange={(event) => setStaffRole(event.target.value as StaffRole)}>{Object.entries(roleLabels).map(([role, label]) => <option value={role} key={role}>{label}</option>)}</select></div>{staffRole === 'manager' && <div className="economy-field"><label htmlFor="staff-company">الشركة</label><select id="staff-company" value={staffCompany} onChange={(event) => setStaffCompany(event.target.value)}><option value="">اختر شركة</option>{profile.companies.map((company) => <option value={company.id} key={company.id}>{company.name}</option>)}</select></div>}</div>
            <button className="button button-primary" type="submit" disabled={staffName.trim().length < 2 || (staffRole === 'manager' && !staffCompany)}>توقيع العقد ودفع يوم التعاقد</button>
          </form>
        </EconomyPanel>
        <EconomyPanel title="العقود والرواتب" description="تُسدد الرواتب تلقائيًا عند ترحيل اليوم. عند عدم كفاية السيولة تتحول القيمة غير المدفوعة إلى التزام ظاهر في التقارير.">
          {profile.staff.length === 0 ? <EconomyEmpty title="لا يوجد موظفون" message="ابدأ بمدير لشركة قائمة أو وظّف محاسبًا ومحاسميًا عند اتساع العمليات." /> : <div className="economy-list">{profile.staff.slice().reverse().map((member) => <article className="economy-card economy-card--soft" key={member.id}><div className="economy-card-head"><div className="economy-card-title"><span><strong>{member.name}</strong><small>{roleLabels[member.role]} · {formatMoney(member.dailySalary, country)} يوميًا · الراتب التالي يوم {formatNumber(member.nextPayDay)}</small></span></div><span className={`economy-pill ${member.status === 'active' ? 'economy-pill--gold' : 'economy-pill--red'}`}>{member.status === 'active' ? 'عقد نشط' : 'منتهٍ'}</span></div>{member.status === 'active' && <button className="button button-secondary" type="button" onClick={() => run((current) => terminateStaff(current, member.id))}>إنهاء العقد</button>}</article>)}</div>}
        </EconomyPanel>
      </>,
    )}</div>;
  }

  if (section.id === 'auctions') {
    const listings = selectAvailableAuctions();
    return <div className="section-page">{heading}{pageShell(
      <>
        <div className="economy-grid economy-grid--three-mobile">
          <EconomyStat label="الأراضي المملوكة" value={formatNumber(profile.lands.length)} />
          <EconomyStat label="المتاح بالمزادات" value={formatNumber(listings.length)} />
          <EconomyStat label="ميزانية البنك" value={formatMoney(profile.bankBalance, country)} />
        </div>
        <EconomyPanel title="مزادات الأراضي والمصانع والمواد الخام" description="قدّم عرضًا؛ تنافسك شخصيات آلية بعروض محددة. يُخصم المبلغ فقط عند فوزك.">
          {listings.length === 0 ? <EconomyEmpty title="لا توجد مزادات متاحة" message="عد لاحقًا لمتابعة الفرص الجديدة." /> : <div className="economy-list">
            {listings.map((listing, index) => {
              const botHighest = listing.minimumBid + listing.bidIncrement * (2 + AUCTION_CATALOG.findIndex((item) => item.id === listing.id));
              const recommended = botHighest + listing.bidIncrement;
              const value = bidAmounts[listing.id] ?? String(recommended);
              const material = MATERIAL_CATALOG.find((item) => item.id === listing.materialId);
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
                  <div className="economy-meta"><span>الحد الأدنى للعرض</span><span>الزيادة {formatMoney(listing.bidIncrement, country)}</span><span className="economy-pill economy-pill--gold">أعلى عرض آلي {formatMoney(botHighest, country)}</span></div>
                  <form className="economy-form" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); run((current) => placeBid(current, listing.id, Number(value))); }}>
                    <div className="economy-form-row"><div className="economy-field"><label htmlFor={`bid-${listing.id}`}>عرضك ({country.currency.symbol})</label><input id={`bid-${listing.id}`} type="number" min={listing.minimumBid} step={listing.bidIncrement} value={value} onChange={(event) => setBidAmounts((previous) => ({ ...previous, [listing.id]: event.target.value }))} /></div><div className="economy-field"><label>عرض مرجّح للفوز</label><input value={formatMoney(recommended, country)} readOnly /></div></div>
                    {!canBuyLot && <div className="economy-alert"><Icon name="shield" size={16} />أسس شركة أولًا حتى تربط بها المصنع الفائز.</div>}
                    <button className="button button-primary" type="submit" disabled={!canBuyLot || profile.bankBalance < listing.minimumBid}><Icon name="gavel" size={16} /> تقديم العرض</button>
                  </form>
                </div>
              </article>;
            })}
          </div>}
        </EconomyPanel>
        <EconomyPanel title="سجل الملكيات" description="تظهر هنا الأراضي التي فزت بها فعليًا.">
          {profile.lands.length === 0 ? <EconomyEmpty title="لا توجد أراضٍ مملوكة بعد" message="افتح مزادًا وقدّم عرضًا لتسجيل أول أصل عقاري." /> : <div className="economy-list">{profile.lands.map((land) => <article className="economy-card economy-card--soft" key={land.id}><div className="economy-card-head"><div className="economy-card-title"><span className="economy-card-icon"><Icon name="land" size={18} /></span><span><strong>{land.label}</strong><small>{formatNumber(land.areaSquareMeters)} م² · {land.landType ? landTypeNames[land.landType] : 'أرض'}</small></span></div><span className="economy-price">{formatMoney(land.purchasePrice, country)}</span></div></article>)}</div>}
        </EconomyPanel>
      </>,
    )}</div>;
  }

  if (section.id === 'lands') {
    const usedLandIds = new Set(profile.companies.map((company) => company.landId).filter(Boolean));
    const totalLandValue = profile.lands.reduce((sum, land) => sum + land.purchasePrice, 0);
    return <div className="section-page">{heading}{pageShell(
      <>
        <div className="economy-grid economy-grid--three-mobile"><EconomyStat label="قطع الأراضي" value={formatNumber(profile.lands.length)} /><EconomyStat label="أراضٍ مرتبطة بشركات" value={formatNumber(usedLandIds.size)} /><EconomyStat label="القيمة الدفترية" value={formatMoney(totalLandValue, country)} /></div>
        <EconomyPanel title="أراضي الإمبراطورية" description="تُسجل قيمة الشراء ضمن أصولك، ويمكن تخصيص كل أرض لشركة واحدة.">
          {profile.lands.length === 0 ? <div className="economy-list"><EconomyEmpty title="ابدأ بشراء أول أرض" message="الأرض شرط لتأسيس شركة. انتقل إلى المزادات واختر موقعًا صناعيًا أو زراعيًا أو تجاريًا." /><button className="button button-primary" type="button" onClick={onHome}>فتح المزادات</button></div> : <div className="economy-list">{profile.lands.map((land) => {
            const owner = profile.companies.find((company) => company.landId === land.id);
            return <article className="economy-card" key={land.id}><div className="economy-card-head"><div className="economy-card-title"><span className="economy-card-icon"><Icon name={owner ? 'factory' : 'land'} size={19} /></span><span><strong>{land.label}</strong><small>{formatNumber(land.areaSquareMeters)} م² · {land.landType ? landTypeNames[land.landType] : 'نوع عام'}</small></span></div><span className={`economy-pill ${owner ? 'economy-pill--green' : 'economy-pill--gold'}`}>{owner ? `تشغلها ${owner.name}` : 'متاحة للتأسيس'}</span></div><div className="economy-card-body"><div className="economy-meta"><span>سعر الشراء {formatMoney(land.purchasePrice, country)}</span><span>تاريخ التسجيل {new Date(land.acquiredAt).toLocaleDateString('ar-EG')}</span></div></div></article>;
          })}</div>}
        </EconomyPanel>
      </>,
    )}</div>;
  }

  if (section.id === 'companies') {
    const industry = INDUSTRY_CATALOG.find((item) => item.id === industryId) ?? INDUSTRY_CATALOG[0];
    const eligibleLands = profile.lands.filter((land) => !land.landType || land.landType === industry.requiredLandType);
    const selectedLandId = eligibleLands.some((land) => land.id === landId) ? landId : eligibleLands[0]?.id ?? '';
    const setupFee = country.economy.companySetupFee ?? industry.setupFee;
    const licenseFee = country.economy.licenseFeesByIndustry[industry.id] ?? industry.licenseFee;
    return <div className="section-page">{heading}{pageShell(
      <>
        <div className="economy-grid economy-grid--three-mobile"><EconomyStat label="الشركات" value={formatNumber(profile.companies.length)} /><EconomyStat label="تكلفة تأسيس القطاع" value={formatMoney(setupFee + licenseFee, country)} /><EconomyStat label="الأرض المتاحة" value={formatNumber(eligibleLands.length)} /></div>
        <div className="economy-layout">
          <EconomyPanel title="تأسيس شركة" description="اختر قطاعًا، واسمًا، وأرضًا مناسبة. تُخصم رسوم التأسيس والترخيص عند نجاح العملية.">
            {profile.lands.length === 0 ? <div className="economy-list"><EconomyEmpty title="تحتاج إلى أرض أولًا" message="اشترِ أرضًا من المزادات؛ بعدها يمكنك تأسيس شركة وتشغيل مصنعها." /><button className="button button-primary" type="button" onClick={onHome}>عرض ملخص الإمبراطورية</button></div> : <form className="economy-form" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (selectedLandId) run((current) => foundCompany(current, industry.id, selectedLandId, companyName)); }}>
              <div className="economy-field"><label htmlFor="industry-select">القطاع الاقتصادي</label><select id="industry-select" value={industry.id} onChange={(event) => setIndustryId(event.target.value as IndustryId)}>{INDUSTRY_CATALOG.map((item) => <option value={item.id} key={item.id}>{item.name} · {formatMoney((country.economy.companySetupFee ?? item.setupFee) + (country.economy.licenseFeesByIndustry[item.id] ?? item.licenseFee), country)}</option>)}</select></div>
              <div className="economy-field"><label htmlFor="company-name">اسم الشركة</label><input id="company-name" value={companyName} maxLength={36} onChange={(event) => setCompanyName(event.target.value)} /></div>
              <div className="economy-field"><label htmlFor="land-select">الأرض المناسبة ({landTypeNames[industry.requiredLandType]})</label><select id="land-select" value={selectedLandId} onChange={(event) => setLandId(event.target.value)} disabled={eligibleLands.length === 0}><option value="">اختر أرضًا</option>{eligibleLands.map((land) => <option key={land.id} value={land.id}>{land.label} · {formatNumber(land.areaSquareMeters)} م²</option>)}</select></div>
              <div className="economy-meta"><span>رسوم تأسيس {formatMoney(setupFee, country)}</span><span>ترخيص {formatMoney(licenseFee, country)}</span><span>تشغيل يومي {formatMoney(industry.dailyOperatingCost, country)}</span></div>
              {eligibleLands.length === 0 && <div className="economy-alert"><Icon name="shield" size={16} />لا تملك أرضًا من النوع المناسب لهذا النشاط؛ اشترِ موقعًا {landTypeNames[industry.requiredLandType]}.</div>}
              <button className="button button-primary" type="submit" disabled={!selectedLandId || profile.bankBalance < setupFee + licenseFee}><Icon name="company" size={16} /> تأسيس وترخيص الشركة</button>
            </form>}
          </EconomyPanel>
          <EconomyPanel title="شركاتك القائمة" description="الطاقة والمصروفات تتحدث مع تقدم الأيام.">
            {profile.companies.length === 0 ? <EconomyEmpty title="لم تؤسس شركة بعد" message="ابدأ بشراء أرض مناسبة ثم أكمل نموذج التأسيس." /> : <div className="economy-list">{profile.companies.map((company) => {
              const definition = INDUSTRY_CATALOG.find((item) => item.id === company.industryId);
              const land = profile.lands.find((item) => item.id === company.landId);
              return <article className="economy-card" key={company.id}><div className="economy-card-head"><div className="economy-card-title"><span className="economy-card-icon"><Icon name="factory" size={19} /></span><span><strong>{company.name}</strong><small>{definition?.name ?? company.industryId} · {land?.label ?? 'دون أرض مسجلة'}</small></span></div><span className="economy-pill economy-pill--green">مرخصة</span></div><div className="economy-card-body"><div className="economy-meta"><span>طاقة {formatNumber(company.energyUnits ?? 0)} / {formatNumber(company.energyCapacity ?? definition?.energyCapacity ?? 0)}</span><span>تشغيل يومي {formatMoney(company.operatingCostPerDay ?? 0, country)}</span></div><div className="economy-progress"><span style={{ width: `${Math.min(100, 100 * (company.energyUnits ?? 0) / Math.max(1, company.energyCapacity ?? 1))}%` }} /></div></div></article>;
            })}</div>}
          </EconomyPanel>
        </div>
      </>,
    )}</div>;
  }

  if (section.id === 'production') {
    const selectedCompany = profile.companies.find((item) => item.id === companyId) ?? profile.companies[0];
    const recipe = selectedCompany ? RECIPE_CATALOG.find((item) => item.industryId === selectedCompany.industryId) : undefined;
    return <div className="section-page">{heading}{pageShell(
      <>
        <EconomyPanel title="خطوط الإنتاج" description="كل دفعة تستهلك موادًا خامًا وطاقة ورسوم تشغيل، ثم تضيف المنتج إلى مخزونك.">
          {profile.companies.length === 0 ? <EconomyEmpty title="لا توجد مصانع عاملة" message="أسس شركة أولًا؛ يتضمن ترخيصها خط إنتاج للقطاع الذي اخترته." /> : <div className="economy-layout">
            <form className="economy-form" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (selectedCompany) run((current) => runProduction(current, selectedCompany.id, Number(productionBatches))); }}>
              <div className="economy-field"><label htmlFor="factory-select">الشركة / المصنع</label><select id="factory-select" value={selectedCompany?.id ?? ''} onChange={(event) => setCompanyId(event.target.value)}>{profile.companies.map((company) => <option key={company.id} value={company.id}>{company.name} · {INDUSTRY_CATALOG.find((item) => item.id === company.industryId)?.name}</option>)}</select></div>
              <div className="economy-field"><label htmlFor="production-batches">دفعات الإنتاج</label><input id="production-batches" type="number" min="1" max="100" step="1" value={productionBatches} onChange={(event) => setProductionBatches(event.target.value)} /></div>
              <button className="button button-primary" type="submit" disabled={!recipe}><Icon name="play" size={16} /> تشغيل الإنتاج</button>
            </form>
            {recipe && selectedCompany ? <div className="economy-card economy-card--soft"><div className="economy-card-head"><div className="economy-card-title"><span className="economy-card-icon"><Icon name="factory" size={18} /></span><span><strong>{recipe.productName}</strong><small>{formatNumber(recipe.outputQuantity)} {recipe.outputUnit} لكل دفعة</small></span></div><span className="economy-pill economy-pill--gold">{formatNumber(selectedCompany.energyUnits ?? 0)} طاقة</span></div><div className="economy-card-body"><p className="economy-card-description">متطلبات الدفعة: {recipe.inputs.map((input) => `${input.quantity} ${MATERIAL_CATALOG.find((material) => material.id === input.materialId)?.unit ?? ''} ${MATERIAL_CATALOG.find((material) => material.id === input.materialId)?.name ?? input.materialId}`).join('، ')}. طاقة {recipe.energyUnits} وتكلفة {formatMoney(recipe.energyCost, country)}.</p><div className="economy-meta">{recipe.inputs.map((input) => { const material = MATERIAL_CATALOG.find((item) => item.id === input.materialId); const lot = profile.inventory.find((item) => item.materialOrProductId === input.materialId); return <span key={input.materialId}>{material?.name}: {formatNumber(lot?.quantity ?? 0)} / {input.quantity} لكل دفعة</span>; })}</div></div></div> : <EconomyEmpty title="لا توجد وصفة متاحة" message="لا تتوفر وصفة إنتاج لهذا القطاع حاليًا." />}
          </div>}
        </EconomyPanel>
        <EconomyPanel title="الطاقة المتاحة" description="استعد الطاقة اليومية بتمرير يوم في اللعبة.">
          {profile.companies.length === 0 ? <EconomyEmpty title="لا توجد طاقة صناعية" message="تظهر الطاقة بعد تأسيس أول شركة." /> : <div className="economy-list">{profile.companies.map((company) => <div className="economy-card" key={company.id}><div className="economy-card-head"><div className="economy-card-title"><span className="economy-card-icon"><Icon name="factory" size={17} /></span><span><strong>{company.name}</strong><small>{INDUSTRY_CATALOG.find((item) => item.id === company.industryId)?.name}</small></span></div><span className="economy-price">{formatNumber(company.energyUnits ?? 0)} / {formatNumber(company.energyCapacity ?? 0)}</span></div><div className="economy-card-body"><div className="economy-progress"><span style={{ width: `${Math.min(100, 100 * (company.energyUnits ?? 0) / Math.max(1, company.energyCapacity ?? 1))}%` }} /></div></div></div>)}</div>}
        </EconomyPanel>
      </>,
    )}</div>;
  }

  if (section.id === 'inventory') {
    const inventorySummary = selectInventorySummary(profile);
    const productRows = inventorySummary.rows.filter((row) => row.kind === 'product');
    const materialStock = new Map(inventorySummary.rows.filter((row) => row.kind === 'material').map((row) => [row.itemId, row]));
    return <div className="section-page">{heading}{pageShell(
      <>
        <div className="economy-grid economy-grid--three-mobile"><EconomyStat label="أنواع المخزون" value={formatNumber(inventorySummary.rows.length)} /><EconomyStat label="مواد خام" value={formatNumber(inventorySummary.rows.filter((row) => row.kind === 'material').length)} /><EconomyStat label="قيمة المخزون" value={formatMoney(inventorySummary.totalValue, country)} /></div>
        <EconomyPanel title="سوق المواد الخام" description="اشترِ مدخلات الإنتاج؛ الأسعار والكميات جزء من محاكاة اللعبة.">
          <div className="economy-list">{MATERIAL_CATALOG.map((material) => {
            const stock = materialStock.get(material.id);
            const quantity = materialQuantities[material.id] ?? '1';
            return <article className="economy-card" key={material.id}><div className="economy-card-head"><div className="economy-card-title"><span className="economy-card-icon"><Icon name="warehouse" size={18} /></span><span><strong>{material.name}</strong><small>{formatMoney(material.pricePerUnit, country)} لكل {material.unit} · سعة {formatNumber(material.storageLimit)}</small></span></div><span className="economy-pill">مخزون {formatNumber(stock?.quantity ?? 0)}</span></div><div className="economy-card-body"><form className="economy-form" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); run((current) => buyMaterial(current, material.id, Number(quantity))); }}><div className="economy-form-row"><div className="economy-field"><label htmlFor={`mat-${material.id}`}>الكمية ({material.unit})</label><input id={`mat-${material.id}`} type="number" min="1" max={material.storageLimit - (stock?.quantity ?? 0)} step="1" value={quantity} onChange={(event) => setMaterialQuantities((previous) => ({ ...previous, [material.id]: event.target.value }))} /></div><div className="economy-field"><label>التكلفة التقديرية</label><input value={formatMoney(Number(quantity || 0) * material.pricePerUnit, country)} readOnly /></div></div><button className="button button-secondary" type="submit" disabled={!quantity || Number(quantity) < 1 || profile.bankBalance < Number(quantity) * material.pricePerUnit || (stock?.quantity ?? 0) >= material.storageLimit}><Icon name="plus" size={15} /> شراء للمخزن</button></form></div></article>;
          })}</div>
        </EconomyPanel>
        <EconomyPanel title="المنتجات الجاهزة للبيع" description="الطلب والسعر يتغيران يوميًا داخل محاكاة اللعبة؛ الضريبة تُخصم تلقائيًا عند البيع.">
          {productRows.length === 0 ? <EconomyEmpty title="لا توجد منتجات جاهزة" message="أنشئ شركة، اشترِ مدخلاتها، ثم شغّل خط الإنتاج." /> : <div className="economy-list">{productRows.map((row) => {
            const product = PRODUCT_CATALOG.find((item) => item.id === row.itemId);
            const quantity = productQuantities[row.itemId] ?? '1';
            const marketQuote = getMarketQuote(profile, row.itemId);
            const maxSellable = Math.min(row.quantity, marketQuote?.demandUnits ?? row.quantity);
            return <article className="economy-card" key={row.id}><div className="economy-card-head"><div className="economy-card-title"><span className="economy-card-icon"><Icon name="briefcase" size={18} /></span><span><strong>{row.name}</strong><small>المخزون {formatNumber(row.quantity)} {row.unit} · سعر السوق {formatMoney(marketQuote?.currentPrice ?? product?.baseSellPrice ?? 0, country)}</small></span></div><span className={`economy-pill economy-pill--${marketQuote?.trend === 'up' ? 'green' : marketQuote?.trend === 'down' ? 'red' : 'gold'}`}>{marketQuote?.trendLabel ?? 'السوق'}</span></div><div className="economy-card-body"><div className="economy-meta"><span>الطلب المتاح اليوم {formatNumber(marketQuote?.demandUnits ?? 0)} {row.unit}</span><span>القيمة الدفترية {formatMoney(row.totalValue, country)}</span></div><form className="economy-form" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); run((current) => sellProduct(current, row.itemId, Number(quantity))); }}><div className="economy-field"><label htmlFor={`sell-${row.itemId}`}>كمية البيع ({row.unit})</label><input id={`sell-${row.itemId}`} type="number" min="1" max={maxSellable} step="1" value={quantity} onChange={(event) => setProductQuantities((previous) => ({ ...previous, [row.itemId]: event.target.value }))} /></div><button className="button button-primary" type="submit" disabled={!quantity || Number(quantity) < 1 || Number(quantity) > maxSellable}><Icon name="investment" size={15} /> بيع بسعر السوق</button></form></div></article>;
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
              <button className="button button-primary" type="button" disabled={!Number.isFinite(goldQuantity) || goldQuantity <= 0 || profile.bankBalance < goldBuyEstimate} onClick={() => run((current) => buyGold(current, goldQuantity))}>شراء ذهب</button>
              <button className="button button-secondary" type="button" disabled={!Number.isFinite(goldQuantity) || goldQuantity <= 0 || goldQuantity > profile.goldGrams} onClick={() => run((current) => sellGold(current, goldQuantity))}>بيع كمية</button>
            </div>
          </div>
        </EconomyPanel>
        <EconomyPanel title="أدوات الاستثمار داخل اللعبة" description="تُحجز المبالغ حتى موعد الاستحقاق. كل العوائد والمخاطر افتراضية ولا تمثل منتجًا ماليًا حقيقيًا.">
          <div className="economy-list">{INVESTMENT_CATALOG.map((investment) => {
            const amount = investmentAmounts[investment.id] ?? String(investment.minimumAmount);
            return <article className="economy-card" key={investment.id}><div className="economy-card-head"><div className="economy-card-title"><span className="economy-card-icon"><Icon name="investment" size={18} /></span><span><strong>{investment.name}</strong><small>{formatNumber(investment.durationDays)} أيام · عائد متوقع {Math.round(investment.returnRate * 100)}%</small></span></div><span className={`economy-pill ${investment.riskRate > 0 ? 'economy-pill--gold' : 'economy-pill--green'}`}>{investment.riskRate > 0 ? `مخاطرة ${Math.round(investment.riskRate * 100)}%` : 'مخاطر منخفضة'}</span></div><div className="economy-card-body"><form className="economy-form" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); run((current) => createInvestment(current, investment.id, Number(amount))); }}><div className="economy-form-row"><div className="economy-field"><label htmlFor={`invest-${investment.id}`}>مبلغ الاستثمار</label><input id={`invest-${investment.id}`} type="number" min={investment.minimumAmount} max={investment.maximumAmount} step="1000" value={amount} onChange={(event) => setInvestmentAmounts((previous) => ({ ...previous, [investment.id]: event.target.value }))} /></div><div className="economy-field"><label>المتاح في البنك</label><input value={formatMoney(profile.bankBalance, country)} readOnly /></div></div><div className="economy-meta"><span>الحد {formatMoney(investment.minimumAmount, country)}</span><span>الحد الأعلى {formatMoney(investment.maximumAmount, country)}</span></div><button className="button button-primary" type="submit" disabled={Number(amount) < investment.minimumAmount || Number(amount) > investment.maximumAmount || Number(amount) > profile.bankBalance}>إنشاء استثمار</button></form></div></article>;
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
    const categoryClass = (category: keyof typeof ledgerLabels) => category === 'revenue' ? 'money-positive' : category === 'expense' ? 'money-negative' : '';
    return <div className="section-page">{heading}{pageShell(
      <>
        <div className="economy-grid economy-grid--three-mobile"><EconomyStat label="رصيد البنك" value={formatMoney(report.balance, country)} /><EconomyStat label="إجمالي الأصول" value={formatMoney(report.totalAssets, country)} /><EconomyStat label="التزامات مستحقة" value={formatMoney(report.liabilities, country)} /><EconomyStat label="صافي الربح" value={formatMoney(report.netProfit, country)} /></div>
        <div className="economy-grid economy-grid--two"><EconomyStat label="إجمالي الإيرادات" value={formatMoney(report.revenue, country)} note="من دفتر الحساب المحلي" /><EconomyStat label="إجمالي المصروفات" value={formatMoney(report.expenses, country)} note="يشمل التأسيس والتشغيل والضرائب" /><EconomyStat label="إجمالي المبيعات" value={formatMoney(sales.grossRevenue, country)} /><EconomyStat label="ضريبة المبيعات" value={formatMoney(sales.tax, country)} /></div>
        <EconomyPanel title="دفتر الحساب" description="كل الأرقام مستخرجة من معاملات اللاعب المسجلة.">
          {report.recentEntries.length === 0 ? <EconomyEmpty title="لا توجد حركات مالية بعد" message="تظهر هنا العمليات بعد أول مزاد أو شراء أو إنتاج أو بيع." /> : <div className="economy-table-wrap"><table className="economy-table"><thead><tr><th>الحركة</th><th>النوع</th><th>القيمة</th><th>التاريخ</th></tr></thead><tbody>{report.recentEntries.map((entry) => <tr key={entry.id}><td><strong>{entry.note}</strong></td><td>{ledgerLabels[entry.category]}</td><td className={categoryClass(entry.category)}>{entry.category === 'expense' ? '−' : entry.category === 'revenue' ? '+' : ''}{formatMoney(entry.amount, country)}</td><td>{new Date(entry.occurredAt).toLocaleDateString('ar-EG')}</td></tr>)}</tbody></table></div>}
        </EconomyPanel>
        {profile.events.length > 0 && <EconomyPanel title="الأحداث الاقتصادية الأخيرة" description="أحداث محاكاة تؤثر في الرصيد عند تقدم اليوم."><div className="economy-list">{profile.events.slice().reverse().slice(0, 5).map((event) => <article className="economy-card economy-card--soft" key={event.id}><div className="economy-card-head"><div className="economy-card-title"><span className="economy-card-icon"><Icon name="globe" size={18} /></span><span><strong>{event.title}</strong><small>اليوم {formatNumber(event.day)}</small></span></div><span className={`economy-pill ${event.cashImpact >= 0 ? 'economy-pill--green' : 'economy-pill--red'}`}>{event.cashImpact >= 0 ? '+' : '−'}{formatMoney(Math.abs(event.cashImpact), country)}</span></div></article>)}</div></EconomyPanel>}
      </>,
    )}</div>;
  }

  if (section.id === 'tasks') {
    const tasks = selectTaskBoard(profile);
    const completed = tasks.filter((task) => task.claimed).length;
    return <div className="section-page">{heading}{pageShell(
      <>
        <div className="economy-grid economy-grid--three-mobile"><EconomyStat label="إنجازات مكتملة" value={`${formatNumber(completed)} / ${formatNumber(tasks.length)}`} /><EconomyStat label="مكافآت متاحة" value={formatNumber(tasks.filter((task) => task.available && !task.claimed).length)} /><EconomyStat label="المكافآت المستلمة" value={formatNumber(profile.completedTaskIds.length)} /></div>
        <EconomyPanel title="المهام والإنجازات" description="تحقق من شروط المهام ثم استلم كل مكافأة مرة واحدة.">
          <div className="economy-list">{tasks.map((task) => <article className="economy-task" key={task.id}><span className="economy-task-icon"><Icon name={task.claimed ? 'shield' : 'tasks'} size={18} /></span><span className="economy-task-copy"><strong>{task.title}</strong><small>{task.description} المكافأة {formatMoney(task.reward, country)}</small></span>{task.claimed ? <span className="economy-pill economy-pill--green">مكتملة</span> : <button className="button button-primary" type="button" disabled={!task.available} onClick={() => run((current) => claimTask(current, task.id))}>{task.available ? 'استلام المكافأة' : 'لم تكتمل'}</button>}</article>)}</div>
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
