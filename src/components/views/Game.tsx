import CharacterLayer from '@/components/layers/Character';
import ForegroundLayer from '@/components/layers/Foreground';
import { useEffect } from 'react';
import { useGameStore } from '@/engine/store';

export default function Game() {
  useEffect(() => {
    useGameStore.getState().init();
  }, []);
  return (
    <div className="absolute inset-0">
      <CharacterLayer />
      <ForegroundLayer />
    </div>
  );
}
