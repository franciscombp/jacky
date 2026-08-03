import type { ReactNode } from 'react';

export function Tarjeta({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white dark:bg-pine-50 shadow-sm ring-1 ring-black/5 dark:ring-white/5 p-5 ${className}`}>
      {children}
    </div>
  );
}
