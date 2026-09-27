import * as React from 'react';
import { Overlay, Panel } from './Overlay';

type DialogCardProps = {
  title: string;
  description?: string;
  /** Các nút hành động (VnButton), xếp ngang giữa. */
  actions: React.ReactNode;
};

/** Figma: Dialog 540x260 — dùng cho xác nhận (về menu, thoát, ghi đè) và thông báo "Đã lưu". */
export function DialogCard({ title, description, actions }: DialogCardProps) {
  return (
    <Overlay>
      <Panel
        role="dialog"
        aria-modal="true"
        className="vn-rise-in flex min-h-[260px] w-[540px] flex-col items-center justify-center gap-[14px] p-[36px] text-center"
      >
        <h2 className="vn-display text-[36px] leading-[1.2] font-bold">{title}</h2>
        {description && <p className="text-[15px] text-[var(--vn-muted)]">{description}</p>}
        <div className="mt-[4px] flex gap-[12px]">{actions}</div>
      </Panel>
    </Overlay>
  );
}
