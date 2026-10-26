import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Check, CheckCircle2, Clock3, Diamond, LoaderCircle, RefreshCw, ShieldCheck, X, XCircle } from "lucide-react";
import { approveDiamondTopup, getDiamondTopups, rejectDiamondTopup, type TopupFilter, type TopupOrder, type TopupStatus } from "@/lib/adminApi";

const dateFormat = new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeStyle: "short" });
const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const statusLabels: Record<TopupStatus, string> = { pending: "قيد المراجعة", approved: "معتمد", rejected: "مرفوض" };
const filterOptions: { value: TopupFilter; label: string }[] = [
  { value: "pending", label: "قيد المراجعة" },
  { value: "approved", label: "المعتمدة" },
  { value: "rejected", label: "المرفوضة" },
  { value: "all", label: "كل الطلبات" },
];

type ReviewAction = "approve" | "reject";
type ReviewTarget = { order: TopupOrder; action: ReviewAction };

function orderPrice(order: TopupOrder) {
  return order.amountUsd ?? order.amountEgp ?? 0;
}

function dateText(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "وقت غير متاح" : dateFormat.format(date);
}

function createRequestId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    return (char === "x" ? random : (random & 0x3) | 0x8).toString(16);
  });
}

type Props = { onReviewed: () => void | Promise<void> };

