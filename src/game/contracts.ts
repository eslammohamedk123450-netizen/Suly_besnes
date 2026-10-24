import type { PlayerProfile } from '../domain/player';
import type { BusinessContract } from '../domain/futureSystems';
import { PRODUCT_CATALOG } from './catalog';
import { getMarketQuote } from './market';

const CLIENTS: readonly { name: string; type: BusinessContract['clientType']; multiplier: number; description: string }[] = [
  { name: 'متجر المدينة الاقتصادي', type: 'budget', multiplier: 0.92, description: 'يركّز على السعر المنخفض والتوريد المنتظم.' },
  { name: 'مؤسسة الجودة الأولى', type: 'quality', multiplier: 1.18, description: 'يدفع أكثر للمنتجات ذات الجودة العالية.' },
  { name: 'شركة التوزيع الكبرى', type: 'bulk', multiplier: 1.04, description: 'يطلب كميات كبيرة مقابل مكافأة حجم.' },
  { name: 'عميل التوريد العاجل', type: 'urgent', multiplier: 1.28, description: 'مهلة قصيرة ومكافأة مرتفعة للمستعد.' },
];

function hash(value: string): number {
  let result = 2166136261;
  for (const character of value) result = Math.imul(result ^ character.charCodeAt(0), 16777619);
  return result >>> 0;
}

export interface ContractOffer extends Omit<BusinessContract, 'status' | 'acceptedOnDay'> {
  description: string;
}

export function getContractOffers(profile: PlayerProfile): ContractOffer[] {
  return [0, 1, 2].map((slot) => {
    const index = hash(`${profile.id}:${profile.day}:${slot}`) % PRODUCT_CATALOG.length;
    const product = PRODUCT_CATALOG[index];
    const client = CLIENTS[(hash(`${profile.id}:${profile.day}:client:${slot}`) % CLIENTS.length)];
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
      minimumQuality: client.type === 'quality' ? 92 : undefined,
      deadlineDay: deadline,
      description: client.description,
    };
  });
}

export function getCustomerSegmentLabel(type: BusinessContract['clientType']): string {
  return type === 'budget' ? 'حساس للسعر' : type === 'quality' ? 'باحث عن الجودة' : type === 'bulk' ? 'مشتري جملة' : 'طلب عاجل';
}
