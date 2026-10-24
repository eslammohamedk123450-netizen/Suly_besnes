import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import type { CountryDefinition } from '../domain/countries';
import type { AuctionListing } from '../domain/futureSystems';
import type { PlayerProfile } from '../domain/player';
import type { GameResult } from '../game/engine';
import { formatMoney, formatNumber } from '../domain/formatters';
import { AUCTION_BID_STEP, AUCTION_DEFAULT_LEAD } from '../game/time';
import { MATERIAL_CATALOG } from '../game/catalog';
import { Icon } from './Icon';
import { useDialogA11y } from './useDialogA11y';

interface AuctionRoomProps {
  profile: PlayerProfile;
  country: CountryDefinition;
  listing: AuctionListing;
  onClose: () => void;
  onBid: (amount: number, targetCompanyId?: string) => GameResult<unknown>;
}

const ROUND_SECONDS = 10;
const AI_PARTICIPANTS = ['محمود الشاذلي', 'سارة المنصوري', 'يوسف البدري', 'ليلى حمدان'];
type FeedBid = { id: string; bidder: string; amount: number; player?: boolean };

export function AuctionRoom({ profile, country, listing, onClose, onBid }: AuctionRoomProps) {
  const material = MATERIAL_CATALOG.find((item) => item.id === listing.materialId);
  const lotSummary = listing.lotType === 'land'
    ? `${formatNumber(listing.areaSquareMeters)} م² · أرض ${listing.landType === 'industrial' ? 'صناعية' : listing.landType === 'agricultural' ? 'زراعية' : 'تجارية'}`
    : listing.lotType === 'factory'
      ? `توسعة طاقة مصنع بمقدار ${formatNumber(listing.energyCapacityBonus ?? 0)} وحدة`
      : `شحنة ${formatNumber(listing.quantity ?? 0)} ${material?.unit ?? 'وحدة'} من ${material?.name ?? 'مواد خام'}`;
  const history = profile.auctionHistory.filter((bid) => bid.listingId === listing.id).slice().reverse();
  const storedCurrentBid = history.reduce((highest, bid) => Math.max(highest, bid.amount), listing.minimumBid);
  const initialFeed = history.slice(0, 7).map((bid) => ({ id: bid.id, bidder: bid.bidder === 'player' ? 'أنت' : AI_PARTICIPANTS[0], amount: bid.amount, player: bid.bidder === 'player' }));
  const [currentBid, setCurrentBid] = useState(storedCurrentBid);
  const [leader, setLeader] = useState(history[0]?.bidder === 'player' ? 'أنت' : history[0] ? AI_PARTICIPANTS[0] : 'لم يبدأ التنافس');
  const [feed, setFeed] = useState<FeedBid[]>(initialFeed);
  const [amount, setAmount] = useState(String(storedCurrentBid + AUCTION_DEFAULT_LEAD));
  const [targetCompanyId, setTargetCompanyId] = useState(profile.companies[0]?.id ?? '');
  const [message, setMessage] = useState(`الجولة مفتوحة. قدّم عرضًا قبل انتهاء العداد.`);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [roundEndsAt, setRoundEndsAt] = useState(Date.now() + ROUND_SECONDS * 1000);
  const [finished, setFinished] = useState(false);
  const [roundBids, setRoundBids] = useState(0);
  const currentBidRef = useRef(currentBid);
  const roundEndsAtRef = useRef(roundEndsAt);
  const playerLeadingRef = useRef(false);
  const pendingAmountRef = useRef(0);
  const lastBotAtRef = useRef(Date.now());
  const botIndexRef = useRef(0);
  const dialogRef = useRef<HTMLElement | null>(null);
  useDialogA11y(dialogRef, onClose);

  useEffect(() => { currentBidRef.current = currentBid; }, [currentBid]);
  useEffect(() => { roundEndsAtRef.current = roundEndsAt; }, [roundEndsAt]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const currentTime = Date.now();
      setNow(currentTime);
      if (finished) return;
      if (currentTime >= roundEndsAtRef.current) {
        setFinished(true);
        if (playerLeadingRef.current && pendingAmountRef.current > 0) {
          setBusy(true);
          const result = onBid(pendingAmountRef.current, listing.lotType === 'factory' ? targetCompanyId : undefined);
          setBusy(false);
          if (result.ok) setMessage(`${result.message} انتهت الجولة وفاز عرضك، وسيختفي المزاد من القائمة.`);
          else setMessage(result.message);
        } else {
          setMessage('انتهت الجولة؛ كان أعلى عرض لمنافس آخر. اختر مزادًا جديدًا للمحاولة مرة أخرى.');
        }
        return;
      }
      if (currentTime - lastBotAtRef.current >= 3_200 && roundBids < 5) {
        lastBotAtRef.current = currentTime;
        botIndexRef.current = (botIndexRef.current + 1) % AI_PARTICIPANTS.length;
        const bidder = AI_PARTICIPANTS[botIndexRef.current];
        const nextBid = currentBidRef.current + listing.bidIncrement;
        currentBidRef.current = nextBid;
        setCurrentBid(nextBid);
        setLeader(bidder);
        playerLeadingRef.current = false;
        setRoundBids((value) => value + 1);
        setFeed((items) => [{ id: `live-${currentTime}`, bidder, amount: nextBid }, ...items].slice(0, 8));
        setAmount((value) => Number(value) <= nextBid ? String(nextBid + AUCTION_DEFAULT_LEAD) : value);
        const nextEnd = currentTime + ROUND_SECONDS * 1000;
        roundEndsAtRef.current = nextEnd;
        setRoundEndsAt(nextEnd);
        setMessage(`${bidder} رفع العرض. العداد عاد إلى 10 ثوانٍ.`);
      }
    }, 250);
    return () => window.clearInterval(timer);
  }, [finished, listing.bidIncrement, listing.lotType, onBid, roundBids, targetCompanyId]);

  function changeAmount(delta: number) {
    const next = Math.max(listing.minimumBid, Number(amount || currentBidRef.current) + delta);
    setAmount(String(next));
    setMessage('');
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (finished || Date.now() >= roundEndsAtRef.current) { setMessage('انتهت الجولة. افتح المزاد مرة أخرى للمحاولة.'); return; }
    const numericAmount = Number(amount);
    if (!Number.isInteger(numericAmount) || numericAmount <= currentBidRef.current) {
      setMessage(`يجب أن يكون عرضك أعلى من العرض الحالي ${formatMoney(currentBidRef.current, country)}.`);
      return;
    }
    if (profile.bankBalance < numericAmount) { setMessage('لا يكفي رصيدك لتغطية العرض عند الفوز.'); return; }
    currentBidRef.current = numericAmount;
    pendingAmountRef.current = numericAmount;
    playerLeadingRef.current = true;
    setCurrentBid(numericAmount);
    setLeader('أنت');
    setRoundBids((value) => value + 1);
    setFeed((items) => [{ id: `player-${Date.now()}`, bidder: 'أنت', amount: numericAmount, player: true }, ...items].slice(0, 8));
    const nextEnd = Date.now() + ROUND_SECONDS * 1000;
    roundEndsAtRef.current = nextEnd;
    setRoundEndsAt(nextEnd);
    setMessage('تم تسجيل عرضك. إذا لم يرفع أحد خلال 10 ثوانٍ تفوز بالجولة.');
  }

  const remainingSeconds = Math.max(0, Math.ceil((roundEndsAt - now) / 1000));
  const totalBids = history.length + roundBids;
  const seatNames = useMemo(() => ['أنت', ...AI_PARTICIPANTS.slice(0, 3)], []);
  return (
    <div className="auction-room-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={dialogRef} className="auction-room" role="dialog" aria-modal="true" aria-labelledby="auction-room-title" dir="rtl" tabIndex={-1}>
        <header className="auction-room-header"><div><span className="section-kicker">قاعة المزاد · منافسون خياليون</span><h2 id="auction-room-title">{listing.label}</h2><p>{lotSummary}</p></div><button className="icon-button auction-room-close" type="button" onClick={onClose} aria-label="إغلاق قاعة المزاد"><Icon name="close" size={19} /></button></header>
        <div className={`auction-room-status${finished ? ' auction-room-status--ended' : ''}`}><span><i className="auction-live-dot" /> {finished ? 'انتهت الجولة' : 'الجولة مفتوحة'} · {totalBids} عروض</span><strong className="auction-countdown"><Icon name="clock" size={14} /> {remainingSeconds} ثوانٍ</strong></div>
        <div className="auction-room-grid"><div className="auction-room-stage">
          <div className="auction-room-podium"><span className="auction-room-hammer"><Icon name="gavel" size={28} /></span><span className="section-kicker">مزاد متجدد ومتغير</span><h3>{listing.label}</h3><p>الحد الأدنى {formatMoney(listing.minimumBid, country)} · الزيادة {formatMoney(listing.bidIncrement, country)}</p><div className="auction-room-current"><small>العرض الحالي · {leader}</small><strong>{formatMoney(currentBid, country)}</strong><span>كل عرض جديد يعيد العداد إلى 10 ثوانٍ</span></div></div>
          <div className="auction-room-table"><div className="auction-room-table-top"><span>المشاركون</span><small>أسماء خيالية تتغير في كل جولة</small></div><div className="auction-seats">{seatNames.map((name, index) => <div className={`auction-seat${index === 0 ? ' auction-seat--player' : ''}`} key={name}><span className="auction-seat-avatar">{index === 0 ? 'أ' : index + 1}</span><span>{name}</span><small>{index === 0 ? (leader === 'أنت' ? 'المتصدر' : 'مشارك') : leader === name ? 'يدفع الآن' : 'مشارك'}</small></div>)}</div></div>
        </div><aside className="auction-room-sidebar">
          <div className="auction-room-panel"><div className="auction-room-panel-heading"><strong>سجل النداء</strong><span>الأحدث أولًا</span></div>{feed.length === 0 ? <div className="auction-room-empty"><Icon name="gavel" size={20} /><span>افتح الجولة بأول عرض لك</span></div> : <div className="auction-bid-feed">{feed.map((bid, index) => <div className={`auction-bid-row${index === 0 ? ' auction-bid-row--latest' : ''}`} key={bid.id}><span className="auction-bid-badge">{bid.player ? 'أنت' : bid.bidder}</span><span>{bid.player ? 'عرضك المسجل' : 'رفع العرض'}</span><strong>{formatMoney(bid.amount, country)}</strong></div>)}</div>}</div>
          <form className="auction-room-bid-form" onSubmit={submit}><div className="auction-room-panel-heading"><strong>زاوية المزايدة</strong><span>زيادة 20,000</span></div><label className="economy-field"><span>عرضك ({country.currency.symbol})</span><input autoFocus type="number" min={listing.minimumBid} step={AUCTION_BID_STEP} value={amount} onChange={(event) => setAmount(event.target.value)} disabled={finished} /></label><div className="auction-amount-controls"><button type="button" className="button button-secondary" onClick={() => changeAmount(-AUCTION_BID_STEP)} disabled={finished || Number(amount) <= listing.minimumBid}>− 10,000</button><button type="button" className="button button-secondary" onClick={() => changeAmount(AUCTION_BID_STEP)} disabled={finished}>+ 10,000</button></div>{listing.lotType === 'factory' && <label className="economy-field"><span>الشركة المستقبلة للتوسعة</span><select value={targetCompanyId} onChange={(event) => setTargetCompanyId(event.target.value)} disabled={finished}>{profile.companies.map((company) => <option value={company.id} key={company.id}>{company.name}</option>)}</select></label>}<button className="button button-primary auction-room-bid-button" type="submit" disabled={busy || finished || profile.bankBalance < numericAmountSafe(amount)}><Icon name="gavel" size={17} />{busy ? 'جارٍ إغلاق الجولة...' : finished ? 'انتهت الجولة' : 'قدّم العرض'}</button>{message && <p className="auction-room-message" role="status">{message}</p>}</form>
        </aside></div>
        <footer className="auction-room-footer"><span><Icon name="shield" size={14} /> لا يُخصم المال إلا بعد انتهاء الـ10 ثوانٍ وفوز عرضك. الأسماء داخل الجولة خيالية.</span><button className="button button-secondary" type="button" onClick={onClose}>العودة إلى قائمة المزادات</button></footer>
      </section>
    </div>
  );
}

function numericAmountSafe(value: string): number { const amount = Number(value); return Number.isFinite(amount) ? amount : Number.MAX_SAFE_INTEGER; }
