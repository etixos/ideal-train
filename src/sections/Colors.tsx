import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { EditorTabs } from '../lab/EditorTabs';
import { ColorSwatch, Ramp } from '../lab/ColorSwatch';
import { Demo, Page, Section, Workbench } from '../lab/Page';
import { ThemeScope, useResolvedTokens } from '../theme/ThemeScope';
import { contrastRatio, wcagLevel } from '../tokens/color';
import { tokensByPrefix } from '../tokens/registry';
import { Badge, Button, Icon } from '../ui';

const FOUNDATION = ['ink', 'charcoal', 'slate', 'stone', 'linen', 'ivory', 'white', 'brick', 'brass'];

function SemanticPair({ fg, bg, label }: { fg: string; bg: string; label: string }) {
  const t = useResolvedTokens();
  const r = contrastRatio(t[fg], t[bg]) ?? 0;
  const lvl = wcagLevel(r);
  return (
    <div className="row" style={{ padding: '8px 12px', background: t[bg], color: t[fg], borderRadius: 'var(--radius-control)', border: '1px solid var(--color-border-subtle)' }}>
      <span style={{ flex: 1 }}>{label}</span>
      <span className="t-code" style={{ fontSize: 11 }}>
        {r.toFixed(2)}:1 {lvl === 'Fail' ? '✕' : lvl}
      </span>
    </div>
  );
}

