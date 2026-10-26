import { useState, useEffect, useMemo } from 'react';
import type { PlayerProfile } from '../domain/player';
import type { CountryDefinition } from '../domain/countries';
import type { GameCommand } from '../game/engine';
import { buyGold, buyGoldWithDiamonds, sellGold } from '../game/engine';
import { formatCurrency, formatMoney, formatNumber } from '../domain/formatters';
import { GOLD_PRICE_PER_GRAM } from '../game/catalog';
import { playSound } from '../game/soundEffects';
import { Icon } from './Icon';
import {
  loadStockMarketState,
  saveStockMarketState,
  simulateMarketFluctuation,
  buyShares,
  sellShares,
  calculatePortfolioMetrics,
  disburseHybridDividends,
  BROKERAGE_COMMISSION_RATE,
  type StockCompany,
  type StockMarketState,
} from '../game/stockMarket';
import {
  loadExpansionState,
  launchPlayerIPO,
} from '../game/expansionEngine';
import './StockExchangeTerminal.css';
import { TrendingUp, TrendingDown, DollarSign, Wallet, ShieldCheck, Flame, Sparkles, Building2, Coins, ArrowUpDown, ChevronDown, Check, RefreshCw } from 'lucide-react';

interface StockExchangeTerminalProps {
  profile: PlayerProfile;
  country: CountryDefinition;
  onCommand?: (command: GameCommand, fallback: (current: PlayerProfile) => any) => void;
  onAction?: (result: any) => void;
  onProfileUpdate?: (updated: PlayerProfile) => void;
}

