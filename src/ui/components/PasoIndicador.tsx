export function PasoIndicador({ paso, total }: { paso: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full ${i < paso ? 'bg-pine-600' : 'bg-pine-100'}`}
        />
      ))}
    </div>
  );
}
