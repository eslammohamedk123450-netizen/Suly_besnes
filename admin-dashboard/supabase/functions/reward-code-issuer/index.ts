import "jsr:@supabase/functions-js/edge-runtime.d.ts";

declare const Deno: { env: { get(name: string): string | undefined }; serve(handler: (request: Request) => Response | Promise<Response>): void };

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const encoder = new TextEncoder();
const TRUSTED_PUBLIC_KEYS = new Set([
  "MCowBQYDK2VwAyEA84UjrthL2DPvb0nU4FJv519tEWgUpuHEBhP4gdmrAiY=",
  "MCowBQYDK2VwAyEAE8KYanYlY/M5eQuNNuKP/EMerujT9v9IaC374LZtBCs=",
]);
type JsonRecord = Record<string, unknown>;

function json(status: number, body: JsonRecord) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
}
function toArrayBuffer(bytes: Uint8Array): ArrayBuffer { const buffer = new ArrayBuffer(bytes.byteLength); new Uint8Array(buffer).set(bytes); return buffer; }
function base64(bytes: Uint8Array): string { let binary = ""; for (const byte of bytes) binary += String.fromCharCode(byte); return btoa(binary); }
function base64url(bytes: Uint8Array): string { return base64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, ""); }
function fromBase64(value: string): Uint8Array { const binary = atob(value); return Uint8Array.from(binary, (character) => character.charCodeAt(0)); }
function uuid(value: unknown): value is string { return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value); }
async function sha256Hex(value: string): Promise<string> { const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", toArrayBuffer(encoder.encode(value)))); return [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join(""); }
async function rpc<T = unknown>(name: string, args: JsonRecord): Promise<T> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, { method: "POST", headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify(args) });
  const raw = await response.text();
  let parsed: unknown = null; try { parsed = raw ? JSON.parse(raw) : null; } catch { parsed = null; }
  if (!response.ok) throw new Error(parsed && typeof parsed === "object" && "message" in parsed ? String((parsed as { message: unknown }).message) : "service_unavailable");
  return parsed as T;
}
async function requireAdmin(request: Request): Promise<string | null> {
  const match = /^Bearer\s+([A-Za-z0-9_-]{32,128})$/i.exec(request.headers.get("authorization") ?? "");
  if (!match) return null;
  const result = await rpc<unknown>("admin_validate_session", { p_token_hash: await sha256Hex(match[1]) });
  if (typeof result === "string") return result;
  if (Array.isArray(result) && typeof result[0] === "string") return result[0];
  return null;
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204 });
  if (request.method !== "POST") return json(405, { ok: false, error: "method_not_allowed" });
  const adminEmail = await requireAdmin(request);
  if (!adminEmail) return json(401, { ok: false, error: "انتهت الجلسة. سجّل الدخول مجددًا." });
  let body: JsonRecord;
  try { const value = await request.json(); if (!value || typeof value !== "object" || Array.isArray(value)) return json(400, { ok: false, error: "invalid_request" }); body = value as JsonRecord; } catch { return json(400, { ok: false, error: "invalid_json" }); }
  const cash = typeof body.cash === "number" && Number.isSafeInteger(body.cash) ? body.cash : Number.NaN;
  const gold = typeof body.gold === "number" && Number.isFinite(body.gold) ? body.gold : Number.NaN;
  const expiresAt = typeof body.expiresAt === "string" ? new Date(body.expiresAt) : null;
  if (!uuid(body.requestId) || !expiresAt || !Number.isFinite(expiresAt.getTime()) || expiresAt.getTime() <= Date.now() || !Number.isSafeInteger(cash) || cash < 0 || cash > 1_000_000 || !Number.isFinite(gold) || gold < 0 || gold > 1_000_000 || (cash === 0 && gold === 0)) return json(400, { ok: false, error: "بيانات الكود غير صالحة أو انتهت مدة الصلاحية." });
  try {
    const rows = await rpc<unknown>("admin_get_active_reward_signing_key", {});
    const key = Array.isArray(rows) && rows[0] && typeof rows[0] === "object" ? rows[0] as JsonRecord : null;
    const privateKey = key && typeof key.private_key_pkcs8_b64 === "string" ? key.private_key_pkcs8_b64 : null;
    const publicKey = key && typeof key.public_key_spki_b64 === "string" ? key.public_key_spki_b64 : null;
    if (!privateKey || !publicKey || !TRUSTED_PUBLIC_KEYS.has(publicKey)) return json(503, { ok: false, error: "خدمة التوقيع غير متاحة." });
    const codeId = crypto.randomUUID();
    const payload = { version: 1, codeId, issuedAt: new Date().toISOString(), expiresAt: expiresAt.toISOString(), rewards: [...(cash > 0 ? [{ type: "cash", amount: cash }] : []), ...(gold > 0 ? [{ type: "gold", grams: gold }] : [])] };
    const encodedPayload = base64url(encoder.encode(JSON.stringify(payload)));
    const signingKey = await crypto.subtle.importKey("pkcs8", toArrayBuffer(fromBase64(privateKey)), { name: "Ed25519" }, false, ["sign"]);
    const signature = new Uint8Array(await crypto.subtle.sign({ name: "Ed25519" }, signingKey, toArrayBuffer(encoder.encode(encodedPayload))));
    const code = `SULY1.${encodedPayload}.${base64url(signature)}`;
    const recorded = await rpc<unknown>("admin_record_reward_code_issue", { p_request_id: body.requestId, p_code_id: codeId, p_code_text: code, p_cash_amount: cash, p_gold_grams: gold, p_expires_at: expiresAt.toISOString(), p_admin_email: adminEmail });
    const row = Array.isArray(recorded) ? recorded[0] : recorded;
    if (!row || typeof row !== "object" || typeof (row as JsonRecord).code_text !== "string") return json(503, { ok: false, error: "تعذر حفظ الكود." });
    return json(200, { ok: true, code: (row as JsonRecord).code_text, reused: (row as JsonRecord).reused === true, expiresAt: expiresAt.toISOString() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("reward_code_issue_conflict")) return json(409, { ok: false, error: "تعارض طلب إصدار الكود؛ لا تعِد الإرسال بنفس الطلب." });
    return json(503, { ok: false, error: "تعذر إصدار الكود مؤقتًا." });
  }
});
