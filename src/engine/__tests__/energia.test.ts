import { describe, it, expect } from 'vitest';
import { calcularRER, calcularEnergiaDiaria } from '../energia';

describe('motor nutricional · energía (sección 7.1)', () => {
  it('perro 26.5 kg, adulto castrado, en su peso → RER ≈ 817, MER ≈ 1307', () => {
    const rer = calcularRER(26.5);
    expect(rer).toBeCloseTo(817, -1);

    const resultado = calcularEnergiaDiaria('perro', 26.5, 'adulto', true, 'normal', 'normal');
    expect(resultado.energiaDiaria).toBeCloseTo(1307, -1);
  });

  it('mismo perro con sobrepeso, objetivo 23 kg → energía para bajar ≈ 731 kcal/día', () => {
    const resultado = calcularEnergiaDiaria('perro', 26.5, 'adulto', true, 'normal', 'sobrepeso', 23);
    expect(resultado.energiaDiaria).toBeCloseTo(731, -1);
    expect(resultado.esParaBajarPeso).toBe(true);
  });

  it('estima el peso objetivo como 85% del actual cuando no se da uno', () => {
    const resultado = calcularEnergiaDiaria('perro', 26.5, 'adulto', true, 'normal', 'sobrepeso');
    expect(resultado.pesoObjetivoEstimado).toBeCloseTo(26.5 * 0.85, 2);
  });

  it('cachorro de perro 0-4 meses usa factor 3.0', () => {
    const resultado = calcularEnergiaDiaria('perro', 5, 'cachorro_0_4', false, 'normal', 'normal');
    expect(resultado.factor).toBe(3.0);
  });

  it('gato adulto castrado usa factor 1.2', () => {
    const resultado = calcularEnergiaDiaria('gato', 4, 'adulto', true, 'normal', 'normal');
    expect(resultado.factor).toBe(1.2);
  });
});
