import { VnButton } from './VnButton';

export type QuickMenuItem = {
  id: string;
  label: string;
  onClick: () => void;
  /** Nút bật/tắt (vd Tự động): true = đang bật. */
  pressed?: boolean;
};

/** Figma: Quick Menu — hàng nút Ghost nhỏ trong khung thoại. */
export function QuickMenu({ items }: { items: QuickMenuItem[] }) {
  return (
    <div className="flex gap-[4px]">
      {items.map((item) => (
        <VnButton
          key={item.id}
          variant="ghost"
          size="sm"
          aria-pressed={item.pressed}
          onClick={(e) => {
            e.stopPropagation();
            item.onClick();
          }}
        >
          {item.label}
        </VnButton>
      ))}
    </div>
  );
}
