import "jsr:@supabase/functions-js/edge-runtime.d.ts";

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const encoder = new TextEncoder();

type JsonRecord = Record<string, unknown>;

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

function json(status: number, body: JsonRecord): Response {
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

async function sha256Hex(value: string): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", toArrayBuffer(encoder.encode(value))));
  return [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function rpcBoolean(name: string, args: JsonRecord): Promise<boolean> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  if (!response.ok) throw new Error("signing_key_rpc_failed");
  const result: unknown = await response.json();
  return result === true || (Array.isArray(result) && result[0] === true);
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204 });
  if (request.method !== "POST") return json(405, { ok: false, error: "method_not_allowed" });
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return json(503, { ok: false, error: "service_unavailable" });

  let body: JsonRecord;
  try {
    const raw = await request.text();
    if (raw.length > 4096) return json(400, { ok: false, error: "invalid_request" });
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) return json(400, { ok: false, error: "invalid_request" });
    body = value as JsonRecord;
  } catch {
    return json(400, { ok: false, error: "invalid_json" });
  }

  if (Object.keys(body).length !== 1 || typeof body.setupToken !== "string" || !/^[0-9a-f]{64}$/.test(body.setupToken)) {
    return json(403, { ok: false, error: "bootstrap_rejected" });
  }

  try {
    const setupTokenHash = await sha256Hex(body.setupToken);
    const allowed = await rpcBoolean("admin_check_reward_key_bootstrap", { p_setup_token_hash: setupTokenHash });
    if (!allowed) return json(403, { ok: false, error: "bootstrap_rejected" });

    const keyPair = await crypto.subtle.generateKey(
      { name: "Ed25519" } as Algorithm,
      true,
      ["sign", "verify"],
    ) as CryptoKeyPair;
    const privateKey = new Uint8Array(await crypto.subtle.exportKey("pkcs8", keyPair.privateKey));
    const publicKey = new Uint8Array(await crypto.subtle.exportKey("spki", keyPair.publicKey));
    const publicKeySpkiB64 = base64(publicKey);
    const stored = await rpcBoolean("admin_store_reward_signing_key", {
      p_setup_token_hash: setupTokenHash,
      p_private_key_pkcs8_b64: base64(privateKey),
      p_public_key_spki_b64: publicKeySpkiB64,
    });
    if (!stored) return json(403, { ok: false, error: "bootstrap_rejected" });
    return json(201, { ok: true, publicKeySpkiB64 });
  } catch {
    return json(500, { ok: false, error: "key_initialization_failed" });
  }
});
