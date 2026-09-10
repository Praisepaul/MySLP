import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Globe2 } from "lucide-react";
import type { EditableTherapistProfile } from "@/lib/cms/site-settings-repository";

export function ProfileHero({ therapistProfile }: { therapistProfile: EditableTherapistProfile }) {
  return (
    <section aria-labelledby="profile-hero-title" className="relative overflow-hidden py-20 sm:py-28 lg:py-32">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-80 bg-gradient-to-b from-muted/70 to-transparent" />
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-8">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1.5 text-sm text-muted-foreground shadow-sm backdrop-blur"><Globe2 aria-hidden="true" className="size-4" /><span>{therapistProfile.acceptsOnlineAppointments ? "Online speech & language support" : "Speech & language support"}</span></div>
          <p className="text-sm font-medium text-muted-foreground">{therapistProfile.professionalTitle}</p>
          <h1 id="profile-hero-title" className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">{therapistProfile.name || "Thoughtful care, wherever you are."}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">{therapistProfile.shortBio || "Personalised speech and language support with a simple, welcoming way to get started."}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/#book" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">Book a session<ArrowRight aria-hidden="true" className="size-4" /></Link><Link href="#about" className="inline-flex h-11 items-center justify-center rounded-lg border bg-background px-5 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">Learn more</Link></div>
          {therapistProfile.credentials.length > 0 && <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground" aria-label="Professional credentials">{therapistProfile.credentials.map((credential) => <li key={credential}>{credential}</li>)}</ul>}
        </div>
        <div className="mx-auto w-full max-w-md lg:justify-self-end"><div className="relative aspect-[4/5] overflow-hidden rounded-3xl border bg-muted shadow-sm">{therapistProfile.profileImage ? <Image src={therapistProfile.profileImage} alt={therapistProfile.name ? `${therapistProfile.name}, ${therapistProfile.professionalTitle}` : "Therapist profile"} fill sizes="(max-width: 1024px) 100vw, 32rem" className="object-cover" priority /> : <div className="flex h-full items-center justify-center p-8 text-center"><div><div className="mx-auto flex size-20 items-center justify-center rounded-full bg-background text-2xl font-semibold shadow-sm">G</div><p className="mt-5 text-sm font-medium">Your professional photo</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Add a profile image from the therapist profile page.</p></div></div>}</div></div>
      </div>
    </section>
  );
}
