export type CurrencyCode = string;
export type CountryId = string;
export type IndustryId =
  | 'petroleum'
  | 'electricity'
  | 'gas'
  | 'water'
  | 'detergents'
  | 'food'
  | 'construction'
  | 'electronics'
  | 'transport';

export interface CountryDefinition {
  id: CountryId;
  name: string;
  flag: string;
  currency: {
    code: CurrencyCode;
    symbol: string;
    name: string;
  };
  startingBalance: number;
  economy: {
    /** Local-currency units per Egyptian pound; 1 for Egypt's base currency. */
    exchangeRateToEgp: number;
    /** Null means the rule is intentionally not configured in this first phase. */
    companySetupFee: number | null;
    licenseFeesByIndustry: Partial<Record<IndustryId, number>>;
    taxRate: number | null;
    customsRate: number | null;
    operatingCostMultiplier: number | null;
  };
}

export const COUNTRIES: readonly CountryDefinition[] = [
  {
    id: 'egypt',
    name: 'مصر',
    flag: '🇪🇬',
    currency: { code: 'EGP', symbol: 'ج.م', name: 'الجنيه المصري' },
    startingBalance: 1_000_000,
    economy: {
      exchangeRateToEgp: 1,
      companySetupFee: null,
      licenseFeesByIndustry: {},
      taxRate: null,
      customsRate: null,
      operatingCostMultiplier: null,
    },
  },
];

export function findCountry(countryId: CountryId): CountryDefinition | undefined {
  return COUNTRIES.find((country) => country.id === countryId);
}
