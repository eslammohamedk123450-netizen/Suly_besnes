import { AlertTriangle, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";

export default function RewardCodePanel() {
  return (
    <section className="codes-page" dir="rtl">
      <div className="codes-hero">
        <div className="codes-hero-icon"><KeyRound size={22} /></div>
        <div><span className="eyebrow">توقيع SULY1 · Ed25519</span><h2>مولّد أكواد المكافآت</h2><p>ستبقى صيغة الأكواد الحالية صالحة. لن أدوّر مفتاح التوقيع أو أُصدر أكوادًا لا يستطيع التطبيق التحقق منها.</p></div>
      </div>

      <div className="signing-key-warning"><span className="warning-symbol"><AlertTriangle size={18} /></span><div><strong>الإصدار متوقف مؤقتًا حفاظًا على التوافق</strong><p>التحقق في اللعبة يعتمد على مفتاح Ed25519 عام محدد. يلزم ربط المفتاح الخاص الحالي الموجود لدى مولّد الأكواد القديم بخادم آمن قبل تمكين الإصدار؛ لا ينبغي وضعه في الواجهة أو إرسالِه داخل المحادثة.</p></div></div>

      <div className="code-compat-grid">
        <article className="code-compat-card"><span className="compat-number">01</span><div><strong>صيغة اللعبة</strong><p><code>SULY1.payload.signature</code></p><small>محفوظة كما هي دون تعديل.</small></div></article>
        <article className="code-compat-card"><span className="compat-number">02</span><div><strong>الأكواد الحالية</strong><p>لن تتأثر</p><small>يظل مفتاح التحقق الموجود في التطبيق كما هو.</small></div></article>
        <article className="code-compat-card"><span className="compat-number">03</span><div><strong>مفتاح التوقيع</strong><p><LockKeyhole size={15} /> خادمي فقط</p><small>لا يُرسل إلى المتصفح أو سجل الواجهة.</small></div></article>
      </div>

      <div className="codes-footer-note"><ShieldCheck size={17} /><span>لإكمال هذه الصفحة، يلزم استعادة مفتاح التوقيع الخاص الحالي من بيئة مولّد الأكواد القديمة وإضافته إلى إعدادات الخادم المحمية. لا أستطيع استبداله بمفتاح جديد دون تحديث تطبيق اللعبة وموافقتك.</span></div>
    </section>
  );
}
