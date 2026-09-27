import { useGameStore } from '@/engine/store';
import { charUrl } from '@/engine/assets';
import type { CharacterPosition, CharacterState } from '@/types/scene';
import type { Manifest } from '@/types/manifest';
import { LANGUAGES, localize, type LocalizedText } from '@/i18n/localize';

/** Tâm ngang (px) của từng vị trí, theo các frame Figma (sprite rộng 260). */
const SLOT_X: Record<'solo' | 'duo' | 'trio', Partial<Record<CharacterPosition, number>>> = {
  solo: { center: 640, left: 380, right: 900 },
  duo: { left: 380, center: 640, right: 900 },
  trio: { left: 260, center: 640, right: 1020 },
};
const AUTO_ORDER: CharacterPosition[][] = [[], ['center'], ['left', 'right'], ['left', 'center', 'right']];

function layoutCharacters(chars: CharacterState[]) {
  const n = chars.length;
  const layout = n >= 3 ? 'trio' : n === 2 ? 'duo' : 'solo';
  const auto = AUTO_ORDER[Math.min(n, 3)];
  return chars.map((c, i) => {
    const pos = c.position ?? auto[i] ?? 'center';
    return SLOT_X[layout][pos] ?? 640;
  });
}

/** So tên không phân biệt ngôn ngữ: khớp nếu trùng ở bất kỳ bản dịch nào. */
function sameName(a?: LocalizedText, b?: LocalizedText) {
  if (!a || !b) return false;
  const names = (v: LocalizedText) =>
    LANGUAGES.map((l) => localize(v, l.id).trim().toLowerCase()).filter(Boolean);
  const bs = names(b);
  return names(a).some((n) => bs.includes(n));
}

function isFocused(
  c: CharacterState,
  speaker: LocalizedText | undefined,
  count: number,
  manifest: Manifest,
) {
  if (c.focus !== undefined) return c.focus;
  if (count === 1) return true;
  const displayName = manifest.characters.find((m) => m.id === c.name)?.name;
  return sameName(c.name, speaker) || sameName(displayName, speaker);
}

type CharacterLayerProps = {
  /** Danh sách hiển thị trực tiếp (màn tiêu đề); mặc định lấy theo scene hiện tại. */
  characters?: CharacterState[];
  speaker?: LocalizedText;
  /** Ghi đè vị trí tâm ngang (px). */
  x?: number;
};

/**
 * Sprite nhân vật: khung cao --vn-char-height, đáy cách mép dưới --vn-char-bottom
 * (theme.css). Ảnh được scale theo chiều cao, giữ tỉ lệ, neo đáy-giữa — thay
 * bằng ảnh raster bất kỳ tỉ lệ nào cũng không méo. Người đang nói sáng + phát
 * sáng theo màu nhân vật (manifest.characters[].color), người còn lại tối đi.
 */
export default function CharacterLayer({ characters, speaker, x }: CharacterLayerProps) {
  const scene = useGameStore((s) => s.sceneMap[s.currentSceneId]);
  const manifest = useGameStore((s) => s.manifest);

  const list = characters ?? (scene?.cg || scene?.card ? [] : (scene?.char ?? []));
  const talking = characters ? speaker : scene?.textbox?.name;
  if (list.length === 0) return null;

  const xs = layoutCharacters(list);

  return (
    <div className="layer-characters pointer-events-none absolute inset-0">
      {list.map((c, i) => {
        const focused = isFocused(c, talking, list.length, manifest);
        const color = manifest.characters.find((m) => m.id === c.name)?.color;
        return (
          <div
            key={`${c.name}-${i}`}
            className="absolute flex justify-center transition-[left] duration-300"
            style={{
              left: x ?? xs[i],
              bottom: 'var(--vn-char-bottom)',
              height: 'var(--vn-char-height)',
              width: 0,
              zIndex: focused ? 2 : 1,
            }}
          >
            <img
              src={charUrl(c.name, c.pose)}
              alt={c.name}
              draggable={false}
              className="h-full w-auto max-w-none object-contain object-bottom transition-[filter,transform] duration-300"
              style={{
                filter: focused
                  ? `drop-shadow(0 0 var(--vn-char-glow-size) color-mix(in srgb, ${color ?? 'var(--vn-char-glow-default)'} 55%, transparent))`
                  : 'var(--vn-char-dim)',
                transform: focused ? undefined : 'translateY(var(--vn-char-dim-shift))',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
