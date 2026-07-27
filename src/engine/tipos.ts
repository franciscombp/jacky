export type Especie = 'perro' | 'gato';

export type EtapaVida =
  | 'cachorro_0_4'
  | 'cachorro_4_12'
  | 'adulto'
  | 'senior';

export type NivelActividad = 'normal' | 'muy_activo';

export type CondicionCorporal = 'bajo_peso' | 'normal' | 'sobrepeso';

export type BanderaSalud =
  | 'renal'
  | 'higado'
  | 'pancreas'
  | 'diabetes'
  | 'gestante'
  | 'enfermo'
  | 'gato'
  | 'cachorro_0_4'
  | 'cachorro_4_12'
  | 'senior'
  | 'alergia'
  | 'bajo_peso';

export type NivelRiesgo = 'verde' | 'amarillo' | 'rojo';

export type NivelComercial = 'ultra' | 'media' | 'premium' | 'prescripcion';

export type Ruta = 'A' | 'B' | 'C' | 'D';

export interface PerfilMascota {
  especie: Especie;
  pesoActual: number;
  etapaVida: EtapaVida;
  castrado: boolean;
  actividad: NivelActividad;
  condicionCorporal: CondicionCorporal;
  pesoObjetivo?: number;
  banderasSalud: BanderaSalud[];
  presupuestoMensual: number;
  ingredientesPropios: string[];
  disposicionACocinar: boolean;
}

export interface IngredienteCasera {
  id: string;
  nombre: string;
  rol: string;
  precioKg?: number;
  porUnidad?: boolean;
  gramosUnidad?: number;
  precio?: number;
}

export interface NivelesComercial {
  precioKg: number;
  marcas: string[];
}

export interface DatosRegion {
  ingredientes_casera: IngredienteCasera[];
  suplemento_por_dia: number;
  niveles_comercial: Record<NivelComercial, NivelesComercial>;
}
