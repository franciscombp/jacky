/** Densidades de energía */
export const DENSIDAD_CASERA_KCAL_G = 1.3;
export const DENSIDAD_COMERCIAL_KCAL_G = 3.5;

export function calcularGramosPorDia(energiaDiaria: number, densidadKcalPorGramo: number): number {
  return energiaDiaria / densidadKcalPorGramo;
}

export function repartirPorComidas(gramosPorDia: number, numeroComidas = 2): number[] {
  const porComida = gramosPorDia / numeroComidas;
  return Array.from({ length: numeroComidas }, () => porComida);
}
