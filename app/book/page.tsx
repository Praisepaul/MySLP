import { BookingFlow } from "@/components/public/booking/booking-flow";
import { PublicFooter } from "@/components/public/layout/public-footer";
import { PublicHeader } from "@/components/public/navigation/public-header";
import { getServices } from "@/lib/cms/services-repository";
import type { Service } from "@/lib/config/services";

export const dynamic = "force-dynamic";

function toClientServices(services: Service[]): Service[] { return services.map((service) => ({ id: service.id, name: service.name, shortDescription: service.shortDescription, description: service.description, durationMinutes: service.durationMinutes, ...(service.price !== undefined ? { price: service.price } : {}), ...(service.currency ? { currency: service.currency } : {}), online: service.online, inPerson: service.inPerson, active: service.active, order: service.order })); }

export default async function BookPage() {
  const services = await getServices();
  return <div className="flex min-h-screen flex-col"><PublicHeader /><main className="flex-1"><BookingFlow services={toClientServices(services)} /></main><PublicFooter /></div>;
}
