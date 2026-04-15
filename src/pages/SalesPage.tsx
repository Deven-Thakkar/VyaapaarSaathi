import AppShell from "@/components/AppShell";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const revenueExpense = [
  { month: "Jan", revenue: 85000, expense: 62000 },
  { month: "Feb", revenue: 92000, expense: 68000 },
  { month: "Mar", revenue: 78000, expense: 71000 },
  { month: "Apr", revenue: 105000, expense: 65000 },
  { month: "May", revenue: 95000, expense: 72000 },
  { month: "Jun", revenue: 115000, expense: 80000 },
  { month: "Jul", revenue: 108000, expense: 85000 },
];

const profitData = revenueExpense.map((d) => ({ month: d.month, profit: d.revenue - d.expense }));

const categoryData = [
  { name: "Grocery", value: 45 },
  { name: "Dairy", value: 20 },
  { name: "Snacks", value: 15 },
  { name: "Cleaning", value: 12 },
  { name: "Other", value: 8 },
];
const COLORS = ["hsl(217,91%,60%)", "hsl(142,71%,45%)", "hsl(38,92%,50%)", "hsl(0,84%,60%)", "hsl(215,16%,47%)"];

const topProducts = [
  { name: "Basmati Rice 5kg", revenue: 72000 },
  { name: "Amul Butter 500g", revenue: 48000 },
  { name: "Tata Salt 1kg", revenue: 35000 },
  { name: "Cooking Oil 1L", revenue: 28000 },
  { name: "Maggi Noodles", revenue: 22000 },
];
const maxRevenue = Math.max(...topProducts.map((p) => p.revenue));

const lowStock = [
  { name: "Sugar 1kg", stock: 3, icon: "❌" },
  { name: "Cooking Oil 1L", stock: 2, icon: "❌" },
  { name: "Maggi Noodles", stock: 6, icon: "⚠️" },
];

export default function SalesPage() {
  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-4 lg:p-6">
        <h1 className="text-xl font-bold text-heading mb-1">Sales</h1>
        <p className="text-sm text-muted-foreground mb-5">Analytics & performance</p>

        {/* Today's Sales */}
        <div className="bg-card rounded-2xl card-shadow-md p-5 mb-5">
          <p className="text-xs text-muted-foreground font-medium">Today's Sales</p>
          <p className="text-rupee-lg mt-1">₹12,450</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-3.5 h-3.5 text-success" />
            <span className="text-xs font-semibold text-success">+18% vs yesterday</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Revenue vs Expense */}
          <div className="bg-card rounded-2xl card-shadow p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Revenue vs Expense</h3>
            <p className="text-[10px] text-warning font-medium mb-3">⚠️ Expenses exceeded revenue in March</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueExpense} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
                  <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(142,71%,45%)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="expense" stroke="hsl(0,84%,60%)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Profit Trend */}
          <div className="bg-card rounded-2xl card-shadow p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Profit Trend</h3>
            <p className="text-[10px] text-success font-medium mb-3">✅ Profit increasing steadily</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={profitData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(142,71%,45%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(142,71%,45%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
                  <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                  <Area type="monotone" dataKey="profit" stroke="hsl(142,71%,45%)" fill="url(#profitGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Pie */}
          <div className="bg-card rounded-2xl card-shadow p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Sales by Category</h3>
            <div className="h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" outerRadius={70} innerRadius={40} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-card rounded-2xl card-shadow p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Top Products</h3>
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-primary">{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-foreground">{p.name}</p>
                    <div className="w-full bg-border rounded-full h-1.5 mt-1">
                      <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${(p.revenue / maxRevenue) * 100}%` }} />
                    </div>
                  </div>
                  <p className="text-xs font-bold text-heading">₹{(p.revenue / 1000).toFixed(0)}K</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-card rounded-2xl card-shadow p-4 mt-5">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Low Stock Alerts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {lowStock.map((item) => (
              <div key={item.name} className="flex items-center gap-3 bg-destructive/5 rounded-xl p-3">
                <span className="text-lg">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-[10px] text-destructive font-semibold">Only {item.stock} left</p>
                </div>
                <button className="text-xs font-semibold text-primary px-3 py-1.5 bg-accent rounded-lg hover-blue">Restock</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
