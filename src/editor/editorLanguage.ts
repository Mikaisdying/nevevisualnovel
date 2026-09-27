import {
  exactLocalized,
  localize,
  setLocalized,
  type Language,
  type LocalizedText,
} from '@/i18n/localize';

/** Ngôn ngữ chính của editor: chữ trên card / connector luôn hiện bằng tiếng Việt. */
export const EDITOR_PRIMARY: Language = 'vi';
/** Ngôn ngữ phụ soạn song song; bỏ trống thì game lùi về tiếng Việt. */
export const EDITOR_SECONDARY: Language = 'en';

/** Chữ hiển thị trên card / connector (thiếu tiếng Việt thì lùi về bản có sẵn). */
export const editorText = (value: LocalizedText | null | undefined) =>
  localize(value, EDITOR_PRIMARY);

/** Bản dịch phụ để hiện kèm trên card — chỉ khi có và khác bản tiếng Việt. */
export const editorSecondaryText = (value: LocalizedText | null | undefined) => {
  const secondary = exactLocalized(value, EDITOR_SECONDARY);
  return secondary && secondary !== exactLocalized(value, EDITOR_PRIMARY) ? secondary : '';
};

/** Ghi chữ tiếng Việt vừa nhập, giữ nguyên các bản dịch khác. */
export const withEditorText = (value: LocalizedText | null | undefined, text: string) =>
  setLocalized(value, EDITOR_PRIMARY, text);
