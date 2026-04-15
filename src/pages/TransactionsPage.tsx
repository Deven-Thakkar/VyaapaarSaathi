import AppShell from "@/components/AppShell";
import { useState } from "react";
import { Search, Filter, ArrowUpRight, ArrowDownLeft } from "lucide-react";

type TxType = "income" | "expense";

interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: TxType;
  category: string;
  date: string;
  time: string;
}

const transactions: Transaction[] = [
  { id: 1, description: "Basmati Rice sold", amount: 1500, type: "income", category: "Grocery", date: "2024-01-15", time: "10:30 AM" },
  { id: 2, description: "Supplier payment", amount: 8500, type: "expense", category: "Restock", date: "2024-01-15", time: "2:00 PM" },
  { id: 3, description: "Amul Butter sold", amount: 825, type: "income", category: "Dairy", date: "2024-01-15", time: "4:15 PM" },
  { id: 4, description: "Electricity bill", amount: 2200, type: "expense", category: "Utilities", date: "2024-01-14", time: "11:00 AM" },
  { id: 5, description: "Tata Salt sold", amount: 560, type: "income", category: "Grocery", date: "2024-01-14", time: "12:30 PM" },
  { id: 6, description: "Transport cost", amount: 1200, type: "expense", category: "Logistics", date: "2024-01-14", time: "3:45 PM" },
  { id: 7, description: "Cooking Oil sold", amount: 3600, type: "income", category: "Grocery", date: "2024-01-13", time: "9:00 AM" },
  { id: 8, description: "Maggi Noodles sold", amount: 420, type: "income", category: "Snacks", date: "2024-01-13", time: "1:20 PM" },
  { id: 9, description: "Rent payment", amount: 15000, type: "expense", category: "Rent", date: "2024-01-13", time: "5:00 PM" },
];

const formatDate = (d: string) => {
  const date = new Date(d);
  return date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
};

export default function TransactionsPage() {
  const [filter, setFilter] = useState<"all" | TxType>("all");
  const [search, setSearch] = useState("");

  const filtered = transactions
    .filter((t) => filter === "all" || t.type === filter)
    .filter((t) => t.description.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()));

  // Group by date
  const grouped = filtered.reduce<Record<string, Transaction[]>>((acc, t) => {
    if (!acc[t.date]) acc[t.date] = [];
    acc[t.date].push(t);
    return acc;
  }, {});

  const totalIncome = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto p-4 lg:p-6">
        <h1 className="text-xl font-bold text-heading mb-1">Transactions</h1>
        <p className="text-sm text-muted-foreground mb-5">Recent activity</p>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-success/10 rounded-2xl p-4">
            <p className="text-[10px] text-muted-foreground font-medium">Total Income</p>
            <p className="text-xl font-extrabold text-success">₹{totalIncome.toLocaleString("en-IN")}</p>
          </div>
          <div className="bg-destructive/10 rounded-2xl p-4">
            <p className="text-[10px] text-muted-foreground font-medium">Total Expense</p>
            <p className="text-xl font-extrabold text-destructive">₹{totalExpense.toLocaleString("en-IN")}</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 flex items-center gap-2 bg-card rounded-xl card-shadow px-3 py-2.5">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transactions..."
              className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-5">
          {(["all", "income", "expense"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover-blue"
              }`}
            >
              {f === "all" ? "All" : f === "income" ? "💚 Income" : "🔴 Expense"}
            </button>
          ))}
        </div>

        {/* Transaction List */}
        <div className="space-y-5">
          {Object.entries(grouped).map(([date, txs]) => (
            <div key={date}>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
                {formatDate(date)}
              </p>
              <div className="space-y-2">
                {txs.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 bg-card rounded-xl card-shadow p-4 hover-blue transition-colors">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      t.type === "income" ? "bg-success/10" : "bg-destructive/10"
                    }`}>
                      {t.type === "income" ? (
                        <ArrowDownLeft className="w-4 h-4 text-success" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-destructive" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{t.description}</p>
                      <p className="text-[10px] text-muted-foreground">{t.category} • {t.time}</p>
                    </div>
                    <p className={`text-sm font-bold ${t.type === "income" ? "text-success" : "text-destructive"}`}>
                      {t.type === "income" ? "+" : "-"}₹{t.amount.toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
