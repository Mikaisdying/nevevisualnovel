import { useGameStore } from '@/engine/store';
import { Button } from '@/components/common/Button';

export default function StartScreen() {
  const startGame = useGameStore((s) => s.startGame);

  return (
    <div className="fullscreen-absolute layer-ui flex w-full items-center text-white">
      <div className="flex-1"></div>

      <div className="flex flex-1 justify-center p-8">
        <div className="flex flex-col items-center gap-8">
          <h1 className="text-center text-4xl font-bold tracking-wider">My Visual Novel</h1>

          <nav className="flex flex-col gap-4">
            <Button onClick={startGame} variant="outline" className="h-12 w-40">
              Start
            </Button>
            <Button variant="outline" className="h-12 w-40">
              Load
            </Button>
            <Button variant="outline" className="h-12 w-40">
              Library
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
}
