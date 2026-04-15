import AppShell from "@/components/AppShell";
import { Camera, Barcode, Mic, PenLine } from "lucide-react";
import { useNavigate } from "react-router-dom";

const options = [
  { icon: Camera, label: "Scan Bill", desc: "Take photo of invoice", color: "bg-primary/10 text-primary" },
  { icon: Barcode, label: "Scan Barcode", desc: "Quick product entry", color: "bg-warning/10 text-warning" },
  { icon: Mic, label: "Voice Entry", desc: "Speak to add items", color: "bg-success/10 text-success" },
  { icon: PenLine, label: "Manual Entry", desc: "Type details", color: "bg-secondary text-foreground" },
];

export default function AddPage() {
  const navigate = useNavigate();

  return (
    <AppShell>
      <div className="max-w-md mx-auto p-4 pt-8">
        <h1 className="text-xl font-bold text-heading mb-1">Add Entry</h1>
        <p className="text-sm text-muted-foreground mb-6">Choose how to add</p>

        <div className="grid grid-cols-2 gap-3">
          {options.map((opt) => (
            <button
              key={opt.label}
              className="flex flex-col items-center gap-3 bg-card rounded-2xl card-shadow p-6 active:scale-[0.97] transition-all"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${opt.color}`}>
                <opt.icon className="w-7 h-7" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-foreground">{opt.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
