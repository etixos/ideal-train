/**
 * design-lab edge function: shared storage for the Mercantile Design Lab and an MCP endpoint for AI assistants.
 *
 *   GET  /design-lab/health          no key; reports whether LAB_KEY is configured
 *   GET  /design-lab/state           lab loads the shared copy
 *   PUT  /design-lab/state           lab saves (optimistic concurrency on `version`)
 *   GET  /design-lab/events          recent change/adoption history
 *   POST /design-lab/mcp             MCP (JSON-RPC over Streamable HTTP, JSON responses)
 *
 * Every route except /health requires the owner's LAB_KEY (or an extra key fingerprinted in lab_keys),
 * sent as `x-lab-key`, `Authorization: Bearer`, or `?key=`.
 * Tables (public.lab_state, public.lab_events) have no client policies; this function uses the service role.
 */
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';
import { TOOLS, callTool, type LabState } from './core.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const LAB_KEY = Deno.env.get('LAB_KEY') ?? '';
const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-lab-key, content-type, mcp-session-id, mcp-protocol-version, apikey, x-client-info',
  'Access-Control-Expose-Headers': 'mcp-session-id',
};
const json = (body: unknown, status = 200, extra: Record<string, string> = {}) => new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json', ...extra } });

async function sha256Hex(s: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** The owner's LAB_KEY, or an extra key whose SHA-256 fingerprint is in lab_keys and not revoked. */
async function authorized(req: Request, url: URL) {
  const given = req.headers.get('x-lab-key') ?? req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? url.searchParams.get('key') ?? '';
  if (given.length < 16) return false;
  const a = await sha256Hex(given);
  if (LAB_KEY) {
    // Constant-time comparison of digests.
    const b = await sha256Hex(LAB_KEY);
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    if (diff === 0) return true;
  }
  const { data } = await db.from('lab_keys').select('id').eq('key_hash', a).is('revoked_at', null).maybeSingle();
  return !!data;
}

/** Realtime channel name derived from the key, so only key holders can find it. */
const topic = async () => `design-lab:${(await sha256Hex(`${SUPABASE_URL}|${LAB_KEY}|design-lab`)).slice(0, 24)}`;

async function broadcast(version: number, by: string) {
  try {
    await fetch(`${SUPABASE_URL}/realtime/v1/api/broadcast`, {
      method: 'POST',
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ topic: await topic(), event: 'changed', payload: { version, by } }] }),
    });
  } catch {
    /* clients still pick changes up on their next load */
  }
}

async function load(): Promise<(LabState & { updated_at: string; updated_by: string }) | null> {
  const { data, error } = await db.from('lab_state').select('*').eq('id', 'main').maybeSingle();
  if (error) throw error;
  return data as never;
}

/** Save with optimistic concurrency. Returns the new version, or null on conflict. */
async function save(next: Pick<LabState, 'theme' | 'register'> & { catalog?: unknown }, baseVersion: number, by: string): Promise<number | null> {
  const row = { theme: next.theme, register: next.register, ...(next.catalog !== undefined ? { catalog: next.catalog } : {}), updated_at: new Date().toISOString(), updated_by: by };
  if (baseVersion === 0) {
    const { error } = await db.from('lab_state').insert({ id: 'main', version: 1, ...row });
    if (error) return null;
    return 1;
  }
  const { data, error } = await db.from('lab_state').update({ ...row, version: baseVersion + 1 }).eq('id', 'main').eq('version', baseVersion).select('version');
  if (error) throw error;
  return data && data.length ? baseVersion + 1 : null;
}

async function logEvent(actor: string, kind: string, summary: string, payload?: unknown) {
  await db.from('lab_events').insert({ actor, kind, summary, payload: payload ?? null });
}

/* ───────── MCP ───────── */

const SERVER_INFO = { name: 'mercantile-design-lab', version: '1.0.0' };
const INSTRUCTIONS =
  'Mercantile Design Lab: the single source of truth for Mercantile visual design across all apps (Lindemann and Diamond Stop brands). Start with get_overview. Words: “adopt” = make it the Mercantile rule (only with the owner’s explicit yes); “apply” = update one app to the current rules (done in that app); “publish” = an app release, never a design decision. Never settle a needs-decision item or adopt anything on the owner’s behalf.';

