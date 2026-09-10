import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-background px-6"
      aria-label="Loading"
    >
      <div className="w-full max-w-md space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="mt-6 h-10 w-32" />
      </div>
    </main>
  );
}
