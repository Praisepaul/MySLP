export function parseTimeToMinutes(time: string): number {
    const match = /^(\d{2}):(\d{2})$/.exec(time);

    if (!match) {
        throw new Error(`Invalid time format: ${time}`);
    }

    const hours = Number(match[1]);
    const minutes = Number(match[2]);

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        throw new Error(`Invalid time value: ${time}`);
    }

    return hours * 60 + minutes;
}

export function formatMinutesToTime(totalMinutes: number): string {
    if (!Number.isFinite(totalMinutes)) {
        throw new Error("Minutes must be a finite number.");
    }

    const minutesPerDay = 24 * 60;
    const normalizedMinutes =
        ((Math.trunc(totalMinutes) % minutesPerDay) + minutesPerDay) %
        minutesPerDay;

    const hours = Math.floor(normalizedMinutes / 60);
    const minutes = normalizedMinutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0",
    )}`;
}

export function addMinutes(date: Date, minutes: number): Date {
    if (Number.isNaN(date.getTime())) {
        throw new Error("Cannot add minutes to an invalid date.");
    }

    if (!Number.isFinite(minutes)) {
        throw new Error("Minutes must be a finite number.");
    }

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