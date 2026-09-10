import { AdminShell } from "@/components/admin/layout/admin-shell";
import { GoogleCalendarCard } from "@/components/admin/calendar/google-calendar-card";
import { PageContainer } from "@/components/ui/page-container";
import { isGoogleCalendarConfigured, isGoogleCalendarSetupUnlocked } from "@/lib/admin/setup-auth";
import { getGoogleCalendarConnectionStatus } from "@/lib/calendar/google-calendar-repository";

export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
  google_authorization_denied: "Google Calendar authorization was cancelled or denied.",
  invalid_oauth_state: "The Google Calendar connection could not be verified. Please start again.",
  google_calendar_connection_failed: "Google Calendar could not be connected. Please check the OAuth configuration and try again.",
};

export default async function AdminCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const params = await searchParams;
  const setupUnlocked = await isGoogleCalendarSetupUnlocked();
  const configured = isGoogleCalendarConfigured();
  const status = setupUnlocked && configured
    ? await getGoogleCalendarConnectionStatus()
    : { connected: false };

  return (
    <AdminShell>
      <PageContainer className="space-y-8">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Scheduling</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Calendar</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Connect the therapist&apos;s Google Calendar and manually check external availability before accepting bookings.
          </p>
        </div>

        {params.connected === "1" && (
          <div role="status" className="rounded-2xl border bg-primary/5 px-5 py-4 text-sm">
            Google Calendar connected successfully.
          </div>
        )}

        {params.error && errorMessages[params.error] && (
          <div role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-destructive">
            {errorMessages[params.error]}
          </div>
        )}

        <GoogleCalendarCard
          configured={configured}
          setupUnlocked={setupUnlocked}
          connected={status.connected}
          calendarId={status.calendarId}
          connectedAt={status.connectedAt}
        />

        <div className="rounded-2xl border bg-muted/20 p-5 text-sm leading-6 text-muted-foreground sm:p-6">
          <p className="font-medium text-foreground">How this works</p>
          <p className="mt-2 max-w-3xl">
            Grace Sessions keeps MongoDB as the source of truth. Google Calendar is used as an external free/busy signal for the therapist&apos;s primary calendar. No patient Google account is required, and no background polling or cron job is introduced.
          </p>
        </div>
      </PageContainer>
    </AdminShell>
  );
}
