import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { z } from "zod";
import { SiteLayout, PageTitle, Loading, Empty, ErrorNote } from "@/components/SiteLayout";
import { ProductGrid } from "@/components/shop/ProductCard";
import { listCategories, listProducts } from "@/lib/api";
import { seo } from "@/lib/seo";

const search = z.object({
  category: z.string().optional(),
  sort: z.enum(["new", "low", "high"]).optional(),
  type: z.enum(["all", "BUY_ONLINE", "ENQUIRY_ONLY"]).optional(),
  filter: z.enum(["new", "best", "featured"]).optional(),
  page: z.number().optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: search,
  head: () => seo("Shop All", "Browse bridal wear, sarees, lehengas and designer fashion from Kakinada."),
  component: Shop,
});

const PER_PAGE = 24;
const price = (p: { price: number; discountPrice?: number }) => p.discountPrice || p.price;

function Shop() {
  const s = Route.useSearch();
  const nav = useNavigate({ from: "/shop" });
  const products = useQuery({ queryKey: ["products"], queryFn: () => listProducts() });
  const cats = useQuery({ queryKey: ["categories"], queryFn: () => listCategories() });

  const filtered = useMemo(() => {
    let list = products.data ?? [];
    if (s.category) list = list.filter((p) => p.categoryId === s.category);
    if (s.type && s.type !== "all") list = list.filter((p) => p.productType === s.type);
    if (s.filter === "new") list = list.filter((p) => p.newArrival);
    if (s.filter === "best") list = list.filter((p) => p.bestSeller);
    if (s.filter === "featured") list = list.filter((p) => p.featured);
    if (s.sort === "low") list = [...list].sort((a, b) => price(a) - price(b));
    if (s.sort === "high") list = [...list].sort((a, b) => price(b) - price(a));
    return list;
  }, [products.data, s]);

  const page = s.page ?? 1;
  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const shown = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const sel = "h-10 border bg-background px-3 text-sm";

  return (
    <SiteLayout>
      <PageTitle title="The Collection" sub="Handpicked bridal and occasion wear" />
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="mb-8 flex flex-wrap gap-3">
          <select aria-label="Category" className={sel} value={s.category ?? ""} onChange={(e) => nav({ search: { ...s, category: e.target.value || undefined, page: 1 } })}>
            <option value="">All categories</option>
            {cats.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select aria-label="Filter" className={sel} value={s.filter ?? ""} onChange={(e) => nav({ search: { ...s, filter: (e.target.value || undefined) as never, page: 1 } })}>
            <option value="">Everything</option>
            <option value="new">New arrivals</option>
            <option value="best">Best sellers</option>
            <option value="featured">Featured</option>
          </select>
          <select aria-label="Purchase type" className={sel} value={s.type ?? "all"} onChange={(e) => nav({ search: { ...s, type: e.target.value as never, page: 1 } })}>
            <option value="all">Buy online & enquiry</option>
            <option value="BUY_ONLINE">Buy online</option>
            <option value="ENQUIRY_ONLY">Enquiry only</option>
          </select>
          <select aria-label="Sort" className={`${sel} ml-auto`} value={s.sort ?? "new"} onChange={(e) => nav({ search: { ...s, sort: e.target.value as never } })}>
            <option value="new">Newest</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
          </select>
        </div>
        {products.isLoading ? <Loading /> : products.error ? <ErrorNote error={products.error} /> : shown.length === 0 ? (
          <Empty title="No pieces found">Try another category or filter.</Empty>
        ) : (
          <>
            <p className="mb-6 text-xs tracking-widest text-muted-foreground">{filtered.length} PIECES</p>
            <ProductGrid products={shown} />
            {pages > 1 && (
              <nav className="mt-12 flex justify-center gap-2" aria-label="Pagination">
                {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                  <button key={n} onClick={() => nav({ search: { ...s, page: n } })} aria-current={n === page ? "page" : undefined}
                    className={`h-9 w-9 border text-sm ${n === page ? "bg-foreground text-background" : ""}`}>{n}</button>
                ))}
              </nav>
            )}
          </>
        )}
      </div>
    </SiteLayout>
  );
}
