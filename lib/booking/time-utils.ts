export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
}

export function formatMinutesToTime(totalMinutes: number): string {
  const normalizedMinutes = totalMinutes % (24 * 60);
  const hours = Math.floor(normalizedMinutes / 60);
  const minutes = normalizedMinutes % 60;

  return `${ String(hours).padStart(2, "0") }:${
    String(minutes).padStart(
        2,
        "0",
    )
} `;
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export function intervalsOverlap(
  firstStart: Date,
  firstEnd: Date,
  secondStart: Date,
  secondEnd: Date,
): boolean {
  return firstStart < secondEnd && firstEnd > secondStart;
}

export function isBeforeOrEqual(
  first: Date,
  second: Date,
): boolean {
  return first.getTime() <= second.getTime();
}

export function isAfterOrEqual(
  first: Date,
  second: Date,
): boolean {
  return first.getTime() >= second.getTime();
}