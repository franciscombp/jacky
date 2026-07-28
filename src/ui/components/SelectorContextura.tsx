import type { CondicionCorporal } from '../../engine/tipos';

const OPCIONES: { valor: CondicionCorporal; titulo: string; descripcion: string }[] = [
  {
    valor: 'bajo_peso',
    titulo: 'Bajo peso',
    descripcion: 'Se le notan las costillas y la columna a simple vista, sin apenas tocar.',
  },
  {
    valor: 'normal',
    titulo: 'Peso normal',
    descripcion: 'Se sienten las costillas con una leve presión de la mano; se le nota cintura vista desde arriba.',
  },
  {
    valor: 'sobrepeso',
    titulo: 'Sobrepeso',
    descripcion: 'Cuesta sentir las costillas bajo una capa de grasa; no se le nota cintura.',
  },
];

interface Props {
  valor: CondicionCorporal;
  onChange: (v: CondicionCorporal) => void;
}

export function SelectorContextura({ valor, onChange }: Props) {
  return (
    <div className="space-y-3">
      {OPCIONES.map((op) => (
        <button
          key={op.valor}
          onClick={() => onChange(op.valor)}
          className={`w-full text-left rounded-xl border px-4 py-3 transition-colors ${
            valor === op.valor ? 'border-pine-600 bg-pine-50' : 'border-pine-100'
          }`}
        >
          <p className="font-medium">{op.titulo}</p>
          <p className="text-sm text-ink/60 mt-0.5">{op.descripcion}</p>
        </button>
      ))}
    </div>
  );
}
