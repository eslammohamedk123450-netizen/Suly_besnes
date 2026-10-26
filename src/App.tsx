import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import GameApp from './GameApp';
import { Sparkles, X } from 'lucide-react';

export default function App() {
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" dir="rtl">
      {/* Main Game App Container */}
      <main className="flex-1 w-full">
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
