import { useSyncExternalStore } from 'react';
import type { CvdType } from '../tokens/color';
import { DEFAULT_THEME, makeTheme } from '../tokens/presets';
import { TOKEN_MAP } from '../tokens/registry';
import { valuesEqual } from '../tokens/resolve';
import type { AppId, Appearance, Contrast, Density, Platform, ThemeDoc, TokenValue } from '../tokens/types';

/**
 * Central lab store: the working theme (with undo/redo), saved configurations,
 * and view settings. Persisted to localStorage so work survives refreshes.
 */

export interface ViewState {
  appearance: Appearance;
  contrast: Contrast;
  reducedMotion: boolean;
  textScale: number;
  cvd: CvdType;
  inspect: boolean;
}

export interface LabState {
  theme: ThemeDoc;
  past: ThemeDoc[];
  future: ThemeDoc[];
  saved: ThemeDoc[];
  view: ViewState;
  /** Token currently focused in the Theme Editor (set by "Edit token" links and the inspector). */
  focusToken: string | null;
}

const KEY = 'mercantile-design-lab:v1';
const HISTORY_LIMIT = 200;

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

/** Explicit theme set by a host page (e.g. claude.ai sets data-theme on the root element). */
export function hostAppearance(): Appearance | null {
  if (typeof document === 'undefined') return null;
  const t = document.documentElement.getAttribute('data-theme');
  return t === 'dark' || t === 'light' ? t : null;
}
const systemAppearance = (): Appearance =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

function load(): LabState {
  const base: LabState = {
    theme: clone(DEFAULT_THEME),
    past: [],
    future: [],
    saved: [],
    view: {
      appearance: hostAppearance() ?? systemAppearance(),
      contrast: 'standard',
      reducedMotion: false,
      textScale: 1,
      cvd: 'none',
      inspect: false,
    },
    focusToken: null,
  };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return base;
    const p = JSON.parse(raw);
    return {
      ...base,
      theme: p.theme ? normalizeTheme(p.theme) : base.theme,
      saved: Array.isArray(p.saved) ? p.saved.map(normalizeTheme) : [],
      view: { ...base.view, ...(p.view ?? {}), appearance: base.view.appearance, inspect: false },
    };
  } catch {
    return base;
  }
}

/** Accepts any theme-shaped object and returns a safe ThemeDoc. */
export function normalizeTheme(x: any): ThemeDoc {
  const cleanMap = (m: any): Record<string, TokenValue> => {
    const out: Record<string, TokenValue> = {};
    if (m && typeof m === 'object') {
      for (const [k, val] of Object.entries(m)) {
        if (!TOKEN_MAP.has(k)) continue;
        if (typeof val === 'string') out[k] = val;
        else if (val && typeof val === 'object' && typeof (val as any).light === 'string' && typeof (val as any).dark === 'string')
          out[k] = val as TokenValue;
      }
    }
    return out;
  };
  const values = cleanMap(x?.values);
  // Drop overrides identical to defaults so "modified" indicators stay honest.
  for (const k of Object.keys(values)) if (valuesEqual(values[k], TOKEN_MAP.get(k)!.value)) delete values[k];
  const platforms: ThemeDoc['platforms'] = {};
  for (const pf of ['macos', 'ios', 'ipados'] as Platform[]) if (x?.platforms?.[pf]) platforms[pf] = cleanMap(x.platforms[pf]);
  const apps: ThemeDoc['apps'] = {};
  for (const a of ['inventory', 'email', 'scheduling', 'finance', 'admin', 'analytics'] as AppId[])
    if (x?.apps?.[a]) apps[a] = cleanMap(x.apps[a]);
  return makeTheme({
    id: typeof x?.id === 'string' ? x.id : `theme-${Date.now()}`,
    name: typeof x?.name === 'string' ? x.name : 'Imported theme',
    description: typeof x?.description === 'string' ? x.description : '',
    updatedAt: typeof x?.updatedAt === 'number' ? x.updatedAt : Date.now(),
    density: ['compact', 'regular', 'comfortable'].includes(x?.density) ? x.density : 'regular',
    values,
    platforms,
    apps,
  });
}

let state: LabState = load();
const listeners = new Set<() => void>();
let saveTimer: number | undefined;

function emit() {
  listeners.forEach((l) => l());
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ theme: state.theme, saved: state.saved, view: state.view }));
    } catch {
      /* storage unavailable — keep working in memory */
    }
  }, 200);
}

function set(patch: Partial<LabState>) {
  state = { ...state, ...patch };
  emit();
}

let lastKey = '';
let lastTime = 0;

