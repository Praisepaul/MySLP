"use client";

import { useState } from "react";
import { AdminBreadcrumbs } from "@/components/admin/navigation/admin-breadcrumbs";
import { AdminMobileNav } from "@/components/admin/navigation/admin-mobile-nav";
import { AdminSidebar } from "@/components/admin/navigation/admin-sidebar";
import { AdminTopbar } from "@/components/admin/navigation/admin-topbar";

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-muted/20">
      <AdminSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar onMenuClick={() => setMobileNavOpen(true)} />

        <AdminBreadcrumbs />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      <AdminMobileNav
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
    </div>
  );
}
