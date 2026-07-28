import type { Especie, EtapaVida } from '../engine/tipos';

export type UnidadEdad = 'meses' | 'anios';
export type Tamano = 'pequeno' | 'mediano' | 'grande';

export function edadEnMeses(valor: number, unidad: UnidadEdad): number {
  return unidad === 'anios' ? valor * 12 : valor;
}

/** Umbral de senior en meses según especie y tamaño (heurística general, no diagnóstica). */
function umbralSeniorMeses(especie: Especie, tamano: Tamano): number {
  if (especie === 'gato') return 132; // ~11 años
  if (tamano === 'grande') return 72; // ~6 años
  if (tamano === 'mediano') return 84; // ~7 años
  return 96; // ~8 años, razas pequeñas envejecen más lento
}

export function calcularEtapaVida(especie: Especie, edadMeses: number, tamano: Tamano): EtapaVida {
  if (edadMeses < 4) return 'cachorro_0_4';
  if (edadMeses < 12) return 'cachorro_4_12';
  if (edadMeses >= umbralSeniorMeses(especie, tamano)) return 'senior';
  return 'adulto';
}

export function formatearEdad(valor: number, unidad: UnidadEdad): string {
  const singular = unidad === 'anios' ? 'año' : 'mes';
  const plural = unidad === 'anios' ? 'años' : 'meses';
  return `${valor} ${valor === 1 ? singular : plural}`;
}
