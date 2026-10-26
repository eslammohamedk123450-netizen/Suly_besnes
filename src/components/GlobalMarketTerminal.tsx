import { useMemo, useState, type FormEvent } from 'react';
import type { CountryDefinition } from '../domain/countries';
import type { GlobalPaymentTerm, GlobalShippingMode } from '../domain/futureSystems';
import { formatMoney, formatNumber } from '../domain/formatters';
import type { PlayerProfile } from '../domain/player';
import { MATERIAL_CATALOG, findMaterial } from '../game/catalog';
import {
  buyGlobalMaterial,
  drawFromForwardContract,
  exportGlobalProduct,
  signForwardContract,
  type GameCommand,
  type GameResult,
} from '../game/engine';
import {
  calculateImportQuote,
  getCommodityBenchmarks,
  getCountryTradeProfile,
  getForwardContractTemplates,
  getGlobalExportBids,
  getGlobalMarketOffers,
  getOwnedMaritimeFleetCount,
  getPlayerFactoryMaterialIds,
  getSupplierTierLabel,
  getSupplierTrustScore,
  negotiateGlobalMarketOffer,
  proposeGlobalCounterOffer,
  type CommodityBenchmark,
  type CommoditySectorId,
  type GlobalMarketOffer,
} from '../game/globalMarket';
import { getDiscountedDiamondPrice } from '../game/purchasePricing';
import { playSound } from '../game/soundEffects';
import {
  getWarehouseCapacity,
  getWarehouseItemCapacity,
  getWarehouseUsage,
  normalizeWarehouseLevel,
} from '../game/warehouse';
import { PurchaseOptions } from './PurchaseOptions';

interface GlobalMarketTerminalProps {
  profile: PlayerProfile;
  country: CountryDefinition;
  onCommand: (command: GameCommand, fallback: (current: PlayerProfile) => GameResult<unknown>) => void;
  onAction: (result: GameResult<unknown>) => void;
}

type MarketTabId = 'import' | 'export' | 'shipments' | 'hedging';

const SECTOR_OPTIONS: ReadonlyArray<{ id: CommoditySectorId; label: string }> = [
  { id: 'all', label: 'الكل' },
  { id: 'my-factories', label: 'مدخلات مصانعي' },
  { id: 'agri', label: 'الزراعة والتغليف' },
  { id: 'energy', label: 'الطاقة والوقود' },
  { id: 'metals', label: 'المعادن والتعمير' },
  { id: 'tech-chem', label: 'التقنية والكيماويات' },
];

const SHIPPING_MODE_LABELS: Record<GlobalShippingMode, { short: string; detail: string }> = {
  'spot-ddp': {
    short: 'فوري منطقة حرة DDP',
    detail: 'تسليم فوري (0 يوم) · معفى من رسوم التخليص الإضافية',
  },
  'sea-cif': {
    short: 'شحن بحري بالحاويات CIF',
    detail: 'خصم شحن بحري 12%–22% · يصل للميناء خلال 1–2 يوم',
  },
  'air-express': {
    short: 'شحن جوي طارئ Express',
    detail: 'وصول جوي فوري (0 يوم) من الميناء الدولي مع علاوة جوية',
  },
};

function Sparkline({ values, trend }: { values: readonly number[]; trend: CommodityBenchmark['trend'] }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);
  const width = 76;
  const height = 24;
  const points = values
    .map((val, idx) => {
      const x = Math.round((idx / (values.length - 1)) * width);
      const y = Math.round(height - 3 - ((val - min) / range) * (height - 6));
      return `${x},${y}`;
    })
    .join(' ');

  const strokeClass =
    trend === 'up' ? 'stroke-amber-400' : trend === 'down' ? 'stroke-emerald-400' : 'stroke-slate-400';

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-6 w-20 shrink-0 overflow-visible"
      aria-hidden="true"
    >
      <polyline
        fill="none"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={strokeClass}
        points={points}
      />
    </svg>
  );
}

function gradeDescription(grade: GlobalMarketOffer['grade'], qualityScore: number): string {
  if (grade === 'A+') return `درجة A+ صناعية ممتازة (${formatNumber(qualityScore)}% · ترفع جودة المنتج +6)`;
  if (grade === 'B') return `درجة B قياسية معتمدة (${formatNumber(qualityScore)}%)`;
  return `درجة C اقتصادية سائب (${formatNumber(qualityScore)}% · خصم فائض موانئ)`;
}

