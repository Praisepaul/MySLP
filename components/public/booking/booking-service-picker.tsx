import { ArrowRight, Check, Clock3, Globe2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Service } from "@/lib/config/services";

interface BookingServicePickerProps {
  services: Service[];
  selectedServiceId: string | null;
  onSelect: (serviceId: string) => void;
  onContinue: () => void;
}

export function BookingServicePicker({ services, selectedServiceId, onSelect, onContinue }: BookingServicePickerProps) {
  return (
    <section aria-labelledby="service-step-title" className="space-y-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Step 1 of 4</p>
        <h2 id="service-step-title" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Choose a session</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Select the type of support you would like to book. You can review everything before continuing.</p>
      </div>
      <div className="grid gap-4">
        {services.map((service) => {
          const selected = service.id === selectedServiceId;
          return (
            <button key={service.id} type="button" aria-pressed={selected} onClick={() => onSelect(service.id)} className={`group w-full rounded-2xl border p-5 text-left transition-all hover:border-foreground/30 hover:shadow-sm sm:p-6 ${selected ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "bg-background"}`}>
              <div className="flex items-start gap-4">
                <span className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl ${selected ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {selected ? <Check aria-hidden="true" className="size-5" /> : <Clock3 aria-hidden="true" className="size-5" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center justify-between gap-2"><span className="font-semibold">{service.name}</span><span className="text-sm text-muted-foreground">{service.durationMinutes} min</span></span>
                  <span className="mt-2 block text-sm leading-6 text-muted-foreground">{service.shortDescription}</span>
                  <span className="mt-4 flex flex-wrap gap-2">
                    {service.online && <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium"><Globe2 aria-hidden="true" className="size-3.5" /> Online</span>}
                    {service.inPerson && <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium"><MapPin aria-hidden="true" className="size-3.5" /> In person</span>}
                  </span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
      <div className="flex justify-end border-t pt-6"><Button size="lg" disabled={!selectedServiceId} onClick={onContinue}>Choose date and time <ArrowRight aria-hidden="true" /></Button></div>
    </section>
  );
}
