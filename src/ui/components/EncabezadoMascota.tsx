import type { Especie } from '../../engine/tipos';

interface Props {
  nombre: string;
  especie: Especie;
  onVolver: () => void;
}

export function EncabezadoMascota({ nombre, especie, onVolver }: Props) {
  return (
    <div className="flex items-center gap-2 mb-4 shrink-0">
      <button onClick={onVolver} className="text-xl px-1 -ml-1 text-ink/50" aria-label="Volver a mis mascotas">
        ←
      </button>
      <span className="text-xl">{especie === 'perro' ? '🐶' : '🐱'}</span>
      <h1 className="text-lg font-medium truncate">{nombre || 'Tu mascota'}</h1>
    </div>
  );
}
