import { Home, TrendingUp, Package, HandCoins, Plus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const leftItems = [
    { icon: Home, label: t("nav.home"), path: "/home", badge: 0 },
    { icon: TrendingUp, label: t("nav.sales"), path: "/sales", badge: 0 },
  ];
  const rightItems = [
    { icon: Package, label: t("nav.inventory"), path: "/inventory", badge: 4 },
    { icon: HandCoins, label: t("nav.udhaar"), path: "/udhaari", badge: 5 },
  ];

  const renderItem = (item: { icon: any; label: string; path: string; badge: number }) => {
    const active = location.pathname === item.path;
    return (
      <button
        key={item.path}
        onClick={() => navigate(item.path)}
        className={`relative flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
          active ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <item.icon className="w-5 h-5" />
        <span className="text-[10px] font-medium">{item.label}</span>
        {item.badge > 0 && (
          <span className="absolute -top-0.5 right-1 min-w-[16px] h-4 flex items-center justify-center bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full px-1">
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  const addActive = location.pathname === "/add";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border md:hidden">
      <div className="relative flex items-center justify-around h-[var(--nav-height)] max-w-lg mx-auto px-2">
        {leftItems.map(renderItem)}

        {/* Center Add button */}
        <div className="relative flex flex-col items-center justify-center w-16">
          <button
            onClick={() => navigate("/add")}
            aria-label={t("nav.add")}
            className={`absolute -top-7 w-14 h-14 rounded-full bg-gradient-auth text-primary-foreground flex items-center justify-center shadow-xl ring-4 ring-background active:scale-95 transition-transform ${
              addActive ? "animate-glow-pulse" : ""
            }`}
          >
            <Plus className="w-7 h-7" strokeWidth={3} />
          </button>
          <span className={`mt-9 text-[10px] font-semibold ${addActive ? "text-primary" : "text-muted-foreground"}`}>
            {t("nav.add")}
          </span>
        </div>

        {rightItems.map(renderItem)}
      </div>
    </nav>
  );
}
