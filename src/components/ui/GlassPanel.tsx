import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface Props extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

/** Panel de vidrio premium con specular highlight y glow de neón opcional. */
export const GlassPanel = forwardRef<HTMLDivElement, Props>(
  ({ className, glow, children, ...rest }, ref) => (
    <div
      ref={ref}
      className={cn(
        'glass grain relative overflow-hidden rounded-2xl',
        glow && 'shadow-glow',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  ),
);
GlassPanel.displayName = 'GlassPanel';
