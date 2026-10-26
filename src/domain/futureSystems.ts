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

export interface AuctionBidRecord {
  id: string;
  listingId: string;
  bidder: 'player' | 'bot';
  bidderId: string;
  amount: number;
  day: number;
  occurredAt: string;
}

export interface BotBid {
  bidderId: string;
  amount: number;
  placedAt: string;
}

export interface PlayerAuctionBid {
  investorId: string;
  investorName: string;
  investorType: string;
  avatarColor: string;
  amount: number;
  timestamp: number;
  note?: string;
}

export interface PlayerAuctionListing {
  id: string;
  assetType: 'land' | 'company' | 'asset';
  assetId: string;
  assetName: string;
  assetSpecs: string;
  originalValue: number;
  startingBid: number;
  currentBid: number;
  status: 'active' | 'sold' | 'cancelled';
  leadingBidderName: string;
  leadingBidderType: string;
  winningBidderName?: string;
  totalBidsCount: number;
  closesAtMs: number;
  listedAt: string;
  listedOnDay: number;
  soldAt?: string;
  soldOnDay?: number;
  finalSalePrice?: number;
  profitDifference?: number;
  profitPercent?: number;
  bidsHistory: PlayerAuctionBid[];
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
  qualityScore?: number;
}

export interface ProductSale {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  grossRevenue: number;
  tax: number;
  costOfGoods?: number;
  soldOnDay?: number;
  contractId?: string;
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

export interface DepositTranche {
  id: string;
  principal: number;
  annualRate: number;
  startedOnDay: number;
  maturityDay: number;
  status: 'active' | 'paid' | 'withdrawn';
  settledAmount?: number;
}

export interface DepositRecord {
  id: string;
  principal: number;
  annualRate: number;
  startedOnDay: number;
  maturityDay: number;
  status: 'active' | 'paid' | 'withdrawn' | 'merged';
  settledAmount?: number;
  mergedIntoId?: string;
  tranches?: DepositTranche[];
}

export interface LoanRecord {
  id: string;
  collateralType: 'land' | 'company';
  collateralId: string;
  principal: number;
  totalRepayment: number;
  annualRate: number;
  startedOnDay: number;
  termDays: number;
  nextPaymentDay: number;
  installmentAmount: number;
  remainingBalance: number;
  status: 'active' | 'paid' | 'defaulted';
}

export type StaffRole = 'manager' | 'accountant' | 'lawyer' | 'hr';

export interface StaffContract {
  id: string;
  role: StaffRole;
  name: string;
  companyId?: string;
  dailySalary: number;
  /** Legacy saves omit these fields and are treated as a level-one employee. */
  level?: number;
  experience?: number;
  hiredOnDay: number;
  nextPayDay: number;
  unpaidSalary?: number;
  status: 'active' | 'terminated';
}

export interface ProductionOrder {
  id: string;
  companyId: string;
  productId: string;
  productName: string;
  batches: number;
  outputQuantity: number;
  outputUnit: string;
  materialCost: number;
  energyCost: number;
  expectedUnitCost: number;
  demandForecast: number;
  qualityScore: number;
  maintenanceCost: number;
  startedOnDay: number;
  completesOnDay: number;
  status: 'active' | 'completed' | 'cancelled';
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
  description?: string;
  cashImpact: number;
  occurredAt: string;
  industryId?: IndustryId;
  materialId?: string;
  productId?: string;
  materialPriceMultiplier?: number;
  demandMultiplier?: number;
  effectExpiresOnDay?: number;
}

export interface SeasonProgress {
  seasonId: string;
  startedOnDay: number;
  endsOnDay: number;
  points: number;
  claimedChallengeKeys: string[];
  claimedLoginRewardDay?: number;
}

export type ContractStatus = 'active' | 'completed' | 'failed';

export interface BusinessContract {
  id: string;
  clientName: string;
  clientType: 'budget' | 'quality' | 'bulk' | 'urgent';
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  reward: number;
  reputationReward: number;
  minimumQuality?: number;
  deadlineDay: number;
  acceptedOnDay: number;
  status: ContractStatus;
  completedOnDay?: number;
  failedOnDay?: number;
  negotiated?: boolean;
  negotiationNote?: string;
}

export interface AchievementRecord {
  id: string;
  earnedAtDay: number;
  title: string;
}

export interface OnboardingProgress {
  introCompleted: boolean;
  chapter: number;
  seenGuides: string[];
  countryIntroSeen?: boolean;
  walkthroughCompleted?: boolean;
  walkthroughSkipped?: boolean;
  walkthroughStepId?: string;
  seenQuestBriefings?: string[];
  claimedStoryQuestIds?: string[];
  claimedCampaignChapters?: number[];
  campaignChapterId?: number;
  starterMissionStage?: number;
  claimedStarterMissionIds?: string[];
  completedStarterMissionIds?: string[];
}

export type CommodityGrade = 'A+' | 'B' | 'C';
export type GlobalShippingMode = 'spot-ddp' | 'sea-cif' | 'air-express';
export type GlobalPaymentTerm = 'cash-spot' | 'lc-net2';

export interface GlobalShipmentRecord {
  id: string;
  direction: 'import' | 'export';
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  unitCostOrPrice: number;
  freightCost: number;
  customsDuty: number;
  shippingMode: GlobalShippingMode;
  originOrDestination: string;
  partnerName: string;
  qualityScore: number;
  orderedOnDay: number;
  arrivesOnDay: number;
  deferredBalanceDue: number;
  status: 'in-transit' | 'delivered';
}

export interface ForwardSupplyContract {
  id: string;
  materialId: string;
  materialName: string;
  supplierName: string;
  originHub: string;
  lockedUnitPrice: number;
  dailyQuota: number;
  remainingQuota: number;
  marginPaid: number;
  startedOnDay: number;
  expiresOnDay: number;
  qualityScore: number;
  status: 'active' | 'completed' | 'expired';
}
