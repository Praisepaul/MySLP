export const metadata = {
  title: "Cookie Policy | Ephatha",
  description: "How Ephatha uses cookies and similar technologies.",
};

const privacyEmail = "gracepaulaslp@gmail.com";

export default function CookiePolicyPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <article className="prose prose-neutral max-w-none dark:prose-invert prose-headings:scroll-mt-24 prose-a:font-medium">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Legal &amp; Privacy
        </p>
        <h1>Cookie Policy</h1>
        <p className="lead">
          <strong>Effective Date:</strong> September 11, 2026
          <br />
          <strong>Last Updated:</strong> September 11, 2026
        </p>

        <p>
          This Cookie Policy explains how <strong>Ephatha</strong> uses cookies and
          similar browser-storage technologies. Ephatha uses a limited set of
          technologies primarily for security, authentication, and essential
          functionality.
        </p>
        <p>
          <strong>Ephatha does not use advertising cookies or third-party behavioral
          tracking as part of the core Service.</strong>
        </p>

        <h2>1. What Are Cookies?</h2>
        <p>
          Cookies are small pieces of information stored by a website in your
          browser. They can be used to maintain a secure session, remember a
          necessary setting, or support a particular website function.
        </p>

        <h2>2. Essential Cookies</h2>
        <p>
          Essential cookies are necessary for security and core functionality. They
          may include:
        </p>
        <ul>
          <li>
            <strong>Administrator session cookies</strong> used to maintain secure
            authenticated administration sessions;
          </li>
          <li>
            <strong>Google OAuth state cookies</strong> used for short-lived OAuth
            security and request validation; and
          </li>
          <li>
            <strong>Passkey/WebAuthn challenge cookies</strong> used for short-lived
            authentication challenges and replay protection.
          </li>
        </ul>
        <p>
          These technologies support security controls such as authentication,
          authorization, cross-site request protection, and prevention of replay or
          unauthorized access.
        </p>

        <h3>2.1 Security Attributes</h3>
        <p>
          Authentication-related cookies are configured with security attributes
          such as <strong>Secure</strong>, <strong>HttpOnly</strong>,
          <strong> SameSite</strong>, and host-only restrictions where appropriate.
          Some cookies are short-lived and expire automatically after the relevant
          operation or session.
        </p>

        <h2>3. No Advertising or Behavioral Tracking Cookies</h2>
        <p>
          Ephatha does not intentionally use cookies for:
        </p>
        <ul>
          <li>targeted advertising;</li>
          <li>cross-site behavioral profiling;</li>
          <li>advertising measurement; or</li>
          <li>selling or sharing browsing behavior for marketing purposes.</li>
        </ul>
        <p>
          If this changes in the future, this policy will be updated and any consent
          required by applicable law will be requested before non-essential cookies
          are used.
        </p>

        <h2>4. Third-Party Services</h2>
        <p>
          Third-party services used by Ephatha, such as Google services, may use
          their own cookies or similar technologies when you interact directly with
          those services. Those technologies are governed by the applicable third
          party's own policies and settings rather than this Cookie Policy.
        </p>

        <h2>5. Managing Cookies</h2>
        <p>
          Most modern browsers allow you to view, block, or delete cookies through
          their privacy settings. You can consult your browser's documentation for
          instructions.
        </p>
        <p>
          <strong>Blocking essential cookies may prevent login,
          appointment-management, or other security-sensitive functions from working
          correctly.</strong>
        </p>

        <h2>6. Relationship to the Privacy Policy</h2>
        <p>
          This Cookie Policy should be read together with the Ephatha
          <strong> Privacy Policy</strong>, which explains how personal information is
          collected, used, stored, shared, retained, and deleted.
        </p>

        <h2>7. Changes to This Cookie Policy</h2>
        <p>
          We may update this Cookie Policy when the Service, technology, or
          applicable legal requirements change. The updated version will be
          published on this page with a revised effective date.
        </p>

        <h2>8. Contact</h2>
        <p>
          Questions about cookies, browser technologies, or privacy should be sent
          to:
        </p>
        <p>
          <strong>Grace Valookkaran Paul (Grace V Paul)</strong>
          <br />
          <strong>RCI CRR No. A92329</strong>
          <br />
          <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a>
        </p>
      </article>
    </main>
  );
}
