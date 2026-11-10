# Služební zkouška – učební aplikace

Statická PWA (Vite + React + TS) na přípravu ke služební zkoušce PČR. Veselý tón bez gamifikace (uživatel nechce XP, hodnosti ani odznaky): maskot policistka Nanynka (`src/components/Nanynka.tsx`, hlášky v `src/lib/lines.ts`). Nasazuje se automaticky na GitHub Pages při pushi do `main`.

## Obsah je zašifrovaný

- V repozitáři je jen `public/content.enc` (AES-GCM, heslo → PBKDF2). Čitelné zdroje v `content/` jsou v `.gitignore` a **nikdy se necommitují**.
- Heslo: proměnná `CONTENT_PASSWORD` nebo soubor `.content-password` (gitignored). Pokud chybí, zeptej se uživatele. Heslo nikdy nezapisuj do repozitáře, commit message ani kódu.
- Nová relace: `npm ci && npm run content:decrypt` → vznikne `content/`.

## Struktura content/

- `topics.json` – okruhy `{ id, title, parts: ["oral"|"quiz", ...] }`
- `oral/<topicId>.json` – pole `{ id, topicId, question, answer (markdown), source, refs? }`
- `quiz/<topicId>.json` – pole `{ id, topicId, question, options[4], correct (0=A), explanation (markdown), optionNotes[4], refs?, source? }`
- `meta.json` – verze (zvyšuje ji encrypt skript)
- `source`: `podklad` = přepsáno z fotky, `ai` = vypracováno AI, `mix` = podklad doplněný AI

## Postup při nahrání fotek podkladů

1. Přečti každou fotku pečlivě. Nečitelná místa **nehádej** – vypiš je uživateli k doplnění.
2. Ústní otázky: přepiš otázku. Má-li podklad odpověď, přepiš ji (`podklad`); chybí-li nebo je neúplná, vypracuj ji podle platných předpisů (`ai` / `mix`) a uveď `refs` (§ a číslo zákona).
3. ABCD: přepiš otázku a možnosti v původním pořadí. Správnou odpověď ber z podkladu; pokud ji podklad neuvádí, urči ji a dej `source: "ai"`. Vždy napiš `explanation` (proč právě tato) a `optionNotes` (proč ne ostatní). Pokud se ti správná odpověď z podkladu nezdá, **neopravuj potichu** – upozorni uživatele.
4. Id: krátké, stabilní, unikátní (např. `zop-012`), už existující id neměň (navázaný pokrok uživatele).
5. Zařaď do okruhů (přidej nový do `topics.json`, je-li potřeba).
6. `npm run content:validate` → `npm run content:encrypt` → `npm test && npm run build` → commit jen `public/content.enc` (+ kód) → push.
7. Uživateli shrň: kolik otázek přibylo, co je AI-vypracované k ověření, co bylo nečitelné.

## Příkazy

- `npm run dev` / `npm run build` / `npm test`
- `npm run content:validate | content:encrypt | content:decrypt [--force]`
