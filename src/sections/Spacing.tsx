import { useState } from 'react';
import { EditorTabs } from '../lab/EditorTabs';
import { Demo, Page, Section, Workbench } from '../lab/Page';
import { actions, useTheme } from '../state/store';
import { ThemeScope, useResolvedTokens } from '../theme/ThemeScope';
import { DENSITY_FACTOR } from '../tokens/resolve';
import type { Density } from '../tokens/types';
import { PRODUCTS } from '../data/inventory';
import { Badge, Button, Card, DataTable, SegmentedControl, Slider, Switch, TextInput } from '../ui';

const SCALE = Array.from({ length: 13 }, (_, i) => `space.${i}`);

function DensitySample() {
  return (
    <div className="stack">
      <div className="row">
        <TextInput placeholder="Search products" />
        <Button variant="primary">Add</Button>
      </div>
      <DataTable
        rows={PRODUCTS.slice(0, 4)}
        rowKey={(r) => r.sku}
        columns={[
          { key: 'name', header: 'Product' },
          { key: 'onHand', header: 'On hand', numeric: true },
          { key: 'status', header: 'Status', render: (r) => <Badge tone={r.status === 'In stock' ? 'success' : r.status === 'Low stock' ? 'warning' : 'danger'}>{r.status}</Badge> },
        ]}
      />
    </div>
  );
}

