/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import type { PlayerProfile } from '../../domain/player';
import type { CompanyBranch, RetailShop, RetailShopType } from '../../domain/branchAndShop';
import { RETAIL_SHOP_SPECS, findShopSpec, getBranchSpecs } from '../../domain/branchAndShop';
import { formatCurrency, formatMoney } from '../../domain/formatters';
import { BUILDING_UPGRADE_BASE_COSTS, calculateBuildingUpgradeCost } from '../../game/economyBalance';
import { playSound } from '../../game/soundEffects';
import {
  establishBranch,
  upgradeBranch,
  establishRetailShop,
  upgradeRetailShop,
  linkShopToFactory,
  transferStockToShop,
  sellFromRetailShop,
} from '../../game/branchShopEngine';
import {
  Building2,
  Store,
  ShoppingBag,
  Sparkles,
  Cpu,
  Hammer,
  ArrowRight,
  TrendingUp,
  Package,
  Layers,
  CheckCircle2,
  AlertTriangle,
  X,
  ChevronLeft,
  Truck,
  DollarSign,
  PlusCircle,
  Gem,
  Coins,
  ShieldCheck,
} from 'lucide-react';
import type { CityPlotDefinition } from '../../game/cityGridSystem';

interface BranchAndShopSheetProps {
  plot: CityPlotDefinition;
  profile: PlayerProfile;
  onClose: () => void;
  onRefreshGrid: () => void;
  onProfileUpdate: (updated: PlayerProfile) => void;
}

