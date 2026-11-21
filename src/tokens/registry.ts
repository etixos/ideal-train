import type { AppId, Category, Layer, Platform, TokenDef, TokenType, TokenValue } from './types';

/**
 * The built-in Mercantile token registry: default definitions for every token.
 * Themes store overrides on top of this.
 */

const defs: TokenDef[] = [];

type Entry = TokenValue | { v: TokenValue; d?: string; scale?: 'density' | 'text' };

function add(layer: Layer, category: Category, group: string, type: TokenType, entries: Record<string, Entry>) {
  for (const [id, e] of Object.entries(entries)) {
    const full = typeof e === 'object' && e !== null && 'v' in e ? e : { v: e as TokenValue };
    defs.push({ id, layer, category, group, type, value: full.v, description: full.d, scale: full.scale });
  }
}

const ld = (light: string, dark: string, hcLight?: string, hcDark?: string): TokenValue => ({
  light,
  dark,
  ...(hcLight ? { hcLight } : {}),
  ...(hcDark ? { hcDark } : {}),
});
const r = (id: string) => `{${id}}`;
const n = (step: number | string) => r(`palette.neutral.${step}`);
const p = (hue: string, step: number | string) => r(`palette.${hue}.${step}`);

/* ───────────────────────── FOUNDATION ───────────────────────── */

add('foundation', 'color', 'Palette / Foundation', 'color', {
  'palette.ink': { v: '#242A28', d: 'Deepest neutral. Primary text, strongest surfaces.' },
  'palette.charcoal': { v: '#414B43', d: 'Default tint for controls and emphasis.' },
  'palette.slate': { v: '#667163', d: 'Quiet iconography and secondary text on white.' },
  'palette.stone': { v: '#92998A', d: 'Placeholders, disabled content, strong rules.' },
  'palette.linen': { v: '#D8D6CC', d: 'Hairlines, dividers, selected fills.' },
  'palette.ivory': { v: '#F4F1E9', d: 'Application background.' },
  'palette.white': { v: '#FFFFFF', d: 'Content surfaces.' },
  'palette.brick': { v: '#8B312C', d: 'Destructive and critical emphasis; brand mark.' },
  'palette.brass': { v: '#B18A55', d: 'Highlight, focus, and secondary accent.' },
});

add('foundation', 'color', 'Palette / Neutral', 'color', {
  'palette.neutral.0': r('palette.white'),
  'palette.neutral.50': r('palette.ivory'),
  'palette.neutral.100': '#E9E6DC',
  'palette.neutral.200': r('palette.linen'),
  'palette.neutral.300': '#B9BBAE',
  'palette.neutral.400': r('palette.stone'),
  'palette.neutral.500': '#7A8475',
  'palette.neutral.600': r('palette.slate'),
  'palette.neutral.650': { v: '#5B6558', d: 'Between Slate and Charcoal: secondary text that must pass 4.5:1 on tinted surfaces.' },
  'palette.neutral.700': r('palette.charcoal'),
  'palette.neutral.800': '#313834',
  'palette.neutral.900': r('palette.ink'),
  'palette.neutral.950': '#171B1A',
  'palette.neutral.1000': '#0E1110',
});

add('foundation', 'color', 'Palette / Brick', 'color', {
  'palette.brick.50': '#F6E9E6',
  'palette.brick.100': '#EBCFCB',
  'palette.brick.200': '#D9A6A0',
  'palette.brick.300': '#CC8A83',
  'palette.brick.400': '#A9524B',
  'palette.brick.500': r('palette.brick'),
  'palette.brick.600': '#762823',
  'palette.brick.700': '#5F1F1B',
  'palette.brick.800': '#481714',
  'palette.brick.900': '#32100E',
});

add('foundation', 'color', 'Palette / Brass', 'color', {
  'palette.brass.50': '#F7F1E6',
  'palette.brass.100': '#EDE0C8',
  'palette.brass.200': '#DFC9A1',
  'palette.brass.300': '#CFAF7A',
  'palette.brass.400': '#BF9B65',
  'palette.brass.500': r('palette.brass'),
  'palette.brass.600': '#8F6C3A',
  'palette.brass.700': '#735630',
  'palette.brass.800': '#5A4426',
  'palette.brass.900': '#3A2C19',
});

const hue = (name: string, label: string, steps: Record<number, string>) =>
  add(
    'foundation',
    'color',
    `Palette / ${label}`,
    'color',
    Object.fromEntries(Object.entries(steps).map(([k, v]) => [`palette.${name}.${k}`, v])),
  );

hue('moss', 'Moss', { 50: '#EAF0E7', 100: '#D3E0CE', 300: '#93B48B', 500: '#4F7048', 600: '#3F5C3A', 700: '#31482D', 900: '#1C281A' });
hue('amber', 'Amber', { 50: '#F8EFD9', 100: '#F0DDB0', 300: '#DDAE55', 500: '#A8741F', 600: '#875C15', 700: '#694710', 900: '#33240A' });
hue('denim', 'Denim', { 50: '#E6EDF2', 100: '#CCD9E3', 300: '#8FADC4', 500: '#3F5E78', 600: '#334D63', 700: '#283D4F', 900: '#16222C' });
hue('teal', 'Teal', { 300: '#84B5B0', 500: '#3F7470' });
hue('plum', 'Plum', { 300: '#BC9AAD', 500: '#6E4A5E' });
hue('clay', 'Clay', { 300: '#DBA48D', 500: '#B5694A' });
hue('sage', 'Sage', { 300: '#B3C3A8', 500: '#7C8F6F' });

