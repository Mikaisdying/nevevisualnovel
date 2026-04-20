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

  const hasInteractiveChoices = scene?.choices?.some((c) => c.text !== null) ?? false;
  const displayChoices: Choice[] =
    scene?.choices
      ?.filter((c) => c.text !== null)
      .map((c) => ({
        text: (c.text ?? '') as string,
        next: c.next,
      })) ?? [];

  // Giả lập text chạy hết (có thể thay bằng hiệu ứng typewriter sau)
  React.useEffect(() => {
    setTextDone(false);
    setChoiceActive(false);
    if (scene?.textbox?.text) {
      const timeout = setTimeout(() => {
        setTextDone(true);
        if (hasInteractiveChoices) setChoiceActive(true);
      }, 600);
      return () => clearTimeout(timeout);
    } else {
      setTextDone(true);
      if (hasInteractiveChoices) setChoiceActive(true);
    }
    prevSceneId.current = scene?.id;
  }, [scene?.id, scene?.textbox?.text, hasInteractiveChoices]);

  const handleChoice = (choice: Choice) => {
    setChoiceActive(false); // ẩn choice ngay khi chọn
    jump(choice.next);
  };

  return (
    <>
      <TextBox
        onClick={() => {
          if (!hasInteractiveChoices && textDone) next();
        }}
        className="pointer-events-auto cursor-pointer select-none"
        name={scene?.textbox?.name}
        content={scene?.textbox?.text}
      />
      {hasInteractiveChoices && textDone && choiceActive && (
        <ChoiceList choices={displayChoices} onSelect={handleChoice} />
      )}
    </>
  );
}
