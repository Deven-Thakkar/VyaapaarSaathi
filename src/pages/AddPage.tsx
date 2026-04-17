import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { Camera, Barcode, Mic, PenLine, Package, IndianRupee, ArrowLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

type Category = "inventory" | "sales";

export default function AddPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);

  const methods = [
    {
      key: "scan",
      icon: Camera,
      label: t("add.scanBill"),
      desc: t("add.scanBillDesc"),
      iconBg: "bg-orange-100 text-orange-600",
      ring: "hover:border-orange-400",
    },
    {
      key: "barcode",
      icon: Barcode,
      label: t("add.scanBarcode"),
      desc: t("add.scanBarcodeDesc"),
      iconBg: "bg-purple-100 text-purple-600",
      ring: "hover:border-purple-400",
    },
    {
      key: "voice",
      icon: Mic,
      label: t("add.voice"),
      desc: t("add.voiceDesc"),
      iconBg: "bg-green-100 text-green-600",
      ring: "hover:border-green-400",
    },
    {
      key: "manual",
      icon: PenLine,
      label: t("add.manual"),
      desc: t("add.manualDesc"),
      iconBg: "bg-teal-100 text-teal-600",
      ring: "hover:border-teal-400",
    },
  ];

  const backBtn = category ? (
    <button
      onClick={() => setCategory(null)}
      className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-accent transition-colors"
      aria-label={t("add.back")}
    >
      <ArrowLeft className="w-4 h-4" />
    </button>
  ) : null;

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto p-4 lg:p-6">
        <PageHeader
          title={t("add.title")}
          subtitle={category ? t("add.chooseHow") : t("add.chooseWhat")}
          right={backBtn}
        />

        {!category ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
            <CategoryCard
              icon={<Package className="w-6 h-6" />}
              label={t("add.inventory")}
              desc={t("add.inventoryDesc")}
              onClick={() => setCategory("inventory")}
            />
            <CategoryCard
              icon={<IndianRupee className="w-6 h-6" />}
              label={t("add.sales")}
              desc={t("add.salesDesc")}
              onClick={() => setCategory("sales")}
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 animate-fade-in">
            {methods.map((m) => (
              <button
                key={m.key}
                onClick={() => {
                  if (m.key === "voice") {
                    navigate("/add/voice");
                  } else if (m.key === "scan") {
                    if (category === "inventory") {
                      navigate("/inventory/scan");
                    } else {
                      navigate("/add/scan");
                    }
                  } else if (m.key === "manual" && category === "inventory") {
                    navigate("/inventory/manual-entry");
                  } else if (m.key === "manual" && category === "sales") {
                    navigate("/add/sales/manual");
                  } else {
                    // Placeholder for other methods
                    console.log(`${m.key} clicked`);
                  }
                }}
                className={`flex flex-col items-center gap-3 bg-card rounded-2xl card-shadow p-6 lift active:scale-[0.97] transition-all border-2 border-transparent ${m.ring}`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${m.iconBg}`}>
                  <m.icon className="w-7 h-7" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">{m.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{m.desc}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function CategoryCard({
  icon,
  label,
  desc,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-4 bg-card rounded-2xl card-shadow-md p-5 lift active:scale-[0.98] transition-all border-2 border-transparent hover:border-primary/40 text-left"
    >
      <div className="w-14 h-14 rounded-2xl bg-gradient-auth text-primary-foreground flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-base font-bold text-heading">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
    </button>
  );
}
