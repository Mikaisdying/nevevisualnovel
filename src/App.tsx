import { useGameStore } from './engine/store';
import StartScreen from './components/views/StartScreen';
import Game from './components/views/Game';

import './styles/index.css';

import BackgroundLayer from './components/layers/Background';

export default function App() {
  const started = useGameStore((s) => s.started);

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black">
      <BackgroundLayer />
      {started ? <Game /> : <StartScreen />}
    </div>
  );
}
