import type { EstadoAsistente } from '../wizardTypes';
import { Tarjeta } from '../components/Tarjeta';
import { Boton } from '../components/Boton';
import { PasoIndicador } from '../components/PasoIndicador';

interface Props {
  estado: EstadoAsistente;
  actualizar: (cambios: Partial<EstadoAsistente>) => void;
  siguiente: () => void;
}

export function PasoMascota({ estado, actualizar, siguiente }: Props) {
  const puedeContinuar = estado.nombre.trim().length > 0 && Number(estado.pesoActual) > 0;

  return (
    <Tarjeta>
      <PasoIndicador paso={1} total={3} />
      <h2 className="text-2xl mb-1">Tu mascota</h2>
      <p className="text-ink/60 mb-5">Cuéntanos quién es, para calcular lo que necesita.</p>

      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Nombre</span>
          <input
            className="mt-1 w-full rounded-lg border border-pine-100 px-3 py-2"
            value={estado.nombre}
            onChange={(e) => actualizar({ nombre: e.target.value })}
            placeholder="Ej. Jackie"
          />
        </label>

        <div>
          <span className="text-sm font-medium">Especie</span>
          <div className="mt-1 flex gap-2">
            {(['perro', 'gato'] as const).map((especie) => (
              <button
                key={especie}
                onClick={() => actualizar({ especie })}
                className={`flex-1 rounded-lg border px-3 py-2 capitalize ${
                  estado.especie === especie
                    ? 'border-pine-600 bg-pine-50 text-pine-800'
                    : 'border-pine-100'
                }`}
              >
                {especie}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="text-sm font-medium">Peso actual (kg)</span>
          <input
            type="number"
            min="0"
            step="0.1"
            className="mt-1 w-full rounded-lg border border-pine-100 px-3 py-2"
            value={estado.pesoActual}
            onChange={(e) => actualizar({ pesoActual: e.target.value })}
            placeholder="Ej. 12.5"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Etapa de vida</span>
          <select
            className="mt-1 w-full rounded-lg border border-pine-100 px-3 py-2"
            value={estado.etapaVida}
            onChange={(e) => actualizar({ etapaVida: e.target.value as EstadoAsistente['etapaVida'] })}
          >
            <option value="cachorro_0_4">Cachorro (0–4 meses)</option>
            <option value="cachorro_4_12">Cachorro (4–12 meses)</option>
            <option value="adulto">Adulto</option>
            <option value="senior">Senior</option>
          </select>
        </label>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">¿Está castrado/a?</span>
          <button
            onClick={() => actualizar({ castrado: !estado.castrado })}
            className={`rounded-full px-4 py-1.5 text-sm ${
              estado.castrado ? 'bg-pine-600 text-white' : 'bg-pine-50 text-pine-800'
            }`}
          >
            {estado.castrado ? 'Sí' : 'No'}
          </button>
        </div>

        <label className="block">
          <span className="text-sm font-medium">Nivel de actividad</span>
          <select
            className="mt-1 w-full rounded-lg border border-pine-100 px-3 py-2"
            value={estado.actividad}
            onChange={(e) => actualizar({ actividad: e.target.value as EstadoAsistente['actividad'] })}
          >
            <option value="normal">Normal</option>
            <option value="muy_activo">Muy activo / trabajo</option>
          </select>
        </label>
      </div>

      <div className="mt-6 flex justify-end">
        <Boton onClick={siguiente} disabled={!puedeContinuar}>
          Continuar
        </Boton>
      </div>
    </Tarjeta>
  );
}