add('foundation', 'typography', 'Font / Family', 'fontFamily', {
  'font.family.sans': {
    v: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    d: 'Interface text. Resolves to San Francisco on Apple platforms.',
  },
  'font.family.serif': {
    v: '"New York", "Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif',
    d: 'Display headings and report titles.',
  },
  'font.family.mono': {
    v: '"SF Mono", ui-monospace, Menlo, Consolas, "Liberation Mono", monospace',
    d: 'Code, identifiers, token names.',
  },
});

add('foundation', 'typography', 'Font / Size', 'dimension', {
  'font.size.2xs': '11px',
  'font.size.xs': '12px',
  'font.size.sm': '13px',
  'font.size.md': '14px',
  'font.size.lg': '16px',
  'font.size.xl': '18px',
  'font.size.2xl': '21px',
  'font.size.3xl': '26px',
  'font.size.4xl': '32px',
  'font.size.5xl': '40px',
});

add('foundation', 'typography', 'Font / Weight', 'fontWeight', {
  'font.weight.regular': '400',
  'font.weight.medium': '500',
  'font.weight.semibold': '600',
  'font.weight.bold': '700',
});

add('foundation', 'typography', 'Font / Line height', 'number', {
  'font.leading.tight': '1.15',
  'font.leading.snug': '1.3',
  'font.leading.normal': '1.45',
  'font.leading.relaxed': '1.6',
});

add('foundation', 'typography', 'Font / Letter spacing', 'dimension', {
  'font.tracking.tight': '-0.015em',
  'font.tracking.normal': '0em',
  'font.tracking.wide': '0.03em',
  'font.tracking.caps': '0.08em',
});

add('foundation', 'spacing', 'Space / Scale', 'dimension', {
  'space.0': '0px',
  'space.1': '2px',
  'space.2': '4px',
  'space.3': '6px',
  'space.4': '8px',
  'space.5': '12px',
  'space.6': '16px',
  'space.7': '20px',
  'space.8': '24px',
  'space.9': '32px',
  'space.10': '40px',
  'space.11': '48px',
  'space.12': '64px',
});

add('foundation', 'shape', 'Radius / Scale', 'dimension', {
  'radius.none': '0px',
  'radius.xs': '2px',
  'radius.sm': '3px',
  'radius.md': '4px',
  'radius.lg': '6px',
  'radius.xl': '8px',
  'radius.2xl': '12px',
  'radius.full': '999px',
});

add('foundation', 'shape', 'Border / Width', 'dimension', {
  'border.width.thin': '1px',
  'border.width.medium': '1.5px',
  'border.width.thick': '2px',
});

add('foundation', 'motion', 'Duration / Scale', 'duration', {
  'duration.instant': '80ms',
  'duration.fast': '120ms',
  'duration.base': '180ms',
  'duration.slow': '280ms',
  'duration.slower': '450ms',
});

add('foundation', 'motion', 'Easing / Curves', 'easing', {
  'easing.standard': 'cubic-bezier(0.2, 0, 0, 1)',
  'easing.enter': 'cubic-bezier(0, 0, 0.2, 1)',
  'easing.exit': 'cubic-bezier(0.4, 0, 1, 1)',
  'easing.emphasized': 'cubic-bezier(0.3, 0, 0, 1.15)',
  'easing.linear': 'linear',
});

add('foundation', 'icon', 'Icon / Size', 'dimension', {
  'icon.size.sm': '14px',
  'icon.size.md': '16px',
  'icon.size.lg': '20px',
  'icon.size.xl': '24px',
});

add('foundation', 'icon', 'Icon / Stroke', 'number', {
  'icon.stroke.thin': '1.25',
  'icon.stroke.regular': '1.6',
  'icon.stroke.bold': '2',
});

add('foundation', 'color', 'Opacity', 'number', {
  'opacity.disabled': { v: '0.45', d: 'Applied to disabled controls.' },
  'opacity.loading': '0.7',
});

/* ───────────────────────── SEMANTIC ───────────────────────── */

add('semantic', 'color', 'Color / Background', 'color', {
  'color.bg.app': { v: ld(n(50), n(950)), d: 'Window / page background.' },
  'color.bg.sunken': { v: ld(n(100), n(1000)), d: 'Wells, gutters, and recessed regions.' },
});

add('semantic', 'color', 'Color / Surface', 'color', {
  'color.surface.default': { v: ld(n(0), n(900)), d: 'Cards, tables, content panes.' },
  'color.surface.elevated': { v: ld(n(0), n(800)), d: 'Popovers, menus, dialogs.' },
  'color.surface.sunken': { v: ld(n(100), n(950)), d: 'Inset areas inside a surface.' },
  'color.surface.sidebar': { v: ld(n(100), n(900)), d: 'Sidebars and source lists.' },
  'color.surface.hover': { v: ld(n(100), n(800)), d: 'Hover fill on neutral rows and controls.' },
  'color.surface.pressed': { v: ld(n(200), n(700)), d: 'Pressed fill on neutral rows and controls.' },
  'color.surface.selected': { v: ld(n(200), n(700)), d: 'Selected rows and navigation items.' },
  'color.surface.inverse': { v: ld(n(900), n(100)), d: 'Tooltips and inverse callouts.' },
});

