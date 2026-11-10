// content/ (čitelné JSON) -> public/content.enc (zašifrováno heslem)
import fs from 'node:fs';
import path from 'node:path';
import { encryptJson } from '../shared/crypto.js';
import { CONTENT_DIR, ENC_FILE, getPassword, loadContent, strip, validate, writeJson } from './lib.mjs';

const c = loadContent();
const errors = validate(c);
if (errors.length) {
  console.error(`✗ Obsah obsahuje chyby, nešifruji:\n  ` + errors.join('\n  '));
  process.exit(1);
}

const version = (c.meta.version ?? 0) + 1;
const updated = new Date().toLocaleDateString('cs-CZ', { timeZone: 'Europe/Prague' });
const bundle = { version, updated, topics: c.topics, oral: strip(c.oral), quiz: strip(c.quiz) };

const payload = await encryptJson(bundle, getPassword());
fs.mkdirSync(path.dirname(ENC_FILE), { recursive: true });
fs.writeFileSync(ENC_FILE, JSON.stringify(payload));
writeJson(path.join(CONTENT_DIR, 'meta.json'), { version });
console.log(`✓ Zašifrováno: verze ${version}, ${bundle.oral.length} ústních + ${bundle.quiz.length} ABCD -> public/content.enc`);
