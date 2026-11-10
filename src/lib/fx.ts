// Drobné efekty: zvuky (WebAudio, bez souborů), vibrace a konfety.
import { settingsStore } from './store';

let ctx: AudioContext | null = null;

const TUNES: Record<string, { notes: number[]; type: OscillatorType; gap: number }> = {
  good: { notes: [659, 988], type: 'sine', gap: 0.08 },
  bad: { notes: [262, 196], type: 'triangle', gap: 0.12 },
  pop: { notes: [880], type: 'sine', gap: 0 },
  fanfare: { notes: [523, 659, 784, 1047], type: 'triangle', gap: 0.1 },
};

export function play(kind: keyof typeof TUNES) {
  if (!settingsStore.get().sound) return;
  try {
    ctx ??= new AudioContext();
    const tune = TUNES[kind];
    tune.notes.forEach((f, i) => {
      const o = ctx!.createOscillator();
      const g = ctx!.createGain();
      o.type = tune.type;
      o.frequency.value = f;
      const t = ctx!.currentTime + i * tune.gap;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
      o.connect(g).connect(ctx!.destination);
      o.start(t);
      o.stop(t + 0.3);
    });
  } catch {
    /* bez zvuku */
  }
}

export function buzz(ms: number | number[]) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* ignore */
  }
}

const COLORS = ['#ffc93c', '#2f6fdf', '#ff6b6b', '#22b07d', '#a66cff', '#ff9f43'];

export function confetti(amount = 140) {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'confetti';
  const dpr = window.devicePixelRatio || 1;
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  document.body.appendChild(canvas);
  const c = canvas.getContext('2d');
  if (!c) return canvas.remove();
  c.scale(dpr, dpr);
  const parts = Array.from({ length: amount }, () => ({
    x: innerWidth / 2 + (Math.random() - 0.5) * innerWidth * 0.3,
    y: innerHeight * 0.35,
    vx: (Math.random() - 0.5) * 14,
    vy: -Math.random() * 14 - 4,
    r: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.3,
    w: 6 + Math.random() * 6,
    h: 8 + Math.random() * 8,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }));
  const start = performance.now();
  const frame = (t: number) => {
    const elapsed = t - start;
    c.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of parts) {
      p.vy += 0.35;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      c.save();
      c.globalAlpha = Math.max(0, 1 - elapsed / 2600);
      c.translate(p.x, p.y);
      c.rotate(p.r);
      c.fillStyle = p.color;
      c.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      c.restore();
    }
    if (elapsed < 2600) requestAnimationFrame(frame);
    else canvas.remove();
  };
  requestAnimationFrame(frame);
}
