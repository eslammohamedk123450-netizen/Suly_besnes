import { useState, type FormEvent } from 'react';
import { Brand } from './Brand';
import { loginAccount, registerAccount, type LocalAccount } from '../storage/authRepository';

interface AccountGateProps {
  onAuthenticated: (account: LocalAccount) => void;
  onPlayAsGuest: () => void;
  onCancel?: () => void;
}

export function AccountGate({ onAuthenticated, onPlayAsGuest, onCancel }: AccountGateProps) {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice('');
    try {
      const result = mode === 'login' ? await loginAccount(email, password) : await registerAccount(email, password);
      if (!result.ok) {
        setNotice(result.message);
        return;
      }
      onAuthenticated(result.account);
    } catch {
      setNotice('تعذر الاتصال بخدمة الحساب. يمكنك اللعب كضيف وحفظ تقدمك على هذا الجهاز.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="account-page">
      <div className="account-visual">
        <div className="account-visual-shade" />
        <div className="account-visual-copy">
          <span className="eyebrow">ابدأ الآن، واحفظ بالطريقة التي تناسبك</span>
          <h1>إمبراطوريتك تبدأ من قرار.</h1>
          <p>العب كضيف على هذا الجهاز، أو أنشئ حسابًا لمزامنة عالمك سحابيًا.</p>
        </div>
      </div>
      <section className="account-panel">
        <Brand />
        <div className="account-heading">
          <span className="section-kicker">حساب اللاعب</span>
          <h2>{mode === 'login' ? 'مرحبًا بعودتك' : 'أنشئ حسابك'}</h2>
          <p>{mode === 'login' ? 'سجّل الدخول لاستعادة عالمك المحفوظ.' : 'الحساب اختياري؛ يمكنك بدء اللعب محليًا دون تسجيل.'}</p>
        </div>
        <form className="account-form" onSubmit={submit}>
          <label>البريد الإلكتروني<input type="email" dir="ltr" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@example.com" /></label>
          <label>كلمة المرور<input type="password" dir="ltr" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} placeholder="6 أحرف على الأقل" /></label>
          {notice && <div className="account-error" role="alert">{notice}</div>}
          <button className="button button-primary button-start" type="submit" disabled={busy}>{busy ? 'جارٍ المعالجة...' : mode === 'login' ? 'تسجيل الدخول' : 'إنشاء الحساب السحابي'}</button>
        </form>
        <button className="account-switch" type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setNotice(''); }}>
          {mode === 'login' ? 'ليس لديك حساب؟ أنشئ حسابًا' : 'لديك حساب بالفعل؟ سجّل الدخول'}
        </button>
        <div className="account-or"><span>أو</span></div>
        <button className="button button-secondary account-guest" type="button" onClick={onPlayAsGuest} disabled={busy}>
          {onCancel ? 'العودة إلى عالم الضيف' : 'اللعب كضيف · حفظ على هذا الجهاز'}
        </button>
        {onCancel && <button className="account-cancel" type="button" onClick={onCancel}>إلغاء ربط الحساب والعودة</button>}
        <p className="privacy-note">حفظ الضيف محلي على هذا الجهاز. الحساب السحابي يتيح استعادة العالم على أجهزة أخرى.</p>
      </section>
    </main>
  );
}
