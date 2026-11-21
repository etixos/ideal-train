import { Banknote, CreditCard, FileSpreadsheet, LayoutDashboard, Landmark, PiggyBank, Receipt } from 'lucide-react';
import { useState } from 'react';
import { ComboChart, DonutChart, KpiCard, LineSeriesChart, Trend, WaterfallChart } from '../charts/ChartKit';
import { fmtAcct, fmtCurrency, fmtMoneyCompact, fmtPct, fmtSignedPct } from '../data/format';
import { kpis, monthlySales, profitBridge, storePerformance } from '../data/retail';
import { Badge, Button, Card, DataTable, SegmentedControl, Select, TextInput, useToast } from '../ui';
import { AppShell } from './AppShell';

const BUDGET = [
  { line: 'Wages & benefits', budget: 1_420_000, actual: 1_486_200 },
  { line: 'Occupancy', budget: 410_000, actual: 412_000 },
  { line: 'Marketing', budget: 180_000, actual: 198_000 },
  { line: 'General & admin', budget: 240_000, actual: 231_400 },
  { line: 'Shrink', budget: 75_000, actual: 61_300 },
  { line: 'Freight', budget: 96_000, actual: 88_900 },
];

const TRANSACTIONS = [
  { id: 'TX-90412', date: 'Nov 20', payee: 'Halyard Outfitters', account: 'Accounts payable', amount: -8420, status: 'Scheduled' },
  { id: 'TX-90407', date: 'Nov 20', payee: 'Card settlement: Main Street', account: 'Operating', amount: 41862.15, status: 'Cleared' },
  { id: 'TX-90399', date: 'Nov 19', payee: 'Harbor Properties LLC', account: 'Rent', amount: -11500, status: 'Cleared' },
  { id: 'TX-90388', date: 'Nov 19', payee: 'Card settlement: Riverside', account: 'Operating', amount: 28331.4, status: 'Cleared' },
  { id: 'TX-90371', date: 'Nov 18', payee: 'Payroll: period 23', account: 'Payroll', amount: -96214.88, status: 'Cleared' },
  { id: 'TX-90365', date: 'Nov 18', payee: 'Cooper Hill Apiary', account: 'Accounts payable', amount: -1190, status: 'Pending approval' },
];

