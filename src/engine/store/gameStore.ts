import { create } from 'zustand';
import { loadStoryFiles } from '../core/loader';
import { buildSceneMap } from '../core/parser';
import type { Scene } from '../types/scene';

type GameState = {
  sceneMap: Record<string, Scene>;
  currentSceneId: string;
  started: boolean;

  init: () => Promise<void>;
  start: () => void;
  next: () => void;
  jump: (id: string) => void;
};

export const useGameStore = create<GameState>((set, get) => ({
  sceneMap: {},
  currentSceneId: '',
  started: false,

  init: async () => {
    const scenes = await loadStoryFiles();
    const map = buildSceneMap(scenes);

    set({
      sceneMap: map,
      currentSceneId: scenes[0]?.id || '',
    });
  },

  start: () => set({ started: true }),

  next: () => {
    const { currentSceneId, sceneMap } = get();
    const scene = sceneMap[currentSceneId];

    if (scene?.next) {
      set({ currentSceneId: scene.next });
    }
  },

  jump: (id) => set({ currentSceneId: id }),
}));
