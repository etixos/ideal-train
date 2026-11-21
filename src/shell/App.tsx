import { Contrast, Crosshair, Menu as MenuIcon, Moon, Redo2, Sun, Undo2 } from 'lucide-react';
import { useEffect, useState, type ComponentType } from 'react';
import { actions, canRedo, canUndo, useLab, useTheme, useView } from '../state/store';
import { RootTheme } from '../theme/ThemeScope';
import { CVD_LABELS } from '../tokens/color';
import { Badge, IconButton, NavHeading, NavItem, SegmentedControl, Select, Sidebar, ToastProvider, Toolbar, Tooltip, cx } from '../ui';
import { MODES, MODE_IDS } from '../tokens/registry';
import type { ModeId } from '../tokens/types';
import { CvdFilters } from './CvdFilters';
import { Inspector } from './Inspector';
import { NAV } from './nav';
import { href, navigate, useRoute } from './router';
import { Overview } from '../sections/Overview';
import { Colors } from '../sections/Colors';
import { Typography } from '../sections/Typography';
import { Shapes } from '../sections/Shapes';
import { Spacing } from '../sections/Spacing';
import { IconsMotion } from '../sections/IconsMotion';
import { Components } from '../sections/Components';
import { Charts } from '../sections/Charts';
import { Reports } from '../sections/Reports';
import { Platforms } from '../sections/Platforms';
import { Showcase } from '../sections/Showcase';
import { AccessibilitySection } from '../sections/Accessibility';
import { ThemeEditor } from '../sections/ThemeEditor';
import { ExportSection } from '../sections/Export';

const PAGES: Record<string, ComponentType<{ sub?: string }>> = {
  overview: Overview,
  colors: Colors,
  typography: Typography,
  shapes: Shapes,
  spacing: Spacing,
  'icons-motion': IconsMotion,
  components: Components,
  charts: Charts,
  reports: Reports,
  platforms: Platforms,
  apps: Showcase,
  accessibility: AccessibilitySection,
  editor: ThemeEditor,
  export: ExportSection,
};

function Mark() {
  return (
    <span className="lab-brand__mark" aria-hidden>
      <svg viewBox="0 0 32 32">
        <path d="M7 23V9l9 9 9-9v14" fill="none" stroke="var(--palette-brass)" strokeWidth="2.6" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function App() {
  const route = useRoute();
  const [section = 'overview', sub] = route;
  const Page = PAGES[section] ?? Overview;
  const theme = useTheme();
  const view = useView();
  const undoable = useLab(canUndo);
  const redoable = useLab(canRedo);
  const modified = Object.keys(theme.values).length;
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !typing) {
        e.preventDefault();
        if (e.shiftKey) actions.redo();
        else actions.undo();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y' && !typing) {
        e.preventDefault();
        actions.redo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    setNavOpen(false);
    document.querySelector('.lab-shell__content')?.scrollTo({ top: 0 });
  }, [section, sub]);

  return (
    <ToastProvider>
      <RootTheme />
      <CvdFilters />
      <div className="lab-shell cvd-filter" style={{ filter: view.cvd === 'none' ? undefined : `url(#cvd-${view.cvd})` }}>
        <Sidebar className={cx('lab-nav', navOpen && 'is-open')} label="Mercantile Design Lab">
          <div className="lab-brand">
            <Mark />
            <div>
              <div className="lab-brand__name">Mercantile</div>
              <div className="lab-brand__sub">Design Lab</div>
            </div>
          </div>
          {(['Foundations', 'Library', 'Laboratories', 'System'] as const).map((g) => (
            <div key={g} style={{ display: 'contents' }}>
              <NavHeading>{g}</NavHeading>
              {NAV.filter((n) => n.group === g).map((n) => (
                <NavItem key={n.path} icon={n.icon} label={n.label} href={href(n.path)} selected={section === n.path} meta={<span className="lab-nav__num">{NAV.indexOf(n) + 1}</span>} />
              ))}
            </div>
          ))}
          <div className="lab-nav__foot">
            One Mercantile design system.
            <br />
            Every application. Every platform.
          </div>
        </Sidebar>
        <div className="lab-shell__main">
          <Toolbar className="lab-topbar">
            <IconButton className="lab-topbar__menu" icon={MenuIcon} label="Open navigation" onClick={() => setNavOpen((o) => !o)} />
            <div className="lab-topbar__theme">
              <span className="t-caption c-tertiary">Working theme</span>
              <button type="button" className="t-subhead truncate" style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', textAlign: 'left' }} onClick={() => navigate('editor')}>
                {theme.name}
              </button>
            </div>
            <div className="m-divider m-divider--vertical lab-topbar__hide-sm" style={{ height: 20 }} />
            <SegmentedControl<ModeId> size="sm" value={view.mode} onChange={(m) => actions.setView({ mode: m })} options={MODE_IDS.map((m) => ({ value: m, label: MODES[m].label }))} aria-label="Mode" />
            <Select
              size="sm"
              className={cx('lab-topbar__hide-sm', view.editScope === 'mode' && 'lab-scope--mode')}
              aria-label="Edits apply to"
              title="Where token edits are saved"
              value={view.editScope}
              onChange={(v) => actions.setView({ editScope: v as 'shared' | 'mode' })}
              options={[
                { value: 'shared', label: 'Edits apply to both modes' },
                { value: 'mode', label: `Edits apply to ${MODES[view.mode].label} only` },
              ]}
            />
            {modified > 0 && (
              <span className="lab-topbar__hide-sm">
                <Badge tone="highlight" dot>
                  {modified} modified
                </Badge>
              </span>
            )}
            {view.cvd !== 'none' && (
              <span className="lab-topbar__hide-sm">
                <Badge tone="info">Simulating: {CVD_LABELS[view.cvd]}</Badge>
              </span>
            )}
            <div className="spacer" />
            <Tooltip content="Undo (⌘Z)" placement="bottom">
              <IconButton icon={Undo2} label="Undo" disabled={!undoable} onClick={actions.undo} />
            </Tooltip>
            <Tooltip content="Redo (⇧⌘Z)" placement="bottom">
              <IconButton icon={Redo2} label="Redo" disabled={!redoable} onClick={actions.redo} />
            </Tooltip>
            <div className="m-divider m-divider--vertical" style={{ height: 20 }} />
            <Tooltip content="Inspect tokens on any element" placement="bottom">
              <IconButton icon={Crosshair} label="Inspect tokens" selected={view.inspect} onClick={() => actions.setView({ inspect: !view.inspect })} />
            </Tooltip>
            <Tooltip content={view.contrast === 'high' ? 'Standard contrast' : 'Increase contrast'} placement="bottom">
              <IconButton icon={Contrast} label="Toggle high contrast" selected={view.contrast === 'high'} onClick={() => actions.setView({ contrast: view.contrast === 'high' ? 'standard' : 'high' })} />
            </Tooltip>
            <Tooltip content={view.appearance === 'dark' ? 'Light appearance' : 'Dark appearance'} placement="bottom">
              <IconButton icon={view.appearance === 'dark' ? Sun : Moon} label="Toggle appearance" onClick={actions.toggleAppearance} />
            </Tooltip>
          </Toolbar>
          <main className="lab-shell__content" id="main">
            <Page sub={sub} />
          </main>
        </div>
      </div>
      <Inspector />
    </ToastProvider>
  );
}