async function handleRpc(msg: { id?: unknown; method: string; params?: Record<string, unknown> }, actor: string) {
  const reply = (result: unknown) => ({ jsonrpc: '2.0', id: msg.id, result });
  const fail = (code: number, message: string) => ({ jsonrpc: '2.0', id: msg.id, error: { code, message } });
  switch (msg.method) {
    case 'initialize':
      return reply({ protocolVersion: (msg.params?.protocolVersion as string) ?? '2025-06-18', capabilities: { tools: { listChanged: false } }, serverInfo: SERVER_INFO, instructions: INSTRUCTIONS });
    case 'ping':
      return reply({});
    case 'tools/list':
      return reply({ tools: TOOLS });
    case 'tools/call': {
      const name = String(msg.params?.name ?? '');
      const args = (msg.params?.arguments ?? {}) as Record<string, unknown>;
      for (let attempt = 0; attempt < 3; attempt++) {
        const state = await load();
        if (!state) return reply({ content: [{ type: 'text', text: 'The lab has not been connected to the cloud yet. Open the lab and connect it once.' }], isError: true });
        const out = callTool(name, args, state);
        if (!out.next) return reply({ content: [{ type: 'text', text: out.text }], isError: !!out.isError });
        const v = await save(out.next, state.version, actor);
        if (v === null) continue; // someone saved in between: reload and retry
        if (out.event) await logEvent(actor, out.event.kind, out.event.summary, out.event.payload);
        await broadcast(v, actor);
        return reply({ content: [{ type: 'text', text: out.text }], isError: !!out.isError });
      }
      return reply({ content: [{ type: 'text', text: 'The lab was busy; try again.' }], isError: true });
    }
    default:
      if (msg.method?.startsWith('notifications/')) return null;
      return fail(-32601, `Method not found: ${msg.method}`);
  }
}

/* ───────── Router ───────── */

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  const url = new URL(req.url);
  const path = url.pathname.replace(/^.*\/design-lab/, '') || '/';

  if (path === '/health') return json({ ok: true, configured: !!LAB_KEY });
  if (!(await authorized(req, url))) return json({ error: 'A valid lab key is required.' }, 401);

  try {
    if (path === '/state' && req.method === 'GET') {
      const s = await load();
      return s ? json({ ...s, topic: await topic() }) : json({ empty: true, topic: await topic() }, 404);
    }
    if (path === '/state' && req.method === 'PUT') {
      const body = await req.json();
      const v = await save({ theme: body.theme, register: body.register, catalog: body.catalog }, Number(body.baseVersion ?? 0), String(body.actor ?? 'lab'));
      if (v === null) {
        const cur = await load();
        return json({ conflict: true, current: cur }, 409);
      }
      if (body.summary) await logEvent(String(body.actor ?? 'lab'), 'lab', String(body.summary));
      await broadcast(v, String(body.actor ?? 'lab'));
      return json({ version: v });
    }
    if (path === '/events' && req.method === 'GET') {
      const { data, error } = await db.from('lab_events').select('*').order('at', { ascending: false }).limit(Math.min(Number(url.searchParams.get('limit') ?? 50), 200));
      if (error) throw error;
      return json(data);
    }
    if (path === '/mcp') {
      if (req.method !== 'POST') return json({ error: 'Use POST for MCP.' }, 405, { Allow: 'POST' });
      const actor = req.headers.get('x-lab-actor') ?? 'AI assistant';
      const body = await req.json();
      if (Array.isArray(body)) {
        const out = (await Promise.all(body.map((m) => handleRpc(m, actor)))).filter(Boolean);
        return out.length ? json(out) : new Response(null, { status: 202, headers: CORS });
      }
      const out = await handleRpc(body, actor);
      return out ? json(out) : new Response(null, { status: 202, headers: CORS });
    }
    return json({ error: 'Not found' }, 404);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
