import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Archive,
  Bell,
  Bold,
  Box,
  Copy,
  Download,
  Filter,
  Home,
  Inbox,
  Italic,
  MoreHorizontal,
  Package,
  PackageCheck,
  Pencil,
  Plus,
  Printer,
  Send,
  Settings,
  Share,
  ShoppingCart,
  Star,
  Trash2,
  Truck,
  Underline,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { PRODUCTS, STOCK_ACTIVITY, type Product } from '../data/inventory';
import { fmtCurrency } from '../data/format';
import { EditorTabs } from '../lab/EditorTabs';
import { Demo, Page, Section, Workbench } from '../lab/Page';
import { navigate } from '../shell/router';
import {
  Accordion,
  ActivityLog,
  Alert,
  Avatar,
  Badge,
  Breadcrumbs,
  Button,
  ButtonGroup,
  Calendar,
  Card,
  Checkbox,
  DataTable,
  DateField,
  DatePicker,
  Dialog,
  EmptyState,
  Icon,
  IconButton,
  InspectorPanel,
  Kbd,
  Menu,
  MenuButton,
  NavHeading,
  NavItem,
  Pagination,
  Popover,
  Progress,
  RadioGroup,
  SearchField,
  SegmentedControl,
  Select,
  Sheet,
  Sidebar,
  Skeleton,
  Slider,
  Spinner,
  SplitButton,
  SplitView,
  Switch,
  Tabs,
  Tag,
  TextArea,
  TextInput,
  Timeline,
  Toast,
  Toolbar,
  Tooltip,
  useToast,
  type Column,
  type ForcedState,
} from '../ui';

type Cat = 'buttons' | 'inputs' | 'navigation' | 'containers' | 'feedback' | 'data' | 'structure';
const CATS: { value: Cat; label: string }[] = [
  { value: 'buttons', label: 'Buttons' },
  { value: 'inputs', label: 'Inputs' },
  { value: 'navigation', label: 'Navigation' },
  { value: 'containers', label: 'Containers' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'data', label: 'Data tables' },
  { value: 'structure', label: 'Calendars & structure' },
];

const EDITOR_TABS: Record<Cat, { id: string; label: string; prefix: string | string[] }[]> = {
  buttons: [{ id: 'b', label: 'Button', prefix: 'button' }],
  inputs: [
    { id: 'i', label: 'Input', prefix: 'input' },
    { id: 'c', label: 'Controls', prefix: 'control' },
  ],
  navigation: [
    { id: 'n', label: 'Navigation', prefix: 'nav' },
    { id: 'm', label: 'Menu', prefix: ['menu', 'tooltip'] },
  ],
  containers: [
    { id: 'c', label: 'Card', prefix: 'card' },
    { id: 'b', label: 'Badge & tag', prefix: ['badge', 'tag'] },
    { id: 'm', label: 'Popover', prefix: ['menu', 'tooltip'] },
  ],
  feedback: [
    { id: 'd', label: 'Dialog', prefix: 'dialog' },
    { id: 'f', label: 'Feedback', prefix: ['progress', 'skeleton', 'alert', 'toast'] },
    { id: 's', label: 'Status', prefix: 'color.status' },
  ],
  data: [{ id: 't', label: 'Table', prefix: 'table' }],
  structure: [
    { id: 'n', label: 'Navigation', prefix: 'nav.sidebar' },
    { id: 's', label: 'Surfaces', prefix: ['color.surface', 'color.accent'] },
  ],
};

const STATES: (ForcedState | 'default')[] = ['default', 'hover', 'pressed', 'focus', 'selected', 'disabled', 'loading', 'success'];

