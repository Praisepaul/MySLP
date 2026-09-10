import Link from "next/link";
import { adminNavigation } from "@/lib/config/admin-navigation";

export function AdminSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r bg-background lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <Link
          href="/admin"
          className="flex items-center gap-3"
          aria-label="Grace Sessions admin dashboard"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
            G
          </span>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">
              Grace Sessions
            </p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
        </Link>
      </div>

      <nav
        aria-label="Admin navigation"
        className="flex-1 overflow-y-auto px-3 py-5"
      >
        <div className="space-y-6">
          {adminNavigation.map((section) => (
            <div key={section.label}>
              <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {section.label}
              </p>

              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <Icon aria-hidden="true" className="size-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      <div className="border-t p-4">
        <p className="px-2 text-xs leading-5 text-muted-foreground">
          Manage your practice, appointments, availability and public profile.
        </p>
      </div>
    </aside>
  );
}
