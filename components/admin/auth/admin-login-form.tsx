"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startAuthentication } from "@simplewebauthn/browser";
import { LockKeyhole, ScanFace } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AdminLoginFormProps {
  configured: boolean;
}

export function AdminLoginForm({ configured }: AdminLoginFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState("gracevpaul");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "We couldn't sign you in.");
      router.push("/admin");
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "We couldn't sign you in.");
    } finally {
      setBusy(false);
    }
  }

  async function signInWithPasskey() {
    setBusy(true);
    setError(null);
    try {
      const optionsResponse = await fetch("/api/admin/auth/passkey/login/options", { method: "POST" });
      const optionsData = await optionsResponse.json().catch(() => ({}));
      if (!optionsResponse.ok) throw new Error(optionsData.error ?? "We couldn't start passkey sign-in.");

      const credential = await startAuthentication({ optionsJSON: optionsData });
      const verifyResponse = await fetch("/api/admin/auth/passkey/login/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credential),
      });
      const verifyData = await verifyResponse.json().catch(() => ({}));
      if (!verifyResponse.ok) throw new Error(verifyData.error ?? "We couldn't sign you in with your passkey.");
      router.push("/admin");
      router.refresh();
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "NotAllowedError") {
        setError("Passkey sign-in was cancelled or timed out.");
      } else {
        setError(requestError instanceof Error ? requestError.message : "We couldn't sign you in with your passkey.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="w-full max-w-md shadow-sm">
      <CardHeader className="space-y-4 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <LockKeyhole aria-hidden="true" className="size-5" />
        </div>
        <div>
          <CardTitle className="text-2xl">Therapist login</CardTitle>
          <CardDescription className="mt-2">
            Sign in to manage appointments, availability, services and your public profile.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {!configured ? (
          <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm leading-6 text-destructive">
            Admin login is not configured on this deployment yet.
          </div>
        ) : (
          <div className="space-y-5">
            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                if (!busy) void submit();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="admin-username">Username</Label>
                <Input id="admin-username" name="username" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} disabled={busy} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <Input id="admin-password" name="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={busy} required />
              </div>
              {error && <p role="alert" className="text-sm leading-6 text-destructive">{error}</p>}
              <Button type="submit" className="min-h-11 w-full" disabled={busy || !username || !password}>
                {busy ? "Signing in…" : "Sign in"}
              </Button>
            </form>

            <div className="relative flex items-center justify-center">
              <span className="bg-card px-3 text-xs text-muted-foreground">or</span>
              <span className="absolute inset-x-0 -z-10 border-t" aria-hidden="true" />
            </div>

            <Button type="button" variant="outline" className="min-h-11 w-full" disabled={busy} onClick={() => void signInWithPasskey()}>
              <ScanFace aria-hidden="true" />
              Use a passkey
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
