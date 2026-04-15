import { Home, Plus, TrendingUp, Package, HandCoins } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Home", path: "/home" },
  { icon: TrendingUp, label: "Sales", path: "/sales" },
  { icon: Plus, label: "Add Entry", path: "/add" },
  { icon: Package, label: "Inventory", path: "/inventory" },
  { icon: HandCoins, label: "Udhaari", path: "/udhaari" },
];

export default function DesktopSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 bg-card border-r border-border p-4">
      <div className="mb-8 px-3">
        <h1 className="text-xl font-bold text-foreground">💼 BizBuddy</h1>
        <p className="text-xs text-muted-foreground mt-1">Your AI Business Assistant</p>
      </div>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
