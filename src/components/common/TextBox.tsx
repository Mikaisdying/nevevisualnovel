import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  name?: string;
  content?: string;
}

export function TextBox({ children, className, style, name, content, ...props }: TextBoxProps) {
  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        bottom: '24px',
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: '48rem',
        minHeight: '5rem',
        padding: '1.5rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 32px 0 rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'flex-start',
        ...style,
      }}
      className={cn(
        'relative pointer-events-auto select-none cursor-pointer bg-black/80 text-white',
        className,
      )}
      {...props}
    >
      {/* Name box tạm ẩn */}
      {/* {name && (
        <div
          className="
            absolute
            -top-4
            left-4
            px-3 py-1
            text-sm
            bg-red-600
            text-white
            rounded-md
            shadow-md
          "
        >
          {name}
        </div>
      )} */}

      <div className="w-full text-left">{content || children}</div>
    </div>
  );
}
