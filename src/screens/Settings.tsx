import { useRef, useState } from 'react';
import type { Content } from '../lib/types';
import { parseProgress } from '../lib/progress';
import { forgetPassword, progressStore, settingsStore, useSettings, type Theme } from '../lib/store';
import { ScreenHeader } from '../components/ui';

export function Settings({ content }: { content: Content }) {
  const settings = useSettings();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const exportProgress = () => {
    const blob = new Blob([JSON.stringify(progressStore.get(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `pokrok-zkouska-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importProgress = async (file: File) => {
    try {
      const data = parseProgress(JSON.parse(await file.text()));
      if (!data) throw new Error();
      if (!confirm('Nahradit současný pokrok importovaným?')) return;
      progressStore.replace(data);
      setMsg('Pokrok byl úspěšně načten.');
    } catch {
      setMsg('Soubor se nepodařilo načíst – není to záloha z této aplikace.');
    }
  };

  return (
    <div className="screen">
      <ScreenHeader title="Nastavení" />

      <section className="card">
        <h3>Vzhled</h3>
        <div className="seg wide">
          {(['auto', 'light', 'dark'] as Theme[]).map((t) => (
            <button key={t} className={settings.theme === t ? 'on' : ''} onClick={() => settingsStore.set({ ...settings, theme: t })}>
              {t === 'auto' ? 'Podle systému' : t === 'light' ? 'Světlý' : 'Tmavý'}
            </button>
          ))}
        </div>
        <label className="check" style={{ marginTop: 12 }}>
          <input
            type="checkbox"
            checked={settings.sound}
            onChange={(e) => settingsStore.set({ ...settings, sound: e.target.checked })}
          />
          Zvuky při odpovědích 🔔
        </label>
      </section>

      <section className="card">
        <h3>Záloha pokroku</h3>
        <p className="muted small">
          Pokrok se ukládá jen v tomto zařízení. Pro přenos mezi mobilem a počítačem si ho vyexportuj a na druhém zařízení naimportuj.
        </p>
        <div className="stack">
          <button className="btn block" onClick={exportProgress}>
            Exportovat pokrok
          </button>
          <button className="btn block" onClick={() => fileRef.current?.click()}>
            Importovat pokrok
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importProgress(f);
              e.target.value = '';
            }}
          />
          {msg && <p className="note">{msg}</p>}
          <button
            className="btn danger block"
            onClick={() => confirm('Opravdu smazat veškerý pokrok a historii simulací?') && progressStore.reset()}
          >
            Smazat pokrok
          </button>
        </div>
      </section>

      <section className="card">
        <h3>Obsah</h3>
        <p className="muted small">
          Verze {content.version}, aktualizováno {content.updated}. {content.topics.length} okruhů, {content.oral.length} ústních
          a {content.quiz.length} testových otázek.
        </p>
        <p className="muted small">
          Odpovědi označené „Vypracováno AI – ověř“ nevznikly z tvých podkladů – ověř je proti aktuálnímu znění předpisů.
        </p>
        <button
          className="btn ghost block"
          onClick={() => {
            forgetPassword();
            location.reload();
          }}
        >
          Zamknout (zapomenout heslo na tomto zařízení)
        </button>
      </section>
    </div>
  );
}
