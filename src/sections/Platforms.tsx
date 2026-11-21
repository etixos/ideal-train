import { Columns2, Monitor, Moon, Square, Sun } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { TokenTable } from '../lab/TokenField';
import { Page, Section, SimulationNote } from '../lab/Page';
import { IPadSim, IPhoneSim, MacSim, PlatformScope, WebSim, type IPadLayout } from '../platforms/Simulations';
import { ORDERS, type Step } from '../platforms/workflow';
import { navigate } from '../shell/router';
import { actions, useTheme, useView } from '../state/store';
import { PLATFORM_DEFAULTS, PLATFORM_LABELS, TOKENS } from '../tokens/registry';
import { resolveToken } from '../tokens/resolve';
import type { Platform } from '../tokens/types';
import { Badge, Button, Card, SegmentedControl, Select, Slider } from '../ui';

const DEVICES: Record<Platform, { value: string; label: string }[]> = {
  web: [
    { value: 'desktop', label: 'Desktop browser' },
    { value: 'mobile', label: 'Mobile browser' },
  ],
  macos: [{ value: 'window', label: 'Mac window with menu bar' }],
  ios: [
    { value: 'pro', label: 'iPhone 16 Pro (393 × 852)' },
    { value: 'se', label: 'iPhone SE (375 × 667)' },
  ],
  ipados: [
    { value: 'pro', label: 'iPad Pro 11″ landscape' },
    { value: 'mini', label: 'iPad mini landscape' },
  ],
};

const CONVENTIONS: Record<Platform, string[]> = {
  web: ['Sidebar navigation collapses to a menu below the regular breakpoint', 'Breadcrumbs show where you are in the hierarchy', 'Tables become cards at compact widths', 'Hover states and pointer cursors'],
  macos: ['Menu bar with standard menus and keyboard shortcuts', 'Unified toolbar with traffic lights, sidebar and inspector toggles', 'Translucent source-list sidebar', 'Sheets drop from the window toolbar', 'Dense 13 pt text, 24 pt controls'],
  ios: ['Navigation stack with large titles and a back button', 'Tab bar for top-level sections', 'Inset grouped lists with 44 pt rows', 'Bottom sheets for focused tasks', 'Steppers and switches sized for touch'],
  ipados: ['Three-column split view: sidebar, list, detail', 'Sidebar can be hidden and shown', 'Form sheets centered over content', 'Split View and Slide Over multitasking', 'Falls back to compact (iPhone) layout in narrow windows'],
};

function Sim({ platform, device, step, onStep, orderId, onOrder, layout, appearance }: { platform: Platform; device: string; step: Step; onStep: (s: Step) => void; orderId: string; onOrder: (id: string) => void; layout: IPadLayout; appearance?: 'light' | 'dark' }) {
  const p = { step, onStep, orderId, onOrder };
  return (
    <PlatformScope platform={platform} appearance={appearance}>
      {platform === 'web' ? <WebSim {...p} mobile={device === 'mobile'} /> : platform === 'macos' ? <MacSim {...p} /> : platform === 'ios' ? <IPhoneSim {...p} model={device as 'pro' | 'se'} /> : <IPadSim {...p} layout={layout} model={device as 'pro' | 'mini'} />}
    </PlatformScope>
  );
}

function Scaled({ zoom, children }: { zoom: number; children: ReactNode }) {
  return <div style={{ zoom, flex: 'none' } as React.CSSProperties}>{children}</div>;
}

function OverrideEditor({ platform }: { platform: Platform }) {
  const theme = useTheme();
  const view = useView();
  const ids = useMemo(() => [...new Set([...Object.keys(PLATFORM_DEFAULTS[platform]), ...Object.keys(theme.platforms[platform] ?? {})])], [platform, theme.platforms]);
  const [add, setAdd] = useState('');
  if (platform === 'web') return <p className="t-footnote c-secondary">Web is the base platform. Its values are the theme’s own tokens; edit them in the Theme Editor.</p>;
  return (
    <div className="stack stack--md">
      <p className="t-footnote c-secondary">These values apply only to {PLATFORM_LABELS[platform]}. Everything else is inherited from the shared tokens, so a change to a shared color shows up here too.</p>
      <div className="row">
        <Select
          size="sm"
          aria-label="Add platform override"
          value={add}
          onChange={(v) => {
            setAdd('');
            if (v) actions.setPlatformToken(platform, v, resolveToken(theme, v, { appearance: view.appearance }));
          }}
          options={[{ value: '', label: 'Add an override…' }, ...TOKENS.filter((d) => d.type !== 'color' && !ids.includes(d.id)).map((d) => ({ value: d.id, label: d.id }))]}
        />
      </div>
      <TokenTable ids={ids} target={{ platform }} stacked grouped={false} hideDescription />
    </div>
  );
}

