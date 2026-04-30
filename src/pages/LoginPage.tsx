import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, User, Building2, IndianRupee, Target, TrendingUp, Package, Users, Home as HomeIcon, Zap, Phone, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useProfile } from "@/context/ProfileContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { createCustomer } from "@/lib/customer-api";

type Tab = "login" | "signup";

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { updateProfile } = useProfile();
  const { signIn, signUp, user } = useAuth();
  const [tab, setTab] = useState<Tab>("login");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  // If already logged in, redirect
  if (user) {
    navigate("/home", { replace: true });
    return null;
  }

  const handleLogin = async () => {
    try {
      setErrorMsg("");
      setIsLoading(true);

      if (!loginEmail || !loginPassword) {
        setErrorMsg("Please enter your email and password.");
        return;
      }

      const { user: authUser, error } = await signIn(loginEmail, loginPassword);

      if (error) {
        setErrorMsg(error.message || "Invalid email or password.");
        return;
      }

      if (!authUser) {
        setErrorMsg("Login failed. Please try again.");
        return;
      }

      // Fetch business linked to this auth user
      const { data: business, error: bizError } = await supabase
        .from("businesses")
        .select("*")
        .eq("auth_user_id", authUser.id)
        .maybeSingle();

      if (bizError) {
        console.error("Business fetch error:", bizError);
      }

      if (business) {
        updateProfile({
          name: business.owner_name,
          phone: business.phone_number || "",
          email: authUser.email || "",
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
      } else {
        // User exists in auth but no business yet — set basic profile
        updateProfile({
          name: authUser.email?.split("@")[0] || "",
          email: authUser.email || "",
        });
      }

      navigate("/home");
    } catch (error: any) {
      console.error("Login error:", error);
      setErrorMsg(error?.message || "Failed to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    try {
      setErrorMsg("");
      setIsLoading(true);

      if (!signupEmail || !signupPassword || !name || !bizType || !revenue) {
        setErrorMsg("Please fill all required fields.");
        return;
      }

      if (signupPassword.length < 6) {
        setErrorMsg("Password must be at least 6 characters.");
        return;
      }

      if (signupPassword !== confirmPassword) {
        setErrorMsg("Passwords do not match.");
        return;
      }

      // 1. Create Supabase Auth user
      const { user: authUser, error: authError } = await signUp(signupEmail, signupPassword);

      if (authError) {
        setErrorMsg(authError.message || "Failed to create account.");
        return;
      }

      if (!authUser) {
        setErrorMsg("Account created! Please check your email to verify, then log in.");
        setTab("login");
        return;
      }

      // 2. Create business record linked to auth user
      const phoneForStorage = signupPhone ? `+91${signupPhone}` : null;

      const { data: businessData, error: businessError } = await supabase
        .from("businesses")
        .insert([
          {
            auth_user_id: authUser.id,
            email: signupEmail,
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
        console.error("Business creation error:", businessError);
        setErrorMsg("Account created but business setup failed. You can set up your business after logging in.");
        return;
      }

      const businessId = businessData.id;

      // 3. Create a default customer entry for the business
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

      // 4. Update local profile state
      updateProfile({
        name: name,
        phone: phoneForStorage || "",
        email: signupEmail,
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
    } catch (error: any) {
      console.error("Signup error:", error);
      setErrorMsg(error?.message || "Failed to complete signup. Please try again.");
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
          <img src="/logo.png" alt="VyaapaarSaathi" className="w-14 h-14 rounded-2xl mx-auto mb-3 object-cover" />
          <h1 className="text-2xl font-extrabold text-primary-foreground">{t("app.name")}</h1>
          <p className="text-xs text-primary-foreground/80 mt-1">{t("app.tagline")}</p>
        </div>

        <div className="bg-card rounded-3xl card-shadow-md p-5">
          {/* Tabs */}
          <div className="grid grid-cols-2 bg-muted rounded-xl p-1 mb-5">
            {(["login", "signup"] as Tab[]).map((t1) => (
              <button
                key={t1}
                onClick={() => { setTab(t1); setErrorMsg(""); }}
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
              <Field icon={<Mail className="w-4 h-4" />} label={t("auth.email") || "Email"}>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 bg-transparent outline-none text-sm font-medium text-foreground placeholder:text-muted-foreground/50"
                />
              </Field>
              <Field icon={<Lock className="w-4 h-4" />} label={t("auth.password") || "Password"}>
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="flex-1 bg-transparent outline-none text-sm font-medium text-foreground placeholder:text-muted-foreground/50"
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </Field>
              <PrimaryBtn onClick={handleLogin} disabled={!loginEmail || !loginPassword || isLoading}>
                {isLoading ? "Logging in..." : <>{t("auth.cont")} <ArrowRight className="w-4 h-4" /></>}
              </PrimaryBtn>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 scrollbar-hide">
              {errorMsg && <div className="bg-destructive/10 text-destructive text-xs p-2 rounded-lg">{errorMsg}</div>}

              {/* Account credentials */}
              <div className="pb-1">
                <p className="text-[11px] font-bold uppercase tracking-wide text-primary">Account</p>
              </div>
              <Field icon={<Mail className="w-4 h-4" />} label={t("auth.email") || "Email"}>
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-transparent outline-none text-sm font-medium text-foreground placeholder:text-muted-foreground/50"
                />
              </Field>
              <Field icon={<Lock className="w-4 h-4" />} label={t("auth.password") || "Password"}>
                <input
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full bg-transparent outline-none text-sm font-medium text-foreground placeholder:text-muted-foreground/50"
                />
              </Field>
              <Field icon={<Lock className="w-4 h-4" />} label="Confirm Password">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full bg-transparent outline-none text-sm font-medium text-foreground placeholder:text-muted-foreground/50"
                />
              </Field>

              {/* Business details */}
              <div className="pt-2 pb-1">
                <p className="text-[11px] font-bold uppercase tracking-wide text-primary">Business Details</p>
              </div>
              <Field icon={<User className="w-4 h-4" />} label={t("auth.name")}>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("auth.namePh")}
                  className="w-full bg-transparent outline-none text-sm font-medium text-foreground placeholder:text-muted-foreground/50"
                />
              </Field>
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

              <PrimaryBtn onClick={handleSignup} disabled={isLoading || !signupEmail || !signupPassword || !name || !bizType || !revenue}>
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
