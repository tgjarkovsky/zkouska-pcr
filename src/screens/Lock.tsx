import { useState } from 'react';
import { LINES, pick } from '../lib/lines';
import { NanynkaSays } from '../components/Nanynka';

export function Lock({ onUnlock }: { onUnlock: (password: string, remember: boolean) => Promise<boolean> }) {
  const [pass, setPass] = useState('');
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hello] = useState(() => pick(LINES.lock));

  return (
    <div className="lock">
      <form
        className="card lock-card pop-in"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!pass) return;
          setBusy(true);
          setError(null);
          const ok = await onUnlock(pass, remember);
          setBusy(false);
          if (!ok) setError(pick(LINES.wrongPassword));
        }}
      >
        <NanynkaSays mood={error ? 'sad' : 'wave'} size={120} className="lock-says">
          {error ?? hello}
        </NanynkaSays>
        <h1>S Nanynkou ke zkoušce</h1>
        <input
          className={`search ${error ? 'shake' : ''}`}
          type="password"
          autoComplete="current-password"
          placeholder="Heslo"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          autoFocus
          aria-invalid={!!error}
        />
        <label className="check">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          Zapamatovat na tomto zařízení
        </label>
        <button className="btn primary block" disabled={busy || !pass}>
          {busy ? 'Ověřuji…' : 'Jdeme na to! 🚓'}
        </button>
      </form>
    </div>
  );
}
