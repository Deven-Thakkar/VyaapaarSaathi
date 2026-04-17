import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { TrendingUp, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const transactions = [
  { id: 1, name: "Basmati Rice 5kg", qty: 2, amount: 600, time: "2:45 PM" },
  { id: 2, name: "Amul Butter 500g", qty: 1, amount: 275, time: "1:30 PM" },
  { id: 3, name: "Sugar 1kg", qty: 3, amount: 135, time: "12:10 PM" },
  { id: 4, name: "Cooking Oil 1L", qty: 2, amount: 360, time: "11:20 AM" },
  { id: 5, name: "Maggi Noodles", qty: 5, amount: 70, time: "10:15 AM" },
  { id: 6, name: "Tata Salt 1kg", qty: 4, amount: 112, time: "9:30 AM" },
];

export default function SalesPage() {
  const { t } = useTranslation();
  const total = transactions.reduce((s, x) => s + x.amount, 0);

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto p-4 lg:p-6">
        <PageHeader title={t("sales.title")} subtitle={t("sales.summary")} />

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <SummaryCard label={t("sales.today")} value="₹12,450" trend="+18%" up />
          <SummaryCard label={t("sales.week")} value="₹68,200" trend="+9%" up />
          <SummaryCard label={t("sales.month")} value="₹2,85,000" trend="-3%" up={false} />
        </div>

        {/* Sales summary highlight */}
        <div className="bg-gradient-auth rounded-2xl p-5 mb-5 card-shadow-md text-primary-foreground">
          <p className="text-xs font-semibold opacity-90">{t("sales.summary")} — {t("sales.today")}</p>
          <p className="text-4xl font-extrabold mt-1">₹{total.toLocaleString("en-IN")}</p>
          <p className="text-xs opacity-90 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> {transactions.length} transactions today
          </p>
        </div>

        {/* Recent transactions */}
        <div>
          <h2 className="text-sm font-bold text-heading mb-3">{t("sales.recent")}</h2>
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 bg-card rounded-xl card-shadow p-3.5">
                <div className="w-9 h-9 rounded-full bg-success/10 text-success flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{tx.name}</p>
                  <p className="text-[11px] text-muted-foreground">Qty {tx.qty} · {tx.time}</p>
                </div>
                <p className="text-sm font-bold text-success">+₹{tx.amount}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function SummaryCard({ label, value, trend, up }: { label: string; value: string; trend: string; up: boolean }) {
  return (
    <div className="bg-card rounded-2xl card-shadow p-3">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-base font-extrabold text-heading mt-1">{value}</p>
      <p className={`text-[10px] font-semibold mt-0.5 flex items-center gap-0.5 ${up ? "text-success" : "text-destructive"}`}>
        {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />} {trend}
      </p>
    </div>
  );
}
