import AppShell from "@/components/AppShell";
import StatusBadge from "@/components/StatusBadge";
import { Package, AlertTriangle, XCircle, ChevronRight, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const products = [
  { id: 1, name: "Basmati Rice 5kg", stock: 45, price: 300, status: "safe" as const },
  { id: 2, name: "Tata Salt 1kg", stock: 8, price: 28, status: "warning" as const },
  { id: 3, name: "Sugar 1kg", stock: 3, price: 45, status: "critical" as const },
  { id: 4, name: "Cooking Oil 1L", stock: 2, price: 180, status: "critical" as const },
  { id: 5, name: "Amul Butter 500g", stock: 22, price: 275, status: "safe" as const },
  { id: 6, name: "Maggi Noodles", stock: 6, price: 14, status: "warning" as const },
  { id: 7, name: "Parle-G Biscuit", stock: 50, price: 10, status: "safe" as const },
  { id: 8, name: "Surf Excel 1kg", stock: 15, price: 220, status: "safe" as const },
];

const statusIcon = {
  safe: "✅",
  warning: "⚠️",
  critical: "❌",
};

const statusText = {
  safe: "In Stock",
  warning: "Low Stock",
  critical: "Very Low",
};

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const navigate = useNavigate();

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const isSelecting = selectedIds.length > 0;

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto p-4 lg:p-6">
        {/* Selection Bar */}
        {isSelecting && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between lg:ml-64">
            <span className="text-sm font-semibold">{selectedIds.length} selected</span>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-primary-foreground/20 rounded-lg text-xs font-semibold">Restock</button>
              <button className="px-3 py-1.5 bg-primary-foreground/20 rounded-lg text-xs font-semibold">Update Price</button>
              <button className="px-3 py-1.5 bg-destructive rounded-lg text-xs font-semibold">Delete</button>
              <button onClick={() => setSelectedIds([])} className="px-3 py-1.5 text-xs font-semibold">Cancel</button>
            </div>
          </div>
        )}

        <h1 className="text-xl font-bold text-foreground mb-1">Inventory</h1>
        <p className="text-sm text-muted-foreground mb-5">Manage your stock</p>

        <div className="lg:grid lg:grid-cols-3 lg:gap-6">
          {/* Overview Cards */}
          <div className="lg:col-span-1 space-y-3 mb-5 lg:mb-0">
            <div className="bg-card rounded-2xl card-shadow-md p-4">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Inventory Health</span>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-muted-foreground">Total Stock Value</p>
                  <p className="text-2xl font-extrabold text-foreground">₹2,45,000</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 bg-warning/10 rounded-xl p-2.5">
                    <p className="text-lg font-bold text-warning">4</p>
                    <p className="text-[10px] text-muted-foreground">Low Stock</p>
                  </div>
                  <div className="flex-1 bg-destructive/10 rounded-xl p-2.5">
                    <p className="text-lg font-bold text-destructive">2</p>
                    <p className="text-[10px] text-muted-foreground">Critical</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl card-shadow p-4 space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Smart Insights</h3>
              <div className="flex items-center gap-2 bg-warning/5 rounded-xl p-3">
                <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
                <p className="text-xs text-foreground">12 items need restock this week</p>
              </div>
              <div className="flex items-center gap-2 bg-destructive/5 rounded-xl p-3">
                <XCircle className="w-4 h-4 text-destructive shrink-0" />
                <p className="text-xs text-foreground">3 dead stock items — consider discounting</p>
              </div>
            </div>
          </div>

          {/* Product List */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 bg-card rounded-xl card-shadow px-3 py-2.5 mb-4">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/50"
              />
            </div>

            <p className="text-[10px] text-muted-foreground mb-2 px-1">Long press to select multiple items</p>

            <div className="space-y-2">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => isSelecting ? toggleSelect(p.id) : navigate(`/inventory/${p.id}`)}
                  onContextMenu={(e) => { e.preventDefault(); toggleSelect(p.id); }}
                  className={`w-full flex items-center gap-3 bg-card rounded-xl card-shadow p-4 text-left active:scale-[0.99] transition-all ${
                    selectedIds.includes(p.id) ? "ring-2 ring-primary" : ""
                  }`}
                >
                  {isSelecting && (
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                      selectedIds.includes(p.id) ? "bg-primary border-primary text-primary-foreground" : "border-border"
                    }`}>
                      {selectedIds.includes(p.id) && <span className="text-xs">✓</span>}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground">Stock: <span className="font-bold text-foreground">{p.stock}</span></span>
                      <span className="text-xs text-muted-foreground">₹{p.price}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                      p.status === "safe" ? "bg-success/10 text-success" :
                      p.status === "warning" ? "bg-warning/10 text-warning" :
                      "bg-destructive/10 text-destructive"
                    }`}>
                      {statusIcon[p.status]} {statusText[p.status]}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
