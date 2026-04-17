import { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { useProfile } from "@/context/ProfileContext";

interface InsightsData {
  cashflow_prediction: number;
  risk_prediction: number;
  source?: string;
  meta?: {
    sales: number;
    expenses: number;
    udhaar_given: number;
    inventory_value: number;
    is_demo: boolean;
  };
}

export default function SmartInsights() {
  const { profile } = useProfile();
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = () => {
    setLoading(true);
    setError(null);

    fetch('/api/smart-insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ business_id: profile?.business_id || null })
    })
    .then(res => {
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      return res.json();
    })
    .then(d => {
      if (d.error) throw new Error(d.error);
      setData(d);
      setLoading(false);
    })
    .catch(e => {
      console.error('SmartInsights error:', e);
      setError(e.message || 'Failed to load insights');
      setLoading(false);
    });
  };

  useEffect(() => { fetchInsights(); }, [profile?.business_id]);

  if (loading) {
    return (
      <div className="bg-card border rounded-2xl p-6 shadow-sm flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Analyzing your business data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border rounded-2xl p-5 shadow-sm">
        <h3 className="text-base font-bold flex items-center gap-2 mb-3 text-heading">
          <TrendingUp className="w-5 h-5 text-primary" />
          Business Insights
        </h3>
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl border">
          <p className="text-xs text-muted-foreground">Insights unavailable. Check backend & ML service.</p>
          <button onClick={fetchInsights} className="ml-2 p-1.5 rounded-lg hover:bg-accent transition-colors">
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const getInsight = () => {
    if (data.cashflow_prediction < (data.meta?.expenses || 8000)) {
      return { text: "⚠️ You may face a cash shortage soon. Collect pending udhaar to improve cashflow.", color: "text-amber-600 bg-amber-50 border-amber-200", icon: AlertTriangle };
    }
    if (data.risk_prediction > 0.5) {
      return { text: "🚨 High risk detected. Reduce unnecessary expenses or follow up on overdue payments.", color: "text-red-600 bg-red-50 border-red-200", icon: AlertTriangle };
    }
    return { text: "✅ Business looks stable. Keep monitoring your udhaar recovery rate.", color: "text-green-600 bg-green-50 border-green-200", icon: CheckCircle2 };
  };

  const insight = getInsight();
  const Icon = insight.icon;
  const isDemo = data.meta?.is_demo;

  return (
    <div className="bg-card border rounded-2xl p-5 shadow-sm card-shadow">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="text-base font-bold text-heading flex-1">Business Insights</h3>
        <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">AI Powered</span>
        {isDemo && (
          <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Demo Data</span>
        )}
      </div>

      {/* Real data summary if available */}
      {data.meta && !isDemo && (
        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
          <div className="bg-muted/40 p-2 rounded-xl">
            <p className="text-[9px] text-muted-foreground uppercase font-semibold">Sales</p>
            <p className="text-sm font-bold text-success">₹{data.meta.sales.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-muted/40 p-2 rounded-xl">
            <p className="text-[9px] text-muted-foreground uppercase font-semibold">Expenses</p>
            <p className="text-sm font-bold text-destructive">₹{data.meta.expenses.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-muted/40 p-2 rounded-xl">
            <p className="text-[9px] text-muted-foreground uppercase font-semibold">Udhaar</p>
            <p className="text-sm font-bold text-warning">₹{data.meta.udhaar_given.toLocaleString('en-IN')}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-muted/50 p-3 rounded-xl border">
          <p className="text-[10px] text-muted-foreground mb-1 uppercase font-semibold tracking-wide">Predicted Cashflow</p>
          <p className="text-xl font-black text-heading">₹{Math.round(data.cashflow_prediction).toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-muted/50 p-3 rounded-xl border">
          <p className="text-[10px] text-muted-foreground mb-1 uppercase font-semibold tracking-wide">Risk Level</p>
          <p className={`text-xl font-black ${data.risk_prediction > 0.5 ? 'text-destructive' : 'text-success'}`}>
            {data.risk_prediction > 0.7 ? 'High' : data.risk_prediction > 0.4 ? 'Medium' : 'Low'}
          </p>
        </div>
      </div>

      <div className={`flex items-start gap-3 p-3 rounded-xl border ${insight.color}`}>
        <Icon className="w-5 h-5 shrink-0 mt-0.5" />
        <p className="text-sm font-medium">{insight.text}</p>
      </div>
    </div>
  );
}