/** Commit a theme change to history. Rapid edits with the same key coalesce into one undo step. */
function commit(next: ThemeDoc, key = '') {
  const now = Date.now();
  const coalesce = key !== '' && key === lastKey && now - lastTime < 900 && state.past.length > 0;
  lastKey = key;
  lastTime = now;
  next.updatedAt = now;
  set({
    theme: next,
    past: coalesce ? state.past : [...state.past, state.theme].slice(-HISTORY_LIMIT),
    future: [],
  });
}

export const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
export const getState = () => state;

/** Subscribe to a slice of lab state. Selectors must return stable references. */
export function useLab<T>(selector: (s: LabState) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state));
}
export const useTheme = () => useLab((s) => s.theme);
export const useView = () => useLab((s) => s.view);

export const actions = {
  /** Set (or with `undefined`, reset) a token value in the working theme. */
  setToken(id: string, value: TokenValue | undefined) {
    const def = TOKEN_MAP.get(id);
    if (!def) return;
    const values = { ...state.theme.values };
    if (value === undefined || valuesEqual(value, def.value)) delete values[id];
    else values[id] = value;
    if (valuesEqual(values[id], state.theme.values[id])) return;
    commit({ ...state.theme, values }, `token:${id}`);
  },
  setTokens(patch: Record<string, TokenValue | undefined>, key = '') {
    const values = { ...state.theme.values };
    for (const [id, value] of Object.entries(patch)) {
      const def = TOKEN_MAP.get(id);
      if (!def) continue;
      if (value === undefined || valuesEqual(value, def.value)) delete values[id];
      else values[id] = value;
    }
    commit({ ...state.theme, values }, key);
  },
  resetToken(id: string) {
    actions.setToken(id, undefined);
  },
  setPlatformToken(platform: Platform, id: string, value: TokenValue | undefined) {
    const cur = { ...(state.theme.platforms[platform] ?? {}) };
    if (value === undefined) delete cur[id];
    else cur[id] = value;
    commit({ ...state.theme, platforms: { ...state.theme.platforms, [platform]: cur } }, `platform:${platform}:${id}`);
  },
  setAppToken(app: AppId, id: string, value: TokenValue | undefined) {
    const cur = { ...(state.theme.apps[app] ?? {}) };
    if (value === undefined) delete cur[id];
    else cur[id] = value;
    commit({ ...state.theme, apps: { ...state.theme.apps, [app]: cur } }, `app:${app}:${id}`);
  },
  setDensity(density: Density) {
    if (density !== state.theme.density) commit({ ...state.theme, density }, 'density');
  },
  renameTheme(name: string) {
    commit({ ...state.theme, name }, 'rename');
  },
  /** Replace the working theme (preset, saved configuration, or import). Undoable. */
  applyTheme(theme: ThemeDoc) {
    commit(clone(theme));
  },
  resetAll() {
    commit(clone(DEFAULT_THEME));
  },
  undo() {
    if (!state.past.length) return;
    const prev = state.past[state.past.length - 1];
    lastKey = '';
    set({ theme: prev, past: state.past.slice(0, -1), future: [state.theme, ...state.future] });
  },
  redo() {
    if (!state.future.length) return;
    const next = state.future[0];
    lastKey = '';
    set({ theme: next, past: [...state.past, state.theme], future: state.future.slice(1) });
  },
  /** Save the working theme as a named configuration. */
  saveSnapshot(name: string) {
    const snap = clone(state.theme);
    snap.id = `saved-${Date.now()}`;
    snap.name = name;
    snap.updatedAt = Date.now();
    set({ saved: [snap, ...state.saved] });
    return snap;
  },
  deleteSnapshot(id: string) {
    set({ saved: state.saved.filter((s) => s.id !== id) });
  },
  importTheme(json: unknown, opts: { apply?: boolean } = { apply: true }) {
    // Accept either a saved configuration or a full token export (which embeds its overrides under "mercantile").
    const src = json && typeof json === 'object' && 'mercantile' in (json as object) ? (json as { mercantile: unknown }).mercantile : json;
    const theme = normalizeTheme(src);
    if (opts.apply) commit(theme);
    return theme;
  },
  setView(patch: Partial<ViewState>) {
    set({ view: { ...state.view, ...patch } });
  },
  toggleAppearance() {
    actions.setView({ appearance: state.view.appearance === 'dark' ? 'light' : 'dark' });
  },
  focusToken(id: string | null) {
    set({ focusToken: id });
  },
};

/** Follow the host's or system's light/dark setting when it changes. */
if (typeof window !== 'undefined') {
  window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener?.('change', () => {
    if (!hostAppearance()) actions.setView({ appearance: systemAppearance() });
  });
  new MutationObserver(() => {
    const h = hostAppearance();
    if (h && h !== state.view.appearance) actions.setView({ appearance: h });
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
}

export const canUndo = (s: LabState) => s.past.length > 0;
export const canRedo = (s: LabState) => s.future.length > 0;
