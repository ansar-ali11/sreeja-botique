
import { Link } from "@tanstack/react-router";
import { ArrowRight, Heart, Sparkles } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatINR, type Product } from "@/lib/types";

export function ProductCard({ p }: { p: Product }) {
  const { wishlist, toggleWish } = useCart();

  const wished = wishlist.includes(p.id);
  const sale = Boolean(p.discountPrice && p.discountPrice < p.price);
  const displayedPrice = sale ? p.discountPrice! : p.price;

  const outOfStock =
    p.productType === "BUY_ONLINE" &&
    p.variants.length > 0 &&
    p.variants.every((v) => v.stock <= 0);

  const discount = sale
    ? Math.round(((p.price - displayedPrice) / p.price) * 100)
    : 0;

  return (
    <article className="group min-w-0">
      {/* Product image */}
      <div className="relative overflow-hidden bg-[#F5F0EA]">
        <Link
          to="/product/$slug"
          params={{ slug: p.slug }}
          aria-label={`View ${p.name}`}
          className="block"
        >
          <div className="relative aspect-[3/4] overflow-hidden">
            {p.images?.[0] ? (
              <img
                src={p.images[0]}
                alt={p.name}
                loading="lazy"
                className={`h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035] ${
                  outOfStock ? "opacity-65" : ""
                }`}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-[#8A796D]">
                <Sparkles className="h-7 w-7 text-[#B08D57]" />
                <span className="text-[9px] tracking-[0.16em]">
                  IMAGE COMING SOON
                </span>
              </div>
            )}

            {/* Product badges */}
            <div className="absolute left-2 top-2 flex max-w-[75%] flex-col items-start gap-1.5 sm:left-3 sm:top-3">
              {p.newArrival && (
                <span className="bg-white/95 px-2 py-1 text-[8px] font-semibold tracking-[0.1em] text-[#651E32] shadow-sm sm:text-[9px]">
                  NEW
                </span>
              )}

              {p.bestSeller && (
                <span className="bg-[#F0E2C8] px-2 py-1 text-[8px] font-semibold tracking-[0.1em] text-[#61452B] sm:text-[9px]">
                  BESTSELLER
                </span>
              )}

              {p.productType === "ENQUIRY_ONLY" && (
                <span className="bg-[#651E32] px-2 py-1 text-[8px] font-semibold tracking-[0.1em] text-white sm:text-[9px]">
                  ENQUIRY
                </span>
              )}
            </div>

            {outOfStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/25">
                <span className="bg-white/95 px-3 py-2 text-[9px] font-semibold tracking-[0.15em] text-[#651E32] shadow-sm">
                  SOLD OUT
                </span>
              </div>
            )}
          </div>
        </Link>

        {/* Independent wishlist button */}
        <button
          type="button"
          onClick={() => toggleWish(p.id)}
          aria-label={
            wished
              ? `Remove ${p.name} from wishlist`
              : `Add ${p.name} to wishlist`
          }
          aria-pressed={wished}
          className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#651E32] shadow-sm transition-transform duration-200 hover:scale-105 sm:right-3 sm:top-3 sm:h-10 sm:w-10"
        >
          <Heart
            className={`h-[17px] w-[17px] ${
              wished ? "fill-[#651E32] text-[#651E32]" : ""
            }`}
            strokeWidth={1.7}
          />
        </button>

        {/* Desktop quick-discovery link */}
        {!outOfStock && (
          <Link
            to="/product/$slug"
            params={{ slug: p.slug }}
            className="absolute bottom-0 left-0 right-0 hidden translate-y-full items-center justify-center gap-2 bg-white/95 px-3 py-3 text-[10px] font-semibold tracking-wide text-[#651E32] transition-transform duration-300 group-hover:translate-y-0 group-focus-within:translate-y-0 sm:flex"
          >
            VIEW PRODUCT
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* Product details */}
      <div className="px-0.5 pt-3 sm:pt-3.5">
        <Link
          to="/product/$slug"
          params={{ slug: p.slug }}
          className="block"
        >
          <h3 className="line-clamp-2 min-h-[2.5rem] text-[12px] font-semibold leading-5 text-[#30252A] transition-colors group-hover:text-[#8B3049] sm:text-sm">
            {p.name}
          </h3>
        </Link>

        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
          <span className="text-[12px] font-bold text-[#30252A] sm:text-sm">
            {formatINR(displayedPrice)}
          </span>

          {sale && (
            <>
              <span className="text-[10px] text-[#8A817D] line-through sm:text-xs">
                {formatINR(p.price)}
              </span>
              {discount > 0 && (
                <span className="text-[9px] font-medium text-[#A17B43] sm:text-[10px]">
                  ({discount}% OFF)
                </span>
              )}
            </>
          )}
        </div>

        {outOfStock ? (
          <p className="mt-1.5 text-[9px] font-medium text-[#8A796D]">
            Currently unavailable
          </p>
        ) : p.productType === "ENQUIRY_ONLY" ? (
          <Link
            to="/product/$slug"
            params={{ slug: p.slug }}
            className="mt-2 inline-flex items-center gap-1 border-b border-[#B08D57]/60 pb-0.5 text-[9px] font-semibold text-[#651E32] hover:border-[#651E32] sm:text-[10px]"
          >
            ASK FOR DETAILS
            <ArrowRight className="h-3 w-3" />
          </Link>
        ) : (
          <p className="mt-1.5 text-[9px] text-[#8A817D]">
            Elegant style for every occasion
          </p>
        )}
      </div>
    </article>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-5 py-16 text-center sm:py-20">
        <Sparkles className="mb-4 h-8 w-8 text-[#B08D57]" />
        <h2 className="font-display text-3xl text-[#40212A]">
          No styles found
        </h2>
        <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
          Try another search or explore the full collection.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-flex items-center gap-2 bg-[#651E32] px-6 py-3 text-[10px] font-semibold tracking-[0.12em] text-white transition-colors hover:bg-[#4B1726]"
        >
          EXPLORE COLLECTION
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 sm:gap-y-9 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10 xl:grid-cols-5">
      {products.map((p) => (
        <ProductCard key={p.id} p={p} />
      ))}
    </div>
  );
}
