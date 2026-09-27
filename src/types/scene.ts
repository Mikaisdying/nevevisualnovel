import type { LocalizedText } from '@/i18n/localize';

export type { LocalizedText };

export type CharacterPosition = 'left' | 'center' | 'right';

export type CharacterState = {
  name: string;
  pose: string;
  position?: CharacterPosition;
  /** true = sáng (đang nói), false = tối. Bỏ trống: tự sáng khi textbox.name trùng tên nhân vật (hoặc cảnh chỉ có 1 người). */
  focus?: boolean;
};

/** Mọi trường chữ nhận chuỗi (dùng chung) hoặc `{ "vi": "...", "en": "..." }`. */
export type Textbox = {
  name?: LocalizedText;
  text: LocalizedText;
};

export type Choice = {
  text: LocalizedText | null;
  next: string;
  condition?: string;
};

/**
 * Màn chữ lớn giữa màn hình thay cho khung thoại:
 * - "title": thẻ mở chương (bấm để tiếp tục).
 * - "end": thẻ kết chương, có nút "Chương tiếp theo" (nếu có scene kế) và "Về menu chính".
 */
export type SceneCard = {
  type: 'title' | 'end';
  /** Dòng nhỏ phía trên, vd "CHƯƠNG 2" / "HẾT CHƯƠNG 1". */
  eyebrow?: LocalizedText;
  title: LocalizedText;
  subtitle?: LocalizedText;
};

export type Scene = {
  id: string;
  bg?: string;
  char?: CharacterState[];
  textbox?: Textbox;
  choices?: Choice[];
  /** Legacy auto-advance target for scenes without choices; kept for backward compatibility with older storyline data. */
  next?: string;
  /** Flags merged into game state when this scene is entered; read by Choice.condition to gate later choices. */
  setFlags?: Record<string, boolean>;
  /** CG illustration id shown (instead of bg/char) for this scene; entering it unlocks the CG in the gallery. */
  cg?: string;
  /** Nhãn chương góc trên trái (vd "Chương 1 · Khu rừng trăng"); giữ nguyên cho các scene sau đến khi đổi. */
  chapter?: LocalizedText;
  card?: SceneCard;
};

export type Chapter = {
  id: string;
  title: string;
  scenes: Scene[];
};
