import CharacterLayer from '@/components/layers/Character';
import ForegroundLayer from '@/components/layers/Foreground';

export default function Game() {
  return (
    <div className="absolute inset-0 h-full w-full">
      <div className="pointer-events-none absolute inset-0 h-full w-full">
        <CharacterLayer />
      </div>
      <ForegroundLayer />
    </div>
  );
}
