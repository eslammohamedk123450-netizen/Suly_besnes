import { Capacitor } from '@capacitor/core';
import { supabase } from './supabaseClient';

export interface LocalAccount {
  id: string;
  email: string;
  createdAt: string;
  isGuest?: boolean;
}

export type PasswordRecoveryRequest =
  | { ok: true; message: string }
  | { ok: false; message: string };

export type PasswordRecoveryCallback =
  | { kind: 'ignored' }
  | { kind: 'ready' }
  | { kind: 'error'; message: string };

export type PasswordUpdateResult =
  | { ok: true; account: LocalAccount }
  | { ok: false; message: string };

const GUEST_ACCOUNT_KEY = 'business-empire.guest-account.v1';
const NATIVE_RECOVERY_URL = 'com.businessempire.game://auth/recovery';
const NATIVE_SCHEME = 'com.businessempire.game:';

function toAccount(user: { id: string; email?: string; created_at?: string }): LocalAccount {
  return { id: user.id, email: user.email ?? '', createdAt: user.created_at ?? new Date().toISOString() };
}

function readGuestAccount(): LocalAccount | null {
  try {
    const raw = globalThis.localStorage?.getItem(GUEST_ACCOUNT_KEY);
    if (!raw) return null;
    const account = JSON.parse(raw) as Partial<LocalAccount>;
    if (typeof account.id !== 'string' || !account.id.startsWith('guest-') || typeof account.createdAt !== 'string') return null;
    return { id: account.id, email: '', createdAt: account.createdAt, isGuest: true };
  } catch {
    return null;
  }
}

