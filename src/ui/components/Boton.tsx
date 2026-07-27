import type { ButtonHTMLAttributes } from 'react';

interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primario' | 'secundario' | 'texto';
}

export function Boton({ variante = 'primario', className = '', ...props }: BotonProps) {
  const base = 'rounded-xl px-5 py-3 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
  const estilos = {
    primario: 'bg-pine-700 text-white hover:bg-pine-800',
    secundario: 'bg-pine-50 text-pine-800 hover:bg-pine-100',
    texto: 'text-pine-700 hover:underline px-1',
  };
  return <button className={`${base} ${estilos[variante]} ${className}`} {...props} />;
}
