import { supabase } from './supabaseClient';

export interface LocalAccount {
  id: string;
  email: string;
  createdAt: string;
}

function toAccount(user: { id: string; email?: string; created_at?: string }): LocalAccount {
  return { id: user.id, email: user.email ?? '', createdAt: user.created_at ?? new Date().toISOString() };
}

export async function loadCurrentAccount(): Promise<LocalAccount | null> {
  const { data } = await supabase.auth.getUser();
  return data.user ? toAccount(data.user) : null;
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
