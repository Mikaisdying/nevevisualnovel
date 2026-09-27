import { Thumb } from './Thumb';
import { useI18n } from '@/i18n';

type SaveSlotCardProps = {
  slot: number;
  /** Không truyền = ô trống. */
  title?: string;
  detail?: string;
  savedAt?: number;
  image?: string;
  disabled?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
};

const pad = (n: number) => String(n).padStart(2, '0');

function formatDate(ts: number, locale: string) {
  const d = new Date(ts);
  const date = d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
  return `${date}  ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Figma: Save Slot (State = Filled | Empty), 568x126. */
export function SaveSlotCard({
  slot,
  title,
  detail,
  savedAt,
  image,
  disabled,
  onClick,
  onDelete,
}: SaveSlotCardProps) {
  const empty = title === undefined;
  const { t } = useI18n();

  return (
    <div className="group relative">
      <button
        type="button"
        className="vn-slot flex h-[126px] w-[568px] items-center gap-[16px] p-[14px] text-left"
        data-empty={empty}
        disabled={disabled}
        onClick={onClick}
      >
        <Thumb src={image} placeholder="+" className="h-[98px] w-[150px] shrink-0" />
        <div className="flex min-w-0 flex-col gap-[3px]">
          <span className="text-[13px] font-semibold tracking-[0.04em] text-[var(--vn-accent)]">
            {t.saveLoad.slot(pad(slot))}
          </span>
          {empty ? (
            <span className="text-[16px] font-medium text-[var(--vn-muted)]">{t.saveLoad.empty}</span>
          ) : (
            <>
              <span className="truncate text-[16px] font-semibold">{title}</span>
              {detail && (
                <span className="truncate text-[13px] text-[var(--vn-muted)]">{detail}</span>
              )}
              {savedAt && (
                <span className="text-[13px] whitespace-pre text-[var(--vn-muted)]">
                  {formatDate(savedAt, t.saveLoad.dateLocale)}
                </span>
              )}
            </>
          )}
        </div>
      </button>
      {!empty && onDelete && (
        <button
          type="button"
          aria-label={t.saveLoad.deleteSlot(pad(slot))}
          title={t.common.delete}
          className="absolute top-[10px] right-[12px] rounded-[6px] px-[8px] py-[2px] text-[13px] text-[var(--vn-muted)] opacity-0 transition group-hover:opacity-100 hover:text-[var(--vn-danger)] focus-visible:opacity-100"
          onClick={onDelete}
        >
          ✕
        </button>
      )}
    </div>
  );
}
