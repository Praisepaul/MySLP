"use client";

import {
  CalendarDays,
  Clock3,
  MoreHorizontal,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  AvailabilityException,
} from "@/lib/config/availability";

interface AvailabilityExceptionsListProps {
  exceptions: AvailabilityException[];
}

function formatDate(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
}

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

function getExceptionLabel(exception: AvailabilityException) {
  return exception.type === "unavailable"
    ? "Unavailable"
    : "Custom hours";
}

export function AvailabilityExceptionsList({
  exceptions,
}: AvailabilityExceptionsListProps) {
  const sortedExceptions = [...exceptions].sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  if (sortedExceptions.length === 0) {
    return (
      <Card>
        <CardContent className="flex min-h-48 flex-col items-center justify-center px-6 py-10 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
            <CalendarDays
              aria-hidden="true"
              className="size-5 text-muted-foreground"
            />
          </div>

          <h3 className="mt-4 text-base font-semibold">
            No availability exceptions
          </h3>

          <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
            Add an exception when you need to block a date or use different
            hours from your normal weekly schedule.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sortedExceptions.map((exception) => (
        <Card key={exception.id}>
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-lg">
                  {formatDate(exception.date)}
                </CardTitle>

                <Badge
                  variant={
                    exception.type === "unavailable"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {getExceptionLabel(exception)}
                </Badge>
              </div>

              {exception.reason && (
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {exception.reason}
                </p>
              )}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`More actions for ${formatDate(exception.date)}`}
            >
              <MoreHorizontal
                aria-hidden="true"
                className="size-4"
              />
            </Button>
          </CardHeader>

          <CardContent>
            {exception.type === "unavailable" ? (
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays
                  aria-hidden="true"
                  className="size-4"
                />
                Entire day unavailable
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Clock3
                  aria-hidden="true"
                  className="size-4"
                />
                {exception.startTime && exception.endTime
                  ? `${formatTime(exception.startTime)} – ${formatTime(
                      exception.endTime,
                    )}`
                  : "Custom hours"}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
