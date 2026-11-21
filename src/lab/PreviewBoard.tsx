import { PackageCheck, Plus, Search } from 'lucide-react';
import { BarSeriesChart, Sparkline } from '../charts/ChartKit';
import { storePerformance } from '../data/retail';
import { Alert, Badge, Button, Checkbox, Icon, IconButton, Progress, Switch, TextInput } from '../ui';

/** Compact composite of the system: used for live preview and side-by-side comparison. */
export function PreviewBoard({ compact }: { compact?: boolean }) {
  return (
    <div className="stack stack--md" style={{ padding: 'var(--space-inset-lg)', background: 'var(--color-bg-app)', borderRadius: 'var(--radius-container)', border: '1px solid var(--color-border-subtle)' }}>
      <div className="row">
        <div className="spacer">
          <div className="t-overline c-highlight">Main Street</div>
          <div className="t-title2">Receiving</div>
        </div>
        <IconButton icon={Search} label="Search" />
        <Button variant="primary" icon={Plus}>
          New
        </Button>
      </div>
      <div className="m-card">
        <div className="m-card__header">
          <div className="spacer">
            <div className="m-card__title">PO-24811</div>
            <div className="m-card__subtitle">Halyard Outfitters · due Nov 28</div>
          </div>
          <Badge tone="info" dot>
            In transit
          </Badge>
        </div>
        <div className="m-card__body stack">
          <TextInput label="Cartons received" defaultValue="4" />
          <div className="row row--wrap">
            <Checkbox label="Print labels" defaultChecked />
            <Switch label="Notify buyer" defaultChecked />
          </div>
          <Progress value={64} label="Received" />
        </div>
        <div className="m-card__footer">
          <Button variant="ghost">Details</Button>
          <div className="spacer" />
          <Button>Save</Button>
          <Button variant="primary" icon={PackageCheck}>
            Receive
          </Button>
        </div>
      </div>
      {!compact && (
        <>
          <Alert tone="warning" title="Two styles delayed">
            Selvedge shirts ship Dec 4.
          </Alert>
          <table className="m-table m-table--hover" style={{ background: 'var(--color-surface-default)', border: '1px solid var(--color-border-subtle)' }}>
            <thead>
              <tr>
                <th>Store</th>
                <th className="is-num">Sales</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {storePerformance.slice(0, 3).map((s, i) => (
                <tr key={s.store} className={i === 1 ? 'is-selected' : undefined}>
                  <td>{s.store}</td>
                  <td className="is-num">${(s.sales / 1000).toFixed(0)}K</td>
                  <td>
                    <Sparkline values={[3, 4, 3.5, 5, 4.6, 5.4, 6].map((v) => v + i)} width={70} height={18} tone={s.attainment >= 1 ? 'positive' : 'negative'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="m-card m-card--pad" style={{ background: 'var(--chart-bg)' }}>
            <BarSeriesChart height={150} data={storePerformance} x="store" series={[{ key: 'sales', label: 'Sales' }, { key: 'target', label: 'Plan' }]} format={(v) => `${Math.round(v / 1000)}K`} />
          </div>
        </>
      )}
      <div className="row t-footnote c-secondary">
        <Icon icon={PackageCheck} size="sm" /> Last received 9:42 a.m. by Dana Whitlock
      </div>
    </div>
  );
}