function SemanticBoard() {
  return (
    <div className="stack" style={{ padding: 'var(--space-inset-lg)', background: 'var(--color-bg-app)', borderRadius: 'var(--radius-container)' }}>
      <div className="t-overline c-secondary">color.bg.app</div>
      <div className="m-card m-card--pad stack" style={{ background: 'var(--color-surface-default)' }}>
        <div className="t-headline">Surface default</div>
        <SemanticPair fg="color.text.primary" bg="color.surface.default" label="Text primary" />
        <SemanticPair fg="color.text.secondary" bg="color.surface.default" label="Text secondary" />
        <SemanticPair fg="color.text.tertiary" bg="color.surface.default" label="Text tertiary (large text only)" />
        <SemanticPair fg="color.accent.text" bg="color.surface.default" label="Accent text" />
        <SemanticPair fg="color.accent.on" bg="color.accent.default" label="On accent" />
        <SemanticPair fg="color.text.inverse" bg="color.surface.inverse" label="Inverse" />
        <div className="row" style={{ gap: 6 }}>
          {['color.surface.sunken', 'color.surface.hover', 'color.surface.selected', 'color.accent.subtle', 'color.highlight.subtle'].map((s) => (
            <div key={s} title={s} style={{ flex: 1, height: 28, background: `var(--${s.replace(/\./g, '-')})`, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)' }} />
          ))}
        </div>
        <div className="row" style={{ gap: 6 }}>
          {['color.border.subtle', 'color.border.default', 'color.border.strong', 'color.focus.ring'].map((s) => (
            <div key={s} title={s} style={{ flex: 1, height: 0, borderTop: `2px solid var(--${s.replace(/\./g, '-')})` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function Colors() {
  const t = useResolvedTokens();
  return (
    <Page eyebrow="Foundations" title="Colors" description="Foundation palettes, neutral and hue scales, semantic roles, status, interaction states, chart palettes, overlays and borders. Click a swatch to pick a new color. Every semantic, component and application color derives from these.">
      <Workbench
        editorTitle="Color tokens"
        editor={
          <EditorTabs
            tabs={[
              { id: 'found', label: 'Foundation', prefix: ['palette.ink', 'palette.charcoal', 'palette.slate', 'palette.stone', 'palette.linen', 'palette.ivory', 'palette.white', 'palette.brick', 'palette.brass'] },
              { id: 'scales', label: 'Scales', prefix: ['palette.neutral', 'palette.moss', 'palette.amber', 'palette.denim', 'palette.teal', 'palette.plum', 'palette.clay', 'palette.sage'] },
              { id: 'sem', label: 'Semantic', prefix: ['color.bg', 'color.surface', 'color.text', 'color.border', 'color.accent', 'color.highlight', 'color.focus'] },
              { id: 'status', label: 'Status', prefix: ['color.status', 'color.overlay', 'color.shadow'] },
            ]}
          />
        }
      >
        <Section title="Foundation palette" description="Provisional values. Pick a new color on any swatch; ratings show contrast against Ink and Ivory.">
          <div className="swatch-grid">
            {FOUNDATION.map((c) => (
              <ColorSwatch key={c} id={`palette.${c}`} />
            ))}
          </div>
        </Section>

        <Section title="Scales" description="Neutral and hue ramps. The neutral scale points at the foundation colors, so editing Charcoal also moves neutral.700 and everything built on it.">
          <div className="stack stack--md">
            {['neutral', 'brick', 'brass', 'moss', 'amber', 'denim'].map((h) => (
              <div key={h} className="stack stack--xs">
                <span className="t-subhead" style={{ textTransform: 'capitalize' }}>
                  {h}
                </span>
                <Ramp ids={tokensByPrefix(`palette.${h}`).filter((d) => /\.\d+$/.test(d.id)).map((d) => d.id)} />
              </div>
            ))}
          </div>
        </Section>

        <Section title="Semantic colors" description="Light and dark appearances side by side. Pairs are rated against WCAG AA (4.5:1 for body text).">
          <div className="grid grid--2">
            <ThemeScope appearance="light">
              <SemanticBoard />
            </ThemeScope>
            <ThemeScope appearance="dark">
              <SemanticBoard />
            </ThemeScope>
          </div>
        </Section>

        <Section title="Status colors" description="Each status has fg, bg, border, solid and on-solid roles. It is always shown with an icon and words, never by color alone.">
          <div className="grid grid--2">
            {(
              [
                ['success', CheckCircle2, 'Shipment received'],
                ['warning', AlertTriangle, 'Stock below reorder point'],
                ['danger', XCircle, 'Payment declined'],
                ['info', Info, 'Count scheduled Friday'],
              ] as const
            ).map(([s, I, msg]) => (
              <div key={s} className={`m-alert m-alert--${s}`}>
                <Icon icon={I} />
                <div className="m-alert__body">
                  <div className="m-alert__title" style={{ textTransform: 'capitalize' }}>
                    {s}
                  </div>
                  <div className="m-alert__text">{msg}</div>
                </div>
                <Badge tone={s}>{s}</Badge>
                <span className="m-badge" style={{ background: t[`color.status.${s}.solid`], color: t[`color.status.${s}.on`], borderColor: 'transparent' }}>
                  Solid
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Interactive states" description="Hover, pressed, selected, focus and disabled colors for the accent and neutral families.">
          <Demo tokens={['color.accent.default', 'color.accent.hover', 'color.accent.pressed', 'color.surface.hover', 'color.surface.pressed', 'color.focus.ring', 'opacity.disabled']}>
            <div className="stack">
              <div className="row row--wrap">
                {(['default', 'hover', 'pressed', 'focus', 'disabled'] as const).map((s) => (
                  <Button key={s} variant="primary" forceState={s === 'default' ? undefined : s}>
                    {s[0].toUpperCase() + s.slice(1)}
                  </Button>
                ))}
              </div>
              <div className="row row--wrap">
                {(['default', 'hover', 'pressed', 'selected', 'focus', 'disabled'] as const).map((s) => (
                  <Button key={s} forceState={s === 'default' ? undefined : s}>
                    {s[0].toUpperCase() + s.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </Demo>
        </Section>

        <Section title="Chart palettes" description="Categorical for distinct series, sequential for ordered magnitude, diverging for variance around a midpoint. Edit them in Charts & Visualization.">
          <div className="stack stack--md">
            <div className="stack stack--xs">
              <span className="t-subhead">Categorical</span>
              <Ramp ids={tokensByPrefix('color.chart.cat').map((d) => d.id)} />
            </div>
            <div className="stack stack--xs">
              <span className="t-subhead">Sequential</span>
              <Ramp ids={tokensByPrefix('color.chart.seq').map((d) => d.id)} />
            </div>
            <div className="stack stack--xs">
              <span className="t-subhead">Diverging</span>
              <Ramp ids={tokensByPrefix('color.chart.div').map((d) => d.id)} />
            </div>
          </div>
        </Section>

        <Section title="Overlays and borders">
          <div className="grid grid--2">
            <Demo title="Scrim" tokens={['color.overlay.scrim', 'dialog.bg']} padded={false} style={{ height: 160, background: 'var(--color-bg-app)', overflow: 'hidden', borderRadius: 0 }}>
              <div style={{ padding: 16 }} className="stack">
                <div className="m-skeleton" style={{ width: '70%' }} />
                <div className="m-skeleton" style={{ width: '50%' }} />
              </div>
              <div style={{ position: 'absolute', inset: 0, background: 'var(--color-overlay-scrim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="m-dialog" style={{ width: 200, padding: 16, animation: 'none' }}>
                  <span className="t-subhead">Dialog on scrim</span>
                </div>
              </div>
            </Demo>
            <Demo title="Border weights" tokens={['color.border.subtle', 'color.border.default', 'color.border.strong']}>
              <div className="stack">
                {['subtle', 'default', 'strong'].map((b) => (
                  <div key={b} style={{ border: `var(--border-width-default) solid var(--color-border-${b})`, padding: 10, borderRadius: 'var(--radius-control)' }}>
                    <span className="t-footnote">color.border.{b}</span>
                  </div>
                ))}
              </div>
            </Demo>
          </div>
        </Section>
      </Workbench>
    </Page>
  );
}
