import { Home, Plus, TrendingUp, Package, HandCoins } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const navItems = [
    { icon: Home, label: t("nav.home"), path: "/home", badge: 0 },
    { icon: TrendingUp, label: t("nav.sales"), path: "/sales", badge: 0 },
    { icon: Plus, label: t("nav.add"), path: "/add", isCenter: true, badge: 0 },
    { icon: Package, label: t("nav.inventory"), path: "/inventory", badge: 4 },
    { icon: HandCoins, label: t("nav.udhaar"), path: "/udhaari", badge: 5 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border md:hidden">
      <div className="flex items-center justify-around h-[var(--nav-height)] max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          if (item.isCenter) {
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex items-center justify-center w-14 h-14 -mt-6 rounded-full bg-gradient-auth text-primary-foreground shadow-lg active:scale-95 transition-transform"
                aria-label={item.label}
              >
                <item.icon className="w-7 h-7" />
              </button>
            );
          }
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
        })}
      </div>
    </nav>
  );
}
