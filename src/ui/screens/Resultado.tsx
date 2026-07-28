import type { ResultadoDecision, AlternativaRuta } from '../../engine/decision';
import type { Ruta } from '../../engine/tipos';
import type { NivelPresupuesto } from '../../storage/db';
import { construirReceta } from '../../engine/receta';
import { Tarjeta } from '../components/Tarjeta';
import { Boton } from '../components/Boton';
import { Plato } from '../components/Plato';
import datosEc from '../../engine/datos.ec.json';

const NOMBRES_RUTA: Record<string, string> = {
  A: 'Balanceado comercial completo',
  B: 'Balanceado + topper fresco',
  C: 'Casera completa',
  D: 'Necesita a tu veterinario primero',
};

const COLOR_RIESGO: Record<string, string> = {
  verde: 'bg-risk-green/10 text-risk-green border-risk-green/30',
  amarillo: 'bg-risk-yellow/10 text-risk-yellow border-risk-yellow/30',
  rojo: 'bg-risk-red/10 text-risk-red border-risk-red/30',
};

const NIVELES_PRESUPUESTO: { valor: NivelPresupuesto; etiqueta: string }[] = [
  { valor: 'ahorro', etiqueta: 'Gastar menos' },
  { valor: 'equilibrado', etiqueta: 'Equilibrado' },
  { valor: 'amplio', etiqueta: 'Gastar más' },
];

interface Props {
  nombreMascota: string;
  resultado: ResultadoDecision;
  ingredientesPropios: string[];
  presupuestoNivel: NivelPresupuesto;
  onCambiarNivel: (n: NivelPresupuesto) => void;
  planElegido?: Ruta;
  onElegirPlan: (r: Ruta) => void;
  onGuardar: () => void;
  onEditar: () => void;
  guardado: boolean;
}

