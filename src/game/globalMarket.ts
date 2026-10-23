import type { PlayerProfile } from '../domain/player';
import { MATERIAL_CATALOG, findMaterial } from './catalog';

export interface GlobalMarketOffer {
  id: string;
  materialId: string;
  sellerName: string;
  unitPrice: number;
  floorPrice: number;
  negotiable: boolean;
  confidence: 'high' | 'medium' | 'low';
}

const SELLERS = ['موانئ المتوسط', 'شبكة النيل للتوريد', 'تجارة الشرق', 'تحالف المصانع'];
const PRICE_FACTORS = [0.92, 1, 1.12];

export function getGlobalMarketOffers(profile: PlayerProfile): GlobalMarketOffer[] {
  return MATERIAL_CATALOG.flatMap((material, materialIndex) => [0, 1, 2].map((offerIndex) => {
    const factor = PRICE_FACTORS[(offerIndex + profile.day + materialIndex) % PRICE_FACTORS.length];
    const unitPrice = Math.max(1, Math.round(material.pricePerUnit * factor));
    const negotiable = (offerIndex + profile.day + materialIndex) % 3 !== 1;
    return {
      id: `global-${material.id}-day-${profile.day}-offer-${offerIndex}`,
      materialId: material.id,
      sellerName: SELLERS[(materialIndex + offerIndex + profile.day) % SELLERS.length],
      unitPrice,
      floorPrice: negotiable ? Math.max(1, Math.round(unitPrice * 0.9)) : unitPrice,
      negotiable,
      confidence: offerIndex === 1 ? 'high' : offerIndex === 0 ? 'medium' : 'low',
    } satisfies GlobalMarketOffer;
  }));
}

export function resolveGlobalMarketOffer(profile: PlayerProfile, offerId: string): GlobalMarketOffer | undefined {
  return getGlobalMarketOffers(profile).find((offer) => offer.id === offerId);
}

export function negotiateGlobalMarketOffer(profile: PlayerProfile, offerId: string): { accepted: boolean; unitPrice?: number; message: string } {
  const offer = resolveGlobalMarketOffer(profile, offerId);
  if (!offer) return { accepted: false, message: 'العرض لم يعد متاحًا في دورة السوق الحالية.' };
  if (!offer.negotiable) return { accepted: false, unitPrice: offer.unitPrice, message: `عرض ${offer.sellerName} ثابت ولا يقبل التفاوض.` };
  const accepted = (profile.day + offer.id.length) % 5 !== 0;
  if (!accepted) return { accepted: false, unitPrice: offer.unitPrice, message: `رفض ${offer.sellerName} التفاوض؛ يمكنك قبول السعر الأصلي.` };
  const negotiatedPrice = offer.floorPrice;
  return { accepted: true, unitPrice: negotiatedPrice, message: `وافق ${offer.sellerName} على ${negotiatedPrice.toLocaleString('ar-EG')} ج.م لكل ${findMaterial(offer.materialId)?.unit ?? 'وحدة'}.` };
}
