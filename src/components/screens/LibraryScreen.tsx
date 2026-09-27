import { useState } from 'react';
import { useGameStore } from '@/engine/store';
import { cgUrl, charUrl } from '@/engine/assets';
import { useUiStore } from '@/store/ui';
import { CgCard, Tabs, Thumb, type TabItem } from '@/components/ui';
import { useI18n } from '@/i18n';
import { ScreenShell } from './ScreenShell';

type LibraryTab = 'cg' | 'music' | 'endings' | 'characters';

/** Figma: "02 Library – CG Gallery". */
export default function LibraryScreen() {
  const manifest = useGameStore((s) => s.manifest);
  const unlockedCgs = useGameStore((s) => s.unlockedCgs);
  const back = useUiStore((s) => s.back);
  const open = useUiStore((s) => s.open);
  const [tab, setTab] = useState<LibraryTab>('cg');
  const { t, tx } = useI18n();

  const tabs: TabItem<LibraryTab>[] = [
    { id: 'cg', label: t.library.tabCg },
    { id: 'music', label: t.library.tabMusic },
    { id: 'endings', label: t.library.tabEndings },
    { id: 'characters', label: t.library.tabCharacters },
  ];

  const cgs = manifest.cgs ?? [];
  const unlockedCount = cgs.filter((c) => unlockedCgs.includes(c.id)).length;

  return (
    <ScreenShell
      title={t.library.title}
      subtitle={t.library.unlocked(unlockedCount, cgs.length)}
      onBack={back}
      dim={0.35}
    >
      <Tabs items={tabs} value={tab} onChange={setTab} className="absolute top-[100px] right-[84px]" />

      <div className="vn-scroll absolute top-[196px] left-[56px] h-[480px] w-[1180px] pr-[12px]">
        {tab === 'cg' &&
          (cgs.length === 0 ? (
            <EmptyState text={t.library.noCg} />
          ) : (
            <div className="grid grid-cols-4 gap-[24px] pb-[24px]">
              {cgs.map((cg) => {
                const locked = !unlockedCgs.includes(cg.id);
                return (
                  <CgCard
                    key={cg.id}
                    title={tx(cg.name)}
                    subtitle={tx(cg.chapter)}
                    image={cgUrl(cg.id)}
                    locked={locked}
                    onClick={() => open({ type: 'cg', id: cg.id })}
                  />
                );
              })}
            </div>
          ))}

        {tab === 'characters' && (
          <div className="grid grid-cols-4 gap-[24px] pb-[24px]">
            {manifest.characters.map((c) => (
              <div key={c.id} className="vn-card flex h-[300px] w-[274px] flex-col">
                <Thumb
                  src={charUrl(c.id, c.poses[0] ?? 'default')}
                  alt={tx(c.name)}
                  className="h-[240px] w-full rounded-none [&>img]:object-contain [&>img]:object-top"
                />
                <div className="flex flex-1 items-center gap-[10px] px-[14px]">
                  <span
                    className="h-[10px] w-[10px] rounded-full"
                    style={{ background: c.color ?? 'var(--vn-accent)' }}
                  />
                  <span className="text-[15px] font-semibold">{tx(c.name)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'music' && <EmptyState text={t.library.noMusic} />}
        {tab === 'endings' && <EmptyState text={t.library.noEndings} />}
      </div>
    </ScreenShell>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex h-[300px] items-center justify-center text-[15px] text-[var(--vn-muted)]">
      {text}
    </div>
  );
}
