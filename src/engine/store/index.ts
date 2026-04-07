import { create } from 'zustand';

type GameState = {
  started: boolean;
  textIndex: number;
  texts: string[];

  startGame: () => void;
  next: () => void;
};

export const useGameStore = create<GameState>((set, get) => ({
  started: false,
  textIndex: 0,
  texts: ['...', 'Hello there.', 'This is your first visual novel.', 'Kinda cool right?'],

  startGame: () => set({ started: true }),

  next: () => {
    const { textIndex, texts } = get();
    if (textIndex < texts.length - 1) {
      set({ textIndex: textIndex + 1 });
    }
  },
}));
