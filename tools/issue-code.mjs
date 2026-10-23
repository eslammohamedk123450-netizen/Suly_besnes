#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { randomUUID, sign } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const keyDir = join(root, '.local');
const privateKeyPath = join(keyDir, 'reward-private.pem');

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

async function askForValues() {
  const reader = createInterface({ input, output });
  const cash = await reader.question('المبلغ داخل اللعبة بالجنيه (0 إذا لا يوجد): ');
  const gold = await reader.question('الذهب بالجرام (0 إذا لا يوجد): ');
  const expires = await reader.question('تاريخ الانتهاء ISO (اتركه فارغًا لمدة 90 يومًا): ');
  reader.close();
  return { cash, gold, expires };
}

async function loadPrivateKey() {
  if (!existsSync(privateKeyPath)) {
    throw new Error(`مفتاح الإصدار غير موجود: ${privateKeyPath}. لا تنشئ مفتاحًا جديدًا، واستعد نسخة المفتاح الإنتاجي أولًا.`);
  }
  return readFile(privateKeyPath, 'utf8');
}

const supplied = args();
const inputValues = Object.keys(supplied).length ? supplied : await askForValues();
const cash = inputValues.cash ? Number(inputValues.cash) : 0;
const gold = inputValues.gold ? Number(inputValues.gold) : 0;
const expiresAt = inputValues.expires || new Date(Date.now() + 90 * 86_400_000).toISOString();

if (!Number.isInteger(cash) || cash < 0 || cash > 1_000_000) throw new Error('قيمة cash يجب أن تكون رقمًا صحيحًا بين 0 و1,000,000.');
if (!Number.isFinite(gold) || gold < 0 || gold > 1_000_000) throw new Error('قيمة gold يجب أن تكون بين 0 و1,000,000 غرام.');
if (!cash && !gold) throw new Error('أدخل مبلغًا أو ذهبًا على الأقل.');
if (!Number.isFinite(Date.parse(expiresAt)) || Date.parse(expiresAt) <= Date.now()) throw new Error('تاريخ الانتهاء يجب أن يكون مستقبليًا بصيغة ISO.');

const privateKey = await loadPrivateKey();
const payload = {
  version: 1,
  codeId: randomUUID(),
  issuedAt: new Date().toISOString(),
  expiresAt,
  rewards: [...(cash ? [{ type: 'cash', amount: cash }] : []), ...(gold ? [{ type: 'gold', grams: gold }] : [])],
};
const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
const signature = sign(null, Buffer.from(encodedPayload), privateKey).toString('base64url');
console.log(`SULY1.${encodedPayload}.${signature}`);
console.log(`المعرف: ${payload.codeId}`);
console.log(`ينتهي: ${payload.expiresAt}`);
