import { useGameStore } from '@/engine/store';

export function useGame() {
  const sceneId = useGameStore((s) => s.currentSceneId);
  const sceneMap = useGameStore((s) => s.sceneMap);

  return {
    scene: sceneMap[sceneId],
  };
}
