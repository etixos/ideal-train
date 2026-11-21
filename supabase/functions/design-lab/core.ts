/**
 * Mercantile Design Lab: shared logic for AI tools (MCP).
 * Pure functions over the stored lab state. No Deno or network APIs here, so it can be tested anywhere.
 *
 * Vocabulary (fixed):
 *   Adopt   = make it the Mercantile rule (updates the lab, records a decision). Only with the owner's explicit yes.
 *   Apply   = bring one app up to the current rules. Done in that app's repository, never here.
 *   Publish = release an app's own work. Never a design decision.
 */

export type TokenValue = string | { light: string; dark: string; hcLight?: string; hcDark?: string };
export type Scope = 'both' | 'lindemann' | 'diamond';

export interface CatalogToken {
  id: string;
  layer: string;
  group: string;
  type: string;
  description?: string;
  default: TokenValue;
  resolved: Record<string, { light: string; dark: string }>;
}

export interface Catalog {
  tokens: CatalogToken[];
  defaultsSnapshot: Record<string, unknown>;
  modes: Record<string, string>;
  apps: unknown[];
  generatedAt: string;
}

export interface Decision {
  id: string;
  title: string;
  summary: string;
  status: string;
  scope: string[];
  source: string;
  date?: string;
  tokens?: string[];
  options?: { id: string; label: string; detail: string; apply?: Record<string, string | { light?: string; dark?: string }>; recommended?: boolean }[];
  chosen?: string;
  adoptedBy?: string;
  note?: string;
  changes?: { id: string; from: unknown; to: unknown }[];
  revision?: number;
}

export interface LabState {
  theme: { name: string; values: Record<string, TokenValue>; modes: Record<string, { values: Record<string, TokenValue> }>; [k: string]: unknown };
  register: { decisions: Decision[]; baseline: Record<string, unknown> | null };
  catalog: Catalog | null;
  version: number;
}

export interface ToolOutcome {
  text: string;
  next?: LabState;
  event?: { kind: string; summary: string; payload?: unknown };
  isError?: boolean;
}

const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x));
const today = (now: Date) => now.toISOString().slice(0, 10);
const MODE_IDS = ['lindemann', 'diamond'];

/* ───────── State helpers ───────── */

export function snapshot(theme: LabState['theme']): Record<string, unknown> {
  const out: Record<string, unknown> = { ...theme.values };
  for (const m of MODE_IDS) for (const [k, v] of Object.entries(theme.modes?.[m]?.values ?? {})) out[`${m}:${k}`] = v;
  return out;
}

export function pending(state: LabState) {
  const now = snapshot(state.theme);
  const base = state.register.baseline ?? state.catalog?.defaultsSnapshot ?? {};
  const keys = new Set([...Object.keys(now), ...Object.keys(base)]);
  const out: { key: string; token: string; scope: string; from: unknown; to: unknown }[] = [];
  for (const key of keys) {
    if (JSON.stringify(now[key]) === JSON.stringify(base[key])) continue;
    const [m, id] = key.includes(':') ? key.split(':') : [null, key];
    out.push({ key, token: id, scope: m ?? 'both', from: base[key] ?? 'default', to: now[key] ?? 'default' });
  }
  return out.sort((a, b) => a.key.localeCompare(b.key));
}

const tokenMap = (state: LabState) => new Map((state.catalog?.tokens ?? []).map((t) => [t.id, t]));

function validValue(state: LabState, tokenId: string, v: string): string | null {
  const t = tokenMap(state).get(tokenId)!;
  const s = v.trim();
  const ref = /^\{([^}]+)\}$/.exec(s);
  if (ref) return tokenMap(state).has(ref[1]) ? null : `Unknown token reference ${s}.`;
  if (t.type === 'color' && !/^#([0-9a-f]{6}|[0-9a-f]{8})$/i.test(s) && !/^rgba?\(/i.test(s)) return `“${s}” is not a color. Use #RRGGBB, rgba(…), or a token reference like {palette.stone.canvas}.`;
  if (!s) return 'Value is empty.';
  return null;
}

