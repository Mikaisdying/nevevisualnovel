import { useEffect, useState } from 'react';
import { useGameStore } from '@/engine/store';
import { latestSave } from '@/engine/save';
import { useUiStore } from '@/store/ui';
import { GAME_CONFIG } from '@/config/game';
import { LanguageSwitch, VnButton } from '@/components/ui';
import CharacterLayer from '@/components/layers/Character';
import { useI18n } from '@/i18n';

/** Figma: "01 Start Menu". */
export default function StartScreen() {
  const startGame = useGameStore((s) => s.startGame);
  const continueLatest = useGameStore((s) => s.continueLatest);
  const panels = useUiStore((s) => s.panels);
  const openPanel = useUiStore((s) => s.open);
  const askConfirm = useUiStore((s) => s.askConfirm);
  const [hasSave, setHasSave] = useState(() => !!latestSave());
  const [quit, setQuit] = useState(false);
  const { t, tx } = useI18n();

  // Quay lại từ màn Tải game (có thể vừa xoá save) → cập nhật nút "Tiếp tục".
  useEffect(() => {
    if (panels.length === 0) setHasSave(!!latestSave());
  }, [panels.length]);

  const confirmQuit = () =>
    askConfirm({
      title: t.start.quitTitle,
      description: t.start.quitDescription,
      confirmLabel: t.start.quit,
      onConfirm: () => {
        // Trình duyệt chỉ cho đóng tab do script mở; nếu không đóng được thì hiện màn chào tạm biệt.
        window.close();
        setQuit(true);
      },
    });

  if (quit) {
    return (
      <div
        className="vn-dim layer-ui vn-fade-in absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-[12px]"
        style={{ '--vn-dim-alpha': 0.92 } as React.CSSProperties}
        onClick={() => setQuit(false)}
      >
        <p className="vn-display text-[48px] font-semibold">{t.start.goodbye}</p>
        <p className="text-[15px] text-[var(--vn-muted)]">{t.start.goodbyeHint}</p>
      </div>
    );
  }

  // Tên game mỗi ngôn ngữ dài khác nhau: co chữ để vừa khoảng trống bên phải (Figma: 96px cho ~10 ký tự).
  const title = tx(GAME_CONFIG.title);
  const titleSize = Math.min(96, Math.floor(1000 / Math.max(title.length, 1)));

  // Đã có save: "Tiếp tục" là nút chính. Chưa có: ẩn "Tiếp tục", "Chơi game" là nút chính.
  const menu: { label: string; onClick: () => void; primary?: boolean }[] = [
    ...(hasSave ? [{ label: t.start.continue, onClick: continueLatest, primary: true }] : []),
    { label: t.start.newGame, onClick: startGame, primary: !hasSave },
    { label: t.start.load, onClick: () => openPanel({ type: 'load' }) },
    { label: t.start.library, onClick: () => openPanel({ type: 'library' }) },
    { label: t.start.settings, onClick: () => openPanel({ type: 'settings' }) },
    { label: t.start.quit, onClick: confirmQuit },
  ];

  return (
    <div className="layer-ui absolute inset-0">
      {GAME_CONFIG.titleCharacter && (
        <div style={{ '--vn-char-bottom': '0px' } as React.CSSProperties}>
          <CharacterLayer characters={[GAME_CONFIG.titleCharacter]} x={230} />
        </div>
      )}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-[620px]"
        style={{ background: 'linear-gradient(270deg, rgb(var(--vn-dim) / 0.85), transparent)' }}
      />

      <h1
        className="vn-display vn-rise-in absolute top-[96px] right-[92px] text-right leading-[1.2] font-bold tracking-[0.06em] whitespace-nowrap"
        style={{ fontSize: titleSize }}
      >
        {title}
      </h1>
      <p className="absolute top-[210px] right-[100px] font-[family-name:var(--vn-font-display)] text-[28px] text-[var(--vn-accent)] italic">
        {tx(GAME_CONFIG.subtitle)}
      </p>

      <nav className="absolute top-[290px] right-[96px] flex w-[300px] flex-col gap-[12px]">
        {menu.map((item) => (
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
      </nav>

      <LanguageSwitch className="absolute top-[28px] right-[40px]" />

      <p className="absolute top-[676px] left-[46px] text-[13px] text-[var(--vn-muted)]">
        {tx(GAME_CONFIG.copyright)}
      </p>
      <p className="absolute top-[676px] right-[96px] text-[13px] text-[var(--vn-muted)]">
        {tx(GAME_CONFIG.version)}
      </p>
    </div>
  );
}
