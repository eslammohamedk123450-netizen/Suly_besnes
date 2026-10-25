import { useEffect, useState, type FormEvent } from "react";
import { Award, Banknote, Clock3, Gem, LoaderCircle, Search, ShieldCheck, Sparkles } from "lucide-react";
import type { PlayerRecord } from "@/lib/adminApi";
import { BadgePill } from "./BadgePill";

const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const dateFormat = new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeStyle: "short" });

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "غير متاح" : dateFormat.format(date);
}

type Props = {
  player: PlayerRecord | null;
  searching: boolean;
  searchError: string;
  onSearch: (accountCode: string) => Promise<void>;
  onAdjust: () => void;
  onManageBadges: () => void;
};

export default function PlayerLookup({ player, searching, searchError, onSearch, onAdjust, onManageBadges }: Props) {
  const [accountCode, setAccountCode] = useState(player?.accountCode ?? "");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (player?.accountCode) setAccountCode(player.accountCode);
  }, [player?.accountCode]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = accountCode.trim().toUpperCase();
    if (!/^BE-[A-Z0-9]{7}-[A-Z0-9]{5}$/.test(normalized)) {
      setLocalError("أدخل معرفًا كاملًا بصيغة BE-XXXXXXX-XXXXX.");
      return;
    }
    setLocalError("");
    await onSearch(normalized);
  }

  return (
    <div className="player-workspace" dir="rtl">
      <section className="search-panel">
        <div className="search-panel-mark"><Search size={20} /></div>
        <div className="search-panel-copy"><span className="eyebrow">بحث آمن</span><h2>ابحث عن لاعب</h2><p>أدخل معرّف BE للعثور على الحساب. لا نعرض بريد اللاعب أو بياناته غير الضرورية. عند البحث، تُعالج الشارات الإدارية المنتهية ويُسجّل ذلك.</p></div>
        <form className="player-search-form" onSubmit={(event) => void submit(event)}>
          <label className="field-label" htmlFor="account-code">معرّف الحساب</label>
          <div className="search-input-row"><span className="search-input-symbol">BE</span><input id="account-code" className="text-input code-input" value={accountCode} onChange={(event) => { setAccountCode(event.target.value.toUpperCase()); setLocalError(""); }} placeholder="BE-XXXXXXX-XXXXX" autoCapitalize="characters" autoComplete="off" spellCheck={false} maxLength={32} dir="ltr" required /><button className="primary-button" type="submit" disabled={searching}>{searching ? <LoaderCircle size={17} className="spin" /> : <Search size={17} />}<span>{searching ? "جارٍ البحث…" : "بحث"}</span></button></div>
          {(localError || searchError) && <div className="form-error search-error" role="alert">{localError || searchError}</div>}
        </form>
      </section>

      {player ? <section className="player-detail-panel">
        <div className="player-profile-heading">
          <div className="player-identity"><span className="player-avatar player-avatar-large">{player.playerName.trim().slice(0, 1) || "؟"}</span><div><span className="eyebrow">حساب اللاعب</span><h2>{player.playerName || "لا يوجد اسم"}</h2><div className="player-id-line"><span className="account-code">{player.accountCode}</span><span className="player-day">اليوم {numberFormat.format(player.gameDay)}</span></div></div></div>
          <div className="player-profile-actions"><button className="button-outline" type="button" onClick={onManageBadges}><Award size={16} /> إدارة الشارات</button><button className="primary-button" type="button" onClick={onAdjust}><Sparkles size={16} /> تعديل الموارد</button></div>
        </div>

        <div className="player-meta-line"><span><Clock3 size={14} /> آخر تحديث: {formatDate(player.lastSyncedAt)}</span><span className="secure-data-mark"><ShieldCheck size={14} /> بيانات مختصرة</span></div>
        <div className="resource-balance-grid">
          <article className="resource-balance-card resource-cash"><span className="resource-balance-icon"><Banknote size={19} /></span><span className="resource-balance-label">المال</span><strong>{numberFormat.format(player.balances.cash)}</strong><small>وحدة</small></article>
          <article className="resource-balance-card resource-gold"><span className="resource-balance-icon"><Sparkles size={19} /></span><span className="resource-balance-label">الذهب</span><strong>{numberFormat.format(player.balances.goldGrams)}</strong><small>غرام</small></article>
          <article className="resource-balance-card resource-diamonds"><span className="resource-balance-icon"><Gem size={19} /></span><span className="resource-balance-label">الماس</span><strong>{numberFormat.format(player.balances.diamonds)}</strong><small>جوهرة</small></article>
        </div>

        <div className="player-badges-row"><div><span className="section-kicker">الامتيازات الحالية</span><strong>شارات الحساب</strong></div><div className="player-badges-list">{player.activeBadges.length ? player.activeBadges.map((badge) => <BadgePill key={`${badge.type}-${badge.issuedAt}`} type={badge.type} />) : <span className="no-badges">لا توجد شارات نشطة</span>}</div></div>
      </section> : <section className="player-empty-panel"><div className="empty-search-mark"><Search size={23} /></div><strong>ابدأ بمعرّف اللاعب</strong><p>بعد العثور على الحساب ستظهر الأرصدة الحالية وخيارات إضافة أو خصم الموارد وإدارة الشارات.</p><span className="empty-example"><span>مثال</span><code>BE-7K2M4P9-X3Q8A</code></span></section>}
    </div>
  );
}
