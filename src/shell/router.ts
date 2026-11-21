import { useSyncExternalStore } from 'react';

/** Minimal hash router: "#/apps/inventory" → ["apps", "inventory"]. */
const read = () => window.location.hash.replace(/^#\/?/, '');
const subscribe = (cb: () => void) => {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
};

export function useRoute(): string[] {
  const hash = useSyncExternalStore(subscribe, read);
  return hash.split('/').filter(Boolean);
}

export function navigate(path: string) {
  window.location.hash = path.startsWith('/') ? path : `/${path}`;
}

export const href = (path: string) => `#${path.startsWith('/') ? path : `/${path}`}`;
