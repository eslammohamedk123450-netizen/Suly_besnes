import React, { useState, type FormEvent } from 'react';
import type { CountryDefinition } from '../domain/countries';
import type { PlayerProfile } from '../domain/player';
import { formatMoney, formatNumber } from '../domain/formatters';
import { 
  createDeposit, 
  getDepositExpectedInterest, 
  getDepositMaturityRange, 
  hasMaturedDepositTranche, 
  mergeDeposits, 
  repayLoan, 
  takeLoan, 
  withdrawDeposit, 
  type GameCommand, 
  type GameResult 
} from '../game/engine';
import { playSound } from '../game/soundEffects';
import { 
  Landmark, 
  PiggyBank, 
  CreditCard, 
  TrendingUp, 
  ShieldCheck, 
  Plus, 
  ArrowUpRight, 
  Clock, 
  Coins, 
  AlertCircle, 
  CheckCircle2, 
  ChevronLeft 
} from 'lucide-react';

interface BankTerminalProps {
  profile: PlayerProfile;
  country: CountryDefinition;
  initialTab?: 'deposits' | 'loans';
  onCommand: (command: GameCommand, fallback: (current: PlayerProfile) => GameResult<unknown>) => void;
}

export const BankTerminal: React.FC<BankTerminalProps> = ({
  profile,
  country,
  initialTab = 'deposits',
  onCommand,
}) => {
  const [activeTab, setActiveTab] = useState<'deposits' | 'loans'>(initialTab);
  
  // Deposit form state
  const [depositAmount, setDepositAmount] = useState('50000');
  const [depositDuration, setDepositDuration] = useState('7');

  // Loan form state
  const [loanAmount, setLoanAmount] = useState('25000');
  const [loanTerm, setLoanTerm] = useState('14');
  const [loanRepaymentCounts, setLoanRepaymentCounts] = useState<Record<string, string>>({});

  const collateralOptions = [
    ...profile.lands.map((land) => ({ id: land.id, label: land.label, type: 'land' as const, value: land.purchasePrice })),
    ...profile.companies.map((company) => ({ id: company.id, label: company.name, type: 'company' as const, value: (company.upgradeLevel ?? 1) * 200000 })),
  ];
  const [loanCollateral, setLoanCollateral] = useState(collateralOptions[0]?.id || '');
  const selectedCollateral = collateralOptions.find((item) => item.id === (loanCollateral || collateralOptions[0]?.id));

  // Calculations
  const activeDeposits = profile.banking.deposits.filter((d) => d.status === 'active');
  const totalDeposits = activeDeposits.reduce((sum, d) => sum + d.principal, 0);
  const expectedInterest = activeDeposits.reduce((sum, d) => sum + getDepositExpectedInterest(d), 0);
  const depositLimitReached = activeDeposits.length >= 5;

  const activeLoans = profile.banking.loans.filter((l) => l.status === 'active');
  const totalLoansRemaining = activeLoans.reduce((sum, l) => sum + l.remainingBalance, 0);
  const loanLimitReached = activeLoans.length >= 3;

  const loanRate = Number(loanTerm) === 7 ? 0.18 : Number(loanTerm) === 14 ? 0.22 : 0.28;
  const estimatedRepayment = Math.round(Number(loanAmount) * (1 + (loanRate * Number(loanTerm)) / 30));
  const estimatedDailyInstallment = Math.ceil(estimatedRepayment / Math.max(1, Number(loanTerm)));

  const handleDepositDurationRate = (days: number) => {
    if (days === 3) return 0.05;
    if (days === 7) return 0.08;
    return 0.12;
  };

  const calculatedDepositProfit = Math.round(Number(depositAmount) * handleDepositDurationRate(Number(depositDuration)));

  const runCommand = (command: GameCommand, fallback: (current: PlayerProfile) => GameResult<unknown>) => {
    if (command.name === 'create_deposit') {
      playSound('vault');
    } else if (command.name === 'take_loan') {
      playSound('loan');
    } else {
      playSound('cash');
    }
    onCommand(command, fallback);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2" dir="rtl">
      {/* 1. Executive Treasury Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-400 text-white flex items-center justify-center shadow-xl shadow-indigo-500/25 font-black text-2xl">
              <Landmark className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  بنك وخزينة إمبراطورية الأعمال
                </h1>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                  {country.flag} {country.name}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                إدارة الودائع الاستثمارية ذات العوائد المضمونة والتسهيلات الائتمانية بضمان الأصول
              </p>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 px-4 text-left shrink-0">
            <span className="text-[11px] text-slate-400 block">رصيد حسابك الجاري المتاح</span>
            <strong className="text-base sm:text-lg font-black text-emerald-400 font-mono">
              {formatMoney(profile.bankBalance, country)}
            </strong>
          </div>
        </div>

        {/* 4 Treasury Stats Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
              <PiggyBank className="w-3.5 h-3.5 text-emerald-400" />
              الودائع المحجوزة
            </span>
            <strong className="text-sm sm:text-base font-extrabold text-white">
              {formatMoney(totalDeposits, country)}
            </strong>
            <small className="text-[10px] text-slate-500 block">{activeDeposits.length}/5 ودائع نشطة</small>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              الأرباح المتوقعة
            </span>
            <strong className="text-sm sm:text-base font-extrabold text-amber-400">
              +{formatMoney(expectedInterest, country)}
            </strong>
            <small className="text-[10px] text-emerald-500 block">تُضاف تلقائياً عند الاستحقاق</small>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
              <CreditCard className="w-3.5 h-3.5 text-rose-400" />
              التزامات القروض
            </span>
            <strong className="text-sm sm:text-base font-extrabold text-rose-300">
              {formatMoney(totalLoansRemaining, country)}
            </strong>
            <small className="text-[10px] text-slate-500 block">{activeLoans.length}/3 قروض جارية</small>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              أصول الضمان المتاحة
            </span>
            <strong className="text-sm sm:text-base font-extrabold text-sky-300">
              {collateralOptions.length} أصول
            </strong>
            <small className="text-[10px] text-slate-500 block">{profile.lands.length} أراضٍ · {profile.companies.length} شركات</small>
          </div>
        </div>
      </div>

      {/* 2. Sleek Tab Switcher */}
      <div className="flex items-center gap-3 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl">
        <button
          onClick={() => {
            playSound('click');
            setActiveTab('deposits');
          }}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'deposits'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <PiggyBank className="w-4 h-4" />
          <span>الودائع الاستثمارية ذات العائد ({activeDeposits.length})</span>
        </button>

        <button
          onClick={() => {
            playSound('click');
            setActiveTab('loans');
          }}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'loans'
              ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-950/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>التسهيلات الائتمانية والقروض ({activeLoans.length})</span>
        </button>
      </div>

      {/* 3. Tab 1: DEPOSITS */}
      {activeTab === 'deposits' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Open Deposit Form (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white">فتح وديعة استثمارية جديدة</h3>
                  <small className="text-[11px] text-slate-400">عوائد نقدية مضمونة تتضاعف بمرور الأيام</small>
                </div>
              </div>
            </div>

            {depositLimitReached && (
              <div className="p-3 mb-4 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>وصلت للحد الأقصى (5 ودائع نشطة). ادمج الودائع الحالية أو استرد المستحق منها لفتح وديعة جديدة.</span>
              </div>
            )}

            <form
              onSubmit={(e: FormEvent) => {
                e.preventDefault();
                runCommand(
                  { name: 'create_deposit', args: { amount: Number(depositAmount), durationDays: Number(depositDuration) } },
                  (curr) => createDeposit(curr, Number(depositAmount), Number(depositDuration))
                );
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  مبلغ الوديعة المطلوب حجزه ({country.currency.code}):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="50000"
                    step="10000"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono font-bold text-sm focus:outline-none focus:border-emerald-500 transition"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">
                    {country.currency.code}
                  </span>
                </div>

                {/* Quick Amount Chips */}
                <div className="flex gap-1.5 mt-2">
                  {[50000, 100000, 250000, 500000].map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setDepositAmount(String(amt))}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold transition"
                    >
                      +{amt.toLocaleString()}
                    </button>
                  ))}
                  {profile.bankBalance >= 50000 && (
                    <button
                      type="button"
                      onClick={() => setDepositAmount(String(Math.floor(profile.bankBalance / 10000) * 10000))}
                      className="px-2 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold transition"
                    >
                      الكل
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  فترة الاستحقاق ومعدل العائد:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDepositDuration('3')}
                    className={`p-2.5 rounded-xl border text-center transition ${
                      depositDuration === '3'
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="block text-xs font-black">3 أيام</span>
                    <small className="text-[10px] text-emerald-400">+5% ربح</small>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDepositDuration('7')}
                    className={`p-2.5 rounded-xl border text-center transition ${
                      depositDuration === '7'
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="block text-xs font-black">7 أيام</span>
                    <small className="text-[10px] text-emerald-400">+8% ربح</small>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDepositDuration('14')}
                    className={`p-2.5 rounded-xl border text-center transition ${
                      depositDuration === '14'
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="block text-xs font-black">14 يوم</span>
                    <small className="text-[10px] text-emerald-400">+12% ربح</small>
                  </button>
                </div>
              </div>

              {/* Dynamic Live Returns Box */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>الأرباح المتوقعة عند الاستحقاق:</span>
                  <strong className="text-emerald-400 font-mono">+{formatMoney(calculatedDepositProfit, country)}</strong>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>إجمالي المبلغ المسترد:</span>
                  <strong className="text-white font-mono">{formatMoney(Number(depositAmount) + calculatedDepositProfit, country)}</strong>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>يوم الاستحقاق في اللعبة:</span>
                  <strong className="text-amber-400 font-mono">اليوم {profile.day + Number(depositDuration)}</strong>
                </div>
              </div>

              <button
                type="submit"
                disabled={depositLimitReached || Number(depositAmount) < 50000 || Number(depositAmount) > profile.bankBalance}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-40 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-slate-950" />
                <span>إيداع الوديعة الآن</span>
              </button>
            </form>
          </div>

          {/* Active Deposits List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white">الودائع النشطة في البنك</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
                  {activeDeposits.length} من 5
                </span>
              </div>

              {activeDeposits.length > 1 && (
                <button
                  type="button"
                  onClick={() => runCommand(
                    { name: 'merge_deposits', args: { depositIds: activeDeposits.map((d) => d.id) } },
                    (curr) => mergeDeposits(curr, activeDeposits.map((d) => d.id))
                  )}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl transition"
                >
                  ⚡ دمج كل الودائع في وديعة واحدة
                </button>
              )}
            </div>

            {activeDeposits.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/60 rounded-3xl border border-dashed border-slate-800 space-y-2">
                <PiggyBank className="w-12 h-12 text-slate-600 mx-auto" />
                <h4 className="font-bold text-white text-sm">لا توجد لديك أي ودائع استثمارية حالياً</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  حجز جزء من سيولتك الفائضة في ودائع يمنحك عوائد تراكمية دورية تحميك من نفقات التشغيل.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {activeDeposits.slice().reverse().map((deposit) => {
                  const interest = getDepositExpectedInterest(deposit);
                  const maturity = getDepositMaturityRange(deposit);
                  const isMatured = hasMaturedDepositTranche(deposit, profile.day);
                  const isMerged = Boolean(deposit.tranches);

                  return (
                    <div
                      key={deposit.id}
                      className={`p-4 rounded-2xl bg-slate-900 border transition flex flex-col justify-between ${
                        isMatured ? 'border-emerald-500/80 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/40' : 'border-slate-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                            isMatured 
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {isMatured ? '✓ حان وقت الاسترداد!' : isMerged ? 'وديعة مدمجة' : 'قيد الاستثمار'}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-400 font-mono">
                            عائد {Math.round(deposit.annualRate * 100)}%
                          </span>
                        </div>

                        <strong className="text-base font-black text-white block mb-1 font-mono">
                          {formatMoney(deposit.principal, country)}
                        </strong>

                        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                          <span>الربح الإضافي:</span>
                          <strong className="text-emerald-400 font-mono">+{formatMoney(interest, country)}</strong>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-2">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>
                            {maturity.firstDay === maturity.lastDay
                              ? `تستحق بالكامل في اليوم ${maturity.firstDay}`
                              : `استحقاق تدريجي حتى اليوم ${maturity.lastDay}`}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800">
                        {isMatured ? (
                          <button
                            type="button"
                            onClick={() => runCommand(
                              { name: 'withdraw_deposit', args: { depositId: deposit.id } },
                              (curr) => withdrawDeposit(curr, deposit.id)
                            )}
                            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-md transition"
                          >
                            استرداد الوديعة والأرباح (+{formatMoney(deposit.principal + interest, country)}) 💰
                          </button>
                        ) : (
                          <div className="text-center text-[10px] text-slate-500">
                            متبقي {Math.max(1, maturity.firstDay - profile.day)} يوم للوصول للاستحقاق
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Tab 2: LOANS */}
      {activeTab === 'loans' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Request Loan Form (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white">طلب تسهيل ائتماني وقرض</h3>
                  <small className="text-[11px] text-slate-400">تمويل بضمان أصولك العقارية أو الصناعية</small>
                </div>
              </div>
            </div>

            {loanLimitReached && (
              <div className="p-3 mb-4 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>وصلت للحد الأقصى (3 قروض نشطة). يجب سداد قرض قائم أولاً للتأهل لقرض جديد.</span>
              </div>
            )}

            {selectedCollateral ? (
              <form
                onSubmit={(e: FormEvent) => {
                  e.preventDefault();
                  runCommand(
                    { 
                      name: 'take_loan', 
                      args: { 
                        collateralType: selectedCollateral.type, 
                        collateralId: selectedCollateral.id, 
                        amount: Number(loanAmount), 
                        termDays: Number(loanTerm) 
                      } 
                    },
                    (curr) => takeLoan(curr, selectedCollateral.type, selectedCollateral.id, Number(loanAmount), Number(loanTerm))
                  );
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    اختر أصل الضمان التمويلي:
                  </label>
                  <select
                    value={selectedCollateral.id}
                    onChange={(e) => setLoanCollateral(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white text-xs font-bold focus:outline-none focus:border-indigo-500 transition"
                  >
                    {collateralOptions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.type === 'land' ? '🗺️ أرض' : '🏭 شركة'}: {item.label} (قيمة {formatMoney(item.value, country)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    مبلغ التمويل المطلوب ({country.currency.code}):
                  </label>
                  <input
                    type="number"
                    min="25000"
                    step="5000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono font-bold text-sm focus:outline-none focus:border-indigo-500 transition"
                  />
                  {/* Quick Chips */}
                  <div className="flex gap-1.5 mt-2">
                    {[25000, 50000, 100000, 200000].map((amt) => (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => setLoanAmount(String(amt))}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold transition"
                      >
                        +{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    مدة السداد والفائدة:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setLoanTerm('7')}
                      className={`p-2.5 rounded-xl border text-center transition ${
                        loanTerm === '7'
                          ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="block text-xs font-black">7 أيام</span>
                      <small className="text-[10px] text-slate-400">فائدة 18%</small>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLoanTerm('14')}
                      className={`p-2.5 rounded-xl border text-center transition ${
                        loanTerm === '14'
                          ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="block text-xs font-black">14 يوم</span>
                      <small className="text-[10px] text-slate-400">فائدة 22%</small>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLoanTerm('30')}
                      className={`p-2.5 rounded-xl border text-center transition ${
                        loanTerm === '30'
                          ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="block text-xs font-black">30 يوم</span>
                      <small className="text-[10px] text-slate-400">فائدة 28%</small>
                    </button>
                  </div>
                </div>

                {/* Loan Repayment Schedule Card */}
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>إجمالي السداد مع الفائدة:</span>
                    <strong className="text-rose-400 font-mono">{formatMoney(estimatedRepayment, country)}</strong>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>القسط اليومي المستحق:</span>
                    <strong className="text-white font-mono">{formatMoney(estimatedDailyInstallment, country)} / يوم</strong>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loanLimitReached || Number(loanAmount) < 25000}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-40 text-white font-black text-sm shadow-lg shadow-indigo-500/25 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4 text-white" />
                  <span>توقيع العقد واستلام السيولة الآن</span>
                </button>
              </form>
            ) : (
              <div className="p-8 text-center bg-slate-950/50 rounded-2xl border border-dashed border-slate-800 space-y-2">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                <h4 className="font-bold text-white text-sm">لا يتوفر لديك أصول مؤهلة كضمان</h4>
                <p className="text-xs text-slate-400">
                  اشترِ أرضاً أو أسس شركة لتستخدمها كضمان قانوني للحصول على قروض بنكية.
                </p>
              </div>
            )}
          </div>

          {/* Active Loans List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white">القروض النشطة والتسهيلات</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
                  {activeLoans.length} من 3
                </span>
              </div>
            </div>

            {activeLoans.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/60 rounded-3xl border border-dashed border-slate-800 space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500/60 mx-auto" />
                <h4 className="font-bold text-white text-sm">سجلك الائتماني نظيف 100%</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  لا توجد أي قروض أو أقساط متأخرة على إمبراطوريتك. يمكنك طلب تسهيلات تمويلية للتوسع متى شئت.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {activeLoans.map((loan) => {
                  const repaymentCount = loanRepaymentCounts[loan.id] ?? '1';
                  const maxInstallments = Math.ceil(loan.remainingBalance / loan.installmentAmount);
                  const canPayInstallment = profile.bankBalance >= Math.min(loan.remainingBalance, loan.installmentAmount * Number(repaymentCount));
                  const canPayAll = profile.bankBalance >= loan.remainingBalance;

                  return (
                    <div
                      key={loan.id}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-white text-sm font-extrabold">
                              قرض بضمان {loan.collateralType === 'land' ? 'أرض عقارية' : 'منشأة صناعية'}
                            </strong>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                              القسط القادم: اليوم {loan.nextPaymentDay}
                            </span>
                          </div>
                          <small className="text-[11px] text-slate-400">
                            أصل القرض: {formatMoney(loan.principal, country)} · مدة {loan.termDays} يوم
                          </small>
                        </div>

                        <div className="text-left">
                          <span className="text-[10px] text-slate-400 block">المتبقي للسداد الكامل:</span>
                          <strong className="text-base font-black text-rose-400 font-mono">
                            {formatMoney(loan.remainingBalance, country)}
                          </strong>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs py-1">
                        <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">قيمة القسط</span>
                          <strong className="text-white font-mono">{formatMoney(loan.installmentAmount, country)}</strong>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">الأقساط المتبقية</span>
                          <strong className="text-amber-400 font-mono">{maxInstallments} قسط</strong>
                        </div>
                        <div className="col-span-2 sm:col-span-1 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">حالة السداد</span>
                          <strong className="text-emerald-400 font-mono">منتظم ✓</strong>
                        </div>
                      </div>

                      {/* Repayment Controls */}
                      <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <label className="text-xs text-slate-400 shrink-0">أقساط:</label>
                          <input
                            type="number"
                            min="1"
                            max={maxInstallments}
                            value={repaymentCount}
                            onChange={(e) => setLoanRepaymentCounts((prev) => ({ ...prev, [loan.id]: e.target.value }))}
                            className="w-16 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-center text-xs text-white font-bold"
                          />
                          <button
                            type="button"
                            disabled={!canPayInstallment}
                            onClick={() => runCommand(
                              { name: 'repay_loan', args: { loanId: loan.id, installments: Number(repaymentCount) } },
                              (curr) => repayLoan(curr, loan.id, Number(repaymentCount))
                            )}
                            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-bold text-xs border border-slate-700 transition"
                          >
                            سداد {repaymentCount} قسط ({formatMoney(loan.installmentAmount * Number(repaymentCount), country)})
                          </button>
                        </div>

                        <button
                          type="button"
                          disabled={!canPayAll}
                          onClick={() => runCommand(
                            { name: 'repay_loan', args: { loanId: loan.id, installments: 'all' } },
                            (curr) => repayLoan(curr, loan.id, 'all')
                          )}
                          className="w-full sm:w-auto sm:mr-auto px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-bold text-xs shadow-md transition"
                        >
                          سداد كامل القرض وتصفية الدين ✨
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
