import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { useTranslation } from "react-i18next";
import { Sparkles, TrendingUp, AlertCircle, AlertTriangle } from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";
import { useProfile } from "@/context/ProfileContext";

const forecastData = [
  ...Array.from({ length: 30 }, (_, i) => ({
    d: `D${i + 1}`,
    actual: i < 18 ? Math.round(10000 + Math.sin(i / 3) * 2500 + i * 220) : null,
    predicted: i >= 17 ? Math.round(10000 + Math.sin(i / 3) * 2500 + i * 220 + (i - 17) * 350) : null,
  })),
];

const revenueData = [
  { m: "Jan", v: 65000 }, { m: "Feb", v: 72000 }, { m: "Mar", v: 68000 },
  { m: "Apr", v: 85000 }, { m: "May", v: 92000 }, { m: "Jun", v: 105000 }, { m: "Jul", v: 118000 },
];

const profitData = [
  { m: "Jan", v: 12 }, { m: "Feb", v: 15 }, { m: "Mar", v: 11 },
  { m: "Apr", v: 18 }, { m: "May", v: 22 }, { m: "Jun", v: 26 }, { m: "Jul", v: 28 },
];

const PIE_COLORS = ["hsl(217 91% 60%)", "hsl(142 71% 45%)", "hsl(38 92% 50%)", "hsl(262 83% 58%)"];

const topProducts = [
  { name: "Sunflower Oil", units: 260 },
  { name: "Basmati Rice", units: 215 },
  { name: "Sugar 1kg", units: 180 },
  { name: "Tata Salt", units: 145 },
  { name: "Maggi", units: 120 },
];

type Tone = "success" | "warning" | "danger";

const recommendations: Array<{
  tone: Tone;
  title: string;
  metrics: string[];
  reason: string;
  action: string;
}> = [
  {
    tone: "success",
    title: "Restock Sunflower Oil",
    metrics: ["Sales ↑ 24% (210 → 260 units)", "Stock left: 90 units (~2.5 days)"],
    reason: "Rising demand + low stock → risk of lost sales (~₹20K)",
    action: "Restock 300+ units this week",
  },
  {
    tone: "warning",
    title: "Collect from Suman Kirana",
    metrics: ["Due: ₹12,400 (overdue 3 days)", "21% of total receivables"],
    reason: "Delayed cash hurting working capital",
    action: "Follow up now (AI/voice reminder)",
  },
  {
    tone: "danger",
    title: "Review Sugar Supplier",
    metrics: ["Margin ↓ 6% (18% → 12%)", "Cost ↑ ₹38 → ₹42/kg", "Loss: ~₹800/week"],
    reason: "Rising cost, same selling price",
    action: "Negotiate / switch supplier / increase price",
  },
];

const toneStyles: Record<Tone, { dot: string; border: string; bg: string; text: string; icon: any }> = {
  success: { dot: "bg-success", border: "border-success", bg: "bg-success/10", text: "text-success", icon: TrendingUp },
  warning: { dot: "bg-warning", border: "border-warning", bg: "bg-warning/10", text: "text-warning", icon: AlertCircle },
  danger: { dot: "bg-destructive", border: "border-destructive", bg: "bg-destructive/10", text: "text-destructive", icon: AlertTriangle },
};

export default function InsightsPage() {
  const { t } = useTranslation();

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-4 lg:p-6">
        <PageHeader title={t("insightsPage.title")} subtitle={t("insightsPage.sub")} />

        {/* 30-Day Forecast (NEW) */}
        <Panel title={t("insightsPage.forecast")} subtitle={t("insightsPage.forecastSub")}>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(217 91% 60%)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(142 71% 45%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(142 71% 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(220 13% 91%)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="d" tick={{ fontSize: 9, fill: "hsl(215 16% 47%)" }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fontSize: 9, fill: "hsl(215 16% 47%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(220 13% 91%)", fontSize: 12 }} />
                <ReferenceLine x="D18" stroke="hsl(215 16% 47%)" strokeDasharray="4 4" label={{ value: "Today", fontSize: 10, fill: "hsl(215 16% 47%)" }} />
                <Area type="monotone" dataKey="actual" stroke="hsl(217 91% 60%)" strokeWidth={2.5} fill="url(#actualGrad)" connectNulls={false} />
                <Area type="monotone" dataKey="predicted" stroke="hsl(142 71% 45%)" strokeWidth={2.5} strokeDasharray="6 4" fill="url(#predGrad)" connectNulls={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-2 text-[11px]">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary" /> Actual</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-success" /> Predicted</span>
          </div>
        </Panel>

        <div className="grid lg:grid-cols-2 gap-4 mt-4">
          <Panel title={t("insightsPage.revenue")} subtitle="Last 7 months">
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData} margin={{ top: 5, right: 5, bottom: 0, left: -25 }}>
                  <CartesianGrid stroke="hsl(220 13% 91%)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="m" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                  <Line type="monotone" dataKey="v" stroke="hsl(217 91% 60%)" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title={t("insightsPage.profit")} subtitle="% over time">
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={profitData} margin={{ top: 5, right: 5, bottom: 0, left: -25 }}>
                  <defs>
                    <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(142 71% 45%)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(142 71% 45%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="hsl(220 13% 91%)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="m" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} formatter={(v: number) => `${v}%`} />
                  <Area type="monotone" dataKey="v" stroke="hsl(142 71% 45%)" strokeWidth={2.5} fill="url(#profGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title={t("insightsPage.expense")} subtitle="By category">
            <div className="h-44 flex items-center">
              <ResponsiveContainer width="55%" height="100%">
                <PieChart>
                  <Pie data={expenseData} dataKey="value" innerRadius={32} outerRadius={62} paddingAngle={2}>
                    {expenseData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <ul className="flex-1 space-y-2 text-[11px]">
                {expenseData.map((d, i) => (
                  <li key={d.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                    <span className="text-muted-foreground">{d.name}</span>
                    <span className="ml-auto font-semibold text-foreground">{d.value}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </Panel>

          <Panel title={t("insightsPage.topProducts")} subtitle="Units sold (30d)">
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="units" fill="hsl(217 91% 60%)" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        {/* AI Recommendations */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-heading uppercase tracking-wide">{t("insightsPage.aiRecs")}</h2>
          </div>
          <div className="space-y-3">
            {recommendations.map((r, i) => {
              const s = toneStyles[r.tone];
              const Icon = s.icon;
              return (
                <div
                  key={i}
                  className={`bg-card rounded-2xl card-shadow p-4 border-l-4 ${s.border} animate-fade-up`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl ${s.bg} ${s.text} flex items-center justify-center shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-heading">{r.title}</p>
                      <ul className="mt-2 space-y-0.5">
                        {r.metrics.map((m, j) => (
                          <li key={j} className="text-xs text-foreground/80 flex items-start gap-1.5">
                            <span className={`mt-1 w-1 h-1 rounded-full ${s.dot} shrink-0`} /> {m}
                          </li>
                        ))}
                      </ul>
                      <p className="text-[11px] text-muted-foreground mt-2">
                        <span className="font-semibold">{t("insightsPage.reason")}:</span> {r.reason}
                      </p>
                      <p className={`text-[11px] mt-1 font-semibold ${s.text}`}>
                        {t("insightsPage.action")}: {r.action}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl card-shadow p-4">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-xs font-bold text-heading uppercase tracking-wide">{title}</h3>
        {subtitle && <span className="text-[10px] text-muted-foreground">{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}
