import { useState } from 'react';
import type { PlayerProfile } from '../domain/player';
import { findCountry } from '../domain/countries';
import { formatMoney, formatNumber } from '../domain/formatters';
import { Icon } from './Icon';

interface StoryIntroProps {
  profile: PlayerProfile;
  onComplete: () => void;
}

export function StoryIntro({ profile, onComplete }: StoryIntroProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const country = findCountry(profile.countryId) ?? findCountry('egypt')!;

  const steps = [
    {
      id: 'catastrophe',
      badge: 'القصة والبداية · الفصل الأول',
      title: 'صدمة الانهيار ووصية الأم',
      icon: 'crown' as const,
    },
    {
      id: 'financial_clarity',
      badge: 'إزالة الغموض المالي · شفافية كاملة',
      title: 'حقيقة الوضع المالي (لماذا البنك مقفل؟ والديون؟)',
      icon: 'bank' as const,
    },
    {
      id: 'roadmap',
      badge: 'خطة المستويات · سيناريو الفتح',
      title: 'خريطة الصعود ومستويات فك الحظر',
      icon: 'tasks' as const,
    },
    {
      id: 'controls',
      badge: 'دليل التحكم والواجهة · كيف تلعب؟',
      title: 'أسرار واجهة القيادة والتحكم اليومي',
      icon: 'target' as const,
    },
    {
      id: 'first_action',
      badge: 'المهمة التنفيذية الأولى · الانطلاق',
      title: 'خطة الإنقاذ المباشرة للبدء الآن',
      icon: 'factory' as const,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-3 sm:p-6" dir="rtl">
      <div className="w-full max-w-3xl bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl flex flex-col">
        {/* Top Header with Progress */}
        <header className="p-4 sm:p-6 border-b border-slate-800/80 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Icon name={steps[currentStep].icon} size={22} />
            </div>
            <div>
              <span className="text-xs text-amber-400 font-semibold tracking-wide block">
                {steps[currentStep].badge}
              </span>
              <h1 className="text-lg sm:text-xl font-black text-white">
                {steps[currentStep].title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-700/60 text-xs">
            <span className="text-slate-400">خطوة</span>
            <span className="font-extrabold text-amber-400">{currentStep + 1}</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">{steps.length}</span>
          </div>
        </header>

        {/* Step Progress Pills */}
        <nav aria-label="خطوات التوجيه" className="flex items-center gap-1.5 px-4 sm:px-6 pt-4">
          {steps.map((step, idx) => (
            <button
              key={step.id}
              type="button"
              onClick={() => setCurrentStep(idx)}
              className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? 'bg-amber-400 shadow-md shadow-amber-500/50 scale-y-125'
                  : idx < currentStep
                  ? 'bg-emerald-500/80'
                  : 'bg-slate-800'
              }`}
              title={step.title}
              aria-label={step.title}
            />
          ))}
        </nav>

        {/* Step Content */}
        <section className="p-5 sm:p-8 flex-1 overflow-y-auto max-h-[68vh]">
          {/* STEP 1: The Story & Matriarch */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-lg bg-gradient-to-t from-slate-950 via-slate-900 to-transparent">
                <div className="p-5 sm:p-6 relative z-10 flex flex-col md:flex-row gap-5 items-center">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-amber-400/50 shadow-xl flex-shrink-0 bg-slate-800">
                    <img
                      src="/images/family-patriarch-intro.png"
                      alt="الأم الحنونة"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>

                  <div className="text-right flex-1">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 mb-2">
                      <span>رسالة الأم السرية · {country.flag} {country.name}</span>
                    </div>
                    <blockquote className="text-slate-200 text-sm sm:text-base leading-relaxed italic border-r-2 border-amber-500 pr-3 my-2">
                      “يا بني العزيز {profile.name}… لقد أعلن مجلس العائلة والدائنون إفلاس المجموعة، وجرّدوك من مناصبك بعد أن انهارت الشركات الكبرى فجأة. لكنني أعلم في أعماقي أنك العقل الاقتصادي القادر على صنع المعجزات!
                      تسللت إليك سراً وسلّمتك مدخراتي الخاصة البالغة <strong>{formatMoney(country.startingBalance, country)}</strong> كاش في يدك… انطلق واستعد هيبة العائلة وابنِ إمبراطورية أسطورية يركع لها الجميع!”
                    </blockquote>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800/80 text-right">
                  <span className="text-xs text-slate-400 block mb-1">السيولة النقدية الحرة</span>
                  <strong className="text-lg text-emerald-400 font-black">{formatMoney(country.startingBalance, country)}</strong>
                  <p className="text-[11px] text-slate-400 mt-1">كاش حر بخزينة المصنع الموروث للبدء بالتشغيل</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800/80 text-right">
                  <span className="text-xs text-slate-400 block mb-1">الأصل المتبقي الوحيد</span>
                  <strong className="text-lg text-amber-400 font-black">مصنع وموقع صناعي</strong>
                  <p className="text-[11px] text-slate-400 mt-1">أرض ومصنع متعثر (25% كفاءة) يحتاج صيانة عاجلة</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800/80 text-right">
                  <span className="text-xs text-slate-400 block mb-1">الهدف الأساسي</span>
                  <strong className="text-lg text-cyan-400 font-black">إعادة التشغيل والنمو</strong>
                  <p className="text-[11px] text-slate-400 mt-1">الصيانة، شراء المواد الخام، وبدء أول خط إنتاج</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Financial Clarification - Bank & Debts & Salaries */}
          {currentStep === 1 && (
            <div className="space-y-5 text-right">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm leading-relaxed">
                <strong className="text-amber-400 block mb-1 font-bold text-base">
                  ⚖️ لماذا البنك مقفل؟ وماذا عن الرواتب والأقساط؟
                </strong>
                هذا التوضيح يجيب بدقة عن كل استفسار حول سيناريو القصة والوضع المالي الفعلي لمجموعتك:
              </div>

              <div className="space-y-3">
                {/* Bank Lock Explanation */}
                <article className="p-4 rounded-2xl bg-slate-850 border border-slate-800 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 text-2xl flex-shrink-0">
                    🔒
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <strong className="text-white text-base">1. لماذا البنك مقفل؟ (يفتح في مستوى 4)</strong>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/40">
                        تجميد ائتماني
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                      بسبب انهيار المجموعة السابقة، فرضت البنوك المركزية والدائنون <strong>تجميداً ائتمانياً صارماً</strong> على حساباتك وتسهيلاتك البنكية. البنوك ترفض إقراضك أو فتح ودائع جديدة حتى تثبت قدرتك على تشغيل مصانعك وإبرام عقود تجارية ناجحة لبلوغ <strong>المستوى 4</strong>، حينها فقط يُرفع الحظر المصرفي رسمياً!
                    </p>
                  </div>
                </article>

                {/* Legacy Loan & Grace Period */}
                <article className="p-4 rounded-2xl bg-slate-850 border border-slate-800 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-2xl flex-shrink-0">
                    ⏳
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <strong className="text-white text-base">2. كيف أسدد قسط القرض القديم والبنك مقفل؟</strong>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/40">
                        مهلة سماح 7 أيام
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                      القرض الموروث البالغ <strong>5,250 $</strong> مشمول بـ <strong>حماية قضائية وفترة سماح تمتد لـ 7 أيام كاملة</strong>! لست مطالباً بسداده فوراً، بل سيُسدد تلقائياً عند حلول اليوم 7 من أرباحك، كما يمكنك في أي وقت استعراضه وسداده طوعياً من قسم <strong>"الالتزامات"</strong> المتاح لك دائماً.
                    </p>
                  </div>
                </article>

                {/* Salaries Clarification */}
                <article className="p-4 rounded-2xl bg-slate-850 border border-slate-800 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-2xl flex-shrink-0">
                    👥
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <strong className="text-white text-base">3. ما موقف دفع الرواتب للموظفين؟</strong>
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-black border border-cyan-500/40">
                        0 $ حالياً
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                      أثناء تصفية الإمبراطورية القديمة تم تسريح جميع العمال والموظفين السابقين، ومصنعك المتبقي يعمل بالتشغيل الذاتي. لذلك <strong>لا توجد أي رواتب مطلوبة منك في البداية</strong>! لن تتحمل أي رواتب حتى تقرر بنفسك توظيف مدراء وخبراء عندما تفتح إدارة الموظفين في <strong>المستوى 5</strong>.
                    </p>
                  </div>
                </article>
              </div>
            </div>
          )}

          {/* STEP 3: Progression Roadmap & Level Locks */}
          {currentStep === 2 && (
            <div className="space-y-4 text-right">
              <p className="text-slate-300 text-sm leading-relaxed">
                نظام القصة مصمم ليرتقي بك خطوة بخطوة من مستثمر متعثر إلى تريليونير عالمي. إليك خريطة فك الأقفال:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-850 border border-emerald-500/30">
                  <div className="flex items-center justify-between mb-1.5">
                    <strong className="text-emerald-400 text-sm font-black">المستوى 1 (أنت هنا)</strong>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">متاح حالياً</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    فحص الأرض والمصنع الموروث، المزادات، خريطة الالتزامات والديون، المتجر، ومهام القصة.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-850 border border-amber-500/30">
                  <div className="flex items-center justify-between mb-1.5">
                    <strong className="text-amber-400 text-sm font-black">🔒 المستوى 2: التصنيع</strong>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">يفتح بتشغيل المصنع</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    خطوط الإنتاج، شراء المواد الخام (القمح والزيوت)، وإدارة المستودعات والتخزين.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-850 border border-amber-500/30">
                  <div className="flex items-center justify-between mb-1.5">
                    <strong className="text-amber-400 text-sm font-black">🔒 المستوى 3: عقود السوق</strong>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">يفتح ببيع المنتجات</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    إبرام عقود التوريد الضخمة مع كبار التجار واستعادة السمعة التجارية في الأسواق.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-850 border border-purple-500/30">
                  <div className="flex items-center justify-between mb-1.5">
                    <strong className="text-purple-400 text-sm font-black">🔒 المستوى 4: رفع الحظر البنكي</strong>
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold">بإنجاز أول عقد</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    فتح البنك بالكامل: الحصول على قروض توسعية، فتح ودائع استثمارية، والتسهيلات الائتمانية.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-700 sm:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <strong className="text-slate-200 text-sm font-black">المستوى 5 فما فوق: النفوذ والسيطرة</strong>
                    <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full font-bold">الفصل الثاني والثالث</span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    البورصة وتداول الأسهم (م5)، توظيف المدراء والخبراء (م5)، الأبحاث والتكنولوجيا (م6)، السيطرة الإقليمية (م7)، والملاحة والمشاريع الكبرى (م10-12).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: How to Play - Controls & HUD */}
          {currentStep === 3 && (
            <div className="space-y-4 text-right">
              <p className="text-slate-300 text-sm leading-relaxed">
                تعرّف على عناصر شاشتك الرئيسية لتدير ثروتك باحترافية:
              </p>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                    <Icon name="store" size={20} />
                  </div>
                  <div className="flex-1">
                    <strong className="text-white text-xs sm:text-sm block">شريط الموارد العلوي</strong>
                    <span className="text-slate-400 text-xs">
                      يعرض رصيدك الكاش، سبائك الذهب، الماس، ومؤقت اليوم الحالي في عالم اللعبة.
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
                    <Icon name="lightning" size={20} />
                  </div>
                  <div className="flex-1">
                    <strong className="text-white text-xs sm:text-sm block">مؤقت وترحيل اليوم (تسريع الزمن)</strong>
                    <span className="text-slate-400 text-xs">
                      الضغط على ترحيل اليوم يتقدم بالزمن يوماً كاملاً لاكتمال أوامر الإنتاج وجني أرباح الودائع وسداد الالتزامات الدورية.
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0">
                    <Icon name="tasks" size={20} />
                  </div>
                  <div className="flex-1">
                    <strong className="text-white text-xs sm:text-sm block">مهام القصة والإنجازات 📜</strong>
                    <span className="text-slate-400 text-xs">
                      مرشدك اليومي المباشر: كل مهمة تنجزها تمنحك نقاط خبرة XP لرفع مستواك وفتح الأنظمة المقفلة بسرعة!
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Immediate Action Checklist */}
          {currentStep === 4 && (
            <div className="space-y-5 text-right">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-sm leading-relaxed">
                <strong className="text-emerald-400 font-bold block mb-1 text-base">
                  🚀 خطتك التنفيذية الفورية لبدء الفصل الأول:
                </strong>
                لقد فهمت السيناريو بالكامل والآن حان وقت العمل الميداني! هذه خطواتك الثلاث الأولى:
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 flex items-start gap-3">
                  <span className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <strong className="text-white text-sm block mb-0.5">فحص وصيانة المصنع الموروث</strong>
                    <p className="text-slate-400 text-xs">
                      ادخل إلى <strong>"الشركات"</strong>، ستجد مصنعك بحالة ماكينات 25% نتيجة الإهمال السابق. اضغط على زر <strong>"صيانة الماكينات"</strong> لرفع كفاءته.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 flex items-start gap-3">
                  <span className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <strong className="text-white text-sm block mb-0.5">شراء المواد الخام وتشغيل أول دفعة</strong>
                    <p className="text-slate-400 text-xs">
                      توجّه إلى <strong>"الإنتاج والمخازن"</strong>، اشترِ القمح أو المواد الخام المناسبة، ثم اطلب تشغيل أول دفعة إنتاج غذائية.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 flex items-start gap-3">
                  <span className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <strong className="text-white text-sm block mb-0.5">بيع المنتجات وفتح المستوى 2 ثم 3 و4!</strong>
                    <p className="text-slate-400 text-xs">
                      بمجرد اكتمال الإنتاج، بِع البضائع لتحقيق أرباح صريحة وتجميع نقاط XP تؤهلك للمستوى 2 فوراً ثم فك الحظر البنكي في المستوى 4.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Footer Actions */}
        <footer className="p-4 sm:p-6 border-t border-slate-800/80 bg-slate-950/70 flex items-center justify-between gap-3">
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold transition-all border border-slate-700"
            >
              السابق
            </button>
          ) : (
            <div />
          )}

          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev + 1)}
              className="inline-flex items-center gap-2 px-5 sm:px-7 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black shadow-lg shadow-amber-500/20 transition-all"
            >
              التالي <Icon name="arrow" size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={onComplete}
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 text-xs sm:text-sm font-black shadow-xl shadow-emerald-500/25 transition-all transform hover:scale-[1.02]"
            >
              أنا جاهز، ابدأ خطة الإنقاذ الآن! 🚀
            </button>
          )}
        </footer>
      </div>
    </main>
  );
}
