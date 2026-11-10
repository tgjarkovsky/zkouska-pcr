# S Nanynkou ke zkoušce

Hravá mobilní webová aplikace (PWA) na učení ke služební zkoušce, kterou provází policistka Nanynka:

- **Ústní zkouška** – kartičky otázka → odkrýt odpověď, sebehodnocení, seznam s vyhledáváním
- **Test ABCD** – klikací kvíz s vysvětlením, proč je správná právě daná odpověď a proč ne ostatní
- **Chytré opakování** – otázky, které nejdou, se vracejí častěji (Leitnerovy krabičky)
- **Simulace zkoušky** – test s časovým limitem a vyhodnocením, losování ústních otázek
- **Statistiky** – úspěšnost po okruzích, nejslabší otázky, historie simulací
- **Hra** – XP, hodnosti jako úrovně, denní série 🔥, denní cíl, odznaky, konfety a zvuky

Obsah je zašifrovaný heslem, pokrok se ukládá v zařízení (export/import v Nastavení). Na mobilu lze přidat na plochu a funguje offline.

## Vývoj

```bash
npm ci
npm run dev
```

Úpravy obsahu viz [CLAUDE.md](CLAUDE.md).
