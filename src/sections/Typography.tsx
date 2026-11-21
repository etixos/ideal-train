import { useState } from 'react';
import { EditorTabs } from '../lab/EditorTabs';
import { Demo, Page, Section, Workbench } from '../lab/Page';
import { actions, useTheme, useView } from '../state/store';
import { ThemeScope, useResolvedTokens } from '../theme/ThemeScope';
import { TEXT_STYLES } from '../tokens/registry';
import { rawValue } from '../tokens/resolve';
import type { Platform } from '../tokens/types';
import { Card, Select, SegmentedControl, Slider } from '../ui';

export const FONT_STACKS: Record<string, { label: string; value: string }[]> = {
  sans: [
    { label: 'System (San Francisco)', value: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' },
    { label: 'Helvetica Neue', value: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
    { label: 'Avenir', value: 'Avenir, "Avenir Next", "Segoe UI", sans-serif' },
    { label: 'Gill Sans', value: '"Gill Sans", "Gill Sans MT", Calibri, sans-serif' },
    { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  ],
  serif: [
    { label: 'New York / Iowan', value: '"New York", "Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif' },
    { label: 'Baskerville', value: 'Baskerville, "Baskerville Old Face", "Libre Baskerville", Georgia, serif' },
    { label: 'Georgia', value: 'Georgia, "Times New Roman", serif' },
    { label: 'Didot', value: 'Didot, "Bodoni MT", "Bodoni 72", serif' },
    { label: 'Charter', value: 'Charter, "Bitstream Charter", "Sitka Text", Cambria, serif' },
  ],
  mono: [
    { label: 'SF Mono / system', value: '"SF Mono", ui-monospace, Menlo, Consolas, "Liberation Mono", monospace' },
    { label: 'Menlo', value: 'Menlo, Monaco, Consolas, monospace' },
    { label: 'Courier', value: '"Courier New", Courier, monospace' },
  ],
};

function FamilyPicker({ kind }: { kind: 'sans' | 'serif' | 'mono' }) {
  const theme = useTheme();
  const id = `font.family.${kind}`;
  const cur = rawValue(theme, id) as string;
  const opts = FONT_STACKS[kind];
  const match = opts.find((o) => o.value === cur);
  return (
    <Card padded>
      <div className="stack">
        <div className="t-overline c-secondary">{kind === 'sans' ? 'Interface' : kind === 'serif' ? 'Display' : 'Monospace'}</div>
        <div style={{ fontFamily: `var(--font-family-${kind})`, fontSize: 30, lineHeight: 1.1 }}>Hollis &amp; Grant 1872</div>
        <Select aria-label={`${kind} family`} value={match?.value ?? ''} onChange={(v) => actions.setToken(id, v)} options={[...(match ? [] : [{ value: '', label: 'Custom stack' }]), ...opts.map((o) => ({ value: o.value, label: o.label }))]} />
        <span className="t-code c-tertiary">{id}</span>
      </div>
    </Card>
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
        <Section title="Font families">
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
