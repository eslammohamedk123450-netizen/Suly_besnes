import { describe, expect, it } from 'vitest';
import { getAuctionListings, getAuctionCloseAt, isAuctionOpen } from './auctions';
import { createNewPlayer } from '../domain/player';
import { findCountry } from '../domain/countries';

const newTestProfile = () => createNewPlayer(findCountry('egypt')!, 'اختبار المزاد', new Date());

describe('daily auction cycles', () => {
  it('creates a fresh listing id and close time for each game day', () => {
    const dayOne = newTestProfile();
    const dayTwo = { ...dayOne, day: 2 };
    const first = getAuctionListings(dayOne).find((listing) => listing.id.startsWith('land-'));
    const second = getAuctionListings(dayTwo).find((listing) => listing.id.startsWith('land-'));

    expect(first).toBeDefined();
    expect(second).toBeDefined();
    expect(first?.id).not.toBe(second?.id);
    expect(first?.closesAt).not.toBe(second?.closesAt);
  });

  it('keeps the current cycle open until its saved close time', () => {
    const profile = newTestProfile();
    const listing = getAuctionListings(profile)[0];

    expect(getAuctionCloseAt(profile, listing)).toBe(listing.closesAt);
    expect(isAuctionOpen(profile, listing)).toBe(true);
  });
});
