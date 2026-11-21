import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { IconButton } from './controls';
import { Icon } from './Icon';
import { cx } from './util';

export type StatusTone = 'info' | 'success' | 'warning' | 'danger';
const TONE_ICON = { info: Info, success: CheckCircle2, warning: AlertTriangle, danger: XCircle };

/* ── Alert ── */
export function Alert({ tone = 'info', title, children, action, onDismiss }: { tone?: StatusTone; title?: ReactNode; children?: ReactNode; action?: ReactNode; onDismiss?: () => void }) {
  return (
    <div className={cx('m-alert', `m-alert--${tone}`)} role={tone === 'danger' || tone === 'warning' ? 'alert' : 'status'}>
      <Icon icon={TONE_ICON[tone]} />
      <div className="m-alert__body">
        {title && <div className="m-alert__title">{title}</div>}
        {children && <div className="m-alert__text">{children}</div>}
      </div>
      {action}
      {onDismiss && <IconButton icon={X} label="Dismiss" size="sm" onClick={onDismiss} />}
    </div>
  );
}

/* ── Toasts ── */
export interface ToastInput {
  tone?: StatusTone;
  title: ReactNode;
  text?: ReactNode;
  duration?: number;
}
interface ToastItem extends ToastInput {
  id: number;
}

/** Presentational toast — usable statically in the gallery. */
export function Toast({ tone = 'info', title, text, onDismiss, isStatic }: ToastInput & { onDismiss?: () => void; isStatic?: boolean }) {
  return (
    <div className={cx('m-toast', `m-toast--${tone}`, isStatic && 'm-toast--static')} role="status">
      <Icon icon={TONE_ICON[tone]} />
      <div className="m-toast__body">
        <div className="m-toast__title">{title}</div>
        {text && <div className="m-toast__text">{text}</div>}
      </div>
      {onDismiss && <IconButton icon={X} label="Dismiss" size="sm" onClick={onDismiss} />}
    </div>
  );
}

const ToastContext = createContext<(t: ToastInput) => void>(() => {});
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const next = useRef(1);
  const dismiss = useCallback((id: number) => setItems((cur) => cur.filter((t) => t.id !== id)), []);
  const push = useCallback(
    (t: ToastInput) => {
      const id = next.current++;
      setItems((cur) => [...cur.slice(-3), { ...t, id }]);
      window.setTimeout(() => dismiss(id), t.duration ?? 4200);
    },
    [dismiss],
  );
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="m-toasts" aria-live="polite">
        {items.map((t) => (
          <Toast key={t.id} {...t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ── Dialog & Sheet ── */
function useEscape(open: boolean, onClose?: () => void) {
  useEffect(() => {
    if (!open || !onClose) return;
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [open, onClose]);
}

export interface DialogProps {
  open: boolean;
  onClose?: () => void;
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
  /**
   * Position inside the nearest positioned ancestor instead of the viewport.
   * Use inside device frames and gallery demos. (Rendered inline, never portaled,
   * so it always inherits the enclosing ThemeScope's tokens.)
   */
  contained?: boolean;
  style?: CSSProperties;
}

export function Dialog({ open, onClose, title, children, footer, wide, contained, style }: DialogProps) {
  useEscape(open, onClose);
  if (!open) return null;
  return (
    <div className={cx('m-scrim', contained && 'm-scrim--contained')} onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={cx('m-dialog', wide && 'm-dialog--wide')} role="dialog" aria-modal="true" style={style}>
        {(title || onClose) && (
          <div className="m-dialog__header">
            <div className="m-dialog__title">{title}</div>
            {onClose && <IconButton icon={X} label="Close" size="sm" onClick={onClose} />}
          </div>
        )}
        <div className="m-dialog__body">{children}</div>
        {footer && <div className="m-dialog__footer">{footer}</div>}
      </div>
    </div>
  );
}

export interface SheetProps extends Omit<DialogProps, 'wide'> {
  side?: 'right' | 'bottom';
}

export function Sheet({ open, onClose, title, children, footer, side = 'right', contained, style }: SheetProps) {
  useEscape(open, onClose);
  if (!open) return null;
  return (
    <div className={cx('m-scrim', `m-scrim--sheet-${side}`, contained && 'm-scrim--contained')} onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={cx('m-sheet', `m-sheet--${side}`)} role="dialog" aria-modal="true" style={style}>
        {side === 'bottom' && <div className="m-sheet__grabber" aria-hidden />}
        {(title || onClose) && (
          <div className="m-dialog__header">
            <div className="m-dialog__title">{title}</div>
            {onClose && <IconButton icon={X} label="Close" size="sm" onClick={onClose} />}
          </div>
        )}
        <div className="m-dialog__body" style={{ flex: 1 }}>
          {children}
        </div>
        {footer && <div className="m-dialog__footer">{footer}</div>}
      </div>
    </div>
  );
}

/* ── Progress / Spinner / Skeleton ── */
export function Progress({ value, max = 100, tone, indeterminate, label }: { value?: number; max?: number; tone?: 'success' | 'warning' | 'danger'; indeterminate?: boolean; label?: string }) {
  const pct = indeterminate ? undefined : Math.max(0, Math.min(100, ((value ?? 0) / max) * 100));
  return (
    <div className={cx('m-progress', tone && `m-progress--${tone}`, indeterminate && 'm-progress--indeterminate')} role="progressbar" aria-label={label} aria-valuenow={indeterminate ? undefined : Math.round(pct!)} aria-valuemin={0} aria-valuemax={100}>
      <div className="m-progress__bar" style={indeterminate ? undefined : { width: `${pct}%` }} />
    </div>
  );
}

export function Spinner({ size, label = 'Loading' }: { size?: 'sm' | 'lg'; label?: string }) {
  return <span className={cx('m-spinner', size && `m-spinner--${size}`)} role="status" aria-label={label} />;
}

export function Skeleton({ width = '100%', height = 12, style }: { width?: number | string; height?: number | string; style?: CSSProperties }) {
  return <div className="m-skeleton" aria-hidden style={{ width, height, ...style }} />;
}
