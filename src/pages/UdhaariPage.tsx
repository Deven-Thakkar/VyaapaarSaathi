import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { HandCoins, Bell, CheckCircle2, Mic, AlertTriangle, Plus, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type Customer = { id: number; name: string; amount: number; days: number };

const initial: Customer[] = [
  { id: 1, name: "Ramesh Kumar", amount: 5200, days: 15 },
  { id: 2, name: "Priya Sharma", amount: 3800, days: 8 },
  { id: 3, name: "Vijay Singh", amount: 8500, days: 22 },
  { id: 4, name: "Sunita Devi", amount: 1200, days: 3 },
  { id: 5, name: "Mohan Lal", amount: 4600, days: 30 },
];

export default function UdhaariPage() {
  const { t } = useTranslation();
  const [list, setList] = useState<Customer[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  const total = list.reduce((s, c) => s + c.amount, 0);

  const handleSave = () => {
    if (!name || !amount) return;
    const days = dueDate
      ? Math.max(0, Math.round((Date.now() - new Date(dueDate).getTime()) / (1000 * 60 * 60 * 24)))
      : 0;
    setList((prev) => [
      { id: Date.now(), name, amount: Number(amount), days },
      ...prev,
    ]);
    setName(""); setAmount(""); setDueDate(""); setShowForm(false);
  };

  return (
    <AppShell>
      <div className="max-w-lg mx-auto p-4 lg:p-6">
        <PageHeader title={t("udhaar.title")} subtitle={t("udhaar.sub")} />

        {/* Total card */}
        <div className="bg-gradient-auth rounded-2xl card-shadow-md p-5 mb-4 text-primary-foreground">
          <div className="flex items-center gap-2 mb-1">
            <HandCoins className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wide opacity-90">{t("udhaar.total")}</span>
          </div>
          <p className="text-4xl font-extrabold mt-1">₹{total.toLocaleString("en-IN")}</p>
          <p className="text-xs opacity-90 mt-1">{list.length} {t("udhaar.customers")}</p>
        </div>

        {/* Add buttons */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button className="flex items-center justify-center gap-2 bg-card border-2 border-dashed border-primary/40 rounded-2xl p-3 hover:bg-accent transition-colors">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center animate-glow-pulse">
              <Mic className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-primary">{t("udhaar.addVoice")}</span>
          </button>
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center justify-center gap-2 bg-card border-2 border-dashed border-primary/40 rounded-2xl p-3 hover:bg-accent transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            </div>
            <span className="text-xs font-semibold text-primary">{t("udhaar.addManual")}</span>
          </button>
        </div>

        {/* Manual entry form */}
        {showForm && (
          <div className="bg-card rounded-2xl card-shadow p-4 mb-4 space-y-3 animate-fade-up">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{t("udhaar.customerName")}</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("udhaar.customerNamePh")}
                className="w-full mt-1 px-3 py-2.5 bg-muted rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{t("udhaar.amount")}</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={t("udhaar.amountPh")}
                className="w-full mt-1 px-3 py-2.5 bg-muted rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{t("udhaar.dueDate")}</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full mt-1 px-3 py-2.5 bg-muted rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <button
              onClick={handleSave}
              disabled={!name || !amount}
              className="w-full bg-gradient-auth text-primary-foreground font-semibold py-3 rounded-xl text-sm disabled:opacity-50 active:scale-[0.98] transition-all"
            >
              {t("udhaar.save")}
            </button>
          </div>
        )}

        {/* Customers */}
        <div className="space-y-2">
          {list.map((c) => {
            const overdue = c.days > 20;
            return (
              <div key={c.id} className={`bg-card rounded-2xl card-shadow p-4 ${overdue ? "ring-2 ring-destructive/40 bg-destructive/5" : ""}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${overdue ? "bg-destructive/15 text-destructive" : "bg-accent text-primary"}`}>
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
