import Link from "next/link";
import { LanguageSelector } from "./language-selector";
import { MobileNav } from "./mobile-nav";
import { PublicNav } from "./public-nav";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2" aria-label="Grace Session Scheduler home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">G</span>
          <span className="text-sm font-semibold tracking-tight sm:text-base">Grace Sessions</span>
        </Link>
        <div className="flex items-center gap-4">
          <PublicNav />
          <div className="hidden md:block"><LanguageSelector /></div>
          <Link href="/book" className="hidden rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:inline-flex">Book a session</Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
