import type { PerfilMascota, Ruta, NivelComercial, NivelRiesgo } from './tipos';
import { clasificarRiesgo } from './riesgo';
import { calcularEnergiaDiaria, type ResultadoEnergia } from './energia';
import { calcularGramosPorDia, DENSIDAD_CASERA_KCAL_G, DENSIDAD_COMERCIAL_KCAL_G } from './porciones';
import { calcularCostoCaseraMensual, calcularCostosComercialTodosNiveles } from './costos';
import { construirReceta, type RecetaCasera } from './receta';
import datosEc from './datos.ec.json';

export interface AlternativaRuta {
  ruta: Ruta;
  nivelComercial?: NivelComercial;
  costoMensual: number;
  descripcion: string;
}

export interface ResultadoDecision {
  nivelRiesgo: NivelRiesgo;
  energia: ResultadoEnergia;
  gramosPorDiaCasera: number;
  gramosPorDiaComercial: number;
  rutaRecomendada: Ruta;
  nivelComercialRecomendado?: NivelComercial;
  receta?: RecetaCasera;
  alternativas: AlternativaRuta[];
  notasSeguridad: string[];
  requiereVeterinario: boolean;
}

const ORDEN_NIVELES: NivelComercial[] = ['ultra', 'media', 'premium', 'prescripcion'];

function nivelComercialQueEntraEnPresupuesto(
  costosPorNivel: Record<NivelComercial, number>,
  presupuestoMensual: number
): NivelComercial {
  let mejor: NivelComercial = 'ultra';
  for (const nivel of ORDEN_NIVELES) {
    if (nivel === 'prescripcion') continue;
    if (costosPorNivel[nivel] <= presupuestoMensual) {
      mejor = nivel;
    }
  }
  return mejor;
}

function esPerroGrande(perfil: PerfilMascota): boolean {
  return perfil.especie === 'perro' && perfil.pesoActual >= 20;
}

