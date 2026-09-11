"use client";

import { useRef, useState } from "react";
import { startRegistration } from "@simplewebauthn/browser";
import { Camera, KeyRound, Loader2, LogOut, ScanFace } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminAccountMenu() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState("/api/profile/image?draft=1");
  const [hasAvatar, setHasAvatar] = useState(true);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passkeyOpen, setPasskeyOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passkeyBusy, setPasskeyBusy] = useState(false);
  const [passkeyError, setPasskeyError] = useState("");
  const [passkeyMessage, setPasskeyMessage] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);

  async function handlePhotoChange(file: File) {
    setPhotoUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/admin/profile/image", { method: "POST", body: formData });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "We couldn't update the profile photo.");
      setHasAvatar(true);
      setAvatarUrl(`/api/profile/image?draft=1&v=${Date.now()}`);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "We couldn't update the profile photo.");
    } finally {
      setPhotoUploading(false);
    }
  }

  function openPasswordDialog() {
    setPasswordError("");
    setPasswordMessage("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordOpen(true);
  }

  function openPasskeyDialog() {
    setPasskeyError("");
    setPasskeyMessage("");
    setPasskeyOpen(true);
  }

  async function handlePasskeyRegistration() {
    setPasskeyBusy(true);
    setPasskeyError("");
    setPasskeyMessage("");
    try {
      const optionsResponse = await fetch("/api/admin/auth/passkey/register/options", { method: "POST" });
      const optionsData = await optionsResponse.json().catch(() => ({}));
      if (!optionsResponse.ok) throw new Error(optionsData.error ?? "We couldn't start passkey setup.");

      const credential = await startRegistration({ optionsJSON: optionsData });
      const verifyResponse = await fetch("/api/admin/auth/passkey/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credential),
      });
      const verifyData = await verifyResponse.json().catch(() => ({}));
      if (!verifyResponse.ok) throw new Error(verifyData.error ?? "We couldn't save the passkey.");
      setPasskeyMessage("Passkey added. You can now use it to sign in without your password.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setPasskeyError("Passkey setup was cancelled or timed out.");
      } else {
        setPasskeyError(error instanceof Error ? error.message : "We couldn't add the passkey.");
      }
    } finally {
      setPasskeyBusy(false);
    }
  }

  async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    if (!newPassword) {
      setPasswordError("Please enter a new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("The new passwords do not match.");
      return;
    }

    setPasswordSaving(true);
    try {
      const response = await fetch("/api/admin/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "We couldn't change the password.");
      setPasswordMessage("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "We couldn't change the password.");
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium">Therapist</p>
          <p className="text-xs text-muted-foreground">Administrator</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-semibold outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Open therapist account menu"
          >
            {hasAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="Therapist profile" className="size-full object-cover" onError={() => setHasAvatar(false)} />
            ) : (
              "T"
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={photoUploading} onClick={() => fileInputRef.current?.click()}>
              {photoUploading ? <Loader2 className="animate-spin" /> : <Camera />}
              Change profile photo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openPasswordDialog}>
              <KeyRound />
              Change password
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openPasskeyDialog}>
              <ScanFace />
              Set up a passkey
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                const form = document.getElementById("admin-account-logout-form");
                if (form instanceof HTMLFormElement) form.requestSubmit();
              }}
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <form id="admin-account-logout-form" action="/api/admin/auth/logout" method="post" className="hidden" />
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void handlePhotoChange(file); }} />
      </div>

      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription>Enter your current password, then choose a new password for the admin panel.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2"><label htmlFor="admin-current-password" className="text-sm font-medium">Current password</label><Input id="admin-current-password" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" required /></div>
            <div className="space-y-2"><label htmlFor="admin-new-password" className="text-sm font-medium">New password</label><Input id="admin-new-password" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" required /></div>
            <div className="space-y-2"><label htmlFor="admin-confirm-password" className="text-sm font-medium">Confirm new password</label><Input id="admin-confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" required /></div>
            {passwordError && <p className="text-sm text-destructive" role="alert">{passwordError}</p>}
            {passwordMessage && <p className="text-sm text-emerald-700" role="status">{passwordMessage}</p>}
            <DialogFooter><Button type="button" variant="outline" onClick={() => setPasswordOpen(false)} disabled={passwordSaving}>Cancel</Button><Button type="submit" disabled={passwordSaving}>{passwordSaving && <Loader2 className="animate-spin" />}Change password</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={passkeyOpen} onOpenChange={setPasskeyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set up a passkey</DialogTitle>
            <DialogDescription>Use your device&apos;s fingerprint, face unlock, PIN, or security key to sign in to the therapist admin panel without typing the password.</DialogDescription>
          </DialogHeader>
          {passkeyError && <p className="text-sm text-destructive" role="alert">{passkeyError}</p>}
          {passkeyMessage && <p className="text-sm text-emerald-700" role="status">{passkeyMessage}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPasskeyOpen(false)} disabled={passkeyBusy}>Close</Button>
            <Button type="button" onClick={() => void handlePasskeyRegistration()} disabled={passkeyBusy}>{passkeyBusy && <Loader2 className="animate-spin" />}Add passkey</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
