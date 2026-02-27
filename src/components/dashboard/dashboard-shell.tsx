"use client";

import { useState } from "react";
import { Sidebar, MobileSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";

export type DashboardUser = {
  name: string;
  email: string;
};

export type DashboardOrg = {
  name: string;
};

export function DashboardShell({
  children,
  user,
  org,
}: {
  children: React.ReactNode;
  user: DashboardUser;
  org: DashboardOrg;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Sidebar organizationName={org.name} />
      <MobileSidebar
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        organizationName={org.name}
      />
      <div className="md:pl-64">
        <DashboardHeader
          onMobileMenuToggle={() => setMobileOpen(true)}
          user={user}
        />
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