export function StockExchangeTerminal({
  profile,
  country,
  onCommand,
  onProfileUpdate,
}: StockExchangeTerminalProps) {
  const [activeTab, setActiveTab] = useState<'stocks' | 'ipo' | 'gold'>('stocks');
  const [stockState, setStockState] = useState<StockMarketState>(() => loadStockMarketState(profile.id));
  const [selectedStockId, setSelectedStockId] = useState<string>('soly_energy');
  const [tradeAction, setTradeAction] = useState<'buy' | 'sell'>('buy');
  const [sharesInput, setSharesInput] = useState<string>('50');
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // IPO state from expansion
  const [expansion, setExpansion] = useState(() => loadExpansionState(profile));
  const [ipoOfferPercent, setIpoOfferPercent] = useState<number>(30);

  // Gold simulation state
  const [goldTradeMode, setGoldTradeMode] = useState<'buy' | 'sell'>('buy');
  const [goldGramsInput, setGoldGramsInput] = useState<string>('1.0');

  const runGoldCommand = (command: GameCommand, fallback: (current: PlayerProfile) => any) => {
    if (onCommand) {
      onCommand(command, fallback);
      return;
    }
    const result = fallback(profile);
    if (result?.ok && onProfileUpdate) onProfileUpdate(result.profile);
    showToast(result?.message ?? 'تعذر تنفيذ العملية.', result?.ok ? 'success' : 'error');
  };

  const handleGoldTrade = (mode: 'buy' | 'sell' | 'diamonds') => {
    const grams = Number(goldGramsInput);
    playSound('click');
    if (mode === 'buy') runGoldCommand({ name: 'buy_gold', args: { grams } }, (current) => buyGold(current, grams));
    if (mode === 'sell') runGoldCommand({ name: 'sell_gold', args: { grams } }, (current) => sellGold(current, grams));
    if (mode === 'diamonds') runGoldCommand({ name: 'buy_gold_with_diamonds', args: { grams } }, (current) => buyGoldWithDiamonds(current, grams));
  };

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3800);
  };

  // Periodic market volatility fluctuation (every 6 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setStockState((prev) => {
        const next = simulateMarketFluctuation(prev);
        saveStockMarketState(profile.id, next);
        return next;
      });
    }, 6000);

    return () => clearInterval(timer);
  }, [profile.id]);

  const portfolioMetrics = useMemo(() => calculatePortfolioMetrics(stockState), [stockState]);
  const activeStock = stockState.stocks.find((s) => s.id === selectedStockId) || stockState.stocks[0];
  const activeHolding = stockState.holdings[activeStock.id] || { sharesOwned: 0, totalInvested: 0, averageCostPerShare: 0 };

  // Calculate trade totals
  const numShares = Math.max(1, parseInt(sharesInput, 10) || 0);
  const grossTradeAmount = Math.round(numShares * activeStock.sharePrice);
  const brokerageCommission = Math.max(1, Math.round(grossTradeAmount * BROKERAGE_COMMISSION_RATE));
  const totalBuyCost = grossTradeAmount + brokerageCommission;
  const netSellProceeds = grossTradeAmount - brokerageCommission;

  // Handle Share Purchase
  const handleExecuteBuy = () => {
    playSound('click');
    const { updatedProfile, updatedState, error } = buyShares(profile, stockState, activeStock.id, numShares);
    if (error) {
      showToast(error, 'error');
      return;
    }

    setStockState(updatedState);
    if (onProfileUpdate) onProfileUpdate(updatedProfile);
    playSound('stock');
    showToast(
      `تم شراء ${numShares.toLocaleString()} سهم في ${activeStock.name} بنجاح! عمولة الوساطة (0.5%): ${formatMoney(brokerageCommission, country)}`,
      'success',
    );
  };

  // Handle Share Sale
  const handleExecuteSell = () => {
    playSound('click');
    const { updatedProfile, updatedState, error } = sellShares(profile, stockState, activeStock.id, numShares);
    if (error) {
      showToast(error, 'error');
      return;
    }

    setStockState(updatedState);
    if (onProfileUpdate) onProfileUpdate(updatedProfile);
    playSound('cash');
    showToast(
      `تم بيع ${numShares.toLocaleString()} سهم بنجاح! تم إيداع صافي السيولة ${formatMoney(netSellProceeds, country)} بحسابك.`,
      'success',
    );
  };

  // Handle Claiming Hybrid Dividends
  const handleClaimDividends = () => {
    playSound('click');
    const isMilestone = profile.day % 5 === 0;
    const { updatedProfile, updatedState, payout, details } = disburseHybridDividends(profile, stockState, isMilestone);
    if (payout <= 0) {
      showToast('لا توجد عوائد توزيعات مستحقة للصرف حالياً.', 'info');
      return;
    }

    setStockState(updatedState);
    if (onProfileUpdate) onProfileUpdate(updatedProfile);
    playSound('success');
    showToast(`تم استلام أرباح الأسهم: +${formatMoney(payout, country)} (${details}) 💰`, 'success');
  };

  // Handle IPO Launch
  const handleLaunchIPO = () => {
    playSound('click');
    const res = launchPlayerIPO(profile, expansion, ipoOfferPercent);
    if (res.error) {
      showToast(res.error, 'error');
    } else {
      setExpansion(res.updatedExpansion);
      if (onProfileUpdate) onProfileUpdate(res.updatedProfile);
      playSound('vip');
      showToast('📈 تم طرح شركتك للاكتتاب العام بنجاح وحصد سيولة مالية من كبار المساهمين!', 'success');
    }
  };

  // Mini Sparkline Renderer
  const renderSparkline = (points: number[], isPositive: boolean) => {
    if (!points || points.length < 2) return null;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 100;
    const height = 28;

    const coords = points.map((val, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    const strokeColor = isPositive ? '#10b981' : '#ef4444';

    return (
      <svg width={width} height={height} className="overflow-visible inline-block">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={coords}
        />
      </svg>
    );
  };

  return (
    <div className="stock-terminal-container max-w-7xl mx-auto space-y-4" dir="rtl">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-2xl shadow-2xl font-bold text-xs sm:text-sm text-center max-w-[90vw] animate-bounce border ${
            toastMsg.type === 'success'
              ? 'bg-emerald-950/95 text-emerald-300 border-emerald-500/60'
              : toastMsg.type === 'error'
              ? 'bg-rose-950/95 text-rose-300 border-rose-500/60'
              : 'bg-slate-900/95 text-amber-300 border-amber-500/60'
          }`}
        >
          {toastMsg.text}
        </div>
      )}

      {/* Terminal Top Navigation Header */}
      <div className="stock-nav-header">
        <div className="stock-nav-title">
          <span className="text-2xl sm:text-3xl">🏛️</span>
          <div>
            <h2>بورصة سولي المركزية للأسهم والاستثمار</h2>
            <span className="text-[11px] text-slate-400 block">
              تداول أسهم الشركات الوطنية · عوائد توزيعات هجينة يومية وموسمية
            </span>
          </div>
        </div>

        {/* 3 Nav Tabs */}
        <div className="stock-nav-tabs">
          <button
            onClick={() => setActiveTab('stocks')}
            className={`stock-nav-tab-btn ${activeTab === 'stocks' ? 'is-active' : ''}`}
          >
            📊 البورصة وتداول الأسهم
          </button>
          <button
            onClick={() => setActiveTab('ipo')}
            className={`stock-nav-tab-btn ${activeTab === 'ipo' ? 'is-active' : ''}`}
          >
            📈 طرح الاكتتاب العام (IPO)
          </button>
          <button
            onClick={() => setActiveTab('gold')}
            className={`stock-nav-tab-btn ${activeTab === 'gold' ? 'is-active' : ''}`}
          >
            🥇 الذهب والسلع
          </button>
        </div>
      </div>

      {/* Live Market Ticker Tape */}
      <div className="stock-ticker-tape">
        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-black text-[10px] shrink-0 flex items-center gap-1 border border-amber-500/30">
          <Flame className="w-3 h-3 text-amber-400" />
          البث اللحظي للأسعار
        </span>
        {stockState.stocks.map((stock) => {
          const isUp = stock.dailyChangePercent >= 0;
          return (
            <div
              key={stock.id}
              onClick={() => {
                setSelectedStockId(stock.id);
                playSound('click');
              }}
              className={`stock-ticker-item ${selectedStockId === stock.id ? 'is-selected' : ''}`}
            >
              <span>{stock.logo}</span>
              <span className="stock-ticker-symbol">{stock.ticker}</span>
              <span className="stock-ticker-price">{formatMoney(stock.sharePrice, country)}</span>
              <span className={`stock-ticker-change ${isUp ? 'stock-ticker-change--up' : 'stock-ticker-change--down'}`}>
                {isUp ? '▲' : '▼'} {Math.abs(stock.dailyChangePercent)}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Executive Portfolio Wealth & Dividends Card (Confirmed Decision 2) */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/40 rounded-3xl p-4 sm:p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h3 className="font-black text-sm sm:text-base text-white">
              محفظتك الاستثمارية ونظام العوائد الهجينة (Hybrid Dividends)
            </h3>
          </div>
          <button
            onClick={handleClaimDividends}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-950 text-xs font-black shadow-md transition flex items-center gap-1.5"
          >
            <Coins className="w-3.5 h-3.5" />
            صرف الأرباح المستحقة ({formatMoney(portfolioMetrics.dailyDividendIncome, country)})
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Equity Value */}
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-0.5">القيمة السوقية لمحفظة الأسهم</span>
            <strong className="text-base sm:text-xl font-black text-amber-400 font-mono block">
              {formatMoney(portfolioMetrics.totalEquityValue, country)}
            </strong>
            <span className="text-[10px] text-slate-400">
              مملوكة في {portfolioMetrics.heldCompaniesCount} شركات
            </span>
          </div>

          {/* Daily Continuous Dividend */}
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-emerald-500/30">
            <span className="text-[11px] text-slate-400 block mb-0.5">العائد التشغيلي اليومي المستمر</span>
            <strong className="text-base sm:text-xl font-black text-emerald-400 font-mono block">
              +{formatMoney(portfolioMetrics.dailyDividendIncome, country)} / يوم
            </strong>
            <span className="text-[10px] text-emerald-400/80 font-bold">
              يُصرف تلقائياً مع مرور كل يوم عمل
            </span>
          </div>

          {/* Seasonal Milestone Bonus */}
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-purple-500/30">
            <span className="text-[11px] text-slate-400 block mb-0.5">مكافأة التوزيعات الموسمية الكبرى</span>
            <strong className="text-base sm:text-xl font-black text-purple-300 font-mono block">
              +{formatMoney(portfolioMetrics.seasonalProjectedBonus, country)}
            </strong>
            <span className="text-[10px] text-purple-400/80 font-bold">
              تُصرف كل 5 أيام وعند إغلاق الدورة
            </span>
          </div>

          {/* Unrealized Gain/Loss */}
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block mb-0.5">صافي الأرباح الرأسمالية للأسهم</span>
            <strong
              className={`text-base sm:text-xl font-black font-mono block ${
                portfolioMetrics.unrealizedProfitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {portfolioMetrics.unrealizedProfitLoss >= 0 ? '+' : ''}
              {formatMoney(portfolioMetrics.unrealizedProfitLoss, country)}
            </strong>
            <span className="text-[10px] text-slate-400">
              فرق السعر السوقي عن سعر الشراء
            </span>
          </div>
        </div>
      </div>

      {activeTab === 'stocks' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left 2 Cols: Stocks Table & Cards */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between px-1 text-xs text-slate-400 font-bold">
              <span>قائمة الشركات الوطنية المدرجة في البورصة</span>
              <span>عمولة الوساطة المعتمدة: 0.5% فقط</span>
            </div>

            <div className="space-y-2.5">
              {stockState.stocks.map((stock) => {
                const isSelected = stock.id === selectedStockId;
                const holding = stockState.holdings[stock.id];
                const sharesOwned = holding?.sharesOwned || 0;
                const isPositive = stock.dailyChangePercent >= 0;
                const equityVal = sharesOwned * stock.sharePrice;
                const dailyDividend = Math.round((stock.dailyDividendYieldPercent / 100) * equityVal);

                return (
                  <div
                    key={stock.id}
                    onClick={() => {
                      setSelectedStockId(stock.id);
                      playSound('click');
                    }}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'bg-slate-900 border-amber-500 shadow-xl ring-1 ring-amber-500/50'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Company Info */}
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="text-3xl p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                          {stock.logo}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-sm sm:text-base text-white truncate">{stock.name}</h4>
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-amber-400 font-mono text-[11px] font-bold">
                              {stock.ticker}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 truncate">{stock.sector}</p>
                          <p className="text-[10px] text-slate-500 mt-1 line-clamp-1 italic">
                            {stock.recentHeadline}
                          </p>
                        </div>
                      </div>

                      {/* Sparkline & Price Stats */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                        <div className="hidden sm:block">
                          {renderSparkline(stock.priceHistory, isPositive)}
                        </div>

                        <div className="text-left">
                          <strong className="text-sm sm:text-base font-black text-white font-mono block">
                            {formatMoney(stock.sharePrice, country)}
                          </strong>
                          <span
                            className={`inline-flex items-center gap-0.5 text-xs font-bold ${
                              isPositive ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isPositive ? '▲' : '▼'} {Math.abs(stock.dailyChangePercent)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Meta Bar: Market Cap & Holdings */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-500 block text-[10px]">القيمة السوقية:</span>
                        <strong className="text-slate-300 font-mono">
                          {formatNumber(Math.round(stock.marketCap / 1_000_000))} مليون {country.currency.code}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">الأسهم الكلية:</span>
                        <span className="text-slate-300 font-mono">
                          {formatNumber(stock.totalShares)} سهم
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">أسهمك المملوكة:</span>
                        <strong className={sharesOwned > 0 ? 'text-amber-400 font-mono' : 'text-slate-400'}>
                          {sharesOwned > 0 ? `${sharesOwned.toLocaleString()} سهم` : 'لا تمتلك'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">العائد اليومي للسهم:</span>
                        <strong className="text-emerald-400 font-mono">
                          +{stock.dailyDividendYieldPercent}% يومياً
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Col: Instant Order Execution Terminal */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl sticky top-4 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{activeStock.logo}</span>
                  <div>
                    <h4 className="font-black text-sm text-white">{activeStock.name}</h4>
                    <span className="text-[11px] text-amber-400 font-mono">{activeStock.ticker}</span>
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-xs font-mono font-bold text-white">
                    {formatMoney(activeStock.sharePrice, country)}
                  </div>
                  <span className={`text-[10px] font-bold ${activeStock.dailyChangePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {activeStock.dailyChangePercent >= 0 ? '▲' : '▼'} {activeStock.dailyChangePercent}%
                  </span>
                </div>
              </div>

              {/* Buy / Sell Tabs */}
              <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setTradeAction('buy')}
                  className={`flex-1 py-2 rounded-lg text-xs font-black transition ${
                    tradeAction === 'buy' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  أمر شراء 📈
                </button>
                <button
                  type="button"
                  onClick={() => setTradeAction('sell')}
                  className={`flex-1 py-2 rounded-lg text-xs font-black transition ${
                    tradeAction === 'sell' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  أمر بيع 📉
                </button>
              </div>

              {/* Shares Amount Selector */}
              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-bold block">
                  عدد الأسهم المراد {tradeAction === 'buy' ? 'شراؤها' : 'بيعها'}:
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={sharesInput}
                  onChange={(e) => setSharesInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-amber-500 focus:outline-none"
                />

                {/* Quick Selection Chips */}
                <div className="grid grid-cols-5 gap-1 pt-1">
                  {[10, 50, 100, 500].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setSharesInput(String(qty))}
                      className="py-1 px-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono font-bold rounded-lg transition"
                    >
                      {qty}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      if (tradeAction === 'buy') {
                        const maxCanBuy = Math.floor(profile.bankBalance / (activeStock.sharePrice * (1 + BROKERAGE_COMMISSION_RATE)));
                        setSharesInput(String(Math.max(1, maxCanBuy)));
                      } else {
                        setSharesInput(String(Math.max(1, activeHolding.sharesOwned)));
                      }
                    }}
                    className="py-1 px-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[11px] font-bold rounded-lg border border-amber-500/40 transition"
                  >
                    الكل
                  </button>
                </div>
              </div>

              {/* Cost & Commission Breakdown */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>سعر السهم الحالي:</span>
                  <span className="font-mono text-slate-200">{formatMoney(activeStock.sharePrice, country)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>إجمالي القيمة:</span>
                  <span className="font-mono text-slate-200">{formatMoney(grossTradeAmount, country)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>عمولة الوساطة (0.5%):</span>
                  <span className="font-mono text-amber-400">+{formatMoney(brokerageCommission, country)}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between font-black text-sm">
                  <span className="text-white">
                    {tradeAction === 'buy' ? 'المبلغ المطلوب سداده:' : 'صافي المبلغ المحصل:'}
                  </span>
                  <span className="font-mono text-amber-400">
                    {formatMoney(tradeAction === 'buy' ? totalBuyCost : netSellProceeds, country)}
                  </span>
                </div>
              </div>

              {/* Circuit Breaker Protection Info */}
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-[10px] text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  نظام حماية الأسهم: قاطع الدائرة يحمي السهم من الهبوط دون {formatMoney(activeStock.circuitBreakerMin, country)}.
                </span>
              </div>

              {/* Execution Action Button */}
              {tradeAction === 'buy' ? (
                <button
                  type="button"
                  onClick={handleExecuteBuy}
                  disabled={profile.bankBalance < totalBuyCost || numShares <= 0}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-900/30 transition-all disabled:opacity-50"
                >
                  تنفيذ أمر الشراء فوراً 📈
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleExecuteSell}
                  disabled={activeHolding.sharesOwned < numShares || numShares <= 0}
                  className="w-full py-3 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-black text-sm rounded-xl shadow-lg shadow-rose-900/30 transition-all disabled:opacity-50"
                >
                  تنفيذ أمر البيع فوراً 📉
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: IPO Tab */}
      {activeTab === 'ipo' && (
        <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-4 sm:p-6 space-y-5 text-slate-100">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🏢</span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-amber-300">
                طرح شركتك للاكتتاب العام الأولي (IPO)
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                حوّل إمبراطوريتك الصناعية إلى شركة مساهمة عامة مدرجة في البورصة لحصد ملايين السيولة وتوزيع أرباح دورية على المستثمرين!
              </p>
            </div>
          </div>

          {expansion.ipoState.isPublic ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="text-[11px] text-slate-400">رمز التداول (Ticker)</div>
                <div className="text-xl font-black text-amber-400 font-mono mt-1">{expansion.ipoState.ticker}</div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="text-[11px] text-slate-400">سعر السهم الحالي</div>
                <div className="text-xl font-black text-emerald-400 mt-1 font-mono">
                  {formatMoney(expansion.ipoState.sharePrice, country)}
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="text-[11px] text-slate-400">القيمة السوقية الكلية</div>
                <div className="text-xl font-black text-purple-300 mt-1 font-mono">
                  {formatMoney(expansion.ipoState.marketCap, country)}
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="text-[11px] text-slate-400">نسبة التوزيعات السنوية</div>
                <div className="text-xl font-black text-cyan-400 mt-1">{expansion.ipoState.dividendRatePercent}%</div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950/80 p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="text-xs sm:text-sm font-bold text-slate-200">إعدادات عملية الطرح العام:</div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400">نسبة الحصة المعروضة للمساهمين:</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="10"
                    max="49"
                    value={ipoOfferPercent}
                    onChange={(e) => setIpoOfferPercent(Number(e.target.value))}
                    className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <span className="text-lg font-black text-amber-400 font-mono">{ipoOfferPercent}%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div>
                  رسوم تدقيق الاكتتاب: <span className="font-bold text-rose-400">{formatMoney(500000, country)}</span>
                </div>
                <div>
                  السيولة المكتسبة التقديرية: <span className="font-bold text-emerald-400">+{formatMoney(ipoOfferPercent * 500000, country)}</span>
                </div>
                <div>
                  التصنيف الائتماني السيادي: <span className="font-bold text-amber-300">AAA استثماري ممتاز</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLaunchIPO}
                disabled={profile.bankBalance < 500000}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-sm rounded-xl transition shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                تأكيد وبدء الاكتتاب العام في البورصة 🚀
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Gold & Commodities */}
      {activeTab === 'gold' && (
        <div className="bg-slate-900 border border-yellow-500/30 rounded-3xl p-4 sm:p-6 space-y-4 text-slate-100">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🥇</span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-yellow-400">
                سوق الذهب الخالص والأصول الملاذية
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                تداول سبائك الذهب عيار 24 للتحوط ضد التضخم والمخاطر الاقتصادية
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px]">
            <span className="text-yellow-300">السعر: <strong>{formatMoney(GOLD_PRICE_PER_GRAM, country)} / غ</strong></span>
            <span className="text-amber-300">رصيدك: <strong>{(profile.goldGrams ?? 0).toFixed(1)} غ</strong></span>
            <span className="text-emerald-300">القيمة: <strong>{formatMoney((profile.goldGrams ?? 0) * GOLD_PRICE_PER_GRAM, country)}</strong></span>
            <span className="text-slate-400">إرشاد: الذهب تحوط طويل الأجل، والبيع برسوم 3%</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-2xl border border-yellow-500/20">
            <label className="text-xs text-slate-300 flex flex-col gap-1">
              الكمية بالجرام
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={goldGramsInput}
                onChange={(event) => setGoldGramsInput(event.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white font-mono"
              />
            </label>
            <div className="flex flex-wrap items-end gap-2">
              <button type="button" onClick={() => handleGoldTrade('buy')} className="flex-1 min-w-[120px] py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs cursor-pointer">شراء بالرصيد</button>
              <button type="button" onClick={() => handleGoldTrade('diamonds')} className="flex-1 min-w-[120px] py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs cursor-pointer">شراء بالماس</button>
              <button type="button" onClick={() => handleGoldTrade('sell')} className="flex-1 min-w-[120px] py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer">بيع −3%</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
