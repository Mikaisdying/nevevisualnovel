import { useEffect } from 'react';
import { useGameStore } from './engine/store';
import { useUiStore } from './store/ui';
import { useCanvasScale } from './hooks/useCanvasScale';
import { GAME_CONFIG } from './config/game';
import StartScreen from './components/views/StartScreen';
import Game from './components/views/Game';
import BackgroundLayer from './components/layers/Background';
import PanelHost from './components/overlays/PanelHost';
import ConfirmHost from './components/overlays/ConfirmHost';
import { useI18n } from './i18n';

/** Esc: đóng hộp thoại → quay lại panel trước → (đang chơi) mở menu tạm dừng. */
function useEscapeKey() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const ui = useUiStore.getState();
      if (ui.confirm) ui.closeConfirm();
      else if (ui.notice) ui.closeNotice();
      else if (ui.panels.length) ui.back();
      else if (useGameStore.getState().started) ui.open({ type: 'pause' });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}

export default function App() {
  const started = useGameStore((s) => s.started);
  const scene = useGameStore((s) => s.sceneMap[s.currentSceneId]);
  const loading = useGameStore((s) => s.loading);
  const loadError = useGameStore((s) => s.loadError);
  const dialogueOpacity = useGameStore((s) => s.settings.dialogueOpacity);
  const { t } = useI18n();
  const { wrapperRef, scale } = useCanvasScale(GAME_CONFIG.designWidth, GAME_CONFIG.designHeight);

  useEffect(() => {
    useGameStore.getState().init();
  }, []);

  useEscapeKey();

  // Đổi giữa màn tiêu đề và gameplay thì đóng mọi panel đang mở.
  useEffect(() => {
    useUiStore.getState().closeAll();
  }, [started]);

  return (
    <div ref={wrapperRef} className="game-view-wrapper">
      <div
        className="game-canvas vn-root select-none"
        data-vn-theme={GAME_CONFIG.theme || undefined}
        style={
          {
            transform: `translate(-50%, -50%) scale(${scale})`,
            '--vn-dialogue-opacity': dialogueOpacity / 100,
          } as React.CSSProperties
        }
      >
        {loading || loadError ? (
          <div className="vn-scene-fallback absolute inset-0 flex items-center justify-center text-[18px] text-[var(--vn-muted)]">
            {loadError ? t.common.loadError(loadError) : t.common.loading}
          </div>
        ) : (
          <>
            {started ? (
              <BackgroundLayer bg={scene?.bg} cg={scene?.cg} />
            ) : (
              <BackgroundLayer src={GAME_CONFIG.titleBackground} />
            )}
            {started ? <Game /> : <StartScreen />}
            <PanelHost />
            <ConfirmHost />
          </>
        )}
      </div>
    </div>
  );
}
