import React, { useMemo, useState } from 'react';
import { Bot, Check, ChevronDown, ChevronUp, Copy, Loader2, RotateCcw, X } from 'lucide-react';
import { chatWithOllama } from '../services/ollama.js';

const STORAGE_EVENT = 'suly-ai-dev-applied';

function lineDiff(before, after) {
  const oldLines = before.split('\n');
  const newLines = after.split('\n');
  const max = Math.max(oldLines.length, newLines.length);
  const rows = [];
  for (let i = 0; i < max; i += 1) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];
    if (oldLine === newLine) rows.push({ type: 'same', value: oldLine ?? '' });
    else {
      if (oldLine !== undefined) rows.push({ type: 'remove', value: oldLine });
      if (newLine !== undefined) rows.push({ type: 'add', value: newLine });
    }
  }
  return rows;
}

function pathIsAllowed(path, projectFiles) {
  const normalized = path.replace(/^\.\//, '').replaceAll('\\', '/');
  return projectFiles.some((entry) => entry.replace(/^\.\//, '').replaceAll('\\', '/') === normalized) && normalized.startsWith('src/');
}

/** @param {{ projectFiles?: string[] }} props */
export default function AiDevConsole({ projectFiles = [] } = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [applied, setApplied] = useState(false);

  const diff = useMemo(() => result ? lineDiff(result.oldCode, result.new_code) : [], [result]);

  async function handleDevelop(event) {
    event.preventDefault();
    setError(''); setApplied(false); setResult(null);
    setIsLoading(true);
    try {
      const context = `الملفات المتاحة داخل src (يجب تعديل ملف واحد فقط):\n${projectFiles.join('\n')}`;
      const response = await chatWithOllama(prompt, context);
      if (!pathIsAllowed(response.file_to_edit, projectFiles)) {
        throw new Error('النموذج اختار ملفًا غير موجود داخل src أو غير مسموح بتعديله.');
      }
      const sourceKey = `suly-ai-source:${response.file_to_edit}`;
      const oldCode = localStorage.getItem(sourceKey) || '// لم يتم تحميل محتوى الملف الحالي من المتصفح بعد.\n// سيتم حفظ النسخة الجديدة محليًا للتطوير السريع.';
      setResult({ ...response, oldCode });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'تعذر تنفيذ طلب التطوير.');
    } finally {
      setIsLoading(false);
    }
  }

  function applyChange() {
    if (!result) return;
    const key = `suly-ai-file:${result.file_to_edit}`;
    const sourceKey = `suly-ai-source:${result.file_to_edit}`;
    localStorage.setItem(key, result.new_code);
    localStorage.setItem(sourceKey, result.new_code);
    localStorage.setItem('suly-ai-last-change', JSON.stringify({ file: result.file_to_edit, code: result.new_code, appliedAt: new Date().toISOString() }));
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { file: result.file_to_edit } }));
    setApplied(true);
  }

  async function copyCode() {
    if (!result) return;
    await navigator.clipboard?.writeText(result.new_code);
  }

  return (
    <aside className="fixed bottom-4 right-4 z-[9999] w-[min(440px,calc(100vw-2rem))] text-right" dir="rtl">
      {!isOpen ? (
        <button type="button" onClick={() => setIsOpen(true)} className="flex items-center gap-2 rounded-2xl border border-emerald-400/70 bg-slate-950/95 px-4 py-3 text-sm font-black text-emerald-300 shadow-2xl shadow-emerald-950/40 backdrop-blur transition hover:border-emerald-300 hover:bg-slate-900">
          <Bot className="h-5 w-5" /> طور بالذكاء الاصطناعي
        </button>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-emerald-400/70 bg-slate-950/98 shadow-2xl shadow-emerald-950/50 backdrop-blur">
          <header className="flex items-center justify-between border-b border-emerald-400/20 bg-emerald-950/30 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-black text-emerald-300"><Bot className="h-5 w-5" /> AI Dev Console</div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setIsOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="تصغير"><ChevronDown className="h-4 w-4" /></button>
            </div>
          </header>
          <div className="max-h-[70vh] overflow-y-auto p-4">
            <form onSubmit={handleDevelop} className="space-y-3">
              <label htmlFor="ai-dev-prompt" className="block text-xs font-bold text-slate-300">اكتب ما تريد تطويره</label>
              <textarea id="ai-dev-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="مثال: أضف زرًا لحفظ التقدم في صفحة الإعدادات..." rows={4} disabled={isLoading} className="w-full resize-y rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400" />
              <button type="submit" disabled={isLoading || !prompt.trim()} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-black text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50">
                {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> جارٍ التحليل...</> : <>طور 🚀</>}
              </button>
            </form>
            {error && <div role="alert" className="mt-3 rounded-xl border border-red-500/40 bg-red-950/40 px-3 py-2 text-xs leading-5 text-red-200">{error}</div>}
            {result && <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-emerald-400/20 bg-slate-900 p-3">
                <div className="mb-1 text-[11px] font-bold text-emerald-300">الملف المقترح</div>
                <code className="break-all text-xs text-white">{result.file_to_edit}</code>
                <p className="mt-2 text-xs leading-6 text-slate-300">{result.explanation}</p>
              </div>
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-300"><span>معاينة التغييرات</span><button type="button" onClick={copyCode} className="flex items-center gap-1 text-emerald-300 hover:text-emerald-200"><Copy className="h-3.5 w-3.5" /> نسخ الجديد</button></div>
              <pre className="max-h-64 overflow-auto rounded-xl border border-slate-800 bg-black/60 p-3 text-left text-[10px] leading-5" dir="ltr">{diff.map((row, index) => <div key={`${index}-${row.type}`} className={row.type === 'add' ? 'bg-emerald-500/15 text-emerald-300' : row.type === 'remove' ? 'bg-red-500/15 text-red-300' : 'text-slate-500'}><span className="mr-2 select-none">{row.type === 'add' ? '+' : row.type === 'remove' ? '-' : ' '}</span>{row.value}</div>)}</pre>
              <div className="flex gap-2">
                <button type="button" onClick={applyChange} disabled={applied} className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-black text-slate-950 hover:bg-emerald-300 disabled:opacity-60"><Check className="h-4 w-4" />{applied ? 'تم التطبيق' : 'تطبيق'}</button>
                <button type="button" onClick={() => { setResult(null); setApplied(false); }} className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-700 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800"><X className="h-4 w-4" /> إلغاء</button>
              </div>
              {applied && <div className="rounded-xl border border-emerald-400/30 bg-emerald-950/40 px-3 py-2 text-[11px] leading-5 text-emerald-200">حُفظ الكود في localStorage. أعد تشغيل بيئة التطوير أو اربط حدث <code>suly-ai-dev-applied</code> بالـ HMR لتطبيقه على الملفات.</div>}
            </div>}
          </div>
        </section>
      )}
    </aside>
  );
}
