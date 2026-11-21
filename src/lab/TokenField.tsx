import { Link2, RotateCcw, SunMoon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { actions, useTheme, useView } from '../state/store';
import { useScope } from '../theme/ThemeScope';
import { formatColor, parseColor, toHex } from '../tokens/color';
import { APPS, MODES, PLATFORM_DEFAULTS, TOKENS, TOKEN_MAP, groupTokens } from '../tokens/registry';
import { allDependentsOf, isPureRef, rawValue, resolveString, valuesEqual } from '../tokens/resolve';
import type { AppId, Appearance, Layer, ModeId, Platform, ThemeDoc, TokenType, TokenValue } from '../tokens/types';
import { isModal } from '../tokens/types';
import { Icon, cx } from '../ui';
import { navigate } from '../shell/router';

/** Open a token in the Theme Editor. */
export function editToken(id: string) {
  actions.focusToken(id);
  navigate('editor');
}

/** Where an edit is written: the base theme, a platform override, or an app override. */
export interface EditTarget {
  platform?: Platform;
  app?: AppId;
}

const LAYER_RANK: Record<Layer, number> = { foundation: 0, semantic: 1, component: 2 };

function candidates(theme: ThemeDoc, id: string, type: TokenType) {
  const self = TOKEN_MAP.get(id);
  if (!self) return [];
  const blocked = new Set([id, ...allDependentsOf(theme, id)]);
  return TOKENS.filter((d) => d.type === type && LAYER_RANK[d.layer] <= LAYER_RANK[self.layer] && !blocked.has(d.id));
}

function rangeFor(id: string, type: TokenType, unit: string): [min: number, max: number, step: number] {
  if (type === 'fontWeight') return [100, 900, 100];
  if (unit === 'ms') return [0, 1200, 10];
  if (unit === 'em') return [-0.05, 0.2, 0.005];
  if (unit === 'pt') return [0.25, 40, 0.25];
  if (unit === 'in') return [0, 2, 0.05];
  if (unit === '') {
    if (id.includes('leading')) return [1, 2, 0.05];
    if (id.includes('opacity')) return [0, 1, 0.05];
    if (id.includes('stroke')) return [0.75, 3, 0.05];
    if (id.includes('columns')) return [1, 24, 1];
    return [0, 10, 0.1];
  }
  if (id.startsWith('radius') || id.endsWith('.radius')) return [0, 32, 1];
  if (id.includes('border') || id.includes('ring') || id.includes('.width') && id.startsWith('chart')) return [0, 6, 0.5];
  if (id.startsWith('font.size') || id.endsWith('.size') && (id.startsWith('text') || id.includes('font'))) return [8, 72, 1];
  if (id.startsWith('layout')) return [160, 1600, 4];
  if (id.startsWith('icon') || id.includes('check')) return [8, 48, 1];
  if (id.startsWith('size') || id.includes('height')) return [12, 80, 1];
  return [0, 96, 1];
}

const EASINGS = ['cubic-bezier(0.2, 0, 0, 1)', 'cubic-bezier(0, 0, 0.2, 1)', 'cubic-bezier(0.4, 0, 1, 1)', 'cubic-bezier(0.3, 0, 0, 1.15)', 'cubic-bezier(0.4, 0, 0.2, 1)', 'ease', 'ease-in-out', 'linear'];

function RawInput({ value, onCommit, label }: { value: string; onCommit: (v: string) => void; label: string }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const commit = () => {
    const t = draft.trim();
    if (t && t !== value) onCommit(t);
    else setDraft(value);
  };
  return (
    <input
      className="tf-raw t-code"
      value={draft}
      aria-label={label}
      spellCheck={false}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        if (e.key === 'Escape') setDraft(value);
      }}
    />
  );
}

