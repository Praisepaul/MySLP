import { BookingFlow } from "@/components/public/booking/booking-flow";
import { PublicFooter } from "@/components/public/layout/public-footer";
import { PublicHeader } from "@/components/public/navigation/public-header";
import { getServices } from "@/lib/cms/services-repository";

export const dynamic = "force-dynamic";

export default async function BookPage() {
  const services = await getServices();
  return <div className="flex min-h-screen flex-col"><PublicHeader /><main className="flex-1"><BookingFlow services={services} /></main><PublicFooter /></div>;
}
