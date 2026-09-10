import Link from "next/link";
import { ArrowRight, Clock3, Sparkles } from "lucide-react";
import { therapistProfile } from "@/lib/config/therapist-profile";

const previewServices = [
  {
    title: "Initial consultation",
    description: "A focused first conversation to understand your goals and discuss the right next step.",
    duration: "60 min",
  },
  {
    title: "Speech & language session",
    description: "Personalised support shaped around the communication skills you want to develop.",
    duration: "50 min",
  },
  {
    title: "Follow-up session",
    description: "Ongoing support to review progress, practise strategies and adjust your plan as needed.",
    duration: "50 min",
  },
] as const;

export function ProfileServicesPreview() {
  return (
    <section id="services" aria-labelledby="services-title" className="border-t py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-muted-foreground">Services</p>
            <h2 id="services-title" className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Support that fits your needs</h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">Explore the types of sessions available and choose the option that feels right for you.</p>
          </div>
          <Link href="/#book" className="inline-flex items-center gap-2 text-sm font-medium hover:underline underline-offset-4">
            Book a session
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {previewServices.map((service) => (
            <article key={service.title} className="group rounded-2xl border bg-background p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between gap-4">
                <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
                  <Sparkles aria-hidden="true" className="size-5" />
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Clock3 aria-hidden="true" className="size-3.5" />
                  {service.duration}
                </span>
              </div>
              <h3 className="mt-6 text-lg font-semibold">{service.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{service.description}</p>
            </article>
          ))}
        </div>

        <p className="mt-6 text-xs leading-5 text-muted-foreground">
          {therapistProfile.acceptsOnlineAppointments ? "Online sessions are available." : "Session availability will be shown during booking."}
        </p>
      </div>
    </section>
  );
}
