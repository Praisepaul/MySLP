"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  type AvailabilityException,
  validateAvailabilityException,
} from "@/lib/config/availability";

export function AvailabilityExceptionForm({
  initialException,
  onCancel,
  onSubmit,
}: {
  initialException?: AvailabilityException;
  onCancel?: () => void;
  onSubmit?: (exception: AvailabilityException) => void;
}) {
  const [values, setValues] = useState({
    date: initialException?.date ?? "",
    type: initialException?.type ?? "unavailable",
    startTime: initialException?.startTime ?? "09:00",
    endTime: initialException?.endTime ?? "17:00",
    reason: initialException?.reason ?? "",
  });
  const [error, setError] = useState("");

  function set<K extends keyof typeof values>(
    key: K,
    value: (typeof values)[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setError("");
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const exception: AvailabilityException = {
      id: initialException?.id ?? `exception-${values.date}`,
      date: values.date,
      type: values.type as AvailabilityException["type"],
      ...(values.type === "unavailable-hours" || values.type === "custom-hours"
        ? { startTime: values.startTime, endTime: values.endTime }
        : {}),
      ...(values.reason.trim() ? { reason: values.reason.trim() } : {}),
    };

    const validationError = validateAvailabilityException(exception);
    if (validationError) {
      setError(validationError);
      return;
    }

    onSubmit?.(exception);
  }

  const hasHours =
    values.type === "unavailable-hours" || values.type === "custom-hours";

  return (
    <form onSubmit={submit} className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="exception-date">Date</Label>
          <Input
            id="exception-date"
            type="date"
            value={values.date}
            onChange={(e) => set("date", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="exception-type">Type</Label>
          <Select
            value={values.type}
            onValueChange={(value) =>
              set("type", value as typeof values.type)
            }
          >
            <SelectTrigger id="exception-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unavailable">Unavailable all day</SelectItem>
              <SelectItem value="unavailable-hours">
                Unavailable for specific hours
              </SelectItem>
              <SelectItem value="custom-hours">Custom available hours</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasHours && (
          <>
            <div className="space-y-2">
              <Label htmlFor="exception-start">Start time</Label>
              <Input
                id="exception-start"
                type="time"
                value={values.startTime}
                onChange={(e) => set("startTime", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exception-end">End time</Label>
              <Input
                id="exception-end"
                type="time"
                value={values.endTime}
                onChange={(e) => set("endTime", e.target.value)}
                required
              />
            </div>
          </>
        )}

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="exception-reason">Reason</Label>
          <Textarea
            id="exception-reason"
            value={values.reason}
            onChange={(e) => set("reason", e.target.value)}
            placeholder="Optional note"
            rows={3}
          />
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">
          {initialException ? "Save changes" : "Add exception"}
        </Button>
      </div>
    </form>
  );
}
