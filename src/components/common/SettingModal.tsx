import { useGameStore } from '@/engine/store';
import { Button } from '@/components/common/Button';

type SettingModalProps = {
  open: boolean;
  onClose: () => void;
};

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  suffix: string;
}) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/80">{label}</span>
        <span className="text-sm text-white/50 tabular-nums">
          {suffix === '%' ? Math.round(value) : value.toFixed(1)}
          {suffix}
        </span>
      </div>
      <div className="relative flex h-5 items-center">
        <div className="absolute inset-x-0 h-[3px] rounded-full bg-white/10" />
        <div
          className="absolute left-0 h-[3px] rounded-full bg-white"
          style={{ width: `${percent}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-x-0 h-5 w-full cursor-pointer opacity-0"
        />
      </div>
    </div>
  );
}

export default function SettingModal({ open, onClose }: SettingModalProps) {
  const settings = useGameStore((s) => s.settings);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const returnToMenu = useGameStore((s) => s.returnToMenu);

  if (!open) return null;

  return (
    <div className="layer-modal absolute inset-0 flex items-center justify-center bg-black/55 px-4 backdrop-blur-sm">
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0b0c10] text-white shadow-2xl shadow-black/60"
        style={{ color: '#fff' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            <p className="mb-1 text-[11px] tracking-widest text-white/45 uppercase">Visual Novel</p>
            <h2 className="text-xl font-medium text-white">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-sm text-white/75 hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-5 px-6 py-5">
          {/* Audio section */}
          <div>
            <p className="mb-3 text-[11px] tracking-widest text-white/45 uppercase">Audio</p>
            <div className="flex flex-col gap-4">
              <SliderRow
                label="BGM Volume"
                value={settings.bgmVolume}
                min={0}
                max={100}
                step={1}
                suffix="%"
                onChange={(v) => updateSettings({ bgmVolume: v })}
              />
              <SliderRow
                label="Sound Effects"
                value={settings.sfxVolume}
                min={0}
                max={100}
                step={1}
                suffix="%"
                onChange={(v) => updateSettings({ sfxVolume: v })}
              />
            </div>
          </div>

          <div className="border-t border-white/8" />

          {/* Text speed */}
          <div>
            <p className="mb-3 text-[11px] tracking-widest text-white/45 uppercase">Gameplay</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/90">Text Speed</span>
              <div className="flex gap-1.5">
                {[
                  ['0.5', 'Slow'],
                  ['1.0', 'Normal'],
                  ['2.5', 'Fast'],
                ].map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => updateSettings({ textSpeed: parseFloat(val) })}
                    className={`rounded-md border px-3 py-1 text-xs transition-all ${
                      settings.textSpeed === parseFloat(val)
                        ? 'border-white/30 bg-white/10 text-white'
                        : 'border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2.5 border-t border-white/10 px-6 py-4">
          <Button
            variant="ghost"
            className="h-10 flex-1 border border-white/10 bg-white/5 text-sm text-white/80 hover:bg-white/10 hover:text-white"
            onClick={() => {
              returnToMenu();
              onClose();
            }}
          >
            Về menu
          </Button>
          <Button
            className="h-10 flex-1 bg-white text-sm font-medium text-black hover:bg-white/90"
            onClick={onClose}
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}
