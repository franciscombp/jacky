import { useMemo, useState } from 'react';
import { estadoInicial, type EstadoAsistente } from './ui/wizardTypes';
import { decidirEstrategia, type ResultadoDecision } from './engine/decision';
import { calcularEnergiaDiaria } from './engine/energia';
import { calcularCostosComercialTodosNiveles } from './engine/costos';
import { calcularEtapaVida, edadEnMeses } from './ui/edad';
import type { BanderaSalud, Ruta } from './engine/tipos';
import type { NivelPresupuesto } from './storage/db';
import { Inicio } from './ui/screens/Inicio';
import { Wizard } from './ui/screens/Wizard';
import { Resultado } from './ui/screens/Resultado';
import { Seguimiento } from './ui/screens/Seguimiento';
import { Recordatorios } from './ui/screens/Recordatorios';
import { EncabezadoMascota } from './ui/components/EncabezadoMascota';
import { BarraNavegacion } from './ui/components/BarraNavegacion';
import { db, guardarPerfil, obtenerPerfil, guardarPlan } from './storage/db';

type Pantalla = 'inicio' | 'wizard' | 'resultado' | 'seguimiento' | 'recordatorios';
const PANTALLAS_CON_MASCOTA: Pantalla[] = ['resultado', 'seguimiento', 'recordatorios'];

function calcularPresupuestoMensual(costos: { ultra: number; media: number; premium: number }, nivel: NivelPresupuesto) {
  if (nivel === 'ahorro') return costos.ultra * 1.05;
  if (nivel === 'amplio') return costos.premium * 1.5;
  return costos.media * 1.05;
}

function calcularResultado(estado: EstadoAsistente): ResultadoDecision {
  const etapaVida = calcularEtapaVida(estado.especie, edadEnMeses(estado.edadValor, estado.edadUnidad), estado.tamano);
  const energia = calcularEnergiaDiaria(
    estado.especie,
    estado.pesoActual,
    etapaVida,
    estado.castrado,
    estado.actividad,
    estado.condicionCorporal,
    estado.pesoObjetivo ? Number(estado.pesoObjetivo) : undefined
  );
  const costos = calcularCostosComercialTodosNiveles(energia.energiaDiaria);
  const presupuestoMensual = calcularPresupuestoMensual(costos, estado.presupuestoNivel);

  // Banderas implícitas por especie/etapa de vida (sección 8): el usuario no las marca,
  // se derivan del perfil para que gato/cachorro/senior activen el nivel amarillo.
  const banderasImplicitas: BanderaSalud[] = [];
  if (estado.especie === 'gato') banderasImplicitas.push('gato');
  if (etapaVida === 'cachorro_0_4') banderasImplicitas.push('cachorro_0_4');
  if (etapaVida === 'cachorro_4_12') banderasImplicitas.push('cachorro_4_12');
  if (etapaVida === 'senior') banderasImplicitas.push('senior');

  return decidirEstrategia({
    especie: estado.especie,
    pesoActual: estado.pesoActual,
    etapaVida,
    castrado: estado.castrado,
    actividad: estado.actividad,
    condicionCorporal: estado.condicionCorporal,
    pesoObjetivo: estado.pesoObjetivo ? Number(estado.pesoObjetivo) : undefined,
    banderasSalud: [...estado.banderasSalud, ...banderasImplicitas],
    presupuestoMensual,
    ingredientesPropios: estado.ingredientesPropios,
    disposicionACocinar: estado.disposicionACocinar,
  });
}

