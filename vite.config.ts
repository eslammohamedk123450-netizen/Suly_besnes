import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID, sign } from 'node:crypto';

const ADMIN_EMAIL = 'eslammohamedk123450@gmail.com';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? 'https://kamxjsddjxowodatafqo.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_IE_QzPs6aAY5mqwmVKKNPQ_IneffLN6';

function adminCodeApi() {
  return { name: 'admin-code-api', configureServer(server: { middlewares: { use: (path: string, handler: (req: any, res: any, next: () => void) => void) => void } }) {
    server.middlewares.use('/api/admin/issue-code', async (req, res, next) => {
      if (req.method !== 'POST') return next();
      try {
        const token = String(req.headers.authorization ?? '').replace(/^Bearer\s+/i, '');
        const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_KEY, authorization: `Bearer ${token}` } });
        const user = await userResponse.json() as { email?: string };
        if (!userResponse.ok || user.email?.toLowerCase() !== ADMIN_EMAIL) { res.statusCode = 403; res.setHeader('content-type', 'application/json'); res.end(JSON.stringify({ message: 'غير مصرح.' })); return; }
        let raw = '';
        for await (const chunk of req) raw += chunk;
        const body = JSON.parse(raw) as { cash?: number | string; gold?: number | string; expiresAt?: string };
        const cash = body.cash ? Number(body.cash) : 0;
        const gold = body.gold ? Number(body.gold) : 0;
        const expiresAt = body.expiresAt ?? '';
        if ((!Number.isInteger(cash) || cash < 0 || cash > 1_000_000) || (!Number.isFinite(gold) || gold < 0 || gold > 100) || (!cash && !gold) || !Number.isFinite(Date.parse(expiresAt)) || Date.parse(expiresAt) <= Date.now()) throw new Error('تحقق من المال والذهب وتاريخ الانتهاء.');
        const keyPath = join(process.cwd(), '.local', 'reward-private.pem');
        if (!existsSync(keyPath)) throw new Error('مفتاح الإصدار غير موجود على الخادم.');
        const payload = { version: 1, codeId: randomUUID(), issuedAt: new Date().toISOString(), expiresAt, rewards: [...(cash ? [{ type: 'cash', amount: cash }] : []), ...(gold ? [{ type: 'gold', grams: gold }] : [])] };
        const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
        const signature = sign(null, Buffer.from(encodedPayload), readFileSync(keyPath)).toString('base64url');
        res.statusCode = 200; res.setHeader('content-type', 'application/json'); res.end(JSON.stringify({ code: `SULY1.${encodedPayload}.${signature}` }));
      } catch (error) { res.statusCode = 400; res.setHeader('content-type', 'application/json'); res.end(JSON.stringify({ message: error instanceof Error ? error.message : 'تعذر إنشاء الكود.' })); }
    });
  } };
}

export default defineConfig({
  plugins: [react(), adminCodeApi()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: ['3000-iketdicg64pocr7bvbsfa-c733e53e.sg2.manus.computer'],
  },
  build: {
    target: 'es2022',
    sourcemap: false,
  },
});
