import { Home, Plus, TrendingUp, Package, HandCoins, ChevronLeft, ChevronRight, Receipt } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

const navItems = [
  { icon: Home, label: "Home", path: "/home" },
  { icon: TrendingUp, label: "Sales", path: "/sales" },
  { icon: Plus, label: "Add Entry", path: "/add" },
  { icon: Package, label: "Inventory", path: "/inventory" },
  { icon: HandCoins, label: "Udhaari", path: "/udhaari" },
  { icon: Receipt, label: "Transactions", path: "/transactions" },
];

export default function DesktopSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      className={`hidden md:flex flex-col h-screen fixed left-0 top-0 bg-background border-r border-border transition-all duration-200 z-40 ${
        expanded ? "w-56" : "w-16"
      }`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="flex items-center gap-2 px-4 py-5 border-b border-border">
        <span className="text-xl">💼</span>
        {expanded && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-heading whitespace-nowrap">BizBuddy</h1>
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
                active
                  ? "bg-accent text-primary"
                  : "text-muted-foreground hover-blue"
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
