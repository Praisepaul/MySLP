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