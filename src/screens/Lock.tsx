import { useState } from 'react';

export function Lock({ onUnlock }: { onUnlock: (password: string, remember: boolean) => Promise<boolean> }) {
  const [pass, setPass] = useState('');
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="lock">
      <form
        className="card lock-card"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!pass) return;
          setBusy(true);
          setError(false);
          const ok = await onUnlock(pass, remember);
          setBusy(false);
          if (!ok) setError(true);
        }}
      >
        <img src="icon.svg" alt="" width={72} height={72} />
        <h1>Služební zkouška</h1>
        <p className="muted">Zadej heslo pro přístup k podkladům.</p>
        <input
          className="search"
          type="password"
          autoComplete="current-password"
          placeholder="Heslo"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          autoFocus
          aria-invalid={error}
        />
        {error && <p className="error">Nesprávné heslo.</p>}
        <label className="check">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          Zapamatovat na tomto zařízení
        </label>
        <button className="btn primary block" disabled={busy || !pass}>
          {busy ? 'Odemykám…' : 'Odemknout'}
        </button>
      </form>
    </div>
  );
}
