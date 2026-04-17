import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { Wallet, TrendingUp, TrendingDown, HandCoins, Sparkles, ChevronRight, AlertTriangle, IndianRupee, PhoneCall, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";


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

const trendData = [
  { d: "Mon", v: 9200 },
  { d: "Tue", v: 10500 },
  { d: "Wed", v: 8800 },
  { d: "Thu", v: 11200 },
  { d: "Fri", v: 13400 },
  { d: "Sat", v: 12100 },
  { d: "Sun", v: 12450 },
];

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const profileButton = (
    <button
      onClick={() => navigate("/settings")}
      className="w-9 h-9 rounded-full bg-gradient-auth flex items-center justify-center text-primary-foreground font-bold text-sm shadow-md"
      aria-label="Profile"
    >
      R
    </button>
  );

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-4 lg:p-6">
        <PageHeader
          title={`${t("home.greeting")}, Rahul 👋`}
          subtitle={t("app.tagline")}
          right={profileButton}
        />

        {/* Top 4 stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <StatCard icon={Wallet} label={t("home.dailyCash")} value={12450} trend="+8%" up />
          <StatCard icon={TrendingUp} label={t("home.revenueTrend")} value={118000} trend="+14%" up />
          <StatCard icon={TrendingDown} label={t("home.expenseBreakdown")} value={68000} trend="-5%" up={false} good />
          <StatCard icon={HandCoins} label={t("home.udhaar")} value={23300} trend={`₹15K ${t("home.overdue")}`} up={false} />
        </div>

        {/* Hero call button */}
        <button
          onClick={() => navigate("/ai")}
          className="w-full mb-5 flex items-center justify-center gap-3 bg-gradient-auth text-primary-foreground py-4 rounded-2xl font-bold text-sm card-shadow-md lift active:scale-[0.98] animate-glow-pulse"
        >
          <PhoneCall className="w-5 h-5" />
          {t("home.callExplain")}
        </button>

        <div className="grid lg:grid-cols-2 gap-4 mb-5">
          {/* AI suggestion */}
          <div className="rounded-2xl p-4 bg-card border-l-4 border-success card-shadow">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-success" />
              <span className="text-[11px] font-bold uppercase tracking-wide text-success">{t("home.aiSuggestion")}</span>
            </div>
            <p className="text-sm font-semibold text-foreground leading-snug">
              "Restock sugar & cooking oil before the weekend — demand is up 22%."
            </p>
            <button
              onClick={() => navigate("/insights")}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary"
            >
              View insights <ChevronRight className="w-3.5 h-3.5" />
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

        {/* Risk score */}
        <div className="bg-card rounded-2xl card-shadow p-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <h3 className="text-xs font-bold text-heading uppercase tracking-wide">{t("home.riskScore")}</h3>
            </div>
            <p className="text-xs text-muted-foreground">{t("home.watchUdhaar")}</p>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-extrabold text-warning">6.2</p>
            <p className="text-sm text-muted-foreground">/ 10</p>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mt-2 overflow-hidden">
            <div className="bg-warning h-2 rounded-full transition-all duration-700" style={{ width: "62%" }} />
          </div>
        </div>

        {/* Bottom cards */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/udhaari")}
            className="bg-card rounded-2xl card-shadow p-4 text-left lift transition-all"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <HandCoins className="w-4 h-4 text-warning" />
              <span className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wide">{t("home.udhaar")}</span>
            </div>
            <p className="text-xl font-extrabold text-heading"><AnimatedNumber value={23300} prefix="₹" /></p>
            <p className="text-[10px] text-destructive font-semibold mt-1">{t("home.customersOverdue", { count: 3 })}</p>
          </button>

          <button
            onClick={() => navigate("/sales")}
            className="bg-card rounded-2xl card-shadow p-4 text-left lift transition-all"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <IndianRupee className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wide">{t("home.dailyCash")}</span>
            </div>
            <p className="text-xl font-extrabold text-heading"><AnimatedNumber value={12450} prefix="₹" /></p>
            <p className="text-[10px] text-success font-semibold mt-1">+18% {t("home.vsYesterday")}</p>
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
