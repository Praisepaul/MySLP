export const metadata = {
  title: "Data Deletion | Ephatha",
  description: "How to request deletion of personal information from Ephatha.",
};

export default function DataDeletionPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <article className="prose prose-neutral max-w-none dark:prose-invert">
        <p className="text-sm font-medium text-muted-foreground">Privacy</p>
        <h1>Data Deletion</h1>
        <p className="lead">Effective date: September 11, 2026</p>
        <p>
          You may request deletion of personal information held by Ephatha, subject to information that we are required or permitted to retain by law or that is reasonably necessary for legitimate legal, security, accounting, or dispute-resolution purposes.
        </p>

        <h2>How to request deletion</h2>
        <p>
          Use the Ephatha Contact page and state that you are making a data-deletion request. Tell us which appointment, contact interaction, or other information the request concerns. Do not send passwords, payment-card details, or unnecessary medical information with the request.
        </p>

        <h2>Verification</h2>
        <p>
          We may need to verify your identity or authority before deleting or disclosing personal information. This is intended to prevent another person from deleting or accessing someone else's information.
        </p>

        <h2>What deletion means</h2>
        <p>
          Where deletion is approved, we will delete, securely destroy, or anonymize the relevant information from active systems where reasonably practicable. Some information may remain for a limited period in protected backups or may need to be retained to satisfy legal obligations, resolve disputes, prevent fraud or abuse, or establish or defend legal claims. Such retained information will remain subject to appropriate protections and will not be used for unrelated purposes.
        </p>

        <h2>Google Calendar data</h2>
        <p>
          The therapist can disconnect Ephatha's Google Calendar integration. When the connection is removed, Ephatha stops using the authorization for subsequent calendar operations and removes the stored OAuth connection credentials according to the application's data lifecycle. Google may retain or process information separately under Google's own policies.
        </p>

        <h2>Response time</h2>
        <p>
          We will respond to a valid deletion request within the period required by applicable law. If we cannot fully comply, we will explain the relevant legal or operational reason where the law permits us to do so.
        </p>
      </article>
    </main>
  );
}
