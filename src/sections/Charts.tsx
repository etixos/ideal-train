import { useMemo, useState, type ReactNode } from 'react';
import {
  AreaSeriesChart,
  BarSeriesChart,
  ChartOptionsProvider,
  ComboChart,
  DEFAULT_CHART_OPTIONS,
  DonutChart,
  FunnelChart,
  Gauge,
  Heatmap,
  KpiCard,
  LineSeriesChart,
  ScatterPlot,
  Sparkline,
  Trend,
  WaterfallChart,
  useChartTheme,
  type ChartOptions,
  type PaletteKind,
} from '../charts/ChartKit';
import { CATEGORIES, HOURS, basketScatter, categoryShare, coverageHeatmap, dailyTraffic, funnel, histogram, kpis, monthlySales, profitBridge, salesByCategory, storePerformance, transactionValues } from '../data/retail';
import { fmtCurrency, fmtMoneyCompact, fmtNum, fmtPct, fmtSignedPct } from '../data/format';
import { EditorTabs } from '../lab/EditorTabs';
import { Page, Section } from '../lab/Page';
import { ThemeScope, useResolvedTokens } from '../theme/ThemeScope';
import { CVD_LABELS, simulateCvd, type CvdType } from '../tokens/color';
import { Badge, Card, Checkbox, SegmentedControl, Select, Slider, Tabs } from '../ui';

type Render = 'lab' | 'light' | 'dark' | 'contrast' | 'print';

function ChartCard({ title, subtitle, children, span = 1, note }: { title: string; subtitle?: string; children: ReactNode; span?: 1 | 2; note?: ReactNode }) {
  return (
    <Card title={title} subtitle={subtitle} style={{ gridColumn: span === 2 ? 'span 2' : undefined, background: 'var(--chart-bg)' }} footer={note}>
      {children}
    </Card>
  );
}

function PaletteCheck() {
  const ct = useChartTheme();
  const types: CvdType[] = ['none', 'protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia'];
  const pal = ct.series(8);
  return (
    <div className="stack">
      {types.map((ty) => (
        <div key={ty} className="row">
          <span className="t-footnote" style={{ width: 200 }}>
            {CVD_LABELS[ty]}
          </span>
          <div className="row row--tight spacer">
            {pal.map((c, i) => (
              <div key={i} style={{ flex: 1, height: 22, background: simulateCvd(c, ty), borderRadius: 2 }} title={simulateCvd(c, ty)} />
            ))}
          </div>
        </div>
      ))}
      <p className="t-footnote c-secondary">Series that merge under a simulation need a second channel: dash pattern, marker shape, or direct labels. Switch on “Patterns” to add them.</p>
    </div>
  );
}

