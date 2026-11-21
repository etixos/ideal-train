import { ArrowRight, BookOpen, CheckCircle2, Clock, FlaskConical, Lightbulb, Archive, AlertCircle, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Page, Section } from '../lab/Page';
import { APPS_REGISTER } from '../register/seed';
import { fmtValue, pendingChanges, snapshotValues } from '../register/snapshot';
import { getRegister, register, useRegister } from '../register/store';
import { STATUS_META, type Decision, type DecisionStatus } from '../register/types';
import { navigate } from '../shell/router';
import { actions, getState, useTheme } from '../state/store';
import { DEFAULT_THEME } from '../tokens/presets';
import { Alert, Badge, Button, Card, Dialog, Icon, Select, Tabs, TextArea, TextInput, useToast } from '../ui';

const TAB_ORDER: DecisionStatus[] = ['needs-decision', 'approved', 'testing', 'idea', 'retired'];
const TAB_ICON = { 'needs-decision': AlertCircle, approved: CheckCircle2, testing: FlaskConical, idea: Lightbulb, retired: Archive };

export const useWaitingCount = () => useRegister((s) => s.decisions.filter((d) => d.status === 'needs-decision').length);

/** Count of lab edits not adopted yet. */
export function usePendingCount() {
  const theme = useTheme();
  const baseline = useRegister((s) => s.baseline);
  return useMemo(() => pendingChanges(theme, baseline, snapshotValues(DEFAULT_THEME)).length, [theme, baseline]);
}

function Swatches({ colors }: { colors: string[] }) {
  return (
    <span className="row row--tight" aria-hidden>
      {colors.map((c) => (
        <span key={c} title={c} style={{ width: 18, height: 18, borderRadius: 3, background: c, border: '1px solid var(--color-border-default)' }} />
      ))}
    </span>
  );
}

