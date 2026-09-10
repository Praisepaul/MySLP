"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { EditableTherapistProfile } from "@/lib/cms/site-settings-repository";

type ProfileForm = EditableTherapistProfile;

const emptyProfile: ProfileForm = {
  name: "",
  professionalTitle: "Speech-Language Pathologist",
  shortBio: "",
  longBio: "",
  credentials: [],
  languages: ["en", "pt", "hi"],
  location: "",
  timezone: "Asia/Kolkata",
  acceptsOnlineAppointments: true,
  acceptsInPersonAppointments: false,
  profileImage: "",
  contact: { email: "", phone: "" },
  socialLinks: { website: "", instagram: "", linkedin: "" },
};

function listValue(items: string[]) { return items.join(", "); }
function parseList(value: string) { return value.split(",").map((item) => item.trim()).filter(Boolean); }

export function ProfileForm() {
  const [values, setValues] = useState<ProfileForm>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/admin/profile", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "We couldn't load your profile.");
        setValues(data.profile as ProfileForm);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "We couldn't load your profile.");
      } finally { setLoading(false); }
    })();
  }, []);

  function update<K extends keyof ProfileForm>(field: K, value: ProfileForm[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    setError(""); setNotice("");
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "We couldn't save your profile.");
      setValues(data.profile as ProfileForm); setNotice("Profile saved successfully.");
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "We couldn't save your profile."); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed"><Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden="true" /></div>;

  return <form onSubmit={save} className="space-y-6">
    <Card><CardHeader><CardTitle>Basic information</CardTitle></CardHeader><CardContent className="grid gap-6 sm:grid-cols-2">
      <div className="space-y-2"><Label htmlFor="profile-name">Name</Label><Input id="profile-name" value={values.name} onChange={(e) => update("name", e.target.value)} placeholder="Your name" /></div>
      <div className="space-y-2"><Label htmlFor="profile-title">Professional title</Label><Input id="profile-title" value={values.professionalTitle} onChange={(e) => update("professionalTitle", e.target.value)} required /></div>
      <div className="space-y-2 sm:col-span-2"><Label htmlFor="profile-short-bio">Short bio</Label><Textarea id="profile-short-bio" value={values.shortBio} onChange={(e) => update("shortBio", e.target.value)} placeholder="A short introduction shown near the top of your website." maxLength={500} /></div>
      <div className="space-y-2 sm:col-span-2"><Label htmlFor="profile-long-bio">About you</Label><Textarea id="profile-long-bio" value={values.longBio} onChange={(e) => update("longBio", e.target.value)} placeholder="Share your approach, experience and the people you support." maxLength={5000} className="min-h-36" /></div>
      <div className="space-y-2"><Label htmlFor="profile-credentials">Credentials</Label><Input id="profile-credentials" value={listValue(values.credentials)} onChange={(e) => update("credentials", parseList(e.target.value))} placeholder="MSc, CCC-SLP, Licensed SLP" /><p className="text-xs text-muted-foreground">Separate each credential with a comma.</p></div>
      <div className="space-y-2"><Label htmlFor="profile-languages">Languages</Label><Input id="profile-languages" value={listValue(values.languages)} onChange={(e) => update("languages", parseList(e.target.value))} placeholder="English, Portuguese, Hindi" /><p className="text-xs text-muted-foreground">Use the names you want patients to see.</p></div>
    </CardContent></Card>

    <Card><CardHeader><CardTitle>Practice details</CardTitle></CardHeader><CardContent className="grid gap-6 sm:grid-cols-2">
      <div className="space-y-2"><Label htmlFor="profile-location">Location</Label><Input id="profile-location" value={values.location} onChange={(e) => update("location", e.target.value)} placeholder="City, country or service area" /></div>
      <div className="space-y-2"><Label htmlFor="profile-timezone">Timezone</Label><Input id="profile-timezone" value={values.timezone} onChange={(e) => update("timezone", e.target.value)} placeholder="Asia/Kolkata" /><p className="text-xs text-muted-foreground">Use an IANA timezone, such as Asia/Kolkata.</p></div>
      <div className="space-y-3 sm:col-span-2"><p className="text-sm font-medium">Session types</p><label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={values.acceptsOnlineAppointments} onChange={(e) => update("acceptsOnlineAppointments", e.target.checked)} className="size-4" /> Online appointments</label><label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={values.acceptsInPersonAppointments} onChange={(e) => update("acceptsInPersonAppointments", e.target.checked)} className="size-4" /> In-person appointments</label></div>
      <div className="space-y-2 sm:col-span-2"><Label htmlFor="profile-image">Profile image</Label><Input id="profile-image" value={values.profileImage} onChange={(e) => update("profileImage", e.target.value)} placeholder="Paste the image address" /><p className="text-xs text-muted-foreground">For now, use an image address. A built-in media upload can be added when storage is selected.</p></div>
    </CardContent></Card>

    <Card><CardHeader><CardTitle>Contact &amp; social links</CardTitle></CardHeader><CardContent className="grid gap-6 sm:grid-cols-2">
      <div className="space-y-2"><Label htmlFor="profile-email">Email</Label><Input id="profile-email" type="email" value={values.contact.email} onChange={(e) => update("contact", { ...values.contact, email: e.target.value })} /></div>
      <div className="space-y-2"><Label htmlFor="profile-phone">Phone</Label><Input id="profile-phone" value={values.contact.phone} onChange={(e) => update("contact", { ...values.contact, phone: e.target.value })} /></div>
      <div className="space-y-2"><Label htmlFor="profile-website">Website</Label><Input id="profile-website" type="url" value={values.socialLinks.website} onChange={(e) => update("socialLinks", { ...values.socialLinks, website: e.target.value })} /></div>
      <div className="space-y-2"><Label htmlFor="profile-instagram">Instagram</Label><Input id="profile-instagram" type="url" value={values.socialLinks.instagram} onChange={(e) => update("socialLinks", { ...values.socialLinks, instagram: e.target.value })} /></div>
      <div className="space-y-2 sm:col-span-2"><Label htmlFor="profile-linkedin">LinkedIn</Label><Input id="profile-linkedin" type="url" value={values.socialLinks.linkedin} onChange={(e) => update("socialLinks", { ...values.socialLinks, linkedin: e.target.value })} /></div>
    </CardContent></Card>

    {error && <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}
    {notice && <div role="status" className="rounded-xl border bg-primary/5 px-4 py-3 text-sm">{notice}</div>}
    <div className="flex justify-end"><Button type="submit" disabled={saving}>{saving ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Check aria-hidden="true" />} {saving ? "Saving…" : "Save profile"}</Button></div>
  </form>;
}
