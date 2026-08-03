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

export type TipoRecordatorio = 'vacuna' | 'desparasitacion' | 'pulgas' | 'medicacion' | 'vet' | 'recompra';

export interface Reminder {
  id?: number;
  petId: number;
  tipo: TipoRecordatorio;
  titulo: string;
  fecha: string;
  /** Meses entre repeticiones; sin valor = recordatorio único. */
  recurrenciaMeses?: number;
  notas?: string;
}

class JackyDB extends Dexie {
  pets!: Table<Pet, number>;
  healthProfiles!: Table<HealthProfile, number>;
  weightLogs!: Table<WeightLog, number>;
  feedingPlans!: Table<FeedingPlan, number>;
  reminders!: Table<Reminder, number>;

  constructor() {
    super('jacky-db');
    this.version(1).stores({
      pets: '++id, nombre',
      healthProfiles: '++id, petId',
      weightLogs: '++id, petId, fecha',
      feedingPlans: '++id, petId, generadoEn',
    });
    this.version(2).stores({
      pets: '++id, nombre',
      healthProfiles: '++id, petId',
      weightLogs: '++id, petId, fecha',
      feedingPlans: '++id, petId, generadoEn',
      reminders: '++id, petId, fecha',
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
  await db.transaction(
    'rw',
    db.pets,
    db.healthProfiles,
    db.weightLogs,
    db.feedingPlans,
    db.reminders,
    async () => {
      await db.pets.delete(petId);
      await db.healthProfiles.where('petId').equals(petId).delete();
      await db.weightLogs.where('petId').equals(petId).delete();
      await db.feedingPlans.where('petId').equals(petId).delete();
      await db.reminders.where('petId').equals(petId).delete();
    }
  );
}

export async function listarRecordatorios(petId: number) {
  return db.reminders.where('petId').equals(petId).sortBy('fecha');
}

export async function completarRecordatorio(recordatorio: Reminder) {
  if (!recordatorio.id) return;
  if (recordatorio.recurrenciaMeses) {
    const siguiente = new Date(recordatorio.fecha);
    siguiente.setMonth(siguiente.getMonth() + recordatorio.recurrenciaMeses);
    await db.reminders.update(recordatorio.id, { fecha: siguiente.toISOString().slice(0, 10) });
  } else {
    await db.reminders.delete(recordatorio.id);
  }
}
