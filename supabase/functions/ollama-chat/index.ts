import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const apiKey = Deno.env.get("OLLAMA_API_KEY");
  if (!apiKey) return json({ error: "ollama_not_configured", message: "لم يتم إعداد مفتاح Ollama على الخادم." }, 503);

  let input: { prompt?: unknown; context?: unknown };
  try {
    input = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const prompt = typeof input.prompt === "string" ? input.prompt.trim() : "";
  const context = typeof input.context === "string" ? input.context.slice(0, 30_000) : "";
  if (!prompt || prompt.length > 4_000) return json({ error: "invalid_prompt" }, 400);

  const base = (Deno.env.get("OLLAMA_API_BASE") ?? "https://ollama.com").replace(/\/$/, "");
  const model = Deno.env.get("OLLAMA_MODEL") ?? "glm-5.3-flash";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000);

  try {
    const upstream = await fetch(`${base}/api/chat`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        stream: false,
        format: "json",
        messages: [
          {
            role: "system",
            content: "أنت مطور خبير للعبة Suly Besnes المبنية ب React وVite وTailwind. أرجع JSON فقط بهذا الشكل: {\"file_to_edit\":\"مسار ملف واحد داخل src\",\"explanation\":\"شرح عربي\",\"new_code\":\"الكود الكامل الجديد\"}. لا تعدل أكثر من ملف واحد.",
          },
          { role: "user", content: `طلب المستخدم:\n${prompt}\n\nسياق المشروع:\n${context || "لا يوجد سياق إضافي."}` },
        ],
      }),
      signal: controller.signal,
    });
    const payload = await upstream.json().catch(() => ({}));
    if (!upstream.ok) return json({ error: payload?.error ?? "ollama_request_failed" }, upstream.status === 429 ? 429 : 502);
    const content = payload?.message?.content;
    if (typeof content !== "string" || !content.trim()) return json({ error: "empty_ollama_response" }, 502);
    return json({ content });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") return json({ error: "ollama_timeout" }, 504);
    return json({ error: "ollama_unreachable" }, 502);
  } finally {
    clearTimeout(timeout);
  }
});
