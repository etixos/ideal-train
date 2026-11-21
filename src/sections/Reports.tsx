import { FileDown, Printer } from 'lucide-react';
import { Fragment, useState, type ReactNode } from 'react';
import { AreaSeriesChart, BarSeriesChart, ChartOptionsProvider, DEFAULT_CHART_OPTIONS, DonutChart, LineSeriesChart, WaterfallChart } from '../charts/ChartKit';
import { AUDIT_LOG } from '../data/admin';
import { fmtAcct, fmtCurrency, fmtMoneyCompact, fmtNum, fmtPct, fmtSignedPct } from '../data/format';
import { PRODUCTS } from '../data/inventory';
import { CATEGORIES, categoryShare, kpis, monthlySales, profitBridge, salesByCategory, storePerformance } from '../data/retail';
import { EditorTabs } from '../lab/EditorTabs';
import { Page, Section } from '../lab/Page';
import { ThemeScope } from '../theme/ThemeScope';
import { Badge, Button, Select, Switch } from '../ui';

const PRINT_CHART = { ...DEFAULT_CHART_OPTIONS, mode: 'print' as const, animate: false, patterns: true, tooltips: false, legend: true };

function ReportPage({ title, page, total, children, landscape }: { title: string; page: number; total: number; children: ReactNode; landscape?: boolean }) {
  return (
    <div className="report-page" style={landscape ? { width: '11in', minHeight: '8.5in' } : undefined}>
      <div className="report-page__head">
        <span className="report-page__brand">Hollis &amp; Grant Mercantile</span>
        <span>{title}</span>
      </div>
      {children}
      <div className="report-page__foot">
        <span>Confidential · Prepared Nov 21, 2026 · Sample data</span>
        <span className="t-num">
          Page {page} of {total}
        </span>
      </div>
    </div>
  );
}

const Kpis = ({ items }: { items: [string, string, string?][] }) => (
  <div className="report-kpis">
    {items.map(([l, v, d]) => (
      <div key={l} className="report-kpi">
        <div className="report-kpi__label">{l}</div>
        <div className="report-kpi__value t-num">{v}</div>
        {d && <div style={{ fontSize: 'var(--report-caption-size)' }}>{d}</div>}
      </div>
    ))}
  </div>
);

const Chart = ({ children, height = 200 }: { children: ReactNode; height?: number }) => (
  <div className="report-chart" style={{ height }}>
    {children}
  </div>
);

/* ── Report templates ── */

