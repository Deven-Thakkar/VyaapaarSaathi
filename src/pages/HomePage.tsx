import AppShell from "@/components/AppShell";
import StatusBadge from "@/components/StatusBadge";
import VoiceButton from "@/components/VoiceButton";
import InsightCard from "@/components/InsightCard";
import MiniGraph from "@/components/MiniGraph";
import { Wallet } from "lucide-react";

export default function HomePage() {
  return (
    <AppShell>
      <div className="max-w-5xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Good morning</p>
            <h1 className="text-xl font-bold text-foreground">Rahul's Store</h1>
          </div>
          <StatusBadge status="warning" />
        </div>

        <div className="lg:grid lg:grid-cols-5 lg:gap-6">
          {/* Left column */}
          <div className="lg:col-span-3 space-y-4">
            {/* Cash Status Card */}
            <div className="bg-card rounded-2xl card-shadow-md p-5">
              <div className="flex items-center gap-2 mb-3">
                <Wallet className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cash Status</span>
              </div>
              <p className="text-rupee-lg">₹1,24,500</p>
              <div className="flex items-center gap-4 mt-3">
                <div>
                  <p className="text-[10px] text-muted-foreground">Days left</p>
                  <p className="text-lg font-bold text-warning">12 days</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Risk Score</p>
                  <p className="text-lg font-bold text-foreground">6.2/10</p>
                </div>
              </div>
            </div>

            {/* Voice Assistant */}
            <div className="flex flex-col items-center py-6">
              <VoiceButton />
              <p className="text-xs text-muted-foreground mt-8">Tap to speak • "Kitna rice bacha hai?"</p>
            </div>

            {/* AI Insights */}
            <div className="space-y-2">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">AI Insights</h2>
              <InsightCard
                icon="💰"
                text="₹15,000 stuck in udhaari from 3 customers"
                action="Send reminders"
                variant="warning"
              />
              <InsightCard
                icon="📦"
                text="12 items running low on stock"
                action="View & restock"
                variant="critical"
              />
              <InsightCard
                icon="🎉"
                text="Diwali in 3 weeks — increase stock of sweets & gifting items"
                action="See suggestions"
                variant="info"
              />
            </div>
          </div>

          {/* Right column - Desktop */}
          <div className="lg:col-span-2 space-y-4 mt-4 lg:mt-0">
            <MiniGraph />

            <div className="bg-card rounded-2xl card-shadow p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Today's Snapshot</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Sales", value: "₹8,450", trend: "+12%" },
                  { label: "Expenses", value: "₹3,200", trend: "-5%" },
                  { label: "New Credit", value: "₹2,100", trend: "" },
                  { label: "Collected", value: "₹5,000", trend: "+8%" },
                ].map((item) => (
                  <div key={item.label} className="bg-secondary/50 rounded-xl p-3">
                    <p className="text-[10px] text-muted-foreground">{item.label}</p>
                    <p className="text-lg font-bold text-foreground">{item.value}</p>
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
