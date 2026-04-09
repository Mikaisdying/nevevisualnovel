import CharacterLayer from '@/components/layers/Character';
import ForegroundLayer from '@/components/layers/Foreground';
import type { Scene } from '@/types/scene';

type Props = {
  data?: Scene[];
};

export default function Game({ data }: Props) {
  if (data) {
    const scene = data[0];
    if (!scene) return null;

    return (
      <div className="absolute inset-0 h-full w-full bg-neutral-900">
        {scene.bg ? (
          <img
            src={`/assets/bg/${scene.bg}.png`}
            alt={scene.bg}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}

        <div className="absolute right-4 bottom-4 left-4 rounded bg-black/70 p-4 text-white">
          <div className="text-sm text-gray-300">{scene.textbox?.name}</div>
          <div className="mt-1 text-lg">{scene.textbox?.text || 'No dialogue yet'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 h-full w-full">
      <div className="pointer-events-none absolute inset-0 h-full w-full">
        <CharacterLayer />
      </div>
      <ForegroundLayer />
    </div>
  );
}
