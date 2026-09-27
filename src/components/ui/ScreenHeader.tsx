import { VnButton } from './VnButton';
import { useI18n } from '@/i18n';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
};

/** Figma: Screen Header — nút "← Quay lại", tiêu đề lớn, mô tả phụ. Đặt tại (48, 36) của màn. */
export function ScreenHeader({ title, subtitle, onBack, backLabel }: ScreenHeaderProps) {
  const { t } = useI18n();
  return (
    <div className="absolute top-[36px] left-[48px] flex w-[640px] flex-col items-start">
      {onBack && (
        <VnButton
          variant="ghost"
          size="md"
          className="-ml-[20px]"
          style={{ color: 'var(--vn-accent)' }}
          onClick={onBack}
        >
          ← {backLabel ?? t.common.back}
        </VnButton>
      )}
      <h1 className="vn-display mt-[4px] text-[52px] leading-[1.2] font-bold tracking-[0.04em]">
        {title}
      </h1>
      {subtitle && <p className="mt-[2px] text-[15px] text-[var(--vn-muted)]">{subtitle}</p>}
    </div>
  );
}
