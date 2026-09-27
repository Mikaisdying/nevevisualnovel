# NeveVisualNovel

Visual novel engine + in-browser story editor built with React, Vite, and Express.

## Yêu cầu

- Node.js >= 18
- npm

## Cài đặt

```bash
npm install
```

## Chạy local

### Chỉ chạy game (visual novel)

```bash
npm run dev
```

Mở trình duyệt tại địa chỉ Vite in ra (mặc định `http://localhost:5173`).

### Chạy kèm editor (đọc/ghi dữ liệu storyline, upload asset)

Editor cần backend API để đọc/ghi `public/data/manifest.json`, `public/data/storyline.json` và quản lý asset. Chạy đồng thời frontend (Vite) và backend (Express):

```bash
npm run start
```

Lệnh này chạy song song:

- `npm run backend` — API server tại `http://localhost:3001`
- `npm run dev` — Vite dev server tại `http://localhost:5173`, proxy các request `/api` sang backend

Nếu muốn chạy riêng lẻ, mở 2 terminal:

```bash
npm run backend
npm run dev
```

## Build production

```bash
npm run build
```

Xem thử bản build:

```bash
npm run preview
```

## Format code

```bash
npm run format
```

## Tuỳ biến giao diện game

UI dựng theo Figma "Visual Novel – UI & Prototype", trên canvas cố định 1280x720. Canvas được scale để vừa màn hình theo cả chiều ngang lẫn dọc, giữ tỉ lệ 16:9; phần dư là viền đen.

- **Theme**: mọi màu, font, bo góc, đổ bóng nằm trong `src/styles/theme.css` (biến `--vn-*`). Đổi theme: sửa các biến đó, hoặc thêm một khối `[data-vn-theme='ten']` rồi đặt `theme: 'ten'` trong `src/config/game.ts` (có sẵn ví dụ `paper`).
- **Phần nhìn của component**: `src/styles/vn-ui.css`. Component nằm trong `src/components/ui`, tương ứng với component trong Figma (Button, Dialogue Box, Quick Menu, Slider, Toggle, CG Card, Save Slot, Dialog…).
- **Chữ / ảnh màn tiêu đề, scene bắt đầu, số ô lưu**: `src/config/game.ts`.
- **Ảnh**: chỉ cần thay file raster cùng tên.
  - `public/assets/bg/<id>.png`: nên dùng tỉ lệ 16:9, ví dụ 1920x1080.
  - `public/assets/cg/<id>.png`: tỉ lệ 16:9.
  - `public/assets/char/<nhân vật>/<pose>.png`: ảnh được scale theo chiều cao, neo ở đáy-giữa. Chiều cao và vị trí đáy chỉnh qua `--vn-char-height` / `--vn-char-bottom`.
- **Dữ liệu scene** (`public/data/storyline.json`) có thêm các field tuỳ chọn:
  - `chapter`: nhãn chương ở góc trên trái.
  - `card`: thẻ mở chương / kết chương, dạng `{ "type": "title" | "end", "eyebrow", "title", "subtitle" }`.
- **Manifest**: `characters[].color` là màu phát sáng của nhân vật và màu tên trong lịch sử hội thoại; `cgs[].chapter` là dòng phụ trên thẻ CG.

## Đa ngôn ngữ (Tiếng Việt / English)

Người chơi đổi ngôn ngữ bằng nút **VI / EN** ở màn tiêu đề hoặc **Cài đặt → Ngôn ngữ**. Đổi là áp dụng ngay. Lần đầu mở game, ngôn ngữ được chọn theo trình duyệt.

- **Chữ giao diện**: `src/i18n/messages.ts`. Thêm chuỗi mới vào `vi` trước; TypeScript sẽ báo lỗi ở `en` cho tới khi có bản dịch. Trong component dùng `const { t, tx } = useI18n()`.
- **Chữ trong dữ liệu** (`storyline.json`, `manifest.json`, `src/config/game.ts`): mọi trường chữ nhận một chuỗi (dùng chung cho mọi ngôn ngữ, vd tên "Luna") hoặc object theo ngôn ngữ:

  ```json
  "textbox": {
    "name": { "vi": "Bạn", "en": "You" },
    "text": { "vi": "Ừ. Mình cứ nghe thấy tiếng gì đó…", "en": "Yeah. I keep hearing something…" }
  }
  ```

  Áp dụng cho `textbox.name`, `textbox.text`, `choices[].text`, `chapter`, `card.eyebrow/title/subtitle`, và `name` / `chapter` trong manifest. Nếu thiếu bản dịch, game dùng bản tiếng Việt, rồi tới bất kỳ bản nào đang có.
- **Editor**: công tắc **VI / EN** ở góc trên panel thuộc tính chọn ngôn ngữ đang soạn. Ô thoại, tên người nói và lựa chọn đọc/ghi bản dịch của ngôn ngữ đó; ô còn trống sẽ hiện bản dịch của ngôn ngữ kia làm gợi ý. Card và connector trên canvas cũng hiển thị theo ngôn ngữ đang soạn.
- Lịch sử hội thoại và bản lưu giữ chữ ở dạng song ngữ, nên sau khi đổi ngôn ngữ vẫn hiện đúng tiếng.

## Cấu trúc thư mục chính

- `src/components` — UI components của game (layers, views, common)
- `src/engine` — engine chạy story (loader, condition, save, store)
- `src/editor` — story editor (components, API client, backend Express server)
- `src/i18n` — đa ngôn ngữ: chữ giao diện (`messages.ts`), hàm dịch dữ liệu (`localize.ts`), ngôn ngữ đang chọn
- `public/data` — dữ liệu storyline/manifest
- `public/assets` — asset game (background, character, audio)
