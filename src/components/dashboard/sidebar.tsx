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
  HardHat,
  ClipboardList,
  Upload,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface NavItem {
  label: string;
  icon: LucideIcon;
  path: string;
  children?: { label: string; icon: LucideIcon; path: string }[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Properties", icon: Building2, path: "/properties" },
  { label: "Units", icon: DoorOpen, path: "/units" },
  { label: "Tenants", icon: Users, path: "/tenants" },
  { label: "Leases", icon: FileText, path: "/leases" },
  {
    label: "Maintenance",
    icon: Wrench,
    path: "/maintenance",
    children: [
      { label: "Requests", icon: ClipboardList, path: "/maintenance" },
      { label: "Vendors", icon: HardHat, path: "/maintenance/vendors" },
    ],
  },
  { label: "Import", icon: Upload, path: "/upload" },
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
          <div key={item.path}>
            <Link
              href={item.children ? item.children[0].path : item.path}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-indigo-500" />
              )}
              <item.icon className="size-5 shrink-0" />
              {item.label}
            </Link>
            {item.children && isActive && (
              <div className="ml-4 mt-1 flex flex-col gap-1">
                {item.children.map((child) => {
                  const isChildActive =
                    child.path === "/maintenance"
                      ? pathname === "/maintenance" || pathname.match(/^\/maintenance\/[0-9a-f-]+/)
                      : pathname.startsWith(child.path);

                  return (
                    <Link
                      key={child.path}
                      href={child.path}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                        isChildActive
                          ? "text-white font-medium bg-white/5"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <child.icon className="size-4 shrink-0" />
                      {child.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

function SidebarLogo() {
  return (
    <div className="relative flex items-center gap-2.5 px-6 py-7">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-transparent to-transparent" />
      <div className="relative flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 font-bold text-white shadow-lg shadow-indigo-500/25">
        P
      </div>
      <span className="relative text-lg font-bold text-white">PropLens</span>
    </div>
  );
}

function SidebarOrgName({ name }: { name: string }) {
  return (
    <div className="mt-auto border-t border-white/10 px-6 py-4">
      <p className="truncate text-xs font-medium text-slate-400">
        Organization
      </p>
      <p className="truncate text-sm font-semibold text-white">{name}</p>
    </div>
  );
}

export function Sidebar({ organizationName }: { organizationName: string }) {
  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30">
      <div className="flex grow flex-col gap-4 overflow-y-auto bg-gradient-to-b from-slate-900 via-indigo-950/80 to-slate-950 border-r border-white/5">
        <SidebarLogo />
        <SidebarNav />
        <SidebarOrgName name={organizationName} />
      </div>
    </aside>
  );
}

export function MobileSidebar({
  open,
  onOpenChange,
  organizationName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationName: string;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-64 bg-gradient-to-b from-slate-900 via-indigo-950/80 to-slate-950 p-0 border-r border-white/5" showCloseButton={false}>
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <SidebarLogo />
        <SidebarNav />
        <SidebarOrgName name={organizationName} />
      </SheetContent>
    </Sheet>
  );
}
