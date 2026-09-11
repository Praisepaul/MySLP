import { ArrowUpRight, Quote } from "lucide-react";
import type { EditableTherapistProfile } from "@/lib/cms/site-settings-repository";

function TestimonialCard({
  quote,
  name,
  context,
}: {
  quote: string;
  name?: string;
  context?: string;
}) {
  const isLong = quote.trim().split(/\s+/).length > 42 || quote.length > 280;

  return (
    <article className="flex h-[320px] w-[min(34rem,88vw)] shrink-0 snap-start flex-col rounded-3xl border bg-card p-7 shadow-sm sm:h-[330px] sm:p-8">
      <Quote className="size-6 shrink-0" aria-hidden="true" />
      <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <blockquote className="text-base leading-7 sm:text-lg">
          “{quote}”
        </blockquote>
        {isLong && (
          <p className="mt-3 text-xs font-medium text-muted-foreground">
            Read more by scrolling
          </p>
        )}
      </div>
      {(name || context) && (
        <p className="mt-5 shrink-0 text-sm text-muted-foreground">
          {[name, context].filter(Boolean).join(" · ")}
        </p>
      )}
    </article>
  );
}

export function ProfileContent({ therapistProfile }: { therapistProfile: EditableTherapistProfile }) {
  const testimonials = therapistProfile.testimonials.filter((item) => item.quote);
  const resources = therapistProfile.resources.filter((item) => item.title);
  if (!testimonials.length && !resources.length) return null;

  return (
    <section aria-label="Patient stories and resources" className="border-t py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl space-y-16 px-4 sm:px-6 lg:px-8">
        {testimonials.length > 0 && (
          <div>
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-muted-foreground">Kind words</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                What families and clients have shared
              </h2>
            </div>
            <div className="mt-8 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex min-w-full gap-5 pb-1">
                {testimonials.map((item, index) => (
                  <TestimonialCard
                    key={`${item.quote}-${index}`}
                    quote={item.quote}
                    name={item.name}
                    context={item.context}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {resources.length > 0 && (
          <div>
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-muted-foreground">Helpful resources</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                Resources to explore
              </h2>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {resources.map((item, index) => {
                const href = /^https?:\/\//i.test(item.url) ? item.url : "";
                const card = (
                  <article
                    className={`rounded-2xl border bg-card p-6 shadow-sm transition ${
                      href ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      {href && <ArrowUpRight className="mt-1 size-5 shrink-0" aria-hidden="true" />}
                    </div>
                    {item.description && (
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p>
                    )}
                    {href && <p className="mt-5 text-sm font-medium">Open resource</p>}
                  </article>
                );
                return href ? (
                  <a
                    key={`${item.title}-${index}`}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open ${item.title} in a new tab`}
                  >
                    {card}
                  </a>
                ) : (
                  <div key={`${item.title}-${index}`}>{card}</div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
