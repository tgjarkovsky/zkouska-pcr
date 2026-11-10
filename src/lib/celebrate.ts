import { useSyncExternalStore } from 'react';

export interface Celebration {
  id: number;
  kind: 'rank' | 'badge';
  title: string;
  icon: string;
  desc?: string;
}

let queue: Celebration[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function celebrate(c: Omit<Celebration, 'id'>) {
  queue = [...queue, { ...c, id: nextId++ }];
  emit();
}
export function dismissCelebration() {
  queue = queue.slice(1);
  emit();
}
export function useCelebrations() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
    () => queue,
  );
}
