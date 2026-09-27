import * as React from 'react';

type SceneCardViewProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Nút hành động (thẻ kết chương); không có thì hiển thị subtitle kiểu gợi ý bấm tiếp. */
  actions?: React.ReactNode;
  onClick?: () => void;
};

/** Figma: "40 Ch2 · Title card" và "25 Chapter End" — chữ lớn giữa màn, nửa dưới. */
export function SceneCardView({ eyebrow, title, subtitle, actions, onClick }: SceneCardViewProps) {
  return (
    <div
      className="vn-dim vn-fade-in layer-foreground absolute inset-0 flex flex-col items-center justify-end pb-[140px] text-center"
      style={{ '--vn-dim-alpha': 0.45, cursor: onClick ? 'pointer' : undefined } as React.CSSProperties}
      onClick={onClick}
    >
      {eyebrow && (
        <p className="text-[14px] font-semibold tracking-[0.3em] text-[var(--vn-accent)] uppercase">
          {eyebrow}
        </p>
      )}
      <h1 className="vn-display vn-rise-in mt-[10px] text-[72px] leading-[1.15] font-semibold">
        {title}
      </h1>
      {subtitle && (
        <p
          className={
            actions
              ? 'mt-[14px] text-[16px] text-[var(--vn-muted)]'
              : 'mt-[14px] font-[family-name:var(--vn-font-display)] text-[20px] text-[var(--vn-muted)] italic'
          }
        >
          {subtitle}
        </p>
      )}
      {actions && <div className="mt-[18px] flex gap-[12px]">{actions}</div>}
    </div>
  );
}
