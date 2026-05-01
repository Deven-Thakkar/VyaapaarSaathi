import { Sparkles, X, Zap, MessageSquare, Phone, FileText, BarChart2 } from "lucide-react";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  feature?: string; // What feature triggered the limit
}

const FEATURES = [
  { icon: MessageSquare, label: "Unlimited AI Chat" },
  { icon: Phone,         label: "Unlimited AI Calls" },
  { icon: FileText,      label: "Unlimited Invoice Scans" },
  { icon: BarChart2,     label: "Unlimited WhatsApp Insights" },
  { icon: Zap,           label: "Priority Support" },
];

export default function UpgradeModal({ open, onClose, feature }: UpgradeModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-up" />

      {/* Modal */}
      <div className="relative w-full max-w-sm mx-4 mb-4 sm:mb-0 bg-card rounded-3xl card-shadow-md overflow-hidden animate-fade-up">

        {/* Header gradient */}
        <div className="bg-gradient-auth p-6 text-center relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl font-extrabold text-white">Free Limit Reached</h2>
            <p className="text-white/80 text-sm mt-1">
              {feature
                ? `You've used all your free ${feature}.`
                : "You've used all your free AI features."}
            </p>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Body */}
        <div className="p-5">
          <p className="text-sm text-muted-foreground text-center mb-4">
            Upgrade to <span className="font-bold text-primary">VyapaarSaathi Pro</span> to unlock all features.
          </p>

          {/* Feature list */}
          <div className="space-y-2.5 mb-5">
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{label}</span>
              </div>
            ))}
          </div>

          {/* CTA — disabled for now, upgrade coming soon */}
          <button
            disabled
            className="w-full flex items-center justify-center gap-2 bg-gradient-auth text-primary-foreground py-3.5 rounded-2xl font-bold text-sm opacity-60 cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4" />
            Upgrade — Coming Soon
          </button>

          <button
            onClick={onClose}
            className="w-full mt-2 text-xs text-muted-foreground py-2 hover:text-foreground transition"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
