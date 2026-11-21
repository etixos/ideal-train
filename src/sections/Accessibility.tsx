import { AlertTriangle, CheckCircle2, Eye, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Demo, Page, Section } from '../lab/Page';
import { TokenField } from '../lab/TokenField';
import { actions, useTheme, useView } from '../state/store';
import { ThemeScope } from '../theme/ThemeScope';
import { CVD_LABELS, contrastRatio, simulateCvd, type CvdType } from '../tokens/color';
import { resolveAll } from '../tokens/resolve';
import type { Appearance, Contrast } from '../tokens/types';
import { Badge, Button, Card, Checkbox, Icon, IconButton, SegmentedControl, Select, Slider, Switch, TextInput } from '../ui';

interface Pair {
  fg: string;
  bg: string;
  label: string;
  /** Minimum ratio: 4.5 body text, 3 large text / UI components. */
  min: number;
}

export const AUDIT_PAIRS: Pair[] = [
  { fg: 'color.text.primary', bg: 'color.bg.app', label: 'Body text on app background', min: 4.5 },
  { fg: 'color.text.primary', bg: 'color.surface.default', label: 'Body text on surface', min: 4.5 },
  { fg: 'color.text.secondary', bg: 'color.surface.default', label: 'Secondary text on surface', min: 4.5 },
  { fg: 'color.text.secondary', bg: 'color.bg.app', label: 'Secondary text on app background', min: 4.5 },
  { fg: 'color.text.secondary', bg: 'color.surface.sidebar', label: 'Sidebar labels', min: 4.5 },
  { fg: 'table.header.fg', bg: 'table.header.bg', label: 'Table header text', min: 4.5 },
  { fg: 'nav.item.fg', bg: 'nav.item.bg.hover', label: 'Navigation item on hover fill', min: 4.5 },
  { fg: 'color.text.tertiary', bg: 'color.surface.default', label: 'Tertiary text (large / non-essential)', min: 3 },
  { fg: 'color.text.link', bg: 'color.surface.default', label: 'Links on surface', min: 4.5 },
  { fg: 'color.accent.on', bg: 'color.accent.default', label: 'Primary button label', min: 4.5 },
  { fg: 'color.accent.text', bg: 'color.surface.default', label: 'Accent text on surface', min: 4.5 },
  { fg: 'color.text.inverse', bg: 'color.surface.inverse', label: 'Tooltip text', min: 4.5 },
  { fg: 'color.text.primary', bg: 'color.surface.selected', label: 'Selected row text', min: 4.5 },
  { fg: 'color.text.primary', bg: 'table.row.bg.selected', label: 'Selected table row text', min: 4.5 },
  { fg: 'color.status.success.fg', bg: 'color.status.success.bg', label: 'Success text on tint', min: 4.5 },
  { fg: 'color.status.warning.fg', bg: 'color.status.warning.bg', label: 'Warning text on tint', min: 4.5 },
  { fg: 'color.status.danger.fg', bg: 'color.status.danger.bg', label: 'Danger text on tint', min: 4.5 },
  { fg: 'color.status.info.fg', bg: 'color.status.info.bg', label: 'Info text on tint', min: 4.5 },
  { fg: 'color.status.danger.on', bg: 'color.status.danger.solid', label: 'Destructive button label', min: 4.5 },
  { fg: 'color.status.danger.fg', bg: 'color.surface.default', label: 'Error message text', min: 4.5 },
  { fg: 'color.focus.ring', bg: 'color.surface.default', label: 'Focus ring vs surface', min: 3 },
  { fg: 'color.focus.ring', bg: 'color.bg.app', label: 'Focus ring vs app background', min: 3 },
  { fg: 'input.border', bg: 'input.bg', label: 'Input border (non-text)', min: 3 },
  { fg: 'control.checked.bg', bg: 'color.surface.default', label: 'Checked control vs surface', min: 3 },
  { fg: 'color.chart.cat.1', bg: 'chart.bg', label: 'Chart series 1 vs background', min: 3 },
  { fg: 'color.chart.cat.2', bg: 'chart.bg', label: 'Chart series 2 vs background', min: 3 },
  { fg: 'color.chart.cat.3', bg: 'chart.bg', label: 'Chart series 3 vs background', min: 3 },
  { fg: 'color.chart.cat.4', bg: 'chart.bg', label: 'Chart series 4 vs background', min: 3 },
];

type Mode = { appearance: Appearance; contrast: Contrast; label: string };
const MODES: Mode[] = [
  { appearance: 'light', contrast: 'standard', label: 'Light' },
  { appearance: 'dark', contrast: 'standard', label: 'Dark' },
  { appearance: 'light', contrast: 'high', label: 'Light HC' },
  { appearance: 'dark', contrast: 'high', label: 'Dark HC' },
];

