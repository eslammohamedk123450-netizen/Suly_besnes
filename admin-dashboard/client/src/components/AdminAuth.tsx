import { useState, type FormEvent } from "react";
import { ArrowLeft, Eye, EyeOff, KeyRound, LoaderCircle, ShieldCheck } from "lucide-react";
import { createFirstAdmin, login } from "@/lib/adminApi";

type Props = {
  setupRequired: boolean;
  onAuthenticated: (email: string) => void;
};

export default function AdminAuth({ setupRequired, onAuthenticated }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [setupCode, setSetupCode] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (setupRequired && password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين.");
      return;
    }
    if (setupRequired && password.length < 16) {
      setError("اختر كلمة مرور قوية لا تقل عن 16 حرفًا.");
      return;
    }
    if (setupRequired && !/^[0-9A-F]{32}$/.test(setupCode.trim().toUpperCase())) {
      setError("أدخل رمز الإعداد المكون من 32 خانة كما وصلك.");
      return;
    }

    setLoading(true);
    try {
      const result = setupRequired
        ? await createFirstAdmin(email.trim(), password, setupCode.trim().toUpperCase())
        : await login(email.trim(), password);
      onAuthenticated(result.email);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "تعذر تسجيل الدخول.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-screen" dir="rtl">
      <div className="auth-layout">
        <section className="auth-brand" aria-label="إمبراطورية الأعمال">
          <div className="auth-brand-top">
            <img src="/business-empire-logo.svg" alt="" className="auth-logo" />
            <div>
              <span className="eyebrow">BUSINESS EMPIRE</span>
              <h1>إمبراطورية<br />الأعمال</h1>
            </div>
          </div>
          <div className="brand-divider" />
          <p className="auth-brand-copy">إدارة دقيقة لموارد اللعبة وشاراتها، مع أثر واضح لكل إجراء.</p>
          <div className="auth-security-note">
            <ShieldCheck size={18} />
            <span>لوحة خاصة — الدخول بالبريد وكلمة المرور فقط</span>
          </div>
          <div className="auth-brand-orbit auth-orbit-one" />
          <div className="auth-brand-orbit auth-orbit-two" />
          <div className="auth-brand-footer">
            <span>إدارة مسؤولة</span><span className="brand-footer-dot" /><span>سجل قابل للمراجعة</span>
          </div>
        </section>

        <section className="auth-card-wrap">
          <div className="auth-card">
            <div className="auth-card-icon"><KeyRound size={20} /></div>
            <div className="auth-card-heading">
              <span className="eyebrow">{setupRequired ? "إعداد آمن لمرة واحدة" : "دخول المشرف"}</span>
              <h2>{setupRequired ? "إنشاء حساب الإدارة" : "مرحبًا بعودتك"}</h2>
              <p>{setupRequired
                ? "أنشئ بيانات المشرف الأول. بعد إتمام هذه الخطوة سيتوقف التسجيل نهائيًا."
                : "أدخل البريد الإلكتروني وكلمة المرور للمتابعة إلى لوحة الإدارة."}</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="field-label" htmlFor="admin-email">البريد الإلكتروني</label>
              <input
                id="admin-email"
                className="text-input"
                type="email"
                autoComplete="username"
                inputMode="email"
                maxLength={254}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                required
              />

              {setupRequired && <>
                <label className="field-label" htmlFor="admin-setup-code">رمز التفعيل لمرة واحدة</label>
                <input
                  id="admin-setup-code"
                  className="text-input"
                  type="text"
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  maxLength={32}
                  value={setupCode}
                  onChange={(event) => setSetupCode(event.target.value.toUpperCase())}
                  placeholder="32 خانة"
                  required
                />
              </>}

              <label className="field-label" htmlFor="admin-password">كلمة المرور</label>
              <div className="password-field">
                <input
                  id="admin-password"
                  className="text-input"
                  type={visible ? "text" : "password"}
                  autoComplete={setupRequired ? "new-password" : "current-password"}
                  minLength={setupRequired ? 16 : 1}
                  maxLength={256}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={setupRequired ? "16 حرفًا على الأقل" : "••••••••••••"}
                  required
                />
                <button className="password-toggle" type="button" onClick={() => setVisible((value) => !value)} aria-label={visible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}>
                  {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {setupRequired && <>
                <label className="field-label" htmlFor="admin-confirm-password">تأكيد كلمة المرور</label>
                <input
                  id="admin-confirm-password"
                  className="text-input"
                  type={visible ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={16}
                  maxLength={256}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="أعد كتابة كلمة المرور"
                  required
                />
                <div className="password-hint">استخدم عبارة طويلة وفريدة. لن تُعرض كلمة المرور أو تُرسل إلى أي خدمة تسجيل خارجية.</div>
              </>}

              {error && <div className="form-error" role="alert">{error}</div>}
              <button className="primary-button auth-submit" type="submit" disabled={loading}>
                {loading ? <LoaderCircle size={18} className="spin" /> : <ArrowLeft size={18} />}
                <span>{loading ? "جارٍ التحقق…" : setupRequired ? "إنشاء الحساب والدخول" : "تسجيل الدخول"}</span>
              </button>
            </form>

            <div className="auth-card-foot">
              <ShieldCheck size={15} />
              <span>الجلسة محمية، وتُغلق تلقائيًا بعد 12 ساعة.</span>
            </div>
          </div>
          <p className="auth-copyright">إمبراطورية الأعمال <span>·</span> لوحة إدارة خاصة</p>
        </section>
      </div>
    </main>
  );
}
