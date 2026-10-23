export type BadgeKey = "vip" | "official_verified" | "partner_verified";
export type AdminTab = "overview" | "players" | "badges" | "codes" | "audit";

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
  action: "resource_adjustment" | "badge_grant" | "badge_revoke" | "badge_expire";
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
