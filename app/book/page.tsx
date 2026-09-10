import { BookingFlow } from "@/components/public/booking/booking-flow";
import { PublicFooter } from "@/components/public/layout/public-footer";
import { PublicHeader } from "@/components/public/navigation/public-header";

export default function BookPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">
        <BookingFlow />
      </main>
      <PublicFooter />
    </div>
  );
}
