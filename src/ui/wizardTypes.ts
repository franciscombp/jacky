import type {
  Especie,
  NivelActividad,
  CondicionCorporal,
  BanderaSalud,
  Ruta,
} from '../engine/tipos';
import type { UnidadEdad, Tamano } from './edad';
import type { NivelPresupuesto } from '../storage/db';

export interface EstadoAsistente {
  nombre: string;
  especie: Especie;
  edadValor: number;
  edadUnidad: UnidadEdad;
  tamano: Tamano;
  pesoActual: number;
  castrado: boolean;
  actividad: NivelActividad;
  condicionCorporal: CondicionCorporal;
  pesoObjetivo: string;
  banderasSalud: BanderaSalud[];
  ingredientesPropios: string[];
  disposicionACocinar: boolean;
  presupuestoNivel: NivelPresupuesto;
  planElegido?: Ruta;
}

export const estadoInicial: EstadoAsistente = {
  nombre: '',
  especie: 'perro',
  edadValor: 2,
  edadUnidad: 'anios',
  tamano: 'mediano',
  pesoActual: 10,
  castrado: true,
  actividad: 'normal',
  condicionCorporal: 'normal',
  pesoObjetivo: '',
  banderasSalud: [],
  ingredientesPropios: [],
  disposicionACocinar: true,
  presupuestoNivel: 'equilibrado',
};
