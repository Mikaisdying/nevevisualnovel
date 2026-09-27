import { useLayoutEffect, useRef } from 'react';
import { useGameStore } from '@/engine/store';
import { useUiStore } from '@/store/ui';
import { GAME_CONFIG } from '@/config/game';
import { Overlay, Panel, VnButton } from '@/components/ui';
import type { Manifest } from '@/types/manifest';
import { localize, useI18n, type Language } from '@/i18n';

const PLAYER_COLOR = '#7fd4ff';

function nameColor(name: string, manifest: Manifest, lang: Language) {
  if (name === localize(GAME_CONFIG.playerName, lang)) return PLAYER_COLOR;
  const key = name.trim().toLowerCase();
  const found = manifest.characters.find(
    (c) => c.id.toLowerCase() === key || localize(c.name, lang).toLowerCase() === key,
  );
  return found?.color ?? 'var(--vn-accent)';
}

/** Figma: "14 Backlog (overlay)" — panel 900x580, cuộn, mới nhất ở dưới. */
export default function Backlog() {
  const backlog = useGameStore((s) => s.backlog);
  const manifest = useGameStore((s) => s.manifest);
  const back = useUiStore((s) => s.back);
  const listRef = useRef<HTMLDivElement>(null);
  const { t, tx, lang } = useI18n();

  useLayoutEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  return (
    <Overlay onClick={back}>
      <Panel
        role="dialog"
        aria-modal="true"
        className="vn-rise-in relative h-[580px] w-[900px] px-[40px] pt-[32px]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="vn-display text-[36px] leading-[1.2] font-semibold">{t.backlog.title}</h2>
        <div
          ref={listRef}
          className="vn-scroll mt-[16px] flex h-[400px] flex-col gap-[16px] pr-[16px]"
          onWheel={(e) => e.stopPropagation()}
        >
          {backlog.length === 0 && (
            <p className="text-[15px] text-[var(--vn-muted)]">{t.backlog.empty}</p>
          )}
          {backlog.map((entry, i) => (
            <div key={i} className="flex flex-col gap-[2px]">
              {tx(entry.name) && (
                <span
                  className="text-[13px] font-semibold"
                  style={{ color: nameColor(tx(entry.name), manifest, lang) }}
                >
                  {tx(entry.name)}
                </span>
              )}
              <p className="text-[16px] leading-[1.6] whitespace-pre-line">{tx(entry.text)}</p>
            </div>
          ))}
        </div>
        <VnButton variant="secondary" className="absolute right-[26px] bottom-[26px]" onClick={back}>
          {t.common.close}
        </VnButton>
      </Panel>
    </Overlay>
  );
}