add('semantic', 'color', 'Color / Text', 'color', {
  'color.text.primary': { v: ld(n(900), n(50), '#000000', '#FFFFFF'), d: 'Body copy and headings.' },
  'color.text.secondary': { v: ld(n(650), n(300), n(800), n(100)), d: 'Supporting text, labels. Passes 4.5:1 on every light surface, including sidebars and table headers.' },
  'color.text.tertiary': { v: ld(n(500), n(400), n(700), n(200)), d: 'Placeholders and de-emphasized metadata. Large text only.' },
  'color.text.disabled': { v: ld(n(400), n(600), n(500), n(400)), d: 'Disabled labels.' },
  'color.text.inverse': { v: ld(n(50), n(900)), d: 'Text on inverse surfaces.' },
  'color.text.link': { v: r('color.accent.text'), d: 'Hyperlinks. Always underlined.' },
});

add('semantic', 'color', 'Color / Border', 'color', {
  'color.border.subtle': { v: ld(n(200), n(800), n(400), n(500)), d: 'Dividers between related content.' },
  'color.border.default': { v: ld(n(300), n(700), n(700), n(300)), d: 'Control and container outlines.' },
  'color.border.strong': { v: ld(n(500), n(500), n(900), n(50)), d: 'Emphasized outlines, table header rules.' },
});

add('semantic', 'color', 'Color / Accent', 'color', {
  'color.accent.default': { v: ld(n(700), n(200), n(900), n(0)), d: 'Primary tint: primary buttons, toggles, selection.' },
  'color.accent.hover': { v: ld(n(800), n(100)), d: 'Accent hover.' },
  'color.accent.pressed': { v: ld(n(900), n(0)), d: 'Accent pressed.' },
  'color.accent.subtle': { v: ld(n(200), n(800)), d: 'Tinted backgrounds for accent selection.' },
  'color.accent.text': { v: ld(n(700), n(200), n(900), n(0)), d: 'Accent-colored text and icons on surfaces.' },
  'color.accent.on': { v: ld(n(0), n(950)), d: 'Text on accent fills.' },
});

add('semantic', 'color', 'Color / Highlight', 'color', {
  'color.highlight.default': { v: ld(p('brass', 500), p('brass', 400)), d: 'Secondary accent: marks, indicators, emphasis rules.' },
  'color.highlight.subtle': { v: ld(p('brass', 50), p('brass', 900)), d: 'Highlight wash.' },
  'color.highlight.text': { v: ld(p('brass', 700), p('brass', 300)), d: 'Highlight-colored text.' },
  'color.focus.ring': { v: ld(p('brass', 600), p('brass', 300), n(900), n(0)), d: 'Keyboard focus indicator.' },
});

const status = (name: string, h: string, solidLight: number, solidDark: number) =>
  add('semantic', 'color', `Color / Status / ${name[0].toUpperCase()}${name.slice(1)}`, 'color', {
    [`color.status.${name}.fg`]: { v: ld(p(h, h === 'brick' ? 600 : 700), p(h, 300)), d: 'Text and icons.' },
    [`color.status.${name}.bg`]: { v: ld(p(h, 50), p(h, 900)), d: 'Tinted background.' },
    [`color.status.${name}.border`]: { v: ld(p(h, h === 'brick' ? 200 : 300), p(h, 700)), d: 'Outline.' },
    [`color.status.${name}.solid`]: { v: ld(p(h, solidLight), p(h, solidDark)), d: 'Solid fills (badges, bars).' },
    [`color.status.${name}.on`]: { v: ld(n(0), n(950)), d: 'Text on the solid fill.' },
  });
status('success', 'moss', 500, 300);
status('warning', 'amber', 500, 300);
status('danger', 'brick', 500, 300);
status('info', 'denim', 500, 300);

add('semantic', 'color', 'Color / Overlay', 'color', {
  'color.overlay.scrim': { v: ld('rgba(23, 27, 26, 0.42)', 'rgba(0, 0, 0, 0.6)'), d: 'Backdrop behind dialogs and sheets.' },
  'color.shadow.ambient': { v: ld('rgba(36, 42, 40, 0.07)', 'rgba(0, 0, 0, 0.35)'), d: 'Soft shadow tint.' },
  'color.shadow.key': { v: ld('rgba(36, 42, 40, 0.14)', 'rgba(0, 0, 0, 0.5)'), d: 'Directional shadow tint.' },
});

/* Chart palettes */
add('semantic', 'chart', 'Chart / Categorical', 'color', {
  'color.chart.cat.1': ld(n(700), n(200)),
  'color.chart.cat.2': ld(p('brick', 500), p('brick', 300)),
  'color.chart.cat.3': ld(p('brass', 500), p('brass', 300)),
  'color.chart.cat.4': ld(p('denim', 500), p('denim', 300)),
  'color.chart.cat.5': ld(p('teal', 500), p('teal', 300)),
  'color.chart.cat.6': ld(p('plum', 500), p('plum', 300)),
  'color.chart.cat.7': ld(p('clay', 500), p('clay', 300)),
  'color.chart.cat.8': ld(p('sage', 500), p('sage', 300)),
});

