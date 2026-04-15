import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, User, Store, IndianRupee, Building2 } from "lucide-react";

const businessTypes = [
  { id: "retail", label: "Retail / Kirana", icon: "🏪" },
  { id: "manufacturing", label: "Manufacturing", icon: "🏭" },
  { id: "services", label: "Services", icon: "💼" },
  { id: "logistics", label: "Logistics", icon: "🚛" },
  { id: "other", label: "Other", icon: "📋" },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [businessType, setBusinessType] = useState<string | null>(null);
  const [income, setIncome] = useState(50000);
  const [udhaari, setUdhaari] = useState<boolean | null>(null);

  const steps = [
    {
      icon: <User className="w-6 h-6 text-primary" />,
      title: "Your Name",
      content: (
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="w-full bg-card rounded-xl px-4 py-3.5 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/50"
        />
      ),
      valid: name.length > 0,
    },
    {
      icon: <Store className="w-6 h-6 text-primary" />,
      title: "Business Name",
      subtitle: "Optional",
      content: (
        <input
          value={business}
          onChange={(e) => setBusiness(e.target.value)}
          placeholder="e.g., Sharma General Store"
          className="w-full bg-card rounded-xl px-4 py-3.5 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/50"
        />
      ),
      valid: true,
    },
    {
      icon: <Building2 className="w-6 h-6 text-primary" />,
      title: "Business Type",
      subtitle: "What type of MSME is your business?",
      content: (
        <div className="grid grid-cols-2 gap-2">
          {businessTypes.map((bt) => (
            <button
              key={bt.id}
              onClick={() => setBusinessType(bt.id)}
              className={`flex items-center gap-2.5 p-3 rounded-xl text-sm font-semibold transition-all ${
                businessType === bt.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground hover-blue"
              }`}
            >
              <span className="text-lg">{bt.icon}</span>
              <span className="text-xs">{bt.label}</span>
            </button>
          ))}
        </div>
      ),
      valid: businessType !== null,
    },
    {
      icon: <IndianRupee className="w-6 h-6 text-primary" />,
      title: "Monthly Income",
      content: (
        <div className="space-y-4">
          <p className="text-rupee text-center">₹{income.toLocaleString("en-IN")}</p>
          <input
            type="range"
            min={10000}
            max={500000}
            step={5000}
            value={income}
            onChange={(e) => setIncome(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>₹10K</span><span>₹5L</span>
          </div>
        </div>
      ),
      valid: true,
    },
    {
      icon: <span className="text-2xl">🤝</span>,
      title: "Do you give udhaari?",
      subtitle: "Credit to customers",
      content: (
        <div className="flex gap-3">
          {[true, false].map((val) => (
            <button
              key={String(val)}
              onClick={() => setUdhaari(val)}
              className={`flex-1 py-4 rounded-xl text-sm font-bold transition-all ${
                udhaari === val
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover-blue"
              }`}
            >
              {val ? "Yes / हाँ" : "No / नहीं"}
            </button>
          ))}
        </div>
      ),
      valid: udhaari !== null,
    },
  ];

  const current = steps[step];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm animate-fade-up">
        {/* Progress */}
        <div className="flex gap-1.5 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-border"}`} />
          ))}
        </div>

        <div className="bg-card rounded-2xl card-shadow-md p-6 space-y-6">
          <div className="flex items-center gap-3">
            {current.icon}
            <div>
              <h2 className="text-lg font-bold text-heading">{current.title}</h2>
              {current.subtitle && <p className="text-xs text-muted-foreground">{current.subtitle}</p>}
            </div>
          </div>

          {current.content}

          <button
            onClick={() => step < steps.length - 1 ? setStep(step + 1) : navigate("/home")}
            disabled={!current.valid}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold text-sm disabled:opacity-40 active:scale-[0.98] transition-all"
          >
            {step < steps.length - 1 ? "Next" : "Get Started"} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
