import { useNavigate } from "react-router-dom";
import { Volume2 } from "lucide-react";

const languages = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "हिंदी", native: "Hindi" },
  { code: "mr", label: "मराठी", native: "Marathi" },
];

export default function LanguagePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🌐</div>
          <h1 className="text-xl font-bold text-foreground">Choose Language</h1>
          <p className="text-sm text-muted-foreground mt-1">भाषा चुनें</p>
        </div>

        <div className="space-y-3">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => navigate("/onboarding")}
              className="w-full flex items-center justify-between bg-card rounded-2xl card-shadow p-5 active:scale-[0.98] transition-all hover:card-shadow-md"
            >
              <div>
                <p className="text-lg font-bold text-foreground">{lang.label}</p>
                <p className="text-xs text-muted-foreground">{lang.native}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary text-xs font-medium text-muted-foreground"
              >
                <Volume2 className="w-3.5 h-3.5" /> Play
              </button>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
