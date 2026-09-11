import {
    CalendarDays,
    ClipboardList,
    Clock3,
    LayoutDashboard,
    Settings,
    UserRound,
    UsersRound,
} from "lucide-react";

export const adminNavigation = [
    {
        label: "Overview",
        items: [
            {
                label: "Dashboard",
                href: "/admin",
                icon: LayoutDashboard,
            },
        ],
    },
    {
        label: "Scheduling",
        items: [
            {
                label: "Appointments",
                href: "/admin/appointments",
                icon: ClipboardList,
            },
            {
                label: "Calendar",
                href: "/admin/calendar",
                icon: CalendarDays,
            },
            {
                label: "Availability",
                href: "/admin/availability",
                icon: Clock3,
            },
        ],
    },
    {
        label: "Content",
        items: [
            {
                label: "Services",
                href: "/admin/services",
                icon: UsersRound,
            },
            {
                label: "Profile",
                href: "/admin/profile",
                icon: UserRound,
            },
        ],
    },
    {
        label: "Configuration",
        items: [
            {
                label: "Booking settings",
                href: "/admin/booking-settings",
                icon: Settings,
            }
        ],
    },
] as const;