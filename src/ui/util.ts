import { useEffect, useRef } from 'react';

export type ClassValue = string | number | bigint | boolean | null | undefined;
export const cx = (...parts: ClassValue[]) => parts.filter((p): p is string => typeof p === 'string' && p !== '').join(' ');

/** Force a visual state without real interaction — used by the gallery to display every state. */
export type ForcedState = 'hover' | 'pressed' | 'focus' | 'selected' | 'disabled' | 'loading' | 'success' | 'error';
export const stateClass = (s?: ForcedState) => (s ? `is-${s}` : undefined);

export function useClickOutside<T extends HTMLElement>(open: boolean, onClose: () => void) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', down);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('mousedown', down);
      document.removeEventListener('keydown', key);
    };
  }, [open, onClose]);
  return ref;
}
