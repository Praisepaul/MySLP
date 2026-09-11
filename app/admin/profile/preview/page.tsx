import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { requireGoogleCalendarSetupAccess } from "@/lib/admin/setup-auth";
import { getTherapistProfileDraft } from "@/lib/cms/site-settings-repository";
import { ProfileAbout } from "@/components/public/profile/profile-about";
import { ProfileContent } from "@/components/public/profile/profile-content";
import { ProfileDetails } from "@/components/public/profile/profile-details";
import { ProfileFaq } from "@/components/public/profile/profile-faq";
import { ProfileHero } from "@/components/public/profile/profile-hero";
import { ProfileHowItWorks } from "@/components/public/profile/profile-how-it-works";
import { ProfileServicesPreview } from "@/components/public/profile/profile-services-preview";
import { PublicFooter } from "@/components/public/layout/public-footer";
import { PublicHeader } from "@/components/public/navigation/public-header";

export const dynamic = "force-dynamic";

export default async function ProfileDraftPreviewPage() {
  await requireGoogleCalendarSetupAccess();
  const therapistProfile = await getTherapistProfileDraft();
  return <div className="flex min-h-screen flex-col"><PublicHeader /><main className="flex-1"><div className="border-b bg-muted/50 px-4 py-2 text-center text-xs font-medium text-muted-foreground">Draft preview — this page is private and is not visible to patients.</div><ProfileHero therapistProfile={therapistProfile} /><ProfileAbout therapistProfile={therapistProfile} /><ProfileDetails therapistProfile={therapistProfile} /><ProfileContent therapistProfile={therapistProfile} /><ProfileServicesPreview therapistProfile={therapistProfile} /><ProfileHowItWorks /><ProfileFaq therapistProfile={therapistProfile} /><section id="book" aria-labelledby="book-title" className="border-t py-20 sm:py-24"><div className="mx-auto w-full max-w-4xl px-4 text-center sm:px-6 lg:px-8"><p className="text-sm font-medium text-muted-foreground">Ready when you are</p><h2 id="book-title" className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Book a session</h2><p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">Choose a session, find a suitable time and provide only the details needed to arrange your appointment.</p><Link href="/book" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">Start booking<ArrowRight aria-hidden="true" className="size-4" /></Link></div></section></main><PublicFooter /></div>;
}
