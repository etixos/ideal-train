import { ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react';
import { Fragment, useCallback, useState, type ReactNode } from 'react';
import { Icon } from './Icon';
import { cx, useClickOutside } from './util';

/* ── Tabs ── */
export interface TabsProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  tabs: { value: T; label: ReactNode; icon?: LucideIcon; disabled?: boolean; badge?: ReactNode }[];
  className?: string;
  'aria-label'?: string;
}

export function Tabs<T extends string>({ value, onChange, tabs, className, ...rest }: TabsProps<T>) {
  return (
    <div className={cx('m-tabs', className)} role="tablist" aria-label={rest['aria-label']}>
      {tabs.map((t) => (
        <button key={t.value} type="button" role="tab" aria-selected={value === t.value} disabled={t.disabled} className={cx('m-tab', value === t.value && 'is-selected')} onClick={() => onChange(t.value)}>
          {t.icon && <Icon icon={t.icon} />}
          {t.label}
          {t.badge}
        </button>
      ))}
    </div>
  );
}

/* ── Breadcrumbs ── */
export interface Crumb {
  label: string;
  onClick?: () => void;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="m-crumbs" aria-label="Breadcrumb">
      {items.map((c, i) => {
        const last = i === items.length - 1;
        return (
          <Fragment key={i}>
            {i > 0 && <Icon icon={ChevronRight} size="sm" />}
            {last ? (
              <span aria-current="page">{c.label}</span>
            ) : c.href ? (
              <a href={c.href}>{c.label}</a>
            ) : (
              <button type="button" onClick={c.onClick}>
                {c.label}
              </button>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}

/* ── Pagination ── */
export function Pagination({ page, pageCount, onChange }: { page: number; pageCount: number; onChange: (page: number) => void }) {
  const pages: (number | '…')[] = [];
  for (let i = 1; i <= pageCount; i++) {
    if (i === 1 || i === pageCount || Math.abs(i - page) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== '…') pages.push('…');
  }
  return (
    <nav className="m-pager" aria-label="Pagination">
      <button type="button" className="m-pager__page" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
        <Icon icon={ChevronLeft} size="sm" />
      </button>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`g${i}`} className="m-pager__gap">
            …
          </span>
        ) : (
          <button key={p} type="button" className={cx('m-pager__page t-num', p === page && 'is-selected')} aria-current={p === page ? 'page' : undefined} onClick={() => onChange(p)}>
            {p}
          </button>
        ),
      )}
      <button type="button" className="m-pager__page" disabled={page >= pageCount} onClick={() => onChange(page + 1)} aria-label="Next page">
        <Icon icon={ChevronRight} size="sm" />
      </button>
    </nav>
  );
}

/* ── Menu ── */
export type MenuItem =
  | { type?: 'item'; label: string; icon?: LucideIcon; shortcut?: string; danger?: boolean; disabled?: boolean; onSelect?: () => void }
  | { type: 'separator' }
  | { type: 'label'; label: string };

export interface MenuProps {
  items: MenuItem[];
  onClose?: () => void;
  align?: 'left' | 'right';
  direction?: 'down' | 'up';
  /** Render in normal flow instead of floating (gallery / static display). */
  inline?: boolean;
  className?: string;
}

export function Menu({ items, onClose, align = 'left', direction = 'down', inline, className }: MenuProps) {
  return (
    <div className={cx('m-menu', align === 'right' && 'm-menu--right', direction === 'up' && 'm-menu--up', className)} role="menu" style={inline ? { position: 'static', animation: 'none' } : undefined}>
      {items.map((it, i) =>
        it.type === 'separator' ? (
          <div key={i} className="m-menu__sep" role="separator" />
        ) : it.type === 'label' ? (
          <div key={i} className="m-menu__label">
            {it.label}
          </div>
        ) : (
          <button
            key={i}
            type="button"
            role="menuitem"
            className={cx('m-menu__item', it.danger && 'm-menu__item--danger')}
            disabled={it.disabled}
            onClick={() => {
              it.onSelect?.();
              onClose?.();
            }}
          >
            {it.icon && <Icon icon={it.icon} />}
            {it.label}
            {it.shortcut && <span className="m-menu__shortcut">{it.shortcut}</span>}
          </button>
        ),
      )}
    </div>
  );
}

/** A trigger element with a dropdown menu. `trigger` receives toggle props. */
export function MenuButton({
  trigger,
  items,
  align,
  direction,
}: {
  trigger: (props: { onClick: () => void; 'aria-expanded': boolean; 'aria-haspopup': 'menu' }) => ReactNode;
  items: MenuItem[];
  align?: 'left' | 'right';
  direction?: 'down' | 'up';
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useClickOutside<HTMLDivElement>(open, close);
  return (
    <div className="m-anchor" ref={ref}>
      {trigger({ onClick: () => setOpen((o) => !o), 'aria-expanded': open, 'aria-haspopup': 'menu' })}
      {open && <Menu items={items} onClose={close} align={align} direction={direction} />}
    </div>
  );
}

/* ── Sidebar navigation ── */
export function Sidebar({ children, className, style, label }: { children: ReactNode; className?: string; style?: React.CSSProperties; label?: string }) {
  return (
    <nav className={cx('m-sidebar', className)} style={style} aria-label={label}>
      {children}
    </nav>
  );
}

export function NavHeading({ children }: { children: ReactNode }) {
  return <div className="m-nav-heading">{children}</div>;
}

export interface NavItemProps {
  icon?: LucideIcon;
  label: ReactNode;
  meta?: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  href?: string;
  className?: string;
  forceState?: 'hover';
}

export function NavItem({ icon, label, meta, selected, onClick, href, className, forceState }: NavItemProps) {
  const cls = cx('m-nav-item', selected && 'is-selected', forceState && `is-${forceState}`, className);
  const inner = (
    <>
      {icon && <Icon icon={icon} size="nav" />}
      <span className="m-nav-item__label">{label}</span>
      {meta != null && <span className="m-nav-item__meta">{meta}</span>}
    </>
  );
  return href ? (
    <a className={cls} href={href} aria-current={selected ? 'page' : undefined} onClick={onClick}>
      {inner}
    </a>
  ) : (
    <button type="button" className={cls} aria-current={selected ? 'page' : undefined} onClick={onClick}>
      {inner}
    </button>
  );
}

export function Toolbar({ children, className, style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={cx('m-toolbar', className)} role="toolbar" style={style}>
      {children}
    </div>
  );
}
