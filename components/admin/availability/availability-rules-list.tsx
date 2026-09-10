"use client";

import { Clock3, MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AvailabilityRule, DayOfWeek } from "@/lib/config/availability";

interface AvailabilityRulesListProps {
  rules: AvailabilityRule[];
}

const dayOrder: Record<DayOfWeek, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 7,
};

const dayLabels: Record<DayOfWeek, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

function formatTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return time;
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function AvailabilityRulesList({ rules }: AvailabilityRulesListProps) {
  const sortedRules = [...rules].sort((a, b) => {
    const dayDifference = dayOrder[a.dayOfWeek] - dayOrder[b.dayOfWeek];

    if (dayDifference !== 0) {
      return dayDifference;
    }

    return a.startTime.localeCompare(b.startTime);
  });

  if (sortedRules.length === 0) {
    return (
      <Card>
        <CardContent className="flex min-h-48 flex-col items-center justify-center px-6 py-10 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
            <Clock3
              aria-hidden="true"
              className="size-5 text-muted-foreground"
            />
          </div>

          <h3 className="mt-4 text-base font-semibold">
            No availability added
          </h3>

          <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
            Add your first weekly availability window to start building your
            scheduling hours.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sortedRules.map((rule) => (
        <Card key={rule.id}>
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-lg">
                  {dayLabels[rule.dayOfWeek]}
                </CardTitle>

                <Badge variant={rule.active ? "default" : "secondary"}>
                  {rule.active ? "Active" : "Inactive"}
                </Badge>
              </div>

              <p className="mt-2 text-sm text-muted-foreground">
                {rule.timezone}
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`More actions for ${dayLabels[rule.dayOfWeek]} availability`}
            >
              <MoreHorizontal aria-hidden="true" className="size-4" />
            </Button>
          </CardHeader>

          <CardContent>
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Clock3 aria-hidden="true" className="size-4" />
                {formatTime(rule.startTime)} – {formatTime(rule.endTime)}
              </span>

              <span>{rule.timezone}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
