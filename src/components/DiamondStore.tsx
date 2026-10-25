import { useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import type { PlayerProfile } from '../domain/player';
import type { SpeedCardKind } from '../domain/accountFeatures';
import { formatNumber } from '../domain/formatters';
import { createDiamondTopupRequest, listMyDiamondTopupRequests, type DiamondPackageId, type DiamondTopupOrder } from '../storage/diamondTopupRepository';
import { DIAMOND_PACKAGES } from '../game/diamondPackages';
import './DiamondStore.css';

interface DiamondStoreProps {
  profile: PlayerProfile;
  isGuest: boolean;
  onLinkAccount: () => void;
  onRefreshProfile: () => Promise<void>;
  onPurchaseSpeedCard: (kind: SpeedCardKind) => void;
  onBack?: () => void;
}

const VODAFONE_CASH_NUMBER = '01093629700';
const WHATSAPP_NUMBER = '201093629700';

const STATUS_LABELS = {
  pending: 'بانتظار المراجعة ⏳',
  approved: 'تم الاعتماد ✅',
  rejected: 'مرفوض ❌',
} as const;

async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

function newRequestId() {
  return crypto.randomUUID();
}

export function DiamondStore({ profile, isGuest, onLinkAccount, onRefreshProfile, onPurchaseSpeedCard, onBack }: DiamondStoreProps) {
  const [selectedId, setSelectedId] = useState<DiamondPackageId | null>('executive');
  const [copied, setCopied] = useState(false);
  const [orders, setOrders] = useState<DiamondTopupOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createdOrder, setCreatedOrder] = useState<DiamondTopupOrder | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const seenStatuses = useRef(new Map<string, string>());
  
  const selected = DIAMOND_PACKAGES.find((item) => item.id === selectedId);
  const existingPendingOrder = selected ? orders.find((order) => order.packageId === selected.id && order.status === 'pending') : undefined;
  const activeOrder = createdOrder && selected && createdOrder.packageId === selected.id && createdOrder.status === 'pending'
    ? createdOrder
    : existingPendingOrder;
  
  const whatsappText = selected && activeOrder
    ? `مرحبًا، أرسلت قيمة طلب شحن الماس رقم ${activeOrder.orderNumber}. الباقة: ${selected.label}، ${selected.diamonds} ماسة بقيمة ${selected.priceEgp} $. سأرفق إيصال التحويل.`
    : 'مرحبًا، أريد الاستفسار عن شحن الماس للعبة إمبراطورية الأعمال.';

  async function refreshOrders() {
    if (isGuest) return;
    setOrdersLoading(true);
    setOrdersError('');
    try {
      const nextOrders = await listMyDiamondTopupRequests(20);
      const newlyApproved = nextOrders.some((order) => order.status === 'approved' && seenStatuses.current.get(order.orderId) === 'pending');
      seenStatuses.current = new Map(nextOrders.map((order) => [order.orderId, order.status]));
      setOrders(nextOrders);
      if (newlyApproved) await onRefreshProfile();
    } catch (error) {
      setOrdersError(error instanceof Error ? error.message : 'تعذر تحميل طلبات الشحن.');
    } finally {
      setOrdersLoading(false);
    }
  }

  useEffect(() => {
    if (!isGuest) void refreshOrders();
  }, [isGuest]);

  useEffect(() => {
    if (isGuest || !orders.some((order) => order.status === 'pending')) return;
    const interval = window.setInterval(() => { void refreshOrders(); }, 30_000);
    return () => window.clearInterval(interval);
  }, [isGuest, orders]);

  async function copyNumber() {
    setCopied(await copyText(VODAFONE_CASH_NUMBER));
    window.setTimeout(() => setCopied(false), 2200);
  }

  async function submitTopupRequest() {
    if (!selected || isGuest || activeOrder || creatingOrder) return;
    const key = requestId ?? newRequestId();
    setRequestId(key);
    setCreatingOrder(true);
    setCreateError('');
    try {
      const order = await createDiamondTopupRequest(selected.id, key);
      setCreatedOrder(order);
      setRequestId(null);
      await refreshOrders();
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'تعذر تسجيل الطلب. حاول مرة أخرى.');
    } finally {
      setCreatingOrder(false);
    }
  }

  return (
    <section className="suly-diamond-store" aria-labelledby="suly-store-title">
      {/* Top Header Bar */}
      <header className="suly-header-bar">
        <button type="button" className="suly-back-btn" onClick={onBack} aria-label="العودة">
          ←
        </button>
        <div className="suly-header-center">
          <h2 id="suly-store-title">المتجر الماسي</h2>
          <span className="suly-header-sub">Suly-Official</span>
        </div>
        <div className="suly-diamond-counter">
          <span className="suly-counter-gem">💎</span>
          <strong className="suly-counter-val">{formatNumber(profile.diamonds)}</strong>
        </div>
      </header>

      {/* Subheader Banner */}
      <div className="suly-kicker-banner">
        <span>باقات الألماس مميزة - اشتري واحصل على ألماس إضافي</span>
      </div>

      {/* Package Cards 2x3 Grid */}
      <div className="suly-cards-grid">
        {DIAMOND_PACKAGES.map((item) => {
          const isSelected = selectedId === item.id;

          return (
            <div
              key={item.id}
              className={`suly-package-card ${isSelected ? 'is-selected' : ''}`}
              onClick={() => {
                setSelectedId(item.id);
                setCreatedOrder(null);
                setRequestId(null);
                setCreateError('');
              }}
              role="button"
              tabIndex={0}
            >
              {/* Top Crest Gem */}
              <div className="suly-crest-gem">💎</div>

              {/* Top Ribbon Badge */}
              {item.topRibbon && <div className="suly-top-ribbon">{item.topRibbon}</div>}

              {/* 3D Crystal Graphic */}
              <div className="suly-diamond-graphic-wrap">
                <div className="suly-crystal-gem">💎</div>
              </div>

              {/* Title & Amount */}
              <h3 className="suly-diamond-title">
                {item.isCrown && <span className="suly-crown-icon">👑 </span>}
                ألماس {formatNumber(item.diamonds)}
              </h3>

              {/* Bonus Subtitle */}
              <p className="suly-diamond-bonus">{item.note}</p>

              {/* Price Tag */}
              <div className="suly-price-tag">
                {formatNumber(item.priceEgp)} $
              </div>

              {/* Buy Golden Pill Button */}
              <button
                type="button"
                className="suly-buy-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedId(item.id);
                  setCreatedOrder(null);
                }}
              >
                شراء
              </button>

              {/* Bottom Ribbon Badge */}
              {item.bottomRibbon && <div className="suly-bottom-ribbon">{item.bottomRibbon}</div>}
            </div>
          );
        })}
      </div>

      {/* Selected Checkout / Payment Area */}
      {selected && (
        <div className="suly-checkout-panel">
          <div className="suly-checkout-head">
            <div>
              <strong>باقة {selected.label}</strong>
              <small>{selected.diamonds} ماسة ({selected.note})</small>
            </div>
            <span className="suly-checkout-price">{selected.priceEgp} $</span>
          </div>

          {isGuest ? (
            <div className="suly-guest-warning">
              <p>يرجى ربط حسابك للتمكن من إتمام طلب الشحن وحفظ رصيد الماس بحسابك.</p>
              <button type="button" className="suly-buy-btn" onClick={onLinkAccount}>
                ربط الحساب الآن
              </button>
            </div>
          ) : Capacitor.isNativePlatform() ? (
            <div className="suly-payment-box" style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid #3b82f6', borderRadius: 12, padding: 18, textAlign: 'center' }}>
              <h4 style={{ color: '#60a5fa', marginBottom: 8, fontSize: '1rem', fontWeight: 'bold' }}>
                بوابة الشحن المعتمدة لنسخة التطبيق 📱
              </h4>
              <p style={{ color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.6, margin: '0 0 14px' }}>
                وفقاً لسياسات التوزيع الرقمي والمتاجر الرسمية، تتوفر خيارات شحن الماسات والتحويلات المباشرة عبر بوابة الويب الرسمية للألعاب.
              </p>
              <a
                href={typeof window !== 'undefined' ? window.location.origin : 'https://suly-business.web.app'}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: '#2563eb', color: '#fff', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: '0.88rem', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}
              >
                <span>فتح بوابة الشحن على موقع الويب الرسمي 🌐</span>
              </a>
            </div>
          ) : (
            <>
              <div className="suly-payment-box">
                <p>للشحن عبر <strong>Vodafone Cash</strong> أرسل المبلغ <strong>({selected.priceEgp} $)</strong> إلى الرقم:</p>
                <button type="button" className="suly-vodafone-pill" onClick={() => void copyNumber()}>
                  <span>رقم فودافون كاش</span>
                  <strong dir="ltr">{VODAFONE_CASH_NUMBER}</strong>
                  <small>{copied ? '✨ تم نسخ الرقم!' : 'اضغط لنسخ الرقم'}</small>
                </button>
              </div>

              {!activeOrder && (
                <div className="suly-action-row">
                  {createError && <p className="suly-error-msg">{createError}</p>}
                  <button
                    type="button"
                    className="suly-buy-btn suly-confirm-btn"
                    disabled={creatingOrder}
                    onClick={() => void submitTopupRequest()}
                  >
                    {creatingOrder ? 'جارٍ تسجيل الطلب…' : 'تأكيد إرسال التحويل 📲'}
                  </button>
                </div>
              )}

              {activeOrder && (
                <div className="suly-order-confirm">
                  <span>رقم الطلب الخاص بك:</span>
                  <strong dir="ltr">{activeOrder.orderNumber}</strong>
                  <p>أرسل هذا الرقم مع إيصال الدفع عبر واتساب ليتم إضافة الماس فوراً.</p>
                  <a
                    className="suly-wa-btn"
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappText)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    تأكيد مع الدعم الفني عبر WhatsApp 💬
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Speed Cards Section */}
      <div className="suly-cards-section">
        <div className="suly-section-title">
          <h3>بطاقات التسريع الفوري ⚡</h3>
          <span>رصيدك: 💎 {formatNumber(profile.diamonds)}</span>
        </div>
        <div className="suly-speed-grid">
          {[
            { kind: 'production-25' as const, title: 'تسريع الإنتاج 25%', price: 1, icon: '⚡' },
            { kind: 'production-50' as const, title: 'تسريع الإنتاج 50%', price: 2, icon: '🚀' },
            { kind: 'production-instant' as const, title: 'إكمال فوري', price: 3, icon: '💥' },
            { kind: 'day-speed-2x' as const, title: 'تخطي اليوم ×2', price: 10, icon: '⏩' },
          ].map((card) => {
            const owned = profile.speedCards.find((c) => c.kind === card.kind)?.quantity ?? 0;
            const canBuy = !isGuest && profile.diamonds >= card.price;
            return (
              <div className="suly-speed-card" key={card.kind}>
                <span className="suly-speed-icon">{card.icon}</span>
                <strong>{card.title}</strong>
                <span className="suly-speed-price">💎 {card.price} ماسة</span>
                {owned > 0 && <small className="suly-owned">المملوك: {owned}</small>}
                <button
                  type="button"
                  className="suly-buy-btn suly-speed-buy"
                  disabled={!canBuy}
                  onClick={() => onPurchaseSpeedCard(card.kind)}
                >
                  شراء
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* My Orders History */}
      {!isGuest && (
        <div className="suly-history-section">
          <div className="suly-history-head">
            <h3>طلباتي المسجلة</h3>
            <button type="button" className="suly-refresh-link" onClick={() => void refreshOrders()} disabled={ordersLoading}>
              {ordersLoading ? 'تحديث...' : 'تحديث 🔄'}
            </button>
          </div>
          {orders.length === 0 ? (
            <p className="suly-empty-text">لا توجد طلبات سابقة.</p>
          ) : (
            <div className="suly-orders-list">
              {orders.map((o) => (
                <div className="suly-order-item" key={o.orderId}>
                  <div>
                    <strong dir="ltr">{o.orderNumber}</strong>
                    <small>{o.packageName} · {o.amountEgp ?? o.amountUsd} $</small>
                  </div>
                  <span className={`suly-status-pill suly-status--${o.status}`}>{STATUS_LABELS[o.status]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bottom Security Banner Footer */}
      <footer className="suly-security-footer">
        <span>🔒 جميع المعاملات آمنة ومحمية • دعم فني 24/7</span>
      </footer>
    </section>
  );
}
