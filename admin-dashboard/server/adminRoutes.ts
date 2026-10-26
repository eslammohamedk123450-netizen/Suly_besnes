import type { Express, Request, Response } from "express";
import { getSessionCookieOptions } from "./_core/cookies";

const SUPABASE_URL = "https://kamxjsddjxowodatafqo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_2s3qwuJhqStXG1UQZ0XeqQ_6tw5ns_8";
const ADMIN_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/business-empire-admin`;
const REWARD_ISSUER_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/reward-code-issuer`;
const ADMIN_COOKIE = "be_admin_session";
const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000;

type JsonRecord = Record<string, unknown>;

function readCookie(request: Request, name: string): string | null {
  const raw = request.headers.cookie;
  if (!raw) return null;
  for (const segment of raw.split(";")) {
    const separator = segment.indexOf("=");
    if (separator < 0) continue;
    if (segment.slice(0, separator).trim() !== name) continue;
    try {
      return decodeURIComponent(segment.slice(separator + 1).trim()) || null;
    } catch {
      return null;
    }
  }
  return null;
}

function sendJson(response: Response, status: number, body: JsonRecord) {
  response.status(status).set("Cache-Control", "no-store").json(body);
}

function requireBrowserRequest(request: Request, response: Response): boolean {
  if (request.get("x-admin-request") !== "1" || request.get("sec-fetch-site") === "cross-site") {
    sendJson(response, 403, { ok: false, error: "الطلب غير صالح." });
    return false;
  }
  return true;
}

async function callAdminFunction(
  action: string,
  payload: JsonRecord = {},
  sessionToken?: string | null,
): Promise<{ status: number; body: JsonRecord }> {
  const headers: Record<string, string> = {
    apikey: SUPABASE_PUBLISHABLE_KEY,
    "Content-Type": "application/json",
  };
  if (sessionToken) headers.Authorization = `Bearer ${sessionToken}`;

  const upstream = await fetch(ADMIN_FUNCTION_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ action, ...payload }),
    signal: AbortSignal.timeout(20_000),
  });

  const contentType = upstream.headers.get("content-type") ?? "";
  const raw = await upstream.text();
  let body: JsonRecord = {};
  if (contentType.includes("application/json")) {
    try {
      const parsed: unknown = raw ? JSON.parse(raw) : {};
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) body = parsed as JsonRecord;
    } catch {
      body = { ok: false, error: "تعذر قراءة استجابة خدمة الإدارة." };
    }
  } else if (!upstream.ok) {
    body = { ok: false, error: "خدمة الإدارة غير متاحة مؤقتًا." };
  }
  return { status: upstream.status, body };
}

async function callRewardIssuer(payload: JsonRecord, sessionToken: string): Promise<{ status: number; body: JsonRecord }> {
  const upstream = await fetch(REWARD_ISSUER_FUNCTION_URL, {
    method: "POST",
    headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${sessionToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(20_000),
  });
  const raw = await upstream.text();
  let body: JsonRecord = {};
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) body = parsed as JsonRecord;
  } catch {
    body = { ok: false, error: "تعذر قراءة خدمة إصدار الأكواد." };
  }
  return { status: upstream.status, body };
}

function attachSession(request: Request, response: Response, body: JsonRecord) {
  const token = typeof body.sessionToken === "string" ? body.sessionToken : null;
  if (!token) {
    sendJson(response, 502, { ok: false, error: "تعذر إنشاء جلسة آمنة." });
    return;
  }
  response.cookie(ADMIN_COOKIE, token, {
    ...getSessionCookieOptions(request),
    maxAge: SESSION_MAX_AGE_MS,
  });
  const safeBody = { ...body };
  delete safeBody.sessionToken;
  sendJson(response, 200, safeBody);
}

async function handle(
  request: Request,
  response: Response,
  action: string,
  payload: JsonRecord = {},
  requiresSession = true,
) {
  if (!requireBrowserRequest(request, response)) return;
  const sessionToken = requiresSession ? readCookie(request, ADMIN_COOKIE) : null;
  if (requiresSession && !sessionToken) {
    sendJson(response, 401, { ok: false, error: "سجّل الدخول للمتابعة." });
    return;
  }
  try {
    const result = await callAdminFunction(action, payload, sessionToken);
    sendJson(response, result.status, result.body);
  } catch {
    sendJson(response, 503, { ok: false, error: "تعذر الاتصال بخدمة الإدارة. حاول مجددًا." });
  }
}

