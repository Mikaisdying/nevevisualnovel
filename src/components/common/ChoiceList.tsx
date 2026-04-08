import React from 'react';

export interface Choice {
  text: string;
  next: string;
}

interface ChoiceListProps {
  choices: Choice[];
  onSelect: (choice: Choice) => void;
}

const ChoiceList: React.FC<ChoiceListProps> = ({ choices, onSelect }) => {
  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '48rem',
        zIndex: 30,
        pointerEvents: 'auto',
      }}
      className="flex flex-col gap-4"
    >
      {choices.map((choice, idx) => (
        <button
          key={idx}
          className="rounded-xl border-2 border-orange-300 bg-white/90 px-6 py-3 text-lg font-semibold text-black shadow-lg transition-all outline-none hover:bg-orange-100 focus:ring-2 focus:ring-orange-400"
          onClick={() => onSelect(choice)}
        >
          {choice.text}
        </button>
      ))}
    </div>
  );
};

export default ChoiceList;
