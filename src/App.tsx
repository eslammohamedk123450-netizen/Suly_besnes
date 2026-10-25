import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import GameApp from './GameApp';
import { playSound, isSoundEnabled, setSoundEnabled, toggleAmbientMusic, isMusicPlaying } from './game/soundEffects';
import { 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Music,
  X,
  Trophy,
  Crown,
  HelpCircle
} from 'lucide-react';

export default function App() {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());
  const [musicOn, setMusicOn] = useState(() => isMusicPlaying());

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let lastBack = 0;
    const backListener = CapApp.addListener('backButton', () => {
      if (isGuideOpen) {
        setIsGuideOpen(false);
        return;
      }
      const now = Date.now();
      if (now - lastBack < 2500) {
        void CapApp.exitApp();
      } else {
        lastBack = now;
      }
    });
    return () => {
      void backListener.then((handle) => handle.remove());
    };
  }, [isGuideOpen]);

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playSound('click');
  };

  const handleToggleMusic = () => {
    const next = toggleAmbientMusic();
    setMusicOn(next);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" dir="rtl">
      {/* Top Header - Pure Premium Game Interface */}
      <header className="bg-slate-900/95 border-b border-amber-500/30 px-3 sm:px-6 py-2.5 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
            <Crown className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black tracking-wide text-white">
                إمبراطورية الأعمال
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold hidden sm:inline-block">
                نسخة المحاكاة الاقتصادية
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden md:block">
              ابنِ شركاتك، تفاوض في البورصة والمزادات، وحقق المركز الأول عالمياً
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Sound FX Toggle */}
          <button
            onClick={handleToggleSound}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-all ${
              soundOn
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-800'
            }`}
            title={soundOn ? 'كتم المؤثرات الصوتية' : 'تشغيل المؤثرات الصوتية'}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            <span className="hidden sm:inline text-[11px] font-semibold">{soundOn ? 'المؤثرات' : 'صامت'}</span>
          </button>

          {/* Ambient Music Toggle */}
          <button
            onClick={handleToggleMusic}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-all ${
              musicOn 
                ? 'bg-purple-950/60 border-purple-500/50 text-purple-200 shadow-sm shadow-purple-500/20' 
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title={musicOn ? 'إيقاف موسيقى الخلفية' : 'تشغيل الموسيقى التصويرية الهادئة'}
          >
            <Music className={`w-4 h-4 ${musicOn ? 'text-purple-400 animate-pulse' : 'text-slate-500'}`} />
            <span className="hidden sm:inline text-[11px] font-semibold">{musicOn ? 'موسيقى ♫' : 'موسيقى'}</span>
          </button>

          {/* Game Guide / Info Button */}
          <button
            onClick={() => setIsGuideOpen(true)}
            className="px-2.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            title="دليل الإمبراطورية وقواعد النجاح"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline text-[11px] font-bold">دليل اللعبة</span>
          </button>
        </div>
      </header>

      {/* Main Game App Container */}
      <main className="flex-1">
        <GameApp />
      </main>

      {/* Empire Guide Modal */}
      {isGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in" dir="rtl">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-lg p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>دليل وقواعد إمبراطورية الأعمال</span>
              </div>
              <button
                onClick={() => setIsGuideOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed max-h-[65vh] overflow-y-auto pr-1">
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-amber-500/20">
                <h4 className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
                  <span>🏢</span> 1. مسار الفصول والنمو المتدرج:
                </h4>
                <p className="text-[11px] text-slate-300 mt-1.5">
                  تبدأ اللعبة في <strong>الفصل الأول (خطة الإنقاذ)</strong> بمواجهة أول أزمة تشغيلية للمصنع المتعثر، وبمجرد سداد قسط البنك وصيانة الماكينات وتصدير أول شحنة، تنتقل فوراً إلى <strong>الفصل الثاني (التوسع الإمبراطوري)</strong> لشراء الأراضي والموانئ وتأسيس التكتلات.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <h4 className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
                  <span>🌍</span> 2. دعم جميع الدول والعملات:
                </h4>
                <p className="text-[11px] text-slate-300 mt-1.5">
                  يمكنك اختيار أي دولة من الدول التسع المدعومة (السعودية، الإمارات، قطر، الكويت، أمريكا، بريطانيا، ألمانيا، اليابان، ومصر). جميع أسعار الكتالوج والأراضي والمخزون يتم احتسابها بدقة وفق سعر صرف العملة المحلية.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <h4 className="font-bold text-blue-400 text-sm flex items-center gap-1.5">
                  <span>📊</span> 3. دورة الإنتاج والسوق الحر:
                </h4>
                <p className="text-[11px] text-slate-300 mt-1.5">
                  المصانع تتطلب مواد خام وطاقة لتشغيل دفعات الإنتاج. يتم تسعير المنتجات في السوق بناءً على حجم الطلب اليومي ومستوى جودة الإنتاج وسجل سمعتك التجارية.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <h4 className="font-bold text-yellow-400 text-sm flex items-center gap-1.5">
                  <span>🥇</span> 4. المتصدرون والتنافس العالمي:
                </h4>
                <p className="text-[11px] text-slate-300 mt-1.5">
                  تُحتسب نقاط إمبراطوريتك من مجموع أصولك النقدية والذهبية، قيمة الأراضي والشركات، والمخزون التجاري. تنافس يومياً مع أعتى رجال الأعمال لتتصدر المنصة الذهبية.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsGuideOpen(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-950/40 transition-transform active:scale-95"
            >
              انطلق لبناء إمبراطوريتك الآن 👑
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
