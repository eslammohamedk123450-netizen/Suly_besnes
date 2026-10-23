import { useMemo, useState, type FormEvent } from "react";
import { ArrowDownLeft, ArrowUpRight, Check, LoaderCircle, X } from "lucide-react";
import type { PlayerRecord } from "@/lib/adminApi";

const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const resourceRows = [
  { key: "cash", label: "المال", suffix: "وحدة", step: "1" },
  { key: "goldGrams", label: "الذهب", suffix: "غرام", step: "0.1" },
  { key: "diamonds", label: "الماس", suffix: "جوهرة", step: "1" },
] as const;

type Deltas = { cashDelta: number; goldDelta: number; diamondsDelta: number };
type Props = {
  player: PlayerRecord;
  onClose: () => void;
  onSubmit: (input: Deltas & { reason: string; requestId: string }) => Promise<void>;
};

export default function ResourceAdjustmentDialog({ player, onClose, onSubmit }: Props) {
  const [direction, setDirection] = useState<"add" | "deduct">("add");
  const [amounts, setAmounts] = useState({ cash: "0", goldGrams: "0", diamonds: "0" });
  const [reason, setReason] = useState("");
  const [stage, setStage] = useState<"edit" | "review">("edit");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const amountsAsNumbers = useMemo(() => ({
    cash: Number(amounts.cash),
    goldGrams: Number(amounts.goldGrams),
    diamonds: Number(amounts.diamonds),
  }), [amounts]);
  const multiplier = direction === "add" ? 1 : -1;
  const deltas = {
    cashDelta: amountsAsNumbers.cash * multiplier,
    goldDelta: amountsAsNumbers.goldGrams * multiplier,
    diamondsDelta: amountsAsNumbers.diamonds * multiplier,
  };
  const hasAmount = Object.values(amountsAsNumbers).some((value) => Number.isFinite(value) && value > 0);
  const validAmounts = Object.values(amountsAsNumbers).every((value) => Number.isFinite(value) && value >= 0)
    && Number.isInteger(amountsAsNumbers.cash)
    && Number.isInteger(amountsAsNumbers.diamonds)
    && Number.isInteger(amountsAsNumbers.goldGrams * 10);

  function review(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!validAmounts || !hasAmount) {
      setError("أدخل قيمة صحيحة واحدة على الأقل. المال والماس أعداد صحيحة، والذهب بدقة 0.1 غرام.");
      return;
    }
    if (reason.trim().length < 5) {
      setError("اكتب سببًا واضحًا لا يقل عن 5 أحرف.");
      return;
    }
    if (direction === "deduct" && (
      amountsAsNumbers.cash > player.balances.cash
      || amountsAsNumbers.goldGrams > player.balances.goldGrams
      || amountsAsNumbers.diamonds > player.balances.diamonds
    )) {
      setError("لا يمكن أن يصبح أي رصيد سالبًا.");
      return;
    }
    if (!requestId) setRequestId(crypto.randomUUID());
    setStage("review");
  }

  async function confirm() {
    setBusy(true);
    setError("");
    try {
      await onSubmit({ ...deltas, reason: reason.trim(), requestId: requestId ?? crypto.randomUUID() });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "تعذر تنفيذ التعديل.");
      setStage("edit");
    } finally {
      setBusy(false);
    }
  }

  const balanceRows = resourceRows.map((resource) => {
    const before = player.balances[resource.key];
    const delta = resource.key === "cash" ? deltas.cashDelta : resource.key === "goldGrams" ? deltas.goldDelta : deltas.diamondsDelta;
    return { ...resource, before, after: before + delta, delta };
  });

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
      <section className="modal-card resource-modal" role="dialog" aria-modal="true" aria-labelledby="resource-modal-title" dir="rtl">
        <header className="modal-header">
          <div><span className="eyebrow">تعديل مباشر وموثق</span><h2 id="resource-modal-title">موارد اللاعب</h2><p>{player.accountCode} · {player.playerName}</p></div>
          <button className="icon-button modal-close" type="button" onClick={onClose} disabled={busy} aria-label="إغلاق"><X size={20} /></button>
        </header>

        {stage === "edit" ? <form onSubmit={review} className="modal-form">
          <div className="direction-switch" role="group" aria-label="نوع العملية">
            <button type="button" className={direction === "add" ? "direction-option selected add-selected" : "direction-option"} onClick={() => { setRequestId(null); setDirection("add"); }}><ArrowUpRight size={17} /> إضافة</button>
            <button type="button" className={direction === "deduct" ? "direction-option selected deduct-selected" : "direction-option"} onClick={() => { setRequestId(null); setDirection("deduct"); }}><ArrowDownLeft size={17} /> خصم</button>
          </div>

          <div className="resource-input-list">
            {resourceRows.map((resource) => <label className="resource-input-row" key={resource.key}>
              <span><strong>{resource.label}</strong><small>الرصيد الحالي: {numberFormat.format(player.balances[resource.key])} {resource.suffix}</small></span>
              <span className="number-input-wrap"><input
                type="number"
                min="0"
                step={resource.step}
                inputMode="decimal"
                max="1000000000000"
                value={amounts[resource.key]}
                onChange={(event) => { setRequestId(null); setAmounts((current) => ({ ...current, [resource.key]: event.target.value })); }}
                aria-label={`قيمة ${resource.label}`}
              /><em>{resource.suffix}</em></span>
            </label>)}
          </div>

          <label className="field-label" htmlFor="resource-reason">سبب التعديل <span className="required-mark">*</span></label>
          <textarea id="resource-reason" className="text-input reason-input" value={reason} onChange={(event) => { setRequestId(null); setReason(event.target.value); }} minLength={5} maxLength={500} rows={3} placeholder="مثال: تعويض عن خلل تقني موثق" required />
          <div className="field-footer"><span>سيُسجل السبب مع القيم قبل وبعد.</span><span>{reason.length}/500</span></div>

          {error && <div className="form-error" role="alert">{error}</div>}
          <div className="modal-actions"><button className="button-quiet" type="button" onClick={onClose}>إلغاء</button><button className="primary-button" type="submit">مراجعة التعديل <ArrowUpRight size={17} /></button></div>
        </form> : <div className="review-panel">
          <div className="review-warning"><span className="review-warning-mark">!</span><span>تأكد من الحساب والقيم. سيُطبّق هذا التعديل مباشرة بعد التأكيد.</span></div>
          <div className="review-account"><span className="player-avatar">{player.playerName.trim().slice(0, 1) || "؟"}</span><span><strong>{player.playerName}</strong><small>{player.accountCode}</small></span></div>
          <div className="balance-review">
            {balanceRows.map((row) => <div className="balance-review-row" key={row.key}>
              <span>{row.label}</span><span>{numberFormat.format(row.before)} <i>←</i> <strong className={row.delta < 0 ? "negative-value" : row.delta > 0 ? "positive-value" : ""}>{numberFormat.format(row.after)}</strong></span>
            </div>)}
          </div>
          <div className="review-reason"><small>سبب التعديل</small><p>{reason.trim()}</p></div>
          {error && <div className="form-error" role="alert">{error}</div>}
          <div className="modal-actions"><button className="button-quiet" type="button" onClick={() => setStage("edit")} disabled={busy}>رجوع</button><button className="primary-button" type="button" onClick={() => void confirm()} disabled={busy}>{busy ? <LoaderCircle size={17} className="spin" /> : <Check size={17} />}<span>{busy ? "جارٍ الحفظ…" : "تأكيد التعديل"}</span></button></div>
        </div>}
      </section>
    </div>
  );
}
