import { useCallback, useEffect, useState } from 'react';
import { useGameStore, getNextSceneId, charDelayMs, autoDelayMs } from '@/engine/store';
import { getAvailableChoices } from '@/engine/condition';
import { useUiStore, useUiBlocking } from '@/store/ui';
import { DialogueBox, QuickMenu, SceneCardView, VnButton } from '@/components/ui';
import ChoiceList from '@/components/common/ChoiceList';
import { useI18n } from '@/i18n';
import type { Choice } from '@/types/scene';

const SKIP_DELAY_MS = 70;
/** Nhịp nghỉ sau khi chạy xong câu thoại rồi mới hiện lựa chọn. */
const CHOICE_DELAY_MS = 600;

/**
 * Lớp tương tác của gameplay: khung thoại (chữ chạy), lựa chọn, thẻ chương,
 * Quick Menu, chế độ Tự động, tua nhanh (giữ Ctrl) và phím tắt.
 */
export default function Foreground() {
  const sceneId = useGameStore((s) => s.currentSceneId);
  const scene = useGameStore((s) => s.sceneMap[s.currentSceneId]);
  const sceneMap = useGameStore((s) => s.sceneMap);
  const flags = useGameStore((s) => s.flags);
  const settings = useGameStore((s) => s.settings);
  const autoMode = useGameStore((s) => s.autoMode);
  const skipMode = useGameStore((s) => s.skipMode);
  const seenBefore = useGameStore((s) => s.seenBefore);
  const next = useGameStore((s) => s.next);
  const choose = useGameStore((s) => s.choose);
  const setAutoMode = useGameStore((s) => s.setAutoMode);
  const setSkipMode = useGameStore((s) => s.setSkipMode);
  const returnToMenu = useGameStore((s) => s.returnToMenu);
  const openPanel = useUiStore((s) => s.open);
  const askConfirm = useUiStore((s) => s.askConfirm);
  const blocked = useUiBlocking();
  const { t, tx } = useI18n();

  const fullText = tx(scene?.textbox?.text);
  // Số ký tự đã hiện, gắn với scene id để đổi scene là tự về 0 (không nháy chữ cũ).
  const [typing, setTyping] = useState({ id: sceneId, count: 0 });
  const shown = typing.id === sceneId ? typing.count : 0;
  const done = shown >= fullText.length;
  const setShown = useCallback(
    (update: (count: number) => number) =>
      setTyping((t) => ({ id: sceneId, count: update(t.id === sceneId ? t.count : 0) })),
    [sceneId],
  );

  const choices = getAvailableChoices(scene, flags).filter((c) => c.text !== null);
  const hasChoices = choices.length > 0;
  const nextId = getNextSceneId(scene, flags);
  const canAdvance = !!nextId && !!sceneMap[nextId];
  const card = scene?.card;

  // Lựa chọn hiện sau một nhịp kể từ khi chạy xong câu thoại (gắn với scene id như typing).
  const [choicesReadyId, setChoicesReadyId] = useState<string | null>(null);
  const showChoices = hasChoices && done && choicesReadyId === sceneId;
  useEffect(() => {
    if (!hasChoices || !done || blocked || choicesReadyId === sceneId) return;
    const timer = setTimeout(() => setChoicesReadyId(sceneId), CHOICE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [hasChoices, done, blocked, choicesReadyId, sceneId]);

  // Hiệu ứng chạy chữ (dừng khi đang mở menu / overlay).
  useEffect(() => {
    if (done || blocked) return;
    if (skipMode) {
      setShown(() => fullText.length);
      return;
    }
    const timer = setInterval(() => setShown((n) => n + 1), charDelayMs(settings.textSpeed));
    return () => clearInterval(timer);
  }, [done, blocked, skipMode, fullText.length, settings.textSpeed, setShown]);

  const advance = useCallback(() => {
    if (blocked) return;
    if (!done) {
      setShown(() => fullText.length);
      return;
    }
    if (hasChoices || card?.type === 'end') return;
    next();
  }, [blocked, done, fullText.length, hasChoices, card?.type, next, setShown]);

  // Tự động: chạy xong câu thì chờ rồi sang câu kế.
  useEffect(() => {
    if (!autoMode || blocked || !done || hasChoices || !canAdvance || card?.type === 'end') return;
    const timer = setTimeout(next, autoDelayMs(settings.autoSpeed, fullText.length));
    return () => clearTimeout(timer);
  }, [autoMode, blocked, done, hasChoices, canAdvance, card?.type, next, settings.autoSpeed, fullText.length, sceneId]);

  // Bỏ qua: tua nhanh tới lựa chọn / kết chương / đoạn chưa đọc.
  useEffect(() => {
    if (!skipMode || blocked) return;
    if (hasChoices || !canAdvance || card?.type === 'end' || (!seenBefore && !settings.skipUnread)) {
      setSkipMode(false);
      return;
    }
    const timer = setTimeout(next, SKIP_DELAY_MS);
    return () => clearTimeout(timer);
  }, [skipMode, blocked, hasChoices, canAdvance, card?.type, seenBefore, settings.skipUnread, next, setSkipMode, sceneId]);

  // Phím tắt: Space/Enter tiến thoại, giữ Ctrl để bỏ qua, cuộn lên mở lịch sử.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (useUiStore.getState().panels.length || useUiStore.getState().confirm) return;
      if (e.key === ' ' || e.key === 'Enter') {
        if ((e.target as HTMLElement)?.tagName === 'BUTTON') return;
        e.preventDefault();
        advance();
      } else if (e.key === 'Control' && !e.repeat) {
        setSkipMode(true);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control') setSkipMode(false);
    };
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY < 0 && !useUiStore.getState().panels.length) openPanel({ type: 'backlog' });
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('wheel', onWheel);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('wheel', onWheel);
    };
  }, [advance, setSkipMode, openPanel]);

  const handleChoice = (choice: Choice) => {
    setAutoMode(false);
    choose(choice);
  };

  const confirmReturnToMenu = () =>
    askConfirm({
      title: t.returnToMenu.title,
      description: t.returnToMenu.description,
      confirmLabel: t.common.confirm,
      onConfirm: returnToMenu,
    });

  if (card) {
    return card.type === 'title' ? (
      <SceneCardView
        eyebrow={tx(card.eyebrow)}
        title={tx(card.title)}
        subtitle={card.subtitle ? tx(card.subtitle) : t.game.tapToContinue}
        onClick={advance}
      />
    ) : (
      <SceneCardView
        eyebrow={tx(card.eyebrow)}
        title={tx(card.title)}
        subtitle={tx(card.subtitle)}
        actions={
          <>
            {canAdvance && (
              <VnButton variant="primary" size="lg" onClick={() => next()}>
                {t.game.nextChapter}
              </VnButton>
            )}
            <VnButton variant="secondary" size="lg" onClick={returnToMenu}>
              {t.game.mainMenu}
            </VnButton>
          </>
        }
      />
    );
  }

  return (
    <>
      {showChoices && (
        <div
          className="vn-dim layer-effects absolute inset-0"
          style={{ '--vn-dim-alpha': 0.35 } as React.CSSProperties}
        />
      )}
      {scene?.textbox && (
        <DialogueBox
          name={tx(scene.textbox.name)}
          text={fullText.slice(0, shown)}
          done={done && canAdvance && !hasChoices}
          onAdvance={advance}
          footer={
            <QuickMenu
              items={[
                { id: 'auto', label: t.quickMenu.auto, pressed: autoMode, onClick: () => setAutoMode(!autoMode) },
                { id: 'log', label: t.quickMenu.log, onClick: () => openPanel({ type: 'backlog' }) },
                { id: 'save', label: t.quickMenu.save, onClick: () => openPanel({ type: 'save' }) },
                { id: 'load', label: t.quickMenu.load, onClick: () => openPanel({ type: 'load' }) },
                { id: 'settings', label: t.quickMenu.settings, onClick: () => openPanel({ type: 'settings' }) },
                { id: 'menu', label: t.quickMenu.menu, onClick: () => openPanel({ type: 'pause' }) },
              ]}
            />
          }
        />
      )}
      {!scene?.textbox && !hasChoices && (
        // Scene không có thoại (vd chỉ hiện CG): bấm vào đâu cũng đi tiếp.
        <div className="layer-foreground absolute inset-0 cursor-pointer" onClick={advance} />
      )}
      {showChoices && <ChoiceList choices={choices} onSelect={handleChoice} />}
      {!scene && (
        <div className="layer-ui absolute inset-0 flex flex-col items-center justify-center gap-[16px]">
          <p className="text-[18px] text-[var(--vn-muted)]">{t.game.sceneNotFound(sceneId)}</p>
          <VnButton variant="secondary" onClick={confirmReturnToMenu}>
            {t.game.mainMenu}
          </VnButton>
        </div>
      )}
    </>
  );
}
