import { AdminShell } from "@/components/admin/layout/admin-shell";
import { ServicesManagerV2 } from "@/components/admin/services/services-manager-v2";
import { PageContainer } from "@/components/ui/page-container";
import { getServices } from "@/lib/cms/services-repository";
import type { Service } from "@/lib/config/services";

export const dynamic = "force-dynamic";

function toClientServices(services: Service[]): Service[] {
  return services.map((service) => ({
    id: service.id,
    name: service.name,
    shortDescription: service.shortDescription,
    description: service.description,
    durationMinutes: service.durationMinutes,
    ...(service.price !== undefined ? { price: service.price } : {}),
    ...(service.currency ? { currency: service.currency } : {}),
    online: service.online,
    inPerson: service.inPerson,
    active: service.active,
    order: service.order,
  }));
}

export default async function AdminServicesPage() {
  const services = await getServices();
  return (
    <AdminShell>
      <PageContainer className="space-y-8">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Content</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Services</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Manage the services patients can see and choose during booking.</p>
        </div>
        <section aria-labelledby="services-list-title">
          <div className="mb-4">
            <h2 id="services-list-title" className="text-lg font-semibold">Your services</h2>
            <p className="mt-1 text-sm text-muted-foreground">Active services can be displayed on your public profile.</p>
          </div>
          <ServicesManagerV2 initialServices={toClientServices(services)} />
        </section>
      </PageContainer>
    </AdminShell>
  );
}
