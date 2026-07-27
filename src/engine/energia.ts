import type { Especie, EtapaVida, NivelActividad, CondicionCorporal } from './tipos';

/**
 * RER (energía en reposo) = 70 * (pesoKg ^ 0.75)
 * MER (energía diaria)    = RER * factor
 */
export function calcularRER(pesoKg: number): number {
  return 70 * Math.pow(pesoKg, 0.75);
}

const FACTORES_PERRO: Record<string, number> = {
  cachorro_0_4: 3.0,
  cachorro_4_12: 2.0,
  adulto_castrado: 1.6,
  adulto_entero: 1.8,
  adulto_muy_activo: 2.5,
  senior: 1.3,
};

const FACTORES_GATO: Record<string, number> = {
  cachorro_0_4: 2.5,
  cachorro_4_12: 2.5,
  adulto_castrado: 1.2,
  adulto_entero: 1.4,
  senior: 1.1,
};

export function obtenerFactor(
  especie: Especie,
  etapaVida: EtapaVida,
  castrado: boolean,
  actividad: NivelActividad
): number {
  if (especie === 'perro') {
    if (etapaVida === 'cachorro_0_4') return FACTORES_PERRO.cachorro_0_4;
    if (etapaVida === 'cachorro_4_12') return FACTORES_PERRO.cachorro_4_12;
    if (etapaVida === 'senior') return FACTORES_PERRO.senior;
    if (actividad === 'muy_activo') return FACTORES_PERRO.adulto_muy_activo;
    return castrado ? FACTORES_PERRO.adulto_castrado : FACTORES_PERRO.adulto_entero;
  }
  // gato
  if (etapaVida === 'cachorro_0_4' || etapaVida === 'cachorro_4_12') return FACTORES_GATO.cachorro_0_4;
  if (etapaVida === 'senior') return FACTORES_GATO.senior;
  return castrado ? FACTORES_GATO.adulto_castrado : FACTORES_GATO.adulto_entero;
}

export function calcularMER(pesoKg: number, factor: number): number {
  return calcularRER(pesoKg) * factor;
}

/**
 * Para bajar de peso (condicionCorporal == sobrepeso): calcular sobre el peso
 * objetivo, no el actual.
 *   energiaDiaria = RER(pesoObjetivo) * (perro: 1.0 | gato: 0.8)
 * Si no hay pesoObjetivo, estimarlo: pesoObjetivo ≈ pesoActual * 0.85
 */
export function estimarPesoObjetivo(pesoActual: number): number {
  return pesoActual * 0.85;
}

export function calcularEnergiaBajarPeso(especie: Especie, pesoObjetivo: number): number {
  const factor = especie === 'perro' ? 1.0 : 0.8;
  return calcularRER(pesoObjetivo) * factor;
}

export interface ResultadoEnergia {
  rer: number;
  energiaDiaria: number;
  factor: number;
  pesoUsado: number;
  esParaBajarPeso: boolean;
  pesoObjetivoEstimado?: number;
}

export function calcularEnergiaDiaria(
  especie: Especie,
  pesoActual: number,
  etapaVida: EtapaVida,
  castrado: boolean,
  actividad: NivelActividad,
  condicionCorporal: CondicionCorporal,
  pesoObjetivo?: number
): ResultadoEnergia {
  if (condicionCorporal === 'sobrepeso') {
    const estimado = pesoObjetivo === undefined;
    const objetivo = pesoObjetivo ?? estimarPesoObjetivo(pesoActual);
    const energiaDiaria = calcularEnergiaBajarPeso(especie, objetivo);
    return {
      rer: calcularRER(objetivo),
      energiaDiaria,
      factor: especie === 'perro' ? 1.0 : 0.8,
      pesoUsado: objetivo,
      esParaBajarPeso: true,
      pesoObjetivoEstimado: estimado ? objetivo : undefined,
    };
  }

  const factor = obtenerFactor(especie, etapaVida, castrado, actividad);
  const rer = calcularRER(pesoActual);
  return {
    rer,
    energiaDiaria: rer * factor,
    factor,
    pesoUsado: pesoActual,
    esParaBajarPeso: false,
  };
}
