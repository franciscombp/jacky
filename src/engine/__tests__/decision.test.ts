import { describe, it, expect } from 'vitest';
import { decidirEstrategia } from '../decision';
import type { PerfilMascota } from '../tipos';

function perfilBase(overrides: Partial<PerfilMascota> = {}): PerfilMascota {
  return {
    especie: 'perro',
    pesoActual: 10,
    etapaVida: 'adulto',
    castrado: true,
    actividad: 'normal',
    condicionCorporal: 'normal',
    banderasSalud: [],
    presupuestoMensual: 30,
    ingredientesPropios: [],
    disposicionACocinar: true,
    ...overrides,
  };
}

describe('escalera de decisión (sección 6)', () => {
  it('bandera renal → ruta D, sin receta genérica', () => {
    const resultado = decidirEstrategia(perfilBase({ banderasSalud: ['renal'] }));
    expect(resultado.rutaRecomendada).toBe('D');
    expect(resultado.receta).toBeUndefined();
    expect(resultado.requiereVeterinario).toBe(true);
  });

  it('caso verde default → ruta A con alternativa B siempre presente', () => {
    const resultado = decidirEstrategia(perfilBase());
    expect(resultado.rutaRecomendada).toBe('A');
    expect(resultado.alternativas.some((a) => a.ruta === 'B')).toBe(true);
  });

  it('disposicionACocinar = no nunca recomienda C', () => {
    const resultado = decidirEstrategia(
      perfilBase({ banderasSalud: ['alergia'], disposicionACocinar: false })
    );
    expect(resultado.rutaRecomendada).not.toBe('C');
  });

  it('alergia con disposición a cocinar → ofrece C', () => {
    const resultado = decidirEstrategia(perfilBase({ banderasSalud: ['alergia'] }));
    expect(resultado.rutaRecomendada).toBe('C');
  });

  it('gato en riesgo amarillo sin alergia se empuja hacia A (comercial completo)', () => {
    const resultado = decidirEstrategia(
      perfilBase({ especie: 'gato', pesoActual: 4, banderasSalud: ['gato'] })
    );
    expect(resultado.rutaRecomendada).toBe('A');
  });

  it('gato con alergia mantiene C pero exige validación veterinaria explícita', () => {
    const resultado = decidirEstrategia(
      perfilBase({ especie: 'gato', pesoActual: 4, banderasSalud: ['gato', 'alergia'] })
    );
    expect(resultado.rutaRecomendada).toBe('C');
    expect(resultado.notasSeguridad.join(' ')).toMatch(/veterinario/i);
  });

  it('perro grande con presupuesto bajo nunca recomienda una casera más cara que el presupuesto', () => {
    const resultado = decidirEstrategia(
      perfilBase({ especie: 'perro', pesoActual: 26.5, presupuestoMensual: 20 })
    );
    if (resultado.rutaRecomendada === 'C') {
      const costoC = resultado.alternativas.find((a) => a.ruta === 'C')?.costoMensual ?? Infinity;
      expect(costoC).toBeLessThanOrEqual(20);
    } else {
      expect(resultado.rutaRecomendada).toBe('A');
    }
  });

  it('siempre marca calcio y suplemento como clave en la receta casera', () => {
    const resultado = decidirEstrategia(perfilBase({ banderasSalud: ['alergia'] }));
    expect(resultado.receta?.calcio.clave).toBe(true);
    expect(resultado.receta?.suplemento.clave).toBe(true);
  });
});
