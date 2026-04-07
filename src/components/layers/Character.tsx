import { CharacterState } from '@/engine/types/scene';

type Props = {
  characters?: CharacterState[];
};

export default function Character({ characters }: Props) {
  if (!characters || characters.length === 0) return null;

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2">
      <div className="w-48 h-72 bg-gray-500">{/* mock character */}</div>
    </div>
  );
}
