import { useGameStore } from '@/engine/store';
import type { Textbox, Choice } from '@/engine/types/scene';

type Props = {
  textbox?: Textbox;
  choices?: Choice[];
};

export default function Foreground({ textbox, choices }: Props) {
  const text = useGameStore((s) => s.texts[s.textIndex]);
  const next = useGameStore((s) => s.next);

  return (
    <div className="absolute inset-0 w-full h-full flex flex-col justify-end pointer-events-none">
      <div
        onClick={next}
        className="w-full h-32 bg-black/70 text-white p-4 cursor-pointer pointer-events-auto rounded-t-xl flex items-end justify-center"
      >
        {textbox?.text || text}
      </div>
    </div>
  );
}
