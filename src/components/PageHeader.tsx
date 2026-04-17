import { ReactNode, useState } from "react";
import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/context/ProfileContext";
import LanguageSwitcher from "./LanguageSwitcher";
import SidebarDrawer from "./SidebarDrawer";

export default function PageHeader({
  title,
  subtitle,
  right,
  showLang = true,
  showProfile = true,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  showLang?: boolean;
  showProfile?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { profile } = useProfile();
  const initial = (profile.name?.trim()?.[0] || "U").toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-30 -mx-4 lg:-mx-6 px-4 lg:px-6 py-3.5 mb-5 bg-[hsl(var(--primary-dark))] shadow-md">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setOpen(true)}
              className="p-1.5 -ml-1 rounded-lg text-primary-foreground hover:bg-primary-foreground/10 transition-colors shrink-0"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-primary-foreground truncate">{title}</h1>
              {subtitle && (
                <p className="text-[11px] text-primary-foreground/80 truncate">{subtitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {showLang && (
              <div className="[&_button]:!text-primary-foreground [&_button]:!bg-primary-foreground/10 [&_button:hover]:!bg-primary-foreground/20 [&_svg]:!text-primary-foreground">
                <LanguageSwitcher />
              </div>
            )}
            {right}
            {showProfile && (
              <button
                onClick={() => navigate("/settings")}
                aria-label="Profile / Settings"
                className="w-9 h-9 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-sm shadow-sm hover:bg-accent/80 transition-colors"
              >
                {initial}
              </button>
            )}
          </div>
        </div>
      </header>
      <SidebarDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
