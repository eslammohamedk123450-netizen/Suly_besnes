import type { SectionId } from '../domain/navigation';
import type { PlayerProfile } from '../domain/player';
import { calculateTotalAssets } from '../domain/player';
import { AUCTION_CATALOG, findIndustry, findMaterial, findInvestment, PRODUCT_CATALOG, RECIPE_CATALOG, TASK_CATALOG } from './catalog';
import { getAuctionListings, isAuctionOpen } from './auctions';
import { getOperatingCostProgression } from './economyBalance';
import { getSynergyOperatingMultiplier } from './synergy';

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

export interface CompanyPerformanceReport {
  companyId: string;
  completedOrders: number;
  activeOrders: number;
  outputUnits: number;
  productionCost: number;
  payroll: number;
  dailyOperatingCost: number;
  estimatedDailyNet: number;
  quality: number;
}

export interface AdvancedStatistics {
  production: { totalOrders: number; completedOrders: number; activeOrders: number; cancelledOrders: number; totalBatches: number; totalOutput: number; totalProductionCost: number; averageQuality: number; companies: Array<{ id: string; name: string; level: number; batches: number; completedOrders: number; output: number; cost: number; quality: number; utilization: number }> };
  sales: { totalUnits: number; totalRevenue: number; totalTax: number; totalCostOfGoodsSold: number; netRevenue: number; averageUnitPrice: number; products: Array<{ id: string; name: string; units: number; revenue: number; tax: number; costOfGoodsSold: number; averagePrice: number }> };
  profit: { grossMargin: number; operatingExpenses: number; investmentIncome: number; payroll: number; productionExpenses: number; otherExpenses: number; marginPercent: number };
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
  activeContracts: number;
  reputation: number;
}

export interface ObligationRow {
  id: string;
  category: 'payable' | 'salary' | 'loan' | 'operating';
  label: string;
  amount: number;
  dueDay: number;
  overdue: boolean;
}

export interface ObligationsSummary {
  rows: ObligationRow[];
  totalDue: number;
  overdueAmount: number;
  dailyPayroll: number;
  dailyOperatingCost: number;
}

export interface EmpirePulse {
  score: number;
  rank: string;
  rankTone: 'bronze' | 'silver' | 'gold' | 'royal';
  nextRank: string;
  nextRankScore: number;
  focusTitle: string;
  focusDescription: string;
  badges: Array<{ id: string; label: string; earned: boolean }>;
}

export interface EmpirePoints {
  total: number;
  title: string;
  wealth: number;
  performance: number;
  reputation: number;
  stability: number;
  expansion: number;
}

export function selectAvailableAuctions(profile: PlayerProfile): typeof AUCTION_CATALOG {
  return getAuctionListings(profile).filter((listing) => isAuctionOpen(profile, listing));
}