export function registerAdminRoutes(app: Express) {
  app.post("/api/admin/setup-status", (request, response) => {
    void handle(request, response, "setup_status", {}, false);
  });

  app.post("/api/admin/setup", async (request, response) => {
    if (!requireBrowserRequest(request, response)) return;
    try {
      const result = await callAdminFunction("bootstrap_admin", {
        email: request.body?.email,
        password: request.body?.password,
        setupCode: request.body?.setupCode,
      });
      if (result.status >= 200 && result.status < 300) attachSession(request, response, result.body);
      else sendJson(response, result.status, result.body);
    } catch {
      sendJson(response, 503, { ok: false, error: "تعذر الاتصال بخدمة الإدارة. حاول مجددًا." });
    }
  });

  app.post("/api/admin/login", async (request, response) => {
    if (!requireBrowserRequest(request, response)) return;
    try {
      const result = await callAdminFunction("login", {
        email: request.body?.email,
        password: request.body?.password,
      });
      if (result.status >= 200 && result.status < 300) attachSession(request, response, result.body);
      else sendJson(response, result.status, result.body);
    } catch {
      sendJson(response, 503, { ok: false, error: "تعذر الاتصال بخدمة الإدارة. حاول مجددًا." });
    }
  });

  app.post("/api/admin/session", (request, response) => {
    void handle(request, response, "session");
  });

  app.post("/api/admin/logout", async (request, response) => {
    if (!requireBrowserRequest(request, response)) return;
    const sessionToken = readCookie(request, ADMIN_COOKIE);
    try {
      if (sessionToken) await callAdminFunction("logout", {}, sessionToken);
    } catch {
      // Clear the browser cookie even if the upstream revoke is temporarily unavailable.
    }
    response.clearCookie(ADMIN_COOKIE, {
      ...getSessionCookieOptions(request),
      maxAge: undefined,
    });
    sendJson(response, 200, { ok: true });
  });

  app.post("/api/admin/player/search", (request, response) => {
    void handle(request, response, "lookup_player", { accountCode: request.body?.accountCode });
  });

  app.post("/api/admin/player/resources", (request, response) => {
    void handle(request, response, "adjust_resources", {
      accountCode: request.body?.accountCode,
      cashDelta: request.body?.cashDelta,
      goldDelta: request.body?.goldDelta,
      diamondsDelta: request.body?.diamondsDelta,
      reason: request.body?.reason,
      requestId: request.body?.requestId,
    });
  });

  app.post("/api/admin/player/badges/grant", (request, response) => {
    void handle(request, response, "grant_badge", {
      accountCode: request.body?.accountCode,
      badgeKey: request.body?.badgeKey,
      expiresAt: request.body?.expiresAt,
      reason: request.body?.reason,
      requestId: request.body?.requestId,
    });
  });

  app.post("/api/admin/player/badges/revoke", (request, response) => {
    void handle(request, response, "revoke_badge", {
      accountCode: request.body?.accountCode,
      badgeKey: request.body?.badgeKey,
      reason: request.body?.reason,
      requestId: request.body?.requestId,
    });
  });

  app.post("/api/admin/player/badges/history", (request, response) => {
    void handle(request, response, "badge_history", {
      accountCode: request.body?.accountCode,
      limit: request.body?.limit,
      offset: request.body?.offset,
    });
  });

  app.post("/api/admin/audit", (request, response) => {
    void handle(request, response, "audit_history", {
      limit: request.body?.limit,
      offset: request.body?.offset,
    });
  });

  app.post("/api/admin/reward-codes/issue", (request, response) => {
    if (!requireBrowserRequest(request, response)) return;
    const sessionToken = readCookie(request, ADMIN_COOKIE);
    if (!sessionToken) { sendJson(response, 401, { ok: false, error: "سجّل الدخول للمتابعة." }); return; }
    void callRewardIssuer({ cash: request.body?.cash, gold: request.body?.gold, expiresAt: request.body?.expiresAt, requestId: request.body?.requestId }, sessionToken)
      .then((result) => sendJson(response, result.status, result.body))
      .catch(() => sendJson(response, 503, { ok: false, error: "تعذر الاتصال بخدمة إصدار الأكواد. حاول مجددًا." }));
  });

  app.post("/api/admin/diamond-topups", (request, response) => {
    void handle(request, response, "list_diamond_topups", {
      status: request.body?.status,
      limit: request.body?.limit,
      offset: request.body?.offset,
    });
  });

  app.post("/api/admin/diamond-topups/approve", (request, response) => {
    void handle(request, response, "approve_diamond_topup", {
      orderId: request.body?.orderId,
      requestId: request.body?.requestId,
      reason: request.body?.reason,
    });
  });

  app.post("/api/admin/diamond-topups/reject", (request, response) => {
    void handle(request, response, "reject_diamond_topup", {
      orderId: request.body?.orderId,
      requestId: request.body?.requestId,
      reason: request.body?.reason,
    });
  });
}
