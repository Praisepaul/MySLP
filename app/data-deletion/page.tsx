export const metadata = {
  title: "Data Deletion | Ephatha",
  description: "How to request deletion of personal information from Ephatha.",
};

const privacyEmail = "gracepaulaslp@gmail.com";

export default function DataDeletionPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <article className="prose prose-neutral max-w-none dark:prose-invert prose-headings:scroll-mt-24 prose-a:font-medium">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Privacy &amp; Data Rights
        </p>
        <h1>Data Deletion Policy</h1>
        <p className="lead">
          <strong>Effective Date:</strong> September 11, 2026
          <br />
          <strong>Last Updated:</strong> September 11, 2026
        </p>

        <p>
          This page explains how you may request deletion of personal information
          held by <strong>Ephatha</strong>. Deletion requests are handled by
          <strong> Grace Valookkaran Paul (Grace V Paul)</strong>, RCI Central
          Rehabilitation Register (CRR) No. <strong>A92329</strong>.
        </p>
        <p>
          You may request deletion subject to information that we are required or
          permitted to retain by law or that is reasonably necessary for legitimate
          legal, security, accounting, professional, or dispute-resolution purposes.
        </p>

        <h2>1. How to Submit a Deletion Request</h2>
        <p>
          Send an email to <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a> with
          the subject line <strong>“Data deletion request”</strong>.
        </p>
        <p>Your request should identify:</p>
        <ul>
          <li>that you are making a personal-data deletion request;</li>
          <li>the appointment, contact interaction, or other information concerned; and</li>
          <li>any other information reasonably necessary to locate the relevant record.</li>
        </ul>
        <p>
          <strong>Do not send passwords, payment-card details, or unnecessary medical
          information with your request.</strong>
        </p>

        <h2>2. Identity and Authority Verification</h2>
        <p>
          We may need to verify your identity or authority before deleting or
          disclosing personal information. This protects against another person
          attempting to delete, access, or alter someone else&apos;s information.
        </p>
        <p>
          Verification will be limited to information reasonably necessary for the
          request. We will not ask you to provide unnecessary sensitive information.
        </p>

        <h2>3. What Deletion Means</h2>
        <p>
          Where deletion is approved, we will delete, securely destroy, or anonymize
          the relevant information from active systems where reasonably practicable.
        </p>
        <p>Some information may remain where it is necessary to:</p>
        <ul>
          <li>comply with a legal or professional obligation;</li>
          <li>resolve an ongoing dispute or complaint;</li>
          <li>prevent fraud, abuse, or security incidents;</li>
          <li>establish, exercise, or defend legal claims; or</li>
          <li>maintain records that applicable law requires us to retain.</li>
        </ul>
        <p>
          Retained information remains subject to appropriate protections and will
          not be used for unrelated purposes. Protected technical backups may also
          persist for a limited period before being overwritten or securely removed.
        </p>

        <h2>4. Appointment and Booking Information</h2>
        <p>
          If your deletion request concerns an appointment, we may need to retain a
          limited record where required for professional, legal, accounting,
          regulatory, dispute-resolution, or security purposes. Where no such
          retention requirement applies, the relevant information will be deleted,
          securely destroyed, or anonymized where reasonably practicable.
        </p>

        <h2>5. Google Calendar Data</h2>
        <p>
          Ephatha provides an optional Google Calendar integration for the therapist.
          If the Google Calendar connection is disconnected, Ephatha stops using the
          authorization for subsequent calendar operations and removes stored OAuth
          connection credentials according to the application&apos;s data lifecycle.
        </p>
        <p>
          Google may independently retain or process information under Google&apos;s own
          terms, privacy policies, and data-retention practices. Ephatha cannot
          delete information that is independently controlled by Google; requests
          concerning Google&apos;s own systems may need to be made directly to Google.
        </p>

        <h2>6. Google User Data and Deletion Boundaries</h2>
        <p>
          Ephatha does not sell Google user data or use Google user data for
          advertising, unrelated database creation, or generalized AI or
          machine-learning model training. Google Calendar data is used only for the
          calendar integration, appointment synchronization, conflict checking, and
          related user-requested scheduling functionality.
        </p>
        <p>
          OAuth refresh credentials used by Ephatha are encrypted before storage.
        </p>

        <h2>7. Processing Time</h2>
        <p>
          We will respond to a valid deletion request within the period required by
          applicable law. Where additional information or verification is reasonably
          required, we may need additional time to complete the request.
        </p>
        <p>
          If we cannot fully comply with a deletion request, we will explain the
          relevant legal or operational reason where the law permits us to do so.
        </p>

        <h2>8. Other Privacy Rights</h2>
        <p>
          Depending on your location, you may also have rights to access, correct,
          restrict, object to, or receive a copy of personal information, and to
          withdraw consent where applicable. See the <strong>Privacy Policy</strong>
          for further information.
        </p>

        <h2>9. Contact</h2>
        <p>
          Data deletion and privacy requests should be sent to:
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
