import { useState, useEffect } from 'react';
import type { PlayerProfile } from '../domain/player';
import type { CountryDefinition } from '../domain/countries';
import type { GameCommand } from '../game/engine';
import { formatMoney, formatNumber } from '../domain/formatters';
import { GOLD_PRICE_PER_GRAM, INVESTMENT_CATALOG } from '../game/catalog';
import { buyGold, sellGold, buyGoldWithDiamonds, createInvestment, type GameResult } from '../game/engine';
import { PurchaseOptions } from './PurchaseOptions';
import { Icon } from './Icon';
import './StockExchangeTerminal.css';

interface StockExchangeTerminalProps {
  profile: PlayerProfile;
  country: CountryDefinition;
  onCommand: (command: GameCommand, fallback: (current: PlayerProfile) => GameResult<unknown>) => void;
  onAction: (result: GameResult<unknown>) => void;
}

interface MarketTicker {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  isUp: boolean;
  category: 'gold' | 'stocks' | 'commodities' | 'realestate' | 'bonds';
}

export function StockExchangeTerminal({ profile, country, onCommand, onAction }: StockExchangeTerminalProps) {
  const [selectedAssetSymbol, setSelectedAssetSymbol] = useState<string>('GOLD');
  const [tradeMode, setTradeMode] = useState<'buy' | 'sell'>('buy');
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '1Y'>('1D');
  const [tradeAmount, setTradeAmount] = useState<string>('1.0');
  const [investAmount, setInvestAmount] = useState<string>('50000');
  const [selectedInvestmentId, setSelectedInvestmentId] = useState<string>(INVESTMENT_CATALOG[0]?.id ?? '');

  // Market Tickers State with slight dynamic fluctuation simulation
  const [tickers, setTickers] = useState<MarketTicker[]>([
    { symbol: 'XAU/EGP', name: 'الذهب المالي', price: GOLD_PRICE_PER_GRAM, changePercent: +2.45, isUp: true, category: 'gold' },
    { symbol: 'SULY30', name: 'مؤشر سولي 30', price: 18450.2, changePercent: +1.82, isUp: true, category: 'stocks' },
    { symbol: 'OIL/BRENT', name: 'نفط برنت الخام', price: 82.4, changePercent: -0.65, isUp: false, category: 'commodities' },
    { symbol: 'STEEL/TON', name: 'عقود الفولاذ الآجلة', price: 14200, changePercent: +3.10, isUp: true, category: 'commodities' },
    { symbol: 'IND-LAND', name: 'مؤشر الأراضي الصناعية', price: 950000, changePercent: +0.95, isUp: true, category: 'realestate' },
    { symbol: 'EMPIRE-BOND', name: 'سندات السيادة الإمبراطورية', price: 1000, changePercent: +0.12, isUp: true, category: 'bonds' },
  ]);

  // Simulate subtle real-time price updates every 3 seconds for ticker feel
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

  // Simulated chart SVG path generation based on timeframe
  const generateChartPoints = () => {
    const pointsCount = 20;
    const basePrice = selectedTicker.price;
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

  return (
    <div className="stock-terminal-container">
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
                <label htmlFor="invest-amount-input">مبلغ الاستثمار (ج.م)</label>
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
    </div>
  );
}
