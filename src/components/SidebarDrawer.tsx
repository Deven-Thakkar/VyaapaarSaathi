import { Home, BarChart3, Sparkles, TrendingUp, Package, HandCoins, Settings, X, Plus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

export default function SidebarDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const items = [
    { icon: Home, label: t("nav.home"), path: "/home" },
    { icon: BarChart3, label: t("nav.insights"), path: "/insights" },
    { icon: Sparkles, label: t("nav.ai"), path: "/ai" },
    { icon: TrendingUp, label: t("nav.sales"), path: "/sales" },
    { icon: Plus, label: t("nav.add"), path: "/add", highlight: true },
    { icon: Package, label: t("nav.inventory"), path: "/inventory" },
    { icon: HandCoins, label: t("nav.udhaar"), path: "/udhaari" },
    { icon: Settings, label: t("nav.settings"), path: "/settings" },
  ];

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const go = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[60] bg-foreground/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden
      />
      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 z-[70] h-screen w-[280px] bg-card shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-auth">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-foreground/15 backdrop-blur flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-primary-foreground">{t("app.name")}</p>
              <p className="text-[10px] text-primary-foreground/80">{t("app.tagline")}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-primary-foreground/10 text-primary-foreground"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {items.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => go(item.path)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-foreground hover:bg-accent hover:text-primary"
                }`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-5 py-3 border-t border-border text-[10px] text-muted-foreground">
          v1.0 · {t("app.name")}
        </div>
      </aside>
    </>
  );
}
