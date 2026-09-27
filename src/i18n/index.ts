import { useCallback } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MESSAGES } from './messages';
import { DEFAULT_LANGUAGE, isLanguage, localize, type Language, type LocalizedText } from './localize';

export * from './localize';
export type { Messages } from './messages';

/** Lần đầu mở game: theo ngôn ngữ trình duyệt (vi → Tiếng Việt, còn lại → English). */
function detectLanguage(): Language {
  if (typeof navigator === 'undefined') return DEFAULT_LANGUAGE;
  return navigator.language?.toLowerCase().startsWith('vi') ? 'vi' : 'en';
}

function applyDocumentLang(lang: Language) {
  if (typeof document !== 'undefined') document.documentElement.lang = lang;
}

type LanguageState = {
  language: Language;
  setLanguage: (language: Language) => void;
};

/**
 * Ngôn ngữ đang chọn. Tách khỏi Settings của game vì đổi ngôn ngữ áp dụng
 * ngay (không qua bản nháp "Áp dụng") và dùng chung cho màn tiêu đề.
 */
export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: detectLanguage(),
      setLanguage: (language) => {
        applyDocumentLang(language);
        set({ language });
      },
    }),
    {
      name: 'neve-visual-novel-language',
      storage: createJSONStorage(() => localStorage),
      merge: (persisted, current) => {
        const saved = (persisted as Partial<LanguageState> | undefined)?.language;
        return { ...current, language: isLanguage(saved) ? saved : current.language };
      },
      onRehydrateStorage: () => (state) => applyDocumentLang(state?.language ?? DEFAULT_LANGUAGE),
    },
  ),
);

/** Ngôn ngữ hiện tại, dùng ngoài React (store, tiện ích). */
export const getLanguage = () => useLanguageStore.getState().language;

/** Dịch chữ dữ liệu theo ngôn ngữ hiện tại, dùng ngoài React. */
export const tx = (value: LocalizedText | null | undefined) => localize(value, getLanguage());

/**
 * `t`: chữ giao diện (MESSAGES), `tx`: chữ trong dữ liệu (storyline / manifest
 * / config). Component re-render khi đổi ngôn ngữ.
 */
export function useI18n() {
  const lang = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const txLocal = useCallback(
    (value: LocalizedText | null | undefined) => localize(value, lang),
    [lang],
  );
  return { lang, setLanguage, t: MESSAGES[lang], tx: txLocal };
}
