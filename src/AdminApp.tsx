import { useEffect, useMemo, useState } from 'react';
import { supabase } from './storage/supabaseClient';

const ADMIN_EMAIL = 'eslammohamedk123450@gmail.com';

function defaultExpiry() { return new Date(Date.now() + 90 * 86_400_000).toISOString().slice(0, 16); }

export default function AdminApp() {
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [session, setSession] = useState<{ access_token: string; user: { email?: string } } | null>(null);
  const [cash, setCash] = useState('');
  const [gold, setGold] = useState('');
  const [expiresAt, setExpiresAt] = useState(defaultExpiry);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => { supabase.auth.getSession().then(({ data }) => { if (data.session) setSession(data.session as typeof session); }); }, []);
  const isAdmin = useMemo(() => session?.user.email?.toLowerCase() === ADMIN_EMAIL, [session]);

  async function login() {
    setMessage('');
    const result = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (result.error || !result.data.session) { setMessage('تعذر تسجيل الدخول. تحقق من البريد وكلمة المرور.'); return; }
    if (result.data.user?.email?.toLowerCase() !== ADMIN_EMAIL) { await supabase.auth.signOut(); setMessage('هذا الحساب ليس حساب الإدارة المصرح له.'); return; }
    setSession(result.data.session as typeof session); setPassword('');
  }

  async function issueCode() {
    if (!session || !isAdmin) return;
    setBusy(true); setMessage(''); setCopied(false); setCode('');
    try {
      const response = await fetch('/api/admin/issue-code', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ cash: cash || 0, gold: gold || 0, expiresAt: new Date(expiresAt).toISOString() }) });
      const result = await response.json() as { code?: string; message?: string };
      if (!response.ok || !result.code) throw new Error(result.message || 'تعذر إنشاء الكود.');
      setCode(result.code); setMessage('تم إنشاء الكود. انسخه وأرسله للمستخدم بعد تأكيد الدفع.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'تعذر إنشاء الكود.'); }
    finally { setBusy(false); }
  }

  async function copyCode() { if (code) { await navigator.clipboard.writeText(code); setCopied(true); } }
  async function logout() { await supabase.auth.signOut(); setSession(null); setCode(''); }

  if (!session) return <main className="admin-shell" dir="rtl"><section className="admin-card"><span className="admin-kicker">Business Empire</span><h1>لوحة إصدار الأكواد</h1><p>سجّل الدخول بحساب الإدارة الخاص بك لإصدار أكواد المال والذهب.</p><div className="admin-form"><label>البريد الإلكتروني<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>كلمة المرور<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void login(); }} /></label><button className="button button-primary" type="button" onClick={() => void login()}>دخول لوحة الإدارة</button></div>{message && <div className="admin-message admin-message--error">{message}</div>}</section></main>;
  if (!isAdmin) return <main className="admin-shell" dir="rtl"><section className="admin-card"><h1>غير مصرح</h1><p>هذا الحساب لا يملك صلاحية إصدار الأكواد.</p><button className="button button-secondary" type="button" onClick={() => void logout()}>تسجيل الخروج</button></section></main>;

  return <main className="admin-shell" dir="rtl"><section className="admin-card admin-card--wide"><div className="admin-topbar"><div><span className="admin-kicker">Business Empire · Admin</span><h1>إصدار كود مكافأة</h1></div><button className="button button-secondary" type="button" onClick={() => void logout()}>خروج</button></div><p>أدخل المال أو الذهب أو الاثنين معًا. الدفع يتم خارجيًا عبر Vodafone Cash، ثم أرسل الكود عبر WhatsApp.</p><div className="admin-form admin-form--grid"><label>المال داخل اللعبة بالجنيه<input type="number" min="0" max="1000000" step="1000" value={cash} onChange={(event) => setCash(event.target.value)} placeholder="مثال: 100000" /></label><label>الذهب بالجرام<input type="number" min="0" max="100" step="0.1" value={gold} onChange={(event) => setGold(event.target.value)} placeholder="مثال: 0.5" /></label><label>تاريخ انتهاء الكود<input type="datetime-local" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} /></label></div><button className="button button-primary admin-generate" type="button" disabled={busy || (!Number(cash) && !Number(gold))} onClick={() => void issueCode()}>{busy ? 'جارٍ إنشاء الكود...' : 'توليد الكود'}</button>{message && <div className="admin-message">{message}</div>}{code && <div className="admin-result"><label>الكود الناتج</label><textarea readOnly value={code} /><button className="button button-primary" type="button" onClick={() => void copyCode()}>{copied ? 'تم النسخ' : 'نسخ الكود'}</button></div>}<div className="admin-note">الحساب الإداري: <strong>{ADMIN_EMAIL}</strong><br />المفتاح الخاص لا يغادر الخادم ولا يظهر في المتصفح.</div></section></main>;
}