const seq = ['#E4E8DF', '#C5CDBC', '#A3AF99', '#82917A', '#667163', '#4A564B', '#2C3530'];
add(
  'semantic',
  'chart',
  'Chart / Sequential',
  'color',
  Object.fromEntries(seq.map((c, i) => [`color.chart.seq.${i + 1}`, ld(c, seq[seq.length - 1 - i])])),
);

add('semantic', 'chart', 'Chart / Diverging', 'color', {
  'color.chart.div.1': ld(p('brick', 600), p('brick', 300)),
  'color.chart.div.2': ld(p('brick', 400), p('brick', 400)),
  'color.chart.div.3': ld(p('brick', 200), p('brick', 700)),
  'color.chart.div.4': { v: ld(n(100), n(700)), d: 'Neutral midpoint.' },
  'color.chart.div.5': ld(p('denim', 100), p('denim', 700)),
  'color.chart.div.6': ld(p('denim', 300), p('denim', 500)),
  'color.chart.div.7': ld(p('denim', 600), p('denim', 300)),
});

add('semantic', 'chart', 'Chart / Roles', 'color', {
  'color.chart.positive': { v: ld(p('moss', 500), p('moss', 300)), d: 'Gains, favorable variance.' },
  'color.chart.negative': { v: ld(p('brick', 500), p('brick', 300)), d: 'Losses, unfavorable variance.' },
  'color.chart.neutral': { v: ld(n(400), n(500)), d: 'Totals, baselines, comparison series.' },
  'color.chart.grid': { v: ld(n(200), n(800), n(400), n(500)), d: 'Gridlines.' },
  'color.chart.axis': { v: ld(n(400), n(600), n(800), n(100)), d: 'Axis lines and ticks.' },
  'color.chart.label': { v: r('color.text.secondary'), d: 'Axis and data labels.' },
  'color.chart.reference': { v: ld(p('brass', 600), p('brass', 300)), d: 'Reference lines (targets, averages).' },
  'color.chart.threshold': { v: ld(p('brick', 500), p('brick', 300)), d: 'Threshold lines and bands.' },
});

/* Typography styles */
type TS = [family: string, size: string, weight: string, leading: string, tracking: string, desc: string];
const textStyles: Record<string, TS> = {
  display: ['serif', '5xl', 'semibold', 'tight', 'tight', 'Hero figures and cover titles.'],
  title1: ['serif', '4xl', 'semibold', 'tight', 'tight', 'Page titles.'],
  title2: ['serif', '3xl', 'semibold', 'snug', 'tight', 'Section titles.'],
  title3: ['sans', '2xl', 'semibold', 'snug', 'normal', 'Subsection titles.'],
  headline: ['sans', 'lg', 'semibold', 'snug', 'normal', 'Card titles, emphasized rows.'],
  lead: ['sans', 'lg', 'regular', 'relaxed', 'normal', 'Introductory paragraphs.'],
  body: ['sans', 'md', 'regular', 'normal', 'normal', 'Default interface and reading text.'],
  subhead: ['sans', 'sm', 'medium', 'snug', 'normal', 'Secondary headings, list group titles.'],
  label: ['sans', 'sm', 'medium', 'snug', 'normal', 'Form labels, buttons, tabs.'],
  footnote: ['sans', 'xs', 'regular', 'normal', 'normal', 'Help text and metadata.'],
  caption: ['sans', '2xs', 'regular', 'snug', 'wide', 'Chart labels and fine print.'],
  overline: ['sans', '2xs', 'semibold', 'snug', 'caps', 'Uppercase eyebrow labels.'],
  code: ['mono', 'xs', 'regular', 'normal', 'normal', 'Code and token identifiers.'],
};
for (const [name, [fam, size, weight, leading, tracking, desc]] of Object.entries(textStyles)) {
  const g = `Text / ${name[0].toUpperCase()}${name.slice(1)}`;
  add('semantic', 'typography', g, 'fontFamily', { [`text.${name}.family`]: { v: r(`font.family.${fam}`), d: desc } });
  add('semantic', 'typography', g, 'dimension', { [`text.${name}.size`]: { v: r(`font.size.${size}`), scale: 'text' } });
  add('semantic', 'typography', g, 'fontWeight', { [`text.${name}.weight`]: r(`font.weight.${weight}`) });
  add('semantic', 'typography', g, 'number', { [`text.${name}.leading`]: r(`font.leading.${leading}`) });
  add('semantic', 'typography', g, 'dimension', { [`text.${name}.tracking`]: r(`font.tracking.${tracking}`) });
}
export const TEXT_STYLES = Object.keys(textStyles);

add('semantic', 'typography', 'Text / Numeric', 'string', {
  'text.numeric.features': { v: '"tnum" 1, "lnum" 1', d: 'OpenType features for figures in tables and KPIs (tabular, lining).' },
});

