import { Plus } from "lucide-react";

import { AdminShell } from "@/components/admin/layout/admin-shell";
import { ServiceForm } from "@/components/admin/services/service-form";
import { ServicesList } from "@/components/admin/services/services-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageContainer } from "@/components/ui/page-container";
import { services } from "@/lib/config/services";

export default function AdminServicesPage() {
  return (
    <AdminShell>
      <PageContainer className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Content</p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              Services
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Manage the services patients can see and choose during booking.
            </p>
          </div>

          <Button type="button">
            <Plus aria-hidden="true" className="size-4" />
            Add service
          </Button>
        </div>

        <section aria-labelledby="services-list-title">
          <div className="mb-4">
            <h2 id="services-list-title" className="text-lg font-semibold">
              Your services
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Active services can be displayed on your public profile.
            </p>
          </div>

          <ServicesList services={services} />
        </section>

        <section aria-labelledby="service-form-title">
          <Card>
            <CardHeader>
              <CardTitle id="service-form-title">
                Service form preview
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="mb-6 max-w-2xl text-sm leading-6 text-muted-foreground">
                This form is ready for service creation and editing. Saving
                changes will be connected to persistent storage in a later
                phase.
              </p>

              <ServiceForm />
            </CardContent>
          </Card>
        </section>
      </PageContainer>
    </AdminShell>
  );
}
