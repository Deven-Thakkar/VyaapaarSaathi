import AppShell from "@/components/AppShell";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

const topProducts = [
  { name: "Basmati Rice 5kg", qty: 24, revenue: "₹7,200" },
  { name: "Tata Salt 1kg", qty: 18, revenue: "₹1,260" },
  { name: "Amul Butter 500g", qty: 12, revenue: "₹3,000" },
];

const lowStock = [
  { name: "Sugar 1kg", stock: 3, icon: "⚠️" },
  { name: "Cooking Oil 1L", stock: 2, icon: "❌" },
];

const salesData = [40, 55, 45, 70, 60, 85, 75];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function SalesPage() {
  const max = Math.max(...salesData);

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto p-4 lg:p-6">
        <h1 className="text-xl font-bold text-foreground mb-6">Sales</h1>

        <div className="lg:grid lg:grid-cols-2 lg:gap-6">
          <div className="space-y-4">
            {/* Today's Sales */}
            <div className="bg-card rounded-2xl card-shadow-md p-5">
              <p className="text-xs text-muted-foreground font-medium">Today's Sales</p>
              <p className="text-rupee-lg mt-1">₹12,450</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-3.5 h-3.5 text-success" />
                <span className="text-xs font-semibold text-success">+18% vs yesterday</span>
              </div>
            </div>

            {/* Weekly Graph */}
            <div className="bg-card rounded-2xl card-shadow p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">This Week</h3>
              <div className="flex items-end gap-2 h-32">
                {salesData.map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-primary rounded-t-md transition-all"
                      style={{ height: `${(v / max) * 100}%` }}
                    />
                    <span className="text-[9px] text-muted-foreground">{days[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 mt-4 lg:mt-0">
            {/* Top Products */}
            <div className="bg-card rounded-2xl card-shadow p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Top Products</h3>
              <div className="space-y-3">
                {topProducts.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground">{p.qty} sold</p>
                    </div>
                    <p className="text-sm font-bold text-foreground">{p.revenue}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Low Stock Alerts */}
            <div className="bg-card rounded-2xl card-shadow p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Low Stock Alerts</h3>
              <div className="space-y-2">
                {lowStock.map((item) => (
                  <div key={item.name} className="flex items-center gap-3 bg-destructive/5 rounded-xl p-3">
                    <span className="text-lg">{item.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      <p className="text-[10px] text-destructive font-semibold">Only {item.stock} left</p>
                    </div>
                    <button className="text-xs font-semibold text-primary px-3 py-1.5 bg-primary/10 rounded-lg">
                      Restock
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
