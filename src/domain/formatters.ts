import { findCountry, type CountryDefinition, type CountryId } from './countries';

const integerFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

/**
 * Formats a number with compact suffix for massive values:
 * 6,102,085,009,246 -> 6.1T
 * 1,500,000,000 -> 1.5B
 * 2,400,000 -> 2.4M
 */
export function formatCompactNumber(value: number, decimals: number = 1): string {
  if (value === null || value === undefined || isNaN(value)) return '0';
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (abs >= 1e15) {
    const v = (abs / 1e15).toFixed(decimals).replace(/\.0+$/, '');
    return `${sign}${v}Q`;
  }
  if (abs >= 1e12) {
    const v = (abs / 1e12).toFixed(decimals).replace(/\.0+$/, '');
    return `${sign}${v}T`;
  }
  if (abs >= 1e9) {
    const v = (abs / 1e9).toFixed(decimals).replace(/\.0+$/, '');
    return `${sign}${v}B`;
  }
  if (abs >= 1e6) {
    const v = (abs / 1e6).toFixed(decimals).replace(/\.0+$/, '');
    return `${sign}${v}M`;
  }
  if (abs >= 1e3) {
    const v = (abs / 1e3).toFixed(decimals).replace(/\.0+$/, '');
    return `${sign}${v}K`;
  }
  return `${sign}${integerFormat.format(Math.round(abs))}`;
}

export function formatNumber(value: number, options?: { compact?: boolean; decimals?: number }): string {
  if (options?.compact) {
    return formatCompactNumber(value, options.decimals ?? 1);
  }
  return integerFormat.format(value ?? 0);
}

export function formatMoney(
  value: number, 
  country?: CountryDefinition | CountryId | string,
  options?: { compact?: boolean; decimals?: number }
): string {
  let symbol = '$';
  let usdToLocalRate = 1;

  if (country) {
    if (typeof country === 'object' && country.currency?.symbol) {
      symbol = country.currency.symbol;
      usdToLocalRate = country.economy.usdToLocalRate;
    } else if (typeof country === 'string') {
      const found = findCountry(country as CountryId);
      if (found?.currency?.symbol) {
        symbol = found.currency.symbol;
        usdToLocalRate = found.economy.usdToLocalRate;
      }
    }
  }

  const localValue = (value ?? 0) * usdToLocalRate;
  if (options?.compact) {
    return `${symbol} ${formatCompactNumber(localValue, options.decimals ?? 1)}`;
  }
  return `${symbol} ${formatNumber(localValue)}`;
}

export function formatCompactMoney(
  value: number,
  country?: CountryDefinition | CountryId | string,
  decimals: number = 1
): string {
  return formatMoney(value, country, { compact: true, decimals });
}

export function formatGold(grams: number, options?: { compact?: boolean; decimals?: number }): string {
  if (options?.compact) {
    return `${formatCompactNumber(grams ?? 0, options.decimals ?? 1)} غ`;
  }
  return `${formatNumber(grams ?? 0)} غ`;
}

export function formatCompactGold(grams: number, decimals: number = 1): string {
  return formatGold(grams, { compact: true, decimals });
}

/**
 * Formats currency/resource amounts compactly for UI display:
 * 1,500,000 -> "1.5M", 1,000,000,000 -> "1B", 10,000 -> "10K".
 */
export function formatCurrency(
  amount: number,
  currencySymbol?: string,
  options?: { compact?: boolean; decimals?: number }
): string {
  const useCompact = options?.compact ?? true;
  const formatted = useCompact
    ? formatCompactNumber(amount ?? 0, options?.decimals ?? 1)
    : formatNumber(amount ?? 0);
  return currencySymbol ? `${currencySymbol} ${formatted}` : formatted;
}
