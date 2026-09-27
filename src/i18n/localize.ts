export type Language = 'vi' | 'en';

export const LANGUAGES: { id: Language; label: string; short: string }[] = [
  { id: 'vi', label: 'Tiếng Việt', short: 'VI' },
  { id: 'en', label: 'English', short: 'EN' },
];

export const DEFAULT_LANGUAGE: Language = 'vi';

/**
 * Chữ trong dữ liệu (storyline.json, manifest.json, config): chuỗi thường dùng
 * chung cho mọi ngôn ngữ, hoặc object theo ngôn ngữ `{ "vi": "...", "en": "..." }`.
 */
export type LocalizedText = string | Partial<Record<Language, string>>;

export function isLanguage(value: unknown): value is Language {
  return value === 'vi' || value === 'en';
}

/**
 * Lấy chữ theo ngôn ngữ. Thiếu bản dịch thì lùi về ngôn ngữ mặc định, rồi
 * ngôn ngữ bất kỳ đang có — thà hiện tiếng khác còn hơn để trống.
 */
export function localize(value: LocalizedText | null | undefined, lang: Language): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return (
    value[lang] ||
    value[DEFAULT_LANGUAGE] ||
    Object.values(value).find((v): v is string => !!v) ||
    ''
  );
}

/** Biến đổi từng bản dịch (vd cắt ngắn), giữ nguyên dạng chuỗi / object. */
export function mapLocalized(
  value: LocalizedText,
  fn: (text: string) => string,
): LocalizedText {
  if (typeof value === 'string') return fn(value);
  return Object.fromEntries(
    Object.entries(value).map(([lang, text]) => [lang, text ? fn(text) : text]),
  ) as LocalizedText;
}

/** Có nội dung ở ít nhất một ngôn ngữ không. */
export function hasText(value: LocalizedText | null | undefined): boolean {
  if (value == null) return false;
  if (typeof value === 'string') return value !== '';
  return Object.values(value).some((v) => !!v);
}

/**
 * Ghi bản dịch của một ngôn ngữ (dùng trong editor). Chuỗi thường là chữ dùng
 * chung nên được tách ra cho mọi ngôn ngữ trước khi ghi đè. Bỏ các bản dịch
 * rỗng; mọi ngôn ngữ giống nhau thì gộp lại thành chuỗi thường; không còn gì
 * thì trả về ''.
 */
export function setLocalized(
  value: LocalizedText | null | undefined,
  lang: Language,
  text: string,
): LocalizedText {
  const base: Partial<Record<Language, string>> =
    typeof value === 'string'
      ? Object.fromEntries(LANGUAGES.map((l) => [l.id, value]))
      : { ...value };
  base[lang] = text;
  const cleaned = Object.fromEntries(
    Object.entries(base).filter(([, v]) => !!v),
  ) as Partial<Record<Language, string>>;
  const values = LANGUAGES.map((l) => cleaned[l.id]);
  if (values.every((v) => v && v === values[0])) return values[0]!;
  return Object.keys(cleaned).length ? cleaned : '';
}

/** Bản dịch đúng của `lang` (không lùi về ngôn ngữ khác) — để editor biết chỗ nào còn thiếu. */
export function exactLocalized(value: LocalizedText | null | undefined, lang: Language): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return value[lang] ?? '';
}
