import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { Search, ChevronRight, Package, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const products = [
  { id: 1, name: "Basmati Rice 5kg", stock: 45, price: 300, status: "safe" as const },
  { id: 2, name: "Tata Salt 1kg", stock: 8, price: 28, status: "warning" as const },
  { id: 3, name: "Sugar 1kg", stock: 3, price: 45, status: "critical" as const },
  { id: 4, name: "Cooking Oil 1L", stock: 2, price: 180, status: "critical" as const },
  { id: 5, name: "Amul Butter 500g", stock: 22, price: 275, status: "safe" as const },
  { id: 6, name: "Maggi Noodles", stock: 6, price: 14, status: "warning" as const },
  { id: 7, name: "Parle-G Biscuit", stock: 50, price: 10, status: "safe" as const },
];

const recentTx = [
  { id: 1, name: "Basmati Rice 5kg", change: -2, time: "2:45 PM" },
  { id: 2, name: "Sugar 1kg", change: +20, time: "1:00 PM" },
  { id: 3, name: "Maggi Noodles", change: -5, time: "10:15 AM" },
];

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  const isSelecting = selected.length > 0;
  const toggle = (id: number) =>
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const statusMap = {
    safe: { icon: "✅", text: t("inventory.inStock"), cls: "bg-success/10 text-success" },
    warning: { icon: "⚠️", text: t("inventory.low"), cls: "bg-warning/10 text-warning" },
    critical: { icon: "❌", text: t("inventory.critical"), cls: "bg-destructive/10 text-destructive" },
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto p-4 lg:p-6">
        {isSelecting && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between md:ml-16">
            <span className="text-sm font-semibold">{selected.length} selected</span>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-primary-foreground/20 rounded-lg text-xs font-semibold">Restock</button>
              <button className="px-3 py-1.5 bg-primary-foreground/20 rounded-lg text-xs font-semibold">Update Price</button>
              <button className="px-3 py-1.5 bg-destructive rounded-lg text-xs font-semibold">Delete</button>
              <button onClick={() => setSelected([])} className="px-3 py-1.5 text-xs">Cancel</button>
            </div>
          </div>
        )}

        <PageHeader title={t("inventory.title")} subtitle={t("inventory.products")} />

        {/* Search */}
        <div className="flex items-center gap-2 bg-card rounded-xl card-shadow px-3 py-2.5 mb-4">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Product cards */}
        <div className="space-y-2 mb-6">
          {filtered.map((p) => {
            const s = statusMap[p.status];
            return (
              <button
                key={p.id}
                onClick={() => (isSelecting ? toggle(p.id) : navigate(`/inventory/${p.id}`))}
                onContextMenu={(e) => { e.preventDefault(); toggle(p.id); }}
                className={`w-full flex items-center gap-3 bg-card rounded-xl card-shadow p-4 text-left active:scale-[0.99] transition-all ${
                  selected.includes(p.id) ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-accent text-primary flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-muted-foreground">{t("inventory.stock")}: <span className="font-bold text-foreground">{p.stock}</span></span>
                    <span className="text-xs text-muted-foreground">₹{p.price}</span>
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-1 rounded-full shrink-0 ${s.cls}`}>
                  {s.icon} {s.text}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
            );
          })}
        </div>

        {/* Recent transactions */}
        <h2 className="text-sm font-bold text-heading mb-3">{t("inventory.recent")}</h2>
        <div className="space-y-2">
          {recentTx.map((tx) => (
            <div key={tx.id} className="flex items-center gap-3 bg-card rounded-xl card-shadow p-3.5">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${tx.change > 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                {tx.change > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{tx.name}</p>
                <p className="text-[11px] text-muted-foreground">{tx.time}</p>
              </div>
              <p className={`text-sm font-bold ${tx.change > 0 ? "text-success" : "text-destructive"}`}>
                {tx.change > 0 ? "+" : ""}{tx.change}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
