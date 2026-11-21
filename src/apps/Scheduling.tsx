import { CalendarDays, CalendarRange, Check, Clock, Plane, Plus, Users, X } from 'lucide-react';
import { useState } from 'react';
import { Heatmap } from '../charts/ChartKit';
import { EMPLOYEES, SHIFTS, TIME_OFF, WEEK_DAYS, type Shift } from '../data/people';
import { DAYS, HOURS, coverageHeatmap } from '../data/retail';
import { Avatar, Badge, Button, Calendar, Card, DataTable, Dialog, IconButton, SegmentedControl, Select, TextInput, cx, useToast } from '../ui';
import { AppShell } from './AppShell';

const KIND_LABEL: Record<Shift['kind'], string> = { open: 'Open', mid: 'Mid', close: 'Close', off: 'Off', pto: 'PTO' };
const fmtH = (h: number) => `${h > 12 ? h - 12 : h}${h >= 12 ? 'p' : 'a'}`;

export function SchedulingApp() {
  const toast = useToast();
  const [page, setPage] = useState('week');
  const [store, setStore] = useState('All stores');
  const [shifts, setShifts] = useState(SHIFTS);
  const [edit, setEdit] = useState<{ emp: string; day: number } | null>(null);
  const [requests, setRequests] = useState(TIME_OFF);
  const emps = EMPLOYEES.filter((e) => store === 'All stores' || e.store === store);
  const hours = (id: string) => shifts.filter((s) => s.emp === id && s.kind !== 'pto').reduce((t, s) => t + s.end - s.start, 0);
  return (
    <AppShell
      name="Roster"
      current={page}
      onNav={setPage}
      nav={[
        { id: 'week', label: 'Week schedule', icon: CalendarRange },
        { id: 'month', label: 'Calendar', icon: CalendarDays },
        { id: 'coverage', label: 'Coverage', icon: Clock },
        { id: 'team', label: 'Team', icon: Users, meta: EMPLOYEES.length },
        { id: 'timeoff', label: 'Time off', icon: Plane, meta: requests.filter((r) => r.status === 'Pending').length || undefined },
      ]}
      toolbar={
        <>
          <span className="m-toolbar__title">{page === 'week' ? 'Week of November 23' : page === 'month' ? 'November 2026' : page === 'coverage' ? 'Coverage' : page === 'team' ? 'Team' : 'Time off'}</span>
          <div className="spacer" />
          <Select size="sm" aria-label="Store" value={store} onChange={setStore} options={['All stores', 'Main Street', 'Riverside', 'Harbor', 'Old Town', 'Northgate']} />
          <Button size="sm" variant="primary" onClick={() => toast({ tone: 'success', title: 'Schedule published', text: 'Team members were notified.' })}>
            Publish
          </Button>
        </>
      }
    >
      {page === 'week' && (
        <div className="m-table-wrap">
          <table className="m-table roster">
            <thead>
              <tr>
                <th style={{ width: 200 }}>Team member</th>
                {WEEK_DAYS.map((d) => (
                  <th key={d} className="is-center">
                    {d}
                  </th>
                ))}
                <th className="is-num">Hours</th>
              </tr>
            </thead>
            <tbody>
              {emps.map((e) => {
                const h = hours(e.id);
                const over = h > (e.type === 'Full-time' ? 40 : 28);
                return (
                  <tr key={e.id}>
                    <td>
                      <div className="row">
                        <Avatar name={e.name} size="sm" />
                        <div style={{ minWidth: 0 }}>
                          <div className="t-subhead truncate">{e.name}</div>
                          <div className="t-caption c-tertiary">{e.role}</div>
                        </div>
                      </div>
                    </td>
                    {WEEK_DAYS.map((_, d) => {
                      const s = shifts.find((x) => x.emp === e.id && x.day === d);
                      return (
                        <td key={d} className="is-center" style={{ padding: 4 }}>
                          <button type="button" className={cx('shift', s && `shift--${s.kind}`)} onClick={() => setEdit({ emp: e.id, day: d })} aria-label={s ? `${e.name}, ${WEEK_DAYS[d]}: ${KIND_LABEL[s.kind]} ${s.kind !== 'pto' ? `${fmtH(s.start)}–${fmtH(s.end)}` : ''}` : `Add shift for ${e.name} on ${WEEK_DAYS[d]}`}>
                            {s ? (
                              s.kind === 'pto' ? (
                                <span>PTO</span>
                              ) : (
                                <>
                                  <span className="t-num">
                                    {fmtH(s.start)}–{fmtH(s.end)}
                                  </span>
                                  <span className="shift__station">{s.station}</span>
                                </>
                              )
                            ) : (
                              <Plus size={12} aria-hidden className="shift__add" />
                            )}
                          </button>
                        </td>
                      );
                    })}
                    <td className="is-num">
                      {over ? (
                        <Badge tone="warning" dot>
                          {h}h overtime
                        </Badge>
                      ) : (
                        <span className="t-num">{h}h</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {page === 'week' && (
        <div className="row row--wrap t-footnote c-secondary">
          {(['open', 'mid', 'close', 'pto'] as const).map((k) => (
            <span key={k} className="row row--tight">
              <span className={`shift shift--${k}`} style={{ width: 14, height: 14, minHeight: 0, padding: 0 }} aria-hidden />
              {KIND_LABEL[k]}
            </span>
          ))}
          <span>Shifts are labeled with times and station as well as color.</span>
        </div>
      )}
      {page === 'month' && (
        <Card padded>
          <Calendar large month="2026-11-01" events={[{ date: '2026-11-27', label: 'Closed: Thanksgiving', tone: 'danger' }, { date: '2026-11-28', label: 'Black Friday: all hands', tone: 'warning' }, { date: '2026-11-25', label: 'H. Lindqvist PTO', tone: 'info' }, { date: '2026-11-26', label: 'H. Lindqvist PTO', tone: 'info' }, { date: '2026-11-24', label: 'Seasonal training', tone: 'accent' }, { date: '2026-12-01', label: 'T. Alvarez exam', tone: 'info' }]} />
        </Card>
      )}
      {page === 'coverage' && (
        <Card title="Coverage vs. requirement" subtitle="Values under 100% are understaffed">
          <Heatmap rows={coverageHeatmap.map((r) => ({ label: r.day, values: r.values }))} columns={HOURS} diverging midpoint={100} format={(v) => `${v}%`} legendLabel="Coverage" />
          <p className="t-footnote c-secondary" style={{ marginTop: 12 }}>
            {DAYS[4]} and {DAYS[5]} afternoons are below requirement. Consider adding a mid shift.
          </p>
        </Card>
      )}
      {page === 'team' && <DataTable rows={EMPLOYEES} rowKey={(r) => r.id} columns={[{ key: 'name', header: 'Name', sortable: true, render: (r) => <div className="row"><Avatar name={r.name} size="sm" />{r.name}</div> }, { key: 'role', header: 'Role', sortable: true }, { key: 'store', header: 'Store', sortable: true }, { key: 'type', header: 'Type', sortable: true, render: (r) => <Badge>{r.type}</Badge> }, { key: 'sched', header: 'Scheduled', numeric: true, sortValue: (r) => hours(r.id), render: (r) => `${hours(r.id)}h` }]} />}
      {page === 'timeoff' && (
        <div className="stack">
          {requests.map((r, i) => (
            <Card key={r.name + r.dates} padded>
              <div className="row row--wrap">
                <Avatar name={r.name} />
                <div className="spacer">
                  <div className="t-subhead">{r.name}</div>
                  <div className="t-footnote c-secondary">
                    {r.dates} · {r.reason}
                  </div>
                </div>
                {r.status === 'Pending' ? (
                  <>
                    <IconButton icon={X} label="Decline" variant="secondary" onClick={() => setRequests(requests.map((x, k) => (k === i ? { ...x, status: 'Declined' } : x)))} />
                    <Button size="sm" variant="primary" icon={Check} onClick={() => setRequests(requests.map((x, k) => (k === i ? { ...x, status: 'Approved' } : x)))}>
                      Approve
                    </Button>
                  </>
                ) : (
                  <Badge tone={r.status === 'Approved' ? 'success' : 'danger'} dot>
                    {r.status}
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
      <ShiftDialog
        edit={edit}
        shifts={shifts}
        onClose={() => setEdit(null)}
        onSave={(s) => {
          setShifts((cur) => [...cur.filter((x) => !(x.emp === s.emp && x.day === s.day)), ...(s.kind === 'off' ? [] : [s])]);
          setEdit(null);
        }}
      />
    </AppShell>
  );
}

function ShiftDialog({ edit, shifts, onClose, onSave }: { edit: { emp: string; day: number } | null; shifts: Shift[]; onClose: () => void; onSave: (s: Shift) => void }) {
  const cur = edit ? shifts.find((x) => x.emp === edit.emp && x.day === edit.day) : undefined;
  const [kind, setKind] = useState<Shift['kind']>('open');
  const [start, setStart] = useState('9');
  const [end, setEnd] = useState('17');
  const [station, setStation] = useState('Floor');
  const key = edit ? `${edit.emp}-${edit.day}` : '';
  const [lastKey, setLastKey] = useState('');
  if (key && key !== lastKey) {
    setLastKey(key);
    setKind(cur?.kind ?? 'open');
    setStart(String(cur?.start || 9));
    setEnd(String(cur?.end || 17));
    setStation(cur?.station || 'Floor');
  }
  const emp = EMPLOYEES.find((e) => e.id === edit?.emp);
  const invalid = kind !== 'pto' && kind !== 'off' && +end <= +start;
  return (
    <Dialog
      open={!!edit}
      contained
      onClose={onClose}
      title={emp ? `${emp.name} · ${WEEK_DAYS[edit!.day]}` : ''}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={invalid} onClick={() => edit && onSave({ emp: edit.emp, day: edit.day, kind, start: +start, end: +end, station })}>
            Save shift
          </Button>
        </>
      }
    >
      <div className="stack stack--md">
        <SegmentedControl block value={kind} onChange={setKind} options={(['open', 'mid', 'close', 'pto', 'off'] as const).map((k) => ({ value: k, label: KIND_LABEL[k] }))} aria-label="Shift type" />
        {kind !== 'pto' && kind !== 'off' && (
          <>
            <div className="grid grid--2">
              <Select label="Start" value={start} onChange={setStart} options={Array.from({ length: 15 }, (_, i) => ({ value: String(7 + i), label: fmtH(7 + i) }))} />
              <Select label="End" value={end} onChange={setEnd} error={invalid ? 'End must be after start.' : undefined} options={Array.from({ length: 15 }, (_, i) => ({ value: String(8 + i), label: fmtH(8 + i) }))} />
            </div>
            <TextInput label="Station" value={station} onChange={setStation} />
          </>
        )}
      </div>
    </Dialog>
  );
}
