import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { loadStoryFiles } from '../core/loader';
import { buildSceneMap } from '../core/parser';
import type { Scene } from '../../types/scene';

type Settings = {
  bgmVolume: number;
  sfxVolume: number;
  textSpeed: number;
};

type GameState = {
  started: boolean;
  sceneMap: Record<string, Scene>;
  currentSceneId: string;
  loading: boolean;
  settings: Settings;

  init: () => Promise<void>;
  startGame: () => void;
  returnToMenu: () => void;
  next: () => void;
  jump: (id: string) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  currentScene?: Scene;
};

const defaultSettings: Settings = {
  bgmVolume: 70,
  sfxVolume: 70,
  textSpeed: 1,
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      started: false,
      sceneMap: {},
      currentSceneId: '',
      loading: false,
      settings: defaultSettings,

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

      returnToMenu: () => set({ started: false, currentSceneId: 'intro_1' }),

      next: () => {
        const { currentSceneId, sceneMap } = get();
        const scene = sceneMap[currentSceneId];
        if (!scene) return;

        // Nếu có lựa chọn hiển thị (text khác null) thì không next tự động
        const hasInteractiveChoices = scene.choices?.some((c) => c.text !== null) ?? false;
        if (hasInteractiveChoices) return;

        // Auto-next: 1 choice với text = null
        const autoChoice =
          scene.choices && scene.choices.length === 1 && scene.choices[0].text === null
            ? scene.choices[0]
            : undefined;

        if (autoChoice) {
          set({ currentSceneId: autoChoice.next });
          return;
        }

        // Fallback tương thích cũ nếu dữ liệu vẫn còn field next
        const legacyNext = (scene as any).next as string | undefined;
        if (legacyNext) {
          set({ currentSceneId: legacyNext });
        }
      },

      jump: (id) => set({ currentSceneId: id }),

      updateSettings: (settings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...settings,
          },
        })),

      get currentScene() {
        const { sceneMap, currentSceneId } = get();
        return sceneMap[currentSceneId];
      },
    }),
    {
      name: 'neve-visual-novel-settings',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ settings: state.settings }),
    },
  ),
);