export const BranchAndShopSheet: React.FC<BranchAndShopSheetProps> = ({
  plot,
  profile,
  onClose,
  onRefreshGrid,
  onProfileUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'transfer' | 'sales'>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Creation State
  const [creationMode, setCreationMode] = useState<'branch' | 'shop'>('shop');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(
    profile.companies?.[0]?.id || ''
  );
  const [selectedShopType, setSelectedShopType] = useState<RetailShopType>('groceries');
  const [customName, setCustomName] = useState<string>('');

  // Stock Transfer State
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [transferQty, setTransferQty] = useState<number>(10);

  // Retail Sale State
  const [saleQty, setSaleQty] = useState<number>(5);

  const showFeedback = (text: string, type: 'success' | 'error') => {
    setFeedback({ text, type });
    if (type === 'success') {
      playSound('success');
    } else {
      playSound('error');
    }
  };

  const branch = plot.branch;
  const shop = plot.shop;

  // 1. COMPANY BRANCH MANAGEMENT VIEW
  if (branch) {
    const handleUpgradeBranch = () => {
      setIsSubmitting(true);
      setFeedback(null);
      try {
        const res = upgradeBranch(profile, branch.id, 'cash');
        if (res.ok) {
          showFeedback(res.message, 'success');
          onProfileUpdate(res.profile);
          onRefreshGrid();
        } else {
          showFeedback(res.message, 'error');
        }
      } catch (err: any) {
        showFeedback(err?.message || 'فشلت ترقية الفرع', 'error');
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="absolute inset-x-0 bottom-0 z-50 bg-slate-900/98 border-t-2 border-amber-500/60 rounded-t-3xl shadow-2xl p-5 backdrop-blur-md animate-slide-up text-white max-w-3xl mx-auto max-h-[85vh] overflow-y-auto" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-amber-300">{branch.name}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  فرع مستوى {branch.level}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {branch.status === 'constructing' ? 'قيد التشييد' : 'نشط ومعتمد'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                الشركة الأم: <span className="text-white font-medium">{branch.parentCompanyName}</span> · {plot.label}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {feedback && (
          <div
            className={`mb-4 p-3 rounded-xl border text-xs font-bold text-center ${
              feedback.type === 'success'
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
            }`}
          >
            {feedback.text}
          </div>
        )}

        {/* Branch Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4 text-xs">
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
            <span className="text-slate-400 block mb-1">حافز الأرباح والكفاءة:</span>
            <span className="font-bold text-emerald-400 text-sm">+{Math.round(branch.revenueBonusRate * 100)}%</span>
          </div>
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
            <span className="text-slate-400 block mb-1">مصاريف التشغيل اليومية:</span>
            <span className="font-bold text-rose-400 text-sm">{formatMoney(branch.dailyOperatingCost)}</span>
          </div>
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
            <span className="text-slate-400 block mb-1">إجمالي الإيرادات:</span>
            <span className="font-bold text-amber-300 text-sm">{formatMoney(branch.performance?.totalRevenue || 0)}</span>
          </div>
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
            <span className="text-slate-400 block mb-1">الطلبيات المنجزة:</span>
            <span className="font-bold text-sky-400 text-sm">{branch.performance?.totalOrdersServed || 0} عملية</span>
          </div>
        </div>

        {/* Upgrade Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-950 border border-amber-500/30 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <span className="font-bold text-sm text-amber-200">ترقية مستوى الفرع</span>
            </div>
            <span className="text-xs text-slate-400">
              المستوى الحالي: <strong>{branch.level} / 5</strong>
            </span>
          </div>
          <p className="text-xs text-slate-300 mb-3">
            ترقية الفرع ترفع الحافز الإنتاجي بنسبة إضافية +8% وتزيد من السمعة التجارية والقيمة الدفترية للإمبراطورية.
          </p>

          <button
            onClick={handleUpgradeBranch}
            disabled={isSubmitting || branch.level >= 5 || profile.bankBalance < calculateBuildingUpgradeCost(BUILDING_UPGRADE_BASE_COSTS.branch, branch.level)}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <Coins className="w-4 h-4" />
            <span>
              {branch.level >= 5
                ? 'الفرع في أعلى مستوى تطوير'
                : `ترقية إلى المستوى ${branch.level + 1} ($ ${formatCurrency(calculateBuildingUpgradeCost(BUILDING_UPGRADE_BASE_COSTS.branch, branch.level))})`}
            </span>
          </button>
        </div>
      </div>
    );
  }

  // 2. RETAIL SHOP MANAGEMENT VIEW
  if (shop) {
    const spec = findShopSpec(shop.shopType);
    const currentLoad = (shop.inventory ?? []).reduce((acc, i) => acc + i.quantity, 0);
    const capacityPercent = Math.min(100, Math.round((currentLoad / shop.shelfCapacity) * 100));

    // Warehouse stock matching this shop
    const availableWarehouseLots = (profile.inventory ?? []).filter((lot) =>
      spec?.compatibleProductIds.includes(lot.materialOrProductId)
    );

    const handleUpgradeShop = () => {
      setIsSubmitting(true);
      setFeedback(null);
      try {
        const res = upgradeRetailShop(profile, shop.id, 'cash');
        if (res.ok) {
          showFeedback(res.message, 'success');
          onProfileUpdate(res.profile);
          onRefreshGrid();
        } else {
          showFeedback(res.message, 'error');
        }
      } catch (err: any) {
        showFeedback(err?.message || 'فشلت ترقية المتجر', 'error');
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleTransferStock = () => {
      if (!selectedProductId) {
        showFeedback('يرجى اختيار المنتج المراد نقله من المستودع', 'error');
        return;
      }
      setIsSubmitting(true);
      setFeedback(null);
      try {
        const res = transferStockToShop(profile, shop.id, selectedProductId, transferQty);
        if (res.ok) {
          showFeedback(res.message, 'success');
          onProfileUpdate(res.profile);
          onRefreshGrid();
        } else {
          showFeedback(res.message, 'error');
        }
      } catch (err: any) {
        showFeedback(err?.message || 'فشل نقل المخزون', 'error');
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleSellFromShop = (productId: string) => {
      setIsSubmitting(true);
      setFeedback(null);
      try {
        const res = sellFromRetailShop(profile, shop.id, productId, saleQty);
        if (res.ok) {
          showFeedback(res.message, 'success');
          onProfileUpdate(res.profile);
          onRefreshGrid();
        } else {
          showFeedback(res.message, 'error');
        }
      } catch (err: any) {
        showFeedback(err?.message || 'فشلت عملية البيع', 'error');
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="absolute inset-x-0 bottom-0 z-50 bg-slate-900/98 border-t-2 border-emerald-500/60 rounded-t-3xl shadow-2xl p-5 backdrop-blur-md animate-slide-up text-white max-w-3xl mx-auto max-h-[85vh] overflow-y-auto" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${spec?.themeColor || '#10b981'}25`, border: `1px solid ${spec?.themeColor || '#10b981'}60`, color: spec?.themeColor || '#10b981' }}
            >
              <Store className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-emerald-300">{shop.name}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  محل مستوى {shop.level}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {spec?.title}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                الموقع: {plot.label} · سعة الأرفف: {currentLoad} / {shop.shelfCapacity} وحدة ({capacityPercent}%)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {feedback && (
          <div
            className={`mb-4 p-3 rounded-xl border text-xs font-bold text-center ${
              feedback.type === 'success'
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
            }`}
          >
            {feedback.text}
          </div>
        )}

        {/* Real Financial Performance Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 text-xs">
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
            <span className="text-slate-400 block mb-1">إجمالي المبيعات:</span>
            <span className="font-bold text-emerald-400 text-sm">{formatMoney(shop.performance?.totalSalesRevenue || 0)}</span>
          </div>
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
            <span className="text-slate-400 block mb-1">تكلفة البضاعة:</span>
            <span className="font-bold text-rose-400 text-sm">{formatMoney(shop.performance?.totalCostOfGoods || 0)}</span>
          </div>
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
            <span className="text-slate-400 block mb-1">صافي أرباح المحل:</span>
            <span className="font-bold text-amber-300 text-sm">{formatMoney(shop.performance?.totalProfit || 0)}</span>
          </div>
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
            <span className="text-slate-400 block mb-1">إجمالي الوحدات المباعة:</span>
            <span className="font-bold text-sky-400 text-sm">{shop.performance?.totalUnitsSold || 0} وحدة</span>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="mb-4 p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-300 font-bold">إشغال أرفف المتجر:</span>
            <span className="text-emerald-400 font-bold">{currentLoad} من {shop.shelfCapacity} وحدة ({capacityPercent}%)</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${capacityPercent}%` }}
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 mb-4 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-2 px-3 border-b-2 font-bold transition-all ${
              activeTab === 'details'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            بضائع الأرفف والبيع المباشر ({shop.inventory?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('transfer')}
            className={`py-2 px-3 border-b-2 font-bold transition-all ${
              activeTab === 'transfer'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            نقل بضائع من المستودع/المصنع
          </button>
        </div>

        {/* Tab 1: Shelf Inventory & Retail Sales */}
        {activeTab === 'details' && (
          <div className="space-y-3 mb-4">
            {(!shop.inventory || shop.inventory.length === 0) ? (
              <div className="p-6 text-center bg-slate-950/50 border border-slate-800/80 rounded-2xl">
                <Package className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <div className="text-sm font-bold text-slate-300">أرفف المتجر فارغة حالياً</div>
                <p className="text-xs text-slate-400 mt-1 mb-3">
                  انقل منتجات من مستودع المصنع لعرضها على الزبائن والبيع بهامش ربح تجزئة ممتاز (+25%).
                </p>
                <button
                  onClick={() => setActiveTab('transfer')}
                  className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all"
                >
                  <Truck className="w-4 h-4" />
                  <span>توريد بضاعة للمحل الآن</span>
                </button>
              </div>
            ) : (
              shop.inventory.map((item) => (
                <div
                  key={item.productId}
                  className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-200">{item.productName}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                      <span>تكلفة الوحدة: <strong className="text-slate-300">{formatMoney(item.unitCost)}</strong></span>
                      <span>سعر البيع للزبائن: <strong className="text-emerald-400">{formatMoney(item.retailPrice)}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSellFromShop(item.productId)}
                      disabled={isSubmitting || item.quantity <= 0}
                      className="py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow transition-all disabled:opacity-50"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>بيع للزبائن (5 وحدات)</span>
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* Upgrade Shop Capacity */}
            <div className="pt-2">
              <button
                onClick={handleUpgradeShop}
                disabled={isSubmitting || shop.level >= 5 || profile.bankBalance < calculateBuildingUpgradeCost(BUILDING_UPGRADE_BASE_COSTS.shop, shop.level)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all"
              >
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>
                  {shop.level >= 5
                    ? 'المتجر في أقصى سعة وتطوير'
                    : `توسعة المتجر وترقيته للمستوى ${shop.level + 1} ($ ${formatCurrency(calculateBuildingUpgradeCost(BUILDING_UPGRADE_BASE_COSTS.shop, shop.level))})`}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Transfer Goods from Warehouse to Shop */}
        {activeTab === 'transfer' && (
          <div className="space-y-4 mb-4">
            <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-xl space-y-3">
              <div className="text-xs font-bold text-slate-200">اختر المنتج المتوفر في المستودع لنقله إلى المتجر:</div>

              {availableWarehouseLots.length === 0 ? (
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg text-center text-xs text-slate-400">
                  لا توجد منتجات متوافقة مع هذا المتجر في المستودع حالياً. شغّل خط إنتاج في المصنع أولاً.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {availableWarehouseLots.map((lot) => (
                    <button
                      key={lot.materialOrProductId}
                      onClick={() => setSelectedProductId(lot.materialOrProductId)}
                      className={`p-3 rounded-xl border text-right transition-all ${
                        selectedProductId === lot.materialOrProductId
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="font-bold text-xs">{lot.materialOrProductId}</div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        المتوفر بالمستودع: <strong className="text-white">{lot.quantity}</strong> {lot.unit}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedProductId && (
                <div className="pt-2 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">الكمية المراد نقلها للأرفف:</span>
                    <span className="font-bold text-emerald-400">{transferQty} وحدة</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max={Math.min(50, Math.max(1, shop.shelfCapacity - currentLoad))}
                    value={transferQty}
                    onChange={(e) => setTransferQty(parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-500"
                  />

                  <button
                    onClick={handleTransferStock}
                    disabled={isSubmitting || currentLoad >= shop.shelfCapacity}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    <Truck className="w-4 h-4" />
                    <span>تأكيد نقل {transferQty} وحدة إلى أرفف المحل</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. CREATION MODE ON OWNED COMMERCIAL PLOT
  const handleEstablish = () => {
    setIsSubmitting(true);
    setFeedback(null);

    try {
      if (creationMode === 'branch') {
        if (!selectedCompanyId) {
          showFeedback('يرجى اختيار الشركة الأم أولاً', 'error');
          setIsSubmitting(false);
          return;
        }
        const res = establishBranch(profile, selectedCompanyId, plot.id, customName, 'cash');
        if (res.ok) {
          showFeedback(res.message, 'success');
          onProfileUpdate(res.profile);
          setTimeout(() => {
            onRefreshGrid();
            onClose();
          }, 800);
        } else {
          showFeedback(res.message, 'error');
        }
      } else {
        const res = establishRetailShop(
          profile,
          selectedShopType,
          plot.id,
          customName,
          selectedCompanyId || undefined,
          'cash'
        );
        if (res.ok) {
          showFeedback(res.message, 'success');
          onProfileUpdate(res.profile);
          setTimeout(() => {
            onRefreshGrid();
            onClose();
          }, 800);
        } else {
          showFeedback(res.message, 'error');
        }
      }
    } catch (err: any) {
      showFeedback(err?.message || 'تعذر استكمال العملية', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSpec = findShopSpec(selectedShopType);
  const selectedParent = profile.companies?.find((c) => c.id === selectedCompanyId);
  const branchCost = 15000;
  const shopCost = selectedSpec?.setupCost || 8500;

  return (
    <div className="absolute inset-x-0 bottom-0 z-50 bg-slate-900/98 border-t-2 border-sky-500/60 rounded-t-3xl shadow-2xl p-5 backdrop-blur-md animate-slide-up text-white max-w-3xl mx-auto max-h-[85vh] overflow-y-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div>
          <h3 className="font-bold text-lg text-sky-300">تطوير الموقع التجاري · {plot.label}</h3>
          <p className="text-xs text-slate-400">اختر تأسيس فرع شركة أو افتتاح محل تجاري جديد لبيع منتجات الإمبراطورية</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {feedback && (
        <div
          className={`mb-4 p-3 rounded-xl border text-xs font-bold text-center ${
            feedback.type === 'success'
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Mode Switcher */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          type="button"
          onClick={() => setCreationMode('shop')}
          className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
            creationMode === 'shop'
              ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 shadow-md'
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>افتتاح محل تجاري وتجزئة</span>
        </button>
        <button
          type="button"
          onClick={() => setCreationMode('branch')}
          className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
            creationMode === 'branch'
              ? 'bg-amber-600/30 border-amber-500 text-amber-300 shadow-md'
              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>تأسيس فرع شركة</span>
        </button>
      </div>

      {creationMode === 'shop' ? (
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-300">اختر نوع المحل التجاري:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {RETAIL_SHOP_SPECS.map((s) => (
              <button
                key={s.type}
                type="button"
                onClick={() => setSelectedShopType(s.type)}
                className={`p-3 rounded-xl border text-right transition-all ${
                  selectedShopType === s.type
                    ? 'bg-slate-800 border-emerald-400 shadow-lg'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-white">{s.title}</span>
                  <span className="text-[11px] font-bold text-emerald-400">{formatMoney(s.setupCost)}</span>
                </div>
                <p className="text-[11px] text-slate-400 mb-2">{s.description}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800 pt-1.5">
                  <span>سعة الأرفف: {s.shelfBaseCapacity} وحدة</span>
                  <span>المستوى المطلوب: {s.requiredPlayerLevel}</span>
                </div>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">اسم المحل التجاري (اختياري):</label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder={`مثال: ${selectedSpec?.title || 'سوبرماركت الإمبراطورية'}`}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">ربط المحل بمصنع إمداد تابع لك (اختياري):</label>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">بدون ربط مباشر حالياً (متجر مستقل)</option>
              {profile.companies?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.industryId})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleEstablish}
            disabled={isSubmitting || profile.bankBalance < shopCost}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <Store className="w-4 h-4" />
            <span>افتتاح وتشييد المحل الآن ({formatMoney(shopCost)})</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">اختر الشركة الأم لتأسيس فرع تابع لها:</label>
            {(!profile.companies || profile.companies.length === 0) ? (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                يجب تأسيس شركة رئيسية أولاً قبل فتح فروع لها.
              </div>
            ) : (
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {profile.companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.industryId})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">اسم الفرع الجديد:</label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder={`مثال: فرع ${selectedParent?.name || 'الشركة'} - قطاع العاصمة`}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">تكلفة التأسيس والإنشاء:</span>
              <span className="font-bold text-amber-400">{formatMoney(branchCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">حافز الإنتاج والأرباح المكتسب:</span>
              <span className="font-bold text-emerald-400">+8% للشركة الأم</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">مستوى اللاعب المطلوب:</span>
              <span className="font-bold text-sky-400">المستوى 2 أو أعلى</span>
            </div>
          </div>

          <button
            onClick={handleEstablish}
            disabled={isSubmitting || !selectedCompanyId || profile.bankBalance < branchCost || profile.level < 2}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <Building2 className="w-4 h-4" />
            <span>تأسيس الفرع وبدء البناء ({formatMoney(branchCost)})</span>
          </button>
        </div>
      )}
    </div>
  );
};
