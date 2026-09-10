import { Clock3, Globe2, MapPin } from "lucide-react";
import type { Service } from "@/lib/config/services";

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <article className="rounded-2xl border bg-background p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
          <Clock3 aria-hidden="true" className="size-5" />
        </div>

        <span className="text-xs font-medium text-muted-foreground">
          {service.durationMinutes} min
        </span>
      </div>

      <h3 className="mt-6 text-lg font-semibold">{service.name}</h3>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {service.shortDescription}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {service.online && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
            <Globe2 aria-hidden="true" className="size-3.5" />
            Online
          </span>
        )}

        {service.inPerson && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
            <MapPin aria-hidden="true" className="size-3.5" />
            In person
          </span>
        )}
      </div>
    </article>
  );
}
