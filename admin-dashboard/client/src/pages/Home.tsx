import { useCallback, useEffect, useState } from "react";
import { AlertCircle, LoaderCircle, ShieldCheck, X } from "lucide-react";
import AdminAuth from "@/components/AdminAuth";
import AdminShell from "@/components/AdminShell";
import AuditHistory from "@/components/AuditHistory";
import BadgeManagement from "@/components/BadgeManagement";
import PlayerLookup from "@/components/PlayerLookup";
import ResourceAdjustmentDialog from "@/components/ResourceAdjustmentDialog";
import RewardCodePanel from "@/components/RewardCodePanel";
import { adjustResources, getAuditHistory, getSession, getSetupStatus, logout, searchPlayer, type AdminTab, type AuditEntry, type PlayerRecord } from "@/lib/adminApi";

type Mode = "checking" | "setup" | "login" | "app" | "error";
type Notice = { message: string; tone: "success" | "error" } | null;

export default function Home() {
  const [mode, setMode] = useState<Mode>("checking");
  const [setupRequired, setSetupRequired] = useState(false);
  const [email, setEmail] = useState("");
  const [bootError, setBootError] = useState("");
  const [tab, setTab] = useState<AdminTab>("overview");
  const [player, setPlayer] = useState<PlayerRecord | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [adjustmentOpen, setAdjustmentOpen] = useState(false);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState("");
  const [notice, setNotice] = useState<Notice>(null);
  const [noticeTimer, setNoticeTimer] = useState<number | null>(null);

  const showNotice = useCallback((message: string, tone: "success" | "error" = "success") => {
    setNotice({ message, tone });
    if (noticeTimer !== null) window.clearTimeout(noticeTimer);
    setNoticeTimer(window.setTimeout(() => setNotice(null), 4800));
  }, [noticeTimer]);

  useEffect(() => () => { if (noticeTimer !== null) window.clearTimeout(noticeTimer); }, [noticeTimer]);

  const checkAccess = useCallback(async () => {
    setMode("checking");
    setBootError("");
    try {
      const status = await getSetupStatus();
      setSetupRequired(status.setupRequired);
      if (status.setupRequired) {
        setMode("setup");
        return;
      }
      try {
        const session = await getSession();
        setEmail(session.email);
        setMode("app");
      } catch {
        setMode("login");
      }
    } catch (cause) {
      setBootError(cause instanceof Error ? cause.message : "تعذر الاتصال بخدمة الإدارة.");
      setMode("error");
    }
  }, []);

  useEffect(() => { void checkAccess(); }, [checkAccess]);

  const loadAudit = useCallback(async () => {
    setAuditLoading(true);
    setAuditError("");
    try {
      setAuditEntries(await getAuditHistory());
    } catch (cause) {
      setAuditError(cause instanceof Error ? cause.message : "تعذر تحميل سجل التدقيق.");
    } finally {
      setAuditLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mode === "app" && tab === "audit") void loadAudit();
  }, [mode, tab, loadAudit]);

  async function handleSearch(accountCode: string) {
    setSearching(true);
    setSearchError("");
    setPlayer(null);
    try {
      setPlayer(await searchPlayer(accountCode));
    } catch (cause) {
      setSearchError(cause instanceof Error ? cause.message : "تعذر العثور على الحساب.");
    } finally {
      setSearching(false);
    }
  }

  const reloadPlayer = useCallback(async () => {
    if (!player?.accountCode) return;
    const updated = await searchPlayer(player.accountCode);
    setPlayer(updated);
  }, [player?.accountCode]);

  async function handleResourceAdjustment(input: {
    cashDelta: number;
    goldDelta: number;
    diamondsDelta: number;
    reason: string;
    requestId: string;
  }) {
    if (!player) return;
    await adjustResources({ accountCode: player.accountCode, ...input });
    await reloadPlayer();
    void loadAudit();
    setAdjustmentOpen(false);
    showNotice("تم حفظ التعديل وتوثيقه في سجل التدقيق.");
  }

  async function handleLogout() {
    try { await logout(); } catch { /* The local session is cleared in the UI regardless. */ }
    setPlayer(null);
    setEmail("");
    setMode("login");
    setTab("overview");
  }

  function handleAuthenticated(nextEmail: string) {
    setEmail(nextEmail);
    setSetupRequired(false);
    setTab("overview");
    setMode("app");
    showNotice(setupRequired ? "تم إنشاء حساب المشرف الأول. التسجيل أصبح مغلقًا." : "تم تسجيل الدخول بأمان.");
  }

  if (mode === "checking") return <main className="full-page-state" dir="rtl"><div className="state-mark"><LoaderCircle className="spin" size={24} /></div><strong>جارٍ التحقق من جلسة الإدارة</strong><span>اتصال آمن بخدمة اللعبة…</span></main>;

  if (mode === "error") return <main className="full-page-state" dir="rtl"><div className="state-mark state-mark-error"><AlertCircle size={23} /></div><strong>تعذر تهيئة لوحة الإدارة</strong><span>{bootError || "تحقق من اتصال Supabase وحالة خدمة الإدارة."}</span><button className="primary-button" type="button" onClick={() => void checkAccess()}><LoaderCircle size={16} /> إعادة المحاولة</button></main>;

  if (mode === "setup" || mode === "login") return <AdminAuth setupRequired={setupRequired} onAuthenticated={handleAuthenticated} />;

  const lookup = <PlayerLookup
    player={player}
    searching={searching}
    searchError={searchError}
    onSearch={handleSearch}
    onAdjust={() => setAdjustmentOpen(true)}
    onManageBadges={() => setTab("badges")}
  />;

  return <>
    <AdminShell tab={tab} email={email} onTabChange={setTab} onLogout={() => void handleLogout()}>
      {tab === "overview" && <>
        <section className="overview-welcome"><span className="overview-shield"><ShieldCheck size={21} /></span><div><span className="eyebrow">مساحة إدارة موثقة</span><h2>مرحبًا بك في مركز العمليات</h2><p>ابحث عن حساب، راجع الأرصدة، ثم أضف أو اخصم مع سبب واضح وسجل كامل.</p></div><button className="overview-action" type="button" onClick={() => setTab("players")}>إدارة اللاعبين <span>←</span></button></section>
        {lookup}
      </>}
      {tab === "players" && lookup}
      {tab === "badges" && <>{lookup}{player && <BadgeManagement player={player} onChanged={async () => { await reloadPlayer(); void loadAudit(); showNotice("تم تحديث شارات الحساب."); }} />}</>}
      {tab === "codes" && <RewardCodePanel />}
      {tab === "audit" && <AuditHistory entries={auditEntries} loading={auditLoading} error={auditError} onRefresh={loadAudit} />}
    </AdminShell>

    {adjustmentOpen && player && <ResourceAdjustmentDialog player={player} onClose={() => setAdjustmentOpen(false)} onSubmit={handleResourceAdjustment} />}
    {notice && <div className={`app-notice notice-${notice.tone}`} role="status"><span className="notice-status-mark">{notice.tone === "success" ? <ShieldCheck size={17} /> : <AlertCircle size={17} />}</span><span>{notice.message}</span><button type="button" aria-label="إغلاق الإشعار" onClick={() => setNotice(null)}><X size={16} /></button></div>}
  </>;
}
