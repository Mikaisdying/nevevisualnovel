import { useGameStore } from '@/engine/store';
import { useUiStore } from '@/store/ui';
import { Overlay, Panel, VnButton } from '@/components/ui';
import { useI18n } from '@/i18n';

/** Figma: "10 Pause Menu (overlay)" — panel 420x500 giữa màn. */
export default function PauseMenu() {
  const chapterLabel = useGameStore((s) => s.chapterLabel);
  const returnToMenu = useGameStore((s) => s.returnToMenu);
  const { back, open, askConfirm, closeAll } = useUiStore();
  const { t, tx } = useI18n();

  const items: { label: string; onClick: () => void; primary?: boolean }[] = [
    { label: t.pause.resume, onClick: back, primary: true },
    { label: t.pause.save, onClick: () => open({ type: 'save' }) },
    { label: t.pause.load, onClick: () => open({ type: 'load' }) },
    { label: t.pause.settings, onClick: () => open({ type: 'settings' }) },
    {
      label: t.pause.mainMenu,
      onClick: () =>
        askConfirm({
          title: t.returnToMenu.title,
          description: t.returnToMenu.description,
          confirmLabel: t.common.confirm,
          onConfirm: () => {
            closeAll();
            returnToMenu();
          },
        }),
    },
  ];

  return (
    <Overlay onClick={back}>
      <Panel
        role="dialog"
        aria-modal="true"
        className="vn-rise-in flex h-[500px] w-[420px] flex-col items-center px-[38px] pt-[40px]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="vn-display text-[44px] leading-[1.2] font-semibold">{t.pause.title}</h2>
        {tx(chapterLabel) && (
          <p className="mt-[4px] text-[13px] text-[var(--vn-muted)]">{tx(chapterLabel)}</p>
        )}
        <div className="mt-[20px] flex w-full flex-col gap-[12px]">
          {items.map((item) => (
            <VnButton
              key={item.label}
              variant={item.primary ? 'primary' : 'secondary'}
              size="lg"
              className="w-full"
              onClick={item.onClick}
            >
              {item.label}
            </VnButton>
          ))}
        </div>
      </Panel>
    </Overlay>
  );
}