export function selectEmpirePulse(profile: PlayerProfile): EmpirePulse {
  const activeStaff = profile.staff.filter((member) => member.status === 'active').length;
  const activeOrders = profile.productionOrders.filter((order) => order.status === 'active').length;
  const score = profile.day * 4 + profile.lands.length * 12 + profile.companies.length * 28 + activeStaff * 7 + profile.sales.length * 6 + profile.banking.loans.filter((loan) => loan.status === 'paid').length * 10 + profile.completedTaskIds.length * 12 + (profile.reputation ?? 50) + (profile.contracts ?? []).filter((contract) => contract.status === 'completed').length * 18;
  const ranks = [{ name: 'تاجر ناشئ', tone: 'bronze' as const, score: 0 }, { name: 'صاحب أعمال', tone: 'silver' as const, score: 80 }, { name: 'بارون صناعي', tone: 'gold' as const, score: 180 }, { name: 'إمبراطور اقتصادي', tone: 'royal' as const, score: 360 }];
  const current = ranks.slice().reverse().find((rank) => score >= rank.score) ?? ranks[0];
  const next = ranks.find((rank) => rank.score > score) ?? { name: 'القمة', score: current.score + 100 };
  let focusTitle = 'ابنِ أول أصل مؤثر';
  let focusDescription = 'اشترِ أرضًا مناسبة أو افتح مسارًا جديدًا حتى يبدأ اقتصادك في الحركة.';
  if (profile.payables > 0) { focusTitle = 'استعد السيطرة على السيولة'; focusDescription = 'سدّد الالتزامات قبل التوسع حتى لا تتحول السرعة إلى ضغط مالي.'; }
  else if ((profile.contracts ?? []).some((contract) => contract.status === 'active')) { focusTitle = 'احمِ سمعتك التجارية'; focusDescription = 'لديك عقد نشط. الإنتاج لا يكفي؛ راجع الكمية وسلّم الطلب يدويًا قبل الموعد.'; }
  else if (activeOrders > 0) { focusTitle = 'احرس خط الإنتاج'; focusDescription = `لديك ${activeOrders} أمر إنتاج في الطابور. راقب الجودة والطلب عند التسليم.`; }
  else if (profile.companies.length > 0 && profile.staff.length === 0) { focusTitle = 'كوّن فريق القيادة'; focusDescription = 'مدير أو محاسب جيد قد يصنع الفارق بين شركة تعمل وإمبراطورية تتوسع.'; }
  else if (profile.inventory.some((lot) => PRODUCT_CATALOG.some((product) => product.id === lot.materialOrProductId))) { focusTitle = 'حوّل الإنجاز إلى نقد'; focusDescription = 'السوق يتغير يوميًا؛ اختر توقيت البيع قبل أن تتراجع فرصة الطلب.'; }
  else if (profile.companies.length > 0) { focusTitle = 'وسّع هامش الربح'; focusDescription = 'وازن بين الصيانة والموظفين والإنتاج قبل شراء أصل جديد.'; }
  const badges = [
    { id: 'founder', label: 'أول شركة', earned: profile.companies.length > 0 },
    { id: 'operator', label: 'مشغّل مصنع', earned: profile.productionOrders.length > 0 },
    { id: 'banker', label: 'صاحب محفظة', earned: profile.banking.deposits.length > 0 || profile.banking.loans.length > 0 },
    { id: 'team', label: 'قائد فريق', earned: activeStaff >= 2 },
    { id: 'trader', label: 'صائد السوق', earned: profile.sales.length >= 3 },
  ];
  return { score, rank: current.name, rankTone: current.tone, nextRank: next.name, nextRankScore: next.score, focusTitle, focusDescription, badges };
}

/** تقييم مشتق متزايد بلا سقف؛ لا يُحفظ كرقم قابل للتعديل داخل ملف اللاعب. */
export function selectEmpirePoints(profile: PlayerProfile): EmpirePoints {
  const totalAssets = calculateTotalAssets(profile);
  const wealth = Math.floor(Math.log1p(Math.max(0, totalAssets) / 100_000) * 45);
  const completedContracts = (profile.contracts ?? []).filter((contract) => contract.status === 'completed').length;
  const performance = Math.floor(Math.log1p(Math.max(0, profile.finances.netProfit) / 50_000) * 28) + profile.sales.length * 3 + completedContracts * 10;
  const reputation = Math.max(0, Math.round((profile.reputation ?? 50) * 0.8));
  const overduePenalty = Math.floor(Math.max(0, profile.payables) / 50_000) * 8;
  const defaultPenalty = profile.banking.loans.filter((loan) => loan.status === 'defaulted').length * 20;
  const stability = Math.max(0, 75 - overduePenalty - defaultPenalty);
  const activeStaff = profile.staff.filter((member) => member.status === 'active').length;
  const expansion = profile.companies.length * 15 + profile.lands.length * 6 + activeStaff * 3;
  const total = wealth + performance + reputation + stability + expansion;
  const title = total >= 2_000 ? 'إمبراطورية أسطورية' : total >= 1_500 ? 'إمبراطورية كبرى' : total >= 1_100 ? 'قوة اقتصادية' : total >= 750 ? 'إمبراطورية راسخة' : total >= 450 ? 'إمبراطورية صاعدة' : total >= 200 ? 'تاجر واعد' : 'بداية الإمبراطورية';
  return { total, title, wealth, performance, reputation, stability, expansion };
}

