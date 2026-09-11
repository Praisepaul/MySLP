export const metadata = {
  title: "Cookie Policy | Ephatha",
  description: "How Ephatha uses cookies and similar technologies.",
};

const privacyEmail = "gracepaulaslp@gmail.com";

export default function CookiePolicyPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <article className="prose prose-neutral max-w-none dark:prose-invert">
        <p className="text-sm font-medium text-muted-foreground">Legal</p>
        <h1>Cookie Policy</h1>
        <p className="lead">Effective date: September 11, 2026</p>
        <p>
          Ephatha uses a limited set of cookies and similar browser storage mechanisms to operate the website securely. We do not use advertising cookies or third-party behavioral tracking as part of the core Service.
        </p>

        <h2>1. Essential cookies</h2>
        <p>
          Essential cookies are necessary for security and functionality. They may include authenticated administration sessions, short-lived Google OAuth state, and short-lived passkey/WebAuthn challenges. These cookies help protect administrative access and prevent replay or cross-site attacks.
        </p>
        <p>
          Essential authentication cookies are configured with security attributes such as Secure, HttpOnly, SameSite, and host-only restrictions where appropriate. Some are short-lived and expire automatically after the relevant operation or session.
        </p>

        <h2>2. No advertising or analytics cookies</h2>
        <p>
          Ephatha does not intentionally use cookies for targeted advertising, cross-site behavioral profiling, or advertising measurement. If this changes in the future, this policy will be updated and any consent required by applicable law will be requested before non-essential cookies are used.
        </p>

        <h2>3. Third-party services</h2>
        <p>
          Third-party services used by Ephatha, such as Google services, may use their own cookies or technologies when you interact directly with those services. Those technologies are governed by the third party's own policies and settings rather than this Cookie Policy.
        </p>

        <h2>4. Managing cookies</h2>
        <p>
          Most browsers allow you to view, block, or delete cookies through their privacy settings. Blocking essential cookies may prevent login, booking-management, or other security-sensitive functions from working correctly.
        </p>

        <h2>5. Changes</h2>
        <p>
          We may update this Cookie Policy when the Service or applicable legal requirements change. The updated version will be published on this page with a revised effective date.
        </p>

        <h2>6. Contact</h2>
        <p>
          Questions about cookies or privacy should be sent to <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a>.
        </p>
      </article>
    </main>
  );
}
