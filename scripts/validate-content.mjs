import { loadContent, validate } from './lib.mjs';

const c = loadContent();
const errors = validate(c);
if (errors.length) {
  console.error(`✗ Nalezeno ${errors.length} chyb:\n  ` + errors.join('\n  '));
  process.exit(1);
}
const ai = c.oral.filter((q) => q.source !== 'podklad').length;
console.log(
  `✓ Obsah v pořádku: ${c.topics.length} okruhů, ${c.oral.length} ústních (${ai} s AI doplněním), ${c.quiz.length} ABCD.`,
);