function writeValue(state: LabState, tokenId: string, scope: Scope, value: string | null, side?: 'light' | 'dark'): LabState {
  const next = clone(state);
  const t = tokenMap(state).get(tokenId)!;
  const bag = scope === 'both' ? next.theme.values : (next.theme.modes[scope] ??= { values: {} }).values;
  if (value === null) {
    delete bag[tokenId];
    return next;
  }
  if (!side) bag[tokenId] = value;
  else {
    const cur = bag[tokenId] ?? (scope === 'both' ? undefined : next.theme.values[tokenId]) ?? t.default;
    const base = typeof cur === 'object' ? cur : { light: cur, dark: cur };
    bag[tokenId] = { ...base, [side]: value };
  }
  return next;
}

function addDecision(next: LabState, d: Omit<Decision, 'id'>, prefix = 'L'): Decision {
  const n = next.register.decisions.filter((x) => x.id.startsWith(prefix + '-')).length + 1;
  const rec = { ...d, id: `${prefix}-${String(n).padStart(3, '0')}` } as Decision;
  next.register.decisions = [rec, ...next.register.decisions];
  return rec;
}

const brief = (d: Decision) => ({ id: d.id, title: d.title, status: d.status, scope: d.scope, date: d.date, summary: d.summary, ...(d.options ? { options: d.options.map((o) => ({ id: o.id, label: o.label, detail: o.detail, recommended: !!o.recommended })) } : {}), ...(d.chosen ? { chosen: d.chosen } : {}), ...(d.note ? { note: d.note } : {}), source: d.source });

/* ───────── Tool definitions ───────── */

const NOT_WITHOUT_OWNER =
  'Only call this after the owner has explicitly said yes to adopting, in this conversation (for example you asked “Do you want to adopt these changes?” and they said yes). Set owner_confirmed to true only then. Adopting makes it the Mercantile rule for every app.';

