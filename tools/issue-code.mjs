#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { generateKeyPairSync, randomUUID, sign } from 'node:crypto';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const keyDir = join(root, '.local');
const privateKeyPath = join(keyDir, 'reward-private.pem');
const publicKeyPath = join(keyDir, 'reward-public.pem');

function args() {
  const values = {};
  for (let index = 2; index < process.argv.length; index += 1) {
    const value = process.argv[index];
    if (!value.startsWith('--')) continue;
    const key = value.slice(2);
    values[key] = process.argv[index + 1]?.startsWith('--') ? true : process.argv[++index];
  }
  return values;
}

async function ensureKeys() {
  await mkdir(keyDir, { recursive: true });
  if (existsSync(privateKeyPath) && existsSync(publicKeyPath)) return;
  const pair = generateKeyPairSync('ed25519', { privateKeyEncoding: { type: 'pkcs8', format: 'pem' }, publicKeyEncoding: { type: 'spki', format: 'pem' } });
  await writeFile(privateKeyPath, pair.privateKey, { mode: 0o600 });
  await writeFile(publicKeyPath, pair.publicKey, { mode: 0o644 });
  console.log(`تم إنشاء مفاتيح الإصدار محليًا داخل ${keyDir}؛ لا ترفعها إلى GitHub.`);
}

const input = args();
const cash = input.cash ? Number(input.cash) : 0;
const gold = input.gold ? Number(input.gold) : 0;
const expiresAt = input.expires ?? new Date(Date.now() + 90 * 86_400_000).toISOString();
if (!Number.isInteger(cash) || cash < 0 || cash > 1_000_000) throw new Error('قيمة cash يجب أن تكون رقمًا صحيحًا بين 0 و1,000,000.');
if (!Number.isFinite(gold) || gold < 0 || gold > 100) throw new Error('قيمة gold يجب أن تكون بين 0 و100 غرام.');
if (!cash && !gold) throw new Error('أدخل --cash أو --gold على الأقل.');
if (!Number.isFinite(Date.parse(expiresAt)) || Date.parse(expiresAt) <= Date.now()) throw new Error('تاريخ الانتهاء يجب أن يكون مستقبليًا بصيغة ISO.');

await ensureKeys();
const privateKey = await readFile(privateKeyPath, 'utf8');
const payload = { version: 1, codeId: randomUUID(), issuedAt: new Date().toISOString(), expiresAt, rewards: [...(cash ? [{ type: 'cash', amount: cash }] : []), ...(gold ? [{ type: 'gold', grams: gold }] : [])] };
const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
const signature = sign(null, Buffer.from(encodedPayload), privateKey).toString('base64url');
console.log(`SULY1.${encodedPayload}.${signature}`);
console.log(`المعرف: ${payload.codeId}`);
console.log(`ينتهي: ${payload.expiresAt}`);
