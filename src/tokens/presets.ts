import type { ModeId, ThemeDoc, TokenValue } from './types';

export const FONT = {
  georgiaPro: '"Georgia Pro", Georgia, "Times New Roman", serif',
  ibmPlexSans: '"IBM Plex Sans", "Helvetica Neue", Arial, sans-serif',
  avenirNext: '"Avenir Next", Avenir, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
  baskerville: 'Baskerville, "Baskerville Old Face", "Libre Baskerville", Georgia, serif',
  ibmPlexMono: '"IBM Plex Mono", "SF Mono", ui-monospace, Menlo, Consolas, monospace',
};

/** Starting overrides for each mode. Everything not listed is shared. */
export const DEFAULT_MODES: Record<ModeId, { values: Record<string, TokenValue> }> = {
  lindemann: { values: { 'font.family.serif': FONT.georgiaPro, 'font.family.sans': FONT.ibmPlexSans } },
  diamond: { values: { 'font.family.serif': FONT.baskerville, 'font.family.sans': FONT.avenirNext } },
};

const ld = (light: string, dark: string): TokenValue => ({ light, dark });

export function makeTheme(partial: Partial<ThemeDoc> & { id: string; name: string }): ThemeDoc {
  return {
    description: '',
    updatedAt: 0,
    density: 'regular',
    values: {},
    modes: JSON.parse(JSON.stringify(DEFAULT_MODES)),
    platforms: {},
    apps: {},
    ...partial,
  };
}

/** Built-in starting points. Each is a set of overrides on the registry defaults. */
export const PRESETS: ThemeDoc[] = [
  makeTheme({
    id: 'mercantile',
    name: 'Mercantile',
    description: 'The provisional standard. Charcoal tint, brass highlight, restrained radii.',
  }),
  makeTheme({
    id: 'counting-house',
    name: 'Counting House',
    description: 'Brass-forward and formal. Tighter corners, serif subsection titles.',
    values: {
      'color.accent.default': ld('{palette.brass.600}', '{palette.brass.300}'),
      'color.accent.hover': ld('{palette.brass.700}', '{palette.brass.200}'),
      'color.accent.pressed': ld('{palette.brass.800}', '{palette.brass.100}'),
      'color.accent.subtle': ld('{palette.brass.50}', '{palette.brass.900}'),
      'color.accent.text': ld('{palette.brass.700}', '{palette.brass.300}'),
      'color.highlight.default': ld('{palette.neutral.700}', '{palette.neutral.300}'),
      'color.focus.ring': ld('{palette.neutral.900}', '{palette.neutral.50}'),
      'radius.md': '2px',
      'radius.lg': '3px',
      'radius.xl': '4px',
      'text.title3.family': '{font.family.serif}',
      'text.headline.family': '{font.family.serif}',
    },
  }),
  makeTheme({
    id: 'ledger',
    name: 'Ledger',
    description: 'Square, dense, and businesslike. Denim tint, sans-serif throughout, compact density.',
    density: 'compact',
    values: {
      'color.accent.default': ld('{palette.denim.500}', '{palette.denim.300}'),
      'color.accent.hover': ld('{palette.denim.600}', '{palette.denim.100}'),
      'color.accent.pressed': ld('{palette.denim.700}', '{palette.denim.50}'),
      'color.accent.subtle': ld('{palette.denim.50}', '{palette.denim.900}'),
      'color.accent.text': ld('{palette.denim.600}', '{palette.denim.300}'),
      'radius.xs': '0px',
      'radius.sm': '0px',
      'radius.md': '0px',
      'radius.lg': '0px',
      'radius.xl': '2px',
      'text.display.family': '{font.family.sans}',
      'text.title1.family': '{font.family.sans}',
      'text.title2.family': '{font.family.sans}',
      'report.heading.family': '{font.family.sans}',
      'palette.stone.canvas': '#E4E4DF',
      'palette.stone.panel': '#F5F5F1',
    },
  }),
  makeTheme({
    id: 'dry-goods',
    name: 'Dry Goods',
    description: 'Warmer paper, brick tint, softer corners, comfortable density.',
    density: 'comfortable',
    values: {
      'palette.stone.canvas': '#E6DECB',
      'palette.stone.secondary': '#F0E9D8',
      'palette.stone.panel': '#F9F3E5',
      'color.accent.default': ld('{palette.brick.500}', '{palette.brick.300}'),
      'color.accent.hover': ld('{palette.brick.600}', '{palette.brick.200}'),
      'color.accent.pressed': ld('{palette.brick.700}', '{palette.brick.100}'),
      'color.accent.subtle': ld('{palette.brick.50}', '{palette.brick.900}'),
      'color.accent.text': ld('{palette.brick.600}', '{palette.brick.300}'),
      'radius.md': '6px',
      'radius.lg': '10px',
      'radius.xl': '14px',
      'card.shadow': '{elevation.raised}',
    },
  }),
];

export const DEFAULT_THEME = PRESETS[0];
