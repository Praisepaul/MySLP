"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type {
  AvailabilityRule,
  DayOfWeek,
} from "@/lib/config/availability";

interface AvailabilityRuleFormProps {
  initialRule?: AvailabilityRule;
  onCancel?: () => void;
  onSubmit?: (rule: AvailabilityRule) => void;
}

interface AvailabilityRuleFormValues {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  timezone: string;
  active: boolean;
}

const dayOptions: { value: DayOfWeek; label: string }[] = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

function getInitialValues(
  rule?: AvailabilityRule,
): AvailabilityRuleFormValues {
  return {
    dayOfWeek: rule?.dayOfWeek ?? "monday",
    startTime: rule?.startTime ?? "09:00",
    endTime: rule?.endTime ?? "17:00",
    timezone: rule?.timezone ?? "Asia/Kolkata",
    active: rule?.active ?? true,
  };
}

function createRuleId(dayOfWeek: DayOfWeek, startTime: string) {
  return `${dayOfWeek}-${startTime.replace(":", "")}`;
}

export function AvailabilityRuleForm({
  initialRule,
  onCancel,
  onSubmit,
}: AvailabilityRuleFormProps) {
  const [values, setValues] = useState<AvailabilityRuleFormValues>(
    getInitialValues(initialRule),
  );

  const [error, setError] = useState("");

  function updateValue<K extends keyof AvailabilityRuleFormValues>(
    field: K,
    value: AvailabilityRuleFormValues[K],
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!values.startTime || !values.endTime) {
      setError("Please enter both a start time and an end time.");
      return;
    }

    if (values.startTime >= values.endTime) {
      setError("End time must be later than start time.");
      return;
    }

    if (!values.timezone.trim()) {
      setError("Please enter a timezone.");
      return;
    }

    const rule: AvailabilityRule = {
      id:
        initialRule?.id ??
        createRuleId(values.dayOfWeek, values.startTime),
      dayOfWeek: values.dayOfWeek,
      startTime: values.startTime,
      endTime: values.endTime,
      timezone: values.timezone.trim(),
      active: values.active,
    };

    onSubmit?.(rule);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="availability-day">Day</Label>

          <Select
            value={values.dayOfWeek}
            onValueChange={(value) =>
              updateValue("dayOfWeek", value as DayOfWeek)
            }
          >
            <SelectTrigger id="availability-day">
              <SelectValue placeholder="Select a day" />
            </SelectTrigger>

            <SelectContent>
              {dayOptions.map((day) => (
                <SelectItem key={day.value} value={day.value}>
                  {day.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="availability-timezone">Timezone</Label>

          <Input
            id="availability-timezone"
            value={values.timezone}
            onChange={(event) =>
              updateValue("timezone", event.target.value)
            }
            placeholder="Asia/Kolkata"
            required
          />

          <p className="text-xs leading-5 text-muted-foreground">
            Use an IANA timezone such as Asia/Kolkata or America/New_York.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="availability-start-time">Start time</Label>

          <Input
            id="availability-start-time"
            type="time"
            value={values.startTime}
            onChange={(event) =>
              updateValue("startTime", event.target.value)
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="availability-end-time">End time</Label>

          <Input
            id="availability-end-time"
            type="time"
            value={values.endTime}
            onChange={(event) =>
              updateValue("endTime", event.target.value)
            }
            required
          />
        </div>
      </div>

      <div className="rounded-2xl border p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="availability-active">
              Active availability
            </Label>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Active rules can be used when calculating bookable
              appointment times.
            </p>
          </div>

          <Switch
            id="availability-active"
            checked={values.active}
            onCheckedChange={(checked) =>
              updateValue("active", checked)
            }
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
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}

        <Button type="submit">
          {initialRule ? "Save changes" : "Add availability"}
        </Button>
      </div>
    </form>
  );
}