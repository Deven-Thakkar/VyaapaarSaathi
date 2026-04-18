import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { Search, ChevronRight, Package, ArrowUpRight, ArrowDownRight, PackageSearch, PackageX, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useProfile } from "@/context/ProfileContext";
import { getProductsByBusiness, getLowStockProducts, Product } from "@/lib/products-api";

export default function InventoryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useProfile();
  
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Load products on component mount
  useEffect(() => {
    if (profile.businessId) {
      loadProducts();
    } else {
      setLoading(false);
    }
  }, [profile.businessId]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      if (!profile.businessId) {
        return;
      }

      const data = await getProductsByBusiness(profile.businessId);
      setProducts(data);

      // Count low and critical stock
      const low = data.filter((p) => p.stock <= 10 && p.stock > 0).length;
      const critical = data.filter((p) => p.stock === 0).length;
      setLowStockCount(low);
      setCriticalCount(critical);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  const getProductStatus = (product: Product): "safe" | "warning" | "critical" => {
    if (product.stock === 0) return "critical";
    if (product.stock <= 10) return "warning";
    return "safe";
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.barcode && p.barcode.toLowerCase().includes(search.toLowerCase()))
  );

  const isSelecting = selected.length > 0;
  const toggle = (id: string) =>
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

        {/* Add Product/Stock Button with Dropdown */}
        <div className="relative mb-4">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="w-full bg-gradient-auth text-primary-foreground py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            {t("inventory.addProduct") || "Add Product"}
          </button>

          {/* Dropdown Menu */}
          {showAddMenu && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 overflow-hidden">
              <button
                onClick={() => {
                  navigate("/inventory/add");
                  setShowAddMenu(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-muted border-b border-border/50 last:border-b-0 transition-colors flex items-center gap-2"
              >
                <Package className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{t("inventory.addProduct") || "Add Product"}</p>
                  <p className="text-xs text-muted-foreground">Create a new product</p>
                </div>
              </button>
              <button
                onClick={() => {
                  navigate("/inventory/manual-entry");
                  setShowAddMenu(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-success" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{t("inventory.manual") || "Manual Entry"}</p>
                  <p className="text-xs text-muted-foreground">Add stock to existing product</p>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Stock alert cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-warning/10 border border-warning/30 rounded-2xl card-shadow p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <PackageSearch className="w-4 h-4 text-warning" />
              <span className="text-[10px] font-semibold uppercase tracking-wide text-warning">{t("home.lowStock")}</span>
            </div>
            <p className="text-2xl font-extrabold text-warning">{lowStockCount} <span className="text-sm font-bold text-warning/70">{t("home.items")}</span></p>
            <p className="text-[10px] text-muted-foreground mt-1">{t("home.lowStockSub")}</p>
          </div>
          <div className="bg-destructive/10 border border-destructive/30 rounded-2xl card-shadow p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <PackageX className="w-4 h-4 text-destructive" />
              <span className="text-[10px] font-semibold uppercase tracking-wide text-destructive">{t("home.outOfStock")}</span>
            </div>
            <p className="text-2xl font-extrabold text-destructive">{criticalCount} <span className="text-sm font-bold text-destructive/70">{t("home.items")}</span></p>
            <p className="text-[10px] text-muted-foreground mt-1">{t("home.outOfStockSub")}</p>
          </div>
        </div>

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
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
              <p className="mt-2">{t("common.loading") || "Loading..."}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-card rounded-2xl p-8 text-center card-shadow-sm">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">{search ? "No products found" : "No products added yet"}</p>
            </div>
          ) : (
            filtered.map((p) => {
              const status = getProductStatus(p);
              const s = statusMap[status];
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
                      <span className="text-xs text-muted-foreground">₹{p.price.toFixed(2)}</span>
                      {p.barcode && <span className="text-xs text-muted-foreground">{p.barcode}</span>}
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-full shrink-0 ${s.cls}`}>
                    {s.icon} {s.text}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </button>
              );
            })
          )}
        </div>

        {/* Stock summary */}
        {products.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border">
            <h2 className="text-sm font-bold text-heading mb-3">{t("inventory.summary") || "Summary"}</h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-card rounded-lg p-3 text-center card-shadow-sm">
                <p className="text-2xl font-bold text-foreground">{products.length}</p>
                <p className="text-xs text-muted-foreground mt-1">{t("inventory.total") || "Total Products"}</p>
              </div>
              <div className="bg-card rounded-lg p-3 text-center card-shadow-sm">
                <p className="text-2xl font-bold text-success">{products.reduce((sum, p) => sum + p.stock, 0)}</p>
                <p className="text-xs text-muted-foreground mt-1">{t("inventory.totalStock") || "Total Stock"}</p>
              </div>
              <div className="bg-card rounded-lg p-3 text-center card-shadow-sm">
                <p className="text-2xl font-bold text-warning">{lowStockCount + criticalCount}</p>
                <p className="text-xs text-muted-foreground mt-1">{t("inventory.needs") || "Needs Restock"}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
