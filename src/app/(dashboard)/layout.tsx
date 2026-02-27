"use client";

import { useState } from "react";
import { Sidebar, MobileSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Sidebar />
      <MobileSidebar open={mobileOpen} onOpenChange={setMobileOpen} />
      <div className="md:pl-64">
        <DashboardHeader onMobileMenuToggle={() => setMobileOpen(true)} />
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
