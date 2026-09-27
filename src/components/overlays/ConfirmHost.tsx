import { useUiStore } from '@/store/ui';
import { DialogCard, VnButton } from '@/components/ui';
import { useI18n } from '@/i18n';

/**
 * Hộp xác nhận (Figma 11, 12) và thông báo (Figma 13 "Đã lưu") — luôn nằm trên
 * cùng. Mở bằng useUiStore().askConfirm(...) / showNotice(...).
 */
export default function ConfirmHost() {
  const confirm = useUiStore((s) => s.confirm);
  const notice = useUiStore((s) => s.notice);
  const closeConfirm = useUiStore((s) => s.closeConfirm);
  const closeNotice = useUiStore((s) => s.closeNotice);
  const { t } = useI18n();

  if (confirm) {
    return (
      <DialogCard
        title={confirm.title}
        description={confirm.description}
        actions={
          <>
            <VnButton variant="secondary" size="lg" className="w-[120px]" onClick={closeConfirm}>
              {confirm.cancelLabel ?? t.common.cancel}
            </VnButton>
            <VnButton
              variant="primary"
              size="lg"
              className="w-[120px]"
              autoFocus
              onClick={() => {
                closeConfirm();
                confirm.onConfirm();
              }}
            >
              {confirm.confirmLabel ?? t.common.confirm}
            </VnButton>
          </>
        }
      />
    );
  }

  if (notice) {
    return (
      <DialogCard
        title={notice.title}
        description={notice.description}
        actions={
          <VnButton variant="primary" size="lg" className="w-[120px]" autoFocus onClick={closeNotice}>
            {t.common.ok}
          </VnButton>
        }
      />
    );
  }

  return null;
}
