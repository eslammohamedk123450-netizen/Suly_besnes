import { BadgeCheck, Check, Crown, Trophy } from "lucide-react";
import type { BadgeKey } from "@/lib/adminApi";

const badgeInfo: Record<BadgeKey | "weekly_leader", { title: string; symbol: typeof Crown; tone: string }> = {
  vip: { title: "VIP", symbol: Crown, tone: "vip" },
  official_verified: { title: "موثّق رسميًا", symbol: BadgeCheck, tone: "official" },
  partner_verified: { title: "شريك معتمد", symbol: Check, tone: "partner" },
  weekly_leader: { title: "متصدر الأسبوع", symbol: Trophy, tone: "weekly" },
};

export function BadgePill({ type, compact = false }: { type: BadgeKey | "weekly_leader"; compact?: boolean }) {
  const info = badgeInfo[type];
  const Icon = info.symbol;
  return (
    <span className={`badge-pill badge-${info.tone}${compact ? " badge-compact" : ""}`}>
      <Icon size={compact ? 14 : 16} strokeWidth={2.2} />
      {!compact && <span>{info.title}</span>}
    </span>
  );
}
