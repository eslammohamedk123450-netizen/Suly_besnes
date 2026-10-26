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
import { playSound } from '../game/soundEffects';
import { RIVAL_INVESTORS, type RivalInvestor } from '../game/dynamicAuctions';

interface AuctionRoomProps {
  profile: PlayerProfile;
  country: CountryDefinition;
  listing: AuctionListing;
  onClose: () => void;
  onBid: (amount: number, targetCompanyId?: string) => GameResult<unknown>;
  initialBid?: number;
}

const ROUND_SECONDS = 10;
type FeedBid = { id: string; bidder: string; amount: number; player?: boolean; type?: string };

export function AuctionRoom({ profile, country, listing, onClose, onBid, initialBid }: AuctionRoomProps) {
  const material = MATERIAL_CATALOG.find((item) => item.id === listing.materialId);
  const lotSummary = listing.lotType === 'land'
    ? `${formatNumber(listing.areaSquareMeters)} م² · أرض ${listing.landType === 'industrial' ? 'صناعية' : listing.landType === 'agricultural' ? 'زراعية' : 'تجارية'}`
    : listing.lotType === 'factory'
      ? `توسعة طاقة مصنع بمقدار ${formatNumber(listing.energyCapacityBonus ?? 0)} وحدة`
      : `شحنة ${formatNumber(listing.quantity ?? 0)} ${material?.unit ?? 'وحدة'} من ${material?.name ?? 'مواد خام'}`;

  // Seed 4 prominent rival investors for this session
  const rivalCandidates = useMemo(() => {
    const list: RivalInvestor[] = [];
    const seedOffset = Math.abs(listing.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % RIVAL_INVESTORS.length;
    for (let i = 0; i < 4; i++) {
      list.push(RIVAL_INVESTORS[(seedOffset + i * 3) % RIVAL_INVESTORS.length]);
    }
    return list;
  }, [listing.id]);

  const history = profile.auctionHistory.filter((bid) => bid.listingId === listing.id).slice().reverse();
  const storedCurrentBid = history.reduce((highest, bid) => Math.max(highest, bid.amount), listing.minimumBid);
  const initialFeed: FeedBid[] = history.slice(0, 7).map((bid) => ({
    id: bid.id,
    bidder: bid.bidder === 'player' ? 'أنت' : rivalCandidates[0].name,
    amount: bid.amount,
    player: bid.bidder === 'player',
    type: bid.bidder === 'player' ? 'المستثمر' : rivalCandidates[0].type,
  }));

  const [currentBid, setCurrentBid] = useState(storedCurrentBid);
  const [leader, setLeader] = useState(history[0]?.bidder === 'player' ? 'أنت' : history[0] ? rivalCandidates[0].name : 'في انتظار أول مزايدة');
  const [feed, setFeed] = useState<FeedBid[]>(initialFeed);
  const [amount, setAmount] = useState(String(initialBid ?? storedCurrentBid + AUCTION_DEFAULT_LEAD));
  const [targetCompanyId, setTargetCompanyId] = useState(profile.companies[0]?.id ?? '');
  const [message, setMessage] = useState(`الجولة مفتوحة. قدّم عرضك للمنافسة قبل انتهاء العداد.`);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [roundEndsAt, setRoundEndsAt] = useState(Date.now() + ROUND_SECONDS * 1000);
  const [finished, setFinished] = useState(false);
  const [roundBids, setRoundBids] = useState(0);

  const currentBidRef = useRef(currentBid);
  const roundEndsAtRef = useRef(roundEndsAt);
  const playerLeadingRef = useRef(false);
  const pendingAmountRef = useRef(0);
  const lastRivalBidAtRef = useRef(Date.now());
  const rivalIndexRef = useRef(0);
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
          if (result.ok) {
            setMessage(`${result.message} انتهت الجولة ورسى المزاد لصالحك! وسيتم إضافة الأصل لإمبراطوريتك.`);
            playSound('success');
          } else {
            setMessage(result.message);
          }
        } else {
          setMessage('انتهت الجولة ورسى المزاد لأعلى عرض مقدم من المستثمر المنافس.');
        }
        return;
      }

      // Rival investor counter-bid logic
      if (currentTime - lastRivalBidAtRef.current >= 3_000 && roundBids < 5) {
        lastRivalBidAtRef.current = currentTime;
        rivalIndexRef.current = (rivalIndexRef.current + 1) % rivalCandidates.length;
        const rival = rivalCandidates[rivalIndexRef.current];
        const nextBid = currentBidRef.current + listing.bidIncrement;
        currentBidRef.current = nextBid;
        setCurrentBid(nextBid);
        setLeader(rival.name);
        playerLeadingRef.current = false;
        setRoundBids((value) => value + 1);
        setFeed((items) => [
          { id: `live-${currentTime}`, bidder: rival.name, amount: nextBid, type: rival.type },
          ...items,
        ].slice(0, 8));
        setAmount((value) => Number(value) <= nextBid ? String(nextBid + AUCTION_DEFAULT_LEAD) : value);
        const nextEnd = currentTime + ROUND_SECONDS * 1000;
        roundEndsAtRef.current = nextEnd;
        setRoundEndsAt(nextEnd);
        setMessage(`قام [${rival.name}] برفع سعر المزاد. تم تجديد العداد إلى 10 ثوانٍ.`);
        playSound('click');
      }
    }, 250);

    return () => window.clearInterval(timer);
  }, [finished, listing.bidIncrement, listing.lotType, onBid, roundBids, targetCompanyId, rivalCandidates]);

  function changeAmount(delta: number) {
    const next = Math.max(listing.minimumBid, Number(amount || currentBidRef.current) + delta);
    setAmount(String(next));
    setMessage('');
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (finished || Date.now() >= roundEndsAtRef.current) {
      setMessage('انتهت الجولة الحالية. يمكنك ترقب الفرص القادمة.');
      return;
    }
    const numericAmount = Number(amount);
    if (!Number.isInteger(numericAmount) || numericAmount <= currentBidRef.current) {
      setMessage(`يجب أن يكون عرضك أعلى من العرض الحالي (${formatMoney(currentBidRef.current, country)}).`);
      return;
    }
    if (profile.bankBalance < numericAmount) {
      setMessage('السيولة المتاحة في حسابك البنكي لا تغطي هذا العرض عند الترسية.');
      return;
    }

    currentBidRef.current = numericAmount;
    pendingAmountRef.current = numericAmount;
    playerLeadingRef.current = true;
    setCurrentBid(numericAmount);
    setLeader('أنت');
    setRoundBids((value) => value + 1);
    setFeed((items) => [
      { id: `player-${Date.now()}`, bidder: 'أنت', amount: numericAmount, player: true, type: 'عرضك الاستثماري' },
      ...items,
    ].slice(0, 8));
    const nextEnd = Date.now() + ROUND_SECONDS * 1000;
    roundEndsAtRef.current = nextEnd;
    setRoundEndsAt(nextEnd);
    setMessage('تم اعتماد عرضك بنجاح. إذا لم يتقدم مستثمر آخر بعرض أعلى خلال 10 ثوانٍ، تفوز بالصفقة.');
    playSound('click');
  }

  const remainingSeconds = Math.max(0, Math.ceil((roundEndsAt - now) / 1000));
  const totalBids = history.length + roundBids;
  const safeBidRatio = profile.bankBalance > 0 ? numericAmountSafe(amount) / profile.bankBalance : 1;
  const bidProgress = Math.min(100, Math.max(0, ((currentBid - listing.minimumBid) / Math.max(listing.bidIncrement * 6, listing.minimumBid)) * 100));
  const seatList = useMemo(() => [
    { name: 'أنت', type: 'إمبراطوريتك', isPlayer: true },
    ...rivalCandidates.slice(0, 3).map((r) => ({ name: r.name, type: r.type, isPlayer: false })),
  ], [rivalCandidates]);

  return (
    <div className="auction-room-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={dialogRef} className="auction-room" role="dialog" aria-modal="true" aria-labelledby="auction-room-title" dir="rtl" tabIndex={-1}>
        <header className="auction-room-header">
          <div>
            <span className="section-kicker">قاعة المزاد المباشر · نخبة المستثمرين والصناديق</span>
            <h2 id="auction-room-title">{listing.label}</h2>
            <p>{lotSummary}</p>
          </div>
          <button className="icon-button auction-room-close" type="button" onClick={onClose} aria-label="إغلاق قاعة المزاد">
            <Icon name="close" size={19} />
          </button>
        </header>

        <div className={`auction-room-status${finished ? ' auction-room-status--ended' : ''}`}>
          <span><i className="auction-live-dot" /> {finished ? 'انتهت الجلسة' : 'جلسة المزايدة مفتوحة'} · {totalBids} عروض تنافسية</span>
          <strong className="auction-countdown"><Icon name="clock" size={14} /> {remainingSeconds} ثوانٍ</strong>
        </div>

        <div className="auction-room-grid">
          <div className="auction-room-stage">
            <div className="auction-room-podium">
              <span className="auction-room-hammer"><Icon name="gavel" size={28} /></span>
              <span className="section-kicker">فرصة استثمارية متجددة</span>
              <h3>{listing.label}</h3>
              <p>الحد الأدنى للافتتاح {formatMoney(listing.minimumBid, country)} · خطوة الزيادة {formatMoney(listing.bidIncrement, country)}</p>
              <div className="auction-room-current">
                <small>العرض المتصدر حالياً · {leader}</small>
                <strong>{formatMoney(currentBid, country)}</strong>
                <span>كل عرض جديد يعيد العداد إلى 10 ثوانٍ لإتاحة الفرصة للمتنافسين</span>
                <div className="auction-bid-progress" aria-label={`مقدار الزيادة ${Math.round(bidProgress)} بالمئة`}>
                  <span style={{ width: `${bidProgress}%` }} />
                </div>
                <small>إجمالي الارتفاع عن سعر البداية: {formatMoney(Math.max(0, currentBid - listing.minimumBid), country)}</small>
              </div>
            </div>

            <div className="auction-room-table">
              <div className="auction-room-table-top">
                <span>المستثمرون المتنافسون في الجلسة</span>
                <small>نخبة الشركات والمجموعات المالية الإقليمية</small>
              </div>
              <div className="auction-seats">
                {seatList.map((seat, index) => (
                  <div className={`auction-seat${seat.isPlayer ? ' auction-seat--player' : ''}`} key={seat.name}>
                    <span className="auction-seat-avatar">{seat.isPlayer ? 'أنت' : seat.name.charAt(0)}</span>
                    <span className="font-bold text-xs">{seat.name}</span>
                    <small>{seat.isPlayer ? (leader === 'أنت' ? 'العرض المتصدر' : 'مشارك') : leader === seat.name ? 'صاحب أعلى عرض' : seat.type}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="auction-room-sidebar">
            <div className="auction-room-panel">
              <div className="auction-room-panel-heading">
                <strong>سجل النداء المباشر</strong>
                <span>الأحدث أولًا</span>
              </div>
              {feed.length === 0 ? (
                <div className="auction-room-empty">
                  <Icon name="gavel" size={20} />
                  <span>قدّم أول عرض لبدء جولة المنافسة</span>
                </div>
              ) : (
                <div className="auction-bid-feed">
                  {feed.map((bid, index) => (
                    <div className={`auction-bid-row${index === 0 ? ' auction-bid-row--latest' : ''}`} key={bid.id}>
                      <span className="auction-bid-badge">{bid.player ? 'أنت' : bid.bidder}</span>
                      <span>{bid.player ? 'عرضك المسجل' : 'رفع المزايدة'}</span>
                      <strong>{formatMoney(bid.amount, country)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form className="auction-room-bid-form" onSubmit={submit}>
              <div className="auction-room-panel-heading">
                <strong>لوحة المزايدة</strong>
                <span>الزيادة المقترحة: {formatMoney(AUCTION_BID_STEP, country)}</span>
              </div>
              <label className="economy-field">
                <span>عرضك ({country.currency.symbol})</span>
                <input
                  autoFocus
                  type="number"
                  min={listing.minimumBid}
                  step={AUCTION_BID_STEP}
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  disabled={finished}
                />
              </label>
              <div className="auction-amount-controls">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => changeAmount(-AUCTION_BID_STEP)}
                  disabled={finished || Number(amount) <= listing.minimumBid}
                >
                  − {formatMoney(AUCTION_BID_STEP, country)}
                </button>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => changeAmount(AUCTION_BID_STEP)}
                  disabled={finished}
                >
                  + {formatMoney(AUCTION_BID_STEP, country)}
                </button>
              </div>

              {safeBidRatio >= 0.6 && (
                <div className="economy-alert economy-alert--warning">
                  <Icon name="shield" size={16} />
                  هذا العرض يستهلك {Math.round(safeBidRatio * 100)}٪ من السيولة النقدية المتاحة لديك.
                </div>
              )}

              {listing.lotType === 'factory' && (
                <label className="economy-field">
                  <span>الشركة المستقبلة للتوسعة</span>
                  <select
                    value={targetCompanyId}
                    onChange={(event) => setTargetCompanyId(event.target.value)}
                    disabled={finished}
                  >
                    {profile.companies.map((company) => (
                      <option value={company.id} key={company.id}>{company.name}</option>
                    ))}
                  </select>
                </label>
              )}

              <button
                className="button button-primary auction-room-bid-button"
                type="submit"
                disabled={busy || finished || profile.bankBalance < numericAmountSafe(amount)}
              >
                <Icon name="gavel" size={17} />
                {busy ? 'جارٍ تسجيل الصفقة...' : finished ? 'انتهت الجولة' : 'تقديم العرض الآن'}
              </button>
              {message && <p className="auction-room-message" role="status">{message}</p>}
            </form>
          </aside>
        </div>

        <footer className="auction-room-footer">
          <span><Icon name="shield" size={14} /> لا يُخصم المال إلا بعد انتهاء الـ10 ثوانٍ وترسية المزاد لصالحك. المشاركون يمثلون صناديق ومستثمرين في السوق المالي.</span>
          <button className="button button-secondary" type="button" onClick={onClose}>العودة لقائمة المزادات</button>
        </footer>
      </section>
    </div>
  );
}

function numericAmountSafe(value: string): number {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : Number.MAX_SAFE_INTEGER;
}
