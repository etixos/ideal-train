export const USERS = [
  { id: 'U-001', name: 'Dana Whitlock', email: 'dana.w@hollisgrant.example', role: 'Administrator', status: 'Active', lastActive: '2 min ago', mfa: true },
  { id: 'U-002', name: 'Marcus Bell', email: 'marcus.b@hollisgrant.example', role: 'Inventory', status: 'Active', lastActive: '14 min ago', mfa: true },
  { id: 'U-003', name: 'Priya Natarajan', email: 'priya.n@hollisgrant.example', role: 'Manager', status: 'Active', lastActive: '1 hr ago', mfa: true },
  { id: 'U-004', name: 'Theo Alvarez', email: 'theo.a@hollisgrant.example', role: 'Associate', status: 'Invited', lastActive: '—', mfa: false },
  { id: 'U-005', name: 'Hannah Lindqvist', email: 'hannah.l@hollisgrant.example', role: 'Manager', status: 'Active', lastActive: 'Yesterday', mfa: false },
  { id: 'U-006', name: 'Oliver Grant', email: 'oliver.g@hollisgrant.example', role: 'Associate', status: 'Suspended', lastActive: '12 days ago', mfa: false },
  { id: 'U-007', name: 'Ruth Calder', email: 'ruth@halyard.example', role: 'Vendor (read-only)', status: 'Active', lastActive: '3 days ago', mfa: true },
];

export const AUDIT_LOG = [
  { time: '2026-11-21 09:44', actor: 'Dana Whitlock', action: 'Updated role', target: 'Hannah Lindqvist → Manager', severity: 'info' },
  { time: '2026-11-21 09:12', actor: 'System', action: 'Failed sign-in (3 attempts)', target: 'oliver.g@hollisgrant.example', severity: 'warning' },
  { time: '2026-11-21 08:30', actor: 'System', action: 'Nightly backup completed', target: 'pos-primary', severity: 'success' },
  { time: '2026-11-20 17:05', actor: 'Priya Natarajan', action: 'Exported report', target: 'Riverside payroll (Nov)', severity: 'info' },
  { time: '2026-11-20 15:48', actor: 'Dana Whitlock', action: 'Suspended user', target: 'Oliver Grant', severity: 'danger' },
  { time: '2026-11-20 11:20', actor: 'Marcus Bell', action: 'Changed setting', target: 'Low-stock threshold: 20% → 25%', severity: 'info' },
];

export const SERVICES = [
  { name: 'Point of sale', status: 'Operational', latency: 82, uptime: 0.9998 },
  { name: 'Inventory sync', status: 'Degraded', latency: 410, uptime: 0.9961 },
  { name: 'Payments gateway', status: 'Operational', latency: 120, uptime: 0.9999 },
  { name: 'Email delivery', status: 'Operational', latency: 95, uptime: 0.9994 },
];
