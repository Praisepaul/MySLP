export const metadata = {
  title: "Privacy Policy | Ephatha",
  description:
    "How Ephatha collects, uses, stores, protects, and shares personal information.",
};

const privacyEmail = "gracepaulaslp@gmail.com";

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <article className="prose prose-neutral max-w-none dark:prose-invert prose-headings:scroll-mt-24 prose-a:font-medium">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Legal &amp; Privacy
        </p>
        <h1>Privacy Policy</h1>
        <p className="lead">
          <strong>Effective Date:</strong> September 11, 2026
          <br />
          <strong>Last Updated:</strong> September 11, 2026
        </p>

        <p>
          This Privacy Policy explains how <strong>Ephatha</strong> collects, uses,
          stores, protects, and discloses personal information when you use the
          Ephatha website, online booking service, appointment-management features,
          and related services (collectively, the <strong>“Service”</strong>).
        </p>
        <p>
          Ephatha is operated by <strong>Grace Valookkaran Paul</strong>, also known
          as <strong>Grace V Paul</strong>, an authorized and registered
          rehabilitation professional in India. Grace V Paul is registered with the
          <strong> Rehabilitation Council of India (RCI)</strong> as an
          <strong> Audiologist and Speech-Language Pathologist</strong> under
          <strong> Central Rehabilitation Register (CRR) No. A92329</strong>.
          Her RCI registration was issued on September 13, 2023 and is valid until
          February 22, 2030, subject to applicable RCI requirements.
        </p>
        <p>
          This policy is intended to provide clear privacy information for clients
          in India and for international clients, including individuals who may be
          protected by the GDPR, UK GDPR, Canadian privacy laws, Australian privacy
          laws, United States state privacy laws, or other applicable privacy
          legislation. The rights and obligations that apply to you depend on your
          location and the law applicable to the processing.
        </p>

        <h2>1. Data Controller and Privacy Contact</h2>
        <p>
          <strong>Data Controller / Operator:</strong> Grace Valookkaran Paul
          (Grace V Paul)
          <br />
          <strong>Professional Registration:</strong> RCI Central Rehabilitation
          Register (CRR) No. A92329
          <br />
          <strong>Professional Category:</strong> Audiologist and Speech-Language
          Pathologist
          <br />
          <strong>Privacy Contact:</strong>{" "}
          <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a>
        </p>
        <p>
          The privacy contact above may be used for privacy questions, data-rights
          requests, deletion requests, or concerns about the handling of personal
          information.
        </p>

        <h2>2. Professional Qualifications and Regulatory Status</h2>
        <p>
          Grace Valookkaran Paul (Grace V Paul) has completed a
          <strong> Bachelor in Audiology and Speech-Language Pathology (BASLP)</strong>{" "}
          in 2022 and an <strong>M.Sc. in Speech-Language Pathology</strong> in
          2024 from recognized universities in India. Her additional qualification
          was recorded by the RCI on February 24, 2025.
        </p>
        <p>
          The RCI registration identifies her category as
          <strong> Audiologist and Speech-Language Pathologist</strong>. Services
          provided through Ephatha are subject to applicable professional,
          regulatory, ethical, privacy, telehealth, and scope-of-practice
          requirements.
        </p>

        <h2>3. Information We Collect</h2>

        <h3>3.1 Information You Provide When Booking</h3>
        <p>Depending on the appointment flow, we may collect:</p>
        <ul>
          <li><strong>Name;</strong></li>
          <li><strong>Email address;</strong></li>
          <li><strong>Telephone number,</strong> where requested or provided;</li>
          <li><strong>Appointment service, date, time, and timezone;</strong></li>
          <li><strong>Appointment status and scheduling information;</strong> and</li>
          <li>
            <strong>Other information you voluntarily provide</strong> during a
            booking or contact interaction.
          </li>
        </ul>
        <p>
          Please do not include detailed medical histories, diagnoses, treatment
          records, passwords, payment-card information, or other highly sensitive
          information in free-text booking fields unless Ephatha specifically asks
          for it through an appropriate channel. The booking system is not designed
          to maintain clinical notes.
        </p>

        <h3>3.2 Appointment and Scheduling Information</h3>
        <p>
          We create and maintain appointment records needed to provide the
          requested service, prevent double-booking, permit authorized
          rescheduling or cancellation, and provide appointment-management links.
          Appointment-management links may contain a private confirmation token.
          Treat such links as confidential because possession of a valid token may
          provide access to the associated appointment-management information.
        </p>

        <h3>3.3 Technical and Security Information</h3>
        <p>
          The Service may process ordinary technical information necessary to
          operate and secure the website, such as request metadata, browser or
          device information, and security-related events. Security controls are
          designed to minimize unnecessary collection. For example, failed
          administrator-login rate limiting does not retain raw IP addresses.
        </p>

        <h3>3.4 Cookies and Similar Technologies</h3>
        <p>
          Ephatha uses essential cookies required for security and authenticated
          administration, including secure session, OAuth-state, and passkey or
          WebAuthn challenge cookies. These are not used for behavioral advertising.
          Please see the <strong>Cookie Policy</strong> for further information.
        </p>

        <h2>4. How We Use Personal Information</h2>
        <p>We use information only for purposes connected with operating Ephatha, including to:</p>
        <ul>
          <li>provide and administer requested appointments;</li>
          <li>show available appointment times and prevent conflicting bookings;</li>
          <li>process appointment creation, rescheduling, and cancellation;</li>
          <li>provide appointment-management and calendar information;</li>
          <li>operate Google Calendar and Google Meet integration where enabled;</li>
          <li>secure administrative access and prevent abuse or unauthorized access;</li>
          <li>respond to questions, requests, and support communications;</li>
          <li>maintain, troubleshoot, and improve Service reliability and security; and</li>
          <li>comply with applicable legal obligations and protect legal rights.</li>
        </ul>
        <p>
          <strong>We do not sell personal information.</strong> We do not use
          personal information for targeted advertising, behavioral advertising,
          credit decisions, or data-broker activities.
        </p>

        <h2>5. Legal Bases Where GDPR or Similar Law Applies</h2>
        <p>
          Where applicable, we rely on one or more lawful bases for processing,
          including:
        </p>
        <ul>
          <li>
            <strong>Performance of a contract</strong> or steps requested before
            entering into a contract;
          </li>
          <li>
            <strong>Legitimate interests</strong> in operating, securing, and
            improving the Service, where those interests are not overridden by
            applicable rights;
          </li>
          <li>
            <strong>Legal obligations</strong> imposed on the operator; and
          </li>
          <li>
            <strong>Consent</strong> where consent is specifically required.
          </li>
        </ul>
        <p>
          Where processing is based on consent, you may withdraw that consent as
          permitted by law. Withdrawal does not affect processing that occurred
          before withdrawal.
        </p>

        <h2>6. Google Calendar and Google User Data</h2>
        <p>
          Ephatha includes an optional Google Calendar integration used by the
          therapist/administrator to coordinate appointments. The integration
          currently requests Google Calendar permissions corresponding to
          <strong> calendar.freebusy</strong> and <strong>calendar.events</strong>.
          These permissions are requested only to provide the scheduling and
          calendar functionality described in this policy.
        </p>

        <h3>6.1 Google Data We May Access</h3>
        <p>When the therapist connects Google Calendar, Ephatha may access:</p>
        <ul>
          <li>
            <strong>Calendar availability/free-busy information</strong> used to
            identify scheduling conflicts;
          </li>
          <li>
            <strong>Calendar event information</strong> needed to create, update,
            or remove Ephatha appointment events;
          </li>
          <li>
            <strong>Connected account and calendar identifiers</strong> needed to
            operate the integration; and
          </li>
          <li>
            <strong>Google-issued OAuth credentials</strong> necessary to maintain
            the authorized connection.
          </li>
        </ul>

        <h3>6.2 How Google User Data Is Used</h3>
        <p>
          Google Calendar data is used only to provide calendar integration,
          appointment synchronization, conflict checking, and related
          user-requested scheduling functionality.
        </p>
        <p>
          <strong>We do not sell Google user data.</strong> We do not use Google
          user data for advertising, behavioral profiling, unrelated database
          creation, or generalized artificial-intelligence or machine-learning
          model training.
        </p>

        <h3>6.3 Google User Data Sharing</h3>
        <p>
          Google Calendar data is not disclosed to third parties for their own
          advertising or marketing purposes. It may be processed by infrastructure
          providers strictly as necessary to operate the Ephatha Service, subject
          to applicable contractual and security controls.
        </p>

        <h3>6.4 Google OAuth Credential Protection</h3>
        <p>
          OAuth refresh credentials are encrypted before storage. Calendar
          operations are performed server-side and are not exposed to public
          website visitors.
        </p>

        <h3>6.5 Disconnecting Google Calendar</h3>
        <p>
          If the therapist disconnects Google Calendar, Ephatha stops using the
          authorization for subsequent calendar operations and removes the stored
          connection credentials according to the application's data lifecycle.
          Google may independently retain or process information under Google's
          own policies.
        </p>

        <h2>7. Sharing and Service Providers</h2>
        <p>
          We may use trusted infrastructure and service providers to operate the
          Service. Depending on the feature being used, these may include:
        </p>
        <ul>
          <li>
            <strong>Vercel</strong> — application hosting and deployment
            infrastructure;
          </li>
          <li>
            <strong>MongoDB Atlas</strong> — database and application data storage;
            and
          </li>
          <li>
            <strong>Google</strong> — Google Calendar and Google Meet functionality.
          </li>
        </ul>
        <p>
          Providers receive only information reasonably necessary for the services
          they provide and are subject to their own contractual, security, and
          privacy obligations.
        </p>
        <p>
          We may disclose information where reasonably necessary to comply with
          law, respond to lawful requests, prevent fraud or abuse, protect the
          security of the Service, protect the rights and safety of clients or
          others, or establish or defend legal claims. We do not otherwise disclose
          client information to third parties for their own marketing purposes.
        </p>

        <h2>8. International Data Transfers</h2>
        <p>
          Ephatha and its service providers may process or store information in
          countries other than the country where you live. Where applicable law
          requires safeguards for international transfers, we intend to use legally
          recognized transfer mechanisms or other lawful safeguards.
        </p>
        <p>
          Because provider infrastructure and applicable law can change, precise
          storage or processing locations may vary by provider and configuration.
        </p>

        <h2>9. Data Retention</h2>
        <p>
          We retain personal information only for as long as reasonably necessary
          for the purposes described in this policy, including providing services,
          maintaining appointment history, resolving disputes, preventing abuse,
          maintaining security, and meeting legal, accounting, or professional
          obligations. Different categories of information may therefore have
          different retention periods.
        </p>
        <p>
          When information is no longer required, we will delete, securely destroy,
          or anonymize it where reasonably practicable, subject to legal or
          legitimate retention requirements. Protected technical backups may persist
          for a limited period after operational deletion before being overwritten
          or securely removed.
        </p>

        <h2>10. Your Privacy Rights</h2>
        <p>
          Depending on where you live, you may have rights including:
        </p>
        <ul>
          <li><strong>Access</strong> to your personal information;</li>
          <li><strong>Correction</strong> of inaccurate information;</li>
          <li><strong>Deletion</strong> of personal information, subject to lawful exceptions;</li>
          <li><strong>Restriction</strong> of certain processing;</li>
          <li><strong>Objection</strong> to certain processing;</li>
          <li><strong>Data portability</strong> where applicable; and</li>
          <li>
            <strong>Withdrawal of consent</strong> where processing is based on consent.
          </li>
        </ul>
        <p>
          You may also have the right to complain to your local data-protection
          authority or other privacy regulator.
        </p>
        <p>
          To make a request, email <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a>{" "}
          and identify the information or appointment concerned. We may need to
          verify the requester's identity or authority before disclosing or deleting
          information. We will respond within the period required by applicable law.
        </p>

        <h2>11. Children and Minors</h2>
        <p>
          Ephatha's services may be provided to minors. Online booking should be
          completed by a parent, legal guardian, or other authorized adult where
          required by applicable law. We do not intentionally request unnecessary
          personal information directly from children.
        </p>
        <p>
          If you believe a child has provided information inappropriately, please
          contact us so that we can review and, where appropriate, delete it.
        </p>

        <h2>12. Security</h2>
        <p>
          We use technical and organizational measures appropriate to the nature of
          the information and the Service. These include encrypted connections,
          secure authentication controls, protected session cookies, server-side
          authorization checks, encrypted storage of Google OAuth refresh
          credentials, database controls for booking concurrency, and security
          headers.
        </p>
        <p>
          <strong>No internet service can guarantee absolute security.</strong> Do
          not send information that the Service does not request.
        </p>

        <h2>13. Third-Party Links and Services</h2>
        <p>
          The Service may link to or interact with third-party services such as
          Google. Their privacy practices are governed by their own policies. We
          encourage you to review those policies before using third-party services.
        </p>

        <h2>14. Changes to This Privacy Policy</h2>
        <p>
          We may update this policy when our Service, data practices, legal
          obligations, or security controls change. The updated version will be
          published on this page with a revised effective date. If a change
          materially affects how we use personal information, we will provide
          additional notice where required by law.
        </p>

        <h2>15. Contact</h2>
        <p>
          For privacy questions, data-rights requests, or concerns about this policy,
          contact:
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