export function createGuestAccount(): LocalAccount {
  const existing = readGuestAccount();
  if (existing) return existing;
  const id = `guest-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
  const account: LocalAccount = { id, email: '', createdAt: new Date().toISOString(), isGuest: true };
  try { globalThis.localStorage?.setItem(GUEST_ACCOUNT_KEY, JSON.stringify(account)); } catch { /* best effort; saveRepository reports storage failures */ }
  return account;
}

export async function loadCurrentAccount(): Promise<LocalAccount | null> {
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) return toAccount(data.session.user);
  } catch {
    // A local guest account remains usable when the authentication service is offline.
  }
  return readGuestAccount();
}

function getPasswordRecoveryRedirectUrl(): string {
  if (Capacitor.isNativePlatform()) return NATIVE_RECOVERY_URL;

  const configuredUrl = import.meta.env.VITE_AUTH_RECOVERY_URL?.trim();
  const defaultUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
  const target = new URL(configuredUrl || defaultUrl);
  target.searchParams.set('auth', 'recovery');
  return target.toString();
}

function recoveryRequestError(errorMessage: string): string {
  const message = errorMessage.toLowerCase();
  if (message.includes('redirect') || message.includes('url')) {
    return 'تعذر إعداد رابط الاستعادة. تأكد من إضافة رابط التطبيق إلى قائمة Redirect URLs في Supabase.';
  }
  if (message.includes('rate limit') || message.includes('too many') || message.includes('security purposes')) {
    return 'وصلت إلى حد طلبات الاستعادة المؤقت. انتظر قليلًا ثم حاول مجددًا.';
  }
  return 'تعذر إرسال طلب الاستعادة الآن. تحقق من اتصالك وحاول مرة أخرى.';
}

export async function requestPasswordRecovery(emailInput: string): Promise<PasswordRecoveryRequest> {
  const email = emailInput.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, message: 'اكتب بريدًا إلكترونيًا صحيحًا.' };

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getPasswordRecoveryRedirectUrl(),
    });
    if (error) return { ok: false, message: recoveryRequestError(error.message) };
    return {
      ok: true,
      message: 'إذا كان هذا البريد مرتبطًا بحساب، فستصلك رسالة لاستعادة كلمة المرور. تحقق من صندوق البريد والرسائل غير المرغوب فيها.',
    };
  } catch {
    return { ok: false, message: 'تعذر إرسال طلب الاستعادة الآن. تحقق من اتصالك وحاول مرة أخرى.' };
  }
}

export async function handlePasswordRecoveryCallback(rawUrl: string): Promise<PasswordRecoveryCallback> {
  let callbackUrl: URL;
  try {
    callbackUrl = new URL(rawUrl);
  } catch {
    return { kind: 'ignored' };
  }

  if (callbackUrl.protocol !== NATIVE_SCHEME || callbackUrl.hostname !== 'auth' || callbackUrl.pathname !== '/recovery') {
    return { kind: 'ignored' };
  }

  const query = callbackUrl.searchParams;
  const fragment = new URLSearchParams(callbackUrl.hash.replace(/^#/, ''));
  const getValue = (key: string) => query.get(key) ?? fragment.get(key);
  const error = getValue('error_description') ?? getValue('error_code') ?? getValue('error');
  if (error) return { kind: 'error', message: 'رابط الاستعادة غير صالح أو انتهت صلاحيته. ارجع إلى تسجيل الدخول واطلب رابطًا جديدًا.' };

  const type = getValue('type');
  if (type && type !== 'recovery') return { kind: 'ignored' };

  try {
    const code = getValue('code');
    if (code) {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) return { kind: 'error', message: 'رابط الاستعادة غير صالح أو انتهت صلاحيته. اطلب رابطًا جديدًا من شاشة الدخول.' };
      return { kind: 'ready' };
    }

    const accessToken = getValue('access_token');
    const refreshToken = getValue('refresh_token');
    if (!accessToken || !refreshToken) {
      return { kind: 'error', message: 'لم نتمكن من قراءة رابط الاستعادة. اطلب رابطًا جديدًا من شاشة الدخول.' };
    }

    const { error: sessionError } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    if (sessionError) return { kind: 'error', message: 'رابط الاستعادة غير صالح أو انتهت صلاحيته. اطلب رابطًا جديدًا من شاشة الدخول.' };
    return { kind: 'ready' };
  } catch {
    return { kind: 'error', message: 'تعذر فتح رابط الاستعادة. تحقق من اتصالك ثم اطلب رابطًا جديدًا.' };
  }
}

export async function updatePasswordFromRecovery(password: string): Promise<PasswordUpdateResult> {
  if (password.length < 8) return { ok: false, message: 'كلمة المرور الجديدة يجب أن تتكون من 8 أحرف على الأقل.' };

  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      return { ok: false, message: 'جلسة الاستعادة غير موجودة أو انتهت. اطلب رابطًا جديدًا من شاشة الدخول.' };
    }

    const { data, error } = await supabase.auth.updateUser({ password });
    if (error || !data.user) {
      return { ok: false, message: 'تعذر تحديث كلمة المرور. افتح أحدث رابط استعادة ثم حاول مرة أخرى.' };
    }
    return { ok: true, account: toAccount(data.user) };
  } catch {
    return { ok: false, message: 'تعذر تحديث كلمة المرور الآن. تحقق من اتصالك وحاول مرة أخرى.' };
  }
}

export async function registerAccount(emailInput: string, password: string): Promise<{ ok: true; account: LocalAccount } | { ok: false; message: string }> {
  const email = emailInput.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, message: 'اكتب بريدًا إلكترونيًا صحيحًا.' };
  if (password.length < 6) return { ok: false, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.' };
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { ok: false, message: error.message.includes('already registered') ? 'هذا البريد مسجل بالفعل؛ استخدم تسجيل الدخول.' : error.message };
  if (!data.user || !data.session) return { ok: false, message: 'تم إنشاء الحساب، لكن تأكيد البريد مفعّل في Supabase. عطّل Confirm email حتى يعمل الدخول المباشر.' };
  return { ok: true, account: toAccount(data.user) };
}

export async function loginAccount(emailInput: string, password: string): Promise<{ ok: true; account: LocalAccount } | { ok: false; message: string }> {
  const { data, error } = await supabase.auth.signInWithPassword({ email: emailInput.trim().toLowerCase(), password });
  if (error || !data.user) return { ok: false, message: 'البريد أو كلمة المرور غير صحيحة.' };
  return { ok: true, account: toAccount(data.user) };
}

export async function logoutAccount(): Promise<void> {
  await supabase.auth.signOut();
}

export async function deleteCurrentAccount(): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (user) {
      try {
        await supabase.rpc('delete_user_account', { p_user_id: user.id });
      } catch {
        try {
          await supabase.from('game_profiles').delete().eq('account_id', user.id);
        } catch {
          // ignore
        }
      }
      await supabase.auth.signOut();
    }
    try {
      globalThis.localStorage?.removeItem(GUEST_ACCOUNT_KEY);
      globalThis.localStorage?.removeItem('business-empire.save-profile.v1');
      globalThis.localStorage?.removeItem('business-empire.save-manifest.v1');
      globalThis.localStorage?.removeItem('business-empire.command-outbox.v1');
    } catch {
      // Storage access fail-safe
    }
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `تعذر حذف الحساب: ${msg}` };
  }
}
