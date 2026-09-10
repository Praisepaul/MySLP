import { ArrowLeft, ArrowRight, Mail, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type BookingDetails = { name: string; email: string };

interface BookingDetailsFormProps {
  details: BookingDetails;
  onChange: (details: BookingDetails) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function BookingDetailsForm({ details, onChange, onBack, onContinue }: BookingDetailsFormProps) {
  const valid = details.name.trim().length >= 2 && /^\S+@\S+\.\S+$/.test(details.email.trim());
  return (
    <section aria-labelledby="details-step-title" className="space-y-6">
      <div><p className="text-sm font-medium text-muted-foreground">Step 3 of 4</p><h2 id="details-step-title" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">A few details</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Just the essentials needed to prepare your appointment. No account is required.</p></div>
      <div className="grid gap-5 rounded-2xl border bg-background p-5 sm:p-6">
        <div className="grid gap-2"><Label htmlFor="booking-name"><UserRound aria-hidden="true" className="size-4" /> Full name</Label><Input id="booking-name" autoComplete="name" value={details.name} onChange={(event) => onChange({ ...details, name: event.target.value })} placeholder="Your name" aria-required="true" /></div>
        <div className="grid gap-2"><Label htmlFor="booking-email"><Mail aria-hidden="true" className="size-4" /> Email address</Label><Input id="booking-email" type="email" autoComplete="email" value={details.email} onChange={(event) => onChange({ ...details, email: event.target.value })} placeholder="you@example.com" aria-required="true" /><p className="text-xs leading-5 text-muted-foreground">We’ll use this for appointment details and future management links.</p></div>
      </div>
      <div className="rounded-2xl bg-muted/50 p-4 text-sm leading-6 text-muted-foreground">Please avoid sharing clinical or sensitive information in this form. Scheduling only needs your contact details.</div>
      <div className="flex flex-col-reverse justify-between gap-3 border-t pt-6 sm:flex-row"><Button variant="outline" onClick={onBack}><ArrowLeft aria-hidden="true" /> Back</Button><Button size="lg" disabled={!valid} onClick={onContinue}>Review booking <ArrowRight aria-hidden="true" /></Button></div>
    </section>
  );
}