export const TOOLS = [
  {
    name: 'get_overview',
    description:
      'Start here. Summarizes the Mercantile design system: decisions waiting on the owner, counts by status, changes made in the lab that are not adopted yet, the two brand modes, and the fixed vocabulary (Adopt / Apply / Publish). Read-only.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'list_decisions',
    description: 'Lists design decisions with plain statuses: needs-decision, approved, testing, idea, retired. Approved is the rule within its scope; testing is provisional but shared; ideas must not be implemented; retired must not be restored. Read-only.',
    inputSchema: { type: 'object', properties: { status: { type: 'string', enum: ['needs-decision', 'approved', 'testing', 'idea', 'retired'] }, query: { type: 'string', description: 'Optional words to match in titles and summaries.' } }, additionalProperties: false },
  },
  {
    name: 'search_tokens',
    description: 'Finds design tokens by name, role or description (e.g. "sidebar background", "heading font", "error"). Returns each token’s id, purpose, and resolved light/dark values for both modes. Use semantic or component tokens in apps, never foundation palette values. Read-only.',
    inputSchema: { type: 'object', properties: { query: { type: 'string' }, layer: { type: 'string', enum: ['foundation', 'semantic', 'component'] }, limit: { type: 'number' } }, required: ['query'], additionalProperties: false },
  },
  {
    name: 'get_token',
    description: 'Full detail for one token: purpose, default, current shared and per-mode values, and resolved colors. Read-only.',
    inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'], additionalProperties: false },
  },
  {
    name: 'propose_change',
    description:
      'Changes a token in the lab as an experiment. It appears immediately in the lab and is listed under “Changes not adopted yet”; it is NOT a Mercantile rule until the owner adopts it. scope: "both" (shared by Lindemann and Diamond Stop), "lindemann" or "diamond" (that mode only). For colors you may set only the light or dark side. Explain the reason in plain words.',
    inputSchema: {
      type: 'object',
      properties: {
        token: { type: 'string', description: 'Token id, e.g. color.surface.sidebar' },
        value: { type: 'string', description: 'New value: #RRGGBB, a size like 14px, or a reference like {palette.stone.panel}.' },
        side: { type: 'string', enum: ['light', 'dark'], description: 'Optional: change only the light or dark value of a color.' },
        scope: { type: 'string', enum: ['both', 'lindemann', 'diamond'], default: 'both' },
        reason: { type: 'string' },
      },
      required: ['token', 'value', 'reason'],
      additionalProperties: false,
    },
  },
  {
    name: 'revert_change',
    description: 'Undoes a change that is not adopted yet: the token returns to its last adopted value. scope as in propose_change.',
    inputSchema: { type: 'object', properties: { token: { type: 'string' }, scope: { type: 'string', enum: ['both', 'lindemann', 'diamond'], default: 'both' } }, required: ['token'], additionalProperties: false },
  },
  {
    name: 'adopt_changes',
    description: 'Adopts every change that is not adopted yet, as one recorded decision with a name and reason. ' + NOT_WITHOUT_OWNER,
    inputSchema: { type: 'object', properties: { title: { type: 'string' }, why: { type: 'string' }, owner_confirmed: { type: 'boolean' } }, required: ['title', 'owner_confirmed'], additionalProperties: false },
  },
  {
    name: 'adopt_option',
    description: 'Settles a decision that needs the owner by adopting one of its options (applies the option’s values in the lab and marks the decision Approved). ' + NOT_WITHOUT_OWNER,
    inputSchema: { type: 'object', properties: { decision_id: { type: 'string' }, option_id: { type: 'string' }, owner_confirmed: { type: 'boolean' } }, required: ['decision_id', 'option_id', 'owner_confirmed'], additionalProperties: false },
  },
  {
    name: 'record_decision',
    description:
      'Adds an entry to the decision list without approving it: an idea, something being tested in an app, or a question that needs the owner. Use this when work in an app produces a design choice worth tracking. To approve something, ask the owner and use adopt_changes or adopt_option.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        summary: { type: 'string', description: 'Plain English: what and why.' },
        status: { type: 'string', enum: ['idea', 'testing', 'needs-decision'] },
        scope: { type: 'array', items: { type: 'string' }, description: 'e.g. ["Family"], ["Lindemann"], ["Shifts", "iPhone"]' },
        source: { type: 'string', description: 'Where it came from: app, file, commit, conversation.' },
      },
      required: ['title', 'summary', 'status', 'scope', 'source'],
      additionalProperties: false,
    },
  },
] as const;

/* ───────── Tool implementations ───────── */

