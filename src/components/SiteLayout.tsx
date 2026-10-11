import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { firebaseReady } from "@/lib/firebase";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {!firebaseReady && (
        <div className="bg-secondary px-4 py-2 text-center text-xs text-secondary-foreground">
          Store is not yet connected to its database — products will appear once setup is complete.
        </div>
      )}
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export function PageTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="border-b bg-secondary/40 px-4 py-12 text-center">
      <h1 className="font-display text-4xl font-medium lg:text-5xl">{title}</h1>
      {sub && <p className="mt-3 text-sm text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function Loading() {
  return (
    <div className="flex justify-center py-24" role="status" aria-label="Loading">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h2 className="font-display text-2xl">{title}</h2>
      <div className="mt-3 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}

export function ErrorNote({ error }: { error: unknown }) {
  return (
    <Empty title="Something went wrong">
      {error instanceof Error ? error.message : "Please try again in a moment."}
    </Empty>
  );
}
