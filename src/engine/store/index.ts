import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { loadStoryFiles } from '../core/loader';
import { loadManifestFile } from '../core/manifest';
import { buildSceneMap } from '../core/parser';
import { getAvailableChoices, type Flags } from '../condition';
import { writeSave, readSave, latestSave, type BacklogEntry } from '../save';
import { GAME_CONFIG } from '@/config/game';
import { mapLocalized, type LocalizedText } from '@/i18n/localize';
import type { Choice, Scene } from '../../types/scene';
import type { Manifest } from '../../types/manifest';

export type Settings = {
  masterVolume: number;
  bgmVolume: number;
  sfxVolume: number;
  voiceVolume: number;
  /** 0–100: tốc độ chạy chữ. */
  textSpeed: number;
  /** 0–100: tốc độ chuyển câu ở chế độ Tự động. */
  autoSpeed: number;
  /** Cho phép Bỏ qua cả những đoạn chưa đọc. */
  skipUnread: boolean;
  /** 0–100: độ đậm khung thoại. */
  dialogueOpacity: number;
};

export const defaultSettings: Settings = {
  masterVolume: 80,
  bgmVolume: 70,
  sfxVolume: 60,
  voiceVolume: 90,
  textSpeed: 55,
  autoSpeed: 40,
  skipUnread: false,
  dialogueOpacity: 100,
};

const BACKLOG_LIMIT = 200;

type GameState = {
  started: boolean;
  sceneMap: Record<string, Scene>;
  manifest: Manifest;
  currentSceneId: string;
  loading: boolean;
  loadError: string | null;
  settings: Settings;
  flags: Flags;
  /** CG ids the player has unlocked (seen in-story); persists across playthroughs, shown in the gallery. */
  unlockedCgs: string[];
  /** Scene ids đã từng đọc (mọi lượt chơi) — Bỏ qua dừng ở đoạn chưa đọc trừ khi bật skipUnread. */
  readScenes: string[];
  /** Scene hiện tại đã được đọc từ trước khi vào lần này chưa. */
  seenBefore: boolean;
  chapterLabel: LocalizedText;
  backlog: BacklogEntry[];
  autoMode: boolean;
  skipMode: boolean;

  init: () => Promise<void>;
  startGame: () => void;
  returnToMenu: () => void;
  /** Sang scene kế (không áp dụng cho scene đang chờ lựa chọn). Trả về false nếu không đi tiếp được. */
  next: () => boolean;
  jump: (id: string) => void;
  choose: (choice: Choice) => void;
  enterScene: (id: string) => void;
  setFlag: (name: string, value: boolean) => void;
  saveGame: (slot: number) => void;
  loadGame: (saveId: string) => boolean;
  continueLatest: () => boolean;
  setAutoMode: (on: boolean) => void;
  setSkipMode: (on: boolean) => void;
  updateSettings: (settings: Partial<Settings>) => void;
};

