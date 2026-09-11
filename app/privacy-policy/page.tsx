export const metadata = {
  title: "Privacy Policy | Ephatha",
  description: "How Ephatha collects, uses, stores, protects, and shares personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <article className="prose prose-neutral max-w-none dark:prose-invert">
        <p className="text-sm font-medium text-muted-foreground">Legal</p>
        <h1>Privacy Policy</h1>
        <p className="lead">Effective date: September 11, 2026</p>
        <p>
          Ephatha ("Ephatha", "we", "us", or "our") respects your privacy and is committed to handling personal information responsibly. This Privacy Policy explains how information is collected, used, stored, protected, and disclosed when you use the Ephatha website, online booking service, appointment-management features, and related services (collectively, the "Service").
        </p>
        <p>
          This policy is written for clients and visitors internationally, including people who may be protected by privacy laws such as the EU General Data Protection Regulation (GDPR) or the UK GDPR. The rights and obligations that apply to you depend on your location and the law that applies to the processing.
        </p>

        <h2>1. Who is responsible for your information</h2>
        <p>
          Ephatha is the operator responsible for the Service and for the personal information described in this policy. For privacy questions, requests, or concerns, please use the Contact page provided on the website. If you are an EU/EEA or UK individual, this is also the contact route for exercising applicable data-protection rights.
        </p>

        <h2>2. Information we collect</h2>
        <h3>Information you provide when booking</h3>
        <p>Depending on the appointment flow, we may collect:</p>
        <ul>
          <li>your name;</li>
          <li>your email address;</li>
          <li>your telephone number, where requested or provided;</li>
          <li>appointment service, date, time, and timezone;</li>
          <li>appointment status and scheduling information; and</li>
          <li>information you voluntarily provide in a booking or contact interaction.</li>
        </ul>
        <p>
          Please do not include detailed medical histories, diagnoses, treatment records, passwords, payment-card information, or other highly sensitive information in free-text booking fields unless Ephatha specifically asks for it through an appropriate channel. The booking system is not designed to maintain clinical notes.
        </p>

        <h3>Appointment and scheduling information</h3>
        <p>
          We create and maintain appointment records needed to provide the requested service, prevent double-booking, allow permitted rescheduling or cancellation, and provide appointment-management links. Appointment links may contain a private confirmation token. Treat such links as confidential because possession of a valid token may provide access to the associated appointment-management information.
        </p>

        <h3>Information collected automatically</h3>
        <p>
          The Service may process ordinary technical information necessary to operate and secure the website, such as request metadata, browser or device information, and security-related events. Security controls are designed to minimize unnecessary collection; for example, failed admin-login rate limiting does not retain raw IP addresses.
        </p>

        <h3>Cookies and similar technologies</h3>
        <p>
          Ephatha uses essential cookies required for security and authenticated administration, including secure session, OAuth-state, and passkey-challenge cookies. These are not used for behavioral advertising. See the Cookie Policy for more detail.
        </p>

        <h2>3. How we use personal information</h2>
        <p>We use information only for purposes connected with operating Ephatha, including to:</p>
        <ul>
          <li>provide and administer requested appointments;</li>
          <li>show available appointment times and prevent conflicting bookings;</li>
          <li>process appointment creation, rescheduling, and cancellation;</li>
          <li>provide appointment-management and calendar information;</li>
          <li>operate Google Calendar and Google Meet integration where enabled by the therapist;</li>
          <li>secure administrative access and prevent abuse or unauthorized access;</li>
          <li>respond to questions, requests, and support communications;</li>
          <li>maintain, troubleshoot, and improve the reliability and security of the Service; and</li>
          <li>comply with applicable legal obligations and protect our legal rights.</li>
        </ul>
        <p>
          We do not sell personal information. We do not use personal information for targeted advertising, behavioral advertising, credit decisions, or data-broker activities.
        </p>

        <h2>4. Legal bases where GDPR or similar law applies</h2>
        <p>
          Where applicable, we rely on one or more lawful bases for processing: performance of a contract or steps requested before entering into a contract; legitimate interests in operating, securing, and improving the Service; compliance with legal obligations; and consent where consent is specifically required. Where processing is based on consent, you may withdraw that consent as permitted by law, without affecting processing that occurred before withdrawal.
        </p>

        <h2>5. Google Calendar and Google user data</h2>
        <p>
          Ephatha includes an optional Google Calendar integration used by the therapist/administrator to coordinate appointments. The integration requests Google Calendar permissions for free/busy information and calendar event management. These permissions are requested only to provide the scheduling and calendar functionality described here.
        </p>
        <p>When the therapist connects Google Calendar, Ephatha may access:</p>
        <ul>
          <li>calendar availability/free-busy information used to identify scheduling conflicts;</li>
          <li>calendar event information needed to create, update, or remove Ephatha appointment events;</li>
          <li>information needed to identify the connected calendar account or calendar; and</li>
          <li>Google-issued OAuth credentials necessary to maintain the authorized connection.</li>
        </ul>
        <p>
          Google Calendar data is used only to provide the calendar integration, appointment synchronization, conflict checking, and related user-requested functionality. We do not sell Google user data, use it for advertising, or use it to build advertising profiles. We do not use Google user data for unrelated database creation or for training generalized AI or machine-learning models.
        </p>
        <p>
          OAuth refresh credentials are encrypted before storage. Calendar operations are performed server-side and are not exposed to public website visitors. If the therapist disconnects Google Calendar, Ephatha stops using the authorization for subsequent calendar operations and removes the stored connection credentials according to the application's data lifecycle.
        </p>
        <p>
          Google may independently process information under Google's own terms and privacy policies. Ephatha does not control Google's processing once information is handled by Google services.
        </p>

        <h2>6. Service providers and sharing</h2>
        <p>
          We may use trusted infrastructure and service providers to operate the Service. Depending on the feature being used, these may include Vercel for application hosting, MongoDB Atlas for database storage, and Google for Calendar and Google Meet functionality. Providers receive only the information reasonably necessary for the service they provide and are subject to their own contractual, security, and privacy obligations.
        </p>
        <p>
          We may disclose information where reasonably necessary to comply with law, respond to lawful requests, prevent fraud or abuse, protect the security of the Service, protect the rights and safety of clients or others, or establish or defend legal claims. We do not otherwise disclose client information to third parties for their own marketing purposes.
        </p>

        <h2>7. International data transfers</h2>
        <p>
          Ephatha and its service providers may process or store information in countries other than the country where you live. Where applicable law requires safeguards for international transfers, we intend to use legally recognized transfer mechanisms or other lawful safeguards. Because provider infrastructure and applicable law can change, the precise storage or processing location may vary by provider and configuration.
        </p>

        <h2>8. Data retention</h2>
        <p>
          We retain personal information only for as long as reasonably necessary for the purposes described in this policy, including providing services, maintaining appointment history, resolving disputes, preventing abuse, maintaining security, and meeting legal, accounting, or professional obligations. Different categories of information may therefore have different retention periods.
        </p>
        <p>
          When information is no longer required, we will delete it, securely destroy it, or anonymize it where reasonably practicable, subject to legal or legitimate retention requirements. Some technical backups may persist for a limited period after operational deletion before being overwritten or securely removed.
        </p>

        <h2>9. Your privacy rights</h2>
        <p>
          Depending on where you live, you may have rights including access to your personal information, correction of inaccurate information, deletion, restriction of processing, objection to certain processing, data portability, and withdrawal of consent. You may also have the right to complain to your local data-protection authority.
        </p>
        <p>
          To make a request, use the Contact page and identify the information or appointment concerned. We may need to verify the requester's identity or authority before disclosing or deleting information. We will respond within the period required by applicable law.
        </p>

        <h2>10. Children and minors</h2>
        <p>
          Ephatha's services may be provided to minors, but online booking should be completed by a parent, legal guardian, or other authorized adult where required. We do not intentionally request unnecessary personal information directly from children. If you believe a child has provided information inappropriately, please contact us so that we can review and, where appropriate, delete it.
        </p>

        <h2>11. Security</h2>
        <p>
          We use technical and organizational measures appropriate to the nature of the information and the Service. These include encrypted connections, secure authentication controls, protected session cookies, server-side authorization checks, encrypted storage of Google OAuth refresh credentials, database controls for booking concurrency, and security headers. No internet service can guarantee absolute security, so please do not send information that the Service does not request.
        </p>

        <h2>12. Third-party links and services</h2>
        <p>
          The Service may link to or interact with third-party services such as Google. Their privacy practices are governed by their own policies. We encourage you to review those policies before using third-party services.
        </p>

        <h2>13. Changes to this Privacy Policy</h2>
        <p>
          We may update this policy when our Service, data practices, legal obligations, or security controls change. The updated version will be published on this page with a revised effective date. If a change materially affects how we use personal information, we will provide additional notice where required by law.
        </p>

        <h2>14. Contact</h2>
        <p>
          For privacy questions, data-rights requests, or concerns about this policy, please use the Ephatha Contact page. Please do not send passwords, payment-card details, or unnecessary medical information through a general contact form.
        </p>
      </article>
    </main>
  );
}
