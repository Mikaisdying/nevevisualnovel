import { useState } from 'react';
import { Settings } from 'lucide-react';
import SettingModal from './SettingModal';

export default function SettingsCog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="layer-modal absolute" style={{ top: 16, right: 16, left: 'auto' }}>
        <button
          type="button"
          aria-label="Open settings"
          onClick={() => setOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white shadow-lg shadow-black/30 transition hover:scale-105 hover:bg-white/10"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>

      <SettingModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
