const ACCOUNTS_KEY = 'business-empire.accounts.v1';
const SESSION_KEY = 'business-empire.session.v1';

export interface LocalAccount {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

function readAccounts(): LocalAccount[] {
  try {
    const raw = globalThis.localStorage?.getItem(ACCOUNTS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is LocalAccount => Boolean(item && typeof item === 'object' && typeof (item as LocalAccount).id === 'string' && typeof (item as LocalAccount).email === 'string' && typeof (item as LocalAccount).passwordHash === 'string')) : [];
  } catch {
    return [];
  }
}

async function hashPassword(email: string, password: string): Promise<string> {
  const data = new TextEncoder().encode(`${email.trim().toLowerCase()}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function setSession(account: LocalAccount): LocalAccount {
  globalThis.localStorage?.setItem(SESSION_KEY, account.id);
  return account;
}

export function loadCurrentAccount(): LocalAccount | null {
  try {
    const id = globalThis.localStorage?.getItem(SESSION_KEY);
    return id ? readAccounts().find((account) => account.id === id) ?? null : null;
  } catch {
    return null;
  }
}

export async function registerAccount(emailInput: string, password: string): Promise<{ ok: true; account: LocalAccount } | { ok: false; message: string }> {
  const email = emailInput.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, message: 'اكتب بريدًا إلكترونيًا صحيحًا.' };
  if (password.length < 6) return { ok: false, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.' };
  const accounts = readAccounts();
  if (accounts.some((account) => account.email === email)) return { ok: false, message: 'هذا البريد مسجل بالفعل؛ استخدم تسجيل الدخول.' };
  const account: LocalAccount = { id: `account-${crypto.randomUUID()}`, email, passwordHash: await hashPassword(email, password), createdAt: new Date().toISOString() };
  globalThis.localStorage?.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, account]));
  return { ok: true, account: setSession(account) };
}

export async function loginAccount(emailInput: string, password: string): Promise<{ ok: true; account: LocalAccount } | { ok: false; message: string }> {
  const email = emailInput.trim().toLowerCase();
  const account = readAccounts().find((item) => item.email === email);
  if (!account || account.passwordHash !== await hashPassword(email, password)) return { ok: false, message: 'البريد أو كلمة المرور غير صحيحة.' };
  return { ok: true, account: setSession(account) };
}

export function logoutAccount(): void {
  globalThis.localStorage?.removeItem(SESSION_KEY);
}