export function Resultado({
  nombreMascota,
  resultado,
  ingredientesPropios,
  presupuestoNivel,
  onCambiarNivel,
  planElegido,
  onElegirPlan,
  onGuardar,
  onEditar,
  guardado,
}: Props) {
  const { nivelRiesgo, energia, rutaRecomendada, alternativas, notasSeguridad, gramosPorDiaCasera } = resultado;

  if (rutaRecomendada === 'D') {
    return (
      <div className="space-y-4">
        <Tarjeta className={`border ${COLOR_RIESGO.rojo}`}>
          <p className="text-xs uppercase tracking-wide font-medium">Nivel rojo · alto</p>
          <h2 className="text-2xl mt-1">{nombreMascota || 'Tu mascota'} necesita a tu veterinario primero</h2>
        </Tarjeta>
        <Tarjeta>
          <p className="mb-3">
            Este caso necesita que un veterinario formule la dieta. No te damos una receta genérica porque el margen de
            error en esta condición es demasiado estrecho para improvisar.
          </p>
          <p className="text-sm text-ink/70 mb-1">Para llevar a la consulta:</p>
          <ul className="text-sm list-disc pl-5 space-y-0.5">
            <li>Energía diaria estimada: {Math.round(energia.energiaDiaria)} kcal/día</li>
            <li>Peso: {energia.pesoUsado} kg</li>
          </ul>
        </Tarjeta>
        <div className="flex gap-3 pb-6">
          <Boton variante="secundario" onClick={onEditar}>
            Editar datos
          </Boton>
        </div>
      </div>
    );
  }

  const rutaMostrada: Ruta = planElegido ?? rutaRecomendada;
  const altMostrada: AlternativaRuta | undefined = alternativas.find((a) => a.ruta === rutaMostrada);
  const receta = rutaMostrada === 'C' ? construirReceta(gramosPorDiaCasera, ingredientesPropios) : undefined;

  return (
    <div className="space-y-4">
      <Tarjeta className={`border ${COLOR_RIESGO[nivelRiesgo]}`}>
        <p className="text-xs uppercase tracking-wide font-medium">
          Nivel {nivelRiesgo === 'verde' ? 'verde · adelante' : 'amarillo · con cuidado'}
        </p>
        <h2 className="text-2xl mt-1">
          El plan de {nombreMascota || 'tu mascota'}: {NOMBRES_RUTA[rutaMostrada]}
        </h2>
        {planElegido && planElegido !== rutaRecomendada && (
          <p className="text-xs text-ink/60 mt-1">
            Elegiste esta opción tú. Recomendamos {NOMBRES_RUTA[rutaRecomendada]}.
          </p>
        )}
      </Tarjeta>

      <Tarjeta>
        <h3 className="text-sm font-medium mb-2">¿Cuánto quieres gastar?</h3>
        <div className="flex gap-2">
          {NIVELES_PRESUPUESTO.map((n) => (
            <button
              key={n.valor}
              onClick={() => onCambiarNivel(n.valor)}
              className={`flex-1 rounded-lg border px-2 py-2 text-sm ${
                presupuestoNivel === n.valor ? 'border-pine-600 bg-pine-50 text-pine-800' : 'border-pine-100'
              }`}
            >
              {n.etiqueta}
            </button>
          ))}
        </div>
      </Tarjeta>

      <Tarjeta>
        <h3 className="text-lg mb-2">Cuánto darle</h3>
        <p className="text-3xl font-display text-pine-800">{Math.round(energia.energiaDiaria)} kcal/día</p>
        <p className="text-sm text-ink/60 mt-1">
          Repartido en 2 comidas. Reajusta la porción cada 1–2 semanas según cómo evolucione el peso.
        </p>
      </Tarjeta>

      {receta && (
        <Tarjeta>
          <h3 className="text-lg mb-3">La receta de hoy</h3>
          <Plato componentes={receta.componentes} />
          <div className="mt-4 space-y-2">
            <div className="rounded-lg bg-honey-50 border border-honey-200 px-3 py-2 text-sm">
              <span className="font-semibold">Clave — Calcio:</span> {receta.calcio.fuente} ({receta.calcio.dosis})
            </div>
            <div className="rounded-lg bg-honey-50 border border-honey-200 px-3 py-2 text-sm">
              <span className="font-semibold">Clave — Suplemento:</span> {receta.suplemento.dosis}
            </div>
          </div>
        </Tarjeta>
      )}

      {(rutaMostrada === 'A' || rutaMostrada === 'B') && altMostrada?.nivelComercial && (
        <Tarjeta>
          <h3 className="text-lg mb-2">Qué comprar</h3>
          <p className="text-sm mb-2">
            Nivel sugerido: <span className="font-medium capitalize">{altMostrada.nivelComercial}</span> (
            {datosEc.niveles_comercial[altMostrada.nivelComercial].marcas.join(', ')})
          </p>
          <p className="text-sm font-medium mb-1">Antes de comprar, revisa la etiqueta:</p>
          <ul className="text-sm list-disc pl-5 space-y-0.5 text-ink/80">
            <li>¿Dice "completo y balanceado" (AAFCO o equivalente)?</li>
            <li>¿Para qué etapa de vida es?</li>
            <li>¿Se determinó por formulación o por prueba de alimentación?</li>
          </ul>
        </Tarjeta>
      )}

      <Tarjeta>
        <h3 className="text-lg mb-1">Comparación de costo mensual</h3>
        <p className="text-xs text-ink/50 mb-3">Toca una opción para elegirla como tu plan.</p>
        <ul className="space-y-2">
          {alternativas.map((alt) => (
            <li key={alt.ruta}>
              <button
                onClick={() => onElegirPlan(alt.ruta)}
                className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-left border ${
                  alt.ruta === rutaMostrada ? 'bg-pine-50 border-pine-300' : 'border-transparent hover:bg-pine-50/50'
                }`}
              >
                <span className="text-sm">
                  {alt.descripcion}
                  {alt.ruta === rutaRecomendada && (
                    <span className="ml-2 text-xs text-pine-600 font-medium">Recomendado</span>
                  )}
                </span>
                <span className="font-medium">${alt.costoMensual.toFixed(2)}</span>
              </button>
            </li>
          ))}
        </ul>
      </Tarjeta>

      {notasSeguridad.length > 0 && (
        <Tarjeta className="bg-pine-50/50">
          <h3 className="text-sm font-medium mb-2">Notas de seguridad</h3>
          <ul className="text-sm list-disc pl-5 space-y-1 text-ink/80">
            {notasSeguridad.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </Tarjeta>
      )}

      <p className="text-xs text-ink/50 px-1">
        Jacky es una herramienta educativa y de orientación, no un servicio veterinario. No diagnostica ni trata
        enfermedades. La responsabilidad final de la salud de tu mascota es tuya y de tu veterinario.
      </p>

      <div className="flex gap-3 pb-6">
        <Boton onClick={onGuardar} disabled={guardado}>
          {guardado ? 'Guardado' : 'Guardar cambios'}
        </Boton>
        <Boton variante="secundario" onClick={onEditar}>
          Editar datos
        </Boton>
      </div>
    </div>
  );
}
