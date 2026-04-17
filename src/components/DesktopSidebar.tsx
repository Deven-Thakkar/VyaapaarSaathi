import { Home, BarChart3, Sparkles, TrendingUp, Package, HandCoins, Settings } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function DesktopSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const { t } = useTranslation();

  const navItems = [
    { icon: Home, label: t("nav.home"), path: "/home" },
    { icon: BarChart3, label: t("nav.insights"), path: "/insights" },
    { icon: Sparkles, label: t("nav.ai"), path: "/ai" },
    { icon: TrendingUp, label: t("nav.sales"), path: "/sales" },
    { icon: Package, label: t("nav.inventory"), path: "/inventory" },
    { icon: HandCoins, label: t("nav.udhaar"), path: "/udhaari" },
    { icon: Settings, label: t("nav.settings"), path: "/settings" },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col h-screen fixed left-0 top-0 bg-card/80 backdrop-blur-md border-r border-border shadow-xl transition-all duration-300 z-40 ${
        expanded ? "w-60" : "w-16"
      }`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="flex items-center gap-2 px-4 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-gradient-auth flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        {expanded && (
          <div className="overflow-hidden animate-fade-in">
            <h1 className="text-sm font-bold text-heading whitespace-nowrap">{t("app.name")}</h1>
          </div>
        )}
      </div>
      <nav className="flex flex-col gap-1 p-2 flex-1">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-accent hover:text-primary"
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {expanded && <span className="whitespace-nowrap animate-fade-in">{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
