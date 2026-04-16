import AppShell from "@/components/AppShell";
import { User, Building2, Globe, LogOut, ChevronRight, Pencil } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const langs = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "mr", label: "मराठी" },
];

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto p-4 lg:p-6">
        <h1 className="text-xl font-bold text-heading mb-5">{t("settings.title")}</h1>

        {/* Profile */}
        <div className="bg-card rounded-2xl card-shadow-md p-5 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-auth text-primary-foreground flex items-center justify-center text-2xl font-extrabold">
              R
            </div>
            <div className="flex-1">
              <p className="text-base font-bold text-heading">Rahul Sharma</p>
              <p className="text-xs text-muted-foreground">+91 98765 43210</p>
            </div>
            <button className="p-2 rounded-lg bg-accent text-primary hover:bg-accent/80 transition-colors" aria-label={t("settings.edit")}>
              <Pencil className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Business */}
        <Section title={t("settings.business")} icon={<Building2 className="w-4 h-4" />}>
          <Row label="Business Name" value="Sharma General Store" />
          <Row label="Type" value="Retail / Kirana" />
          <Row label="Monthly Revenue" value="₹2,85,000" />
        </Section>

        {/* Language */}
        <Section title={t("settings.language")} icon={<Globe className="w-4 h-4" />}>
          <div className="grid grid-cols-3 gap-2">
            {langs.map((l) => (
              <button
                key={l.code}
                onClick={() => i18n.changeLanguage(l.code)}
                className={`py-3 rounded-xl text-sm font-semibold transition-all ${
                  i18n.language === l.code
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground hover:bg-accent"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </Section>

        {/* Profile section */}
        <Section title={t("settings.profile")} icon={<User className="w-4 h-4" />}>
          <Row label="Name" value="Rahul Sharma" />
          <Row label="Phone" value="+91 98765 43210" />
          <Row label="Email" value="rahul@example.com" />
        </Section>

        <button
          onClick={() => navigate("/login")}
          className="w-full mt-2 flex items-center justify-center gap-2 bg-destructive/10 text-destructive py-3.5 rounded-2xl font-semibold text-sm hover:bg-destructive/20 transition"
        >
          <LogOut className="w-4 h-4" /> {t("settings.logout")}
        </button>
      </div>
    </AppShell>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl card-shadow p-4 mb-4">
      <div className="flex items-center gap-2 mb-3 text-primary">
        {icon}
        <h2 className="text-xs font-bold uppercase tracking-wide">{title}</h2>
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/60 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}
