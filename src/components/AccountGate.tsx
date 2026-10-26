import { useState, type FormEvent } from 'react';
import { Brand } from './Brand';
import { loginAccount, registerAccount, requestPasswordRecovery, type LocalAccount } from '../storage/authRepository';
import { UserCheck, LogIn, UserPlus, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface AccountGateProps {
  onAuthenticated: (account: LocalAccount) => void;
  onPlayAsGuest: () => void;
  onCancel?: () => void;
}

type AccountMode = 'choice' | 'login' | 'register' | 'forgot';

export function AccountGate({ onAuthenticated, onPlayAsGuest, onCancel }: AccountGateProps) {
  // Default to choice selection screen so player explicitly picks: Login, Register, or Guest
  const [mode, setMode] = useState<AccountMode>('choice');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState('');
  const [noticeTone, setNoticeTone] = useState<'success' | 'error'>('error');
  const [busy, setBusy] = useState(false);

  function switchMode(nextMode: AccountMode) {
    setMode(nextMode);
    setNotice('');
    setPassword('');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice('');
    try {
      if (mode === 'forgot') {
        const result = await requestPasswordRecovery(email);
        setNotice(result.message);
        setNoticeTone(result.ok ? 'success' : 'error');
        return;
      }

      const result = mode === 'login' ? await loginAccount(email, password) : await registerAccount(email, password);
      if (!result.ok) {
        setNotice(result.message);
        setNoticeTone('error');
        return;
      }
      onAuthenticated(result.account);
    } catch {
      setNotice('تعذر الاتصال بخدمة الحساب. يمكنك اللعب كضيف وحفظ تقدمك على هذا الجهاز.');
      setNoticeTone('error');
    } finally {
      setBusy(false);
    }
  }

  const isForgotMode = mode === 'forgot';

  return (
    <main className="account-page" dir="rtl">
      <div className="account-visual">
        <div className="account-visual-shade" />
        <div className="account-visual-copy">
          <span className="eyebrow">إمبراطورية الأعمال · سولي بيزنس</span>
          <h1>عالمك الاقتصادي يبدأ من اختيارك.</h1>
          <p>
            اختر أسلوب الانطلاق: ابدأ اللعب فوراً كضيف محلي، أو سجّل الدخول لاستعادة إمبراطوريتك، أو أنشئ حساباً سحابياً للتنافس الدولي.
          </p>
        </div>
      </div>

      <section className="account-panel">
        <Brand />

        {mode === 'choice' ? (
          <div className="space-y-4 animate-fade-in">
            <div className="account-heading">
              <span className="section-kicker">بوابة انطلاق الإمبراطورية</span>
              <h2>كيف تفضل بدء اللعب اليوم؟</h2>
              <p>اختر إحدى الطرق التالية للبدء، ثم ستنتقل لكتابة اسمك واختيار دولتك التأسيسية:</p>
            </div>

            <div className="space-y-3">
              {/* Option 1: Play as Guest (Instant start) */}
              <button
                type="button"
                onClick={onPlayAsGuest}
                disabled={busy}
                className="w-full text-right p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border-2 border-emerald-500/60 hover:border-emerald-400 hover:bg-slate-900 shadow-xl transition-all group flex items-start gap-3.5 cursor-pointer active:scale-[0.98]"
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-white text-sm sm:text-base font-black flex items-center gap-1.5">
                      <span>الدخول كضيف</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black">
                        بدء فوري ومباشر
                      </span>
                    </strong>
                    <ArrowRight className="w-4 h-4 text-emerald-400 rotate-180 group-hover:-translate-x-1 transition-transform shrink-0" />
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    ابدأ فوراً دون بريد أو كلمة مرور. يُحفظ تقدمك محلياً على هذا الجهاز بدون الحاجة لاتصال دائم.
                  </p>
                </div>
              </button>

              {/* Option 2: Sign In */}
              <button
                type="button"
                onClick={() => switchMode('login')}
                disabled={busy}
                className="w-full text-right p-4 rounded-2xl bg-slate-900/90 border border-amber-500/40 hover:border-amber-400 hover:bg-slate-900 shadow-lg transition-all group flex items-start gap-3.5 cursor-pointer active:scale-[0.98]"
              >
                <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <LogIn className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-white text-sm sm:text-base font-black">
                      تسجيل الدخول
                    </strong>
                    <ArrowRight className="w-4 h-4 text-amber-400 rotate-180 group-hover:-translate-x-1 transition-transform shrink-0" />
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    لديك حساب بالفعل؟ سجّل دخولك لاسترجاع إمبراطوريتك وسجلاتك المالية ومصانعك المحفوظة.
                  </p>
                </div>
              </button>

              {/* Option 3: Create Account */}
              <button
                type="button"
                onClick={() => switchMode('register')}
                disabled={busy}
                className="w-full text-right p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/40 hover:border-cyan-400 hover:bg-slate-900 shadow-lg transition-all group flex items-start gap-3.5 cursor-pointer active:scale-[0.98]"
              >
                <div className="w-11 h-11 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-white text-sm sm:text-base font-black">
                      إنشاء حساب لاعب جديد
                    </strong>
                    <ArrowRight className="w-4 h-4 text-cyan-400 rotate-180 group-hover:-translate-x-1 transition-transform shrink-0" />
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    احفظ تقدمك على السحابة، استعده على أي هاتف آخر، وشارك في الترتيب والمواسم العالمية.
                  </p>
                </div>
              </button>
            </div>

            {onCancel && (
              <button
                className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition cursor-pointer"
                type="button"
                onClick={onCancel}
              >
                إلغاء والعودة
              </button>
            )}

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>بياناتك وحفظك الاقتصادي مشفر وآمن تماماً</span>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="account-heading !mb-0">
                <span className="section-kicker">حساب اللاعب</span>
                <h2 className="!mb-0">
                  {isForgotMode ? 'استعادة كلمة المرور' : mode === 'login' ? 'مرحبًا بعودتك' : 'إنشاء حساب جديد'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => switchMode('choice')}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold px-2.5 py-1 rounded-lg bg-slate-800/80 transition flex items-center gap-1 cursor-pointer"
              >
                <span>خيارات الدخول</span>
                <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              {isForgotMode
                ? 'اكتب بريدك المسجل لإرسال رابط استعادة الحساب.'
                : mode === 'login'
                  ? 'أدخل بياناتك لاستعادة عالمك المحفوظ ومواصلة بناء إمبراطوريتك.'
                  : 'أدخل بريدك وكلمة المرور لتأمين حسابك على السحابة، ثم ستحدد اسمك ودولتك.'}
            </p>

            <form className="account-form" onSubmit={submit}>
              <label>
                البريد الإلكتروني
                <input
                  type="email"
                  dir="ltr"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </label>

              {!isForgotMode && (
                <label>
                  كلمة المرور
                  <input
                    type="password"
                    dir="ltr"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={6}
                    placeholder="6 أحرف على الأقل"
                  />
                </label>
              )}

              {notice && (
                <div className={`account-error account-message--${noticeTone}`} role={noticeTone === 'error' ? 'alert' : 'status'}>
                  {notice}
                </div>
              )}

              <button className="button button-primary button-start" type="submit" disabled={busy}>
                {busy ? 'جارٍ المعالجة...' : isForgotMode ? 'إرسال رابط الاستعادة' : mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب اللاعب والمتابعة'}
              </button>
            </form>

            <div className="flex flex-col gap-2 pt-2 text-xs">
              {isForgotMode ? (
                <button className="account-switch" type="button" onClick={() => switchMode('login')} disabled={busy}>
                  العودة إلى تسجيل الدخول
                </button>
              ) : (
                <>
                  {mode === 'login' && (
                    <button className="account-switch account-recovery-link" type="button" onClick={() => switchMode('forgot')}>
                      نسيت كلمة المرور؟
                    </button>
                  )}
                  <button className="account-switch" type="button" onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}>
                    {mode === 'login' ? 'ليس لديك حساب؟ أنشئ حساباً الآن' : 'لديك حساب بالفعل؟ سجّل الدخول'}
                  </button>
                </>
              )}

              <div className="account-or my-2"><span>أو</span></div>

              <button className="button button-secondary account-guest" type="button" onClick={onPlayAsGuest} disabled={busy}>
                <Zap className="w-4 h-4 text-emerald-400 inline ml-1" />
                {onCancel ? 'العودة إلى عالم الضيف' : 'اللعب كضيف مباشرة دون تسجيل (حفظ على الهاتف)'}
              </button>

              {onCancel && (
                <button className="account-cancel" type="button" onClick={onCancel}>
                  إلغاء ربط الحساب والعودة
                </button>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
