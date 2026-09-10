"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarDays, CheckCircle2, CloudOff, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GoogleCalendarCardProps {
  configured: boolean;
  setupUnlocked: boolean;
  connected: boolean;
  connectedAt?: string;
  calendarId?: string;
}

export function GoogleCalendarCard({
  configured,
  setupUnlocked,
  connected,
  connectedAt,
  calendarId,
}: GoogleCalendarCardProps) {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [busy, setBusy] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function unlock() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/google-calendar/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not unlock calendar setup.");
      setSecret("");
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not unlock calendar setup.");
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    if (!window.confirm("Disconnect Google Calendar from Grace Sessions?")) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/google-calendar/disconnect", { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not disconnect Google Calendar.");
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not disconnect Google Calendar.");
    } finally {
      setBusy(false);
    }
  }

  async function sync() {
    setBusy(true);
    setError(null);
    setSyncMessage(null);
    try {
      const response = await fetch("/api/admin/google-calendar/sync", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not sync Google Calendar.");
      setSyncMessage(`Calendar checked successfully. ${data.busyIntervals.length} busy interval${data.busyIntervals.length === 1 ? "" : "s"} found in the next 7 days.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not sync Google Calendar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <CalendarDays aria-hidden="true" className="size-5" />
          </div>
          <div>
            <CardTitle>Google Calendar</CardTitle>
            <CardDescription className="mt-1 max-w-2xl">
              Connect the therapist&apos;s calendar so confirmed bookings can be checked against real calendar conflicts.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-6 sm:p-8">
        {!configured && (
          <div className="rounded-2xl border border-dashed p-5">
            <div className="flex gap-3">
              <CloudOff aria-hidden="true" className="mt-0.5 size-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Google Calendar is not configured yet</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Add the Google OAuth credentials and token-encryption settings from <code>.env.local</code>, then restart the development server.
                </p>
              </div>
            </div>
          </div>
        )}

        {configured && !setupUnlocked && (
          <form
            className="space-y-4 rounded-2xl border p-5 sm:p-6"
            onSubmit={(event) => {
              event.preventDefault();
              void unlock();
            }}
          >
            <div className="flex gap-3">
              <ShieldCheck aria-hidden="true" className="mt-0.5 size-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Open calendar setup</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Enter the temporary setup key configured on the server. This gate will be replaced by full admin authentication later.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="google-calendar-setup-secret">Setup key</Label>
              <Input
                id="google-calendar-setup-secret"
                type="password"
                autoComplete="off"
                value={secret}
                onChange={(event) => setSecret(event.target.value)}
                placeholder="Enter setup key"
              />
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={!secret || busy}>{busy ? "Unlocking…" : "Unlock setup"}</Button>
          </form>
        )}

        {configured && setupUnlocked && (
          <>
            <div className="flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex gap-3">
                {connected ? <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 text-primary" /> : <CloudOff aria-hidden="true" className="mt-0.5 size-5 text-muted-foreground" />}
                <div>
                  <p className="font-medium">{connected ? "Google Calendar connected" : "Google Calendar not connected"}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {connected
                      ? `Using the ${calendarId ?? "primary"} calendar for free/busy checks${connectedAt ? ` · connected ${new Date(connectedAt).toLocaleDateString()}` : ""}.`
                      : "Connect the therapist's Google Calendar to enable external conflict checks."}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {connected ? (
                  <>
                    <Button variant="outline" onClick={sync} disabled={busy}>
                      <RefreshCw aria-hidden="true" className={busy ? "animate-spin" : undefined} />
                      {busy ? "Checking…" : "Check calendar"}
                    </Button>
                    <Button variant="ghost" onClick={disconnect} disabled={busy}>Disconnect</Button>
                  </>
                ) : (
                  <Button asChild>
                    <a href="/api/admin/google-calendar/connect">Connect Google Calendar</a>
                  </Button>
                )}
              </div>
            </div>

            {syncMessage && <div role="status" className="rounded-xl border bg-muted/30 px-4 py-3 text-sm">{syncMessage}</div>}
            {error && <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}
          </>
        )}
      </CardContent>
    </Card>
  );
}
