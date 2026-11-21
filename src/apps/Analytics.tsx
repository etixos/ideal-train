import { BarChart3, BookOpen, FileText, LineChart, Plus, Save, Share2, Table2 } from 'lucide-react';
import { useState } from 'react';
import { AreaSeriesChart, BarSeriesChart, ChartOptionsProvider, DEFAULT_CHART_OPTIONS, Heatmap, LineSeriesChart, ScatterPlot } from '../charts/ChartKit';
import { fmtMoneyCompact, fmtNum } from '../data/format';
import { CATEGORIES, HOURS, basketScatter, coverageHeatmap, dailyTraffic, monthlySales, salesByCategory, storePerformance } from '../data/retail';
import { Badge, Button, Card, Checkbox, DataTable, SegmentedControl, Select, Tag, TextInput, useToast } from '../ui';
import { AppShell } from './AppShell';

type Viz = 'line' | 'bar' | 'area' | 'table';
const METRICS: Record<string, { label: string; data: Record<string, unknown>[]; x: string; series: { key: string; label?: string }[]; fmt?: (v: number) => string }> = {
  revenue: { label: 'Revenue by month', data: monthlySales, x: 'month', series: [{ key: 'revenue', label: 'FY2026' }, { key: 'prior', label: 'FY2025' }], fmt: fmtMoneyCompact },
  category: { label: 'Sales by category', data: salesByCategory, x: 'month', series: CATEGORIES.map((c) => ({ key: c })), fmt: fmtMoneyCompact },
  traffic: { label: 'Daily visitors', data: dailyTraffic, x: 'label', series: [{ key: 'visitors', label: 'Visitors' }, { key: 'avg7', label: '7-day avg' }], fmt: fmtNum },
  stores: { label: 'Store sales vs plan', data: storePerformance, x: 'store', series: [{ key: 'sales', label: 'Sales' }, { key: 'target', label: 'Plan' }], fmt: fmtMoneyCompact },
};

