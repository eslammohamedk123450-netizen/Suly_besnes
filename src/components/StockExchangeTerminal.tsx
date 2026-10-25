import { useState, useEffect } from 'react';
import type { PlayerProfile } from '../domain/player';
import type { CountryDefinition } from '../domain/countries';
import type { GameCommand } from '../game/engine';
import { formatCurrency, formatMoney, formatNumber } from '../domain/formatters';
import { GOLD_PRICE_PER_GRAM, INVESTMENT_CATALOG } from '../game/catalog';
import { buyGold, sellGold, buyGoldWithDiamonds, createInvestment, type GameResult } from '../game/engine';
import { PurchaseOptions } from './PurchaseOptions';
import { Icon } from './Icon';
import {
  loadExpansionState,
  saveExpansionState,
  launchPlayerIPO,
  buyRivalCompanyShares,
  sellRivalCompanyShares,
} from '../game/expansionEngine';
import './StockExchangeTerminal.css';

interface StockExchangeTerminalProps {
  profile: PlayerProfile;
  country: CountryDefinition;
  onCommand: (command: GameCommand, fallback: (current: PlayerProfile) => GameResult<unknown>) => void;
  onAction: (result: GameResult<unknown>) => void;
  onProfileUpdate?: (updated: PlayerProfile) => void;
}

interface MarketTicker {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  isUp: boolean;
  category: 'gold' | 'stocks' | 'commodities' | 'realestate' | 'bonds';
}