function App() {
  const [pantalla, setPantalla] = useState<Pantalla>('inicio');
  const [estado, setEstado] = useState<EstadoAsistente>(estadoInicial);
  const [petId, setPetId] = useState<number | null>(null);
  const [esEdicion, setEsEdicion] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const resultado = useMemo(() => calcularResultado(estado), [estado]);

  function actualizar(cambios: Partial<EstadoAsistente>) {
    setEstado((prev) => ({ ...prev, ...cambios }));
    setGuardado(false);
  }

  function irAAgregar() {
    setEstado(estadoInicial);
    setPetId(null);
    setEsEdicion(false);
    setGuardado(false);
    setPantalla('wizard');
  }

  async function irAAbrir(id: number) {
    const pet = await db.pets.get(id);
    const perfil = await obtenerPerfil(id);
    if (!pet || !perfil) return;
    setEstado({
      nombre: pet.nombre,
      especie: pet.especie,
      edadValor: perfil.edadValor,
      edadUnidad: perfil.edadUnidad,
      tamano: perfil.tamano,
      pesoActual: perfil.pesoActual,
      castrado: perfil.castrado,
      actividad: perfil.actividad,
      condicionCorporal: perfil.condicionCorporal,
      pesoObjetivo: perfil.pesoObjetivo ? String(perfil.pesoObjetivo) : '',
      banderasSalud: perfil.banderasSalud,
      ingredientesPropios: perfil.ingredientesPropios,
      disposicionACocinar: perfil.disposicionACocinar,
      presupuestoNivel: perfil.presupuestoNivel,
      planElegido: perfil.planElegido,
    });
    setPetId(id);
    setEsEdicion(true);
    setGuardado(true);
    setPantalla('resultado');
  }

  async function guardar() {
    let id = petId;
    if (id === null) {
      id = await db.pets.add({ nombre: estado.nombre, especie: estado.especie, creadoEn: new Date().toISOString() });
      await db.weightLogs.add({ petId: id, fecha: new Date().toISOString().slice(0, 10), pesoKg: estado.pesoActual });
      setPetId(id);
    } else {
      await db.pets.update(id, { nombre: estado.nombre, especie: estado.especie });
    }

    await guardarPerfil(id, {
      edadValor: estado.edadValor,
      edadUnidad: estado.edadUnidad,
      tamano: estado.tamano,
      castrado: estado.castrado,
      pesoActual: estado.pesoActual,
      pesoObjetivo: estado.pesoObjetivo ? Number(estado.pesoObjetivo) : undefined,
      condicionCorporal: estado.condicionCorporal,
      actividad: estado.actividad,
      banderasSalud: estado.banderasSalud,
      ingredientesPropios: estado.ingredientesPropios,
      disposicionACocinar: estado.disposicionACocinar,
      presupuestoNivel: estado.presupuestoNivel,
      planElegido: estado.planElegido,
    });

    const rutaFinal = estado.planElegido ?? resultado.rutaRecomendada;
    const altFinal = resultado.alternativas.find((a) => a.ruta === rutaFinal);
    await guardarPlan(id, {
      ruta: rutaFinal,
      nivelComercial: altFinal?.nivelComercial,
      energiaDiaria: resultado.energia.energiaDiaria,
      gramosPorDia: resultado.gramosPorDiaCasera,
      costoMensual: altFinal?.costoMensual ?? 0,
      generadoEn: new Date().toISOString(),
    });

    setGuardado(true);
  }

  async function terminarWizard() {
    setPantalla('resultado');
    if (esEdicion) {
      await guardar();
    } else {
      setGuardado(false);
    }
  }

  function cancelarWizard() {
    setPantalla(esEdicion ? 'resultado' : 'inicio');
  }

  function editar() {
    setEsEdicion(true);
    setPantalla('wizard');
  }

  function recalcularConNuevoPeso(nuevoPesoKg: number) {
    actualizar({ pesoActual: nuevoPesoKg });
  }

  function irAInicio() {
    setPantalla('inicio');
  }

  const muestraMascota = petId !== null && PANTALLAS_CON_MASCOTA.includes(pantalla);

  return (
    <div className="min-h-dvh max-w-md mx-auto px-4 flex flex-col" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
      {pantalla === 'inicio' && (
        <header className="mb-6 text-center shrink-0">
          <h1 className="text-3xl text-pine-900">Jacky</h1>
          <p className="text-sm text-ink/60">Nutrición y salud casera accesible para tu mascota</p>
        </header>
      )}

      {muestraMascota && <EncabezadoMascota nombre={estado.nombre} especie={estado.especie} onVolver={irAInicio} />}

      <div className={muestraMascota ? 'flex-1 pb-24' : 'flex-1'} style={muestraMascota ? undefined : { paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        {pantalla === 'inicio' && <Inicio onAgregar={irAAgregar} onAbrir={irAAbrir} />}

        {pantalla === 'wizard' && (
          <Wizard
            estado={estado}
            actualizar={actualizar}
            onTerminar={terminarWizard}
            onCancelar={cancelarWizard}
            esEdicion={esEdicion}
          />
        )}

        {pantalla === 'resultado' && (
          <Resultado
            nombreMascota={estado.nombre}
            resultado={resultado}
            ingredientesPropios={estado.ingredientesPropios}
            presupuestoNivel={estado.presupuestoNivel}
            onCambiarNivel={(n) => actualizar({ presupuestoNivel: n })}
            planElegido={estado.planElegido}
            onElegirPlan={(r: Ruta) => actualizar({ planElegido: r })}
            onGuardar={guardar}
            onEditar={editar}
            guardado={guardado}
          />
        )}

        {pantalla === 'seguimiento' && petId !== null && (
          <Seguimiento
            petId={petId}
            pesoObjetivo={estado.pesoObjetivo ? Number(estado.pesoObjetivo) : undefined}
            onRecalcular={recalcularConNuevoPeso}
          />
        )}

        {pantalla === 'recordatorios' && petId !== null && <Recordatorios petId={petId} />}
      </div>

      {muestraMascota && petId !== null && (
        <BarraNavegacion
          petId={petId}
          activa={pantalla as 'resultado' | 'seguimiento' | 'recordatorios'}
          onCambiar={setPantalla}
        />
      )}
    </div>
  );
}

export default App;
