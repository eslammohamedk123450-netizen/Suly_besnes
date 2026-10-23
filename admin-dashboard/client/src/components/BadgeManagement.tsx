import { useState } from "react";
import { BadgeCheck, CalendarClock, Check, Clock3, Crown, LoaderCircle, Plus, ShieldCheck, Trophy, X } from "lucide-react";
import { getBadgeHistory, grantBadge, revokeBadge, type BadgeHistoryEntry, type BadgeKey, type PlayerRecord } from "@/lib/adminApi";
import { BadgePill } from "./BadgePill";

const badgeDefinitions: { key: BadgeKey; title: string; detail: string; icon: typeof Crown; tone: string }[] = [
  { key: "vip", title: "VIP", detail: "امتيازات العضوية المميزة", icon: Crown, tone: "vip" },
  { key: "official_verified", title: "موثّق رسميًا", detail: "شارة الحساب الرسمي", icon: BadgeCheck, tone: "official" },
  { key: "partner_verified", title: "شريك معتمد", detail: "علامة V الذهبية للشريك المعتمد", icon: Check, tone: "partner" },
];

const numberDate = new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeStyle: "short" });

function formatDate(value: string | null) {
  if (!value) return "دون تاريخ انتهاء";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "تاريخ غير متاح" : numberDate.format(date);
}

function badgeTitle(key: string) {
  return badgeDefinitions.find((badge) => badge.key === key)?.title ?? key;
}

type Props = { player: PlayerRecord; onChanged: () => Promise<void> };

