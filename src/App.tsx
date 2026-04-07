import { useGameStore } from './engine/store';
import StartScreen from './components/views/StartScreen';
import Game from './components/views/Game';

import BackgroundLayer from './components/layers/Background';
import SettingsCog from './components/common/SettingsCog';

export default function App() {
  const started = useGameStore((s) => s.started);

  return (
    <div className="fixed w-screen h-screen bg-black">
      <div className="">
        <BackgroundLayer />
        {started ? <Game /> : <StartScreen />}
      </div>

      <SettingsCog />
    </div>
  );
}
