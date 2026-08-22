import { useState, type ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { MobileSidebar, SidebarNav } from "@/components/layout/Sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-60 lg:block" aria-label="Sidebar">
        <SidebarNav />
      </aside>
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="lg:pl-60">
        <Header onMenu={() => setMobileOpen(true)} />
        <main className="rise-in px-3 py-4 sm:px-5 sm:py-6">{children}</main>
      </div>
    </div>
  );
}
