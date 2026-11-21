import * as L from 'lucide-react';
import { useState } from 'react';
import { EditorTabs } from '../lab/EditorTabs';
import { Demo, Page, Section, Workbench } from '../lab/Page';
import { actions, useView } from '../state/store';
import { useResolvedTokens } from '../theme/ThemeScope';
import { Button, Icon, Progress, Skeleton, Spinner, Switch, cx } from '../ui';

const ICONS: [string, L.LucideIcon][] = [
  ['Package', L.Package], ['Boxes', L.Boxes], ['Truck', L.Truck], ['ShoppingBag', L.ShoppingBag], ['Store', L.Store], ['Receipt', L.Receipt],
  ['Wallet', L.Wallet], ['Landmark', L.Landmark], ['ChartLine', L.LineChart], ['ChartPie', L.PieChart], ['Calendar', L.Calendar], ['Clock', L.Clock],
  ['Users', L.Users], ['User', L.User], ['Mail', L.Mail], ['Inbox', L.Inbox], ['Send', L.Send], ['Archive', L.Archive],
  ['Search', L.Search], ['Filter', L.Filter], ['Settings', L.Settings], ['Shield', L.Shield], ['Lock', L.Lock], ['Bell', L.Bell],
  ['Plus', L.Plus], ['Pencil', L.Pencil], ['Trash', L.Trash2], ['Download', L.Download], ['Upload', L.Upload], ['Printer', L.Printer],
  ['Tag', L.Tag], ['Barcode', L.Barcode], ['ClipboardList', L.ClipboardList], ['FileText', L.FileText], ['Folder', L.Folder], ['Star', L.Star],
];

const DURATIONS = ['duration.instant', 'duration.fast', 'duration.base', 'duration.slow', 'duration.slower'];
const EASINGS = ['easing.standard', 'easing.enter', 'easing.exit', 'easing.emphasized', 'easing.linear'];

function bezierPath(easing: string) {
  const m = /cubic-bezier\(([^)]+)\)/.exec(easing);
  const [x1, y1, x2, y2] = m ? m[1].split(',').map(Number) : [0, 0, 1, 1];
  const S = 72;
  return `M0,${S} C${x1 * S},${S - y1 * S} ${x2 * S},${S - y2 * S} ${S},0`;
}

function Mover({ duration, easing, label }: { duration: string; easing: string; label: string }) {
  const [on, setOn] = useState(false);
  return (
    <div className="row">
      <Button size="sm" icon={L.Play} onClick={() => setOn((o) => !o)} aria-label={`Play ${label}`}>
        {label}
      </Button>
      <div className={cx('motion-track spacer', on && 'is-on')}>
        <div className="motion-dot" style={{ transition: `left var(--${duration.replace(/\./g, '-')}) var(--${easing.replace(/\./g, '-')})` }} />
      </div>
    </div>
  );
}

