import AppShell from "@/components/AppShell";
import PageHeader from "@/components/PageHeader";
import { User, Building2, Globe, LogOut, Pencil, Wallet, Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useProfile, FinancialProfile } from "@/context/ProfileContext";

const langs = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "mr", label: "मराठी" },
];

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { profile, updateProfile } = useProfile();

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto p-4 lg:p-6">
        <PageHeader title={t("settings.title")} />

        {/* Profile */}
        <div className="bg-card rounded-2xl card-shadow-md p-5 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-auth text-primary-foreground flex items-center justify-center text-2xl font-extrabold">
              {profile.name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="text-base font-bold text-heading">{profile.name}</p>
              <p className="text-xs text-muted-foreground">{profile.phone}</p>
            </div>
            <button className="p-2 rounded-lg bg-accent text-primary hover:bg-accent/80 transition-colors" aria-label={t("settings.edit")}>
              <Pencil className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Business */}
        <Section title={t("settings.business")} icon={<Building2 className="w-4 h-4" />}>
          <Row label={t("settings.businessName")} value={profile.businessName} />
          <Row label={t("settings.businessTypeLabel")} value={profile.businessType} />
          <Row label={t("settings.monthlyRevenueLabel")} value={fmt(profile.monthlyRevenue)} />
        </Section>

        {/* Editable financials */}
        <Section title={t("settings.financials")} icon={<Wallet className="w-4 h-4" />}>
          <EditRow label={t("auth.stock")} field="stock" value={profile.stock} onSave={updateProfile} />
          <EditRow label={t("auth.salaries")} field="salaries" value={profile.salaries} onSave={updateProfile} />
          <EditRow label={t("auth.rent")} field="rent" value={profile.rent} onSave={updateProfile} />
          <EditRow label={t("auth.utilities")} field="utilities" value={profile.utilities} onSave={updateProfile} />
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
          <Row label="Name" value={profile.name} />
          <Row label="Phone" value={profile.phone} />
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

function EditRow({
  label,
  field,
  value,
  onSave,
}: {
  label: string;
  field: keyof FinancialProfile;
  value: number;
  onSave: (patch: Partial<FinancialProfile>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  const save = () => {
    onSave({ [field]: Number(draft) || 0 } as Partial<FinancialProfile>);
    setEditing(false);
  };

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/60 last:border-0 gap-2">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      {editing ? (
        <div className="flex items-center gap-1.5 flex-1 justify-end">
          <input
            type="tel"
            inputMode="numeric"
            value={draft}
            onChange={(e) => setDraft(e.target.value.replace(/\D/g, ""))}
            className="w-28 bg-muted rounded-lg px-2.5 py-1.5 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary text-right"
            autoFocus
          />
          <button onClick={save} className="p-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20" aria-label="Save">
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setDraft(String(value));
              setEditing(false);
            }}
            className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-accent"
            aria-label="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => {
            setDraft(String(value));
            setEditing(true);
          }}
          className="flex items-center gap-1.5 group"
        >
          <span className="text-sm font-semibold text-foreground">₹{value.toLocaleString("en-IN")}</span>
          <Pencil className="w-3 h-3 text-muted-foreground group-hover:text-primary" />
        </button>
      )}
    </div>
  );
}
