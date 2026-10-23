import { supabase } from './supabaseClient';

export interface LocalAccount {
  id: string;
  email: string;
  createdAt: string;
  isGuest?: boolean;
}

const GUEST_ACCOUNT_KEY = 'business-empire.guest-account.v1';

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
