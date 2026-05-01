import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { useTranslation } from "react-i18next";
import { Download, Loader2, Info, CheckCircle2, TrendingUp, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";
import { useProfile } from "@/context/ProfileContext";
import { API_BASE } from "@/lib/chatbot-api";

const PIE_COLORS = ["hsl(217 91% 60%)", "hsl(142 71% 45%)", "hsl(38 92% 50%)", "hsl(262 83% 58%)"];

export default function InsightsPage() {
  const { t } = useTranslation();
  const { profile } = useProfile();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [predictData, setPredictData] = useState<any>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    setLoading(true);
    const body = JSON.stringify({ business_id: profile?.businessId ?? null });

    Promise.all([
      fetch(`${API_BASE}/insights-data`, { method: "POST", headers: { "Content-Type": "application/json" }, body }).then(res => {
        if (!res.ok) throw new Error("Failed to load chart data");
        return res.json();
      }),
      fetch(`${API_BASE}/predict`, { method: "POST", headers: { "Content-Type": "application/json" }, body }).then(res => {
        if (!res.ok) throw new Error("Failed to load predict data");
        return res.json();
      })
    ])
    .then(([chartData, predictData]) => {
      setData(chartData);
      setPredictData(predictData);
      setLoading(false);
    })
    .catch(e => {
      setError(e.message);
      setLoading(false);
    });
  }, [profile?.businessId]);

  const handleDownload = async () => {
    setGenerating(true);
    try {
      const response = await fetch(`${API_BASE}/download-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business_id: profile?.businessId ?? null }),
      });

      if (!response.ok) throw new Error("Failed to generate report");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `VyapaarSaathi_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(t("insightsPage.reportReady"));
    } catch (e: any) {
      toast.error(e.message || "Failed to download report");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-6xl mx-auto p-4 lg:p-6 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <div className="max-w-6xl mx-auto p-4 lg:p-6">
          <PageHeader title={t("insightsPage.title")} subtitle={t("insightsPage.sub")} />
          <div className="bg-destructive/10 text-destructive p-4 rounded-xl">
            {error}
          </div>
        </div>
      </AppShell>
    );
  }

  const { daily_cashflow, monthly_revenue, top_products, summary } = data;

  if (!summary.has_data) {
    return (
      <AppShell>
        <div className="max-w-6xl mx-auto p-4 lg:p-6">
          <PageHeader title={t("insightsPage.title")} subtitle={t("insightsPage.sub")} />
          <div className="bg-card border border-border rounded-2xl p-8 text-center mt-8 card-shadow">
            <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold text-heading mb-2">No data yet</h2>
            <p className="text-muted-foreground">
              No transactions found. Add sales or expenses to see insights.
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto p-4 lg:p-6">
        <PageHeader title={t("insightsPage.title")} subtitle={t("insightsPage.sub")} />

        {/* ML Prediction Cards (if predictData exists) */}
        {predictData && (
          <div className="mb-6 space-y-4">
            <h3 className="text-sm font-bold text-heading flex items-center gap-2">
              <span className="text-xl">✨</span> AI Future Insights
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-5 card-shadow relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500"></div>
                <h3 className="text-xs font-bold text-primary uppercase tracking-wide mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> 30-Day Cashflow Forecast
                </h3>
                <p className="text-3xl font-black text-heading">
                  ₹{Math.max(0, Math.round(predictData.cashflow_prediction)).toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Projected balance based on historical run rates and current stock.
                </p>
              </div>
              
              <div className={`bg-gradient-to-br border rounded-2xl p-5 card-shadow relative overflow-hidden group ${
                predictData.risk_prediction > 0.65 ? 'from-red-50 to-red-100/50 border-red-200' : 
                predictData.risk_prediction > 0.35 ? 'from-amber-50 to-amber-100/50 border-amber-200' : 
                'from-green-50 to-green-100/50 border-green-200'
              }`}>
                <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl transition-all duration-500 ${
                  predictData.risk_prediction > 0.65 ? 'bg-red-500/10 group-hover:bg-red-500/20' : 
                  predictData.risk_prediction > 0.35 ? 'bg-amber-500/10 group-hover:bg-amber-500/20' : 
                  'bg-green-500/10 group-hover:bg-green-500/20'
                }`}></div>
                <h3 className={`text-xs font-bold uppercase tracking-wide mb-2 flex items-center gap-2 ${
                  predictData.risk_prediction > 0.65 ? 'text-red-700' : 
                  predictData.risk_prediction > 0.35 ? 'text-amber-700' : 
                  'text-green-700'
                }`}>
                  <AlertTriangle className="w-4 h-4" /> Financial Risk Assessment
                </h3>
                <p className={`text-3xl font-black ${
                  predictData.risk_prediction > 0.65 ? 'text-red-600' : 
                  predictData.risk_prediction > 0.35 ? 'text-amber-600' : 
                  'text-green-600'
                }`}>
                  {predictData.risk_prediction > 0.65 ? 'High Risk' : predictData.risk_prediction > 0.35 ? 'Medium Risk' : 'Low Risk'}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Business stability score: {((1 - predictData.risk_prediction) * 100).toFixed(1)}/100
                </p>
              </div>
            </div>

            <div className="grid gap-2">
              {predictData.insights.map((insight: any, i: number) => {
                const isSuccess = insight.level === 'success';
                const isWarning = insight.level === 'warning';
                const isDanger = insight.level === 'danger';
                
                return (
                  <div key={i} className={`flex items-start gap-3 p-3.5 rounded-xl border ${
                    isSuccess ? 'bg-green-50 border-green-200 text-green-700' :
                    isWarning ? 'bg-amber-50 border-amber-200 text-amber-700' :
                    isDanger ? 'bg-red-50 border-red-200 text-red-700' :
                    'bg-blue-50 border-blue-200 text-blue-700'
                  }`}>
                    <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${isSuccess ? 'block' : 'hidden'}`} />
                    <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${!isSuccess && !isDanger ? 'block' : 'hidden'}`} />
                    <Info className={`w-4 h-4 shrink-0 mt-0.5 ${isDanger ? 'block' : 'hidden'}`} />
                    <p className="text-sm font-medium leading-tight">{insight.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Download Report button */}
        <button
          onClick={handleDownload}
          disabled={generating}
          className="w-full mb-5 flex items-center justify-center gap-2.5 bg-primary hover:bg-primary/90 text-primary-foreground py-3.5 rounded-2xl font-bold text-sm card-shadow-md lift active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t("insightsPage.generating")}
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              {t("insightsPage.downloadReport")}
            </>
          )}
        </button>

        {/* 30-Day Cashflow */}
        <Panel title={t("insightsPage.forecast")} subtitle="Last 30 days">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily_cashflow} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(217 91% 60%)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(220 13% 91%)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="d" tick={{ fontSize: 9, fill: "hsl(215 16% 47%)" }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fontSize: 9, fill: "hsl(215 16% 47%)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(1)}K`} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(220 13% 91%)", fontSize: 12 }} />
                <Area type="monotone" dataKey="net" stroke="hsl(217 91% 60%)" strokeWidth={2.5} fill="url(#actualGrad)" connectNulls={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <div className="grid lg:grid-cols-2 gap-4 mt-4">
          <Panel title={t("insightsPage.revenue")} subtitle="Last 6 months">
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthly_revenue} margin={{ top: 5, right: 5, bottom: 0, left: -25 }}>
                  <CartesianGrid stroke="hsl(220 13% 91%)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="m" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(1)}K`} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                  <Line type="monotone" dataKey="v" stroke="hsl(217 91% 60%)" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title={t("insightsPage.topProducts")} subtitle="Stock units (current)">
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top_products} layout="vertical" margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="units" fill="hsl(217 91% 60%)" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
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
