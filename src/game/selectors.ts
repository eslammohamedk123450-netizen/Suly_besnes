import type { SectionId } from '../domain/navigation';
import type { PlayerProfile } from '../domain/player';
import { AUCTION_CATALOG, findIndustry, findMaterial, findInvestment, PRODUCT_CATALOG, RECIPE_CATALOG, TASK_CATALOG } from './catalog';

export interface InventorySummaryRow {
  id: string;
  itemId: string;
  name: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalValue: number;
  kind: 'material' | 'product';
}

export interface FinancialReport {
  balance: number;
  totalAssets: number;
  liabilities: number;
  revenue: number;
  expenses: number;
  netProfit: number;
  recentEntries: PlayerProfile['ledger'];
}

export interface OperationsNextStep {
  section: SectionId;
  title: string;
  description: string;
  actionLabel: string;
  tone: 'gold' | 'blue' | 'green';
}

export interface OperationsSnapshot {
  nextStep: OperationsNextStep;
  dailyOperatingCost: number;
  runwayDays: number | null;
  readyProductionCompanies: number;
  productUnits: number;
}

export function selectAvailableAuctions(): typeof AUCTION_CATALOG {
  return AUCTION_CATALOG.filter((listing) => listing.status === 'open');
}

export function selectOperationsSnapshot(profile: PlayerProfile, operatingCostMultiplier = 1): OperationsSnapshot {
  const dailyOperatingCost = profile.companies.reduce((sum, company) => sum + (company.operatingCostPerDay ?? 0), 0) * operatingCostMultiplier;
  const runwayDays = dailyOperatingCost > 0 ? Math.floor(profile.bankBalance / dailyOperatingCost) : null;
  const productUnits = (profile.inventory ?? []).reduce((sum, lot) => (
    PRODUCT_CATALOG.some((product) => product.id === lot.materialOrProductId) ? sum + lot.quantity : sum
  ), 0);
  const readyProductionCompanies = profile.companies.filter((company) => {
    const recipe = RECIPE_CATALOG.find((item) => item.industryId === company.industryId);
    return Boolean(recipe && recipe.inputs.every((input) => (
      (profile.inventory ?? []).find((lot) => lot.materialOrProductId === input.materialId)?.quantity ?? 0
    ) >= input.quantity));
  }).length;
  let nextStep: OperationsNextStep;
  if (profile.lands.length === 0) {
    nextStep = { section: 'auctions', title: 'اشترِ أول أرض', description: 'الأرض هي مفتاح تأسيس أول نشاط. ابدأ بمزاد يناسب القطاع الذي تريد دخوله.', actionLabel: 'فتح المزادات', tone: 'gold' };
  } else if (profile.companies.length === 0) {
    nextStep = { section: 'companies', title: 'أسس أول شركة', description: 'لديك أصل يمكن تشغيله. اختر قطاعًا يناسب نوع الأرض واترك احتياطيًا للتشغيل.', actionLabel: 'تأسيس شركة', tone: 'blue' };
  } else if (productUnits > 0) {
    nextStep = { section: 'inventory', title: 'حوّل المخزون إلى سيولة', description: 'لديك منتجات جاهزة. راجع الكمية وسجّل أول بيع قبل توسيع التكاليف.', actionLabel: 'فتح المخازن', tone: 'green' };
  } else if (readyProductionCompanies > 0) {
    nextStep = { section: 'production', title: 'شغّل خطًا جاهزًا', description: 'المواد المطلوبة متاحة لشركة واحدة على الأقل. راجع الطاقة والتكلفة قبل التشغيل.', actionLabel: 'فتح الإنتاج', tone: 'blue' };
  } else {
    nextStep = { section: 'inventory', title: 'أمّن مدخلات التشغيل', description: 'الشركات متوقفة بانتظار مواد خام. اشترِ الكمية الضرورية فقط حتى تحافظ على السيولة.', actionLabel: 'فتح المخازن', tone: 'gold' };
  }
  return { nextStep, dailyOperatingCost, runwayDays, readyProductionCompanies, productUnits };
}

