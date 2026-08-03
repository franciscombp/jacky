import type { ComponenteReceta } from '../../engine/receta';

const COLORES: Record<string, string> = {
  'proteína': '#a7cdb6',
  carbohidrato: '#f4d68a',
  vegetales: '#78b092',
  grasa: '#e0a92f',
};

export function Plato({ componentes }: { componentes: ComponenteReceta[] }) {
  const total = componentes.reduce((s, c) => s + c.gramos, 0) || 1;
  let acumulado = 0;

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="w-28 h-28 shrink-0" role="img" aria-label="Plato de la receta">
        <circle cx="50" cy="50" r="48" fill="var(--color-paper)" stroke="var(--color-pine-100)" strokeWidth="2" />
        {componentes.map((c) => {
          const fraccion = c.gramos / total;
          const inicio = acumulado;
          acumulado += fraccion;
          const angInicio = inicio * 2 * Math.PI - Math.PI / 2;
          const angFin = acumulado * 2 * Math.PI - Math.PI / 2;
          const x1 = 50 + 46 * Math.cos(angInicio);
          const y1 = 50 + 46 * Math.sin(angInicio);
          const x2 = 50 + 46 * Math.cos(angFin);
          const y2 = 50 + 46 * Math.sin(angFin);
          const grandeArco = fraccion > 0.5 ? 1 : 0;
          return (
            <path
              key={c.ingredienteId}
              d={`M50,50 L${x1},${y1} A46,46 0 ${grandeArco} 1 ${x2},${y2} Z`}
              fill={COLORES[c.rol] ?? '#ccc'}
            />
          );
        })}
      </svg>
      <ul className="text-sm space-y-1">
        {componentes.map((c) => (
          <li key={c.ingredienteId} className="flex items-center gap-2">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ background: COLORES[c.rol] ?? '#ccc' }}
            />
            <span className="font-medium">{c.nombre}</span>
            <span className="text-ink/60">{Math.round(c.gramos)} g</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
