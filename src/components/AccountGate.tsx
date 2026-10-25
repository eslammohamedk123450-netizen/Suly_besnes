import { useState, type FormEvent } from 'react';
import { Brand } from './Brand';
import { loginAccount, registerAccount, requestPasswordRecovery, type LocalAccount } from '../storage/authRepository';

interface AccountGateProps {
  onAuthenticated: (account: LocalAccount) => void;
  onPlayAsGuest: () => void;
  onCancel?: () => void;
}

type AccountMode = 'login' | 'register' | 'forgot';

export function AccountGate({ onAuthenticated, onPlayAsGuest, onCancel }: AccountGateProps) {
  const [mode, setMode] = useState<AccountMode>('register');
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
    <main className="account-page">
      <div className="account-visual">
        <div className="account-visual-shade" />
        <div className="account-visual-copy">
          <span className="eyebrow">ابدأ الآن، واحفظ بالطريقة التي تناسبك</span>
          <h1>إمبراطوريتك تبدأ من قرار.</h1>
          <p>العب كضيف على هذا الجهاز، أو أنشئ حسابًا لاستعادة عالمك على أجهزتك الأخرى.</p>
        </div>
      </div>
      <section className="account-panel">
        <Brand />
        <div className="account-heading">
          <span className="section-kicker">حساب اللاعب</span>
          <h2>{isForgotMode ? 'استعادة الحساب' : mode === 'login' ? 'مرحبًا بعودتك' : 'أنشئ حسابك'}</h2>
          <p>
            {isForgotMode
              ? 'اكتب البريد الذي استخدمته في الحساب. سنعرض رسالة موحدة حفاظًا على خصوصية الحساب.'
              : mode === 'login'
                ? 'سجّل الدخول لاستعادة عالمك المحفوظ.'
                : 'الحساب اختياري؛ يمكنك بدء اللعب محليًا دون تسجيل.'}
          </p>
        </div>
        <form className="account-form" onSubmit={submit}>
          <label>البريد الإلكتروني<input type="email" dir="ltr" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@example.com" /></label>
          {!isForgotMode && (
            <label>
              كلمة المرور
              <input type="password" dir="ltr" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} placeholder="6 أحرف على الأقل" />
            </label>
          )}
          {notice && <div className={`account-error account-message--${noticeTone}`} role={noticeTone === 'error' ? 'alert' : 'status'}>{notice}</div>}
          <button className="button button-primary button-start" type="submit" disabled={busy}>
            {busy ? 'جارٍ المعالجة...' : isForgotMode ? 'إرسال رابط الاستعادة' : mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب اللاعب'}
          </button>
        </form>
        {isForgotMode ? (
          <button className="account-switch" type="button" onClick={() => switchMode('login')} disabled={busy}>العودة إلى تسجيل الدخول</button>
        ) : (
          <>
            {mode === 'login' && <button className="account-switch account-recovery-link" type="button" onClick={() => switchMode('forgot')}>نسيت كلمة المرور؟</button>}
            <button className="account-switch" type="button" onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}>
              {mode === 'login' ? 'ليس لديك حساب؟ أنشئ حسابًا' : 'لديك حساب بالفعل؟ سجّل الدخول'}
            </button>
          </>
        )}
        <div className="account-or"><span>أو</span></div>
        <button className="button button-secondary account-guest" type="button" onClick={onPlayAsGuest} disabled={busy}>
          {onCancel ? 'العودة إلى عالم الضيف' : 'اللعب كضيف · حفظ على هذا الجهاز'}
        </button>
        {onCancel && <button className="account-cancel" type="button" onClick={onCancel}>إلغاء ربط الحساب والعودة</button>}
        <p className="privacy-note">حفظ الضيف على هذا الجهاز. يتيح الحساب استعادة العالم على أجهزتك الأخرى.</p>
      </section>
    </main>
  );
}