export function selectOperationsSnapshot(profile: PlayerProfile, operatingCostMultiplier = 1): OperationsSnapshot {
  const managedCompanyIds = new Set(profile.staff.filter((member) => member.status === 'active' && member.role === 'manager' && member.companyId).map((member) => member.companyId));
  const dailyOperatingCost = profile.companies.reduce((sum, company) => sum + (company.operatingCostPerDay ?? 0) * (managedCompanyIds.has(company.id) ? 0.92 : 1), 0) * operatingCostMultiplier * getOperatingCostProgression(profile.day) * getSynergyOperatingMultiplier(profile);
  const runwayDays = dailyOperatingCost > 0 ? Math.floor(profile.bankBalance / dailyOperatingCost) : null;
  const productUnits = (profile.inventory ?? []).reduce((sum, lot) => (
    PRODUCT_CATALOG.some((product) => product.id === lot.materialOrProductId) ? sum + lot.quantity : sum
  ), 0);
  const activeContracts = (profile.contracts ?? []).filter((contract) => contract.status === 'active').length;
  const readyProductionCompanies = profile.companies.filter((company) => {
    const recipe = RECIPE_CATALOG.find((item) => item.industryId === company.industryId);
    return Boolean(recipe && recipe.inputs.every((input) => (
      (profile.inventory ?? []).find((lot) => lot.materialOrProductId === input.materialId)?.quantity ?? 0
    ) >= input.quantity));
  }).length;
  let nextStep: OperationsNextStep;
  if (profile.payables > 0) {
    nextStep = { section: 'obligations', title: 'سدّد الالتزامات الحرجة', description: `لديك ${Math.round(profile.payables).toLocaleString('ar-EG')} ج.م مسجلة كالتزامات. راجع الأولويات قبل التوسع حتى لا تتوقف الطاقة.`, actionLabel: 'فتح الالتزامات', tone: 'gold' };
  } else if (activeContracts > 0) {
    nextStep = { section: 'contracts', title: 'سلّم عقدك قبل الموعد', description: `لديك ${activeContracts} عقد نشط. راجع المخزون وأكمل التوريد يدويًا حتى تحافظ على سمعتك التجارية.`, actionLabel: 'فتح العقود', tone: 'green' };
  } else if (profile.lands.length === 0) {
    nextStep = { section: 'lands', title: 'اشترِ أول أرض', description: 'عرض البداية في صفحة الأراضي مضمون ولا يحتاج مزادًا. احتفظ بما يكفي من السيولة للتأسيس والتشغيل.', actionLabel: 'عرض الأرض المباشر', tone: 'gold' };
  } else if (profile.companies.length === 0) {
    nextStep = { section: 'companies', title: 'أسس أول شركة', description: 'لديك أصل يمكن تشغيله. اختر قطاعًا يناسب نوع الأرض واترك احتياطيًا للتشغيل.', actionLabel: 'تأسيس شركة', tone: 'blue' };
  } else if (productUnits > 0) {
    nextStep = { section: 'inventory', title: 'حوّل المخزون إلى سيولة', description: 'لديك منتجات جاهزة. راجع الكمية وسجّل أول بيع قبل توسيع التكاليف.', actionLabel: 'فتح المخازن', tone: 'green' };
  } else if (readyProductionCompanies > 0) {
    nextStep = { section: 'production', title: 'شغّل خطًا جاهزًا', description: 'المواد المطلوبة متاحة لشركة واحدة على الأقل. راجع الطاقة والتكلفة قبل التشغيل.', actionLabel: 'فتح الإنتاج', tone: 'blue' };
  } else {
    nextStep = { section: 'inventory', title: 'أمّن مدخلات التشغيل', description: 'الشركات متوقفة بانتظار مواد خام. اشترِ الكمية الضرورية فقط حتى تحافظ على السيولة.', actionLabel: 'فتح المخازن', tone: 'gold' };
  }
  return { nextStep, dailyOperatingCost, runwayDays, readyProductionCompanies, productUnits, activeContracts, reputation: profile.reputation ?? 50 };
}

