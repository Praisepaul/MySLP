"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
  if (typeof Intl !== "undefined" && typeof Intl.supportedValuesOf === "function") {
    return Intl.supportedValuesOf("timeZone");
  }

  // Modern browsers expose the complete IANA timezone database through Intl.
  // Keep UTC as the only legacy fallback rather than maintaining a partial list.
  return ["UTC"];
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

export function TimezoneSelect({
  id,
  value,
  onChange,
  label = "Timezone",
  required,
  className,
}: TimezoneSelectProps) {
  const timezones = useMemo(() => getTimezones(), []);
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredTimezones = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return timezones;

    return timezones.filter((timezone) =>
      timezone.toLowerCase().includes(normalizedQuery),
    );
  }, [query, timezones]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function selectTimezone(timezone: string) {
    setQuery(timezone);
    setOpen(false);
    onChange(timezone);
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextValue = event.target.value;
    setQuery(nextValue);
    setOpen(true);

    // Only commit complete, valid IANA identifiers. Partial typing such as
    // "America/Toron" never reaches the rest of the application.
    if (isValidTimezone(nextValue)) onChange(nextValue);
  }

  function handleBlur() {
    window.setTimeout(() => {
      setOpen(false);
      if (!isValidTimezone(query)) setQuery(value);
    }, 0);
  }

  return (
    <div ref={containerRef} className={className}>
      {label && (
        <label htmlFor={id} className="mb-2 block text-sm font-medium">
          {label}
        </label>
      )}

      <div className="relative">
        <Input
          id={id}
          value={query}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          onBlur={handleBlur}
          placeholder="Search IANA timezone, e.g. America/Toronto"
          autoComplete="off"
          required={required}
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-options`}
          aria-autocomplete="list"
        />

        {open && (
          <div
            id={`${id}-options`}
            role="listbox"
            className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border bg-popover p-1 text-popover-foreground shadow-lg"
          >
            {filteredTimezones.length ? (
              filteredTimezones.map((timezone) => (
                <button
                  key={timezone}
                  type="button"
                  role="option"
                  aria-selected={timezone === value}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectTimezone(timezone)}
                >
                  {timezone}
                </button>
              ))
            ) : (
              <p className="px-3 py-2 text-sm text-muted-foreground">
                No IANA timezone matches this search.
              </p>
            )}
          </div>
        )}
      </div>

      <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
        Search the complete IANA timezone database by region, city, or timezone name.
      </p>
    </div>
  );
}
