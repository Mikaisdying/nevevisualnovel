import { VnButton } from '@/components/ui';
import { useI18n } from '@/i18n';
import type { Choice } from '@/types/scene';

interface ChoiceListProps {
  choices: Choice[];
  onSelect: (choice: Choice) => void;
}

/** Figma: "Choices" — cột nút Choice rộng 560 đặt tại y=170, cách nhau 16. */
export default function ChoiceList({ choices, onSelect }: ChoiceListProps) {
  const { tx } = useI18n();
  return (
    <div className="layer-ui vn-rise-in absolute top-[170px] left-[360px] flex w-[560px] flex-col gap-[16px]">
      {choices.map((choice, idx) => (
        <VnButton
          key={`${choice.next}-${idx}`}
          variant="choice"
          size="lg"
          className="w-full"
          onClick={() => onSelect(choice)}
        >
          {tx(choice.text)}
        </VnButton>
      ))}
    </div>
  );
}