/* Spacing */
add('semantic', 'spacing', 'Space / Component', 'dimension', {
  'space.component.xs': { v: r('space.2'), scale: 'density', d: 'Tightest internal gap (icon ↔ label).' },
  'space.component.sm': { v: r('space.3'), scale: 'density', d: 'Small internal padding.' },
  'space.component.default': { v: r('space.4'), scale: 'density', d: 'Default internal padding and gaps.' },
  'space.component.lg': { v: r('space.5'), scale: 'density', d: 'Horizontal control padding.' },
  'space.component.xl': { v: r('space.6'), scale: 'density', d: 'Roomy control padding.' },
});
add('semantic', 'spacing', 'Space / Inset', 'dimension', {
  'space.inset.sm': { v: r('space.4'), scale: 'density', d: 'Compact container padding.' },
  'space.inset.md': { v: r('space.5'), scale: 'density', d: 'List and toolbar padding.' },
  'space.inset.lg': { v: r('space.6'), scale: 'density', d: 'Card padding.' },
  'space.inset.xl': { v: r('space.8'), scale: 'density', d: 'Dialog and panel padding.' },
});
add('semantic', 'spacing', 'Space / Stack', 'dimension', {
  'space.stack.xs': { v: r('space.2'), d: 'Label to control.' },
  'space.stack.sm': { v: r('space.4'), d: 'Between closely related items.' },
  'space.stack.md': { v: r('space.6'), d: 'Between form rows and paragraphs.' },
  'space.stack.lg': { v: r('space.8'), d: 'Between groups.' },
  'space.stack.xl': { v: r('space.10'), d: 'Between page sections.' },
});
add('semantic', 'spacing', 'Space / Page', 'dimension', {
  'space.page.margin': { v: r('space.9'), d: 'Outer page margin.' },
  'space.page.gutter': { v: r('space.6'), d: 'Grid gutter.' },
});
add('semantic', 'spacing', 'Layout', 'dimension', {
  'layout.content.max': { v: '1200px', d: 'Maximum reading/content width.' },
  'layout.sidebar.width': { v: '248px', d: 'Standard sidebar width.' },
  'layout.inspector.width': { v: '300px', d: 'Inspector panel width.' },
  'layout.breakpoint.sm': { v: '640px', d: 'Compact → regular.' },
  'layout.breakpoint.md': { v: '900px', d: 'Regular → wide.' },
  'layout.breakpoint.lg': { v: '1200px', d: 'Wide → extra wide.' },
});
add('semantic', 'spacing', 'Layout', 'number', {
  'layout.grid.columns': { v: '12', d: 'Column count of the page grid.' },
});
add('semantic', 'spacing', 'Size / Control', 'dimension', {
  'size.control.sm': { v: '26px', scale: 'density', d: 'Small control height.' },
  'size.control.md': { v: '32px', scale: 'density', d: 'Default control height.' },
  'size.control.lg': { v: '40px', scale: 'density', d: 'Large control height.' },
  'size.touch.min': { v: '44px', d: 'Minimum touch target (Apple HIG: 44pt).' },
});

/* Shape */
add('semantic', 'shape', 'Radius / Role', 'dimension', {
  'radius.control': { v: r('radius.md'), d: 'Buttons, inputs, menu items.' },
  'radius.container': { v: r('radius.lg'), d: 'Cards, tables, panels.' },
  'radius.overlay': { v: r('radius.xl'), d: 'Dialogs, sheets, popovers.' },
  'radius.badge': { v: r('radius.sm'), d: 'Badges and tags.' },
  'radius.pill': { v: r('radius.full'), d: 'Switches, pills, avatars.' },
});
add('semantic', 'shape', 'Border / Role', 'dimension', {
  'border.width.default': { v: r('border.width.thin'), d: 'Standard outlines and dividers.' },
  'border.width.strong': { v: r('border.width.thick'), d: 'Emphasis rules, selected indicators.' },
  'focus.ring.width': { v: '2px', d: 'Focus indicator thickness.' },
  'focus.ring.offset': { v: '2px', d: 'Gap between element and focus ring.' },
});

/* Elevation */
add('semantic', 'elevation', 'Elevation', 'shadow', {
  'elevation.flat': { v: 'none', d: 'Resting surfaces. Mercantile prefers borders to shadows.' },
  'elevation.raised': { v: '0 1px 2px {color.shadow.ambient}', d: 'Cards that need slight lift.' },
  'elevation.overlay': { v: '0 4px 14px {color.shadow.ambient}, 0 1px 3px {color.shadow.key}', d: 'Menus, popovers, tooltips.' },
  'elevation.modal': { v: '0 18px 44px {color.shadow.key}, 0 2px 6px {color.shadow.ambient}', d: 'Dialogs and sheets.' },
});

/* Icons */
add('semantic', 'icon', 'Icon / Role', 'dimension', {
  'icon.size.default': { v: r('icon.size.md'), d: 'Inline and control icons.' },
  'icon.size.nav': { v: r('icon.size.md'), d: 'Sidebar and tab icons.' },
  'icon.size.feature': { v: r('icon.size.xl'), d: 'Empty states and feature marks.' },
});
add('semantic', 'icon', 'Icon / Role', 'number', {
  'icon.stroke.width': { v: r('icon.stroke.regular'), d: 'Stroke weight for all line icons.' },
});
add('semantic', 'icon', 'Icon / Role', 'color', {
  'icon.color.default': { v: r('color.text.secondary'), d: 'Default icon tint.' },
});

