import { useState } from 'react';
import { EditorTabs } from '../lab/EditorTabs';
import { Demo, Page, Section, Workbench } from '../lab/Page';
import { actions, useTheme, useView } from '../state/store';
import { FONT } from '../tokens/presets';
import { MODES } from '../tokens/registry';
import { useFontStack } from '../lab/fonts';
import { CheckCircle2, XCircle } from 'lucide-react';
import { ThemeScope, useResolvedTokens } from '../theme/ThemeScope';
import { TEXT_STYLES } from '../tokens/registry';
import { rawValue } from '../tokens/resolve';
import type { ModeId, Platform } from '../tokens/types';
import { Badge, Card, Icon, Select, SegmentedControl, Slider } from '../ui';

export const FONT_STACKS: Record<string, { label: string; value: string }[]> = {
  sans: [
    { label: 'IBM Plex Sans (Lindemann)', value: FONT.ibmPlexSans },
    { label: 'Avenir Next (Diamond Stop)', value: FONT.avenirNext },
    { label: 'System (San Francisco)', value: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' },
    { label: 'Helvetica Neue', value: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
    { label: 'Gill Sans', value: '"Gill Sans", "Gill Sans MT", Calibri, sans-serif' },
  ],
  serif: [
    { label: 'Georgia Pro (Lindemann)', value: FONT.georgiaPro },
    { label: 'Baskerville (Diamond Stop)', value: FONT.baskerville },
    { label: 'New York / Iowan', value: '"New York", "Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif' },
    { label: 'Georgia', value: 'Georgia, "Times New Roman", serif' },
    { label: 'Charter', value: 'Charter, "Bitstream Charter", "Sitka Text", Cambria, serif' },
  ],
  mono: [
    { label: 'IBM Plex Mono, then SF Mono', value: FONT.ibmPlexMono },
    { label: 'SF Mono, then IBM Plex Mono', value: '"SF Mono", "IBM Plex Mono", ui-monospace, Menlo, monospace' },
    { label: 'Menlo', value: 'Menlo, Monaco, Consolas, monospace' },
  ],
};

function FontStatus({ stack }: { stack: string }) {
  const r = useFontStack(stack);
  if (!r) return <span className="font-status c-tertiary">Checking fonts…</span>;
  const primary = r.families[0];
  return (
    <div className="stack" style={{ gap: 2 }}>
      {r.families
        .filter((f) => !['serif', 'sans-serif', 'monospace', 'ui-monospace', '-apple-system', 'BlinkMacSystemFont'].includes(f.name))
        .slice(0, 3)
        .map((f) => (
          <span key={f.name} className={`font-status ${f.available ? 'c-success' : 'c-tertiary'}`}>
            <Icon icon={f.available ? CheckCircle2 : XCircle} size="sm" />
            {f.name}: {f.available ? 'available' : 'not installed'}
          </span>
        ))}
      {!primary.available && r.using && <span className="t-caption c-warning">Showing {r.using} in its place on this device.</span>}
    </div>
  );
}

function FamilyPicker({ kind }: { kind: 'sans' | 'serif' | 'mono' }) {
  const theme = useTheme();
  const view = useView();
  const id = `font.family.${kind}`;
  const cur = rawValue(theme, id, { mode: view.mode }) as string;
  const modeOwned = theme.modes[view.mode]?.values[id] !== undefined;
  const opts = FONT_STACKS[kind];
  const match = opts.find((o) => o.value === cur);
  return (
    <Card padded>
      <div className="stack">
        <div className="row row--between">
          <div className="t-overline c-secondary">{kind === 'sans' ? 'Interface' : kind === 'serif' ? 'Display & headings' : 'Monospace'}</div>
          <Badge tone={modeOwned ? 'highlight' : 'neutral'}>{modeOwned ? `${MODES[view.mode].label} only` : 'Shared'}</Badge>
        </div>
        <div style={{ fontFamily: `var(--font-family-${kind})`, fontSize: 30, lineHeight: 1.1 }}>Hollis &amp; Grant 1872</div>
        <Select aria-label={`${kind} family`} value={match?.value ?? ''} onChange={(v) => actions.setToken(id, v)} options={[...(match ? [] : [{ value: '', label: 'Custom stack' }]), ...opts.map((o) => ({ value: o.value, label: o.label }))]} />
        <FontStatus stack={cur} />
        <span className="t-code c-tertiary">{id}</span>
      </div>
    </Card>
  );
}

function ModeSpecimen({ mode }: { mode: ModeId }) {
  return (
    <ThemeScope mode={mode} surface style={{ padding: 'var(--space-inset-lg)', borderRadius: 'var(--radius-container)', border: '1px solid var(--color-border-subtle)' }}>
      <div className="stack">
        <div className="t-overline c-highlight">{MODES[mode].label}</div>
        <div className="t-title1">Quarterly Review</div>
        <div className="t-title3">Holiday sell-through at 67.2%</div>
        <p className="t-body c-secondary">Inventory received after 4 p.m. is counted on the next business day and appears in the morning report.</p>
        <div className="row">
          <span className="m-btn m-btn--primary">Receive stock</span>
          <span className="t-code c-secondary">PO-24811 · $8,420.00</span>
        </div>
        <span className="t-caption c-tertiary">{MODES[mode].description}</span>
      </div>
    </ThemeScope>
  );
}

function TypeRamp({ platform }: { platform?: Platform }) {
  const t = useResolvedTokens();
  return (
    <div className="stack" style={{ gap: 0 }}>
      {TEXT_STYLES.map((s) => (
        <div key={s} className="row row--top" style={{ padding: '10px 0', borderBottom: '1px solid var(--color-border-subtle)', gap: 16 }}>
          <div style={{ width: 132, flex: 'none' }}>
            <div className="t-subhead">{s}</div>
            <div className="spec-label">
              {t[`text.${s}.size`]} / {t[`text.${s}.weight`]} / {t[`text.${s}.leading`]}
            </div>
          </div>
          <div className={`t-${s}`} style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: s === 'body' || s === 'lead' || s === 'footnote' ? 'normal' : 'nowrap' }}>
            {s === 'code' ? 'color.text.primary = {palette.neutral.900}' : s === 'body' || s === 'lead' ? 'Inventory received after 4 p.m. is counted on the next business day and appears in the morning report.' : s === 'overline' ? 'Quarterly summary' : 'Holiday sell-through at 67.2%'}
          </div>
        </div>
      ))}
      {platform && <span className="t-caption c-tertiary" style={{ marginTop: 6 }}>Scope: {platform}</span>}
    </div>
  );
}

