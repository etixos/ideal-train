/**
 * Mercantile design-token model.
 *
 * Three layers:
 *   foundation — raw primitives (palette, scales)
 *   semantic   — purpose-based (color.text.primary, space.component.md)
 *   component  — per-component mappings (button.primary.bg)
 *
 * A value is either a literal ("#242A28", "8px"), a reference ("{palette.ink}"),
 * a string containing references ("0 1px 2px {color.shadow.ambient}"),
 * or a modal value carrying separate light/dark (and optional high-contrast) values.
 */

export type Layer = 'foundation' | 'semantic' | 'component';

export type TokenType =
  | 'color'
  | 'dimension'
  | 'number'
  | 'fontFamily'
  | 'fontWeight'
  | 'duration'
  | 'easing'
  | 'shadow'
  | 'string';

export type Category =
  | 'color'
  | 'typography'
  | 'shape'
  | 'spacing'
  | 'elevation'
  | 'icon'
  | 'motion'
  | 'chart'
  | 'component';

export type Platform = 'web' | 'macos' | 'ios' | 'ipados';
export type Appearance = 'light' | 'dark';
export type Contrast = 'standard' | 'high';
export type Density = 'compact' | 'regular' | 'comfortable';

export interface ModalValue {
  light: string;
  dark: string;
  /** Optional high-contrast variants. Fall back to light/dark. */
  hcLight?: string;
  hcDark?: string;
}

export type TokenValue = string | ModalValue;

export interface TokenDef {
  id: string;
  layer: Layer;
  category: Category;
  /** Human grouping label, e.g. "Palette / Neutral". */
  group: string;
  type: TokenType;
  value: TokenValue;
  description?: string;
  /** density: scaled by the layout-density factor. text: scaled by text-size setting. */
  scale?: 'density' | 'text';
}

export type AppId = 'inventory' | 'email' | 'scheduling' | 'finance' | 'admin' | 'analytics';

/**
 * A theme document stores only overrides relative to the built-in registry.
 * Exports always emit the fully merged token set.
 */
export interface ThemeDoc {
  id: string;
  name: string;
  description?: string;
  updatedAt: number;
  density: Density;
  values: Record<string, TokenValue>;
  platforms: Partial<Record<Platform, Record<string, TokenValue>>>;
  apps: Partial<Record<AppId, Record<string, TokenValue>>>;
}

export interface ResolveOptions {
  appearance: Appearance;
  contrast?: Contrast;
  platform?: Platform;
  app?: AppId;
  density?: Density;
  textScale?: number;
  reducedMotion?: boolean;
}

export const isModal = (v: TokenValue): v is ModalValue => typeof v === 'object' && v !== null;
