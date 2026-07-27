import type { NivelComercial } from './tipos';
import type { RecetaCasera } from './receta';
import datosEc from './datos.ec.json';

function precioPorGramo(ingredienteId: string): number {
  const ing = datosEc.ingredientes_casera.find((i) => i.id === ingredienteId);
  if (!ing) return 0;
  if (ing.porUnidad && ing.gramosUnidad && ing.precio !== undefined) {
    return ing.precio / ing.gramosUnidad;
  }
  if (ing.precioKg !== undefined) {
    return ing.precioKg / 1000;
  }
  return 0;
}

/**
 * costoCaseraMensual = (Σ gramosDia_ingrediente * precioPorGramo_ingrediente,
 *                        excluyendo "propios") * 30
 *                      + suplementoPorDia * 30
 *                      (+ calcio ≈ 0)
 */
export function calcularCostoCaseraMensual(
  receta: RecetaCasera,
  ingredientesPropios: string[] = []
): number {
  const costoIngredientesDia = receta.componentes
    .filter((c) => !ingredientesPropios.includes(c.ingredienteId))
    .reduce((total, c) => total + c.gramos * precioPorGramo(c.ingredienteId), 0);

  const suplementoPorDia = datosEc.suplemento_por_dia;

  return costoIngredientesDia * 30 + suplementoPorDia * 30;
}

/**
 * costoComercialMensual(nivel) =
 *   (energiaDiaria / 3.5) / 1000 * precioPorKg[nivel] * 30
 */
export function calcularCostoComercialMensual(energiaDiaria: number, nivel: NivelComercial): number {
  const precioPorKg = datosEc.niveles_comercial[nivel].precioKg;
  return (energiaDiaria / 3.5 / 1000) * precioPorKg * 30;
}

export function calcularCostosComercialTodosNiveles(
  energiaDiaria: number
): Record<NivelComercial, number> {
  const niveles: NivelComercial[] = ['ultra', 'media', 'premium', 'prescripcion'];
  return Object.fromEntries(
    niveles.map((n) => [n, calcularCostoComercialMensual(energiaDiaria, n)])
  ) as Record<NivelComercial, number>;
}
