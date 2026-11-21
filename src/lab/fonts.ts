import { useEffect, useState } from 'react';

/** First family name in a CSS font stack, without quotes. */
export const primaryFamily = (stack: string) => stack.split(',')[0].trim().replace(/^["']|["']$/g, '');

const GENERIC = new Set(['serif', 'sans-serif', 'monospace', 'system-ui', 'ui-monospace', 'ui-serif', 'ui-sans-serif', '-apple-system', 'BlinkMacSystemFont', 'cursive', 'fantasy']);

/**
 * Whether a font family is actually available in this browser (installed locally or loaded as a web font).
 * Compares rendered text widths against generic fallbacks, so it detects silent substitution.
 */
export async function isFontAvailable(family: string): Promise<boolean> {
  if (GENERIC.has(family)) return true;
  try {
    await document.fonts.load(`16px "${family}"`);
  } catch {
    /* ignore */
  }
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;
  const sample = 'mmmmmmmmmlliWWQ@#0123456789 Hollis & Grant';
  return ['monospace', 'serif', 'sans-serif'].some((base) => {
    ctx.font = `72px ${base}`;
    const w0 = ctx.measureText(sample).width;
    ctx.font = `72px "${family}", ${base}`;
    return Math.abs(ctx.measureText(sample).width - w0) > 0.5;
  });
}

/** For each family in a stack, whether it is available, and which one the browser is using. */
export function useFontStack(stack: string) {
  const [result, setResult] = useState<{ families: { name: string; available: boolean }[]; using: string | null } | null>(null);
  useEffect(() => {
    let alive = true;
    const names = stack.split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    Promise.all(names.map(async (n) => ({ name: n, available: await isFontAvailable(n) }))).then((families) => {
      if (!alive) return;
      const using = families.find((f) => f.available && !GENERIC.has(f.name))?.name ?? families.find((f) => f.available)?.name ?? null;
      setResult({ families, using });
    });
    return () => {
      alive = false;
    };
  }, [stack]);
  return result;
}