/* Motion */
add('semantic', 'motion', 'Motion / Duration', 'duration', {
  'motion.duration.hover': { v: r('duration.fast'), d: 'Hover and focus color changes.' },
  'motion.duration.press': { v: r('duration.instant'), d: 'Press feedback.' },
  'motion.duration.enter': { v: r('duration.base'), d: 'Elements appearing.' },
  'motion.duration.exit': { v: r('duration.fast'), d: 'Elements leaving.' },
  'motion.duration.page': { v: r('duration.slow'), d: 'Sheets and large surface transitions.' },
  'motion.duration.spin': { v: '900ms', d: 'One revolution of a loading indicator.' },
});
add('semantic', 'motion', 'Motion / Easing', 'easing', {
  'motion.easing.default': { v: r('easing.standard'), d: 'State changes.' },
  'motion.easing.enter': { v: r('easing.enter'), d: 'Entering elements decelerate.' },
  'motion.easing.exit': { v: r('easing.exit'), d: 'Exiting elements accelerate.' },
});

/* ───────────────────────── COMPONENT ───────────────────────── */

const comp = (group: string, type: TokenType, entries: Record<string, Entry>) => add('component', 'component', group, type, entries);

comp('Button', 'color', {
  'button.primary.bg': r('color.accent.default'),
  'button.primary.bg.hover': r('color.accent.hover'),
  'button.primary.bg.pressed': r('color.accent.pressed'),
  'button.primary.fg': r('color.accent.on'),
  'button.secondary.bg': r('color.surface.default'),
  'button.secondary.bg.hover': r('color.surface.hover'),
  'button.secondary.bg.pressed': r('color.surface.pressed'),
  'button.secondary.fg': r('color.text.primary'),
  'button.secondary.border': r('color.border.default'),
  'button.ghost.bg.hover': r('color.surface.hover'),
  'button.ghost.bg.pressed': r('color.surface.pressed'),
  'button.ghost.fg': r('color.accent.text'),
  'button.danger.bg': r('color.status.danger.solid'),
  'button.danger.bg.hover': ld(p('brick', 600), p('brick', 200)),
  'button.danger.bg.pressed': ld(p('brick', 700), p('brick', 100)),
  'button.danger.fg': r('color.status.danger.on'),
});
comp('Button', 'dimension', {
  'button.radius': r('radius.control'),
  'button.height': r('size.control.md'),
  'button.padding.x': r('space.component.lg'),
  'button.gap': r('space.component.sm'),
  'button.font.size': r('text.label.size'),
});
comp('Button', 'fontWeight', { 'button.font.weight': r('text.label.weight') });

comp('Input', 'color', {
  'input.bg': r('color.surface.default'),
  'input.fg': r('color.text.primary'),
  'input.placeholder': r('color.text.tertiary'),
  'input.border': { v: ld(n(500), n(500)), d: 'Field outline. Meets the 3:1 non-text contrast minimum (WCAG 1.4.11).' },
  'input.border.hover': ld(n(700), n(300)),
  'input.border.focus': r('color.accent.default'),
  'input.border.error': r('color.status.danger.solid'),
  'input.border.success': r('color.status.success.solid'),
  'input.bg.disabled': r('color.surface.sunken'),
});
comp('Input', 'dimension', {
  'input.radius': r('radius.control'),
  'input.height': r('size.control.md'),
  'input.padding.x': r('space.component.default'),
  'input.font.size': r('text.body.size'),
});

comp('Selection controls', 'color', {
  'control.checked.bg': { v: r('color.accent.default'), d: 'Checkbox, radio, and switch “on” fill.' },
  'control.checked.fg': r('color.accent.on'),
  'control.track.bg': { v: ld(n(300), n(700)), d: 'Switch and slider track.' },
  'control.thumb.bg': { v: ld(n(0), n(50)), d: 'Switch and slider thumb.' },
});
comp('Selection controls', 'dimension', {
  'control.check.size': '16px',
  'control.check.radius': r('radius.sm'),
  'control.switch.width': '34px',
  'control.switch.height': '20px',
});

comp('Card', 'color', {
  'card.bg': r('color.surface.default'),
  'card.border': r('color.border.subtle'),
});
comp('Card', 'dimension', {
  'card.radius': r('radius.container'),
  'card.padding': r('space.inset.lg'),
});
comp('Card', 'shadow', { 'card.shadow': r('elevation.flat') });

comp('Dialog & Sheet', 'color', {
  'dialog.bg': r('color.surface.elevated'),
  'dialog.border': r('color.border.subtle'),
  'dialog.scrim': r('color.overlay.scrim'),
});
comp('Dialog & Sheet', 'dimension', {
  'dialog.radius': r('radius.overlay'),
  'dialog.padding': r('space.inset.xl'),
});
comp('Dialog & Sheet', 'shadow', { 'dialog.shadow': r('elevation.modal') });

