import { useState } from "react";
import { Navbar } from "./Navbar";
import { MobileSidebar, Sidebar } from "./Sidebar";
import { Toaster } from "./ui/sonner";

export function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar
        onMenuClick={() => {
          setOpen((o) => !o);
          setMobileOpen((o) => !o);
        }}
      />
      <div className="flex">
        <Sidebar open={open} />
        <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
