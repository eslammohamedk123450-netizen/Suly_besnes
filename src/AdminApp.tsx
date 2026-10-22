import { useEffect, useState } from 'react';

type Status = { configured: boolean; authenticated: boolean };

export default function AdminApp() {
  const [status, setStatus] = useState<Status | null>(null);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cash, setCash] = useState('');
  const [gold, setGold] = useState('');
  const [expiresAt, setExpiresAt] = useState(() => new Date(Date.now() + 90 * 86_400_000).toISOString().slice(0, 16));
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function refreshStatus() {
    const response = await fetch('/api/admin/status', { credentials: 'include' });
    setStatus(await response.json() as Status);
  }
  useEffect(() => { void refreshStatus(); }, []);

  async function submitAuth() {
    setMessage('');
    if (!identifier.trim() || password.length < 8) { setMessage('اكتب اسم المستخدم وكلمة مرور من 8 أحرف على الأقل.'); return; }
    if (!status?.configured && password !== confirmPassword) { setMessage('كلمتا المرور غير متطابقتين.'); return; }
    const endpoint = status?.configured ? '/api/admin/login' : '/api/admin/setup';
    const response = await fetch(endpoint, { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ identifier: identifier.trim(), password }) });
    const result = await response.json() as { message?: string };
    if (!response.ok) { setMessage(result.message || 'تعذر إكمال العملية.'); return; }
    setPassword(''); setConfirmPassword(''); setMessage(status?.configured ? 'تم الدخول بنجاح.' : 'تم إنشاء حساب الإدارة.');
    await refreshStatus();
  }

  async function issueCode() {
    setBusy(true); setMessage(''); setCopied(false); setCode('');
    try {
      const response = await fetch('/api/admin/issue-code', { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ cash: cash || 0, gold: gold || 0, expiresAt: new Date(expiresAt).toISOString() }) });
      const result = await response.json() as { code?: string; message?: string };
      if (!response.ok || !result.code) throw new Error(result.message || 'تعذر إنشاء الكود.');
      setCode(result.code); setMessage('تم إنشاء الكود. انسخه وأرسله للمستخدم بعد تأكيد الدفع.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'تعذر إنشاء الكود.'); }
    finally { setBusy(false); }
  }

  async function logout() { await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' }); setStatus({ configured: true, authenticated: false }); setCode(''); }
  async function copyCode() { if (code) { await navigator.clipboard.writeText(code); setCopied(true); } }

  if (!status) return <main className="admin-shell" dir="rtl"><section className="admin-card"><h1>جارٍ فتح لوحة الإدارة...</h1></section></main>;
  if (!status.authenticated) return <main className="admin-shell" dir="rtl"><section className="admin-card"><span className="admin-kicker">Business Empire</span><h1>{status.configured ? 'دخول لوحة الأكواد' : 'إعداد لوحة الأكواد لأول مرة'}</h1><p>{status.configured ? 'استخدم بيانات الإدارة التي أنشأتها.' : 'أنشئ اسم مستخدم وكلمة مرور خاصة بك. هذه البيانات تخص لوحة الأكواد فقط ولا تحتاج إلى Supabase.'}</p><div className="admin-form"><label>اسم المستخدم<input type="text" value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="مثال: admin" autoComplete="username" /></label><label>كلمة المرور<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={status.configured ? 'current-password' : 'new-password'} /></label>{!status.configured && <label>تأكيد كلمة المرور<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" /></label>}<button className="button button-primary" type="button" onClick={() => void submitAuth()}>{status.configured ? 'دخول لوحة الإدارة' : 'إنشاء حساب الإدارة'}</button></div>{message && <div className="admin-message admin-message--error">{message}</div>}</section></main>;

  return <main className="admin-shell" dir="rtl"><section className="admin-card admin-card--wide"><div className="admin-topbar"><div><span className="admin-kicker">Business Empire · Admin</span><h1>إصدار كود مكافأة</h1></div><button className="button button-secondary" type="button" onClick={() => void logout()}>خروج</button></div><p>أدخل المال أو الذهب أو الاثنين معًا. الدفع يتم خارجيًا عبر Vodafone Cash، ثم أرسل الكود عبر WhatsApp.</p><div className="admin-form admin-form--grid"><label>المال داخل اللعبة بالجنيه<input type="number" min="0" max="1000000" step="1000" value={cash} onChange={(event) => setCash(event.target.value)} placeholder="مثال: 100000" /></label><label>الذهب بالجرام<input type="number" min="0" max="100" step="0.1" value={gold} onChange={(event) => setGold(event.target.value)} placeholder="مثال: 0.5" /></label><label>تاريخ انتهاء الكود<input type="datetime-local" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} /></label></div><button className="button button-primary admin-generate" type="button" disabled={busy || (!Number(cash) && !Number(gold))} onClick={() => void issueCode()}>{busy ? 'جارٍ إنشاء الكود...' : 'توليد الكود'}</button>{message && <div className="admin-message">{message}</div>}{code && <div className="admin-result"><label>الكود الناتج</label><textarea readOnly value={code} /><button className="button button-primary" type="button" onClick={() => void copyCode()}>{copied ? 'تم النسخ' : 'نسخ الكود'}</button></div>}<div className="admin-note">هذه لوحة مستقلة عن تسجيل مستخدمي اللعبة. المفتاح الخاص لا يغادر الخادم ولا يظهر في المتصفح.</div></section></main>;
}
