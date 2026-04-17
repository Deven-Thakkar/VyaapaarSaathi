import { ReactNode } from "react";
import LanguageSwitcher from "./LanguageSwitcher";

export default function PageHeader({
  title,
  subtitle,
  right,
  showLang = true,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  showLang?: boolean;
}) {
  return (
    <header className="sticky top-0 z-30 -mx-4 lg:-mx-6 px-4 lg:px-6 py-4 mb-5 bg-gradient-app/80 backdrop-blur-md border-b border-white/40">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-heading truncate">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {showLang && <LanguageSwitcher />}
          {right}
        </div>
      </div>
    </header>
  );
}