const DYNAMIC_TYPE = [
  ['xSmall', 14], ['Small', 15], ['Medium', 16], ['Large (default)', 17], ['xLarge', 19], ['xxLarge', 21], ['xxxLarge', 23], ['AX1', 28], ['AX2', 33], ['AX3', 40], ['AX4', 47], ['AX5', 53],
] as const;

export function Typography() {
  const view = useView();
  const [platform, setPlatform] = useState<Platform>('web');
  return (
    <Page eyebrow="Foundations" title="Typography" description="Font families, a semantic type scale, weights, line heights, letter spacing, numeric figures, and Dynamic Type. Text styles reference foundation sizes, so changing one size updates every style that uses it.">
      <Workbench
        editorTitle="Typography tokens"
        editor={
          <EditorTabs
            tabs={[
              { id: 'styles', label: 'Styles', prefix: 'text' },
              { id: 'scale', label: 'Scale', prefix: ['font.size', 'font.weight', 'font.leading', 'font.tracking'] },
              { id: 'family', label: 'Families', prefix: 'font.family' },
            ]}
          />
        }
      >
        <Section title="Modes side by side" description="Lindemann and Diamond Stop share everything except what each mode overrides. Switch the active mode in the top bar.">
          <div className="grid grid--2">
            <ModeSpecimen mode="lindemann" />
            <ModeSpecimen mode="diamond" />
          </div>
        </Section>

        <Section title="Font families" description="Families for the active mode. A badge shows whether each is shared or set for this mode only; use “Edits apply to” in the top bar to choose which you change.">
          <div className="grid grid--3">
            <FamilyPicker kind="serif" />
            <FamilyPicker kind="sans" />
            <FamilyPicker kind="mono" />
          </div>
        </Section>

        <Section title="Type scale" description="Each style resolves differently per platform: compact on macOS, larger on iOS and iPadOS following Apple's default Dynamic Type sizes." actions={<SegmentedControl size="sm" value={platform} onChange={setPlatform} options={[{ value: 'web', label: 'Web' }, { value: 'macos', label: 'macOS' }, { value: 'ios', label: 'iOS' }, { value: 'ipados', label: 'iPadOS' }]} aria-label="Platform" />}>
          <Demo tokens={['text.title1.size', 'text.body.size', 'text.body.leading', 'font.tracking.tight']}>
            <ThemeScope platform={platform} surface={false}>
              <TypeRamp platform={platform} />
            </ThemeScope>
          </Demo>
        </Section>

        <Section title="Weights, leading and tracking">
          <div className="grid grid--3">
            <Demo title="Weights" tokens={['font.weight.regular', 'font.weight.medium', 'font.weight.semibold', 'font.weight.bold']}>
              {(['regular', 'medium', 'semibold', 'bold'] as const).map((w) => (
                <div key={w} style={{ fontWeight: `var(--font-weight-${w})` as never, fontSize: 18 }}>
                  {w} <span className="spec-label">var(--font-weight-{w})</span>
                </div>
              ))}
            </Demo>
            <Demo title="Line height" tokens={['font.leading.tight', 'font.leading.normal', 'font.leading.relaxed']}>
              <div className="stack">
                {(['tight', 'normal', 'relaxed'] as const).map((l) => (
                  <p key={l} style={{ lineHeight: `var(--font-leading-${l})`, fontSize: 13, background: 'var(--color-surface-sunken)', padding: 4 }}>
                    <b>{l}</b> — Receiving closes at four. Late deliveries are logged the next morning.
                  </p>
                ))}
              </div>
            </Demo>
            <Demo title="Letter spacing" tokens={['font.tracking.tight', 'font.tracking.wide', 'font.tracking.caps']}>
              {(['tight', 'normal', 'wide', 'caps'] as const).map((tr) => (
                <div key={tr} style={{ letterSpacing: `var(--font-tracking-${tr})`, fontSize: tr === 'tight' ? 22 : 13, textTransform: tr === 'caps' ? 'uppercase' : undefined, fontFamily: tr === 'tight' ? 'var(--font-family-serif)' : undefined }}>
                  {tr} tracking
                </div>
              ))}
            </Demo>
          </div>
        </Section>

        <Section title="Numeric typography" description="Tables, KPIs and financial statements use tabular lining figures so columns align (text.numeric.features).">
          <div className="grid grid--2">
            <Demo title="Proportional (avoid in tables)">
              <div style={{ fontVariantNumeric: 'proportional-nums', textAlign: 'right', fontSize: 16 }}>
                {['1,111.11', '8,808.40', '41,170.95', '(2,019.00)'].map((n) => (
                  <div key={n}>{n}</div>
                ))}
              </div>
            </Demo>
            <Demo title="Tabular lining (Mercantile default)" tokens={['text.numeric.features']}>
              <div className="t-num" style={{ textAlign: 'right', fontSize: 16 }}>
                {['1,111.11', '8,808.40', '41,170.95', '(2,019.00)'].map((n) => (
                  <div key={n}>{n}</div>
                ))}
              </div>
            </Demo>
          </div>
        </Section>

        <Section title="Dynamic Type and text scaling" description="The lab-wide text scale multiplies every text-style size, much like a user's text-size preference. Apple's Body size at each Dynamic Type category is shown for reference.">
          <div className="grid grid--2">
            <Demo title="Text scale" tokens={['text.body.size']}>
              <div className="stack">
                <Slider aria-label="Text scale" value={view.textScale} min={0.85} max={2} step={0.05} onChange={(v) => actions.setView({ textScale: v })} format={(v) => `${Math.round(v * 100)}%`} />
                <div className="t-headline">Reorder recommended</div>
                <p className="t-body">Beeswax Taper Candles are at 9 units against a reorder point of 30. A purchase order for 120 is suggested.</p>
                <p className="t-footnote c-secondary">Layouts must reflow, not clip, up to 200%.</p>
              </div>
            </Demo>
            <Demo title="iOS Dynamic Type, Body style (pt)">
              <table className="m-table">
                <tbody>
                  {DYNAMIC_TYPE.map(([n, pt]) => (
                    <tr key={n}>
                      <td>{n}</td>
                      <td className="is-num">{pt}</td>
                      <td style={{ fontSize: Math.min(pt, 30), lineHeight: 1.1 }}>Aa</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Demo>
          </div>
        </Section>
      </Workbench>
    </Page>
  );
}
