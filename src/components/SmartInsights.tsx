import { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle2, Loader2, RefreshCw, Info, PackageX } from 'lucide-react';
import { useProfile } from "@/context/ProfileContext";

interface Insight {
  level: 'success' | 'warning' | 'danger' | 'info';
  text: string;
}

interface PredictResponse {
  cashflow_prediction: number;
  risk_prediction: number;
  source: string;
  insights: Insight[];
  meta: {
    sales: number;
    expenses: number;
    udhaar_given: number;
    overdue_udhaar: number;
    inventory_value: number;
    has_data: boolean;
    missing_data?: string[];
    is_synthetic?: boolean;
  };
}

const INSIGHT_STYLES: Record<string, { bg: string; border: string; text: string; Icon: any }> = {
  success: { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700',  Icon: CheckCircle2 },
  warning: { bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  Icon: AlertTriangle },
  danger:  { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    Icon: AlertTriangle },
  info:    { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   Icon: PackageX },
};

import { useTranslation } from 'react-i18next';

export default function SmartInsights() {
  const { t } = useTranslation();
  const { profile } = useProfile();
  const [data, setData] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = () => {
    setLoading(true);
    setError(null);

    fetch('/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ business_id: profile?.businessId ?? null })
    })
      .then(res => {
        if (!res.ok) return res.json().then(e => Promise.reject(new Error(e.error || `Error ${res.status}`)));
        return res.json();
      })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  };

  useEffect(() => { fetchInsights(); }, [profile?.businessId]);

  const riskLabel = (r: number) => r > 0.65 ? 'High' : r > 0.35 ? 'Medium' : 'Low';
  const riskColor = (r: number) => r > 0.65 ? 'text-destructive' : r > 0.35 ? 'text-amber-600' : 'text-success';

  if (loading) {
    return (
      <div className="bg-card border rounded-2xl p-6 flex items-center justify-center gap-3 card-shadow">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">{t("insights.analyzing", "Analyzing your business data...")}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border rounded-2xl p-5 card-shadow">
        <h3 className="text-base font-bold flex items-center gap-2 mb-3 text-heading">
          <TrendingUp className="w-5 h-5 text-primary" />{t("insights.title", "Business Insights")}
        </h3>
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl border">
          <Info className="w-4 h-4 text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground flex-1">ML service unavailable. Start <code className="bg-muted px-1 rounded">python ml_api.py</code></p>
          <button onClick={fetchInsights} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  if (!data.meta.has_data) {
    return (
      <div className="bg-card border rounded-2xl p-8 text-center card-shadow">
        <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-base font-bold text-heading mb-2">{t("insights.noTransactions", "No transactions found")}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t("insights.addSalesPrompt", "Add sales or expenses to see insights.")}
        </p>
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg text-left inline-block">
          <p className="font-semibold mb-1">{t("insights.missingData", "Missing data:")}</p>
          <ul className="list-disc pl-4 space-y-0.5">
            {data.meta.missing_data?.map((m: string) => <li key={m}>{m}</li>)}
          </ul>
        </div>
        <div className="mt-4">
            <button onClick={fetchInsights} className="p-1.5 rounded-lg hover:bg-accent transition-colors flex items-center gap-1 mx-auto text-xs text-muted-foreground">
              <RefreshCw className="w-4 h-4" /> {t("insights.refresh", "Refresh")}
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-2xl p-5 card-shadow flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="text-base font-bold text-heading flex-1">{t("insights.title", "Business Insights")}</h3>
        <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{t("insights.aiPowered", "AI Powered")}</span>
        <button onClick={fetchInsights} className="p-1 rounded-lg hover:bg-accent transition-colors ml-1">
          <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
      
      {/* Real data summary */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-muted/40 p-2 rounded-xl text-center">
          <p className="text-[9px] text-muted-foreground uppercase font-semibold mb-0.5">{t("insights.sales", "Sales")}</p>
          <p className="text-sm font-bold text-success">₹{data.meta.sales.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-muted/40 p-2 rounded-xl text-center">
          <p className="text-[9px] text-muted-foreground uppercase font-semibold mb-0.5">{t("insights.expenses", "Expenses")}</p>
          <p className="text-sm font-bold text-destructive">₹{data.meta.expenses.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-muted/40 p-2 rounded-xl text-center">
          <p className="text-[9px] text-muted-foreground uppercase font-semibold mb-0.5">{t("insights.udhaar", "Udhaar")}</p>
          <p className="text-sm font-bold text-warning">₹{data.meta.udhaar_given.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* ML Prediction cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-muted/50 p-3 rounded-xl border">
          <p className="text-[10px] text-muted-foreground mb-1 uppercase font-semibold tracking-wide">{t("insights.predictedCashflow", "Predicted Cashflow")}</p>
          <p className="text-xl font-black text-heading">
            ₹{Math.max(0, Math.round(data.cashflow_prediction)).toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-muted/50 p-3 rounded-xl border">
          <p className="text-[10px] text-muted-foreground mb-1 uppercase font-semibold tracking-wide">{t("insights.riskLevel", "Risk Level")}</p>
          <p className={`text-xl font-black ${riskColor(data.risk_prediction)}`}>
            {t(`insights.risk.${riskLabel(data.risk_prediction).toLowerCase()}`, riskLabel(data.risk_prediction))}
          </p>
        </div>
      </div>

      {/* Dynamic insights from backend */}
      <div className="space-y-2">
        {data.insights.map((insight, i) => {
          const style = INSIGHT_STYLES[insight.level] || INSIGHT_STYLES.info;
          const Icon = style.Icon;
          return (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${style.bg} ${style.border}`}>
              <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${style.text}`} />
              <p className={`text-sm font-medium ${style.text}`}>{t(`insights.messages.${insight.text}`, insight.text)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
