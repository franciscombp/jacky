import Dexie, { type Table } from 'dexie';
import type {
  Especie,
  NivelActividad,
  CondicionCorporal,
  BanderaSalud,
  Ruta,
  NivelComercial,
} from '../engine/tipos';
import type { UnidadEdad, Tamano } from '../ui/edad';

export type NivelPresupuesto = 'ahorro' | 'equilibrado' | 'amplio';

export interface Pet {
  id?: number;
  nombre: string;
  especie: Especie;
  foto?: string;
  creadoEn: string;
}

/** Un único perfil vigente por mascota (se actualiza al editar, no se acumula). */
export interface HealthProfile {
  id?: number;
  petId: number;
  edadValor: number;
  edadUnidad: UnidadEdad;
  tamano: Tamano;
  castrado: boolean;
  pesoActual: number;
  pesoObjetivo?: number;
  condicionCorporal: CondicionCorporal;
  actividad: NivelActividad;
  banderasSalud: BanderaSalud[];
  ingredientesPropios: string[];
  disposicionACocinar: boolean;
  presupuestoNivel: NivelPresupuesto;
  planElegido?: Ruta;
  actualizadoEn: string;
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

export async function guardarPerfil(petId: number, datos: Omit<HealthProfile, 'id' | 'petId' | 'actualizadoEn'>) {
  const existente = await db.healthProfiles.where('petId').equals(petId).first();
  const registro: HealthProfile = {
    ...datos,
    petId,
    actualizadoEn: new Date().toISOString(),
    ...(existente?.id ? { id: existente.id } : {}),
  };
  return db.healthProfiles.put(registro);
}

export async function obtenerPerfil(petId: number) {
  return db.healthProfiles.where('petId').equals(petId).first();
}

export async function guardarPlan(petId: number, plan: Omit<FeedingPlan, 'id' | 'petId'>) {
  return db.feedingPlans.add({ ...plan, petId });
}

export async function obtenerUltimoPlan(petId: number) {
  return db.feedingPlans.where('petId').equals(petId).last();
}

export async function eliminarMascota(petId: number) {
  await db.transaction('rw', db.pets, db.healthProfiles, db.weightLogs, db.feedingPlans, async () => {
    await db.pets.delete(petId);
    await db.healthProfiles.where('petId').equals(petId).delete();
    await db.weightLogs.where('petId').equals(petId).delete();
    await db.feedingPlans.where('petId').equals(petId).delete();
  });
}
