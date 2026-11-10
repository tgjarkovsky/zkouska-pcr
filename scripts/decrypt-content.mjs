// public/content.enc -> content/ (rozdělí otázky do souborů podle okruhů)
import fs from 'node:fs';
import path from 'node:path';
import { decryptJson } from '../shared/crypto.js';
import { CONTENT_DIR, ENC_FILE, getPassword, writeJson } from './lib.mjs';

if (fs.existsSync(path.join(CONTENT_DIR, 'topics.json')) && !process.argv.includes('--force')) {
  console.error('content/ už existuje. Pro přepsání spusť s --force.');
  process.exit(1);
}

let c;
try {
  c = await decryptJson(JSON.parse(fs.readFileSync(ENC_FILE, 'utf8')), getPassword());
} catch {
  console.error('✗ Dešifrování selhalo – špatné heslo?');
  process.exit(1);
}

fs.rmSync(path.join(CONTENT_DIR, 'oral'), { recursive: true, force: true });
fs.rmSync(path.join(CONTENT_DIR, 'quiz'), { recursive: true, force: true });
writeJson(path.join(CONTENT_DIR, 'topics.json'), c.topics);
writeJson(path.join(CONTENT_DIR, 'meta.json'), { version: c.version });
const group = (arr) =>
  arr.reduce((m, q) => {
    (m[q.topicId] ??= []).push(q);
    return m;
  }, {});
for (const [t, qs] of Object.entries(group(c.oral))) writeJson(path.join(CONTENT_DIR, 'oral', `${t}.json`), qs);
for (const [t, qs] of Object.entries(group(c.quiz))) writeJson(path.join(CONTENT_DIR, 'quiz', `${t}.json`), qs);
console.log(`✓ Dešifrováno do content/: verze ${c.version}, ${c.oral.length} ústních, ${c.quiz.length} ABCD.`);
