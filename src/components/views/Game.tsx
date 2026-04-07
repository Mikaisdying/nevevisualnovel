import SettingsCog from '@/components/ui/SettingsCog';

import CharacterLayer from '@/components/layers/Character';
import ForegroundLayer from '@/components/layers/Foreground';

export default function Game() {
  return (
    <div className="relative z-10 w-full h-full">
      <SettingsCog />
      <CharacterLayer />
      <ForegroundLayer />
    </div>
  );
}
