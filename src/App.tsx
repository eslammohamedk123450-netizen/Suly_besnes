import React, { useState } from 'react';
import GameApp from './GameApp';
import { GitHubPushSyncModal } from './components/GitHubPushSyncModal';
import { playSound, isSoundEnabled, setSoundEnabled } from './game/soundEffects';
import { 
  UploadCloud, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  FolderGit2, 
  ExternalLink,
  Info,
  X
} from 'lucide-react';

export default function App() {
  const [isPushModalOpen, setIsPushModalOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playSound('click');
  };

  const handlePushToGitHub = async (token: string): Promise<{ success: boolean; message: string }> => {
    setIsPushing(true);
    try {
      const res = await fetch('/api/github-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, message: `خطأ اتصال: ${msg}` };
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" dir="rtl">
      {/* Top Enhancement & GitHub Sync Bar */}
      <header className="bg-slate-900/90 border-b border-emerald-500/30 px-3 sm:px-6 py-2.5 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between gap-2 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏭</span>
            <div>
              <span className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5">
                إمبراطورية الأعمال: <span className="text-emerald-400">قصة كفاح</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 hidden sm:inline-block">
                  إنقاذ المصنع المنهار
                </span>
              </span>
              <p className="text-[10px] text-slate-400 hidden md:block">
                مصنع العاشر من رمضان · ديون البنك · توجيه عم إبراهيم · التوسع التدريجي
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio toggle button */}
          <button
            onClick={handleToggleSound}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-1.5 transition-colors"
            title={soundOn ? 'كتم الصوت' : 'تشغيل المؤثرات الصوتية'}
          >
            {soundOn ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            <span className="hidden sm:inline text-[11px]">{soundOn ? 'الصوت مفعّل' : 'مكتوم'}</span>
          </button>

          {/* Changelog info button */}
          <button
            onClick={() => setIsChangelogOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">التعديلات المنفذة</span>
          </button>

          {/* GitHub Push button */}
          <button
            onClick={() => setIsPushModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-transform active:scale-95"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>تصدير إلى GitHub</span>
          </button>
        </div>
      </header>

      {/* Main Game App Container */}
      <div className="flex-1">
        <GameApp />
      </div>

      {/* GitHub Push Modal */}
      <GitHubPushSyncModal
        isOpen={isPushModalOpen}
        onClose={() => setIsPushModalOpen(false)}
        onPushToGitHub={handlePushToGitHub}
        isPushing={isPushing}
      />

      {/* Changelog Modal */}
      {isChangelogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" dir="rtl">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>التعديلات المنفذة بناءً على سيناريو قصة الكفاح</span>
              </div>
              <button
                onClick={() => setIsChangelogOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed max-h-96 overflow-y-auto pr-1">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-emerald-400">1. سيناريو الشركة المنهارة (البداية من الأزمة):</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  تبدأ اللعبة واللاعب يملك مصنع العاشر من رمضان للأغذية المنهار بماكينات معطلة (كفاءة 25%)، رصيد طوارئ 120,000 ج.م فقط، وقسط بنكي مستحق خلال 7 أيام!
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-emerald-400">2. خطة الطوارئ الإرشادية (Struggle Hub):</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  أزرار وإرشادات فورية: صيانة الماكينات (+85%)، شراء خامات الطوارئ، تشغيل الإنتاج، بيع أول شحنة، وسداد قسط البنك لرفع الحجز.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-emerald-400">3. شخصيات الحكاية التفاعلية:</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  «عم إبراهيم» كبير الفنيين يوجهك بخبرته، المحاسب فتحي يحسب السيولة، وطارق الألفي المنافس الشامت الذي يتحداك.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-emerald-400">4. المؤثرات الصوتية التوليدية (Web Audio SFX):</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  أصوات رنين النقود (Cash Chime)، صوت مطرقة المزاد، صافرة المصنع، ونغمة النصر وسداد القرض.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-emerald-400">5. زر تصدير الكود إلى GitHub (Push):</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  إمكانية دفع كامل التعديلات والملفات إلى مستودع <code className="text-white">eslammohamedk123450-netizen/Suly_besnes</code> مباشرة عبر الـ Token.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsChangelogOpen(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
            >
              فهمت، متابعة اللعب الآن 🎮
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
