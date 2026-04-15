import AppShell from "@/components/AppShell";
import StatusBadge from "@/components/StatusBadge";
import { ArrowLeft, Barcode, TrendingDown } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const productData: Record<string, any> = {
  "1": { name: "Basmati Rice 5kg", stock: 45, price: 300, margin: "18%", supplier: "Agro Traders", barcode: "8901234567890", status: "safe", usage: [50, 48, 45, 42, 40, 38, 35], insight: "Stock is healthy. Next reorder in ~12 days." },
  "2": { name: "Tata Salt 1kg", stock: 8, price: 28, margin: "12%", supplier: "Local Wholesale", barcode: "8901234567891", status: "warning", usage: [30, 25, 20, 16, 12, 10, 8], insight: "Will run out in 4 days at current rate." },
  "3": { name: "Sugar 1kg", stock: 3, price: 45, margin: "15%", supplier: "Sweet Distributors", barcode: "8901234567892", status: "critical", usage: [25, 20, 15, 12, 8, 5, 3], insight: "⚠️ Critical! Restock immediately — will run out tomorrow." },
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = productData[id || "1"] || productData["1"];
  const max = Math.max(...product.usage);

  return (
    <AppShell>
      <div className="max-w-lg mx-auto p-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="bg-card rounded-2xl card-shadow-md p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-bold text-foreground">{product.name}</h1>
            <StatusBadge status={product.status} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Stock", value: product.stock },
              { label: "Price", value: `₹${product.price}` },
              { label: "Margin", value: product.margin },
              { label: "Supplier", value: product.supplier },
            ].map((item) => (
              <div key={item.label} className="bg-secondary/50 rounded-xl p-3">
                <p className="text-[10px] text-muted-foreground">{item.label}</p>
                <p className="text-base font-bold text-foreground">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-4 bg-secondary/50 rounded-xl p-3">
            <Barcode className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-mono">{product.barcode}</span>
          </div>
        </div>

        {/* Usage Graph */}
        <div className="bg-card rounded-2xl card-shadow p-4 mb-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Stock Usage (7 days)</h3>
          <div className="flex items-end gap-2 h-24">
            {product.usage.map((v: number, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t-md transition-all ${
                    v <= 5 ? "bg-destructive" : v <= 15 ? "bg-warning" : "bg-primary"
                  }`}
                  style={{ height: `${(v / max) * 100}%` }}
                />
                <span className="text-[8px] text-muted-foreground">D{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insight */}
        <div className={`rounded-2xl p-4 border-l-4 ${
          product.status === "critical" ? "bg-destructive/5 border-l-destructive" :
          product.status === "warning" ? "bg-warning/5 border-l-warning" :
          "bg-primary/5 border-l-primary"
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">🤖</span>
            <span className="text-xs font-semibold text-muted-foreground">AI Insight</span>
          </div>
          <p className="text-sm font-medium text-foreground">{product.insight}</p>
        </div>

        <div className="flex gap-3 mt-5">
          <button className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm active:scale-[0.98] transition-all">
            Restock
          </button>
          <button className="flex-1 bg-secondary text-foreground py-3 rounded-xl font-semibold text-sm active:scale-[0.98] transition-all">
            Edit
          </button>
        </div>
      </div>
    </AppShell>
  );
}
