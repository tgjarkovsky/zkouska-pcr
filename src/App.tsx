import { useCallback, useEffect, useState } from 'react';
import { decryptJson, type EncPayload } from '../shared/crypto.js';
import type { Content } from './lib/types';
import { useRoute } from './lib/router';
import { forgetPassword, savedPassword, savePassword, useSettings } from './lib/store';
import { Lock } from './screens/Lock';
import { Home } from './screens/Home';
import { Oral } from './screens/Oral';
import { Quiz } from './screens/Quiz';
import { Review } from './screens/Review';
import { Exam } from './screens/Exam';
import { Stats } from './screens/Stats';
import { Settings } from './screens/Settings';
import { Nanynka } from './components/Nanynka';

type Status = 'loading' | 'locked' | 'ready' | 'error';

export default function App() {
  const [status, setStatus] = useState<Status>('loading');
  const [payload, setPayload] = useState<EncPayload | null>(null);
  const [content, setContent] = useState<Content | null>(null);
  const settings = useSettings();

  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('content.enc', { cache: 'no-cache' });
        if (!res.ok) throw new Error(String(res.status));
        const p = (await res.json()) as EncPayload;
        setPayload(p);
        const saved = savedPassword();
        if (saved) {
          try {
            setContent(await decryptJson<Content>(p, saved));
            setStatus('ready');
            return;
          } catch {
            forgetPassword(); // heslo se mezitím změnilo
          }
        }
        setStatus('locked');
      } catch {
        setStatus('error');
      }
    })();
  }, []);

  const unlock = useCallback(
    async (password: string, remember: boolean) => {
      if (!payload) return false;
      try {
        const c = await decryptJson<Content>(payload, password);
        if (remember) savePassword(password);
        setContent(c);
        setStatus('ready');
        return true;
      } catch {
        return false;
      }
    },
    [payload],
  );

  if (status === 'loading')
    return (
      <div className="splash">
        <Nanynka mood="happy" size={110} />
        <p className="muted">Nanynka chystá otázky…</p>
      </div>
    );
  if (status === 'error')
    return (
      <div className="splash">
        <Nanynka mood="sad" size={110} />
        <p>Obsah se nepodařilo načíst. Zkontroluj připojení k internetu a zkus to znovu.</p>
        <button className="btn primary" onClick={() => location.reload()}>
          Zkusit znovu
        </button>
      </div>
    );
  if (status === 'locked' || !content) return <Lock onUnlock={unlock} />;
  return <Shell content={content} />;
}

const TABS = [
  { path: '/', label: 'Přehled', icon: '🏠' },
  { path: '/ustni', label: 'Ústní', icon: '🗣️' },
  { path: '/test', label: 'Test', icon: '🎯' },
  { path: '/opakovani', label: 'Opakování', icon: '🔁' },
  { path: '/zkouska', label: 'Zkouška', icon: '⏱️' },
];

function Shell({ content }: { content: Content }) {
  const route = useRoute();
  let screen;
  switch (route.path) {
    case '/ustni':
      screen = <Oral content={content} route={route} />;
      break;
    case '/test':
      screen = <Quiz content={content} route={route} />;
      break;
    case '/opakovani':
      screen = <Review content={content} />;
      break;
    case '/zkouska':
      screen = <Exam content={content} />;
      break;
    case '/statistiky':
      screen = <Stats content={content} />;
      break;
    case '/nastaveni':
      screen = <Settings content={content} />;
      break;
    default:
      screen = <Home content={content} />;
  }
  return (
    <div className="app">
      <main key={route.path}>{screen}</main>
      <nav className="tabbar">
        {TABS.map((t) => (
          <a key={t.path} href={`#${t.path}`} className={route.path === t.path ? 'on' : ''}>
            <span className="tab-icon" aria-hidden>
              {t.icon}
            </span>
            <span>{t.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
