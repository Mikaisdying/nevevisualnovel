import type { LocalizedText } from '@/i18n/localize';

/** Tên hiển thị nhận chuỗi hoặc `{ "vi": "...", "en": "..." }`. */
export type Manifest = {
  backgrounds: {
    id: string;
    name: LocalizedText;
    file?: string;
  }[];
  characters: {
    id: string;
    name: LocalizedText;
    poses: string[];
    /** Màu phát sáng khi nhân vật đang nói và màu tên trong lịch sử hội thoại. */
    color?: string;
  }[];
  cgs?: {
    id: string;
    name: LocalizedText;
    /** Dòng phụ trên thẻ CG trong Thư viện, vd "Chương 1". */
    chapter?: LocalizedText;
  }[];
};
