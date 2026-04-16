import AppShell from "@/components/AppShell";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Wallet, TrendingUp, TrendingDown, HandCoins, Sparkles, ChevronRight, ArrowUpRight, AlertTriangle, IndianRupee } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

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

const revenueData = [
  { m: "Jan", v: 65000 }, { m: "Feb", v: 72000 }, { m: "Mar", v: 68000 },
  { m: "Apr", v: 85000 }, { m: "May", v: 92000 }, { m: "Jun", v: 105000 },
  { m: "Jul", v: 118000 },
];
const profitData = [
  { m: "Jan", v: 12 }, { m: "Feb", v: 15 }, { m: "Mar", v: 11 },
  { m: "Apr", v: 18 }, { m: "May", v: 22 }, { m: "Jun", v: 26 }, { m: "Jul", v: 28 },
];
const expenseData = [
  { name: "Stock", value: 45 },
  { name: "Rent", value: 20 },
  { name: "Salary", value: 18 },
  { name: "Others", value: 17 },
];
const COLORS = ["hsl(217 91% 60%)", "hsl(142 71% 45%)", "hsl(38 92% 50%)", "hsl(215 16% 47%)"];

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs text-muted-foreground font-medium">{t("home.greeting")} 👋</p>
            <h1 className="text-xl font-bold text-heading">Rahul</h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={() => navigate("/settings")}
              className="w-9 h-9 rounded-full bg-gradient-auth flex items-center justify-center text-primary-foreground font-bold text-sm"
              aria-label="Profile"
            >
              R
            </button>
          </div>
        </div>

        {/* Insights button */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-heading">{t("home.insights")}</h2>
          <button className="flex items-center gap-1 text-xs font-semibold text-primary">
            View all <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Top stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <StatCard icon={Wallet} label={t("home.dailyCash")} value={12450} trend="+8%" up />
          <StatCard icon={TrendingUp} label={t("home.revenueTrend")} value={118000} trend="+14%" up />
          <StatCard icon={TrendingDown} label={t("home.expenseBreakdown")} value={68000} trend="-5%" up={false} good />
          <StatCard icon={HandCoins} label={t("home.udhaar")} value={23300} trend="₹15K overdue" up={false} />
        </div>

        <div className="lg:grid lg:grid-cols-5 lg:gap-5 space-y-5 lg:space-y-0">
          {/* Left - charts */}
          <div className="lg:col-span-3 space-y-5">
            {/* Revenue chart */}
            <Panel title={t("home.revenueTrend")} subtitle="Last 7 months">
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 5, right: 5, bottom: 0, left: -25 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(217 91% 60%)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="m" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
                    <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                    <Area type="monotone" dataKey="v" stroke="hsl(217 91% 60%)" strokeWidth={2.5} fill="url(#revGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Panel title={t("home.profitMargin")} subtitle="% over time">
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={profitData} margin={{ top: 5, right: 5, bottom: 0, left: -25 }}>
                      <XAxis dataKey="m" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                      <Tooltip formatter={(v: number) => `${v}%`} />
                      <Line type="monotone" dataKey="v" stroke="hsl(142 71% 45%)" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[11px] text-success font-semibold mt-1">✅ 28% margin this month</p>
              </Panel>

              <Panel title={t("home.expenseBreakdown")} subtitle="By category">
                <div className="h-36 flex items-center">
                  <ResponsiveContainer width="60%" height="100%">
                    <PieChart>
                      <Pie data={expenseData} dataKey="value" innerRadius={28} outerRadius={50} paddingAngle={2}>
                        {expenseData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <ul className="flex-1 space-y-1.5 text-[10px]">
                    {expenseData.map((d, i) => (
                      <li key={d.name} className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                        <span className="text-muted-foreground">{d.name}</span>
                        <span className="ml-auto font-semibold text-foreground">{d.value}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Panel>
            </div>

            {/* Investment + risk */}
            <div className="grid grid-cols-2 gap-4">
              <Panel title={t("home.investmentReq")}>
                <p className="text-2xl font-extrabold text-heading"><AnimatedNumber value={75000} prefix="₹" /></p>
                <p className="text-[11px] text-muted-foreground mt-1">For Q4 expansion</p>
              </Panel>
              <Panel title={t("home.predictedReturns")}>
                <p className="text-2xl font-extrabold text-success">+₹<AnimatedNumber value={28000} /></p>
                <p className="text-[11px] text-success font-semibold mt-1 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> 37% ROI predicted
                </p>
              </Panel>
            </div>

            {/* AI suggestion */}
            <div className="rounded-2xl p-4 bg-gradient-auth text-primary-foreground card-shadow-md">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wide">{t("home.aiSuggestion")}</span>
              </div>
              <p className="text-sm font-semibold leading-snug">
                "Restock sugar & cooking oil before the weekend — demand is up 22%."
              </p>
              <button
                onClick={() => navigate("/ai")}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-foreground/15 backdrop-blur rounded-full text-xs font-semibold hover:bg-primary-foreground/25 transition"
              >
                {t("home.askAi")} <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right - chatbot preview, risk, udhaar */}
          <div className="lg:col-span-2 space-y-4">
            <button
              onClick={() => navigate("/ai")}
              className="w-full bg-card rounded-2xl card-shadow p-4 text-left lift transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-auth flex items-center justify-center animate-glow-pulse">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-heading">{t("ai.title")}</p>
                  <p className="text-[11px] text-muted-foreground">{t("home.chatPreview")}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </button>

            <Panel title={t("home.riskScore")}>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-extrabold text-warning">6.2</p>
                <p className="text-xs text-muted-foreground">/ 10</p>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div className="bg-warning h-2 rounded-full" style={{ width: "62%" }} />
              </div>
              <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-warning" /> Watch udhaar collection
              </p>
            </Panel>

            <button
              onClick={() => navigate("/udhaari")}
              className="w-full bg-card rounded-2xl card-shadow p-4 text-left lift transition-all"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <HandCoins className="w-4 h-4 text-warning" />
                <span className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wide">{t("home.udhaar")}</span>
              </div>
              <p className="text-2xl font-extrabold text-heading"><AnimatedNumber value={23300} prefix="₹" /></p>
              <p className="text-[11px] text-destructive font-semibold mt-1">3 customers overdue</p>
            </button>

            <button
              onClick={() => navigate("/sales")}
              className="w-full bg-card rounded-2xl card-shadow p-4 text-left lift transition-all"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <IndianRupee className="w-4 h-4 text-primary" />
                <span className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wide">{t("home.dailyCash")}</span>
              </div>
              <p className="text-2xl font-extrabold text-heading"><AnimatedNumber value={12450} prefix="₹" /></p>
              <p className="text-[11px] text-success font-semibold mt-1">+18% vs yesterday</p>
            </button>
          </div>
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
    <div className="bg-card rounded-2xl card-shadow p-4 animate-fade-up">
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

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl card-shadow p-4">
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-xs font-bold text-heading uppercase tracking-wide">{title}</h3>
        {subtitle && <span className="text-[10px] text-muted-foreground">{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}
