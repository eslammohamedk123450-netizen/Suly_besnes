import { useState } from "react";
import { AlertTriangle, Clipboard, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import { issueRewardCode } from "@/lib/adminApi";

function defaultExpiry(): string {
  const date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

export default function RewardCodePanel() {
  const [cash, setCash] = useState("");
  const [gold, setGold] = useState("");
  const [expiresAt, setExpiresAt] = useState(defaultExpiry);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generateCode() {
    setBusy(true);
    setMessage("");
    setCode("");
    setCopied(false);
    try {
      const result = await issueRewardCode({
        cash: Number(cash || 0),
        gold: Number(gold || 0),
        expiresAt: new Date(expiresAt).toISOString(),
        requestId: crypto.randomUUID(),
      });
      setCode(result.code);
      setMessage(result.reused ? "تمت استعادة كود الطلب السابق بأمان." : "تم إنشاء الكود وتسجيله في سجل التدقيق.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر إنشاء الكود.");
    } finally {
      setBusy(false);
    }
  }

  async function copyCode() {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
  }

  const canGenerate = (Number(cash) > 0 || Number(gold) > 0) && !busy;

  return (
    <section className="codes-page" dir="rtl">
      <div className="codes-hero">
        <div className="codes-hero-icon"><KeyRound size={22} /></div>
        <div><span className="eyebrow">توقيع SULY1 · Ed25519</span><h2>مولّد أكواد المكافآت</h2><p>أنشئ كودًا صالحًا للتطبيق من الخادم فقط؛ المفتاح الخاص لا يصل إلى المتصفح.</p></div>
      </div>

      <div className="signing-key-warning is-ready"><span className="warning-symbol"><ShieldCheck size={18} /></span><div><strong>الإصدار الخادمي مفعّل</strong><p>يتم توقيع الكود بالمفتاح المحمي في Supabase، ويُحفظ الطلب مع منع التكرار وسجل تدقيق إداري.</p></div></div>

      <div className="code-compat-grid">
        <article className="code-compat-card"><span className="compat-number">01</span><div><strong>صيغة اللعبة</strong><p><code>SULY1.payload.signature</code></p><small>متوافقة مع المفتاحين الحالي والدوّار.</small></div></article>
        <article className="code-compat-card"><span className="compat-number">02</span><div><strong>منع التكرار</strong><p>Request ID</p><small>إعادة الإرسال لا تُنشئ كودًا ثانيًا لنفس الطلب.</small></div></article>
        <article className="code-compat-card"><span className="compat-number">03</span><div><strong>مفتاح التوقيع</strong><p><LockKeyhole size={15} /> خادمي فقط</p><small>لا يُحفظ في APK أو واجهة اللوحة.</small></div></article>
      </div>

      <div className="code-issuer-card">
        <div className="code-issuer-heading"><div><strong>إصدار كود جديد</strong><span>حدد المكافأة وموعد الانتهاء ثم أنشئ الكود.</span></div><AlertTriangle size={18} /></div>
        <div className="code-issuer-grid">
          <label>المال بالجنيه<input type="number" min="0" max="1000000" step="1000" value={cash} onChange={(event) => setCash(event.target.value)} placeholder="مثال: 100000" /></label>
          <label>الذهب بالجرام<input type="number" min="0" max="1000000" step="0.1" value={gold} onChange={(event) => setGold(event.target.value)} placeholder="مثال: 0.5" /></label>
          <label>تاريخ الانتهاء<input type="datetime-local" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} /></label>
        </div>
        <button className="admin-code-issue-button" type="button" disabled={!canGenerate} onClick={() => void generateCode()}>{busy ? "جارٍ التوقيع الخادمي..." : "إنشاء كود المكافأة"}</button>
        {message && <div className="admin-message">{message}</div>}
        {code && <div className="issued-code-box"><label>الكود الناتج</label><textarea readOnly value={code} /><button className="admin-code-copy" type="button" onClick={() => void copyCode()}><Clipboard size={15} />{copied ? "تم النسخ" : "نسخ الكود"}</button></div>}
      </div>

      <div className="codes-footer-note"><ShieldCheck size={17} /><span>لا تستخدم الكود إلا بعد مراجعة قيمة المكافأة وموعد الانتهاء. عملية الاسترداد تتطلب حساب لاعب واتصالًا بالخادم وتُسجل مرة واحدة عالميًا.</span></div>
    </section>
  );
}
