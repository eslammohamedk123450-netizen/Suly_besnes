import "jsr:@supabase/functions-js/edge-runtime.d.ts";

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const PBKDF2_ITERATIONS = 310_000;
const SESSION_HOURS = 12;
const DUMMY_SALT = "AAAAAAAAAAAAAAAAAAAAAA==";
const TRUSTED_REWARD_PUBLIC_KEYS = new Set([
  "MCowBQYDK2VwAyEA84UjrthL2DPvb0nU4FJv519tEWgUpuHEBhP4gdmrAiY=",
  "MCowBQYDK2VwAyEAE8KYanYlY/M5eQuNNuKP/EMerujT9v9IaC374LZtBCs=",
]);
const encoder = new TextEncoder();

type JsonRecord = Record<string, unknown>;

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

function json(status: number, body: JsonRecord) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function base64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function base64url(bytes: Uint8Array): string {
  return base64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function uuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function sha256Hex(value: string): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", toArrayBuffer(encoder.encode(value))));
  return [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function derivePasswordHash(password: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    toArrayBuffer(encoder.encode(password)),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: toArrayBuffer(fromBase64(salt)), iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    key,
    256,
  );
  return base64(new Uint8Array(bits));
}

function constantTimeEqual(left: string, right: string): boolean {
  const a = encoder.encode(left);
  const b = encoder.encode(right);
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) difference |= a[index] ^ b[index];
  return difference === 0;
}

function getText(value: unknown, maximum = 500): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= maximum ? trimmed : null;
}

function normalizeEmail(value: unknown): string | null {
  const email = getText(value, 254)?.toLowerCase() ?? null;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

function validRequestId(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function rpc<T = unknown>(name: string, args: JsonRecord): Promise<T> {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) throw new Error("service_unavailable");
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  const raw = await response.text();
  let parsed: unknown = null;
  try {
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    parsed = null;
  }
  if (!response.ok) {
    const message = parsed && typeof parsed === "object" && "message" in parsed
      ? String((parsed as { message: unknown }).message)
      : "database_request_failed";
    console.error("admin rpc failed", name, response.status, message.slice(0, 120));
    throw new Error(message);
  }
  return parsed as T;
}

function scalarBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (Array.isArray(value) && typeof value[0] === "boolean") return value[0];
  if (value && typeof value === "object" && "admin_setup_status" in value) {
    return Boolean((value as { admin_setup_status: unknown }).admin_setup_status);
  }
  return false;
}

function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+([A-Za-z0-9_-]{32,128})$/i.exec(header);
  return match?.[1] ?? null;
}

async function createSession(): Promise<string> {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const token = base64url(bytes);
  const tokenHash = await sha256Hex(token);
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000).toISOString();
  const created = await rpc<unknown>("admin_create_session", {
    p_token_hash: tokenHash,
    p_expires_at: expiresAt,
  });
  if (!scalarBoolean(created)) throw new Error("session_create_failed");
  return token;
}

async function requireAdmin(request: Request): Promise<string | null> {
  const token = bearerToken(request);
  if (!token) return null;
  const email = await rpc<unknown>("admin_validate_session", {
    p_token_hash: await sha256Hex(token),
  });
  if (typeof email === "string") return email;
  if (Array.isArray(email) && typeof email[0] === "string") return email[0];
  return null;
}