export function AnalyticsApp() {
  const toast = useToast();
  const [page, setPage] = useState('explore');
  const [metric, setMetric] = useState('revenue');
  const [viz, setViz] = useState<Viz>('line');
  const [filters, setFilters] = useState(['FY2026', 'All stores']);
  const [legend, setLegend] = useState(true);
  const [labels, setLabels] = useState(false);
  const m = METRICS[metric];
  return (
    <AppShell
      name="Ledgerline"
      current={page}
      onNav={setPage}
      nav={[
        { id: 'explore', label: 'Explore', icon: LineChart },
        { id: 'dashboards', label: 'Dashboards', icon: BarChart3 },
        { id: 'reports', label: 'Saved reports', icon: FileText, meta: 6 },
        { id: 'datasets', label: 'Datasets', icon: Table2 },
        { id: 'docs', label: 'Metric glossary', icon: BookOpen },
      ]}
      toolbar={
        <>
          <span className="m-toolbar__title">{page === 'explore' ? 'Explore' : page === 'dashboards' ? 'Store operations dashboard' : page === 'reports' ? 'Saved reports' : page === 'datasets' ? 'Datasets' : 'Metric glossary'}</span>
          <div className="spacer" />
          <Button size="sm" icon={Share2}>
            Share
          </Button>
          <Button size="sm" variant="primary" icon={Save} onClick={() => toast({ tone: 'success', title: 'Report saved', text: m.label })}>
            Save
          </Button>
        </>
      }
      inspector={
        page === 'explore' ? (
          <>
            <div className="app-inspector__section">
              <div className="t-overline c-secondary">Query</div>
              <Select label="Metric" value={metric} onChange={setMetric} options={Object.entries(METRICS).map(([k, v]) => ({ value: k, label: v.label }))} />
              <Select label="Granularity" options={['Month', 'Week', 'Day']} />
            </div>
            <div className="app-inspector__section">
              <div className="t-overline c-secondary">Visualization</div>
              <SegmentedControl size="sm" block value={viz} onChange={setViz} options={[{ value: 'line', label: 'Line' }, { value: 'bar', label: 'Bar' }, { value: 'area', label: 'Area' }, { value: 'table', label: 'Table' }]} aria-label="Visualization" />
              <Checkbox label="Legend" checked={legend} onChange={setLegend} />
              <Checkbox label="Data labels" checked={labels} onChange={setLabels} />
            </div>
            <div className="app-inspector__section">
              <div className="t-overline c-secondary">Filters</div>
              <div className="row row--wrap">
                {filters.map((f) => (
                  <Tag key={f} onRemove={() => setFilters(filters.filter((x) => x !== f))}>
                    {f}
                  </Tag>
                ))}
              </div>
              <Button size="sm" variant="ghost" icon={Plus} onClick={() => setFilters([...filters, 'Apparel'])}>
                Add filter
              </Button>
            </div>
          </>
        ) : undefined
      }
    >
      {page === 'explore' && (
        <ChartOptionsProvider value={{ ...DEFAULT_CHART_OPTIONS, legend, labels }}>
          <Card title={m.label} subtitle={filters.join(' · ') || 'No filters'} actions={<Badge tone="info">Live</Badge>}>
            {viz === 'line' ? <LineSeriesChart height={320} data={m.data} x={m.x} series={m.series} format={m.fmt} /> : viz === 'bar' ? <BarSeriesChart height={320} data={m.data} x={m.x} series={m.series} format={m.fmt} stacked={metric === 'category'} /> : viz === 'area' ? <AreaSeriesChart height={320} data={m.data} x={m.x} series={m.series} format={m.fmt} stacked={metric === 'category'} /> : <DataTable flush rows={m.data.slice(0, 14)} rowKey={(r) => String(r[m.x])} columns={[{ key: m.x, header: m.x }, ...m.series.map((s) => ({ key: s.key, header: s.label ?? s.key, numeric: true, sortable: true, render: (r: Record<string, unknown>) => (m.fmt ?? fmtNum)(r[s.key] as number) }))]} />}
          </Card>
        </ChartOptionsProvider>
      )}
      {page === 'dashboards' && (
        <div className="grid grid--2">
          <Card title="Basket vs dwell time">
            <ScatterPlot height={240} data={basketScatter} x="dwell" y="basket" group="store" />
          </Card>
          <Card title="Category mix">
            <AreaSeriesChart stacked height={240} data={salesByCategory} x="month" series={CATEGORIES.map((c) => ({ key: c }))} format={fmtMoneyCompact} />
          </Card>
          <Card title="Coverage heatmap" style={{ gridColumn: 'span 2' }}>
            <Heatmap rows={coverageHeatmap.map((r) => ({ label: r.day, values: r.values }))} columns={HOURS} diverging midpoint={100} format={(v) => `${v}%`} />
          </Card>
        </div>
      )}
      {page === 'reports' && <DataTable rows={[['Weekly sales flash', 'Dana Whitlock', 'Mon 7:00', 'Email'], ['Holiday sell-through', 'Priya Natarajan', 'Daily 6:00', 'Slack'], ['Shrink by aisle', 'Marcus Bell', 'Monthly', 'PDF'], ['Labor vs traffic', 'Dana Whitlock', 'Weekly', 'Email'], ['Vendor fill rate', 'Marcus Bell', 'Weekly', 'PDF'], ['NPS comments', 'Hannah Lindqvist', '—', '—']].map(([n, o, s, d]) => ({ n, o, s, d }))} rowKey={(r) => r.n} columns={[{ key: 'n', header: 'Report', sortable: true }, { key: 'o', header: 'Owner', sortable: true }, { key: 's', header: 'Schedule' }, { key: 'd', header: 'Delivery', render: (r) => (r.d === '—' ? <span className="c-tertiary">Not scheduled</span> : <Badge>{r.d}</Badge>) }]} />}
      {page === 'datasets' && <DataTable rows={[['pos_transactions', '4.2M', '2 min ago', 'Healthy'], ['inventory_snapshots', '182K', '1 hr ago', 'Healthy'], ['labor_hours', '96K', '6 hr ago', 'Stale'], ['door_counts', '1.1M', '5 min ago', 'Healthy']].map(([n, r, u, s]) => ({ n, r, u, s }))} rowKey={(r) => r.n} columns={[{ key: 'n', header: 'Dataset', render: (r) => <span className="t-code">{r.n}</span> }, { key: 'r', header: 'Rows', numeric: true }, { key: 'u', header: 'Refreshed' }, { key: 's', header: 'Freshness', render: (r) => <Badge dot tone={r.s === 'Healthy' ? 'success' : 'warning'}>{r.s}</Badge> }]} />}
      {page === 'docs' && (
        <div className="stack">
          {[
            ['Sell-through', 'Units sold ÷ (units sold + units on hand) over the period.'],
            ['Inventory turns', 'Cost of goods sold ÷ average inventory at cost, annualized.'],
            ['Conversion', 'Transactions ÷ door counts for the same hours.'],
            ['Shrink', 'Book inventory minus physical inventory, as % of sales.'],
          ].map(([t, d]) => (
            <Card key={t} padded>
              <div className="t-headline">{t}</div>
              <p className="t-footnote c-secondary">{d}</p>
            </Card>
          ))}
          <TextInput label="Suggest a definition" placeholder="Metric name" />
        </div>
      )}
    </AppShell>
  );
}
