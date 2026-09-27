import * as React from 'react';
import { cn } from '@/lib/utils';

type OverlayProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Độ tối của lớp phủ (0–1). Figma: 0.72 cho overlay, 0.92 cho CG viewer. */
  dim?: number;
};

/** Lớp phủ tối full canvas; children được căn giữa. */
export function Overlay({ dim = 0.72, className, style, ...props }: OverlayProps) {
  return (
    <div
      className={cn(
        'vn-dim vn-fade-in layer-modal absolute inset-0 flex items-center justify-center',
        className,
      )}
      style={{ '--vn-dim-alpha': dim, ...style } as React.CSSProperties}
      {...props}
    />
  );
}

/** Khung panel gradient viền tím (Figma: Settings panel, Pause panel, Backlog panel, Dialog). */
export function Panel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('vn-panel', className)} {...props} />;
}
