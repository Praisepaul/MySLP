"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const navigationItems = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "How it works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menuRef.current?.querySelector<HTMLElement>("a, button")?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function closeNavigation() {
    setOpen(false);
  }

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        aria-label={open ? "Close navigation" : "Open navigation"}
        className="inline-flex size-11 items-center justify-center rounded-lg border bg-background text-foreground transition-colors hover:bg-muted focus-visible:bg-muted"
      >
        <span aria-hidden="true" className="text-lg leading-none">
          {open ? "×" : "☰"}
        </span>
      </button>
      {open && (
        <div
          ref={menuRef}
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className="absolute inset-x-0 top-full border-b bg-background px-6 py-5 shadow-sm"
        >
          <nav aria-label="Mobile navigation links">
            <ul className="flex flex-col gap-1">
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeNavigation}
                    className="flex min-h-11 items-center rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:bg-muted focus-visible:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="mt-2 border-t pt-3">
                <Link
                  href="/book"
                  onClick={closeNavigation}
                  className="flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:opacity-90"
                >
                  Book a session
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
