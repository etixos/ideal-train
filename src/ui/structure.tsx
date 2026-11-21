import { Calendar as CalIcon, ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react';
import { useState, type CSSProperties, type ReactNode } from 'react';
import { IconButton } from './controls';
import { Icon } from './Icon';
import { Popover } from './surfaces';
import { cx } from './util';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const parseIso = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

export interface CalendarEvent {
  date: string;
  label: string;
  tone?: 'accent' | 'success' | 'warning' | 'danger' | 'info';
}

export interface CalendarProps {
  value?: string | null;
  onChange?: (date: string) => void;
  /** Month shown initially (ISO date inside the month). */
  month?: string;
  events?: CalendarEvent[];
  /** Larger cells that list events (month view) instead of a compact picker. */
  large?: boolean;
  today?: string;
  minDate?: string;
  rangeEnd?: string | null;
}

/** Month calendar: compact date picker or full month view with events. */
export function Calendar({ value, onChange, month, events = [], large, today = '2026-11-21', minDate, rangeEnd }: CalendarProps) {
  const [view, setView] = useState(() => {
    const d = parseIso(month ?? value ?? today);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const first = new Date(view.getFullYear(), view.getMonth(), 1);
  const start = new Date(first);
  start.setDate(1 - ((first.getDay() + 6) % 7)); // Monday-first
  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
  const shift = (n: number) => setView(new Date(view.getFullYear(), view.getMonth() + n, 1));
  return (
    <div className={cx('m-cal', large && 'm-cal--large')}>
      <div className="m-cal__head">
        <span className="m-cal__title">
          {MONTH_NAMES[view.getMonth()]} {view.getFullYear()}
        </span>
        <IconButton icon={ChevronLeft} label="Previous month" size="sm" onClick={() => shift(-1)} />
        <IconButton icon={ChevronRight} label="Next month" size="sm" onClick={() => shift(1)} />
      </div>
      <div className="m-cal__grid" role="grid">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d} className="m-cal__dow" role="columnheader">
            {large ? d : d.slice(0, 2)}
          </div>
        ))}
        {days.map((d) => {
          const key = iso(d);
          const out = d.getMonth() !== view.getMonth();
          const dayEvents = events.filter((e) => e.date === key);
          const selected = key === value;
          const inRange = value && rangeEnd && key > value && key <= rangeEnd;
          const disabled = !!minDate && key < minDate;
          return (
            <button
              key={key}
              type="button"
              role="gridcell"
              aria-selected={selected}
              aria-label={`${d.toDateString()}${dayEvents.length ? `, ${dayEvents.length} events` : ''}`}
              disabled={disabled}
              className={cx('m-cal__day', out && 'is-outside', selected && 'is-selected', inRange && 'is-range', key === today && 'is-today')}
              onClick={() => onChange?.(key)}
            >
              <span className="m-cal__num">{d.getDate()}</span>
              {large
                ? dayEvents.slice(0, 3).map((e, i) => (
                    <span key={i} className={cx('m-cal__event', e.tone && `m-cal__event--${e.tone}`)}>
                      {e.label}
                    </span>
                  ))
                : dayEvents.length > 0 && <span className="m-cal__dot" aria-hidden />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Text field + popover calendar. */
export function DatePicker({ value, onChange, label, placeholder = 'Select date' }: { value: string | null; onChange: (v: string) => void; label?: string; placeholder?: string }) {
  const display = value ? parseIso(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
  return (
    <div className="m-field">
      {label && <span className="m-field__label">{label}</span>}
      <Popover
        width={280}
        trigger={(p) => (
          <button type="button" className="m-input" style={{ cursor: 'pointer', textAlign: 'left', width: 220 }} {...p} aria-label={label ?? 'Date'}>
            <Icon icon={CalIcon} />
            <span className={display ? undefined : 'c-tertiary'} style={{ flex: 1 }}>
              {display || placeholder}
            </span>
          </button>
        )}
      >
        {(close) => (
          <Calendar
            value={value}
            onChange={(d) => {
              onChange(d);
              close();
            }}
          />
        )}
      </Popover>
    </div>
  );
}

/* ── Timeline ── */
export interface TimelineItem {
  id: string;
  title: ReactNode;
  time: ReactNode;
  body?: ReactNode;
  icon?: LucideIcon;
  tone?: 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  state?: 'done' | 'current' | 'upcoming';
}

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="m-timeline">
      {items.map((it) => (
        <li key={it.id} className={cx('m-timeline__item', it.state && `is-${it.state}`, it.tone && `m-timeline__item--${it.tone}`)}>
          <span className="m-timeline__marker" aria-hidden>
            {it.icon && <Icon icon={it.icon} size="sm" />}
          </span>
          <div className="m-timeline__content">
            <div className="row row--between row--top">
              <span className="m-timeline__title">{it.title}</span>
              <span className="m-timeline__time">{it.time}</span>
            </div>
            {it.body && <div className="m-timeline__body">{it.body}</div>}
            {it.state === 'current' && <span className="sr-only">Current step</span>}
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ── Activity log ── */
export interface ActivityEntry {
  id: string;
  actor: string;
  action: ReactNode;
  time: string;
  icon?: LucideIcon;
  meta?: ReactNode;
}

export function ActivityLog({ entries, dense }: { entries: ActivityEntry[]; dense?: boolean }) {
  return (
    <ul className={cx('m-activity', dense && 'm-activity--dense')}>
      {entries.map((e) => (
        <li key={e.id} className="m-activity__item">
          <span className="m-activity__icon">{e.icon && <Icon icon={e.icon} size="sm" />}</span>
          <div className="m-activity__body">
            <div>
              <b className="m-activity__actor">{e.actor}</b> {e.action}
            </div>
            {e.meta && <div className="m-activity__meta">{e.meta}</div>}
          </div>
          <time className="m-activity__time">{e.time}</time>
        </li>
      ))}
    </ul>
  );
}

/* ── Split view & inspector ── */
export function SplitView({ sidebar, children, inspector, style, sidebarWidth }: { sidebar?: ReactNode; children: ReactNode; inspector?: ReactNode; style?: CSSProperties; sidebarWidth?: number | string }) {
  return (
    <div className="m-split-view" style={style}>
      {sidebar && (
        <div className="m-split-view__sidebar" style={{ width: sidebarWidth }}>
          {sidebar}
        </div>
      )}
      <div className="m-split-view__main">{children}</div>
      {inspector && <div className="m-split-view__inspector">{inspector}</div>}
    </div>
  );
}

export function InspectorPanel({ title, sections }: { title: ReactNode; sections: { title: string; content: ReactNode }[] }) {
  return (
    <div className="m-inspector">
      <div className="m-inspector__title">{title}</div>
      {sections.map((s) => (
        <section key={s.title} className="m-inspector__section">
          <div className="m-inspector__heading">{s.title}</div>
          {s.content}
        </section>
      ))}
    </div>
  );
}
