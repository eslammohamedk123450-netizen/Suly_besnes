#!/usr/bin/env node
import { chmod, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { stdin, stdout } from 'node:process';

const projectRoot = resolve(new URL('..', import.meta.url).pathname);
const envPath = resolve(projectRoot, '.env');

function readHidden(prompt) {
  if (!stdin.isTTY || typeof stdin.setRawMode !== 'function') {
    throw new Error('يلزم تشغيل بوابة الإعداد من طرفية تفاعلية حتى لا يظهر المفتاح أثناء الإدخال.');
  }

  return new Promise((resolvePrompt, reject) => {
    let value = '';
    const restore = () => {
      stdin.setRawMode?.(false);
      stdin.pause();
      stdin.removeListener('data', onData);
      stdout.write('\n');
    };
    const onData = (chunk) => {
      for (const character of String(chunk)) {
        if (character === '\u0003') {
          restore();
          reject(new Error('تم إلغاء إدخال المفتاح.'));
          return;
        }
        if (character === '\r' || character === '\n') {
          restore();
          resolvePrompt(value);
          return;
        }
        if (character === '\u007f' || character === '\b') {
          value = value.slice(0, -1);
          continue;
        }
        value += character;
      }
    };

    stdout.write(prompt);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    stdin.on('data', onData);
  });
}

function upsertEnvValue(source, key, value) {
  const escaped = value.replace(/\\/g, '\\\\').replace(/\n/g, '');
  const line = `${key}=${escaped}`;
  const matcher = new RegExp(`^${key.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}=.*$`, 'm');
  return matcher.test(source) ? source.replace(matcher, line) : `${source.trimEnd()}\n${line}\n`;
}

async function main() {
  console.log('بوابة إعداد Ollama الآمنة');
  console.log('لن يظهر المفتاح أثناء الكتابة، ولن يتم طباعته أو حفظه في Git.\n');
  const key = (await readHidden('الصق Ollama API key ثم اضغط Enter: ')).trim();
  if (!key || key.length < 8) throw new Error('المفتاح فارغ أو قصير جدًا.');

  let current = '';
  try { current = await readFile(envPath, 'utf8'); } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const next = upsertEnvValue(upsertEnvValue(current, 'OLLAMA_API_KEY', key), 'OLLAMA_MODEL', 'qwen2.5-coder:7b');
  const tempPath = `${envPath}.tmp-${process.pid}`;
  await writeFile(tempPath, next, { encoding: 'utf8', mode: 0o600 });
  await chmod(tempPath, 0o600);
  await rename(tempPath, envPath);
  console.log('تم حفظ المفتاح محليًا في .env بصلاحية 600. أعد تشغيل npm run dev لتطبيقه.');
}

main().catch((error) => {
  console.error(`فشل إعداد Ollama: ${error.message}`);
  process.exitCode = 1;
});
