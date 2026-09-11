"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  type AvailabilityRule,
  type DayOfWeek,
  validateAvailabilityRule,
} from "@/lib/config/availability";

interface AvailabilityRuleFormProps {
  initialRule?: AvailabilityRule;
  onCancel?: () => void;
  onSubmit?: (rule: AvailabilityRule) => void;
  onSubmitRules?: (rules: AvailabilityRule[]) => void;
}

interface AvailabilityRuleFormValues {
  daysOfWeek: DayOfWeek[];
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

function getInitialValues(rule?: AvailabilityRule): AvailabilityRuleFormValues {
  return {
    daysOfWeek: rule ? [rule.dayOfWeek] : ["monday"],
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
  onSubmitRules,
}: AvailabilityRuleFormProps) {
  const [values, setValues] = useState<AvailabilityRuleFormValues>(
    getInitialValues(initialRule),
  );
  const [error, setError] = useState("");

  function updateValue<K extends keyof AvailabilityRuleFormValues>(
    field: K,
    value: AvailabilityRuleFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setError("");
  }

  function toggleDay(day: DayOfWeek) {
    setValues((current) => {
      const selected = current.daysOfWeek.includes(day);
      const daysOfWeek = selected
        ? current.daysOfWeek.filter((item) => item !== day)
        : [...current.daysOfWeek, day];

      return { ...current, daysOfWeek };
    });
    setError("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!values.daysOfWeek.length) {
      setError("Please select at least one day.");
      return;
    }

    const rules = values.daysOfWeek.map((dayOfWeek) => ({
      id:
        initialRule?.dayOfWeek === dayOfWeek
          ? initialRule.id
          : createRuleId(dayOfWeek, values.startTime),
      dayOfWeek,
      startTime: values.startTime,
      endTime: values.endTime,
      timezone: values.timezone.trim(),
      active: values.active,
    }));

    for (const rule of rules) {
      const validationError = validateAvailabilityRule(rule);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    if (onSubmitRules) {
      onSubmitRules(rules);
      return;
    }

    onSubmit?.(rules[0]);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-3">
        <Label>Days</Label>
        <p className="text-sm leading-6 text-muted-foreground">
          Choose one or more days that share these same hours. You can still
          create separate time windows for the same day.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {dayOptions.map((day) => {
            const selected = values.daysOfWeek.includes(day.value);
            return (
              <button
                key={day.value}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleDay(day.value)}
                className={`rounded-xl border px-3 py-3 text-left text-sm font-medium transition hover:bg-muted ${
                  selected ? "border-primary bg-primary/5" : "bg-background"
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="availability-start-time">Start time</Label>
          <Input
            id="availability-start-time"
            type="time"
            value={values.startTime}
            onChange={(event) => updateValue("startTime", event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="availability-end-time">End time</Label>
          <Input
            id="availability-end-time"
            type="time"
            value={values.endTime}
            onChange={(event) => updateValue("endTime", event.target.value)}
            required
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="availability-timezone">Timezone</Label>
          <Input
            id="availability-timezone"
            value={values.timezone}
            onChange={(event) => updateValue("timezone", event.target.value)}
            placeholder="Asia/Kolkata"
            required
          />
          <p className="text-xs leading-5 text-muted-foreground">
            Use an IANA timezone such as Asia/Kolkata or America/New_York.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="availability-active">Active availability</Label>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Active rules can be used when calculating bookable appointment
              times.
            </p>
          </div>
          <Switch
            id="availability-active"
            checked={values.active}
            onCheckedChange={(checked) => updateValue("active", checked)}
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
          {initialRule ? "Save changes" : "Add availability"}
        </Button>
      </div>
    </form>
  );
}
