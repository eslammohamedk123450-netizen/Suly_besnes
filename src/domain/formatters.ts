import { findCountry, type CountryDefinition, type CountryId } from './countries';

const integerFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

export function formatNumber(value: number): string {
  return integerFormat.format(value ?? 0);
}

export function formatMoney(
  value: number, 
  country?: CountryDefinition | CountryId | string
): string {
  let symbol = '$';

  if (country) {
    if (typeof country === 'object' && country.currency?.symbol) {
      symbol = country.currency.symbol;
    } else if (typeof country === 'string') {
      const found = findCountry(country as CountryId);
      if (found?.currency?.symbol) {
        symbol = found.currency.symbol;
      }
    }
  }

  return `${symbol} ${formatNumber(value ?? 0)}`;
}

export function formatGold(grams: number): string {
  return `${formatNumber(grams ?? 0)} غ`;
}

export function formatCurrency(value: number, currencySymbol = '$'): string {
  return `${currencySymbol} ${formatNumber(value ?? 0)}`;
}
