import { Plus } from "lucide-react";

import { AdminShell } from "@/components/admin/layout/admin-shell";
import { AvailabilityExceptionsList } from "@/components/admin/availability/availability-exceptions-list";
import { AvailabilityRuleForm } from "@/components/admin/availability/availability-rule-form";
import { AvailabilityRulesList } from "@/components/admin/availability/availability-rules-list";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageContainer } from "@/components/ui/page-container";
import {
  availabilityExceptions,
  availabilityRules,
} from "@/lib/config/availability";

export default function AdminAvailabilityPage() {
  return (
    <AdminShell>
      <PageContainer className="space-y-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Scheduling
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              Availability
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Set your regular working hours and add exceptions for dates
              that need different availability.
            </p>
          </div>
        </div>

        <section aria-labelledby="weekly-availability-title">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                id="weekly-availability-title"
                className="text-lg font-semibold"
              >
                Weekly availability
              </h2>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                These recurring hours will be used as the starting point for
                calculating bookable times.
              </p>
            </div>

            <Button type="button">
              <Plus aria-hidden="true" className="size-4" />
              Add availability
            </Button>
          </div>

          <AvailabilityRulesList rules={availabilityRules} />
        </section>

        <section aria-labelledby="availability-rule-form-title">
          <Card>
            <CardHeader>
              <CardTitle id="availability-rule-form-title">
                Add or edit availability
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="mb-6 max-w-2xl text-sm leading-6 text-muted-foreground">
                Configure a recurring availability window. Saving changes
                will be connected to persistent storage in a later phase.
              </p>

              <AvailabilityRuleForm />
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="availability-exceptions-title">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                id="availability-exceptions-title"
                className="text-lg font-semibold"
              >
                Exceptions
              </h2>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Block specific dates or replace your normal hours for a
                particular date.
              </p>
            </div>

            <Button type="button" variant="outline">
              <Plus aria-hidden="true" className="size-4" />
              Add exception
            </Button>
          </div>

          <AvailabilityExceptionsList
            exceptions={availabilityExceptions}
          />
        </section>
      </PageContainer>
    </AdminShell>
  );
}
