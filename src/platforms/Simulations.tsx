import {
  ArrowLeft,
  BarChart3,
  Battery,
  Boxes,
  Check,
  ChevronLeft,
  ChevronRight,
  Filter,
  Home,
  Inbox,
  LayoutGrid,
  Menu as MenuIcon,
  MoreHorizontal,
  Package,
  PackageCheck,
  PanelLeft,
  PanelRight,
  Plus,
  Search,
  Settings,
  Share,
  Signal,
  Truck,
  User,
  Wifi,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { fmtCurrency } from '../data/format';
import { ThemeScope } from '../theme/ThemeScope';
import { Badge, Breadcrumbs, Button, Checkbox, DataTable, Icon, IconButton, Menu, NavHeading, NavItem, SearchField, SegmentedControl, Sheet, Sidebar, Switch, TextInput, Toolbar, cx } from '../ui';
import { LINES, ORDERS, statusTone, type Order, type Step } from './workflow';

export interface SimProps {
  step: Step;
  onStep: (s: Step) => void;
  orderId: string;
  onOrder: (id: string) => void;
}

const order = (id: string) => ORDERS.find((o) => o.id === id) ?? ORDERS[0];
const progress = (o: Order) => {
  const lines = LINES[o.id] ?? [];
  const ord = lines.reduce((s, l) => s + l.ordered, 0);
  const rec = lines.reduce((s, l) => s + l.received, 0);
  return { ord, rec, pct: ord ? rec / ord : 0 };
};

/* ══════════════════════ WEB ══════════════════════ */

export function WebSim({ step, onStep, orderId, onOrder, mobile }: SimProps & { mobile?: boolean }) {
  const o = order(orderId);
  const [counts, setCounts] = useState<Record<string, string>>({});
  const lines = LINES[o.id] ?? [];
  const list = (
    <div className="stack stack--md">
      <div className="row row--wrap">
        <h2 className="t-title2" style={{ flex: 1 }}>
          Purchase orders
        </h2>
        {!mobile && (
          <Button variant="primary" icon={Plus}>
            New order
          </Button>
        )}
      </div>
      {mobile ? (
        <div className="stack">
          {ORDERS.map((x) => (
            <button key={x.id} type="button" className="m-card m-card--pad m-card--interactive" style={{ textAlign: 'left', font: 'inherit', color: 'inherit' }} onClick={() => { onOrder(x.id); onStep('detail'); }}>
              <div className="row row--between">
                <span className="t-headline">{x.id}</span>
                <Badge tone={statusTone(x.status)} dot>
                  {x.status}
                </Badge>
              </div>
              <div className="t-footnote c-secondary">
                {x.vendor} · {fmtCurrency(x.total)}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <DataTable rows={ORDERS} rowKey={(r) => r.id} activeKey={o.id} onRowClick={(r) => { onOrder(r.id); onStep('detail'); }} columns={[{ key: 'id', header: 'Order', sortable: true }, { key: 'vendor', header: 'Vendor', sortable: true }, { key: 'lines', header: 'Lines', numeric: true }, { key: 'total', header: 'Total', numeric: true, render: (r) => fmtCurrency(r.total) }, { key: 'due', header: 'Due' }, { key: 'status', header: 'Status', render: (r) => <Badge tone={statusTone(r.status)} dot>{r.status}</Badge> }]} />
      )}
    </div>
  );
  const detail = (
    <div className="stack stack--md">
      <Breadcrumbs items={[{ label: 'Purchase orders', onClick: () => onStep('list') }, { label: o.id }]} />
      <div className="row row--wrap">
        <div style={{ flex: 1 }}>
          <h2 className="t-title2">{o.id}</h2>
          <div className="c-secondary">
            {o.vendor} · due {o.due}
          </div>
        </div>
        <Badge tone={statusTone(o.status)} dot>
          {o.status}
        </Badge>
        <Button variant="primary" icon={PackageCheck} onClick={() => onStep('receive')}>
          Receive
        </Button>
      </div>
      <DataTable rows={lines} rowKey={(r) => r.sku} columns={[{ key: 'name', header: 'Item' }, { key: 'ordered', header: 'Ordered', numeric: true }, { key: 'received', header: 'Received', numeric: true }, ...(mobile ? [] : [{ key: 'cost', header: 'Unit cost', numeric: true, render: (r: (typeof lines)[number]) => fmtCurrency(r.cost, 2) }])]} />
    </div>
  );
  const receive = (
    <div className="stack stack--md" style={{ maxWidth: 560 }}>
      <Breadcrumbs items={[{ label: 'Purchase orders', onClick: () => onStep('list') }, { label: o.id, onClick: () => onStep('detail') }, { label: 'Receive' }]} />
      <h2 className="t-title2">Receive {o.id}</h2>
      {lines.map((l) => (
        <TextInput key={l.sku} label={l.name} help={`Ordered ${l.ordered} · previously received ${l.received}`} value={counts[l.sku] ?? String(l.ordered - l.received)} onChange={(v) => setCounts({ ...counts, [l.sku]: v })} inputMode="numeric" />
      ))}
      <Checkbox label="Print shelf labels" defaultChecked />
      <div className="row">
        <Button onClick={() => onStep('detail')}>Cancel</Button>
        <Button variant="primary" onClick={() => onStep('list')}>
          Post receipt
        </Button>
      </div>
    </div>
  );
  return (
    <div className="browser-frame" style={{ width: mobile ? 390 : '100%', height: mobile ? 720 : 600 }}>
      <div className="browser-frame__bar">
        <span className="mac-lights">
          <span style={{ background: '#E0605A' }} />
          <span style={{ background: '#E5B53F' }} />
          <span style={{ background: '#67B954' }} />
        </span>
        <div className="browser-frame__url">stock.hollisgrant.example/orders</div>
      </div>
      <div style={{ display: 'flex', flex: 1, minHeight: 0, background: 'var(--color-bg-app)' }}>
        {!mobile && (
          <Sidebar style={{ width: 200 }}>
            <div className="t-headline" style={{ padding: '8px 8px 12px', fontFamily: 'var(--font-family-serif)' }}>
              Hollis &amp; Grant
            </div>
            <NavItem icon={Home} label="Dashboard" />
            <NavItem icon={Boxes} label="Products" />
            <NavItem icon={Truck} label="Purchase orders" selected meta={ORDERS.length} />
            <NavItem icon={BarChart3} label="Reports" />
            <NavItem icon={Settings} label="Settings" />
          </Sidebar>
        )}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {mobile && (
            <Toolbar>
              <IconButton icon={MenuIcon} label="Menu" />
              <span className="m-toolbar__title" style={{ flex: 1 }}>
                Hollis &amp; Grant
              </span>
              <IconButton icon={Search} label="Search" />
            </Toolbar>
          )}
          <div style={{ flex: 1, overflow: 'auto', padding: mobile ? 16 : 'var(--space-page-margin)' }}>{step === 'list' ? list : step === 'detail' ? detail : receive}</div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════ macOS ══════════════════════ */

const MAC_MENUS: Record<string, string[]> = {
  Stockroom: ['About Stockroom', '—', 'Settings…', '—', 'Hide Stockroom', 'Quit Stockroom'],
  File: ['New Purchase Order', 'Open…', '—', 'Close Window', '—', 'Export…', 'Print…'],
  Edit: ['Undo', 'Redo', '—', 'Cut', 'Copy', 'Paste', 'Select All'],
  View: ['as Table', 'as Cards', '—', 'Show Sidebar', 'Show Inspector', '—', 'Enter Full Screen'],
  Order: ['Receive…', 'Duplicate', 'Mark as Sent', '—', 'Cancel Order'],
  Window: ['Minimize', 'Zoom', '—', 'Bring All to Front'],
  Help: ['Stockroom Help'],
};
const SHORTCUTS: Record<string, string> = { 'New Purchase Order': '⌘N', 'Open…': '⌘O', 'Close Window': '⌘W', 'Print…': '⌘P', Undo: '⌘Z', Redo: '⇧⌘Z', Cut: '⌘X', Copy: '⌘C', Paste: '⌘V', 'Select All': '⌘A', 'Settings…': '⌘,', 'Quit Stockroom': '⌘Q', 'Receive…': '⌘R', 'Show Sidebar': '⌃⌘S', 'Show Inspector': '⌥⌘I', 'Minimize': '⌘M' };

export function MacSim({ step, onStep, orderId, onOrder }: SimProps) {
  const o = order(orderId);
  const [menu, setMenu] = useState<string | null>(null);
  const [inspector, setInspector] = useState(true);
  const [sidebar, setSidebar] = useState(true);
  const lines = LINES[o.id] ?? [];
  const pr = progress(o);
  return (
    <div style={{ width: '100%', minWidth: 760, display: 'flex', flexDirection: 'column', background: 'linear-gradient(160deg, #6f7c74, #3e4743)', borderRadius: 10, overflow: 'hidden' }} onMouseLeave={() => setMenu(null)}>
      {/* Menu bar */}
      <div style={{ height: 24, display: 'flex', alignItems: 'center', gap: 2, padding: '0 10px', background: 'color-mix(in srgb, var(--color-surface-default) 78%, transparent)', backdropFilter: 'blur(20px)', fontSize: 13, position: 'relative', zIndex: 30 }}>
        <span style={{ fontSize: 15, padding: '0 8px' }} aria-hidden>
          ●
        </span>
        {Object.keys(MAC_MENUS).map((m, i) => (
          <div key={m} style={{ position: 'relative' }}>
            <button type="button" onClick={() => setMenu(menu === m ? null : m)} onMouseEnter={() => menu && setMenu(m)} style={{ border: 0, background: menu === m ? 'var(--color-accent-default)' : 'transparent', color: menu === m ? 'var(--color-accent-on)' : 'inherit', fontWeight: i === 0 ? 700 : 400, padding: '1px 8px', borderRadius: 4, fontSize: 13, cursor: 'default' }}>
              {m}
            </button>
            {menu === m && (
              <Menu
                onClose={() => setMenu(null)}
                items={MAC_MENUS[m].map((it) =>
                  it === '—'
                    ? { type: 'separator' as const }
                    : {
                        label: it,
                        shortcut: SHORTCUTS[it],
                        disabled: it === 'Redo' || (it === 'Receive…' && step === 'receive'),
                        onSelect: () => {
                          if (it === 'Receive…') onStep('receive');
                          if (it === 'Show Inspector') setInspector((x) => !x);
                          if (it === 'Show Sidebar') setSidebar((x) => !x);
                        },
                      },
                )}
              />
            )}
          </div>
        ))}
        <div className="spacer" />
        <span style={{ fontSize: 12 }}>Fri Nov 21 9:41 AM</span>
      </div>
      <div style={{ padding: 24 }}>
        <div className="mac-window" style={{ height: 560 }}>
          {/* Unified toolbar */}
          <div style={{ height: 'var(--nav-toolbar-height)', display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', borderBottom: '1px solid var(--color-border-subtle)', background: 'var(--nav-toolbar-bg)', flex: 'none' }}>
            <span className="mac-lights">
              <span style={{ background: '#E0605A' }} />
              <span style={{ background: '#E5B53F' }} />
              <span style={{ background: '#67B954' }} />
            </span>
            <IconButton icon={PanelLeft} label="Toggle sidebar" size="sm" onClick={() => setSidebar((s) => !s)} />
            {step !== 'list' && <IconButton icon={ChevronLeft} label="Back" size="sm" onClick={() => onStep(step === 'receive' ? 'detail' : 'list')} />}
            <div style={{ lineHeight: 1.15 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{step === 'list' ? 'Purchase Orders' : o.id}</div>
              <div style={{ fontSize: 11 }} className="c-secondary">
                {step === 'list' ? `${ORDERS.length} orders` : o.vendor}
              </div>
            </div>
            <div className="spacer" />
            <SegmentedControl size="sm" value="table" onChange={() => {}} options={[{ value: 'table', label: '', icon: LayoutGrid }, { value: 'list', label: '', icon: MenuIcon }]} aria-label="View" />
            <IconButton icon={PackageCheck} label="Receive" size="sm" onClick={() => onStep('receive')} />
            <IconButton icon={Share} label="Share" size="sm" />
            <SearchField size="sm" value="" onChange={() => {}} style={{ width: 150 }} />
            <IconButton icon={PanelRight} label="Toggle inspector" size="sm" selected={inspector} onClick={() => setInspector((s) => !s)} />
          </div>
          <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
            {sidebar && (
              <Sidebar style={{ background: 'color-mix(in srgb, var(--nav-sidebar-bg) 88%, transparent)' }}>
                <NavHeading>Stockroom</NavHeading>
                <NavItem icon={Inbox} label="All Orders" selected meta={ORDERS.length} />
                <NavItem icon={Truck} label="In Transit" meta={2} />
                <NavItem icon={PackageCheck} label="Received" />
                <NavHeading>Vendors</NavHeading>
                {['Halyard Outfitters', 'Cooper Hill Apiary', 'House Assembled'].map((v) => (
                  <NavItem key={v} icon={User} label={v} />
                ))}
              </Sidebar>
            )}
            <div style={{ flex: 1, minWidth: 0, overflow: 'auto', background: 'var(--color-surface-default)' }}>
              {step === 'receive' ? (
                <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
                  {/* macOS sheet: drops from the toolbar */}
                  <div className="m-dialog" style={{ width: 440, borderTopLeftRadius: 0, borderTopRightRadius: 0, marginTop: -24, animation: 'm-rise-in var(--motion-duration-enter) var(--motion-easing-enter)' }}>
                    <div className="m-dialog__header">
                      <div className="m-dialog__title" style={{ fontSize: 15 }}>
                        Receive {o.id}
                      </div>
                    </div>
                    <div className="m-dialog__body stack">
                      {lines.map((l) => (
                        <div key={l.sku} className="row">
                          <span className="spacer truncate" style={{ fontSize: 13 }}>
                            {l.name}
                          </span>
                          <TextInput size="sm" defaultValue={String(l.ordered - l.received)} style={{ width: 70 }} aria-label={`${l.name} quantity`} />
                        </div>
                      ))}
                      <Checkbox label="Print shelf labels" defaultChecked />
                    </div>
                    <div className="m-dialog__footer">
                      <Button size="sm" onClick={() => onStep('detail')}>
                        Cancel
                      </Button>
                      <Button size="sm" variant="primary" onClick={() => onStep('list')}>
                        Receive
                      </Button>
                    </div>
                  </div>
                </div>
              ) : step === 'detail' ? (
                <DataTable flush hover rows={lines} rowKey={(r) => r.sku} columns={[{ key: 'sku', header: 'SKU', render: (r) => <span className="t-code">{r.sku}</span> }, { key: 'name', header: 'Item' }, { key: 'ordered', header: 'Ordered', numeric: true }, { key: 'received', header: 'Received', numeric: true }, { key: 'cost', header: 'Cost', numeric: true, render: (r) => fmtCurrency(r.cost, 2) }]} />
              ) : (
                <DataTable flush striped rows={ORDERS} rowKey={(r) => r.id} activeKey={o.id} onRowClick={(r) => onOrder(r.id)} columns={[{ key: 'id', header: 'Order', sortable: true }, { key: 'vendor', header: 'Vendor', sortable: true }, { key: 'total', header: 'Total', numeric: true, sortable: true, render: (r) => fmtCurrency(r.total) }, { key: 'due', header: 'Due', sortable: true }, { key: 'status', header: 'Status', render: (r) => <span className="row row--tight"><span className="m-badge__dot" style={{ color: `var(--color-status-${statusTone(r.status) === 'neutral' ? 'info' : statusTone(r.status)}-solid)` }} />{r.status}</span> }]} />
              )}
            </div>
            {inspector && (
              <div style={{ width: 240, borderLeft: '1px solid var(--color-border-subtle)', background: 'var(--color-surface-default)', padding: 14, fontSize: 12, overflow: 'auto' }} className="stack stack--md">
                <div className="t-overline c-secondary">Inspector</div>
                <div className="t-headline">{o.id}</div>
                <div className="m-dl">
                  <dt>Vendor</dt>
                  <dd>{o.vendor}</dd>
                  <dt>Status</dt>
                  <dd>{o.status}</dd>
                  <dt>Due</dt>
                  <dd>{o.due}</dd>
                  <dt>Total</dt>
                  <dd className="t-num">{fmtCurrency(o.total)}</dd>
                </div>
                <div className="stack stack--xs">
                  <span className="c-secondary">
                    Received {pr.rec} of {pr.ord}
                  </span>
                  <div className="m-progress">
                    <div className="m-progress__bar" style={{ width: `${pr.pct * 100}%` }} />
                  </div>
                </div>
                <Switch label="Notify on arrival" defaultChecked />
                <Button size="sm" variant="primary" icon={PackageCheck} onClick={() => onStep('receive')}>
                  Receive…
                </Button>
                <Button size="sm" onClick={() => onStep('detail')}>
                  Show Line Items
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════ iOS ══════════════════════ */

function StatusBar({ ipad }: { ipad?: boolean }) {
  return (
    <div className={cx('device__status', ipad && 'device__status--ipad')}>
      <span>9:41{ipad && <span style={{ fontWeight: 400, marginLeft: 8 }}>Fri Nov 21</span>}</span>
      <span className="row row--tight">
        <Signal size={ipad ? 12 : 15} aria-hidden />
        <Wifi size={ipad ? 12 : 15} aria-hidden />
        <Battery size={ipad ? 16 : 20} aria-hidden />
      </span>
    </div>
  );
}

/** iOS inset-grouped list row. */
function Row({ children, detail, chevron, onClick, accessory }: { children: ReactNode; detail?: ReactNode; chevron?: boolean; onClick?: () => void; accessory?: ReactNode }) {
  const C = onClick ? 'button' : 'div';
  return (
    <C type={onClick ? 'button' : undefined} className="ios-row" onClick={onClick}>
      <span className="ios-row__label">{children}</span>
      {detail != null && <span className="ios-row__detail">{detail}</span>}
      {accessory}
      {chevron && <ChevronRight className="ios-row__chevron" aria-hidden />}
    </C>
  );
}

export function IOSScreen({ step, onStep, orderId, onOrder, compact }: SimProps & { compact?: boolean }) {
  const o = order(orderId);
  const lines = LINES[o.id] ?? [];
  const [tab, setTab] = useState('orders');
  const [q, setQ] = useState('');
  const showSheet = step === 'receive';
  return (
    <div className="ios-screen">
      <StatusBar />
      {step === 'list' ? (
        <div className="ios-scroll">
          <div className="ios-navbar">
            <span />
            <span />
            <button type="button" className="ios-navbar__action" aria-label="New order">
              <Plus size={22} />
            </button>
          </div>
          <h1 className="ios-large-title">Orders</h1>
          <div style={{ padding: '0 16px 8px' }}>
            <SearchField value={q} onChange={setQ} placeholder="Search" size="sm" />
          </div>
          <div className="ios-section-header">Open</div>
          <div className="ios-group">
            {ORDERS.filter((x) => x.status !== 'Received' && x.id.toLowerCase().includes(q.toLowerCase())).map((x) => (
              <Row key={x.id} chevron onClick={() => { onOrder(x.id); onStep('detail'); }} detail={<Badge tone={statusTone(x.status)} dot>{x.status === 'Partially received' ? 'Partial' : x.status}</Badge>}>
                <span className="stack" style={{ gap: 0 }}>
                  <span>{x.id}</span>
                  <span className="ios-row__sub">{x.vendor}</span>
                </span>
              </Row>
            ))}
          </div>
          <div className="ios-section-header">Received</div>
          <div className="ios-group">
            {ORDERS.filter((x) => x.status === 'Received').map((x) => (
              <Row key={x.id} chevron detail={fmtCurrency(x.total)} onClick={() => { onOrder(x.id); onStep('detail'); }}>
                {x.id}
              </Row>
            ))}
          </div>
        </div>
      ) : (
        <div className="ios-scroll" style={{ animation: 'm-sheet-in var(--motion-duration-page) var(--motion-easing-enter)' }}>
          <div className="ios-navbar">
            <button type="button" className="ios-navbar__back" onClick={() => onStep('list')}>
              <ChevronLeft size={24} /> Orders
            </button>
            <span className="ios-navbar__title">{o.id}</span>
            <button type="button" className="ios-navbar__action" aria-label="More">
              <MoreHorizontal size={22} />
            </button>
          </div>
          <div className="ios-group" style={{ marginTop: 12 }}>
            <Row detail={o.vendor}>Vendor</Row>
            <Row detail={o.due}>Due</Row>
            <Row detail={<Badge tone={statusTone(o.status)} dot>{o.status}</Badge>}>Status</Row>
            <Row detail={<span className="t-num">{fmtCurrency(o.total)}</span>}>Total</Row>
          </div>
          <div className="ios-section-header">Items</div>
          <div className="ios-group">
            {lines.map((l) => (
              <Row key={l.sku} detail={<span className="t-num">{l.received}/{l.ordered}</span>}>
                {l.name}
              </Row>
            ))}
          </div>
          <div style={{ padding: 16 }}>
            <Button variant="primary" size="lg" block icon={PackageCheck} onClick={() => onStep('receive')}>
              Receive Items
            </Button>
          </div>
        </div>
      )}
      {!compact && (
        <nav className="ios-tabbar" aria-label="Tabs">
          {[
            ['orders', Truck, 'Orders'],
            ['stock', Package, 'Stock'],
            ['reports', BarChart3, 'Reports'],
            ['settings', Settings, 'Settings'],
          ].map(([k, I, l]) => (
            <button key={k as string} type="button" className={cx('ios-tab', tab === k && 'is-selected')} onClick={() => setTab(k as string)} aria-current={tab === k}>
              <Icon icon={I as typeof Truck} size="nav" />
              <span>{l as string}</span>
            </button>
          ))}
        </nav>
      )}
      <Sheet open={showSheet} side="bottom" contained onClose={() => onStep('detail')} title={`Receive ${o.id}`} footer={<Button variant="primary" block size="lg" onClick={() => onStep('list')}>Post Receipt</Button>}>
        <div className="ios-group" style={{ margin: 0 }}>
          {lines.map((l) => (
            <Row key={l.sku} accessory={<span className="ios-stepper"><button type="button" aria-label="Decrease">−</button><span className="t-num">{l.ordered - l.received}</span><button type="button" aria-label="Increase">+</button></span>}>
              <span className="truncate">{l.name}</span>
            </Row>
          ))}
          <Row accessory={<Switch defaultChecked aria-label="Print labels" />}>Print labels</Row>
        </div>
      </Sheet>
      <div className="device__home" />
    </div>
  );
}

export function IPhoneSim(props: SimProps & { model?: 'pro' | 'se' }) {
  const se = props.model === 'se';
  return (
    <div className="device" style={{ width: (se ? 375 : 393) + 24, height: (se ? 667 : 852) + 24, borderRadius: se ? 36 : 54 }}>
      {!se && <div className="device__island" />}
      <div className="device__screen" style={{ borderRadius: se ? 4 : 44 }}>
        <IOSScreen {...props} />
      </div>
    </div>
  );
}

/* ══════════════════════ iPadOS ══════════════════════ */

export type IPadLayout = 'full' | 'split-23' | 'split-12' | 'slide-over';

export function IPadSim({ step, onStep, orderId, onOrder, layout = 'full', model = 'pro' }: SimProps & { layout?: IPadLayout; model?: 'pro' | 'mini' }) {
  const [sidebar, setSidebar] = useState<'shown' | 'hidden'>('shown');
  const o = order(orderId);
  const lines = LINES[o.id] ?? [];
  const W = model === 'mini' ? 1133 : 1180;
  const H = model === 'mini' ? 744 : 820;
  const appW = layout === 'full' ? W : layout === 'split-23' ? W * 0.66 : layout === 'split-12' ? W / 2 - 5 : W;
  const compact = appW < 680;
  const app = (
    <div style={{ display: 'flex', height: '100%', minWidth: 0, background: 'var(--color-bg-app)' }}>
      {!compact && sidebar === 'shown' && (
        <Sidebar style={{ width: 'var(--layout-sidebar-width)', paddingTop: 8 }}>
          <div className="row" style={{ padding: '4px 8px 8px' }}>
            <span className="t-title3 spacer">Stockroom</span>
            <IconButton icon={PanelLeft} label="Hide sidebar" onClick={() => setSidebar('hidden')} />
          </div>
          <NavItem icon={Inbox} label="All Orders" selected meta={ORDERS.length} />
          <NavItem icon={Truck} label="In Transit" meta={2} />
          <NavItem icon={PackageCheck} label="Received" />
          <NavItem icon={Package} label="Stock" />
          <NavItem icon={BarChart3} label="Reports" />
        </Sidebar>
      )}
      {compact ? (
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <IOSScreenInner step={step} onStep={onStep} orderId={orderId} onOrder={onOrder} />
        </div>
      ) : (
        <>
          <div style={{ width: 340, flex: 'none', borderRight: '1px solid var(--color-border-subtle)', background: 'var(--color-surface-default)', display: 'flex', flexDirection: 'column' }}>
            <div className="ios-navbar" style={{ padding: '0 12px' }}>
              {sidebar === 'hidden' ? <IconButton icon={PanelLeft} label="Show sidebar" onClick={() => setSidebar('shown')} /> : <span />}
              <span className="ios-navbar__title">All Orders</span>
              <IconButton icon={Filter} label="Filter" />
            </div>
            <div style={{ overflow: 'auto', flex: 1 }}>
              {ORDERS.map((x) => (
                <button key={x.id} type="button" className={cx('ipad-cell', x.id === o.id && 'is-selected')} onClick={() => { onOrder(x.id); if (step === 'list') onStep('detail'); }}>
                  <div className="row row--between">
                    <span className="t-headline">{x.id}</span>
                    <span className="t-footnote c-secondary">{x.due.slice(5)}</span>
                  </div>
                  <div className="row row--between">
                    <span className="t-subhead c-secondary truncate">{x.vendor}</span>
                    <Badge tone={statusTone(x.status)} dot>
                      {x.status === 'Partially received' ? 'Partial' : x.status}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div className="ios-navbar" style={{ padding: '0 16px', borderBottom: '1px solid var(--color-border-subtle)' }}>
              <span className="ios-navbar__title" style={{ position: 'static', transform: 'none' }}>
                {o.id}
              </span>
              <span />
              <div className="row">
                <IconButton icon={Share} label="Share" />
                <Button variant="primary" icon={PackageCheck} onClick={() => onStep('receive')}>
                  Receive
                </Button>
              </div>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: 20 }} className="stack stack--md">
              <div className="grid grid--3">
                {[
                  ['Vendor', o.vendor],
                  ['Due', o.due],
                  ['Total', fmtCurrency(o.total)],
                ].map(([k, v]) => (
                  <div key={k} className="m-card m-card--pad">
                    <div className="t-footnote c-secondary">{k}</div>
                    <div className="t-headline t-num">{v}</div>
                  </div>
                ))}
              </div>
              <DataTable rows={lines} rowKey={(r) => r.sku} columns={[{ key: 'name', header: 'Item' }, { key: 'ordered', header: 'Ordered', numeric: true }, { key: 'received', header: 'Received', numeric: true }]} />
            </div>
            {step === 'receive' && (
              <div className="m-scrim m-scrim--contained">
                {/* iPad form sheet: centered card */}
                <div className="m-dialog" style={{ width: 460 }}>
                  <div className="ios-navbar" style={{ padding: '0 12px', borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <button type="button" className="ios-navbar__back" onClick={() => onStep('detail')}>
                      Cancel
                    </button>
                    <span className="ios-navbar__title">Receive</span>
                    <button type="button" className="ios-navbar__back" style={{ fontWeight: 600 }} onClick={() => onStep('list')}>
                      Done
                    </button>
                  </div>
                  <div className="ios-group" style={{ margin: 16 }}>
                    {lines.map((l) => (
                      <Row key={l.sku} accessory={<span className="ios-stepper"><button type="button" aria-label="Decrease">−</button><span className="t-num">{l.ordered - l.received}</span><button type="button" aria-label="Increase">+</button></span>}>
                        <span className="truncate">{l.name}</span>
                      </Row>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
  const other = (
    <div style={{ height: '100%', background: 'var(--color-surface-default)', display: 'flex', flexDirection: 'column' }}>
      <div className="ios-navbar" style={{ padding: '0 12px' }}>
        <span />
        <span className="ios-navbar__title">Mail</span>
        <span />
      </div>
      <div style={{ padding: 12 }} className="stack">
        {['Halyard Outfitters', 'Priya Natarajan', 'Accounts Payable'].map((f) => (
          <div key={f} className="m-card m-card--pad">
            <div className="t-subhead">{f}</div>
            <div className="t-footnote c-secondary">Second app in Split View</div>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div className="device device--ipad" style={{ width: W + 32, height: H + 32 }}>
      <div className="device__screen" style={{ background: '#2c3330' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
          <StatusBar ipad />
          <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: layout.startsWith('split') ? 10 : 0, position: 'relative' }}>
            <div style={{ width: layout.startsWith('split') ? appW : '100%', flex: 'none', minWidth: 0, borderRadius: layout.startsWith('split') ? 10 : 0, overflow: 'hidden' }}>{app}</div>
            {layout.startsWith('split') && <div style={{ flex: 1, minWidth: 0, borderRadius: 10, overflow: 'hidden' }}>{other}</div>}
            {layout === 'slide-over' && (
              <div style={{ position: 'absolute', right: 12, top: 8, bottom: 12, width: 320, borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--elevation-modal)', border: '1px solid var(--color-border-default)' }}>{other}</div>
            )}
          </div>
        </div>
        <div className="device__home" style={{ width: 200 }} />
      </div>
    </div>
  );
}

/** iOS screen content without status/home chrome (used for compact iPad widths). */
function IOSScreenInner(props: SimProps) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }} className="ios-inner">
      <IOSScreen {...props} compact />
    </div>
  );
}

/** Wraps a simulation with its platform scope so platform token overrides apply. */
export function PlatformScope({ platform, children, appearance }: { platform: 'web' | 'macos' | 'ios' | 'ipados'; children: ReactNode; appearance?: 'light' | 'dark' }) {
  return (
    <ThemeScope platform={platform} appearance={appearance} surface={false} style={{ minWidth: 0 }}>
      {children}
    </ThemeScope>
  );
}

