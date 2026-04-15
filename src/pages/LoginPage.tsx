import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">💼</div>
          <h1 className="text-2xl font-bold text-foreground">BizBuddy</h1>
          <p className="text-sm text-muted-foreground mt-1">Your AI Business Assistant</p>
        </div>

        <div className="bg-card rounded-2xl card-shadow-md p-6 space-y-5">
          {step === "phone" ? (
            <>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Phone Number</label>
                <div className="flex items-center gap-2 bg-secondary rounded-xl px-4 py-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">+91</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="Enter mobile number"
                    className="flex-1 bg-transparent outline-none text-sm font-medium text-foreground placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>
              <button
                onClick={() => setStep("otp")}
                disabled={phone.length < 10}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold text-sm disabled:opacity-40 active:scale-[0.98] transition-all"
              >
                Get OTP <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Enter OTP</label>
                <div className="flex gap-2 justify-center">
                  {[0, 1, 2, 3].map((i) => (
                    <input
                      key={i}
                      type="tel"
                      maxLength={1}
                      value={otp[i] || ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        const newOtp = otp.split("");
                        newOtp[i] = val;
                        setOtp(newOtp.join(""));
                        if (val && e.target.nextElementSibling) {
                          (e.target.nextElementSibling as HTMLInputElement).focus();
                        }
                      }}
                      className="w-14 h-14 text-center text-xl font-bold bg-secondary rounded-xl outline-none focus:ring-2 focus:ring-primary text-foreground"
                    />
                  ))}
                </div>
              </div>
              <button
                onClick={() => navigate("/language")}
                disabled={otp.length < 4}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold text-sm disabled:opacity-40 active:scale-[0.98] transition-all"
              >
                Verify & Continue <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => setStep("phone")} className="w-full text-xs text-muted-foreground">
                Change number
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