function ResponsiveDemo() {
  const t = useResolvedTokens();
  const [w, setW] = useState(1040);
  const sm = parseFloat(t['layout.breakpoint.sm']);
  const md = parseFloat(t['layout.breakpoint.md']);
  const lg = parseFloat(t['layout.breakpoint.lg']);
  const bp = w < sm ? 'compact' : w < md ? 'regular' : w < lg ? 'wide' : 'extra wide';
  const cols = w < sm ? 4 : w < md ? 8 : 12;
  const side = w >= md;
  const cards = w < sm ? 1 : w < md ? 2 : 3;
  return (
    <div className="stack">
      <div className="row row--wrap">
        <Slider aria-label="Viewport width" value={w} min={360} max={1440} step={10} onChange={setW} format={(v) => `${v}px`} className="spacer" />
        <Badge tone="info">{bp}</Badge>
        <span className="t-footnote c-secondary">
          {cols} columns · sidebar {side ? 'shown' : 'collapsed'}
        </span>
      </div>
      <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
        <div style={{ width: w * 0.62, minWidth: 220, transition: 'width var(--motion-duration-enter)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-container)', overflow: 'hidden', display: 'flex', height: 220, background: 'var(--color-bg-app)' }}>
          {side && <div style={{ width: 'calc(var(--layout-sidebar-width) * 0.62)', background: 'var(--color-surface-sidebar)', borderRight: '1px solid var(--color-border-subtle)', flex: 'none' }} />}
          <div style={{ flex: 1, padding: 'calc(var(--space-page-margin) * 0.62)', display: 'grid', gridTemplateColumns: `repeat(${cards}, 1fr)`, gap: 'calc(var(--space-page-gutter) * 0.62)', alignContent: 'start', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 'calc(var(--space-page-margin) * 0.62)', display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 'calc(var(--space-page-gutter) * 0.62)', pointerEvents: 'none' }}>
              {Array.from({ length: cols }, (_, i) => (
                <div key={i} style={{ background: 'var(--color-status-danger-bg)', opacity: 0.6 }} />
              ))}
            </div>
            {Array.from({ length: cards * 2 }, (_, i) => (
              <div key={i} className="m-card" style={{ height: 64, position: 'relative' }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Spacing() {
  const t = useResolvedTokens();
  const theme = useTheme();
  const [grid, setGrid] = useState(true);
  return (
    <Page eyebrow="Foundations" title="Spacing & Layout" description="A 2 to 64px spacing scale, semantic component, inset and stack spacing, page margins, a 12-column grid, content density, and responsive breakpoints.">
      <Workbench
        editorTitle="Spacing tokens"
        editor={
          <div className="stack stack--md">
            <div className="stack stack--xs">
              <span className="t-subhead">Content density</span>
              <SegmentedControl<Density>
                block
                value={theme.density}
                onChange={actions.setDensity}
                options={[
                  { value: 'compact', label: 'Compact' },
                  { value: 'regular', label: 'Regular' },
                  { value: 'comfortable', label: 'Comfortable' },
                ]}
                aria-label="Density"
              />
              <span className="t-caption c-tertiary">Scales control heights, component padding, insets and table rows by ×{DENSITY_FACTOR[theme.density]}.</span>
            </div>
            <EditorTabs
              tabs={[
                { id: 'sem', label: 'Semantic', prefix: ['space.component', 'space.inset', 'space.stack', 'space.page'] },
                { id: 'scale', label: 'Scale', ids: SCALE },
                { id: 'layout', label: 'Layout', prefix: 'layout' },
              ]}
            />
          </div>
        }
      >
        <Section title="Spacing scale">
          <Demo>
            <div className="stack" style={{ gap: 6 }}>
              {SCALE.map((s) => (
                <div key={s} className="row">
                  <span className="t-code" style={{ width: 72 }}>
                    {s}
                  </span>
                  <div style={{ width: `var(--${s.replace('.', '-')})`, height: 14, background: 'var(--color-highlight-default)', borderRadius: 1 }} />
                  <span className="spec-label">{t[s]}</span>
                </div>
              ))}
            </div>
          </Demo>
        </Section>

        <Section title="Component padding" description="Insets are drawn in highlight so the spacing can be seen.">
          <div className="grid grid--3">
            <Demo title="Button" tokens={['button.padding.x', 'button.gap']} center>
              <div style={{ background: 'var(--color-highlight-subtle)', display: 'inline-flex', outline: '1px dashed var(--color-highlight-default)' }}>
                <Button variant="primary">Receive stock</Button>
              </div>
            </Demo>
            <Demo title="Card" tokens={['card.padding']} center>
              <div className="m-card" style={{ padding: 'var(--card-padding)', background: 'var(--color-highlight-subtle)', width: '100%' }}>
                <div style={{ background: 'var(--color-surface-default)', padding: 8 }} className="t-footnote">
                  Content area
                </div>
              </div>
            </Demo>
            <Demo title="Stack rhythm" tokens={['space.stack.xs', 'space.stack.sm', 'space.stack.md']}>
              <div className="stack stack--md">
                <TextInput label="Vendor" placeholder="Halyard Outfitters" />
                <TextInput label="Reference" placeholder="PO-24811" />
              </div>
            </Demo>
          </div>
        </Section>

        <Section title="Content density" description="The same interface at all three densities.">
          <div className="grid grid--3">
            {(['compact', 'regular', 'comfortable'] as const).map((d) => (
              <Demo key={d} title={d[0].toUpperCase() + d.slice(1)} style={{ background: 'var(--color-bg-app)' }}>
                <ThemeScope density={d} surface={false}>
                  <DensitySample />
                </ThemeScope>
              </Demo>
            ))}
          </div>
        </Section>

        <Section title="Page grid" actions={<Switch checked={grid} onChange={setGrid} label="Show columns" />}>
          <Demo tokens={['layout.grid.columns', 'space.page.margin', 'space.page.gutter', 'layout.content.max']} padded={false}>
            <div style={{ padding: 'var(--space-page-margin)', position: 'relative', background: 'var(--color-bg-app)' }}>
              {grid && (
                <div style={{ position: 'absolute', inset: 'var(--space-page-margin)', display: 'grid', gridTemplateColumns: `repeat(${t['layout.grid.columns']}, 1fr)`, gap: 'var(--space-page-gutter)', pointerEvents: 'none' }}>
                  {Array.from({ length: parseInt(t['layout.grid.columns']) || 12 }, (_, i) => (
                    <div key={i} style={{ background: 'var(--color-status-danger-bg)', borderLeft: '1px solid var(--color-status-danger-border)', borderRight: '1px solid var(--color-status-danger-border)', opacity: 0.7 }} />
                  ))}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${t['layout.grid.columns']}, 1fr)`, gap: 'var(--space-page-gutter)', position: 'relative' }}>
                <Card padded style={{ gridColumn: 'span 8' }}>
                  <span className="t-subhead">8 columns: primary content</span>
                </Card>
                <Card padded style={{ gridColumn: 'span 4' }}>
                  <span className="t-subhead">4 columns: aside</span>
                </Card>
                {[1, 2, 3].map((i) => (
                  <Card key={i} padded style={{ gridColumn: 'span 4' }}>
                    <span className="t-footnote">4 columns</span>
                  </Card>
                ))}
              </div>
            </div>
          </Demo>
        </Section>

        <Section title="Responsive layout" description="Drag to change the simulated viewport. Breakpoints come from layout.breakpoint.* tokens.">
          <Demo tokens={['layout.breakpoint.sm', 'layout.breakpoint.md', 'layout.breakpoint.lg', 'layout.sidebar.width']}>
            <ResponsiveDemo />
          </Demo>
        </Section>
      </Workbench>
    </Page>
  );
}