export function FinanceApp() {
  const toast = useToast();
  const [page, setPage] = useState('overview');
  const [period, setPeriod] = useState('ytd');
  return (
    <AppShell
      name="Countinghouse"
      current={page}
      onNav={setPage}
      nav={[
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'pnl', label: 'Profit & loss', icon: FileSpreadsheet },
        { id: 'budget', label: 'Budget vs actual', icon: PiggyBank },
        { id: 'cash', label: 'Cash & transactions', icon: Banknote },
        'Accounts',
        { id: 'operating', label: 'Operating ••4412', icon: Landmark },
        { id: 'card', label: 'Corporate card', icon: CreditCard },
      ]}
      toolbar={
        <>
          <span className="m-toolbar__title">{page === 'pnl' ? 'Profit & loss' : page === 'budget' ? 'Budget vs actual' : page === 'cash' || page === 'operating' || page === 'card' ? 'Cash & transactions' : 'Financial overview'}</span>
          <div className="spacer" />
          <SegmentedControl size="sm" value={period} onChange={setPeriod} options={[{ value: 'mtd', label: 'MTD' }, { value: 'qtd', label: 'QTD' }, { value: 'ytd', label: 'YTD' }]} aria-label="Period" />
          <Button size="sm" icon={Receipt} onClick={() => toast({ title: 'Export started', text: 'Your workbook will download shortly.' })}>
            Export
          </Button>
        </>
      }
    >
      {page === 'overview' && (
        <>
          <div className="grid grid--4">
            <KpiCard label="Revenue" value={fmtMoneyCompact(kpis.revenueYtd)} delta={kpis.revenueYtd / kpis.revenuePriorYtd - 1} spark={monthlySales.slice(0, 11).map((m) => m.revenue)} />
            <KpiCard label="Gross margin" value={fmtPct(kpis.grossMarginPct)} delta={0.009} deltaFormat={(v) => `${(v * 100).toFixed(1)} pts`} />
            <KpiCard label="Operating income" value={fmtMoneyCompact(712000)} delta={0.163} spark={[44, 48, 41, 52, 55, 60, 58, 64, 61, 70]} sparkTone="positive" />
            <KpiCard label="Cash on hand" value={fmtMoneyCompact(1_284_000)} delta={-0.042} footnote="As of Nov 20, 9:00 a.m." />
          </div>
          <div className="grid grid--2">
            <Card title="Revenue, COGS and net income">
              <ComboChart height={240} data={monthlySales} x="month" format={fmtMoneyCompact} bars={[{ key: 'revenue', label: 'Revenue' }, { key: 'cogs', label: 'COGS' }]} lines={[{ key: 'net', label: 'Net income' }]} />
            </Card>
            <Card title="Net income bridge" subtitle="FY2025 → FY2026">
              <WaterfallChart height={240} data={profitBridge} format={fmtMoneyCompact} />
            </Card>
          </div>
          <Card title="Store contribution" flush>
            <DataTable flush rows={storePerformance} rowKey={(r) => r.store} columns={[{ key: 'store', header: 'Store' }, { key: 'sales', header: 'Sales', numeric: true, render: (r) => fmtCurrency(r.sales) }, { key: 'target', header: 'Plan', numeric: true, render: (r) => fmtCurrency(r.target) }, { key: 'var', header: 'Variance', numeric: true, render: (r) => <span className={r.sales >= r.target ? 'c-success' : 'c-danger'}>{fmtAcct(r.sales - r.target)}</span> }, { key: 'att', header: 'Attainment', numeric: true, render: (r) => <Trend delta={r.attainment - 1} /> }]} />
          </Card>
        </>
      )}
      {page === 'pnl' && (
        <div className="grid grid--2">
          <Card title="Statement of income" subtitle="Year to date · USD" flush>
            <table className="m-table">
              <tbody>
                {[
                  ['Net revenue', kpis.revenueYtd, false],
                  ['Cost of goods sold', -kpis.revenueYtd * 0.582, false],
                  ['Gross profit', kpis.revenueYtd * 0.418, true],
                  ['Wages & benefits', -1_486_200, false],
                  ['Occupancy', -412_000, false],
                  ['Marketing', -198_000, false],
                  ['General & admin', -231_400, false],
                  ['Operating income', kpis.revenueYtd * 0.418 - 2_327_600, true],
                ].map(([l, v, b]) => (
                  <tr key={l as string} style={b ? { fontWeight: 600 } : undefined}>
                    <td style={b ? { borderTop: '1px solid var(--color-border-strong)' } : { paddingLeft: 28 }}>{l as string}</td>
                    <td className="is-num" style={b ? { borderTop: '1px solid var(--color-border-strong)' } : undefined}>
                      {fmtAcct(Math.round(v as number))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Card title="Gross margin trend">
            <LineSeriesChart height={280} data={monthlySales.map((m) => ({ month: m.month, gm: +((m.grossMargin / m.revenue) * 100).toFixed(1) }))} x="month" series={[{ key: 'gm', label: 'GM %' }]} format={(v) => `${v}%`} reference={{ value: 41, label: 'Target' }} />
          </Card>
        </div>
      )}
      {page === 'budget' && (
        <>
          <DataTable
            rows={BUDGET}
            rowKey={(r) => r.line}
            columns={[
              { key: 'line', header: 'Expense line', sortable: true },
              { key: 'budget', header: 'Budget', numeric: true, sortable: true, render: (r) => fmtCurrency(r.budget), footer: fmtCurrency(BUDGET.reduce((s, r) => s + r.budget, 0)) },
              { key: 'actual', header: 'Actual', numeric: true, sortable: true, render: (r) => fmtCurrency(r.actual), footer: fmtCurrency(BUDGET.reduce((s, r) => s + r.actual, 0)) },
              { key: 'var', header: 'Variance', numeric: true, sortable: true, sortValue: (r) => r.budget - r.actual, render: (r) => <span className={r.actual <= r.budget ? 'c-success' : 'c-danger'}>{fmtAcct(r.budget - r.actual)}</span>, footer: fmtAcct(BUDGET.reduce((s, r) => s + r.budget - r.actual, 0)) },
              { key: 'pct', header: '%', numeric: true, render: (r) => fmtSignedPct(r.actual / r.budget - 1) },
              { key: 'flag', header: 'Status', render: (r) => (r.actual > r.budget * 1.05 ? <Badge tone="danger" dot>Over</Badge> : r.actual > r.budget ? <Badge tone="warning" dot>Watch</Badge> : <Badge tone="success" dot>Under</Badge>) },
            ]}
          />
          <Card title="Spend mix">
            <DonutChart height={220} data={BUDGET.map((b) => ({ name: b.line, value: Math.round((b.actual / BUDGET.reduce((s, x) => s + x.actual, 0)) * 100) }))} />
          </Card>
        </>
      )}
      {(page === 'cash' || page === 'operating' || page === 'card') && (
        <>
          <div className="grid grid--3">
            <KpiCard label="Operating ••4412" value={fmtCurrency(1_031_440)} />
            <KpiCard label="Payroll ••0918" value={fmtCurrency(184_200)} />
            <KpiCard label="Reserve ••7720" value={fmtCurrency(68_360)} />
          </div>
          <DataTable rows={TRANSACTIONS} rowKey={(r) => r.id} selectable columns={[{ key: 'date', header: 'Date' }, { key: 'payee', header: 'Payee', sortable: true }, { key: 'account', header: 'Account', sortable: true }, { key: 'amount', header: 'Amount', numeric: true, sortable: true, render: (r) => <span className={r.amount < 0 ? undefined : 'c-success'}>{r.amount < 0 ? `(${fmtCurrency(-r.amount, 2)})` : fmtCurrency(r.amount, 2)}</span> }, { key: 'status', header: 'Status', render: (r) => <Badge dot tone={r.status === 'Cleared' ? 'success' : r.status === 'Scheduled' ? 'info' : 'warning'}>{r.status}</Badge> }]} />
          <Card title="Schedule a payment" footer={<><div className="spacer" /><Button variant="primary" onClick={() => toast({ tone: 'success', title: 'Payment scheduled' })}>Schedule</Button></>}>
            <div className="grid grid--3">
              <Select label="From account" options={['Operating ••4412', 'Payroll ••0918']} />
              <TextInput label="Payee" defaultValue="Cooper Hill Apiary" />
              <TextInput label="Amount" defaultValue="1,190.00" suffix={<span className="c-tertiary t-footnote">USD</span>} />
            </div>
          </Card>
        </>
      )}
    </AppShell>
  );
}
