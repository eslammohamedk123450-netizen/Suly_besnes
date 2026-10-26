import type { CountryId, IndustryId } from './countries';
import { COUNTRIES } from './countries';
import { COUNTRY_REAL_ASSETS, INDUSTRY_CATALOG } from '../game/catalog';

export interface LandAuditParcel {
  parcelId: string;
  countryId: CountryId;
  countryName: string;
  label: string;
  landType: 'industrial' | 'agricultural' | 'commercial';
  areaSquareMeters: number;
  purchasePrice: number;
  dailyOperatingCostBaseline: number;
  compatibleIndustries: IndustryId[];
  region: string;
}

export interface CountryAuditRecord {
  countryId: CountryId;
  name: string;
  flag: string;
  startingBalanceUsd: number;
  currencyCode: string;
  currencySymbol: string;
  parcelsCount: number;
  companiesCount: number;
  auctionsCount: number;
  parcels: LandAuditParcel[];
}

export interface LandAuditVerificationResult {
  isValid: boolean;
  totalCountries: number;
  totalParcels: number;
  countryIds: CountryId[];
  issues: string[];
}

/**
 * Builds the canonical land audit catalog across all 10 supported nations.
 */
export function buildCountryAuditCatalog(): Record<CountryId, CountryAuditRecord> {
  const result: Partial<Record<CountryId, CountryAuditRecord>> = {};

  COUNTRIES.forEach((c) => {
    const assets = COUNTRY_REAL_ASSETS[c.id] ?? COUNTRY_REAL_ASSETS.egypt;
    const compatibleMap: Record<'industrial' | 'agricultural' | 'commercial', IndustryId[]> = {
      industrial: INDUSTRY_CATALOG.filter((i) => i.requiredLandType === 'industrial').map((i) => i.id),
      agricultural: INDUSTRY_CATALOG.filter((i) => i.requiredLandType === 'agricultural').map((i) => i.id),
      commercial: INDUSTRY_CATALOG.filter((i) => i.requiredLandType === 'commercial').map((i) => i.id),
    };

    const parcels: LandAuditParcel[] = assets.directLands.map((land, idx) => ({
      parcelId: `${c.id}_parcel_${idx + 1}_${land.landType}`,
      countryId: c.id,
      countryName: c.name,
      label: land.label,
      landType: land.landType,
      areaSquareMeters: land.areaSquareMeters,
      purchasePrice: land.price,
      dailyOperatingCostBaseline: Math.round(land.price * 0.02),
      compatibleIndustries: compatibleMap[land.landType] ?? [],
      region: land.label.split('·')[1]?.trim() || land.label,
    }));

    result[c.id] = {
      countryId: c.id,
      name: c.name,
      flag: c.flag,
      startingBalanceUsd: c.startingBalance,
      currencyCode: c.currency.code,
      currencySymbol: c.currency.symbol,
      parcelsCount: parcels.length,
      companiesCount: assets.directCompanies.length,
      auctionsCount: assets.auctions.length,
      parcels,
    };
  });

  return result as Record<CountryId, CountryAuditRecord>;
}

/**
 * Verifies that all 10 countries have unique identifiers, valid non-empty parcel catalogs,
 * non-conflicting land types, and positive purchase prices.
 */
export function verifyCountryAndLandIntegrity(): LandAuditVerificationResult {
  const catalog = buildCountryAuditCatalog();
  const countryIds = Object.keys(catalog) as CountryId[];
  const issues: string[] = [];
  let totalParcels = 0;

  if (countryIds.length !== 10) {
    issues.push(`Expected exactly 10 countries, but found ${countryIds.length}`);
  }

  const seenCountryIds = new Set<string>();
  const seenParcelIds = new Set<string>();

  countryIds.forEach((cid) => {
    if (seenCountryIds.has(cid)) {
      issues.push(`Duplicate countryId detected: ${cid}`);
    }
    seenCountryIds.add(cid);

    const record = catalog[cid];
    if (!record.name || record.name.trim().length === 0) {
      issues.push(`Country ${cid} missing name`);
    }

    if (record.startingBalanceUsd <= 0) {
      issues.push(`Country ${cid} has non-positive starting balance: ${record.startingBalanceUsd}`);
    }

    if (record.parcels.length === 0) {
      issues.push(`Country ${cid} has 0 direct land parcels`);
    }

    record.parcels.forEach((p) => {
      totalParcels += 1;
      if (seenParcelIds.has(p.parcelId)) {
        issues.push(`Duplicate parcelId detected: ${p.parcelId}`);
      }
      seenParcelIds.add(p.parcelId);

      if (p.areaSquareMeters <= 0) {
        issues.push(`Parcel ${p.parcelId} has invalid area: ${p.areaSquareMeters}`);
      }
      if (p.purchasePrice <= 0) {
        issues.push(`Parcel ${p.parcelId} has invalid purchase price: ${p.purchasePrice}`);
      }
      if (!['industrial', 'agricultural', 'commercial'].includes(p.landType)) {
        issues.push(`Parcel ${p.parcelId} has invalid landType: ${p.landType}`);
      }
      if (p.compatibleIndustries.length === 0) {
        issues.push(`Parcel ${p.parcelId} has no compatible industries for landType ${p.landType}`);
      }
    });
  });

  return {
    isValid: issues.length === 0,
    totalCountries: countryIds.length,
    totalParcels,
    countryIds,
    issues,
  };
}
