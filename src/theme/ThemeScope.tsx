import { createContext, useContext, useLayoutEffect, useMemo, type CSSProperties, type ReactNode } from 'react';
import { useTheme, useView } from '../state/store';
import { cssVars, resolveAll } from '../tokens/resolve';
import type { AppId, Appearance, Contrast, Density, Platform, ResolveOptions, ThemeDoc } from '../tokens/types';

/**
 * Scope context: the theme and resolve options in effect for a subtree.
 * Charts and other JS-driven visuals read resolved values from here.
 */
export interface Scope {
  theme: ThemeDoc;
  opts: ResolveOptions;
}

const ScopeContext = createContext<Scope | null>(null);

/** The scope in effect at this point of the tree (falls back to the global working theme). */
export function useScope(): Scope {
  const ctx = useContext(ScopeContext);
  const theme = useTheme();
  const view = useView();
  return useMemo(
    () =>
      ctx ?? {
        theme,
        opts: {
          appearance: view.appearance,
          contrast: view.contrast,
          textScale: view.textScale,
          reducedMotion: view.reducedMotion,
        },
      },
    [ctx, theme, view],
  );
}

/** Resolved concrete values for every token in the current scope: `t['color.text.primary']`. */
export function useResolvedTokens(): Record<string, string> {
  const { theme, opts } = useScope();
  return useMemo(() => resolveAll(theme, opts), [theme, opts]);
}

export interface ThemeScopeProps {
  /** Override the theme for this subtree (side-by-side comparisons). */
  theme?: ThemeDoc;
  appearance?: Appearance;
  contrast?: Contrast;
  platform?: Platform;
  app?: AppId;
  density?: Density;
  textScale?: number;
  reducedMotion?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  /** Paint the scope with the app background + primary text color (default true). */
  surface?: boolean;
}

/**
 * Re-resolves the token set for a subtree and applies it as CSS custom properties.
 * Anything not specified is inherited from the enclosing scope.
 */
export function ThemeScope(props: ThemeScopeProps) {
  const parent = useScope();
  const theme = props.theme ?? parent.theme;
  const opts: ResolveOptions = useMemo(
    () => ({
      appearance: props.appearance ?? parent.opts.appearance,
      contrast: props.contrast ?? parent.opts.contrast,
      platform: props.platform ?? parent.opts.platform,
      app: props.app ?? parent.opts.app,
      density: props.density ?? parent.opts.density,
      textScale: props.textScale ?? parent.opts.textScale,
      reducedMotion: props.reducedMotion ?? parent.opts.reducedMotion,
    }),
    [
      props.appearance,
      props.contrast,
      props.platform,
      props.app,
      props.density,
      props.textScale,
      props.reducedMotion,
      parent.opts,
    ],
  );
  const vars = useMemo(() => cssVars(theme, opts), [theme, opts]);
  const scope = useMemo(() => ({ theme, opts }), [theme, opts]);
  return (
    <ScopeContext.Provider value={scope}>
      <div
        className={`m-scope${props.surface === false ? '' : ' m-scope--surface'}${props.className ? ' ' + props.className : ''}`}
        data-appearance={opts.appearance}
        data-contrast={opts.contrast ?? 'standard'}
        data-platform={opts.platform ?? 'web'}
        data-app={opts.app}
        data-reduced-motion={opts.reducedMotion ? 'true' : undefined}
        style={{ ...(vars as CSSProperties), colorScheme: opts.appearance, ...props.style }}
      >
        {props.children}
      </div>
    </ScopeContext.Provider>
  );
}

/** Applies the working theme to :root so the whole lab is driven by the tokens it edits. */
export function RootTheme() {
  const theme = useTheme();
  const view = useView();
  const css = useMemo(() => {
    const vars = cssVars(theme, {
      appearance: view.appearance,
      contrast: view.contrast,
      textScale: view.textScale,
      reducedMotion: view.reducedMotion,
    });
    return `:root{${Object.entries(vars)
      .map(([k, val]) => `${k}:${val}`)
      .join(';')};color-scheme:${view.appearance}}`;
  }, [theme, view.appearance, view.contrast, view.textScale, view.reducedMotion]);

  useLayoutEffect(() => {
    let el = document.getElementById('mercantile-root-theme') as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement('style');
      el.id = 'mercantile-root-theme';
      document.head.appendChild(el);
    }
    el.textContent = css;
    const root = document.documentElement;
    root.dataset.appearance = view.appearance;
    root.dataset.contrast = view.contrast;
    if (view.reducedMotion) root.dataset.reducedMotion = 'true';
    else delete root.dataset.reducedMotion;
  }, [css, view.appearance, view.contrast, view.reducedMotion]);

  return null;
}
