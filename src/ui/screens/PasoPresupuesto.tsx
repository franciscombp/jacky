import type { EstadoAsistente } from '../wizardTypes';
import { Tarjeta } from '../components/Tarjeta';
import { Boton } from '../components/Boton';
import { PasoIndicador } from '../components/PasoIndicador';

interface Props {
  estado: EstadoAsistente;
  actualizar: (cambios: Partial<EstadoAsistente>) => void;
  verResultado: () => void;
  atras: () => void;
}

export function PasoPresupuesto({ estado, actualizar, verResultado, atras }: Props) {
  const puedeVerResultado = Number(estado.presupuestoMensual) > 0;

  return (
    <Tarjeta>
      <PasoIndicador paso={3} total={3} />
      <h2 className="text-2xl mb-1">Tu presupuesto</h2>
      <p className="text-ink/60 mb-5">
        Partimos de lo que realmente puedes gastar, nunca al revés.
      </p>

      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium">¿Cuánto puedes gastar en comida al mes? (USD)</span>
          <input
            type="number"
            min="0"
            step="1"
            className="mt-1 w-full rounded-lg border border-pine-100 px-3 py-2"
            value={estado.presupuestoMensual}
            onChange={(e) => actualizar({ presupuestoMensual: e.target.value })}
            placeholder="Ej. 25"
          />
        </label>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">¿Estás dispuesto/a a cocinarle?</span>
          <button
            onClick={() => actualizar({ disposicionACocinar: !estado.disposicionACocinar })}
            className={`rounded-full px-4 py-1.5 text-sm ${
              estado.disposicionACocinar ? 'bg-pine-600 text-white' : 'bg-pine-50 text-pine-800'
            }`}
          >
            {estado.disposicionACocinar ? 'Sí' : 'No'}
          </button>
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <Boton variante="texto" onClick={atras}>
          Atrás
        </Boton>
        <Boton onClick={verResultado} disabled={!puedeVerResultado}>
          Ver mi plan
        </Boton>
      </div>
    </Tarjeta>
  );
}
