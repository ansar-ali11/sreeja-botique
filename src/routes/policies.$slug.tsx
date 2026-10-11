import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const TITLES: Record<string, string> = {
  privacy: "Privacy Policy",
  terms: "Terms & Conditions",
  shipping: "Shipping Policy",
  returns: "Return & Refund Policy",
};

export const Route = createFileRoute("/policies/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${TITLES[params.slug] ?? "Policy"} | Sreeja's Bridal Boutique` },
      { name: "description", content: "Store policies for Sreeja's Bridal Boutique." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PolicyPage,
});

function PolicyPage() {
  const { slug } = Route.useParams();
  const title = TITLES[slug] ?? "Policy";
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16">
        <h1 className="font-display text-4xl font-medium">{title}</h1>
        <div className="mt-8 space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p className="rounded border border-dashed border-primary/40 bg-accent/50 p-4 text-accent-foreground">
            Placeholder content — the final {title.toLowerCase()} text will be
            published here once approved by the boutique.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
