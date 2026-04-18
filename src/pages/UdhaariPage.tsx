import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { HandCoins, Bell, CheckCircle2, Mic, AlertTriangle, Plus, X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useProfile } from "@/context/ProfileContext";
import { toast } from "sonner";

type Customer = { id: number; name: string; amount: number; days: number };

export default function UdhaariPage() {
  const { t } = useTranslation();
  const { profile } = useProfile();
  const [list, setList] = useState<Customer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.businessId) {
      setLoading(false);
      return;
    }
    const fetchUdhaar = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("udhaar_records")
          .select(`
            id,
            amount_remaining,
            due_date,
            customers (
              name
            )
          `)
          .eq("business_id", profile.businessId)
          .eq("status", "pending")
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (data) {
          const mapped = data.map((d: any) => {
            let days = 0;
            if (d.due_date) {
              const due = new Date(d.due_date);
              const now = new Date();
              const diffTime = now.getTime() - due.getTime();
              days = diffTime > 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;
            }
            return {
              id: d.id,
              name: d.customers?.name || "Unknown",
              amount: Number(d.amount_remaining),
              days
            };
          });
          setList(mapped);
        }
      } catch (err: any) {
        toast.error("Failed to load udhaar records");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUdhaar();
  }, [profile?.businessId]);

  const total = list.reduce((s, c) => s + c.amount, 0);

  const handleSave = async () => {
    if (!name || !amount || !profile?.businessId) return;
    
    try {
      let customerId;
      const { data: existing } = await supabase
        .from("customers")
        .select("id")
        .eq("business_id", profile.businessId)
        .eq("name", name)
        .maybeSingle();
        
      if (existing) {
        customerId = existing.id;
      } else {
        const { data: newCust, error: custErr } = await supabase
          .from("customers")
          .insert({ name, business_id: profile.businessId })
          .select("id").single();
        if (custErr) throw custErr;
        customerId = newCust.id;
      }

      const { data: newRecord, error } = await supabase
        .from("udhaar_records")
        .insert({
          business_id: profile.businessId,
          customer_id: customerId,
          amount_remaining: Number(amount),
          due_date: dueDate || null,
          status: "pending"
        }).select().single();

      if (error) throw error;

      let days = 0;
      if (dueDate) {
        const diffTime = Date.now() - new Date(dueDate).getTime();
        days = diffTime > 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;
      }

      setList((prev) => [
        { id: newRecord.id, name, amount: Number(amount), days },
        ...prev,
      ]);

      setName(""); setAmount(""); setDueDate(""); setShowForm(false);
      toast.success("Udhaar record saved!");
    } catch (e: any) {
      toast.error(e.message || "Failed to save record");
    }
  };

  const handlePaid = async (id: number) => {
    try {
      const { error } = await supabase
        .from("udhaar_records")
        .update({ status: "paid" })
        .eq("id", id);
      if (error) throw error;
      
      setList(p => p.filter(x => x.id !== id));
      toast.success("Marked as paid!");
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

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
          <button 
            onClick={() => window.location.href = "/add/voice?type=udhaar"}
            className="flex items-center justify-center gap-2 bg-card border-2 border-dashed border-primary/40 rounded-2xl p-3 hover:bg-accent transition-colors">
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
          {list.length === 0 ? (
            <div className="bg-card rounded-2xl p-8 text-center card-shadow mt-4">
              <HandCoins className="w-12 h-12 text-muted-foreground opacity-50 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm font-medium">No pending udhaar records</p>
            </div>
          ) : (
            list.map((c) => {
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
                    onClick={() => handlePaid(c.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-success/10 text-success py-2 rounded-lg text-xs font-semibold active:scale-[0.98] transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> {t("udhaar.paid")}
                  </button>
                </div>
              </div>
            );
          }))}
        </div>
      </div>
    </AppShell>
  );
}
