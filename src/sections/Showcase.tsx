import { LayoutGrid, Maximize2 } from 'lucide-react';
import { useState, type ComponentType } from 'react';
import { AdminApp } from '../apps/Admin';
import { AnalyticsApp } from '../apps/Analytics';
import { EmailApp } from '../apps/Email';
import { FinanceApp } from '../apps/Finance';
import { InventoryApp } from '../apps/Inventory';
import { SchedulingApp } from '../apps/Scheduling';
import { TokenTable } from '../lab/TokenField';
import { Page } from '../lab/Page';
import { navigate } from '../shell/router';
import { actions, useTheme } from '../state/store';
import { ThemeScope } from '../theme/ThemeScope';
import { APPS, APP_IDS } from '../tokens/registry';
import type { AppId } from '../tokens/types';
import { Button, SegmentedControl, Tabs } from '../ui';

export const APP_COMPONENTS: Record<AppId, ComponentType> = {
  inventory: InventoryApp,
  email: EmailApp,
  scheduling: SchedulingApp,
  finance: FinanceApp,
  admin: AdminApp,
  analytics: AnalyticsApp,
};

const ACCENT_IDS = ['color.accent.default', 'color.accent.hover', 'color.accent.pressed', 'color.accent.subtle', 'color.accent.text', 'color.accent.on', 'color.highlight.default'];

export function Showcase({ sub }: { sub?: string }) {
  const theme = useTheme();
  const [view, setView] = useState<'single' | 'grid'>('single');
  const [appearance, setAppearance] = useState<'lab' | 'light' | 'dark'>('lab');
  const app = (APP_IDS.includes(sub as AppId) ? sub : 'inventory') as AppId;
  const App = APP_COMPONENTS[app];
  const ap = appearance === 'lab' ? undefined : appearance;
  const custom = Object.keys(theme.apps[app] ?? {}).length > 0;
  return (
    <Page wide eyebrow="Laboratories" title="Application Showcase" description="Six sample applications built only from the shared system. Each may set its own accent; every other decision comes from the central tokens. They are visual test environments, not production software.">
      <div className="row row--wrap">
        <SegmentedControl value={view} onChange={setView} options={[{ value: 'single', label: 'Explore one', icon: Maximize2 }, { value: 'grid', label: 'All six', icon: LayoutGrid }]} aria-label="View" />
        <SegmentedControl size="sm" value={appearance} onChange={setAppearance} options={[{ value: 'lab', label: 'Lab appearance' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} aria-label="Appearance" />
      </div>
      {view === 'grid' ? (
        <div className="grid grid--2">
          {APP_IDS.map((id) => {
            const A = APP_COMPONENTS[id];
            return (
              <div key={id} className="stack stack--xs">
                <div className="row">
                  <span className="t-headline spacer">{APPS[id].label}</span>
                  <Button size="sm" variant="ghost" onClick={() => { setView('single'); navigate(`apps/${id}`); }}>
                    Open
                  </Button>
                </div>
                <div style={{ height: 330, overflow: 'hidden', borderRadius: 'var(--radius-overlay)', border: '1px solid var(--color-border-default)' }}>
                  <div style={{ zoom: 0.5, height: 660, pointerEvents: 'none' } as React.CSSProperties} aria-hidden>
                    <ThemeScope app={id} appearance={ap} className="app-frame" style={{ height: 660, border: 0, borderRadius: 0 }}>
                      <A />
                    </ThemeScope>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <>
          <Tabs value={app} onChange={(v) => navigate(`apps/${v}`)} tabs={APP_IDS.map((id) => ({ value: id, label: APPS[id].label }))} aria-label="Applications" />
          <div className="lab-workbench" style={{ gridTemplateColumns: 'minmax(0, 1fr) 320px' }}>
            <ThemeScope key={app} app={app} appearance={ap} className="app-frame">
              <App />
            </ThemeScope>
            <aside className="lab-workbench__editor stack stack--md" aria-label="Application accent">
              <div className="t-overline c-secondary">{APPS[app].label}</div>
              <p className="t-footnote c-secondary">{APPS[app].description} Accent overrides below apply to this app only.</p>
              <TokenTable ids={ACCENT_IDS} target={{ app }} stacked grouped={false} hideDescription />
              {custom && (
                <Button size="sm" onClick={() => ACCENT_IDS.forEach((id) => actions.setAppToken(app, id, undefined))}>
                  Reset app overrides
                </Button>
              )}
            </aside>
          </div>
        </>
      )}
    </Page>
  );
}
