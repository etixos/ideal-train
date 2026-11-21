import { APPS_REGISTER } from '../register/seed';
import { snapshotValues } from '../register/snapshot';
import { DEFAULT_THEME } from '../tokens/presets';
import { MODES, MODE_IDS, TOKENS } from '../tokens/registry';
import { resolveToken } from '../tokens/resolve';
import type { ThemeDoc } from '../tokens/types';

/** Everything an AI needs to find and understand tokens, uploaded with each save. */
export function buildCatalog(theme: ThemeDoc) {
  return {
    tokens: TOKENS.map((d) => ({
      id: d.id,
      layer: d.layer,
      group: d.group,
      type: d.type,
      description: d.description,
      default: d.value,
      resolved: Object.fromEntries(
        MODE_IDS.map((m) => [m, { light: resolveToken(theme, d.id, { appearance: 'light', mode: m }), dark: resolveToken(theme, d.id, { appearance: 'dark', mode: m }) }]),
      ),
    })),
    defaultsSnapshot: snapshotValues(DEFAULT_THEME),
    modes: Object.fromEntries(MODE_IDS.map((m) => [m, MODES[m].label])),
    apps: APPS_REGISTER.map((a) => ({ id: a.id, name: a.name, repo: a.repo, brand: a.brand, platform: a.platform, accent: a.accent, stylingLivesIn: a.stylingLivesIn, strayColors: a.hardcoded })),
    generatedAt: new Date().toISOString(),
  };
}