function Gallery() {
  const t = useResolvedTokens();
  const months = monthlySales.map((m) => ({ ...m, avg: 0 }));
  const avgRevenue = monthlySales.reduce((s, m) => s + m.revenue, 0) / 12;
  const hist = useMemo(() => histogram(transactionValues), []);
  const storeRows = storePerformance.map((s) => ({ ...s, pct: Math.round(s.attainment * 1000) / 10 }));
  const catTotals = CATEGORIES.map((c) => ({ category: c, sales: salesByCategory.reduce((s, r) => s + (r[c] as number), 0) })).sort((a, b) => b.sales - a.sales);
  return (
    <div className="stack stack--lg">
      <div className="grid grid--4">
        <KpiCard label="Revenue YTD" value={fmtMoneyCompact(kpis.revenueYtd)} delta={kpis.revenueYtd / kpis.revenuePriorYtd - 1} spark={monthlySales.slice(0, 11).map((m) => m.revenue)} sparkTone="accent" />
        <KpiCard label="Gross margin" value={fmtPct(kpis.grossMarginPct)} delta={kpis.grossMarginPct - kpis.grossMarginPriorPct} deltaFormat={(v) => `${(Math.abs(v) * 100).toFixed(1)} pts`} spark={monthlySales.map((m) => m.grossMargin / m.revenue)} sparkTone="positive" />
        <KpiCard label="Inventory turns" value={kpis.inventoryTurns.toFixed(1)} delta={kpis.inventoryTurns / kpis.inventoryTurnsPrior - 1} spark={[5.1, 5.0, 4.9, 4.8, 4.9, 4.7, 4.6, 4.6]} sparkTone="negative" />
        <KpiCard label="Labor % of sales" value={fmtPct(kpis.laborPct)} delta={kpis.laborPct - kpis.laborPctPrior} goodWhen="down" deltaFormat={(v) => `${(Math.abs(v) * 100).toFixed(1)} pts`} spark={[13.2, 13.5, 13.9, 14.4, 14.1, 14.2]} sparkTone="negative" />
      </div>

      <div className="grid grid--2">
        <ChartCard title="Line: monthly revenue" subtitle="FY2026 vs. FY2025, with plan and average" span={2}>
          <LineSeriesChart data={months} x="month" format={fmtMoneyCompact} series={[{ key: 'revenue', label: 'FY2026' }, { key: 'prior', label: 'FY2025' }, { key: 'target', label: 'Plan', dashed: true, color: t['color.chart.neutral'] }]} reference={{ value: avgRevenue, label: `Avg ${fmtMoneyCompact(avgRevenue)}` }} threshold={{ value: 340000, label: 'Break-even' }} />
        </ChartCard>
        <ChartCard title="Column: sales by store" subtitle="Bars below plan are drawn in the negative color">
          <BarSeriesChart data={storeRows} x="store" format={fmtMoneyCompact} series={[{ key: 'sales', label: 'Sales' }]} colorByValue={(r) => ((r.attainment as number) < 1 ? t['color.chart.negative'] : undefined)} reference={{ value: 1_000_000, label: '$1M' }} />
        </ChartCard>
        <ChartCard title="Bar: category totals" subtitle="Ranked, horizontal">
          <BarSeriesChart horizontal data={catTotals} x="category" format={fmtMoneyCompact} series={[{ key: 'sales', label: 'Sales' }]} />
        </ChartCard>
        <ChartCard title="Time series: daily store visits" subtitle="90 days, with 7-day moving average" span={2}>
          <AreaSeriesChart data={dailyTraffic} x="label" format={fmtNum} series={[{ key: 'visitors', label: 'Visitors' }, { key: 'avg7', label: '7-day average' }]} />
        </ChartCard>
        <ChartCard title="Stacked area: category mix">
          <AreaSeriesChart stacked data={salesByCategory} x="month" format={fmtMoneyCompact} series={CATEGORIES.map((c) => ({ key: c }))} />
        </ChartCard>
        <ChartCard title="Stacked column: category mix">
          <BarSeriesChart stacked data={salesByCategory} x="month" format={fmtMoneyCompact} series={CATEGORIES.map((c) => ({ key: c }))} />
        </ChartCard>
        <ChartCard title="Donut: share of sales">
          <DonutChart data={categoryShare} centerValue={fmtMoneyCompact(kpis.revenueYtd)} centerLabel="YTD" />
        </ChartCard>
        <ChartCard title="Pie: share of sales">
          <DonutChart data={categoryShare} donut={false} />
        </ChartCard>
        <ChartCard title="Scatter: basket vs. dwell time" subtitle="By store">
          <ScatterPlot data={basketScatter} x="dwell" y="basket" group="store" xLabel="Minutes in store" yLabel="Basket ($)" />
        </ChartCard>
        <ChartCard title="Histogram: transaction value" subtitle="900 receipts, $14 bins">
          <BarSeriesChart data={hist} x="bin" series={[{ key: 'count', label: 'Receipts' }]} />
        </ChartCard>
        <ChartCard title="Heatmap: staffing coverage" subtitle="% of required coverage. Diverging around 100%." span={2}>
          <Heatmap rows={coverageHeatmap.map((r) => ({ label: r.day, values: r.values }))} columns={HOURS} diverging midpoint={100} format={(v) => `${v}%`} legendLabel="Coverage" />
        </ChartCard>
        <ChartCard title="Waterfall: net income bridge" subtitle="FY2025 → FY2026" span={2}>
          <WaterfallChart data={profitBridge} format={fmtMoneyCompact} />
        </ChartCard>
        <ChartCard title="Funnel: store conversion" subtitle="Q4 to date">
          <FunnelChart data={funnel} format={fmtNum} />
        </ChartCard>
        <ChartCard title="Gauges: plan attainment">
          <div className="grid grid--2">
            <Gauge value={kpis.sellThrough * 100} target={70} label="Sell-through" />
            <Gauge value={storePerformance[2].attainment * 100} min={50} max={120} target={100} label="Harbor attainment" bands={[0.55, 0.75]} />
          </div>
        </ChartCard>
        <ChartCard title="Financial comparison" subtitle="Revenue and COGS (bars) with net income (line)" span={2}>
          <ComboChart data={monthlySales} x="month" format={fmtMoneyCompact} bars={[{ key: 'revenue', label: 'Revenue' }, { key: 'cogs', label: 'COGS' }]} lines={[{ key: 'net', label: 'Net income', color: t['color.chart.positive'] }]} />
        </ChartCard>
        <ChartCard title="Sparklines & trend indicators" span={2}>
          <table className="m-table">
            <thead>
              <tr>
                <th>Store</th>
                <th className="is-num">Sales</th>
                <th className="is-num">vs plan</th>
                <th>12-week trend</th>
                <th className="is-num">Conversion</th>
                <th className="is-num">NPS</th>
              </tr>
            </thead>
            <tbody>
              {storePerformance.map((s, i) => {
                const series = Array.from({ length: 12 }, (_, k) => s.sales / 12 * (1 + Math.sin(k / 2 + i) * 0.08 + k * 0.01 * (s.attainment - 0.97) * 10));
                return (
                  <tr key={s.store}>
                    <td>{s.store}</td>
                    <td className="is-num">{fmtCurrency(s.sales)}</td>
                    <td className="is-num">
                      <Trend delta={s.attainment - 1} />
                    </td>
                    <td>
                      <Sparkline values={series} tone={s.attainment >= 1 ? 'positive' : 'negative'} width={110} height={24} />
                    </td>
                    <td className="is-num">{fmtPct(s.conversion)}</td>
                    <td className="is-num">{s.nps}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </ChartCard>
      </div>

      <Section title="Performance dashboard" description="The pieces composed the way an application would use them.">
        <div className="grid grid--3">
          <Card title="Holiday readiness" subtitle="Week 47">
            <div className="stack stack--md">
              {[
                ['Gift boxes assembled', 0.82],
                ['Seasonal staff trained', 0.94],
                ['Window installs', 0.6],
              ].map(([l, v]) => (
                <div key={l as string} className="stack stack--xs">
                  <div className="row row--between t-footnote">
                    <span>{l as string}</span>
                    <span className="t-num">{fmtPct(v as number, 0)}</span>
                  </div>
                  <div className="m-progress">
                    <div className="m-progress__bar" style={{ width: `${(v as number) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Top movers" subtitle="Units, last 7 days">
            <BarSeriesChart horizontal height={190} data={[{ n: 'Gift Box', v: 93 }, { n: 'Grits', v: 88 }, { n: 'Candles', v: 64 }, { n: 'Ledger', v: 58 }, { n: 'Salt Tin', v: 52 }]} x="n" series={[{ key: 'v', label: 'Units' }]} />
          </Card>
          <Card title="Margin trend" subtitle="Gross margin %">
            <LineSeriesChart height={190} data={monthlySales.map((m) => ({ month: m.month, gm: +((m.grossMargin / m.revenue) * 100).toFixed(1) }))} x="month" series={[{ key: 'gm', label: 'GM %' }]} format={(v) => `${v}%`} reference={{ value: 41, label: 'Target 41%' }} />
          </Card>
        </div>
      </Section>
    </div>
  );
}

export function Charts() {
  const [o, setO] = useState<ChartOptions>(DEFAULT_CHART_OPTIONS);
  const [render, setRender] = useState<Render>('lab');
  const [tab, setTab] = useState<'gallery' | 'palettes'>('gallery');
  const set = (patch: Partial<ChartOptions>) => setO((cur) => ({ ...cur, ...patch }));
  const opts: ChartOptions = render === 'print' ? { ...o, mode: 'print', patterns: true, animate: false } : o;
  const scope = render === 'lab' ? {} : render === 'light' ? { appearance: 'light' as const, contrast: 'standard' as const } : render === 'dark' ? { appearance: 'dark' as const, contrast: 'standard' as const } : render === 'contrast' ? { contrast: 'high' as const } : { appearance: 'light' as const, contrast: 'high' as const };
  const check = (key: keyof ChartOptions, label: string) => <Checkbox label={label} checked={!!opts[key]} disabled={render === 'print' && (key === 'patterns' || key === 'animate')} onChange={(v) => set({ [key]: v } as Partial<ChartOptions>)} />;
  return (
    <Page wide eyebrow="Laboratories" title="Charts & Visualization" description="A data-visualization laboratory using retail, inventory, finance and staffing data. Every color, line weight and label size comes from chart tokens. The controls change all charts at once.">
      <div className="lab-workbench" style={{ gridTemplateColumns: 'minmax(0, 1fr) 320px' }}>
        <div className="stack stack--md" style={{ minWidth: 0 }}>
          <Tabs value={tab} onChange={setTab} tabs={[{ value: 'gallery', label: 'Chart gallery' }, { value: 'palettes', label: 'Palettes & color vision' }]} />
          <ChartOptionsProvider value={opts}>
            <ThemeScope {...scope} style={{ background: render === 'print' ? '#FFFFFF' : undefined, padding: render === 'lab' ? 0 : 16, borderRadius: 'var(--radius-container)' }}>
              {render === 'print' && (
                <div className="lab-simnote" style={{ marginBottom: 12 }}>
                  Print rendering: light, high-contrast tokens, dash patterns and markers, no animation. This is how charts appear in Reports & Documents.
                </div>
              )}
              {tab === 'gallery' ? <Gallery /> : <PaletteCheck />}
            </ThemeScope>
          </ChartOptionsProvider>
        </div>
        <aside className="lab-workbench__editor" aria-label="Chart controls">
          <div className="stack stack--md">
            <div className="t-overline c-secondary">Rendering</div>
            <Select aria-label="Rendering" value={render} onChange={(v) => setRender(v as Render)} options={[{ value: 'lab', label: 'Follow lab appearance' }, { value: 'light', label: 'Light mode' }, { value: 'dark', label: 'Dark mode' }, { value: 'contrast', label: 'High contrast' }, { value: 'print', label: 'Print-friendly' }]} />
            <div className="t-overline c-secondary">Palette</div>
            <SegmentedControl<PaletteKind> size="sm" block value={o.palette} onChange={(v) => set({ palette: v })} options={[{ value: 'categorical', label: 'Categ.' }, { value: 'sequential', label: 'Seq.' }, { value: 'diverging', label: 'Div.' }, { value: 'monochrome', label: 'Mono' }]} aria-label="Palette" />
            <div className="t-overline c-secondary">Gridlines</div>
            <SegmentedControl size="sm" block value={o.grid} onChange={(v) => set({ grid: v })} options={[{ value: 'none', label: 'None' }, { value: 'horizontal', label: 'Horizontal' }, { value: 'both', label: 'Both' }]} aria-label="Gridlines" />
            <div className="t-overline c-secondary">Elements</div>
            <div className="stack">
              {check('axes', 'Axes')}
              {check('labels', 'Data labels')}
              {check('legend', 'Legends')}
              {check('tooltips', 'Tooltips')}
              {check('references', 'Reference lines')}
              {check('thresholds', 'Thresholds & bands')}
              {check('patterns', 'Patterns & markers (not color alone)')}
              {check('animate', 'Animate')}
            </div>
            <div className="t-overline c-secondary">Data density</div>
            <Slider aria-label="Data density" value={o.density} min={0.1} max={1} step={0.05} onChange={(v) => set({ density: v })} format={(v) => `${Math.round(v * 100)}%`} />
            <div className="row row--between">
              <div className="t-overline c-secondary">Chart tokens</div>
              <Badge>{render === 'print' ? 'print' : render}</Badge>
            </div>
            <EditorTabs
              tabs={[
                { id: 'cat', label: 'Categ.', prefix: 'color.chart.cat' },
                { id: 'seq', label: 'Seq.', prefix: ['color.chart.seq', 'color.chart.div'] },
                { id: 'role', label: 'Roles', prefix: ['color.chart.positive', 'color.chart.negative', 'color.chart.neutral', 'color.chart.grid', 'color.chart.axis', 'color.chart.label', 'color.chart.reference', 'color.chart.threshold', 'chart'] },
              ]}
            />
          </div>
        </aside>
      </div>
    </Page>
  );
}

