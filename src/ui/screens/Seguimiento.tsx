import { useEffect, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Tarjeta } from '../components/Tarjeta';
import { Boton } from '../components/Boton';
import { db, type WeightLog } from '../../storage/db';

interface Props {
  petId: number;
  pesoObjetivo?: number;
  onRecalcular: (nuevoPesoKg: number) => void;
}

export function Seguimiento({ petId, pesoObjetivo, onRecalcular }: Props) {
  const [registros, setRegistros] = useState<WeightLog[]>([]);
  const [nuevoPeso, setNuevoPeso] = useState('');
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    db.weightLogs.where('petId').equals(petId).sortBy('fecha').then(setRegistros);
  }, [petId]);

  const datosGrafica = useMemo(
    () => registros.map((r) => ({ fecha: r.fecha.slice(5), peso: r.pesoKg })),
    [registros]
  );

  async function registrarPeso() {
    const peso = Number(nuevoPeso);
    if (!peso || peso <= 0) return;

    const anterior = registros[registros.length - 1];
    if (anterior) {
      const dias = Math.max(
        1,
        (new Date().getTime() - new Date(anterior.fecha).getTime()) / (1000 * 60 * 60 * 24)
      );
      const cambioPorcentual = ((peso - anterior.pesoKg) / anterior.pesoKg) * 100;
      const cambioSemanal = Math.abs(cambioPorcentual) * (7 / dias);
      if (cambioSemanal > 1) {
        setAviso(
          cambioPorcentual < 0
            ? 'Está bajando de peso más rápido de lo recomendado (más de 1% semanal). Sube un poco la ración y consulta a tu veterinario si continúa.'
            : 'El peso subió más rápido de lo esperado. Revisa la porción y consulta a tu veterinario si continúa.'
        );
      } else {
        setAviso(null);
      }
    }

    const fecha = new Date().toISOString().slice(0, 10);
    const id = await db.weightLogs.add({ petId, fecha, pesoKg: peso });
    setRegistros([...registros, { id, petId, fecha, pesoKg: peso }]);
    setNuevoPeso('');
    onRecalcular(peso);
  }

  return (
    <div className="space-y-4">
      <Tarjeta>
        <h2 className="text-2xl mb-1">Seguimiento de peso</h2>
        <p className="text-ink/60 mb-4">Registra el peso cada 1–2 semanas para ajustar la porción.</p>

        {datosGrafica.length > 1 && (
          <div className="h-48 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={datosGrafica}>
                <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                <Tooltip />
                {pesoObjetivo && (
                  <ReferenceLine y={pesoObjetivo} stroke="var(--color-risk-yellow)" strokeDasharray="4 4" label="Meta" />
                )}
                <Line type="monotone" dataKey="peso" stroke="var(--color-pine-600)" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="number"
            step="0.1"
            min="0"
            className="flex-1 rounded-lg border border-pine-100 px-3 py-2"
            placeholder="Peso de hoy (kg)"
            value={nuevoPeso}
            onChange={(e) => setNuevoPeso(e.target.value)}
          />
          <Boton onClick={registrarPeso}>Registrar</Boton>
        </div>

        {aviso && (
          <div className="mt-3 rounded-lg bg-risk-yellow/10 border border-risk-yellow/30 px-3 py-2 text-sm text-risk-yellow">
            {aviso}
          </div>
        )}
      </Tarjeta>
    </div>
  );
}
