import { useEffect, useState } from 'react';
import { db, type Pet } from '../../storage/db';
import { Tarjeta } from '../components/Tarjeta';
import { Boton } from '../components/Boton';

interface Props {
  onAgregar: () => void;
  onAbrir: (petId: number) => void;
}

export function Inicio({ onAgregar, onAbrir }: Props) {
  const [mascotas, setMascotas] = useState<Pet[] | null>(null);

  useEffect(() => {
    db.pets.toArray().then(setMascotas);
  }, []);

  if (mascotas === null) return null;

  if (mascotas.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-5xl mb-4">🐾</p>
        <h2 className="text-2xl mb-2">Empecemos con tu mascota</h2>
        <p className="text-ink/60 mb-6">Un par de preguntas y tienes su plan de alimentación.</p>
        <Boton onClick={onAgregar}>Agregar mascota</Boton>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl mb-2">Tus mascotas</h2>
      {mascotas.map((m) => (
        <Tarjeta key={m.id} className="cursor-pointer" >
          <button className="w-full text-left flex items-center gap-3" onClick={() => onAbrir(m.id!)}>
            <span className="text-3xl">{m.especie === 'perro' ? '🐶' : '🐱'}</span>
            <span className="font-medium text-lg">{m.nombre}</span>
          </button>
        </Tarjeta>
      ))}
      <Boton variante="secundario" onClick={onAgregar} className="w-full">
        + Agregar otra mascota
      </Boton>
    </div>
  );
}
