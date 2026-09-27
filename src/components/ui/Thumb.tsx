import { useState } from 'react';
import { cn } from '@/lib/utils';

type ThumbProps = {
  src?: string;
  alt?: string;
  className?: string;
  /** Hiển thị khi không có ảnh / ảnh lỗi (vd "?" hoặc "+"). */
  placeholder?: React.ReactNode;
};

/** Ảnh thu nhỏ cắt vừa khung (object-cover), tự rơi về placeholder khi thiếu file. */
export function Thumb({ src, alt = '', className, placeholder }: ThumbProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = src && failedSrc !== src;

  return (
    <div className={cn('vn-thumb relative flex items-center justify-center', className)}>
      {showImage ? (
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <span className="text-[26px] text-[var(--vn-muted)] opacity-60">{placeholder}</span>
      )}
    </div>
  );
}
