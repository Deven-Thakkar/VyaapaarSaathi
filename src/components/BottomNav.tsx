import { Home, Plus, TrendingUp, Package, HandCoins, MoreHorizontal } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Home", path: "/home" },
  { icon: TrendingUp, label: "Sales", path: "/sales" },
  { icon: Plus, label: "Add", path: "/add", isCenter: true },
  { icon: Package, label: "Inventory", path: "/inventory" },
  { icon: HandCoins, label: "Udhaari", path: "/udhaari" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border card-shadow-md lg:hidden">
      <div className="flex items-center justify-around h-[var(--nav-height)] max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          if (item.isCenter) {
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex items-center justify-center w-14 h-14 -mt-6 rounded-full bg-primary text-primary-foreground shadow-lg active:scale-95 transition-transform"
              >
                <item.icon className="w-7 h-7" />
              </button>
            );
          }
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
