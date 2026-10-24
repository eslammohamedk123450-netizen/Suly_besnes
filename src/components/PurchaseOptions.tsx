import { formatMoney, formatNumber } from '../domain/formatters';
import type { CountryDefinition } from '../domain/countries';
import type { PurchasePaymentMethod } from '../game/purchasePricing';
import { getDiscountedDiamondPrice } from '../game/purchasePricing';
import './PurchaseOptions.css';

interface PurchaseOptionsProps {
  country: CountryDefinition;
  cashPrice: number;
  bankBalance: number;
  diamondsBalance: number;
  onPurchase: (method: PurchasePaymentMethod) => void;
  disabled?: boolean;
  diamondPrice?: number;
  cashLabel?: string;
  diamondLabel?: string;
  note?: string;
}

export function PurchaseOptions({ country, cashPrice, bankBalance, diamondsBalance, onPurchase, disabled = false, diamondPrice, cashLabel = 'شراء نقدًا', diamondLabel = 'شراء بالماس', note = 'يُحتسب خصم ١٪ ثم تُقرّب تكلفة الماس إلى الأسفل؛ وقد يزيد الوفر بسبب التقريب.' }: PurchaseOptionsProps) {
  const diamonds = diamondPrice ?? getDiscountedDiamondPrice(cashPrice);
  const canBuyWithDiamonds = diamonds > 0 && diamondsBalance >= diamonds;
  return (
    <div className="purchase-options" role="group" aria-label="اختيار وسيلة الدفع">
      <button className="button button-secondary" type="button" disabled={disabled || bankBalance < cashPrice} onClick={() => onPurchase('cash')}>
        {cashLabel} · {formatMoney(cashPrice, country)}
      </button>
      <button className="button button-primary" type="button" disabled={disabled || !canBuyWithDiamonds} onClick={() => onPurchase('diamonds')}>
        {diamondLabel} · {diamonds > 0 ? `${formatNumber(diamonds)} ماسة` : 'غير متاح بهذه القيمة'}
      </button>
      <small className="purchase-options-note">{note}</small>
    </div>
  );
}
