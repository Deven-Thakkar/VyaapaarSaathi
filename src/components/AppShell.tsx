import { ReactNode } from "react";
import BottomNav from "./BottomNav";
import DesktopSidebar from "./DesktopSidebar";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />
      <main className="lg:ml-64 pb-[var(--nav-height)] lg:pb-0 min-h-screen">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
