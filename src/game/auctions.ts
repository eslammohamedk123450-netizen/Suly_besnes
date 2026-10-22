import type { AuctionListing } from '../domain/futureSystems';
import type { PlayerProfile } from '../domain/player';
import { AUCTION_CATALOG } from './catalog';

const DAY_MS = 86_400_000;

export function getAuctionCloseAt(profile: PlayerProfile, listing: AuctionListing): string {
  const base = Date.parse(profile.createdAt);
  const safeBase = Number.isFinite(base) ? base : Date.now();
  const cycleStart = safeBase + Math.max(0, profile.day - 1) * DAY_MS;
  const index = Math.max(0, AUCTION_CATALOG.findIndex((item) => item.id === listing.id));
  const closeHour = Math.min(23, 20 + index);
  return new Date(cycleStart + closeHour * 60 * 60 * 1000).toISOString();
}

export function isAuctionOpen(profile: PlayerProfile, listing: AuctionListing): boolean {
  return listing.status === 'open' && Date.now() < Date.parse(getAuctionCloseAt(profile, listing));
}

export function formatAuctionCountdown(closeAt: string): string {
  const remaining = Math.max(0, Date.parse(closeAt) - Date.now());
  const hours = Math.floor(remaining / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  return remaining > 0 ? `${hours} س ${minutes} د` : 'أُغلق';
}
