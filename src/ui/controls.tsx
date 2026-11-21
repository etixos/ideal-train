import { Check, ChevronDown, type LucideIcon } from 'lucide-react';
import { useCallback, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Icon } from './Icon';
import { Menu, type MenuItem } from './navigation';
import { cx, stateClass, useClickOutside, type ForcedState } from './util';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ControlSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: ButtonVariant;
  size?: ControlSize;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  loading?: boolean;
  success?: boolean;
  block?: boolean;
  selected?: boolean;
  /** Display a state statically (gallery use). */
  forceState?: ForcedState;
  children?: ReactNode;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  iconRight,
  loading,
  success,
  block,
  selected,
  forceState,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  const isLoading = loading || forceState === 'loading';
  const isSuccess = success || forceState === 'success';
  return (
    <button
      type={type}
      className={cx(
        'm-btn',
        `m-btn--${variant}`,
        size !== 'md' && `m-btn--${size}`,
        block && 'm-btn--block',
        selected && 'is-selected',
        isLoading && 'is-loading',
        isSuccess && 'is-success',
        forceState && !['loading', 'success'].includes(forceState) && stateClass(forceState),
        className,
      )}
      disabled={disabled}
      aria-busy={isLoading || undefined}
      aria-pressed={selected}
      {...rest}
    >
      {isLoading ? <span className="m-spinner m-spinner--sm" aria-hidden /> : isSuccess ? <Icon icon={Check} /> : icon ? <Icon icon={icon} /> : null}
      {children != null && <span className="m-btn__label">{children}</span>}
      {iconRight && <Icon icon={iconRight} />}
    </button>
  );
}

export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'icon' | 'iconRight'> {
  icon: LucideIcon;
  /** Required accessible name. Also shown as a native tooltip. */
  label: string;
}

export function IconButton({ icon, label, variant = 'ghost', className, loading, forceState, ...rest }: IconButtonProps) {
  const isLoading = loading || forceState === 'loading';
  return (
    <Button variant={variant} className={cx('m-btn--icon', className)} aria-label={label} title={label} forceState={forceState} loading={loading} {...rest}>
      {isLoading ? null : <Icon icon={icon} />}
    </Button>
  );
}

export function ButtonGroup({ children, className, label }: { children: ReactNode; className?: string; label?: string }) {
  return (
    <div className={cx('m-btn-group', className)} role="group" aria-label={label}>
      {children}
    </div>
  );
}

export interface SplitButtonProps {
  children: ReactNode;
  items: MenuItem[];
  variant?: ButtonVariant;
  size?: ControlSize;
  icon?: LucideIcon;
  onClick?: () => void;
  disabled?: boolean;
  menuLabel?: string;
}

/** Primary action with an attached menu of alternates. */
export function SplitButton({ children, items, variant = 'primary', size = 'md', icon, onClick, disabled, menuLabel = 'More actions' }: SplitButtonProps) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useClickOutside<HTMLDivElement>(open, close);
  return (
    <div className="m-split" ref={ref}>
      <Button variant={variant} size={size} icon={icon} onClick={onClick} disabled={disabled}>
        {children}
      </Button>
      <Button variant={variant} size={size} className="m-split__caret" aria-label={menuLabel} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)} disabled={disabled}>
        <Icon icon={ChevronDown} size="sm" />
      </Button>
      {open && <Menu items={items} onClose={close} align="right" />}
    </div>
  );
}
