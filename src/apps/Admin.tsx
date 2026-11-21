import { Activity, KeyRound, Lock, MoreHorizontal, Server, Settings, Shield, UserPlus, Users } from 'lucide-react';
import { useState } from 'react';
import { AUDIT_LOG, SERVICES, USERS } from '../data/admin';
import { Alert, Avatar, Badge, Button, Card, Checkbox, DataTable, Dialog, IconButton, MenuButton, Progress, RadioGroup, SearchField, Select, Switch, Tabs, TextInput, useToast } from '../ui';
import { AppShell } from './AppShell';

export function AdminApp() {
  const toast = useToast();
  const [page, setPage] = useState('users');
  const [users, setUsers] = useState(USERS);
  const [q, setQ] = useState('');
  const [invite, setInvite] = useState(false);
  const [tab, setTab] = useState('general');
  const [sel, setSel] = useState<string[]>([]);
  const [policy, setPolicy] = useState('required');
  const rows = users.filter((u) => !q || `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <AppShell
      name="Console"
      current={page}
      onNav={setPage}
      nav={[
        { id: 'users', label: 'Users', icon: Users, meta: users.length },
        { id: 'roles', label: 'Roles & permissions', icon: KeyRound },
        { id: 'audit', label: 'Audit log', icon: Activity },
        { id: 'status', label: 'System status', icon: Server },
        { id: 'settings', label: 'Settings', icon: Settings },
      ]}
      toolbar={
        <>
          <span className="m-toolbar__title">{{ users: 'Users', roles: 'Roles & permissions', audit: 'Audit log', status: 'System status', settings: 'Settings' }[page]}</span>
          <div className="spacer" />
          {page === 'users' && (
            <Button size="sm" variant="primary" icon={UserPlus} onClick={() => setInvite(true)}>
              Invite user
            </Button>
          )}
        </>
      }
    >
      {page === 'users' && (
        <>
          {users.some((u) => !u.mfa && u.status === 'Active') && (
            <Alert tone="warning" title="Some active users have not set up two-factor authentication">
              Require it under Settings › Security.
            </Alert>
          )}
          <div className="row row--wrap">
            <SearchField value={q} onChange={setQ} placeholder="Search users" style={{ width: 260 }} />
            {sel.length > 0 && (
              <>
                <span className="t-subhead">{sel.length} selected</span>
                <Button size="sm" onClick={() => { setUsers(users.map((u) => (sel.includes(u.id) ? { ...u, status: 'Suspended' } : u))); setSel([]); }}>
                  Suspend
                </Button>
              </>
            )}
          </div>
          <DataTable
            rows={rows}
            rowKey={(r) => r.id}
            selectable
            selectedKeys={sel}
            onSelectionChange={setSel}
            columns={[
              { key: 'name', header: 'User', sortable: true, render: (r) => <div className="row"><Avatar name={r.name} size="sm" /><div><div>{r.name}</div><div className="t-caption c-tertiary">{r.email}</div></div></div> },
              { key: 'role', header: 'Role', sortable: true },
              { key: 'status', header: 'Status', sortable: true, render: (r) => <Badge dot tone={r.status === 'Active' ? 'success' : r.status === 'Invited' ? 'info' : 'danger'}>{r.status}</Badge> },
              { key: 'mfa', header: '2FA', render: (r) => (r.mfa ? <Badge tone="success" icon={Lock}>On</Badge> : <Badge tone="warning">Off</Badge>) },
              { key: 'lastActive', header: 'Last active' },
              { key: 'menu', header: '', align: 'right', render: (r) => <MenuButton align="right" trigger={(p) => <IconButton icon={MoreHorizontal} label={`Actions for ${r.name}`} size="sm" {...p} />} items={[{ label: 'Edit role' }, { label: 'Reset password' }, { type: 'separator' }, { label: r.status === 'Suspended' ? 'Reactivate' : 'Suspend', danger: r.status !== 'Suspended', onSelect: () => setUsers(users.map((u) => (u.id === r.id ? { ...u, status: u.status === 'Suspended' ? 'Active' : 'Suspended' } : u))) }]} /> },
            ]}
          />
        </>
      )}
      {page === 'roles' && (
        <Card flush title="Permission matrix">
          <table className="m-table">
            <thead>
              <tr>
                <th>Permission</th>
                {['Administrator', 'Manager', 'Inventory', 'Associate'].map((r) => (
                  <th key={r} className="is-center">
                    {r}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['View sales', [1, 1, 1, 1]],
                ['Adjust inventory', [1, 1, 1, 0]],
                ['Approve purchase orders', [1, 1, 0, 0]],
                ['Edit schedules', [1, 1, 0, 0]],
                ['Export financials', [1, 0, 0, 0]],
                ['Manage users', [1, 0, 0, 0]],
              ].map(([p, v]) => (
                <tr key={p as string}>
                  <td>{p as string}</td>
                  {(v as number[]).map((x, i) => (
                    <td key={i} className="is-center">
                      <Checkbox aria-label={`${p} for role ${i}`} defaultChecked={!!x} disabled={i === 0} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      {page === 'audit' && <DataTable rows={AUDIT_LOG} rowKey={(r) => r.time + r.action} columns={[{ key: 'time', header: 'Time', sortable: true, render: (r) => <span className="t-num">{r.time}</span> }, { key: 'actor', header: 'Actor', sortable: true }, { key: 'action', header: 'Action' }, { key: 'target', header: 'Target', wrap: true }, { key: 'severity', header: 'Severity', render: (r) => <Badge dot tone={r.severity as 'info'}>{r.severity}</Badge> }]} />}
      {page === 'status' && (
        <div className="grid grid--2">
          {SERVICES.map((s) => (
            <Card key={s.name} padded>
              <div className="row">
                <Shield className="m-icon c-accent" aria-hidden />
                <span className="t-headline spacer">{s.name}</span>
                <Badge dot tone={s.status === 'Operational' ? 'success' : 'warning'}>
                  {s.status}
                </Badge>
              </div>
              <div className="kv" style={{ marginTop: 10 }}>
                <span>Latency</span>
                <span className="t-num">{s.latency} ms</span>
                <span>Uptime (30 d)</span>
                <span className="t-num">{(s.uptime * 100).toFixed(2)}%</span>
              </div>
              <div style={{ marginTop: 8 }}>
                <Progress value={s.uptime * 100} tone={s.uptime > 0.999 ? 'success' : 'warning'} label={`${s.name} uptime`} />
              </div>
            </Card>
          ))}
        </div>
      )}
      {page === 'settings' && (
        <Card padded>
          <div className="stack stack--lg">
            <Tabs value={tab} onChange={setTab} tabs={[{ value: 'general', label: 'General' }, { value: 'security', label: 'Security' }, { value: 'notifications', label: 'Notifications' }]} />
            {tab === 'general' && (
              <div className="grid grid--2" style={{ maxWidth: 720 }}>
                <TextInput label="Organization name" defaultValue="Hollis & Grant Mercantile" />
                <Select label="Time zone" options={['America/New_York', 'America/Chicago', 'America/Los_Angeles']} />
                <Select label="Fiscal year starts" options={['January', 'February', 'July']} />
                <TextInput label="Support email" defaultValue="it@hollisgrant.example" />
              </div>
            )}
            {tab === 'security' && (
              <div className="stack stack--md" style={{ maxWidth: 560 }}>
                <RadioGroup label="Two-factor authentication" value={policy} onChange={setPolicy} options={[{ value: 'optional', label: 'Optional' }, { value: 'required', label: 'Required for all users' }, { value: 'admins', label: 'Required for administrators only' }]} />
                <Switch defaultChecked label="Sign out idle sessions after 30 minutes" />
                <Switch label="Allow vendor accounts" defaultChecked />
              </div>
            )}
            {tab === 'notifications' && (
              <div className="stack">
                <Checkbox label="Failed sign-in alerts" defaultChecked />
                <Checkbox label="Daily audit digest" defaultChecked />
                <Checkbox label="Service degradation" defaultChecked />
              </div>
            )}
            <div className="row">
              <Button variant="primary" onClick={() => toast({ tone: 'success', title: 'Settings saved' })}>
                Save changes
              </Button>
            </div>
          </div>
        </Card>
      )}
      <Dialog
        open={invite}
        contained
        onClose={() => setInvite(false)}
        title="Invite user"
        footer={
          <>
            <Button onClick={() => setInvite(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                const email = (document.getElementById('inv-email') as HTMLInputElement)?.value || 'new.user@hollisgrant.example';
                setUsers([...users, { id: `U-${100 + users.length}`, name: email.split('@')[0], email, role: 'Associate', status: 'Invited', lastActive: '—', mfa: false }]);
                setInvite(false);
                toast({ tone: 'success', title: 'Invitation sent', text: email });
              }}
            >
              Send invitation
            </Button>
          </>
        }
      >
        <div className="stack stack--md">
          <TextInput id="inv-email" label="Email" type="email" placeholder="name@hollisgrant.example" required />
          <Select label="Role" options={['Associate', 'Inventory', 'Manager', 'Administrator']} />
          <Checkbox label="Require two-factor authentication" defaultChecked />
        </div>
      </Dialog>
    </AppShell>
  );
}
