import { ChevronRight, X, type LucideIcon } from 'lucide-react';
import { useCallback, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { Icon } from './Icon';
import { cx, useClickOutside } from './util';

/* ── Card ── */
export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  /** Apply card padding directly (no header/body structure). */
  padded?: boolean;
  interactive?: boolean;
  selected?: boolean;
  /** Remove body padding (e.g. when the body is a table). */
  flush?: boolean;
}

export function Card({ title, subtitle, actions, footer, padded, interactive, selected, flush, className, children, ...rest }: CardProps) {
  const structured = title != null || actions != null || footer != null;
  return (
    <div className={cx('m-card', padded && !structured && 'm-card--pad', interactive && 'm-card--interactive', selected && 'is-selected', className)} {...rest}>
      {(title != null || actions != null) && (
        <div className="m-card__header">
          <div style={{ flex: 1, minWidth: 0 }}>
            {title != null && <div className="m-card__title">{title}</div>}
            {subtitle != null && <div className="m-card__subtitle">{subtitle}</div>}
          </div>
          {actions}
        </div>
      )}
      {structured ? <div className={flush ? undefined : 'm-card__body'}>{children}</div> : children}
      {footer != null && <div className="m-card__footer">{footer}</div>}
    </div>
  );
}

/* ── Badge / Tag / Avatar / Kbd ── */
export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'highlight';

export function Badge({ tone = 'neutral', icon, dot, count, children, className }: { tone?: Tone; icon?: LucideIcon; dot?: boolean; count?: boolean; children?: ReactNode; className?: string }) {
  return (
    <span className={cx('m-badge', tone !== 'neutral' && `m-badge--${tone}`, count && 'm-badge--count t-num', className)}>
      {dot && <span className="m-badge__dot" aria-hidden />}
      {icon && <Icon icon={icon} />}
      {children}
    </span>
  );
}

export function Tag({ children, onRemove, selected, onClick, icon }: { children: ReactNode; onRemove?: () => void; selected?: boolean; onClick?: () => void; icon?: LucideIcon }) {
  const inner = (
    <>
      {icon && <Icon icon={icon} size="sm" />}
      {children}
      {onRemove && (
        <button
          type="button"
          className="m-tag__remove"
          aria-label="Remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <Icon icon={X} size="sm" />
        </button>
      )}
    </>
  );
  return onClick && !onRemove ? (
    <button type="button" className={cx('m-tag', selected && 'is-selected')} aria-pressed={selected} onClick={onClick}>
      {inner}
    </button>
  ) : (
    <span className={cx('m-tag', selected && 'is-selected')}>{inner}</span>
  );
}

export function Avatar({ name, size }: { name: string; size?: 'sm' | 'lg' }) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <span className={cx('m-avatar', size && `m-avatar--${size}`)} title={name} aria-label={name} role="img">
      {initials}
    </span>
  );
}

export const Kbd = ({ children }: { children: ReactNode }) => <kbd className="m-kbd">{children}</kbd>;

export const Divider = ({ vertical, style }: { vertical?: boolean; style?: CSSProperties }) => <div className={cx('m-divider', vertical && 'm-divider--vertical')} role="separator" style={style} />;

/* ── Tooltip ── */
export function Tooltip({ content, children, placement = 'top', open }: { content: ReactNode; children: ReactNode; placement?: 'top' | 'bottom'; open?: boolean }) {
  return (
    <span className="m-tooltip-wrap">
      {children}
      <span role="tooltip" className={cx('m-tooltip', placement === 'bottom' && 'm-tooltip--bottom', open && 'is-open')}>
        {content}
      </span>
    </span>
  );
}

/* ── Popover ── */
export function Popover({
  trigger,
  children,
  align = 'left',
  direction = 'down',
  width,
}: {
  trigger: (props: { onClick: () => void; 'aria-expanded': boolean }) => ReactNode;
  children: ReactNode | ((close: () => void) => ReactNode);
  align?: 'left' | 'right';
  direction?: 'down' | 'up';
  width?: number | string;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useClickOutside<HTMLDivElement>(open, close);
  return (
    <div className="m-anchor" ref={ref}>
      {trigger({ onClick: () => setOpen((o) => !o), 'aria-expanded': open })}
      {open && (
        <div className={cx('m-popover', align === 'right' && 'm-popover--right', direction === 'up' && 'm-popover--up')} role="dialog" style={{ width }}>
          {typeof children === 'function' ? children(close) : children}
        </div>
      )}
    </div>
  );
}

/* ── Accordion ── */
export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
}

export function Accordion({ items, defaultOpen = [], multiple = true }: { items: AccordionItem[]; defaultOpen?: string[]; multiple?: boolean }) {
  const [open, setOpen] = useState<string[]>(defaultOpen);
  const toggle = (id: string) => setOpen((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : multiple ? [...cur, id] : [id]));
  return (
    <div className="m-accordion">
      {items.map((it) => {
        const isOpen = open.includes(it.id);
        return (
          <div key={it.id} className={cx('m-accordion__item', isOpen && 'is-open')}>
            <button type="button" className="m-accordion__trigger" aria-expanded={isOpen} onClick={() => toggle(it.id)}>
              <Icon icon={ChevronRight} size="sm" className="m-accordion__chevron" />
              {it.title}
            </button>
            {isOpen && <div className="m-accordion__panel">{it.content}</div>}
          </div>
        );
      })}
    </div>
  );
}

/* ── Empty state ── */
export function EmptyState({ icon, title, children, action }: { icon?: LucideIcon; title: ReactNode; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="m-empty">
      {icon && <Icon icon={icon} />}
      <div className="m-empty__title">{title}</div>
      {children && <div className="t-footnote">{children}</div>}
      {action}
    </div>
  );
}
