import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { TrendingUp, ArrowDownRight, ArrowUpRight, DollarSign } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProfile } from "@/context/ProfileContext";
import { getSalesByBusiness, Sale } from "@/lib/sales-api";
import { useState, useEffect } from "react";

export default function SalesPage() {
  const { t } = useTranslation();
  const { profile } = useProfile();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  // Load sales on mount
  useEffect(() => {
    if (profile.businessId) {
      loadSales();
    }
  }, [profile.businessId]);

  const loadSales = async () => {
    try {
      setLoading(true);
      const data = await getSalesByBusiness(profile.businessId!);
      setSales(data);
    } catch (error) {
      console.error("Failed to load sales:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals for different periods
  const today = new Date().toISOString().split("T")[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const todaySales = sales.filter((s) => s.Date === today || s.created_at?.includes(today));
  const weekSales = sales.filter(
    (s) =>
      (s.Date && s.Date >= sevenDaysAgo && s.Date <= today) ||
      (s.created_at && s.created_at >= sevenDaysAgo && s.created_at <= today)
  );
  const monthSales = sales.filter(
    (s) =>
      (s.Date && s.Date >= thirtyDaysAgo && s.Date <= today) ||
      (s.created_at && s.created_at >= thirtyDaysAgo && s.created_at <= today)
  );

  const todayTotal = todaySales.reduce((sum, s) => sum + s.total_amount, 0);
  const weekTotal = weekSales.reduce((sum, s) => sum + s.total_amount, 0);
  const monthTotal = monthSales.reduce((sum, s) => sum + s.total_amount, 0);

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto p-4 lg:p-6 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            <p className="mt-2 text-muted-foreground">{t("common.loading") || "Loading..."}</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto p-4 lg:p-6">
        <PageHeader title={t("sales.title")} subtitle={t("sales.summary")} />

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <SummaryCard label={t("sales.today")} value={`₹${todayTotal.toLocaleString("en-IN")}`} />
          <SummaryCard label={t("sales.week")} value={`₹${weekTotal.toLocaleString("en-IN")}`} />
          <SummaryCard label={t("sales.month")} value={`₹${monthTotal.toLocaleString("en-IN")}`} />
        </div>

        {/* Sales summary highlight */}
        <div className="bg-gradient-auth rounded-2xl p-5 mb-5 card-shadow-md text-primary-foreground">
          <p className="text-xs font-semibold opacity-90">{t("sales.summary")} — {t("sales.today")}</p>
          <p className="text-4xl font-extrabold mt-1">₹{todayTotal.toLocaleString("en-IN")}</p>
          <p className="text-xs opacity-90 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> {todaySales.length} {t("sales.transactions") || "transactions"} today
          </p>
        </div>

        {/* Recent transactions */}
        <div>
          <h2 className="text-sm font-bold text-heading mb-3">{t("sales.recent")}</h2>
          {sales.length === 0 ? (
            <div className="bg-card rounded-2xl p-8 text-center card-shadow">
              <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">{t("sales.noSales") || "No sales yet"}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sales.slice().reverse().map((s) => (
                <div key={s.id} className="flex items-center gap-3 bg-card rounded-xl card-shadow p-3.5">
                  <div className="w-9 h-9 rounded-full bg-success/10 text-success flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {s.Vendor || "Direct Sale"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {s.Date || new Date(s.created_at!).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-success">₹{s.total_amount.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card rounded-2xl card-shadow p-3">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-base font-extrabold text-heading mt-1">{value}</p>
    </div>
  );
}
