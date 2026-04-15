const data = [30, 45, 35, 60, 50, 70, 55, 80, 65, 75, 90, 85];
const predicted = [85, 78, 82, 88];

export default function MiniGraph() {
  const all = [...data, ...predicted];
  const max = Math.max(...all);
  const w = 100 / all.length;

  return (
    <div className="w-full bg-card rounded-lg card-shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cash Flow</h3>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> Actual</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary/30" /> Predicted</span>
        </div>
      </div>
      <svg viewBox="0 0 100 40" className="w-full h-20" preserveAspectRatio="none">
        {all.map((v, i) => {
          const h = (v / max) * 36;
          const isPredicted = i >= data.length;
          return (
            <rect
              key={i}
              x={i * w + w * 0.15}
              y={40 - h}
              width={w * 0.7}
              rx={1}
              height={h}
              className={isPredicted ? "fill-primary/25" : "fill-primary"}
            />
          );
        })}
      </svg>
    </div>
  );
}
