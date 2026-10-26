import type { PlayerProfile } from '../domain/player';
import type { BusinessContract } from '../domain/futureSystems';
import { findRecipeForIndustry, PRODUCT_CATALOG } from './catalog';
import { getCountryScenario } from './countryScenarios';
import { getMarketQuote } from './market';

function hash(value: string): number {
  let result = 2166136261;
  for (const character of value) result = Math.imul(result ^ character.charCodeAt(0), 16777619);
  return result >>> 0;
}

export interface ContractOffer extends Omit<BusinessContract, 'status' | 'acceptedOnDay'> {
  description: string;
}

export function getContractOffers(profile: PlayerProfile): ContractOffer[] {
  const clients = getCountryScenario(profile.countryId).clients;
  const ownedProductIds = (profile.companies ?? [])
    .map((company) => findRecipeForIndustry(company.industryId)?.productId)
    .filter((id): id is string => Boolean(id));

  const rawProducts = [0, 1, 2].map((slot) => {
    const index = hash(`${profile.id}:${profile.day}:${slot}`) % PRODUCT_CATALOG.length;
    return PRODUCT_CATALOG[index];
  });

  if (ownedProductIds.length > 0 && !rawProducts.some((p) => ownedProductIds.includes(p.id))) {
    const ownedProduct = PRODUCT_CATALOG.find((p) => p.id === ownedProductIds[0]);
    if (ownedProduct) {
      rawProducts[0] = ownedProduct;
    }
  }

  return [0, 1, 2].map((slot) => {
    const product = rawProducts[slot];
    const client = clients[hash(`${profile.id}:${profile.day}:client:${slot}`) % clients.length];
    const quote = getMarketQuote(profile, product.id) ?? { currentPrice: product.baseSellPrice, demandUnits: 12 };
    const quantity = client.type === 'bulk' ? 18 + (hash(`${profile.day}:${slot}`) % 12) : 5 + (hash(`${profile.day}:qty:${slot}`) % 8);
    const deadline = profile.day + (client.type === 'urgent' ? 1 : client.type === 'bulk' ? 4 : 3);
    const unitPrice = Math.max(1, Math.round(quote.currentPrice * client.multiplier));
    return {
      id: `contract-${profile.day}-${slot}`,
      clientName: client.name,
      clientType: client.type,
      productId: product.id,
      productName: product.name,
      quantity,
      unitPrice,
      reward: Math.round(unitPrice * quantity * 0.12),
      reputationReward: client.type === 'urgent' ? 8 : 5,
      minimumQuality: client.minimumQuality,
      deadlineDay: deadline,
      description: client.description,
    };
  });
}

export function getCustomerSegmentLabel(type: BusinessContract['clientType']): string {
  return type === 'budget' ? 'حساس للسعر' : type === 'quality' ? 'باحث عن الجودة' : type === 'bulk' ? 'مشتري جملة' : 'طلب عاجل';
}
