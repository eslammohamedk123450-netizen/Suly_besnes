/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import type { PlayerProfile } from '../../domain/player';
import type { SectionId } from '../../domain/navigation';
import { formatMoney } from '../../domain/formatters';
import {
  INDUSTRY_CATALOG,
  findIndustry,
  type IndustryCatalogEntry,
} from '../../game/catalog';
import {
  type CityPlotDefinition,
  type CityConstructionState,
  acquireTransactionLock,
  releaseTransactionLock,
  saveCityConstructions,
  loadCityConstructions,
  getConstructionSpecs,
  loadHQLevel,
  upgradeEmpireHQ,
  accelerateLandTransfer,
  startPlotConstruction,
  accelerateConstruction,
  HQ_TIERS,
} from '../../game/cityGridSystem';
import {
  type GameCommand,
  type GameResult,
  buyDirectLand,
  foundCompany,
  runProduction,
  serviceCompany,
  upgradeCompany,
  upgradeLand,
  repayLoan,
  createDeposit,
} from '../../game/engine';
import { playSound } from '../../game/soundEffects';
import {
  X,
  Building2,
  Factory,
  Landmark,
  Hammer,
  Clock,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Coins,
  Gem,
  CheckCircle2,
  Lock,
  ChevronLeft,
  Wrench,
  TrendingUp,
  FileText,
  BadgeAlert,
  Store,
} from 'lucide-react';
import type { SelectedItem } from './CityCanvas';

interface BuildingDetailSheetProps {
  selectedItem: SelectedItem | null;
  profile: PlayerProfile;
  onClose: () => void;
  onNavigate: (section: SectionId, target?: string) => void;
  onCommand: (
    command: GameCommand,
    fallback: (current: PlayerProfile) => GameResult<unknown>
  ) => void;
  onRefreshGrid: () => void;
  onOpenBranchShop?: () => void;
}

