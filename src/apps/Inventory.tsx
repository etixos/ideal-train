import { AlertTriangle, BarChart3, Boxes, ClipboardList, Download, LayoutDashboard, Package, PackageCheck, Pencil, Plus, ShoppingCart, Truck, Warehouse } from 'lucide-react';
import { useMemo, useState } from 'react';
import { BarSeriesChart, KpiCard } from '../charts/ChartKit';
import { fmtCurrency, fmtMoneyCompact } from '../data/format';
import { PRODUCTS, PURCHASE_ORDERS, STOCK_ACTIVITY, type Product } from '../data/inventory';
import { ActivityLog, Alert, Badge, Button, Card, DataTable, Dialog, IconButton, SearchField, SegmentedControl, Select, Slider, Switch, TextInput, useToast } from '../ui';
import { AppShell } from './AppShell';

const tone = (s: Product['status']) => (s === 'In stock' ? 'success' : s === 'Low stock' ? 'warning' : s === 'Out of stock' ? 'danger' : 'neutral');

export function InventoryApp() {
  const toast = useToast();
  const [page, setPage] = useState('products');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('All');
  const [sel, setSel] = useState<string>(PRODUCTS[1].sku);
  const [adjust, setAdjust] = useState(false);
  const [products, setProducts] = useState(PRODUCTS);
  const [reorderQty, setReorderQty] = useState(36);
  const p = products.find((x) => x.sku === sel)!;
  const rows = useMemo(() => products.filter((x) => (status === 'All' || x.status === status) && (!q || `${x.name} ${x.sku}`.toLowerCase().includes(q.toLowerCase()))), [products, q, status]);
  const low = products.filter((x) => x.status === 'Low stock' || x.status === 'Out of stock');
  const value = products.reduce((s, x) => s + x.onHand * x.unitCost, 0);

  const inspector = page === 'products' && (
    <>
      <div className="app-inspector__section">
        <div className="t-overline c-secondary">{p.sku}</div>
        <div className="t-title3">{p.name}</div>
        <Badge tone={tone(p.status)} dot>
          {p.status}
        </Badge>
      </div>
      <div className="app-inspector__section">
        <dl className="m-dl">
          <dt>On hand</dt>
          <dd className="t-num">{p.onHand}</dd>
          <dt>Reorder point</dt>
          <dd className="t-num">{p.reorderPoint}</dd>
          <dt>On order</dt>
          <dd className="t-num">{p.onOrder}</dd>
          <dt>Location</dt>
          <dd>{p.location}</dd>
          <dt>Vendor</dt>
          <dd>{p.vendor}</dd>
          <dt>Unit cost</dt>
          <dd className="t-num">{fmtCurrency(p.unitCost, 2)}</dd>
          <dt>Retail</dt>
          <dd className="t-num">{fmtCurrency(p.price, 2)}</dd>
          <dt>Margin</dt>
          <dd className="t-num">{Math.round((1 - p.unitCost / p.price) * 100)}%</dd>
        </dl>
      </div>
      <div className="app-inspector__section">
        <span className="t-subhead">Reorder</span>
        <Slider aria-label="Reorder quantity" value={reorderQty} min={6} max={240} step={6} onChange={setReorderQty} format={(v) => `${v}`} />
        <Switch label="Auto-reorder at reorder point" defaultChecked={p.onOrder > 0} />
        <div className="row">
          <Button size="sm" icon={Pencil} onClick={() => setAdjust(true)}>
            Adjust
          </Button>
          <Button size="sm" variant="primary" icon={ShoppingCart} onClick={() => toast({ tone: 'success', title: 'Added to draft order', text: `${reorderQty} × ${p.name}` })}>
            Reorder
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <AppShell
      name="Stockroom"
      current={page}
      onNav={setPage}
      nav={[
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'products', label: 'Products', icon: Package, meta: products.length },
        { id: 'orders', label: 'Purchase orders', icon: Truck, meta: PURCHASE_ORDERS.length },
        { id: 'counts', label: 'Cycle counts', icon: ClipboardList },
        'Locations',
        { id: 'main', label: 'Main Street', icon: Warehouse },
        { id: 'riverside', label: 'Riverside', icon: Warehouse },
      ]}
      inspector={inspector || undefined}
      toolbar={
        <>
          <span className="m-toolbar__title">{page === 'dashboard' ? 'Dashboard' : page === 'orders' ? 'Purchase orders' : page === 'counts' ? 'Cycle counts' : 'Products'}</span>
          <div className="spacer" />
          <IconButton icon={Download} label="Export CSV" />
          <Button variant="primary" size="sm" icon={Plus}>
            {page === 'orders' ? 'New order' : 'Add product'}
          </Button>
        </>
      }
    >
      {page === 'dashboard' || page === 'main' || page === 'riverside' ? (
        <>
          <div className="grid grid--4">
            <KpiCard label="Inventory value" value={fmtMoneyCompact(value)} delta={0.032} spark={[38, 41, 40, 44, 47, 46, 49]} />
            <KpiCard label="SKUs below reorder" value={String(low.length)} delta={0.2} goodWhen="down" deltaFormat={() => '1'} suffix="since Monday" />
            <KpiCard label="Open orders" value={String(PURCHASE_ORDERS.filter((o) => o.status !== 'Received').length)} />
            <KpiCard label="Fill rate" value="96.4%" delta={-0.008} deltaFormat={(v) => `${(Math.abs(v) * 100).toFixed(1)} pts`} />
          </div>
          {low.length > 0 && (
            <Alert tone="warning" title={`${low.length} products need attention`} action={<Button size="sm" onClick={() => { setStatus('Low stock'); setPage('products'); }}>Review</Button>}>
              {low.slice(0, 3).map((x) => x.name).join(', ')} and others are below their reorder points.
            </Alert>
          )}
          <div className="grid grid--2">
            <Card title="Units sold by category" subtitle="Last 30 days">
              <BarSeriesChart height={220} data={['Apparel', 'Home Goods', 'Pantry', 'Hardware', 'Stationery', 'Gifts'].map((c) => ({ c, v: products.filter((x) => x.category === c).reduce((s, x) => s + x.sold30, 0) }))} x="c" series={[{ key: 'v', label: 'Units' }]} />
            </Card>
            <Card title="Recent activity">
              <ActivityLog entries={STOCK_ACTIVITY.map((a, i) => ({ id: String(i), actor: a.who, action: a.what, time: a.time, meta: a.ref, icon: a.kind === 'alert' ? AlertTriangle : a.kind === 'receive' ? PackageCheck : Boxes }))} />
            </Card>
          </div>
        </>
      ) : page === 'orders' ? (
        <DataTable rows={PURCHASE_ORDERS} rowKey={(r) => r.id} columns={[{ key: 'id', header: 'Order', sortable: true, render: (r) => <span className="t-code">{r.id}</span> }, { key: 'vendor', header: 'Vendor', sortable: true }, { key: 'lines', header: 'Lines', numeric: true }, { key: 'total', header: 'Total', numeric: true, sortable: true, render: (r) => fmtCurrency(r.total) }, { key: 'due', header: 'Due', sortable: true }, { key: 'status', header: 'Status', render: (r) => <Badge dot tone={r.status === 'Received' ? 'success' : r.status === 'Partially received' ? 'warning' : r.status === 'Draft' ? 'neutral' : 'info'}>{r.status}</Badge> }]} />
      ) : page === 'counts' ? (
        <Card title="Aisle B count" subtitle="Started 8:40 a.m. by Marcus Bell" footer={<><div className="spacer" /><Button>Save draft</Button><Button variant="primary" onClick={() => toast({ tone: 'success', title: 'Count posted', text: 'Variance of −3 units recorded.' })}>Post count</Button></>}>
          <DataTable flush rows={products.filter((x) => x.location.startsWith('B') || x.category === 'Hardware')} rowKey={(r) => r.sku} columns={[{ key: 'name', header: 'Product' }, { key: 'location', header: 'Bin' }, { key: 'onHand', header: 'Expected', numeric: true }, { key: 'count', header: 'Counted', numeric: true, render: (r) => <TextInput size="sm" defaultValue={String(r.sku === 'HG-HDW-4166' ? r.onHand - 3 : r.onHand)} style={{ width: 72, marginLeft: 'auto' }} aria-label={`Counted ${r.name}`} /> }]} />
        </Card>
      ) : (
        <>
          <div className="row row--wrap">
            <SearchField value={q} onChange={setQ} placeholder="Search products or SKUs" style={{ width: 280 }} />
            <SegmentedControl size="sm" value={status} onChange={setStatus} options={['All', 'In stock', 'Low stock', 'Out of stock'].map((s) => ({ value: s, label: s }))} aria-label="Status" />
          </div>
          <DataTable rows={rows} rowKey={(r) => r.sku} activeKey={sel} onRowClick={(r) => setSel(r.sku)} initialSort={{ key: 'name', dir: 'asc' }} columns={[{ key: 'sku', header: 'SKU', sortable: true, render: (r) => <span className="t-code">{r.sku}</span> }, { key: 'name', header: 'Product', sortable: true }, { key: 'category', header: 'Category', sortable: true }, { key: 'onHand', header: 'On hand', numeric: true, sortable: true }, { key: 'sold30', header: 'Sold 30d', numeric: true, sortable: true }, { key: 'status', header: 'Status', sortable: true, render: (r) => <Badge dot tone={tone(r.status)}>{r.status}</Badge> }]} />
        </>
      )}
      <Dialog
        open={adjust}
        onClose={() => setAdjust(false)}
        title={`Adjust ${p.name}`}
        footer={
          <>
            <Button onClick={() => setAdjust(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                const el = document.getElementById('adj-qty') as HTMLInputElement | null;
                const n = Math.max(0, parseInt(el?.value ?? '', 10) || 0);
                setProducts((ps) => ps.map((x) => (x.sku === p.sku ? { ...x, onHand: n, status: n === 0 ? 'Out of stock' : n < x.reorderPoint ? 'Low stock' : 'In stock' } : x)));
                setAdjust(false);
                toast({ tone: 'success', title: 'Stock adjusted', text: `${p.name}: ${n} on hand` });
              }}
            >
              Save adjustment
            </Button>
          </>
        }
      >
        <div className="stack stack--md">
          <TextInput id="adj-qty" label="New on-hand quantity" defaultValue={String(p.onHand)} inputMode="numeric" />
          <Select label="Reason" options={['Cycle count', 'Damaged', 'Theft / loss', 'Found', 'Receiving error']} />
        </div>
      </Dialog>
    </AppShell>
  );
}

