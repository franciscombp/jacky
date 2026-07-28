import { useState, type ReactNode } from 'react';

interface Props {
  titulo: string;
  children: ReactNode;
  abiertoPorDefecto?: boolean;
}

export function Acordeon({ titulo, children, abiertoPorDefecto = false }: Props) {
  const [abierto, setAbierto] = useState(abiertoPorDefecto);

  return (
    <div>
      <button
        onClick={() => setAbierto((a) => !a)}
        className="w-full flex items-center justify-between py-1 text-left"
      >
        <span className="text-sm font-medium text-pine-800">{titulo}</span>
        <span
          className={`text-pine-600 transition-transform duration-200 ${abierto ? 'rotate-180' : ''}`}
          aria-hidden
        >
          ⌄
        </span>
      </button>
      <div
        className="grid transition-all duration-200 ease-out"
        style={{ gridTemplateRows: abierto ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="pt-3">{children}</div>
        </div>
      </div>
    </div>
  );
}
