import React, { useState } from 'react';
import type { PlayerProfile } from '../domain/player';
import type { SectionId } from '../domain/navigation';
import { formatMoney } from '../domain/formatters';
import { playSound } from '../game/soundEffects';

interface StruggleStoryHubProps {
  profile: PlayerProfile;
  onNavigate: (section: SectionId, target?: string) => void;
  onUpdateProfile: (updater: (prev: PlayerProfile) => PlayerProfile) => void;
}

export const StruggleStoryHub: React.FC<StruggleStoryHubProps> = ({
  profile,
  onNavigate,
  onUpdateProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'turnaround' | 'characters' | 'phases'>('turnaround');
  const [storyToast, setStoryToast] = useState<string | null>(null);

  const initialCompany = profile.companies.find((c) => c.id === 'inherited-food-company') || profile.companies[0];
  const initialLand = profile.lands.find((l) => l.id === 'inherited-factory-land') || profile.lands[0];
  const bankLoan = profile.banking?.loans?.find((l) => l.id === 'loan-emergency-bank-misr' && l.status === 'active');

  const maintenance = initialCompany?.maintenanceCondition ?? 25;
  const isRepaired = maintenance >= 75;
  const hasRawMaterials = (profile.inventory?.length ?? 0) > 0 || profile.ledger.some((e) => e.note?.includes('خامات'));
  const hasSoldProducts = profile.ledger.some((e) => e.note?.includes('بيع') || e.note?.includes('شحنة'));
  const isLoanPaid = !bankLoan || bankLoan.status === 'paid';

  const daysRemaining = Math.max(0, 7 - (profile.day ?? 1));

  // Quick Action 1: Urgent Factory Overhaul
  const handleRepairFactory = () => {
    if ((profile.bankBalance ?? 0) < 25000) {
      playSound('error');
      setStoryToast('عفواً: رصيد الخزينة غير كافٍ للصيانة (تحتاج 25,000 ج.م).');
      return;
    }

    playSound('factory');
    onUpdateProfile((prev) => {
      const nextCompanies = prev.companies.map((c) =>
        c.id === (initialCompany?.id ?? '') ? { ...c, maintenanceCondition: 90, energyUnits: 45 } : c
      );
      return {
        ...prev,
        bankBalance: prev.bankBalance - 25000,
        companies: nextCompanies,
        reputation: (prev.reputation ?? 35) + 10,
        ledger: [
          ...prev.ledger,
          {
            id: `repair-${Date.now()}`,
            category: 'expense',
            amount: -25000,
            countryId: prev.countryId,
            occurredAt: new Date().toISOString(),
            note: 'تكلفة طقم الصيانة العاجلة والفلاتر وتزييت الماكينات',
          },
        ],
      };
    });

    setStoryToast('تمت صيانة الماكينات بنجاح! عادت كفاءة المصنع إلى 90% وأطلقت صافرة العمل.');
  };

  // Quick Action 2: Buy Emergency Raw Materials Bundle
  const handleBuyMaterialsBundle = () => {
    if ((profile.bankBalance ?? 0) < 35000) {
      playSound('error');
      setStoryToast('عفواً: رصيد الخزينة غير كافٍ لشراء الخامات (تحتاج 35,000 ج.م).');
      return;
    }

    playSound('cash');
    onUpdateProfile((prev) => {
      return {
        ...prev,
        bankBalance: prev.bankBalance - 35000,
        inventory: [
          ...(prev.inventory ?? []),
          {
            id: `mat-flour-${Date.now()}`,
            materialOrProductId: 'mat-flour',
            quantity: 500,
            unit: 'كجم',
            unitCost: 40,
            qualityScore: 90,
          },
          {
            id: `mat-sugar-${Date.now()}`,
            materialOrProductId: 'mat-sugar',
            quantity: 300,
            unit: 'كجم',
            unitCost: 50,
            qualityScore: 90,
          },
        ],
        ledger: [
          ...prev.ledger,
          {
            id: `mat-bundle-${Date.now()}`,
            category: 'expense',
            amount: -35000,
            countryId: prev.countryId,
            occurredAt: new Date().toISOString(),
            note: 'شراء دفعة خامات الطوارئ (دقيق وسكر وتعبئة)',
          },
        ],
      };
    });

    setStoryToast('وصلت شاحنة الخامات إلى رصيف مستودع المصنع بنجاح!');
  };

  // Quick Action 3: Produce & Sell First Run
  const handleProduceAndSell = () => {
    if (!isRepaired) {
      playSound('error');
      setStoryToast('الماكينات معطلة! قم بإجراء الصيانة أولاً قبل محاولة تشغيل خط الإنتاج.');
      return;
    }

    playSound('cash');
    playSound('levelUp');
    onUpdateProfile((prev) => {
      return {
        ...prev,
        bankBalance: prev.bankBalance + 175000,
        diamonds: prev.diamonds + 15,
        reputation: (prev.reputation ?? 35) + 15,
        ledger: [
          ...prev.ledger,
          {
            id: `sale-first-batch-${Date.now()}`,
            category: 'revenue',
            amount: 175000,
            countryId: prev.countryId,
            occurredAt: new Date().toISOString(),
            note: 'توريد أول شحنة بسكويت غذائي إلى أسواق الجملة كاش',
          },
        ],
      };
    });

    setStoryToast('تم تشغيل خط الإنتاج وبيع الشحنة كاش لتجار الجملة! أرباحك: +175,000 ج.م!');
  };

  // Quick Action 4: Pay Off Urgent Bank Debt
  const handlePayBankDebt = () => {
    const debtAmount = bankLoan?.remainingBalance ?? 52500;
    if ((profile.bankBalance ?? 0) < debtAmount) {
      playSound('error');
      setStoryToast(`رصيد الخزينة لا يكفي لسداد قسط البنك (${formatMoney(debtAmount, profile.countryId)}). قم بالبيع أولاً!`);
      return;
    }

    playSound('loan');
    playSound('levelUp');
    onUpdateProfile((prev) => {
      const nextLoans = (prev.banking?.loans ?? []).map((l) =>
        l.id === 'loan-emergency-bank-misr' ? { ...l, remainingBalance: 0, status: 'paid' as const } : l
      );
      return {
        ...prev,
        bankBalance: prev.bankBalance - debtAmount,
        banking: {
          ...prev.banking,
          loans: nextLoans,
        },
        reputation: (prev.reputation ?? 35) + 25,
        badges: Array.from(new Set([...(prev.badges ?? []), 'النجاة من الإفلاس'])),
        ledger: [
          ...prev.ledger,
          {
            id: `pay-loan-${Date.now()}`,
            category: 'expense',
            amount: -debtAmount,
            countryId: prev.countryId,
            occurredAt: new Date().toISOString(),
            note: 'سداد قسط البنك الأهلي التجاري بالكامل ورفع الحجز',
          },
        ],
      };
    });

    setStoryToast('🎉 مبروك! تم سداد قسط البنك بالكامل، ورُفعت دعوى الحجز، وأصبح المصنع حراً آمناً!');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden space-y-4" dir="rtl">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-amber-500/30 text-amber-400">
            <span className="text-3xl">🏭</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white tracking-tight">
                قصة كفاح: إنقاذ مصنع سولي للأغذية المنهار
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                المرحلة 1: طوق النجاة
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              ميراث عائلي مهدد في العاشر من رمضان.. الماكينات معطلة، والخزينة فيها آخر ما تبقى، والبنك يطالب بقسطه!
            </p>
          </div>
        </div>

        {/* Bank Deadline Alert Badge */}
        {!isLoanPaid && (
          <div className="bg-rose-950/60 border border-rose-500/40 p-2.5 rounded-xl flex items-center gap-2.5 self-stretch md:self-auto">
            <span className="text-xl animate-bounce">⏱️</span>
            <div>
              <span className="text-[10px] text-rose-300 font-bold block">مهلة قسط البنك (52,500 ج.م)</span>
              <span className="text-xs font-black text-white font-mono">
                متبقي {daysRemaining} أيام داخل اللعبة (اليوم 7)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar: Live Factory Vital Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block">حالة الماكينات</span>
          <div className="flex items-center justify-between mt-1">
            <span className={`text-sm font-bold font-mono ${isRepaired ? 'text-emerald-400' : 'text-rose-400'}`}>
              {maintenance}% {isRepaired ? '✓ جاهزة' : '⚠️ معطلة'}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full transition-all ${isRepaired ? 'bg-emerald-500' : 'bg-rose-500'}`}
              style={{ width: `${maintenance}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block">خزينة المصنع</span>
          <span className="text-sm font-bold text-white font-mono mt-1 block">
            {formatMoney(profile.bankBalance, profile.countryId)}
          </span>
          <span className="text-[10px] text-emerald-400 mt-1 block">سيولة الإنقاذ المتبقية</span>
        </div>

        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block">حالة قسط البنك</span>
          <span className={`text-sm font-bold font-mono mt-1 block ${isLoanPaid ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isLoanPaid ? 'مسدد بالكامل ✓' : '52,500 ج.م مستحق'}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {isLoanPaid ? 'الحجز ملغي' : 'مهدد بالحجز'}
          </span>
        </div>

        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 block">سمعة المصنع بالسوق</span>
          <span className="text-sm font-bold text-cyan-400 font-mono mt-1 block">
            {profile.reputation ?? 35} / 100
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">تزداد مع كل صفقة ناجحة</span>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTab('turnaround')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'turnaround'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          خطة الطوارئ والإنقاذ (خطوة بخطوة)
        </button>
        <button
          onClick={() => setActiveTab('characters')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'characters'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          شخصيات الحكاية (عم إبراهيم والمحاسب)
        </button>
        <button
          onClick={() => setActiveTab('phases')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'phases'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          خريطة طريق الإمبراطورية (المراحل الأربعة)
        </button>
      </div>

      {/* Toast Feedback */}
      {storyToast && (
        <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs text-center font-bold animate-fade-in shadow-lg">
          {storyToast}
        </div>
      )}

      {/* TAB 1: Turnaround Checklist & Quick Execution */}
      {activeTab === 'turnaround' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Step 1: Repair Machines */}
            <div className={`p-4 rounded-xl border transition-all ${
              isRepaired ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-slate-950/80 border-amber-500/40'
            }`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🔧</span>
                    <h4 className="text-xs font-bold text-white">الخطوة 1: صيانة ماكينات الإنتاج المعطلة</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    فلاتر جديدة وتزييت الماكينات لإعادة تشغيل خط إنتاج الأغذية ليعود بكفاءة 90%.
                  </p>
                  <span className="text-[10px] text-amber-400 font-mono mt-1 block">التكلفة: 25,000 ج.م</span>
                </div>
                {isRepaired ? (
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                    ✓ مكتملة
                  </span>
                ) : (
                  <button
                    onClick={handleRepairFactory}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shrink-0 transition-transform active:scale-95"
                  >
                    إصلاح الماكينات فوراً
                  </button>
                )}
              </div>
            </div>

            {/* Step 2: Buy Raw Materials */}
            <div className={`p-4 rounded-xl border transition-all ${
              hasRawMaterials ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-slate-950/80 border-slate-800'
            }`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🌾</span>
                    <h4 className="text-xs font-bold text-white">الخطوة 2: تأمين خامات الطوارئ (دقيق وسكر)</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    شراء شاحنة دقيق وسكر صناعي ومواد تعبئة تكفي لتشغيل أول دفعة بسكويت.
                  </p>
                  <span className="text-[10px] text-amber-400 font-mono mt-1 block">التكلفة: 35,000 ج.م</span>
                </div>
                {hasRawMaterials ? (
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                    ✓ الخامات بالمستودع
                  </span>
                ) : (
                  <button
                    onClick={handleBuyMaterialsBundle}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shrink-0 transition-transform active:scale-95"
                  >
                    شراء الخامات الآن
                  </button>
                )}
              </div>
            </div>

            {/* Step 3: Run Production & Sell */}
            <div className={`p-4 rounded-xl border transition-all ${
              hasSoldProducts ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-slate-950/80 border-slate-800'
            }`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🍪</span>
                    <h4 className="text-xs font-bold text-white">الخطوة 3: تشغيل الخط وبيع أول شحنة</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    تشغيل خط الإنتاج وتوريد أول شحنة بسكويت غذائي لتجار الجملة كاش لجمع سيولة البنك.
                  </p>
                  <span className="text-[10px] text-emerald-400 font-mono mt-1 block">العائد المتوقع: +175,000 ج.م</span>
                </div>
                {hasSoldProducts ? (
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                    ✓ تم البيع بنجاح
                  </span>
                ) : (
                  <button
                    onClick={handleProduceAndSell}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs shadow-md shrink-0 transition-transform active:scale-95"
                  >
                    تشغيل وبيع الشحنة
                  </button>
                )}
              </div>
            </div>

            {/* Step 4: Repay Bank Debt */}
            <div className={`p-4 rounded-xl border transition-all ${
              isLoanPaid ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-slate-950/80 border-rose-500/40'
            }`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏛️</span>
                    <h4 className="text-xs font-bold text-white">الخطوة 4: سداد قسط البنك الأهلي</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    سداد 52,500 ج.م للبنك قبل انتهاء مهلة اليوم السابع لرفع الحجز واستعادة السجل النظيف.
                  </p>
                  <span className="text-[10px] text-rose-300 font-mono mt-1 block">المبلغ المطلوب: 52,500 ج.م</span>
                </div>
                {isLoanPaid ? (
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                    ✓ مسدد بالكامل
                  </span>
                ) : (
                  <button
                    onClick={handlePayBankDebt}
                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shrink-0 transition-transform active:scale-95"
                  >
                    سداد قسط البنك فوراً
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Story Characters Chatter */}
      {activeTab === 'characters' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Uncle Ibrahim */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20">👴🏻</span>
              <div>
                <h4 className="text-xs font-bold text-white">عم إبراهيم</h4>
                <span className="text-[10px] text-amber-400 block font-medium">كبير فنيي المصنع (30 سنة خبرة)</span>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
              «المصنع ده يا بني كان بيغذي الجمهورية كلها بسكويت وحلويات زمان.. الماكينات لسه فيها بركة، محتاجين بس طقم فلاتر وتزييت كويس وشوية خامات وهنرجع ندور المكن أحسن من الأول!»
            </p>
          </div>

          {/* Mr. Fathi the Accountant */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl p-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">👓</span>
              <div>
                <h4 className="text-xs font-bold text-white">الأستاذ فتحي</h4>
                <span className="text-[10px] text-cyan-400 block font-medium">محاسب الشركة المالي</span>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
              «الحسابات واضحة يا فندم: الخزينة فيها 120 ألف.. صيانة الماكينات بـ 25 ألف، وشراء الخامات بـ 35 ألف، ننتج ونبيع بـ 175 ألف، ونسدد قسط البنك قبل اليوم السابع ونحقق فائض محترم!»
            </p>
          </div>

          {/* Tarek El-Alfy the Smug Rival */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl p-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20">👔</span>
              <div>
                <h4 className="text-xs font-bold text-white">طارق الألفي</h4>
                <span className="text-[10px] text-rose-400 block font-medium">الأخ الشامت والمنافس المتغطرس</span>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
              «أسبوع واحد والبنك هيحجز على المصنع وتيجي تترجاني عشان أشتري منك الأرض خردة بـ 10 قروش! مفيش حد بيقوم من الإفلاس في سوق القاهرة يا شاطر.»
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: 4 Phases of Empire Building */}
      {activeTab === 'phases' && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-right">
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40">
            <span className="text-xs font-black text-emerald-400 block">المرحلة 1: طوق النجاة</span>
            <span className="text-[10px] text-slate-400 block font-mono">الأيام 1 – 7</span>
            <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
              إصلاح ماكينات العاشر من رمضان، شراء أول خامات، بيع أول شحنة، وسداد قسط البنك الأول لمنع الحجز.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-xs font-black text-amber-400 block">المرحلة 2: التعافي والأرباح</span>
            <span className="text-[10px] text-slate-400 block font-mono">الأيام 8 – 20</span>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              تشغيل ورديات إضافية، عقود توريد كبرى، رفع جودة المنتج، وسداد كامل الديون وتحقيق ملايين الأرباح.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-xs font-black text-cyan-400 block">المرحلة 3: التوسع والتوظيف</span>
            <span className="text-[10px] text-slate-400 block font-mono">الأيام 21 – 40</span>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              شراء أراضٍ في مدن صناعية جديدة، تأسيس شركات شحن وتغليف، وتعيين مدراء تشغيل ومندوبي مبيعات.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-xs font-black text-purple-400 block">المرحلة 4: المجموعة القابضة</span>
            <span className="text-[10px] text-slate-400 block font-mono">ما بعد اليوم 40</span>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              دخول البورصة، الاستحواذ على شركات المنافسين، ومنافسة الحيتان في المزادات الدولية الكبرى!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