export function selectObligations(profile: PlayerProfile, operatingCostMultiplier = 1): ObligationsSummary {
  const managedCompanyIds = new Set(profile.staff.filter((member) => member.status === 'active' && member.role === 'manager' && member.companyId).map((member) => member.companyId));
  const dailyOperatingCost = profile.companies.reduce((sum, company) => sum + (company.operatingCostPerDay ?? 0) * (managedCompanyIds.has(company.id) ? 0.92 : 1), 0) * operatingCostMultiplier * getOperatingCostProgression(profile.day) * getSynergyOperatingMultiplier(profile);
  const dailyPayroll = profile.staff.filter((member) => member.status === 'active').reduce((sum, member) => sum + member.dailySalary, 0);
  const rows: ObligationRow[] = [];
  if (profile.payables > 0) rows.push({ id: 'payables', category: 'payable', label: 'التزامات متأخرة من التشغيل والأحداث', amount: profile.payables, dueDay: profile.day, overdue: true });
  profile.staff.filter((member) => member.status === 'active').forEach((member) => rows.push({ id: member.id, category: 'salary', label: `راتب ${member.name}`, amount: member.dailySalary, dueDay: member.nextPayDay, overdue: member.nextPayDay <= profile.day }));
  profile.banking.loans.filter((loan) => loan.status === 'active').forEach((loan) => rows.push({ id: loan.id, category: 'loan', label: `قسط قرض بضمان ${loan.collateralType === 'land' ? 'أرض' : 'شركة'}`, amount: loan.installmentAmount, dueDay: loan.nextPaymentDay, overdue: loan.nextPaymentDay <= profile.day }));
  if (dailyOperatingCost > 0) rows.push({ id: 'operating-daily', category: 'operating', label: 'تشغيل الشركات لليوم التالي', amount: dailyOperatingCost, dueDay: profile.day + 1, overdue: false });
  const overdueAmount = rows.filter((row) => row.overdue).reduce((sum, row) => sum + row.amount, 0);
  return { rows, totalDue: rows.reduce((sum, row) => sum + row.amount, 0), overdueAmount, dailyPayroll, dailyOperatingCost };
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

export function selectAdvancedStatistics(profile: PlayerProfile): AdvancedStatistics {
  const orders = profile.productionOrders ?? [];
  const completedOrders = orders.filter((order) => order.status === 'completed');
  const activeOrders = orders.filter((order) => order.status === 'active');
  const cancelledOrders = orders.filter((order) => order.status === 'cancelled');
  const totalBatches = orders.reduce((sum, order) => sum + order.batches, 0);
  const totalOutput = completedOrders.reduce((sum, order) => sum + order.outputQuantity, 0);
  const totalProductionCost = completedOrders.reduce((sum, order) => sum + order.materialCost + order.energyCost + order.maintenanceCost, 0);
  const averageQuality = completedOrders.length > 0 ? completedOrders.reduce((sum, order) => sum + order.qualityScore, 0) / completedOrders.length : 0;
  const companies = profile.companies.map((company) => {
    const companyOrders = orders.filter((order) => order.companyId === company.id);
    const finished = companyOrders.filter((order) => order.status === 'completed');
    const batches = companyOrders.reduce((sum, order) => sum + order.batches, 0);
    return { id: company.id, name: company.name, level: company.upgradeLevel ?? 1, batches, completedOrders: finished.length, output: finished.reduce((sum, order) => sum + order.outputQuantity, 0), cost: finished.reduce((sum, order) => sum + order.materialCost + order.energyCost + order.maintenanceCost, 0), quality: finished.length > 0 ? finished.reduce((sum, order) => sum + order.qualityScore, 0) / finished.length : 0, utilization: companyOrders.length > 0 ? Math.round((finished.length / companyOrders.length) * 100) : 0 };
  });
  const sales = profile.sales ?? [];
  const productionUnitCost = new Map<string, { cost: number; quantity: number }>();
  for (const order of completedOrders) {
    const current = productionUnitCost.get(order.productId) ?? { cost: 0, quantity: 0 };
    productionUnitCost.set(order.productId, { cost: current.cost + order.materialCost, quantity: current.quantity + order.outputQuantity });
  }
  const costOfSale = (sale: PlayerProfile['sales'][number]) => sale.costOfGoods ?? Math.round(sale.quantity * ((productionUnitCost.get(sale.productId)?.cost ?? 0) / Math.max(1, productionUnitCost.get(sale.productId)?.quantity ?? 0)));
  const products = PRODUCT_CATALOG.map((product) => {
    const rows = sales.filter((sale) => sale.productId === product.id);
    const revenue = rows.reduce((sum, sale) => sum + sale.grossRevenue, 0);
    const units = rows.reduce((sum, sale) => sum + sale.quantity, 0);
    return { id: product.id, name: product.name, units, revenue, tax: rows.reduce((sum, sale) => sum + sale.tax, 0), costOfGoodsSold: rows.reduce((sum, sale) => sum + costOfSale(sale), 0), averagePrice: units > 0 ? revenue / units : 0 };
  }).filter((row) => row.units > 0);
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.grossRevenue, 0);
  const totalTax = sales.reduce((sum, sale) => sum + sale.tax, 0);
  const totalCostOfGoodsSold = sales.reduce((sum, sale) => sum + costOfSale(sale), 0);
  const payroll = profile.ledger.filter((entry) => entry.category === 'expense' && entry.note.startsWith('دفع راتب')).reduce((sum, entry) => sum + entry.amount, 0);
  const productionExpenses = profile.ledger.filter((entry) => entry.category === 'expense' && (entry.note.includes('أمر إنتاج') || entry.note.includes('صيانة كاملة للمصنع'))).reduce((sum, entry) => sum + entry.amount, 0);
  const investmentIncome = profile.ledger.filter((entry) => entry.note.includes('استثمار رابح') || entry.note.includes('فائدة وديعة')).reduce((sum, entry) => sum + entry.amount, 0);
  const operatingExpenses = profile.ledger.filter((entry) => entry.note.includes('تشغيل')).reduce((sum, entry) => sum + entry.amount, 0);
  const otherExpenses = Math.max(0, profile.finances.totalExpenses - payroll - productionExpenses - operatingExpenses);
  const grossMargin = totalRevenue - totalTax - totalCostOfGoodsSold;
  const totalUnits = sales.reduce((sum, sale) => sum + sale.quantity, 0);
  return { production: { totalOrders: orders.length, completedOrders: completedOrders.length, activeOrders: activeOrders.length, cancelledOrders: cancelledOrders.length, totalBatches, totalOutput, totalProductionCost, averageQuality, companies }, sales: { totalUnits, totalRevenue, totalTax, totalCostOfGoodsSold, netRevenue: totalRevenue - totalTax - totalCostOfGoodsSold, averageUnitPrice: totalUnits > 0 ? totalRevenue / totalUnits : 0, products }, profit: { grossMargin, operatingExpenses, investmentIncome, payroll, productionExpenses, otherExpenses, marginPercent: totalRevenue > 0 ? (grossMargin / totalRevenue) * 100 : 0 } };
}


export function selectCompanyPerformance(profile: PlayerProfile, companyId: string): CompanyPerformanceReport {
  const company = profile.companies.find((item) => item.id === companyId);
  const orders = profile.productionOrders.filter((order) => order.companyId === companyId);
  const completed = orders.filter((order) => order.status === 'completed');
  const payroll = profile.staff.filter((member) => member.companyId === companyId && member.status === 'active').reduce((sum, member) => sum + member.dailySalary, 0);
  const productionCost = orders.reduce((sum, order) => sum + order.materialCost + order.energyCost + order.maintenanceCost, 0);
  const quality = completed.length > 0 ? completed.reduce((sum, order) => sum + order.qualityScore, 0) / completed.length : 0;
  const dailyOperatingCost = company?.operatingCostPerDay ?? 0;
  return { companyId, completedOrders: completed.length, activeOrders: orders.filter((order) => order.status === 'active').length, outputUnits: completed.reduce((sum, order) => sum + order.outputQuantity, 0), productionCost, payroll, dailyOperatingCost, estimatedDailyNet: -(dailyOperatingCost + payroll), quality };
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
        case 'run-production': return profile.productionOrders.length > 0;
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
