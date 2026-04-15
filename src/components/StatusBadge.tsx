import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

type Status = "safe" | "warning" | "critical";

const config: Record<Status, { icon: typeof CheckCircle2; label: string; className: string }> = {
  safe: { icon: CheckCircle2, label: "Safe", className: "bg-success/10 text-success" },
  warning: { icon: AlertTriangle, label: "Warning", className: "bg-warning/10 text-warning" },
  critical: { icon: XCircle, label: "Critical", className: "bg-destructive/10 text-destructive" },
};

export default function StatusBadge({ status }: { status: Status }) {
  const { icon: Icon, label, className } = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${className}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}
