import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual, sign } from 'node:crypto';
import { execSync } from 'node:child_process';

const authPath = join(process.cwd(), '.local', 'admin-auth.json');

type AuthFile = { identifier: string; salt: string; passwordHash: string; sessionSecret: string };
type Request = { method?: string; headers: Record<string, string | string[] | undefined>; [Symbol.asyncIterator](): AsyncIterator<Buffer> };
type Response = { statusCode: number; setHeader(name: string, value: string): void; end(body?: string): void };

function readAuth(): AuthFile | null { if (!existsSync(authPath)) return null; return JSON.parse(readFileSync(authPath, 'utf8')) as AuthFile; }
function hashPassword(password: string, salt: Buffer) { return scryptSync(password, salt, 64).toString('hex'); }
function createSession(auth: AuthFile) { const value = `${auth.identifier}:${Date.now()}:${randomUUID()}`; return `${value}.${createHmac('sha256', auth.sessionSecret).update(value).digest('base64url')}`; }
function validSession(auth: AuthFile | null, cookie: string) { if (!auth || !cookie) return false; const dot = cookie.lastIndexOf('.'); if (dot < 1) return false; const value = cookie.slice(0, dot); const expected = createHmac('sha256', auth.sessionSecret).update(value).digest('base64url'); return timingSafeEqual(Buffer.from(cookie.slice(dot + 1)), Buffer.from(expected)); }
function cookieHeader(value: string, maxAge: number) { return `admin_session=${value}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=None`; }
async function body(request: Request) { let raw = ''; for await (const chunk of request) raw += chunk.toString(); return JSON.parse(raw) as Record<string, unknown>; }
function json(response: Response, status: number, value: unknown) { response.statusCode = status; response.setHeader('content-type', 'application/json'); response.end(JSON.stringify(value)); }

function adminSupabaseConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? 'https://kamxjsddjxowodatafqo.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('مفتاح الخادم غير مضبوط. أضف SUPABASE_SERVICE_ROLE_KEY إلى بيئة الخادم فقط.');
  return { url, key };
}

async function adminSupabaseFetch(path: string, init: RequestInit = {}) {
  const { url, key } = adminSupabaseConfig();
  const headers = new Headers(init.headers);
  headers.set('apikey', key);
  headers.set('authorization', `Bearer ${key}`);
  if (init.body) headers.set('content-type', 'application/json');
  return fetch(`${url}${path}`, { ...init, headers });
}

