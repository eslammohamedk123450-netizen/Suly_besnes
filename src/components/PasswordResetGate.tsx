import { useState, type FormEvent } from 'react';
import { Brand } from './Brand';
import { updatePasswordFromRecovery, type LocalAccount } from '../storage/authRepository';

interface PasswordResetGateProps {
  onComplete: (account: LocalAccount) => void;
  onBack: () => void;
  errorMessage?: string;
}

export function PasswordResetGate({ onComplete, onBack, errorMessage }: PasswordResetGateProps) {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [updatedAccount, setUpdatedAccount] = useState<LocalAccount | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice('');
    if (password !== confirmation) {
      setNotice('كلمتا المرور غير متطابقتين. راجعهما ثم أعد المحاولة.');
      return;
    }
    if (password.length < 8) {
      setNotice('اختر كلمة مرور من 8 أحرف على الأقل.');
      return;
    }

    setBusy(true);
    try {
      const result = await updatePasswordFromRecovery(password);
      if (!result.ok) {
        setNotice(result.message);
        return;
      }
      setUpdatedAccount(result.account);
      setPassword('');
      setConfirmation('');
    } catch {
      setNotice('تعذر تحديث كلمة المرور الآن. تحقق من اتصالك وحاول مرة أخرى.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="account-page account-page--recovery">
      <div className="account-visual">
        <div className="account-visual-shade" />
        <div className="account-visual-copy">
          <span className="eyebrow">استعد طريقك إلى إمبراطوريتك</span>
          <h1>حسابك يعود إليك.</h1>
          <p>اختر كلمة مرور جديدة، ثم أكمل من عالمك المحفوظ.</p>
        </div>
      </div>
      <section className="account-panel">
        <Brand />
        <div className="account-heading">
          <span className="section-kicker">استعادة الحساب</span>
          <h2>{updatedAccount ? 'تم تحديث كلمة المرور' : 'أنشئ كلمة مرور جديدة'}</h2>
          <p>{updatedAccount ? 'أصبحت كلمة المرور الجديدة جاهزة. سنعيد فتح حسابك وعالمك المحفوظ.' : 'استخدم 8 أحرف على الأقل، وأعد كتابتها للتأكد.'}</p>
        </div>

        {errorMessage ? (
          <>
            <div className="account-error" role="alert">{errorMessage}</div>
            <button className="button button-primary button-start" type="button" onClick={onBack}>العودة إلى اللعبة وطلب رابط جديد</button>
          </>
        ) : updatedAccount ? (
          <>
            <div className="account-message account-message--success" role="status">تم حفظ كلمة المرور الجديدة لحسابك.</div>
            <button className="button button-primary button-start" type="button" onClick={() => onComplete(updatedAccount)}>متابعة إلى عالمي</button>
          </>
        ) : (
          <form className="account-form" onSubmit={submit}>
            <label>
              كلمة المرور الجديدة
              <input type="password" dir="ltr" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} placeholder="8 أحرف على الأقل" />
            </label>
            <label>
              تأكيد كلمة المرور
              <input type="password" dir="ltr" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required minLength={8} placeholder="أعد كتابة كلمة المرور" />
            </label>
            {notice && <div className="account-error" role="alert">{notice}</div>}
            <button className="button button-primary button-start" type="submit" disabled={busy}>{busy ? 'جارٍ حفظ كلمة المرور...' : 'حفظ كلمة المرور الجديدة'}</button>
            <button className="account-switch" type="button" onClick={onBack} disabled={busy}>إلغاء والعودة إلى اللعبة</button>
          </form>
        )}
        <p className="privacy-note">لا نعرض كلمة المرور ولا نرسلها بالبريد؛ يتم تحديثها مباشرة في خدمة الحساب الآمنة.</p>
      </section>
    </main>
  );
}
