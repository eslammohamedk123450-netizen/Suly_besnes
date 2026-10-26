import { createContext, useContext, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import type { CountryDefinition, IndustryId } from '../domain/countries';
import type { PlayerProfile } from '../domain/player';
import type { GameCommand } from '../game/engine';
import type { NotificationTheme } from '../storage/userPreferences';
import type { SectionId, SectionItem } from '../domain/navigation';
import { formatMoney, formatNumber } from '../domain/formatters';
import { acceptContract, autoSupplyAndProduce, buyDirectCompany, buyDirectLand, buyGlobalMaterial, buyGold, buyGoldWithDiamonds, buySpeedCard, cancelProductionOrder, claimTask, createDeposit, createInvestment, deliverContract, foundCompany, getDepositExpectedInterest, getDepositMaturityRange, getStaffUpgradeCost, hasMaturedDepositTranche, hireStaff, mergeDeposits, negotiateContract, payStaffSalary, placeBid, repayLoan, runProduction, sellAsset, sellCompany, sellGold, sellLand, sellProduct, serviceCompany, staffExperience, staffLevel, takeLoan, terminateStaff, upgradeCompany, upgradeLand, upgradeStaff, upgradeWarehouse, useDaySpeedCard, useProductionSpeedCard, withdrawDeposit, type GameResult } from '../game/engine';
import type { StaffRole, AuctionListing } from '../domain/futureSystems';
import { AUCTION_CATALOG, DIRECT_COMPANY_CATALOG, DIRECT_LAND_CATALOG, getDirectLandsForCountry, getDirectCompaniesForCountry, GOLD_PRICE_PER_GRAM, INDUSTRY_CATALOG, INVESTMENT_CATALOG, MATERIAL_CATALOG, PRODUCT_CATALOG, RECIPE_CATALOG } from '../game/catalog';
import { getMarketQuote } from '../game/market';
import { formatAuctionCountdown, getAuctionCloseAt } from '../game/auctions';
import { getInvestmentPayoutRate, getOperatingCostProgression } from '../game/economyBalance';
import { getContractOffers, getCustomerSegmentLabel } from '../game/contracts';
import { selectActiveInvestments, selectAdvancedStatistics, selectAvailableAuctions, selectCompanyPerformance, selectEmpirePoints, selectFinancialReport, selectInventorySummary, selectObligations, selectSalesSummary, selectTaskBoard } from '../game/selectors';
import { Icon, type IconName } from './Icon';
import { Warehouse, Boxes, ShoppingBag, Store } from 'lucide-react';
import { triggerHaptic } from '../services/nativeMobileService';
import { isSoundEnabled, setSoundEnabled, playSound } from '../game/soundEffects';
import { EconomyEmpty, EconomyPageShell, EconomyPanel as BaseEconomyPanel, EconomyStat, type EconomyPanelProps } from './EconomyUI';
import { DiamondStore } from './DiamondStore';
import { PurchaseOptions } from './PurchaseOptions';
import { AuctionRoom } from './AuctionRoom';
import { claimLoginReward, claimSeasonChallenge, chooseSeasonEvent, getSeasonEventSnapshot, getSeasonSnapshot, LOGIN_REWARDS } from '../game/season';
import { getSynergyProductionMultiplier } from '../game/synergy';
import { getGlobalMarketOffers, negotiateGlobalMarketOffer } from '../game/globalMarket';
import { getWarehouseCapacity, getWarehouseItemCapacity, getWarehouseUsage, normalizeWarehouseLevel, WAREHOUSE_UPGRADE_REQUIREMENTS } from '../game/warehouse';
import { getGameDayDurationMinutes } from '../game/time';
import { getDiscountedDiamondPrice, type PurchasePaymentMethod } from '../game/purchasePricing';
import { StockExchangeTerminal } from './StockExchangeTerminal';
import { TerritoryConquestMap } from './TerritoryConquestMap';
import { TechTreeRND } from './TechTreeRND';
import { CeoLuxurySuite } from './CeoLuxurySuite';
import { CartelSyndicate } from './CartelSyndicate';
import { MaritimeTradeRoutes } from './MaritimeTradeRoutes';
import { GovernmentMegaprojects } from './GovernmentMegaprojects';
import { StartupIncubatorVC } from './StartupIncubatorVC';
import { loadExpansionState } from '../game/expansionEngine';
import { loadMegaExpansionState } from '../game/expansionV2Engine';
import { HubSubNav } from './HubSubNav';
import { ItemImage } from './ItemImage';
import { BankTerminal } from './BankTerminal';
import { getPlayerProgress, getSectionRequiredLevel, getSectionUnlockHint, isSectionUnlocked } from '../game/onboarding';
import { getCountryScenario } from '../game/countryScenarios';
import { ListAssetAuctionModal } from './DynamicAuctionModal';
import { StaffManagementView } from './StaffManagementView';
import { generateLiveAuctions, RIVAL_INVESTORS, settlePlayerAssetAuction, cancelPlayerAssetAuction } from '../game/dynamicAuctions';
import { GlobalMarketTerminal } from './GlobalMarketTerminal';

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
  onProfileUpdate?: (updated: PlayerProfile) => void;
}

const landTypeNames = { industrial: 'صناعية', agricultural: 'زراعية', commercial: 'تجارية' } as const;
const ledgerLabels = { revenue: 'إيراد', expense: 'مصروف', asset: 'أصل', liability: 'التزام', settlement: 'سداد التزام' } as const;
const compactSectionIds = new Set<SectionId>(['auctions', 'obligations', 'bank', 'staff', 'lands', 'companies', 'production', 'inventory', 'investments', 'reports', 'contracts', 'tasks']);

function panelIconFor(sectionId: SectionId, title: string): IconName {
  const normalized = title.toLocaleLowerCase('ar');
  if (normalized.includes('طاقة') || normalized.includes('كهرباء')) return 'lightning';
  if (normalized.includes('طابور') || normalized.includes('جدولة')) return 'conveyor';
  if (normalized.includes('أرض') || normalized.includes('أصول')) return 'land';
  if (normalized.includes('خطوط') || normalized.includes('مصنع') || normalized.includes('إنتاج')) return 'factory';
  if (normalized.includes('مخزن') || normalized.includes('مخزون')) return 'warehouse';
  if (normalized.includes('عقد') || normalized.includes('عملاء')) return 'briefcase';
  if (normalized.includes('مهمة') || normalized.includes('إنجاز') || normalized.includes('موسم')) return 'tasks';
  if (normalized.includes('تقرير') || normalized.includes('إحصاء') || normalized.includes('مبيعات')) return 'report';
  if (normalized.includes('استثمار')) return 'investment';
  if (normalized.includes('موظف') || normalized.includes('رواتب') || normalized.includes('إدارة')) return 'users';
  if (normalized.includes('بنك') || normalized.includes('وديعة') || normalized.includes('قرض')) return 'bank';
  if (normalized.includes('التزام') || normalized.includes('سداد')) return 'shield';
  if (normalized.includes('سوق') || normalized.includes('شراء') || normalized.includes('بيع')) return 'store';
  const fallback: Record<SectionId, IconName> = {
    home: 'home', auctions: 'gavel', companies: 'company', investments: 'investment', lands: 'land', production: 'factory', inventory: 'warehouse', reports: 'report', tasks: 'tasks', profile: 'user', bank: 'bank', staff: 'users', obligations: 'shield', store: 'store', contracts: 'briefcase', territory: 'land', tech_tree: 'factory', luxury: 'crown', cartel: 'company', maritime: 'land', megaprojects: 'gavel', incubator: 'investment',
  };
  return fallback[sectionId];
}

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

interface SectionPageContextValue {
  compactPage: boolean;
  activePanelId: string | null;
  sectionId: SectionId;
  onTogglePanel: (key: string) => void;
}

const SectionPageContext = createContext<SectionPageContextValue>({
  compactPage: false,
  activePanelId: null,
  sectionId: 'home',
  onTogglePanel: () => {},
});

export function SectionPanel(props: EconomyPanelProps) {
  const { compactPage, activePanelId, sectionId, onTogglePanel } = useContext(SectionPageContext);
  const panelKey = props.id ?? props.title;
  const expanded = compactPage && (activePanelId === '__all__' || activePanelId === panelKey);
  const resolvedIcon = props.icon ?? panelIconFor(sectionId, props.title);
  return (
    <BaseEconomyPanel
      {...props}
      compact={compactPage}
      icon={resolvedIcon}
      expanded={expanded}
      onToggle={() => onTogglePanel(panelKey)}
    />
  );
}