export function callTool(name: string, args: Record<string, unknown>, state: LabState, now = new Date()): ToolOutcome {
  if (!state.catalog) return { text: 'The lab has not uploaded its token catalog yet. Open the lab once while connected to the cloud.', isError: true };
  const decisions = state.register.decisions;
  const tmap = tokenMap(state);

  switch (name) {
    case 'get_overview': {
      const counts: Record<string, number> = {};
      for (const d of decisions) counts[d.status] = (counts[d.status] ?? 0) + 1;
      const p = pending(state);
      return {
        text: JSON.stringify(
          {
            theme: state.theme.name,
            vocabulary: {
              adopt: 'Make it the Mercantile rule. Updates the lab and records the decision. Ask the owner first: “Do you want to adopt these changes?”',
              apply: 'Bring one app up to the current Mercantile rules. Done in that app, never changes shared rules.',
              publish: 'Release an app’s own work. Never a design decision.',
            },
            modes: state.catalog.modes,
            counts,
            waiting_on_owner: decisions.filter((d) => d.status === 'needs-decision').map(brief),
            not_adopted_changes: p.length,
            not_adopted_preview: p.slice(0, 15),
            apps: state.catalog.apps,
            lab_version: state.version,
          },
          null,
          2,
        ),
      };
    }

    case 'list_decisions': {
      const q = String(args.query ?? '').toLowerCase();
      const list = decisions.filter((d) => (!args.status || d.status === args.status) && (!q || `${d.title} ${d.summary}`.toLowerCase().includes(q)));
      return { text: JSON.stringify(list.map(brief), null, 2) };
    }

    case 'search_tokens': {
      const words = String(args.query ?? '').toLowerCase().split(/\s+/).filter(Boolean);
      const limit = Math.min(Number(args.limit ?? 25), 80);
      const scored = state.catalog.tokens
        .filter((t) => !args.layer || t.layer === args.layer)
        .map((t) => {
          const hay = `${t.id} ${t.group} ${t.description ?? ''}`.toLowerCase();
          const score = words.reduce((s, w) => s + (hay.includes(w) ? (t.id.toLowerCase().includes(w) ? 2 : 1) : 0), 0);
          return { t, score };
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score || (a.t.layer === 'foundation' ? 1 : 0) - (b.t.layer === 'foundation' ? 1 : 0))
        .slice(0, limit)
        .map(({ t }) => ({ id: t.id, layer: t.layer, purpose: t.description, type: t.type, resolved: t.resolved }));
      return { text: scored.length ? JSON.stringify(scored, null, 2) : `No tokens match “${args.query}”.` };
    }

    case 'get_token': {
      const t = tmap.get(String(args.id));
      if (!t) return { text: `Unknown token “${args.id}”. Use search_tokens to find it.`, isError: true };
      const modes = Object.fromEntries(MODE_IDS.map((m) => [m, state.theme.modes?.[m]?.values?.[t.id] ?? null]));
      return { text: JSON.stringify({ ...t, shared_override: state.theme.values[t.id] ?? null, mode_overrides: modes }, null, 2) };
    }

    case 'propose_change': {
      const id = String(args.token);
      if (!tmap.has(id)) return { text: `Unknown token “${id}”. Use search_tokens to find the right one.`, isError: true };
      const scope = (args.scope as Scope) ?? 'both';
      const side = args.side as 'light' | 'dark' | undefined;
      const value = String(args.value);
      const problem = validValue(state, id, value);
      if (problem) return { text: problem, isError: true };
      const next = writeValue(state, id, scope, value.trim(), side);
      const where = scope === 'both' ? 'both modes' : `${state.catalog.modes[scope] ?? scope} only`;
      return {
        text: `Changed ${id}${side ? ` (${side})` : ''} to ${value} for ${where}. It is visible in the lab now and listed under “Changes not adopted yet”. It is not a Mercantile rule until the owner adopts it.`,
        next,
        event: { kind: 'propose', summary: `${id}${side ? ` (${side})` : ''} → ${value} (${where})`, payload: { id, value, side, scope, reason: args.reason } },
      };
    }

    case 'revert_change': {
      const id = String(args.token);
      if (!tmap.has(id)) return { text: `Unknown token “${id}”.`, isError: true };
      const scope = (args.scope as Scope) ?? 'both';
      // Return to the last adopted value (or the built-in one if nothing was adopted), not to "nothing".
      const base = state.register.baseline ?? state.catalog.defaultsSnapshot;
      const adopted = base[scope === 'both' ? id : `${scope}:${id}`] as TokenValue | undefined;
      let next = writeValue(state, id, scope, null);
      if (adopted !== undefined) {
        const bag = scope === 'both' ? next.theme.values : (next.theme.modes[scope] ??= { values: {} }).values;
        bag[id] = clone(adopted);
      }
      return { text: `Reverted ${id} (${scope === 'both' ? 'both modes' : scope}) to its last adopted value.`, next, event: { kind: 'revert', summary: `${id} reverted (${scope})` } };
    }

    case 'adopt_changes': {
      if (args.owner_confirmed !== true) return { text: 'Not adopted. Ask the owner “Do you want to adopt these changes?” and call again with owner_confirmed: true only if they say yes.', isError: true };
      const p = pending(state);
      if (!p.length) return { text: 'There are no changes waiting to be adopted.' };
      const next = clone(state);
      const rec = addDecision(next, {
        title: String(args.title),
        summary: String(args.why ?? `${p.length} token changes adopted.`),
        status: 'approved',
        scope: [...new Set(p.map((x) => (x.scope === 'both' ? 'Family' : state.catalog!.modes[x.scope] ?? x.scope)))],
        source: 'Mercantile Design Lab (via AI, owner confirmed)',
        date: today(now),
        adoptedBy: 'Owner (confirmed to AI)',
        tokens: [...new Set(p.map((x) => x.token))],
        changes: p.map((x) => ({ id: x.key, from: x.from, to: x.to })),
      });
      next.register.baseline = snapshot(next.theme);
      return { text: `Adopted ${p.length} changes as ${rec.id} “${rec.title}”. Recorded as Approved, dated ${rec.date}. Apps change only when Mercantile is applied to them.`, next, event: { kind: 'adopt', summary: `${rec.id} ${rec.title}`, payload: { changes: p.length } } };
    }

    case 'adopt_option': {
      if (args.owner_confirmed !== true) return { text: 'Not adopted. Ask the owner which option to adopt, and call again with owner_confirmed: true only after they say yes.', isError: true };
      const d = decisions.find((x) => x.id === args.decision_id);
      if (!d) return { text: `No decision ${args.decision_id}.`, isError: true };
      const opt = d.options?.find((o) => o.id === args.option_id);
      if (!opt) return { text: `${d.id} has no option “${args.option_id}”. Options: ${(d.options ?? []).map((o) => o.id).join(', ') || 'none'}.`, isError: true };
      let next = clone(state);
      for (const [id, patch] of Object.entries(opt.apply ?? {})) {
        if (!tmap.has(id)) continue;
        if (typeof patch === 'string') next = writeValue(next, id, 'both', patch);
        else for (const side of ['light', 'dark'] as const) if (patch[side]) next = writeValue(next, id, 'both', patch[side]!, side);
      }
      // Applied values count as adopted; other pending experiments stay pending.
      const base = { ...(next.register.baseline ?? state.catalog.defaultsSnapshot) };
      const snap = snapshot(next.theme);
      for (const id of Object.keys(opt.apply ?? {})) {
        if (snap[id] === undefined) delete base[id];
        else base[id] = snap[id];
      }
      next.register.baseline = base;
      next.register.decisions = next.register.decisions.map((x) => (x.id === d.id ? { ...x, status: 'approved', chosen: opt.id, date: today(now), adoptedBy: 'Owner (confirmed to AI)' } : x));
      return { text: `Adopted “${opt.label}” for ${d.id} ${d.title}.${opt.apply ? ' The lab has been updated.' : ''}`, next, event: { kind: 'adopt', summary: `${d.id} → ${opt.label}` } };
    }

    case 'record_decision': {
      const status = String(args.status);
      if (!['idea', 'testing', 'needs-decision'].includes(status)) return { text: 'status must be idea, testing or needs-decision. Approving requires the owner (adopt_changes / adopt_option).', isError: true };
      const next = clone(state);
      const rec = addDecision(next, { title: String(args.title), summary: String(args.summary), status, scope: (args.scope as string[]) ?? ['Family'], source: String(args.source) }, 'N');
      return { text: `Recorded ${rec.id} “${rec.title}” as ${status}.`, next, event: { kind: 'record', summary: `${rec.id} ${rec.title} (${status})` } };
    }

    default:
      return { text: `Unknown tool ${name}.`, isError: true };
  }
}
