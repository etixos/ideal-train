import { EditorTabs } from '../lab/EditorTabs';
import { Demo, Page, Section, Workbench } from '../lab/Page';
import { useResolvedTokens } from '../theme/ThemeScope';
import { Badge, Button, Card, Switch, TextInput } from '../ui';

const RADII = ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full'];

export function Shapes() {
  const t = useResolvedTokens();
  return (
    <Page eyebrow="Foundations" title="Shapes & Geometry" description="Corner radii, border widths, component geometry, outlines, shadows and elevation. Mercantile favors restrained corners and hairline borders over heavy shadows.">
      <Workbench
        editorTitle="Shape tokens"
        editor={
          <EditorTabs
            tabs={[
              { id: 'radius', label: 'Radius', prefix: 'radius' },
              { id: 'border', label: 'Borders', prefix: ['border', 'focus'] },
              { id: 'elev', label: 'Elevation', prefix: ['elevation', 'color.shadow', 'card.shadow', 'menu.shadow', 'dialog.shadow'] },
              { id: 'geo', label: 'Geometry', prefix: ['size', 'control', 'badge.height', 'progress.height'] },
            ]}
          />
        }
      >
        <Section title="Corner radius scale">
          <div className="grid grid--4">
            {RADII.map((r) => (
              <div key={r} className="stack stack--xs" style={{ alignItems: 'center' }}>
                <div style={{ width: 84, height: 64, borderRadius: `var(--radius-${r})`, background: 'var(--color-accent-subtle)', border: '1.5px solid var(--color-accent-default)' }} />
                <span className="t-subhead">radius.{r}</span>
                <span className="spec-label">{t[`radius.${r}`]}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Radius roles" description="Components never use the raw scale directly. They use one of five roles.">
          <div className="grid grid--2">
            <Demo title="Control" tokens={['radius.control']} center>
              <Button variant="primary">Save</Button>
              <TextInput placeholder="SKU" style={{ width: 140 }} />
            </Demo>
            <Demo title="Container" tokens={['radius.container', 'card.radius']} center>
              <Card padded style={{ width: 200 }}>
                <span className="t-subhead">Card</span>
              </Card>
            </Demo>
            <Demo title="Overlay" tokens={['radius.overlay', 'dialog.radius']} center>
              <div className="m-dialog" style={{ width: 220, padding: 16, animation: 'none' }}>
                <span className="t-subhead">Dialog</span>
              </div>
            </Demo>
            <Demo title="Badge & pill" tokens={['radius.badge', 'radius.pill']} center>
              <Badge tone="success">Received</Badge>
              <span className="m-tag">Pantry</span>
              <Switch defaultChecked aria-label="Example" />
            </Demo>
          </div>
        </Section>

        <Section title="Borders and outlines">
          <div className="grid grid--3">
            {['thin', 'medium', 'thick'].map((w) => (
              <Demo key={w} title={`border.width.${w}`} tokens={[`border.width.${w}`]} center>
                <div style={{ width: '100%', height: 48, border: `var(--border-width-${w}) solid var(--color-border-strong)`, borderRadius: 'var(--radius-control)' }} />
              </Demo>
            ))}
            <Demo title="Focus ring" tokens={['focus.ring.width', 'focus.ring.offset', 'color.focus.ring']} center>
              <Button forceState="focus">Focused</Button>
            </Demo>
            <Demo title="Selected indicator" tokens={['border.width.strong', 'nav.tab.indicator']} center>
              <div className="m-tabs" style={{ width: '100%' }}>
                <span className="m-tab is-selected">Selected</span>
                <span className="m-tab">Other</span>
              </div>
            </Demo>
          </div>
        </Section>

        <Section title="Elevation" description="Four steps. Resting content is flat and separated by borders. Shadows are kept for things that float.">
          <div className="grid grid--4" style={{ background: 'var(--color-bg-app)', padding: 24, borderRadius: 'var(--radius-container)' }}>
            {['flat', 'raised', 'overlay', 'modal'].map((e) => (
              <div key={e} style={{ height: 96, background: 'var(--color-surface-elevated)', borderRadius: 'var(--radius-container)', boxShadow: `var(--elevation-${e})`, border: '1px solid var(--color-border-subtle)', padding: 12 }}>
                <div className="t-subhead">elevation.{e}</div>
                <div className="spec-label" style={{ wordBreak: 'break-word' }}>
                  {t[`elevation.${e}`].slice(0, 60)}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Component geometry" description="Control heights and touch targets. The 44pt minimum applies to touch platforms.">
          <Demo tokens={['size.control.sm', 'size.control.md', 'size.control.lg', 'size.touch.min']}>
            <div className="row row--wrap" style={{ alignItems: 'flex-end' }}>
              {(['sm', 'md', 'lg'] as const).map((s) => (
                <div key={s} className="stack stack--xs" style={{ alignItems: 'center' }}>
                  <Button size={s} variant="primary">
                    Control {s}
                  </Button>
                  <span className="spec-label">{t[`size.control.${s}`]}</span>
                </div>
              ))}
              <div className="stack stack--xs" style={{ alignItems: 'center' }}>
                <div style={{ width: 'var(--size-touch-min)', height: 'var(--size-touch-min)', border: '1.5px dashed var(--color-highlight-default)', borderRadius: 'var(--radius-control)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="t-caption">44</span>
                </div>
                <span className="spec-label">touch min</span>
              </div>
            </div>
          </Demo>
        </Section>
      </Workbench>
    </Page>
  );
}
