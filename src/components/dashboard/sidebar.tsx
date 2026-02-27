"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  DoorOpen,
  Users,
  FileText,
  Wrench,
  DollarSign,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Properties", icon: Building2, path: "/properties" },
  { label: "Units", icon: DoorOpen, path: "/units" },
  { label: "Tenants", icon: Users, path: "/tenants" },
  { label: "Leases", icon: FileText, path: "/leases" },
  { label: "Maintenance", icon: Wrench, path: "/maintenance" },
  { label: "Financials", icon: DollarSign, path: "/financials" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-3">
      {navItems.map((item) => {
        const isActive =
          item.path === "/"
            ? pathname === "/"
            : pathname.startsWith(item.path);

        return (
          <Link
            key={item.path}
            href={item.path}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <item.icon className="size-5 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarLogo() {
  return (
    <div className="flex items-center gap-2 px-6 py-5">
      <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">
        P
      </div>
      <span className="text-lg font-bold text-white">PropForge</span>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30">
      <div className="flex grow flex-col gap-4 overflow-y-auto bg-slate-900">
        <SidebarLogo />
        <SidebarNav />
      </div>
    </aside>
  );
}

export function MobileSidebar({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-64 bg-slate-900 p-0" showCloseButton={false}>
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <SidebarLogo />
        <SidebarNav />
      </SheetContent>
    </Sheet>
  );
}
