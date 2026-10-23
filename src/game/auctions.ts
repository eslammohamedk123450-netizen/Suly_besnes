import type { AuctionListing } from '../domain/futureSystems';
import type { PlayerProfile } from '../domain/player';
import { AUCTION_CATALOG } from './catalog';
import { GAME_DAY_MS } from './time';

const REGULAR_AUCTION_LIFETIME_DAYS = 7;

export function getAuctionCloseAt(profile: PlayerProfile, listing: AuctionListing): string {
  const parsedStart = Date.parse(profile.createdAt);
  const worldStart = Number.isFinite(parsedStart) ? parsedStart : Date.now();
  const dailyListing = listing.id.match(/^season-rare-(\d+)$/);
  const closeAt = dailyListing
    ? worldStart + Number(dailyListing[1]) * GAME_DAY_MS
    : worldStart + REGULAR_AUCTION_LIFETIME_DAYS * GAME_DAY_MS;
  return new Date(closeAt).toISOString();
}

function wasWon(profile: PlayerProfile, listingId: string): boolean {
  return profile.lands.some((land) => land.id === listingId || land.id.startsWith(`${listingId}-renewed-`))
    || profile.assets.some((asset) => asset.id === listingId || asset.id.startsWith(`${listingId}-renewed-`))
    || profile.auctionHistory.some((bid) => bid.listingId.startsWith(listingId) && bid.bidder === 'player');
}

export function getAuctionListings(profile: PlayerProfile): AuctionListing[] {
  // تفوز كل سلعة مرة واحدة؛ العروض الموسمية الجديدة لها معرّف وموعد إغلاق لكل يوم.
  const regular = AUCTION_CATALOG.filter((base) => !wasWon(profile, base.id));
  const rareId = `season-rare-${profile.day}`;
  const rare: AuctionListing = {
    id: rareId,
    countryId: 'egypt',
    lotType: 'factory',
    label: `مزاد الموسم النادر · توسعة اليوم ${profile.day}`,
    landType: 'industrial',
    areaSquareMeters: 0,
    minimumBid: 450_000 + (profile.day % 3) * 25_000,
    bidIncrement: 25_000,
    closesAt: new Date(Date.parse(profile.createdAt) + profile.day * GAME_DAY_MS).toISOString(),
    status: 'open',
    energyCapacityBonus: 90,
  };
  return profile.auctionHistory.some((bid) => bid.listingId === rareId && bid.bidder === 'player') ? regular : [...regular, rare];
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
