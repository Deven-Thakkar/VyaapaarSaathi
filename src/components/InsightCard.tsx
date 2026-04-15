import { ChevronRight } from "lucide-react";
import { ReactNode } from "react";

interface InsightCardProps {
  icon: ReactNode;
  text: string;
  action?: string;
  variant?: "warning" | "critical" | "info";
  onClick?: () => void;
}

const variantStyles = {
  warning: "border-l-4 border-l-warning",
  critical: "border-l-4 border-l-destructive",
  info: "border-l-4 border-l-primary",
};

export default function InsightCard({ icon, text, action, variant = "info", onClick }: InsightCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 bg-card rounded-lg card-shadow text-left transition-all active:scale-[0.98] ${variantStyles[variant]}`}
    >
      <span className="text-2xl shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{text}</p>
        {action && <p className="text-xs text-primary font-semibold mt-0.5">{action}</p>}
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </button>
  );
}
