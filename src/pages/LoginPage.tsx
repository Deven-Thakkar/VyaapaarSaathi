import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, ArrowRight, Sparkles, User, Building2, IndianRupee, Target, TrendingUp, Package, Users, Home as HomeIcon, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useProfile } from "@/context/ProfileContext";
import { supabase } from "@/lib/supabase";
import { createCustomer } from "@/lib/customer-api";
import { getBusinessByPhone } from "@/lib/business-api";

type Tab = "login" | "signup";

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { updateProfile } = useProfile();
  const [tab, setTab] = useState<Tab>("login");
  const [errorMsg, setErrorMsg] = useState("");

  // login state
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // signup state
  const [name, setName] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [bizType, setBizType] = useState("");
  const [revenue, setRevenue] = useState("");
  const [investment, setInvestment] = useState("");
  const [goal, setGoal] = useState("");
  const [stock, setStock] = useState("");
  const [salaries, setSalaries] = useState("");
  const [rent, setRent] = useState("");
  const [utilities, setUtilities] = useState("");

  const bizTypes = [
    { v: "kirana", l: t("auth.bizTypes.kirana") },
    { v: "retail", l: t("auth.bizTypes.retail") },
    { v: "logistics", l: t("auth.bizTypes.logistics") },
    { v: "services", l: t("auth.bizTypes.services") },
    { v: "manufacturing", l: t("auth.bizTypes.manufacturing") },
    { v: "others", l: t("auth.bizTypes.others") },
  ];

  const handleLoginWithPhone = async () => {
    try {
      setErrorMsg("");
      setIsLoading(true);

      if (phone.length < 10) {
        setErrorMsg("Please enter a valid 10-digit phone number");
        return;
      }

      // Fetch business by phone number
      const business = await getBusinessByPhone(phone);

      if (!business) {
        setErrorMsg("No account found with this phone number. Please sign up first.");
        return;
      }

      // Update profile with business data
      updateProfile({
        name: business.owner_name,
        phone: business.phone_number,
        businessId: business.id,
        businessName: business.shop_name,
        businessType: business.business_type,
        monthlyRevenue: business.monthly_revenue,
        investment: business.investment_amount,
        stock: business.cost_stock,
        salaries: business.cost_salaries,
        rent: business.cost_rent,
        utilities: business.cost_utilities,
      });

      navigate("/home");
    } catch (error) {
      console.error("Login error:", error);
      setErrorMsg("Failed to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    try {
      setErrorMsg("");
      setIsLoading(true);

      if (!name || !bizType || !revenue) {
        alert("Please fill all required fields");
        return;
      }

      // Format phone consistently
      const phoneForStorage = signupPhone ? `+91${signupPhone}` : null;

      // Insert into Supabase table public.businesses
      const { data: businessData, error: businessError } = await supabase
        .from("businesses")
        .insert([
          {
            owner_name: name,
            phone_number: phoneForStorage,
            shop_name: `${name}'s Shop`,
            business_type: bizType,
            monthly_revenue: Number(revenue) || 0,
            investment_amount: Number(investment) || 0,
            cost_stock: Number(stock) || 0,
            cost_salaries: Number(salaries) || 0,
            cost_rent: Number(rent) || 0,
            cost_utilities: Number(utilities) || 0,
          },
        ])
        .select()
        .single();

      if (businessError) {
        console.error("Signup error:", businessError);
        setErrorMsg("Failed to create account. Please try again.");
        return;
      }

      const businessId = businessData.id;

      // Create a default customer entry for the business
      try {
        await createCustomer({
          business_id: businessId,
          name: name,
          phone_number: phoneForStorage || undefined,
          total_outstanding: 0,
        });
      } catch (customerError) {
        console.error("Warning: Failed to create initial customer:", customerError);
      }

      // Update local profile state
      updateProfile({
        name: name,
        phone: phoneForStorage || "",
        businessId: businessId,
        businessName: `${name}'s Shop`,
        businessType: bizType,
        monthlyRevenue: Number(revenue) || 0,
        investment: Number(investment) || 0,
        stock: Number(stock) || 0,
        salaries: Number(salaries) || 0,
        rent: Number(rent) || 0,
        utilities: Number(utilities) || 0,
      });

      navigate("/home");
    } catch (error) {
      console.error("Signup error:", error);
      setErrorMsg("Failed to complete signup. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
              {errorMsg && <div className="bg-destructive/10 text-destructive text-xs p-2 rounded-lg">{errorMsg}</div>}
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
              <PrimaryBtn onClick={handleLoginWithPhone} disabled={phone.length < 10 || isLoading}>
                {isLoading ? "Logging in..." : <>{t("auth.cont")} <ArrowRight className="w-4 h-4" /></>}
              </PrimaryBtn>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 scrollbar-hide">
              {errorMsg && <div className="bg-destructive/10 text-destructive text-xs p-2 rounded-lg">{errorMsg}</div>}
              <Field icon={<Phone className="w-4 h-4" />} label={t("auth.phone")}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">+91</span>
                  <input
                    type="tel"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder={t("auth.phonePh")}
                    className="flex-1 bg-transparent outline-none text-sm font-medium text-foreground placeholder:text-muted-foreground/50"
                  />
                </div>
              </Field>
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
                <NumInput value={revenue} setValue={setRevenue} placeholder={t("auth.monthlyRevenuePh")} />
              </Field>
              <Field icon={<TrendingUp className="w-4 h-4" />} label={t("auth.investment")}>
                <NumInput value={investment} setValue={setInvestment} placeholder={t("auth.investmentPh")} />
              </Field>
              <Field icon={<Target className="w-4 h-4" />} label={t("auth.goal")}>
                <input
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder={t("auth.goalPh")}
                  className="w-full bg-transparent outline-none text-sm font-medium text-foreground placeholder:text-muted-foreground/50"
                />
              </Field>

              <div className="pt-2 pb-1">
                <p className="text-[11px] font-bold uppercase tracking-wide text-primary">
                  {t("auth.financials")}
                </p>
              </div>

              <Field icon={<Package className="w-4 h-4" />} label={t("auth.stock")}>
                <NumInput value={stock} setValue={setStock} placeholder={t("auth.stockPh")} />
              </Field>
              <Field icon={<Users className="w-4 h-4" />} label={t("auth.salaries")}>
                <NumInput value={salaries} setValue={setSalaries} placeholder={t("auth.salariesPh")} />
              </Field>
              <Field icon={<HomeIcon className="w-4 h-4" />} label={t("auth.rent")}>
                <NumInput value={rent} setValue={setRent} placeholder={t("auth.rentPh")} />
              </Field>
              <Field icon={<Zap className="w-4 h-4" />} label={t("auth.utilities")}>
                <NumInput value={utilities} setValue={setUtilities} placeholder={t("auth.utilitiesPh")} />
              </Field>

              <PrimaryBtn onClick={handleSignup} disabled={isLoading || !name || !bizType || !revenue || signupPhone.length < 10}>
                {isLoading ? "Signing up..." : <>{t("auth.cont")} <ArrowRight className="w-4 h-4" /></>}
              </PrimaryBtn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NumInput({ value, setValue, placeholder }: { value: string; setValue: (v: string) => void; placeholder: string }) {
  return (
    <input
      type="tel"
      inputMode="numeric"
      value={value}
      onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
      placeholder={placeholder}
      className="w-full bg-transparent outline-none text-sm font-medium text-foreground placeholder:text-muted-foreground/50"
    />
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
