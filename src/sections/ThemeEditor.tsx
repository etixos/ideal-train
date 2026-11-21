import { ArrowRight, Columns2, Pencil, RotateCcw, Save, Sliders } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { CLASS_TOKENS } from '../shell/Inspector';
import { Page } from '../lab/Page';
import { PreviewBoard } from '../lab/PreviewBoard';
import { TokenField, TokenTable } from '../lab/TokenField';
import { actions, canRedo, canUndo, useLab, useTheme, useView } from '../state/store';
import { ThemeScope, useResolvedTokens } from '../theme/ThemeScope';
import { DEFAULT_THEME, PRESETS } from '../tokens/presets';
import { MODES, MODE_IDS, TOKENS, TOKEN_MAP } from '../tokens/registry';
import { allDependentsOf, dependentsOf, flattenMode, mergedValues, refChain, valuesEqual } from '../tokens/resolve';
import type { Category, Density, Layer, ModeId, ThemeDoc } from '../tokens/types';
import { Badge, Button, Card, Checkbox, EmptyState, SearchField, SegmentedControl, Select, Tabs, TextInput, useToast } from '../ui';

const CATEGORIES: { value: Category | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'color', label: 'Color' },
  { value: 'typography', label: 'Type' },
  { value: 'shape', label: 'Shape' },
  { value: 'spacing', label: 'Spacing' },
  { value: 'elevation', label: 'Elevation' },
  { value: 'icon', label: 'Icons' },
  { value: 'motion', label: 'Motion' },
  { value: 'chart', label: 'Charts' },
  { value: 'component', label: 'Components' },
];

const COMPONENT_OF: Record<string, string> = {
  'm-btn': 'Buttons', 'm-input': 'Text fields', 'm-check': 'Checkboxes & radios', 'm-switch': 'Switches', 'm-slider': 'Sliders', 'm-card': 'Cards', 'm-dialog': 'Dialogs', 'm-sheet': 'Sheets', 'm-menu': 'Menus', 'm-popover': 'Popovers', 'm-tooltip': 'Tooltips', 'm-table': 'Tables', 'm-sidebar': 'Sidebars', 'm-nav-item': 'Navigation items', 'm-toolbar': 'Toolbars', 'm-tab': 'Tabs', 'm-badge': 'Badges', 'm-tag': 'Tags', 'm-alert': 'Alerts', 'm-toast': 'Notifications', 'm-progress': 'Progress', 'm-skeleton': 'Skeletons', 'm-icon': 'Icons', 'm-spinner': 'Spinners', 'report-page': 'Report pages', 'report-table': 'Report tables',
};

/** Components whose CSS consumes `id` directly or through any dependent token. */
function usedByComponents(theme: ThemeDoc, id: string): string[] {
  const all = new Set([id, ...allDependentsOf(theme, id)]);
  const out = new Set<string>();
  for (const [cls, ids] of Object.entries(CLASS_TOKENS)) if (ids.some((t) => all.has(t))) out.add(COMPONENT_OF[cls.replace(/--.*/, '')] ?? cls);
  if ([...all].some((t) => t.startsWith('color.chart') || t.startsWith('chart.'))) out.add('Charts');
  if ([...all].some((t) => t.startsWith('text.'))) out.add('Text styles');
  return [...out].sort();
}