function knownError(error: unknown): { status: number; message: string } {
  const value = error instanceof Error ? error.message : "";
  if (value.includes("player_not_found")) return { status: 404, message: "لم يتم العثور على هذا الحساب." };
  if (value.includes("invalid_account_code")) return { status: 400, message: "تحقق من صيغة معرف BE." };
  if (value.includes("balance_out_of_range")) return { status: 400, message: "الرصيد الناتج خارج الحدود المسموحة." };
  if (value.includes("invalid_resource")) return { status: 400, message: "قيم التعديل غير صالحة." };
  if (value.includes("badge_already_active")) return { status: 409, message: "هذه الشارة نشطة بالفعل لهذا اللاعب." };
  if (value.includes("badge_not_active")) return { status: 409, message: "لا توجد شارة نشطة من هذا النوع لإلغائها." };
  if (value.includes("idempotency_key_conflict")) return { status: 409, message: "تعذر مطابقة الطلب السابق؛ حدّث الصفحة قبل إعادة المحاولة." };
  if (value.includes("invalid_topup_status")) return { status: 400, message: "حالة الطلب المطلوبة غير صالحة." };
  if (value.includes("invalid_topup_review")) return { status: 400, message: "أدخل سببًا صالحًا للمراجعة لا يقل عن خمسة أحرف." };
  if (value.includes("topup_order_not_found")) return { status: 404, message: "لم يتم العثور على طلب الشحن." };
  if (value.includes("topup_order_not_pending")) return { status: 409, message: "تمت مراجعة هذا الطلب بالفعل." };
  if (value.includes("player_profile_not_found")) return { status: 404, message: "تعذر العثور على ملف اللاعب المرتبط بالطلب." };
  if (value.includes("invalid_topup_package")) return { status: 400, message: "باقة الشحن غير صالحة." };
  if (value.includes("invalid_badge")) return { status: 400, message: "بيانات الشارة غير صالحة." };
  if (value.includes("invalid_admin_setup")) return { status: 400, message: "بيانات الحساب غير صالحة." };
  if (value.includes("invalid_setup_code")) return { status: 403, message: "رمز الإعداد غير صحيح أو تم استخدامه." };
  if (value.includes("invalid_reward_issue")) return { status: 400, message: "بيانات الكود غير صالحة أو انتهت مدة الصلاحية." };
  if (value.includes("reward_code_issue_conflict")) return { status: 409, message: "تعارض طلب إصدار الكود؛ لا تعِد الإرسال بنفس الطلب." };
  if (value.includes("service_unavailable")) return { status: 503, message: "خدمة الإدارة غير متاحة مؤقتًا." };
  return { status: 500, message: "تعذر إكمال الطلب. حاول لاحقًا." };
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }
  if (request.method !== "POST") return json(405, { ok: false, error: "method_not_allowed" });

  let body: JsonRecord;
  try {
    const value = await request.json();
    if (!value || typeof value !== "object" || Array.isArray(value)) return json(400, { ok: false, error: "invalid_request" });
    body = value as JsonRecord;
  } catch {
    return json(400, { ok: false, error: "invalid_json" });
  }

  const action = getText(body.action, 48);
  if (!action) return json(400, { ok: false, error: "action_required" });

  try {
    if (action === "setup_status") {
      const initialized = await rpc<unknown>("admin_setup_status", {});
      return json(200, { ok: true, setupRequired: !scalarBoolean(initialized) });
    }

    if (action === "bootstrap_admin") {
      const email = normalizeEmail(body.email);
      const password = typeof body.password === "string" ? body.password : "";
      const setupCode = typeof body.setupCode === "string" ? body.setupCode.trim().toUpperCase() : "";
      if (!email || password.length < 16 || password.length > 256 || !/^[0-9A-F]{32}$/.test(setupCode)) {
        return json(400, { ok: false, error: "أدخل بريدًا صالحًا وكلمة مرور قوية ورمز الإعداد المكون من 32 خانة." });
      }
      const initialized = await rpc<unknown>("admin_setup_status", {});
      if (scalarBoolean(initialized)) return json(409, { ok: false, error: "تم إعداد حساب المشرف بالفعل." });

      const saltBytes = crypto.getRandomValues(new Uint8Array(16));
      const salt = base64(saltBytes);
      const passwordHash = await derivePasswordHash(password, salt);
      const created = await rpc<unknown>("admin_bootstrap_admin", {
        p_email: email,
        p_password_salt: salt,
        p_password_hash: passwordHash,
        p_setup_token_hash: await sha256Hex(setupCode),
      });
      if (!scalarBoolean(created)) return json(409, { ok: false, error: "تم إعداد حساب المشرف بالفعل." });
      const sessionToken = await createSession();
      return json(201, { ok: true, email, sessionToken });
    }

    if (action === "login") {
      const email = normalizeEmail(body.email);
      const password = typeof body.password === "string" ? body.password : "";
      if (!email || password.length < 1 || password.length > 256) {
        return json(401, { ok: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." });
      }
      const emailHash = await sha256Hex(email);
      const locked = await rpc<unknown>("admin_login_locked_until", { p_email_hash: emailHash });
      const lockedValue = Array.isArray(locked) ? locked[0] : locked;
      if (typeof lockedValue === "string" && new Date(lockedValue).getTime() > Date.now()) {
        return json(429, { ok: false, error: "محاولات كثيرة. انتظر قليلًا ثم حاول مجددًا." });
      }

      const rows = await rpc<unknown>("admin_get_auth_record", { p_email: email });
      const record = Array.isArray(rows) && rows.length > 0 && rows[0] && typeof rows[0] === "object"
        ? rows[0] as JsonRecord
        : null;
      const storedSalt = record && typeof record.password_salt === "string" ? record.password_salt : DUMMY_SALT;
      const storedHash = record && typeof record.password_hash === "string" ? record.password_hash : await derivePasswordHash("unmatched-account", DUMMY_SALT);
      const candidateHash = await derivePasswordHash(password, storedSalt);
      const valid = Boolean(record && typeof record.email === "string" && constantTimeEqual(candidateHash, storedHash));
      if (!valid) {
        await rpc("admin_register_login_failure", { p_email_hash: emailHash });
        return json(401, { ok: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." });
      }

      await rpc("admin_clear_login_failures", { p_email_hash: emailHash });
      const sessionToken = await createSession();
      return json(200, { ok: true, email, sessionToken });
    }

    const adminEmail = await requireAdmin(request);
    if (!adminEmail) return json(401, { ok: false, error: "انتهت الجلسة. سجّل الدخول مجددًا." });

    if (action === "session") return json(200, { ok: true, email: adminEmail });

    if (action === "logout") {
      const token = bearerToken(request);
      if (token) await rpc("admin_revoke_session", { p_token_hash: await sha256Hex(token) });
      return json(200, { ok: true });
    }

    if (action === "lookup_player") {
      const accountCode = getText(body.accountCode, 32)?.toUpperCase() ?? "";
      const player = await rpc<unknown>("admin_lookup_player", { p_account_code: accountCode });
      if (player === null) return json(404, { ok: false, error: "لم يتم العثور على هذا الحساب." });
      return json(200, { ok: true, player });
    }

    if (action === "adjust_resources") {
      const accountCode = getText(body.accountCode, 32)?.toUpperCase() ?? "";
      const reason = getText(body.reason, 500);
      if (!validRequestId(body.requestId) || !reason) return json(400, { ok: false, error: "أدخل سببًا صالحًا للتعديل." });
      const cash = typeof body.cashDelta === "number" ? body.cashDelta : Number.NaN;
      const gold = typeof body.goldDelta === "number" ? body.goldDelta : Number.NaN;
      const diamonds = typeof body.diamondsDelta === "number" ? body.diamondsDelta : Number.NaN;
      const result = await rpc<unknown>("admin_adjust_resources", {
        p_account_code: accountCode,
        p_cash_delta: cash,
        p_gold_delta: gold,
        p_diamonds_delta: diamonds,
        p_reason: reason,
        p_request_id: body.requestId,
        p_admin_email: adminEmail,
      });
      return json(200, { ok: true, result });
    }

    if (action === "grant_badge") {
      const accountCode = getText(body.accountCode, 32)?.toUpperCase() ?? "";
      const badgeKey = getText(body.badgeKey, 40) ?? "";
      const reason = getText(body.reason, 500);
      const expiresAt = body.expiresAt === null || body.expiresAt === "" ? null : getText(body.expiresAt, 40);
      if (!validRequestId(body.requestId) || !reason || (body.expiresAt !== null && body.expiresAt !== "" && !expiresAt)) {
        return json(400, { ok: false, error: "أدخل بيانات الشارة وسببًا صالحًا." });
      }
      if (expiresAt && !Number.isFinite(new Date(expiresAt).getTime())) return json(400, { ok: false, error: "تاريخ انتهاء الشارة غير صالح." });
      const result = await rpc<unknown>("admin_grant_badge", {
        p_account_code: accountCode,
        p_badge_key: badgeKey,
        p_expires_at: expiresAt,
        p_reason: reason,
        p_request_id: body.requestId,
        p_admin_email: adminEmail,
      });
      return json(200, { ok: true, result });
    }

    if (action === "revoke_badge") {
      const accountCode = getText(body.accountCode, 32)?.toUpperCase() ?? "";
      const badgeKey = getText(body.badgeKey, 40) ?? "";
      const reason = getText(body.reason, 500);
      if (!validRequestId(body.requestId) || !reason) return json(400, { ok: false, error: "أدخل سببًا صالحًا لإلغاء الشارة." });
      const result = await rpc<unknown>("admin_revoke_badge", {
        p_account_code: accountCode,
        p_badge_key: badgeKey,
        p_reason: reason,
        p_request_id: body.requestId,
        p_admin_email: adminEmail,
      });
      return json(200, { ok: true, result });
    }

    if (action === "badge_history") {
      const accountCode = getText(body.accountCode, 32)?.toUpperCase() ?? "";
      const result = await rpc<unknown>("admin_list_badge_history", {
        p_account_code: accountCode,
        p_limit: Math.min(Math.max(Number(body.limit) || 50, 1), 100),
        p_offset: Math.min(Math.max(Number(body.offset) || 0, 0), 10_000),
      });
      return json(200, { ok: true, entries: result });
    }

    if (action === "audit_history") {
      const result = await rpc<unknown>("admin_list_audit", {
        p_limit: Math.min(Math.max(Number(body.limit) || 50, 1), 100),
        p_offset: Math.min(Math.max(Number(body.offset) || 0, 0), 10_000),
      });
      return json(200, { ok: true, entries: result });
    }

    if (action === "issue_reward_code") {
      const requestId = body.requestId;
      const expiresAtText = getText(body.expiresAt, 40);
      const cash = typeof body.cash === "number" && Number.isSafeInteger(body.cash) ? body.cash : Number.NaN;
      const gold = typeof body.gold === "number" && Number.isFinite(body.gold) ? body.gold : Number.NaN;
      const expiresAt = expiresAtText ? new Date(expiresAtText) : null;
      if (!uuid(requestId) || !expiresAt || !Number.isFinite(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()
        || !Number.isSafeInteger(cash) || cash < 0 || cash > 1_000_000
        || !Number.isFinite(gold) || gold < 0 || gold > 1_000_000 || (cash === 0 && gold === 0)) {
        return json(400, { ok: false, error: "بيانات الكود غير صالحة." });
      }

      const keyRows = await rpc<unknown>("admin_get_active_reward_signing_key", {});
      const keyRecord = Array.isArray(keyRows) && keyRows[0] && typeof keyRows[0] === "object"
        ? keyRows[0] as JsonRecord
        : null;
      const privateKey = keyRecord && typeof keyRecord.private_key_pkcs8_b64 === "string" ? keyRecord.private_key_pkcs8_b64 : null;
      const publicKey = keyRecord && typeof keyRecord.public_key_spki_b64 === "string" ? keyRecord.public_key_spki_b64 : null;
      if (!privateKey || !publicKey || !TRUSTED_REWARD_PUBLIC_KEYS.has(publicKey)) throw new Error("service_unavailable");

      const issuedAt = new Date().toISOString();
      const codeId = crypto.randomUUID();
      const rewards = [
        ...(cash > 0 ? [{ type: "cash", amount: cash }] : []),
        ...(gold > 0 ? [{ type: "gold", grams: gold }] : []),
      ];
      const payload = { version: 1, codeId, issuedAt, expiresAt: expiresAt.toISOString(), rewards };
      const encodedPayload = base64url(encoder.encode(JSON.stringify(payload)));
      const signingKey = await crypto.subtle.importKey(
        "pkcs8",
        toArrayBuffer(fromBase64(privateKey)),
        { name: "Ed25519" },
        false,
        ["sign"],
      );
      const signature = new Uint8Array(await crypto.subtle.sign(
        { name: "Ed25519" },
        signingKey,
        toArrayBuffer(encoder.encode(encodedPayload)),
      ));
      const code = `SULY1.${encodedPayload}.${base64url(signature)}`;
      const recorded = await rpc<unknown>("admin_record_reward_code_issue", {
        p_request_id: requestId,
        p_code_id: codeId,
        p_code_text: code,
        p_cash_amount: cash,
        p_gold_grams: gold,
        p_expires_at: expiresAt.toISOString(),
        p_admin_email: adminEmail,
      });
      const row = Array.isArray(recorded) ? recorded[0] : recorded;
      const result = row && typeof row === "object" ? row as JsonRecord : null;
      if (!result || typeof result.code_text !== "string") throw new Error("service_unavailable");
      return json(200, { ok: true, code: result.code_text, reused: result.reused === true, expiresAt: expiresAt.toISOString() });
    }

    if (action === "list_diamond_topups") {
      const status = body.status;
      if (status !== "pending" && status !== "approved" && status !== "rejected" && status !== "all") {
        return json(400, { ok: false, error: "اختر حالة طلب صالحة." });
      }
      const orders = await rpc<unknown>("admin_list_diamond_topup_orders", {
        p_status: status,
        p_limit: Math.min(Math.max(Number(body.limit) || 50, 1), 100),
        p_offset: Math.min(Math.max(Number(body.offset) || 0, 0), 10_000),
      });
      return json(200, { ok: true, orders });
    }

    if (action === "approve_diamond_topup" || action === "reject_diamond_topup") {
      const orderId = body.orderId;
      const reason = getText(body.reason, 500);
      if (!validRequestId(orderId) || !validRequestId(body.requestId) || !reason || reason.length < 5) {
        return json(400, { ok: false, error: "تحقق من رقم الطلب وسبب المراجعة." });
      }
      const rpcName = action === "approve_diamond_topup"
        ? "admin_approve_diamond_topup_order"
        : "admin_reject_diamond_topup_order";
      const result = await rpc<unknown>(rpcName, {
        p_order_id: orderId,
        p_request_id: body.requestId,
        p_admin_email: adminEmail,
        p_reason: reason,
      });
      return json(200, { ok: true, result });
    }

    return json(404, { ok: false, error: "unknown_action" });
  } catch (error) {
    const mapped = knownError(error);
    return json(mapped.status, { ok: false, error: mapped.message });
  }
});
