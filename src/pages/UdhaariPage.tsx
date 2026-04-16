import AppShell from "@/components/AppShell";
import { HandCoins, Bell, CheckCircle2, Mic, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const initial = [
  { id: 1, name: "Ramesh Kumar", amount: 5200, days: 15 },
  { id: 2, name: "Priya Sharma", amount: 3800, days: 8 },
  { id: 3, name: "Vijay Singh", amount: 8500, days: 22 },
  { id: 4, name: "Sunita Devi", amount: 1200, days: 3 },
  { id: 5, name: "Mohan Lal", amount: 4600, days: 30 },
];

export default function UdhaariPage() {
  const { t } = useTranslation();
  const [list, setList] = useState(initial);
  const total = list.reduce((s, c) => s + c.amount, 0);

  return (
    <AppShell>
      <div className="max-w-lg mx-auto p-4 lg:p-6">
        <h1 className="text-xl font-bold text-heading mb-1">{t("udhaar.title")}</h1>
        <p className="text-sm text-muted-foreground mb-5">{t("udhaar.sub")}</p>

        {/* Total card */}
        <div className="bg-gradient-auth rounded-2xl card-shadow-md p-5 mb-4 text-primary-foreground">
          <div className="flex items-center gap-2 mb-1">
            <HandCoins className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wide opacity-90">{t("udhaar.total")}</span>
          </div>
          <p className="text-4xl font-extrabold mt-1">₹{total.toLocaleString("en-IN")}</p>
          <p className="text-xs opacity-90 mt-1">{list.length} {t("udhaar.customers")}</p>
        </div>

        {/* Voice add */}
        <button className="w-full flex items-center justify-center gap-2 bg-card border-2 border-dashed border-primary/40 rounded-2xl p-4 mb-5 hover:bg-accent transition-colors">
          <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center animate-glow-pulse">
            <Mic className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold text-primary">{t("udhaar.addVoice")}</span>
        </button>

        {/* Customers */}
        <div className="space-y-2">
          {list.map((c) => {
            const overdue = c.days > 20;
            return (
              <div key={c.id} className={`bg-card rounded-2xl card-shadow p-4 ${overdue ? "ring-2 ring-destructive/30" : ""}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent text-primary flex items-center justify-center text-sm font-bold shrink-0">
                    {c.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{c.name}</p>
                    <p className={`text-[11px] font-semibold flex items-center gap-1 ${overdue ? "text-destructive" : c.days > 10 ? "text-warning" : "text-muted-foreground"}`}>
                      {overdue && <AlertTriangle className="w-3 h-3" />}
                      {t("udhaar.daysPending", { days: c.days })}
                      {overdue && ` · ${t("udhaar.overdue")}`}
                    </p>
                  </div>
                  <p className={`text-base font-extrabold ${overdue ? "text-destructive" : "text-heading"}`}>
                    ₹{c.amount.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 flex items-center justify-center gap-1.5 bg-accent text-primary py-2 rounded-lg text-xs font-semibold active:scale-[0.98] transition-all">
                    <Bell className="w-3.5 h-3.5" /> {t("udhaar.remind")}
                  </button>
                  <button
                    onClick={() => setList((p) => p.filter((x) => x.id !== c.id))}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-success/10 text-success py-2 rounded-lg text-xs font-semibold active:scale-[0.98] transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> {t("udhaar.paid")}
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
