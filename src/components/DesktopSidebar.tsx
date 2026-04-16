import { Home, Plus, TrendingUp, Package, HandCoins, Sparkles, Settings } from "lucide-react";
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
    { icon: TrendingUp, label: t("nav.sales"), path: "/sales" },
    { icon: Plus, label: t("nav.add"), path: "/add" },
    { icon: Package, label: t("nav.inventory"), path: "/inventory" },
    { icon: HandCoins, label: t("nav.udhaar"), path: "/udhaari" },
    { icon: Sparkles, label: t("nav.ai"), path: "/ai" },
    { icon: Settings, label: t("nav.settings"), path: "/settings" },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col h-screen fixed left-0 top-0 bg-background border-r border-border transition-all duration-200 z-40 ${
        expanded ? "w-56" : "w-16"
      }`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="flex items-center gap-2 px-4 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-gradient-auth flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        {expanded && (
          <div className="overflow-hidden">
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active ? "bg-accent text-primary" : "text-muted-foreground hover-blue"
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {expanded && <span className="whitespace-nowrap">{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