function StateMatrix() {
  return (
    <div className="scroll-x">
      <table className="m-table" style={{ minWidth: 760 }}>
        <thead>
          <tr>
            <th>Variant</th>
            {STATES.map((s) => (
              <th key={s}>{s}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(['primary', 'secondary', 'ghost', 'danger'] as const).map((v) => (
            <tr key={v}>
              <td className="t-subhead" style={{ textTransform: 'capitalize' }}>
                {v}
              </td>
              {STATES.map((s) => (
                <td key={s} style={{ height: 52 }}>
                  <Button variant={v} size="sm" forceState={s === 'default' ? undefined : s} disabled={s === 'disabled'}>
                    {v === 'danger' ? 'Delete' : 'Save'}
                  </Button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Buttons() {
  const toast = useToast();
  const [align, setAlign] = useState('left');
  const [fmt, setFmt] = useState<string[]>(['bold']);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <Demo title="Variants × states" description="Every state shown together. The lab forces hover and pressed so you can see them without interacting." tokens={['button.primary.bg', 'button.primary.bg.hover', 'button.primary.bg.pressed', 'button.secondary.border', 'button.radius', 'button.height']} padded>
        <StateMatrix />
      </Demo>
      <div className="grid grid--2">
        <Demo title="Sizes & icons" tokens={['size.control.sm', 'size.control.md', 'size.control.lg', 'button.gap']}>
          <div className="stack">
            <div className="row row--wrap">
              <Button size="sm" variant="primary" icon={Plus}>
                Small
              </Button>
              <Button variant="primary" icon={Plus}>
                Medium
              </Button>
              <Button size="lg" variant="primary" icon={Plus}>
                Large
              </Button>
            </div>
            <div className="row row--wrap">
              <Button icon={Download}>Export</Button>
              <Button iconRight={Send} variant="ghost">
                Send
              </Button>
              <Button
                variant="primary"
                loading={busy}
                onClick={() => {
                  setBusy(true);
                  setTimeout(() => {
                    setBusy(false);
                    toast({ tone: 'success', title: 'Order submitted', text: 'PO-24812 sent to Halyard Outfitters.' });
                  }, 1200);
                }}
              >
                Submit order
              </Button>
            </div>
          </div>
        </Demo>
        <Demo title="Icon buttons" description="Every icon button carries an accessible name and a tooltip." tokens={['button.ghost.fg', 'button.ghost.bg.hover', 'icon.size.default']}>
          <div className="stack">
            <div className="row row--wrap">
              {(['ghost', 'secondary', 'primary'] as const).map((v) => (
                <div key={v} className="row row--tight">
                  <Tooltip content="Edit">
                    <IconButton icon={Pencil} label="Edit" variant={v} />
                  </Tooltip>
                  <IconButton icon={Copy} label="Duplicate" variant={v} />
                  <IconButton icon={Trash2} label="Delete" variant={v === 'primary' ? 'danger' : v} />
                </div>
              ))}
            </div>
            <div className="row row--wrap">
              {(['hover', 'pressed', 'focus', 'disabled', 'loading'] as const).map((s) => (
                <IconButton key={s} icon={Star} label={s} variant="secondary" forceState={s} disabled={s === 'disabled'} />
              ))}
            </div>
          </div>
        </Demo>
        <Demo title="Split buttons">
          <div className="row row--wrap">
            <SplitButton icon={Printer} onClick={() => toast({ title: 'Printing pick list' })} items={[{ label: 'Print labels', icon: Package }, { label: 'Print packing slip', icon: Truck }, { type: 'separator' }, { label: 'Page setup…', icon: Settings }]}>
              Print
            </SplitButton>
            <SplitButton variant="secondary" icon={Share} items={[{ label: 'Copy link', icon: Copy }, { label: 'Email…', icon: Send }]}>
              Share
            </SplitButton>
          </div>
        </Demo>
        <Demo title="Button groups & segmented controls">
          <div className="stack">
            <ButtonGroup label="Alignment">
              {[
                ['left', AlignLeft],
                ['center', AlignCenter],
                ['right', AlignRight],
              ].map(([v, I]) => (
                <IconButton key={v as string} icon={I as typeof AlignLeft} label={`Align ${v}`} variant="secondary" selected={align === v} onClick={() => setAlign(v as string)} />
              ))}
            </ButtonGroup>
            <ButtonGroup label="Formatting">
              {[
                ['bold', Bold],
                ['italic', Italic],
                ['underline', Underline],
              ].map(([v, I]) => (
                <IconButton key={v as string} icon={I as typeof Bold} label={v as string} variant="secondary" selected={fmt.includes(v as string)} onClick={() => setFmt((f) => (f.includes(v as string) ? f.filter((x) => x !== v) : [...f, v as string]))} />
              ))}
            </ButtonGroup>
            <SegmentedControl value={align} onChange={setAlign} options={[{ value: 'left', label: 'Day' }, { value: 'center', label: 'Week' }, { value: 'right', label: 'Month' }]} aria-label="Range" />
          </div>
        </Demo>
      </div>
    </>
  );
}

function Inputs() {
  const [q, setQ] = useState('canvas');
  const [store, setStore] = useState('Main Street');
  const [radio, setRadio] = useState('ground');
  const [qty, setQty] = useState(36);
  const [date, setDate] = useState<string | null>('2026-11-28');
  const [checks, setChecks] = useState({ a: true, b: false, c: true });
  const all = Object.values(checks);
  return (
    <>
      <Demo title="Text field states" tokens={['input.border', 'input.border.hover', 'input.border.focus', 'input.border.error', 'input.bg.disabled', 'input.radius', 'input.height']}>
        <div className="grid grid--3">
          <TextInput label="Default" placeholder="Vendor name" />
          <TextInput label="Hover" placeholder="Vendor name" forceState="hover" />
          <TextInput label="Focused" defaultValue="Halyard Outf" forceState="focus" />
          <TextInput label="Error" defaultValue="HG-APP-10" error="SKU must have four digits after the category." />
          <TextInput label="Success" defaultValue="HG-APP-1042" success="SKU found: Waxed Canvas Field Jacket" />
          <TextInput label="Disabled" defaultValue="Locked after posting" disabled help="Posted entries cannot be edited." />
        </div>
      </Demo>
      <div className="grid grid--2">
        <Demo title="Search, select, text area">
          <div className="stack stack--md">
            <SearchField value={q} onChange={setQ} placeholder="Search products" />
            <Select label="Store" value={store} onChange={setStore} options={['Main Street', 'Riverside', 'Harbor', 'Old Town', 'Northgate']} />
            <TextInput label="Unit cost" required defaultValue="84.00" suffix={<span className="c-tertiary t-footnote">USD</span>} help="Landed cost including freight." />
            <TextArea label="Receiving note" placeholder="Damage, substitutions, short shipments…" rows={3} />
          </div>
        </Demo>
        <Demo title="Selection controls" tokens={['control.checked.bg', 'control.check.size', 'control.switch.width', 'control.track.bg']}>
          <div className="stack stack--md">
            <Checkbox label="Select all categories" checked={all.every(Boolean)} indeterminate={!all.every(Boolean) && all.some(Boolean)} onChange={(v) => setChecks({ a: v, b: v, c: v })} />
            <div className="stack" style={{ paddingLeft: 24 }}>
              <Checkbox label="Apparel" checked={checks.a} onChange={(v) => setChecks({ ...checks, a: v })} />
              <Checkbox label="Pantry" description="Includes perishable goods" checked={checks.b} onChange={(v) => setChecks({ ...checks, b: v })} />
              <Checkbox label="Hardware" checked={checks.c} onChange={(v) => setChecks({ ...checks, c: v })} />
            </div>
            <div className="row row--wrap row--loose">
              <Checkbox label="Hover" forceState="hover" />
              <Checkbox label="Focus" forceState="focus" defaultChecked />
              <Checkbox label="Disabled" disabled defaultChecked />
              <Checkbox label="Error" error />
            </div>
            <RadioGroup label="Shipping" value={radio} onChange={setRadio} options={[{ value: 'ground', label: 'Ground', description: '3–5 business days' }, { value: 'express', label: 'Express', description: 'Next business day' }, { value: 'pickup', label: 'Store pickup', disabled: true }]} />
            <div className="row row--wrap row--loose">
              <Switch defaultChecked label="Auto-reorder" />
              <Switch label="Email receipts" />
              <Switch defaultChecked disabled label="Disabled" />
            </div>
          </div>
        </Demo>
        <Demo title="Slider" tokens={['control.checked.bg', 'control.thumb.bg']}>
          <div className="stack">
            <span className="m-field__label">Reorder quantity</span>
            <Slider aria-label="Reorder quantity" value={qty} min={0} max={200} step={6} onChange={setQty} format={(v) => `${v} units`} />
            <Slider aria-label="Disabled slider" value={40} onChange={() => {}} disabled />
          </div>
        </Demo>
        <Demo title="Date pickers" description="A Mercantile calendar popover and the platform's native picker.">
          <div className="row row--wrap row--top row--loose">
            <DatePicker label="Delivery date" value={date} onChange={setDate} />
            <DateField label="Native date field" defaultValue="2026-12-01" />
          </div>
        </Demo>
      </div>
    </>
  );
}

function Navigation() {
  const [tab, setTab] = useState('overview');
  const [page, setPage] = useState(3);
  const [sel, setSel] = useState('inbox');
  return (
    <>
      <div className="grid grid--2">
        <Demo title="Sidebar" tokens={['nav.sidebar.bg', 'nav.item.bg.selected', 'nav.item.bg.hover', 'nav.item.radius', 'nav.item.height']} padded={false}>
          <Sidebar style={{ width: '100%', borderRight: 0, borderRadius: 0 }}>
            <NavHeading>Mailboxes</NavHeading>
            {[
              ['inbox', Inbox, 'Inbox', 6],
              ['sent', Send, 'Sent', null],
              ['archive', Archive, 'Archive', null],
            ].map(([k, I, l, m]) => (
              <NavItem key={k as string} icon={I as typeof Inbox} label={l as string} meta={m as number} selected={sel === k} onClick={() => setSel(k as string)} />
            ))}
            <NavHeading>Stores</NavHeading>
            <NavItem icon={Home} label="Main Street" forceState="hover" />
            <NavItem icon={Home} label="Riverside" />
          </Sidebar>
        </Demo>
        <Demo title="Navigation bar & toolbar" tokens={['nav.toolbar.bg', 'nav.toolbar.height', 'nav.toolbar.border']} padded={false}>
          <div className="stack" style={{ gap: 0 }}>
            <Toolbar>
              <Breadcrumbs items={[{ label: 'Inventory', onClick: () => {} }, { label: 'Apparel', onClick: () => {} }, { label: 'Field Jacket' }]} />
            </Toolbar>
            <Toolbar>
              <span className="m-toolbar__title">Purchase orders</span>
              <div className="spacer" />
              <IconButton icon={Filter} label="Filter" />
              <IconButton icon={Printer} label="Print" />
              <MenuButton align="right" trigger={(p) => <IconButton icon={MoreHorizontal} label="More" {...p} />} items={[{ label: 'Duplicate', icon: Copy }, { label: 'Archive', icon: Archive }, { type: 'separator' }, { label: 'Delete', icon: Trash2, danger: true }]} />
              <Button variant="primary" size="sm" icon={Plus}>
                New
              </Button>
            </Toolbar>
            <div style={{ padding: 'var(--space-inset-lg)' }}>
              <Tabs value={tab} onChange={setTab} tabs={[{ value: 'overview', label: 'Overview' }, { value: 'lines', label: 'Line items', badge: <Badge count>6</Badge> }, { value: 'history', label: 'History' }, { value: 'locked', label: 'Approvals', disabled: true }]} />
            </div>
          </div>
        </Demo>
        <Demo title="Menus" tokens={['menu.bg', 'menu.border', 'menu.shadow', 'menu.item.bg.hover', 'menu.radius']} style={{ background: 'var(--color-bg-app)' }}>
          <div className="row row--top row--wrap">
            <Menu inline items={[{ type: 'label', label: 'Order' }, { label: 'Edit', icon: Pencil, shortcut: '⌘E' }, { label: 'Duplicate', icon: Copy, shortcut: '⌘D' }, { label: 'Print', icon: Printer, shortcut: '⌘P', disabled: true }, { type: 'separator' }, { label: 'Delete', icon: Trash2, danger: true, shortcut: '⌫' }]} />
            <MenuButton trigger={(p) => <Button iconRight={MoreHorizontal} {...p}>Open menu</Button>} items={[{ label: 'Receive all', icon: PackageCheck }, { label: 'Receive partial…', icon: Box }, { type: 'separator' }, { label: 'Cancel order', danger: true }]} />
          </div>
        </Demo>
        <Demo title="Breadcrumbs & pagination">
          <div className="stack stack--md">
            <Breadcrumbs items={[{ label: 'Reports', onClick: () => {} }, { label: 'Finance', onClick: () => {} }, { label: '2026', onClick: () => {} }, { label: 'November close' }]} />
            <Pagination page={page} pageCount={12} onChange={setPage} />
            <span className="t-footnote c-secondary">
              Page {page} of 12 · Use <Kbd>←</Kbd> <Kbd>→</Kbd> in list views
            </span>
          </div>
        </Demo>
      </div>
    </>
  );
}

function Containers() {
  const [tags, setTags] = useState(['Apparel', 'Holiday', 'Main Street']);
  const [selected, setSelected] = useState('b');
  return (
    <>
      <div className="grid grid--3">
        <Card title="Waxed Canvas Field Jacket" subtitle="HG-APP-1042 · Apparel" actions={<IconButton icon={MoreHorizontal} label="More" size="sm" />} footer={<><Badge tone="success" dot>In stock</Badge><div className="spacer" /><Button size="sm">View</Button></>}>
          <div className="kv">
            <span>On hand</span>
            <span className="t-num">48</span>
            <span>Price</span>
            <span className="t-num">$198.00</span>
            <span>Vendor</span>
            <span>Halyard Outfitters</span>
          </div>
        </Card>
        <Card padded interactive selected={selected === 'a'} onClick={() => setSelected('a')}>
          <div className="stack">
            <Icon icon={Truck} size="lg" className="c-accent" />
            <div className="t-headline">Interactive card</div>
            <p className="t-footnote c-secondary">Hover for border emphasis. Click to select.</p>
          </div>
        </Card>
        <Card padded interactive selected={selected === 'b'} onClick={() => setSelected('b')}>
          <div className="stack">
            <Icon icon={ShoppingCart} size="lg" className="c-accent" />
            <div className="t-headline">Selected card</div>
            <p className="t-footnote c-secondary">Selection uses an accent outline.</p>
          </div>
        </Card>
      </div>
      <div className="grid grid--2">
        <Demo title="Badges" description="Every status badge carries a word, and a dot or icon, as well as color." tokens={['badge.radius', 'badge.height', 'color.status.success.bg', 'color.status.success.fg']}>
          <div className="stack">
            <div className="row row--wrap">
              <Badge>Draft</Badge>
              <Badge tone="success" dot>
                Received
              </Badge>
              <Badge tone="warning" dot>
                Low stock
              </Badge>
              <Badge tone="danger" dot>
                Out of stock
              </Badge>
              <Badge tone="info" dot>
                In transit
              </Badge>
              <Badge tone="accent">New</Badge>
              <Badge tone="highlight" icon={Star}>
                Featured
              </Badge>
            </div>
            <div className="row row--wrap">
              <Badge count tone="danger">
                3
              </Badge>
              <Badge count>12</Badge>
              <Badge count tone="accent">
                128
              </Badge>
              <Avatar name="Dana Whitlock" />
              <Avatar name="Marcus Bell" size="sm" />
              <Avatar name="Priya Natarajan" size="lg" />
            </div>
          </div>
        </Demo>
        <Demo title="Tags" tokens={['tag.bg', 'tag.border']}>
          <div className="stack">
            <div className="row row--wrap">
              {tags.map((t) => (
                <Tag key={t} onRemove={() => setTags(tags.filter((x) => x !== t))}>
                  {t}
                </Tag>
              ))}
              {tags.length < 3 && (
                <Button size="sm" variant="ghost" icon={Plus} onClick={() => setTags(['Apparel', 'Holiday', 'Main Street'])}>
                  Restore
                </Button>
              )}
            </div>
            <div className="row row--wrap">
              {['All', 'Apparel', 'Pantry', 'Hardware'].map((t, i) => (
                <Tag key={t} selected={i === 1} onClick={() => {}}>
                  {t}
                </Tag>
              ))}
            </div>
          </div>
        </Demo>
        <Demo title="Tooltips & popovers" tokens={['tooltip.bg', 'tooltip.fg', 'tooltip.radius', 'menu.shadow']} style={{ minHeight: 200 }}>
          <div className="row row--wrap row--loose" style={{ paddingTop: 36 }}>
            <Tooltip content="Last received Nov 18" open>
              <Button size="sm">Always shown</Button>
            </Tooltip>
            <Tooltip content="Reorder point: 20 units">
              <Button size="sm">Hover me</Button>
            </Tooltip>
            <Popover
              trigger={(p) => (
                <Button size="sm" variant="primary" {...p}>
                  Popover
                </Button>
              )}
            >
              <div className="stack">
                <div className="t-headline">Adjust count</div>
                <TextInput label="Counted" defaultValue="45" size="sm" />
                <div className="row">
                  <div className="spacer" />
                  <Button size="sm" variant="primary">
                    Apply
                  </Button>
                </div>
              </div>
            </Popover>
          </div>
        </Demo>
        <Demo title="Accordion">
          <Accordion
            defaultOpen={['a']}
            items={[
              { id: 'a', title: 'Receiving policy', content: 'Count every carton against the packing slip before signing. Note shortages on the carrier’s copy.' },
              { id: 'b', title: 'Returns to vendor', content: 'Damaged goods are photographed, tagged RTV, and held in Aisle E for 14 days.' },
              { id: 'c', title: 'Cycle counts', content: 'Each aisle is counted once a month. Hardware and Gifts are counted every two weeks in Q4.' },
            ]}
          />
        </Demo>
      </div>
    </>
  );
}

function Feedback() {
  const toast = useToast();
  const [dialog, setDialog] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [sheet, setSheet] = useState<false | 'right' | 'bottom'>(false);
  const [progress, setProgress] = useState(42);
  return (
    <>
      <div className="grid grid--2">
        <Demo title="Alerts" tokens={['color.status.info.bg', 'color.status.warning.border', 'alert.radius']}>
          <div className="stack">
            <Alert tone="info" title="Count scheduled">
              Aisle C will be counted Friday at 7:00 a.m.
            </Alert>
            <Alert tone="success" title="Order received">
              All 48 units of PO-24803 were received.
            </Alert>
            <Alert tone="warning" title="Six products below reorder point" action={<Button size="sm">Review</Button>}>
              Suggested orders total $2,914.
            </Alert>
            <Alert tone="danger" title="Sync failed" onDismiss={() => {}}>
              Riverside POS has not reported since 9:12 a.m.
            </Alert>
          </div>
        </Demo>
        <Demo title="Notifications" description="Toasts appear bottom-right and dismiss themselves.">
          <div className="stack">
            <Toast isStatic tone="success" title="Transfer complete" text="12 units moved to Harbor." onDismiss={() => {}} />
            <Toast isStatic tone="warning" title="Low stock" text="Beeswax Taper Candles: 9 left." />
            <div className="row row--wrap">
              {(['info', 'success', 'warning', 'danger'] as const).map((t) => (
                <Button key={t} size="sm" onClick={() => toast({ tone: t, title: `${t[0].toUpperCase() + t.slice(1)} notification`, text: 'Triggered from the component gallery.' })}>
                  Show {t}
                </Button>
              ))}
            </div>
          </div>
        </Demo>
        <Demo title="Dialogs & sheets" tokens={['dialog.bg', 'dialog.radius', 'dialog.shadow', 'dialog.scrim', 'motion.duration.page']}>
          <div className="row row--wrap">
            <Button onClick={() => setDialog(true)}>Open dialog</Button>
            <Button variant="danger" onClick={() => setConfirm(true)}>
              Destructive confirm
            </Button>
            <Button onClick={() => setSheet('right')}>Side sheet</Button>
            <Button onClick={() => setSheet('bottom')}>Bottom sheet</Button>
          </div>
          <Dialog open={dialog} onClose={() => setDialog(false)} title="Receive shipment" footer={<><Button onClick={() => setDialog(false)}>Cancel</Button><Button variant="primary" onClick={() => { setDialog(false); toast({ tone: 'success', title: 'Shipment received' }); }}>Receive</Button></>}>
            <div className="stack stack--md">
              <p>Confirm the quantities for PO-24803 before posting to inventory.</p>
              <TextInput label="Cartons received" defaultValue="4" />
              <Checkbox label="Print shelf labels" defaultChecked />
            </div>
          </Dialog>
          <Dialog open={confirm} onClose={() => setConfirm(false)} title="Delete purchase order?" footer={<><Button onClick={() => setConfirm(false)}>Keep order</Button><Button variant="danger" onClick={() => setConfirm(false)}>Delete order</Button></>}>
            PO-24797 and its single line item will be removed. This cannot be undone.
          </Dialog>
          <Sheet open={!!sheet} side={sheet || 'right'} onClose={() => setSheet(false)} title="Filters" footer={<><Button onClick={() => setSheet(false)}>Reset</Button><Button variant="primary" onClick={() => setSheet(false)}>Apply</Button></>}>
            <div className="stack stack--md">
              <Select label="Category" options={['All', 'Apparel', 'Pantry']} />
              <Checkbox label="Only low stock" />
              <Checkbox label="Include discontinued" />
            </div>
          </Sheet>
        </Demo>
        <Demo title="Contained dialog (static)" padded={false} style={{ height: 220, overflow: 'hidden', background: 'var(--color-bg-app)' }}>
          <Dialog open contained title="Discard changes?" footer={<><Button size="sm">Cancel</Button><Button size="sm" variant="primary">Discard</Button></>}>
            Your edits to this count will be lost.
          </Dialog>
        </Demo>
        <Demo title="Progress & loading" tokens={['progress.fill', 'progress.track', 'skeleton.bg', 'motion.duration.spin']}>
          <div className="stack stack--md">
            <div className="stack stack--xs">
              <div className="row row--between t-footnote">
                <span>Importing price file</span>
                <span className="t-num">{progress}%</span>
              </div>
              <Progress value={progress} label="Import progress" />
              <Slider aria-label="Progress value" value={progress} onChange={setProgress} format={false} />
            </div>
            <Progress value={100} tone="success" label="Complete" />
            <Progress value={88} tone="warning" label="Budget used" />
            <Progress indeterminate label="Syncing" />
            <div className="row">
              <Spinner size="sm" /> <span className="t-footnote c-secondary">Syncing Riverside…</span>
            </div>
          </div>
        </Demo>
        <Demo title="Loading & empty states">
          <div className="grid grid--2">
            <div className="stack">
              <Skeleton height={14} width="60%" />
              <Skeleton height={10} />
              <Skeleton height={10} width="85%" />
              <Skeleton height={80} />
            </div>
            <EmptyState icon={Package} title="No purchase orders" action={<Button size="sm" variant="primary" icon={Plus}>New order</Button>}>
              Orders you create will appear here.
            </EmptyState>
          </div>
        </Demo>
      </div>
    </>
  );
}

function DataTables() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('All');
  const [cat, setCat] = useState('All');
  const [sel, setSel] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [striped, setStriped] = useState(false);
  const per = 8;
  const rows = useMemo(() => PRODUCTS.filter((p) => (status === 'All' || p.status === status) && (cat === 'All' || p.category === cat) && (!q || `${p.name} ${p.sku} ${p.vendor}`.toLowerCase().includes(q.toLowerCase()))), [q, status, cat]);
  const pageRows = rows.slice((page - 1) * per, page * per);
  const cols: Column<Product>[] = [
    { key: 'sku', header: 'SKU', sortable: true, render: (r) => <span className="t-code">{r.sku}</span> },
    { key: 'name', header: 'Product', sortable: true },
    { key: 'category', header: 'Category', sortable: true },
    { key: 'onHand', header: 'On hand', numeric: true, sortable: true },
    { key: 'price', header: 'Price', numeric: true, sortable: true, render: (r) => fmtCurrency(r.price, 2) },
    { key: 'value', header: 'Value', numeric: true, sortable: true, sortValue: (r) => r.onHand * r.unitCost, render: (r) => fmtCurrency(r.onHand * r.unitCost) },
    { key: 'status', header: 'Status', sortable: true, render: (r) => <Badge dot tone={r.status === 'In stock' ? 'success' : r.status === 'Low stock' ? 'warning' : r.status === 'Out of stock' ? 'danger' : 'neutral'}>{r.status}</Badge> },
  ];
  return (
    <Demo title="Sortable, filterable, expandable, selectable" description="Click column headers to sort. Expand a row for details. Select rows to see bulk actions." tokens={['table.row.height', 'table.header.bg', 'table.row.bg.hover', 'table.row.bg.selected', 'table.border', 'table.cell.padding.x']} padded={false}>
      <div className="m-toolbar" style={{ flexWrap: 'wrap', paddingTop: 8, paddingBottom: 8 }}>
        {sel.length > 0 ? (
          <>
            <span className="t-subhead">{sel.length} selected</span>
            <Button size="sm" icon={Truck}>
              Transfer
            </Button>
            <Button size="sm" icon={ShoppingCart}>
              Reorder
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSel([])}>
              Clear
            </Button>
          </>
        ) : (
          <>
            <SearchField size="sm" value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Filter by name, SKU, vendor" style={{ width: 240 }} />
            <Select size="sm" aria-label="Category" value={cat} onChange={(v) => { setCat(v); setPage(1); }} options={['All', 'Apparel', 'Home Goods', 'Pantry', 'Hardware', 'Stationery', 'Gifts']} />
            <SegmentedControl size="sm" value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={['All', 'In stock', 'Low stock', 'Out of stock'].map((s) => ({ value: s, label: s }))} aria-label="Status" />
          </>
        )}
        <div className="spacer" />
        <Switch checked={striped} onChange={setStriped} label="Zebra" />
      </div>
      <DataTable
        flush
        striped={striped}
        columns={cols}
        rows={pageRows}
        rowKey={(r) => r.sku}
        selectable
        selectedKeys={sel}
        onSelectionChange={setSel}
        initialSort={{ key: 'name', dir: 'asc' }}
        emptyText="No products match these filters."
        expandable={(r) => (
          <div className="grid grid--4">
            <div className="kv">
              <span>Vendor</span>
              <span>{r.vendor}</span>
              <span>Location</span>
              <span>{r.location}</span>
            </div>
            <div className="kv">
              <span>Reorder point</span>
              <span className="t-num">{r.reorderPoint}</span>
              <span>On order</span>
              <span className="t-num">{r.onOrder}</span>
            </div>
            <div className="kv">
              <span>Sold (30 d)</span>
              <span className="t-num">{r.sold30}</span>
              <span>Last received</span>
              <span>{r.lastReceived}</span>
            </div>
            <div className="row">
              <Button size="sm" icon={Pencil}>
                Edit
              </Button>
              <Button size="sm" variant="ghost" icon={ShoppingCart}>
                Reorder
              </Button>
            </div>
          </div>
        )}
      />
      <div className="m-toolbar" style={{ borderTop: '1px solid var(--color-border-subtle)', borderBottom: 0 }}>
        <span className="t-footnote c-secondary">
          {rows.length} products · {fmtCurrency(rows.reduce((s, r) => s + r.onHand * r.unitCost, 0))} on hand
        </span>
        <div className="spacer" />
        <Pagination page={page} pageCount={Math.max(1, Math.ceil(rows.length / per))} onChange={setPage} />
      </div>
    </Demo>
  );
}

function Structure() {
  const [date, setDate] = useState<string | null>('2026-11-24');
  const [sel, setSel] = useState(PRODUCTS[0].sku);
  const p = PRODUCTS.find((x) => x.sku === sel)!;
  const events = [
    { date: '2026-11-24', label: 'PO-24811 ships', tone: 'info' as const },
    { date: '2026-11-25', label: 'Window install', tone: 'accent' as const },
    { date: '2026-11-27', label: 'Thanksgiving: closed', tone: 'danger' as const },
    { date: '2026-11-28', label: 'Black Friday', tone: 'warning' as const },
    { date: '2026-11-28', label: 'All hands on floor', tone: 'accent' as const },
    { date: '2026-12-01', label: 'Month-end close', tone: 'success' as const },
    { date: '2026-11-14', label: 'Brass pulls received', tone: 'success' as const },
  ];
  return (
    <>
      <div className="grid grid--2">
        <Demo title="Calendar: picker" tokens={['color.accent.default', 'color.accent.on', 'radius.control']}>
          <div style={{ maxWidth: 300 }}>
            <Calendar value={date} onChange={setDate} events={events} />
          </div>
        </Demo>
        <Demo title="Timeline">
          <Timeline
            items={[
              { id: '1', title: 'Order placed', time: 'Nov 17', state: 'done', icon: ShoppingCart, body: 'PO-24811 · 6 lines · $8,420' },
              { id: '2', title: 'Confirmed by vendor', time: 'Nov 18', state: 'done', icon: PackageCheck },
              { id: '3', title: 'In transit', time: 'Nov 24', state: 'current', icon: Truck, body: 'Two styles delayed to Dec 4' },
              { id: '4', title: 'Received', time: 'Est. Nov 26', state: 'upcoming', icon: Box },
            ]}
          />
        </Demo>
      </div>
      <Demo title="Calendar: month view">
        <Calendar large value={date} onChange={setDate} events={events} month="2026-11-01" />
      </Demo>
      <div className="grid grid--2">
        <Demo title="Activity log">
          <ActivityLog entries={STOCK_ACTIVITY.map((a, i) => ({ id: String(i), actor: a.who, action: a.what, time: a.time, meta: a.ref, icon: a.kind === 'receive' ? PackageCheck : a.kind === 'alert' ? Bell : a.kind === 'transfer' ? Truck : a.kind === 'order' ? ShoppingCart : Pencil }))} />
        </Demo>
        <Demo title="Avatars in context">
          <div className="stack">
            {['Dana Whitlock', 'Marcus Bell', 'Priya Natarajan'].map((n) => (
              <div key={n} className="row">
                <Avatar name={n} />
                <div className="spacer">
                  <div className="t-subhead">{n}</div>
                  <div className="t-footnote c-secondary">Main Street</div>
                </div>
                <Badge tone="success" dot>
                  On shift
                </Badge>
              </div>
            ))}
            <Button size="sm" variant="ghost" icon={Users} onClick={() => navigate('apps/scheduling')}>
              Open Employee Scheduling
            </Button>
          </div>
        </Demo>
      </div>
      <Demo title="Split view with inspector panel" tokens={['nav.sidebar.bg', 'layout.inspector.width', 'table.row.bg.selected']} padded={false}>
        <SplitView
          style={{ height: 380, border: 0, borderRadius: 0 }}
          sidebar={
            <div style={{ padding: 6 }}>
              <NavHeading>Categories</NavHeading>
              {['Apparel', 'Home Goods', 'Pantry', 'Hardware'].map((c, i) => (
                <NavItem key={c} label={c} selected={i === 0} meta={PRODUCTS.filter((p) => p.category === c).length} />
              ))}
            </div>
          }
          inspector={
            <InspectorPanel
              title={p.name}
              sections={[
                { title: 'Stock', content: <div className="kv"><span>On hand</span><span className="t-num">{p.onHand}</span><span>Reorder at</span><span className="t-num">{p.reorderPoint}</span><span>On order</span><span className="t-num">{p.onOrder}</span></div> },
                { title: 'Pricing', content: <><TextInput size="sm" label="Price" defaultValue={p.price.toFixed(2)} key={p.sku} /><div className="t-footnote c-secondary">Margin {Math.round((1 - p.unitCost / p.price) * 100)}%</div></> },
                { title: 'Status', content: <Badge dot tone={p.status === 'In stock' ? 'success' : p.status === 'Low stock' ? 'warning' : 'danger'}>{p.status}</Badge> },
              ]}
            />
          }
        >
          <DataTable flush rows={PRODUCTS.filter((x) => x.category === 'Apparel' || x.category === 'Home Goods')} rowKey={(r) => r.sku} activeKey={sel} onRowClick={(r) => setSel(r.sku)} columns={[{ key: 'name', header: 'Product' }, { key: 'onHand', header: 'On hand', numeric: true }]} />
        </SplitView>
      </Demo>
    </>
  );
}

const RENDER: Record<Cat, () => React.ReactElement> = { buttons: Buttons, inputs: Inputs, navigation: Navigation, containers: Containers, feedback: Feedback, data: DataTables, structure: Structure };

export function Components({ sub }: { sub?: string }) {
  const cat = (CATS.find((c) => c.value === sub)?.value ?? 'buttons') as Cat;
  const Body = RENDER[cat];
  return (
    <Page eyebrow="Library" title="Components" description="Every component draws its appearance from component tokens, which map to semantic tokens. Edit a token on the right and every instance updates, here, in the platform previews, and in all six sample applications.">
      <Tabs value={cat} onChange={(v) => navigate(`components/${v}`)} tabs={CATS} aria-label="Component categories" />
      <Workbench editorTitle={`${CATS.find((c) => c.value === cat)!.label} tokens`} editor={<EditorTabs key={cat} tabs={EDITOR_TABS[cat]} />}>
        <Section title={CATS.find((c) => c.value === cat)!.label}>
          <Body />
        </Section>
      </Workbench>
    </Page>
  );
}