export function GlobalMarketTerminal({
  profile,
  country,
  onCommand,
  onAction,
}: GlobalMarketTerminalProps) {
  const [activeTab, setActiveTab] = useState<MarketTabId>('import');
  const [sectorFilter, setSectorFilter] = useState<CommoditySectorId>('all');
  const [focusedMaterialId, setFocusedMaterialId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Per-offer order desk state
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [shippingModes, setShippingModes] = useState<Record<string, GlobalShippingMode>>({});
  const [paymentTerms, setPaymentTerms] = useState<Record<string, GlobalPaymentTerm>>({});
  const [negotiatedPrices, setNegotiatedPrices] = useState<Record<string, number>>({});
  const [openCounterId, setOpenCounterId] = useState<string | null>(null);
  const [counterPriceInputs, setCounterPriceInputs] = useState<Record<string, string>>({});

  // Export & Hedging inputs
  const [exportQuantities, setExportQuantities] = useState<Record<string, string>>({});
  const [drawQuantities, setDrawQuantities] = useState<Record<string, string>>({});

  const warehouseLevel = normalizeWarehouseLevel(profile.warehouseLevel);
  const warehouseCapacity = getWarehouseCapacity(warehouseLevel);
  const warehouseUsage = getWarehouseUsage(profile.inventory, profile.productionOrders);
  const fleetCount = useMemo(() => getOwnedMaritimeFleetCount(profile.id), [profile.id, profile.day]);
  const tradeProfile = useMemo(() => getCountryTradeProfile(profile.countryId), [profile.countryId]);
  const factoryMaterialIds = useMemo(() => getPlayerFactoryMaterialIds(profile), [profile]);

  const benchmarks = useMemo(() => getCommodityBenchmarks(profile), [profile]);
  const allOffers = useMemo(() => getGlobalMarketOffers(profile), [profile]);
  const exportBids = useMemo(() => getGlobalExportBids(profile), [profile]);
  const forwardTemplates = useMemo(() => getForwardContractTemplates(profile), [profile]);

  const inTransitImports = useMemo(
    () => (profile.globalShipments ?? []).filter((s) => s.status === 'in-transit' && s.direction === 'import'),
    [profile.globalShipments],
  );

  const inTransitMaterialTotal = useMemo(
    () => inTransitImports.reduce((sum, s) => sum + s.quantity, 0),
    [inTransitImports],
  );

  const activeForwardContracts = useMemo(
    () => (profile.forwardContracts ?? []).filter((c) => c.status === 'active'),
    [profile.forwardContracts],
  );

  const inventoryByItemId = useMemo(() => {
    const map = new Map<string, { quantity: number; qualityScore: number; unitCost: number }>();
    for (const lot of profile.inventory) {
      map.set(lot.materialOrProductId, {
        quantity: lot.quantity,
        qualityScore: lot.qualityScore ?? 88,
        unitCost: lot.unitCost,
      });
    }
    return map;
  }, [profile.inventory]);

  const filteredOffers = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLocaleLowerCase('ar');
    const filtered = allOffers.filter((offer) => {
      if (focusedMaterialId && offer.materialId !== focusedMaterialId) return false;
      if (sectorFilter === 'my-factories' && !factoryMaterialIds.has(offer.materialId)) return false;
      if (
        sectorFilter !== 'all' &&
        sectorFilter !== 'my-factories' &&
        offer.sector !== sectorFilter
      ) {
        return false;
      }
      if (!normalizedSearch) return true;
      const mat = findMaterial(offer.materialId);
      const haystack = `${mat?.name ?? ''} ${offer.sellerName} ${offer.originPort} ${offer.originCountry}`.toLocaleLowerCase('ar');
      return haystack.includes(normalizedSearch);
    });

    // Prioritize materials used by the player's owned factories so starter inputs appear immediately at top
    return [...filtered].sort((a, b) => {
      const aFactory = factoryMaterialIds.has(a.materialId) ? 0 : 1;
      const bFactory = factoryMaterialIds.has(b.materialId) ? 0 : 1;
      if (aFactory !== bFactory) return aFactory - bFactory;
      if (a.materialId !== b.materialId) {
        return (
          MATERIAL_CATALOG.findIndex((m) => m.id === a.materialId) -
          MATERIAL_CATALOG.findIndex((m) => m.id === b.materialId)
        );
      }
      // Keep Local Free-Zone Spot (offer 0) first within each material
      const tierOrder = (o: GlobalMarketOffer) => (o.isLocalFreeZone ? 0 : o.grade === 'A+' ? 1 : 2);
      return tierOrder(a) - tierOrder(b);
    });
  }, [allOffers, factoryMaterialIds, focusedMaterialId, searchQuery, sectorFilter]);

  const advMaterialNames = tradeProfile.advantagedMaterials
    .map((id) => findMaterial(id)?.name)
    .filter(Boolean)
    .join('، ');

  return (
    <div className="space-y-6 text-right">
      {/* Country Trade Profile & Port Summary */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <h4 className="text-base font-semibold text-slate-100">
              مؤشرات البورصة الفورية والمزايا اللوجستية ({country.flag} {country.name})
            </h4>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              <span>ميزة نسبية -{formatNumber(tradeProfile.advantageDiscountPct)}% على ({advMaterialNames})</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span>تعريفة جمركية قياسية {formatNumber(Math.round(tradeProfile.baseCustomsTariffRate * 100))}%</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span>علاوة مركز تصدير +{formatNumber(tradeProfile.exportHubBonusPct)}%</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span>
                أسطول الشحن البحري المملوك: {formatNumber(fleetCount)}{' '}
                {fleetCount > 0 ? `(خصم نولون ${formatNumber(Math.min(80, fleetCount * 35))}%)` : 'سفينة'}
              </span>
            </p>
          </div>
          {focusedMaterialId && (
            <button
              type="button"
              onClick={() => setFocusedMaterialId(null)}
              className="self-start rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors"
            >
              إلغاء تثبيت السلعة وعرض كل الخامات
            </button>
          )}
        </div>

        {/* 7-Day Live Spot Benchmark Strip */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {benchmarks.slice(0, 6).map((bench) => {
            const isSelected = focusedMaterialId === bench.materialId;
            // For commodities (raw materials), falling price is favorable for importers, rising means supply tightness
            const deltaColor =
              bench.changePercent > 0
                ? 'text-amber-300'
                : bench.changePercent < 0
                  ? 'text-emerald-400'
                  : 'text-slate-400';
            const deltaPrefix = bench.changePercent > 0 ? '+' : '';
            return (
              <button
                key={bench.materialId}
                type="button"
                onClick={() => {
                  setActiveTab('import');
                  setFocusedMaterialId((prev) => (prev === bench.materialId ? null : bench.materialId));
                }}
                className={`flex items-center justify-between gap-3 rounded-lg border p-3 text-right transition-colors ${
                  isSelected
                    ? 'border-amber-400/70 bg-slate-900'
                    : 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="truncate text-sm font-semibold text-slate-100">{bench.name}</span>
                    <span className="text-xs text-slate-500">/{bench.unit}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-400 tabular-nums">
                    <span className="font-semibold text-slate-200">{formatMoney(bench.spotPrice, country)}</span>
                    <span aria-hidden="true">·</span>
                    <span className={deltaColor}>
                      {deltaPrefix}
                      {bench.changePercent.toFixed(1)}%
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{bench.supplyLabel}</span>
                  </div>
                </div>
                <Sparkline values={bench.history} trend={bench.trend} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Terminal Mode Tabs (Segmented Interactive Controls) */}
      <div
        role="tablist"
        aria-label="أقسام بورصة التجارة العالمية"
        className="grid grid-cols-2 gap-1.5 rounded-xl border border-slate-800 bg-slate-950/80 p-1.5 sm:grid-cols-4"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'import'}
          onClick={() => setActiveTab('import')}
          className={`rounded-lg px-3 py-2.5 text-xs sm:text-sm font-semibold transition-colors tabular-nums ${
            activeTab === 'import'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-300 hover:bg-slate-900 hover:text-white'
          }`}
        >
          استيراد الخامات ({formatNumber(allOffers.length)})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'export'}
          onClick={() => setActiveTab('export')}
          className={`rounded-lg px-3 py-2.5 text-xs sm:text-sm font-semibold transition-colors tabular-nums ${
            activeTab === 'export'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'text-slate-300 hover:bg-slate-900 hover:text-white'
          }`}
        >
          التصدير الدولي ({formatNumber(exportBids.length)})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'shipments'}
          onClick={() => setActiveTab('shipments')}
          className={`rounded-lg px-3 py-2.5 text-xs sm:text-sm font-semibold transition-colors tabular-nums ${
            activeTab === 'shipments'
              ? 'bg-sky-400 text-slate-950 shadow-sm'
              : 'text-slate-300 hover:bg-slate-900 hover:text-white'
          }`}
        >
          الشحنات العابرة ({formatNumber(inTransitImports.length)})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'hedging'}
          onClick={() => setActiveTab('hedging')}
          className={`rounded-lg px-3 py-2.5 text-xs sm:text-sm font-semibold transition-colors tabular-nums ${
            activeTab === 'hedging'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'text-slate-300 hover:bg-slate-900 hover:text-white'
          }`}
        >
          العقود الآجلة ({formatNumber(activeForwardContracts.length)})
        </button>
      </div>

      {/* TAB 1: IMPORT ORDER BOOK */}
      {activeTab === 'import' && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div
              role="group"
              aria-label="تصفية قطاعات السلع"
              className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-800 bg-slate-950/60 p-1"
            >
              {SECTOR_OPTIONS.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => {
                    setSectorFilter(sec.id);
                    setFocusedMaterialId(null);
                  }}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    sectorFilter === sec.id
                      ? 'bg-slate-800 text-amber-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </div>

            <div className="w-full lg:w-64">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث باسم الخامة أو الميناء..."
                aria-label="ابحث باسم الخامة أو الميناء"
                className="w-full rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {filteredOffers.length === 0 ? (
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-6 text-center text-sm text-slate-400">
              لا توجد عروض مطابقة للفلتر الحالي. اختر قطاع «الكل» لاستعراض كافة عروض الموردين الدوليين.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOffers.map((offer) => {
                const material = findMaterial(offer.materialId);
                const stockInfo = inventoryByItemId.get(offer.materialId);
                const currentQty = stockInfo?.quantity ?? 0;
                const inTransitSame = inTransitImports
                  .filter((s) => s.itemId === offer.materialId)
                  .reduce((sum, s) => sum + s.quantity, 0);
                const itemLimit =
                  getWarehouseItemCapacity(offer.materialId, warehouseLevel) ?? material?.storageLimit ?? 500;
                const availItem = itemLimit - currentQty - inTransitSame;
                const availTotal = warehouseCapacity.materials - warehouseUsage.materials - inTransitMaterialTotal;
                const maxQuantity = Math.max(0, Math.min(availItem, availTotal, offer.availableStock));

                const rawQtyStr = quantities[offer.id] ?? '5';
                const parsedQty = Number(rawQtyStr);
                const safeQtyForQuote = Number.isFinite(parsedQty) && parsedQty >= 1 ? Math.floor(parsedQty) : 1;
                const canPurchaseQuantity =
                  Number.isInteger(parsedQty) && parsedQty >= 1 && parsedQty <= maxQuantity;

                const shippingMode: GlobalShippingMode = shippingModes[offer.id] ?? 'spot-ddp';
                const trustScore = getSupplierTrustScore(profile, offer.supplierId);
                const lcEligible =
                  shippingMode === 'sea-cif' && (trustScore >= 40 || (profile.reputation ?? 50) >= 65);
                const requestedTerm: GlobalPaymentTerm = paymentTerms[offer.id] ?? 'cash-spot';
                const effectiveTerm: GlobalPaymentTerm = lcEligible ? requestedTerm : 'cash-spot';

                const negotiatedUnitPrice = negotiatedPrices[offer.id];
                const isNegotiated = negotiatedUnitPrice !== undefined;

                const quote = calculateImportQuote(profile, offer, safeQtyForQuote, {
                  negotiatedUnitPrice,
                  shippingMode,
                  paymentTerm: effectiveTerm,
                  fleetCount,
                });

                const isFactoryInput = factoryMaterialIds.has(offer.materialId);
                const counterOpen = openCounterId === offer.id;
                const defaultCounterVal = String(Math.max(1, Math.round(offer.unitPrice * 0.92)));
                const counterValue = counterPriceInputs[offer.id] ?? defaultCounterVal;

                return (
                  <article
                    key={offer.id}
                    className="rounded-xl border border-slate-800/80 bg-slate-950/65 p-4 sm:p-5 space-y-4"
                  >
                    {/* Header: Commodity Title + Clean Unboxed Metadata */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <h5 className="text-base font-semibold text-slate-100">
                            {material?.name ?? offer.materialId}
                          </h5>
                          <span className="text-xs text-slate-400">
                            {offer.originFlag} {offer.originPort} · {offer.sellerName}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed tabular-nums">
                          <span className={offer.grade === 'A+' ? 'text-emerald-300 font-medium' : 'text-slate-300'}>
                            {gradeDescription(offer.grade, offer.qualityScore)}
                          </span>
                          <span className="mx-1.5" aria-hidden="true">·</span>
                          <span>{offer.negotiable ? 'يقبل التفاوض التجاري' : 'سعر مرجعي ثابت'}</span>
                          <span className="mx-1.5" aria-hidden="true">·</span>
                          <span>مخزونك الحالي: {formatNumber(currentQty)} {material?.unit ?? 'وحدة'}</span>
                          {isFactoryInput && (
                            <>
                              <span className="mx-1.5" aria-hidden="true">·</span>
                              <span className="text-amber-300 font-medium">مدخل أساسي لمصانعك</span>
                            </>
                          )}
                        </p>
                      </div>

                      <div className="text-right sm:text-left tabular-nums shrink-0">
                        <div className="text-sm font-semibold text-amber-300">
                          {formatMoney(quote.effectiveUnitCost, country)} / {material?.unit ?? 'وحدة'}
                        </div>
                        <div className="text-xs text-slate-400">
                          السعر المعلن {formatMoney(offer.unitPrice, country)}
                          {isNegotiated ? ` · تفاوضي ${formatMoney(negotiatedUnitPrice, country)}` : ''}
                        </div>
                      </div>
                    </div>

                    {/* Incoterms Shipping Selector + Payment Term Selector */}
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 border-t border-slate-800/70 pt-3">
                      <div className="space-y-1.5">
                        <span className="block text-xs font-medium text-slate-300">
                          نظام الشحن والتسليم الدولي (Incoterms)
                        </span>
                        <div
                          role="group"
                          aria-label="اختيار نظام الشحن الدولي"
                          className="grid grid-cols-3 gap-1 rounded-lg border border-slate-800 bg-slate-900/70 p-1"
                        >
                          {(['spot-ddp', 'sea-cif', 'air-express'] as const).map((mode) => (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => setShippingModes((prev) => ({ ...prev, [offer.id]: mode }))}
                              className={`rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                                shippingMode === mode
                                  ? 'bg-slate-800 text-amber-300 shadow-sm'
                                  : 'text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              {mode === 'spot-ddp'
                                ? 'منطقة حرة (0ي)'
                                : mode === 'sea-cif'
                                  ? `بحري CIF (${offer.seaTransitDays}ي)`
                                  : 'جوي سريع (0ي)'}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-slate-400">{SHIPPING_MODE_LABELS[shippingMode].detail}</p>
                      </div>

                      <div className="space-y-1.5">
                        <span className="block text-xs font-medium text-slate-300">
                          أداة التسوية المصرفية وعلاقة المورد
                        </span>
                        <div
                          role="group"
                          aria-label="اختيار نظام السداد"
                          className="grid grid-cols-2 gap-1 rounded-lg border border-slate-800 bg-slate-900/70 p-1"
                        >
                          <button
                            type="button"
                            onClick={() => setPaymentTerms((prev) => ({ ...prev, [offer.id]: 'cash-spot' }))}
                            className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                              effectiveTerm === 'cash-spot'
                                ? 'bg-slate-800 text-slate-100 shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            تسوية نقدية كاملة (100%)
                          </button>
                          <button
                            type="button"
                            disabled={!lcEligible}
                            onClick={() => setPaymentTerms((prev) => ({ ...prev, [offer.id]: 'lc-net2' }))}
                            className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-45 disabled:cursor-not-allowed ${
                              effectiveTerm === 'lc-net2'
                                ? 'bg-slate-800 text-emerald-300 shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            اعتماد مستندي LC (30% / 70%)
                          </button>
                        </div>
                        <p className="text-xs text-slate-400 tabular-nums">
                          <span>ثقة المورد {formatNumber(trustScore)}/100</span>
                          <span className="mx-1.5" aria-hidden="true">·</span>
                          <span>{getSupplierTierLabel(trustScore)}</span>
                          {!lcEligible && shippingMode === 'sea-cif' && (
                            <>
                              <span className="mx-1.5" aria-hidden="true">·</span>
                              <span>يتطلب الاعتماد المستندي ثقة 40+ أو سمعة 65+</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Quantity + Bulk Tiers + Landed Cost Breakdown */}
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 border-t border-slate-800/70 pt-3">
                      <div className="lg:col-span-5 space-y-2">
                        <label
                          htmlFor={`global-qty-${offer.id}`}
                          className="block text-xs font-medium text-slate-300 tabular-nums"
                        >
                          الكمية المطلوبة (المتاح للتخزين: {formatNumber(maxQuantity)} {material?.unit ?? 'وحدة'})
                        </label>
                        <input
                          id={`global-qty-${offer.id}`}
                          type="number"
                          min="1"
                          max={maxQuantity}
                          step="1"
                          value={rawQtyStr}
                          onChange={(e) => setQuantities((prev) => ({ ...prev, [offer.id]: e.target.value }))}
                          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 tabular-nums focus:border-amber-400 focus:outline-none"
                        />
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setQuantities((prev) => ({ ...prev, [offer.id]: '5' }))}
                            className="rounded border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-800 tabular-nums"
                          >
                            5 وحدات
                          </button>
                          {offer.bulkTiers.map((tier) => (
                            <button
                              key={tier.minQty}
                              type="button"
                              disabled={maxQuantity < tier.minQty}
                              onClick={() =>
                                setQuantities((prev) => ({ ...prev, [offer.id]: String(tier.minQty) }))
                              }
                              className="rounded border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-40 tabular-nums"
                            >
                              {formatNumber(tier.minQty)}+ (خصم {formatNumber(tier.discountPct)}%)
                            </button>
                          ))}
                          {maxQuantity > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                setQuantities((prev) => ({ ...prev, [offer.id]: String(maxQuantity) }))
                              }
                              className="rounded border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-amber-300 hover:bg-slate-800 tabular-nums"
                            >
                              أقصى سعة ({formatNumber(maxQuantity)})
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Landed Cost Accounting Summary */}
                      <div className="lg:col-span-7 rounded-lg border border-slate-800/80 bg-slate-900/50 p-3 text-xs space-y-1.5 tabular-nums">
                        <div className="flex justify-between text-slate-300">
                          <span>
                            قيمة البضاعة الصافية ({formatNumber(quote.quantity)} ×{' '}
                            {formatMoney(quote.shippingModeUnitPrice, country)})
                            {quote.bulkDiscountPct > 0 ? ` · شامل خصم جملة ${quote.bulkDiscountPct}%` : ''}
                            {quote.trustDiscountPct > 0 ? ` · ولاء ${quote.trustDiscountPct}%` : ''}
                          </span>
                          <span className="font-medium text-slate-100">
                            {formatMoney(quote.merchandiseSubtotal, country)}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>
                            نولون الشحن الدولي
                            {quote.fleetDiscountSaved > 0
                              ? ` (وفر أسطولك ${formatMoney(quote.fleetDiscountSaved, country)})`
                              : ''}
                          </span>
                          <span>{formatMoney(quote.freightCost, country)}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>الرسوم الجمركية والتأمين البحري</span>
                          <span>{formatMoney(quote.customsDuty + quote.insuranceCost, country)}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-800 pt-1.5 text-sm font-semibold text-slate-100">
                          <span>
                            إجمالي التكلفة الواصلة للمخزن
                            {quote.transitDays > 0
                              ? ` (تصل اليوم ${formatNumber(quote.arrivesOnDay)})`
                              : ' (استلام فوري)'}
                          </span>
                          <span className="text-amber-300">{formatMoney(quote.totalLandedCost, country)}</span>
                        </div>
                        {quote.deferredBalanceDue > 0 && (
                          <div className="flex justify-between text-emerald-300 pt-0.5">
                            <span>المستحق نقدًا الآن (30% اعتماد مستندي)</span>
                            <span>
                              {formatMoney(quote.upfrontCashDue, country)} · والباقي{' '}
                              {formatMoney(quote.deferredBalanceDue, country)} عند الوصول
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Interactive Counter-Offer Desk */}
                    {counterOpen && offer.negotiable && (
                      <form
                        onSubmit={(e: FormEvent) => {
                          e.preventDefault();
                          const targetPrice = Number(counterValue);
                          const res = proposeGlobalCounterOffer(
                            profile,
                            offer.id,
                            safeQtyForQuote,
                            targetPrice,
                          );
                          if (res.accepted && res.unitPrice !== undefined) {
                            playSound('cash');
                            setNegotiatedPrices((prev) => ({ ...prev, [offer.id]: res.unitPrice! }));
                            setOpenCounterId(null);
                          } else if (res.counterPrice !== undefined) {
                            setCounterPriceInputs((prev) => ({
                              ...prev,
                              [offer.id]: String(res.counterPrice),
                            }));
                          }
                          onAction(
                            res.accepted
                              ? { ok: true, profile, message: res.message, data: undefined }
                              : {
                                  ok: false,
                                  profile,
                                  message: res.message,
                                  reason: 'condition-not-met',
                                },
                          );
                        }}
                        className="rounded-lg border border-slate-700/80 bg-slate-900/80 p-3 space-y-2.5"
                      >
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-xs">
                          <span className="font-semibold text-slate-200">
                            طاولة المفاوضات التجارية مع {offer.sellerName}
                          </span>
                          <span className="text-slate-400 tabular-nums">
                            كلما زادت الكمية ({formatNumber(safeQtyForQuote)}) وثقة المورد ({formatNumber(trustScore)})، قبل المورد سعراً أدنى
                          </span>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <input
                            type="number"
                            min="1"
                            max={offer.unitPrice}
                            step="1"
                            value={counterValue}
                            onChange={(e) =>
                              setCounterPriceInputs((prev) => ({ ...prev, [offer.id]: e.target.value }))
                            }
                            aria-label="السعر المقترح للوحدة"
                            className="w-full sm:w-48 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 tabular-nums focus:border-amber-400 focus:outline-none"
                          />
                          <button
                            type="submit"
                            className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-400 transition-colors"
                          >
                            إرسال العرض المضاد للوحدة
                          </button>
                          <button
                            type="button"
                            onClick={() => setOpenCounterId(null)}
                            className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 transition-colors"
                          >
                            إغلاق
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Actions Row: Negotiation Controls + PurchaseOptions */}
                    <div className="flex flex-col gap-3 border-t border-slate-800/70 pt-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled={!offer.negotiable}
                          onClick={() => {
                            const result = negotiateGlobalMarketOffer(profile, offer.id);
                            if (result.unitPrice !== undefined && result.accepted) {
                              playSound('cash');
                              setNegotiatedPrices((prev) => ({ ...prev, [offer.id]: result.unitPrice! }));
                            }
                            onAction(
                              result.accepted
                                ? { ok: true, profile, message: result.message, data: undefined }
                                : {
                                    ok: false,
                                    profile,
                                    message: result.message,
                                    reason: 'condition-not-met',
                                  },
                            );
                          }}
                          className="rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 disabled:opacity-45 disabled:cursor-not-allowed transition-colors"
                        >
                          {isNegotiated
                            ? 'تم تثبيت خصم التفاوض'
                            : offer.negotiable
                              ? 'تفاوض مباشر سريع'
                              : 'سعر بورصة ثابت'}
                        </button>

                        {offer.negotiable && (
                          <button
                            type="button"
                            onClick={() =>
                              setOpenCounterId((prev) => (prev === offer.id ? null : offer.id))
                            }
                            className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3.5 py-2 text-xs font-medium text-amber-300 hover:bg-amber-500/20 transition-colors"
                          >
                            {counterOpen ? 'إخفاء العرض المضاد' : 'تقديم سعر مضاد مخصص'}
                          </button>
                        )}
                      </div>

                      <PurchaseOptions
                        country={country}
                        cashPrice={quote.upfrontCashDue}
                        diamondPrice={getDiscountedDiamondPrice(quote.totalLandedCost)}
                        bankBalance={profile.bankBalance}
                        diamondsBalance={profile.diamonds}
                        disabled={!canPurchaseQuantity}
                        cashLabel={
                          shippingMode === 'sea-cif'
                            ? effectiveTerm === 'lc-net2'
                              ? 'فتح اعتماد مستندي وشحن بحري'
                              : 'تعاقد وشحن بحري CIF نقدًا'
                            : shippingMode === 'air-express'
                              ? 'استيراد جوي فوري نقدًا'
                              : 'شراء فوري للمخزن نقدًا'
                        }
                        guideTarget={
                          offer.isLocalFreeZone ? `buy-material-${offer.materialId}` : undefined
                        }
                        onPurchase={(paymentMethod) => {
                          playSound(shippingMode === 'sea-cif' ? 'ship' : 'cash');
                          onCommand(
                            {
                              name: 'buy_global_material',
                              args: {
                                offerId: offer.id,
                                quantity: parsedQty,
                                negotiatedUnitPrice: isNegotiated ? negotiatedUnitPrice : undefined,
                                paymentMethod,
                                shippingMode,
                                paymentTerm: effectiveTerm,
                                fleetCount,
                              },
                            },
                            (current) =>
                              buyGlobalMaterial(
                                current,
                                offer.id,
                                parsedQty,
                                isNegotiated ? negotiatedUnitPrice : undefined,
                                paymentMethod,
                                {
                                  shippingMode,
                                  paymentTerm: effectiveTerm,
                                  fleetCount,
                                },
                              ),
                          );
                        }}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INTERNATIONAL EXPORT BIDS */}
      {activeTab === 'export' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-4 text-xs text-slate-300 leading-relaxed">
            دفتر طلبات الشراء من الموانئ العالمية (Export Bids): صدّر فائض إنتاج مصانعك بالحاويات بعملة صعبة وعلاوة سعرية أعلى من السوق المحلي، مع رسوم تخليص تصديري منخفضة (2% فقط بدلاً من ضريبة المبيعات المحلية) ومكافأة سمعة دولية فورية. المنتجات المصنّعة بخامات <strong className="text-emerald-300">Grade A+</strong> أو بإشراف مدير إنتاج تحقق اشتراطات الموانئ الأوروبية واليابانية بسهولة.
          </div>

          <div className="space-y-4">
            {exportBids.map((bid) => {
              const ownedLot = inventoryByItemId.get(bid.productId);
              const ownedQty = ownedLot?.quantity ?? 0;
              const ownedQuality = Math.round(ownedLot?.qualityScore ?? 88);
              const rawExpQty =
                exportQuantities[bid.id] ??
                String(Math.max(bid.minQuantity, Math.min(ownedQty || bid.minQuantity, bid.maxQuantity)));
              const expQty = Number(rawExpQty);
              const safeCalcQty = Number.isFinite(expQty) && expQty > 0 ? Math.floor(expQty) : bid.minQuantity;

              const gross = safeCalcQty * bid.unitPrice;
              const clearanceFee = Math.round(gross * bid.exportClearanceRate);
              const netProceeds = gross - clearanceFee;

              const qualityMet = ownedQty === 0 || ownedQuality >= bid.minimumQuality;
              const canExport =
                Number.isInteger(expQty) &&
                expQty >= bid.minQuantity &&
                expQty <= bid.maxQuantity &&
                ownedQty >= expQty &&
                ownedQuality >= bid.minimumQuality;

              return (
                <article
                  key={bid.id}
                  className="rounded-xl border border-slate-800/80 bg-slate-950/65 p-4 sm:p-5 space-y-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <h5 className="text-base font-semibold text-slate-100">{bid.productName}</h5>
                        <span className="text-xs text-slate-400">
                          {bid.destinationFlag} {bid.destinationPort} · {bid.buyerName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 tabular-nums">
                        <span>شرط التسليم: {bid.incotermLabel}</span>
                        <span className="mx-1.5" aria-hidden="true">·</span>
                        <span>
                          حجم الحاوية: {formatNumber(bid.minQuantity)}–{formatNumber(bid.maxQuantity)} {bid.unit}
                        </span>
                        <span className="mx-1.5" aria-hidden="true">·</span>
                        <span className={qualityMet ? 'text-slate-300' : 'text-rose-400'}>
                          الحد الأدنى للجودة: {formatNumber(bid.minimumQuality)}%
                        </span>
                        <span className="mx-1.5" aria-hidden="true">·</span>
                        <span className="text-emerald-300">+{formatNumber(bid.reputationReward)} سمعة دولية</span>
                      </p>
                    </div>

                    <div className="text-right sm:text-left tabular-nums shrink-0">
                      <div className="text-sm font-semibold text-emerald-400">
                        {formatMoney(bid.unitPrice, country)} / {bid.unit}
                      </div>
                      <div className="text-xs text-slate-400">
                        المرجع المحلي {formatMoney(bid.localReferencePrice, country)} (+{formatNumber(bid.premiumPct)}%)
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 border-t border-slate-800/70 pt-3 items-end">
                    <div className="sm:col-span-5 space-y-1.5">
                      <label
                        htmlFor={`export-qty-${bid.id}`}
                        className="block text-xs font-medium text-slate-300 tabular-nums"
                      >
                        كمية التصدير (متوفر بمخزنك: {formatNumber(ownedQty)} {bid.unit}
                        {ownedQty > 0 ? ` · جودة ${formatNumber(ownedQuality)}%` : ''})
                      </label>
                      <input
                        id={`export-qty-${bid.id}`}
                        type="number"
                        min={bid.minQuantity}
                        max={Math.min(bid.maxQuantity, Math.max(bid.minQuantity, ownedQty))}
                        step="1"
                        value={rawExpQty}
                        onChange={(e) =>
                          setExportQuantities((prev) => ({ ...prev, [bid.id]: e.target.value }))
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 tabular-nums focus:border-emerald-400 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-4 rounded-lg border border-slate-800 bg-slate-900/50 p-2.5 text-xs space-y-1 tabular-nums">
                      <div className="flex justify-between text-slate-400">
                        <span>رسوم تخليص الميناء (2%)</span>
                        <span>-{formatMoney(clearanceFee, country)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-emerald-300 text-sm">
                        <span>صافي العائد التصديري</span>
                        <span>{formatMoney(netProceeds, country)}</span>
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <button
                        type="button"
                        disabled={!canExport}
                        onClick={() => {
                          playSound('ship');
                          onCommand(
                            {
                              name: 'export_global_product',
                              args: { bidId: bid.id, quantity: expQty },
                            },
                            (current) => exportGlobalProduct(current, bid.id, expQty),
                          );
                        }}
                        className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-45 disabled:cursor-not-allowed transition-colors"
                      >
                        شحن وتصدير الحاوية
                      </button>
                    </div>
                  </div>

                  {!qualityMet && ownedQty > 0 && (
                    <p className="text-xs text-rose-400">
                      جودة مخزونك الحالي ({formatNumber(ownedQuality)}%) أقل من معيار ميناء الوجهة ({formatNumber(bid.minimumQuality)}%). استورد خامات درجة A+ أو عيّن مديراً لخط الإنتاج لفتح هذا السوق.
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: IN-TRANSIT CARGO & TRADE MANIFEST */}
      {activeTab === 'shipments' && (
        <div className="space-y-5">
          <div className="space-y-3">
            <h5 className="text-sm font-semibold text-slate-200">
              الشحنات البحرية القادمة في عرض البحر ({formatNumber(inTransitImports.length)})
            </h5>
            {inTransitImports.length === 0 ? (
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-6 text-center text-xs text-slate-400">
                لا توجد سفن شحن قادمة حالياً. عند الاستيراد بنظام الشحن البحري (CIF) ستظهر الحاويات هنا مع موعد تفريغها في المخزن تلقائياً.
              </div>
            ) : (
              <div className="space-y-3">
                {inTransitImports.map((ship) => {
                  const daysRemaining = Math.max(0, ship.arrivesOnDay - profile.day);
                  return (
                    <article
                      key={ship.id}
                      className="rounded-xl border border-slate-800/80 bg-slate-950/65 p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between tabular-nums"
                    >
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-slate-100">
                          {formatNumber(ship.quantity)} {ship.unit} · {ship.itemName}
                        </div>
                        <p className="text-xs text-slate-400">
                          <span>المصدر: {ship.originOrDestination}</span>
                          <span className="mx-1.5" aria-hidden="true">·</span>
                          <span>المورد: {ship.partnerName}</span>
                          <span className="mx-1.5" aria-hidden="true">·</span>
                          <span>جودة الشحنة: {formatNumber(Math.round(ship.qualityScore))}%</span>
                        </p>
                      </div>
                      <div className="text-right sm:text-left text-xs space-y-1">
                        <div className="font-semibold text-sky-300">
                          تفرغ بالميناء في اليوم {formatNumber(ship.arrivesOnDay)} (متبقي {formatNumber(daysRemaining)} يوم)
                        </div>
                        <div className="text-slate-400">
                          {ship.deferredBalanceDue > 0
                            ? `متبقي اعتماد مستندي عند الوصول: ${formatMoney(ship.deferredBalanceDue, country)}`
                            : 'مدفوعة بالكامل · جاهزة للتفريغ المباشر'}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Completed International Shipments */}
          <div className="space-y-3 border-t border-slate-800/70 pt-4">
            <h5 className="text-sm font-semibold text-slate-200">سجل حركة الميناء الأخير (استيراد وتصدير)</h5>
            {(profile.globalShipments ?? []).filter((s) => s.status === 'delivered').length === 0 ? (
              <p className="text-xs text-slate-500">لم تُسجّل عمليات شحن بحري أو تصدير دولي مكتملة بعد.</p>
            ) : (
              <div className="space-y-2">
                {(profile.globalShipments ?? [])
                  .filter((s) => s.status === 'delivered')
                  .slice(-8)
                  .reverse()
                  .map((ship) => (
                    <div
                      key={ship.id}
                      className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-slate-800/60 bg-slate-950/40 px-3.5 py-2.5 text-xs tabular-nums"
                    >
                      <div className="text-slate-200">
                        <span className={ship.direction === 'export' ? 'text-emerald-400 font-semibold' : 'text-amber-300 font-semibold'}>
                          {ship.direction === 'export' ? 'تصدير دولي' : 'تفريغ واردات'}
                        </span>
                        <span className="mx-1.5" aria-hidden="true">·</span>
                        <span>
                          {formatNumber(ship.quantity)} {ship.unit} {ship.itemName}
                        </span>
                        <span className="mx-1.5" aria-hidden="true">·</span>
                        <span className="text-slate-400">{ship.originOrDestination}</span>
                      </div>
                      <div className="text-slate-400">
                        اليوم {formatNumber(ship.arrivesOnDay)} · {formatMoney(ship.unitCostOrPrice, country)} / {ship.unit}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: FORWARD SUPPLY CONTRACTS & HEDGING */}
      {activeTab === 'hedging' && (
        <div className="space-y-5">
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-4 text-xs text-slate-300 leading-relaxed">
            عقود التحوط والتوريد الآجل (Forward Hedging): ثبّت أسعار المواد الخام الأساسية لمصانعك بخصم 8% عن السعر الفوري لمدة 4 أيام كاملة لحماية هوامش أرباحك من التضخم وصدمات نقص الإمداد. يُدفع هامش تأمين 15% عند التوقيع، وتسدّد الـ 85% المتبقية فقط عند سحب الدفعات إلى مخزنك.
          </div>

          {/* Active Signed Forward Contracts */}
          {activeForwardContracts.length > 0 && (
            <div className="space-y-3">
              <h5 className="text-sm font-semibold text-amber-300">
                عقودك الآجلة النشطة ({formatNumber(activeForwardContracts.length)} / 4)
              </h5>
              <div className="space-y-3">
                {activeForwardContracts.map((contract) => {
                  const rawDraw = drawQuantities[contract.id] ?? String(Math.min(10, contract.remainingQuota));
                  const drawQty = Number(rawDraw);
                  const safeDraw = Number.isFinite(drawQty) && drawQty >= 1 ? Math.floor(drawQty) : 1;
                  const settlementDue = Math.max(1, Math.round(safeDraw * contract.lockedUnitPrice * 0.85));
                  const canDraw =
                    Number.isInteger(drawQty) &&
                    drawQty >= 1 &&
                    drawQty <= contract.remainingQuota &&
                    profile.bankBalance >= settlementDue;

                  return (
                    <article
                      key={contract.id}
                      className="rounded-xl border border-amber-500/30 bg-slate-950/75 p-4 space-y-3 tabular-nums"
                    >
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h6 className="text-sm font-semibold text-slate-100">
                            عقد توريد {contract.materialName} · {contract.supplierName}
                          </h6>
                          <p className="text-xs text-slate-400">
                            <span>{contract.originHub}</span>
                            <span className="mx-1.5" aria-hidden="true">·</span>
                            <span>جودة مضمونة {formatNumber(contract.qualityScore)}%</span>
                            <span className="mx-1.5" aria-hidden="true">·</span>
                            <span>ساري حتى اليوم {formatNumber(contract.expiresOnDay)}</span>
                          </p>
                        </div>
                        <div className="text-xs sm:text-left">
                          <span className="font-semibold text-emerald-300">
                            سعر مثبت: {formatMoney(contract.lockedUnitPrice, country)}
                          </span>
                          <span className="mx-1.5 text-slate-500" aria-hidden="true">·</span>
                          <span className="text-slate-300">
                            الرصيد المتبقي: {formatNumber(contract.remainingQuota)} وحدة
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center pt-1">
                        <input
                          type="number"
                          min="1"
                          max={contract.remainingQuota}
                          step="1"
                          value={rawDraw}
                          onChange={(e) =>
                            setDrawQuantities((prev) => ({ ...prev, [contract.id]: e.target.value }))
                          }
                          aria-label={`كمية السحب من عقد ${contract.materialName}`}
                          className="w-full sm:w-36 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-amber-400 focus:outline-none"
                        />
                        <button
                          type="button"
                          disabled={!canDraw}
                          onClick={() => {
                            playSound('cash');
                            onCommand(
                              {
                                name: 'draw_forward_contract',
                                args: { contractId: contract.id, quantity: drawQty },
                              },
                              (current) => drawFromForwardContract(current, contract.id, drawQty),
                            );
                          }}
                          className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-45 disabled:cursor-not-allowed transition-colors"
                        >
                          سحب للمخزن فوراً (تسوية 85%: {formatMoney(settlementDue, country)})
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {/* Available Forward Contract Templates */}
          <div className="space-y-3">
            <h5 className="text-sm font-semibold text-slate-200">عقود التحوط المتاحة للتوقيع اليوم</h5>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {forwardTemplates.map((tpl) => {
                const alreadySigned = activeForwardContracts.some((c) => c.materialId === tpl.materialId);
                const canSign =
                  !alreadySigned &&
                  activeForwardContracts.length < 4 &&
                  profile.bankBalance >= tpl.marginDeposit;

                return (
                  <article
                    key={tpl.id}
                    className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 flex flex-col justify-between gap-3 tabular-nums"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <h6 className="text-sm font-semibold text-slate-100">{tpl.materialName}</h6>
                        <span className="text-xs font-semibold text-emerald-400">
                          خصم مثبت -{formatNumber(tpl.savingsPct)}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {tpl.supplierName} · {tpl.originHub}
                      </p>
                      <div className="pt-1 text-xs text-slate-300 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-400">السعر المثبت مقابل الفوري:</span>
                          <span>
                            <strong className="text-slate-100">{formatMoney(tpl.lockedUnitPrice, country)}</strong>{' '}
                            <span className="text-slate-500 line-through">
                              {formatMoney(tpl.spotUnitPrice, country)}
                            </span>{' '}
                            /{tpl.unit}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">إجمالي الكمية المضمونة ({tpl.durationDays} أيام):</span>
                          <span>
                            {formatNumber(tpl.totalContractUnits)} {tpl.unit} (جودة {formatNumber(tpl.qualityScore)}%)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">هامش التأمين المبدئي (15%):</span>
                          <span className="font-semibold text-amber-300">
                            {formatMoney(tpl.marginDeposit, country)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!canSign}
                      onClick={() => {
                        playSound('cash');
                        onCommand(
                          { name: 'sign_forward_contract', args: { templateId: tpl.id } },
                          (current) => signForwardContract(current, tpl.id),
                        );
                      }}
                      className="w-full rounded-lg border border-amber-500/50 bg-amber-500/15 px-3.5 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-500/25 disabled:opacity-45 disabled:cursor-not-allowed transition-colors"
                    >
                      {alreadySigned
                        ? 'مُوقّع ونشط حالياً'
                        : `توقيع عقد التوريد الآجل (${formatMoney(tpl.marginDeposit, country)})`}
                    </button>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
