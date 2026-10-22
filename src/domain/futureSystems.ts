import type { CountryId, IndustryId } from './countries';

/** Data contracts for later phases only; no auction, production or market simulation is enabled yet. */
export interface AuctionListing {
  id: string;
  countryId: CountryId;
  lotType: 'land' | 'factory' | 'raw-material';
  minimumBid: number;
  closesAt: string;
  status: 'scheduled' | 'open' | 'closed';
}

export interface BotBid {
  bidderId: string;
  amount: number;
  placedAt: string;
}

export interface CompanyRecord {
  id: string;
  name: string;
  countryId: CountryId;
  industryId: IndustryId;
  landId?: string;
  factoryId?: string;
  licenseIds: string[];
}

export interface FactoryRecord {
  id: string;
  companyId: string;
  capacityPerCycle: number;
  rawMaterialIds: string[];
  warehouseId?: string;
}

export interface InventoryLot {
  id: string;
  materialOrProductId: string;
  quantity: number;
  unit: string;
  unitCost: number;
}

export interface ProductSale {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  soldAt: string;
}

export interface LicenseRecord {
  id: string;
  countryId: CountryId;
  industryId: IndustryId;
  feePaid: number;
  expiresAt?: string;
}

export interface InternationalBranch {
  id: string;
  parentCompanyId: string;
  countryId: CountryId;
  setupCost: number;
}

export interface FinanceLedgerEntry {
  id: string;
  category: 'revenue' | 'expense' | 'asset' | 'liability';
  amount: number;
  countryId: CountryId;
  occurredAt: string;
  note: string;
}

export interface EconomicEvent {
  id: string;
  countryId: CountryId;
  title: string;
  impact: number;
  startsAt: string;
  endsAt: string;
}
