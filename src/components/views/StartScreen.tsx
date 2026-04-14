import { useGameStore } from '@/engine/store';
import { Button } from '@/components/common/Button';

export default function StartScreen() {
  const startGame = useGameStore((s) => s.startGame);

  return (
    <div className="fullscreen-absolute layer-ui flex flex-col items-center justify-center gap-6 bg-transparent text-white">
      <h1 className="text-4xl font-bold">My Visual Novel</h1>

      <Button onClick={startGame} variant="outline" className="w-32">
        Start
      </Button>
      <Button variant="outline" className="w-32">
        Load
      </Button>
      <Button variant="outline" className="w-32">
        Library
      </Button>
    </div>
  );
}