function TokenDetail({ id, onSelect }: { id: string; onSelect: (id: string) => void }) {
  const theme = useTheme();
  const view = useView();
  const t = useResolvedTokens();
  const def = TOKEN_MAP.get(id)!;
  const chain = refChain(theme, id, { appearance: view.appearance, contrast: view.contrast, mode: view.mode });
  const direct = dependentsOf(theme, id);
  const all = allDependentsOf(theme, id);
  const comps = usedByComponents(theme, id);
  return (
    <Card title={<span className="t-code" style={{ fontSize: 'var(--text-body-size)' }}>{id}</span>} subtitle={def.group} actions={<Badge>{def.layer}</Badge>}>
      <div className="stack stack--md">
        {def.description && <p className="t-footnote c-secondary">{def.description}</p>}
        <TokenField id={id} />
        <div className="kv">
          <span>Type</span>
          <span>{def.type}</span>
          <span>Resolved now</span>
          <span className="t-code row row--tight">
            {def.type === 'color' && <span className="token-chip__swatch" style={{ background: t[id] }} />}
            {t[id]}
          </span>
          {def.scale && (
            <>
              <span>Scales with</span>
              <span>{def.scale === 'density' ? 'Layout density' : 'Text size'}</span>
            </>
          )}
        </div>
        {chain.length > 1 && (
          <div className="stack stack--xs">
            <span className="t-subhead">References</span>
            <div className="row row--wrap row--tight">
              {chain.map((c, i) => (
                <span key={c} className="row row--tight">
                  {i > 0 && <ArrowRight className="m-icon m-icon--sm c-tertiary" aria-hidden />}
                  <button type="button" className="token-chip t-code" onClick={() => onSelect(c)}>
                    {c}
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="stack stack--xs">
          <span className="t-subhead">
            Used by {direct.length} token{direct.length === 1 ? '' : 's'} directly, {all.length} in total
          </span>
          <div className="row row--wrap row--tight" style={{ maxHeight: 120, overflow: 'auto' }}>
            {direct.slice(0, 40).map((d) => (
              <button key={d} type="button" className="token-chip t-code" onClick={() => onSelect(d)}>
                {d}
              </button>
            ))}
            {direct.length === 0 && <span className="t-footnote c-tertiary">Nothing references this token.</span>}
          </div>
        </div>
        {comps.length > 0 && (
          <div className="stack stack--xs">
            <span className="t-subhead">Affects</span>
            <div className="row row--wrap row--tight">
              {comps.map((c) => (
                <Badge key={c}>{c}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function Browser({ selected, onSelect }: { selected: string | null; onSelect: (id: string) => void }) {
  const theme = useTheme();
  const view = useView();
  const focus = useLab((s) => s.focusToken);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<Category | 'all'>('color');
  const [layer, setLayer] = useState<Layer | 'all'>('all');
  const [modifiedOnly, setModifiedOnly] = useState(false);

  useEffect(() => {
    if (!focus) return;
    const d = TOKEN_MAP.get(focus);
    if (d) {
      setQ('');
      setCat(d.category);
      setLayer('all');
      setModifiedOnly(false);
      onSelect(focus);
      window.setTimeout(() => {
        const el = document.querySelector(`[data-token-row="${CSS.escape(focus)}"]`);
        el?.scrollIntoView({ block: 'center' });
        el?.classList.add('is-flash');
        window.setTimeout(() => el?.classList.remove('is-flash'), 1300);
      }, 60);
    }
    actions.focusToken(null);
  }, [focus, onSelect]);

  const ids = useMemo(() => {
    const lq = q.trim().toLowerCase();
    return TOKENS.filter(
      (d) =>
        (cat === 'all' || d.category === cat) &&
        (layer === 'all' || d.layer === layer) &&
        (!modifiedOnly || theme.values[d.id] !== undefined || theme.modes[view.mode]?.values[d.id] !== undefined) &&
        (!lq || d.id.toLowerCase().includes(lq) || d.description?.toLowerCase().includes(lq) || d.group.toLowerCase().includes(lq)),
    ).map((d) => d.id);
  }, [q, cat, layer, modifiedOnly, theme.values, theme.modes, view.mode]);
  const shown = ids.slice(0, 300);
  return (
    <div className="stack stack--md" style={{ minWidth: 0 }}>
      <div className="row row--wrap">
        <SearchField value={q} onChange={setQ} placeholder="Search tokens by name, role or description" style={{ flex: '1 1 260px' }} />
        <Select aria-label="Layer" value={layer} onChange={(v) => setLayer(v as Layer | 'all')} options={[{ value: 'all', label: 'All layers' }, { value: 'foundation', label: 'Foundation' }, { value: 'semantic', label: 'Semantic' }, { value: 'component', label: 'Component' }]} />
        <Checkbox label="Modified only" checked={modifiedOnly} onChange={setModifiedOnly} />
      </div>
      <Tabs value={cat} onChange={setCat} tabs={CATEGORIES.map((c) => ({ value: c.value, label: c.label }))} aria-label="Category" />
      <div className="t-footnote c-secondary">
        {ids.length} tokens{ids.length > shown.length ? `, showing the first ${shown.length}. Refine the search to see more.` : ''}
      </div>
      {shown.length ? <TokenTable ids={shown} onSelect={onSelect} selectedId={selected} grouped /> : <EmptyState title="No tokens match">Try another search, layer, or category.</EmptyState>}
    </div>
  );
}

function diff(a: ThemeDoc, b: ThemeDoc) {
  const ma = mergedValues(a);
  const mb = mergedValues(b);
  return TOKENS.filter((d) => !valuesEqual(ma[d.id], mb[d.id])).map((d) => ({ id: d.id, a: ma[d.id], b: mb[d.id] }));
}

function Compare() {
  const theme = useTheme();
  const view = useView();
  const saved = useLab((s) => s.saved);
  const otherModes = MODE_IDS.filter((m) => m !== view.mode);
  const options = [...otherModes.map((m) => ({ value: `mode:${m}`, label: `${MODES[m].label} mode` })), { value: 'defaults', label: 'Mercantile defaults' }, ...PRESETS.slice(1).map((p) => ({ value: `preset:${p.id}`, label: `Preset: ${p.name}` })), ...saved.map((s) => ({ value: `saved:${s.id}`, label: `Saved: ${s.name}` }))];
  const [otherSel, setOther] = useState(options[0].value);
  const other = options.some((o) => o.value === otherSel) ? otherSel : options[0].value;
  const [appearance, setAppearance] = useState<'light' | 'dark'>('light');
  const isMode = other.startsWith('mode:');
  const source = other === 'defaults' ? DEFAULT_THEME : other.startsWith('preset:') ? PRESETS.find((p) => `preset:${p.id}` === other)! : saved.find((s) => `saved:${s.id}` === other) ?? DEFAULT_THEME;
  const left = useMemo(() => flattenMode(theme, view.mode), [theme, view.mode]);
  // Modes compare within the working theme; presets and saved themes are shown in the active mode.
  const b = useMemo(() => (isMode ? flattenMode(theme, other.slice(5) as ModeId) : flattenMode(source, view.mode)), [isMode, theme, other, source, view.mode]);
  const d = useMemo(() => diff(left, b), [left, b]);
  const fmt = (v: unknown) => (typeof v === 'string' ? v : JSON.stringify(v));
  return (
    <div className="stack stack--md">
      <div className="row row--wrap">
        <span className="t-subhead">Compare working theme with</span>
        <Select aria-label="Comparison theme" value={other} onChange={setOther} options={options} />
        <SegmentedControl size="sm" value={appearance} onChange={setAppearance} options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} aria-label="Appearance" />
        <div className="spacer" />
        {!isMode && (
          <Button size="sm" onClick={() => actions.applyTheme(source, { keepModes: true })}>
            Use {source.name}
          </Button>
        )}
      </div>
      <div className="grid grid--2">
        {[
          [left, `${left.name} (working)`],
          [b, b.name],
        ].map(([th, label]) => (
          <div key={label as string} className="stack stack--xs">
            <span className="t-headline">{label as string}</span>
            <ThemeScope theme={th as ThemeDoc} mode={null} appearance={appearance} density={(th as ThemeDoc).density} surface={false}>
              <PreviewBoard />
            </ThemeScope>
          </div>
        ))}
      </div>
      <Card title={`${d.length} differing tokens`} flush>
        <div style={{ maxHeight: 360, overflow: 'auto' }}>
          <table className="m-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>{MODES[view.mode].label} (working)</th>
                <th>{b.name}</th>
              </tr>
            </thead>
            <tbody>
              {d.map((x) => (
                <tr key={x.id}>
                  <td className="t-code">{x.id}</td>
                  <td className="t-code is-wrap">{fmt(x.a)}</td>
                  <td className="t-code is-wrap">{fmt(x.b)}</td>
                </tr>
              ))}
              {d.length === 0 && (
                <tr>
                  <td colSpan={3} className="m-table__empty">
                    The themes are identical.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Presets() {
  const theme = useTheme();
  const saved = useLab((s) => s.saved);
  const toast = useToast();
  return (
    <div className="stack stack--lg">
      <div className="grid grid--2">
        {PRESETS.map((p) => (
          <Card key={p.id} title={p.name} subtitle={p.description} footer={<><Badge>{Object.keys(p.values).length} overrides · {p.density}</Badge><div className="spacer" /><Button size="sm" variant="primary" onClick={() => { actions.applyTheme(p, { keepModes: true }); toast({ title: `Applied ${p.name}`, text: 'Undo restores your previous theme.' }); }}>Apply</Button></>}>
            <ThemeScope theme={p} density={p.density} surface={false}>
              <div style={{ zoom: 0.7 } as React.CSSProperties}>
                <PreviewBoard compact />
              </div>
            </ThemeScope>
          </Card>
        ))}
      </div>
      {saved.length > 0 && (
        <Card title="Saved configurations" flush>
          <table className="m-table">
            <tbody>
              {saved.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td className="c-secondary">{new Date(s.updatedAt).toLocaleString()}</td>
                  <td className="is-num">
                    <Button size="sm" onClick={() => actions.applyTheme(s)} disabled={JSON.stringify(s.values) === JSON.stringify(theme.values) && s.density === theme.density}>
                      Apply
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

export function ThemeEditor() {
  const theme = useTheme();
  const view = useView();
  const undoable = useLab(canUndo);
  const redoable = useLab(canRedo);
  const pastLen = useLab((s) => s.past.length);
  const toast = useToast();
  const [tab, setTab] = useState<'edit' | 'compare' | 'presets'>('edit');
  const [selected, setSelected] = useState<string | null>('color.accent.default');
  const [name, setName] = useState(theme.name);
  useEffect(() => setName(theme.name), [theme.name]);
  const modified = Object.keys(theme.values).length;
  return (
    <Page
      wide
      eyebrow="System"
      title="Theme Editor"
      description="Every design token in one place. Edits apply immediately across the lab, the component library, charts, reports, all four platforms and all six applications. Select a token to see what it references, what references it, and which components it affects."
      actions={
        <>
          <Button icon={RotateCcw} disabled={!undoable} onClick={actions.undo}>
            Undo
          </Button>
          <Button disabled={!redoable} onClick={actions.redo}>
            Redo
          </Button>
          <Button
            icon={Save}
            variant="primary"
            onClick={() => {
              const s = actions.saveSnapshot(theme.name);
              toast({ tone: 'success', title: 'Configuration saved', text: s.name });
            }}
          >
            Save configuration
          </Button>
        </>
      }
    >
      <div className="row row--wrap">
        <TextInput aria-label="Theme name" value={name} onChange={setName} onBlur={() => name.trim() && name !== theme.name && actions.renameTheme(name.trim())} icon={Pencil} style={{ width: 240 }} />
        <Select
          aria-label="Apply preset"
          value=""
          onChange={(id) => {
            const p = PRESETS.find((x) => x.id === id);
            if (p) actions.applyTheme(p, { keepModes: true });
          }}
          options={[{ value: '', label: 'Start from preset…' }, ...PRESETS.map((p) => ({ value: p.id, label: p.name }))]}
        />
        <SegmentedControl<Density> size="sm" value={theme.density} onChange={actions.setDensity} options={[{ value: 'compact', label: 'Compact' }, { value: 'regular', label: 'Regular' }, { value: 'comfortable', label: 'Comfortable' }]} aria-label="Density" />
        <Badge tone={modified ? 'highlight' : 'neutral'} dot>
          {modified} shared changes
        </Badge>
        <Badge tone="highlight">
          {Object.keys(theme.modes[view.mode]?.values ?? {}).length} {MODES[view.mode].label} overrides
        </Badge>
        <span className="t-footnote c-secondary">Edits apply to {view.editScope === 'mode' ? `${MODES[view.mode].label} only` : 'both modes'} (change in the top bar)</span>
        <span className="t-footnote c-tertiary">{pastLen} undo steps</span>
        <div className="spacer" />
        <Button
          variant="ghost"
          icon={RotateCcw}
          disabled={!modified && theme.density === 'regular'}
          onClick={() => {
            actions.resetAll();
            toast({ title: 'Reset to Mercantile defaults', text: 'Undo to restore.' });
          }}
        >
          Reset all
        </Button>
      </div>
      <Tabs value={tab} onChange={setTab} tabs={[{ value: 'edit', label: 'Edit tokens', icon: Sliders }, { value: 'compare', label: 'Side-by-side', icon: Columns2 }, { value: 'presets', label: 'Presets & saved' }]} />
      {tab === 'edit' && (
        <div className="lab-workbench" style={{ gridTemplateColumns: 'minmax(0, 1fr) 420px' }}>
          <Browser selected={selected} onSelect={setSelected} />
          <aside className="lab-workbench__editor stack stack--md" style={{ padding: 0, border: 0, background: 'transparent' }}>
            {selected && <TokenDetail id={selected} onSelect={setSelected} />}
            <div className="t-overline c-secondary">Live preview</div>
            <PreviewBoard />
          </aside>
        </div>
      )}
      {tab === 'compare' && <Compare />}
      {tab === 'presets' && <Presets />}
    </Page>
  );
}
