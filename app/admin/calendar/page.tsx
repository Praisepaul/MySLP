import { AdminShell } from "@/components/admin/layout/admin-shell";
import { AdminCalendar } from "@/components/admin/calendar/admin-calendar";
import { GoogleCalendarCard } from "@/components/admin/calendar/google-calendar-card";
import { PageContainer } from "@/components/ui/page-container";
import { isGoogleCalendarConfigured, isGoogleCalendarSetupUnlocked } from "@/lib/admin/setup-auth";
import { getGoogleCalendarConnectionStatus } from "@/lib/calendar/google-calendar-repository";
import { getTherapistProfile } from "@/lib/cms/site-settings-repository";

export const dynamic = "force-dynamic";
const errorMessages: Record<string, string> = { google_authorization_denied: "Google Calendar authorization was cancelled or denied.", invalid_oauth_state: "The Google Calendar connection could not be verified. Please start again.", google_calendar_connection_failed: "Google Calendar could not be connected. Please check the OAuth configuration and try again." };

export default async function AdminCalendarPage({ searchParams }: { searchParams: Promise<{ connected?: string; error?: string }> }) {
  const params = await searchParams;
  const setupUnlocked = await isGoogleCalendarSetupUnlocked();
  const configured = isGoogleCalendarConfigured();
  const status = setupUnlocked && configured ? await getGoogleCalendarConnectionStatus() : { connected: false };
  const profile = await getTherapistProfile();
  return <AdminShell><PageContainer className="space-y-8">
    <div><p className="text-sm font-medium text-muted-foreground">Scheduling</p><h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Calendar</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">See the therapist&apos;s schedule in one place, including Grace Sessions appointments and Google Calendar events.</p></div>
    {params.connected === "1" && <div role="status" className="rounded-2xl border bg-primary/5 px-5 py-4 text-sm">Google Calendar connected successfully.</div>}
    {params.error && errorMessages[params.error] && <div role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-destructive">{errorMessages[params.error]}</div>}
    {setupUnlocked && <AdminCalendar timezone={profile.timezone || "Asia/Kolkata"} />}
    <GoogleCalendarCard configured={configured} setupUnlocked={setupUnlocked} connected={status.connected} calendarId={status.calendarId} connectedAt={status.connectedAt} />
    <div className="rounded-2xl border bg-muted/20 p-5 text-sm leading-6 text-muted-foreground sm:p-6"><p className="font-medium text-foreground">How this works</p><p className="mt-2 max-w-3xl">Grace Sessions keeps MongoDB as the source of truth. Google Calendar is an external schedule signal. The schedule view loads a selected week when you open or navigate it; it does not continuously poll Google Calendar.</p></div>
  </PageContainer></AdminShell>;
}