/** Scene kế tiếp khi bấm tiếp (không có lựa chọn hiển thị), hoặc undefined. */
export function getNextSceneId(scene: Scene | undefined, flags: Flags): string | undefined {
  if (!scene) return undefined;
  const available = getAvailableChoices(scene, flags);
  if (available.some((c) => c.text !== null)) return undefined;
  if (available.length === 1 && available[0].text === null) return available[0].next;
  return scene.next || undefined;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      started: false,
      sceneMap: {},
      manifest: { backgrounds: [], characters: [], cgs: [] },
      currentSceneId: '',
      loading: false,
      loadError: null,
      settings: defaultSettings,
      flags: {},
      unlockedCgs: [],
      readScenes: [],
      seenBefore: false,
      chapterLabel: '',
      backlog: [],
      autoMode: false,
      skipMode: false,

      init: async () => {
        set({ loading: true, loadError: null });
        try {
          const [scenes, manifest] = await Promise.all([
            loadStoryFiles(),
            loadManifestFile().catch((error) => {
              console.error('Failed to load manifest:', error);
              return get().manifest;
            }),
          ]);
          const map = buildSceneMap(scenes);
          set({
            sceneMap: map,
            manifest,
            currentSceneId: scenes[0]?.id || '',
            loading: false,
          });
        } catch (error) {
          console.error('Failed to load storyline:', error);
          set({ loading: false, loadError: String(error) });
        }
      },

      startGame: () => {
        const { sceneMap } = get();
        const configured = GAME_CONFIG.startSceneId;
        const startId =
          configured && sceneMap[configured] ? configured : Object.keys(sceneMap)[0] || '';
        set({
          started: true,
          flags: {},
          backlog: [],
          chapterLabel: '',
          autoMode: false,
          skipMode: false,
        });
        get().enterScene(startId);
      },

      returnToMenu: () => set({ started: false, autoMode: false, skipMode: false }),

      next: () => {
        const { sceneMap, currentSceneId, flags } = get();
        const nextId = getNextSceneId(sceneMap[currentSceneId], flags);
        if (!nextId || !sceneMap[nextId]) return false;
        get().enterScene(nextId);
        return true;
      },

      jump: (id) => get().enterScene(id),

      choose: (choice) => {
        if (choice.text) {
          set((state) => ({
            backlog: [
              ...state.backlog,
              { sceneId: state.currentSceneId, name: GAME_CONFIG.playerName, text: choice.text! },
            ].slice(-BACKLOG_LIMIT),
          }));
        }
        get().enterScene(choice.next);
      },

      enterScene: (id) => {
        const scene = get().sceneMap[id];
        set((state) => ({
          currentSceneId: id,
          flags: scene?.setFlags ? { ...state.flags, ...scene.setFlags } : state.flags,
          unlockedCgs:
            scene?.cg && !state.unlockedCgs.includes(scene.cg)
              ? [...state.unlockedCgs, scene.cg]
              : state.unlockedCgs,
          seenBefore: state.readScenes.includes(id),
          readScenes: state.readScenes.includes(id) ? state.readScenes : [...state.readScenes, id],
          chapterLabel: scene?.chapter ?? state.chapterLabel,
          backlog: scene?.textbox?.text
            ? [
                ...state.backlog,
                { sceneId: id, name: scene.textbox.name, text: scene.textbox.text },
              ].slice(-BACKLOG_LIMIT)
            : state.backlog,
        }));
      },

      setFlag: (name, value) => set((state) => ({ flags: { ...state.flags, [name]: value } })),

      saveGame: (slot) => {
        const { currentSceneId, sceneMap, flags, chapterLabel, backlog } = get();
        const scene = sceneMap[currentSceneId];
        const label =
          scene?.card?.title ||
          (scene?.textbox?.text && mapLocalized(scene.textbox.text, (t) => t.slice(0, 60))) ||
          currentSceneId;
        writeSave({
          slot,
          sceneId: currentSceneId,
          flags,
          label,
          chapter: chapterLabel,
          thumb: scene?.cg
            ? { kind: 'cg', id: scene.cg }
            : scene?.bg
              ? { kind: 'bg', id: scene.bg }
              : undefined,
          backlog: backlog.slice(-50),
        });
      },

      loadGame: (saveId) => {
        const slot = readSave(saveId);
        if (!slot || !get().sceneMap[slot.sceneId]) return false;
        set({
          started: true,
          currentSceneId: slot.sceneId,
          flags: slot.flags,
          chapterLabel: slot.chapter ?? '',
          backlog: slot.backlog ?? [],
          seenBefore: true,
          autoMode: false,
          skipMode: false,
        });
        return true;
      },

      continueLatest: () => {
        const latest = latestSave();
        return latest ? get().loadGame(latest.id) : false;
      },

      setAutoMode: (on) => set({ autoMode: on, skipMode: on ? false : get().skipMode }),
      setSkipMode: (on) => set({ skipMode: on, autoMode: on ? false : get().autoMode }),

      updateSettings: (settings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...settings,
          },
        })),
    }),
    {
      name: 'neve-visual-novel-settings',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        settings: state.settings,
        unlockedCgs: state.unlockedCgs,
        readScenes: state.readScenes,
      }),
      // v1 lưu textSpeed dạng hệ số (0.5–2.5) và thiếu các setting mới → gộp với mặc định.
      migrate: (persisted, version) => {
        const old = (persisted ?? {}) as { settings?: Partial<Settings>; unlockedCgs?: string[] };
        if (version < 2) {
          const { textSpeed: _legacySpeed, ...rest } = old.settings ?? {};
          return { ...old, settings: { ...defaultSettings, ...rest }, readScenes: [] };
        }
        return old;
      },
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<GameState>;
        return { ...current, ...p, settings: { ...defaultSettings, ...p.settings } };
      },
    },
  ),
);

/** Độ trễ giữa 2 ký tự (ms) theo setting textSpeed 0–100. */
export function charDelayMs(textSpeed: number) {
  return Math.round(80 - textSpeed * 0.72);
}

/** Thời gian chờ (ms) sau khi chạy xong một câu ở chế độ Tự động. */
export function autoDelayMs(autoSpeed: number, textLength: number) {
  return Math.round(2600 - autoSpeed * 20 + textLength * 15);
}
