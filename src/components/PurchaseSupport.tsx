const VODAFONE_CASH_NUMBER = '01093629700';
const WHATSAPP_NUMBER = '201093629700';
const WHATSAPP_MESSAGE = encodeURIComponent('مرحبًا، أريد شراء مكافأة للعبة إمبراطورية الأعمال.');

export function PurchaseSupport() {
  return (
    <div className="purchase-support">
      <div className="purchase-support-heading">
        <span className="purchase-support-mark">$</span>
        <div>
          <strong>شراء مكافآت اللعبة</strong>
          <p>الدفع يتم يدويًا عبر Vodafone Cash، ثم أرسل إيصال التحويل للدعم للحصول على كودك.</p>
        </div>
      </div>
      <div className="purchase-support-number">
        <span>رقم Vodafone Cash</span>
        <strong dir="ltr">{VODAFONE_CASH_NUMBER}</strong>
      </div>
      <a className="button button-primary purchase-support-whatsapp" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`} target="_blank" rel="noreferrer">
        <span className="purchase-support-whatsapp-mark">W</span>
        التواصل عبر WhatsApp
      </a>
      <small>بعد تأكيد التحويل، سيرسل لك الدعم كودًا يحتوي على المال أو الذهب الذي اخترته.</small>
    </div>
  );
}
