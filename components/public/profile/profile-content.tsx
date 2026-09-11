import { ArrowUpRight, Quote } from "lucide-react";
import type { EditableTherapistProfile } from "@/lib/cms/site-settings-repository";

export function ProfileContent({ therapistProfile }: { therapistProfile: EditableTherapistProfile }) {
  const testimonials = therapistProfile.testimonials.filter((item) => item.quote);
  const resources = therapistProfile.resources.filter((item) => item.title);
  if (!testimonials.length && !resources.length) return null;

  return <section aria-label="Patient stories and resources" className="border-t py-20 sm:py-24"><div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
    {testimonials.length > 0 && <div><div className="max-w-2xl"><p className="text-sm font-medium text-muted-foreground">Kind words</p><h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">What families and clients have shared</h2></div><div className="mt-8 flex snap-x gap-5 overflow-x-auto pb-4"><div className="flex min-w-full gap-5">{testimonials.map((item, index) => <article key={`${item.quote}-${index}`} className="w-[min(34rem,88vw)] shrink-0 snap-start rounded-3xl border bg-card p-7 shadow-sm sm:p-8"><Quote className="size-6" aria-hidden="true" /><blockquote className="mt-5 text-base leading-7 sm:text-lg">“{item.quote}”</blockquote>{(item.name || item.context) && <p className="mt-6 text-sm text-muted-foreground">{[item.name, item.context].filter(Boolean).join(" · ")}</p>}</article>)}</div></div></div>}
    {resources.length > 0 && <div><div className="max-w-2xl"><p className="text-sm font-medium text-muted-foreground">Helpful resources</p><h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Resources to explore</h2></div><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{resources.map((item, index) => <article key={`${item.title}-${index}`} className="rounded-2xl border bg-card p-6 shadow-sm"><h3 className="text-lg font-semibold">{item.title}</h3>{item.description && <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p>}{item.url && /^https?:\/\//i.test(item.url) && <a href={item.url} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline">Explore resource <ArrowUpRight className="size-4" aria-hidden="true" /></a>}</article>)}</div></div>}
  </div></section>;
}
