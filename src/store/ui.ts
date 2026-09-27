import { create } from 'zustand';

/** Màn / overlay mở chồng lên game hoặc màn tiêu đề. */
export type Panel =
  | { type: 'library' }
  | { type: 'settings' }
  | { type: 'save' }
  | { type: 'load' }
  | { type: 'pause' }
  | { type: 'backlog' }
  | { type: 'cg'; id: string };

export type ConfirmRequest = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
};

export type Notice = { title: string; description?: string };

type UiState = {
  /** Ngăn xếp panel: phần tử cuối là panel đang hiển thị; "Quay lại" = pop. */
  panels: Panel[];
  confirm: ConfirmRequest | null;
  notice: Notice | null;

  open: (panel: Panel) => void;
  /** Thay panel trên cùng (vd chuyển tab Lưu ↔ Tải) thay vì chồng thêm. */
  replace: (panel: Panel) => void;
  back: () => void;
  closeAll: () => void;
  askConfirm: (req: ConfirmRequest) => void;
  closeConfirm: () => void;
  showNotice: (notice: Notice) => void;
  closeNotice: () => void;
};

export const useUiStore = create<UiState>()((set) => ({
  panels: [],
  confirm: null,
  notice: null,

  open: (panel) => set((s) => ({ panels: [...s.panels, panel] })),
  replace: (panel) => set((s) => ({ panels: [...s.panels.slice(0, -1), panel] })),
  back: () => set((s) => ({ panels: s.panels.slice(0, -1) })),
  closeAll: () => set({ panels: [], confirm: null, notice: null }),
  askConfirm: (confirm) => set({ confirm }),
  closeConfirm: () => set({ confirm: null }),
  showNotice: (notice) => set({ notice }),
  closeNotice: () => set({ notice: null }),
}));

export const useTopPanel = () => useUiStore((s) => s.panels[s.panels.length - 1]);

/** Có lớp UI nào đang che game không (để chặn click / phím tiến thoại, tạm dừng auto). */
export const useUiBlocking = () =>
  useUiStore((s) => s.panels.length > 0 || !!s.confirm || !!s.notice);
