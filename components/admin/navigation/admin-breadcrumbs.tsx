"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { adminNavigation } from "@/lib/config/admin-navigation";

const breadcrumbLabels = new Map<string, string>(
  adminNavigation.flatMap((section) =>
    section.items.map((item) => [item.href, item.label] as const),
  ),
);

export function AdminBreadcrumbs() {
  const pathname = usePathname();

  if (pathname === "/admin") {
    return (
      <div className="border-b px-4 py-3 sm:px-6">
        <p className="text-sm font-medium">Dashboard</p>
      </div>
    );
  }

  const label =
    breadcrumbLabels.get(pathname) ??
    pathname
      .split("/")
      .filter(Boolean)
      .at(-1)
      ?.replace(/-/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase()) ??
    "Admin";

  return (
    <div className="border-b px-4 py-3 sm:px-6">
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm">
          <li>
            <Link
              href="/admin"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
          </li>

          <li aria-hidden="true">
            <ChevronRight className="size-4 text-muted-foreground" />
          </li>

          <li>
            <span className="font-medium capitalize">{label}</span>
          </li>
        </ol>
      </nav>
    </div>
  );
}
