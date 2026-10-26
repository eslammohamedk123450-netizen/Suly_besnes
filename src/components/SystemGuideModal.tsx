import { useRef } from 'react';
import type { SectionId } from '../domain/navigation';
import { getSystemGuide } from '../game/onboarding';
import { Icon } from './Icon';
import { useDialogA11y } from './useDialogA11y';

interface SystemGuideModalProps {
  section: SectionId;
  onClose: () => void;
}

export function SystemGuideModal({ section, onClose }: SystemGuideModalProps) {
  const guide = getSystemGuide(section);
  const dialogRef = useRef<HTMLElement | null>(null);
  useDialogA11y(dialogRef, onClose);

  return (
    <div className="guide-backdrop" role="presentation" onClick={onClose}>
      <section
        ref={dialogRef}
        className="system-guide max-w-2xl w-full max-h-[88vh] overflow-y-auto text-right"
        role="dialog"
        aria-modal="true"
        aria-labelledby="system-guide-title"
        tabIndex={-1}
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="system-guide-icon">
              <Icon name="target" size={24} />
            </div>
            <div>
              <span className="section-kicker block">دليل النظام التشغيلي</span>
              <h2 id="system-guide-title" className="text-lg font-black text-white m-0">
                {guide.title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 cursor-pointer"
          >
            إغلاق ✕
          </button>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3">{guide.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs mb-3">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <strong className="text-amber-300 block mb-1">1. وظيفة القسم</strong>
            <p className="text-slate-200 leading-relaxed m-0">{guide.functionSummary}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <strong className="text-emerald-400 block mb-1">2. الفائدة الاقتصادية</strong>
            <p className="text-slate-200 leading-relaxed m-0">{guide.economicBenefit}</p>
          </div>
        </div>

        <div className="mb-3">
          <strong className="text-xs text-cyan-300 block mb-1.5">3. كيفية الاستخدام خطوة بخطوة:</strong>
          <div className="system-guide-steps">
            {guide.steps.map((step, index) => (
              <div className="system-guide-step" key={step}>
                <span>{index + 1}</span>
                <strong>{step}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs mb-3">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <strong className="text-sky-300 block mb-1">4. أهم الأزرار والمؤشرات</strong>
            <ul className="space-y-1 text-slate-200 m-0 p-0 list-none">
              {guide.keyControls.map((ctrl) => (
                <li key={ctrl}>• {ctrl}</li>
              ))}
            </ul>
          </div>
          <div className="p-3 rounded-xl bg-rose-950/25 border border-rose-500/25">
            <strong className="text-rose-300 block mb-1">5. المخاطر التي يجب الانتباه لها</strong>
            <p className="text-rose-100/90 leading-relaxed m-0">{guide.risksToWatch}</p>
          </div>
        </div>

        <div className="space-y-2 text-xs mb-4">
          <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800">
            <strong className="text-indigo-300">6. علاقته بالأقسام الأخرى: </strong>
            <span className="text-slate-200">{guide.relatedSystems}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-950/25 border border-amber-500/25">
            <strong className="text-amber-300">7. نصيحة عملية: </strong>
            <span className="text-amber-100">{guide.practicalTip}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-950/25 border border-emerald-500/25">
            <strong className="text-emerald-300">8. الخطوة التالية المقترحة: </strong>
            <span className="text-emerald-100">{guide.suggestedNextStep}</span>
          </div>
        </div>

        <button className="button button-primary w-full justify-center" type="button" onClick={onClose}>
          فهمت الشرح، ابدأ العمل <Icon name="arrow" size={17} />
        </button>
      </section>
    </div>
  );
}
