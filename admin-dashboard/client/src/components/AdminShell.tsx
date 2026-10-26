import type { ReactNode } from "react";
import { Award, CircleHelp, Coins, Diamond, LayoutDashboard, LogOut, ScrollText, TicketPercent, UsersRound } from "lucide-react";
import type { AdminTab } from "@/lib/adminApi";

const navItems: { id: AdminTab; label: string; hint: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "الرئيسية", hint: "نظرة عامة", icon: LayoutDashboard },
  { id: "players", label: "إدارة اللاعبين", hint: "بحث وتعديل الموارد", icon: UsersRound },
  { id: "badges", label: "الشارات", hint: "منح وإلغاء", icon: Award },
  { id: "codes", label: "أكواد المكافآت", hint: "إصدار الأكواد", icon: TicketPercent },
  { id: "topups", label: "طلبات شحن الماس", hint: "مراجعة يدوية للطلبات", icon: Diamond },
  { id: "audit", label: "سجل التدقيق", hint: "كل الإجراءات", icon: ScrollText },
];

const headings: Record<AdminTab, { title: string; subtitle: string }> = {
  overview: { title: "الرئيسية", subtitle: "إدارة آمنة وواضحة لعالم إمبراطورية الأعمال." },
  players: { title: "إدارة اللاعبين", subtitle: "ابحث بمعرّف BE واعرض البيانات الضرورية فقط." },
  badges: { title: "إدارة الشارات", subtitle: "كل شارة موثقة بسببها ومدتها وسجلها." },
  codes: { title: "أكواد المكافآت", subtitle: "إصدار أكواد موقعة خادميًا مع منع التكرار وسجل تدقيق." },
  topups: { title: "طلبات شحن الماس", subtitle: "تحقق يدويًا من إيصال Vodafone Cash خارج النظام قبل الاعتماد." },
  audit: { title: "سجل التدقيق", subtitle: "سجل زمني غير قابل للتعديل من لوحة الإدارة." },
};

type Props = {
  tab: AdminTab;
  email: string;
  onTabChange: (tab: AdminTab) => void;
  onLogout: () => void;
  children: ReactNode;
};

export default function AdminShell({ tab, email, onTabChange, onLogout, children }: Props) {
  const heading = headings[tab];
  const initials = email.slice(0, 1).toUpperCase();

  return (
    <div className="admin-shell" dir="rtl">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <img src="/business-empire-logo.svg" alt="" className="sidebar-logo" />
          <div className="sidebar-brand-copy"><strong>إمبراطورية الأعمال</strong><span>لوحة الإدارة</span></div>
        </div>

        <div className="sidebar-section-label">مساحة الإدارة</div>
        <nav className="admin-nav" aria-label="التنقل الرئيسي">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item${tab === item.id ? " nav-item-active" : ""}`}
                type="button"
                onClick={() => onTabChange(item.id)}
                aria-current={tab === item.id ? "page" : undefined}
              >
                <span className="nav-icon"><Icon size={19} /></span>
                <span className="nav-copy"><strong>{item.label}</strong><small>{item.hint}</small></span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-spacer" />
        <div className="sidebar-note">
          <div className="sidebar-note-icon"><CircleHelp size={17} /></div>
          <div><strong>إدارة مسؤولة</strong><p>راجع اسم الحساب والسبب قبل اعتماد أي تعديل.</p></div>
        </div>
        <div className="sidebar-user">
          <span className="user-avatar">{initials}</span>
          <span className="user-details"><strong>المشرف</strong><small>{email}</small></span>
          <button className="icon-button sidebar-logout" type="button" onClick={onLogout} aria-label="تسجيل الخروج" title="تسجيل الخروج"><LogOut size={18} /></button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-copy">
            <div className="breadcrumb"><Coins size={14} /><span>مركز العمليات</span><span className="breadcrumb-separator">/</span><span>{heading.title}</span></div>
            <h1>{heading.title}</h1>
            <p>{heading.subtitle}</p>
          </div>
          <div className="topbar-status"><span className="status-light" /> متصل ببيانات اللعبة</div>
        </header>
        <section className="admin-content">{children}</section>
        <footer className="admin-footer"><span>إمبراطورية الأعمال</span><span>كل إجراء إداري يُحفظ في سجل التدقيق</span></footer>
      </main>

      <nav className="mobile-nav" aria-label="التنقل الرئيسي للهاتف">
        {navItems.filter((item) => item.id !== "overview").map((item) => {
          const Icon = item.icon;
          const mobileLabel = item.id === "players" ? "اللاعبون" : item.id === "badges" ? "الشارات" : item.id === "codes" ? "الأكواد" : item.id === "topups" ? "شحن الماس" : "السجل";
          return <button key={item.id} type="button" className={tab === item.id ? "mobile-nav-active" : ""} onClick={() => onTabChange(item.id)} aria-label={item.label} aria-current={tab === item.id ? "page" : undefined}>
            <Icon size={19} /><span>{mobileLabel}</span>
          </button>;
        })}
      </nav>
    </div>
  );
}
