interface Props {
  valor: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  paso?: number;
}

export function SliderPeso({ valor, onChange, min, max, paso = 0.5 }: Props) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-4xl font-display text-pine-800">
        {valor} <span className="text-lg text-ink/50">kg</span>
      </div>
      <div className="h-64 flex items-center justify-center" style={{ width: 56 }}>
        <input
          type="range"
          min={min}
          max={max}
          step={paso}
          value={valor}
          onChange={(e) => onChange(Number(e.target.value))}
          className="accent-pine-600"
          style={{
            width: 224,
            height: 40,
            transform: 'rotate(-90deg)',
            transformOrigin: 'center',
          }}
          aria-label="Peso actual en kilogramos"
        />
      </div>
      <div className="flex justify-between w-full max-w-[220px] text-xs text-ink/40">
        <span>{min} kg</span>
        <span>{max} kg</span>
      </div>
    </div>
  );
}
