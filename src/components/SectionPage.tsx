import type { CountryDefinition } from '../domain/countries';
import type { PlayerProfile } from '../domain/player';
import type { SectionItem } from '../domain/navigation';
import { Icon } from './Icon';

interface SectionPageProps {
  section: SectionItem;
  profile: PlayerProfile;
  country: CountryDefinition;
  onHome: () => void;
  onNewGame: () => void;
}

const futureCopy: Record<string, { title: string; body: string }> = {
  auctions: { title: 'المزادات لم تُفعّل بعد', body: 'لا توجد مزادات أو منافسات مع شخصيات آلية في هذه المرحلة. سيُضاف نظام العطاءات والأسعار عند تنفيذ مرحلة المزادات.' },
  companies: { title: 'لا توجد شركات مملوكة', body: 'تأسيس الشركات والتشغيل حسب القطاعات سيُضاف في مرحلة الشركات. لم تُنشأ شركة بالنيابة عنك.' },
  investments: { title: 'لا توجد استثمارات نشطة', body: 'لم تُفعّل عوائد أو أدوات استثمارية بعد؛ لذلك لا تُحتسب أرباح افتراضية.' },
  lands: { title: 'لا توجد أراضٍ مملوكة', body: 'شراء الأراضي والمنافسة عليها غير متاحين في المرحلة الأولى.' },
  production: { title: 'الإنتاج غير متاح بعد', body: 'ربط المصانع بالطاقة والمواد الخام والمنتجات سيُنفّذ في مرحلة لاحقة.' },
  inventory: { title: 'لا توجد مواد أو مخازن مسجلة', body: 'لم تُشترَ مواد خام ولم يُنشأ مخزون؛ سيُفعّل ذلك مع أنظمة الشركات والإنتاج.' },
  reports: { title: 'لا توجد حركات مالية بعد', body: 'سيعرض هذا القسم الإيرادات والمصروفات عند تنفيذ المعاملات. صافي أرباحك الحالي صفر.' },
  tasks: { title: 'المهام والإنجازات قيد الإعداد', body: 'لم تُفعّل تحديات أو مكافآت في المرحلة الأولى.' },
};

export function SectionPage({ section, profile, country, onHome, onNewGame }: SectionPageProps) {
  if (section.id === 'settings') {
    return (
      <div className="section-page">
        <div className="page-heading"><span className="heading-icon"><Icon name="settings" size={23} /></span><div><span className="section-kicker">إدارة الحساب المحلي</span><h1>الإعدادات</h1></div></div>
        <section className="settings-card">
          <div className="settings-row"><span>اسم المستثمر</span><strong>{profile.name}</strong></div>
          <div className="settings-row"><span>الدولة الأساسية</span><strong>{country.flag} {country.name} · {country.currency.code}</strong></div>
          <div className="settings-row"><span>مستوى اللاعب</span><strong>{profile.level}</strong></div>
          <div className="settings-row"><span>طريقة الحفظ</span><strong className="saved-status"><span /> على هذا الجهاز</strong></div>
          <div className="settings-note"><Icon name="shield" size={17} /><p>ملفك محفوظ في مساحة التخزين المحلية للمتصفح على هذا الجهاز. لا يتطلب الحفظ اتصالًا بالإنترنت.</p></div>
          <div className="settings-actions"><button className="button button-secondary" type="button" onClick={onHome}>العودة للرئيسية</button><button className="button button-danger" type="button" onClick={onNewGame}>بدء لعبة جديدة</button></div>
        </section>
      </div>
    );
  }

  const content = futureCopy[section.id] ?? { title: 'سيُضاف هذا القسم لاحقًا', body: 'هذا القسم جزء من خطة التوسّع، لكنه غير منفذ في المرحلة الأولى.' };
  return (
    <div className="section-page">
      <div className="page-heading"><span className="heading-icon"><Icon name={section.icon} size={23} /></span><div><span className="section-kicker">منظومة إمبراطوريتك</span><h1>{section.label}</h1></div></div>
      <section className="future-card">
        <span className="future-icon"><Icon name="lock" size={22} /></span>
        <span className="phase-pill">المرحلة الأولى</span>
        <h2>{content.title}</h2>
        <p>{content.body}</p>
        <div className="future-footnote"><span /> هذه الشاشة لا تعرض بيانات وهمية ولا تنفذ معاملات.</div>
        <button className="button button-secondary" type="button" onClick={onHome}>العودة إلى ملخص الإمبراطورية</button>
      </section>
    </div>
  );
}
