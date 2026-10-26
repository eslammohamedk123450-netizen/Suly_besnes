import React from 'react';
import { ShieldCheck, X, Lock, Database, Trash2, Mail, ExternalLink } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" dir="rtl">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">سياسة الخصوصية وأمان البيانات</h3>
              <p className="text-xs text-slate-400">آخر تحديث: أكتوبر 2026 • متوافق مع متطلبات Google Play</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-300 leading-relaxed">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <h4 className="font-bold text-white flex items-center gap-2 mb-1.5">
              <Lock className="w-4 h-4 text-emerald-400" />
              التزامنا بحماية خصوصيتك
            </h4>
            <p>
              نحن في «إمبراطورية الأعمال (Business Empire)» نولي خصوصيتك وأمان بياناتك أهمية قصوى. لا نقوم ببيع أو تأجير أي بيانات شخصية لأي جهة خارجية، وتقتصر البيانات التي نجمعها على ما يلزم فقط لتشغيل وتطوير اللعبة وحفظ تقدمك.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" />
              1. البيانات التي نجمعها
            </h4>
            <ul className="list-disc list-inside space-y-1.5 pr-2 text-slate-300">
              <li><strong>بيانات اللعب:</strong> المستوى، النقود، الذهب، الشركات، والأراضي التابعة لك (لحفظ تقدمك محلياً وسحابياً).</li>
              <li><strong>بيانات الحساب:</strong> البريد الإلكتروني وكلمة المرور المشفرة في حال تسجيل حساب رسمي لمزامنة تقدمك السحابي.</li>
              <li><strong>معرّف الجهاز التقني:</strong> نستخدم معرّفات تشخيصية مجهولة الهوية لتحسين أداء اللعبة وإصلاح الأخطاء البرمجية.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-400" />
              2. حقك الكامل في حذف الحساب والبيانات
            </h4>
            <p>
              وفقاً لسياسات Google Play ومتطلبات الأمان العالمية، يمتلك كل لاعب الحق الكامل في حذف حسابه وكافة بياناته الشخصية من خوادمنا بشكل نهائي ولا رجعة فيه عبر زر «حذف الحساب نهائياً» الموجود في صفحة الملف الشخصي (Profile).
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-amber-400" />
              3. أمان المعاملات المالية والشحن
            </h4>
            <p>
              جميع المعاملات المتعلقة بشحن الماسات وباقات الدعم محكومة ومحمية بالكامل. لا نقوم بتخزين أي أرقام بطاقات ائتمانية أو بيانات بنكية على خوادمنا.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-purple-400" />
              4. التواصل معنا
            </h4>
            <p>
              إذا كان لديك أي استفسار أو طلب مساعدة بخصوص خصوصيتك أو استرجاع بياناتك، يمكنك مراسلة الدعم الفني عبر البريد الإلكتروني:
              <br />
              <code className="text-indigo-300 select-all font-mono text-xs">support@suly-business.com</code>
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition"
          >
            فهمت وموافق
          </button>
        </div>
      </div>
    </div>
  );
};