function adminCodeApi() {
  return { name: 'admin-code-api', configureServer(server: { middlewares: { use: (path: string, handler: (req: Request, res: Response, next: () => void) => void) => void } }) {
    server.middlewares.use('/api/admin/status', (req, res, next) => { if (req.method !== 'GET') return next(); const auth = readAuth(); const cookie = String(req.headers.cookie ?? '').match(/(?:^|;\s*)admin_session=([^;]+)/)?.[1] ?? ''; json(res, 200, { configured: Boolean(auth), authenticated: validSession(auth, cookie) }); });
    server.middlewares.use('/api/admin/setup', async (req, res, next) => { if (req.method !== 'POST') return next(); try { if (readAuth()) return json(res, 409, { message: 'تم إعداد لوحة الإدارة من قبل.' }); const data = await body(req); const identifier = String(data.identifier ?? '').trim(); const password = String(data.password ?? ''); if (!identifier || password.length < 8) return json(res, 400, { message: 'اسم المستخدم مطلوب وكلمة المرور 8 أحرف على الأقل.' }); const salt = randomBytes(16); const auth: AuthFile = { identifier, salt: salt.toString('base64url'), passwordHash: hashPassword(password, salt), sessionSecret: randomBytes(32).toString('base64url') }; writeFileSync(authPath, JSON.stringify(auth, null, 2), { mode: 0o600 }); res.setHeader('set-cookie', cookieHeader(createSession(auth), 60 * 60 * 24 * 30)); json(res, 200, { ok: true }); } catch (error) { json(res, 400, { message: error instanceof Error ? error.message : 'تعذر إعداد الحساب.' }); } });
    server.middlewares.use('/api/admin/login', async (req, res, next) => { if (req.method !== 'POST') return next(); try { const auth = readAuth(); const data = await body(req); if (!auth) return json(res, 409, { message: 'أنشئ حساب الإدارة أولًا.' }); const valid = String(data.identifier ?? '').trim() === auth.identifier && timingSafeEqual(Buffer.from(hashPassword(String(data.password ?? ''), Buffer.from(auth.salt, 'base64url'))), Buffer.from(auth.passwordHash)); if (!valid) return json(res, 401, { message: 'اسم المستخدم أو كلمة المرور غير صحيحة.' }); res.setHeader('set-cookie', cookieHeader(createSession(auth), 60 * 60 * 24 * 30)); json(res, 200, { ok: true }); } catch { json(res, 401, { message: 'اسم المستخدم أو كلمة المرور غير صحيحة.' }); } });
    server.middlewares.use('/api/admin/logout', (req, res, next) => { if (req.method !== 'POST') return next(); res.setHeader('set-cookie', cookieHeader('', 0)); json(res, 200, { ok: true }); });
    server.middlewares.use('/api/admin/issue-code', async (req, res, next) => { if (req.method !== 'POST') return next(); try { const auth = readAuth(); const cookie = String(req.headers.cookie ?? '').match(/(?:^|;\s*)admin_session=([^;]+)/)?.[1] ?? ''; if (!validSession(auth, cookie)) return json(res, 403, { message: 'غير مصرح.' }); const data = await body(req); const cash = data.cash ? Number(data.cash) : 0; const gold = data.gold ? Number(data.gold) : 0; const expiresAt = String(data.expiresAt ?? ''); if ((!Number.isInteger(cash) || cash < 0 || cash > 1_000_000) || (!Number.isFinite(gold) || gold < 0 || gold > 100) || (!cash && !gold) || !Number.isFinite(Date.parse(expiresAt)) || Date.parse(expiresAt) <= Date.now()) throw new Error('تحقق من المال والذهب وتاريخ الانتهاء.'); const keyPath = join(process.cwd(), '.local', 'reward-private.pem'); if (!existsSync(keyPath)) throw new Error('مفتاح الإصدار غير موجود على الخادم.'); const payload = { version: 1, codeId: randomUUID(), issuedAt: new Date().toISOString(), expiresAt, rewards: [...(cash ? [{ type: 'cash', amount: cash }] : []), ...(gold ? [{ type: 'gold', grams: gold }] : [])] }; const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url'); const signature = sign(null, Buffer.from(encodedPayload), readFileSync(keyPath)).toString('base64url'); json(res, 200, { code: `SULY1.${encodedPayload}.${signature}` }); } catch (error) { json(res, 400, { message: error instanceof Error ? error.message : 'تعذر إنشاء الكود.' }); } });
    server.middlewares.use('/api/admin/account-lookup', async (req, res, next) => { if (req.method !== 'POST') return next(); try { const auth = readAuth(); const cookie = String(req.headers.cookie ?? '').match(/(?:^|;\s*)admin_session=([^;]+)/)?.[1] ?? ''; if (!validSession(auth, cookie)) return json(res, 403, { message: 'غير مصرح.' }); const data = await body(req); const accountCode = String(data.accountCode ?? '').trim().toUpperCase(); if (!/^BE-[A-Z0-9]+-[A-Z0-9]+$/.test(accountCode)) return json(res, 400, { message: 'معرّف الحساب غير صالح.' }); const response = await adminSupabaseFetch(`/rest/v1/game_profiles?account_code=eq.${encodeURIComponent(accountCode)}&select=account_code,player_name,game_day,save_data,updated_at`); if (!response.ok) throw new Error('تعذر الاتصال ببيانات الحسابات.'); const rows = await response.json() as Array<{ account_code: string; player_name: string; game_day: number; save_data: Record<string, unknown>; updated_at: string }>; const row = rows[0]; if (!row) return json(res, 404, { message: 'لم يُعثر على حساب بهذا المعرّف.' }); const save = row.save_data ?? {}; return json(res, 200, { accountCode: row.account_code, playerName: row.player_name, gameDay: row.game_day, updatedAt: row.updated_at, bankBalance: Number(save.bankBalance ?? 0), goldGrams: Number(save.goldGrams ?? 0), diamonds: Number(save.diamonds ?? 0), badges: Array.isArray(save.badges) ? save.badges : [], speedCards: Array.isArray(save.speedCards) ? save.speedCards : [] }); } catch (error) { return json(res, 503, { message: error instanceof Error ? error.message : 'تعذر البحث عن الحساب.' }); } });
    server.middlewares.use('/api/admin/account-grant', async (req, res, next) => { if (req.method !== 'POST') return next(); try { const auth = readAuth(); const cookie = String(req.headers.cookie ?? '').match(/(?:^|;\s*)admin_session=([^;]+)/)?.[1] ?? ''; if (!validSession(auth, cookie)) return json(res, 403, { message: 'غير مصرح.' }); const data = await body(req); const accountCode = String(data.accountCode ?? '').trim().toUpperCase(); const cash = data.cash ? Number(data.cash) : 0; const gold = data.gold ? Number(data.gold) : 0; const diamonds = data.diamonds ? Number(data.diamonds) : 0; const badge = String(data.badge ?? '').trim() || null; const speedCardKind = String(data.speedCardKind ?? '').trim() || null; const speedCardQuantity = data.speedCardQuantity ? Number(data.speedCardQuantity) : 0; if (!/^BE-[A-Z0-9]+-[A-Z0-9]+$/.test(accountCode) || !Number.isInteger(cash) || cash < 0 || !Number.isFinite(gold) || gold < 0 || !Number.isInteger(diamonds) || diamonds < 0 || !Number.isInteger(speedCardQuantity) || speedCardQuantity < 0 || (!cash && !gold && !diamonds && !badge && !speedCardQuantity)) return json(res, 400, { message: 'تحقق من المعرّف وقيم المنحة.' }); const response = await adminSupabaseFetch('/rest/v1/rpc/admin_grant_account', { method: 'POST', body: JSON.stringify({ p_account_code: accountCode, p_cash: cash, p_gold: gold, p_diamonds: diamonds, p_badge: badge, p_speed_card_kind: speedCardKind, p_speed_card_quantity: speedCardQuantity, p_granted_by: auth?.identifier ?? 'admin' }) }); if (!response.ok) { const detail = await response.text(); throw new Error(detail.includes('account not found') ? 'لم يُعثر على حساب بهذا المعرّف.' : 'تعذر تسجيل المنحة. تأكد من تطبيق مخطط Supabase الجديد.'); } return json(res, 200, { ok: true, message: 'تم تسجيل المنحة في الحساب وسجل التدقيق.' }); } catch (error) { return json(res, 400, { message: error instanceof Error ? error.message : 'تعذر منح الموارد.' }); } });
    server.middlewares.use('/api/github-push', async (req, res, next) => {
      if (req.method !== 'POST') return next();
      try {
        const data = await body(req);
        const rawToken = String(data.token ?? '').trim();
        if (!rawToken) {
          return json(res, 400, { success: false, message: 'رمز الدخول الشخصي لـ GitHub (PAT) مطلوب لرفع التحديثات.' });
        }
        const token = rawToken.replace(/^["']|["']$/g, '').trim();
        execSync('git config user.name "Suly Business Dev"', { stdio: 'ignore' });
        execSync('git config user.email "videocband@gmail.com"', { stdio: 'ignore' });
        try {
          execSync('git add -A', { stdio: 'ignore' });
          execSync('git commit -m "feat: Upgrade Suly_besnes to professional economic simulation (Phase 1-4 Complete)"', { stdio: 'ignore' });
        } catch {
          // No unstaged changes
        }
        const pushUrl = `https://x-access-token:${encodeURIComponent(token)}@github.com/eslammohamedk123450-netizen/Suly_besnes.git`;
        execSync(`git push "${pushUrl}" HEAD:main`, {
          stdio: 'pipe',
          env: {
            ...process.env,
            GIT_TERMINAL_PROMPT: '0',
          },
        });
        json(res, 200, { success: true, message: 'تم رفع جميع التحديثات وقصة الكفاح والميزات الجديدة إلى مستودع GitHub بنجاح!' });
      } catch (err: unknown) {
        let msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('Authentication failed') || msg.includes('Invalid username or token')) {
          msg = 'رمز GitHub Token غير صالح أو تنقصه صلاحية الكتابة (repo). يرجى التأكد من اختيار Classic Token وتفعيل صلاحية repo.';
        }
        json(res, 500, { success: false, message: `فشل الرفع إلى GitHub: ${msg}` });
      }
    });
  } };
}

export default defineConfig({ plugins: [react(), adminCodeApi()], server: { host: '0.0.0.0', port: 3000, strictPort: true, allowedHosts: true }, preview: { host: '0.0.0.0', port: 3000, strictPort: true, allowedHosts: true }, build: { target: 'es2022', sourcemap: false } });
