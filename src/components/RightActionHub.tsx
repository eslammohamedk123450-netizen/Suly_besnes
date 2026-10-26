import { useState, useMemo, useEffect } from 'react';
import type { PlayerProfile } from '../domain/player';
import type { CountryDefinition } from '../domain/countries';
import type { SectionId } from '../domain/navigation';
import { formatMoney } from '../domain/formatters';
import { PRODUCT_CATALOG } from '../game/catalog';
import { getMarketQuote } from '../game/market';
import { getStarterMissions, claimStarterMission, isSectionUnlocked } from '../game/onboarding';
import { generateBotMarketOffers, acceptBotMarketOffer, type BotMarketOffer } from '../game/economyBots';
import { Icon } from './Icon';
import { playSound } from '../game/soundEffects';
import { getLuckySpinState } from '../game/luckyWheelService';
import './RightActionHub.css';

interface RightActionHubProps {
  profile: PlayerProfile;
  country: CountryDefinition;
  onNavigate: (section: SectionId) => void;
  onCollectActualProfit: (amount: number) => void;
  onSellProduct: (productId: string, quantity: number) => void;
  onAdvanceDay: () => void;
  onOpenLuckyWheel?: () => void;
  onOpenStoryCampaign?: () => void;
  onOpenStrategicPillars?: () => void;
  onProfileUpdate?: (profile: PlayerProfile) => void;
}

