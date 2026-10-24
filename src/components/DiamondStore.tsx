import { useEffect, useRef, useState } from 'react';
import type { PlayerProfile } from '../domain/player';
import { formatNumber } from '../domain/formatters';
import { createDiamondTopupRequest, listMyDiamondTopupRequests, type DiamondPackageId, type DiamondTopupOrder } from '../storage/diamondTopupRepository';
import { DIAMOND_PACKAGES, getDiamondPackageBonus } from '../game/diamondPackages';
import './DiamondStore.css';

interface DiamondStoreProps {
  profile: PlayerProfile;
  isGuest: boolean;
  onLinkAccount: () => void;
  onRefreshProfile: () => Promise<void>;
}

const VODAFONE_CASH_NUMBER = '01093629700';
const WHATSAPP_NUMBER = '201093629700';

const STATUS_LABELS = {
  pending: 'بانتظار المراجعة',
  approved: 'تم الاعتماد',
  rejected: 'مرفوض',
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

export function DiamondStore({ profile, isGuest, onLinkAccount, onRefreshProfile }: DiamondStoreProps) {
  const [selectedId, setSelectedId] = useState<DiamondPackageId | null>(null);
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
    ? `مرحبًا، أرسلت قيمة طلب شحن الماس رقم ${activeOrder.orderNumber}. الباقة: ${selected.label}، ${selected.diamonds} ماسة بقيمة $${selected.priceUsd}. سأرفق إيصال التحويل.`
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
    <section className="diamond-store" aria-labelledby="diamond-store-title">
      <div className="diamond-store-heading">
        <div>
          <span className="section-kicker">المتجر الماسي</span>
          <h3 id="diamond-store-title">باقات الماس</h3>
          <p>اختر الباقة المناسبة واحصل على الماس الإضافي والمكافآت الموضحة.</p>
        </div>
        <span className="diamond-store-rate">$1 = 100 ماسة</span>
      </div>
      <div className="diamond-package-grid">
        {DIAMOND_PACKAGES.map((item) => {
          const bonus = getDiamondPackageBonus(item);
          const bonusPercent = new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 1 }).format(bonus.percent);
          return <button className={`diamond-package${selectedId === item.id ? ' is-selected' : ''}`} type="button" key={item.id} onClick={() => {
            setSelectedId(item.id);
            setCreatedOrder(null);
            setRequestId(null);
            setCreateError('');
          }} aria-pressed={selectedId === item.id}>
            <span className="diamond-package-gem" aria-hidden="true">◆</span>
            <strong>{item.label}</strong>
            <b>◆ {item.diamonds.toLocaleString('ar-EG')}</b>
            <span>${item.priceUsd.toLocaleString('en-US')}</span>
            {bonus.diamonds > 0 && <em className="diamond-package-bonus">+{formatNumber(bonus.diamonds)} ماسة إضافية · {bonusPercent}٪ مكافأة</em>}
            {bonus.diamonds === 0 && <em className="diamond-package-bonus diamond-package-bonus--base">الباقة الأساسية</em>}
            {item.bonusRewards?.map((reward) => <em className="diamond-package-reward" key={reward}>{reward}</em>)}
            <small>{item.note}</small>
          </button>;
        })}
      </div>
      {selected && (
        <div className="diamond-transfer-panel" aria-label="تعليمات تحويل قيمة الماس">
          <div className="diamond-transfer-title"><strong>قيمة {selected.diamonds.toLocaleString('ar-EG')} ماسة</strong><span>${selected.priceUsd.toLocaleString('en-US')}</span></div>
          {isGuest ? (
            <div className="diamond-order-guest"><p>اربط حسابك أولًا حتى يُسجّل الطلب على حسابك الصحيح. لا تحوّل المبلغ قبل ربط الحساب.</p><button className="button button-primary" type="button" onClick={onLinkAccount}>ربط الحساب للمتابعة</button></div>
          ) : (
            <>
              <ol>
                <li>تواصل مع مسؤول الشحن عبر WhatsApp لمعرفة وسيلة التحويل المتاحة.</li>
                <li>أرسل قيمة الباقة <strong>${selected.priceUsd.toLocaleString('en-US')}</strong> إلى وسيلة الدفع المعتمدة:</li>
              </ol>
              <button className="diamond-cash-number" type="button" onClick={() => void copyNumber()} aria-label="نسخ رقم Vodafone Cash">
                <span>رقم Vodafone Cash</span><strong dir="ltr">{VODAFONE_CASH_NUMBER}</strong><small>{copied ? 'تم نسخ الرقم' : 'اضغط لنسخ الرقم'}</small>
              </button>
              {!activeOrder && <>
                <p className="diamond-transfer-warning">بعد إرسال التحويل، سجّل الطلب. لا تُضاف الماسات إلا بعد مراجعة الإيصال من مسؤول الشحن.</p>
                {createError && <p className="diamond-order-error" role="alert">{createError}</p>}
                <button className="button button-primary diamond-whatsapp" type="button" onClick={() => void submitTopupRequest()} disabled={creatingOrder}>
                  {creatingOrder ? 'جارٍ تسجيل الطلب…' : 'سجّلت التحويل — أنشئ طلب الشحن'}
                </button>
              </>}
              {activeOrder && <div className="diamond-order-confirmation" aria-live="polite">
                <span>رقم طلبك</span><strong dir="ltr">{activeOrder.orderNumber}</strong>
            <p>أرسل هذا الرقم مع إيصال التحويل عبر WhatsApp. الباقة الأعلى تتضمن مكافأتها الموضحة؛ لا تُضاف الماسات قبل مراجعة الإيصال.</p>
                <a className="button button-primary diamond-whatsapp" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappText)}`} target="_blank" rel="noreferrer">إرسال رقم الطلب والإيصال لمسؤول الشحن</a>
              </div>}
            </>
          )}
        </div>
      )}

      {!isGuest && <section className="diamond-orders" aria-label="طلبات شحن الماس">
        <div className="diamond-orders-heading"><strong>طلباتي</strong><button className="text-link" type="button" onClick={() => void refreshOrders()} disabled={ordersLoading}>{ordersLoading ? 'جارٍ التحديث…' : 'تحديث الحالة'}</button></div>
        {ordersError && <p className="diamond-order-error" role="alert">{ordersError}</p>}
        {ordersLoading && orders.length === 0 ? <p className="diamond-orders-empty">جارٍ تحميل الطلبات…</p> : orders.length === 0 ? <p className="diamond-orders-empty">لا توجد طلبات شحن مسجلة.</p> : <div className="diamond-orders-list">{orders.map((order) => <article className={`diamond-order-row diamond-order-row--${order.status}`} key={order.orderId}>
          <div className="diamond-order-row-main"><strong dir="ltr">{order.orderNumber}</strong><small>{order.packageName} · {formatNumber(order.diamonds)} ماسة · ${formatNumber(order.amountUsd ?? order.amountEgp ?? 0)}</small></div>
          <span className={`diamond-order-status diamond-order-status--${order.status}`}>{STATUS_LABELS[order.status]}</span>
          {order.status === 'rejected' && order.reviewReason && <small className="diamond-order-reason">{order.reviewReason}</small>}
        </article>)}</div>}
      </section>}

      <small className="diamond-store-note">الشحن يدوي بعد مراجعة الإيصال. لا ترسل كلمة المرور أو رمز الدخول لأي شخص.</small>
    </section>
  );
}