export function selectInventorySummary(profile: PlayerProfile): { rows: InventorySummaryRow[]; totalValue: number } {
  const rows = (profile.inventory ?? []).map((lot) => {
    const material = findMaterial(lot.materialOrProductId);
    const product = PRODUCT_CATALOG.find((entry) => entry.id === lot.materialOrProductId);
    return {
      id: lot.id,
      itemId: lot.materialOrProductId,
      name: material?.name ?? product?.name ?? lot.materialOrProductId,
      quantity: lot.quantity,
      unit: lot.unit,
      unitCost: lot.unitCost,
      totalValue: lot.quantity * lot.unitCost,
      kind: material ? 'material' as const : 'product' as const,
    };
  });
  return { rows, totalValue: rows.reduce((sum, row) => sum + row.totalValue, 0) };
}

export function selectSalesSummary(profile: PlayerProfile): { count: number; grossRevenue: number; tax: number; netRevenue: number; recent: PlayerProfile['sales'] } {
  const grossRevenue = (profile.sales ?? []).reduce((sum, sale) => sum + sale.grossRevenue, 0);
  const tax = (profile.sales ?? []).reduce((sum, sale) => sum + sale.tax, 0);
  return { count: profile.sales.length, grossRevenue, tax, netRevenue: grossRevenue - tax, recent: profile.sales.slice(-10).reverse() };
}

export function selectFinancialReport(profile: PlayerProfile): FinancialReport {
  const revenue = profile.ledger.filter((entry) => entry.category === 'revenue').reduce((sum, entry) => sum + entry.amount, 0);
  const expenses = profile.ledger.filter((entry) => entry.category === 'expense').reduce((sum, entry) => sum + entry.amount, 0);
  const totalAssets = profile.bankBalance
    + profile.assets.reduce((sum, asset) => sum + asset.value, 0)
    + profile.lands.reduce((sum, land) => sum + land.purchasePrice, 0)
    + selectInventorySummary(profile).totalValue
    + profile.investments.filter((investment) => investment.status === 'active').reduce((sum, investment) => sum + investment.principal, 0)
    + profile.goldCostBasis;
  return { balance: profile.bankBalance, totalAssets, liabilities: profile.payables, revenue, expenses, netProfit: revenue - expenses, recentEntries: profile.ledger.slice(-20).reverse() };
}

export function selectTaskBoard(profile: PlayerProfile): Array<(typeof TASK_CATALOG)[number] & { claimed: boolean; available: boolean }> {
  return TASK_CATALOG.map((task) => {
    const progress = profile.tasks.find((item) => item.taskId === task.id);
    const available = (() => {
      switch (task.condition) {
        case 'own-land': return profile.lands.length > 0;
        case 'own-company': return profile.companies.length > 0;
        case 'buy-material': return profile.ledger.some((entry) => entry.note.startsWith('شراء '));
        case 'run-production': return profile.ledger.some((entry) => entry.note.startsWith('تشغيل '));
        case 'sell-product': return profile.sales.length > 0;
        case 'make-investment': return profile.investments.length > 0;
        case 'reach-day-3': return profile.day >= 3;
      }
    })();
    return { ...task, claimed: Boolean(progress?.claimed || profile.completedTaskIds.includes(task.id)), available };
  });
}

export function selectActiveInvestments(profile: PlayerProfile): Array<PlayerProfile['investments'][number] & { name: string }> {
  return profile.investments.filter((investment) => investment.status === 'active').map((investment) => ({
    ...investment,
    name: findInvestment(investment.investmentTypeId)?.name ?? investment.investmentTypeId,
  }));
}

export function selectCompanySummary(profile: PlayerProfile): Array<PlayerProfile['companies'][number] & { industryName: string }> {
  return profile.companies.map((company) => ({ ...company, industryName: findIndustry(company.industryId)?.name ?? company.industryId }));
}
