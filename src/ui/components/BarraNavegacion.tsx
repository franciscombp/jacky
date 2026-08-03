import { useEffect, useState } from 'react';
import { db } from '../../storage/db';

type Pestana = 'resultado' | 'seguimiento' | 'recordatorios';

interface Props {
  petId: number;
  activa: Pestana;
  onCambiar: (p: Pestana) => void;
}

function diasHasta(fecha: string): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.round((new Date(fecha).getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
}

const TABS: { valor: Pestana; etiqueta: string; icono: string }[] = [
  { valor: 'resultado', etiqueta: 'Plan', icono: '🍽️' },
  { valor: 'seguimiento', etiqueta: 'Peso', icono: '⚖️' },
  { valor: 'recordatorios', etiqueta: 'Salud', icono: '🩺' },
];

export function BarraNavegacion({ petId, activa, onCambiar }: Props) {
  const [vencidos, setVencidos] = useState(0);

  useEffect(() => {
    db.reminders
      .where('petId')
      .equals(petId)
      .toArray()
      .then((lista) => setVencidos(lista.filter((r) => diasHasta(r.fecha) < 0).length));
  }, [petId, activa]);

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-30 bg-paper/95 backdrop-blur-sm border-t border-pine-100 flex justify-center"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="max-w-md w-full grid grid-cols-3">
        {TABS.map((t) => (
          <button
            key={t.valor}
            onClick={() => onCambiar(t.valor)}
            className={`relative flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium ${
              activa === t.valor ? 'text-pine-700' : 'text-ink/40'
            }`}
          >
            <span className="text-xl leading-none">{t.icono}</span>
            {t.etiqueta}
            {t.valor === 'recordatorios' && vencidos > 0 && (
              <span className="absolute top-1 right-[calc(50%-20px)] w-2 h-2 rounded-full bg-risk-red" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
