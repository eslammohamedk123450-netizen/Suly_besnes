import type { AuctionListing } from '../domain/futureSystems';
import type { PlayerProfile } from '../domain/player';
import { AUCTION_CATALOG } from './catalog';
import { GAME_DAY_MS } from './time';

const DAY_MS = GAME_DAY_MS;

export function getAuctionCloseAt(profile: PlayerProfile, listing: AuctionListing): string {
  const base = Date.parse(profile.createdAt);
  const safeBase = Number.isFinite(base) ? base : Date.now();
  const cycleStart = safeBase + Math.max(0, profile.day - 1) * DAY_MS;
  const index = Math.max(0, AUCTION_CATALOG.findIndex((item) => item.id === listing.id));
  const closeHour = Math.min(23, 20 + index);
  return new Date(cycleStart + closeHour * 60 * 60 * 1000).toISOString();
}

function wasWon(profile: PlayerProfile, listingId: string): boolean {
  return profile.lands.some((land) => land.id === listingId || land.id.startsWith(`${listingId}-renewed-`))
    || profile.assets.some((asset) => asset.id === listingId || asset.id.startsWith(`${listingId}-renewed-`))
    || profile.auctionHistory.some((bid) => bid.listingId.startsWith(listingId) && bid.bidder === 'player');
}

export function getAuctionListings(profile: PlayerProfile): AuctionListing[] {
  // الفوز يستهلك المزاد نهائيًا؛ لا نعيد إدراج نفس السلعة تلقائيًا.
  return AUCTION_CATALOG.filter((base) => !wasWon(profile, base.id));
}

export function resolveAuctionListing(profile: PlayerProfile, listingId: string): AuctionListing | undefined {
  return getAuctionListings(profile).find((listing) => listing.id === listingId);
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
