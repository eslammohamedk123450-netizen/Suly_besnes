import type { PlayerProfile } from '../domain/player';
import type { FinanceLedgerEntry } from '../domain/futureSystems';

export interface StockCompany {
  id: string;
  name: string;
  ticker: string;
  sector: string;
  logo: string;
  description: string;
  totalShares: number;
  sharePrice: number;
  basePrice: number;
  marketCap: number; // totalShares * sharePrice
  dailyChangePercent: number;
  dailyDividendYieldPercent: number; // Daily yield e.g. 0.5%
  seasonalDividendBonusPerShare: number; // e.g. $2.00
  circuitBreakerMin: number;
  circuitBreakerMax: number;
  priceHistory: number[];
  recentHeadline: string;
}

export interface StockHolding {
  companyId: string;
  sharesOwned: number;
  totalInvested: number;
  averageCostPerShare: number;
}

export interface StockMarketState {
  stocks: StockCompany[];
  holdings: Record<string, StockHolding>;
  totalDividendsCollected: number;
  lastDividendDay?: number;
}

export const BROKERAGE_COMMISSION_RATE = 0.005; // 0.5%

export const INITIAL_STOCKS: readonly StockCompany[] = [
  {
    id: 'soly_energy',
    name: 'شركة سولي للطاقة المتجددة',
    ticker: 'SOLY',
    sector: 'الطاقة والتعدين النظيف',
    logo: '⚡',
    description: 'تسيطر على محطات الطاقة الشمسية ومزارع الرياح الكبرى في الشرق الأوسط.',
    totalShares: 2_500_000,
    sharePrice: 245.0,
    basePrice: 245.0,
    marketCap: 612_500_000,
    dailyChangePercent: +3.2,
    dailyDividendYieldPercent: 0.65,
    seasonalDividendBonusPerShare: 2.50,
    circuitBreakerMin: 60.0,
    circuitBreakerMax: 950.0,
    priceHistory: [230, 235, 238, 240, 242, 245],
    recentHeadline: 'توقيع عقود توريد طاقة شمسية لمجمع العاشر من رمضان الصناعي',
  },
  {
    id: 'egypt_tech',
    name: 'إيجيبت تيك للبرمجيات والذكاء الاصطناعي',
    ticker: 'ETCH',
    sector: 'التكنولوجيا والحلول الرقمية',
    logo: '💻',
    description: 'مطور خوارزميات الذكاء الاصطناعي وأتمتة خطوط الإنتاج واللوجستيات.',
    totalShares: 1_200_000,
    sharePrice: 520.0,
    basePrice: 520.0,
    marketCap: 624_000_000,
    dailyChangePercent: +5.8,
    dailyDividendYieldPercent: 0.45,
    seasonalDividendBonusPerShare: 4.20,
    circuitBreakerMin: 130.0,
    circuitBreakerMax: 1950.0,
    priceHistory: [480, 492, 505, 498, 512, 520],
    recentHeadline: 'إطلاق نموذج الذكاء الاصطناعي لإدارة سلاسل الإمداد اللوجستية',
  },
  {
    id: 'delta_food',
    name: 'مجموعة الدلتا للصناعات الغذائية',
    ticker: 'DFOD',
    sector: 'الأغذية والإنتاج الزراعي',
    logo: '🌾',
    description: 'أكبر مجمع زراعي وصناعي لإنتاج وتعبئة السلع الغذائية الاستهلاكية.',
    totalShares: 3_500_000,
    sharePrice: 88.5,
    basePrice: 88.5,
    marketCap: 309_750_000,
    dailyChangePercent: +1.4,
    dailyDividendYieldPercent: 0.85,
    seasonalDividendBonusPerShare: 1.10,
    circuitBreakerMin: 25.0,
    circuitBreakerMax: 350.0,
    priceHistory: [82, 84, 85, 87, 86, 88.5],
    recentHeadline: 'افتتاح 4 خطوط تعبئة حديثة لتصدير السلع الغذائية إلى الخليج',
  },
  {
    id: 'nile_build',
    name: 'النيل للإنشاءات والعقارات العملاقة',
    ticker: 'NILB',
    sector: 'التطوير العقاري والمقاولات',
    logo: '🏢',
    description: 'المطور الرئيسي للمدن الذكية والأبراج الإدارية ومناطق التجارة الحرة.',
    totalShares: 2_000_000,
    sharePrice: 315.0,
    basePrice: 315.0,
    marketCap: 630_000_000,
    dailyChangePercent: -1.2,
    dailyDividendYieldPercent: 0.70,
    seasonalDividendBonusPerShare: 3.00,
    circuitBreakerMin: 80.0,
    circuitBreakerMax: 1200.0,
    priceHistory: [330, 325, 320, 318, 322, 315],
    recentHeadline: 'تسليم المرحلة الأولى من مجمع الأبراج المالية بالعاصمة',
  },
  {
    id: 'royal_bank',
    name: 'مجموعة رويال بنك القابضة',
    ticker: 'RBANK',
    sector: 'البنوك والخدمات المصرفية',
    logo: '🏛️',
    description: 'المؤسسة التمويلية الأضخم لدعم الاستحواذات والتمويل الاستثماري.',
    totalShares: 1_800_000,
    sharePrice: 430.0,
    basePrice: 430.0,
    marketCap: 774_000_000,
    dailyChangePercent: +2.1,
    dailyDividendYieldPercent: 0.75,
    seasonalDividendBonusPerShare: 3.80,
    circuitBreakerMin: 110.0,
    circuitBreakerMax: 1650.0,
    priceHistory: [410, 415, 422, 420, 425, 430],
    recentHeadline: 'ارتفاع صافي الأرباح التشغيلية بنسبة 28% في الربع الأخير',
  },
  {
    id: 'pharmacon',
    name: 'فارماكون الدولية للأدوية',
    ticker: 'PHRM',
    sector: 'الرعاية الصحية والأدوية',
    logo: '🧪',
    description: 'مختبرات تصنيع المستحضرات الدوائية الحيوية واللقاحات الطبية.',
    totalShares: 1_500_000,
    sharePrice: 198.0,
    basePrice: 198.0,
    marketCap: 297_000_000,
    dailyChangePercent: +4.2,
    dailyDividendYieldPercent: 0.55,
    seasonalDividendBonusPerShare: 1.80,
    circuitBreakerMin: 50.0,
    circuitBreakerMax: 780.0,
    priceHistory: [180, 184, 189, 192, 190, 198],
    recentHeadline: 'اعتماد دواء حيوي جديد للتصدير لمنطقة الشرق الأوسط وشمال أفريقيا',
  },
  {
    id: 'logix_shipping',
    name: 'الأفق للشحن والخدمات اللوجستية',
    ticker: 'LOGX',
    sector: 'النقل والشحن الدولي',
    logo: '🚢',
    description: 'أسطول سفن شحن عملاقة ومراكز مستودعات آلية حول الموانئ الرئيسية.',
    totalShares: 2_200_000,
    sharePrice: 165.0,
    basePrice: 165.0,
    marketCap: 363_000_000,
    dailyChangePercent: +0.9,
    dailyDividendYieldPercent: 0.80,
    seasonalDividendBonusPerShare: 1.60,
    circuitBreakerMin: 45.0,
    circuitBreakerMax: 650.0,
    priceHistory: [155, 158, 160, 162, 163, 165],
    recentHeadline: 'تدشين رصيف حاويات متطور بميناء شرق بورسعيد بطاقة 2 مليون حاوية',
  },
  {
    id: 'suez_petro',
    name: 'السويس للبتروكيماويات والطاقة',
    ticker: 'PETRO',
    sector: 'النفط والغاز والبتروكيماويات',
    logo: '🛢️',
    description: 'مجمعات تكرير وتسييل الغاز الطبيعي وصناعات البوليمرات المتقدمة.',
    totalShares: 3_000_000,
    sharePrice: 280.0,
    basePrice: 280.0,
    marketCap: 840_000_000,
    dailyChangePercent: -2.3,
    dailyDividendYieldPercent: 0.90,
    seasonalDividendBonusPerShare: 2.80,
    circuitBreakerMin: 70.0,
    circuitBreakerMax: 1100.0,
    priceHistory: [295, 290, 288, 285, 282, 280],
    recentHeadline: 'تصحيح سعري مؤقت متزامن مع تحركات أسعار خام برنت العالمية',
  },
  {
    id: 'vodacom_telecom',
    name: 'فوداكوم للاتصالات وشبكات 5G',
    ticker: 'TELCO',
    sector: 'الاتصالات والبنية التحتية',
    logo: '📡',
    description: 'المشغل الأكبر لشبكات الجيل الخامس والألياف الضوئية ومراكز البيانات.',
    totalShares: 2_800_000,
    sharePrice: 145.0,
    basePrice: 145.0,
    marketCap: 406_000_000,
    dailyChangePercent: +1.8,
    dailyDividendYieldPercent: 0.70,
    seasonalDividendBonusPerShare: 1.40,
    circuitBreakerMin: 38.0,
    circuitBreakerMax: 580.0,
    priceHistory: [138, 140, 142, 141, 143, 145],
    recentHeadline: 'تغطية 92% من المناطق الصناعية بالإنترنت فائق السرعة وشبكات الحوسبة',
  },
  {
    id: 'retal_hospitality',
    name: 'صروح للتطوير الفندقي والسياحي',
    ticker: 'RETAL',
    sector: 'السياحة والضيافة والترفيه',
    logo: '🏖️',
    description: 'سلسلة فنادق ومنتجعات 5 نجوم في البحر الأحمر والساحل الشمالي.',
    totalShares: 1_600_000,
    sharePrice: 210.0,
    basePrice: 210.0,
    marketCap: 336_000_000,
    dailyChangePercent: +3.9,
    dailyDividendYieldPercent: 0.60,
    seasonalDividendBonusPerShare: 2.10,
    circuitBreakerMin: 55.0,
    circuitBreakerMax: 820.0,
    priceHistory: [195, 198, 202, 205, 208, 210],
    recentHeadline: 'نسب إشغال قياسية تصل إلى 98% في المنتجعات الفندقية الشاطئية',
  },
];

