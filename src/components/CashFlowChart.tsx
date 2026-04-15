import { Area, AreaChart, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from "recharts";

const data = [
  { month: "Jan", actual: 85000 },
  { month: "Feb", actual: 92000 },
  { month: "Mar", actual: 78000 },
  { month: "Apr", actual: 105000 },
  { month: "May", actual: 95000 },
  { month: "Jun", actual: 115000 },
  { month: "Jul", actual: 108000 },
  { month: "Aug", actual: 124500 },
  { month: "Sep", actual: null, predicted: 118000 },
  { month: "Oct", actual: null, predicted: 110000 },
  { month: "Nov", actual: null, predicted: 105000 },
];

export default function CashFlowChart() {
  return (
    <div className="bg-card rounded-2xl card-shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cash Flow</h3>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> Actual</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary/30 border border-dashed border-primary" /> Predicted</span>
        </div>
      </div>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(215,16%,47%)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "hsl(215,16%,47%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
            <Area type="monotone" dataKey="actual" stroke="hsl(217,91%,60%)" fill="url(#blueGrad)" strokeWidth={2} dot={false} connectNulls={false} />
            <Area type="monotone" dataKey="predicted" stroke="hsl(217,91%,60%)" fill="url(#blueGrad)" strokeWidth={2} strokeDasharray="6 3" dot={false} fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10px] text-warning font-medium mt-2 text-center">
        ⚠️ Cash may drop below safe level in 18 days
      </p>
    </div>
  );
}
