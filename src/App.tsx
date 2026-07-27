import { useState } from 'react';
import { estadoInicial, type EstadoAsistente } from './ui/wizardTypes';
import { decidirEstrategia, type ResultadoDecision } from './engine/decision';
import { PasoMascota } from './ui/screens/PasoMascota';
import { PasoSalud } from './ui/screens/PasoSalud';
import { PasoPresupuesto } from './ui/screens/PasoPresupuesto';
import { Resultado } from './ui/screens/Resultado';
import { Seguimiento } from './ui/screens/Seguimiento';
import { db } from './storage/db';

type Pantalla = 'mascota' | 'salud' | 'presupuesto' | 'resultado' | 'seguimiento';

function App() {
  const [pantalla, setPantalla] = useState<Pantalla>('mascota');
  const [estado, setEstado] = useState<EstadoAsistente>(estadoInicial);
  const [resultado, setResultado] = useState<ResultadoDecision | null>(null);
  const [petId, setPetId] = useState<number | null>(null);
  const [guardado, setGuardado] = useState(false);

  function actualizar(cambios: Partial<EstadoAsistente>) {
    setEstado((prev) => ({ ...prev, ...cambios }));
  }

  function verResultado() {
    const decision = decidirEstrategia({
      especie: estado.especie,
      pesoActual: Number(estado.pesoActual),
      etapaVida: estado.etapaVida,
      castrado: estado.castrado,
      actividad: estado.actividad,
      condicionCorporal: estado.condicionCorporal,
      pesoObjetivo: estado.pesoObjetivo ? Number(estado.pesoObjetivo) : undefined,
      banderasSalud: estado.banderasSalud,
      presupuestoMensual: Number(estado.presupuestoMensual),
      ingredientesPropios: estado.ingredientesPropios,
      disposicionACocinar: estado.disposicionACocinar,
    });
    setResultado(decision);
    setGuardado(false);
    setPantalla('resultado');
  }

  async function guardar() {
    if (!resultado) return;
    const id = await db.pets.add({
      nombre: estado.nombre,
      especie: estado.especie,
      etapaVida: estado.etapaVida,
      castrado: estado.castrado,
    });
    await db.healthProfiles.add({
      petId: id,
      pesoActual: Number(estado.pesoActual),
      pesoObjetivo: estado.pesoObjetivo ? Number(estado.pesoObjetivo) : undefined,
      condicionCorporal: estado.condicionCorporal,
      actividad: estado.actividad,
      banderasSalud: estado.banderasSalud,
      presupuestoMensual: Number(estado.presupuestoMensual),
      ingredientesPropios: estado.ingredientesPropios,
      disposicionACocinar: estado.disposicionACocinar,
    });
    await db.weightLogs.add({
      petId: id,
      fecha: new Date().toISOString().slice(0, 10),
      pesoKg: Number(estado.pesoActual),
    });
    await db.feedingPlans.add({
      petId: id,
      ruta: resultado.rutaRecomendada,
      nivelComercial: resultado.nivelComercialRecomendado,
      energiaDiaria: resultado.energia.energiaDiaria,
      gramosPorDia: resultado.gramosPorDiaCasera,
      costoMensual: resultado.alternativas.find((a) => a.ruta === resultado.rutaRecomendada)?.costoMensual ?? 0,
      generadoEn: new Date().toISOString(),
    });
    setPetId(id);
    setGuardado(true);
  }

  function empezarDeNuevo() {
    setEstado(estadoInicial);
    setResultado(null);
    setPetId(null);
    setGuardado(false);
    setPantalla('mascota');
  }

  function recalcularConNuevoPeso(nuevoPesoKg: number) {
    const decision = decidirEstrategia({
      especie: estado.especie,
      pesoActual: nuevoPesoKg,
      etapaVida: estado.etapaVida,
      castrado: estado.castrado,
      actividad: estado.actividad,
      condicionCorporal: estado.condicionCorporal,
      pesoObjetivo: estado.pesoObjetivo ? Number(estado.pesoObjetivo) : undefined,
      banderasSalud: estado.banderasSalud,
      presupuestoMensual: Number(estado.presupuestoMensual),
      ingredientesPropios: estado.ingredientesPropios,
      disposicionACocinar: estado.disposicionACocinar,
    });
    setEstado((prev) => ({ ...prev, pesoActual: String(nuevoPesoKg) }));
    setResultado(decision);
  }

  return (
    <div className="min-h-full max-w-md mx-auto px-4 py-8">
      <header className="mb-6 text-center">
        <h1 className="text-3xl text-pine-900">Jacky</h1>
        <p className="text-sm text-ink/60">Nutrición y salud casera accesible para tu mascota</p>
      </header>

      {pantalla === 'mascota' && (
        <PasoMascota estado={estado} actualizar={actualizar} siguiente={() => setPantalla('salud')} />
      )}
      {pantalla === 'salud' && (
        <PasoSalud
          estado={estado}
          actualizar={actualizar}
          siguiente={() => setPantalla('presupuesto')}
          atras={() => setPantalla('mascota')}
        />
      )}
      {pantalla === 'presupuesto' && (
        <PasoPresupuesto
          estado={estado}
          actualizar={actualizar}
          verResultado={verResultado}
          atras={() => setPantalla('salud')}
        />
      )}
      {pantalla === 'resultado' && resultado && (
        <>
          <Resultado
            nombreMascota={estado.nombre}
            resultado={resultado}
            onGuardar={guardar}
            onEmpezarDeNuevo={empezarDeNuevo}
            guardado={guardado}
          />
          {guardado && petId !== null && (
            <div className="text-center pb-6">
              <button
                className="text-sm text-pine-700 hover:underline"
                onClick={() => setPantalla('seguimiento')}
              >
                Ir al seguimiento de peso →
              </button>
            </div>
          )}
        </>
      )}
      {pantalla === 'seguimiento' && petId !== null && (
        <Seguimiento
          petId={petId}
          pesoObjetivo={estado.pesoObjetivo ? Number(estado.pesoObjetivo) : undefined}
          onRecalcular={recalcularConNuevoPeso}
          onVolver={() => setPantalla('resultado')}
        />
      )}
    </div>
  );
}

export default App;
