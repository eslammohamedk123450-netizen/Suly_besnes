import type { CountryDefinition } from './countries';

const integerFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

export function formatNumber(value: number): string {
  return integerFormat.format(value);
}

export function formatMoney(value: number, country: CountryDefinition): string {
  return `${country.currency.symbol} ${formatNumber(value)}`;
}

export function formatGold(grams: number): string {
  return `${formatNumber(grams)} غ`;
}

export function formatCurrency(value: number, currencySymbol = 'ج.م'): string {
  return `${currencySymbol} ${formatNumber(value)}`;
}