export function Platforms() {
  const [mode, setMode] = useState<'single' | 'compare'>('single');
  const [platform, setPlatform] = useState<Platform>('ios');
  const [device, setDevice] = useState<Record<Platform, string>>({ web: 'desktop', macos: 'window', ios: 'pro', ipados: 'pro' });
  const [step, setStep] = useState<Step>('list');
  const [orderId, setOrderId] = useState(ORDERS[0].id);
  const [layout, setLayout] = useState<IPadLayout>('full');
  const [zoom, setZoom] = useState(0.8);
  const [appearance, setAppearance] = useState<'lab' | 'light' | 'dark'>('lab');
  const ap = appearance === 'lab' ? undefined : appearance;
  const shared = { step, onStep: setStep, orderId, onOrder: setOrderId, layout, appearance: ap };

  return (
    <Page
      wide
      eyebrow="Laboratories"
      title="Platform Laboratory"
      description="One workflow, reviewing and receiving a purchase order, built four times using the conventions of each platform. Shared tokens drive every preview. Platform overrides adjust type sizes, control heights and corner radii where the platforms differ."
      actions={<Button onClick={() => navigate('export')}>SwiftUI tokens</Button>}
    >
      <SimulationNote>These are browser simulations of native interfaces, not SwiftUI components. They are for judging design decisions. The SwiftUI export carries the decisions into native code.</SimulationNote>
      <div className="row row--wrap">
        <SegmentedControl value={mode} onChange={setMode} options={[{ value: 'single', label: 'Single platform', icon: Square }, { value: 'compare', label: 'Compare all', icon: Columns2 }]} aria-label="Mode" />
        {mode === 'single' && <SegmentedControl value={platform} onChange={setPlatform} options={(['web', 'macos', 'ios', 'ipados'] as Platform[]).map((p) => ({ value: p, label: PLATFORM_LABELS[p] }))} aria-label="Platform" />}
        <SegmentedControl size="sm" value={step} onChange={setStep} options={[{ value: 'list', label: '1 · Orders' }, { value: 'detail', label: '2 · Detail' }, { value: 'receive', label: '3 · Receive' }]} aria-label="Workflow step" />
        <SegmentedControl size="sm" value={appearance} onChange={setAppearance} options={[{ value: 'lab', label: '', icon: Monitor }, { value: 'light', label: '', icon: Sun }, { value: 'dark', label: '', icon: Moon }]} aria-label="Appearance" />
      </div>

      {mode === 'single' ? (
        <div className="lab-workbench" style={{ gridTemplateColumns: 'minmax(0, 1fr) 340px' }}>
          <div className="stack stack--md" style={{ minWidth: 0 }}>
            <div className="row row--wrap">
              <Select aria-label="Device" value={device[platform]} onChange={(v) => setDevice({ ...device, [platform]: v })} options={DEVICES[platform]} />
              {platform === 'ipados' && <Select aria-label="Multitasking" value={layout} onChange={(v) => setLayout(v as IPadLayout)} options={[{ value: 'full', label: 'Full screen' }, { value: 'split-23', label: 'Split View ⅔' }, { value: 'split-12', label: 'Split View ½ (compact)' }, { value: 'slide-over', label: 'Slide Over' }]} />}
              <div className="spacer" />
              <span className="t-footnote c-secondary">Scale</span>
              <Slider aria-label="Preview scale" value={zoom} min={0.4} max={1} step={0.05} onChange={setZoom} format={(v) => `${Math.round(v * 100)}%`} className="" />
            </div>
            <div className="platform-stage">
              <Scaled zoom={platform === 'web' && device.web === 'desktop' ? 1 : zoom}>
                <div style={{ width: platform === 'web' && device.web === 'desktop' ? 'min(1100px, 100%)' : undefined, minWidth: platform === 'web' && device.web === 'desktop' ? 760 : undefined }}>
                  <Sim platform={platform} device={device[platform]} {...shared} />
                </div>
              </Scaled>
            </div>
          </div>
          <aside className="lab-workbench__editor stack stack--md" aria-label="Platform settings">
            <div className="t-overline c-secondary">{PLATFORM_LABELS[platform]} conventions</div>
            <ul className="t-footnote" style={{ margin: 0, paddingLeft: 18 }}>
              {CONVENTIONS[platform].map((c) => (
                <li key={c} style={{ marginBottom: 4 }}>
                  {c}
                </li>
              ))}
            </ul>
            <div className="row row--between">
              <div className="t-overline c-secondary">Platform overrides</div>
              <Badge>{PLATFORM_LABELS[platform]}</Badge>
            </div>
            <OverrideEditor platform={platform} />
          </aside>
        </div>
      ) : (
        <div className="platform-compare">
          {(['web', 'macos', 'ios', 'ipados'] as Platform[]).map((p) => (
            <div key={p} className="platform-compare__cell">
              <div className="row">
                <span className="t-headline spacer">{PLATFORM_LABELS[p]}</span>
                <Button size="sm" variant="ghost" onClick={() => { setPlatform(p); setMode('single'); }}>
                  Open
                </Button>
              </div>
              <div className="platform-compare__stage">
                <Scaled zoom={p === 'web' ? 0.56 : p === 'macos' ? 0.52 : p === 'ios' ? 0.58 : 0.4}>
                  <div style={{ width: p === 'web' ? 1000 : p === 'macos' ? 1060 : undefined }}>
                    <Sim platform={p} device={device[p]} {...shared} />
                  </div>
                </Scaled>
              </div>
            </div>
          ))}
        </div>
      )}

      <Section title="How platforms share decisions">
        <div className="grid grid--4">
          {(['web', 'macos', 'ios', 'ipados'] as Platform[]).map((p) => (
            <Card key={p} padded>
              <div className="t-headline">{PLATFORM_LABELS[p]}</div>
              <div className="t-footnote c-secondary" style={{ margin: '4px 0 8px' }}>
                {p === 'web' ? 'Base token values' : `${Object.keys(PLATFORM_DEFAULTS[p]).length} default overrides`}
              </div>
              <p className="t-footnote">Colors, status semantics, chart palettes, iconography and motion are shared. {p === 'macos' ? 'Sizes are denser.' : p === 'web' ? 'Density follows the theme setting.' : 'Sizes follow touch and Dynamic Type defaults.'}</p>
            </Card>
          ))}
        </div>
      </Section>
    </Page>
  );
}