export default function BadgeManagement({ player, onChanged }: Props) {
  const [grantFor, setGrantFor] = useState<BadgeKey | null>(null);
  const [revokeFor, setRevokeFor] = useState<BadgeKey | null>(null);
  const [duration, setDuration] = useState("forever");
  const [customExpiry, setCustomExpiry] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<BadgeHistoryEntry[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const activeByKey = new Map(player.activeBadges.map((badge) => [badge.type, badge]));
  const selectedBadge = badgeDefinitions.find((badge) => badge.key === grantFor || badge.key === revokeFor);

  function closeDialog() {
    setGrantFor(null);
    setRevokeFor(null);
    setReason("");
    setDuration("forever");
    setCustomExpiry("");
    setError("");
  }

  function expiryValue(): string | null {
    if (duration === "forever") return null;
    if (duration === "custom") return customExpiry ? new Date(customExpiry).toISOString() : null;
    const days = Number(duration);
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  }

  async function submitGrant() {
    setError("");
    if (!grantFor || reason.trim().length < 5) {
      setError("اكتب سببًا واضحًا لا يقل عن 5 أحرف.");
      return;
    }
    if (duration === "custom" && (!customExpiry || !Number.isFinite(new Date(customExpiry).getTime()) || new Date(customExpiry).getTime() <= Date.now())) {
      setError("اختر تاريخ انتهاء مستقبليًا.");
      return;
    }
    setBusy(true);
    try {
      await grantBadge({
        accountCode: player.accountCode,
        badgeKey: grantFor,
        expiresAt: expiryValue(),
        reason: reason.trim(),
        requestId: crypto.randomUUID(),
      });
      closeDialog();
      await onChanged();
      if (historyOpen) await loadHistory();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "تعذر إضافة الشارة.");
    } finally {
      setBusy(false);
    }
  }

  async function submitRevoke() {
    setError("");
    if (!revokeFor || reason.trim().length < 5) {
      setError("اكتب سببًا واضحًا لا يقل عن 5 أحرف.");
      return;
    }
    setBusy(true);
    try {
      await revokeBadge({
        accountCode: player.accountCode,
        badgeKey: revokeFor,
        reason: reason.trim(),
        requestId: crypto.randomUUID(),
      });
      closeDialog();
      await onChanged();
      if (historyOpen) await loadHistory();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "تعذر إلغاء الشارة.");
    } finally {
      setBusy(false);
    }
  }

  async function loadHistory() {
    setHistoryLoading(true);
    try {
      setHistory(await getBadgeHistory(player.accountCode));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "تعذر تحميل سجل الشارات.");
    } finally {
      setHistoryLoading(false);
    }
  }

  async function toggleHistory() {
    const next = !historyOpen;
    setHistoryOpen(next);
    if (next) await loadHistory();
  }

  return (
    <div className="badge-management" dir="rtl">
      <div className="selected-player-strip">
        <span className="player-avatar">{player.playerName.trim().slice(0, 1) || "؟"}</span>
        <span><strong>{player.playerName}</strong><small>{player.accountCode}</small></span>
        <span className="selected-player-label"><ShieldCheck size={15} /> حساب محدد</span>
      </div>

      <div className="section-heading-row"><div><span className="eyebrow">امتيازات الحساب</span><h2>شارات اللاعب</h2></div><span className="section-count">{player.activeBadges.length} نشطة</span></div>
      <div className="badge-card-list">
        {badgeDefinitions.map((badge) => {
          const Icon = badge.icon;
          const active = activeByKey.get(badge.key);
          return <article className={`badge-admin-card ${active ? `badge-card-active badge-card-${badge.tone}` : ""}`} key={badge.key}>
            <div className={`badge-admin-icon badge-admin-icon-${badge.tone}`}><Icon size={21} /></div>
            <div className="badge-admin-copy"><div className="badge-admin-title"><strong>{badge.title}</strong>{active && <BadgePill type={badge.key} compact />}</div><p>{badge.detail}</p>{active && <small className="badge-expiry"><CalendarClock size={13} /> {formatDate(active.expiresAt)}</small>}</div>
            {active ? <button className="button-outline-danger" type="button" onClick={() => { setRevokeFor(badge.key); setReason(""); setError(""); }}>إلغاء الشارة</button> : <button className="button-outline" type="button" onClick={() => { setGrantFor(badge.key); setReason(""); setError(""); }}><Plus size={16} /> إضافة</button>}
          </article>;
        })}
      </div>

      <div className="leaderboard-note"><span className="leaderboard-note-icon"><Trophy size={16} /></span><p><strong>شارة متصدر الأسبوع</strong><span>تُدار تلقائيًا عند تفعيل الموسم. تصميم قائمة المتصدرين مؤجل حتى تزويدنا بالصورة التوضيحية التي طلبناها.</span></p></div>

      <div className="history-section">
        <button className="history-toggle" type="button" onClick={() => void toggleHistory()}><span><Clock3 size={17} /> سجل تغييرات الشارات</span><span>{historyOpen ? "إخفاء" : "عرض السجل"}</span></button>
        {historyOpen && <div className="history-list">
          {historyLoading ? <div className="inline-loading"><LoaderCircle className="spin" size={18} /> جارٍ تحميل السجل…</div> : history.length === 0 ? <div className="empty-inline">لا توجد تغييرات مسجلة لهذا الحساب بعد.</div> : history.map((entry, index) => <div className="history-row" key={`${entry.issuedAt}-${index}`}>
            <span className={`history-status status-${entry.status}`}>{entry.status === "active" ? "نشطة" : entry.status === "revoked" ? "ملغاة" : "منتهية"}</span>
            <span className="history-main"><strong>{badgeTitle(entry.badgeKey)}</strong><small>{entry.reason}{entry.revokeReason ? ` · ${entry.revokeReason}` : ""}</small></span>
            <span className="history-time">{formatDate(entry.issuedAt)}</span>
          </div>)}
        </div>}
      </div>

      {(grantFor || revokeFor) && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) closeDialog(); }}>
        <section className="modal-card badge-modal" role="dialog" aria-modal="true" aria-labelledby="badge-modal-title" dir="rtl">
          <header className="modal-header"><div><span className="eyebrow">{grantFor ? "إضافة امتياز" : "إلغاء امتياز"}</span><h2 id="badge-modal-title">{grantFor ? "منح الشارة" : "إلغاء الشارة"}</h2><p>{selectedBadge?.title} · {player.accountCode}</p></div><button className="icon-button modal-close" type="button" onClick={closeDialog} disabled={busy} aria-label="إغلاق"><X size={20} /></button></header>
          {grantFor && <div className="duration-field"><label className="field-label" htmlFor="badge-duration"><CalendarClock size={15} /> مدة الشارة</label><select id="badge-duration" className="text-input" value={duration} onChange={(event) => setDuration(event.target.value)}><option value="forever">دون تاريخ انتهاء</option><option value="7">7 أيام</option><option value="30">30 يومًا</option><option value="90">90 يومًا</option><option value="custom">تاريخ مخصص</option></select>{duration === "custom" && <input type="datetime-local" className="text-input custom-date-input" value={customExpiry} onChange={(event) => setCustomExpiry(event.target.value)} min={new Date(Date.now() + 60_000).toISOString().slice(0, 16)} />}</div>}
          <label className="field-label" htmlFor="badge-reason">{grantFor ? "سبب المنح" : "سبب الإلغاء"} <span className="required-mark">*</span></label>
          <textarea id="badge-reason" className="text-input reason-input" rows={3} minLength={5} maxLength={500} value={reason} onChange={(event) => setReason(event.target.value)} placeholder={grantFor ? "اكتب سبب منح الشارة" : "اكتب سبب إلغاء الشارة"} required />
          {error && <div className="form-error" role="alert">{error}</div>}
          <div className="modal-actions"><button className="button-quiet" type="button" onClick={closeDialog} disabled={busy}>رجوع</button><button className={grantFor ? "primary-button" : "danger-button"} type="button" onClick={() => void (grantFor ? submitGrant() : submitRevoke())} disabled={busy}>{busy ? <LoaderCircle size={17} className="spin" /> : grantFor ? <Plus size={17} /> : <X size={17} />}<span>{busy ? "جارٍ الحفظ…" : grantFor ? "تأكيد المنح" : "تأكيد الإلغاء"}</span></button></div>
        </section>
      </div>}
    </div>
  );
}
