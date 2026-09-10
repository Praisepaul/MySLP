import { ProfileAbout } from "@/components/public/profile/profile-about";
import { ProfileFaq } from "@/components/public/profile/profile-faq";
import { ProfileHero } from "@/components/public/profile/profile-hero";
import { ProfileHowItWorks } from "@/components/public/profile/profile-how-it-works";
import { ProfileServicesPreview } from "@/components/public/profile/profile-services-preview";
import { PublicFooter } from "@/components/public/layout/public-footer";
import { PublicHeader } from "@/components/public/navigation/public-header";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />

      <main className="flex-1">
        <ProfileHero />
        <ProfileAbout />
        <ProfileServicesPreview />
        <ProfileHowItWorks />
        <ProfileFaq />

        <section id="book" aria-labelledby="book-title" className="border-t py-20 sm:py-24">
          <div className="mx-auto w-full max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <p className="text-sm font-medium text-muted-foreground">Ready when you are</p>
            <h2 id="book-title" className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Book a session</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">The booking experience will be connected here once services and availability are configured.</p>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
