import { create } from 'zustand';
import { loadStoryFiles } from '../core/loader';
import { buildSceneMap } from '../core/parser';
import type { Scene } from '../types/scene';

type GameState = {
  started: boolean;
  sceneMap: Record<string, Scene>;
  currentSceneId: string;
  loading: boolean;

  init: () => Promise<void>;
  startGame: () => void;
  next: () => void;
  jump: (id: string) => void;
  currentScene?: Scene;
};

export const useGameStore = create<GameState>((set, get) => ({
  started: false,
  sceneMap: {},
  currentSceneId: '',
  loading: false,

  init: async () => {
    set({ loading: true });
    const scenes = await loadStoryFiles();
    const map = buildSceneMap(scenes);
    set({
      sceneMap: map,
      currentSceneId: scenes[0]?.id || '',
      loading: false,
    });
  },

  startGame: () => set({ started: true, currentSceneId: 'intro_1' }),

  next: () => {
    const { currentSceneId, sceneMap } = get();
    const scene = sceneMap[currentSceneId];
    // Nếu có choices thì không next tự động
    if (scene?.choices && scene.choices.length > 0) return;
    if (scene?.next) {
      set({ currentSceneId: scene.next });
    }
  },

  jump: (id) => set({ currentSceneId: id }),

  get currentScene() {
    const { sceneMap, currentSceneId } = get();
    return sceneMap[currentSceneId];
  },
}));