function DecisionCard({ d }: { d: Decision }) {
  const toast = useToast();
  const [choice, setChoice] = useState(d.chosen ?? d.options?.find((o) => o.recommended)?.id ?? d.options?.[0]?.id);
  const meta = STATUS_META[d.status];
  const adopt = () => {
    const opt = d.options?.find((o) => o.id === choice);
    if (opt?.apply) {
      actions.applyValuePatch(opt.apply, `adopt:${d.id}`);
      // The applied values are now adopted, so they no longer count as "not adopted yet".
      // Other unadopted edits stay pending.
      const base: Record<string, unknown> = { ...(getRegister().baseline ?? snapshotValues(DEFAULT_THEME)) };
      const now = snapshotValues(getState().theme);
      for (const id of Object.keys(opt.apply)) {
        if (now[id] === undefined) delete base[id];
        else base[id] = now[id];
      }
      register.setBaseline(base);
    }
    register.markAdopted(d.id, choice);
    toast({ tone: 'success', title: `Adopted: ${d.title}`, text: opt ? `${opt.label}. ${opt.apply ? 'The lab has been updated.' : 'Recorded.'}` : 'Recorded as Approved.' });
  };
  return (
    <Card padded>
      <div className="stack stack--md">
        <div className="row row--top row--wrap">
          <div className="spacer stack stack--xs" style={{ minWidth: 220 }}>
            <div className="row row--wrap row--tight">
              <span className="t-code c-tertiary">{d.id}</span>
              <Badge tone={meta.tone} dot>
                {meta.label}
              </Badge>
              {d.scope.map((s) => (
                <Badge key={s}>{s}</Badge>
              ))}
              {d.date && <span className="t-caption c-tertiary">{d.status === 'approved' ? `Approved ${d.date}` : d.date}</span>}
            </div>
            <div className="t-headline">{d.title}</div>
          </div>
          <Select
            size="sm"
            aria-label={`Change status of ${d.title}`}
            value={d.status}
            onChange={(v) => register.setStatus(d.id, v as DecisionStatus)}
            options={TAB_ORDER.map((s) => ({ value: s, label: STATUS_META[s].label }))}
          />
        </div>
        <p className="c-secondary">{d.summary}</p>
        {d.options && (
          <div className="stack stack--xs" role="radiogroup" aria-label={`Options for ${d.title}`}>
            {d.options.map((o) => {
              const sel = choice === o.id;
              const adopted = d.chosen === o.id && d.status === 'approved';
              return (
                <label key={o.id} className={`decision-option${sel ? ' is-selected' : ''}`}>
                  <input type="radio" name={d.id} checked={sel} onChange={() => setChoice(o.id)} disabled={d.status === 'approved'} />
                  <span className="stack" style={{ gap: 2, flex: 1, minWidth: 0 }}>
                    <span className="row row--wrap row--tight">
                      <span className="t-subhead">{o.label}</span>
                      {o.recommended && d.status !== 'approved' && <Badge tone="info">Recommended</Badge>}
                      {adopted && <Badge tone="success">Adopted</Badge>}
                    </span>
                    <span className="t-footnote c-secondary">{o.detail}</span>
                  </span>
                  {o.swatches && <Swatches colors={o.swatches} />}
                </label>
              );
            })}
          </div>
        )}
        {d.note && <p className="t-footnote c-secondary">Note: {d.note}</p>}
        {d.changes && d.changes.length > 0 && (
          <details>
            <summary className="t-footnote">{d.changes.length} token changes</summary>
            <div className="t-code c-secondary" style={{ marginTop: 6 }}>
              {d.changes.map((c) => (
                <div key={c.id}>
                  {c.id}: {fmtValue(c.from)} → {fmtValue(c.to)}
                </div>
              ))}
            </div>
          </details>
        )}
        <div className="row row--wrap">
          <span className="t-caption c-tertiary spacer">Source: {d.source}</span>
          {d.tokens && d.tokens.length > 0 && (
            <Button size="sm" variant="ghost" iconRight={ArrowRight} onClick={() => navigate('editor')}>
              {d.tokens.length} tokens
            </Button>
          )}
          {d.status !== 'approved' && d.status !== 'retired' && (
            <Button size="sm" variant="primary" icon={CheckCircle2} onClick={adopt}>
              Adopt{d.options ? ' this option' : ''}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function PendingPanel() {
  const theme = useTheme();
  const toast = useToast();
  const baseline = useRegister((s) => s.baseline);
  const pending = useMemo(() => pendingChanges(theme, baseline, snapshotValues(DEFAULT_THEME)), [theme, baseline]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  if (pending.length === 0)
    return (
      <Alert tone="success" title="Every change in the lab is adopted">
        Edits you make from now on appear here until you adopt them.
      </Alert>
    );
  return (
    <Card
      title={`${pending.length} change${pending.length === 1 ? '' : 's'} in the lab not adopted yet`}
      subtitle="These are experiments. They are not Mercantile rules until you adopt them."
      actions={
        <Button variant="primary" icon={CheckCircle2} onClick={() => setOpen(true)}>
          Adopt these changes
        </Button>
      }
    >
      <div className="scroll-x">
        <table className="m-table">
          <thead>
            <tr>
              <th>Token</th>
              <th>Applies to</th>
              <th>Was</th>
              <th>Now</th>
            </tr>
          </thead>
          <tbody>
            {pending.slice(0, 40).map((p) => (
              <tr key={p.key}>
                <td className="t-code">{p.id}</td>
                <td>{p.where}</td>
                <td className="t-code c-secondary is-wrap">{fmtValue(p.from)}</td>
                <td className="t-code is-wrap">{fmtValue(p.to)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pending.length > 40 && <p className="t-footnote c-secondary">…and {pending.length - 40} more.</p>}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Adopt these changes?"
        footer={
          <>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                const rec = register.add({
                  title: title.trim() || `Lab changes adopted ${new Date().toISOString().slice(0, 10)}`,
                  summary: note.trim() || `${pending.length} token changes adopted from the lab.`,
                  status: 'approved',
                  scope: [...new Set(pending.map((p) => (p.where === 'Both modes' ? 'Family' : p.where.replace(' only', ''))))],
                  source: 'Mercantile Design Lab',
                  date: new Date().toISOString().slice(0, 10),
                  adoptedBy: 'Owner (in the lab)',
                  tokens: [...new Set(pending.map((p) => p.id))],
                  changes: pending.map((p) => ({ id: p.key, from: p.from, to: p.to })),
                });
                register.setBaseline(snapshotValues(theme));
                setOpen(false);
                setTitle('');
                setNote('');
                toast({ tone: 'success', title: `Adopted as ${rec.id}`, text: 'Recorded in Decisions as Approved.' });
              }}
            >
              Adopt
            </Button>
          </>
        }
      >
        <div className="stack stack--md">
          <p>
            Adopting makes these {pending.length} changes the Mercantile rule and records them in Decisions with today’s date. Apps change only when you <b>apply</b> Mercantile to them.
          </p>
          <TextInput label="Name this decision" placeholder="e.g. Softer dark-mode borders" value={title} onChange={setTitle} />
          <TextArea label="Why (optional)" rows={3} value={note} onChange={setNote} />
        </div>
      </Dialog>
    </Card>
  );
}

function AppsTable() {
  return (
    <Card flush title="Your apps" subtitle="Where each app stands. None uses the shared tokens yet: each keeps its own copy.">
      <div className="scroll-x">
        <table className="m-table">
          <thead>
            <tr>
              <th>App</th>
              <th>Brand</th>
              <th>Platform</th>
              <th>Accent</th>
              <th>Uses shared tokens</th>
              <th className="is-num">Stray colors</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {APPS_REGISTER.map((a) => (
              <tr key={a.id}>
                <td>
                  <div className="t-subhead">{a.name}</div>
                  <div className="t-caption c-tertiary t-code">{a.repo}</div>
                </td>
                <td>{a.brand}</td>
                <td className="is-wrap">{a.platform}</td>
                <td>
                  <span className="row row--tight">
                    <Swatches colors={[a.accent.light, a.accent.dark]} />
                    <Badge tone={a.accent.status === 'Approved' ? 'success' : 'warning'}>{a.accent.status}</Badge>
                  </span>
                </td>
                <td className="is-wrap">{a.sharedTokens}</td>
                <td className="is-num">{a.hardcoded}</td>
                <td className="is-wrap c-secondary">{a.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function Decisions({ sub }: { sub?: string }) {
  const decisions = useRegister((s) => s.decisions);
  const [tab, setTab] = useState<DecisionStatus | 'apps'>((TAB_ORDER as string[]).includes(sub ?? '') || sub === 'apps' ? (sub as DecisionStatus) : 'needs-decision');
  const counts = Object.fromEntries(TAB_ORDER.map((s) => [s, decisions.filter((d) => d.status === s).length])) as Record<DecisionStatus, number>;
  const list = tab === 'apps' ? [] : decisions.filter((d) => d.status === tab);
  return (
    <Page
      eyebrow="Mercantile"
      title="Decisions"
      description="Everything that is approved, still being tested, or waiting on you, across every app. Started from your design-system documents and the seven app repositories; each entry names its source."
      actions={
        <Button
          variant="ghost"
          icon={RotateCcw}
          onClick={() => {
            register.resetToSeed();
          }}
        >
          Restore starting list
        </Button>
      }
    >
      <Card padded>
        <div className="grid grid--3">
          {[
            ['Adopt', 'Make it the Mercantile rule. The lab is updated and the decision is recorded here with today’s date.', 'Design system'],
            ['Apply', 'Bring one app up to the current Mercantile rules.', 'One app'],
            ['Publish', 'Release an app’s own work. Never used for design decisions.', 'One app’s code'],
          ].map(([w, d, s]) => (
            <div key={w} className="stack stack--xs">
              <div className="row row--tight">
                <Icon icon={BookOpen} size="sm" className="c-highlight" />
                <span className="t-headline">{w}</span>
                <Badge>{s}</Badge>
              </div>
              <p className="t-footnote c-secondary">{d}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid--4">
        {(['needs-decision', 'approved', 'testing', 'idea'] as DecisionStatus[]).map((s) => (
          <button key={s} type="button" className="m-card m-card--pad m-card--interactive" style={{ textAlign: 'left', font: 'inherit', color: 'inherit' }} onClick={() => setTab(s)}>
            <div className="row row--tight">
              <Icon icon={TAB_ICON[s]} size="sm" className={s === 'needs-decision' ? 'c-danger' : s === 'approved' ? 'c-success' : s === 'testing' ? 'c-warning' : 'c-info'} />
              <span className="t-overline c-secondary">{STATUS_META[s].label}</span>
            </div>
            <div className="kpi__value" style={{ marginTop: 4 }}>
              {counts[s]}
            </div>
            <div className="t-caption c-tertiary">{STATUS_META[s].help}</div>
          </button>
        ))}
      </div>

      <Section title="Changes not adopted yet">
        <PendingPanel />
      </Section>

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          ...TAB_ORDER.map((s) => ({ value: s, label: STATUS_META[s].label, icon: TAB_ICON[s], badge: <Badge count tone={s === 'needs-decision' && counts[s] ? 'danger' : 'neutral'}>{counts[s]}</Badge> })),
          { value: 'apps' as const, label: 'Your apps', icon: Clock },
        ]}
        aria-label="Decision status"
      />
      {tab === 'apps' ? (
        <AppsTable />
      ) : list.length === 0 ? (
        <p className="c-secondary">Nothing here.</p>
      ) : (
        <div className="stack stack--md">
          <p className="t-footnote c-secondary">
            {STATUS_META[tab].help} Your documents call this “{STATUS_META[tab].sourceIndex}”.
          </p>
          {list.map((d) => (
            <DecisionCard key={d.id} d={d} />
          ))}
        </div>
      )}
    </Page>
  );
}
