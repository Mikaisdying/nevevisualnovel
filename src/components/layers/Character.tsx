import { useGameStore } from '@/engine/store';

const positionClass = {
  left: 'left-1/4 -translate-x-1/2',
  center: 'left-1/2 -translate-x-1/2',
  right: 'left-3/4 -translate-x-1/2',
};

export default function Character() {
  const characters = useGameStore((s) => s.sceneMap[s.currentSceneId]?.char);
  if (!characters || characters.length === 0) return null;

  return (
    <>
      {characters.map((char, idx) => {
        const pos = char.position || 'center';
        const isFocus = char.focus !== false;
        return (
          <div
            key={idx}
            className={`layer-characters absolute bottom-0 ${positionClass[pos]} flex flex-col justify-end`}
            style={{ height: '100%' }}
          >
            <img
              src={`/assets/char/${char.name}/${char.pose}.png`}
              alt={char.name}
              style={{
                height: '100%',
                width: 'auto',
                maxWidth: '100%',
                filter: isFocus ? undefined : 'brightness(0.4)',
              }}
              className="object-bottom drop-shadow-lg"
              draggable={false}
            />
          </div>
        );
      })}
    </>
  );
}
