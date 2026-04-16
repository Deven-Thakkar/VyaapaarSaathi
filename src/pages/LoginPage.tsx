import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, ArrowRight, Sparkles, User, Building2, IndianRupee, Target, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

type Tab = "login" | "signup";

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("login");

  // login state
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");

  // signup state
  const [name, setName] = useState("");
  const [bizType, setBizType] = useState("");
  const [revenue, setRevenue] = useState("");
  const [investment, setInvestment] = useState("");
  const [goal, setGoal] = useState("");

  const bizTypes = [
    { v: "kirana", l: t("auth.bizTypes.kirana") },
    { v: "retail", l: t("auth.bizTypes.retail") },
    { v: "logistics", l: t("auth.bizTypes.logistics") },
    { v: "services", l: t("auth.bizTypes.services") },
    { v: "manufacturing", l: t("auth.bizTypes.manufacturing") },
    { v: "others", l: t("auth.bizTypes.others") },
  ];

  return (
    <div className="min-h-screen bg-gradient-auth flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-sm animate-fade-up">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-foreground/10 backdrop-blur mb-3">
            <Sparkles className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-extrabold text-primary-foreground">{t("app.name")}</h1>
          <p className="text-xs text-primary-foreground/80 mt-1">{t("app.tagline")}</p>
        </div>

        <div className="bg-card rounded-3xl card-shadow-md p-5">
          {/* Tabs */}
          <div className="grid grid-cols-2 bg-muted rounded-xl p-1 mb-5">
            {(["login", "signup"] as Tab[]).map((t1) => (
              <button
                key={t1}
                onClick={() => setTab(t1)}
                className={`py-2 rounded-lg text-sm font-semibold transition-all ${
                  tab === t1 ? "bg-background text-primary shadow-sm" : "text-muted-foreground"
                }`}
              >
                {t1 === "login" ? t("auth.login") : t("auth.signup")}
              </button>
            ))}
          </div>

          {tab === "login" ? (
            <div className="space-y-4">
              {step === "phone" ? (
                <>
                  <Field icon={<Phone className="w-4 h-4" />} label={t("auth.phone")}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">+91</span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder={t("auth.phonePh")}
                        className="flex-1 bg-transparent outline-none text-sm font-medium text-foreground placeholder:text-muted-foreground/50"
                      />
                    </div>
                  </Field>
                  <PrimaryBtn onClick={() => setStep("otp")} disabled={phone.length < 10}>
                    {t("auth.getOtp")} <ArrowRight className="w-4 h-4" />
                  </PrimaryBtn>
                </>
              ) : (
                <>
                  <label className="text-xs font-semibold text-muted-foreground block">{t("auth.otp")}</label>
                  <div className="flex gap-2 justify-center">
                    {[0, 1, 2, 3].map((i) => (
                      <input
                        key={i}
                        type="tel"
                        maxLength={1}
                        value={otp[i] || ""}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          const arr = otp.split("");
                          arr[i] = val;
                          setOtp(arr.join(""));
                          if (val && e.target.nextElementSibling) {
                            (e.target.nextElementSibling as HTMLInputElement).focus();
                          }
                        }}
                        className="w-12 h-14 text-center text-xl font-bold bg-muted rounded-xl outline-none focus:ring-2 focus:ring-primary text-foreground"
                      />
                    ))}
                  </div>
                  <PrimaryBtn onClick={() => navigate("/home")} disabled={otp.length < 4}>
                    {t("auth.loginOtp")} <ArrowRight className="w-4 h-4" />
                  </PrimaryBtn>
                  <button onClick={() => setStep("phone")} className="w-full text-xs text-muted-foreground">
                    {t("auth.changeNumber")}
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <Field icon={<User className="w-4 h-4" />} label={t("auth.name")}>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("auth.namePh")}
                  className="w-full bg-transparent outline-none text-sm font-medium text-foreground placeholder:text-muted-foreground/50"
                />
              </Field>
              <Field icon={<Building2 className="w-4 h-4" />} label={t("auth.businessType")}>
                <select
                  value={bizType}
                  onChange={(e) => setBizType(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm font-medium text-foreground"
                >
                  <option value="">{t("auth.selectType")}</option>
                  {bizTypes.map((b) => (
                    <option key={b.v} value={b.v}>{b.l}</option>
                  ))}
                </select>
              </Field>
              <Field icon={<IndianRupee className="w-4 h-4" />} label={t("auth.monthlyRevenue")}>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value.replace(/\D/g, ""))}
                  placeholder={t("auth.monthlyRevenuePh")}
                  className="w-full bg-transparent outline-none text-sm font-medium text-foreground placeholder:text-muted-foreground/50"
                />
              </Field>
              <Field icon={<TrendingUp className="w-4 h-4" />} label={t("auth.investment")}>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={investment}
                  onChange={(e) => setInvestment(e.target.value.replace(/\D/g, ""))}
                  placeholder={t("auth.investmentPh")}
                  className="w-full bg-transparent outline-none text-sm font-medium text-foreground placeholder:text-muted-foreground/50"
                />
              </Field>
              <Field icon={<Target className="w-4 h-4" />} label={t("auth.goal")}>
                <input
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder={t("auth.goalPh")}
                  className="w-full bg-transparent outline-none text-sm font-medium text-foreground placeholder:text-muted-foreground/50"
                />
              </Field>
              <PrimaryBtn
                onClick={() => navigate("/home")}
                disabled={!name || !bizType || !revenue}
              >
                {t("auth.cont")} <ArrowRight className="w-4 h-4" />
              </PrimaryBtn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-muted-foreground mb-1.5 block">{label}</label>
      <div className="flex items-center gap-2 bg-muted rounded-xl px-3.5 py-3">
        <span className="text-muted-foreground">{icon}</span>
        {children}
      </div>
    </div>
  );
}

function PrimaryBtn({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="w-full flex items-center justify-center gap-2 bg-gradient-auth text-primary-foreground py-3.5 rounded-xl font-semibold text-sm disabled:opacity-40 active:scale-[0.98] transition-all"
    >
      {children}
    </button>
  );
}
