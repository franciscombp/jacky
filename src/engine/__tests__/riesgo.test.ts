import { describe, it, expect } from 'vitest';
import { clasificarRiesgo } from '../riesgo';

describe('clasificación de riesgo (sección 8)', () => {
  it('bandera renal → rojo', () => {
    expect(clasificarRiesgo(['renal'], 'normal')).toBe('rojo');
  });

  it('gato → amarillo', () => {
    expect(clasificarRiesgo(['gato'], 'normal')).toBe('amarillo');
  });

  it('adulto sano sin banderas → verde', () => {
    expect(clasificarRiesgo([], 'normal')).toBe('verde');
  });

  it('bajo peso → amarillo aunque no haya banderas', () => {
    expect(clasificarRiesgo([], 'bajo_peso')).toBe('amarillo');
  });
});
