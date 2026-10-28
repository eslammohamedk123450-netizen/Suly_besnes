const OLLAMA_PROXY_ENDPOINT = '/api/ollama/chat';
const OLLAMA_MODEL = 'qwen2.5-coder:7b';
const REQUEST_TIMEOUT_MS = 120_000;

const SYSTEM_PROMPT = `انت مطور خبير للعبة Suly Besnes مبنية ب React + Vite + Tailwind. مهمتك تحلل طلب المستخدم وترد بـ JSON فقط بالشكل: {"file_to_edit": "المسار النسبي للملف", "explanation": "شرح عربي", "new_code": "الكود الكامل الجديد للملف"}. متعدلش اكتر من ملف واحد في كل مرة.`;

function getErrorMessage(status, payload) {
  if (status === 401 || status === 403) {
    return 'مفتاح Ollama غير صالح أو غير مصرح به. تحقق من إعداد OLLAMA_API_KEY في الخادم.';
  }
  if (status === 404) {
    return 'نقطة Ollama غير متاحة. تأكد من تشغيل proxy التطوير أو خادم API.';
  }
  if (status === 429) {
    return 'تم تجاوز حد الطلبات في Ollama. حاول مرة أخرى بعد قليل.';
  }
  if (payload?.error && typeof payload.error === 'string') return payload.error;
  return `فشل طلب Ollama (HTTP ${status}).`;
}

function parseAssistantJson(content) {
  const withoutFence = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    return JSON.parse(withoutFence);
  } catch {
    const start = withoutFence.indexOf('{');
    const end = withoutFence.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(withoutFence.slice(start, end + 1));
      } catch {
        // Fall through to the useful validation error below.
      }
    }
    throw new Error('رد Ollama ليس JSON صالحًا. اطلب من النموذج إرجاع JSON فقط.');
  }
}

function validateResult(result) {
  if (!result || typeof result !== 'object') throw new Error('رد Ollama فارغ أو غير صالح.');
  if (typeof result.file_to_edit !== 'string' || !result.file_to_edit.trim()) {
    throw new Error('رد Ollama لا يحتوي على file_to_edit صالح.');
  }
  if (typeof result.explanation !== 'string') throw new Error('رد Ollama لا يحتوي على explanation صالح.');
  if (typeof result.new_code !== 'string') throw new Error('رد Ollama لا يحتوي على new_code صالح.');
  return {
    file_to_edit: result.file_to_edit.trim().replace(/^\.\//, ''),
    explanation: result.explanation.trim(),
    new_code: result.new_code,
  };
}

/**
 * Ask the AI development assistant for a complete replacement of one file.
 * The browser calls the same-origin Vite/API proxy, never Ollama directly.
 * This keeps the secret out of the public bundle and avoids Ollama CORS limits.
 */
export async function chatWithOllama(prompt, context = '') {
  if (typeof prompt !== 'string' || !prompt.trim()) {
    throw new Error('اكتب أمر التطوير أولًا.');
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(OLLAMA_PROXY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        format: 'json',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `طلب المستخدم:\n${prompt.trim()}\n\nسياق المشروع:\n${context || 'لا يوجد سياق إضافي.'}` },
        ],
      }),
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(getErrorMessage(response.status, payload));

    const content = payload?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
      throw new Error('استقبلنا ردًا فارغًا من Ollama.');
    }
    return validateResult(parseAssistantJson(content));
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('انتهت مهلة طلب Ollama. حاول مرة أخرى.');
    if (error instanceof TypeError) throw new Error('تعذر الاتصال بخدمة Ollama. تحقق من الخادم والاتصال.');
    throw error instanceof Error ? error : new Error('حدث خطأ غير متوقع أثناء الاتصال بـ Ollama.');
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export { OLLAMA_MODEL, SYSTEM_PROMPT };
