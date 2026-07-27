import type {
  Especie,
  EtapaVida,
  NivelActividad,
  CondicionCorporal,
  BanderaSalud,
} from '../engine/tipos';

export interface EstadoAsistente {
  nombre: string;
  especie: Especie;
  pesoActual: string;
  etapaVida: EtapaVida;
  castrado: boolean;
  actividad: NivelActividad;
  condicionCorporal: CondicionCorporal;
  pesoObjetivo: string;
  banderasSalud: BanderaSalud[];
  presupuestoMensual: string;
  ingredientesPropios: string[];
  disposicionACocinar: boolean;
}

export const estadoInicial: EstadoAsistente = {
  nombre: '',
  especie: 'perro',
  pesoActual: '',
  etapaVida: 'adulto',
  castrado: true,
  actividad: 'normal',
  condicionCorporal: 'normal',
  pesoObjetivo: '',
  banderasSalud: [],
  presupuestoMensual: '',
  ingredientesPropios: [],
  disposicionACocinar: true,
};