export function IconsMotion() {
  const t = useResolvedTokens();
  const view = useView();
  const [loading, setLoading] = useState(false);
  return (
    <Page eyebrow="Foundations" title="Icons & Motion" description="One line-icon family at token-driven sizes and stroke weights. Motion uses short durations and easing curves that state their purpose, and every motion has a reduced-motion form.">
      <Workbench
        editorTitle="Icon & motion tokens"
        editor={
          <div className="stack stack--md">
            <Switch checked={view.reducedMotion} onChange={(v) => actions.setView({ reducedMotion: v })} label="Reduce motion (lab-wide)" />
            <EditorTabs
              tabs={[
                { id: 'icon', label: 'Icons', prefix: 'icon' },
                { id: 'dur', label: 'Durations', prefix: ['duration', 'motion.duration'] },
                { id: 'ease', label: 'Easing', prefix: ['easing', 'motion.easing'] },
              ]}
            />
          </div>
        }
      >
        <Section title="Icon family" description="Lucide line icons are the browser stand-in for SF Symbols: one stroke weight, rounded joins, a 24-unit grid. In native apps, map each one to the nearest SF Symbol.">
          <Demo tokens={['icon.size.default', 'icon.stroke.width', 'icon.color.default']}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: 4 }}>
              {ICONS.map(([n, I]) => (
                <div key={n} className="stack stack--xs" style={{ alignItems: 'center', padding: '12px 4px', borderRadius: 'var(--radius-control)', color: 'var(--icon-color-default)' }}>
                  <Icon icon={I} size="xl" />
                  <span className="t-caption c-tertiary">{n}</span>
                </div>
              ))}
            </div>
          </Demo>
        </Section>

        <Section title="Sizes, weights and alignment">
          <div className="grid grid--3">
            <Demo title="Sizes" tokens={['icon.size.sm', 'icon.size.md', 'icon.size.lg', 'icon.size.xl']} center>
              {(['sm', 'md', 'lg', 'xl'] as const).map((s) => (
                <div key={s} className="stack stack--xs" style={{ alignItems: 'center' }}>
                  <Icon icon={L.Package} size={s} />
                  <span className="spec-label">{t[`icon.size.${s}`]}</span>
                </div>
              ))}
            </Demo>
            <Demo title="Stroke weights" tokens={['icon.stroke.thin', 'icon.stroke.regular', 'icon.stroke.bold']} center>
              {(['thin', 'regular', 'bold'] as const).map((w) => (
                <div key={w} className="stack stack--xs" style={{ alignItems: 'center' }}>
                  <L.Truck className="m-icon m-icon--xl" style={{ strokeWidth: `var(--icon-stroke-${w})` }} aria-hidden />
                  <span className="spec-label">{w}</span>
                </div>
              ))}
            </Demo>
            <Demo title="Alignment with text">
              <div className="stack">
                <div className="row t-body">
                  <Icon icon={L.Truck} /> Shipment arriving Friday
                </div>
                <div className="row t-footnote c-secondary">
                  <Icon icon={L.Clock} size="sm" /> Updated 4 minutes ago
                </div>
                <div className="row t-headline">
                  <Icon icon={L.Store} size="lg" /> Main Street
                </div>
              </div>
            </Demo>
          </div>
        </Section>

        <Section title="Durations" description="Press play to compare. With reduced motion on, transitions become instant.">
          <Demo tokens={DURATIONS}>
            <div className="stack">
              {DURATIONS.map((d) => (
                <Mover key={d} duration={d} easing="easing.standard" label={`${d.split('.')[1]} · ${t[d]}`} />
              ))}
            </div>
          </Demo>
        </Section>

        <Section title="Easing curves">
          <Demo tokens={EASINGS}>
            <div className="stack">
              {EASINGS.map((e) => (
                <div key={e} className="row">
                  <svg width="80" height="80" viewBox="-4 -4 80 80" aria-hidden style={{ flex: 'none' }}>
                    <rect x="0" y="0" width="72" height="72" fill="none" stroke="var(--color-border-subtle)" />
                    <path d={bezierPath(t[e])} fill="none" stroke="var(--color-accent-default)" strokeWidth="2" />
                  </svg>
                  <div className="spacer stack stack--xs">
                    <span className="t-code">
                      {e} <span className="c-tertiary">{t[e]}</span>
                    </span>
                    <Mover duration="duration.slower" easing={e} label="Play" />
                  </div>
                </div>
              ))}
            </div>
          </Demo>
        </Section>

        <Section title="Loading indicators" description="Spinners revolve once per motion.duration.spin. With reduced motion they pulse instead of spinning, so loading stays visible.">
          <div className="grid grid--3">
            <Demo title="Spinners" tokens={['motion.duration.spin']} center>
              <Spinner size="sm" />
              <Spinner />
              <Spinner size="lg" />
            </Demo>
            <Demo title="Progress" tokens={['progress.fill', 'progress.track', 'progress.height']}>
              <div className="stack">
                <Progress value={64} label="Import" />
                <Progress indeterminate label="Syncing" />
              </div>
            </Demo>
            <Demo title="Skeleton & button" tokens={['skeleton.bg', 'opacity.loading']}>
              <div className="stack">
                <Skeleton width="80%" />
                <Skeleton width="55%" />
                <Button
                  variant="primary"
                  loading={loading}
                  onClick={() => {
                    setLoading(true);
                    window.setTimeout(() => setLoading(false), 1600);
                  }}
                >
                  Sync inventory
                </Button>
              </div>
            </Demo>
          </div>
        </Section>
      </Workbench>
    </Page>
  );
}
