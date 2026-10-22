import type { CountryId, IndustryId } from './countries';

export type AuctionLotType = 'land' | 'factory' | 'raw-material';

export interface AuctionListing {
  id: string;
  countryId: CountryId;
  lotType: AuctionLotType;
  label: string;
  landType: 'industrial' | 'agricultural' | 'commercial';
  areaSquareMeters: number;
  minimumBid: number;
  bidIncrement: number;
  closesAt: string;
  status: 'scheduled' | 'open' | 'closed';
  energyCapacityBonus?: number;
  materialId?: string;
  quantity?: number;
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
  grossRevenue: number;
  tax: number;
  soldAt: string;
}

export interface LicenseRecord {
  id: string;
  countryId: CountryId;
  industryId: IndustryId;
  feePaid: number;
  issuedAt: string;
  expiresAt?: string;
}

export interface InvestmentRecord {
  id: string;
  investmentTypeId: string;
  principal: number;
  expectedReturnRate: number;
  startedOnDay: number;
  maturityDay: number;
  status: 'active' | 'paid' | 'loss';
  settledAmount?: number;
}

export type FinanceLedgerCategory = 'revenue' | 'expense' | 'asset' | 'liability' | 'settlement';

export interface FinanceLedgerEntry {
  id: string;
  category: FinanceLedgerCategory;
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
  kind?: 'bonus' | 'cost';
}

export interface TaskProgress {
  taskId: string;
  claimed: boolean;
  claimedAt?: string;
}

export interface GameEventRecord {
  id: string;
  day: number;
  title: string;
  cashImpact: number;
  occurredAt: string;
}
