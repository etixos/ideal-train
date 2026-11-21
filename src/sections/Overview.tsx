import { ArrowRight, Layers, MonitorSmartphone, Package, SlidersHorizontal } from 'lucide-react';
import { Page, Section } from '../lab/Page';
import { NAV } from '../shell/nav';
import { href, navigate } from '../shell/router';
import { useTheme } from '../state/store';
import { useResolvedTokens } from '../theme/ThemeScope';
import { TOKENS } from '../tokens/registry';
import { Badge, Button, Card, Icon } from '../ui';

const FOUNDATION = ['ink', 'charcoal', 'slate', 'stone', 'linen', 'ivory', 'white', 'brick', 'brass'];

const STATUS: [string, 'success' | 'warning' | 'neutral', string][] = [
  ['Design-token engine', 'success', 'Three layers, light/dark/high-contrast, platform and app overrides.'],
  ['Theme Editor', 'success', 'Search, linking, usage, undo/redo, presets, comparison, inspect mode.'],
  ['Foundations (6 editors)', 'success', 'Color, type, shape, spacing, icons, motion — each with demos.'],
  ['Component library', 'success', 'All requested components with forced-state galleries.'],
  ['Data Visualization Lab', 'success', '17 chart types, palettes, full control panel, print mode.'],
  ['Reporting Lab', 'success', '8 report templates, print layouts; PDF via the browser print dialog.'],
  ['Platform Lab', 'success', 'Web, macOS, iOS, iPadOS simulations with same-workflow comparison.'],
  ['Application Showcase', 'success', 'Six apps with per-app accent overrides.'],
  ['Accessibility inspector', 'success', 'Contrast audit, color-vision simulation, focus, text scaling.'],
  ['Export', 'success', 'JSON, CSS, SwiftUI, Markdown documentation, saved configurations.'],
  ['Direct PDF file generation', 'warning', 'Uses the browser’s “Save as PDF”; no server-side renderer.'],
  ['Real SwiftUI components', 'neutral', 'Out of scope by design: native screens are browser simulations.'],
];

export function Overview() {
  const theme = useTheme();
  const t = useResolvedTokens();
  const counts = { foundation: 0, semantic: 0, component: 0 };
  TOKENS.forEach((d) => counts[d.layer]++);
  return (
    <Page
      eyebrow="Mercantile Design Lab"
      title="One design system. Every application. Every platform."
      description="The central design authority for every web, macOS, iPhone and iPad application. Make a visual decision once, test it across components, charts, reports, platforms, and six sample applications, then export it for future builds."
      actions={
        <>
          <Button icon={SlidersHorizontal} variant="primary" onClick={() => navigate('editor')}>
            Open Theme Editor
          </Button>
          <Button icon={Package} onClick={() => navigate('export')}>
            Export
          </Button>
        </>
      }
    >
      <div className="ramp" aria-label="Foundation palette">
        {FOUNDATION.map((c) => {
          const bg = t[`palette.${c}`];
          const dark = ['ink', 'charcoal', 'slate', 'brick'].includes(c);
          return (
            <div key={c} className="ramp__step" style={{ background: bg, height: 92, color: dark ? '#F4F1E9' : '#242A28' }}>
              <span style={{ fontFamily: 'var(--font-family-sans)', fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>{c}</span>
              <span>{bg}</span>
            </div>
          );
        })}
      </div>

      <div className="grid grid--4">
        <Card padded>
          <div className="t-overline c-secondary">Working theme</div>
          <div className="t-title3" style={{ marginTop: 4 }}>
            {theme.name}
          </div>
          <div className="t-footnote c-secondary">{Object.keys(theme.values).length} overrides · {theme.density} density</div>
        </Card>
        {(['foundation', 'semantic', 'component'] as const).map((l) => (
          <Card padded key={l}>
            <div className="t-overline c-secondary">{l} tokens</div>
            <div className="kpi__value" style={{ marginTop: 4 }}>
              {counts[l]}
            </div>
            <div className="t-footnote c-secondary">{l === 'foundation' ? 'Raw primitives' : l === 'semantic' ? 'Purpose-based roles' : 'Per-component mappings'}</div>
          </Card>
        ))}
      </div>

      <Section title="How the system is layered" description="Applications reference semantic and component tokens, never raw values. Change a foundation color and everything that refers to it updates.">
        <div className="grid grid--3">
          {[
            ['Foundation', 'palette.charcoal = #414B43', 'Raw colors, dimensions, type scales, durations.'],
            ['Semantic', 'color.accent.default → {palette.neutral.700}', 'Roles such as color.text.primary or space.component.default, with light and dark values.'],
            ['Component', 'button.primary.bg → {color.accent.default}', 'What each component consumes. Restyle one component without touching others.'],
          ].map(([name, ex, desc], i) => (
            <Card key={name} padded>
              <div className="row">
                <Icon icon={Layers} />
                <span className="t-headline">
                  {i + 1}. {name}
                </span>
              </div>
              <div className="t-code c-accent" style={{ margin: '8px 0' }}>
                {ex}
              </div>
              <p className="t-footnote c-secondary">{desc}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Laboratories">
        <div className="grid grid--auto">
          {NAV.filter((n) => n.path !== 'overview').map((n) => (
            <a key={n.path} href={href(n.path)} className="m-card m-card--pad m-card--interactive" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', gap: 12, alignItems: 'center' }}>
              <Icon icon={n.icon} size="lg" className="c-accent" />
              <span className="t-headline" style={{ flex: 1 }}>
                {n.label}
              </span>
              <Icon icon={ArrowRight} size="sm" className="c-tertiary" />
            </a>
          ))}
        </div>
      </Section>

      <Section title="Build status" description="Completed features and placeholders, listed plainly.">
        <Card flush>
          <table className="m-table">
            <tbody>
              {STATUS.map(([f, tone, note]) => (
                <tr key={f}>
                  <td style={{ width: 260 }} className="t-subhead">
                    {f}
                  </td>
                  <td style={{ width: 120 }}>
                    <Badge tone={tone} dot>
                      {tone === 'success' ? 'Complete' : tone === 'warning' ? 'Partial' : 'Not planned'}
                    </Badge>
                  </td>
                  <td className="is-wrap c-secondary">{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </Section>

      <Card padded>
        <div className="row row--wrap">
          <Icon icon={MonitorSmartphone} size="lg" className="c-highlight" />
          <div style={{ flex: 1, minWidth: 240 }}>
            <div className="t-headline">Native platforms are simulated in the browser</div>
            <p className="t-footnote c-secondary">macOS, iOS and iPadOS previews are browser simulations of native conventions, not SwiftUI. The SwiftUI export gives future native builds the same decisions as Swift code.</p>
          </div>
          <Button iconRight={ArrowRight} onClick={() => navigate('platforms')}>
            Platform Laboratory
          </Button>
        </div>
      </Card>
    </Page>
  );
}
