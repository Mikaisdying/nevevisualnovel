import { Thumb } from './Thumb';
import { useI18n } from '@/i18n';

type CgCardProps = {
  title: string;
  subtitle?: string;
  image?: string;
  locked: boolean;
  onClick?: () => void;
};

/** Figma: CG Card (State = Unlocked | Locked), 274x207. */
export function CgCard({ title, subtitle, image, locked, onClick }: CgCardProps) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      className="vn-card flex h-[207px] w-[274px] flex-col text-left"
      data-locked={locked}
      disabled={locked}
      onClick={onClick}
    >
      <Thumb
        src={locked ? undefined : image}
        alt={title}
        placeholder="?"
        className="h-[150px] w-full rounded-none"
      />
      <div className="flex flex-1 flex-col justify-center gap-[2px] px-[14px]">
        <span
          className="truncate text-[14px] font-semibold"
          style={{ color: locked ? 'var(--vn-muted)' : undefined }}
        >
          {locked ? t.library.locked : title}
        </span>
        <span className="truncate text-[12px] text-[var(--vn-muted)]">
          {locked ? t.library.lockedHint : subtitle}
        </span>
      </div>
    </button>
  );
}
