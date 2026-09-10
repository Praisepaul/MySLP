import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function ProfileServicesPreview() {
  return (
    <section id="services" aria-labelledby="services-title" className="border-t py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-muted-foreground">Services</p>
            <h2 id="services-title" className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Support that fits your needs</h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">Services and session details will be managed from the admin workspace as the scheduling system is configured.</p>
          </div>
          <Link href="/#book" className="inline-flex items-center gap-2 text-sm font-medium hover:underline underline-offset-4">Book a session <ArrowRight aria-hidden="true" className="size-4" /></Link>
        </div>

        <div className="mt-10 rounded-2xl border bg-muted/20 p-6 sm:p-8">
          <div className="flex size-10 items-center justify-center rounded-xl bg-background shadow-sm">
            <Sparkles aria-hidden="true" className="size-5" />
          </div>
          <h3 className="mt-5 text-lg font-semibold">Your services will appear here</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Once services are configured, this section will show clear session names, descriptions, durations and booking options without requiring code changes.</p>
        </div>
      </div>
    </section>
  );
}
