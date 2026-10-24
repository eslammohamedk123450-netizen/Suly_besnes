import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, BadgeCheck, Clock3, Diamond, LoaderCircle, RefreshCw, ScrollText, ShieldCheck } from "lucide-react";
import type { AuditEntry } from "@/lib/adminApi";

const dateFormat = new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeStyle: "short" });
const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

function dateText(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "وقت غير متاح" : dateFormat.format(date);
}

function actionLabel(entry: AuditEntry) {
  if (entry.action === "resource_adjustment") return "تعديل موارد";
  if (entry.action === "badge_grant") return "منح شارة";
  if (entry.action === "badge_revoke") return "إلغاء شارة";
  if (entry.action === "diamond_topup_approved") return "اعتماد طلب شحن ماس";
  if (entry.action === "diamond_topup_rejected") return "رفض طلب شحن ماس";
  if (entry.action === "reward_signing_key_initialized") return "تهيئة مفتاح توقيع المكافآت";
  return "انتهاء شارة";
}

function resourceSummary(value: Record<string, unknown>) {
  const labels: Record<string, string> = { cash: "المال", goldGrams: "الذهب", diamonds: "الماس" };
  return Object.entries(labels)
    .filter(([key]) => typeof value[key] === "number")
    .map(([key, label]) => `${label}: ${numberFormat.format(Number(value[key]))}`)
    .join(" · ");
}

function stateSummary(value: Record<string, unknown>) {
  const resources = resourceSummary(value);
  const orderNumber = typeof value.orderNumber === "string" ? value.orderNumber : typeof value.orderId === "string" ? value.orderId : null;
  const diamonds = typeof value.diamonds === "number" ? value.diamonds : typeof value.quantity === "number" ? value.quantity : null;
  if (orderNumber || diamonds !== null) {
    return [orderNumber ? `الطلب #${orderNumber}` : null, diamonds !== null ? `${numberFormat.format(diamonds)} ماس` : null].filter(Boolean).join(" · ");
  }
  if (resources) return resources;
  const badgeKey = typeof value.badgeKey === "string" ? value.badgeKey : null;
  if (badgeKey) return badgeKey.replaceAll("_", " ");
  const badges = Array.isArray(value.badges) ? value.badges.length : Array.isArray(value.profileBadges) ? value.profileBadges.length : null;
  if (badges !== null) return `${badges} شارة`;
  return "—";
}

type Props = {
  entries: AuditEntry[];
  loading: boolean;
  error: string;
  onRefresh: () => Promise<void>;
};

export default function AuditHistory({ entries, loading, error, onRefresh }: Props) {
  const [refreshing, setRefreshing] = useState(false);

  async function refresh() {
    setRefreshing(true);
    try { await onRefresh(); } finally { setRefreshing(false); }
  }

  return (
    <section className="audit-page" dir="rtl">
      <div className="audit-summary-banner"><span className="audit-banner-icon"><ShieldCheck size={19} /></span><div><strong>سجل غير قابل للتعديل</strong><p>كل تغيير إداري يُحفظ مع الحساب والسبب والقيم قبل وبعد التنفيذ.</p></div><button className="button-outline audit-refresh" type="button" onClick={() => void refresh()} disabled={loading || refreshing}>{loading || refreshing ? <LoaderCircle size={16} className="spin" /> : <RefreshCw size={16} />} تحديث</button></div>
      {error && <div className="form-error" role="alert">{error}</div>}
      {loading ? <div className="panel-loading"><LoaderCircle className="spin" size={22} /><span>جارٍ تحميل سجل التدقيق…</span></div> : entries.length === 0 ? <div className="player-empty-panel audit-empty"><div className="empty-search-mark"><ScrollText size={23} /></div><strong>لا توجد تعديلات مسجلة بعد</strong><p>سيظهر هنا سجل كل إضافة أو خصم أو تغيير في الشارات وطلبات شحن الماس.</p></div> : <div className="audit-list">{entries.map((entry) => {
        const isDeduction = entry.action === "resource_adjustment" && [entry.details.cash, entry.details.goldGrams, entry.details.diamonds].some((value) => typeof value === "number" && value < 0);
        const isTopup = entry.action === "diamond_topup_approved" || entry.action === "diamond_topup_rejected";
        return <article className="audit-card" key={entry.id}>
          <div className={`audit-card-icon ${isTopup ? entry.action === "diamond_topup_approved" ? "audit-icon-add" : "audit-icon-deduct" : entry.action === "resource_adjustment" ? isDeduction ? "audit-icon-deduct" : "audit-icon-add" : "audit-icon-badge"}`}>
            {isTopup ? <Diamond size={18} /> : entry.action === "resource_adjustment" ? isDeduction ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} /> : <BadgeCheck size={18} />}
          </div>
          <div className="audit-card-main">
            <div className="audit-card-head"><div><strong>{actionLabel(entry)}</strong><span className="audit-account-code">{entry.accountCode ?? "—"}</span></div><span className="audit-time"><Clock3 size={13} />{dateText(entry.createdAt)}</span></div>
            <p className="audit-reason">{entry.reason}</p>
            <div className="audit-state-row"><span><small>قبل</small><strong>{stateSummary(entry.before)}</strong></span><i>←</i><span><small>بعد</small><strong>{stateSummary(entry.after)}</strong></span></div>
            <div className="audit-card-footer"><span>المشرف: {entry.adminEmail}</span><span className="audit-record-mark">موثق <ShieldCheck size={13} /></span></div>
          </div>
        </article>;
      })}</div>}
    </section>
  );
}
