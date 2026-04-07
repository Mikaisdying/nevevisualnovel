import { useGameStore } from '@/engine/store';

export default function StartScreen() {
  const startGame = useGameStore((s) => s.startGame);

  return (
    <div className="fixed inset-0 w-screen h-screen flex flex-col items-center justify-center gap-6 text-white bg-transparent">
      <h1 className="text-4xl font-bold">My Visual Novel</h1>

      <button onClick={startGame} className="px-6 py-2 border">
        Start
      </button>

      <button className="px-6 py-2 border">Load</button>

      <button className="px-6 py-2 border">Library</button>
    </div>
  );
}
