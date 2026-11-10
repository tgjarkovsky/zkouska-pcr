export interface EncPayload {
  v: 1;
  iter: number;
  salt: string;
  iv: string;
  data: string;
}
export function encryptJson(value: unknown, password: string): Promise<EncPayload>;
export function decryptJson<T = unknown>(payload: EncPayload, password: string): Promise<T>;
