import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminShell } from "@/components/admin/layout/admin-shell";
import { PageContainer } from "@/components/ui/page-container";

const dashboardCards = [
  {
    title: "Upcoming appointments",
    value: "0",
    description: "No appointments scheduled yet.",
  },
  {
    title: "Active services",
    value: "0",
    description: "Services will appear here once configured.",
  },
  {
    title: "Availability",
    value: "Not configured",
    description: "Set your weekly availability to start accepting bookings.",
  },
];

export default function AdminPage() {
  return (
    <AdminShell>
      <PageContainer className="space-y-8">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Welcome back
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Dashboard
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Manage your appointments, availability, services and public profile
            from one place.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {dashboardCards.map((card) => (
            <Card key={card.title}>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-2xl font-semibold tracking-tight">
                  {card.value}
                </p>

                <p className="mt-2 text-sm leading-5 text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Getting started</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Your admin workspace is ready. In later phases, you&apos;ll be
              able to configure services, availability, booking settings,
              appointments and your public therapist profile here.
            </p>
          </CardContent>
        </Card>
      </PageContainer>
    </AdminShell>
  );
}
