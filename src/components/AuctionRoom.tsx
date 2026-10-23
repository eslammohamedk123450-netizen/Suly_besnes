import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { CountryDefinition } from '../domain/countries';
import type { AuctionListing } from '../domain/futureSystems';
import type { PlayerProfile } from '../domain/player';
import type { GameResult } from '../game/engine';
import { formatMoney, formatNumber } from '../domain/formatters';
import { formatAuctionCountdown, getAuctionCloseAt } from '../game/auctions';
import { AUCTION_BID_STEP, AUCTION_DEFAULT_LEAD } from '../game/time';
import { MATERIAL_CATALOG } from '../game/catalog';
import { Icon } from './Icon';

interface AuctionRoomProps {
  profile: PlayerProfile;
  country: CountryDefinition;
  listing: AuctionListing;
  onClose: () => void;
  onBid: (amount: number, targetCompanyId?: string) => GameResult<unknown>;
}

export function AuctionRoom({ profile, country, listing, onClose, onBid }: AuctionRoomProps) {
  const material = MATERIAL_CATALOG.find((item) => item.id === listing.materialId);
  const lotSummary = listing.lotType === 'land'
    ? `${formatNumber(listing.areaSquareMeters)} م² · أرض ${listing.landType === 'industrial' ? 'صناعية' : listing.landType === 'agricultural' ? 'زراعية' : 'تجارية'}`
    : listing.lotType === 'factory'
      ? `توسعة طاقة مصنع بمقدار ${formatNumber(listing.energyCapacityBonus ?? 0)} وحدة`
      : `شحنة ${formatNumber(listing.quantity ?? 0)} ${material?.unit ?? 'وحدة'} من ${material?.name ?? 'مواد خام'}`;
  const history = profile.auctionHistory.filter((bid) => bid.listingId === listing.id).slice().reverse();
  const storedCurrentBid = history.reduce((highest, bid) => Math.max(highest, bid.amount), listing.minimumBid);
  const [currentBid, setCurrentBid] = useState(storedCurrentBid);
  const [liveBidCount, setLiveBidCount] = useState(0);
  const [leader, setLeader] = useState(history[0]?.bidder === 'player' ? 'أنت' : history[0] ? 'منافس آلي' : 'لم يبدأ التنافس');
  const [amount, setAmount] = useState(String(storedCurrentBid + AUCTION_DEFAULT_LEAD));
  const [targetCompanyId, setTargetCompanyId] = useState(profile.companies[0]?.id ?? '');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const closeAt = getAuctionCloseAt(profile, listing);
  const seatNames = useMemo(() => ['المقعد 01 · أنت', 'المقعد 02 · منافس آلي', 'المقعد 03 · منافس آلي', 'المقعد 04 · مراقب'], []);

  useEffect(() => {
    // محاكاة وصول عروض المنافسين أثناء بقاء الجلسة مفتوحة، مع تحديث الرقم والعدد كل عدة ثوانٍ.
    const timer = window.setInterval(() => {
      if (Date.now() >= Date.parse(closeAt) || liveBidCount >= 6) return;
      setCurrentBid((previous) => previous + listing.bidIncrement);
      setLiveBidCount((previous) => previous + 1);
      setLeader('منافس آلي');
      setAmount((previous) => Number(previous) <= currentBid ? String(currentBid + AUCTION_DEFAULT_LEAD) : previous);
    }, 4_000);
    return () => window.clearInterval(timer);
  }, [closeAt, currentBid, listing.bidIncrement, liveBidCount]);

  function changeAmount(delta: number) {
    const next = Math.max(listing.minimumBid, Number(amount || currentBid) + delta);
    setAmount(String(next));
    setMessage('');
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!Number.isInteger(numericAmount) || numericAmount <= currentBid) {
      setMessage(`يجب أن يكون عرضك أعلى من العرض الحالي ${formatMoney(currentBid, country)}.`);
      return;
    }
    setBusy(true);
    setMessage('جارٍ اعتماد العرض من رئيس الجلسة...');
    const result = onBid(numericAmount, listing.lotType === 'factory' ? targetCompanyId : undefined);
    setBusy(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setCurrentBid(numericAmount);
    setLeader('أنت');
    setMessage(`${result.message} اختفى المزاد من القائمة بعد الفوز.`);
  }

  const totalBids = history.length + liveBidCount;
  return (
    <div className="auction-room-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="auction-room" role="dialog" aria-modal="true" aria-labelledby="auction-room-title" dir="rtl">
        <header className="auction-room-header">
          <div><span className="section-kicker">قاعة المزاد · جلسة مباشرة</span><h2 id="auction-room-title">{listing.label}</h2><p>{lotSummary}</p></div>
          <button className="icon-button auction-room-close" type="button" onClick={onClose} aria-label="إغلاق قاعة المزاد"><Icon name="close" size={19} /></button>
        </header>
        <div className="auction-room-status"><span><i className="auction-live-dot" /> الجلسة مفتوحة · {totalBids} عروض</span><strong><Icon name="clock" size={14} /> الإغلاق خلال {formatAuctionCountdown(closeAt)}</strong></div>
        <div className="auction-room-grid">
          <div className="auction-room-stage">
            <div className="auction-room-podium"><span className="auction-room-hammer"><Icon name="gavel" size={28} /></span><span className="section-kicker">المزاد رقم {listing.id.split('-').slice(-1)[0] || '01'}</span><h3>{listing.label}</h3><p>الحد الأدنى {formatMoney(listing.minimumBid, country)} · الزيادة {formatMoney(listing.bidIncrement, country)}</p><div className="auction-room-current"><small>العرض الحالي · {leader}</small><strong>{formatMoney(currentBid, country)}</strong><span>عرضك المقترح تلقائيًا {formatMoney(currentBid + AUCTION_DEFAULT_LEAD, country)}</span></div></div>
            <div className="auction-room-table"><div className="auction-room-table-top"><span>طاولة المنافسين</span><small>{totalBids ? `${totalBids} عروض مسجلة وتتحدث` : 'لم يبدأ التنافس بعد'}</small></div><div className="auction-seats">{seatNames.map((name, index) => <div className={`auction-seat${index === 0 ? ' auction-seat--player' : ''}`} key={name}><span className="auction-seat-avatar">{index === 0 ? 'أ' : index + 1}</span><span>{name}</span><small>{index === 0 ? (leader === 'أنت' ? 'أعلى عرض' : 'أنت') : index === 3 ? 'متابع' : leader === 'منافس آلي' ? 'يدفع الآن' : 'في الانتظار'}</small></div>)}</div></div>
          </div>
          <aside className="auction-room-sidebar">
            <div className="auction-room-panel"><div className="auction-room-panel-heading"><strong>سجل النداء</strong><span>الأحدث أولًا</span></div>{history.length === 0 && liveBidCount === 0 ? <div className="auction-room-empty"><Icon name="gavel" size={20} /><span>افتح الجلسة بأول عرض لك</span></div> : <div className="auction-bid-feed">{history.slice(0, 7).map((bid, index) => <div className={`auction-bid-row${index === 0 ? ' auction-bid-row--latest' : ''}`} key={bid.id}><span className="auction-bid-badge">{bid.bidder === 'player' ? 'أنت' : 'آلي'}</span><span>{bid.bidder === 'player' ? 'عرض المستثمر' : 'رفع المنافس الآلي'}</span><strong>{formatMoney(bid.amount, country)}</strong></div>)}{liveBidCount > 0 && <div className="auction-bid-row auction-bid-row--latest"><span className="auction-bid-badge">آلي</span><span>عرض جديد مباشر</span><strong>{formatMoney(currentBid, country)}</strong></div>}</div>}</div>
            <form className="auction-room-bid-form" onSubmit={submit}><div className="auction-room-panel-heading"><strong>زاوية المزايدة</strong><span>يزيد تلقائيًا 20,000 عن المتصدر</span></div><label className="economy-field"><span>عرضك ({country.currency.symbol})</span><input autoFocus type="number" min={listing.minimumBid} step={AUCTION_BID_STEP} value={amount} onChange={(event) => setAmount(event.target.value)} /></label><div className="auction-amount-controls"><button type="button" className="button button-secondary" onClick={() => changeAmount(-AUCTION_BID_STEP)} disabled={Number(amount) <= listing.minimumBid}>− 10,000</button><button type="button" className="button button-secondary" onClick={() => changeAmount(AUCTION_BID_STEP)}>+ 10,000</button></div>{listing.lotType === 'factory' && <label className="economy-field"><span>الشركة التي ستستقبل التوسعة</span><select value={targetCompanyId} onChange={(event) => setTargetCompanyId(event.target.value)}>{profile.companies.map((company) => <option value={company.id} key={company.id}>{company.name}</option>)}</select></label>}<button className="button button-primary auction-room-bid-button" type="submit" disabled={busy || profile.bankBalance < numericAmountSafe(amount)}><Icon name="gavel" size={17} />{busy ? 'جارٍ اعتماد العرض...' : 'ارفع العرض الآن'}</button>{message && <p className="auction-room-message" role="status">{message}</p>}</form>
          </aside>
        </div>
        <footer className="auction-room-footer"><span><Icon name="shield" size={14} /> يُخصم المبلغ عند الفوز فقط، والمزاد الفائز يختفي فورًا.</span><button className="button button-secondary" type="button" onClick={onClose}>العودة إلى قائمة المزادات</button></footer>
      </section>
    </div>
  );
}

function numericAmountSafe(value: string): number {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : Number.MAX_SAFE_INTEGER;
}
