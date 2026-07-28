import { useMemo, useState } from 'react';
import type { EstadoAsistente } from '../wizardTypes';
import type { BanderaSalud } from '../../engine/tipos';
import type { Tamano } from '../edad';
import { formatearEdad } from '../edad';
import { PantallaPregunta } from '../components/PantallaPregunta';
import { RuedaPeso } from '../components/RuedaPeso';
import { SelectorContextura } from '../components/SelectorContextura';

interface Props {
  estado: EstadoAsistente;
  actualizar: (cambios: Partial<EstadoAsistente>) => void;
  onTerminar: () => void;
  onCancelar: () => void;
  esEdicion?: boolean;
}

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

export function Wizard({ estado, actualizar, onTerminar, onCancelar, esEdicion = false }: Props) {
  const pasos = useMemo(() => {
    const base = ['especie', 'nombre', 'edad', 'tamano', 'castrado', 'actividad', 'peso', 'contextura'];
    if (estado.condicionCorporal === 'sobrepeso') base.push('pesoObjetivo');
    base.push('banderas', 'cocinar');
    return base;
  }, [estado.condicionCorporal]);

  const [indice, setIndice] = useState(0);
  const paso = pasos[indice];
  const total = pasos.length;

  function siguiente() {
    if (indice < pasos.length - 1) setIndice(indice + 1);
    else onTerminar();
  }
  function atras() {
    if (indice === 0) onCancelar();
    else setIndice(indice - 1);
  }

  const pesoMax = estado.especie === 'perro' ? 90 : 15;
  const hayBanderaRoja = BANDERAS.some((b) => b.nivel === 'rojo' && estado.banderasSalud.includes(b.valor));

  switch (paso) {
    case 'especie':
      return (
        <PantallaPregunta
          paso={indice + 1}
          total={total}
          pregunta="¿Perro o gato?"
          onAtras={atras}
          onSiguiente={siguiente}
        >
          <div className="grid grid-cols-2 gap-3">
            {(['perro', 'gato'] as const).map((e) => (
              <button
                key={e}
                onClick={() => actualizar({ especie: e })}
                className={`rounded-2xl border py-10 text-lg capitalize ${
                  estado.especie === e ? 'border-pine-600 bg-pine-50 text-pine-800' : 'border-pine-100'
                }`}
              >
                {e === 'perro' ? '🐶' : '🐱'}
                <div className="mt-2">{e}</div>
              </button>
            ))}
          </div>
        </PantallaPregunta>
      );

    case 'nombre':
      return (
        <PantallaPregunta
          paso={indice + 1}
          total={total}
          pregunta="¿Cómo se llama?"
          onAtras={atras}
          onSiguiente={siguiente}
          puedeContinuar={estado.nombre.trim().length > 0}
        >
          <input
            autoFocus
            className="w-full rounded-xl border border-pine-100 px-4 py-3 text-xl"
            value={estado.nombre}
            onChange={(e) => actualizar({ nombre: e.target.value })}
            placeholder="Ej. Jackie"
          />
        </PantallaPregunta>
      );

    case 'edad':
      return (
        <PantallaPregunta
          paso={indice + 1}
          total={total}
          pregunta={`¿Qué edad tiene ${estado.nombre || 'tu mascota'}?`}
          ayuda="Nos ayuda a calcular cuánta energía necesita."
          onAtras={atras}
          onSiguiente={siguiente}
        >
          <div className="text-center mb-4">
            <span className="text-4xl font-display text-pine-800">{formatearEdad(estado.edadValor, estado.edadUnidad)}</span>
          </div>
          <input
            type="range"
            min={estado.edadUnidad === 'meses' ? 1 : 1}
            max={estado.edadUnidad === 'meses' ? 11 : 20}
            value={estado.edadValor}
            onChange={(e) => actualizar({ edadValor: Number(e.target.value) })}
            className="w-full accent-pine-600"
          />
          <div className="flex justify-center gap-2 mt-4">
            {(['meses', 'anios'] as const).map((u) => (
              <button
                key={u}
                onClick={() => actualizar({ edadUnidad: u, edadValor: u === 'meses' ? 6 : 2 })}
                className={`rounded-full px-4 py-1.5 text-sm ${
                  estado.edadUnidad === u ? 'bg-pine-600 text-white' : 'bg-pine-50 text-pine-800'
                }`}
              >
                {u === 'meses' ? 'Meses' : 'Años'}
              </button>
            ))}
          </div>
        </PantallaPregunta>
      );

    case 'tamano':
      return (
        <PantallaPregunta
          paso={indice + 1}
          total={total}
          pregunta="¿De qué tamaño es (o será de adulto)?"
          onAtras={atras}
          onSiguiente={siguiente}
        >
          <div className="space-y-3">
            {(
              [
                ['pequeno', 'Pequeño', 'Hasta ~10 kg de adulto'],
                ['mediano', 'Mediano', '~10 a 25 kg de adulto'],
                ['grande', 'Grande', 'Más de 25 kg de adulto'],
              ] as [Tamano, string, string][]
            ).map(([valor, titulo, sub]) => (
              <button
                key={valor}
                onClick={() => actualizar({ tamano: valor })}
                className={`w-full text-left rounded-xl border px-4 py-3 ${
                  estado.tamano === valor ? 'border-pine-600 bg-pine-50' : 'border-pine-100'
                }`}
              >
                <p className="font-medium">{titulo}</p>
                <p className="text-sm text-ink/60">{sub}</p>
              </button>
            ))}
          </div>
        </PantallaPregunta>
      );

    case 'castrado':
      return (
        <PantallaPregunta
          paso={indice + 1}
          total={total}
          pregunta={`¿${estado.nombre || 'Tu mascota'} está castrado/a?`}
          onAtras={atras}
          onSiguiente={siguiente}
        >
          <div className="grid grid-cols-2 gap-3">
            {[
              [true, 'Sí'],
              [false, 'No'],
            ].map(([valor, etiqueta]) => (
              <button
                key={String(valor)}
                onClick={() => actualizar({ castrado: valor as boolean })}
                className={`rounded-2xl border py-8 text-lg ${
                  estado.castrado === valor ? 'border-pine-600 bg-pine-50 text-pine-800' : 'border-pine-100'
                }`}
              >
                {etiqueta as string}
              </button>
            ))}
          </div>
        </PantallaPregunta>
      );

    case 'actividad':
      return (
        <PantallaPregunta
          paso={indice + 1}
          total={total}
          pregunta="¿Qué tan activo/a es?"
          onAtras={atras}
          onSiguiente={siguiente}
        >
          <div className="space-y-3">
            {(
              [
                ['normal', 'Normal', 'Paseos diarios, actividad típica de mascota de casa'],
                ['muy_activo', 'Muy activo', 'Ejercicio intenso, trabajo o deporte frecuente'],
              ] as const
            ).map(([valor, titulo, sub]) => (
              <button
                key={valor}
                onClick={() => actualizar({ actividad: valor })}
                className={`w-full text-left rounded-xl border px-4 py-3 ${
                  estado.actividad === valor ? 'border-pine-600 bg-pine-50' : 'border-pine-100'
                }`}
              >
                <p className="font-medium">{titulo}</p>
                <p className="text-sm text-ink/60">{sub}</p>
              </button>
            ))}
          </div>
        </PantallaPregunta>
      );

    case 'peso':
      return (
        <PantallaPregunta
          paso={indice + 1}
          total={total}
          pregunta={`¿Cuánto pesa ${estado.nombre || 'hoy'}?`}
          onAtras={atras}
          onSiguiente={siguiente}
        >
          <RuedaPeso
            valor={estado.pesoActual}
            onChange={(v) => actualizar({ pesoActual: v })}
            min={1}
            max={pesoMax}
            paso={estado.especie === 'perro' ? 0.5 : 0.1}
          />
        </PantallaPregunta>
      );

    case 'contextura':
      return (
        <PantallaPregunta
          paso={indice + 1}
          total={total}
          pregunta="¿Cómo se ve su contextura?"
          ayuda="Pasa la mano por sus costillas para decidir."
          onAtras={atras}
          onSiguiente={siguiente}
        >
          <SelectorContextura
            valor={estado.condicionCorporal}
            onChange={(v) => actualizar({ condicionCorporal: v })}
          />
        </PantallaPregunta>
      );

    case 'pesoObjetivo':
      return (
        <PantallaPregunta
          paso={indice + 1}
          total={total}
          pregunta="¿Tienes un peso objetivo en mente?"
          ayuda="Si no lo sabes, lo estimamos nosotros de forma segura."
          onAtras={atras}
          onSiguiente={siguiente}
        >
          <input
            type="number"
            min={0}
            step={0.1}
            className="w-full rounded-xl border border-pine-100 px-4 py-3 text-xl text-center"
            value={estado.pesoObjetivo}
            onChange={(e) => actualizar({ pesoObjetivo: e.target.value })}
            placeholder={`Ej. ${(estado.pesoActual * 0.85).toFixed(1)} kg`}
          />
        </PantallaPregunta>
      );

    case 'banderas':
      return (
        <PantallaPregunta
          paso={indice + 1}
          total={total}
          pregunta="¿Alguna de estas condiciones?"
          ayuda="Marca todas las que apliquen. Si no aplica ninguna, solo continúa."
          onAtras={atras}
          onSiguiente={siguiente}
        >
          <div className="space-y-2">
            {BANDERAS.map((b) => (
              <label
                key={b.valor}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
                  estado.banderasSalud.includes(b.valor) ? 'border-pine-600 bg-pine-50' : 'border-pine-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={estado.banderasSalud.includes(b.valor)}
                  onChange={() => actualizar({ banderasSalud: alternarBandera(estado.banderasSalud, b.valor) })}
                />
                {b.etiqueta}
              </label>
            ))}
            {hayBanderaRoja && (
              <div className="rounded-lg bg-risk-red/10 border border-risk-red/30 px-3 py-2 text-sm text-risk-red">
                Con esta condición, te vamos a recomendar hablar primero con tu veterinario.
              </div>
            )}
          </div>
        </PantallaPregunta>
      );

    case 'cocinar':
      return (
        <PantallaPregunta
          paso={indice + 1}
          total={total}
          pregunta="¿Estás dispuesto/a a cocinarle?"
          ayuda="Si prefieres solo balanceado, también te damos el mejor plan."
          onAtras={atras}
          onSiguiente={siguiente}
          textoBoton={esEdicion ? 'Guardar cambios' : 'Ver mi plan'}
        >
          <div className="grid grid-cols-2 gap-3">
            {[
              [true, 'Sí'],
              [false, 'No'],
            ].map(([valor, etiqueta]) => (
              <button
                key={String(valor)}
                onClick={() => actualizar({ disposicionACocinar: valor as boolean })}
                className={`rounded-2xl border py-8 text-lg ${
                  estado.disposicionACocinar === valor ? 'border-pine-600 bg-pine-50 text-pine-800' : 'border-pine-100'
                }`}
              >
                {etiqueta as string}
              </button>
            ))}
          </div>
        </PantallaPregunta>
      );

    default:
      return null;
  }
}
