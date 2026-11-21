import type { LucideIcon } from 'lucide-react';
import { cx } from './util';

export interface IconProps {
  icon: LucideIcon;
  /** Token-driven sizes. Omit for icon.size.default. */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'nav';
  className?: string;
  label?: string;
  style?: React.CSSProperties;
}

/** Line icon whose size and stroke weight come from icon tokens. */
export function Icon({ icon: I, size, className, label, style }: IconProps) {
  return (
    <I
      className={cx('m-icon', size && `m-icon--${size}`, className)}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      style={style}
    />
  );
}