export function SectionPage({ section, profile, country, focus, notificationTheme, isGuest, onNotificationThemeChange, onHome, onNavigate, onAction, onCommand, onRedeemed, onRefreshProfile, onLinkAccount, onLogout, onShowGuide, onProfileUpdate }: SectionPageProps) {
  const playerProgress = getPlayerProgress(profile);
  const [bidAmounts, setBidAmounts] = useState<Record<string, string>>({});
  const [companyName, setCompanyName] = useState('شركة جديدة');
  const [industryId, setIndustryId] = useState<IndustryId>('food');
  const [landId, setLandId] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [productionBatches, setProductionBatches] = useState('1');
  const [showProductionHistory, setShowProductionHistory] = useState(false);
  const [productionStatusFilter, setProductionStatusFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
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
  const [showStaffHireForm, setShowStaffHireForm] = useState(false);
  const [auctionCompanyIds, setAuctionCompanyIds] = useState<Record<string, string>>({});
  const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(null);
  const [negotiatedMarketPrices, setNegotiatedMarketPrices] = useState<Record<string, number>>({});
  const [expandedCompanyId, setExpandedCompanyId] = useState<string | null>(null);
  const [expandedLandId, setExpandedLandId] = useState<string | null>(null);
  const [speedCardQuantities, setSpeedCardQuantities] = useState<Record<string, string>>({});
  const [, setAuctionTick] = useState(0);
  const [landView, setLandView] = useState<'owned' | 'offers'>('owned');
  const [landTypeFilter, setLandTypeFilter] = useState<'all' | 'industrial' | 'agricultural' | 'commercial'>('all');
  const [landSort, setLandSort] = useState<'price' | 'area' | 'type'>('price');
  const [auctionCategoryTab, setAuctionCategoryTab] = useState<'all' | 'land' | 'factory' | 'material'>('all');
  const [auctionViewMode, setAuctionViewMode] = useState<'market' | 'my_listings' | 'history'>('market');
  const [isListAssetModalOpen, setIsListAssetModalOpen] = useState(false);
  const [activePanelId, setActivePanelId] = useState<string | null>(null);
  const [expansionState, setExpansionState] = useState(() => loadExpansionState(profile));
  const [megaExpState, setMegaExpState] = useState(() => loadMegaExpansionState(profile));
  const lastScrolledFocusRef = useRef<string | null>(null);

  useEffect(() => {
    if (compactSectionIds.has(section.id)) setActivePanelId(focus ? '__all__' : null);
    if (section.id !== 'auctions') return undefined;
    const timer = window.setInterval(() => setAuctionTick((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [section.id, focus]);

  useEffect(() => {
    if (section.id === 'bank' && focus === 'loans') setBankTab('loans');
    if (!focus) return;
    const focusKey = `${section.id}:${focus}`;
    if (lastScrolledFocusRef.current === focusKey) return;
    lastScrolledFocusRef.current = focusKey;
    const timer = window.setTimeout(() => document.getElementById(focus)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
    return () => window.clearTimeout(timer);
  }, [section.id, focus]);

  const dayLabel = `اليوم ${formatNumber(profile.day)}`;
  const balanceLabel = `الرصيد ${formatMoney(profile.bankBalance, country)}`;
  const daySpeedMultiplier = profile.activeDaySpeedMultiplier ?? 1;
  const dayDurationMinutes = getGameDayDurationMinutes(daySpeedMultiplier);
  const compactPage = compactSectionIds.has(section.id);
  const run = (action: (current: PlayerProfile) => GameResult<unknown>) => onAction(action(profile));
  const runCommand = (command: GameCommand, fallback: (current: PlayerProfile) => GameResult<unknown>) => onCommand(command, fallback);

  const contextValue = useMemo<SectionPageContextValue>(() => ({
    compactPage,
    activePanelId,
    sectionId: section.id,
    onTogglePanel: (key: string) => setActivePanelId((current) => (current === key ? null : key)),
  }), [compactPage, activePanelId, section.id]);

  const pageShell = (children: ReactNode) => (
    <SectionPageContext.Provider value={contextValue}>
      <EconomyPageShell dayLabel={dayLabel} balanceLabel={balanceLabel} dayDurationMinutes={dayDurationMinutes} daySpeedMultiplier={daySpeedMultiplier} compact={compactPage}>
        {children}
      </EconomyPageShell>
    </SectionPageContext.Provider>
  );

  const heading = (
    <>
      <HubSubNav currentSection={section.id} profile={profile} onNavigate={onNavigate} />
      <div className="page-heading">
        <span className="heading-icon"><Icon name={section.icon} size={23} /></span>
        <div className="page-heading-copy"><span className="section-kicker">إدارة الإمبراطورية</span><h1>{section.label}</h1><p className="page-subtitle">{section.subtitle}</p></div>
        <button className="page-help-button" type="button" onClick={onShowGuide}><Icon name="target" size={15} /> شرح هذا القسم</button>
      </div>
    </>
  );

  const isUnlocked = isSectionUnlocked(profile, section.id);
  const requiredLevel = getSectionRequiredLevel(section.id);
  const unlockHint = getSectionUnlockHint(profile, section.id);

  if (!isUnlocked) {
    return (
      <div className="section-page">
        {heading}
        {pageShell(
          <div className="mx-auto my-6 max-w-xl rounded-3xl border border-amber-500/30 bg-gradient-to-b from-slate-900/95 via-slate-900/85 to-slate-950/95 p-6 md:p-8 text-center shadow-2xl backdrop-blur-xl">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10 border-2 border-amber-400/40 shadow-inner">
              <span className="text-4xl">🔒</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black tracking-wide border border-amber-500/40 mb-3">
              <span>🔒 يفتح في مستوى {formatNumber(requiredLevel)}</span>
            </div>

            <h2 className="text-2xl font-black text-white mb-2">
              نظام {section.label} مقفل حالياً
            </h2>

            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              وفقاً لسيناريو قصة إمبراطوريتك، يتطلب هذا النظام توسعاً أكبر وخبرة إدارية متقدمة لفتحه.
            </p>

            <div className="rounded-2xl bg-slate-800/80 border border-slate-700/60 p-4 text-right mb-6">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>مستواك الحالي:</span>
                <span className="font-bold text-amber-400">مستوى {formatNumber(playerProgress.level)} ({formatNumber(playerProgress.totalExperience)} XP)</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>المستوى المطلوب:</span>
                <span className="font-bold text-emerald-400">مستوى {formatNumber(requiredLevel)}</span>
              </div>
              <div className="border-t border-slate-700/60 pt-2 text-xs text-slate-300">
                <strong className="text-amber-300">متطلب القصة: </strong>
                {unlockHint}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => onNavigate('tasks')}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all"
              >
                <Icon name="tasks" size={16} />
                عرض مهام القصة ورفع المستوى
              </button>
              <button
                type="button"
                onClick={onHome}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all"
              >
                <Icon name="home" size={16} />
                العودة للرئيسية
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (section.id === 'obligations') {
    const obligations = selectObligations(profile, country.economy.operatingCostMultiplier ?? 1);
    const categoryLabels = { payable: 'متأخر', salary: 'راتب', loan: 'قسط قرض', operating: 'تشغيل' } as const;
    return <div className="section-page">{heading}{pageShell(
      <>
        {/* Story Legal Moratorium & Bankruptcy Protection Notice */}
        <div className="rounded-2xl bg-slate-900/90 border border-amber-500/40 p-4 sm:p-5 text-right mb-4 shadow-xl">
          <div className="flex items-center gap-2 text-amber-400 font-black text-sm sm:text-base mb-1.5">
            <Icon name="shield" size={20} />
            <span>إشعار الحماية القضائية ومهلة السماح للديون الموروثة</span>
          </div>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-2">
            وفقاً لسيناريو التأسيس في <strong>{country.name}</strong>، صدرت حماية قانونية للمنشأة الموروثة مع <strong>مهلة سماح لمدة 7 أيام</strong> على قرض <strong>{getCountryScenario(country.id).economicProfile.bankName}</strong> الموروث البالغ <strong>5,250 $</strong>. التسهيلات والقروض الجديدة تفتح عند بلوغ <strong>المستوى 4</strong> أو تسليم أول عقد رسمي.
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
              ✓ لا توجد غرامات تأخير خلال مهلة السماح
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
              ✓ السداد التلقائي يحل في اليوم 7 عند دوران أرباحك
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
              ✓ رصيد الرواتب 0 $ لعدم وجود عمالة مأجورة حالياً
            </span>
          </div>
        </div>

        <div className="economy-grid economy-grid--three-mobile"><EconomyStat label="إجمالي الاستحقاقات" value={formatMoney(obligations.totalDue, country)} /><EconomyStat label="متأخر عن السداد" value={formatMoney(obligations.overdueAmount, country)} /><EconomyStat label="الرواتب اليومية" value={formatMoney(obligations.dailyPayroll, country)} /></div>
        <SectionPanel id="obligations-list" title="خريطة الالتزامات والديون" description="تُسدد الأقساط والتشغيل عند ترحيل اليوم، كما يمكنك السداد المبكر الطوعي في أي لحظة عند توفر السيولة الكاش.">
          {obligations.rows.length === 0 ? <EconomyEmpty title="لا توجد التزامات مسجلة" message="ابدأ التشغيل أو التوظيف أو التمويل حتى تظهر المواعيد والتكاليف هنا." /> : (
            <div className="economy-list">
              {obligations.rows.map((row) => (
                <article className={`economy-card economy-card--soft${row.overdue ? ' obligation-card--overdue' : ''}`} key={row.id}>
                  <div className="economy-card-head">
                    <div className="economy-card-title">
                      <span>
                        <strong>{row.label}</strong>
                        <small>{categoryLabels[row.category]} · موعد السداد {row.overdue ? 'متأخر' : `اليوم ${formatNumber(row.dueDay)}`}</small>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`economy-pill ${row.overdue ? 'economy-pill--red' : 'economy-pill--gold'}`}>{formatMoney(row.amount, country)}</span>
                      {row.category === 'loan' && (
                        <button
                          type="button"
                          className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow transition"
                          data-guide-target="pay-obligation-btn"
                          onClick={() => runCommand({ name: 'repay_loan', args: { loanId: row.id, installments: 1 } }, (current) => repayLoan(current, row.id, 1))}
                        >
                          سداد قسط طوعي
                        </button>
                      )}
                      {row.category === 'salary' && (
                        <button
                          type="button"
                          className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow transition"
                          data-guide-target="pay-obligation-btn"
                          onClick={() => runCommand({ name: 'pay_staff_salary', args: { staffId: row.id } }, (current) => payStaffSalary(current, row.id))}
                        >
                          دفع الراتب الآن
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </SectionPanel>
      </>,
    )}</div>;
  }

  if (section.id === 'store') {
    return <div className="section-page store-page">{heading}{pageShell(
      <>
        <div className="store-hero"><div><span className="section-kicker">المتجر الماسي</span><h2>اشترِ الماس والمكافآت</h2><p>اختر باقتك، راجع السعر والمكافآت، ثم أرسل طلب الشحن للمراجعة.</p></div><Icon name="store" size={38} /></div>
        <SectionPanel title="باقات الماس" description="اختر الباقة المناسبة، راجع السعر والمكافآت، ثم أرسل طلب الشحن للمراجعة.">
          <DiamondStore profile={profile} isGuest={isGuest} onLinkAccount={onLinkAccount} onRefreshProfile={onRefreshProfile} onBack={onHome} onPurchaseSpeedCard={(kind) => runCommand({ name: 'buy_speed_card', args: { kind, quantity: 1, paymentMethod: 'diamonds' } }, (current) => buySpeedCard(current, kind, 1, 'diamonds'))} />
        </SectionPanel>
      </>,
    )}</div>;
  }

  if (section.id === 'bank') {
    return (
      <div className="section-page bank-page w-full min-w-0">
        {heading}
        <BankTerminal
          profile={profile}
          country={country}
          initialTab={bankTab}
          onCommand={runCommand}
        />
      </div>
    );
  }

  if (section.id === 'staff') {
    return (
      <div className="section-page staff-section-page">
        {heading}
        {pageShell(
          <StaffManagementView
            profile={profile}
            country={country}
            onCommand={runCommand}
            onOpenFinancialReports={() => onNavigate('reports')}
            onHome={onHome}
          />
        )}
      </div>
    );
  }

  if (section.id === 'auctions') {
    const catalogListings = selectAvailableAuctions(profile);
    const liveDistressedItems = generateLiveAuctions(profile);

    // Merge listings so any clicked dynamic item can open in AuctionRoom
    const dynamicConvertedListings: AuctionListing[] = liveDistressedItems.map((item) => ({
      id: item.id,
      countryId: profile.countryId,
      lotType: item.lotType,
      label: item.title,
      landType: item.landType || 'industrial',
      areaSquareMeters: item.areaSquareMeters || 3000,
      minimumBid: item.currentBid,
      bidIncrement: item.bidIncrement,
      closesAt: new Date(item.closesAtMs).toISOString(),
      status: 'open' as const,
      energyCapacityBonus: item.energyCapacityBonus,
      materialId: item.materialId,
      quantity: item.quantity,
    }));

    const allListings = [...catalogListings, ...dynamicConvertedListings];
    const selectedAuction = selectedAuctionId ? allListings.find((listing) => listing.id === selectedAuctionId) : undefined;
    
    // Filter listings based on auctionCategoryTab state
    const filteredCatalog = catalogListings.filter((listing) => {
      if (auctionCategoryTab === 'land') return listing.lotType === 'land';
      if (auctionCategoryTab === 'factory') return listing.lotType === 'factory';
      if (auctionCategoryTab === 'material') return listing.lotType === 'raw-material';
      return true;
    });

    const filteredLive = liveDistressedItems.filter((item) => {
      if (auctionCategoryTab === 'land') return item.lotType === 'land';
      if (auctionCategoryTab === 'factory') return item.lotType === 'factory';
      if (auctionCategoryTab === 'material') return item.lotType === 'raw-material';
      return true;
    });

    const myActiveAuctions = (profile.playerAuctions ?? []).filter((a) => a.status === 'active');
    const mySoldAuctions = (profile.playerAuctions ?? []).filter((a) => a.status === 'sold');
    const catalogWins = profile.auctionHistory.filter((b) => b.bidder === 'player');

    return (
      <div className="section-page auctions-view-page" dir="rtl">
        {heading}
        {/* Auctions Hero Banner with 'List Asset in Auction' Button */}
        <div className="auctions-hero-banner">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-3">
              <div className="auctions-hero-gavel">🔨</div>
              <div>
                <h1>سوق المزادات الحية الذكية</h1>
                <p>تنافس مع كبرى الصناديق والمستثمرين على الأصول النادرة · اطرح أصولك أو نافس على الفرص</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsListAssetModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 transition transform hover:scale-[1.02] flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Icon name="gavel" size={16} />
              <span>طرح أصل في المزاد 🏛️</span>
            </button>
          </div>
        </div>

        {/* Main Auction Navigation Tabs */}
        <div className="flex gap-2 p-1.5 bg-slate-950/90 rounded-2xl mb-4 border border-slate-800 text-xs sm:text-sm">
          <button
            type="button"
            onClick={() => setAuctionViewMode('market')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              auctionViewMode === 'market'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🏛️ مزادات السوق الحية</span>
          </button>
          <button
            type="button"
            onClick={() => setAuctionViewMode('my_listings')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              auctionViewMode === 'my_listings'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🔨 مزاداتي المعروضة</span>
            {myActiveAuctions.length > 0 && (
              <span className="bg-slate-950 text-amber-400 px-2 py-0.5 rounded-full text-[11px] font-mono font-black">
                {myActiveAuctions.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setAuctionViewMode('history')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              auctionViewMode === 'history'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>📜 سجل المبيعات والمزادات</span>
            {mySoldAuctions.length > 0 && (
              <span className="bg-slate-950 text-emerald-400 px-2 py-0.5 rounded-full text-[11px] font-mono font-black">
                {mySoldAuctions.length}
              </span>
            )}
          </button>
        </div>

        {/* VIEW 1: MARKET AUCTIONS */}
        {auctionViewMode === 'market' && (
          <>
            {/* Category Segment Tabs */}
            <div className="auctions-category-tabs" role="tablist">
              <button
                type="button"
                className={`auction-tab-btn ${auctionCategoryTab === 'all' ? 'is-active' : ''}`}
                onClick={() => setAuctionCategoryTab('all')}
              >
                الكل
              </button>
              <button
                type="button"
                className={`auction-tab-btn ${auctionCategoryTab === 'land' ? 'is-active' : ''}`}
                onClick={() => setAuctionCategoryTab('land')}
              >
                <Icon name="land" size={18} /> أراضي
              </button>
              <button
                type="button"
                className={`auction-tab-btn ${auctionCategoryTab === 'factory' ? 'is-active' : ''}`}
                onClick={() => setAuctionCategoryTab('factory')}
              >
                <Icon name="factory" size={18} /> مصانع
              </button>
              <button
                type="button"
                className={`auction-tab-btn ${auctionCategoryTab === 'material' ? 'is-active' : ''}`}
                onClick={() => setAuctionCategoryTab('material')}
              >
                <Icon name="warehouse" size={18} /> مواد خام
              </button>
            </div>

            {/* Fair Bidding Guarantee Banner */}
            <div className="auctions-fair-banner">
              <div className="fair-banner-icon">⚖️</div>
              <div className="fair-banner-text">
                <h3>مزايدة عادلة وشفافة بمشاركة 30 صندوق ومستثمر إقليمي</h3>
                <p>جميع الصفقات معتمدة قضائياً وبضمان تحصيل وتسجيل رسمي فوري للأصول.</p>
              </div>
              <div className="fair-banner-gavel">🔨</div>
            </div>

            {/* Auction Items Cards List */}
            <div className="auctions-items-list">
              {/* 1. Dynamic Live Distressed Auctions */}
              {filteredLive.map((item) => {
                const remainingMins = Math.max(1, Math.round((item.closesAtMs - Date.now()) / 60000));
                const hours = Math.floor(remainingMins / 60);
                const mins = remainingMins % 60;
                const timeLabel = hours > 0 ? `${hours}س ${mins}د` : `${mins}د`;

                return (
                  <article className="auction-item-card" key={item.id}>
                    {item.lotType === 'land' ? (
                      <ItemImage type="land" landType={item.landType || 'industrial'} name={item.title} size="md" className="auction-card-thumb-wrap" />
                    ) : item.lotType === 'factory' ? (
                      <ItemImage type="industry" id="electricity" name={item.title} size="md" className="auction-card-thumb-wrap" />
                    ) : (
                      <ItemImage type="material" id={item.materialId || 'steel'} name={item.title} size="md" className="auction-card-thumb-wrap" />
                    )}

                    <div className="auction-card-body">
                      <div className="auction-card-top">
                        <div>
                          <span className="inline-block text-[10px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30 mb-1">
                            جهة الطرح: {item.authority}
                          </span>
                          <h3>{item.title}</h3>
                        </div>
                        <span className="auction-location">📍 {item.location}</span>
                      </div>

                      <p className="auction-desc">{item.description}</p>

                      <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800 text-[11px] flex items-center justify-between mb-2">
                        <span className="text-slate-400">العرض المتصدر حالياً:</span>
                        <span className="font-bold text-slate-200">
                          {item.leadingInvestor.name} <span className="text-[10px] text-amber-400">({item.leadingInvestor.type})</span>
                        </span>
                      </div>

                      <div className="auction-card-footer">
                        <div className="auction-meta-info">
                          <div>
                            <small>العرض الحالي</small>
                            <strong className="text-emerald-400 font-mono">💰 {formatMoney(item.currentBid, country)}</strong>
                          </div>
                          <div>
                            <small>الوقت المتبقي</small>
                            <strong className="auction-time-text">⏰ {timeLabel}</strong>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="auction-enter-btn cursor-pointer"
                          onClick={() => setSelectedAuctionId(item.id)}
                        >
                          ادخل المزاد 🔨
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}

              {/* 2. Catalog Listings */}
              {filteredCatalog.map((listing) => {
                const material = MATERIAL_CATALOG.find((item) => item.id === listing.materialId);
                const closeAt = getAuctionCloseAt(profile, listing);
                const lotSummary = listing.lotType === 'land'
                  ? `${formatNumber(listing.areaSquareMeters)} م² · أرض ${landTypeNames[listing.landType]}`
                  : listing.lotType === 'factory'
                    ? `توسعة طاقة مصنع بمقدار ${formatNumber(listing.energyCapacityBonus ?? 0)} وحدة`
                    : `شحنة ${formatNumber(listing.quantity ?? 0)} ${material?.unit ?? 'وحدة'} من ${material?.name ?? 'مواد خام'}`;

                return (
                  <article className="auction-item-card" key={listing.id}>
                    <div className={`auction-card-thumb auction-thumb--${listing.lotType}`}>
                      <span className={`auction-tag-badge auction-tag--${listing.lotType}`}>
                        {listing.lotType === 'land' ? 'أراضي' : listing.lotType === 'factory' ? 'مصانع' : 'مواد خام'}
                      </span>
                    </div>
                    <div className="auction-card-body">
                      <div className="auction-card-top">
                        <div>
                          <span className="inline-block text-[10px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30 mb-1">
                            جهة الطرح: تصفية قضائية معلنة
                          </span>
                          <h3>{listing.label}</h3>
                        </div>
                        <span className="auction-location">📍 {listing.lotType === 'land' ? 'منطقة توسعة' : 'مركز لوجستي'}</span>
                      </div>
                      <p className="auction-desc">{lotSummary}</p>
                      <div className="auction-card-footer">
                        <div className="auction-meta-info">
                          <div>
                            <small>أقل مزايدة</small>
                            <strong>💰 {formatMoney(listing.minimumBid, country)}</strong>
                          </div>
                          <div>
                            <small>الوقت المتبقي</small>
                            <strong className="auction-time-text">⏰ {formatAuctionCountdown(closeAt)}</strong>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="auction-enter-btn cursor-pointer"
                          onClick={() => setSelectedAuctionId(listing.id)}
                        >
                          ادخل المزاد 🔨
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}

        {/* VIEW 2: MY LISTED AUCTIONS (ACTIVE) */}
        {auctionViewMode === 'my_listings' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏛️</span>
                <span>
                  أصولك المعروضة في المزاد العلني تظل نشطة ومستقلة حتى تتم ترسيتها أو إلغاؤها، ويُصرف ثمن البيع مرة واحدة فقط عند اكتمال البيع.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsListAssetModalOpen(true)}
                className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 cursor-pointer"
              >
                + طرح أصل جديد
              </button>
            </div>

            {myActiveAuctions.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
                <span className="text-4xl block">🔨</span>
                <h3 className="text-base font-bold text-white">لا توجد أصول معروضة في المزاد حالياً</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  يمكنك طرح أراضيك أو مصانعك في قاعة المزاد ليتنافس عليها المستثمرون والصناديق وتحقيق أعلى قيمة نقدية كاش.
                </p>
                <button
                  type="button"
                  onClick={() => setIsListAssetModalOpen(true)}
                  className="mt-2 py-2.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-lg"
                >
                  طرح أصل في المزاد الآن 🏛️
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myActiveAuctions.map((item) => (
                  <article key={item.id} className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-amber-500/40 shadow-xl space-y-4 relative">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <span className="inline-block text-[10px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30 mb-1">
                          مزاد جاري · {item.assetType === 'land' ? 'أرض استثمارية' : 'منشأة صناعية'}
                        </span>
                        <h3 className="text-base font-bold text-white">{item.assetName}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{item.assetSpecs}</p>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded-xl font-bold shrink-0">
                        متاح للمزايدة
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">القيمة التقديرية</span>
                        <strong className="text-slate-200">{formatMoney(item.originalValue, country)}</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">سعر البداية</span>
                        <strong className="text-slate-200">{formatMoney(item.startingBid, country)}</strong>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-gradient-to-r from-slate-950 via-amber-950/20 to-slate-950 border border-amber-500/30 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">أعلى عرض مسجل حالياً</span>
                        <strong className="text-base text-emerald-400 font-mono font-black">
                          {formatMoney(item.currentBid, country)}
                        </strong>
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] text-slate-400 block">المستثمر المتصدر</span>
                        <strong className="text-xs text-amber-300 font-bold">{item.leadingBidderName}</strong>
                        <small className="block text-[10px] text-slate-500">({item.leadingBidderType})</small>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const res = settlePlayerAssetAuction(profile, item.id);
                          if (res.ok) {
                            if (onProfileUpdate) onProfileUpdate(res.profile);
                            onAction(res);
                            playSound('cash');
                          }
                        }}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-xs shadow-md transition transform active:scale-95 cursor-pointer text-center"
                      >
                        اعتماد البيع واستلام {formatMoney(item.currentBid, country)} 💰
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const res = cancelPlayerAssetAuction(profile, item.id);
                          if (res.ok) {
                            if (onProfileUpdate) onProfileUpdate(res.profile);
                            onAction(res);
                            playSound('click');
                          }
                        }}
                        className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 font-bold text-xs transition border border-rose-900/40 cursor-pointer"
                        title="إلغاء المزاد واستعادة الأصل لمحفظتك"
                      >
                        إلغاء ↩️
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: SALES & AUCTION HISTORY */}
        {auctionViewMode === 'history' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 text-xs flex items-center justify-between">
              <div>
                <strong className="text-white block text-sm">سجل العمليات والمبيعات المغلقة</strong>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  جميع الصفقات المباعة أو المشتراة بالمزاد موثقة نهائياً ولا يمكن إعادة صرف أرباحها.
                </p>
              </div>
              <div className="text-left font-mono">
                <span className="text-[10px] text-slate-400 block">إجمالي المبيعات المكتملة</span>
                <strong className="text-emerald-400 text-sm">{mySoldAuctions.length} صفقات</strong>
              </div>
            </div>

            {mySoldAuctions.length === 0 && catalogWins.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-3xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs">
                لا توجد مبيعات أو صفقات سابقة مسجلة في السجل بعد.
              </div>
            ) : (
              <div className="space-y-3">
                {mySoldAuctions.map((item) => (
                  <article key={item.id} className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold text-sm">✓</span>
                        <strong className="text-white text-sm">{item.assetName}</strong>
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full font-mono">
                          تم البيع واستلام المبلغ
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        المشتري: <span className="text-amber-300 font-bold">{item.winningBidderName || item.leadingBidderName}</span> · التاريخ: {item.soldAt ? new Date(item.soldAt).toLocaleDateString('ar-EG') : 'اليوم'}
                      </p>
                      <small className="text-[10px] text-slate-500 block mt-0.5">
                        معاملة مغلقة نهائياً برقم ID: {item.id}
                      </small>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block">قيمة البيع المحصّلة</span>
                      <strong className="text-base text-emerald-400 font-mono font-black">
                        +{formatMoney(item.finalSalePrice || item.currentBid, country)}
                      </strong>
                      {(item.profitDifference ?? 0) > 0 && (
                        <span className="block text-[10px] text-emerald-300 font-bold">
                          فارق ربح +{formatMoney(item.profitDifference ?? 0, country)} (+{item.profitPercent ?? 0}%)
                        </span>
                      )}
                    </div>
                  </article>
                ))}

                {catalogWins.map((win) => (
                  <article key={win.id} className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <strong className="text-slate-200">صفقة شراء بالمزاد (ترسية)</strong>
                      <p className="text-[11px] text-slate-400 mt-0.5">معرّف المزاد: {win.listingId}</p>
                    </div>
                    <div className="text-left font-mono">
                      <span className="text-[10px] text-slate-400 block">المبلغ المدفوع</span>
                      <strong className="text-slate-300">-{formatMoney(win.amount, country)}</strong>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Live Bidding Modal Room */}
        {selectedAuction && (
          <AuctionRoom
            profile={profile}
            country={country}
            listing={selectedAuction}
            initialBid={Number(bidAmounts[selectedAuction.id]) || undefined}
            onClose={() => setSelectedAuctionId(null)}
            onBid={(amount, targetCompanyId) => {
              // Check if it's dynamic auction or catalog
              const dynamicItem = liveDistressedItems.find((x) => x.id === selectedAuction.id);
              if (dynamicItem) {
                if (profile.bankBalance < amount) {
                  return { ok: false, reason: 'insufficient-funds', message: 'السيولة غير كافية لإتمام الشراء', profile };
                }

                let updatedProfile = { ...profile, bankBalance: profile.bankBalance - amount };
                if (dynamicItem.lotType === 'land') {
                  const newLand = {
                    id: `won-land-${Date.now()}`,
                    label: dynamicItem.title,
                    areaSquareMeters: dynamicItem.areaSquareMeters || 3000,
                    purchasePrice: amount,
                    acquiredAt: new Date().toISOString(),
                    acquiredOnDay: profile.day,
                    availableForCompanyOnDay: profile.day + 1,
                    landType: dynamicItem.landType || 'industrial',
                  };
                  updatedProfile.lands = [...updatedProfile.lands, newLand];
                } else if (dynamicItem.lotType === 'factory' && targetCompanyId) {
                  updatedProfile.companies = updatedProfile.companies.map((c) =>
                    c.id === targetCompanyId
                      ? { ...c, energyCapacity: (c.energyCapacity ?? 100) + (dynamicItem.energyCapacityBonus ?? 100) }
                      : c,
                  );
                }

                if (onProfileUpdate) onProfileUpdate(updatedProfile);
                playSound('auction');
                setSelectedAuctionId(null);
                return { ok: true, data: null, message: `مبروك! تم الفوز بالمزاد وترسية [${dynamicItem.title}] لصالحك.`, profile: updatedProfile };
              }

              const result = placeBid(profile, selectedAuction.id, amount, targetCompanyId);
              if (result.ok) {
                playSound('auction');
                setSelectedAuctionId(null);
              } else {
                playSound('error');
              }
              onAction(result);
              return result;
            }}
          />
        )}

        {/* Player List Asset in Auction Modal */}
        <ListAssetAuctionModal
          profile={profile}
          country={country}
          isOpen={isListAssetModalOpen}
          onClose={() => setIsListAssetModalOpen(false)}
          onAssetSold={(updatedProfile, message) => {
            if (onProfileUpdate) {
              onProfileUpdate(updatedProfile);
            }
            onAction({ ok: true, data: null, message, profile: updatedProfile });
          }}
        />
      </div>
    );
  }

  if (section.id === 'lands') {
    const usedLandIds = new Set(profile.companies.map((company) => company.landId).filter(Boolean));
    const totalLandValue = profile.lands.reduce((sum, land) => sum + land.purchasePrice, 0);
    const starterOfferVisible = !profile.lands.some((land) => land.id === 'starter-village-land') && profile.lands.length <= 1;
    const directLandOffers = getDirectLandsForCountry(country.id).filter((listing) => !profile.lands.some((land) => land.id === listing.id));
    const starterListing = getDirectLandsForCountry(country.id).find((listing) => listing.id === 'starter-village-land') || getDirectLandsForCountry(country.id)[0];
    const matchesLandType = (landType?: 'industrial' | 'agricultural' | 'commercial') => landTypeFilter === 'all' || landType === landTypeFilter;
    const sortLands = <T extends { landType?: 'industrial' | 'agricultural' | 'commercial'; price?: number; purchasePrice?: number; areaSquareMeters: number }>(items: T[]) => items.slice().sort((left, right) => landSort === 'area' ? right.areaSquareMeters - left.areaSquareMeters : landSort === 'type' ? String(left.landType).localeCompare(String(right.landType)) : (right.price ?? right.purchasePrice ?? 0) - (left.price ?? left.purchasePrice ?? 0));
    const visibleDirectLandOffers = sortLands(directLandOffers.filter((listing) => matchesLandType(listing.landType)));
    const visibleOwnedLands = sortLands(profile.lands.filter((land) => matchesLandType(land.landType)));
    return <div className="section-page">{heading}{pageShell(
      <>
        <div className="economy-grid economy-grid--three-mobile"><EconomyStat label="قطع الأراضي" value={formatNumber(profile.lands.length)} /><EconomyStat label="أراضٍ مرتبطة بشركات" value={formatNumber(usedLandIds.size)} /><EconomyStat label="القيمة الدفترية" value={formatMoney(totalLandValue, country)} /></div>
        <div className="land-view-tabs" role="tablist" aria-label="أقسام الأراضي"><button className={landView === 'owned' ? 'is-active' : ''} type="button" role="tab" aria-selected={landView === 'owned'} onClick={() => setLandView('owned')}><Icon name="land" size={16} /> أراضي الإمبراطورية</button><button className={landView === 'offers' ? 'is-active' : ''} type="button" role="tab" data-guide-tab="lands-offers-tab" aria-selected={landView === 'offers'} onClick={() => setLandView('offers')}><Icon name="store" size={16} /> العروض المباشرة</button></div>
        {landView === 'offers' ? <>
          {starterOfferVisible && starterListing && (
            <SectionPanel id="lands-starter-offer" title={`عرض البداية · ${starterListing.label}`} description={`عرض مضمون للتأسيس المباشر ومناسب لرأس مالك الأولي في ${country.name}.`}><article className="economy-card starter-land-offer"><div className="economy-card-head"><div className="economy-card-title"><span className="economy-card-icon"><Icon name="land" size={21} /></span><span><strong>{starterListing.label}</strong><small>{formatNumber(starterListing.areaSquareMeters)} م² · عرض التأسيس في {country.name}</small></span></div><span className="economy-price">{formatMoney(starterListing.price, country)}</span></div><div className="economy-card-body"><p className="economy-card-description">«أرض استثمارية مؤهلة وجاهزة لإطلاق توسعات إمبراطوريتك.»</p><div className="economy-meta"><span className="economy-pill economy-pill--gold">لا مزاد</span><span className="economy-pill economy-pill--green">عرض مضمون</span><span>سعر التأسيس</span></div><PurchaseOptions country={country} cashPrice={starterListing.price} bankBalance={profile.bankBalance} diamondsBalance={profile.diamonds} cashLabel="شراء الأرض نقدًا" guideTarget="buy-land-btn" onPurchase={(paymentMethod) => runCommand({ name: 'buy_direct_land', args: { listingId: starterListing.id, paymentMethod } }, (current) => buyDirectLand(current, starterListing.id, paymentMethod))} /></div></article></SectionPanel>
          )}
          <SectionPanel id="lands-direct-offers" title={`أراضٍ معروضة مباشرة في ${country.name}`} description="اشترِ أرضًا فورًا في مواقع حقيقية دون انتظار مزاد، ثم اترك يومًا داخل اللعبة حتى تكتمل إجراءات نقل الملكية."><div className="land-filter-bar" role="group" aria-label="فلترة وترتيب الأراضي"><label>النوع<select value={landTypeFilter} onChange={(event) => setLandTypeFilter(event.target.value as typeof landTypeFilter)}><option value="all">كل الأنواع</option><option value="industrial">صناعية</option><option value="agricultural">زراعية</option><option value="commercial">تجارية</option></select></label><label>الترتيب<select value={landSort} onChange={(event) => setLandSort(event.target.value as typeof landSort)}><option value="price">السعر: الأعلى أولًا</option><option value="area">المساحة: الأكبر أولًا</option><option value="type">النوع أبجديًا</option></select></label></div><div className="economy-list">{visibleDirectLandOffers.filter((listing) => listing.id !== 'starter-village-land').map((listing, offerIdx) => (
            <article className="economy-card economy-card--soft" key={listing.id}><div className="economy-card-head"><div className="economy-card-title"><span className="economy-card-icon"><Icon name="land" size={18} /></span><span><strong>{listing.label}</strong><small>{formatNumber(listing.areaSquareMeters)} م² · أرض {landTypeNames[listing.landType]}</small></span></div><span className="economy-price">{formatMoney(listing.price, country)}</span></div><PurchaseOptions country={country} cashPrice={listing.price} bankBalance={profile.bankBalance} diamondsBalance={profile.diamonds} guideTarget={!starterOfferVisible && offerIdx === 0 ? 'buy-land-btn' : undefined} onPurchase={(paymentMethod) => runCommand({ name: 'buy_direct_land', args: { listingId: listing.id, paymentMethod } }, (current) => buyDirectLand(current, listing.id, paymentMethod))} /></article>
          ))}{visibleDirectLandOffers.filter((listing) => listing.id !== 'starter-village-land').length === 0 && <EconomyEmpty title="لا توجد عروض إضافية" message="استكشف صفحة المزادات لمواقع جديدة أو عد بعد تقدمك في القصة." />}</div><button className="button button-secondary" type="button" onClick={() => onNavigate('auctions')}><Icon name="gavel" size={16} /> استكشاف المزادات والمزيد من الفرص</button></SectionPanel>
        </> : <>
          {starterOfferVisible && starterListing && <SectionPanel id="lands-starter-step" title="خطوة البداية" description={`ابدأ بالعرض المضمون في ${starterListing.label}؛ لن تحتاج إلى دخول المزاد في هذه المرحلة.`}><div className="economy-notice economy-notice--success"><Icon name="target" size={16} />افتح تبويب «العروض المباشرة» لقبول عرض الأرض والبدء.</div><button className="button button-primary" type="button" data-guide-target="open-starter-land-btn" onClick={() => setLandView('offers')}>فتح عرض البداية</button></SectionPanel>}
          <SectionPanel id="lands-owned" title="أراضي الإمبراطورية" description="اضغط على أي أرض لرؤية حالتها، الشركة المرتبطة بها، وخيار تطويرها.">{profile.lands.length === 0 ? <EconomyEmpty title="لا توجد أراضٍ مملوكة بعد" message="افتح عرض البداية من تبويب العروض المباشرة، أو استكشف المزادات بعد فتحها." /> : <div className="economy-list">{visibleOwnedLands.map((land) => { const owner = profile.companies.find((company) => company.landId === land.id); const isExpanded = expandedLandId === land.id; const available = (land.availableForCompanyOnDay ?? land.acquiredOnDay ?? 1) <= profile.day; return <article className={`economy-card asset-detail-card${isExpanded ? ' asset-detail-card--expanded' : ''}`} key={land.id}><button className="asset-detail-trigger" type="button" aria-expanded={isExpanded} onClick={() => setExpandedLandId(isExpanded ? null : land.id)}><span className="economy-card-title"><span className="economy-card-icon"><Icon name={owner ? 'factory' : 'land'} size={19} /></span><span><strong>{land.label}</strong><small>{formatNumber(land.areaSquareMeters)} م² · {land.landType ? landTypeNames[land.landType] : 'نوع عام'} · مستوى {formatNumber(land.upgradeLevel ?? 1)}</small></span></span><span className={`economy-pill ${owner ? 'economy-pill--green' : 'economy-pill--gold'}`}>{owner ? `تشغلها ${owner.name}` : landTransferStatus(land, profile.day)}</span></button>{isExpanded && <div className="asset-detail-body"><div className="economy-meta"><span>سعر الشراء {formatMoney(land.purchasePrice, country)}</span><span>تاريخ التسجيل {new Date(land.acquiredAt).toLocaleDateString('ar-EG')}</span><span>الحالة {owner ? 'مرتبطة بشركة' : landTransferStatus(land, profile.day)}</span></div>{owner ? <div className="asset-detail-summary"><Icon name="factory" size={17} /><span>تدعم هذه الأرض شركة <strong>{owner.name}</strong> في قطاع {INDUSTRY_CATALOG.find((item) => item.id === owner.industryId)?.name ?? owner.industryId}.</span></div> : <><p className="economy-card-description">هذه الأرض {available ? 'جاهزة الآن لتأسيس شركة من القطاع المناسب.' : 'ما زالت قيد نقل الملكية، وستصبح متاحة بعد اكتمال الإجراءات.'}</p>{available && <button className="button button-primary" type="button" onClick={() => onNavigate('companies')}>تأسيس شركة على هذه الأرض</button>}</>}{(land.upgradeLevel ?? 1) >= 5 ? <p className="economy-meta">الأرض في أعلى مستوى تطوير.</p> : <PurchaseOptions country={country} cashPrice={Math.round(2_500 * Math.pow(1.5, (land.upgradeLevel ?? 1) - 1))} bankBalance={profile.bankBalance} diamondsBalance={profile.diamonds} cashLabel="تطوير الأرض · نقدًا" onPurchase={(paymentMethod) => runCommand({ name: 'upgrade_land', args: { landId: land.id, paymentMethod } }, (current) => upgradeLand(current, land.id, paymentMethod))} />}</div>}</article>; })}</div>}</SectionPanel>
        </>}
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
          <SectionPanel id="companies-found" title="تأسيس شركة" description="اختر قطاعًا، واسمًا، وأرضًا مناسبة. تُخصم رسوم التأسيس والترخيص عند نجاح العملية.">
            {profile.lands.length === 0 ? <div className="economy-list"><EconomyEmpty title="تحتاج إلى أرض أولًا" message="اشترِ أرضًا من المزادات؛ بعدها يمكنك تأسيس شركة وتشغيل مصنعها." /><button className="button button-primary" type="button" onClick={onHome}>عرض ملخص الإمبراطورية</button></div> : <div className="economy-form">
              <div className="economy-field">
                <label htmlFor="industry-select">القطاع الاقتصادي (اختر النشاط المناسب لرأس مالك)</label>
                <select id="industry-select" value={industry.id} onChange={(event) => setIndustryId(event.target.value as IndustryId)}>
                  {INDUSTRY_CATALOG.map((item) => {
                    const totalFee = (country.economy.companySetupFee ?? item.setupFee) + (country.economy.licenseFeesByIndustry[item.id] ?? item.licenseFee);
                    const isBeginner = item.id === 'food' || item.id === 'detergents';
                    const isHeavy = item.id === 'petroleum' || item.id === 'electricity' || item.id === 'gas';
                    const tag = isBeginner ? ' ⭐ [موصى به للمبتدئين]' : isHeavy ? ' ⚠️ [مكلف ورأس مال عالٍ]' : '';
                    return (
                      <option value={item.id} key={item.id}>
                        {item.name} {tag} · {formatMoney(totalFee, country)}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              {/* Early-game strategy tip */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 space-y-1 my-2">
                <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <span>💡</span>
                  <span>نصيحة المستشار الاقتصادي:</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {industry.id === 'food' || industry.id === 'detergents' 
                    ? 'قطاع ممتاز كبداية! تكاليف ترخيصه منخفضة وتدوير خاماته سريع، مما يتيح لك تحقيق أرباح سريعة وآمنة لحماية رأس مالك.'
                    : industry.id === 'petroleum' || industry.id === 'electricity' || industry.id === 'gas'
                    ? 'تحذير: هذا قطاع عملاق يستهلك مبالغ كبيرة في التراخيص والتشغيل اليومي. يُنصح بتأسيسه بعد جمع ثروة لا تقل عن 250,000 $.'
                    : 'قطاع صناعي واستثماري متوازن يتطلب متابعة دورية لسوق الخامات ومخزون المستودع.'}
                </p>
              </div>

              <div className="economy-field"><label htmlFor="company-name">اسم الشركة</label><input id="company-name" value={companyName} maxLength={36} onChange={(event) => setCompanyName(event.target.value)} /></div>
              <div className="economy-field"><label htmlFor="land-select">الأرض المناسبة ({landTypeNames[industry.requiredLandType]})</label><select id="land-select" value={selectedLandId} onChange={(event) => setLandId(event.target.value)} disabled={eligibleLands.length === 0}><option value="">اختر أرضًا</option>{eligibleLands.map((land) => <option key={land.id} value={land.id}>{land.label} · {formatNumber(land.areaSquareMeters)} م²</option>)}</select></div>
              <div className="economy-meta"><span>رسوم تأسيس {formatMoney(setupFee, country)}</span><span>ترخيص {formatMoney(licenseFee, country)}</span><span>تشغيل يومي {formatMoney(industry.dailyOperatingCost, country)}</span></div>
              {eligibleLands.length === 0 && <div className="economy-alert"><Icon name="shield" size={16} />{pendingLandCount > 0 ? `توجد ${formatNumber(pendingLandCount)} أرض قيد إنهاء عقود نقل الملكية؛ ستكون متاحة بعد يوم داخل اللعبة.` : `لا تملك أرضًا من النوع المناسب لهذا النشاط؛ اشترِ موقعًا ${landTypeNames[industry.requiredLandType]}.`}</div>}
              <PurchaseOptions country={country} cashPrice={setupFee + licenseFee} bankBalance={profile.bankBalance} diamondsBalance={profile.diamonds} disabled={!selectedLandId || companyName.trim().length < 1} cashLabel="تأسيس الشركة نقدًا" onPurchase={(paymentMethod) => runCommand({ name: 'found_company', args: { industryId: industry.id, landId: selectedLandId, name: companyName, paymentMethod } }, (current) => foundCompany(current, industry.id, selectedLandId, companyName, paymentMethod))} />
            </div>}
          </SectionPanel>
          <SectionPanel id="companies-existing" title="شركاتك القائمة" description="الطاقة والمصروفات تتحدث مع تقدم الأيام.">
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
              return <article className={`economy-card asset-detail-card${isExpanded ? ' asset-detail-card--expanded' : ''}`} key={company.id}><button className="asset-detail-trigger" type="button" aria-expanded={isExpanded} onClick={() => setExpandedCompanyId(isExpanded ? null : company.id)}><span className="economy-card-title"><span className="economy-card-icon"><Icon name="factory" size={19} /></span><span><strong>{company.name}</strong><small>{definition?.name ?? company.industryId} · {land?.label ?? 'دون أرض مسجلة'}</small></span></span><span className="economy-pill economy-pill--green">مستوى {formatNumber(level)}</span></button><div className="economy-card-body"><div className="economy-meta"><span>طاقة {formatNumber(company.energyUnits ?? 0)} / {formatNumber(company.energyCapacity ?? definition?.energyCapacity ?? 0)}</span><span>تشغيل يومي {formatMoney(company.operatingCostPerDay ?? 0, country)}</span><span>الإنتاج {formatNumber(completedBatches)} / {formatNumber(requiredBatches)} دفعات</span></div><div className="economy-progress"><span style={{ width: `${Math.min(100, 100 * (company.energyUnits ?? 0) / Math.max(1, company.energyCapacity ?? 1))}%` }} /></div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 my-2">
                    <span className="text-amber-400 font-bold text-xs">كفاءة الماكينات: {formatNumber(company.maintenanceCondition ?? 100)}%</span>
                    <button
                      className="button button-secondary text-xs py-1 px-3"
                      type="button"
                      data-guide-target="service-company-btn"
                      onClick={() => {
                        playSound('maintenance');
                        runCommand({ name: 'service_company', args: { companyId: company.id } }, (current) => serviceCompany(current, company.id));
                      }}
                      disabled={profile.bankBalance < Math.max(5_000, Math.round((company.operatingCostPerDay ?? 0) * 0.4)) || (company.maintenanceCondition ?? 100) >= 100}
                    >
                      صيانة المصنع ⚙️
                    </button>
                  </div>{isExpanded && <div className="asset-detail-body"><div className="asset-detail-grid"><div><strong>{formatNumber(staff.length)}</strong><small>موظفون نشطون</small></div><div><strong>{formatNumber(activeOrders.length)}</strong><small>أوامر إنتاج نشطة</small></div><div><strong>{formatNumber(completedOutput)}</strong><small>وحدة مكتملة</small></div><div><strong>{formatNumber(company.maintenanceCondition ?? 100)}%</strong><small>حالة المصنع</small></div></div><div className="company-report-strip"><span>تكلفة الإنتاج <b>{formatMoney(companyReport.productionCost, country)}</b></span><span>رواتب يومية <b>{formatMoney(companyReport.payroll, country)}</b></span><span>تكلفة يومية <b>{formatMoney(companyReport.dailyOperatingCost + companyReport.payroll, country)}</b></span><span>جودة متوسطة <b>{formatNumber(Math.round(companyReport.quality))}%</b></span></div><div className="economy-meta"><span>الأرض: {land?.label ?? 'غير مسجلة'}</span><span>القطاع: {definition?.name ?? company.industryId}</span><span>التطوير التالي {level < 5 ? formatMoney(upgradeCost, country) : 'مكتمل'}</span></div>{activeOrders.length > 0 && <div className="asset-detail-list">{activeOrders.slice(0, 3).map((order) => <span key={order.id}><Icon name="play" size={13} />{order.productName} · {formatNumber(order.outputQuantity)} وحدة · يوم {formatNumber(order.completesOnDay)}</span>)}</div>}</div>}{level >= 5 ? <p className="economy-meta">وصلت الشركة إلى أعلى مستوى.</p> : completedBatches < requiredBatches ? <p className="economy-meta">أكمل {formatNumber(requiredBatches - completedBatches)} دفعات إنتاج قبل التطوير.</p> : <PurchaseOptions country={country} cashPrice={upgradeCost} bankBalance={profile.bankBalance} diamondsBalance={profile.diamonds} disabled={!canUpgrade} cashLabel="تطوير الشركة نقدًا" onPurchase={(paymentMethod) => runCommand({ name: 'upgrade_company', args: { companyId: company.id, paymentMethod } }, (current) => upgradeCompany(current, company.id, paymentMethod))} />}</div></article>;
            })}</div>}
          </SectionPanel>
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
    const missingInputs = recipe ? recipe.inputs.map((input) => {
      const lot = profile.inventory.find((item) => item.materialOrProductId === input.materialId);
      const needed = input.quantity * selectedBatches;
      const owned = lot?.quantity ?? 0;
      const missing = Math.max(0, needed - owned);
      const material = MATERIAL_CATALOG.find((item) => item.id === input.materialId);
      const unitPrice = material?.pricePerUnit ?? 0;
      const cost = missing * unitPrice;
      return { ...input, material, owned, needed, missing, cost };
    }) : [];
    const totalMissingCost = missingInputs.reduce((sum, item) => sum + item.cost, 0);
    const hasMissingInputs = missingInputs.some((item) => item.missing > 0);
    const energyCost = recipe ? selectedBatches * recipe.energyCost : 0;
    const maintenanceCost = selectedCompany ? Math.round((selectedCompany.operatingCostPerDay ?? 0) * 0.15 * getOperatingCostProgression(profile.day)) : 0;
    const totalFundsForAutoSupply = totalMissingCost + energyCost + maintenanceCost;
    const canAffordAutoSupply = profile.bankBalance >= totalFundsForAutoSupply;
    const visibleProductionOrders = profile.productionOrders.filter((order) => {
      if (!showProductionHistory && order.status !== 'active') return false;
      return productionStatusFilter === 'all' || order.status === productionStatusFilter;
    }).slice().reverse();
    const hiddenProductionHistoryCount = profile.productionOrders.filter((order) => order.status !== 'active').length;
    const activeProductionCount = profile.productionOrders.filter((order) => order.status === 'active').length;
    const completedProductionCount = profile.productionOrders.filter((order) => order.status === 'completed').length;
    const totalEnergy = profile.companies.reduce((sum, company) => sum + (company.energyUnits ?? 0), 0);
    const totalEnergyCapacity = profile.companies.reduce((sum, company) => sum + (company.energyCapacity ?? 0), 0);
    return <div className="section-page">{heading}{pageShell(
      <>
        <div className="economy-grid economy-grid--four-mobile production-overview"><EconomyStat label="المصانع" value={formatNumber(profile.companies.length)} /><EconomyStat label="أوامر نشطة" value={formatNumber(activeProductionCount)} /><EconomyStat label="أوامر مكتملة" value={formatNumber(completedProductionCount)} /><EconomyStat label="الطاقة المتاحة" value={`${formatNumber(totalEnergy)} / ${formatNumber(totalEnergyCapacity)}`} /></div>
        <SectionPanel
          id="production-lines"
          title="خطوط الإنتاج"
          icon="factory"
          badge={<span className="economy-pill economy-pill--green">🟢 {formatNumber(profile.companies.length)} مصنع نشط</span>}
          description="ابدأ أمرًا يحجز المواد والطاقة، ثم يستلم المنتج عند اكتماله في يوم لاحق."
        >
          {profile.companies.length === 0 ? <EconomyEmpty title="لا توجد مصانع عاملة" message="أسس شركة أولًا؛ يتضمن ترخيصها خط إنتاج للقطاع الذي اخترته." /> : <div className="economy-layout">
            {companyTransferPending && <div className="economy-alert"><Icon name="clock" size={16} /> يجري إنهاء عقود نقل الملكية؛ يبدأ تشغيل هذه الشركة في اليوم {formatNumber(selectedCompany?.operationalFromDay ?? profile.day)}.</div>}
            <form className="economy-form" onSubmit={(event: FormEvent<HTMLFormElement>) => { 
              event.preventDefault(); 
              if (selectedCompany) {
                playSound('factory');
                runCommand({ name: 'run_production', args: { companyId: selectedCompany.id, batches: Number(productionBatches) } }, (current) => runProduction(current, selectedCompany.id, Number(productionBatches))); 
              }
            }}>
              <div className="economy-field"><label htmlFor="factory-select">الشركة / المصنع</label><select id="factory-select" value={selectedCompany?.id ?? ''} onChange={(event) => setCompanyId(event.target.value)}>{profile.companies.map((company) => <option key={company.id} value={company.id}>{company.name} · {INDUSTRY_CATALOG.find((item) => item.id === company.industryId)?.name}</option>)}</select></div>
              <div className="economy-field"><label htmlFor="production-batches">دفعات الإنتاج</label><input id="production-batches" type="number" min="1" max="100" step="1" value={productionBatches} onChange={(event) => setProductionBatches(event.target.value)} /></div>
              
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <button className="button button-primary flex-1" type="submit" data-guide-target="start-production-btn" disabled={!recipe || companyTransferPending || hasMissingInputs}>
                  <Icon name="play" size={16} /> بدء أمر الإنتاج
                </button>
              </div>

              {hasMissingInputs && (
                <div className="mt-3 p-3.5 rounded-xl border border-amber-500/30 bg-amber-950/20 text-right space-y-2.5">
                  <div className="flex items-center justify-between text-amber-300 font-bold text-xs sm:text-sm">
                    <span className="flex items-center gap-1.5">
                      <span>⚠️</span>
                      <span>تنقصك بعض الخامات لتشغيل {formatNumber(selectedBatches)} دفعات:</span>
                    </span>
                    <span className="text-emerald-400 font-mono text-xs">{formatMoney(totalMissingCost, country)}</span>
                  </div>
                  <div className="text-xs space-y-1">
                    {missingInputs.filter((item) => item.missing > 0).map((item) => (
                      <div key={item.materialId} className="flex justify-between items-center bg-black/30 px-2.5 py-1 rounded-lg border border-white/5">
                        <span className="text-slate-300">{item.material?.name}: متوفر {formatNumber(item.owned)} / مطلوب {formatNumber(item.needed)} (ينقص <strong>{formatNumber(item.missing)}</strong> {item.material?.unit})</span>
                        <span className="font-semibold text-emerald-400">+{formatMoney(item.cost, country)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-1 flex flex-col sm:flex-row gap-2 items-center justify-between">
                    <div className="text-[11px] text-slate-400">
                      إجمالي تكلفة الشراء المباشر: <strong className="text-emerald-400 font-bold">{formatMoney(totalMissingCost, country)}</strong>
                    </div>
                    <button
                      type="button"
                      data-guide-target="auto-supply-produce-btn"
                      className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-white text-xs font-bold rounded-lg shadow-md transition flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!canAffordAutoSupply || companyTransferPending || !recipe || !selectedCompany}
                      onClick={() => {
                        if (selectedCompany) {
                          playSound('factory');
                          runCommand(
                            { name: 'auto_supply_and_produce', args: { companyId: selectedCompany.id, batches: selectedBatches } },
                            (current) => autoSupplyAndProduce(current, selectedCompany.id, selectedBatches)
                          );
                        }
                      }}
                    >
                      <Icon name="lightning" size={15} />
                      <span>شراء الخامات فوراً والتشغيل ({formatMoney(totalMissingCost, country)})</span>
                    </button>
                  </div>
                  {!canAffordAutoSupply && (
                    <p className="text-[11px] text-rose-400">رصيدك البنكي لا يكفي لشراء الخامات وتكاليف التشغيل (مطلوب {formatMoney(totalFundsForAutoSupply, country)}).</p>
                  )}
                </div>
              )}
            </form>
            {recipe && selectedCompany ? <div className="economy-card economy-card--soft"><div className="economy-card-head"><div className="economy-card-title"><span className="economy-card-icon icon-production-amber"><Icon name="factory" size={18} /></span><span><strong>{recipe.productName}</strong><small>{formatNumber(estimatedOutput)} {recipe.outputUnit} متوقعة · {formatNumber(estimatedDuration)} يوم</small></span></div><span className="economy-pill economy-pill--gold">{formatNumber(selectedCompany.energyUnits ?? 0)} طاقة</span></div><div className="economy-card-body"><p className="economy-card-description">متطلبات الدفعة: {recipe.inputs.map((input) => `${input.quantity} ${MATERIAL_CATALOG.find((material) => material.id === input.materialId)?.unit ?? ''} ${MATERIAL_CATALOG.find((material) => material.id === input.materialId)?.name ?? input.materialId}`).join('، ')}. هذه معاينة قبل حجز السيولة والمخزون.</p><div className="economy-meta">{recipe.inputs.map((input) => { const material = MATERIAL_CATALOG.find((item) => item.id === input.materialId); const lot = profile.inventory.find((item) => item.materialOrProductId === input.materialId); return <span key={input.materialId}>{material?.name}: {formatNumber(lot?.quantity ?? 0)} / {input.quantity} لكل دفعة</span>; })}</div><div className="economy-meta"><span>تكلفة الوحدة المتوقعة {formatMoney(estimatedUnitCost, country)}</span><span>الإيراد المتوقع {formatMoney(Math.round(estimatedOutput * (marketForecast?.currentPrice ?? 0)), country)}</span><span>السيولة بعد الحجز تقريبًا {formatMoney(Math.max(0, profile.bankBalance - selectedBatches * recipe.energyCost), country)}</span><span>الطلب المتوقع عند التسليم {formatNumber(marketForecast?.demandUnits ?? 0)} {recipe.outputUnit}</span><span>الجودة {formatNumber(Math.max(70, Math.min(100, 86 + (hasManager ? 10 : 0) - ((selectedCompany.maintenanceCondition ?? 100) < 60 ? 10 : 0))))}%</span></div></div></div> : <EconomyEmpty title="لا توجد وصفة متاحة" message="لا تتوفر وصفة إنتاج لهذا القطاع حاليًا." />}
          </div>}
        </SectionPanel>
        <SectionPanel
          id="production-queue"
          title="طابور الإنتاج"
          icon="conveyor"
          badge={<span className={`economy-pill ${activeProductionCount > 0 ? 'economy-pill--cyan' : ''}`}>{activeProductionCount > 0 ? `⚙️ ${formatNumber(activeProductionCount)} أمر نشط` : '⚪ الطابور فارغ'}</span>}
          description="المواد والطاقة المحجوزة لا تعود للمخزن حتى يكتمل الأمر أو يُلغى في مرحلة لاحقة."
        >
          <div className="production-filters" role="group" aria-label="فلترة أوامر الإنتاج">{([['all', 'الكل'], ['active', 'نشطة'], ['completed', 'مكتملة'], ['cancelled', 'ملغاة']] as const).map(([value, label]) => <button key={value} className={productionStatusFilter === value ? 'is-selected' : ''} type="button" onClick={() => { setProductionStatusFilter(value); if (value !== 'active') setShowProductionHistory(true); }}>{label}</button>)}</div>
          {visibleProductionOrders.length === 0 ? <EconomyEmpty title={hiddenProductionHistoryCount > 0 ? 'لا توجد أوامر مطابقة' : 'لا توجد أوامر إنتاج'} message={hiddenProductionHistoryCount > 0 ? 'غيّر الفلتر أو اعرض سجل الإنتاج السابق.' : 'ابدأ أول أمر من لوحة خطوط الإنتاج لتظهر هنا مواعيد التسليم.'} /> : <div className="economy-list">{visibleProductionOrders.map((order) => { const forecastPrice = getMarketQuote(profile, order.productId, order.completesOnDay)?.currentPrice ?? 0; const qualityMultiplier = 0.85 + order.qualityScore / 100 * 0.15; const expectedMargin = Math.round(order.outputQuantity * forecastPrice * qualityMultiplier - order.materialCost - order.energyCost - order.maintenanceCost); return <article className="economy-card economy-card--soft" key={order.id}><div className="economy-card-head"><div className="economy-card-title"><span><strong>{order.productName}</strong><small>{formatNumber(order.outputQuantity)} {order.outputUnit} · بدأ في اليوم {formatNumber(order.startedOnDay)}</small></span></div><span className={`economy-pill ${order.status === 'active' ? 'economy-pill--gold' : order.status === 'completed' ? 'economy-pill--green' : 'economy-pill--red'}`}>{order.status === 'active' ? `يكتمل يوم ${formatNumber(order.completesOnDay)}` : order.status === 'completed' ? 'اكتمل' : 'ملغى'}</span></div><div className="economy-meta"><span>تكلفة الوحدة {formatMoney(order.expectedUnitCost, country)}</span><span>طلب متوقع {formatNumber(order.demandForecast)} {order.outputUnit}</span><span>جودة {formatNumber(order.qualityScore)}%</span><span className={expectedMargin >= 0 ? 'economy-pill economy-pill--green' : 'economy-pill economy-pill--red'}>هامش متوقع {formatMoney(expectedMargin, country)}</span></div>{order.status === 'active' && <div className="economy-actions"><button className="button button-secondary" type="button" onClick={() => runCommand({ name: 'cancel_production', args: { orderId: order.id } }, (current) => cancelProductionOrder(current, order.id))}>إلغاء الأمر واسترداد جزئي</button>{(['production-25', 'production-50', 'production-instant'] as const).map((kind) => { const available = profile.speedCards.find((card) => card.kind === kind)?.quantity ?? 0; return available > 0 && <button className="button button-secondary" type="button" key={kind} onClick={() => runCommand({ name: 'use_speed_card', args: { orderId: order.id, kind } }, (current) => useProductionSpeedCard(current, order.id, kind))}>{kind === 'production-25' ? 'بطاقة 25%' : kind === 'production-50' ? 'بطاقة 50%' : 'إكمال فوري'} ({available})</button>; })}</div>}</article>; })}</div>}{hiddenProductionHistoryCount > 0 && <button className="button button-secondary production-history-toggle" type="button" onClick={() => setShowProductionHistory((value) => !value)}>{showProductionHistory ? 'إخفاء سجل الإنتاج' : `عرض سجل الإنتاج السابق (${formatNumber(hiddenProductionHistoryCount)})`}</button>}
        </SectionPanel>
        <SectionPanel
          id="production-energy"
          title="الطاقة المتاحة"
          icon="lightning"
          badge={<span className="economy-pill economy-pill--yellow">⚡ {formatNumber(totalEnergy)} / {formatNumber(totalEnergyCapacity)} وحدة</span>}
          description="تُستعاد الطاقة وتتجدد تلقائيًا مع انتهاء كل دورة يوم."
        >
          {profile.companies.length === 0 ? <EconomyEmpty title="لا توجد طاقة صناعية" message="تظهر الطاقة بعد تأسيس أول شركة." /> : <div className="economy-list">{profile.companies.map((company) => { const condition = company.maintenanceCondition ?? 100; const maintenanceCost = Math.max(5_000, Math.round((company.operatingCostPerDay ?? 0) * 0.4)); return <div className="economy-card" key={company.id}><div className="economy-card-head"><div className="economy-card-title"><span className="economy-card-icon icon-energy-yellow"><Icon name="lightning" size={17} /></span><span><strong>{company.name}</strong><small>{INDUSTRY_CATALOG.find((item) => item.id === company.industryId)?.name}</small></span></div><span className={`economy-pill ${condition < 25 ? 'economy-pill--red' : condition < 60 ? 'economy-pill--gold' : 'economy-pill--green'}`}>صيانة {formatNumber(condition)}%</span></div><div className="economy-card-body"><div className="economy-meta"><span>طاقة {formatNumber(company.energyUnits ?? 0)} / {formatNumber(company.energyCapacity ?? 0)}</span><span>خدمة كاملة {formatMoney(maintenanceCost, country)}</span></div><div className="economy-progress"><span style={{ width: `${Math.min(100, 100 * condition / 100)}%` }} /></div><button className="button button-secondary" type="button" data-guide-target="service-company-btn" onClick={() => runCommand({ name: 'service_company', args: { companyId: company.id } }, (current) => serviceCompany(current, company.id))} disabled={profile.bankBalance < maintenanceCost || condition >= 100}>صيانة المصنع</button></div></div>; })}</div>}
        </SectionPanel>
      </>,
    )}</div>;
  }

  if (section.id === 'inventory') {
    const inventorySummary = selectInventorySummary(profile);
    const productRows = inventorySummary.rows.filter((row) => row.kind === 'product');
    const materialRows = inventorySummary.rows.filter((row) => row.kind === 'material');
    const materialStock = new Map(materialRows.map((row) => [row.itemId, row]));
    const warehouseLevel = normalizeWarehouseLevel(profile.warehouseLevel);
    const warehouseCapacity = getWarehouseCapacity(warehouseLevel);
    const warehouseUsage = getWarehouseUsage(profile.inventory, profile.productionOrders);
    const upgradeRequirement = WAREHOUSE_UPGRADE_REQUIREMENTS[warehouseLevel + 1];
    const missingUpgradeMaterials = upgradeRequirement
      ? Object.entries(upgradeRequirement.materials).filter(([materialId, required]) => (materialStock.get(materialId)?.quantity ?? 0) < required)
      : [];
    const canUpgradeWarehouse = Boolean(upgradeRequirement && missingUpgradeMaterials.length === 0);

    return (
      <div className="section-page">
        {heading}
        {pageShell(
          <>
            {/* بطاقة واجهة السوق التجاري المستقل */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/30 border border-emerald-500/30 shadow-xl mb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20 shrink-0">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                      <span>السوق التجاري والبورصة</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
                        مباشر
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      بيع المنتجات المصنعة بالأسعار اليومية، وشراء وتوريد المواد الخام من البورصة العالمية.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-emerald-300 font-bold flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-emerald-400" />
                    {productRows.length} منتجات جاهزة للبيع
                  </span>
                </div>
              </div>
            </div>

            {/* إحصائيات السوق المباشرة */}
            <div className="economy-grid economy-grid--three-mobile">
              <EconomyStat
                label="قيمة البضائع بالسوق"
                value={formatMoney(inventorySummary.totalValue, country)}
                note={`إجمالي البضائع والخامات (${formatNumber(inventorySummary.rows.length)} صنف)`}
              />
              <EconomyStat
                label="المنتجات التامة للبيع"
                value={`${formatNumber(productRows.length)} صنف`}
                note={`${formatNumber(warehouseUsage.products)} وحدة جاهزة للتسويق`}
              />
              <EconomyStat
                label="المواد الخام المتوفرة"
                value={`${formatNumber(materialRows.length)} صنف`}
                note={`${formatNumber(warehouseUsage.materials)} وحدة لتغذية المصانع`}
              />
            </div>

            {/* 1. قسم بيع المنتجات الجاهزة بالسوق */}
            <SectionPanel
              id="inventory-sales"
              data-guide-panel="inventory-sales"
              title="بيع المنتجات الجاهزة بالسوق"
              description="اختر كمية المنتجات التي ترغب في بيعها وفق حجم الطلب الفوري والأسعار الحالية للسوق."
            >
              {productRows.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 text-xs">
                  <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="font-bold text-slate-300 mb-1">لا توجد منتجات جاهزة للبيع حالياً</p>
                  <p>قم بتشغيل خطوط الإنتاج بالمصانع لتحويل المواد الخام إلى منتجات وطرحها في السوق.</p>
                </div>
              ) : (
                <div className="economy-list">
                  {productRows.map((row) => {
                    const product = PRODUCT_CATALOG.find((item) => item.id === row.itemId);
                    const quantity = productQuantities[row.itemId] ?? '1';
                    const marketQuote = getMarketQuote(profile, row.itemId);
                    const maxSellable = Math.min(row.quantity, marketQuote?.demandUnits ?? row.quantity);
                    return (
                      <article className="economy-card" key={row.id}>
                        <div className="economy-card-head">
                          <div className="economy-card-title">
                            <span className="economy-card-icon">
                              <Icon name="briefcase" size={18} />
                            </span>
                            <span>
                              <strong>{row.name}</strong>
                              <small>
                                المتوفر {formatNumber(row.quantity)} {row.unit} · سعر السوق{' '}
                                {formatMoney(marketQuote?.currentPrice ?? product?.baseSellPrice ?? 0, country)}
                              </small>
                            </span>
                          </div>
                          <span
                            className={`economy-pill economy-pill--${
                              marketQuote?.trend === 'up'
                                ? 'green'
                                : marketQuote?.trend === 'down'
                                ? 'red'
                                : 'gold'
                            }`}
                          >
                            {marketQuote?.trendLabel ?? 'السوق'}
                          </span>
                        </div>
                        <div className="economy-card-body">
                          <div className="economy-meta">
                            <span>
                              الطلب المتاح اليوم {formatNumber(marketQuote?.demandUnits ?? 0)} {row.unit}
                            </span>
                            <span>القيمة الدفترية {formatMoney(row.totalValue, country)}</span>
                          </div>
                          <form
                            className="economy-form"
                            onSubmit={(event: FormEvent<HTMLFormElement>) => {
                              event.preventDefault();
                              runCommand(
                                { name: 'sell_product', args: { productId: row.itemId, quantity: Number(quantity) } },
                                (current) => sellProduct(current, row.itemId, Number(quantity)),
                              );
                            }}
                          >
                            <div className="economy-field">
                              <label htmlFor={`sell-${row.itemId}`}>كمية البيع ({row.unit})</label>
                              <input
                                id={`sell-${row.itemId}`}
                                type="number"
                                min="1"
                                max={maxSellable}
                                step="1"
                                value={quantity}
                                onChange={(event) =>
                                  setProductQuantities((previous) => ({ ...previous, [row.itemId]: event.target.value }))
                                }
                              />
                            </div>
                            <button
                              className="button button-primary"
                              type="submit"
                              data-guide-target="sell-product-btn"
                              disabled={!quantity || Number(quantity) < 1 || Number(quantity) > maxSellable}
                            >
                              <Icon name="investment" size={15} /> بيع بسعر السوق
                            </button>
                          </form>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </SectionPanel>

            {/* 2. قسم بورصة السوق العالمي واستيراد السلع */}
            <SectionPanel
              id="inventory-global-market"
              data-guide-panel="inventory-global-market"
              title="بورصة السوق العالمي وتوريد السلع"
              description="شراء المواد الخام، إبرام عقود الشحن الدولي، والتفاوض مع الموردين بالأسعار الفورية."
            >
              <GlobalMarketTerminal profile={profile} country={country} onCommand={runCommand} onAction={onAction} />
            </SectionPanel>

            {/* سعة التخزين وتطوير المخزن ومخزون المواد (مدمج كأداة سعة مساعدة) */}
            <details id="warehouse-overview" className="group rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 transition-all">
              <summary className="cursor-pointer list-none flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white select-none">
                <span className="flex items-center gap-2">
                  <Warehouse className="w-4 h-4 text-amber-400" />
                  <span>بيانات سعة التخزين ومستودع الخامات · المستوى {formatNumber(warehouseLevel)}</span>
                </span>
                <span className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                  عرض السعة والمخزون ▾
                </span>
              </summary>

              <div className="mt-4 space-y-4 pt-3 border-t border-slate-800">
                <div className="warehouse-capacity-grid">
                  <article>
                    <span>سعة المواد الخام</span>
                    <strong>
                      {formatNumber(warehouseUsage.materials)} / {formatNumber(warehouseCapacity.materials)}
                    </strong>
                    <div className="economy-progress">
                      <span
                        style={{
                          width: `${Math.min(100, (warehouseUsage.materials / warehouseCapacity.materials) * 100)}%`,
                        }}
                      />
                    </div>
                  </article>
                  <article>
                    <span>سعة المنتجات والإنتاج</span>
                    <strong>
                      {formatNumber(warehouseUsage.products)} / {formatNumber(warehouseCapacity.products)}
                    </strong>
                    <div className="economy-progress">
                      <span
                        style={{
                          width: `${Math.min(100, (warehouseUsage.products / warehouseCapacity.products) * 100)}%`,
                        }}
                      />
                    </div>
                  </article>
                </div>

                {upgradeRequirement ? (
                  <div className="warehouse-upgrade-card">
                    <div>
                      <strong>تطوير المخزن إلى المستوى {formatNumber(warehouseLevel + 1)}</strong>
                      <small>التكلفة {formatMoney(upgradeRequirement.cash, country)} · المتطلبات:</small>
                    </div>
                    <div className="economy-meta">
                      {Object.entries(upgradeRequirement.materials).map(([materialId, required]) => {
                        const material = MATERIAL_CATALOG.find((item) => item.id === materialId);
                        const owned = materialStock.get(materialId)?.quantity ?? 0;
                        return (
                          <span
                            className={owned >= required ? 'economy-pill economy-pill--green' : 'economy-pill economy-pill--gold'}
                            key={materialId}
                          >
                            {material?.name ?? materialId} {formatNumber(owned)} / {formatNumber(required)}
                          </span>
                        );
                      })}
                    </div>
                    <PurchaseOptions
                      country={country}
                      cashPrice={upgradeRequirement.cash}
                      bankBalance={profile.bankBalance}
                      diamondsBalance={profile.diamonds}
                      disabled={!canUpgradeWarehouse}
                      cashLabel="تطوير المخزن نقدًا"
                      onPurchase={(paymentMethod) =>
                        runCommand(
                          { name: 'upgrade_warehouse', args: { paymentMethod } },
                          (current) => upgradeWarehouse(current, paymentMethod),
                        )
                      }
                    />
                  </div>
                ) : null}

                <div id="inventory-materials" className="pt-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                    <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                      <Boxes className="w-4 h-4 text-blue-400" />
                      <span>المواد الخام المخزنة في المستودع</span>
                    </h4>
                    <span className="text-xs text-slate-400 font-mono">
                      {materialRows.length} صنف متوفر
                    </span>
                  </div>
                  {materialRows.length === 0 ? (
                    <p className="text-xs text-slate-400 py-1">لا توجد مواد خام حالياً في المستودع.</p>
                  ) : (
                    <div className="economy-list">
                      {MATERIAL_CATALOG.map((material) => {
                        const stock = materialStock.get(material.id);
                        if (!stock) return null;
                        return (
                          <article className="economy-card economy-card--soft" key={material.id}>
                            <div className="economy-card-head">
                              <div className="economy-card-title">
                                <span className="economy-card-icon">
                                  <Icon name="warehouse" size={18} />
                                </span>
                                <span>
                                  <strong>{material.name}</strong>
                                  <small>قيمة المخزون {formatMoney(stock.totalValue, country)}</small>
                                </span>
                              </div>
                              <span className="economy-pill">
                                {formatNumber(stock.quantity)} {material.unit}
                              </span>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </details>
          </>,
        )}
      </div>
    );
  }

  if (section.id === 'investments') {
    return (
      <div className="section-page w-full min-w-0">
        {heading}
        <StockExchangeTerminal
          profile={profile}
          country={country}
          onCommand={onCommand}
          onAction={onAction}
          onProfileUpdate={(updated) => {
            if (onProfileUpdate) {
              onProfileUpdate(updated);
            }
          }}
        />
      </div>
    );
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
        <SectionPanel title="لوحة الأداء المتقدمة" description="تحليل تفصيلي للإنتاج والمبيعات والهامش من العمليات المسجلة في دفتر اللعبة.">
          <div className="advanced-stat-tabs"><span className="advanced-stat-tab advanced-stat-tab--active">الإنتاج</span><span className="advanced-stat-tab">المبيعات</span><span className="advanced-stat-tab">الربحية</span></div>
          <div className="economy-grid economy-grid--three-mobile"><EconomyStat label="أوامر الإنتاج" value={formatNumber(advanced.production.totalOrders)} note={`${formatNumber(advanced.production.completedOrders)} مكتمل · ${formatNumber(advanced.production.activeOrders)} نشط`} /><EconomyStat label="إجمالي الإنتاج" value={formatNumber(advanced.production.totalOutput)} note={`${formatNumber(advanced.production.totalBatches)} دفعات`} /><EconomyStat label="متوسط الجودة" value={`${advanced.production.averageQuality.toFixed(1)}%`} note={`تكلفة الإنتاج ${formatMoney(advanced.production.totalProductionCost, country)}`} /><EconomyStat label="الوحدات المباعة" value={formatNumber(advanced.sales.totalUnits)} note={`متوسط الوحدة ${formatMoney(advanced.sales.averageUnitPrice, country)}`} /><EconomyStat label="صافي المبيعات بعد التكلفة" value={formatMoney(advanced.sales.netRevenue, country)} note={`تكلفة البضاعة ${formatMoney(advanced.sales.totalCostOfGoodsSold, country)}`} /><EconomyStat label="هامش الربح" value={formatMoney(advanced.profit.grossMargin, country)} note={`${advanced.profit.marginPercent.toFixed(1)}% من الإيراد`} /></div>
          <div className="advanced-stat-columns"><div><div className="advanced-stat-heading"><strong>أداء المصانع</strong><span>حسب الشركة</span></div>{advanced.production.companies.length === 0 ? <div className="economy-empty"><span>لا توجد بيانات إنتاج بعد.</span></div> : <div className="advanced-stat-list">{advanced.production.companies.map((company) => <article className="advanced-stat-row" key={company.id}><div className="advanced-stat-row-head"><strong>{company.name}</strong><span>مستوى {formatNumber(company.level)} · جودة {company.quality.toFixed(0)}%</span></div><div className="advanced-stat-bar"><span style={{ width: `${Math.min(100, company.utilization)}%` }} /></div><div className="advanced-stat-row-meta"><span>{formatNumber(company.completedOrders)} أوامر مكتملة · {formatNumber(company.output)} وحدة</span><b>{formatMoney(company.cost, country)}</b></div></article>)}</div>}</div><div><div className="advanced-stat-heading"><strong>أداء المبيعات</strong><span>حسب المنتج</span></div>{advanced.sales.products.length === 0 ? <div className="economy-empty"><span>لا توجد مبيعات مسجلة بعد.</span></div> : <div className="advanced-stat-list">{advanced.sales.products.map((product) => <article className="advanced-stat-row" key={product.id}><div className="advanced-stat-row-head"><strong>{product.name}</strong><span>{formatNumber(product.units)} وحدة</span></div><div className="advanced-stat-bar advanced-stat-bar--sales"><span style={{ width: `${Math.min(100, advanced.sales.totalRevenue > 0 ? product.revenue / advanced.sales.totalRevenue * 100 : 0)}%` }} /></div><div className="advanced-stat-row-meta"><span>متوسط {formatMoney(product.averagePrice, country)} · ضريبة {formatMoney(product.tax, country)}</span><b>{formatMoney(product.revenue, country)}</b></div></article>)}</div>}</div></div>
          <div className="advanced-profit-breakdown"><div className="advanced-stat-heading"><strong>تفصيل الربحية والمصروفات</strong><span>من دفتر الحساب</span></div><div className="economy-meta"><span className="economy-pill economy-pill--green">هامش إجمالي {formatMoney(advanced.profit.grossMargin, country)}</span><span>رواتب {formatMoney(advanced.profit.payroll, country)}</span><span>إنتاج وصيانة {formatMoney(advanced.profit.productionExpenses, country)}</span><span>تشغيل {formatMoney(advanced.profit.operatingExpenses, country)}</span><span>مصروفات أخرى {formatMoney(advanced.profit.otherExpenses, country)}</span><span>دخل استثماري {formatMoney(advanced.profit.investmentIncome, country)}</span></div></div>
        </SectionPanel>
        <SectionPanel title="دفتر الحساب" description="كل الأرقام مستخرجة من معاملات اللاعب المسجلة.">
          {report.recentEntries.length === 0 ? <EconomyEmpty title="لا توجد حركات مالية بعد" message="تظهر هنا العمليات بعد أول مزاد أو شراء أو إنتاج أو بيع." /> : <div className="economy-table-wrap"><table className="economy-table"><thead><tr><th>الحركة</th><th>النوع</th><th>القيمة</th><th>التاريخ</th></tr></thead><tbody>{report.recentEntries.map((entry) => <tr key={entry.id}><td><strong>{entry.note}</strong></td><td>{ledgerLabels[entry.category]}</td><td className={categoryClass(entry.category)}>{entry.category === 'expense' ? '−' : entry.category === 'revenue' ? '+' : ''}{formatMoney(entry.amount, country)}</td><td>{new Date(entry.occurredAt).toLocaleDateString('ar-EG')}</td></tr>)}</tbody></table></div>}
        </SectionPanel>
        {profile.events.length > 0 && <SectionPanel id="economic-events" title="الأحداث الاقتصادية الأخيرة" description="يعرض التقرير الأثر المالي والقطاع أو الخام المستهدف ومدة تأثير السعر والطلب."><div className="economy-list">{profile.events.slice().reverse().slice(0, 5).map((event) => <article className="economy-card economy-card--soft" key={event.id}><div className="economy-card-head"><div className="economy-card-title"><span className="economy-card-icon"><Icon name="globe" size={18} /></span><span><strong>{event.title}</strong><small>اليوم {formatNumber(event.day)}</small></span></div><span className={`economy-pill ${event.cashImpact >= 0 ? 'economy-pill--green' : 'economy-pill--red'}`}>{event.cashImpact >= 0 ? '+' : '−'}{formatMoney(Math.abs(event.cashImpact), country)}</span></div><div className="economy-card-body"><p>{event.description ?? 'لا يوجد وصف إضافي لهذا الحدث.'}</p>{economicEventDetails(event, profile.day).length > 0 && <div className="economy-meta">{economicEventDetails(event, profile.day).map((detail) => <span key={detail}>{detail}</span>)}</div>}</div></article>)}</div></SectionPanel>}
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
        <SectionPanel id="contracts-offers" title="مركز العملاء والعقود" description="كل عقد يربط الإنتاج والمخزون والسعر والسمعة. اختر ما تستطيع تنفيذه قبل الموعد بدل قبول كل الطلبات.">
          <div className="economy-list">{offers.map((offer) => { const existingContract = (profile.contracts ?? []).find((contract) => contract.id === offer.id); const accepted = existingContract?.status === 'active'; const consumed = existingContract?.status === 'completed' || existingContract?.status === 'failed'; const expectedRevenue = offer.quantity * offer.unitPrice + offer.reward; const estimatedCost = (profile.inventory.find((item) => item.materialOrProductId === offer.productId)?.unitCost ?? 0) * offer.quantity; return <article className="economy-card" key={offer.id}><div className="economy-card-head"><div className="economy-card-title"><span className="economy-card-icon"><Icon name="briefcase" size={18} /></span><span><strong>{offer.clientName}</strong><small>{getCustomerSegmentLabel(offer.clientType)} · {offer.description}</small></span></div><span className="economy-price">{formatMoney(expectedRevenue, country)}</span></div><div className="economy-card-body"><div className="economy-meta"><span>المنتج: {offer.productName}</span><span>الكمية: {formatNumber(offer.quantity)}</span><span>التسليم قبل اليوم {formatNumber(offer.deadlineDay)}</span><span>{offer.minimumQuality ? `الجودة المطلوبة: ${formatNumber(offer.minimumQuality)}%` : 'الجودة: قياسية'}</span><span>سمعة +{formatNumber(offer.reputationReward)}</span><span className="economy-pill economy-pill--green">المعاينة: إيراد {formatMoney(expectedRevenue, country)} · تكلفة مخزون تقديرية {formatMoney(estimatedCost, country)}</span></div><button className="button button-primary" type="button" data-guide-target={!accepted && !consumed && activeContracts.length < 3 ? 'accept-contract-btn' : undefined} disabled={accepted || consumed || activeContracts.length >= 3} onClick={() => runCommand({ name: 'accept_contract', args: { offerId: offer.id } }, (current) => acceptContract(current, offer.id))}>{accepted ? 'العقد مقبول' : consumed ? existingContract?.status === 'completed' ? 'تم تنفيذ العرض' : 'انتهى العرض' : activeContracts.length >= 3 ? 'أكمل عقدًا أولًا' : 'قبول العقد'}</button></div></article>; })}</div>
        </SectionPanel>
        <SectionPanel id="contracts-active" title="العقود المقبولة" description="التسليم يدوي من المنتجات الموجودة في المخزن. لا يُحتسب العقد مكتملًا بمجرد الإنتاج.">
          {activeContracts.length === 0 ? <EconomyEmpty title="لا توجد عقود نشطة" message="اقبل عرضًا من لوحة العملاء عندما تتأكد من قدرتك على الإنتاج والتسليم." /> : <div className="economy-list">{activeContracts.map((contract) => <article className="economy-card economy-card--soft" key={contract.id}><div className="economy-card-head"><div className="economy-card-title"><span><strong>{contract.clientName}</strong><small>{contract.productName} · {formatNumber(contract.quantity)} وحدة · المتبقي {formatNumber(Math.max(0, contract.deadlineDay - profile.day))} يوم</small></span></div><span className="economy-pill economy-pill--gold">{formatMoney(contract.quantity * contract.unitPrice + contract.reward, country)}</span></div><div className="economy-meta"><span>السيولة بعد التسليم تقريبًا {formatMoney(profile.bankBalance + contract.quantity * contract.unitPrice + contract.reward, country)}</span><span>{contract.negotiated ? contract.negotiationNote : 'يمكنك اختيار مقايضة واحدة قبل التسليم.'}</span></div><div className="economy-button-row"><button className="button button-secondary" type="button" data-guide-target="deliver-contract-btn" onClick={() => runCommand({ name: 'deliver_contract', args: { contractId: contract.id } }, (current) => deliverContract(current, contract.id))}>تسليم العقد الآن</button>{!contract.negotiated && <><button className="button button-secondary" type="button" onClick={() => runCommand({ name: 'negotiate_contract', args: { contractId: contract.id, mode: 'price' } }, (current) => negotiateContract(current, contract.id, 'price'))}>تفاوض على السعر +8%</button><button className="button button-secondary" type="button" onClick={() => runCommand({ name: 'negotiate_contract', args: { contractId: contract.id, mode: 'deadline' } }, (current) => negotiateContract(current, contract.id, 'deadline'))}>تمديد يوم −5%</button></>}</div></article>)}</div>}
        </SectionPanel>
        <SectionPanel title="سجل السمعة والإنجازات" description="الالتزام بالعقود يفتح ثقة العملاء ويمنح مكافآت إضافية. التأخر يخفض السمعة ويضيف غرامة."><div className="economy-meta"><span className="economy-pill economy-pill--green">سمعة {formatNumber(profile.reputation ?? 50)}%</span><span>مكتملة {formatNumber(completedContracts.length)}</span><span className="economy-pill economy-pill--red">فاشلة {formatNumber(failedContracts.length)}</span></div>{(profile.achievements ?? []).length > 0 && <div className="economy-list">{profile.achievements.map((achievement) => <article className="economy-task" key={achievement.id}><span className="economy-task-icon"><Icon name="shield" size={18} /></span><span className="economy-task-copy"><strong>{achievement.title}</strong><small>تم فتحها في اليوم {formatNumber(achievement.earnedAtDay)}</small></span><span className="economy-pill economy-pill--green">مكتملة</span></article>)}</div>}</SectionPanel>
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
        <SectionPanel title="موسم التوسع الأول" description={`الموسم من اليوم ${season.season.startedOnDay} إلى اليوم ${season.season.endsOnDay}. اجمع النقاط وافتح مكافآت متكررة.`}>
          <div className="season-progress-head"><strong>{formatNumber(season.season.points)} نقطة موسم</strong><span>المرحلة التالية بعد {formatNumber(season.nextReward)} نقطة</span></div>
          <div className="season-progress"><span style={{ width: `${season.progressPercent}%` }} /></div>
          <div className="economy-list season-challenges">{season.challenges.map((challenge) => <article className="economy-task" key={challenge.id}><span className="economy-task-icon"><Icon name={challenge.kind === 'daily' ? 'clock' : 'tasks'} size={18} /></span><span className="economy-task-copy"><strong>{challenge.title} · {challenge.kind === 'daily' ? 'يومي' : 'أسبوعي'}</strong><small>{challenge.description} · {formatNumber(challenge.points)} نقطة · {formatMoney(challenge.reward, country)}</small></span>{challenge.claimed ? <span className="economy-pill economy-pill--green">تم الاستلام</span> : <button className="button button-primary" type="button" disabled={!challenge.available} onClick={() => onCommand({ name: 'claim_season_challenge', args: { challengeId: challenge.id } }, (current) => claimSeasonChallenge(current, challenge.id))}>{challenge.available ? 'استلام' : 'لم تكتمل'}</button>}</article>)}</div>
        </SectionPanel>
        <SectionPanel title="مكافأة الدخول" description="اختر مكافأتك مرة واحدة في كل يوم من الموسم.">
          <div className="economy-button-row season-rewards">{LOGIN_REWARDS.map((reward) => <button className="button button-secondary" type="button" key={reward.id} disabled={season.loginRewardClaimed} onClick={() => onCommand({ name: 'claim_login_reward', args: { rewardId: reward.id } }, (current) => claimLoginReward(current, reward.id))}><strong>{reward.title}</strong><span>{reward.description}</span></button>)}</div>
          {season.loginRewardClaimed && <div className="economy-notice economy-notice--success">تم استلام مكافأة الدخول لهذا اليوم. عد غدًا لاختيار مكافأة جديدة.</div>}
        </SectionPanel>
        <SectionPanel title="المتصدرون العالميون" description="الترتيب العام يعرض نتائج مستخدمين حقيقيين فقط، دون منافسين وهميين أو بيانات مالية خاصة.">
          <div className="economy-button-row"><span>اختر تصنيف النقاط أو الإنتاج أو العقود أو الشارات من بطاقة المتصدرين.</span><button className="button button-secondary" type="button" onClick={onHome}>عرض المتصدرين في الرئيسية</button></div>
        </SectionPanel>
        <SectionPanel title={`حدث اليوم · ${seasonEvent.event.title}`} description={seasonEvent.claimed ? 'تم تنفيذ قرار اليوم. سيظهر حدث جديد عند انتقال اليوم.' : seasonEvent.event.description}>
          {seasonEvent.claimed ? <div className="economy-notice economy-notice--success">تم اتخاذ القرار اليومي. استمر في إدارة إمبراطوريتك حتى يبدأ الحدث التالي.</div> : <div className="season-event-choices">{seasonEvent.event.choices.map((choice) => <button className="button button-secondary" type="button" key={choice.id} onClick={() => onCommand({ name: 'choose_season_event', args: { choiceId: choice.id } }, (current) => chooseSeasonEvent(current, choice.id))}><strong>{choice.label}</strong><span>{choice.description}</span></button>)}</div>}
        </SectionPanel>
        <SectionPanel id="tasks-achievements" title="المهام والإنجازات" description="تحقق من شروط المهام ثم استلم كل مكافأة مرة واحدة.">
          <div className="economy-list">{tasks.map((task) => <article className="economy-task" key={task.id}><span className="economy-task-icon"><Icon name={task.claimed ? 'shield' : 'tasks'} size={18} /></span><span className="economy-task-copy"><strong>{task.title}</strong><small>{task.description} المكافأة {formatMoney(task.reward, country)}</small></span>{task.claimed ? <span className="economy-pill economy-pill--green">مكتملة</span> : <button className="button button-primary" type="button" data-guide-target={task.available && !task.claimed ? 'claim-task-btn' : undefined} disabled={!task.available} onClick={() => runCommand({ name: 'claim_task', args: { taskId: task.id } }, (current) => claimTask(current, task.id))}>{task.available ? 'استلام المكافأة' : 'لم تكتمل'}</button>}</article>)}</div>
        </SectionPanel>
      </>,
    )}</div>;
  }

  if (section.id === 'territory') {
    return (
      <div className="section-page">
        {heading}
        {pageShell(
          <TerritoryConquestMap
            profile={profile}
            expansion={expansionState}
            onUpdate={(updatedProf, updatedExp) => {
              setExpansionState(updatedExp);
              onAction({ ok: true, profile: updatedProf, message: 'تم تحديث السيطرة الإقليمية', data: undefined });
            }}
          />
        )}
      </div>
    );
  }

  if (section.id === 'tech_tree') {
    return (
      <div className="section-page">
        {heading}
        {pageShell(
          <TechTreeRND
            profile={profile}
            expansion={expansionState}
            onUpdate={(updatedProf, updatedExp) => {
              setExpansionState(updatedExp);
              onAction({ ok: true, profile: updatedProf, message: 'تم تحديث أبحاث الأتمتة والتكنولوجيا', data: undefined });
            }}
          />
        )}
      </div>
    );
  }

  if (section.id === 'luxury') {
    return (
      <div className="section-page">
        {heading}
        {pageShell(
          <CeoLuxurySuite
            profile={profile}
            expansion={expansionState}
            onUpdate={(updatedProf, updatedExp) => {
              setExpansionState(updatedExp);
              onAction({ ok: true, profile: updatedProf, message: 'تم تحديث جناح الرفاهية والأصول الفاخرة', data: undefined });
            }}
          />
        )}
      </div>
    );
  }

  if (section.id === 'cartel') {
    return (
      <div className="section-page">
        {heading}
        {pageShell(
          <CartelSyndicate
            profile={profile}
            expansion={megaExpState}
            onUpdate={(updatedProf, updatedExp) => {
              setMegaExpState(updatedExp);
              onAction({ ok: true, profile: updatedProf, message: 'تم تحديث التكتل التجاري والتحالفات', data: undefined });
            }}
          />
        )}
      </div>
    );
  }

  if (section.id === 'maritime') {
    return (
      <div className="section-page">
        {heading}
        {pageShell(
          <MaritimeTradeRoutes
            profile={profile}
            expansion={megaExpState}
            onUpdate={(updatedProf, updatedExp) => {
              setMegaExpState(updatedExp);
              onAction({ ok: true, profile: updatedProf, message: 'تم تحديث الأسطول الملاحي والخطوط البحرية', data: undefined });
            }}
          />
        )}
      </div>
    );
  }

  if (section.id === 'megaprojects') {
    return (
      <div className="section-page">
        {heading}
        {pageShell(
          <GovernmentMegaprojects
            profile={profile}
            expansion={megaExpState}
            onUpdate={(updatedProf, updatedExp) => {
              setMegaExpState(updatedExp);
              onAction({ ok: true, profile: updatedProf, message: 'تم تحديث المناقصات القومية والنفوذ السياسي', data: undefined });
            }}
          />
        )}
      </div>
    );
  }

  if (section.id === 'incubator') {
    return (
      <div className="section-page">
        {heading}
        {pageShell(
          <StartupIncubatorVC
            profile={profile}
            expansion={megaExpState}
            onUpdate={(updatedProf, updatedExp) => {
              setMegaExpState(updatedExp);
              onAction({ ok: true, profile: updatedProf, message: 'تم تحديث محفظة الاستثمار الجريء والحاضنات', data: undefined });
            }}
          />
        )}
      </div>
    );
  }

  return <div className="section-page">{heading}{pageShell(
    <>
      <SectionPanel title="نظرة سريعة" description="ملخص النشاط المسجل في عالمك.">
        <div className="economy-grid economy-grid--three-mobile"><EconomyStat label="الشركات" value={formatNumber(profile.companies.length)} /><EconomyStat label="الأراضي" value={formatNumber(profile.lands.length)} /><EconomyStat label="الذهب" value={`${formatNumber(profile.goldGrams)} جم`} /></div>
      </SectionPanel>
      <div className="economy-button-row"><button className="button button-secondary" type="button" onClick={onHome}>العودة إلى الرئيسية</button></div>
    </>,
  )}</div>;
}