/** Contrast audit across all four appearance modes. Exported for the export/doc generator. */
export function runAudit(theme: ReturnType<typeof useTheme>) {
  return MODES.map((m) => {
    const t = resolveAll(theme, { appearance: m.appearance, contrast: m.contrast });
    return AUDIT_PAIRS.map((p) => {
      const r = contrastRatio(t[p.fg], t[p.bg], t['color.surface.default']) ?? 0;
      return { ...p, mode: m.label, ratio: r, pass: r >= p.min };
    });
  });
}

function Ratio({ r, min }: { r: number; min: number }) {
  const pass = r >= min;
  const aaa = r >= (min === 4.5 ? 7 : 4.5);
  return (
    <span className={`row row--tight ${pass ? 'c-success' : 'c-danger'}`} title={`${r.toFixed(2)}:1, needs ${min}:1`}>
      <Icon icon={pass ? CheckCircle2 : XCircle} size="sm" />
      <span className="t-num">{r.toFixed(2)}</span>
      {aaa && <span className="t-caption">AAA</span>}
    </span>
  );
}

export function AccessibilitySection() {
  const theme = useTheme();
  const view = useView();
  const [onlyFail, setOnlyFail] = useState(false);
  const [fix, setFix] = useState<string | null>(null);
  const audit = useMemo(() => runAudit(theme), [theme]);
  const fails = audit.flat().filter((x) => !x.pass).length;
  const total = audit.flat().length;
  return (
    <Page eyebrow="System" title="Accessibility" description="Live contrast audit against WCAG 2.2 AA in all four appearance modes, color-vision simulation, focus previews, text scaling, keyboard navigation and touch targets. Results update as you edit tokens.">
      <div className="grid grid--4">
        <Card padded>
          <div className="t-overline c-secondary">Contrast checks</div>
          <div className="kpi__value">
            {total - fails}/{total}
          </div>
          <div className="t-footnote c-secondary">pairs pass AA across 4 modes</div>
        </Card>
        <Card padded>
          <div className="t-overline c-secondary">Failures</div>
          <div className={`kpi__value ${fails ? 'c-danger' : 'c-success'}`}>{fails}</div>
          <div className="t-footnote c-secondary">{fails ? 'Use Fix to edit the token' : 'All required pairs pass'}</div>
        </Card>
        <Card padded>
          <div className="t-overline c-secondary">Text scale</div>
          <Slider aria-label="Text scale" value={view.textScale} min={0.85} max={2} step={0.05} onChange={(v) => actions.setView({ textScale: v })} format={(v) => `${Math.round(v * 100)}%`} />
        </Card>
        <Card padded>
          <div className="t-overline c-secondary">Motion</div>
          <Switch checked={view.reducedMotion} onChange={(v) => actions.setView({ reducedMotion: v })} label="Reduce motion" />
        </Card>
      </div>

      <Section title="Contrast audit" description="Text pairs need 4.5:1. Large text, focus indicators and non-text UI need 3:1. HC = increased-contrast variants." actions={<Checkbox label="Show failures only" checked={onlyFail} onChange={setOnlyFail} />}>
        <Card flush>
          <div className="scroll-x">
            <table className="m-table">
              <thead>
                <tr>
                  <th>Pair</th>
                  <th>Sample</th>
                  <th className="is-num">Req.</th>
                  {MODES.map((m) => (
                    <th key={m.label}>{m.label}</th>
                  ))}
                  <th />
                </tr>
              </thead>
              <tbody>
                {AUDIT_PAIRS.map((p, i) => {
                  const cells = audit.map((mode) => mode[i]);
                  if (onlyFail && cells.every((c) => c.pass)) return null;
                  return (
                    <tr key={p.label}>
                      <td>
                        <div>{p.label}</div>
                        <div className="t-caption c-tertiary t-code">
                          {p.fg} / {p.bg}
                        </div>
                      </td>
                      <td>
                        <span style={{ background: `var(--${p.bg.replace(/\./g, '-')})`, color: `var(--${p.fg.replace(/\./g, '-')})`, padding: '3px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)', fontWeight: 500 }}>Aa 123</span>
                      </td>
                      <td className="is-num">{p.min}</td>
                      {cells.map((c) => (
                        <td key={c.mode}>
                          <Ratio r={c.ratio} min={p.min} />
                        </td>
                      ))}
                      <td>{cells.some((c) => !c.pass) && <Button size="sm" variant="ghost" onClick={() => setFix(fix === p.fg ? null : p.fg)}>Fix</Button>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
        {fix && (
          <Card padded title={`Edit ${fix}`} actions={<IconButton icon={XCircle} label="Close" size="sm" onClick={() => setFix(null)} />}>
            <TokenField id={fix} />
          </Card>
        )}
      </Section>

      <Section title="Color-vision simulation" description="Apply a simulation to the whole lab (also in the top bar). Below, status colors and the chart palette as seen with each type.">
        <div className="row row--wrap">
          <Icon icon={Eye} />
          <Select aria-label="Color vision simulation" value={view.cvd} onChange={(v) => actions.setView({ cvd: v as CvdType })} options={Object.entries(CVD_LABELS).map(([value, label]) => ({ value, label }))} />
          <span className="t-footnote c-secondary">Applies to every page until you switch it off.</span>
        </div>
        <CvdGrid />
      </Section>

      <Section title="Focus indicators" description="Every interactive element shows the same brass focus ring. Press Tab inside this box to move through it.">
        <Demo tokens={['color.focus.ring', 'focus.ring.width', 'focus.ring.offset']}>
          <div className="grid grid--2">
            {(['light', 'dark'] as const).map((a) => (
              <ThemeScope key={a} appearance={a} style={{ padding: 16, borderRadius: 'var(--radius-container)' }}>
                <div className="row row--wrap">
                  <Button forceState="focus">Button</Button>
                  <Button variant="primary" forceState="focus">
                    Primary
                  </Button>
                  <TextInput forceState="focus" defaultValue="Field" style={{ width: 120 }} />
                  <Checkbox forceState="focus" label="Check" defaultChecked />
                  <Switch forceState="focus" defaultChecked aria-label="Switch" />
                </div>
              </ThemeScope>
            ))}
          </div>
        </Demo>
      </Section>

      <div className="grid grid--2">
        <Demo title="Never color alone" description="Status always pairs color with an icon or symbol and a word.">
          <div className="stack">
            <div className="row row--wrap">
              <Badge tone="success" dot>
                Received
              </Badge>
              <Badge tone="warning" icon={AlertTriangle}>
                Low stock
              </Badge>
              <Badge tone="danger" dot>
                Out of stock
              </Badge>
            </div>
            <TextInput label="Quantity" defaultValue="-4" error="Quantity cannot be negative." />
          </div>
        </Demo>
        <Demo title="Keyboard navigation" description="Shortcuts available throughout the lab.">
          <table className="m-table">
            <tbody>
              {[
                ['Tab / Shift-Tab', 'Move focus'],
                ['Enter / Space', 'Activate buttons, toggle controls'],
                ['Esc', 'Close dialogs, menus, popovers, inspect mode'],
                ['⌘Z / ⇧⌘Z', 'Undo / redo token edits'],
                ['Arrow keys', 'Adjust sliders and native selects'],
              ].map(([k, d]) => (
                <tr key={k}>
                  <td>
                    <kbd className="m-kbd">{k}</kbd>
                  </td>
                  <td>{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Demo>
        <Demo title="Touch targets" description="Touch platforms need at least 44 × 44 pt. Controls in iOS and iPadOS scopes resolve to this size." tokens={['size.touch.min', 'size.control.md']}>
          <ThemeScope platform="ios" surface={false}>
            <div className="row row--wrap" style={{ alignItems: 'flex-end' }}>
              <div style={{ outline: '1.5px dashed var(--color-highlight-default)', display: 'inline-flex' }}>
                <Button variant="primary">iOS button</Button>
              </div>
              <div style={{ outline: '1.5px dashed var(--color-highlight-default)', display: 'inline-flex', padding: 0 }}>
                <IconButton icon={CheckCircle2} label="Confirm" variant="secondary" />
              </div>
              <Switch defaultChecked aria-label="iOS switch" />
            </div>
          </ThemeScope>
        </Demo>
        <Demo title="Text scaling" description="Set the scale above. Layouts reflow rather than clip.">
          <div className="stack">
            <div className="t-headline">Order PO-24811 is arriving Monday</div>
            <p>Two styles will follow on December 4 because of a mill delay. You can hold the full order or receive it in two parts.</p>
            <div className="row row--wrap">
              <Button variant="primary">Receive in parts</Button>
              <Button>Hold order</Button>
            </div>
          </div>
        </Demo>
      </div>
    </Page>
  );
}

function CvdGrid() {
  const theme = useTheme();
  const view = useView();
  const t = useMemo(() => resolveAll(theme, { appearance: view.appearance, contrast: view.contrast }), [theme, view.appearance, view.contrast]);
  const types: CvdType[] = ['none', 'protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia'];
  const colors = ['color.status.success.solid', 'color.status.warning.solid', 'color.status.danger.solid', 'color.status.info.solid', ...Array.from({ length: 8 }, (_, i) => `color.chart.cat.${i + 1}`)];
  return (
    <Card flush>
      <div className="scroll-x">
        <table className="m-table">
          <thead>
            <tr>
              <th>Vision</th>
              <th>Success · Warning · Danger · Info</th>
              <th>Categorical chart palette</th>
            </tr>
          </thead>
          <tbody>
            {types.map((ty) => (
              <tr key={ty}>
                <td>{CVD_LABELS[ty]}</td>
                <td>
                  <div className="row row--tight">
                    {colors.slice(0, 4).map((c) => (
                      <span key={c} style={{ width: 32, height: 20, background: simulateCvd(t[c], ty), borderRadius: 2, display: 'inline-block' }} />
                    ))}
                  </div>
                </td>
                <td>
                  <div className="row row--tight">
                    {colors.slice(4).map((c) => (
                      <span key={c} style={{ width: 24, height: 20, background: simulateCvd(t[c], ty), borderRadius: 2, display: 'inline-block' }} />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

