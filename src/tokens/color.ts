/** Color math: parsing, WCAG contrast, mixing, color-vision simulation. */

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

export function parseColor(input: string): RGBA | null {
  const s = input.trim();
  let m = /^#([0-9a-f]{3,8})$/i.exec(s);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
    if (h.length !== 6 && h.length !== 8) return null;
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
    };
  }
  m = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+%?))?\s*\)$/i.exec(s);
  if (m) {
    const a = m[4] === undefined ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
    return { r: +m[1], g: +m[2], b: +m[3], a };
  }
  return null;
}

const h2 = (x: number) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0');

export function toHex(c: RGBA, withAlpha = false): string {
  const base = `#${h2(c.r)}${h2(c.g)}${h2(c.b)}`.toUpperCase();
  return withAlpha && c.a < 1 ? base + h2(c.a * 255).toUpperCase() : base;
}

/** Serialises to #RRGGBB when opaque, otherwise rgba(). */
export function formatColor(c: RGBA): string {
  if (c.a >= 1) return toHex(c);
  return `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${+c.a.toFixed(3)})`;
}

export function composite(fg: RGBA, bg: RGBA): RGBA {
  const a = fg.a;
  return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a), a: 1 };
}

const lin = (v: number) => {
  const x = v / 255;
  return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
};

export function luminance(c: RGBA): number {
  return 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
}

/** WCAG 2.x contrast ratio. Translucent foregrounds are composited on the background first. */
export function contrastRatio(fg: string, bg: string, behind = '#FFFFFF'): number | null {
  const f = parseColor(fg);
  let b = parseColor(bg);
  if (!f || !b) return null;
  if (b.a < 1) b = composite(b, parseColor(behind) ?? { r: 255, g: 255, b: 255, a: 1 });
  const fc = f.a < 1 ? composite(f, b) : f;
  const l1 = luminance(fc);
  const l2 = luminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

export type WcagLevel = 'AAA' | 'AA' | 'AA Large' | 'Fail';

/** Grade a ratio for text. `large` = ≥ 18.66px bold or ≥ 24px regular. */
export function wcagLevel(ratio: number, large = false): WcagLevel {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return large ? 'AA' : 'AA Large';
  return 'Fail';
}

export function mix(a: string, b: string, t: number): string {
  const ca = parseColor(a);
  const cb = parseColor(b);
  if (!ca || !cb) return a;
  return formatColor({
    r: ca.r + (cb.r - ca.r) * t,
    g: ca.g + (cb.g - ca.g) * t,
    b: ca.b + (cb.b - ca.b) * t,
    a: ca.a + (cb.a - ca.a) * t,
  });
}

export function rgbToHsl(c: RGBA): { h: number; s: number; l: number } {
  const r = c.r / 255;
  const g = c.g / 255;
  const b = c.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: s * 100, l: l * 100 };
}

export function hslToRgb(h: number, s: number, l: number, a = 1): RGBA {
  s /= 100;
  l /= 100;
  const k = (nn: number) => (nn + h / 30) % 12;
  const f = (nn: number) => l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k(nn) - 3, Math.min(9 - k(nn), 1)));
  return { r: f(0) * 255, g: f(8) * 255, b: f(4) * 255, a };
}

export type CvdType = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

/** 3×3 simulation matrices (Viénot / Brettel approximations, sRGB space). */
export const CVD_MATRICES: Record<Exclude<CvdType, 'none'>, number[]> = {
  protanopia: [0.567, 0.433, 0, 0.558, 0.442, 0, 0, 0.242, 0.758],
  deuteranopia: [0.625, 0.375, 0, 0.7, 0.3, 0, 0, 0.3, 0.7],
  tritanopia: [0.95, 0.05, 0, 0, 0.433, 0.567, 0, 0.475, 0.525],
  achromatopsia: [0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114],
};

export const CVD_LABELS: Record<CvdType, string> = {
  none: 'Typical vision',
  protanopia: 'Protanopia (no red cones)',
  deuteranopia: 'Deuteranopia (no green cones)',
  tritanopia: 'Tritanopia (no blue cones)',
  achromatopsia: 'Achromatopsia (no color)',
};

export function simulateCvd(color: string, type: CvdType): string {
  if (type === 'none') return color;
  const c = parseColor(color);
  if (!c) return color;
  const m = CVD_MATRICES[type];
  return formatColor({
    r: m[0] * c.r + m[1] * c.g + m[2] * c.b,
    g: m[3] * c.r + m[4] * c.g + m[5] * c.b,
    b: m[6] * c.r + m[7] * c.g + m[8] * c.b,
    a: c.a,
  });
}
