import { createClient, type RealtimeChannel } from '@supabase/supabase-js';
import { useSyncExternalStore } from 'react';
import { getRegister, register, subscribeRegister, type RegisterState } from '../register/store';
import { actions, getState, normalizeTheme, subscribe as subscribeLab } from '../state/store';
import { buildCatalog } from './catalog';

/**
 * Cloud sync: the lab's theme and Decisions live in Supabase (project mercantile-labelbook,
 * tables lab_state / lab_events), behind the design-lab edge function and the owner's lab key.
 * Every browser and every connected AI sees the same copy; changes arrive live.
 */

export const SUPABASE_URL = 'https://viuruxnnlaovntywpzdk.supabase.co';
export const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/design-lab`;
export const MCP_URL = `${FUNCTION_URL}/mcp`;
/** Public client key (safe to ship): only used to listen for "something changed" signals. */
const PUBLISHABLE_KEY = 'sb_publishable_QXX0hVM_WYOZOuwqJaqG4g_BlafnSYQ';
const KEY_STORAGE = 'mercantile-design-lab:cloud-key';

export type CloudStatus = 'off' | 'connecting' | 'saved' | 'saving' | 'offline' | 'error';

interface CloudState {
  status: CloudStatus;
  message: string;
  version: number;
  updatedBy: string | null;
  updatedAt: string | null;
  connected: boolean;
}

let cloud: CloudState = { status: 'off', message: 'Saved in this browser only.', version: 0, updatedBy: null, updatedAt: null, connected: false };
const listeners = new Set<() => void>();
const setCloud = (patch: Partial<CloudState>) => {
  cloud = { ...cloud, ...patch };
  listeners.forEach((l) => l());
};
export const useCloud = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => cloud,
  );

const readKey = () => {
  try {
    return localStorage.getItem(KEY_STORAGE);
  } catch {
    return null;
  }
};
const writeKey = (k: string | null) => {
  try {
    if (k) localStorage.setItem(KEY_STORAGE, k);
    else localStorage.removeItem(KEY_STORAGE);
  } catch {
    /* ignore */
  }
};

let key: string | null = null;
let lastSynced = '';
let applyingRemote = false;
let timer: number | undefined;
let unsubs: (() => void)[] = [];
let channel: RealtimeChannel | null = null;
let rt: ReturnType<typeof createClient> | null = null;

const payloadOf = () => JSON.stringify({ theme: getState().theme, register: getRegister() });

async function call(method: 'GET' | 'PUT', path: string, body?: unknown) {
  const res = await fetch(`${FUNCTION_URL}${path}`, {
    method,
    headers: { 'x-lab-key': key ?? '', 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

/** Bring a cloud copy into the lab without echoing it back. */
function applyRemote(row: { theme: unknown; register: RegisterState; version: number; updated_by?: string; updated_at?: string }) {
  applyingRemote = true;
  try {
    actions.applyTheme(normalizeTheme(row.theme));
    register.replaceAll(row.register);
    lastSynced = payloadOf();
  } finally {
    applyingRemote = false;
  }
  setCloud({ version: row.version, updatedBy: row.updated_by ?? null, updatedAt: row.updated_at ?? null });
}

async function push() {
  if (!key || applyingRemote) return;
  const now = payloadOf();
  if (now === lastSynced) return;
  setCloud({ status: 'saving', message: 'Saving…' });
  try {
    const { theme, register: reg } = JSON.parse(now);
    const { status, data } = await call('PUT', '/state', { theme, register: reg, catalog: buildCatalog(getState().theme), baseVersion: cloud.version, actor: 'lab' });
    if (status === 200) {
      lastSynced = now;
      setCloud({ status: 'saved', message: 'Saved to the cloud.', version: data.version, updatedBy: 'lab', updatedAt: new Date().toISOString() });
    } else if (status === 409 && data.current) {
      // Someone (another device or an AI) saved first. Their copy wins; nothing is merged silently.
      applyRemote(data.current);
      setCloud({ status: 'saved', message: `Updated from the cloud: ${data.current.updated_by ?? 'another device'} saved a newer version. Redo your last edit if it is missing.` });
    } else if (status === 401) {
      setCloud({ status: 'error', message: 'The lab key was rejected. Reconnect with the current key.' });
    } else {
      setCloud({ status: 'error', message: data.error ?? `Save failed (${status}).` });
    }
  } catch {
    setCloud({ status: 'offline', message: 'Offline. Changes are kept in this browser and will save when the connection returns.' });
  }
}

const schedule = () => {
  if (!key || applyingRemote) return;
  window.clearTimeout(timer);
  timer = window.setTimeout(push, 700);
};

async function pull() {
  const { status, data } = await call('GET', '/state');
  if (status === 200 && data.version > cloud.version) applyRemote(data);
}

function listen(topic: string) {
  rt ??= createClient(SUPABASE_URL, PUBLISHABLE_KEY, { auth: { persistSession: false } });
  channel?.unsubscribe();
  channel = rt
    .channel(topic)
    .on('broadcast', { event: 'changed' }, (msg) => {
      const v = Number((msg.payload as { version?: number })?.version ?? 0);
      if (v > cloud.version) void pull();
    })
    .subscribe();
}

/** Connect this browser to the shared lab. First connection uploads this browser's copy if the cloud is empty. */
export async function connectCloud(k: string): Promise<{ ok: boolean; message: string }> {
  key = k.trim();
  setCloud({ status: 'connecting', message: 'Connecting…' });
  try {
    const { status, data } = await call('GET', '/state');
    if (status === 401) {
      key = null;
      setCloud({ status: 'off', message: 'That lab key isn’t right.' });
      return { ok: false, message: 'That lab key isn’t right. Check it in Supabase › Edge Functions › Secrets (LAB_KEY).' };
    }
    if (status === 404) {
      lastSynced = '';
      setCloud({ version: 0 });
      writeKey(key);
      await push();
      setCloud({ connected: true });
      listen(data.topic);
    } else if (status === 200) {
      writeKey(key);
      applyRemote(data);
      setCloud({ status: 'saved', message: 'Connected. Showing the shared copy.', connected: true });
      listen(data.topic);
      // Refresh the token catalog the AIs read, in case this lab version has new tokens.
      lastSynced = '';
      schedule();
    } else {
      throw new Error(data.error ?? String(status));
    }
    unsubs.forEach((u) => u());
    unsubs = [subscribeLab(schedule), subscribeRegister(schedule)];
    window.addEventListener('online', schedule);
    return { ok: true, message: 'Connected.' };
  } catch {
    setCloud({ status: 'error', message: 'Couldn’t reach the cloud. The lab keeps working in this browser.' });
    return { ok: false, message: 'Couldn’t reach the cloud. If you opened the lab from a claude.ai link, use your own site instead: that preview can’t talk to outside services.' };
  }
}

export function disconnectCloud() {
  unsubs.forEach((u) => u());
  unsubs = [];
  channel?.unsubscribe();
  channel = null;
  key = null;
  writeKey(null);
  setCloud({ status: 'off', message: 'Saved in this browser only.', connected: false, version: 0 });
}

/** Reconnect automatically when this browser already has a key. */
export function startCloud() {
  const k = readKey();
  if (k) void connectCloud(k);
}

export const currentKey = () => key;
