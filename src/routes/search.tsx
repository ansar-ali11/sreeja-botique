import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { Search } from "lucide-react";
import { SiteLayout, Loading, Empty } from "@/components/SiteLayout";
import { ProductGrid } from "@/components/shop/ProductCard";
import { listProducts } from "@/lib/api";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/search")({
  validateSearch: z.object({ q: z.string().optional() }),
  head: () => seo("Search", "Search sarees, lehengas and bridal wear at Sreeja's Bridal Boutique."),
  component: SearchPage,
});

function SearchPage() {
  const { q = "" } = Route.useSearch();
  const nav = useNavigate({ from: "/search" });
  const [text, setText] = useState(q);
  const { data, isLoading } = useQuery({ queryKey: ["products"], queryFn: () => listProducts() });
  const term = q.trim().toLowerCase();
  const results = term
    ? (data ?? []).filter((p) => [p.name, p.description, p.fabric, ...(p.tags ?? [])].join(" ").toLowerCase().includes(term))
    : [];
  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <form onSubmit={(e) => { e.preventDefault(); nav({ search: { q: text } }); }} className="mx-auto mb-12 flex max-w-xl border-b-2 border-foreground">
          <input autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="Search sarees, lehengas, silk..." aria-label="Search products" className="flex-1 bg-transparent py-3 font-display text-2xl outline-none" />
          <button aria-label="Search"><Search className="h-5 w-5" /></button>
        </form>
        {isLoading ? <Loading /> : !term ? null : results.length === 0 ? (
          <Empty title={`No results for “${q}”`}>Try a different word, like “silk” or “bridal”.</Empty>
        ) : <ProductGrid products={results} />}
      </div>
    </SiteLayout>
  );
}
