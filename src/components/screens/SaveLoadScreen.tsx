import { useState } from 'react';
import { useGameStore } from '@/engine/store';
import { listSaves, removeSave, type SaveSlot } from '@/engine/save';
import { bgUrl, cgUrl } from '@/engine/assets';
import { useUiStore } from '@/store/ui';
import { GAME_CONFIG } from '@/config/game';
import { SaveSlotCard, Tabs } from '@/components/ui';
import { useI18n } from '@/i18n';
import { ScreenShell } from './ScreenShell';

type Mode = 'save' | 'load';

const pad = (n: number) => String(n).padStart(2, '0');

function thumbUrl(slot: SaveSlot) {
  if (!slot.thumb) return undefined;
  return slot.thumb.kind === 'cg' ? cgUrl(slot.thumb.id) : bgUrl(slot.thumb.id);
}

/** Figma: "04 Save Game" / "05 Load Game" — 6 ô mỗi trang, chuyển trang ‹ 1 2 3 ›. */
export default function SaveLoadScreen({ mode }: { mode: Mode }) {
  const started = useGameStore((s) => s.started);
  const saveGame = useGameStore((s) => s.saveGame);
  const loadGame = useGameStore((s) => s.loadGame);
  const back = useUiStore((s) => s.back);
  const replace = useUiStore((s) => s.replace);
  const closeAll = useUiStore((s) => s.closeAll);
  const askConfirm = useUiStore((s) => s.askConfirm);
  const showNotice = useUiStore((s) => s.showNotice);
  const [page, setPage] = useState(0);
  const [saves, setSaves] = useState(() => listSaves());
  const { t, tx } = useI18n();

  const perPage = GAME_CONFIG.saveSlotsPerPage;
  const pages = GAME_CONFIG.savePages;
  const slotNumbers = Array.from({ length: perPage }, (_, i) => page * perPage + i + 1);
  const bySlot = new Map(saves.map((s) => [s.slot, s]));
  const refresh = () => setSaves(listSaves());

  const doSave = (slot: number) => {
    saveGame(slot);
    refresh();
    showNotice({ title: t.saveLoad.saved, description: t.saveLoad.savedDescription });
  };

  const doLoad = (save: SaveSlot) => {
    if (loadGame(save.id)) {
      closeAll();
    } else {
      showNotice({ title: t.saveLoad.loadFailed, description: t.saveLoad.loadFailedDescription });
    }
  };

  const handleSlot = (slot: number) => {
    const existing = bySlot.get(slot);
    if (mode === 'save') {
      if (!existing) return doSave(slot);
      askConfirm({
        title: t.saveLoad.overwriteTitle(pad(slot)),
        description: t.saveLoad.overwriteDescription,
        confirmLabel: t.saveLoad.overwrite,
        onConfirm: () => doSave(slot),
      });
      return;
    }
    if (!existing) return;
    if (!started) return doLoad(existing);
    askConfirm({
      title: t.saveLoad.loadTitleConfirm(pad(slot)),
      description: t.saveLoad.loadDescription,
      confirmLabel: t.saveLoad.loadConfirm,
      onConfirm: () => doLoad(existing),
    });
  };

  const handleDelete = (save: SaveSlot) =>
    askConfirm({
      title: t.saveLoad.deleteTitle(pad(save.slot)),
      description: t.saveLoad.deleteDescription,
      confirmLabel: t.common.delete,
      onConfirm: () => {
        removeSave(save.id);
        refresh();
      },
    });

  return (
    <ScreenShell
      title={mode === 'save' ? t.saveLoad.saveTitle : t.saveLoad.loadTitle}
      subtitle={mode === 'save' ? t.saveLoad.saveSubtitle : t.saveLoad.loadSubtitle}
      onBack={back}
    >
      {started && (
        <Tabs
          variant="segment"
          items={[
            { id: 'save', label: t.saveLoad.tabSave },
            { id: 'load', label: t.saveLoad.tabLoad },
          ]}
          value={mode}
          onChange={(m) => replace({ type: m })}
          className="absolute top-[100px] right-[52px]"
        />
      )}

      <div className="absolute top-[200px] left-[60px] grid w-[1160px] grid-cols-2 gap-[24px]">
        {slotNumbers.map((slot) => {
          const save = bySlot.get(slot);
          return (
            <SaveSlotCard
              key={slot}
              slot={slot}
              title={save ? tx(save.chapter) || tx(save.label) : undefined}
              detail={save && tx(save.chapter) ? tx(save.label) : undefined}
              savedAt={save?.savedAt}
              image={save && thumbUrl(save)}
              disabled={mode === 'load' && !save}
              onClick={() => handleSlot(slot)}
              onDelete={save ? () => handleDelete(save) : undefined}
            />
          );
        })}
      </div>

      <nav className="absolute top-[630px] left-0 flex w-full items-center justify-center gap-[8px] text-[14px]">
        <PageButton label="‹" disabled={page === 0} onClick={() => setPage(page - 1)} />
        {Array.from({ length: pages }, (_, i) => (
          <PageButton key={i} label={String(i + 1)} active={i === page} onClick={() => setPage(i)} />
        ))}
        <PageButton label="›" disabled={page === pages - 1} onClick={() => setPage(page + 1)} />
      </nav>
    </ScreenShell>
  );
}

function PageButton({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      className={
        active
          ? 'vn-btn vn-btn--primary h-[28px] min-w-[28px] rounded-[6px] px-[6px] text-[13px]'
          : 'h-[28px] min-w-[28px] rounded-[6px] px-[6px] text-[13px] text-[var(--vn-muted)] hover:text-[var(--vn-text)] disabled:opacity-30'
      }
    >
      {label}
    </button>
  );
}
