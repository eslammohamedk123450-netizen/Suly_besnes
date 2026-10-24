import { useEffect, useState } from 'react';

type Status = { configured: boolean; authenticated: boolean };
type AccountSummary = { accountCode: string; playerName: string; gameDay: number; updatedAt: string; bankBalance: number; goldGrams: number; diamonds: number; badges: string[]; speedCards: Array<{ kind: string; quantity: number }> };

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
  const [accountCode, setAccountCode] = useState('');
  const [account, setAccount] = useState<AccountSummary | null>(null);
  const [grantCash, setGrantCash] = useState('');
  const [grantGold, setGrantGold] = useState('');
  const [grantDiamonds, setGrantDiamonds] = useState('');
  const [grantBadge, setGrantBadge] = useState('');
  const [speedCardKind, setSpeedCardKind] = useState('');
  const [speedCardQuantity, setSpeedCardQuantity] = useState('');

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

  async function lookupAccount() {
    setMessage(''); setAccount(null);
    const response = await fetch('/api/admin/account-lookup', { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ accountCode }) });
    const result = await response.json() as AccountSummary & { message?: string };
    if (!response.ok) { setMessage(result.message || 'تعذر البحث عن الحساب.'); return; }
    setAccount(result);
  }

  async function grantAccount() {
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/admin/account-grant', { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ accountCode, cash: grantCash || 0, gold: grantGold || 0, diamonds: grantDiamonds || 0, badge: grantBadge, speedCardKind, speedCardQuantity: speedCardQuantity || 0 }) });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message || 'تعذر تسجيل المنحة.');
      setMessage('تمت إضافة المنحة إلى الحساب مع تسجيلها في سجل التدقيق.');
      setGrantCash(''); setGrantGold(''); setGrantDiamonds(''); setGrantBadge(''); setSpeedCardQuantity('');
      await lookupAccount();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'تعذر تسجيل المنحة.'); }
    finally { setBusy(false); }
  }

  if (!status) return <main className="admin-shell" dir="rtl"><section className="admin-card"><h1>جارٍ فتح لوحة الإدارة...</h1></section></main>;
  if (!status.authenticated) return <main className="admin-shell" dir="rtl"><section className="admin-card"><span className="admin-kicker">Business Empire</span><h1>{status.configured ? 'دخول لوحة الأكواد' : 'إعداد لوحة الأكواد لأول مرة'}</h1><p>{status.configured ? 'استخدم بيانات الإدارة التي أنشأتها.' : 'أنشئ اسم مستخدم وكلمة مرور خاصة بك. هذه البيانات تخص لوحة الأكواد فقط ولا تحتاج إلى Supabase.'}</p><div className="admin-form"><label>اسم المستخدم<input type="text" value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="مثال: admin" autoComplete="username" /></label><label>كلمة المرور<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={status.configured ? 'current-password' : 'new-password'} /></label>{!status.configured && <label>تأكيد كلمة المرور<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" /></label>}<button className="button button-primary" type="button" onClick={() => void submitAuth()}>{status.configured ? 'دخول لوحة الإدارة' : 'إنشاء حساب الإدارة'}</button></div>{message && <div className="admin-message admin-message--error">{message}</div>}</section></main>;

  return <main className="admin-shell" dir="rtl"><section className="admin-card admin-card--wide"><div className="admin-topbar"><div><span className="admin-kicker">Business Empire · Admin</span><h1>إدارة الحسابات والمكافآت</h1></div><button className="button button-secondary" type="button" onClick={() => void logout()}>خروج</button></div><p>ابحث بمعرّف الحساب الظاهر للاعب في الإعدادات، ثم امنحه موارد أو شارة بعد استكمال التحويل والتواصل عبر واتساب.</p><div className="admin-form"><label>معرّف الحساب<input value={accountCode} onChange={(event) => setAccountCode(event.target.value.toUpperCase())} placeholder="BE-XXXXXXX-XXXXX" /></label><button className="button button-secondary" type="button" disabled={!accountCode.trim()} onClick={() => void lookupAccount()}>بحث عن الحساب</button></div>{account && <div className="admin-result"><strong>{account.playerName}</strong><span>اليوم {account.gameDay} · آخر مزامنة {new Date(account.updatedAt).toLocaleString('ar-EG')}</span><span>الرصيد: {account.bankBalance.toLocaleString('ar-EG')} · الذهب: {account.goldGrams} غ · الماس: {account.diamonds}</span><span>الشارات: {account.badges.length} · بطاقات التسريع: {account.speedCards.reduce((sum, card) => sum + card.quantity, 0)}</span></div>}<div className="admin-form admin-form--grid"><label>منح مال<input type="number" min="0" step="1000" value={grantCash} onChange={(event) => setGrantCash(event.target.value)} /></label><label>منح ذهب بالجرام<input type="number" min="0" step="0.1" value={grantGold} onChange={(event) => setGrantGold(event.target.value)} /></label><label>منح ماس<input type="number" min="0" step="1" value={grantDiamonds} onChange={(event) => setGrantDiamonds(event.target.value)} /></label><label>منح شارة<input value={grantBadge} onChange={(event) => setGrantBadge(event.target.value)} placeholder="مثال: داعم الإمبراطورية" /></label><label>نوع بطاقة التسريع<select value={speedCardKind} onChange={(event) => setSpeedCardKind(event.target.value)}><option value="">بدون بطاقة</option><option value="production-25">تسريع الإنتاج 25%</option><option value="production-50">تسريع الإنتاج 50%</option><option value="production-instant">إكمال الإنتاج فورًا</option><option value="capacity-boost">زيادة السعة المؤقتة</option></select></label><label>عدد البطاقات<input type="number" min="0" step="1" value={speedCardQuantity} onChange={(event) => setSpeedCardQuantity(event.target.value)} /></label></div><button className="button button-primary admin-generate" type="button" disabled={busy || !account || (!Number(grantCash) && !Number(grantGold) && !Number(grantDiamonds) && !grantBadge.trim() && !Number(speedCardQuantity))} onClick={() => void grantAccount()}>{busy ? 'جارٍ تسجيل المنحة...' : 'منح الموارد للحساب'}</button>{message && <div className="admin-message">{message}</div>}<hr /><h2>إصدار كود بديل</h2><p>يُستخدم فقط عند الحاجة لإرسال مكافأة يدوية عبر واتساب بدل تعديل الحساب مباشرة.</p><div className="admin-form admin-form--grid"><label>المال داخل اللعبة بالجنيه<input type="number" min="0" max="1000000" step="1000" value={cash} onChange={(event) => setCash(event.target.value)} placeholder="مثال: 100000" /></label><label>الذهب بالجرام<input type="number" min="0" max="100" step="0.1" value={gold} onChange={(event) => setGold(event.target.value)} placeholder="مثال: 0.5" /></label><label>تاريخ انتهاء الكود<input type="datetime-local" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} /></label></div><button className="button button-secondary admin-generate" type="button" disabled={busy || (!Number(cash) && !Number(gold))} onClick={() => void issueCode()}>{busy ? 'جارٍ إنشاء الكود...' : 'توليد كود واتساب'}</button>{code && <div className="admin-result"><label>الكود الناتج</label><textarea readOnly value={code} /><button className="button button-primary" type="button" onClick={() => void copyCode()}>{copied ? 'تم النسخ' : 'نسخ الكود'}</button></div>}<div className="admin-note">مفتاح الخادم لا يظهر في المتصفح. يجب تطبيق مخطط Supabase وضبط SUPABASE_SERVICE_ROLE_KEY على الخادم قبل استخدام البحث والمنح.</div></section></main>;
}
