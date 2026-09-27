import { cn } from '@/lib/utils';
import { LANGUAGES, useI18n } from '@/i18n';

/** Nhóm nút VI / EN, đổi ngôn ngữ ngay (màn tiêu đề, menu tạm dừng). */
export function LanguageSwitch({ className }: { className?: string }) {
  const { t, lang, setLanguage } = useI18n();

  return (
    <div role="group" aria-label={t.start.language} className={cn('flex gap-[4px] text-[13px]', className)}>
      {LANGUAGES.map((l) => (
        <button
          key={l.id}
          type="button"
          title={l.label}
          aria-pressed={l.id === lang}
          onClick={() => setLanguage(l.id)}
          className={
            l.id === lang
              ? 'vn-btn vn-btn--primary h-[28px] min-w-[40px] rounded-[6px] px-[8px] text-[13px]'
              : 'h-[28px] min-w-[40px] rounded-[6px] px-[8px] text-[var(--vn-muted)] hover:text-[var(--vn-text)]'
          }
        >
          {l.short}
        </button>
      ))}
    </div>
  );
}
