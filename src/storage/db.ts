import Dexie, { type Table } from 'dexie';
import type {
  Especie,
  EtapaVida,
  NivelActividad,
  CondicionCorporal,
  BanderaSalud,
  Ruta,
  NivelComercial,
} from '../engine/tipos';

export interface Pet {
  id?: number;
  nombre: string;
  especie: Especie;
  etapaVida: EtapaVida;
  castrado: boolean;
  foto?: string;
}

export interface HealthProfile {
  id?: number;
  petId: number;
  pesoActual: number;
  pesoObjetivo?: number;
  condicionCorporal: CondicionCorporal;
  actividad: NivelActividad;
  banderasSalud: BanderaSalud[];
  presupuestoMensual: number;
  ingredientesPropios: string[];
  disposicionACocinar: boolean;
}

export interface WeightLog {
  id?: number;
  petId: number;
  fecha: string;
  pesoKg: number;
}

export interface FeedingPlan {
  id?: number;
  petId: number;
  ruta: Ruta;
  nivelComercial?: NivelComercial;
  energiaDiaria: number;
  gramosPorDia: number;
  costoMensual: number;
  generadoEn: string;
}

class JackyDB extends Dexie {
  pets!: Table<Pet, number>;
  healthProfiles!: Table<HealthProfile, number>;
  weightLogs!: Table<WeightLog, number>;
  feedingPlans!: Table<FeedingPlan, number>;

  constructor() {
    super('jacky-db');
    this.version(1).stores({
      pets: '++id, nombre',
      healthProfiles: '++id, petId',
      weightLogs: '++id, petId, fecha',
      feedingPlans: '++id, petId, generadoEn',
    });
  }
}

export const db = new JackyDB();
