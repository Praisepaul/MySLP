"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminNavigation } from "@/lib/config/admin-navigation";

interface AdminMobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function AdminMobileNav({ open, onClose }: AdminMobileNavProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close admin navigation"
        onClick={onClose}
      />

      <aside
        className="relative flex h-full w-[min(20rem,85vw)] flex-col border-r bg-background shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label="Admin navigation"
      >
        <div className="flex h-16 items-center justify-between border-b px-5">
          <Link
            href="/admin"
            onClick={onClose}
            className="flex items-center gap-3"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
              E
            </span>

            <div>
              <p className="text-sm font-semibold tracking-tight">
                Ephatha
              </p>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
          </Link>

          <Button
            ref={closeButtonRef}
            type="button"
            variant="ghost"
            size="icon"
            className="size-11"
            onClick={onClose}
            aria-label="Close admin navigation"
          >
            <X aria-hidden="true" className="size-5" />
          </Button>
        </div>

        <nav
          aria-label="Mobile admin navigation"
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
                          onClick={onClose}
                          className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:bg-muted focus-visible:text-foreground"
                        >
                          <Icon
                            aria-hidden="true"
                            className="size-4 shrink-0"
                          />
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
      </aside>
    </div>
  );
}
