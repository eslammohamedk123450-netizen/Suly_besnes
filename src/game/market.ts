import type { PlayerProfile } from '../domain/player';
import { PRODUCT_CATALOG } from './catalog';
import { getMarketPriceProgression } from './economyBalance';

export type MarketTrend = 'up' | 'down' | 'steady';

export interface MarketQuote {
  productId: string;
  demandUnits: number;
  currentPrice: number;
  basePrice: number;
  trend: MarketTrend;
  trendLabel: string;
}

function seededValue(seed: string): number {
  let hash = 2_166_136_261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}

/**
 * Fictional local-market data. The seed makes a world's daily market repeatable
 * after reloads without pretending to use a real market feed.
 */
export function getMarketQuote(profile: PlayerProfile, productId: string, day = profile.day): MarketQuote | null {
  const product = PRODUCT_CATALOG.find((item) => item.id === productId);
  if (!product) return null;
  const productIndex = PRODUCT_CATALOG.findIndex((item) => item.id === productId);
  const seed = seededValue(`${profile.id}:${productId}:${day}`);
  const priceShift = (seed % 31) - 15;
  const demandShift = (Math.floor(seed / 31) % 11) - 5;
  const baseDemand = 16 + ((productIndex * 5) % 13);
  const currentPrice = Math.max(1, Math.round(product.baseSellPrice * getMarketPriceProgression(day) * (1 + priceShift / 100)));
  const trend: MarketTrend = priceShift >= 6 ? 'up' : priceShift <= -6 ? 'down' : 'steady';
  return {
    productId,
    demandUnits: Math.max(4, baseDemand + demandShift),
    currentPrice,
    basePrice: product.baseSellPrice,
    trend,
    trendLabel: trend === 'up' ? 'طلب مرتفع' : trend === 'down' ? 'سوق هادئ' : 'سوق مستقر',
  };
}
