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
    /** Simulation-only company formation fee. */
    companySetupFee: number | null;
    /** Simulation-only licence prices by industry. */
    licenseFeesByIndustry: Partial<Record<IndustryId, number>>;
    /** Applied to taxable sales and selected day events. */
    taxRate: number | null;
    customsRate: number | null;
    operatingCostMultiplier: number | null;
  };
}

/** All prices in this catalogue are fictional game-balance values, not market data. */
export const COUNTRIES: readonly CountryDefinition[] = [
  {
    id: 'egypt',
    name: 'مصر',
    flag: '🇪🇬',
    currency: { code: 'EGP', symbol: 'ج.م', name: 'الجنيه المصري' },
    startingBalance: 1_000_000,
    economy: {
      exchangeRateToEgp: 1,
      companySetupFee: 75_000,
      licenseFeesByIndustry: {
        petroleum: 140_000,
        electricity: 105_000,
        gas: 120_000,
        water: 90_000,
        detergents: 55_000,
        food: 45_000,
        construction: 65_000,
        electronics: 85_000,
        transport: 50_000,
      },
      taxRate: 0.12,
      customsRate: 0,
      operatingCostMultiplier: 1,
    },
  },
];

export function findCountry(countryId: CountryId): CountryDefinition | undefined {
  return COUNTRIES.find((country) => country.id === countryId);
}
