import { useGameStore } from './engine/store';
import { useEffect } from 'react';
import StartScreen from './components/views/StartScreen';
import Game from './components/views/Game';

import BackgroundLayer from './components/layers/Background';
import { useGame } from './hooks/useGame';
import SettingsCog from './components/common/SettingsCog';

export default function App() {
  const started = useGameStore((s) => s.started);
  const sceneMap = useGameStore((s) => s.sceneMap);
  const loading = useGameStore((s) => s.loading);
  const startScene = sceneMap['start'];
  const scene = sceneMap['intro_1'];

  useEffect(() => {
    useGameStore.getState().init();
  }, []);

  if (loading) {
    return (
      <div className="fixed w-screen h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="fixed w-screen h-screen bg-black">
      <div className="">
        <BackgroundLayer bg={started ? scene?.bg : startScene?.bg} />
        {started ? <Game /> : <StartScreen />}
      </div>

      <SettingsCog />
    </div>
  );
}
