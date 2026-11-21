import { MODE_IDS, MODES, TOKEN_MAP } from '../tokens/registry';
import type { ThemeDoc } from '../tokens/types';

/** Flat view of every override in the theme: "token.id" for shared values, "lindemann:token.id" for mode values. */
export function snapshotValues(theme: ThemeDoc): Record<string, unknown> {
  const out: Record<string, unknown> = { ...theme.values };
  for (const m of MODE_IDS) for (const [k, v] of Object.entries(theme.modes[m]?.values ?? {})) out[`${m}:${k}`] = v;
  return out;
}

export interface PendingChange {
  key: string;
  id: string;
  where: string;
  from: unknown;
  to: unknown;
}

/** Lab edits made since the last adoption (or since the defaults, if nothing has been adopted). */
export function pendingChanges(theme: ThemeDoc, baseline: Record<string, unknown> | null, defaults: Record<string, unknown>): PendingChange[] {
  const now = snapshotValues(theme);
  const base = baseline ?? defaults;
  const keys = new Set([...Object.keys(now), ...Object.keys(base)]);
  const out: PendingChange[] = [];
  for (const key of keys) {
    if (JSON.stringify(now[key]) === JSON.stringify(base[key])) continue;
    const [m, id] = key.includes(':') ? key.split(':') : [null, key];
    if (!TOKEN_MAP.has(id)) continue;
    out.push({ key, id, where: m ? `${MODES[m as keyof typeof MODES].label} only` : 'Both modes', from: base[key] ?? TOKEN_MAP.get(id)!.value, to: now[key] ?? TOKEN_MAP.get(id)!.value });
  }
  return out.sort((a, b) => a.id.localeCompare(b.id));
}

export const fmtValue = (v: unknown) => (typeof v === 'string' ? v : v && typeof v === 'object' ? Object.entries(v as Record<string, string>).map(([k, x]) => `${k} ${x}`).join(' · ') : String(v));
