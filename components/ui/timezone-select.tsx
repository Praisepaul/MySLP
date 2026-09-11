"use client";

import { useEffect, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";

interface TimezoneSelectProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
}

function getTimezones() {
  if (typeof Intl !== "undefined" && "supportedValuesOf" in Intl) {
    return Intl.supportedValuesOf("timeZone");
  }
  return ["UTC", "Asia/Kolkata", "Asia/Singapore", "Asia/Dubai", "Europe/London", "Europe/Lisbon", "America/New_York", "America/Los_Angeles", "Australia/Sydney"];
}

function isValidTimezone(value: string) {
  if (!value.trim()) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

export function TimezoneSelect({ id, value, onChange, label = "Timezone", required, className }: TimezoneSelectProps) {
  const timezones = useMemo(() => getTimezones(), []);
  const listId = `${id}-options`;
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  function handleChange(nextValue: string) {
    setInputValue(nextValue);
    if (isValidTimezone(nextValue)) onChange(nextValue);
  }

  function handleBlur() {
    if (!isValidTimezone(inputValue)) setInputValue(value);
  }

  return (
    <div className={className}>
      {label && <label htmlFor={id} className="mb-2 block text-sm font-medium">{label}</label>}
      <Input
        id={id}
        list={listId}
        value={inputValue}
        onChange={(event) => handleChange(event.target.value)}
        onBlur={handleBlur}
        placeholder="Search timezone, e.g. Asia/Kolkata"
        autoComplete="off"
        required={required}
      />
      <datalist id={listId}>
        {timezones.map((timezone) => <option key={timezone} value={timezone} />)}
      </datalist>
      <p className="mt-1.5 text-xs leading-5 text-muted-foreground">Start typing to search the full IANA timezone list.</p>
    </div>
  );
}