comp('Menu & Popover', 'color', {
  'menu.bg': r('color.surface.elevated'),
  'menu.border': r('color.border.default'),
  'menu.item.bg.hover': r('color.surface.hover'),
  'menu.item.fg': r('color.text.primary'),
  'tooltip.bg': r('color.surface.inverse'),
  'tooltip.fg': r('color.text.inverse'),
});
comp('Menu & Popover', 'dimension', {
  'menu.radius': r('radius.container'),
  'menu.item.radius': r('radius.sm'),
  'tooltip.radius': r('radius.sm'),
});
comp('Menu & Popover', 'shadow', { 'menu.shadow': r('elevation.overlay') });

comp('Table', 'color', {
  'table.bg': r('color.surface.default'),
  'table.header.bg': r('color.surface.sunken'),
  'table.header.fg': r('color.text.secondary'),
  'table.row.bg.alt': { v: ld('rgba(36, 42, 40, 0.025)', 'rgba(255, 255, 255, 0.025)'), d: 'Zebra striping (when enabled).' },
  'table.row.bg.hover': r('color.surface.hover'),
  'table.row.bg.selected': r('color.accent.subtle'),
  'table.border': r('color.border.subtle'),
  'table.header.border': r('color.border.default'),
});
comp('Table', 'dimension', {
  'table.row.height': { v: '36px', scale: 'density' },
  'table.cell.padding.x': r('space.component.lg'),
  'table.font.size': r('text.body.size'),
  'table.header.font.size': r('text.footnote.size'),
});

comp('Navigation', 'color', {
  'nav.sidebar.bg': r('color.surface.sidebar'),
  'nav.sidebar.border': r('color.border.subtle'),
  'nav.item.fg': r('color.text.secondary'),
  'nav.item.fg.selected': r('color.text.primary'),
  'nav.item.bg.hover': r('color.surface.hover'),
  'nav.item.bg.selected': r('color.surface.selected'),
  'nav.toolbar.bg': r('color.surface.default'),
  'nav.toolbar.border': r('color.border.subtle'),
  'nav.tab.indicator': { v: r('color.highlight.default'), d: 'Underline on the selected tab.' },
  'nav.tab.fg': r('color.text.secondary'),
  'nav.tab.fg.selected': r('color.text.primary'),
});
comp('Navigation', 'dimension', {
  'nav.item.radius': r('radius.control'),
  'nav.item.height': r('size.control.md'),
  'nav.toolbar.height': '48px',
});

comp('Badge & Tag', 'color', {
  'badge.neutral.bg': r('color.surface.sunken'),
  'badge.neutral.fg': r('color.text.secondary'),
  'badge.neutral.border': r('color.border.subtle'),
  'tag.bg': r('color.surface.default'),
  'tag.border': r('color.border.default'),
});
comp('Badge & Tag', 'dimension', {
  'badge.radius': r('radius.badge'),
  'badge.font.size': r('text.caption.size'),
  'badge.height': '20px',
});

comp('Feedback', 'color', {
  'progress.track': r('control.track.bg'),
  'progress.fill': r('color.accent.default'),
  'skeleton.bg': ld(n(200), n(800)),
});
comp('Feedback', 'dimension', {
  'progress.height': '6px',
  'alert.radius': r('radius.container'),
  'toast.radius': r('radius.container'),
});

comp('Chart', 'color', {
  'chart.bg': r('color.surface.default'),
  'chart.tooltip.bg': r('color.surface.elevated'),
  'chart.tooltip.border': r('color.border.default'),
  'chart.tooltip.fg': r('color.text.primary'),
});
comp('Chart', 'dimension', {
  'chart.label.size': r('text.caption.size'),
  'chart.line.width': '2px',
  'chart.grid.width': '1px',
  'chart.bar.radius': r('radius.xs'),
  'chart.point.radius': '3px',
});

comp('Report', 'fontFamily', {
  'report.heading.family': r('font.family.serif'),
  'report.body.family': r('font.family.sans'),
});
comp('Report', 'dimension', {
  'report.page.margin': { v: '0.75in', d: 'Printed page margin.' },
  'report.body.size': { v: '10.5pt', d: 'Body text on printed pages.' },
  'report.table.size': '9.5pt',
  'report.title.size': '22pt',
  'report.heading.size': '13pt',
  'report.caption.size': '8pt',
  'report.rule.width': '0.75pt',
  'report.total.rule.width': '1.5pt',
});
comp('Report', 'color', {
  'report.page.bg': { v: ld('#FFFFFF', '#FFFFFF'), d: 'Paper. Always white.' },
  'report.ink': { v: ld(r('palette.ink'), r('palette.ink')), d: 'Printed text. Always ink.' },
  'report.ink.secondary': ld(r('palette.slate'), r('palette.slate')),
  'report.rule': ld(r('palette.linen'), r('palette.linen')),
  'report.rule.strong': ld(r('palette.ink'), r('palette.ink')),
  'report.accent': ld(r('palette.brass.600'), r('palette.brass.600')),
});

/* ───────────────────────── PLATFORM & APP DEFAULTS ───────────────────────── */

