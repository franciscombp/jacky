import type { BanderaSalud, CondicionCorporal, NivelRiesgo } from './tipos';

/**
 * Banderas que disparan ROJO: renal, higado, pancreas, diabetes, gestante, enfermo.
 * Banderas/estados que disparan AMARILLO: gato, cachorro_0_4, cachorro_4_12,
 * senior, alergia, bajo_peso.
 */
const BANDERAS_ROJO: BanderaSalud[] = ['renal', 'higado', 'pancreas', 'diabetes', 'gestante', 'enfermo'];
const BANDERAS_AMARILLO: BanderaSalud[] = [
  'gato',
  'cachorro_0_4',
  'cachorro_4_12',
  'senior',
  'alergia',
  'bajo_peso',
];

export function clasificarRiesgo(
  banderasSalud: BanderaSalud[],
  condicionCorporal: CondicionCorporal
): NivelRiesgo {
  if (banderasSalud.some((b) => BANDERAS_ROJO.includes(b))) return 'rojo';
  if (condicionCorporal === 'bajo_peso') return 'amarillo';
  if (banderasSalud.some((b) => BANDERAS_AMARILLO.includes(b))) return 'amarillo';
  return 'verde';
}
