import { ReactNode, useState } from "react";
import BottomNav from "./BottomNav";
import DesktopSidebar from "./DesktopSidebar";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />
      <main className="md:ml-16 pb-[var(--nav-height)] md:pb-0 min-h-screen transition-all">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