export default function TopupRequests({ onReviewed }: Props) {
  const [filter, setFilter] = useState<TopupFilter>("pending");
  const [orders, setOrders] = useState<TopupOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [target, setTarget] = useState<ReviewTarget | null>(null);
  const [reason, setReason] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const requestIdRef = useRef<string | null>(null);

  const loadOrders = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    setError("");
    try {
      setOrders(await getDiamondTopups(filter));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "تعذر تحميل طلبات شحن الماس.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => { void loadOrders(); }, [loadOrders]);

  function openReview(order: TopupOrder, action: ReviewAction) {
    requestIdRef.current = null;
    setReason("");
    setReviewError("");
    setTarget({ order, action });
  }

  function closeReview() {
    if (submitting) return;
    setTarget(null);
    setReviewError("");
    requestIdRef.current = null;
  }

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!target) return;
    const cleanReason = reason.trim();
    if (cleanReason.length < 5) {
      setReviewError("اكتب سببًا واضحًا لا يقل عن 5 أحرف.");
      return;
    }
    if (!requestIdRef.current) requestIdRef.current = createRequestId();

    setSubmitting(true);
    setReviewError("");
    try {
      const input = { orderId: target.order.orderId, requestId: requestIdRef.current, reason: cleanReason };
      if (target.action === "approve") await approveDiamondTopup(input);
      else await rejectDiamondTopup(input);

      setTarget(null);
      requestIdRef.current = null;
      setReason("");
      await loadOrders(false);
      await onReviewed();
    } catch (cause) {
      setReviewError(cause instanceof Error ? cause.message : "تعذر حفظ قرار المراجعة. أعد المحاولة.");
    } finally {
      setSubmitting(false);
    }
  }

  async function refresh() {
    setRefreshing(true);
    await loadOrders(false);
  }

  return (
    <section className="topups-page" dir="rtl">
      <div className="topups-manual-note" role="note">
        <span className="topups-note-icon"><AlertTriangle size={18} /></span>
        <div><strong>تحقق يدوي مطلوب قبل الاعتماد</strong><p>لا توجد بوابة دفع داخل النظام. تحقّق من إيصال Vodafone Cash خارج النظام ومطابقة المبلغ قبل اعتماد الطلب.</p></div>
      </div>

      <div className="topups-toolbar">
        <div className="topups-heading"><span className="topups-heading-icon"><Diamond size={19} /></span><div><h2>طلبات شحن الماس</h2><p>راجع بيانات الطلب والإيصال يدويًا قبل اتخاذ القرار.</p></div></div>
        <button className="button-outline topups-refresh" type="button" onClick={() => void refresh()} disabled={loading || refreshing}>
          {loading || refreshing ? <LoaderCircle className="spin" size={15} /> : <RefreshCw size={15} />} تحديث
        </button>
      </div>

      <div className="topups-filters" role="group" aria-label="تصفية الطلبات">
        {filterOptions.map((option) => <button key={option.value} type="button" className={filter === option.value ? "topups-filter topups-filter-active" : "topups-filter"} onClick={() => setFilter(option.value)} aria-pressed={filter === option.value}>{option.label}</button>)}
      </div>

      {error && <div className="form-error" role="alert">{error}<button className="button-quiet topups-error-retry" type="button" onClick={() => void loadOrders()}>إعادة المحاولة</button></div>}
      {loading ? <div className="panel-loading"><LoaderCircle className="spin" size={22} /><span>جارٍ تحميل الطلبات…</span></div> : orders.length === 0 ? <div className="player-empty-panel topups-empty"><div className="empty-search-mark"><Diamond size={23} /></div><strong>لا توجد طلبات في هذا القسم</strong><p>ستظهر هنا طلبات شحن الماس المطابقة للتصفية المختارة.</p></div> : <div className="topups-list">
        {orders.map((order) => <article className="topup-card" key={order.orderId}>
          <div className="topup-card-head">
            <div className="topup-order-number"><span>رقم الطلب</span><strong dir="ltr">{order.orderNumber}</strong></div>
            <span className={`topup-status topup-status-${order.status}`}><i />{statusLabels[order.status]}</span>
          </div>
          <div className="topup-player-line"><span className="topup-player-avatar">{order.playerName?.trim().charAt(0) || "؟"}</span><div><strong>{order.playerName || "لا يوجد اسم"}</strong><span dir="ltr">{order.accountCode}</span></div></div>
          <div className="topup-details-grid">
            <div className="topup-detail"><span>الباقة</span><strong>{order.packageName}</strong></div>
            <div className="topup-detail"><span>الماس</span><strong className="topup-diamonds"><Diamond size={14} />{numberFormat.format(order.diamonds)}</strong></div>
            <div className="topup-detail"><span>السعر</span><strong>{numberFormat.format(orderPrice(order))} <small>$</small></strong></div>
            <div className="topup-detail"><span>تاريخ الطلب</span><strong className="topup-date"><Clock3 size={13} />{dateText(order.createdAt)}</strong></div>
          </div>
          {order.status !== "pending" && <div className="topup-review-meta"><span>{order.reviewedAt ? `تمت المراجعة: ${dateText(order.reviewedAt)}` : "تمت المراجعة"}{order.reviewedBy ? ` · ${order.reviewedBy}` : ""}</span>{order.reviewReason && <p>السبب: {order.reviewReason}</p>}</div>}
          {order.status === "pending" && <div className="topup-actions"><button className="danger-button" type="button" onClick={() => openReview(order, "reject")}><XCircle size={15} />رفض الطلب</button><button className="primary-button" type="button" onClick={() => openReview(order, "approve")}><CheckCircle2 size={15} />اعتماد بعد التحقق</button></div>}
        </article>)}
      </div>}

      {target && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeReview(); }}>
        <section className="modal-card topup-review-modal" role="dialog" aria-modal="true" aria-labelledby="topup-review-title" dir="rtl">
          <header className="modal-header"><div><span className="eyebrow">مراجعة طلب شحن الماس</span><h2 id="topup-review-title">{target.action === "approve" ? "تأكيد اعتماد الطلب" : "تأكيد رفض الطلب"}</h2><p>رقم الطلب: <b dir="ltr">{target.order.orderNumber}</b></p></div><button className="icon-button modal-close" type="button" onClick={closeReview} disabled={submitting} aria-label="إغلاق"><X size={18} /></button></header>
          <form className="topup-review-form" onSubmit={(event) => void submitReview(event)}>
            {target.action === "approve" ? <div className="review-warning"><span className="review-warning-mark"><AlertTriangle size={14} /></span><span>تأكد من مطابقة إيصال Vodafone Cash خارج النظام للمبلغ <strong>{numberFormat.format(orderPrice(target.order))} $</strong> قبل الاعتماد.</span></div> : <div className="topup-reject-note"><XCircle size={16} /><span>سيُسجّل الطلب كمرفوض مع السبب الذي تدخله أدناه.</span></div>}
            <div className="review-account"><span className="topup-player-avatar">{target.order.playerName?.trim().charAt(0) || "؟"}</span><span><strong>{target.order.playerName}</strong><small dir="ltr">{target.order.accountCode} · {target.order.packageName} · {numberFormat.format(target.order.diamonds)} ماس</small></span></div>
            <div className="topup-review-summary"><span>قيمة الطلب</span><strong>{numberFormat.format(orderPrice(target.order))} $</strong></div>
            <label className="field-label" htmlFor="topup-review-reason">سبب {target.action === "approve" ? "الاعتماد" : "الرفض"}<span className="required-mark">*</span></label>
            <textarea id="topup-review-reason" className="text-input reason-input" rows={3} minLength={5} required value={reason} onChange={(event) => setReason(event.target.value)} placeholder={target.action === "approve" ? "مثال: تمت مطابقة إيصال Vodafone Cash يدويًا…" : "اكتب سبب رفض الطلب…"} />
            <div className="field-footer"><span>الحد الأدنى 5 أحرف</span><span>{reason.trim().length} حرف</span></div>
            {reviewError && <div className="form-error" role="alert">{reviewError}</div>}
            <div className="modal-actions"><button className="button-quiet" type="button" onClick={closeReview} disabled={submitting}>إلغاء</button><button className={target.action === "approve" ? "primary-button" : "danger-button"} type="submit" disabled={submitting || reason.trim().length < 5}>{submitting ? <LoaderCircle className="spin" size={15} /> : target.action === "approve" ? <Check size={15} /> : <XCircle size={15} />}{submitting ? "جارٍ الحفظ…" : target.action === "approve" ? "تأكيد الاعتماد" : "تأكيد الرفض"}</button></div>
          </form>
          <div className="topup-modal-foot"><ShieldCheck size={14} />قرارك وسببه سيُحفظان في سجل التدقيق.</div>
        </section>
      </div>}
    </section>
  );
}
