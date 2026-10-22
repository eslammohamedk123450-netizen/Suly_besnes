import { FormEvent, useState } from 'react';
import { Brand } from './Brand';
import { loginAccount, registerAccount, type LocalAccount } from '../storage/authRepository';

interface AccountGateProps {
  onAuthenticated: (account: LocalAccount) => void;
}

export function AccountGate({ onAuthenticated }: AccountGateProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice('');
    const result = mode === 'login' ? await loginAccount(email, password) : await registerAccount(email, password);
    setBusy(false);
    if (!result.ok) {
      setNotice(result.message);
      return;
    }
    onAuthenticated(result.account);
  }

  return <main className="account-page"><div className="account-visual"><div className="account-visual-shade" /><div className="account-visual-copy"><span className="eyebrow">دخول آمن إلى عالمك</span><h1>إمبراطوريتك تبدأ من قرار.</h1><p>سجّل حسابك، ثم تابع تقدمك ومحفظتك وقراراتك من نفس الجهاز.</p></div></div><section className="account-panel"><Brand /><div className="account-heading"><span className="section-kicker">حساب اللاعب</span><h2>{mode === 'login' ? 'مرحبًا بعودتك' : 'أنشئ حسابك'}</h2><p>{mode === 'login' ? 'اكتب بياناتك للدخول مباشرة بدون أكواد تحقق.' : 'سيُحفظ الحساب محليًا على هذا الجهاز ويعمل دون إنترنت.'}</p></div><form className="account-form" onSubmit={submit}><label>البريد الإلكتروني<input type="email" dir="ltr" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@example.com" /></label><label>كلمة المرور<input type="password" dir="ltr" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} placeholder="6 أحرف على الأقل" /></label>{notice && <div className="account-error" role="alert">{notice}</div>}<button className="button button-primary button-start" type="submit" disabled={busy}>{busy ? 'جارٍ المعالجة...' : mode === 'login' ? 'دخول مباشر' : 'إنشاء الحساب والدخول'}</button></form><button className="account-switch" type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setNotice(''); }}>{mode === 'login' ? 'ليس لديك حساب؟ أنشئ حسابًا' : 'لديك حساب بالفعل؟ سجّل الدخول'}</button><p className="privacy-note">لا توجد رسائل تحقق أو أكواد دخول. الحساب محلي على هذا الجهاز.</p></section></main>;
}
