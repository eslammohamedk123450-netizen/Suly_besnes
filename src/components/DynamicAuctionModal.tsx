import { useState, useEffect, useRef } from 'react';
import type { PlayerProfile, PlayerLand, PlayerCompany } from '../domain/player';
import type { CountryDefinition } from '../domain/countries';
import { formatMoney } from '../domain/formatters';
import { playSound } from '../game/soundEffects';
import {
  calculatePlayerAssetValuation,
  simulatePlayerAssetAuction,
  listPlayerAssetForAuction,
  settlePlayerAssetAuction,
  RIVAL_INVESTORS,
  type RivalInvestor,
  type LiveAuctionItem,
  getRandomInvestor,
} from '../game/dynamicAuctions';
import { Icon } from './Icon';
import { Gavel, Clock, ShieldCheck, Flame, TrendingUp, Sparkles, X, CheckCircle, AlertCircle, Building, MapPin } from 'lucide-react';

interface ListAssetAuctionModalProps {
  profile: PlayerProfile;
  country: CountryDefinition;
  isOpen: boolean;
  onClose: () => void;
  onAssetSold: (updatedProfile: PlayerProfile, message: string) => void;
}

export function ListAssetAuctionModal({
  profile,
  country,
  isOpen,
  onClose,
  onAssetSold,
}: ListAssetAuctionModalProps) {
  const [assetType, setAssetType] = useState<'land' | 'company'>('land');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [startingBid, setStartingBid] = useState<number>(0);
  const [isLiveBiddingActive, setIsLiveBiddingActive] = useState<boolean>(false);
  const [biddingStage, setBiddingStage] = useState<'selection' | 'live' | 'finished'>('selection');
  const [createdListingId, setCreatedListingId] = useState<string>('');
  const [liveProfile, setLiveProfile] = useState<PlayerProfile | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Live auction state
  const [currentBid, setCurrentBid] = useState<number>(0);
  const [leadingBidder, setLeadingBidder] = useState<RivalInvestor | null>(null);
  const [bidHistory, setBidHistory] = useState<{ investor: RivalInvestor; amount: number; time: string; note?: string }[]>([]);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(10);
  const [simulationData, setSimulationData] = useState<ReturnType<typeof simulatePlayerAssetAuction> | null>(null);

  // Available owned assets (filtering out any assets already active in auctions or sold)
  const activeAuctionAssetIds = new Set(
    (profile.playerAuctions ?? [])
      .filter((a) => a.status === 'active')
      .map((a) => a.assetId),
  );
  const soldAssetIds = new Set(profile.soldAssetIds ?? []);

  const availableLands = profile.lands.filter(
    (l) => !activeAuctionAssetIds.has(l.id) && !soldAssetIds.has(l.id),
  );
  const availableCompanies = profile.companies.filter(
    (c) => !activeAuctionAssetIds.has(c.id) && !soldAssetIds.has(c.id),
  );

  // Reset modal state every time it is freshly opened
  useEffect(() => {
    if (isOpen) {
      setBiddingStage('selection');
      setIsLiveBiddingActive(false);
      setSimulationData(null);
      setBidHistory([]);
      setLeadingBidder(null);
      setCreatedListingId('');
      setLiveProfile(null);
      setErrorMessage('');
    }
  }, [isOpen]);

  // Auto-select first asset when switching tabs
  useEffect(() => {
    if (assetType === 'land') {
      if (availableLands.length > 0 && !availableLands.some((l) => l.id === selectedAssetId)) {
        setSelectedAssetId(availableLands[0].id);
      }
    } else {
      if (availableCompanies.length > 0 && !availableCompanies.some((c) => c.id === selectedAssetId)) {
        setSelectedAssetId(availableCompanies[0].id);
      }
    }
  }, [assetType, availableLands, availableCompanies, selectedAssetId]);

  // Compute valuation of selected asset
  const selectedItem = assetType === 'land'
    ? availableLands.find((l) => l.id === selectedAssetId)
    : availableCompanies.find((c) => c.id === selectedAssetId);

  const valuation = selectedItem
    ? calculatePlayerAssetValuation(assetType, selectedItem)
    : null;

  useEffect(() => {
    if (valuation) {
      setStartingBid(valuation.recommendedStartingBid);
    }
  }, [valuation?.recommendedStartingBid]);

  // Handle countdown during live bidding
  useEffect(() => {
    if (!isLiveBiddingActive || biddingStage !== 'live') return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishAuction();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLiveBiddingActive, biddingStage]);

  // Simulate progressive bids arriving during the round
  useEffect(() => {
    if (!isLiveBiddingActive || biddingStage !== 'live' || !simulationData) return;

    const bids = simulationData.bidsList;
    const intervals: NodeJS.Timeout[] = [];

    bids.forEach((bid, index) => {
      const delay = (index + 1) * 1600; // staggered arrival
      const timeout = setTimeout(() => {
        setCurrentBid(bid.amount);
        setLeadingBidder(bid.investor);
        setRemainingSeconds(10); // reset clock on new bid
        setBidHistory((prev) => [
          {
            investor: bid.investor,
            amount: bid.amount,
            time: new Date().toLocaleTimeString('ar-EG', { minute: '2-digit', second: '2-digit' }),
            note: bid.note,
          },
          ...prev,
        ]);
        playSound('click');
      }, delay);
      intervals.push(timeout);
    });

    return () => intervals.forEach((t) => clearTimeout(t));
  }, [isLiveBiddingActive, biddingStage, simulationData]);

  const handleStartAuction = () => {
    if (!selectedItem || !valuation) return;
    setErrorMessage('');

    // Create the independent auction listing inside the player profile first
    const listRes = listPlayerAssetForAuction(profile, assetType, selectedItem.id, startingBid);
    if (!listRes.ok) {
      setErrorMessage(listRes.message);
      playSound('error');
      return;
    }

    playSound('click');
    const created = listRes.data;
    setCreatedListingId(created.id);
    setLiveProfile(listRes.profile);

    // Prepare simulation
    const sim = simulatePlayerAssetAuction(valuation.fairValue, startingBid);
    setSimulationData(sim);
    setCurrentBid(startingBid);
    setLeadingBidder(getRandomInvestor());
    setBidHistory([]);
    setRemainingSeconds(12);
    setBiddingStage('live');
    setIsLiveBiddingActive(true);
  };

  const handleFinishAuction = () => {
    setIsLiveBiddingActive(false);
    setBiddingStage('finished');
    playSound('success');
  };

  const handleConfirmSale = () => {
    if (!selectedItem || !leadingBidder || !createdListingId) return;

    const currentProfileToSettle = liveProfile || profile;
    const finalAmount = currentBid;

    // Execute safe, deduplicated settlement
    const settleRes = settlePlayerAssetAuction(
      currentProfileToSettle,
      createdListingId,
      finalAmount,
      leadingBidder.name,
    );

    if (!settleRes.ok) {
      setErrorMessage(settleRes.message);
      playSound('error');
      return;
    }

    const profitDifference = finalAmount - (valuation?.fairValue || finalAmount);
    const profitPercent = valuation?.fairValue ? Math.round((profitDifference / valuation.fairValue) * 100) : 0;
    const message = `تهانينا! تم بيع [${valuation?.name}] إلى [${leadingBidder.name}] بسعر ${formatMoney(finalAmount, country)} (فارق ربح ${profitPercent > 0 ? `+${profitPercent}%` : '0%'})! 🏛️`;

    // Notify parent with the authoritative updated profile
    onAssetSold(settleRes.profile, message);

    // Completely reset all modal states before closing
    setBiddingStage('selection');
    setCreatedListingId('');
    setSimulationData(null);
    setIsLiveBiddingActive(false);
    setLiveProfile(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in" dir="rtl">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col text-slate-100 relative">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Gavel className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-amber-300">
                طرح أصل في المزاد العلني
              </h3>
              <p className="text-xs text-slate-400">
                اعرض أراضيك أو مصانعك في قاعة المزاد وتنافس عليها كبار المستثمرين والصناديق
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body content based on stage */}
        <div className="p-4 sm:p-6 flex-1 space-y-5">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
          {biddingStage === 'selection' && (
            <>
              {/* Type Switcher */}
              <div className="flex rounded-2xl bg-slate-950 border border-slate-800 p-1">
                <button
                  type="button"
                  onClick={() => setAssetType('land')}
                  className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 ${
                    assetType === 'land' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  الأراضي المملوكة ({availableLands.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAssetType('company')}
                  className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 ${
                    assetType === 'company' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  المصانع والشركات ({availableCompanies.length})
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {assetType === 'land' ? (
                  availableLands.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400 bg-slate-950/60 rounded-2xl border border-slate-800">
                      لا تمتلك أي أراضٍ حالياً لطرحها في المزاد.
                    </div>
                  ) : (
                    availableLands.map((land) => (
                      <div
                        key={land.id}
                        onClick={() => setSelectedAssetId(land.id)}
                        className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                          selectedAssetId === land.id
                            ? 'bg-amber-500/15 border-amber-500 text-white shadow-md'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🗺️</span>
                          <div>
                            <div className="font-bold text-xs sm:text-sm">{land.label}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              المساحة: {(land.areaSquareMeters || 1000).toLocaleString()} م² · نوع الأرض: {land.landType === 'industrial' ? 'صناعية' : land.landType === 'agricultural' ? 'زراعية' : 'تجارية'}
                            </div>
                          </div>
                        </div>
                        <div className="text-left font-black text-amber-400 text-xs sm:text-sm">
                          {formatMoney(land.purchasePrice, country)}
                        </div>
                      </div>
                    ))
                  )
                ) : availableCompanies.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400 bg-slate-950/60 rounded-2xl border border-slate-800">
                    لا تمتلك أي شركات إضافية للبيع حالياً.
                  </div>
                ) : (
                  availableCompanies.map((comp) => (
                    <div
                      key={comp.id}
                      onClick={() => setSelectedAssetId(comp.id)}
                      className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                        selectedAssetId === comp.id
                          ? 'bg-amber-500/15 border-amber-500 text-white shadow-md'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🏭</span>
                        <div>
                          <div className="font-bold text-xs sm:text-sm">{comp.name}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            كفاءة الماكينات: {comp.maintenanceCondition ?? 100}% · الطاقة: {comp.energyCapacity ?? 100} وحدة
                          </div>
                        </div>
                      </div>
                      <div className="text-left font-black text-amber-400 text-xs sm:text-sm">
                        مستوى {comp.upgradeLevel ?? 1}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Valuation & Starting Bid Setting */}
              {valuation && selectedItem && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                    <span className="text-slate-400">التقييم السوقي العادل للأصل:</span>
                    <strong className="text-emerald-400 font-mono text-sm">
                      {formatMoney(valuation.fairValue, country)}
                    </strong>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-300 font-semibold block">
                      سعر افتتاح المزاد المقترح ({country.currency.code}):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={Math.round(valuation.fairValue * 0.5)}
                        max={Math.round(valuation.fairValue * 1.5)}
                        step={1000}
                        value={startingBid}
                        onChange={(e) => setStartingBid(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-sm focus:border-amber-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setStartingBid(valuation.recommendedStartingBid)}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-[11px] font-bold rounded-xl text-amber-400 whitespace-nowrap"
                      >
                        سعر موصى به
                      </button>
                    </div>
                  </div>

                  {/* Guaranteed Profit Distribution Notice */}
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-[11px] text-amber-300 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-amber-400">
                      <Flame className="w-3.5 h-3.5" />
                      خوارزمية تنافس المستثمرين وضمان الربح:
                    </div>
                    <ul className="list-disc list-inside text-slate-300 space-y-0.5 pr-1">
                      <li><strong>65% من الحالات</strong>: ربح طبيعي إضافي (+5% إلى +15% عن التقييم).</li>
                      <li><strong>25% من الحالات</strong>: تنافس محموم بين مجموعتين (+18% إلى +35%).</li>
                      <li><strong>10% من الحالات</strong>: طفرة مزاد نادرة بدخول ملياردير كبرى (+50% إلى +85%)!</li>
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}

          {biddingStage === 'live' && (
            <div className="space-y-4">
              {/* Podium Live Header */}
              <div className="bg-gradient-to-br from-slate-950 via-amber-950/40 to-slate-950 border border-amber-500/40 rounded-3xl p-4 sm:p-6 text-center space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 text-rose-400 font-bold animate-pulse">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    جلسة المزايدة جارية الآن
                  </span>
                  <div className="flex items-center gap-1 text-amber-300 font-mono font-bold bg-slate-900/80 px-2.5 py-1 rounded-full border border-amber-500/30">
                    <Clock className="w-3.5 h-3.5" />
                    متبقي: {remainingSeconds} ثوانٍ
                  </div>
                </div>

                <div className="text-xs text-slate-300 font-bold">{valuation?.name}</div>

                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 block">أعلى عرض مسجل حالياً</span>
                  <strong className="text-3xl sm:text-4xl font-black text-amber-400 font-mono tracking-tight block">
                    {formatMoney(currentBid, country)}
                  </strong>
                </div>

                {leadingBidder && (
                  <div className="inline-flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: leadingBidder.avatarColor }} />
                    <span className="text-slate-200">المتصدر: <strong>{leadingBidder.name}</strong></span>
                    <span className="text-[10px] text-amber-400 font-bold">({leadingBidder.type})</span>
                  </div>
                )}
              </div>

              {/* Live Bids Feed */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-2">
                <div className="text-xs font-bold text-slate-400 flex items-center justify-between pb-1 border-b border-slate-800">
                  <span>سجل نداءات المستثمرين</span>
                  <span>{bidHistory.length} عروض متتالية</span>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {bidHistory.map((item, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded-xl flex items-center justify-between text-xs animate-fade-in ${
                        index === 0 ? 'bg-amber-500/15 border border-amber-500/40 font-bold' : 'bg-slate-900/60 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.investor.avatarColor }} />
                        <span>{item.investor.name}</span>
                        {item.note && <span className="text-[10px] text-amber-400">({item.note})</span>}
                      </div>
                      <div className="text-left font-mono font-bold text-emerald-400">
                        {formatMoney(item.amount, country)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {biddingStage === 'finished' && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center font-bold">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>

              <div>
                <h4 className="text-lg sm:text-xl font-black text-emerald-400">
                  انتهت الجلسة ورسى المزاد بنجاح!
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  فاز بعقد الشراء النهائي المستثمر: <strong className="text-amber-300">{leadingBidder?.name}</strong>
                </p>
              </div>

              <div className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-4 inline-block min-w-[260px]">
                <span className="text-xs text-slate-400 block mb-1">صافي ثمن البيع المحصل</span>
                <strong className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                  {formatMoney(currentBid, country)}
                </strong>
                {valuation && (
                  <div className="text-xs text-emerald-400 font-bold mt-1">
                    فارق ربح: +{Math.round(((currentBid - valuation.fairValue) / valuation.fairValue) * 100)}% فوق التقييم
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end gap-3">
          {biddingStage === 'selection' && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-bold transition"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleStartAuction}
                disabled={!selectedItem || startingBid <= 0}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs sm:text-sm font-black shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
              >
                بدء جلسة المزاد العلني 🔨
              </button>
            </>
          )}

          {biddingStage === 'live' && (
            <button
              type="button"
              onClick={handleFinishAuction}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black shadow-lg transition"
            >
              قبول العرض الحالي وإنهاء المزاد فوراً ({formatMoney(currentBid, country)}) 🤝
            </button>
          )}

          {biddingStage === 'finished' && (
            <button
              type="button"
              onClick={handleConfirmSale}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-slate-950 text-xs sm:text-sm font-black shadow-lg transition"
            >
              استلام السيولة وإتمام نقل الملكية 💰
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