const STOCK_STORAGE_PREFIX = 'suly_besnes_stocks_v2_';

export function loadStockMarketState(profileId: string): StockMarketState {
  try {
    const raw = globalThis.localStorage?.getItem(`${STOCK_STORAGE_PREFIX}${profileId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Merge with initial stocks to make sure all new properties exist
      const mergedStocks = INITIAL_STOCKS.map((initStock) => {
        const savedStock = parsed.stocks?.find((s: StockCompany) => s.id === initStock.id);
        if (savedStock) {
          return {
            ...initStock,
            ...savedStock,
            marketCap: savedStock.sharePrice * initStock.totalShares,
          };
        }
        return initStock;
      });

      return {
        stocks: mergedStocks,
        holdings: parsed.holdings || {},
        totalDividendsCollected: parsed.totalDividendsCollected || 0,
        lastDividendDay: parsed.lastDividendDay,
      };
    }
  } catch (err) {
    console.warn('Failed to load stock market state:', err);
  }

  return {
    stocks: [...INITIAL_STOCKS],
    holdings: {},
    totalDividendsCollected: 0,
  };
}

export function saveStockMarketState(profileId: string, state: StockMarketState): void {
  try {
    globalThis.localStorage?.setItem(`${STOCK_STORAGE_PREFIX}${profileId}`, JSON.stringify(state));
  } catch (err) {
    console.warn('Failed to save stock market state:', err);
  }
}

/**
 * Simulates market volatility with circuit breakers:
 * - Regular daily: -8% to +15%
 * - Speculative shocks: -25% to +40% with headlines
 */
export function simulateMarketFluctuation(state: StockMarketState): StockMarketState {
  const updatedStocks = state.stocks.map((stock) => {
    // 85% normal fluctuation, 15% shock fluctuation
    const isShock = Math.random() < 0.15;
    let changePercent = 0;

    if (isShock) {
      // -25% to +40%
      changePercent = Math.random() < 0.65
        ? +(15 + Math.random() * 25) // +15% to +40%
        : -(10 + Math.random() * 15); // -10% to -25%
    } else {
      // -8% to +15%
      changePercent = Math.random() < 0.6
        ? +(Math.random() * 15) // 0% to +15%
        : -(Math.random() * 8); // -8% to 0%
    }

    let newPrice = stock.sharePrice * (1 + changePercent / 100);

    // Apply circuit breakers
    if (newPrice < stock.circuitBreakerMin) {
      newPrice = stock.circuitBreakerMin;
      changePercent = ((newPrice - stock.sharePrice) / stock.sharePrice) * 100;
    } else if (newPrice > stock.circuitBreakerMax) {
      newPrice = stock.circuitBreakerMax;
      changePercent = ((newPrice - stock.sharePrice) / stock.sharePrice) * 100;
    }

    newPrice = Math.round(newPrice * 10) / 10;
    const history = [...(stock.priceHistory || [stock.basePrice]).slice(-12), newPrice];

    return {
      ...stock,
      sharePrice: newPrice,
      marketCap: Math.round(newPrice * stock.totalShares),
      dailyChangePercent: Math.round(changePercent * 10) / 10,
      priceHistory: history,
    };
  });

  return {
    ...state,
    stocks: updatedStocks,
  };
}

/**
 * Buys shares with 0.5% brokerage fee
 */
export function buyShares(
  profile: PlayerProfile,
  state: StockMarketState,
  companyId: string,
  sharesCount: number,
): { updatedProfile: PlayerProfile; updatedState: StockMarketState; error?: string } {
  if (sharesCount <= 0 || !Number.isInteger(sharesCount)) {
    return { updatedProfile: profile, updatedState: state, error: 'عدد الأسهم غير صحيح' };
  }

  const stock = state.stocks.find((s) => s.id === companyId);
  if (!stock) {
    return { updatedProfile: profile, updatedState: state, error: 'الشركة غير مدرجة بالبورصة' };
  }

  const grossCost = Math.round(stock.sharePrice * sharesCount);
  const commission = Math.max(1, Math.round(grossCost * BROKERAGE_COMMISSION_RATE));
  const totalCost = grossCost + commission;

  if (profile.bankBalance < totalCost) {
    return {
      updatedProfile: profile,
      updatedState: state,
      error: `السيولة غير كافية. الإجمالي المطلوب مع العمولة (0.5%): ${totalCost.toLocaleString()} $`,
    };
  }

  const existingHolding = state.holdings[companyId] || {
    companyId,
    sharesOwned: 0,
    totalInvested: 0,
    averageCostPerShare: stock.sharePrice,
  };

  const newSharesOwned = existingHolding.sharesOwned + sharesCount;
  const newTotalInvested = existingHolding.totalInvested + totalCost;
  const newAvgCost = Math.round((newTotalInvested / newSharesOwned) * 10) / 10;

  const updatedHoldings: Record<string, StockHolding> = {
    ...state.holdings,
    [companyId]: {
      companyId,
      sharesOwned: newSharesOwned,
      totalInvested: newTotalInvested,
      averageCostPerShare: newAvgCost,
    },
  };

  const ledgerEntry: FinanceLedgerEntry = {
    id: `stock-buy-${Date.now()}`,
    category: 'expense',
    amount: totalCost,
    countryId: profile.countryId,
    occurredAt: new Date().toISOString(),
    note: `شراء ${sharesCount.toLocaleString()} سهم في [${stock.name} (${stock.ticker})] (عمولة وساطة ${commission.toLocaleString()} $)`,
  };

  const updatedProfile: PlayerProfile = {
    ...profile,
    bankBalance: profile.bankBalance - totalCost,
    finances: {
      ...profile.finances,
      totalExpenses: (profile.finances?.totalExpenses ?? 0) + totalCost,
    },
    ledger: [ledgerEntry, ...(profile.ledger || [])],
  };

  const updatedState: StockMarketState = {
    ...state,
    holdings: updatedHoldings,
  };

  saveStockMarketState(profile.id, updatedState);
  return { updatedProfile, updatedState };
}

/**
 * Sells shares with 0.5% brokerage fee
 */
export function sellShares(
  profile: PlayerProfile,
  state: StockMarketState,
  companyId: string,
  sharesCount: number,
): { updatedProfile: PlayerProfile; updatedState: StockMarketState; error?: string } {
  if (sharesCount <= 0 || !Number.isInteger(sharesCount)) {
    return { updatedProfile: profile, updatedState: state, error: 'عدد الأسهم غير صحيح' };
  }

  const stock = state.stocks.find((s) => s.id === companyId);
  const holding = state.holdings[companyId];

  if (!stock || !holding || holding.sharesOwned < sharesCount) {
    return { updatedProfile: profile, updatedState: state, error: 'لا تملك هذا العدد من الأسهم' };
  }

  const grossRevenue = Math.round(stock.sharePrice * sharesCount);
  const commission = Math.max(1, Math.round(grossRevenue * BROKERAGE_COMMISSION_RATE));
  const netProceeds = grossRevenue - commission;

  const costOfSoldShares = Math.round(holding.averageCostPerShare * sharesCount);
  const netProfitOnTrade = netProceeds - costOfSoldShares;

  const remainingShares = holding.sharesOwned - sharesCount;
  const updatedHoldings: Record<string, StockHolding> = { ...state.holdings };

  if (remainingShares <= 0) {
    delete updatedHoldings[companyId];
  } else {
    updatedHoldings[companyId] = {
      ...holding,
      sharesOwned: remainingShares,
      totalInvested: Math.max(0, holding.totalInvested - costOfSoldShares),
    };
  }

  const ledgerEntry: FinanceLedgerEntry = {
    id: `stock-sell-${Date.now()}`,
    category: 'revenue',
    amount: netProceeds,
    countryId: profile.countryId,
    occurredAt: new Date().toISOString(),
    note: `بيع ${sharesCount.toLocaleString()} سهم في [${stock.name} (${stock.ticker})] صافي بعد عمولة 0.5% (${commission.toLocaleString()} $)`,
  };

  const updatedProfile: PlayerProfile = {
    ...profile,
    bankBalance: profile.bankBalance + netProceeds,
    finances: {
      ...profile.finances,
      totalRevenue: (profile.finances?.totalRevenue ?? 0) + netProceeds,
      netProfit: (profile.finances?.netProfit ?? 0) + netProfitOnTrade,
    },
    ledger: [ledgerEntry, ...(profile.ledger || [])],
  };

  const updatedState: StockMarketState = {
    ...state,
    holdings: updatedHoldings,
  };

  saveStockMarketState(profile.id, updatedState);
  return { updatedProfile, updatedState };
}

/**
 * Calculates current total value of player's stock portfolio
 */
export function calculatePortfolioMetrics(state: StockMarketState): {
  totalEquityValue: number;
  totalCostBasis: number;
  unrealizedProfitLoss: number;
  dailyDividendIncome: number;
  seasonalProjectedBonus: number;
  heldCompaniesCount: number;
} {
  let totalEquityValue = 0;
  let totalCostBasis = 0;
  let dailyDividendIncome = 0;
  let seasonalProjectedBonus = 0;
  let heldCompaniesCount = 0;

  Object.values(state.holdings).forEach((holding) => {
    if (holding.sharesOwned > 0) {
      const stock = state.stocks.find((s) => s.id === holding.companyId);
      if (stock) {
        heldCompaniesCount += 1;
        const equity = stock.sharePrice * holding.sharesOwned;
        totalEquityValue += equity;
        totalCostBasis += holding.totalInvested;

        // Daily continuous dividend
        const dailyYield = (stock.dailyDividendYieldPercent / 100) * equity;
        dailyDividendIncome += dailyYield;

        // Seasonal milestone bonus
        seasonalProjectedBonus += stock.seasonalDividendBonusPerShare * holding.sharesOwned;
      }
    }
  });

  return {
    totalEquityValue: Math.round(totalEquityValue),
    totalCostBasis: Math.round(totalCostBasis),
    unrealizedProfitLoss: Math.round(totalEquityValue - totalCostBasis),
    dailyDividendIncome: Math.round(dailyDividendIncome),
    seasonalProjectedBonus: Math.round(seasonalProjectedBonus),
    heldCompaniesCount,
  };
}

/**
 * Disburses daily operational dividends & milestone seasonal bonus
 */
export function disburseHybridDividends(
  profile: PlayerProfile,
  state: StockMarketState,
  isSeasonalMilestone: boolean = false,
): { updatedProfile: PlayerProfile; updatedState: StockMarketState; payout: number; details: string } {
  const metrics = calculatePortfolioMetrics(state);
  let totalPayout = metrics.dailyDividendIncome;
  let details = `توزيعات أرباح تشغيلية يومية: +${metrics.dailyDividendIncome.toLocaleString()} $`;

  if (isSeasonalMilestone && metrics.seasonalProjectedBonus > 0) {
    totalPayout += metrics.seasonalProjectedBonus;
    details += ` + مكافأة التوزيعات الموسمية الكبرى: +${metrics.seasonalProjectedBonus.toLocaleString()} $`;
  }

  if (totalPayout <= 0) {
    return { updatedProfile: profile, updatedState: state, payout: 0, details: 'لا توجد أسهم تدر توزيعات' };
  }

  const ledgerEntry: FinanceLedgerEntry = {
    id: `stock-dividend-${Date.now()}`,
    category: 'revenue',
    amount: totalPayout,
    countryId: profile.countryId,
    occurredAt: new Date().toISOString(),
    note: details,
  };

  const updatedProfile: PlayerProfile = {
    ...profile,
    bankBalance: profile.bankBalance + totalPayout,
    finances: {
      ...profile.finances,
      totalRevenue: (profile.finances?.totalRevenue ?? 0) + totalPayout,
      netProfit: (profile.finances?.netProfit ?? 0) + totalPayout,
    },
    ledger: [ledgerEntry, ...(profile.ledger || [])],
  };

  const updatedState: StockMarketState = {
    ...state,
    totalDividendsCollected: state.totalDividendsCollected + totalPayout,
    lastDividendDay: profile.day,
  };

  saveStockMarketState(profile.id, updatedState);
  return { updatedProfile, updatedState, payout: totalPayout, details };
}
