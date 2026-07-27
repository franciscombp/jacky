import type { EstadoAsistente } from '../wizardTypes';
import type { BanderaSalud, CondicionCorporal } from '../../engine/tipos';
import { Tarjeta } from '../components/Tarjeta';
import { Boton } from '../components/Boton';
import { PasoIndicador } from '../components/PasoIndicador';

interface Props {
  estado: EstadoAsistente;
  actualizar: (cambios: Partial<EstadoAsistente>) => void;
  siguiente: () => void;
  atras: () => void;
}

const OPCIONES_CONDICION: { valor: CondicionCorporal; etiqueta: string }[] = [
  { valor: 'bajo_peso', etiqueta: 'Bajo peso' },
  { valor: 'normal', etiqueta: 'En su peso' },
  { valor: 'sobrepeso', etiqueta: 'Sobrepeso' },
];

const BANDERAS: { valor: BanderaSalud; etiqueta: string; nivel: 'rojo' | 'amarillo' }[] = [
  { valor: 'renal', etiqueta: 'Enfermedad renal', nivel: 'rojo' },
  { valor: 'higado', etiqueta: 'Enfermedad hepática', nivel: 'rojo' },
  { valor: 'pancreas', etiqueta: 'Pancreatitis', nivel: 'rojo' },
  { valor: 'diabetes', etiqueta: 'Diabetes', nivel: 'rojo' },
  { valor: 'gestante', etiqueta: 'Gestante o lactando', nivel: 'rojo' },
  { valor: 'enfermo', etiqueta: 'Enfermo actualmente', nivel: 'rojo' },
  { valor: 'alergia', etiqueta: 'Alergia alimentaria conocida', nivel: 'amarillo' },
];

function alternarBandera(lista: BanderaSalud[], valor: BanderaSalud): BanderaSalud[] {
  return lista.includes(valor) ? lista.filter((b) => b !== valor) : [...lista, valor];
}

export function PasoSalud({ estado, actualizar, siguiente, atras }: Props) {
  const hayBanderaRoja = BANDERAS.some((b) => b.nivel === 'rojo' && estado.banderasSalud.includes(b.valor));

  return (
    <Tarjeta>
      <PasoIndicador paso={2} total={3} />
      <h2 className="text-2xl mb-1">Su salud</h2>
      <p className="text-ink/60 mb-5">Esto decide qué tan segura es cada opción para tu mascota.</p>

      <div className="space-y-5">
        <div>
          <span className="text-sm font-medium">Condición corporal</span>
          <div className="mt-1 flex gap-2">
            {OPCIONES_CONDICION.map((op) => (
              <button
                key={op.valor}
                onClick={() => actualizar({ condicionCorporal: op.valor })}
                className={`flex-1 rounded-lg border px-2 py-2 text-sm ${
                  estado.condicionCorporal === op.valor
                    ? 'border-pine-600 bg-pine-50 text-pine-800'
                    : 'border-pine-100'
                }`}
              >
                {op.etiqueta}
              </button>
            ))}
          </div>
        </div>

        {estado.condicionCorporal === 'sobrepeso' && (
          <label className="block">
            <span className="text-sm font-medium">Peso objetivo (kg), opcional</span>
            <input
              type="number"
              min="0"
              step="0.1"
              className="mt-1 w-full rounded-lg border border-pine-100 px-3 py-2"
              value={estado.pesoObjetivo}
              onChange={(e) => actualizar({ pesoObjetivo: e.target.value })}
              placeholder="Si no lo sabes, lo estimamos por ti"
            />
          </label>
        )}

        <div>
          <span className="text-sm font-medium">¿Alguna de estas condiciones?</span>
          <div className="mt-2 space-y-2">
            {BANDERAS.map((b) => (
              <label key={b.valor} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={estado.banderasSalud.includes(b.valor)}
                  onChange={() => actualizar({ banderasSalud: alternarBandera(estado.banderasSalud, b.valor) })}
                />
                {b.etiqueta}
              </label>
            ))}
          </div>
        </div>

        {hayBanderaRoja && (
          <div className="rounded-lg bg-risk-red/10 border border-risk-red/30 px-3 py-2 text-sm text-risk-red">
            Con esta condición, el siguiente paso será una recomendación para consultar a tu veterinario, no una receta genérica.
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-between">
        <Boton variante="texto" onClick={atras}>
          Atrás
        </Boton>
        <Boton onClick={siguiente}>Continuar</Boton>
      </div>
    </Tarjeta>
  );
}
