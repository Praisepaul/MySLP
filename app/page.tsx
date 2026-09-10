import { PublicFooter } from "@/components/public/layout/public-footer";
import { PublicHeader } from "@/components/public/navigation/public-header";
import { PageContainer } from "@/components/ui/page-container";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />

      <main className="flex-1">
        <section className="flex min-h-[60vh] items-center py-20">
          <PageContainer>
            <div className="max-w-3xl">
              <p className="mb-4 text-sm font-medium text-muted-foreground">
                Speech &amp; language care
              </p>

              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Thoughtful care, wherever you are.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                A simple, welcoming way to learn about services and book a
                session online.
              </p>
            </div>
          </PageContainer>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
