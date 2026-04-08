import { useGameStore } from '@/engine/store';
import { TextBox } from '@/components/common/TextBox';
import ChoiceList, { Choice } from '@/components/common/ChoiceList';
import React, { useState, useRef } from 'react';

export default function Foreground() {
  const scene = useGameStore((s) => s.sceneMap[s.currentSceneId]);
  const next = useGameStore((s) => s.next);
  const jump = useGameStore((s) => s.jump);
  const [textDone, setTextDone] = useState(false);
  const [choiceActive, setChoiceActive] = useState(false);
  const prevSceneId = useRef<string | undefined>(undefined);

  // Giả lập text chạy hết (có thể thay bằng hiệu ứng typewriter sau)
  React.useEffect(() => {
    setTextDone(false);
    setChoiceActive(false);
    if (scene?.textbox?.text) {
      const timeout = setTimeout(() => {
        setTextDone(true);
        if (scene?.choices) setChoiceActive(true);
      }, 600);
      return () => clearTimeout(timeout);
    } else {
      setTextDone(true);
      if (scene?.choices) setChoiceActive(true);
    }
    prevSceneId.current = scene?.id;
  }, [scene?.id, scene?.textbox?.text]);

  const handleChoice = (choice: Choice) => {
    setChoiceActive(false); // ẩn choice ngay khi chọn
    jump(choice.next);
  };

  return (
    <>
      <TextBox
        onClick={() => {
          if (!scene?.choices && textDone) next();
        }}
        className="pointer-events-auto cursor-pointer select-none"
        name={scene?.textbox?.name}
        content={scene?.textbox?.text}
      />
      {scene?.choices && textDone && choiceActive && (
        <ChoiceList choices={scene.choices} onSelect={handleChoice} />
      )}
    </>
  );
}
