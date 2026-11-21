import { APPS, PLATFORM_DEFAULTS, TOKENS, TOKEN_MAP } from './registry';
import type { Density, ModalValue, ResolveOptions, ThemeDoc, TokenValue } from './types';
import { isModal } from './types';

export const DENSITY_FACTOR: Record<Density, number> = { compact: 0.86, regular: 1, comfortable: 1.14 };

/** "color.text.primary" → "--color-text-primary" */
export const cssVarName = (id: string) => `--${id.replace(/\./g, '-')}`;
/** "color.text.primary" → "var(--color-text-primary)". Use in inline styles and chart props. */
export const v = (id: string) => `var(${cssVarName(id)})`;

const REF = /\{([^}]+)\}/g;

/** All token ids referenced directly by a value. */
export function refsOf(value: TokenValue): string[] {
  const out = new Set<string>();
  const scan = (s: string) => {
    for (const m of s.matchAll(REF)) out.add(m[1]);
  };
  if (isModal(value)) Object.values(value).forEach((s) => s && scan(s));
  else scan(value);
  return [...out];
}

export const isPureRef = (s: string) => /^\{[^}]+\}$/.test(s.trim());

/**
 * The stored (unresolved) value for a token given the theme and scope.
 * Precedence: app override → platform override → theme value → registry default.
 */
export function rawValue(theme: ThemeDoc, id: string, opts?: Pick<ResolveOptions, 'platform' | 'app'>): TokenValue | undefined {
  if (opts?.app) {
    const a = theme.apps[opts.app]?.[id] ?? APPS[opts.app]?.overrides[id];
    if (a !== undefined) return a;
  }
  if (opts?.platform && opts.platform !== 'web') {
    const pv = theme.platforms[opts.platform]?.[id] ?? PLATFORM_DEFAULTS[opts.platform]?.[id];
    if (pv !== undefined) return pv;
  }
  return theme.values[id] ?? TOKEN_MAP.get(id)?.value;
}

export function pickMode(value: TokenValue, opts: Pick<ResolveOptions, 'appearance' | 'contrast'>): string {
  if (!isModal(value)) return value;
  if (opts.contrast === 'high') {
    return opts.appearance === 'dark' ? (value.hcDark ?? value.dark) : (value.hcLight ?? value.light);
  }
  return opts.appearance === 'dark' ? value.dark : value.light;
}

const scalePx = (s: string, f: number) => {
  if (f === 1) return s;
  const m = /^(-?\d*\.?\d+)px$/.exec(s.trim());
  if (!m) return s;
  return `${Math.round(parseFloat(m[1]) * f * 2) / 2}px`;
};

export function resolveToken(theme: ThemeDoc, id: string, opts: ResolveOptions, depth = 0): string {
  const raw = rawValue(theme, id, opts);
  if (raw === undefined) return '';
  if (depth > 16) return '';
  let out = pickMode(raw, opts).replace(REF, (_, ref: string) => resolveToken(theme, ref, opts, depth + 1));
  const def = TOKEN_MAP.get(id);
  if (def?.scale === 'density') out = scalePx(out, DENSITY_FACTOR[opts.density ?? theme.density]);
  else if (def?.scale === 'text') out = scalePx(out, opts.textScale ?? 1);
  if (opts.reducedMotion && def?.type === 'duration' && id !== 'motion.duration.spin') out = '0ms';
  return out;
}

/** Resolve every token to a concrete value for the given scope. */
export function resolveAll(theme: ThemeDoc, opts: ResolveOptions): Record<string, string> {
  const out: Record<string, string> = {};
  for (const d of TOKENS) out[d.id] = resolveToken(theme, d.id, opts);
  return out;
}

/** Resolved tokens as a CSS custom-property map. */
export function cssVars(theme: ThemeDoc, opts: ResolveOptions): Record<string, string> {
  const out: Record<string, string> = {};
  for (const d of TOKENS) out[cssVarName(d.id)] = resolveToken(theme, d.id, opts);
  return out;
}

/** Chain of references from a token down to its literal, for the given scope. */
export function refChain(theme: ThemeDoc, id: string, opts: ResolveOptions): string[] {
  const chain: string[] = [id];
  let cur = id;
  for (let i = 0; i < 16; i++) {
    const raw = rawValue(theme, cur, opts);
    if (raw === undefined) break;
    const s = pickMode(raw, opts).trim();
    if (!isPureRef(s)) break;
    cur = s.slice(1, -1);
    chain.push(cur);
  }
  return chain;
}

/** Tokens whose stored value references `id` directly (reverse dependency). */
export function dependentsOf(theme: ThemeDoc, id: string): string[] {
  const out: string[] = [];
  for (const d of TOKENS) {
    const raw = theme.values[d.id] ?? d.value;
    if (refsOf(raw).includes(id)) out.push(d.id);
  }
  return out;
}

/** All tokens that depend on `id` transitively. */
export function allDependentsOf(theme: ThemeDoc, id: string): string[] {
  const seen = new Set<string>();
  const walk = (x: string) => {
    for (const dep of dependentsOf(theme, x)) {
      if (!seen.has(dep)) {
        seen.add(dep);
        walk(dep);
      }
    }
  };
  walk(id);
  return [...seen];
}

export const isOverridden = (theme: ThemeDoc, id: string) => theme.values[id] !== undefined;

export const valuesEqual = (a: TokenValue | undefined, b: TokenValue | undefined) => JSON.stringify(a) === JSON.stringify(b);

export const asModal = (value: TokenValue): ModalValue => (isModal(value) ? value : { light: value, dark: value });

/** Fully merged token values (defaults + overrides) — what exports emit. */
export function mergedValues(theme: ThemeDoc): Record<string, TokenValue> {
  const out: Record<string, TokenValue> = {};
  for (const d of TOKENS) out[d.id] = theme.values[d.id] ?? d.value;
  return out;
}

/** Resolve an arbitrary value string (which may contain references) in the given scope. */
export function resolveString(theme: ThemeDoc, value: string, opts: ResolveOptions): string {
  return value.replace(REF, (_, ref: string) => resolveToken(theme, ref, opts));
}
