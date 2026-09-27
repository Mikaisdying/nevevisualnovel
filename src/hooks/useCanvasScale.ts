import { useLayoutEffect, useRef, useState } from 'react';

/**
 * Đo kích thước thật (px) của phần tử wrapper và trả về hệ số scale để canvas
 * thiết kế cố định (designWidth x designHeight) nằm trọn trong wrapper:
 * scale = min(rộng / designWidth, cao / designHeight) — fit cả chiều ngang lẫn
 * dọc, giữ nguyên tỉ lệ; phần dư là viền (letterbox / pillarbox).
 */
export function useCanvasScale(designWidth: number, designHeight: number) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const updateScale = () => {
      setScale(Math.min(el.clientWidth / designWidth, el.clientHeight / designHeight));
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    return () => observer.disconnect();
  }, [designWidth, designHeight]);

  return { wrapperRef, scale };
}
