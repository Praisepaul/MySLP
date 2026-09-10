export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type AvailabilityRule = {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  timezone: string;
  active: boolean;
};

export type AvailabilityExceptionType =
  | "unavailable"
  | "custom-hours";

export type AvailabilityException = {
  id: string;
  date: string;
  startTime?: string;
  endTime?: string;
  reason?: string;
  type: AvailabilityExceptionType;
};

export const availabilityRules: AvailabilityRule[] = [
  {
    id: "monday-morning",
    dayOfWeek: "monday",
    startTime: "09:00",
    endTime: "12:00",
    timezone: "Asia/Kolkata",
    active: true,
  },
  {
    id: "monday-afternoon",
    dayOfWeek: "monday",
    startTime: "14:00",
    endTime: "17:00",
    timezone: "Asia/Kolkata",
    active: true,
  },
  {
    id: "tuesday-morning",
    dayOfWeek: "tuesday",
    startTime: "09:00",
    endTime: "12:00",
    timezone: "Asia/Kolkata",
    active: true,
  },
  {
    id: "tuesday-afternoon",
    dayOfWeek: "tuesday",
    startTime: "14:00",
    endTime: "17:00",
    timezone: "Asia/Kolkata",
    active: true,
  },
  {
    id: "wednesday-morning",
    dayOfWeek: "wednesday",
    startTime: "09:00",
    endTime: "12:00",
    timezone: "Asia/Kolkata",
    active: true,
  },
  {
    id: "wednesday-afternoon",
    dayOfWeek: "wednesday",
    startTime: "14:00",
    endTime: "17:00",
    timezone: "Asia/Kolkata",
    active: true,
  },
  {
    id: "thursday-morning",
    dayOfWeek: "thursday",
    startTime: "09:00",
    endTime: "12:00",
    timezone: "Asia/Kolkata",
    active: true,
  },
  {
    id: "thursday-afternoon",
    dayOfWeek: "thursday",
    startTime: "14:00",
    endTime: "17:00",
    timezone: "Asia/Kolkata",
    active: true,
  },
  {
    id: "friday-morning",
    dayOfWeek: "friday",
    startTime: "09:00",
    endTime: "12:00",
    timezone: "Asia/Kolkata",
    active: true,
  },
  {
    id: "friday-afternoon",
    dayOfWeek: "friday",
    startTime: "14:00",
    endTime: "17:00",
    timezone: "Asia/Kolkata",
    active: true,
  },
];

export const availabilityExceptions: AvailabilityException[] = [];

export function isAvailabilityException(
  exception: AvailabilityException,
): boolean {
  return exception.type === "unavailable" || exception.type === "custom-hours";
}

export function isFullDayException(
  exception: AvailabilityException,
): boolean {
  return exception.type === "unavailable";
}

export function isPartialDayException(
  exception: AvailabilityException,
): boolean {
  return (
    exception.type === "custom-hours" &&
    Boolean(exception.startTime && exception.endTime)
  );
}

export function validateAvailabilityException(
  exception: AvailabilityException,
): string | null {
  if (!exception.id.trim()) {
    return "An availability exception must have an id.";
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(exception.date)) {
    return "Availability exception date must use YYYY-MM-DD format.";
  }

  if (!isAvailabilityException(exception)) {
    return "Invalid availability exception type.";
  }

  if (exception.type === "custom-hours") {
    if (!exception.startTime || !exception.endTime) {
      return "Custom-hours exceptions require both a start time and an end time.";
    }

    if (exception.startTime >= exception.endTime) {
      return "Exception end time must be later than start time.";
    }
  }

  return null;
}