export const BuildingDetailSheet: React.FC<BuildingDetailSheetProps> = ({
  selectedItem,
  profile,
  onClose,
  onNavigate,
  onCommand,
  onRefreshGrid,
  onOpenBranchShop,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIndustryId, setSelectedIndustryId] = useState<string>('');
  const [customCompanyName, setCustomCompanyName] = useState<string>('');
  const [actionNotice, setActionNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [nowClock, setNowClock] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNowClock(Date.now());
    }, 500);
    return () => clearInterval(timer);
  }, []);

  if (!selectedItem) return null;

  const showFeedback = (text: string, type: 'success' | 'error') => {
    setActionNotice({ text, type });
    if (type === 'success') {
      playSound('success');
    } else {
      playSound('error');
    }
  };

  // 1. LANDMARK SHEETS
  if (selectedItem.type === 'landmark') {
    const { id } = selectedItem;

    // A. IMPERIAL TOWER HQ
    if (id === 'hq') {
      const currentHQLvl = loadHQLevel(profile);
      const currentSpec = HQ_TIERS[currentHQLvl - 1] || HQ_TIERS[0];
      const nextSpec = HQ_TIERS[currentHQLvl]; // level currentHQLvl + 1
      const isMaxLevel = !nextSpec;

      const handleUpgradeHQ = (paymentMethod: 'cash' | 'diamonds') => {
        const lockKey = 'upgrade-hq';
        if (!acquireTransactionLock(lockKey)) return;

        setIsSubmitting(true);
        setActionNotice(null);

        try {
          const res = upgradeEmpireHQ(profile, paymentMethod);
          if (res.ok) {
            onCommand(
              {
                name: 'upgrade_empire_hq',
                args: { paymentMethod },
              },
              () => res
            );
            showFeedback(res.message, 'success');
            onRefreshGrid();
          } else {
            showFeedback(res.message, 'error');
          }
        } catch (err: any) {
          showFeedback(err?.message || 'تعذر تطوير المقر', 'error');
        } finally {
          setIsSubmitting(false);
          releaseTransactionLock(lockKey);
        }
      };

      return (
        <div className="absolute inset-x-0 bottom-0 z-40 bg-slate-900/95 border-t border-amber-500/40 rounded-t-3xl shadow-2xl p-5 backdrop-blur-md animate-slide-up text-white max-w-3xl mx-auto max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-amber-300">البرج الإمبراطوري · المستوى {currentHQLvl}</h3>
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                    {currentSpec.title}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{currentSpec.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {actionNotice && (
            <div
              className={`mb-4 p-3 rounded-xl border text-xs font-bold text-center ${
                actionNotice.type === 'success'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
              }`}
            >
              {actionNotice.text}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-xs">
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
              <span className="text-slate-400 block mb-1">المستوى القيادي:</span>
              <span className="font-bold text-amber-400 text-sm">مستوى {profile.level}</span>
            </div>
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
              <span className="text-slate-400 block mb-1">الرصيد النقدي:</span>
              <span className="font-bold text-emerald-400 text-sm">{formatMoney(profile.bankBalance)}</span>
            </div>
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
              <span className="text-slate-400 block mb-1">السمعة التجارية:</span>
              <span className="font-bold text-sky-400 text-sm">{profile.reputation ?? 100} نقطة</span>
            </div>
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
              <span className="text-slate-400 block mb-1">الشركات والأصول:</span>
              <span className="font-bold text-purple-400 text-sm">{profile.companies.length} شركات</span>
            </div>
          </div>

          {/* Upgrade HQ Action Section */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 mb-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>ترقية وتطوير البرج الإمبراطوري</span>
              </span>
              {!isMaxLevel && (
                <span className="text-[11px] text-slate-400">
                  المستوى القادم: <strong className="text-white">{nextSpec.title}</strong>
                </span>
              )}
            </div>

            {isMaxLevel ? (
              <div className="text-xs text-emerald-400 font-bold p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-center">
                🏆 وصل البرج الإمبراطوري إلى أعلى صرح سيادي (المستوى الأقصى)!
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-300">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block">شروط الترقية:</span>
                    <span className="font-bold text-amber-400">
                      ثروة إجمالية لا تقل عن {formatMoney(nextSpec.requiredNetWorth)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block">المزايا المكتسبة:</span>
                    <span className="font-bold text-emerald-400">
                      +{nextSpec.reputationBonus} سمعة · {nextSpec.perks[0]}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpgradeHQ('cash')}
                    disabled={isSubmitting || profile.bankBalance < nextSpec.costCash}
                    className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
                  >
                    <Coins className="w-4 h-4" />
                    <span>تطوير نقدًا ({formatMoney(nextSpec.costCash)})</span>
                  </button>
                  <button
                    onClick={() => handleUpgradeHQ('diamonds')}
                    disabled={isSubmitting || profile.diamonds < nextSpec.costDiamonds}
                    className="flex-1 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-sky-400/30"
                  >
                    <Gem className="w-4 h-4" />
                    <span>تطوير بالماس ({nextSpec.costDiamonds} 💎)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onNavigate('tech_tree');
              }}
              className="flex-1 min-w-[130px] py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>الأبحاث والأتمتة</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onNavigate('luxury');
              }}
              className="flex-1 min-w-[130px] py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>الهيبة والرفاهية</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onNavigate('tasks');
              }}
              className="flex-1 min-w-[130px] py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>المهام اليومية</span>
            </button>
          </div>
        </div>
      );
    }

    // B. CENTRAL BANK
    if (id === 'bank') {
      const activeLoans = (profile.banking?.loans ?? []).filter((l) => l.status === 'active');
      const activeDeposits = (profile.banking?.deposits ?? []).filter((d) => d.status === 'active');
      const firstActiveLoan = activeLoans[0];

      const handleQuickRepayLoan = () => {
        if (!firstActiveLoan) return;
        const lockKey = `repay-${firstActiveLoan.id}`;
        if (!acquireTransactionLock(lockKey)) return;

        setIsSubmitting(true);
        setActionNotice(null);

        try {
          onCommand(
            {
              name: 'repay_loan',
              args: { loanId: firstActiveLoan.id, installments: 1 },
            },
            (current) => repayLoan(current, firstActiveLoan.id, 1)
          );
          showFeedback('تم سداد قسط القرض بنجاح وخصم المبلغ من الحساب!', 'success');
        } catch (err: any) {
          showFeedback(err?.message || 'تعذر سداد القسط', 'error');
        } finally {
          setIsSubmitting(false);
          releaseTransactionLock(lockKey);
        }
      };

      const handleQuickDeposit = () => {
        const depositAmount = 5000;
        if (profile.bankBalance < depositAmount) {
          showFeedback(`تحتاج إلى ${formatMoney(depositAmount)} على الأقل لفتح الوديعة`, 'error');
          return;
        }

        const lockKey = 'quick-deposit';
        if (!acquireTransactionLock(lockKey)) return;

        setIsSubmitting(true);
        setActionNotice(null);

        try {
          onCommand(
            {
              name: 'create_deposit',
              args: { amount: depositAmount, durationDays: 3 },
            },
            (current) => createDeposit(current, depositAmount, 3)
          );
          showFeedback('تم ربط الوديعة الاستثمارية بنجاح لمدة 3 أيام بعائد مجزٍ!', 'success');
        } catch (err: any) {
          showFeedback(err?.message || 'تعذر ربط الوديعة', 'error');
        } finally {
          setIsSubmitting(false);
          releaseTransactionLock(lockKey);
        }
      };

      return (
        <div className="absolute inset-x-0 bottom-0 z-40 bg-slate-900/95 border-t border-sky-500/40 rounded-t-3xl shadow-2xl p-5 backdrop-blur-md animate-slide-up text-white max-w-3xl mx-auto max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                <Landmark className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-sky-300">البنك المركزي والتمويل الاستثماري</h3>
                <p className="text-xs text-slate-400">إدارة التسهيلات الائتمانية، الودائع، وخدمات الخزانة</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {actionNotice && (
            <div
              className={`mb-4 p-3 rounded-xl border text-xs font-bold text-center ${
                actionNotice.type === 'success'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
              }`}
            >
              {actionNotice.text}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4 text-xs">
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
              <span className="text-slate-400 block mb-1">الرصيد المتاح:</span>
              <span className="font-bold text-emerald-400 text-sm">{formatMoney(profile.bankBalance)}</span>
            </div>
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
              <span className="text-slate-400 block mb-1">الودائع الاستثمارية ({activeDeposits.length}):</span>
              <span className="font-bold text-amber-400 text-sm">
                {formatMoney(activeDeposits.reduce((acc, d) => acc + (d.principal || 0), 0))}
              </span>
            </div>
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl col-span-2 md:col-span-1">
              <span className="text-slate-400 block mb-1">القروض القائمة ({activeLoans.length}):</span>
              <span className="font-bold text-rose-400 text-sm">
                {formatMoney(activeLoans.reduce((acc, l) => acc + (l.remainingBalance || l.principal || 0), 0))}
              </span>
            </div>
          </div>

          {/* Quick Bank Operations */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 mb-4 space-y-3">
            <div className="text-xs font-bold text-slate-300">عمليات بنكية سريعة من الخريطة:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <button
                onClick={handleQuickRepayLoan}
                disabled={isSubmitting || !firstActiveLoan || profile.bankBalance < firstActiveLoan.installmentAmount}
                className="p-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-500 disabled:opacity-50 text-right transition-all"
              >
                <div className="font-bold text-xs text-amber-300">سداد قسط القرض الحالي</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {firstActiveLoan
                    ? `قسط ${formatMoney(firstActiveLoan.installmentAmount)} · متبقي ${formatMoney(firstActiveLoan.remainingBalance)}`
                    : 'لا توجد قروض قائمة'}
                </div>
              </button>

              <button
                onClick={handleQuickDeposit}
                disabled={isSubmitting || profile.bankBalance < 5000}
                className="p-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-sky-500 disabled:opacity-50 text-right transition-all"
              >
                <div className="font-bold text-xs text-sky-300">ربط وديعة استثمارية ({formatMoney(5000)})</div>
                <div className="text-[11px] text-slate-400 mt-1">عائد مضمون خلال 3 أيام داخل اللعبة</div>
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              onNavigate('bank');
            }}
            className="w-full py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-500/20"
          >
            <Coins className="w-5 h-5" />
            <span>فتح شاشة البنك والتمويل الشاملة</span>
            <ChevronLeft className="w-4 h-4 mr-auto" />
          </button>
        </div>
      );
    }

    // C. FACTORY COMPLEX
    if (id === 'factory') {
      const companies = profile.companies ?? [];
      const primaryCompany = companies[0];

      const handleRunFastProduction = () => {
        if (!primaryCompany) {
          showFeedback('لا تملك مصنعاً نشطاً بعد', 'error');
          return;
        }

        const lockKey = `produce-${primaryCompany.id}`;
        if (!acquireTransactionLock(lockKey)) return;

        setIsSubmitting(true);
        setActionNotice(null);

        try {
          onCommand(
            {
              name: 'run_production',
              args: { companyId: primaryCompany.id, batches: 1 },
            },
            (current) => runProduction(current, primaryCompany.id, 1)
          );
          showFeedback('تم تشغيل دفعة الإنتاج وتوريد المنتج للمخزن بنجاح!', 'success');
        } catch (err: any) {
          showFeedback(err?.message || 'تعذر تشغيل الإنتاج', 'error');
        } finally {
          setIsSubmitting(false);
          releaseTransactionLock(lockKey);
        }
      };

      const handleServiceFastCompany = () => {
        if (!primaryCompany) return;

        const lockKey = `service-${primaryCompany.id}`;
        if (!acquireTransactionLock(lockKey)) return;

        setIsSubmitting(true);
        setActionNotice(null);

        try {
          onCommand(
            {
              name: 'service_company',
              args: { companyId: primaryCompany.id },
            },
            (current) => serviceCompany(current, primaryCompany.id)
          );
          showFeedback('تمت صيانة وفحص الماكينات ورفع كفاءتها إلى 100%!', 'success');
        } catch (err: any) {
          showFeedback(err?.message || 'تعذر الصيانة', 'error');
        } finally {
          setIsSubmitting(false);
          releaseTransactionLock(lockKey);
        }
      };

      return (
        <div className="absolute inset-x-0 bottom-0 z-40 bg-slate-900/95 border-t border-amber-500/40 rounded-t-3xl shadow-2xl p-5 backdrop-blur-md animate-slide-up text-white max-w-3xl mx-auto max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
                <Factory className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-orange-300">مجمع الصناعات والإنتاج المركزي</h3>
                <p className="text-xs text-slate-400">إدارة خطوط التصنيع، سلاسل التوريد، وكفاءة الماكينات</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {actionNotice && (
            <div
              className={`mb-4 p-3 rounded-xl border text-xs font-bold text-center ${
                actionNotice.type === 'success'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
              }`}
            >
              {actionNotice.text}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4 text-xs">
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
              <span className="text-slate-400 block mb-1">المصانع النشطة:</span>
              <span className="font-bold text-orange-400 text-sm">{companies.length} منشأة</span>
            </div>
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
              <span className="text-slate-400 block mb-1">طاقة التشغيل:</span>
              <span className="font-bold text-amber-400 text-sm">
                {companies.reduce((acc, c) => acc + (c.energyUnits || 0), 0)} وحدة
              </span>
            </div>
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl col-span-2 md:col-span-1">
              <span className="text-slate-400 block mb-1">المواد والمخزون:</span>
              <span className="font-bold text-emerald-400 text-sm">{profile.inventory.length} صنف مسجل</span>
            </div>
          </div>

          {/* Quick Manufacturing Actions */}
          {primaryCompany && (
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 mb-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">المنشأة الأولى: {primaryCompany.name}</span>
                <span className="text-[11px] text-amber-400">
                  كفاءة الماكينات: <strong>{primaryCompany.maintenanceCondition ?? 100}%</strong>
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <button
                  onClick={handleRunFastProduction}
                  disabled={isSubmitting || (primaryCompany.maintenanceCondition ?? 100) < 25}
                  className="p-3 rounded-xl bg-orange-600/30 border border-orange-500/50 hover:bg-orange-600/40 text-right transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-xs text-orange-300">تشغيل دفعة إنتاج سريعة</div>
                    <div className="text-[11px] text-slate-400">إنتاج فوري وفق الوصفة المعتمدة</div>
                  </div>
                  <Zap className="w-5 h-5 text-orange-400" />
                </button>

                <button
                  onClick={handleServiceFastCompany}
                  disabled={isSubmitting}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500 text-right transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-xs text-emerald-300">صيانة الماكينات الفورية</div>
                    <div className="text-[11px] text-slate-400">إصلاح وتزييت المعدات</div>
                  </div>
                  <Wrench className="w-5 h-5 text-emerald-400" />
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onClose();
                onNavigate('production');
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20"
            >
              <Factory className="w-5 h-5" />
              <span>إدارة المصانع ودفعات الإنتاج بالتفصيل</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onNavigate('inventory');
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors border border-slate-700"
            >
              <Coins className="w-5 h-5 text-amber-400" />
              <span>بورصة السلع وشراء الخامات</span>
            </button>
          </div>
        </div>
      );
    }
  }

  // 2. PLOT INTERACTION SHEETS
  if (selectedItem.type !== 'plot') return null;
  const { plot } = selectedItem;

  // Handle direct land purchase
  const handleBuyLand = (paymentMethod: 'cash' | 'diamonds') => {
    // Crucial: Use plot.catalogListingId so engine.ts finds the real direct land listing
    const targetListingId = plot.catalogListingId || plot.id;
    const lockKey = `buy-land-${targetListingId}`;
    if (!acquireTransactionLock(lockKey)) {
      return; // Locked against double-charge
    }

    setIsSubmitting(true);
    setActionNotice(null);

    try {
      onCommand(
        {
          name: 'buy_direct_land',
          args: { listingId: targetListingId, paymentMethod, plotId: plot.id },
        },
        (current) => buyDirectLand(current, targetListingId, paymentMethod, plot.id)
      );

      showFeedback(`تم شراء ${plot.label} بنجاح!`, 'success');
      setTimeout(() => {
        setIsSubmitting(false);
        releaseTransactionLock(lockKey);
        onRefreshGrid();
      }, 400);
    } catch (err: any) {
      showFeedback(err?.message || 'فشل شراء الأرض', 'error');
      setIsSubmitting(false);
      releaseTransactionLock(lockKey);
    }
  };

  // Handle speeding up land paperwork
  const handleAccelerateLand = () => {
    if (!plot.land) return;
    const lockKey = `accel-land-${plot.land.id}`;
    if (!acquireTransactionLock(lockKey)) return;

    setIsSubmitting(true);
    setActionNotice(null);

    try {
      const res = accelerateLandTransfer(profile, plot.land.id);
      if (res.ok) {
        onCommand(
          {
            name: 'use_day_speed_card',
            args: { kind: 'day-speed-2x' },
          },
          () => res
        );
        showFeedback(res.message, 'success');
        onRefreshGrid();
      } else {
        showFeedback(res.message, 'error');
      }
    } catch (err: any) {
      showFeedback(err?.message || 'تعذر تسريع الإجراءات', 'error');
    } finally {
      setIsSubmitting(false);
      releaseTransactionLock(lockKey);
    }
  };

  // Handle starting construction
  const handleStartConstruction = () => {
    if (!selectedIndustryId) {
      showFeedback('يرجى اختيار نوع القطاع الصناعي أولاً', 'error');
      return;
    }

    const landId = plot.land?.id || plot.id;
    const lockKey = `construct-${plot.id}`;
    if (!acquireTransactionLock(lockKey)) {
      return;
    }

    setIsSubmitting(true);
    setActionNotice(null);

    const industry = findIndustry(selectedIndustryId as any);
    const companyName = customCompanyName.trim() || `${industry?.name || 'منشأة'} الإمبراطورية`;

    try {
      const res = startPlotConstruction(
        profile,
        plot.id,
        selectedIndustryId as any,
        companyName,
        'cash'
      );
      if (res.ok) {
        onCommand(
          {
            name: 'found_company',
            args: {
              industryId: selectedIndustryId as any,
              landId,
              name: companyName,
              paymentMethod: 'cash',
            },
          },
          () => res
        );

        showFeedback(res.message, 'success');
        setTimeout(() => {
          setIsSubmitting(false);
          releaseTransactionLock(lockKey);
          onRefreshGrid();
        }, 400);
      } else {
        showFeedback(res.message, 'error');
        setIsSubmitting(false);
        releaseTransactionLock(lockKey);
      }
    } catch (err: any) {
      showFeedback(err?.message || 'تعذر بدء البناء', 'error');
      setIsSubmitting(false);
      releaseTransactionLock(lockKey);
    }
  };

  // Handle accelerating construction with diamonds
  const handleAccelerateConstruction = () => {
    const lockKey = `accel-const-${plot.id}`;
    if (!acquireTransactionLock(lockKey)) return;

    setIsSubmitting(true);
    setActionNotice(null);

    try {
      const res = accelerateConstruction(profile, plot.id);
      if (res.ok) {
        onCommand(
          {
            name: 'use_day_speed_card',
            args: { kind: 'day-speed-2x' },
          },
          () => res
        );
        showFeedback(res.message, 'success');
        setTimeout(() => {
          setIsSubmitting(false);
          releaseTransactionLock(lockKey);
          onRefreshGrid();
        }, 300);
      } else {
        showFeedback(res.message, 'error');
        setIsSubmitting(false);
        releaseTransactionLock(lockKey);
      }
    } catch (err: any) {
      showFeedback(err?.message || 'تعذر تسريع البناء', 'error');
      setIsSubmitting(false);
      releaseTransactionLock(lockKey);
    }
  };

  // Handle upgrading land (+10% area and level)
  const handleUpgradeLand = (landId: string) => {
    const lockKey = `up-land-${landId}`;
    if (!acquireTransactionLock(lockKey)) return;

    setIsSubmitting(true);
    setActionNotice(null);

    try {
      onCommand(
        {
          name: 'upgrade_land',
          args: { landId, paymentMethod: 'cash' },
        },
        (current) => upgradeLand(current, landId, 'cash')
      );
      showFeedback('تمت ترقية الأرض وزيادة مساحتها بنسبة 10% بنجاح!', 'success');
      setTimeout(() => {
        setIsSubmitting(false);
        releaseTransactionLock(lockKey);
        onRefreshGrid();
      }, 400);
    } catch (err: any) {
      showFeedback(err?.message || 'تعذر ترقية الأرض', 'error');
      setIsSubmitting(false);
      releaseTransactionLock(lockKey);
    }
  };

  // Handle upgrading company
  const handleUpgradeCompany = (companyId: string) => {
    const lockKey = `up-comp-${companyId}`;
    if (!acquireTransactionLock(lockKey)) return;

    setIsSubmitting(true);
    setActionNotice(null);

    try {
      onCommand(
        {
          name: 'upgrade_company',
          args: { companyId, paymentMethod: 'cash' },
        },
        (current) => upgradeCompany(current, companyId, 'cash')
      );
      showFeedback('تمت ترقية المنشأة وزيادة طاقتها التشغيلية بنجاح!', 'success');
      setTimeout(() => {
        setIsSubmitting(false);
        releaseTransactionLock(lockKey);
        onRefreshGrid();
      }, 400);
    } catch (err: any) {
      showFeedback(err?.message || 'تعذر ترقية المنشأة', 'error');
      setIsSubmitting(false);
      releaseTransactionLock(lockKey);
    }
  };

  // Allowed industries for this land zoning
  const availableIndustries = INDUSTRY_CATALOG.filter(
    (ind) => ind.requiredLandType === plot.zoning
  );

  return (
    <div className="absolute inset-x-0 bottom-0 z-40 bg-slate-900/95 border-t border-amber-500/40 rounded-t-3xl shadow-2xl p-5 backdrop-blur-md animate-slide-up text-white max-w-3xl mx-auto max-h-[85vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            {plot.status === 'developed' ? (
              <Building2 className="w-7 h-7" />
            ) : plot.status === 'constructing' || plot.status === 'clearing' ? (
              <Hammer className="w-7 h-7 text-amber-400" />
            ) : (
              <Landmark className="w-7 h-7 text-sky-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-amber-300">
                {plot.company ? plot.company.name : plot.label}
              </h3>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  plot.status === 'developed'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : plot.status === 'constructing' || plot.status === 'clearing'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : plot.status === 'owned_empty'
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                    : plot.status === 'paperwork'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : plot.status === 'locked'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                {plot.status === 'developed'
                  ? 'منشأة نشطة'
                  : plot.status === 'constructing'
                  ? 'قيد الإنشاء'
                  : plot.status === 'clearing'
                  ? 'تمهيد الموقع'
                  : plot.status === 'paperwork'
                  ? 'إنهاء عقود الملكية'
                  : plot.status === 'owned_empty'
                  ? 'أرض جاهزة للبناء'
                  : plot.status === 'locked'
                  ? 'منطقة مقفلة'
                  : 'أرض معروضة للاستثمار'}
              </span>
            </div>
            <p className="text-xs text-slate-400">{plot.districtName}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {actionNotice && (
        <div
          className={`mb-4 p-3 rounded-xl border text-xs font-bold text-center ${
            actionNotice.type === 'success'
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
          }`}
        >
          {actionNotice.text}
        </div>
      )}

      {/* Plot Specs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-xs">
        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
          <span className="text-slate-400 block mb-1">المساحة:</span>
          <span className="font-bold text-slate-200">{plot.areaSquareMeters} م²</span>
        </div>
        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
          <span className="text-slate-400 block mb-1">نوع الاستخدام:</span>
          <span className="font-bold text-amber-400">
            {plot.zoning === 'industrial'
              ? 'صناعي'
              : plot.zoning === 'commercial'
              ? 'تجاري'
              : 'زراعي'}
          </span>
        </div>
        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
          <span className="text-slate-400 block mb-1">القيمة السوقية:</span>
          <span className="font-bold text-emerald-400">{formatMoney(plot.defaultPrice)}</span>
        </div>
        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
          <span className="text-slate-400 block mb-1">المستوى المطلوب:</span>
          <span className="font-bold text-sky-400">مستوى {plot.requiredLevel}</span>
        </div>
      </div>

      {/* 1. EMPTY FOR SALE */}
      {plot.status === 'empty_for_sale' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
            موقع استثماري متاح للشراء الفوري. بمجرد الشراء يتم خصم التكلفة مرة واحدة وتثبيت ملكية الأرض في إمبراطوريتك.
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleBuyLand('cash')}
              disabled={isSubmitting || profile.bankBalance < plot.defaultPrice}
              className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
            >
              <Coins className="w-4 h-4" />
              <span>شراء نقدًا ({formatMoney(plot.defaultPrice)})</span>
            </button>
            <button
              onClick={() => handleBuyLand('diamonds')}
              disabled={isSubmitting || profile.diamonds < Math.ceil(plot.defaultPrice / 1500)}
              className="flex-1 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-sky-400/30"
            >
              <Gem className="w-4 h-4" />
              <span>شراء بالماس ({Math.ceil(plot.defaultPrice / 1500)} 💎)</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. PAPERWORK (Land purchased, transfer in progress) */}
      {plot.status === 'paperwork' && plot.land && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/40 text-xs text-purple-200 space-y-2">
            <div className="font-bold flex items-center gap-2 text-purple-300">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>عقود نقل الملكية والمطابقة المساحية قيد المراجعة</span>
            </div>
            <p className="text-[11px] text-slate-300">
              ستكون الأرض جاهزة للبناء والتأسيس تلقائياً في اليوم {plot.land.availableForCompanyOnDay} داخل اللعبة. يمكنك تسريع الإجراءات واستلام الموقع فوراً.
            </p>
          </div>

          <button
            onClick={handleAccelerateLand}
            disabled={isSubmitting || profile.diamonds < 5}
            className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-purple-600/20"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>تسريع الإجراءات واستلام الموقع فوراً (5 💎)</span>
          </button>
        </div>
      )}

      {/* 3. OWNED EMPTY (Ready to Build) */}
      {plot.status === 'owned_empty' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-sky-950/40 border border-sky-500/30 text-xs text-sky-200 flex items-center justify-between">
            <span>أنت تمتلك هذه الأرض! اختر نوع المنشأة لتأسيسها وبدء تشييدها:</span>
            {plot.land && (
              <button
                onClick={() => handleUpgradeLand(plot.land!.id)}
                disabled={isSubmitting}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-sky-400/40 text-[10px] text-sky-300 font-bold hover:bg-slate-800 transition-colors"
              >
                تطوير مساحة الأرض +10%
              </button>
            )}
          </div>

          {onOpenBranchShop && (
            <button
              type="button"
              onClick={onOpenBranchShop}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-between transition-colors shadow-md"
            >
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-amber-400" />
                <span>افتتاح فرع شركة أو متجر تجزئة في هذا الموقع</span>
              </div>
              <ChevronLeft className="w-4 h-4 text-amber-400" />
            </button>
          )}

          <div className="space-y-2">
            <label className="text-xs text-slate-400 block font-bold">اسم الشركة أو المصنع الجديد:</label>
            <input
              type="text"
              value={customCompanyName}
              onChange={(e) => setCustomCompanyName(e.target.value)}
              placeholder="مثال: مجمع النيل للصناعات الهندسية"
              className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-400 block font-bold">القطاع الصناعي المسموح به:</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {availableIndustries.map((ind) => {
                const isSelected = selectedIndustryId === ind.id;
                const cost = ind.setupFee + ind.licenseFee;
                return (
                  <button
                    key={ind.id}
                    type="button"
                    onClick={() => setSelectedIndustryId(ind.id)}
                    className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-white shadow-md shadow-amber-500/10'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs text-amber-300">{ind.name}</div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      تكلفة التأسيس والترخيص: <span className="text-emerald-400 font-bold">{formatMoney(cost)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleStartConstruction}
            disabled={isSubmitting || !selectedIndustryId}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
          >
            <Hammer className="w-5 h-5" />
            <span>تأكيد التأسيس وبدء تشييد المنشأة في الموقع</span>
          </button>
        </div>
      )}

      {/* 4. UNDER CONSTRUCTION */}
      {(plot.status === 'constructing' || plot.status === 'clearing') && (() => {
        const construction = plot.construction;
        const elapsedMs = construction ? Math.max(0, nowClock - construction.startedAt) : 0;
        const totalDuration = construction ? Math.max(1000, construction.durationMs) : 10000;
        const progressPercent = Math.min(100, Math.floor((elapsedMs / totalDuration) * 100));
        const remainingSeconds = Math.max(0, Math.ceil((totalDuration - elapsedMs) / 1000));
        const diamondsCost = Math.max(3, construction?.costDiamonds || 5);

        return (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-400 font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4 animate-spin text-amber-400" />
                  <span>
                    {plot.status === 'clearing' ? 'جاري تمهيد وتسوية الموقع...' : 'جاري تشييد وبناء المنشأة...'}
                  </span>
                </span>
                <span className="text-slate-400 font-bold">
                  {construction?.companyName || 'منشأة صناعية'}
                </span>
              </div>

              {/* Live Remaining Time & Progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-amber-300 font-mono">
                    {remainingSeconds > 0 ? `الوقت المتبقي: ${remainingSeconds} ثانية` : 'اكتملت أعمال التشييد!'}
                  </span>
                  <span className="text-slate-400 font-bold">{progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {remainingSeconds > 0 ? (
              <button
                onClick={handleAccelerateConstruction}
                disabled={isSubmitting || profile.diamonds < diamondsCost}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-sky-400/30 shadow-lg shadow-sky-600/20"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>تسريع البناء والإتمام فوراً بالماس ({diamondsCost} 💎)</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onRefreshGrid();
                  showFeedback('تم تسليم المنشأة وجاهزيتها للعمل والإنتاج!', 'success');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-600/20"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>استلام المنشأة ودخولها خط الإنتاج فوراً</span>
              </button>
            )}
          </div>
        );
      })()}

      {/* 5. DEVELOPED (Finished Active Company) */}
      {plot.status === 'developed' && plot.company && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
              <span className="text-slate-400 block mb-1">القطاع:</span>
              <span className="font-bold text-amber-300">
                {findIndustry(plot.company.industryId)?.name || plot.company.industryId}
              </span>
            </div>
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
              <span className="text-slate-400 block mb-1">كفاءة الماكينات:</span>
              <span
                className={`font-bold ${
                  (plot.company.maintenanceCondition ?? 100) >= 60
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                {plot.company.maintenanceCondition ?? 100}%
              </span>
            </div>
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
              <span className="text-slate-400 block mb-1">مستوى التطوير:</span>
              <span className="font-bold text-purple-400">مستوى {plot.company.upgradeLevel ?? 1}</span>
            </div>
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
              <span className="text-slate-400 block mb-1">طاقة المنشأة:</span>
              <span className="font-bold text-sky-400">{plot.company.energyUnits ?? 0} وحدة</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                onCommand(
                  {
                    name: 'run_production',
                    args: { companyId: plot.company!.id, batches: 1 },
                  },
                  (current) => runProduction(current, plot.company!.id, 1)
                );
                showFeedback('تم تشغيل دفعة الإنتاج وتوريد البضاعة للمخزن بنجاح!', 'success');
              }}
              disabled={(plot.company.maintenanceCondition ?? 100) < 25}
              className="flex-1 min-w-[130px] py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-amber-500/20"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>تشغيل الإنتاج</span>
            </button>

            <button
              onClick={() => {
                onCommand(
                  {
                    name: 'service_company',
                    args: { companyId: plot.company!.id },
                  },
                  (current) => serviceCompany(current, plot.company!.id)
                );
                showFeedback('تمت صيانة وفحص الماكينات ورفع كفاءتها!', 'success');
              }}
              className="flex-1 min-w-[130px] py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
            >
              <Wrench className="w-3.5 h-3.5 text-emerald-400" />
              <span>صيانة الماكينات</span>
            </button>

            <button
              onClick={() => handleUpgradeCompany(plot.company!.id)}
              className="flex-1 min-w-[130px] py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>ترقية المنشأة</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onNavigate('production');
              }}
              className="flex-1 min-w-[130px] py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
            >
              <Factory className="w-3.5 h-3.5 text-sky-400" />
              <span>لوحة الإنتاج الكاملة</span>
            </button>
          </div>
        </div>
      )}

      {/* 6. LOCKED DISTRICT */}
      {plot.status === 'locked' && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-center space-y-2">
          <Lock className="w-8 h-8 text-rose-400 mx-auto" />
          <h4 className="font-bold text-sm text-rose-300">هذه المنطقة مقفلة حالياً</h4>
          <p className="text-xs text-slate-400">
            يتطلب فتح هذه المنطقة الاستثمارية وصول إمبراطوريتك أو المقر الإمبراطوري إلى المستوى {plot.requiredLevel}.
          </p>
        </div>
      )}
    </div>
  );
};
