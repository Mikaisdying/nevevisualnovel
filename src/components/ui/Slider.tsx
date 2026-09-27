type SliderProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Cách hiển thị giá trị bên phải; mặc định "80%". */
  format?: (value: number) => string;
};

/** Figma: Slider — nhãn trái, thanh trượt giữa, giá trị phải (710x24). */
export function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  format = (v) => `${Math.round(v)}%`,
}: SliderProps) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <label className="flex h-[24px] items-center gap-[20px]">
      <span className="w-[180px] shrink-0 text-[16px]">{label}</span>
      <div className="vn-slider w-[440px]">
        <div className="vn-slider__track" />
        <div className="vn-slider__fill" style={{ width: `${percent}%` }} />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={label}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <div className="vn-slider__thumb" style={{ left: `${percent}%` }} />
      </div>
      <span className="w-[50px] text-right text-[15px] text-[var(--vn-accent)] tabular-nums">
        {format(value)}
      </span>
    </label>
  );
}
