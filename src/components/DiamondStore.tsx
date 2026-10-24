import { useState } from 'react';
import type { PlayerProfile } from '../domain/player';
import { formatNumber } from '../domain/formatters';

interface DiamondStoreProps {
  profile: PlayerProfile;
  onBuyGoldWithDiamonds: (grams: number) => void;
  onSellGold: (grams: number) => void;
}

const VODAFONE_CASH_NUMBER = '01093629700';
const WHATSAPP_NUMBER = '201093629700';

const DIAMOND_PACKAGES = [
  { id: 'starter', diamonds: 100, price: 50, label: 'الباقة الأولى', note: 'لبداية سريعة' },
  { id: 'builder', diamonds: 250, price: 100, label: 'باقة التوسع', note: 'الأكثر توازنًا' },
  { id: 'executive', diamonds: 600, price: 200, label: 'باقة المدير', note: 'لشراء عدة بطاقات' },
  { id: 'empire', diamonds: 1300, price: 400, label: 'باقة الإمبراطورية', note: 'للتوسع الكبير' },
] as const;

async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

export function DiamondStore({ profile, onBuyGoldWithDiamonds, onSellGold }: DiamondStoreProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [goldGrams, setGoldGrams] = useState('1.0');
  const selected = DIAMOND_PACKAGES.find((item) => item.id === selectedId);
  const whatsappText = selected
    ? `مرحبًا، أرسلت تحويل Vodafone Cash لشراء ${selected.diamonds} ماسة بقيمة ${selected.price} ج.م للعبة إمبراطورية الأعمال. سأرفق إيصال التحويل.`
    : 'مرحبًا، أريد شراء ماس للعبة إمبراطورية الأعمال.';

  async function copyNumber() {
    setCopied(await copyText(VODAFONE_CASH_NUMBER));
    window.setTimeout(() => setCopied(false), 2200);
  }

  return (
    <section className="diamond-store" aria-labelledby="diamond-store-title">
      <div className="diamond-store-heading">
        <div>
          <span className="section-kicker">متجر الإمبراطورية</span>
          <h3 id="diamond-store-title">شراء الماس</h3>
          <p>اختر الباقة، ثم حوّل قيمتها يدويًا عبر Vodafone Cash. الدفع يتم خارج اللعبة ولا تخصم اللعبة أي مبلغ.</p>
        </div>
        <span className="diamond-store-rate">100 ماسة = 50 ج.م</span>
      </div>
      <div className="diamond-package-grid">
        {DIAMOND_PACKAGES.map((item) => (
          <button className={`diamond-package${selectedId === item.id ? ' is-selected' : ''}`} type="button" key={item.id} onClick={() => setSelectedId(item.id)}>
            <strong>{item.label}</strong>
            <b>◆ {item.diamonds.toLocaleString('ar-EG')}</b>
            <span>{item.price.toLocaleString('ar-EG')} ج.م</span>
            <small>{item.note}</small>
          </button>
        ))}
      </div>
      {selected && (
        <div className="diamond-transfer-panel" role="dialog" aria-label="تعليمات تحويل قيمة الماس">
          <div className="diamond-transfer-title"><strong>تحويل قيمة {selected.diamonds.toLocaleString('ar-EG')} ماسة</strong><span>{selected.price.toLocaleString('ar-EG')} ج.م</span></div>
          <ol>
            <li>افتح Vodafone Cash واختر تحويل أموال.</li>
            <li>حوّل مبلغ <strong>{selected.price.toLocaleString('ar-EG')} ج.م</strong> إلى الرقم التالي:</li>
          </ol>
          <button className="diamond-cash-number" type="button" onClick={() => void copyNumber()} aria-label="نسخ رقم Vodafone Cash">
            <span>رقم Vodafone Cash</span><strong dir="ltr">{VODAFONE_CASH_NUMBER}</strong><small>{copied ? 'تم نسخ الرقم' : 'اضغط لنسخ الرقم'}</small>
          </button>
          <p className="diamond-transfer-warning">بعد الإرسال، عليك التواصل مع مسؤول الشحن وإرسال إيصال التحويل واسم الحساب والباقة المطلوبة لاستكمال الشحن.</p>
          <a className="button button-primary diamond-whatsapp" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappText)}`} target="_blank" rel="noreferrer">التواصل مع مسؤول الشحن عبر WhatsApp</a>
        </div>
      )}
      <div className="diamond-exchange-grid">
        <article className="diamond-exchange-card"><strong>شراء الذهب بالماس</strong><small>سعر المحاكاة: 60 ماسة لكل 1 غرام ذهب · رصيدك {formatNumber(profile.diamonds)} ماسة</small><div className="diamond-exchange-row"><input type="number" min="0.1" step="0.1" value={goldGrams} onChange={(event) => setGoldGrams(event.target.value)} /><button className="button button-secondary" type="button" disabled={profile.diamonds < Math.round(Number(goldGrams || 0) * 60) || Number(goldGrams) <= 0} onClick={() => onBuyGoldWithDiamonds(Number(goldGrams))}>شراء ذهب</button></div></article>
        <article className="diamond-exchange-card"><strong>تحويل الذهب إلى نقود</strong><small>سعر البيع الحالي: 5,820 ج.م تقريبًا لكل 1 غرام · رصيدك {formatNumber(profile.goldGrams)} غرام</small><div className="diamond-exchange-row"><input type="number" min="0.1" max={profile.goldGrams} step="0.1" value={goldGrams} onChange={(event) => setGoldGrams(event.target.value)} /><button className="button button-secondary" type="button" disabled={Number(goldGrams) <= 0 || Number(goldGrams) > profile.goldGrams} onClick={() => onSellGold(Number(goldGrams))}>تحويل إلى نقود</button></div></article>
      </div>
      <small className="diamond-store-note">الشحن يتم يدويًا بعد مراجعة الإيصال. لا ترسل كلمة المرور أو رمز الدخول لأي شخص.</small>
    </section>
  );
}
