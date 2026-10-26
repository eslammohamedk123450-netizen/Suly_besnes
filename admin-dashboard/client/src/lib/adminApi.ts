export type BadgeKey = "vip" | "official_verified" | "partner_verified";
export type AdminTab = "overview" | "players" | "badges" | "codes" | "topups" | "audit";
export type TopupStatus = "pending" | "approved" | "rejected";
export type TopupFilter = TopupStatus | "all";

export interface TopupOrder {
  orderId: string;
  orderNumber: string;
  accountCode: string;
  playerName: string;
  packageId: string;
  packageName: string;
  diamonds: number;
  amountEgp: number;
  status: TopupStatus;
  createdAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  reviewReason: string | null;
}

export interface ActiveBadge {
  type: BadgeKey;
  issuedAt: string;
  expiresAt: string | null;
}

export interface PlayerRecord {
  accountCode: string;
  playerName: string;
  gameDay: number;
  lastSyncedAt: string;
  balances: {
    cash: number;
    goldGrams: number;
    diamonds: number;
  };
  activeBadges: ActiveBadge[];
}

export interface BadgeHistoryEntry {
  badgeKey: BadgeKey;
  status: "active" | "revoked" | "expired";
  grantedBy: string;
  reason: string;
  issuedAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  revokeReason: string | null;
}

export interface AuditEntry {
  id: string;
  adminEmail: string;
  accountCode: string | null;
  action: "resource_adjustment" | "badge_grant" | "badge_revoke" | "badge_expire" | "reward_signing_key_initialized" | "reward_code_issued" | "diamond_topup_approved" | "diamond_topup_rejected";
  reason: string;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  details: Record<string, unknown>;
  createdAt: string;
}

interface ApiEnvelope<T = unknown> {
  ok: boolean;
  error?: string;
  [key: string]: unknown;
}

async function post<T extends ApiEnvelope>(path: string, payload: Record<string, unknown> = {}): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Request": "1",
    },
    body: JSON.stringify(payload),
  });

  let body: ApiEnvelope;
  try {
    body = await response.json() as ApiEnvelope;
  } catch {
    throw new Error("تعذر قراءة استجابة الخادم.");
  }
  if (!response.ok || !body.ok) {
    throw new Error(typeof body.error === "string" ? body.error : "تعذر إكمال الطلب.");
  }
  return body as T;
}

export async function getSetupStatus(): Promise<{ setupRequired: boolean }> {
  return post<ApiEnvelope & { setupRequired: boolean }>("/api/admin/setup-status");
}

export async function createFirstAdmin(email: string, password: string, setupCode: string): Promise<{ email: string }> {
  return post<ApiEnvelope & { email: string }>("/api/admin/setup", { email, password, setupCode });
}

export async function login(email: string, password: string): Promise<{ email: string }> {
  return post<ApiEnvelope & { email: string }>("/api/admin/login", { email, password });
}

export async function getSession(): Promise<{ email: string }> {
  return post<ApiEnvelope & { email: string }>("/api/admin/session");
}

export async function logout(): Promise<void> {
  await post("/api/admin/logout");
}

export async function searchPlayer(accountCode: string): Promise<PlayerRecord> {
  const response = await post<{ ok: true; player: PlayerRecord }>("/api/admin/player/search", { accountCode });
  return response.player;
}

export async function adjustResources(input: {
  accountCode: string;
  cashDelta: number;
  goldDelta: number;
  diamondsDelta: number;
  reason: string;
  requestId: string;
}): Promise<void> {
  await post("/api/admin/player/resources", input);
}

export async function grantBadge(input: {
  accountCode: string;
  badgeKey: BadgeKey;
  expiresAt: string | null;
  reason: string;
  requestId: string;
}): Promise<void> {
  await post("/api/admin/player/badges/grant", input);
}

export async function revokeBadge(input: {
  accountCode: string;
  badgeKey: BadgeKey;
  reason: string;
  requestId: string;
}): Promise<void> {
  await post("/api/admin/player/badges/revoke", input);
}

export async function getBadgeHistory(accountCode: string): Promise<BadgeHistoryEntry[]> {
  const response = await post<{ ok: true; entries: BadgeHistoryEntry[] }>("/api/admin/player/badges/history", { accountCode });
  return response.entries ?? [];
}

export async function getAuditHistory(): Promise<AuditEntry[]> {
  const response = await post<{ ok: true; entries: AuditEntry[] }>("/api/admin/audit");
  return response.entries ?? [];
}

export async function issueRewardCode(input: {
  cash: number;
  gold: number;
  expiresAt: string;
  requestId: string;
}): Promise<{ code: string; reused: boolean; expiresAt: string }> {
  return post<{ ok: true; code: string; reused: boolean; expiresAt: string }>("/api/admin/reward-codes/issue", input);
}

export async function getDiamondTopups(status: TopupFilter): Promise<TopupOrder[]> {
  const response = await post<{ ok: true; orders: TopupOrder[] }>("/api/admin/diamond-topups", { status });
  return response.orders ?? [];
}

export async function approveDiamondTopup(input: { orderId: string; requestId: string; reason: string }): Promise<void> {
  await post("/api/admin/diamond-topups/approve", input);
}

export async function rejectDiamondTopup(input: { orderId: string; requestId: string; reason: string }): Promise<void> {
  await post("/api/admin/diamond-topups/reject", input);
}
