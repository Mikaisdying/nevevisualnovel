import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DEFAULT_LANGUAGE, localize, setLocalized, type Language, type LocalizedText } from '@/i18n/localize';

type EditorLanguageState = {
  /** Ngôn ngữ đang soạn: ô nhập thoại / lựa chọn đọc-ghi bản dịch của ngôn ngữ này. */
  language: Language;
  setLanguage: (language: Language) => void;
};

export const useEditorLanguage = create<EditorLanguageState>()(
  persist(
    (set) => ({
      language: DEFAULT_LANGUAGE,
      setLanguage: (language) => set({ language }),
    }),
    { name: 'neve-editor-language', storage: createJSONStorage(() => localStorage) },
  ),
);

export const getEditorLanguage = () => useEditorLanguage.getState().language;

/** Chữ hiển thị trên card / connector theo ngôn ngữ đang soạn (thiếu thì lùi về bản có sẵn). */
export const editorText = (value: LocalizedText | null | undefined) =>
  localize(value, getEditorLanguage());

/** Ghi chữ vừa nhập vào bản dịch của ngôn ngữ đang soạn, giữ nguyên các bản khác. */
export const withEditorText = (value: LocalizedText | null | undefined, text: string) =>
  setLocalized(value, getEditorLanguage(), text);
