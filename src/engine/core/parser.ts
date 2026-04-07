import type { Scene } from '../types/scene';

export function buildSceneMap(scenes: Scene[]) {
  const map: Record<string, Scene> = {};

  for (const scene of scenes) {
    map[scene.id] = scene;
  }

  return map;
}
