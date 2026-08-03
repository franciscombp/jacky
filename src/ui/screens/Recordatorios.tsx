import { useEffect, useState } from 'react';
import type { Reminder, TipoRecordatorio } from '../../storage/db';
import { db, listarRecordatorios, completarRecordatorio } from '../../storage/db';
import { Tarjeta } from '../components/Tarjeta';
import { Boton } from '../components/Boton';

const TIPOS: { valor: TipoRecordatorio; etiqueta: string; icono: string }[] = [
  { valor: 'vacuna', etiqueta: 'Vacuna', icono: '💉' },
  { valor: 'desparasitacion', etiqueta: 'Desparasitación', icono: '🪱' },
  { valor: 'pulgas', etiqueta: 'Pulgas y garrapatas', icono: '🦟' },
  { valor: 'medicacion', etiqueta: 'Medicación', icono: '💊' },
  { valor: 'vet', etiqueta: 'Control veterinario', icono: '🩺' },
  { valor: 'recompra', etiqueta: 'Recompra de comida', icono: '🛒' },
];

const RECURRENCIAS = [
  { valor: 0, etiqueta: 'No se repite' },
  { valor: 1, etiqueta: 'Cada mes' },
  { valor: 3, etiqueta: 'Cada 3 meses' },
  { valor: 6, etiqueta: 'Cada 6 meses' },
  { valor: 12, etiqueta: 'Cada año' },
];

function diasHasta(fecha: string): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const objetivo = new Date(fecha);
  return Math.round((objetivo.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
}

function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface Props {
  petId: number;
  onVolver: () => void;
}

export function Recordatorios({ petId, onVolver }: Props) {
  const [recordatorios, setRecordatorios] = useState<Reminder[] | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [tipo, setTipo] = useState<TipoRecordatorio>('vacuna');
  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [recurrenciaMeses, setRecurrenciaMeses] = useState(0);

  function recargar() {
    listarRecordatorios(petId).then(setRecordatorios);
  }

  useEffect(() => {
    recargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [petId]);

  async function agregar() {
    if (!titulo.trim()) return;
    await db.reminders.add({
      petId,
      tipo,
      titulo: titulo.trim(),
      fecha,
      recurrenciaMeses: recurrenciaMeses || undefined,
    });
    setTitulo('');
    setRecurrenciaMeses(0);
    setMostrarForm(false);
    recargar();
  }

  async function marcarHecho(r: Reminder) {
    await completarRecordatorio(r);
    recargar();
  }

  async function eliminar(id?: number) {
    if (!id) return;
    await db.reminders.delete(id);
    recargar();
  }

  if (recordatorios === null) return null;

  const vencidos = recordatorios.filter((r) => diasHasta(r.fecha) < 0);
  const proximos = recordatorios.filter((r) => diasHasta(r.fecha) >= 0 && diasHasta(r.fecha) <= 14);
  const futuros = recordatorios.filter((r) => diasHasta(r.fecha) > 14);

  function grupo(titulo: string, items: Reminder[], colorClase: string) {
    if (items.length === 0) return null;
    return (
      <div className="space-y-2">
        <h3 className={`text-xs font-medium uppercase tracking-wide ${colorClase}`}>{titulo}</h3>
        {items.map((r) => {
          const info = TIPOS.find((t) => t.valor === r.tipo);
          return (
            <Tarjeta key={r.id} className="flex items-center gap-3 py-3">
              <span className="text-2xl shrink-0">{info?.icono}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{r.titulo}</p>
                <p className="text-xs text-ink/50">
                  {formatearFecha(r.fecha)}
                  {r.recurrenciaMeses ? ` · se repite` : ''}
                </p>
              </div>
              <button
                onClick={() => marcarHecho(r)}
                className="shrink-0 rounded-full bg-pine-50 text-pine-700 text-xs font-medium px-3 py-1.5 active:scale-95"
              >
                Hecho
              </button>
              <button onClick={() => eliminar(r.id)} className="shrink-0 text-ink/30 text-lg px-1" aria-label="Eliminar">
                ×
              </button>
            </Tarjeta>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">Salud y recordatorios</h2>
        <button className="text-sm text-pine-700" onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? 'Cancelar' : '+ Agregar'}
        </button>
      </div>

      {mostrarForm && (
        <Tarjeta className="animate-paso-entra space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {TIPOS.map((t) => (
              <button
                key={t.valor}
                onClick={() => setTipo(t.valor)}
                className={`rounded-lg border py-2 text-xs flex flex-col items-center gap-1 ${
                  tipo === t.valor ? 'border-pine-600 bg-pine-50' : 'border-pine-100'
                }`}
              >
                <span className="text-lg">{t.icono}</span>
                {t.etiqueta}
              </button>
            ))}
          </div>
          <input
            className="w-full rounded-lg border border-pine-100 px-3 py-2 text-sm"
            placeholder="Ej. Vacuna antirrábica"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
          <div className="flex gap-2">
            <input
              type="date"
              className="flex-1 rounded-lg border border-pine-100 px-3 py-2 text-sm"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
            <select
              className="flex-1 rounded-lg border border-pine-100 px-3 py-2 text-sm"
              value={recurrenciaMeses}
              onChange={(e) => setRecurrenciaMeses(Number(e.target.value))}
            >
              {RECURRENCIAS.map((r) => (
                <option key={r.valor} value={r.valor}>
                  {r.etiqueta}
                </option>
              ))}
            </select>
          </div>
          <Boton onClick={agregar} disabled={!titulo.trim()} className="w-full">
            Guardar recordatorio
          </Boton>
        </Tarjeta>
      )}

      {recordatorios.length === 0 && !mostrarForm && (
        <p className="text-sm text-ink/50 text-center py-8">
          Sin recordatorios todavía. Agrega vacunas, desparasitación o la próxima cita al veterinario.
        </p>
      )}

      {grupo('Vencidos', vencidos, 'text-risk-red')}
      {grupo('Próximos 14 días', proximos, 'text-risk-yellow')}
      {grupo('Más adelante', futuros, 'text-ink/40')}

      <Boton variante="texto" onClick={onVolver}>
        ← Volver al plan
      </Boton>
    </div>
  );
}
