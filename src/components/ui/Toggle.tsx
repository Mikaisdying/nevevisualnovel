import { useI18n } from '@/i18n';

type ToggleProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  onLabel?: string;
  offLabel?: string;
};

/** Figma: Toggle (State = On | Off) — nhãn trái, công tắc, chữ Bật/Tắt. */
export function Toggle({ label, checked, onChange, onLabel, offLabel }: ToggleProps) {
  const { t } = useI18n();
  return (
    <div className="flex h-[30px] items-center gap-[20px]">
      <span className="w-[180px] shrink-0 text-[16px]">{label}</span>
      <div className="flex w-[440px] justify-end">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={label}
          className="vn-toggle"
          onClick={() => onChange(!checked)}
        />
      </div>
      <span className="w-[50px] text-right text-[15px] text-[var(--vn-accent)]">
        {checked ? (onLabel ?? t.common.on) : (offLabel ?? t.common.off)}
      </span>
    </div>
  );
}
