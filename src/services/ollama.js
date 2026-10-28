import { supabase } from '../storage/supabaseClient';

const OLLAMA_FUNCTION = 'ollama-chat';
const REQUEST_TIMEOUT_MS = 120_000;
const SYSTEM_PROMPT = 'انت مطور خبير للعبة Suly Besnes مبنية ب React + Vite + Tailwind. مهمتك تحلل طلب المستخدم وترد بـ JSON فقط بالشكل: {"file_to_edit":"المسار النسبي للملف","explanation":"شرح عربي","new_code":"الكود الكامل الجديد للملف"}. متعدلش اكتر من ملف واحد في كل مرة.';

function parseAssistantJson(content) {
  const withoutFence = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try { return JSON.parse(withoutFence); } catch {
    const start = withoutFence.indexOf('{');
    const end = withoutFence.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try { return JSON.parse(withoutFence.slice(start, end + 1)); } catch { /* handled below */ }
    }
    throw new Error('رد Ollama ليس JSON صالحًا. اطلب من النموذج إرجاع JSON فقط.');
  }
}

function validateResult(result) {
  if (!result || typeof result !== 'object') throw new Error('رد Ollama فارغ أو غير صالح.');
  if (typeof result.file_to_edit !== 'string' || !result.file_to_edit.trim()) throw new Error('رد Ollama لا يحتوي على ملف صالح.');
  if (typeof result.explanation !== 'string' || typeof result.new_code !== 'string') throw new Error('رد Ollama ناقص.');
  return { file_to_edit: result.file_to_edit.trim().replace(/^\.\//, ''), explanation: result.explanation.trim(), new_code: result.new_code };
}

function mapError(message) {
  if (message.includes('ollama_not_configured')) return 'لم يتم إعداد مفتاح Ollama على الخادم بعد.';
  if (message.includes('ollama_timeout')) return 'انتهت مهلة المساعد. حاول مرة أخرى.';
  if (message.includes('401') || message.includes('403')) return 'مفتاح Ollama غير صالح أو غير مصرح به.';
  if (message.includes('429')) return 'تم تجاوز حد الطلبات. حاول مرة أخرى بعد قليل.';
  return message || 'تعذر الاتصال بالمساعد الذكي.';
}

export async function chatWithOllama(prompt, context = '') {
  if (typeof prompt !== 'string' || !prompt.trim()) throw new Error('اكتب أمر التطوير أولًا.');
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const request = supabase.functions.invoke(OLLAMA_FUNCTION, { body: { prompt: prompt.trim(), context } });
    const result = await Promise.race([
      request,
      new Promise((_, reject) => setTimeout(() => reject(new Error('ollama_timeout')), REQUEST_TIMEOUT_MS)),
    ]);
    const { data, error } = result;
    if (error) throw new Error(error.message || 'تعذر الوصول إلى بوابة Ollama.');
    if (!data?.content) throw new Error(data?.error || 'استقبلنا ردًا فارغًا من Ollama.');
    return validateResult(parseAssistantJson(data.content));
  } catch (error) {
    throw new Error(mapError(error instanceof Error ? error.message : 'حدث خطأ غير متوقع.'));
  } finally {
    window.clearTimeout(timeout);
    controller.abort();
  }
}

export { SYSTEM_PROMPT };
