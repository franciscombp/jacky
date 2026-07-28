import { useEffect, useRef, useState } from 'react';

interface Props {
  valor: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  paso?: number;
}

const ALTO_ITEM = 44;

export function RuedaPeso({ valor, onChange, min, max, paso = 0.5 }: Props) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const decimales = paso < 1 ? 1 : 0;
  const cantidad = Math.round((max - min) / paso) + 1;
  const valores = Array.from({ length: cantidad }, (_, i) => Number((min + i * paso).toFixed(decimales)));

  const [seleccionInterna, setSeleccionInterna] = useState(valor);
  const montado = useRef(false);
  const frameId = useRef<number | null>(null);

  // Centrar en el valor inicial (o cuando cambie desde fuera, p.ej. al reabrir para editar).
  useEffect(() => {
    const idx = Math.round((valor - min) / paso);
    const el = contenedorRef.current;
    if (el && !montado.current) {
      el.scrollTop = idx * ALTO_ITEM;
      montado.current = true;
    }
    setSeleccionInterna(valor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [min, max]);

  function manejarScroll() {
    const el = contenedorRef.current;
    if (!el) return;
    if (frameId.current) cancelAnimationFrame(frameId.current);
    frameId.current = requestAnimationFrame(() => {
      const idx = Math.round(el.scrollTop / ALTO_ITEM);
      const clamped = Math.min(Math.max(idx, 0), valores.length - 1);
      const nuevo = valores[clamped];
      if (nuevo !== undefined && nuevo !== seleccionInterna) {
        setSeleccionInterna(nuevo);
        onChange(nuevo);
      }
    });
  }

  return (
    <div className="flex flex-col items-center">
      <p className="text-xs text-ink/50 mb-1">Desliza para ajustar</p>
      <div className="relative w-full max-w-[220px]">
        {/* Marco central que indica la fila seleccionada */}
        <div
          className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2 border-y-2 border-pine-300 bg-pine-50/40 z-10"
          style={{ height: ALTO_ITEM }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 z-20"
          style={{ background: 'linear-gradient(to bottom, var(--color-paper), transparent)' }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 z-20"
          style={{ background: 'linear-gradient(to top, var(--color-paper), transparent)' }}
        />
        <div
          ref={contenedorRef}
          onScroll={manejarScroll}
          className="overflow-y-scroll no-scrollbar"
          style={{
            height: ALTO_ITEM * 5,
            scrollSnapType: 'y mandatory',
            paddingTop: ALTO_ITEM * 2,
            paddingBottom: ALTO_ITEM * 2,
          }}
        >
          {valores.map((v) => (
            <div
              key={v}
              className={`flex items-center justify-center font-display transition-all ${
                v === seleccionInterna ? 'text-3xl text-pine-800' : 'text-lg text-ink/30'
              }`}
              style={{ height: ALTO_ITEM, scrollSnapAlign: 'center' }}
            >
              {v} <span className="text-sm ml-1">kg</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
