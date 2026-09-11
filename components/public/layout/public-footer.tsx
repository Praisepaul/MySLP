import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <Link href="/" className="text-sm font-semibold tracking-tight">
            Ephatha
          </Link>

          <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            Speech and language support designed around thoughtful, personalised
            care.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Explore</h2>

          <nav className="mt-4" aria-label="Footer navigation">
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="#about" className="hover:text-foreground">
                  About
                </Link>
              </li>
              <li>
                <Link href="#services" className="hover:text-foreground">
                  Services
                </Link>
              </li>
              <li>
                <Link href="#faq" className="hover:text-foreground">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Legal & privacy</h2>

          <nav className="mt-4" aria-label="Legal navigation">
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy-policy" className="hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="hover:text-foreground">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/data-deletion" className="hover:text-foreground">
                  Data Deletion
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="border-t">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} Ephatha.</p>
          <p>Professional speech and language services.</p>
        </div>
      </div>
    </footer>
  );
}
