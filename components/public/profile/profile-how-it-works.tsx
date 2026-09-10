import { CalendarCheck2, MessageCircle, Video } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Choose a service",
    description: "Explore the available support and select the session that best fits your needs.",
    icon: CalendarCheck2,
  },
  {
    number: "02",
    title: "Choose a time",
    description: "View available times in your own timezone and book without creating an account.",
    icon: MessageCircle,
  },
  {
    number: "03",
    title: "Attend your session",
    description: "Receive your appointment details and join your online session at the scheduled time.",
    icon: Video,
  },
] as const;

export function ProfileHowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-it-works-title" className="border-t bg-muted/20 py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-muted-foreground">How it works</p>
          <h2 id="how-it-works-title" className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Simple from first click to session</h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">A straightforward booking experience designed to keep the focus on care.</p>
        </div>

        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <li key={step.number} className="rounded-2xl border bg-background p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
                    <Icon aria-hidden="true" className="size-5" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">{step.number}</span>
                </div>
                <h3 className="mt-6 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
