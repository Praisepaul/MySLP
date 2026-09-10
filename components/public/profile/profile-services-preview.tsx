import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ServiceCard } from "@/components/public/services/service-card";
import type { EditableTherapistProfile } from "@/lib/cms/site-settings-repository";
import { services } from "@/lib/config/services";

const activeServices = services.filter((service) => service.active).sort((a, b) => a.order - b.order);

export function ProfileServicesPreview({ therapistProfile }: { therapistProfile: EditableTherapistProfile }) {
  return <section id="services" aria-labelledby="services-title" className="border-t py-20 sm:py-24"><div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"><div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><div className="max-w-2xl"><p className="text-sm font-medium text-muted-foreground">Services</p><h2 id="services-title" className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Support that fits your needs</h2><p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">Explore the types of sessions available and choose the option that feels right for you.</p></div><Link href="/book" className="inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline">Book a session<ArrowRight aria-hidden="true" className="size-4" /></Link></div><div className="mt-10 grid gap-4 md:grid-cols-3">{activeServices.map((service) => <ServiceCard key={service.id} service={service} />)}</div><p className="mt-6 text-xs leading-5 text-muted-foreground">{therapistProfile.acceptsOnlineAppointments ? "Online sessions are available." : "Session availability will be shown during booking."}</p></div></section>;
}
