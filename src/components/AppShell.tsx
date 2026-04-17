import { ReactNode } from "react";
import BottomNav from "./BottomNav";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-app">
      <main className="pb-[var(--nav-height)] md:pb-0 min-h-screen transition-all">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
