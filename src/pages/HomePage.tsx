import AppShell from "@/components/AppShell";
import StatusBadge from "@/components/StatusBadge";
import InsightCard from "@/components/InsightCard";
import CashFlowChart from "@/components/CashFlowChart";
import AiOrb from "@/components/AiOrb";
import { Wallet, TrendingUp, TrendingDown, ArrowDownRight, Package, IndianRupee, Receipt, HandCoins } from "lucide-react";
import { useEffect, useState } from "react";

function AnimatedNumber({ value, prefix = "" }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 800;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <>{prefix}{display.toLocaleString("en-IN")}</>;
}

const summaryCards = [
  { icon: Wallet, label: "Cash Balance", value: 124500, trend: "↑ 8% vs last week", trendUp: true },
  { icon: TrendingUp, label: "Income (MTD)", value: 285000, trend: "↑ 12% growth", trendUp: true },
  { icon: TrendingDown, label: "Expenses (MTD)", value: 161000, trend: "↓ 5% reduced", trendUp: false },
  { icon: HandCoins, label: "Receivables", value: 23300, trend: "₹15,000 overdue", trendUp: false },
];

const quickActions = [
  { label: "Collect ₹5,000", desc: "From Ramesh Kumar", icon: "💰" },
  { label: "Restock Sugar", desc: "Only 3 left", icon: "📦" },
  { label: "Cut expenses", desc: "₹8K savings possible", icon: "✂️" },
];

export default function HomePage() {
  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Good morning</p>
            <h1 className="text-xl font-bold text-heading">Rahul's Store</h1>
          </div>
          <StatusBadge status="warning" />
        </div>

        {/* Summary Cards - horizontal scroll mobile, grid desktop */}
        <div className="flex gap-3 overflow-x-auto pb-2 mb-5 -mx-4 px-4 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-4 lg:overflow-visible scrollbar-hide">
          {summaryCards.map((card, i) => (
            <div
              key={card.label}
              className="min-w-[160px] lg:min-w-0 bg-card rounded-2xl card-shadow p-4 flex-shrink-0 animate-fade-up hover-blue cursor-default"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <card.icon className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{card.label}</span>
              </div>
              <p className="text-2xl font-extrabold text-heading">
                <AnimatedNumber value={card.value} prefix="₹" />
              </p>
              <p className={`text-[10px] font-semibold mt-1 ${card.trendUp ? "text-success" : "text-destructive"}`}>
                {card.trend}
              </p>
            </div>
          ))}
        </div>

        <div className="lg:grid lg:grid-cols-5 lg:gap-6">
          {/* Left column */}
          <div className="lg:col-span-3 space-y-5">
            {/* Cash Display */}
            <div className="bg-card rounded-2xl card-shadow-md p-5">
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cash Status</span>
              </div>
              <p className="text-rupee-lg animate-count-up">
                <AnimatedNumber value={124500} prefix="₹" />
              </p>
              <div className="flex items-center gap-6 mt-3">
                <div>
                  <p className="text-[10px] text-muted-foreground">Days left</p>
                  <p className="text-lg font-bold text-warning">12 days</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Risk Score</p>
                  <p className="text-lg font-bold text-heading">6.2/10</p>
                </div>
              </div>
            </div>

            {/* Cash Flow Chart */}
            <CashFlowChart />

            {/* Bolna AI Orb */}
            <div className="flex flex-col items-center py-6">
              <AiOrb />
              <div className="flex flex-wrap gap-2 mt-6 justify-center">
                {["Aaj ki sales kitni hai?", "Kitna stock bacha hai?", "Mera cash safe hai?"].map((q) => (
                  <span key={q} className="text-[10px] bg-accent text-accent-foreground px-3 py-1.5 rounded-full font-medium cursor-pointer hover-blue">
                    "{q}"
                  </span>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div className="space-y-2">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">AI Insights</h2>
              <InsightCard icon="💰" text="₹15,000 stuck in udhaari from 3 customers" action="Send reminders" variant="warning" />
              <InsightCard icon="📦" text="12 items running low on stock" action="View & restock" variant="critical" />
              <InsightCard icon="🎉" text="Diwali in 3 weeks — increase stock of sweets & gifting items" action="See suggestions" variant="info" />
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-4 mt-5 lg:mt-0">
            {/* Today's Actions */}
            <div className="bg-card rounded-2xl card-shadow p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">⚡ Today's Actions</h3>
              <div className="space-y-2">
                {quickActions.map((a) => (
                  <button key={a.label} className="w-full flex items-center gap-3 p-3 rounded-xl bg-background hover-blue text-left transition-colors active:scale-[0.98]">
                    <span className="text-xl">{a.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{a.label}</p>
                      <p className="text-[10px] text-muted-foreground">{a.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Inventory Snapshot */}
            <div className="bg-card rounded-2xl card-shadow p-4">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Inventory Snapshot</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-warning/10 rounded-xl p-3">
                  <p className="text-lg font-bold text-warning">12</p>
                  <p className="text-[10px] text-muted-foreground">Low stock items</p>
                </div>
                <div className="bg-destructive/10 rounded-xl p-3">
                  <p className="text-lg font-bold text-destructive">3</p>
                  <p className="text-[10px] text-muted-foreground">Out of stock</p>
                </div>
              </div>
            </div>

            {/* Today's Snapshot */}
            <div className="bg-card rounded-2xl card-shadow p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Today's Snapshot</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Sales", value: "₹8,450", trend: "+12%" },
                  { label: "Expenses", value: "₹3,200", trend: "-5%" },
                  { label: "New Credit", value: "₹2,100", trend: "" },
                  { label: "Collected", value: "₹5,000", trend: "+8%" },
                ].map((item) => (
                  <div key={item.label} className="bg-background rounded-xl p-3">
                    <p className="text-[10px] text-muted-foreground">{item.label}</p>
                    <p className="text-lg font-bold text-heading">{item.value}</p>
                    {item.trend && (
                      <span className={`text-[10px] font-semibold ${item.trend.startsWith("+") ? "text-success" : "text-destructive"}`}>
                        {item.trend}
                      </span>
                    )}
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
