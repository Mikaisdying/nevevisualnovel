import type { LocalizedText } from '@/i18n/localize';

/**
 * Cấu hình chung của game: chữ trên màn hình tiêu đề, ảnh nền menu, theme.
 * Sửa ở đây thay vì sửa trong component. Các chữ hiển thị nhận chuỗi hoặc
 * `{ vi, en }` như dữ liệu storyline.
 */
export const GAME_CONFIG = {
  /** Kích thước canvas thiết kế (px). Toàn bộ UI được dựng theo khung này rồi scale. */
  designWidth: 1280,
  designHeight: 720,

  title: { vi: 'NGUYỆT ẢNH', en: 'MOONLIT SHADOWS' } as LocalizedText,
  subtitle: { vi: '— Moonlit Shadows —', en: '— Nguyệt Ảnh —' } as LocalizedText,
  version: { vi: 'v0.1 · Bản demo', en: 'v0.1 · Demo prototype' } as LocalizedText,
  copyright: '© 2026 Your Studio' as LocalizedText,

  /** Scene bắt đầu khi bấm "Bắt đầu". Để trống thì dùng scene đầu tiên trong storyline.json. */
  startSceneId: 'intro_1',

  /** Ảnh nền màn tiêu đề (public/assets/...). */
  titleBackground: '/assets/bg/title.png',
  /** Ảnh nền các màn Thư viện / Cài đặt / Lưu / Tải. */
  menuBackground: '/assets/bg/night.png',
  /** Nhân vật đứng ở màn tiêu đề: { name, pose } theo thư mục public/assets/char, hoặc null. */
  titleCharacter: { name: 'luna', pose: 'default' } as { name: string; pose: string } | null,

  /** Theme CSS (xem src/styles/theme.css). '' = theme mặc định. Ví dụ: 'paper'. */
  theme: '',

  /** Số ô lưu mỗi trang và số trang trong màn Lưu / Tải. */
  saveSlotsPerPage: 6,
  savePages: 3,

  /** Tên hiển thị khi người chơi nói (textbox.name) trong lịch sử hội thoại. */
  playerName: { vi: 'Bạn', en: 'You' } as LocalizedText,
};