const touchText: Record<string, TokenValue> = {
  'text.display.size': '34px',
  'text.title1.size': '28px',
  'text.title2.size': '22px',
  'text.title3.size': '20px',
  'text.headline.size': '17px',
  'text.lead.size': '19px',
  'text.body.size': '17px',
  'text.subhead.size': '15px',
  'text.label.size': '17px',
  'text.footnote.size': '13px',
  'text.caption.size': '12px',
  'text.overline.size': '12px',
};

/** Platform-specific defaults. `web` is the base and has no overrides. */
export const PLATFORM_DEFAULTS: Record<Platform, Record<string, TokenValue>> = {
  web: {},
  macos: {
    'text.body.size': '13px',
    'text.label.size': '13px',
    'text.subhead.size': '12px',
    'text.footnote.size': '11px',
    'text.caption.size': '10px',
    'text.headline.size': '13px',
    'text.title3.size': '17px',
    'size.control.sm': '20px',
    'size.control.md': '24px',
    'size.control.lg': '30px',
    'radius.control': '5px',
    'radius.container': '8px',
    'radius.overlay': '10px',
    'table.row.height': '26px',
    'nav.toolbar.height': '52px',
    'layout.sidebar.width': '220px',
    'space.page.margin': '20px',
  },
  ios: {
    ...touchText,
    'size.control.sm': '34px',
    'size.control.md': '44px',
    'size.control.lg': '50px',
    'radius.control': '10px',
    'radius.container': '12px',
    'radius.overlay': '14px',
    'table.row.height': '44px',
    'nav.toolbar.height': '44px',
    'space.page.margin': '16px',
    'icon.size.default': '20px',
    'icon.size.nav': '24px',
    'control.switch.width': '51px',
    'control.switch.height': '31px',
    'control.check.size': '22px',
  },
  ipados: {
    ...touchText,
    'size.control.sm': '34px',
    'size.control.md': '44px',
    'size.control.lg': '50px',
    'radius.control': '10px',
    'radius.container': '12px',
    'radius.overlay': '14px',
    'table.row.height': '44px',
    'nav.toolbar.height': '50px',
    'space.page.margin': '20px',
    'layout.sidebar.width': '320px',
    'icon.size.default': '20px',
    'icon.size.nav': '22px',
    'control.switch.width': '51px',
    'control.switch.height': '31px',
    'control.check.size': '22px',
  },
};

export const PLATFORM_LABELS: Record<Platform, string> = { web: 'Web', macos: 'macOS', ios: 'iOS', ipados: 'iPadOS' };

const accentFrom = (h: string, base = 500, hover = 600, pressed = 700): Record<string, TokenValue> => ({
  'color.accent.default': ld(p(h, base), p(h, 300)),
  'color.accent.hover': ld(p(h, hover), p(h, 100)),
  'color.accent.pressed': ld(p(h, pressed), p(h, 50)),
  'color.accent.subtle': ld(p(h, 50), p(h, 900)),
  'color.accent.text': ld(p(h, hover), p(h, 300)),
  'color.accent.on': ld(n(0), n(950)),
});

/** Application-specific accent overrides. Each app keeps every other Mercantile decision. */
export const APPS: Record<AppId, { label: string; description: string; overrides: Record<string, TokenValue> }> = {
  inventory: { label: 'Inventory Management', description: 'Uses the default Mercantile accent.', overrides: {} },
  email: { label: 'Email Client', description: 'Denim accent.', overrides: accentFrom('denim') },
  scheduling: { label: 'Employee Scheduling', description: 'Moss accent.', overrides: accentFrom('moss') },
  finance: { label: 'Financial Dashboard', description: 'Brass accent.', overrides: accentFrom('brass', 600, 700, 800) },
  admin: {
    label: 'Administrative Console',
    description: 'Ink accent.',
    overrides: {
      'color.accent.default': ld(n(900), n(50)),
      'color.accent.hover': ld(n(800), n(0)),
      'color.accent.pressed': ld(n(950), n(0)),
      'color.accent.text': ld(n(900), n(50)),
    },
  },
  analytics: { label: 'Analytics & Reporting', description: 'Brick accent.', overrides: accentFrom('brick') },
};

export const APP_IDS = Object.keys(APPS) as AppId[];
export const PLATFORMS: Platform[] = ['web', 'macos', 'ios', 'ipados'];

export const TOKENS: readonly TokenDef[] = defs;
export const TOKEN_MAP: ReadonlyMap<string, TokenDef> = new Map(defs.map((d) => [d.id, d]));
export const TOKEN_IDS: readonly string[] = defs.map((d) => d.id);

export const getDef = (id: string): TokenDef | undefined => TOKEN_MAP.get(id);
export const tokensWhere = (pred: (d: TokenDef) => boolean): TokenDef[] => defs.filter(pred);
export const tokensByPrefix = (prefix: string): TokenDef[] => defs.filter((d) => d.id === prefix || d.id.startsWith(prefix + '.'));

/** Group helper: returns [groupLabel, defs[]] preserving registry order. */
export function groupTokens(list: readonly TokenDef[]): [string, TokenDef[]][] {
  const m = new Map<string, TokenDef[]>();
  for (const d of list) {
    if (!m.has(d.group)) m.set(d.group, []);
    m.get(d.group)!.push(d);
  }
  return [...m.entries()];
}
