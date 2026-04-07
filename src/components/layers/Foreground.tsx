import { useGameStore } from '@/engine/store';
import { TextBox } from '@/components/common/TextBox';

export default function Foreground() {
  const scene = useGameStore((s) => s.sceneMap[s.currentSceneId]);
  const next = useGameStore((s) => s.next);

  return (
    <TextBox
      onClick={next}
      className="pointer-events-auto select-none cursor-pointer"
      name={scene?.textbox?.name}
      content={scene?.textbox?.text}
    />
  );
}