function Executive() {
  const yoy = kpis.revenueYtd / kpis.revenuePriorYtd - 1;
  return [
    <ReportPage key="1" title="Executive Report · November 2026" page={1} total={2}>
      <div className="report-title">Executive Summary</div>
      <div className="report-subtitle">Fiscal year to date through November 30, 2026</div>
      <Kpis items={[['Revenue YTD', fmtMoneyCompact(kpis.revenueYtd), `${fmtSignedPct(yoy)} vs prior year`], ['Gross margin', fmtPct(kpis.grossMarginPct), '+0.9 pts'], ['Sell-through', fmtPct(kpis.sellThrough), '+2.4 pts'], ['Labor % of sales', fmtPct(kpis.laborPct), '+0.5 pts (unfavorable)']]} />
      <p className="report-p">
        Revenue is ahead of the prior year by {fmtPct(yoy)}, led by Main Street and the Gifts category. Margin improved on lower shrink and better full-price sell-through.<span className="report-fn">1</span> Labor cost rose faster than sales during the seasonal ramp; scheduling changes for December are under review.
      </p>
      <div className="report-h">Revenue by month</div>
      <Chart>
        <LineSeriesChart height={200} data={monthlySales} x="month" format={fmtMoneyCompact} series={[{ key: 'revenue', label: 'FY2026' }, { key: 'prior', label: 'FY2025' }, { key: 'target', label: 'Plan', dashed: true }]} />
      </Chart>
      <div className="report-h">Highlights</div>
      <table className="report-table">
        <tbody>
          {[
            ['Holiday gift boxes', 'Sold 93 units in seven days; second assembly run approved.'],
            ['Riverside', 'Exceeded plan by 4% for the third straight month.'],
            ['Harbor', 'Seven points below plan; foot traffic down on construction detour.'],
            ['Inventory sync', 'Degraded on Nov 21; no data loss.'],
          ].map(([a, b]) => (
            <tr key={a}>
              <td style={{ width: '28%', fontWeight: 600 }}>{a}</td>
              <td>{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="report-note">1. Shrink fell from 1.41% to 1.24% of sales after the cycle-count program expanded to every aisle.</div>
    </ReportPage>,
    <ReportPage key="2" title="Executive Report · November 2026" page={2} total={2}>
      <div className="report-h" style={{ marginTop: 0 }}>Store performance</div>
      <StoreTable />
      <div className="report-h">Net income bridge</div>
      <Chart height={220}>
        <WaterfallChart height={220} data={profitBridge} format={fmtMoneyCompact} />
      </Chart>
      <div className="report-callout">
        <b>Recommendation.</b> Approve the December staffing plan with two additional closing shifts at Main Street, and hold Harbor’s seasonal hires at current levels until traffic recovers.
      </div>
    </ReportPage>,
  ];
}

function StoreTable() {
  const tot = storePerformance.reduce((a, s) => ({ sales: a.sales + s.sales, target: a.target + s.target, staff: a.staff + s.staff }), { sales: 0, target: 0, staff: 0 });
  return (
    <table className="report-table">
      <thead>
        <tr>
          <th>Store</th>
          <th className="is-num">Sales</th>
          <th className="is-num">Plan</th>
          <th className="is-num">Variance</th>
          <th className="is-num">Attain.</th>
          <th className="is-num">Staff</th>
          <th className="is-num">Sales / sq ft</th>
        </tr>
      </thead>
      <tbody>
        {storePerformance.map((s) => (
          <tr key={s.store}>
            <td>{s.store}</td>
            <td className="is-num">{fmtNum(s.sales)}</td>
            <td className="is-num">{fmtNum(s.target)}</td>
            <td className="is-num">{fmtAcct(s.sales - s.target)}</td>
            <td className="is-num">{fmtPct(s.attainment)}</td>
            <td className="is-num">{s.staff}</td>
            <td className="is-num">{fmtCurrency(s.sales / s.sqft)}</td>
          </tr>
        ))}
        <tr className="is-total">
          <td>Total</td>
          <td className="is-num">{fmtNum(tot.sales)}</td>
          <td className="is-num">{fmtNum(tot.target)}</td>
          <td className="is-num">{fmtAcct(tot.sales - tot.target)}</td>
          <td className="is-num">{fmtPct(tot.sales / tot.target)}</td>
          <td className="is-num">{tot.staff}</td>
          <td className="is-num">—</td>
        </tr>
      </tbody>
    </table>
  );
}

function Financial() {
  const rev = monthlySales.reduce((s, m) => s + m.revenue, 0);
  const cogs = monthlySales.reduce((s, m) => s + m.cogs, 0);
  const prior = monthlySales.reduce((s, m) => s + m.prior, 0);
  const pcogs = Math.round(prior * 0.592);
  const lines: [string, number, number, ('group' | 'sub' | 'total' | 'indent')?][] = [
    ['Revenue', 0, 0, 'group'],
    ['Merchandise sales', rev * 0.962, prior * 0.958, 'indent'],
    ['Services & gift wrap', rev * 0.038, prior * 0.042, 'indent'],
    ['Net revenue', rev, prior, 'sub'],
    ['Cost of goods sold', -cogs, -pcogs, 'indent'],
    ['Gross profit', rev - cogs, prior - pcogs, 'sub'],
    ['Operating expenses', 0, 0, 'group'],
    ['Wages & benefits', -rev * 0.142, -prior * 0.137, 'indent'],
    ['Occupancy', -412000, -375000, 'indent'],
    ['Marketing', -198000, -154000, 'indent'],
    ['General & administrative', -231000, -224000, 'indent'],
    ['Depreciation', -96000, -91000, 'indent'],
  ];
  const opex = lines.filter((l) => l[0] !== 'Cost of goods sold' && l[3] === 'indent' && l[1] < 0).reduce((s, l) => s + l[1], 0);
  const popex = lines.filter((l) => l[0] !== 'Cost of goods sold' && l[3] === 'indent' && l[2] < 0).reduce((s, l) => s + l[2], 0);
  const all: typeof lines = [...lines, ['Total operating expenses', opex, popex, 'sub'], ['Operating income', rev - cogs + opex, prior - pcogs + popex, 'total']];
  return [
    <ReportPage key="1" title="Statement of Income" page={1} total={1}>
      <div className="report-title">Statement of Income</div>
      <div className="report-subtitle">For the twelve months ending December 31, 2026 (forecast) · in U.S. dollars</div>
      <table className="report-table">
        <thead>
          <tr>
            <th />
            <th className="is-num">FY2026</th>
            <th className="is-num">FY2025</th>
            <th className="is-num">Change</th>
            <th className="is-num">%</th>
          </tr>
        </thead>
        <tbody>
          {all.map(([label, a, b, kind]) => (
            <tr key={label} className={kind === 'group' ? 'is-group' : kind === 'sub' ? 'is-sub' : kind === 'total' ? 'is-total' : undefined}>
              <td className={kind === 'indent' ? 'is-indent' : undefined}>{label}</td>
              {kind === 'group' ? (
                <td colSpan={4} />
              ) : (
                <>
                  <td className="is-num">{fmtAcct(Math.round(a))}</td>
                  <td className="is-num">{fmtAcct(Math.round(b))}</td>
                  <td className="is-num">{fmtAcct(Math.round(a - b))}</td>
                  <td className="is-num">{b ? fmtSignedPct((a - b) / Math.abs(b)) : '—'}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="report-note">Negative amounts are shown in parentheses. December is forecast from the approved plan. Unaudited.</div>
      <div className="report-h">Gross margin by month</div>
      <Chart height={170}>
        <BarSeriesChart height={170} data={monthlySales.map((m) => ({ month: m.month, gm: +((m.grossMargin / m.revenue) * 100).toFixed(1) }))} x="month" series={[{ key: 'gm', label: 'Gross margin %' }]} format={(v) => `${v}%`} reference={{ value: 41, label: 'Target' }} />
      </Chart>
    </ReportPage>,
  ];
}

function SalesInventory() {
  const low = PRODUCTS.filter((p) => p.status !== 'In stock');
  const totalValue = PRODUCTS.reduce((s, p) => s + p.onHand * p.unitCost, 0);
  return [
    <ReportPage key="1" title="Sales & Inventory Report · Week 47" page={1} total={2}>
      <div className="report-title">Sales &amp; Inventory</div>
      <div className="report-subtitle">Week ending November 22, 2026 · All stores</div>
      <Kpis items={[['Inventory value', fmtMoneyCompact(totalValue)], ['SKUs below reorder', String(low.length)], ['Inventory turns', kpis.inventoryTurns.toFixed(1)], ['Sell-through', fmtPct(kpis.sellThrough)]]} />
      <div className="report-h">Sales by category</div>
      <Chart height={200}>
        <AreaSeriesChart stacked height={200} data={salesByCategory} x="month" series={CATEGORIES.map((c) => ({ key: c }))} format={fmtMoneyCompact} />
      </Chart>
      <div className="report-h">Category share</div>
      <Chart height={170}>
        <DonutChart height={170} data={categoryShare} />
      </Chart>
    </ReportPage>,
    <ReportPage key="2" title="Sales & Inventory Report · Week 47" page={2} total={2}>
      <div className="report-h" style={{ marginTop: 0 }}>Exceptions: products requiring action</div>
      <table className="report-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Product</th>
            <th>Status</th>
            <th className="is-num">On hand</th>
            <th className="is-num">Reorder pt.</th>
            <th className="is-num">On order</th>
            <th className="is-num">Sold 30d</th>
          </tr>
        </thead>
        <tbody>
          {low.map((p) => (
            <tr key={p.sku}>
              <td>{p.sku}</td>
              <td>{p.name}</td>
              <td>{p.status}</td>
              <td className="is-num">{p.onHand}</td>
              <td className="is-num">{p.reorderPoint}</td>
              <td className="is-num">{p.onOrder}</td>
              <td className="is-num">{p.sold30}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="report-h">Full inventory valuation</div>
      <table className="report-table">
        <thead>
          <tr>
            <th>Category</th>
            <th className="is-num">SKUs</th>
            <th className="is-num">Units</th>
            <th className="is-num">Cost value</th>
            <th className="is-num">Retail value</th>
          </tr>
        </thead>
        <tbody>
          {CATEGORIES.map((c) => {
            const ps = PRODUCTS.filter((p) => p.category === c);
            return (
              <tr key={c}>
                <td>{c}</td>
                <td className="is-num">{ps.length}</td>
                <td className="is-num">{fmtNum(ps.reduce((s, p) => s + p.onHand, 0))}</td>
                <td className="is-num">{fmtNum(ps.reduce((s, p) => s + p.onHand * p.unitCost, 0))}</td>
                <td className="is-num">{fmtNum(ps.reduce((s, p) => s + p.onHand * p.price, 0))}</td>
              </tr>
            );
          })}
          <tr className="is-total">
            <td>Total</td>
            <td className="is-num">{PRODUCTS.length}</td>
            <td className="is-num">{fmtNum(PRODUCTS.reduce((s, p) => s + p.onHand, 0))}</td>
            <td className="is-num">{fmtNum(totalValue)}</td>
            <td className="is-num">{fmtNum(PRODUCTS.reduce((s, p) => s + p.onHand * p.price, 0))}</td>
          </tr>
        </tbody>
      </table>
    </ReportPage>,
  ];
}

function Performance() {
  return [
    <ReportPage key="1" title="Store Performance Summary · Q4" page={1} total={1}>
      <div className="report-title">Store Performance Summary</div>
      <div className="report-subtitle">Quarter to date · ranked by attainment</div>
      <StoreTable />
      <div className="report-h">Attainment vs. plan</div>
      <Chart height={200}>
        <BarSeriesChart horizontal height={200} data={[...storePerformance].sort((a, b) => b.attainment - a.attainment).map((s) => ({ store: s.store, pct: +(s.attainment * 100).toFixed(1) }))} x="store" series={[{ key: 'pct', label: 'Attainment %' }]} format={(v) => `${v}%`} reference={{ value: 100, label: 'Plan' }} />
      </Chart>
      <div className="report-h">Scorecard</div>
      <table className="report-table">
        <thead>
          <tr>
            <th>Store</th>
            <th className="is-num">Conversion</th>
            <th className="is-num">Avg basket</th>
            <th className="is-num">NPS</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          {storePerformance.map((s) => (
            <tr key={s.store}>
              <td>{s.store}</td>
              <td className="is-num">{fmtPct(s.conversion)}</td>
              <td className="is-num">{fmtCurrency(s.basket, 2)}</td>
              <td className="is-num">{s.nps}</td>
              <td>{s.attainment >= 1 ? '● Meets plan' : s.attainment >= 0.95 ? '◐ Near plan' : '○ Below plan'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="report-note">Ratings use symbols as well as words, so they read correctly in grayscale print.</div>
    </ReportPage>,
  ];
}

function Analytical() {
  return [
    <ReportPage key="1" title="Analysis · Holiday Traffic and Conversion" page={1} total={1}>
      <div className="report-title">Does dwell time drive basket size?</div>
      <div className="report-subtitle">An analysis of 140 sampled transactions across three stores</div>
      <div className="report-h">Summary</div>
      <p className="report-p">Each additional minute in store is associated with about $1.90 of basket value (r = 0.71). The effect is strongest at Main Street, where demonstration tables extend visits.</p>
      <div className="report-h">Method</div>
      <p className="report-p">Transactions were sampled from November 1–20. Dwell time comes from entry sensors matched to receipt timestamps. Outliers above $250 were excluded (n = 6).</p>
      <div className="report-h">Findings</div>
      <Chart height={210}>
        <LineSeriesChart height={210} data={[5, 10, 15, 20, 25, 30, 35, 40].map((m) => ({ m: `${m} min`, main: 14 + m * 2.2, riverside: 13 + m * 1.8, harbor: 12 + m * 1.5 }))} x="m" series={[{ key: 'main', label: 'Main Street' }, { key: 'riverside', label: 'Riverside' }, { key: 'harbor', label: 'Harbor' }]} format={(v) => `$${Math.round(v)}`} />
      </Chart>
      <div className="report-note">Figure 1. Fitted basket value by dwell time. Lines are distinguished by dash pattern as well as color.</div>
      <div className="report-h">Limitations</div>
      <p className="report-p">Correlation is not causation: customers who intend to buy more may simply stay longer. A controlled test of demonstration tables at Harbor is proposed for January.</p>
    </ReportPage>,
  ];
}

function Audit() {
  return [
    <ReportPage key="1" title="Access & Activity Audit · Nov 20–21" page={1} total={1}>
      <div className="report-title">Audit Report</div>
      <div className="report-subtitle">System access and configuration changes · Reviewed by Dana Whitlock</div>
      <Kpis items={[['Events reviewed', '1,284'], ['Exceptions', '2'], ['Users without MFA', '3'], ['Open findings', '1']]} />
      <div className="report-h">Findings</div>
      <table className="report-table">
        <thead>
          <tr>
            <th style={{ width: 40 }}>#</th>
            <th>Finding</th>
            <th>Severity</th>
            <th>Owner</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>A-1</td>
            <td>Three active accounts without multi-factor authentication.</td>
            <td>▲ High</td>
            <td>D. Whitlock</td>
            <td>Open, due Nov 28</td>
          </tr>
          <tr>
            <td>A-2</td>
            <td>Repeated failed sign-ins on a suspended account.</td>
            <td>■ Medium</td>
            <td>IT</td>
            <td>Closed, account locked</td>
          </tr>
        </tbody>
      </table>
      <div className="report-h">Event log (excerpt)</div>
      <table className="report-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Actor</th>
            <th>Action</th>
            <th>Target</th>
          </tr>
        </thead>
        <tbody>
          {AUDIT_LOG.map((e) => (
            <tr key={e.time + e.action}>
              <td className="t-num" style={{ whiteSpace: 'nowrap' }}>
                {e.time}
              </td>
              <td>{e.actor}</td>
              <td>{e.action}</td>
              <td>{e.target}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24pt', marginTop: '28pt' }}>
        {['Prepared by', 'Approved by'].map((l) => (
          <div key={l} style={{ borderTop: '0.75pt solid var(--report-rule-strong)', paddingTop: 4, fontSize: 'var(--report-caption-size)' }}>
            {l} · Signature and date
          </div>
        ))}
      </div>
    </ReportPage>,
  ];
}

function MultiPage() {
  const sections = [
    ['1. Purpose', 'This handbook sets out how Hollis & Grant stores receive, count, store and transfer merchandise. It applies to every store and to the central stockroom.'],
    ['2. Receiving', 'Receiving hours are 7:00 a.m. to 4:00 p.m. Every carton is counted against the packing slip before the carrier leaves. Shortages, overages and damage are noted on the carrier copy and photographed.'],
    ['3. Put-away', 'Merchandise is shelved within one business day. Location codes follow the pattern Aisle–Bay (for example, B-07). Fast movers go at waist height.'],
    ['4. Cycle counts', 'Each aisle is counted monthly. In the fourth quarter, Hardware and Gifts are counted every two weeks. Variances over five units or $200 are recounted by a second associate.'],
    ['5. Transfers', 'Transfers between stores require a transfer number from the inventory system. The sending store prints a manifest and the receiving store confirms within 24 hours.'],
    ['6. Returns to vendor', 'Damaged goods are tagged RTV and held in Aisle E for 14 days pending vendor authorization.'],
    ['7. Shrink', 'Unexplained losses are reported weekly. Any single loss over $500 is escalated to the store manager the same day.'],
  ];
  const pages = [sections.slice(0, 3), sections.slice(3, 6), sections.slice(6)];
  return pages.map((ps, i) => (
    <ReportPage key={i} title="Inventory Operations Handbook" page={i + 1} total={pages.length}>
      {i === 0 && (
        <>
          <div className="report-title">Inventory Operations Handbook</div>
          <div className="report-subtitle">Revision 4 · Effective December 1, 2026</div>
          <div className="report-callout">
            <b>Contents</b>
            {sections.map(([h], k) => (
              <div key={h} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{h}</span>
                <span className="t-num">{k < 3 ? 1 : k < 6 ? 2 : 3}</span>
              </div>
            ))}
          </div>
        </>
      )}
      {ps.map(([h, p]) => (
        <Fragment key={h}>
          <div className="report-h">{h}</div>
          <p className="report-p">{p}</p>
          <p className="report-p">Managers should review this section with new associates during their first week and record the review in the training log.</p>
        </Fragment>
      ))}
      {i === pages.length - 1 && <div className="report-note">End of document. Questions go to Operations.</div>}
    </ReportPage>
  ));
}

function PrintDashboard() {
  return [
    <ReportPage key="1" title="Weekly Dashboard · Week 47" page={1} total={1} landscape>
      <div className="report-title" style={{ fontSize: '18pt' }}>
        Weekly Dashboard
      </div>
      <Kpis items={[['Revenue YTD', fmtMoneyCompact(kpis.revenueYtd)], ['Gross margin', fmtPct(kpis.grossMarginPct)], ['Turns', kpis.inventoryTurns.toFixed(1)], ['Shrink', fmtPct(kpis.shrinkPct, 2)]]} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12pt' }}>
        <div>
          <div className="report-h" style={{ marginTop: 0 }}>
            Revenue trend
          </div>
          <Chart height={180}>
            <LineSeriesChart height={180} data={monthlySales} x="month" series={[{ key: 'revenue', label: 'FY2026' }, { key: 'prior', label: 'FY2025' }]} format={fmtMoneyCompact} />
          </Chart>
        </div>
        <div>
          <div className="report-h" style={{ marginTop: 0 }}>
            Sales by store
          </div>
          <Chart height={180}>
            <BarSeriesChart height={180} data={storePerformance} x="store" series={[{ key: 'sales', label: 'Sales' }, { key: 'target', label: 'Plan' }]} format={fmtMoneyCompact} />
          </Chart>
        </div>
        <div>
          <div className="report-h">Net income bridge</div>
          <Chart height={170}>
            <WaterfallChart height={170} data={profitBridge} format={fmtMoneyCompact} />
          </Chart>
        </div>
        <div>
          <div className="report-h">Category share</div>
          <Chart height={170}>
            <DonutChart height={170} data={categoryShare} />
          </Chart>
        </div>
      </div>
    </ReportPage>,
  ];
}

const REPORTS: { id: string; label: string; render: () => React.ReactElement[] }[] = [
  { id: 'executive', label: 'Executive report', render: Executive },
  { id: 'financial', label: 'Financial statement', render: Financial },
  { id: 'sales', label: 'Sales & inventory report', render: SalesInventory },
  { id: 'performance', label: 'Performance summary', render: Performance },
  { id: 'analytical', label: 'Analytical report', render: Analytical },
  { id: 'audit', label: 'Audit report', render: Audit },
  { id: 'multipage', label: 'Multi-page document', render: MultiPage },
  { id: 'dashboard', label: 'Printable dashboard', render: PrintDashboard },
];

export function Reports({ sub }: { sub?: string }) {
  const [id, setId] = useState(REPORTS.find((r) => r.id === sub)?.id ?? 'executive');
  const [scale, setScale] = useState(true);
  const report = REPORTS.find((r) => r.id === id)!;
  const print = () => {
    document.body.classList.add('lab-printing-report');
    const done = () => {
      document.body.classList.remove('lab-printing-report');
      window.removeEventListener('afterprint', done);
    };
    window.addEventListener('afterprint', done);
    window.print();
    window.setTimeout(done, 1500);
  };
  return (
    <Page
      eyebrow="Laboratories"
      title="Reports & Documents"
      description="Shared standards for printed and on-screen reports: typography, margins, headers and footers, tables, totals, charts, annotations and pagination. Reports keep the Mercantile language and switch to ink on white paper."
      actions={
        <>
          <Button icon={Printer} onClick={print}>
            Print
          </Button>
          <Button icon={FileDown} variant="primary" onClick={print}>
            Export PDF
          </Button>
        </>
      }
    >
      <div className="lab-workbench lab-print-target" style={{ gridTemplateColumns: 'minmax(0, 1fr) 320px' }}>
        <div className="stack stack--md" style={{ minWidth: 0 }}>
          <div className="row row--wrap lab-print-hide">
            <Select aria-label="Report" value={id} onChange={setId} options={REPORTS.map((r) => ({ value: r.id, label: r.label }))} />
            <Badge>{report.render().length} page{report.render().length > 1 ? 's' : ''}</Badge>
            <div className="spacer" />
            <Switch checked={scale} onChange={setScale} label="Fit to width" />
          </div>
          <ThemeScope appearance="light" contrast="standard" surface={false}>
            <ChartOptionsProvider value={PRINT_CHART}>
              <div className="report-viewer" style={scale ? { zoom: 0.8 } as React.CSSProperties : undefined}>
                {report.render()}
              </div>
            </ChartOptionsProvider>
          </ThemeScope>
          <p className="t-footnote c-secondary lab-print-hide">“Export PDF” opens the browser print dialog with letter-size pages and no browser margins. Choose “Save as PDF” as the destination. Only the selected report is printed.</p>
        </div>
        <aside className="lab-workbench__editor lab-print-hide" aria-label="Report standards">
          <div className="t-overline c-secondary lab-workbench__title">Report standards</div>
          <EditorTabs
            tabs={[
              { id: 'type', label: 'Type & page', prefix: ['report.heading', 'report.body', 'report.title', 'report.table', 'report.caption', 'report.page.margin'] },
              { id: 'ink', label: 'Ink & rules', prefix: ['report.page.bg', 'report.ink', 'report.rule', 'report.total', 'report.accent'] },
            ]}
          />
        </aside>
      </div>
      <Section title="Standards in brief">
        <div className="grid grid--3">
          {[
            ['Typography', 'Serif headings (report.heading.family) and sans-serif body at 10.5 pt. Tables at 9.5 pt with tabular figures.'],
            ['Page', 'US Letter, 0.75 in margins. A running header carries the brand and report title; the footer carries confidentiality and “Page n of N”.'],
            ['Tables & totals', 'Hairline rules between rows, a strong rule under headers, a single rule above subtotals, and a double rule under grand totals. Negatives in parentheses.'],
            ['Charts', 'Print palette, dash patterns and markers so series stay distinct in grayscale. No animation or tooltips.'],
            ['Annotations', 'Brass-ruled notes for footnotes and figure captions. Superscript note markers in the accent color.'],
            ['Status', 'Symbols and words (● ◐ ○, ▲ ■) with color, never color alone.'],
          ].map(([h, p]) => (
            <div key={h} className="m-card m-card--pad">
              <div className="t-headline">{h}</div>
              <p className="t-footnote c-secondary" style={{ marginTop: 4 }}>
                {p}
              </p>
            </div>
          ))}
        </div>
      </Section>
    </Page>
  );
}