export function RightActionHub({
  profile,
  country,
  onNavigate,
  onCollectActualProfit,
  onSellProduct,
  onAdvanceDay,
  onOpenLuckyWheel,
  onOpenStoryCampaign,
  onOpenStrategicPillars,
  onProfileUpdate,
}: RightActionHubProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'earnings' | 'market' | 'bots'>('all');
  const [justCollected, setJustCollected] = useState(false);
  const [tradeMessage, setTradeMessage] = useState<string | null>(null);
  const [spinState, setSpinState] = useState(() => getLuckySpinState(profile.lastSpinTimestamp));

  useEffect(() => {
    setSpinState(getLuckySpinState(profile.lastSpinTimestamp));
    const timer = setInterval(() => {
      setSpinState(getLuckySpinState(profile.lastSpinTimestamp));
    }, 1000);
    return () => clearInterval(timer);
  }, [profile.lastSpinTimestamp]);

  // Check if player collected actual profits for the current game day
  const storageKey = `suly_biz_collected_day_${profile.id || 'default'}`;
  const lastCollectedDay = typeof window !== 'undefined'
    ? Number(window.localStorage.getItem(storageKey) || -1)
    : -1;
  const alreadyCollectedToday = (lastCollectedDay === profile.day) || justCollected;

  // Starter missions and incomplete count
  const missions = getStarterMissions(profile);
  const remainingMissions = missions.filter((m) => !m.completed);
  const remainingCount = remainingMissions.length;

  // Calculate ACTUAL real daily profit from active businesses & empire
  const actualDailyProfit = useMemo(() => {
    const companyYield = profile.companies.reduce(
      (sum, c) => sum + (c.upgradeLevel ?? 1) * 15000,
      profile.companies.length > 0 ? 12500 : 5000,
    );
    return companyYield;
  }, [profile.companies]);

  // Find finished products in inventory ready to launch/sell in market
  const finishedProductsInStock = useMemo(() => {
    return profile.inventory
      .map((lot) => {
        const product = PRODUCT_CATALOG.find((p) => p.id === lot.materialOrProductId);
        if (!product || lot.quantity <= 0) return null;
        const quote = getMarketQuote(profile, product.id);
        const marketPrice = quote?.currentPrice ?? product.baseSellPrice;
        const demand = quote?.demandUnits ?? 50;
        const maxCanSell = Math.min(lot.quantity, demand);
        const qualityMultiplier = lot.qualityScore === undefined ? 1 : 0.85 + (lot.qualityScore / 100) * 0.15;
        const estimatedGross = Math.round(maxCanSell * marketPrice * qualityMultiplier);
        return {
          lot,
          product,
          quote,
          marketPrice,
          demand,
          maxCanSell,
          estimatedGross,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [profile.inventory, profile.day]);

  const totalGoodsValue = useMemo(() => {
    return finishedProductsInStock.reduce((sum, item) => sum + item.estimatedGross, 0);
  }, [finishedProductsInStock]);

  const botOffers = useMemo(() => generateBotMarketOffers(profile), [profile.day, profile.inventory, profile.processedBotOfferIds]);

  const handleAcceptBotDeal = (offerId: string) => {
    const result = acceptBotMarketOffer(profile, offerId);
    if (result.ok) {
      playSound('cash');
      setTradeMessage(result.message);
      if (onProfileUpdate) onProfileUpdate(result.profile);
      setTimeout(() => setTradeMessage(null), 4000);
    } else {
      playSound('error');
      setTradeMessage(result.message);
      setTimeout(() => setTradeMessage(null), 4000);
    }
  };

  const handleCollectActual = () => {
    if (alreadyCollectedToday) return;
    playSound('cash');
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, String(profile.day));
    }
    setJustCollected(true);
    onCollectActualProfit(actualDailyProfit);
  };

  const handleLaunchProduct = (productId: string, quantity: number) => {
    playSound('cash');
    onSellProduct(productId, quantity);
  };

  const handleLaunchAllProducts = () => {
    if (finishedProductsInStock.length === 0) return;
    playSound('cash');
    for (const item of finishedProductsInStock) {
      if (item.maxCanSell > 0) {
        onSellProduct(item.product.id, item.maxCanSell);
      }
    }
  };

  const handleNavigate = (section: SectionId) => {
    playSound('click');
    onNavigate(section);
    setOpen(false);
  };

  return (
    <>
      {/* 1. Resting Handle Dock (Lucky Wheel + Story Campaign + Imperial Hub) */}
      {!open && (
        <div className="right-floating-dock-group">
          {onOpenLuckyWheel && (
            <button
              type="button"
              className="right-wheel-handle"
              onClick={() => {
                playSound('click');
                onOpenLuckyWheel();
              }}
              aria-label="عجلة الحظ والاستثمار (مجانية كل 50 دقيقة)"
              title="عجلة الحظ والاستثمار - مجانية كل 50 دقيقة"
            >
              <span className="right-wheel-handle-icon">🎡</span>
              {spinState.isFree ? (
                <span className="right-wheel-badge right-wheel-badge--free">
                  مجاناً
                </span>
              ) : (
                <span className="right-wheel-badge right-wheel-badge--timer">
                  {spinState.formattedCountdown}
                </span>
              )}
            </button>
          )}

          {onOpenStoryCampaign && (
            <button
              type="button"
              className="right-story-handle"
              onClick={() => {
                playSound('click');
                onOpenStoryCampaign();
              }}
              aria-label="مسار القصة والسيناريو الإمبراطوري"
              title="مسار القصة والسيناريو الإمبراطوري - فصول القصة والأهداف والمكافآت"
            >
              <span className="right-story-handle-icon">📜</span>
              <span className="right-story-badge">القصة</span>
            </button>
          )}

          <button
            type="button"
            className="right-hub-handle"
            onClick={() => setOpen(true)}
            aria-label="المركز الإمبراطوري السريع"
            title="المركز الإمبراطوري السريع - الجمع الفعلي وطرح المنتجات وصفقات المنافسين"
          >
            <span className="right-hub-handle-icon">⚡</span>
            {(remainingCount > 0 || (!alreadyCollectedToday && actualDailyProfit > 0) || finishedProductsInStock.length > 0 || botOffers.length > 0) && (
              <span
                className="right-hub-badge"
                title={`${remainingCount} مهام - ${finishedProductsInStock.length} منتجات - ${botOffers.length} صفقات`}
              >
                {botOffers.length > 0 ? '🤝' : finishedProductsInStock.length > 0 ? '🏪' : remainingCount || '✓'}
              </span>
            )}
            <div className="right-hub-label-dots">
              <span />
              <span />
              <span />
            </div>
          </button>
        </div>
      )}

      {/* 2. Expanded Drawer Modal */}
      {open && (
        <div className="right-hub-backdrop" onClick={() => setOpen(false)}>
          <div className="right-hub-drawer" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="right-hub-header">
              <div className="right-hub-title-box">
                <span className="right-hub-crown-icon">👑</span>
                <div>
                  <h3>المركز الإمبراطوري للعمليات</h3>
                  <p className="right-hub-subtitle">الجمع الفعلي للأرباح • طرح المنتجات بالسوق</p>
                </div>
              </div>
              <button
                type="button"
                className="right-hub-close-btn"
                onClick={() => setOpen(false)}
                aria-label="إغلاق"
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            {/* Navigation Tabs inside Hub */}
            <div className="right-hub-tabs">
              <button
                type="button"
                className={`right-hub-tab ${activeTab === 'all' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                شامل العمليات
              </button>
              <button
                type="button"
                className={`right-hub-tab ${activeTab === 'earnings' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('earnings')}
              >
                الجمع الفعلي 💵
              </button>
              <button
                type="button"
                className={`right-hub-tab ${activeTab === 'market' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('market')}
              >
                طرح بالسوق ({finishedProductsInStock.length})
              </button>
              <button
                type="button"
                className={`right-hub-tab ${activeTab === 'bots' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('bots')}
              >
                صفقات المنافسين 🤝 ({botOffers.length})
              </button>
            </div>

            <div className="right-hub-scrollable-content">
              {/* SECTION 1: الجمع الفعلي للأرباح (Actual Real Profit Collection) */}
              {(activeTab === 'all' || activeTab === 'earnings') && (
                <div className="right-hub-profit-card">
                  <div className="right-hub-profit-top">
                    <div className="right-hub-profit-badge">
                      {alreadyCollectedToday ? 'تم تحصيل أرباح اليوم بنجاح ✓' : 'جاهز للإيداع الفعلي الفوري ✅'}
                    </div>
                    <span className="right-hub-profit-day">اليوم {profile.day}</span>
                  </div>

                  <div className="right-hub-profit-body">
                    <div className="right-hub-profit-icon-wrap">
                      <span className="right-hub-profit-icon">💵</span>
                    </div>
                    <div className="right-hub-profit-details">
                      <span className="right-hub-profit-label">الجمع الفعلي لأرباح الإمبراطورية:</span>
                      <strong className="right-hub-profit-amount">
                        + {formatMoney(actualDailyProfit, country)}
                      </strong>
                      <small className="right-hub-profit-desc">
                        {alreadyCollectedToday
                          ? 'أُودعت الأرباح في رصيدك البنكي. تتجدد مع بداية دورة اليوم التالي.'
                          : 'أرباح فعلية جاهزة للإيداع المباشر في رصيد حسابك البنكي بنقرة واحدة.'}
                      </small>
                    </div>
                  </div>

                  <div className="right-hub-profit-actions">
                    {!alreadyCollectedToday ? (
                      <button
                        type="button"
                        className="right-hub-btn-primary right-hub-btn-collect"
                        onClick={handleCollectActual}
                      >
                        <span>⚡ تحصيل الأرباح الفعلية الآن (+{formatMoney(actualDailyProfit, country)})</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="right-hub-btn-secondary"
                        onClick={() => {
                          playSound('click');
                          onAdvanceDay();
                          setJustCollected(false);
                        }}
                      >
                        <span>تقديم يوم وبدء دورة أرباح جديدة ⏳</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION 2: طرح المنتجات في السوق (Finished Goods Launch to Market) */}
              {(activeTab === 'all' || activeTab === 'market') && (
                <div className="right-hub-section right-hub-market-section">
                  <div className="right-hub-section-header">
                    <div className="right-hub-section-title">
                      <span className="right-hub-icon-emoji">🏪</span>
                      <strong>طرح المنتجات في السوق (بيع فوري كاش)</strong>
                    </div>
                    {finishedProductsInStock.length > 0 && (
                      <span className="right-hub-badge-counter">
                        {finishedProductsInStock.length} منتجات متاحة
                      </span>
                    )}
                  </div>

                  {finishedProductsInStock.length > 0 ? (
                    <div className="right-hub-products-wrapper">
                      <div className="right-hub-market-banner">
                        <div className="right-hub-market-banner-text">
                          <small>إجمالي العوائد النقدية عند طرح الكل:</small>
                          <strong>+ {formatMoney(totalGoodsValue, country)}</strong>
                        </div>
                        <button
                          type="button"
                          className="right-hub-btn-launch-all"
                          onClick={handleLaunchAllProducts}
                          title="طرح كل البضائع تامة الصنع في الأسواق فوراً"
                        >
                          🚀 طرح الكل بالسوق
                        </button>
                      </div>

                      <div className="right-hub-products-list">
                        {finishedProductsInStock.map((item) => (
                          <div key={item.product.id} className="right-hub-product-item">
                            <div className="right-hub-product-info">
                              <div className="right-hub-product-name-row">
                                <strong>{item.product.name}</strong>
                                <span className="right-hub-product-qty">
                                  {item.lot.quantity} {item.product.unit}
                                </span>
                              </div>
                              <div className="right-hub-product-pricing">
                                <span>سعر السوق: {formatMoney(item.marketPrice, country)}</span>
                                <span className="right-hub-product-demand">
                                  طلب السوق اليوم: {item.demand}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              className="right-hub-btn-launch-single"
                              onClick={() => handleLaunchProduct(item.product.id, item.maxCanSell)}
                              title={`طرح ${item.maxCanSell} ${item.product.unit} في السوق`}
                            >
                              <span>طرح بالسوق</span>
                              <small>+ {formatMoney(item.estimatedGross, country)}</small>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Helper Card When No Products in Stock */
                    <div className="right-hub-no-products-card">
                      <div className="right-hub-no-products-icon">📦</div>
                      <div className="right-hub-no-products-text">
                        <strong>لا توجد بضائع تامة الصنع في مستودعك حالياً</strong>
                        <p>
                          ابدأ تشغيل خطوط الإنتاج بمصانعك لتحويل المواد الخام إلى منتجات عالية القيمة وطرحها هنا لتحقيق أرباح قياسية.
                        </p>
                      </div>
                      <div className="right-hub-no-products-actions">
                        <button
                          type="button"
                          className="right-hub-btn-guide-action"
                          onClick={() => handleNavigate('companies')}
                        >
                          <Icon name="factory" size={15} />
                          <span>بدء التصنيع في المصانع</span>
                        </button>
                        <button
                          type="button"
                          className="right-hub-btn-guide-action right-hub-btn-guide-secondary"
                          onClick={() => handleNavigate('inventory')}
                        >
                          <Icon name="store" size={15} />
                          <span>شراء خامات الإنتاج</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 2.5: صفقات وعروض المنافسين المباشرة (Smart Economic Bot Deals) */}
              {(activeTab === 'all' || activeTab === 'bots') && (
                <div className="right-hub-section">
                  <div className="right-hub-section-header">
                    <div className="right-hub-section-title">
                      <span className="right-hub-icon-emoji">🤝</span>
                      <strong>صفقات وعروض المنافسين المباشرة ({botOffers.length})</strong>
                    </div>
                  </div>

                  {tradeMessage && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs mb-3">
                      {tradeMessage}
                    </div>
                  )}

                  {botOffers.length > 0 ? (
                    <div className="space-y-2.5">
                      {botOffers.map((offer) => (
                        <div key={offer.id} className="p-3 rounded-2xl bg-slate-950/80 border border-amber-500/30 flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{offer.botAvatar}</span>
                              <div>
                                <strong className="text-xs text-white block">{offer.botName}</strong>
                                <small className="text-[10px] text-amber-400 font-bold">{offer.botTitle}</small>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                              {offer.type === 'buy_player_product' ? `علاوة +${offer.marketPriceComparison}%` : `خصم ${Math.abs(offer.marketPriceComparison)}%`}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-900/60 p-2 rounded-xl">
                            «{offer.dialogueNote}»
                          </p>

                          <div className="flex items-center justify-between pt-1 text-xs">
                            <div>
                              <span className="text-slate-400 text-[10px] block">إجمالي الصفقة:</span>
                              <strong className="text-emerald-400 font-bold font-mono">
                                {offer.type === 'buy_player_product' ? '+' : '-'} {formatMoney(offer.totalAmount, country)}
                              </strong>
                            </div>

                            <button
                              type="button"
                              className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer"
                              onClick={() => handleAcceptBotDeal(offer.id)}
                            >
                              {offer.type === 'buy_player_product' ? 'قبول البيع واستلام الكاش 💵' : 'قبول الشراء بالخصم 📦'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
                      لا توجد عروض منافسين معلقة حالياً؛ تتجدد العروض اليومية أو عند توفير بضائع جاهزة بالمخزن.
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 3: المهام الأولية المتبقية (Remaining Starter Missions) */}
              {(activeTab === 'all') && missions.length > 0 && (
                <div className="right-hub-section">
                  <div className="right-hub-section-header">
                    <div className="right-hub-section-title">
                      <Icon name="tasks" size={16} />
                      <strong>{missions[0]?.stageName || 'المهام الأولية'} ({remainingCount})</strong>
                    </div>
                  </div>

                  <div className="right-hub-missions-list">
                    {missions.map((mission) => {
                      const unlocked = isSectionUnlocked(profile, mission.section);
                      return (
                        <div
                          key={mission.id}
                          className={`right-hub-mission-item ${mission.completed ? 'is-completed' : ''}`}
                          onClick={() => {
                            if (unlocked && !mission.completed) handleNavigate(mission.section);
                          }}
                        >
                          <div className="right-hub-mission-info">
                            <div className="flex items-center justify-between gap-1">
                              <strong>{mission.title}</strong>
                              <span className="text-[10px] text-amber-400 font-mono font-bold shrink-0">
                                +{mission.cashReward.toLocaleString()} $
                              </span>
                            </div>
                            <small>{mission.description}</small>
                            {mission.completed && (
                              <button
                                type="button"
                                className="mt-1.5 py-1 px-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] transition shadow cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const res = claimStarterMission(profile, mission.id);
                                  if (res.ok) {
                                    playSound('cash');
                                    playSound('levelUp');
                                    if (onProfileUpdate) onProfileUpdate(res.profile);
                                  }
                                }}
                              >
                                استلام المكافأة 🎉
                              </button>
                            )}
                          </div>
                          <span className="right-hub-mission-check">
                            {mission.completed ? '✓' : <Icon name={unlocked ? 'arrow' : 'lock'} size={14} />}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION 4: اختصارات التوسع السريع (Quick Shortcuts) */}
              <div className="right-hub-section">
                <div className="right-hub-section-header">
                  <div className="right-hub-section-title">
                    <Icon name="briefcase" size={16} />
                    <strong>اختصارات التوسع السريع</strong>
                  </div>
                </div>

                <div className="right-hub-shortcuts-grid">
                  {onOpenStoryCampaign && (
                    <div
                      className="right-hub-shortcut-card"
                      onClick={() => {
                        setOpen(false);
                        playSound('click');
                        onOpenStoryCampaign();
                      }}
                    >
                      <span className="right-hub-shortcut-icon">📜</span>
                      <span>مسار القصة</span>
                    </div>
                  )}

                  {onOpenStrategicPillars && (
                    <div
                      className="right-hub-shortcut-card"
                      onClick={() => {
                        setOpen(false);
                        playSound('click');
                        onOpenStrategicPillars();
                      }}
                    >
                      <span className="right-hub-shortcut-icon">🏛️</span>
                      <span>المحاور الاستراتيجية</span>
                    </div>
                  )}

                  <div
                    className="right-hub-shortcut-card"
                    onClick={() => handleNavigate('auctions')}
                  >
                    <span className="right-hub-shortcut-icon">🔨</span>
                    <span>المزادات الحية</span>
                  </div>

                  <div
                    className="right-hub-shortcut-card"
                    onClick={() => handleNavigate('companies')}
                  >
                    <span className="right-hub-shortcut-icon">🏢</span>
                    <span>تأسيس الشركات</span>
                  </div>

                  <div
                    className="right-hub-shortcut-card"
                    onClick={() => handleNavigate('store')}
                  >
                    <span className="right-hub-shortcut-icon">💎</span>
                    <span>متجر العروض</span>
                  </div>

                  <div
                    className="right-hub-shortcut-card"
                    onClick={() => handleNavigate('investments')}
                  >
                    <span className="right-hub-shortcut-icon">📈</span>
                    <span>البورصة</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
