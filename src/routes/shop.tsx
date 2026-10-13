
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { z } from "zod";
import {
  ArrowRight,
  Check,
  ChevronDown,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";

import {
  SiteLayout,
  PageTitle,
  Loading,
  Empty,
  ErrorNote,
} from "@/components/SiteLayout";
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
  head: () =>
    seo(
      "Shop All",
      "Explore bridal wear, sarees, lehengas and designer fashion from Sreeja's Bridal Boutique.",
    ),
  component: Shop,
});

const PER_PAGE = 24;

const price = (p: { price: number; discountPrice?: number }) =>
  p.discountPrice && p.discountPrice < p.price
    ? p.discountPrice
    : p.price;

const quickFilters = [
  { label: "All Products", value: undefined },
  { label: "New Arrivals", value: "new" as const },
  { label: "Best Sellers", value: "best" as const },
  { label: "Featured", value: "featured" as const },
];

function Shop() {
  const s = Route.useSearch();
  const nav = useNavigate({ from: "/shop" });

  const products = useQuery({
    queryKey: ["products"],
    queryFn: () => listProducts(),
  });

  const cats = useQuery({
    queryKey: ["categories"],
    queryFn: () => listCategories(),
  });

  const filtered = useMemo(() => {
    let list = products.data ?? [];

    if (s.category) {
      list = list.filter((p) => p.categoryId === s.category);
    }

    if (s.type && s.type !== "all") {
      list = list.filter((p) => p.productType === s.type);
    }

    if (s.filter === "new") {
      list = list.filter((p) => p.newArrival);
    }

    if (s.filter === "best") {
      list = list.filter((p) => p.bestSeller);
    }

    if (s.filter === "featured") {
      list = list.filter((p) => p.featured);
    }

    if (s.sort === "low") {
      list = [...list].sort((a, b) => price(a) - price(b));
    } else if (s.sort === "high") {
      list = [...list].sort((a, b) => price(b) - price(a));
    }

    return list;
  }, [products.data, s.category, s.filter, s.type, s.sort]);

  const page = Math.max(1, s.page ?? 1);
  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, pages);
  const shown = filtered.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE,
  );

  const hasFilters = Boolean(
    s.category || s.filter || (s.type && s.type !== "all"),
  );

  const updateSearch = (
    updates: Partial<{
      category: string | undefined;
      filter: "new" | "best" | "featured" | undefined;
      type: "all" | "BUY_ONLINE" | "ENQUIRY_ONLY" | undefined;
      sort: "new" | "low" | "high" | undefined;
      page: number | undefined;
    }>,
  ) => {
    void nav({
      search: {
        ...s,
        ...updates,
      },
    });
  };

  const resetFilters = () => {
    void nav({
      search: {
        sort: s.sort,
        page: 1,
      },
    });
  };

  const selectClass =
    "h-10 w-full min-w-0 appearance-none rounded-sm border border-[#E4DAD2] bg-white px-3 pr-9 text-xs text-[#39232A] outline-none transition focus:border-[#70263D] focus:ring-2 focus:ring-[#70263D]/10";

  return (
    <SiteLayout>
      <PageTitle
        title="Shop All"
        sub="Discover your next favourite look"
      />

      <main className="min-h-[60vh] bg-[#FFFEFC] text-[#30252A]">
        {/* Compact fashion-store introduction */}
        <section className="border-b border-[#EEE6E0] bg-[#F8F3EE]">
          <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-7 sm:py-9 lg:px-10">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="mb-2 flex items-center gap-2 text-[9px] font-semibold tracking-[0.22em] text-[#8A6B57]">
                  <Sparkles className="h-3.5 w-3.5 text-[#B08D57]" />
                  SREEJA'S BRIDAL BOUTIQUE
                </p>
                <h1 className="font-display text-3xl font-medium tracking-tight text-[#4B1F30] sm:text-4xl">
                  Find your perfect look
                </h1>
                <p className="mt-2 max-w-xl text-xs leading-5 text-[#786B67] sm:text-sm">
                  Occasion wear, timeless classics and beautiful styles for
                  every celebration.
                </p>
              </div>

              <p className="text-[10px] tracking-[0.14em] text-[#8A6B57]">
                MADE FOR YOUR MOMENTS
              </p>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-7 sm:py-7 lg:px-10">
          {/* Quick collection tabs */}
          <nav
            aria-label="Shop collections"
            className="mb-6 flex gap-2 overflow-x-auto border-b border-[#EEE6E0] pb-4"
          >
            {quickFilters.map((item) => {
              const active = (s.filter ?? undefined) === item.value;

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() =>
                    updateSearch({ filter: item.value, page: 1 })
                  }
                  aria-pressed={active}
                  className={`shrink-0 rounded-full border px-4 py-2.5 text-[10px] font-semibold tracking-wide transition-all sm:px-5 sm:text-xs ${
                    active
                      ? "border-[#70263D] bg-[#70263D] text-white shadow-sm"
                      : "border-[#E4DAD2] bg-white text-[#59454B] hover:border-[#70263D] hover:text-[#70263D]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Results summary and filters */}
          <section aria-label="Product filters">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEE6E0] pb-4">
              <div>
                <h2 className="text-sm font-semibold text-[#39232A] sm:text-base">
                  {s.category
                    ? cats.data?.find((c) => c.id === s.category)?.name ??
                      "Selected collection"
                    : s.filter === "new"
                      ? "New Arrivals"
                      : s.filter === "best"
                        ? "Best Sellers"
                        : s.filter === "featured"
                          ? "Featured Styles"
                          : "All Products"}
                </h2>
                <p className="mt-1 text-[11px] text-[#887B76]">
                  {products.isLoading
                    ? "Finding beautiful styles..."
                    : `${filtered.length} ${filtered.length === 1 ? "style" : "styles"} to explore`}
                </p>
              </div>

              {hasFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#70263D] hover:underline"
                >
                  <X className="h-3.5 w-3.5" />
                  CLEAR FILTERS
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5 py-4 sm:grid-cols-4 sm:gap-3">
              <label className="relative block min-w-0">
                <span className="mb-1.5 block text-[9px] font-semibold tracking-[0.12em] text-[#796C67]">
                  CATEGORY
                </span>
                <select
                  aria-label="Category"
                  className={selectClass}
                  value={s.category ?? ""}
                  onChange={(e) =>
                    updateSearch({
                      category: e.target.value || undefined,
                      page: 1,
                    })
                  }
                >
                  <option value="">All categories</option>
                  {cats.data?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute bottom-3 right-3 h-3.5 w-3.5 text-[#8A6B57]" />
              </label>

              <label className="relative block min-w-0">
                <span className="mb-1.5 block text-[9px] font-semibold tracking-[0.12em] text-[#796C67]">
                  AVAILABILITY
                </span>
                <select
                  aria-label="Purchase type"
                  className={selectClass}
                  value={s.type ?? "all"}
                  onChange={(e) =>
                    updateSearch({
                      type: e.target.value as
                        | "all"
                        | "BUY_ONLINE"
                        | "ENQUIRY_ONLY",
                      page: 1,
                    })
                  }
                >
                  <option value="all">All pieces</option>
                  <option value="BUY_ONLINE">Buy online</option>
                  <option value="ENQUIRY_ONLY">Enquiry only</option>
                </select>
                <ChevronDown className="pointer-events-none absolute bottom-3 right-3 h-3.5 w-3.5 text-[#8A6B57]" />
              </label>

              <label className="relative block min-w-0">
                <span className="mb-1.5 block text-[9px] font-semibold tracking-[0.12em] text-[#796C67]">
                  SORT BY
                </span>
                <select
                  aria-label="Sort products"
                  className={selectClass}
                  value={s.sort ?? "new"}
                  onChange={(e) =>
                    updateSearch({
                      sort: e.target.value as "new" | "low" | "high",
                      page: 1,
                    })
                  }
                >
                  <option value="new">Recommended</option>
                  <option value="low">Price: low to high</option>
                  <option value="high">Price: high to low</option>
                </select>
                <ChevronDown className="pointer-events-none absolute bottom-3 right-3 h-3.5 w-3.5 text-[#8A6B57]" />
              </label>

              <div className="flex items-end">
                <div className="flex h-10 w-full items-center justify-center gap-2 rounded-sm border border-[#E4DAD2] bg-[#F8F3EE] text-[10px] font-medium tracking-wide text-[#6E555B]">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  {hasFilters ? "FILTERS APPLIED" : "CURATED STYLES"}
                </div>
              </div>
            </div>

            {/* Active filter chips */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2 pb-4">
                {s.category && (
                  <button
                    type="button"
                    onClick={() =>
                      updateSearch({ category: undefined, page: 1 })
                    }
                    className="inline-flex items-center gap-2 rounded-full border border-[#E4DAD2] bg-[#F8F3EE] px-3 py-1.5 text-[10px] text-[#70263D]"
                  >
                    {cats.data?.find((c) => c.id === s.category)?.name ??
                      "Category"}
                    <X className="h-3 w-3" />
                  </button>
                )}

                {s.filter && (
                  <button
                    type="button"
                    onClick={() =>
                      updateSearch({ filter: undefined, page: 1 })
                    }
                    className="inline-flex items-center gap-2 rounded-full border border-[#E4DAD2] bg-[#F8F3EE] px-3 py-1.5 text-[10px] text-[#70263D]"
                  >
                    {s.filter === "new"
                      ? "New Arrivals"
                      : s.filter === "best"
                        ? "Best Sellers"
                        : "Featured"}
                    <X className="h-3 w-3" />
                  </button>
                )}

                {s.type && s.type !== "all" && (
                  <button
                    type="button"
                    onClick={() =>
                      updateSearch({ type: "all", page: 1 })
                    }
                    className="inline-flex items-center gap-2 rounded-full border border-[#E4DAD2] bg-[#F8F3EE] px-3 py-1.5 text-[10px] text-[#70263D]"
                  >
                    {s.type === "BUY_ONLINE" ? "Buy online" : "Enquiry only"}
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Product listing */}
          <section aria-label="Products" className="pt-3">
            {products.isLoading ? (
              <Loading />
            ) : products.error ? (
              <ErrorNote error={products.error} />
            ) : shown.length === 0 ? (
              <div className="border-y border-[#EEE6E0] py-14 text-center sm:py-20">
                <Empty title="No styles found">
                  Try another category or clear your filters to explore the
                  collection.
                </Empty>
                {hasFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-5 inline-flex items-center gap-2 rounded-sm bg-[#70263D] px-5 py-3 text-[10px] font-semibold tracking-wider text-white transition hover:bg-[#542030]"
                  >
                    EXPLORE ALL PRODUCTS
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-[10px] text-[#887B76] sm:text-xs">
                    Showing{" "}
                    <span className="font-semibold text-[#39232A]">
                      {(currentPage - 1) * PER_PAGE + 1}–
                      {Math.min(currentPage * PER_PAGE, filtered.length)}
                    </span>{" "}
                    of {filtered.length} styles
                  </p>
                  <p className="hidden text-[9px] tracking-[0.12em] text-[#887B76] sm:block">
                    DESIGNED FOR YOUR SPECIAL MOMENTS
                  </p>
                </div>

                <ProductGrid products={shown} />

                {pages > 1 && (
                  <nav
                    className="mt-10 flex flex-wrap items-center justify-center gap-2 border-t border-[#EEE6E0] pt-7 sm:mt-14 sm:pt-9"
                    aria-label="Pagination"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        updateSearch({ page: Math.max(1, currentPage - 1) })
                      }
                      disabled={currentPage === 1}
                      className="flex h-10 items-center gap-2 rounded-sm border border-[#E4DAD2] px-3 text-[10px] text-[#70263D] transition hover:border-[#70263D] disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                      <span className="hidden sm:inline">PREVIOUS</span>
                    </button>

                    {Array.from({ length: pages }, (_, i) => i + 1)
                      .filter(
                        (n) =>
                          n === 1 ||
                          n === pages ||
                          Math.abs(n - currentPage) <= 1,
                      )
                      .reduce<(number | "ellipsis")[]>(
                        (items, n, index, arr) => {
                          const previous = arr[index - 1];
                          if (
                            index > 0 &&
                            previous !== undefined &&
                            n - previous > 1
                          ) {
                            items.push("ellipsis");
                          }
                          items.push(n);
                          return items;
                        },
                        [],
                      )
                      .map((item, index) =>
                        item === "ellipsis" ? (
                          <span
                            key={`ellipsis-${index}`}
                            className="flex h-10 w-6 items-center justify-center text-[#887B76]"
                          >
                            …
                          </span>
                        ) : (
                          <button
                            key={item}
                            type="button"
                            onClick={() => updateSearch({ page: item })}
                            aria-current={
                              item === currentPage ? "page" : undefined
                            }
                            aria-label={`Go to page ${item}`}
                            className={`flex h-10 w-10 items-center justify-center rounded-sm border text-xs transition ${
                              item === currentPage
                                ? "border-[#70263D] bg-[#70263D] text-white"
                                : "border-[#E4DAD2] text-[#39232A] hover:border-[#70263D] hover:text-[#70263D]"
                            }`}
                          >
                            {item === currentPage ? (
                              <span className="flex items-center gap-1">
                                <Check className="h-3 w-3" />
                                {item}
                              </span>
                            ) : (
                              item
                            )}
                          </button>
                        ),
                      )}

                    <button
                      type="button"
                      onClick={() =>
                        updateSearch({
                          page: Math.min(pages, currentPage + 1),
                        })
                      }
                      disabled={currentPage === pages}
                      className="flex h-10 items-center gap-2 rounded-sm border border-[#E4DAD2] px-3 text-[10px] text-[#70263D] transition hover:border-[#70263D] disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <span className="hidden sm:inline">NEXT</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </nav>
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </SiteLayout>
  );
}
