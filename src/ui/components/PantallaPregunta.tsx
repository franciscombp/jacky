import type { ReactNode } from 'react';
import { Boton } from './Boton';

interface Props {
  paso: number;
  total: number;
  pregunta: string;
  ayuda?: string;
  children: ReactNode;
  onAtras: () => void;
  onSiguiente: () => void;
  puedeContinuar?: boolean;
  textoBoton?: string;
}

export function PantallaPregunta({
  paso,
  total,
  pregunta,
  ayuda,
  children,
  onAtras,
  onSiguiente,
  puedeContinuar = true,
  textoBoton = 'Continuar',
}: Props) {
  return (
    <div className="flex flex-col animate-paso-entra">
      <div className="flex items-center gap-2 mb-6">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              i < paso ? 'bg-pine-600' : 'bg-pine-100'
            }`}
          />
        ))}
      </div>

      <h2 className="text-2xl leading-snug mb-1">{pregunta}</h2>
      {ayuda && <p className="text-ink/60 mb-5 text-sm">{ayuda}</p>}

      <div className="py-2">{children}</div>

      <div className="flex justify-between items-center gap-3 mt-8 pt-4 pb-2 sticky bottom-0 bg-paper/95 backdrop-blur-sm">
        <Boton variante="texto" onClick={onAtras}>
          Atrás
        </Boton>
        <Boton onClick={onSiguiente} disabled={!puedeContinuar} className="active:scale-95">
          {textoBoton}
        </Boton>
      </div>
    </div>
  );
}
