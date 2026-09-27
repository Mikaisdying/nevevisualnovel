import * as React from 'react';

type DialogueBoxProps = {
  name?: string;
  text: string;
  /** Chữ đã chạy xong → hiện mũi tên ▼ nhấp nháy. */
  done: boolean;
  onAdvance: () => void;
  /** Thanh nút nhanh góc dưới phải (QuickMenu). */
  footer?: React.ReactNode;
};

/**
 * Figma: Dialogue Box — khung 1080x200 đặt tại (100, 490), bảng tên nổi ở mép
 * trên, dòng thoại 22px, ▼ khi chạy xong, Quick Menu góc dưới phải.
 */
export function DialogueBox({ name, text, done, onAdvance, footer }: DialogueBoxProps) {
  return (
    <div className="layer-foreground absolute top-[466px] left-[100px] h-[224px] w-[1080px]">
      <div
        className="vn-dialogue absolute inset-x-0 bottom-0 h-[200px] cursor-pointer select-none"
        onClick={onAdvance}
      >
        <p className="vn-dialogue-line absolute top-[32px] right-[40px] left-[40px] whitespace-pre-line">
          {text}
        </p>
        {done && (
          <span aria-hidden className="vn-next-indicator absolute right-[34px] bottom-[64px]">
            ▼
          </span>
        )}
      </div>
      {name && <div className="vn-nameplate absolute top-0 left-[30px]">{name}</div>}
      {footer && <div className="absolute right-[24px] bottom-[14px]">{footer}</div>}
    </div>
  );
}
