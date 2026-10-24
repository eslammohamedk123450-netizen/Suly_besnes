export const DIAMOND_VALUE_EGP = 12_000;
export const DIAMOND_PURCHASE_DISCOUNT_RATE = 0.01;

export type PurchasePaymentMethod = 'cash' | 'diamonds';

/** Convert an EGP price to whole diamonds after the 1% diamond-payment discount. */
export function getDiscountedDiamondPrice(cashPrice: number): number {
  if (!Number.isFinite(cashPrice) || cashPrice <= 0) return 0;
  return Math.floor((cashPrice * (1 - DIAMOND_PURCHASE_DISCOUNT_RATE)) / DIAMOND_VALUE_EGP);
}

/** Cash price paired with a fixed whole-diamond price, preserving the 1% discount. */
export function getCashPriceForDiamondPrice(diamondPrice: number): number {
  if (!Number.isFinite(diamondPrice) || diamondPrice <= 0) return 0;
  return Math.ceil((diamondPrice * DIAMOND_VALUE_EGP) / (1 - DIAMOND_PURCHASE_DISCOUNT_RATE));
}
