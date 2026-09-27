import { useGameStore } from '@/engine/store';
import CharacterLayer from '@/components/layers/Character';
import ForegroundLayer from '@/components/layers/Foreground';
import { useI18n } from '@/i18n';

export default function Game() {
  const chapterLabel = useGameStore((s) => s.chapterLabel);
  const hasCard = useGameStore((s) => !!s.sceneMap[s.currentSceneId]?.card);
  const { tx } = useI18n();

  return (
    <div className="absolute inset-0">
      <CharacterLayer />
      {chapterLabel && !hasCard && (
        <p className="vn-chapter-label layer-ui absolute top-[32px] left-[40px]">{tx(chapterLabel)}</p>
      )}
      <ForegroundLayer />
    </div>
  );
}
