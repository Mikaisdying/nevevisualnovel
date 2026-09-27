import type { Flags } from './condition';
import type { LocalizedText } from '@/i18n/localize';

/** Giữ chữ ở dạng song ngữ để đổi ngôn ngữ thì lịch sử / bản lưu hiện lại đúng tiếng. */
export type BacklogEntry = { sceneId: string; name?: LocalizedText; text: LocalizedText };

export type SaveSlot = {
  id: string;
  /** Ô lưu (1-based) trong màn Lưu / Tải. */
  slot: number;
  sceneId: string;
  flags: Flags;
  savedAt: number;
  label: LocalizedText;
  /** Nhãn chương tại thời điểm lưu. */
  chapter?: LocalizedText;
  /** Ảnh thu nhỏ: id background hoặc CG của scene đang đứng. */
  thumb?: { kind: 'bg' | 'cg'; id: string };
  backlog?: BacklogEntry[];
};

const STORAGE_KEY = 'neve-visual-novel-saves';

function readSlots(): SaveSlot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return assignLegacySlots(parsed);
  } catch {
    return [];
  }
}

/** Save cũ (trước khi có ô lưu) chưa có `slot`: xếp vào các ô trống đầu tiên theo thứ tự lưu. */
function assignLegacySlots(slots: SaveSlot[]): SaveSlot[] {
  if (slots.every((s) => typeof s.slot === 'number')) return slots;
  const used = new Set(slots.filter((s) => typeof s.slot === 'number').map((s) => s.slot));
  let next = 1;
  return [...slots]
    .sort((a, b) => a.savedAt - b.savedAt)
    .map((s) => {
      if (typeof s.slot === 'number') return s;
      while (used.has(next)) next++;
      used.add(next);
      return { ...s, slot: next };
    });
}

function writeSlots(slots: SaveSlot[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
  } catch (error) {
    console.error('Failed to write saves:', error);
  }
}

export function listSaves(): SaveSlot[] {
  return readSlots().sort((a, b) => b.savedAt - a.savedAt);
}

export function readSave(id: string): SaveSlot | undefined {
  return readSlots().find((slot) => slot.id === id);
}

export function readSlot(slot: number): SaveSlot | undefined {
  return readSlots().find((s) => s.slot === slot);
}

export function latestSave(): SaveSlot | undefined {
  return listSaves()[0];
}

/** Ghi vào ô `slot`, thay thế save đang có ở ô đó. */
export function writeSave(entry: Omit<SaveSlot, 'id' | 'savedAt'>): SaveSlot {
  const slots = readSlots().filter((s) => s.slot !== entry.slot);
  const saved: SaveSlot = { ...entry, id: `slot-${entry.slot}`, savedAt: Date.now() };
  writeSlots([...slots, saved]);
  return saved;
}

export function removeSave(id: string) {
  writeSlots(readSlots().filter((slot) => slot.id !== id));
}
