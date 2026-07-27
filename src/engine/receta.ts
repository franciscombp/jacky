import type { IngredienteCasera } from './tipos';
import datosEc from './datos.ec.json';

export interface ComponenteReceta {
  ingredienteId: string;
  nombre: string;
  rol: string;
  gramos: number;
}

export interface RecetaCasera {
  gramosPorDia: number;
  componentes: ComponenteReceta[];
  calcio: {
    fuente: string;
    dosis: string;
    clave: true;
  };
  suplemento: {
    dosis: string;
    clave: true;
  };
}

/**
 * Composición por peso de comida cocida:
 *   proteína 45%, carbohidrato 30%, vegetales 20%, grasa (aceite) ~2%
 *   + FIJOS no negociables: calcio y suplemento vitamínico-mineral.
 */
const PROPORCION = {
  proteina: 0.45,
  carbohidrato: 0.30,
  vegetales: 0.20,
  grasa: 0.02,
};

function precioPorGramoIngrediente(ing: IngredienteCasera): number {
  if (ing.porUnidad && ing.gramosUnidad && ing.precio !== undefined) return ing.precio / ing.gramosUnidad;
  if (ing.precioKg !== undefined) return ing.precioKg / 1000;
  return Infinity;
}

function elegirIngrediente(rol: string, ingredientesPropios: string[]): IngredienteCasera | undefined {
  const candidatos = datosEc.ingredientes_casera.filter((i) => i.rol.includes(rol));
  const propio = candidatos.find((i) => ingredientesPropios.includes(i.id));
  if (propio) return propio;
  // Por defecto, el más económico por gramo dentro del rol.
  return [...candidatos].sort((a, b) => precioPorGramoIngrediente(a) - precioPorGramoIngrediente(b))[0];
}

export function construirReceta(
  gramosPorDia: number,
  ingredientesPropios: string[] = []
): RecetaCasera {
  const proteina = elegirIngrediente('proteína', ingredientesPropios);
  const carbohidrato = elegirIngrediente('energía', ingredientesPropios);
  const vegetal = elegirIngrediente('fibra', ingredientesPropios);
  const grasa = elegirIngrediente('grasa', ingredientesPropios);

  const componentes: ComponenteReceta[] = [];
  if (proteina) {
    componentes.push({
      ingredienteId: proteina.id,
      nombre: proteina.nombre,
      rol: 'proteína',
      gramos: gramosPorDia * PROPORCION.proteina,
    });
  }
  if (carbohidrato) {
    componentes.push({
      ingredienteId: carbohidrato.id,
      nombre: carbohidrato.nombre,
      rol: 'carbohidrato',
      gramos: gramosPorDia * PROPORCION.carbohidrato,
    });
  }
  if (vegetal) {
    componentes.push({
      ingredienteId: vegetal.id,
      nombre: vegetal.nombre,
      rol: 'vegetales',
      gramos: gramosPorDia * PROPORCION.vegetales,
    });
  }
  if (grasa) {
    componentes.push({
      ingredienteId: grasa.id,
      nombre: grasa.nombre,
      rol: 'grasa',
      gramos: gramosPorDia * PROPORCION.grasa,
    });
  }

  return {
    gramosPorDia,
    componentes,
    calcio: {
      fuente: 'Cáscara de huevo molida (o carbonato de calcio)',
      dosis: '½ cucharadita por cada 500 g de comida',
      clave: true,
    },
    suplemento: {
      dosis: 'Suplemento vitamínico-mineral canino/felino según etiqueta',
      clave: true,
    },
  };
}
