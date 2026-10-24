import { supabase } from './supabaseClient';

export type DiamondPackageId = 'starter' | 'builder' | 'executive' | 'empire';
export type DiamondTopupStatus = 'pending' | 'approved' | 'rejected';

export interface DiamondTopupOrder {
  orderId: string;
  orderNumber: string;
  packageId: DiamondPackageId;
  packageName: string;
  diamonds: number;
  amountEgp: number;
  status: DiamondTopupStatus;
  createdAt: string;
  reviewedAt: string | null;
  reviewReason: string | null;
}

function messageForDatabaseError(message: string): string {
  if (message.includes('authentication_required')) return 'اربط حسابك أولًا قبل إنشاء طلب شحن.';
  if (message.includes('invalid_topup_package')) return 'هذه الباقة غير متاحة حاليًا.';
  if (message.includes('player_profile_not_found')) return 'تعذر العثور على ملف الحساب. أعد فتح اللعبة ثم حاول مجددًا.';
  if (message.includes('idempotency_key_conflict')) return 'تعارض الطلب مع محاولة سابقة. حدّث القائمة قبل المحاولة مرة أخرى.';
  return 'تعذر الاتصال بخدمة الطلبات. تحقق من الاتصال ثم أعد المحاولة.';
}

function throwMappedError(message: string): never {
  throw new Error(messageForDatabaseError(message));
}

export async function createDiamondTopupRequest(
  packageId: DiamondPackageId,
  requestId: string,
): Promise<DiamondTopupOrder> {
  const { data, error } = await supabase.rpc('create_diamond_topup_request', {
    p_package_id: packageId,
    p_request_id: requestId,
  });
  if (error) throwMappedError(error.message);
  if (!data || typeof data !== 'object' || !('orderId' in data)) {
    throw new Error('تعذر تسجيل الطلب. أعد المحاولة بعد تحديث القائمة.');
  }
  return data as DiamondTopupOrder;
}

export async function listMyDiamondTopupRequests(limit = 20): Promise<DiamondTopupOrder[]> {
  const { data, error } = await supabase.rpc('list_my_diamond_topup_requests', { p_limit: limit });
  if (error) throwMappedError(error.message);
  return Array.isArray(data) ? data as DiamondTopupOrder[] : [];
}
