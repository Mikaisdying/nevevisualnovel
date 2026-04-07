import { useGameStore } from '@/engine/store/gameStore';

export function useGame() {
  const sceneId = useGameStore((s) => s.currentSceneId);
  const sceneMap = useGameStore((s) => s.sceneMap);

  return {
    scene: sceneMap[sceneId],
  };
}
