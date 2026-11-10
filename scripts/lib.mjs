import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const CONTENT_DIR = path.join(ROOT, 'content');
export const ENC_FILE = path.join(ROOT, 'public', 'content.enc');

export function getPassword() {
  const fromEnv = process.env.CONTENT_PASSWORD;
  if (fromEnv) return fromEnv;
  const file = path.join(ROOT, '.content-password');
  if (fs.existsSync(file)) return fs.readFileSync(file, 'utf8').trim();
  console.error('Chybí heslo: nastav proměnnou CONTENT_PASSWORD nebo soubor .content-password (je v .gitignore).');
  process.exit(1);
}

const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));

function readDir(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .flatMap((f) => {
      const data = readJson(path.join(dir, f));
      if (!Array.isArray(data)) throw new Error(`${dir}/${f}: očekáváno pole otázek`);
      return data.map((q) => ({ ...q, _file: f }));
    });
}

/** Načte content/ – topics.json, meta.json, oral/*.json, quiz/*.json */
export function loadContent(dir = CONTENT_DIR) {
  const meta = fs.existsSync(path.join(dir, 'meta.json')) ? readJson(path.join(dir, 'meta.json')) : { version: 0 };
  return {
    meta,
    topics: readJson(path.join(dir, 'topics.json')),
    oral: readDir(path.join(dir, 'oral')),
    quiz: readDir(path.join(dir, 'quiz')),
  };
}

export const strip = (arr) => arr.map(({ _file, ...q }) => q);

/** Vrátí seznam chyb (prázdný = v pořádku). */
export function validate({ topics, oral, quiz }) {
  const errors = [];
  const where = (q) => `${q._file ?? '?'} › ${q.id ?? '(bez id)'}`;
  const topicIds = new Set();
  for (const t of topics) {
    if (!t.id || !t.title) errors.push(`topics.json: okruh bez id/title: ${JSON.stringify(t)}`);
    if (topicIds.has(t.id)) errors.push(`topics.json: duplicitní id okruhu ${t.id}`);
    topicIds.add(t.id);
    if (!Array.isArray(t.parts) || !t.parts.every((p) => p === 'oral' || p === 'quiz'))
      errors.push(`topics.json: okruh ${t.id} má neplatné parts (oral/quiz)`);
  }
  const seen = new Set();
  const checkCommon = (q, kind) => {
    if (!q.id) errors.push(`${where(q)}: chybí id`);
    const k = `${kind}:${q.id}`;
    if (seen.has(k)) errors.push(`${where(q)}: duplicitní id`);
    seen.add(k);
    if (!topicIds.has(q.topicId)) errors.push(`${where(q)}: neznámý okruh "${q.topicId}"`);
    if (!q.question?.trim()) errors.push(`${where(q)}: chybí znění otázky`);
    if (q.source && !['podklad', 'ai', 'mix'].includes(q.source)) errors.push(`${where(q)}: neplatný source`);
    if (q.refs && !Array.isArray(q.refs)) errors.push(`${where(q)}: refs musí být pole`);
  };
  for (const q of oral) {
    checkCommon(q, 'o');
    if (!q.answer?.trim()) errors.push(`${where(q)}: chybí odpověď`);
    if (!q.source) errors.push(`${where(q)}: chybí source (podklad/ai/mix)`);
  }
  for (const q of quiz) {
    checkCommon(q, 'q');
    if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 6)
      errors.push(`${where(q)}: options musí mít 2–6 možností`);
    else if (q.options.some((o) => !String(o).trim())) errors.push(`${where(q)}: prázdná možnost`);
    if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct >= (q.options?.length ?? 0))
      errors.push(`${where(q)}: neplatný index correct`);
    if (!q.explanation?.trim()) errors.push(`${where(q)}: chybí vysvětlení`);
    if (q.optionNotes && q.optionNotes.length !== q.options?.length)
      errors.push(`${where(q)}: optionNotes musí mít stejný počet jako options`);
    if (q.options && new Set(q.options.map((o) => String(o).trim())).size !== q.options.length)
      errors.push(`${where(q)}: duplicitní možnosti`);
  }
  return errors;
}

export function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}
