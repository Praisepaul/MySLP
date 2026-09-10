import { CalendarPlus, Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getGoogleCalendarUrl, getOutlookCalendarUrl } from "@/lib/calendar/calendar-links";
import type { AppointmentPublicView } from "@/lib/appointments/appointment-types";

interface CalendarActionsProps {
  appointment: AppointmentPublicView;
}

export function CalendarActions({ appointment }: CalendarActionsProps) {
  const googleUrl = getGoogleCalendarUrl(appointment);
  const outlookUrl = getOutlookCalendarUrl(appointment);
  const icsUrl = `/api/appointments/${appointment.confirmationToken}/ics`;

  return (
    <section className="rounded-2xl border bg-background p-5 sm:p-6" aria-labelledby="calendar-actions-title">
      <div className="flex gap-3">
        <CalendarPlus aria-hidden="true" className="mt-0.5 size-5 text-primary" />
        <div className="min-w-0">
          <h2 id="calendar-actions-title" className="font-medium">Add to your calendar</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Save the appointment to the calendar you use most. Apple Calendar is supported through the .ics file.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <a
          className={buttonVariants({ variant: "outline" })}
          href={googleUrl}
          target="_blank"
          rel="noreferrer"
        >
          Google Calendar
        </a>
        <a
          className={buttonVariants({ variant: "outline" })}
          href={outlookUrl}
          target="_blank"
          rel="noreferrer"
        >
          Outlook
        </a>
        <a className={buttonVariants({ variant: "outline" })} href={icsUrl}>
          <Download aria-hidden="true" />
          Apple Calendar / .ics
        </a>
      </div>
    </section>
  );
}
