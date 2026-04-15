import AppShell from "@/components/AppShell";
import { HandCoins, ChevronRight, Bell, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const customers = [
  { id: 1, name: "Ramesh Kumar", amount: 5200, days: 15 },
  { id: 2, name: "Priya Sharma", amount: 3800, days: 8 },
  { id: 3, name: "Vijay Singh", amount: 8500, days: 22 },
  { id: 4, name: "Sunita Devi", amount: 1200, days: 3 },
  { id: 5, name: "Mohan Lal", amount: 4600, days: 30 },
];

export default function UdhaariPage() {
  const [list, setList] = useState(customers);

  const totalDue = list.reduce((sum, c) => sum + c.amount, 0);

  const markPaid = (id: number) => {
    setList((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <AppShell>
      <div className="max-w-lg mx-auto p-4 lg:p-6">
        <h1 className="text-xl font-bold text-foreground mb-1">Udhaari</h1>
        <p className="text-sm text-muted-foreground mb-5">Credit given to customers</p>

        {/* Total Card */}
        <div className="bg-card rounded-2xl card-shadow-md p-5 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <HandCoins className="w-4 h-4 text-warning" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total Outstanding</span>
          </div>
          <p className="text-rupee">₹{totalDue.toLocaleString("en-IN")}</p>
          <p className="text-xs text-muted-foreground mt-1">{list.length} customers</p>
        </div>

        {/* Customer List */}
        <div className="space-y-2">
          {list.map((c) => {
            const severity = c.days > 20 ? "destructive" : c.days > 10 ? "warning" : "muted-foreground";
            return (
              <div
                key={c.id}
                className="bg-card rounded-xl card-shadow p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-foreground">
                    {c.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{c.name}</p>
                    <p className={`text-[10px] font-semibold text-${severity}`}>
                      {c.days} days pending
                    </p>
                  </div>
                  <p className="text-base font-bold text-foreground">₹{c.amount.toLocaleString("en-IN")}</p>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 flex items-center justify-center gap-1.5 bg-primary/10 text-primary py-2 rounded-lg text-xs font-semibold active:scale-[0.98] transition-all">
                    <Bell className="w-3.5 h-3.5" /> Remind
                  </button>
                  <button
                    onClick={() => markPaid(c.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-success/10 text-success py-2 rounded-lg text-xs font-semibold active:scale-[0.98] transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
