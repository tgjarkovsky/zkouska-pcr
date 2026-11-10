// Šifrování obsahu heslem (AES-GCM, klíč z hesla přes PBKDF2-SHA-256).
// Sdílené mezi prohlížečem (aplikace) a Node skripty (WebCrypto je v obou).

const ITERATIONS = 250000;
const te = new TextEncoder();
const td = new TextDecoder();

function toB64(bytes) {
  let s = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    s += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(s);
}

function fromB64(str) {
  const bin = atob(str);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function deriveKey(password, salt, iterations) {
  const base = await crypto.subtle.importKey('raw', te.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptJson(value, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt, ITERATIONS);
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, te.encode(JSON.stringify(value)));
  return { v: 1, iter: ITERATIONS, salt: toB64(salt), iv: toB64(iv), data: toB64(new Uint8Array(ct)) };
}

/** Vyhodí chybu při špatném hesle. */
export async function decryptJson(payload, password) {
  if (!payload || payload.v !== 1) throw new Error('Neznámý formát obsahu');
  const key = await deriveKey(password, fromB64(payload.salt), payload.iter);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(payload.iv) }, key, fromB64(payload.data));
  return JSON.parse(td.decode(pt));
}
