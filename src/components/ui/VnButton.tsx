import * as React from 'react';
import { cn } from '@/lib/utils';

export type VnButtonVariant = 'primary' | 'secondary' | 'ghost' | 'choice';
export type VnButtonSize = 'lg' | 'md' | 'sm';

export type VnButtonProps = React.ComponentProps<'button'> & {
  variant?: VnButtonVariant;
  size?: VnButtonSize;
};

/** Figma: Button (Style = Primary | Secondary | Ghost | Choice, Size = Large | Medium | Small). */
export function VnButton({
  variant = 'secondary',
  size = 'md',
  className,
  type = 'button',
  ...props
}: VnButtonProps) {
  return (
    <button
      type={type}
      data-variant={variant}
      className={cn('vn-btn', `vn-btn--${variant}`, `vn-btn--${size}`, className)}
      {...props}
    />
  );
}
