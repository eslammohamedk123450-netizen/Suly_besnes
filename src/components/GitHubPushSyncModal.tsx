import React, { useState } from 'react';
import { 
  FolderGit2, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Lock, 
  X, 
  Key, 
  RefreshCw,
  GitCommit,
  ShieldCheck
} from 'lucide-react';

interface GitHubPushSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPushToGitHub: (token: string) => Promise<{ success: boolean; message: string }>;
  isPushing: boolean;
}

export const GitHubPushSyncModal: React.FC<GitHubPushSyncModalProps> = ({
  isOpen,
  onClose,
  onPushToGitHub,
  isPushing,
}) => {
  const [token, setToken] = useState(() => localStorage.getItem('suly-github-write-token') || '');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handlePush = async () => {
    if (!token.trim()) {
      setStatusMsg({
        type: 'error',
        text: 'يرجى إدخال رمز GitHub Personal Access Token بصلاحية كتابة repo للدفع.',
      });
      return;
    }

    setStatusMsg(null);
    localStorage.setItem('suly-github-write-token', token.trim());
    const res = await onPushToGitHub(token.trim());
    if (res.success) {
      setStatusMsg({
        type: 'success',
        text: res.message || 'تم رفع جميع التعديلات والكود الجديد وقصة الكفاح بنجاح إلى مستودع GitHub!',
      });
    } else {
      setStatusMsg({
        type: 'error',
        text: res.message || 'فشل الرفع إلى GitHub. تأكد من صحة الرمز وصلاحيات الكتابة للمستودع.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in" dir="rtl">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                تصدير ومزامنة الكود إلى GitHub مباشرة
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                eslammohamedk123450-netizen/Suly_besnes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-emerald-400">
              <GitCommit className="w-4 h-4" />
              <span>التعديلات الجاهزة للتصدير إلى GitHub:</span>
            </div>
            <ul className="space-y-1.5 text-slate-300 pr-4 list-disc text-[11px] leading-relaxed">
              <li>إضافة سيناريو «قصة كفاح: إنقاذ المصنع المنهار» والبدء بمصنع العاشر من رمضان.</li>
              <li>إضافة حوارات وتوجيهات «عم إبراهيم» والمحاسب فتحي والمنافس طارق الألفي.</li>
              <li>مهام النجاة الخمس وسداد قسط البنك الأهلي قبل مهلة اليوم السابع.</li>
              <li>محاكي المؤثرات الصوتية للألعاب Web Audio API التفاعلي.</li>
              <li>نصائح المستشار الاقتصادي ووسوم القطاعات الموصى بها للمبتدئين.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-400" />
                رمز وصول GitHub (Personal Access Token)
              </label>
              <a
                href="https://github.com/settings/tokens/new?scopes=repo&description=Suly+Game+Push"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 underline"
              >
                إنشاء رمز جديد بصلاحية repo
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[10px] text-slate-400">
              يتطلب الرمز صلاحية <code className="bg-slate-800 text-emerald-300 px-1 py-0.5 rounded">repo</code> ليتمكن من دفع التعديلات (git push) إلى فرع main في مستودعك.
            </p>
          </div>

          {/* Quick Alternative: Direct ZIP Download */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-indigo-500/30 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-white block">تحميل الحزمة الكاملة (ZIP) 📦</span>
              <span className="text-[10px] text-slate-400">حزمة كاملة جاهزة بجميع الملفات والتعديلات (6.6 MB)</span>
            </div>
            <a
              href="/suly_besnes_update.zip"
              download="suly_besnes_update.zip"
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition"
            >
              <span>تحميل ZIP</span>
            </a>
          </div>

          {statusMsg && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <a
            href="https://github.com/eslammohamedk123450-netizen/Suly_besnes"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
          >
            فتح المستودع على GitHub
            <ExternalLink className="w-3 h-3" />
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handlePush}
              disabled={isPushing}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/40"
            >
              {isPushing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  جاري الرفع إلى GitHub...
                </>
              ) : (
                <>
                  <UploadCloud className="w-3.5 h-3.5" />
                  دفع التعديلات الآن (Push)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