export function StockExchangeTerminal({ profile, country, onCommand, onAction, onProfileUpdate }: StockExchangeTerminalProps) {
  const [activeTab, setActiveTab] = useState<'terminal' | 'ipo' | 'rivals'>('terminal');
  const [selectedAssetSymbol, setSelectedAssetSymbol] = useState<string>('GOLD');
  const [tradeMode, setTradeMode] = useState<'buy' | 'sell'>('buy');
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '1Y'>('1D');
  const [tradeAmount, setTradeAmount] = useState<string>('1.0');
  const [investAmount, setInvestAmount] = useState<string>('50000');
  const [selectedInvestmentId, setSelectedInvestmentId] = useState<string>(INVESTMENT_CATALOG[0]?.id ?? '');

  // Expansion State for IPO and Rival Stocks
  const [expansion, setExpansion] = useState(() => loadExpansionState(profile));
  const [ipoOfferPercent, setIpoOfferPercent] = useState<number>(30);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Market Tickers State with dynamic fluctuation simulation
  const [tickers, setTickers] = useState<MarketTicker[]>([
    { symbol: 'XAU/EGP', name: 'الذهب المالي', price: GOLD_PRICE_PER_GRAM, changePercent: +2.45, isUp: true, category: 'gold' },
    { symbol: 'SULY30', name: 'مؤشر سولي 30', price: 18450.2, changePercent: +1.82, isUp: true, category: 'stocks' },
    { symbol: 'OIL/BRENT', name: 'نفط برنت الخام', price: 82.4, changePercent: -0.65, isUp: false, category: 'commodities' },
    { symbol: 'STEEL/TON', name: 'عقود الفولاذ الآجلة', price: 14200, changePercent: +3.10, isUp: true, category: 'commodities' },
    { symbol: 'IND-LAND', name: 'مؤشر الأراضي الصناعية', price: 950000, changePercent: +0.95, isUp: true, category: 'realestate' },
    { symbol: 'EMPIRE-BOND', name: 'سندات السيادة الإمبراطورية', price: 1000, changePercent: +0.12, isUp: true, category: 'bonds' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickers((prevTickers) =>
        prevTickers.map((ticker) => {
          const deltaPercent = (Math.random() - 0.48) * 0.4;
          const newPrice = Math.max(1, ticker.price * (1 + deltaPercent / 100));
          return {
            ...ticker,
            price: Number(newPrice.toFixed(2)),
            changePercent: Number((ticker.changePercent + deltaPercent).toFixed(2)),
            isUp: deltaPercent >= 0,
          };
        })
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const selectedTicker = tickers.find((t) => t.symbol === selectedAssetSymbol) || tickers[0];

  const goldQuantity = Number(tradeAmount) || 0;
  const goldBuyCost = Math.round(goldQuantity * GOLD_PRICE_PER_GRAM);
  const goldSellRevenue = Math.round(goldQuantity * GOLD_PRICE_PER_GRAM * 0.97);

  const generateChartPoints = () => {
    const pointsCount = 20;
    const points: { x: number; y: number }[] = [];
    let currentY = 120;

    for (let i = 0; i <= pointsCount; i++) {
      const x = (i / pointsCount) * 500;
      const variation = (Math.sin(i * 0.8) + (Math.random() - 0.45)) * 30;
      currentY = Math.max(20, Math.min(220, currentY + variation));
      points.push({ x, y: currentY });
    }

    const pathD = points.reduce((acc, p, index) => {
      return index === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    const areaD = `${pathD} L 500 240 L 0 240 Z`;
    return { pathD, areaD, isGreen: selectedTicker.isUp };
  };

  const chart = generateChartPoints();

  // IPO Handlers
  const handleLaunchIPO = () => {
    const res = launchPlayerIPO(profile, expansion, ipoOfferPercent);
    if (res.error) {
      showToast(`❌ ${res.error}`);
    } else {
      setExpansion(res.updatedExpansion);
      if (onProfileUpdate) onProfileUpdate(res.updatedProfile);
      showToast(`📈 تم طرح الشركة بنجاح وحصد سيولة مالية من المساهمين! (+15 نقاط سمعة)`);
    }
  };

  const handleBuyRival = (companyId: string, shares: number) => {
    const res = buyRivalCompanyShares(profile, expansion, companyId, shares);
    if (res.error) {
      showToast(`❌ ${res.error}`);
    } else {
      setExpansion(res.updatedExpansion);
      if (onProfileUpdate) onProfileUpdate(res.updatedProfile);
      showToast(`🤝 تم الاستحواذ على الأسهم بنجاح واشتراك الأرباح!`);
    }
  };

  const handleSellRival = (companyId: string, shares: number) => {
    const res = sellRivalCompanyShares(profile, expansion, companyId, shares);
    if (res.error) {
      showToast(`❌ ${res.error}`);
    } else {
      setExpansion(res.updatedExpansion);
      if (onProfileUpdate) onProfileUpdate(res.updatedProfile);
      showToast(`💰 تم بيع الأسهم وإضافة السيولة لحسابك!`);
    }
  };

  return (
    <div className="stock-terminal-container">
      {toastMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-amber-300 border border-amber-500/50 px-6 py-3 rounded-xl shadow-2xl font-bold text-sm animate-bounce">
          {toastMsg}
        </div>
      )}

      {/* Terminal Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 border border-amber-500/30 p-3 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏛️</span>
          <h2 className="text-lg font-black text-amber-300">بورصة سولي المالية والأسهم (Wall Street Terminal)</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'terminal'
                ? 'bg-amber-500 text-slate-950 shadow-lg'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            📊 الشاشة اللحظية للأصول
          </button>

          <button
            onClick={() => setActiveTab('ipo')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'ipo'
                ? 'bg-amber-500 text-slate-950 shadow-lg'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            📈 طرح شركتك (IPO)
          </button>

          <button
            onClick={() => setActiveTab('rivals')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'rivals'
                ? 'bg-amber-500 text-slate-950 shadow-lg'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            💼 أسهم المنافسين والأرباح
          </button>
        </div>
      </div>

      {activeTab === 'ipo' && (
        <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-6 flex flex-col gap-6 text-slate-100 mt-2">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🏢</span>
            <div>
              <h3 className="text-xl font-black text-amber-300">طرح شركتك للاكتتاب العام (Initial Public Offering - IPO)</h3>
              <p className="text-xs text-slate-300 mt-1">
                حوّل إمبراطوريتك الخاصة إلى شركة مساهمة عامة مدرجة في البورصة لحصد ملايين السيولة وتوزيع أرباح دورية!
              </p>
            </div>
          </div>

          {expansion.ipoState.isPublic ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">رمز التداول (Ticker)</div>
                <div className="text-xl font-black text-amber-400 font-mono mt-1">{expansion.ipoState.ticker}</div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">سعر السهم الحالي</div>
                <div className="text-xl font-black text-emerald-400 mt-1">
                  {formatCurrency(expansion.ipoState.sharePrice, 'EGP')}
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">القيمة السوقية (Market Cap)</div>
                <div className="text-xl font-black text-purple-300 mt-1">
                  {formatCurrency(expansion.ipoState.marketCap, 'EGP')}
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">نسبة التوزيعات (Dividends)</div>
                <div className="text-xl font-black text-cyan-400 mt-1">{expansion.ipoState.dividendRatePercent}% سنويًا</div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950/80 p-6 rounded-xl border border-slate-800 flex flex-col gap-4">
              <div className="text-sm font-bold text-slate-200">إعدادات عملية الطرح العام:</div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-400">النسبة المعروضة للجمهور والمساهمين:</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="10"
                    max="49"
                    value={ipoOfferPercent}
                    onChange={(e) => setIpoOfferPercent(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <span className="text-lg font-black text-amber-400 font-mono">{ipoOfferPercent}%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-900 p-4 rounded-lg">
                <div>
                  رسوم الاكتتاب والتسجيل: <span className="font-bold text-rose-400">500,000 $</span>
                </div>
                <div>
                  السيولة التقديرية المكتسبة: <span className="font-bold text-emerald-400">+{formatCurrency(ipoOfferPercent * 500000, 'EGP')}</span>
                </div>
                <div>
                  التقييم الائتماني المبدئي: <span className="font-bold text-amber-300">AAA</span>
                </div>
              </div>

              <button
                onClick={handleLaunchIPO}
                disabled={profile.bankBalance < 500000}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
              >
                تأكيد وبدء الاكتتاب العام في البورصة 🚀
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'rivals' && (
        <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-6 flex flex-col gap-4 text-slate-100 mt-2">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🤝</span>
            <div>
              <h3 className="text-xl font-black text-amber-300">شراء أسهم الكيانات الاستثمارية المنافسة</h3>
              <p className="text-xs text-slate-300 mt-1">
                استثمر في كبرى الشركات الوطنية والدولية، واضمن عوائد توزيعات الأرباح الدورية بحسابك!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expansion.rivalCompanies.map((c) => {
              const totalCost100 = c.sharePrice * 100;
              const canAfford = profile.bankBalance >= totalCost100;

              return (
                <div key={c.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{c.logo}</span>
                      <div>
                        <h4 className="font-bold text-sm text-slate-100">{c.name}</h4>
                        <span className="text-[11px] text-slate-400 font-mono">{c.ticker} • {c.sector}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-400">+{c.dividendYieldPercent}% أرباح</span>
                  </div>

                  <p className="text-xs text-slate-300">{c.description}</p>

                  <div className="flex items-center justify-between text-xs bg-slate-900 p-2 rounded-lg">
                    <span>سعر السهم: <strong className="text-amber-300">{formatCurrency(c.sharePrice, 'EGP')}</strong></span>
                    <span>أسهمك: <strong className="text-purple-300">{c.playerSharesOwned} سهم</strong></span>
                  </div>

                  <div className="flex items-center gap-2 mt-auto">
                    <button
                      onClick={() => handleBuyRival(c.id, 100)}
                      disabled={!canAfford}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg disabled:opacity-50 transition-all"
                    >
                      شراء 100 سهم ({formatCurrency(totalCost100, 'EGP')})
                    </button>
                    {c.playerSharesOwned >= 100 && (
                      <button
                        onClick={() => handleSellRival(c.id, 100)}
                        className="py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition-all"
                      >
                        بيع 100
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'terminal' && (
        <>
          {/* 1. Top Ticker Tape */}
          <div className="stock-ticker-tape">
            {tickers.map((t) => (
              <div
                key={t.symbol}
                className={`stock-ticker-item ${t.symbol === selectedAssetSymbol ? 'is-selected' : ''}`}
                onClick={() => setSelectedAssetSymbol(t.symbol)}
                style={{ cursor: 'pointer' }}
              >
                <span className="stock-ticker-symbol">{t.symbol}</span>
                <span className="stock-ticker-price">{formatNumber(t.price)}</span>
                <span className={`stock-ticker-change ${t.isUp ? 'stock-ticker-change--up' : 'stock-ticker-change--down'}`}>
                  {t.isUp ? '▲' : '▼'} {Math.abs(t.changePercent)}%
                </span>
              </div>
            ))}
          </div>

          {/* 2. Main Terminal Grid */}
          <div className="stock-terminal-grid">
            {/* Column 1: Asset Selector Sidebar */}
            <div className="stock-sidebar">
              <div className="stock-sidebar-title">
                <Icon name="investment" size={18} />
                <span>قائمة الأصول المالية</span>
              </div>

              <div className="stock-asset-list">
                {tickers.map((t) => (
                  <div
                    key={t.symbol}
                    className={`stock-asset-card ${t.symbol === selectedAssetSymbol ? 'is-selected' : ''}`}
                    onClick={() => setSelectedAssetSymbol(t.symbol)}
                  >
                    <div className="stock-asset-meta">
                      <strong>{t.name}</strong>
                      <small>{t.symbol}</small>
                    </div>
                    <div className="stock-asset-price-box">
                      <strong>{formatNumber(t.price)}</strong>
                      <span className={`stock-ticker-change ${t.isUp ? 'stock-ticker-change--up' : 'stock-ticker-change--down'}`}>
                        {t.isUp ? '+' : ''}{t.changePercent}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Interactive SVG Candle/Area Chart Panel */}
            <div className="stock-chart-panel">
              <div className="stock-chart-header">
                <div className="stock-chart-headline">
                  <div className="stock-chart-symbol-badge">
                    {selectedAssetSymbol.substring(0, 3)}
                  </div>
                  <div className="stock-chart-title-box">
                    <h2>{selectedTicker.name}</h2>
                    <span>رمز التداول: {selectedTicker.symbol}</span>
                  </div>
                </div>

                <div className="stock-chart-big-price">
                  <strong>{formatMoney(selectedTicker.price, country)}</strong>
                  <span className={`stock-ticker-change ${selectedTicker.isUp ? 'stock-ticker-change--up' : 'stock-ticker-change--down'}`}>
                    {selectedTicker.isUp ? '▲' : '▼'} {selectedTicker.changePercent}%
                  </span>
                </div>

                <div className="stock-timeframe-selector">
                  {(['1D', '1W', '1M', '1Y'] as const).map((tf) => (
                    <button
                      key={tf}
                      type="button"
                      className={`stock-tf-btn ${timeframe === tf ? 'is-active' : ''}`}
                      onClick={() => setTimeframe(tf)}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* SVG Professional Terminal Chart */}
              <div className="stock-svg-chart-container">
                <svg className="stock-chart-svg" viewBox="0 0 500 240" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGradientGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="chartGradientRed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  <line x1="0" y1="60" x2="500" y2="60" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                  <line x1="0" y1="120" x2="500" y2="120" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                  <line x1="0" y1="180" x2="500" y2="180" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

                  {/* Area Fill */}
                  <path
                    d={chart.areaD}
                    fill={chart.isGreen ? 'url(#chartGradientGreen)' : 'url(#chartGradientRed)'}
                  />

                  {/* Trend Line */}
                  <path
                    d={chart.pathD}
                    fill="none"
                    stroke={chart.isGreen ? '#34d399' : '#fca5a5'}
                    strokeWidth="2.5"
                  />
                </svg>
              </div>

              {/* Additional Asset Stats */}
              <div className="economy-grid economy-grid--three-mobile" style={{ marginTop: '8px' }}>
                <div className="economy-stat">
                  <span className="economy-stat-label">أعلى سعر اليوم</span>
                  <strong className="economy-stat-value">{formatMoney(selectedTicker.price * 1.04, country)}</strong>
                </div>
                <div className="economy-stat">
                  <span className="economy-stat-label">أدنى سعر اليوم</span>
                  <strong className="economy-stat-value">{formatMoney(selectedTicker.price * 0.96, country)}</strong>
                </div>
                <div className="economy-stat">
                  <span className="economy-stat-label">حجم التداول اليومي</span>
                  <strong className="economy-stat-value">{formatMoney(14250000, country)}</strong>
                </div>
              </div>
            </div>

            {/* Column 3: Order Execution & Order Book Depth */}
            <div className="stock-trading-panel">
              <div className="stock-trade-type-tabs">
                <button
                  type="button"
                  className={`stock-trade-tab stock-trade-tab--buy ${tradeMode === 'buy' ? 'is-active' : ''}`}
                  onClick={() => setTradeMode('buy')}
                >
                  شراء أصل
                </button>
                <button
                  type="button"
                  className={`stock-trade-tab stock-trade-tab--sell ${tradeMode === 'sell' ? 'is-active' : ''}`}
                  onClick={() => setTradeMode('sell')}
                >
                  بيع أصل
                </button>
              </div>

              {selectedAssetSymbol === 'XAU/EGP' ? (
                /* Direct Gold Trading Form */
                <div className="stock-order-form">
                  <div className="stock-field-group">
                    <label htmlFor="gold-trade-qty">الكمية بالجرام (xau)</label>
                    <input
                      id="gold-trade-qty"
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={tradeAmount}
                      onChange={(e) => setTradeAmount(e.target.value)}
                    />
                  </div>

                  <div className="stock-field-group">
                    <label>إجمالي القيمة المقدرة</label>
                    <input
                      type="text"
                      readOnly
                      value={tradeMode === 'buy' ? formatMoney(goldBuyCost, country) : formatMoney(goldSellRevenue, country)}
                    />
                  </div>

                  {tradeMode === 'buy' ? (
                    <PurchaseOptions
                      country={country}
                      cashPrice={goldBuyCost}
                      diamondPrice={Number.isInteger(goldQuantity * 0.5) ? goldQuantity * 0.5 : 0}
                      bankBalance={profile.bankBalance}
                      diamondsBalance={profile.diamonds}
                      disabled={!Number.isFinite(goldQuantity) || goldQuantity <= 0}
                      cashLabel="تنفيذ شراء نقدًا"
                      diamondLabel="تنفيذ شراء بالماس"
                      note="100 جرام = 50 ماسة"
                      onPurchase={(paymentMethod) =>
                        paymentMethod === 'diamonds'
                          ? onCommand({ name: 'buy_gold_with_diamonds', args: { grams: goldQuantity } }, (cur) =>
                              buyGoldWithDiamonds(cur, goldQuantity)
                            )
                          : onCommand({ name: 'buy_gold', args: { grams: goldQuantity } }, (cur) =>
                              buyGold(cur, goldQuantity)
                            )
                      }
                    />
                  ) : (
                    <button
                      type="button"
                      className="stock-btn-trade-execute stock-btn-trade-execute--sell"
                      disabled={!Number.isFinite(goldQuantity) || goldQuantity <= 0 || goldQuantity > profile.goldGrams}
                      onClick={() =>
                        onCommand({ name: 'sell_gold', args: { grams: goldQuantity } }, (cur) =>
                          sellGold(cur, goldQuantity)
                        )
                      }
                    >
                      تأكيد بيع الذهب
                    </button>
                  )}
                </div>
              ) : (
                /* Investment Instruments Form */
                <div className="stock-order-form">
                  <div className="stock-field-group">
                    <label htmlFor="invest-type-select">الأداة الاستثمارية</label>
                    <select
                      id="invest-type-select"
                      value={selectedInvestmentId}
                      onChange={(e) => setSelectedInvestmentId(e.target.value)}
                      style={{
                        padding: '10px',
                        background: '#060e19',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontWeight: 800,
                      }}
                    >
                      {INVESTMENT_CATALOG.map((inv) => (
                        <option key={inv.id} value={inv.id}>
                          {inv.name} ({inv.durationDays} يوم - عائد {Math.round(inv.returnRate * 100)}%)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="stock-field-group">
                    <label htmlFor="invest-amount-input">مبلغ الاستثمار ($)</label>
                    <input
                      id="invest-amount-input"
                      type="number"
                      step="1000"
                      value={investAmount}
                      onChange={(e) => setInvestAmount(e.target.value)}
                    />
                  </div>

                  <button
                    type="button"
                    className="stock-btn-trade-execute stock-btn-trade-execute--buy"
                    disabled={Number(investAmount) > profile.bankBalance || Number(investAmount) < 10000}
                    onClick={() =>
                      onCommand(
                        { name: 'create_investment', args: { investmentId: selectedInvestmentId, amount: Number(investAmount) } },
                        (cur) => createInvestment(cur, selectedInvestmentId, Number(investAmount))
                      )
                    }
                  >
                    تأكيد الاكتتاب المالي
                  </button>
                </div>
              )}

              {/* Depth / Live Order Book Table */}
              <div className="stock-orderbook-box">
                <span className="stock-orderbook-title">عمق السوق (Order Book)</span>
                <div className="stock-orderbook-table">
                  <div className="stock-orderbook-row stock-orderbook-row--ask">
                    <span>عرض (Sell)</span>
                    <span>{formatNumber(selectedTicker.price * 1.01)}</span>
                    <span>120 unit</span>
                  </div>
                  <div className="stock-orderbook-row stock-orderbook-row--ask">
                    <span>عرض (Sell)</span>
                    <span>{formatNumber(selectedTicker.price * 1.005)}</span>
                    <span>450 unit</span>
                  </div>
                  <div className="stock-orderbook-row stock-orderbook-row--bid">
                    <span>طلب (Buy)</span>
                    <span>{formatNumber(selectedTicker.price * 0.995)}</span>
                    <span>310 unit</span>
                  </div>
                  <div className="stock-orderbook-row stock-orderbook-row--bid">
                    <span>طلب (Buy)</span>
                    <span>{formatNumber(selectedTicker.price * 0.990)}</span>
                    <span>890 unit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
