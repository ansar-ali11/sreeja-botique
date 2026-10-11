import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export function PageStub({ title, note }: { title: string; note?: string }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <h1 className="font-display text-4xl font-medium lg:text-5xl">{title}</h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          {note ?? "This section is being crafted. Check back soon."}
        </p>
      </main>
      <Footer />
    </div>
  );
}