function RefSelect({ id, type, current, resolved, onChange }: { id: string; type: TokenType; current: string; resolved: string; onChange: (v: string) => void }) {
  const theme = useTheme();
  const [armed, setArmed] = useState(false);
  const curRef = isPureRef(current) ? current.trim().slice(1, -1) : '';
  const groups = useMemo(() => (armed ? groupTokens(candidates(theme, id, type)) : []), [armed, theme, id, type]);
  return (
    <span className={cx('tf-ref', curRef && 'is-linked')} title={curRef ? `Linked to ${curRef}` : 'Link to another token'}>
      <Icon icon={Link2} size="sm" />
      <select
        aria-label={`Link ${id} to another token`}
        value={curRef}
        onFocus={() => setArmed(true)}
        onMouseDown={() => setArmed(true)}
        onChange={(e) => onChange(e.target.value ? `{${e.target.value}}` : resolved)}
      >
        <option value="">{curRef ? 'Unlink (use literal value)' : 'Not linked'}</option>
        {!armed && curRef && <option value={curRef}>{curRef}</option>}
        {groups.map(([g, list]) => (
          <optgroup key={g} label={g}>
            {list.map((d) => (
              <option key={d.id} value={d.id}>
                {d.id}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </span>
  );
}

interface ValueEditorProps {
  id: string;
  type: TokenType;
  value: string;
  appearance: Appearance;
  target?: EditTarget;
  modeLabel?: string;
  onChange: (v: string) => void;
}

function ValueEditor({ id, type, value, appearance, target, modeLabel, onChange }: ValueEditorProps) {
  const theme = useTheme();
  const view = useView();
  const resolved = useMemo(
    () => resolveString(theme, value, { appearance, contrast: view.contrast, platform: target?.platform, app: target?.app, mode: view.mode }),
    [theme, value, appearance, view.contrast, view.mode, target?.platform, target?.app],
  );
  const label = `${id}${modeLabel ? ` (${modeLabel})` : ''}`;
  let control: React.ReactNode = null;

  if (type === 'color') {
    const c = parseColor(resolved);
    control = (
      <label className="tf-swatch" style={{ background: resolved }} title={`${resolved} — click to pick`}>
        <input
          type="color"
          aria-label={`${label} color`}
          value={c ? toHex(c) : '#000000'}
          onChange={(e) => {
            const picked = parseColor(e.target.value)!;
            onChange(formatColor({ ...picked, a: c?.a ?? 1 }));
          }}
        />
      </label>
    );
  } else if (type === 'fontFamily') {
    control = (
      <span className="tf-sample" style={{ fontFamily: resolved }} aria-hidden>
        Ag
      </span>
    );
  } else if (type === 'easing') {
    control = (
      <select className="tf-select" aria-label={`${label} preset`} value={EASINGS.includes(resolved) ? resolved : ''} onChange={(e) => e.target.value && onChange(e.target.value)}>
        <option value="">Custom</option>
        {EASINGS.map((e) => (
          <option key={e} value={e}>
            {e}
          </option>
        ))}
      </select>
    );
  } else if (type !== 'shadow' && type !== 'string') {
    const m = /^(-?\d*\.?\d+)([a-z%]*)$/i.exec(resolved.trim());
    if (m) {
      const num = parseFloat(m[1]);
      const unit = m[2];
      const [min, max0, step] = rangeFor(id, type, unit);
      const max = Math.max(max0, num);
      const set = (nv: number) => {
        if (Number.isFinite(nv)) onChange(`${+nv.toFixed(4)}${unit}`);
      };
      control = (
        <span className="tf-num">
          <input type="range" aria-label={`${label} slider`} min={Math.min(min, num)} max={max} step={step} value={num} onChange={(e) => set(parseFloat(e.target.value))} />
          <input type="number" className="t-num" aria-label={`${label} value`} min={Math.min(min, num)} step={step} value={num} onChange={(e) => set(parseFloat(e.target.value))} />
          <span className="tf-unit">{unit}</span>
        </span>
      );
    }
  }

  const showRef = type !== 'shadow' && type !== 'string';
  return (
    <div className="tf-value" data-current={view.appearance === appearance || !modeLabel ? 'true' : undefined}>
      {modeLabel && <span className="tf-mode">{modeLabel}</span>}
      {control}
      <RawInput value={value} onCommit={onChange} label={`${label} raw value`} />
      {showRef && <RefSelect id={id} type={type} current={value} resolved={resolved} onChange={onChange} />}
    </div>
  );
}

function write(id: string, value: TokenValue | undefined, target?: EditTarget) {
  if (target?.app) actions.setAppToken(target.app, id, value);
  else if (target?.platform && target.platform !== 'web') actions.setPlatformToken(target.platform, id, value);
  else actions.setToken(id, value);
}

/** True when the token differs from its default in the given edit target (and, for the base theme, the current edit scope). */
export function isModified(theme: ThemeDoc, id: string, target?: EditTarget, scope?: { mode: ModeId; editScope: 'shared' | 'mode' }): boolean {
  if (target?.app) return theme.apps[target.app]?.[id] !== undefined;
  if (target?.platform && target.platform !== 'web') return theme.platforms[target.platform]?.[id] !== undefined;
  if (scope?.editScope === 'mode') return theme.modes[scope.mode]?.values[id] !== undefined;
  return theme.values[id] !== undefined;
}

export interface TokenFieldProps {
  id: string;
  /** Edit a platform or app override instead of the base theme. Defaults to the enclosing scope's base theme. */
  target?: EditTarget;
}

/** The editing control for one token: picker / slider, raw value, and token linking, per appearance. */
export function TokenField({ id, target }: TokenFieldProps) {
  const theme = useTheme();
  const view = useView();
  const def = TOKEN_MAP.get(id);
  if (!def) return <span className="c-danger t-code">Unknown token: {id}</span>;
  const value = rawValue(theme, id, { ...target, mode: view.mode }) ?? def.value;
  const canSplit = def.type === 'color' || def.type === 'shadow';

  if (isModal(value)) {
    const same = value.light === value.dark && !value.hcLight && !value.hcDark;
    return (
      <div className="tf">
        <div className="tf-modes">
          <ValueEditor id={id} type={def.type} value={value.light} appearance="light" target={target} modeLabel="Light" onChange={(nv) => write(id, { ...value, light: nv }, target)} />
          <ValueEditor id={id} type={def.type} value={value.dark} appearance="dark" target={target} modeLabel="Dark" onChange={(nv) => write(id, { ...value, dark: nv }, target)} />
        </div>
        {same && (
          <button type="button" className="tf-icon-btn" title="Use one value for light and dark" aria-label="Merge light and dark" onClick={() => write(id, value.light, target)}>
            <Icon icon={SunMoon} size="sm" />
          </button>
        )}
      </div>
    );
  }
  return (
    <div className="tf">
      <ValueEditor id={id} type={def.type} value={value} appearance={view.appearance} target={target} onChange={(nv) => write(id, nv, target)} />
      {canSplit && (
        <button type="button" className="tf-icon-btn" title="Set separate light and dark values" aria-label="Split into light and dark values" onClick={() => write(id, { light: value, dark: value }, target)}>
          <Icon icon={SunMoon} size="sm" />
        </button>
      )}
    </div>
  );
}

export interface TokenRowProps extends TokenFieldProps {
  /** Stack the label above the editor (narrow panels). */
  stacked?: boolean;
  onSelect?: (id: string) => void;
  selected?: boolean;
  hideDescription?: boolean;
}

/** A labelled token editor row with modified indicator and reset. */
export function TokenRow({ id, target, stacked, onSelect, selected, hideDescription }: TokenRowProps) {
  const theme = useTheme();
  const view = useView();
  const def = TOKEN_MAP.get(id);
  if (!def) return null;
  const modified = isModified(theme, id, target, view);
  const baseTarget = !target?.app && !(target?.platform && target.platform !== 'web');
  const modeOverride = baseTarget && theme.modes[view.mode]?.values[id] !== undefined;
  const modeLabel = MODES[view.mode].label;
  const hasDefaultOverride = target?.app ? APPS[target.app].overrides[id] !== undefined : target?.platform ? PLATFORM_DEFAULTS[target.platform][id] !== undefined : false;
  return (
    <div className={cx('token-row', stacked && 'token-row--stacked', selected && 'is-selected')} data-token-row={id}>
      <div className="token-row__meta">
        <div className="token-row__name">
          {modified && <span className="token-row__dot" title="Modified from default" aria-label="Modified" />}
          {onSelect ? (
            <button type="button" className="token-row__id t-code" onClick={() => onSelect(id)} title="Show details and usage">
              {id}
            </button>
          ) : (
            <span className="token-row__id t-code">{id}</span>
          )}
          {hasDefaultOverride && !modified && <span className="token-row__tag">default override</span>}
          {modeOverride && (
            <span className="token-row__tag token-row__tag--mode" title={view.editScope === 'shared' ? `${modeLabel} overrides this token, so edits to the shared value won't show in ${modeLabel}. Switch "Edits apply to" to ${modeLabel} only to change it.` : `This value applies to ${modeLabel} only.`}>
              {modeLabel} only
            </span>
          )}
        </div>
        {!hideDescription && def.description && <div className="token-row__desc">{def.description}</div>}
      </div>
      <TokenField id={id} target={target} />
      <button type="button" className="tf-icon-btn" disabled={!modified} title={baseTarget && view.editScope === 'mode' ? `Remove the ${modeLabel} override (use the shared value)` : 'Reset to default'} aria-label={`Reset ${id}`} onClick={() => write(id, undefined, target)} style={{ visibility: modified ? 'visible' : 'hidden' }}>
        <Icon icon={RotateCcw} size="sm" />
      </button>
    </div>
  );
}

export interface TokenTableProps {
  /** Explicit token ids, or… */
  ids?: string[];
  /** …every token whose id starts with this prefix (or any of these prefixes). */
  prefix?: string | string[];
  target?: EditTarget;
  stacked?: boolean;
  /** Show group headings (default true when more than one group). */
  grouped?: boolean;
  onSelect?: (id: string) => void;
  selectedId?: string | null;
  hideDescription?: boolean;
}

/** A list of token editor rows. The standard way for any page to expose tokens for editing. */
export function TokenTable({ ids, prefix, target, stacked, grouped, onSelect, selectedId, hideDescription }: TokenTableProps) {
  const defs = useMemo(() => {
    if (ids) return ids.map((i) => TOKEN_MAP.get(i)).filter((d): d is NonNullable<typeof d> => !!d);
    const ps = Array.isArray(prefix) ? prefix : prefix ? [prefix] : [];
    return TOKENS.filter((d) => ps.some((p) => d.id === p || d.id.startsWith(p + '.')));
  }, [ids, prefix]);
  const groups = groupTokens(defs);
  const showGroups = grouped ?? groups.length > 1;
  return (
    <div className="token-table">
      {groups.map(([g, list]) => (
        <div key={g} className="token-table__group">
          {showGroups && <div className="token-table__heading">{g}</div>}
          {list.map((d) => (
            <TokenRow key={d.id} id={d.id} target={target} stacked={stacked} onSelect={onSelect} selected={selectedId === d.id} hideDescription={hideDescription} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Small read-only chip showing a token id with its resolved value in the current scope. */
export function TokenChip({ id }: { id: string }) {
  const { theme, opts } = useScope();
  const def = TOKEN_MAP.get(id);
  const resolved = useMemo(() => (def ? resolveString(theme, `{${id}}`, opts) : ''), [theme, opts, id, def]);
  return (
    <button type="button" className="token-chip t-code" title={`${resolved} — click to edit`} onClick={() => editToken(id)}>
      {def?.type === 'color' && <span className="token-chip__swatch" style={{ background: resolved }} />}
      {id}
    </button>
  );
}

export { valuesEqual };
