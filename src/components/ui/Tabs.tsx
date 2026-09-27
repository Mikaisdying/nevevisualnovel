import { cn } from '@/lib/utils';

export type TabItem<T extends string> = { id: T; label: string };

type TabsProps<T extends string> = {
  items: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  /**
   * pill: các tab rời (Thư viện) · segment: 2 tab gộp trong 1 khung (Lưu / Tải)
   * · side: danh sách dọc (sidebar Cài đặt).
   */
  variant?: 'pill' | 'segment' | 'side';
  className?: string;
};

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  variant = 'pill',
  className,
}: TabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-orientation={variant === 'side' ? 'vertical' : 'horizontal'}
      className={cn(
        variant === 'segment' && 'vn-segment',
        variant === 'pill' && 'flex gap-[8px]',
        variant === 'side' && 'flex flex-col gap-[6px]',
        className,
      )}
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={item.id === value}
          className={variant === 'side' ? 'vn-side-tab' : 'vn-tab'}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