export function decidirEstrategia(perfil: PerfilMascota): ResultadoDecision {
  const notasSeguridad: string[] = [];

  // 1. Clasificar riesgo
  const nivelRiesgo = clasificarRiesgo(perfil.banderasSalud, perfil.condicionCorporal);

  if (nivelRiesgo === 'rojo') {
    const energia = calcularEnergiaDiaria(
      perfil.especie,
      perfil.pesoActual,
      perfil.etapaVida,
      perfil.castrado,
      perfil.actividad,
      perfil.condicionCorporal,
      perfil.pesoObjetivo
    );
    return {
      nivelRiesgo,
      energia,
      gramosPorDiaCasera: 0,
      gramosPorDiaComercial: 0,
      rutaRecomendada: 'D',
      alternativas: [],
      notasSeguridad: [
        'Este caso requiere formulación de un veterinario antes de cualquier dieta, casera o comercial.',
        'No se entrega receta genérica: el margen de error en esta condición es demasiado estrecho.',
      ],
      requiereVeterinario: true,
    };
  }

  // 2. Calcular energía diaria
  const energia = calcularEnergiaDiaria(
    perfil.especie,
    perfil.pesoActual,
    perfil.etapaVida,
    perfil.castrado,
    perfil.actividad,
    perfil.condicionCorporal,
    perfil.pesoObjetivo
  );

  // 3. Calcular costos por nivel
  const gramosPorDiaCasera = calcularGramosPorDia(energia.energiaDiaria, DENSIDAD_CASERA_KCAL_G);
  const gramosPorDiaComercial = calcularGramosPorDia(energia.energiaDiaria, DENSIDAD_COMERCIAL_KCAL_G);
  const receta = construirReceta(gramosPorDiaCasera, perfil.ingredientesPropios);
  const costoCasera = calcularCostoCaseraMensual(receta, perfil.ingredientesPropios);
  const costosComercial = calcularCostosComercialTodosNiveles(energia.energiaDiaria);

  // 4. Elegir estrategia recomendada. Default = A (mejor nivel comercial que entra en presupuesto)
  let rutaRecomendada: Ruta = 'A';
  let nivelComercialRecomendado = nivelComercialQueEntraEnPresupuesto(
    costosComercial,
    perfil.presupuestoMensual
  );

  const tieneAlergia = perfil.banderasSalud.includes('alergia');
  const esSobrepeso = perfil.condicionCorporal === 'sobrepeso';
  const esSenior = perfil.etapaVida === 'senior';
  const esGato = perfil.especie === 'gato';
  const esCrecimiento = perfil.etapaVida === 'cachorro_0_4' || perfil.etapaVida === 'cachorro_4_12';

  if (tieneAlergia) {
    rutaRecomendada = 'C';
    notasSeguridad.push(
      'Alergia detectada: se sugiere proteína novedosa en casera, o un comercial hipoalergénico. Se recomienda validar con veterinario.'
    );
  } else if (esSobrepeso) {
    notasSeguridad.push(
      'Meta de bajar de peso: el comercial de control de peso y la casera controlada son alternativas equivalentes.'
    );
  } else if (
    esPerroGrande(perfil) &&
    nivelComercialRecomendado === 'ultra' &&
    perfil.presupuestoMensual < costosComercial.media &&
    costoCasera <= perfil.presupuestoMensual
  ) {
    // Perro grande donde el nivel comercial aceptable (media) supera el presupuesto,
    // pero el dueño quiere algo mejor que el más barato, y la casera SÍ entra en el presupuesto.
    rutaRecomendada = 'C';
    notasSeguridad.push(
      'El presupuesto no alcanza para un balanceado de nivel medio: la casera bien formulada es una alternativa válida.'
    );
  } else if (esPerroGrande(perfil) && nivelComercialRecomendado === 'ultra' && costoCasera > perfil.presupuestoMensual) {
    notasSeguridad.push(
      'La casera bien formulada costaría más que tu presupuesto actual; el balanceado económico completo es la opción que sí alcanza.'
    );
  } else if (esSenior) {
    notasSeguridad.push(
      'En senior, si rechaza el balanceado por palatabilidad, un topper fresco (ruta B) o casera (ruta C) pueden ayudar a que coma.'
    );
  }

  if (!perfil.disposicionACocinar && rutaRecomendada === 'C') {
    rutaRecomendada = 'A';
  }

  if (nivelRiesgo === 'amarillo') {
    notasSeguridad.push('Caso de atención (gato, crecimiento, senior o alergia): se recomienda revisión con veterinario.');
    if (esGato || esCrecimiento) {
      notasSeguridad.push(
        'Gato o etapa de crecimiento: se prioriza el comercial completo formulado para esa etapa. La casera solo se valida con una herramienta tipo BalanceIT o con un veterinario.'
      );
      if (rutaRecomendada === 'C') {
        notasSeguridad.push('Antes de iniciar la casera en este caso, valida la receta con tu veterinario.');
      } else {
        rutaRecomendada = 'A';
      }
    }
  }

  // 5. Si hay una base comercial en juego, siempre ofrecer B
  const alternativas: AlternativaRuta[] = [];
  alternativas.push({
    ruta: 'A',
    nivelComercial: nivelComercialRecomendado,
    costoMensual: costosComercial[nivelComercialRecomendado],
    descripcion: `Balanceado comercial completo (${datosEc.niveles_comercial[nivelComercialRecomendado].marcas.join(', ')})`,
  });
  alternativas.push({
    ruta: 'B',
    nivelComercial: nivelComercialRecomendado,
    costoMensual: costosComercial[nivelComercialRecomendado] * 0.9 + costoCasera * 0.1,
    descripcion: 'Balanceado + topper fresco (máx. 10% de las calorías diarias)',
  });
  if (perfil.disposicionACocinar) {
    alternativas.push({
      ruta: 'C',
      costoMensual: costoCasera,
      descripcion: 'Casera completa, con calcio y suplemento',
    });
  }

  notasSeguridad.push('El calcio y el suplemento vitamínico-mineral son siempre clave en toda dieta casera, sin excepción.');

  return {
    nivelRiesgo,
    energia,
    gramosPorDiaCasera,
    gramosPorDiaComercial,
    rutaRecomendada,
    nivelComercialRecomendado: (rutaRecomendada as Ruta) !== 'C' ? nivelComercialRecomendado : undefined,
    receta: rutaRecomendada === 'C' ? receta : undefined,
    alternativas,
    notasSeguridad,
    requiereVeterinario: nivelRiesgo !== 'verde',
  };
}
