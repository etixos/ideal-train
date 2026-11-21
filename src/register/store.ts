import { useSyncExternalStore } from 'react';
import { SEED_DECISIONS } from './seed';
import type { Decision, DecisionStatus } from './types';

/** The design register, kept in this browser. Separate from token history so adopting is a clear, recorded act. */
const KEY = 'mercantile-design-lab:register:v1';

interface RegisterState {
  decisions: Decision[];
  /** Token values at the moment of the last adoption; edits since then are "not adopted yet". */
  baseline: Record<string, unknown> | null;
}

function load(): RegisterState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw) as RegisterState;
      // Keep the owner's records; add any seed decisions introduced since.
      const ids = new Set(p.decisions.map((d) => d.id));
      return { decisions: [...p.decisions, ...SEED_DECISIONS.filter((d) => !ids.has(d.id))], baseline: p.baseline ?? null };
    }
  } catch {
    /* fall through to seed */
  }
  return { decisions: structuredClone(SEED_DECISIONS), baseline: null };
}

let state = load();
const listeners = new Set<() => void>();
function set(next: RegisterState) {
  state = next;
  listeners.forEach((l) => l());
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable */
  }
}

export const useRegister = <T,>(sel: (s: RegisterState) => T) =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => sel(state),
  );
export const getRegister = () => state;

const today = () => new Date().toISOString().slice(0, 10);

export const register = {
  update(id: string, patch: Partial<Decision>) {
    set({ ...state, decisions: state.decisions.map((d) => (d.id === id ? { ...d, ...patch } : d)) });
  },
  /** Record an adoption: the decision becomes Approved with today's date. */
  markAdopted(id: string, chosen?: string) {
    register.update(id, { status: 'approved', chosen, date: today(), adoptedBy: 'Owner (in the lab)' });
  },
  setStatus(id: string, status: DecisionStatus) {
    register.update(id, { status, date: status === 'approved' ? today() : state.decisions.find((d) => d.id === id)?.date });
  },
  add(d: Omit<Decision, 'id'>, prefix = 'L') {
    const n = state.decisions.filter((x) => x.id.startsWith(prefix + '-')).length + 1;
    const rec: Decision = { ...d, id: `${prefix}-${String(n).padStart(3, '0')}` };
    set({ ...state, decisions: [rec, ...state.decisions] });
    return rec;
  },
  setBaseline(values: Record<string, unknown>) {
    set({ ...state, baseline: structuredClone(values) });
  },
  /** Restore the starting register compiled from your documents (keeps nothing you adopted here). */
  resetToSeed() {
    set({ decisions: structuredClone(SEED_DECISIONS), baseline: null });
  },
};
