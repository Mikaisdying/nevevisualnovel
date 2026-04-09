import React from 'react';

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (asset: any) => void;
}

export const AssetModal: React.FC<AssetModalProps> = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[80vh] w-full max-w-2xl overflow-auto rounded-lg bg-gray-800 p-6">
        <h2 className="mb-4 text-xl font-semibold text-white">Select Asset</h2>
        {/* Asset modal implementation */}
        <div className="text-gray-400">Asset Modal</div>
        <button
          onClick={onClose}
          className="mt-4 rounded bg-gray-700 px-4 py-2 text-white hover:bg-gray-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};
