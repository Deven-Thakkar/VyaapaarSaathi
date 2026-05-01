import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import WhatsappInsightsDrawer from "@/components/WhatsappInsightsDrawer";
import { Wallet, TrendingUp, TrendingDown, HandCoins, Sparkles, ChevronRight, AlertTriangle, IndianRupee, PhoneCall, MessageSquare, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { triggerBolnaCall } from "@/lib/chatbot-api";
import { useProfile } from "@/context/ProfileContext";
import { API_BASE } from "@/lib/chatbot-api";
import { toast } from "sonner";
import SmartInsights from "@/components/SmartInsights";

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

interface PredictData {
  cashflow_prediction: number;
  risk_prediction: number;
  meta: {
    sales: number;
    expenses: number;
    udhaar_given: number;
    overdue_udhaar: number;
    inventory_value: number;
    has_data: boolean;
  };
}

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [isCalling, setIsCalling] = useState(false);
  const [predictData, setPredictData] = useState<PredictData | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  // Fetch real business data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE}/predict`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ business_id: profile?.businessId ?? null }),
        });
        if (res.ok) {
          const data = await res.json();
          setPredictData(data);
        }
      } catch (e) {
        console.error("Failed to fetch predict data:", e);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [profile?.businessId]);

  const sales = predictData?.meta?.sales ?? 0;
  const expenses = predictData?.meta?.expenses ?? 0;
  const udhaarGiven = predictData?.meta?.udhaar_given ?? 0;
  const overdueUdhaar = predictData?.meta?.overdue_udhaar ?? 0;
  const cashflow = predictData?.cashflow_prediction ?? 0;
  const riskScore = predictData?.risk_prediction ?? 0;
  const riskDisplay = (riskScore * 10).toFixed(1);
  const riskPercent = Math.min(riskScore * 100, 100);
  const hasData = predictData?.meta?.has_data ?? false;

  const handleCallCrisis = async () => {
    setIsCalling(true);
    const loadingToast = toast.loading(t("home.initiatingCallToast"));
    try {
      const businessId = profile?.businessId;
      await triggerBolnaCall(businessId, profile?.phone);
      toast.success(t("home.callInitiatedToast"), { id: loadingToast });
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || t("home.callFailedToast"), { id: loadingToast });
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-4 lg:p-6">
        <PageHeader
          title="VyapaarSaathi"
          subtitle={`${t("home.greeting")}, ${profile.name ? profile.name.split(" ")[0] : ""} 👋`}
        />

        {/* Top 4 stat cards — real data */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {loadingData ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl card-shadow p-4 animate-pulse h-24" />
            ))
          ) : (
            <>
              <StatCard icon={Wallet} label={t("home.dailyCash")} value={sales} trend={hasData ? `₹${Math.round(cashflow).toLocaleString("en-IN")} forecast` : "No data"} up={cashflow > 0} />
              <StatCard icon={TrendingUp} label={t("home.revenueTrend")} value={sales} trend={hasData ? "This month" : "No data"} up />
              <StatCard icon={TrendingDown} label={t("home.expenseBreakdown")} value={expenses} trend={hasData ? "This month" : "No data"} up={false} good={expenses < sales} />
              <StatCard icon={HandCoins} label={t("home.udhaar")} value={udhaarGiven} trend={overdueUdhaar > 0 ? `₹${overdueUdhaar.toLocaleString("en-IN")} ${t("home.overdue")}` : "None overdue"} up={false} />
            </>
          )}
        </div>

        {/* Smart Insights ML Component */}
        <div className="mb-5">
          <SmartInsights />
        </div>

        {/* Hero call button */}
        <button
          onClick={handleCallCrisis}
          disabled={isCalling}
          className={`w-full mb-3 flex items-center justify-center gap-3 bg-gradient-auth text-primary-foreground py-4 rounded-2xl font-bold text-sm card-shadow-md lift active:scale-[0.98] animate-glow-pulse ${isCalling ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          <PhoneCall className={`w-5 h-5 ${isCalling ? "animate-pulse" : ""}`} />
          {isCalling ? t("home.initiatingCall") : t("home.callExplain")}
        </button>

        {/* WhatsApp Insights CTA */}
        <WhatsappInsightsDrawer>
          <button
            className="w-full mb-5 flex items-center justify-center gap-3 bg-gradient-to-r from-[#25D366] to-[#1DA851] text-white py-4 rounded-2xl font-bold text-sm card-shadow-md lift active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
            {t("home.whatsappInsights")}
          </button>
        </WhatsappInsightsDrawer>

        <div className="grid lg:grid-cols-2 gap-4 mb-5">
          {/* AI suggestion */}
          <div className="rounded-2xl p-4 bg-card border-l-4 border-success card-shadow">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-success" />
              <span className="text-[11px] font-bold uppercase tracking-wide text-success">{t("home.aiSuggestion")}</span>
            </div>
            <p className="text-sm font-semibold text-foreground leading-snug">
              {t("home.aiSuggestionText")}
            </p>
            <button
              onClick={() => navigate("/insights")}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary"
            >
              {t("home.viewInsights")} <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* AI Assistant entry */}
          <button
            onClick={() => navigate("/ai")}
            className="w-full bg-card rounded-2xl card-shadow p-4 text-left lift transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-auth flex items-center justify-center animate-glow-pulse shrink-0">
                <MessageSquare className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-heading">{t("home.askAi")}</p>
                <p className="text-[11px] text-muted-foreground">{t("home.chatPreview")}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </div>
          </button>
        </div>

        {/* Risk score — real data */}
        <div className="bg-card rounded-2xl card-shadow p-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <h3 className="text-xs font-bold text-heading uppercase tracking-wide">{t("home.riskScore")}</h3>
            </div>
            <p className="text-xs text-muted-foreground">{t("home.watchUdhaar")}</p>
          </div>
          {loadingData ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : (
            <>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-extrabold text-warning">{riskDisplay}</p>
                <p className="text-sm text-muted-foreground">/ 10</p>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-2 overflow-hidden">
                <div className="bg-warning h-2 rounded-full transition-all duration-700" style={{ width: `${riskPercent}%` }} />
              </div>
            </>
          )}
        </div>

        {/* Bottom cards — real data */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/udhaari")}
            className="bg-card rounded-2xl card-shadow p-4 text-left lift transition-all"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <HandCoins className="w-4 h-4 text-warning" />
              <span className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wide">{t("home.udhaar")}</span>
            </div>
            <p className="text-xl font-extrabold text-heading"><AnimatedNumber value={udhaarGiven} prefix="₹" /></p>
            {overdueUdhaar > 0 && (
              <p className="text-[10px] text-destructive font-semibold mt-1">₹{overdueUdhaar.toLocaleString("en-IN")} {t("home.overdue")}</p>
            )}
          </button>

          <button
            onClick={() => navigate("/sales")}
            className="bg-card rounded-2xl card-shadow p-4 text-left lift transition-all"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <IndianRupee className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wide">{t("home.dailyCash")}</span>
            </div>
            <p className="text-xl font-extrabold text-heading"><AnimatedNumber value={sales} prefix="₹" /></p>
            <p className="text-[10px] text-muted-foreground font-semibold mt-1">This month</p>
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({
  icon: Icon, label, value, trend, up, good,
}: { icon: any; label: string; value: number; trend: string; up: boolean; good?: boolean }) {
  const trendColor = good || up ? "text-success" : "text-destructive";
  return (
    <div className="bg-card rounded-2xl card-shadow p-4 animate-fade-up lift transition-all">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide truncate">{label}</span>
      </div>
      <p className="text-xl font-extrabold text-heading">
        <AnimatedNumber value={value} prefix="₹" />
      </p>
      <p className={`text-[10px] font-semibold mt-1 ${trendColor}`}>{trend}</p>
    </div>
  );
}
