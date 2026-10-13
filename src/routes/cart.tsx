
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Gift,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  X,
} from "lucide-react";

import { SiteLayout, Empty } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { getSettings } from "@/lib/api";
import { DEFAULT_SETTINGS, formatINR } from "@/lib/types";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/cart")({
  head: () => seo("Shopping Bag", "Review your selected styles at Sreeja's Bridal Boutique."),
  component: Cart,
});

function Cart() {
  const { items, setQty, remove, subtotal } = useCart();

  const { data: st = DEFAULT_SETTINGS } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

  const threshold = Math.max(0, st.freeShippingThreshold);
  const shipping = subtotal >= threshold ? 0 : st.defaultShippingFee;
  const total = subtotal + shipping;
  const remaining = Math.max(0, threshold - subtotal);
  const progress =
    threshold > 0 ? Math.min(100, (subtotal / threshold) * 100) : 100;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <SiteLayout>
      <main className="min-h-screen bg-[#FAF8F4] pb-12 text-[#39262C]">
        {/* Page heading */}
        <section className="border-b border-[#E9E0D6] bg-[#FFFEFC]">
          <div className="mx-auto max-w-7xl px-4 py-7 sm:px-7 sm:py-10 lg:px-8">
            <div className="flex items-center gap-2 text-[10px] font-medium tracking-[0.16em] text-[#8B7C75]">
              <Link to="/" className="transition hover:text-[#651E32]">
                HOME
              </Link>
              <span>/</span>
              <span className="text-[#651E32]">SHOPPING BAG</span>
            </div>

            <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="mb-1 text-[9px] font-semibold tracking-[0.24em] text-[#A07C4A] sm:text-[10px]">
                  YOUR SELECTION, BEAUTIFULLY CURATED
                </p>
                <h1 className="font-display text-3xl font-medium text-[#4A202D] sm:text-4xl lg:text-5xl">
                  Your Shopping Bag
                </h1>
              </div>

              {items.length > 0 && (
                <p className="pb-1 text-xs text-[#82736D]">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </p>
              )}
            </div>
          </div>
        </section>

        {items.length === 0 ? (
          <section className="mx-auto max-w-2xl px-4 py-14 sm:py-20">
            <div className="border border-[#E9E0D6] bg-[#FFFEFC] px-5 py-10 text-center sm:px-12 sm:py-14">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F4EDE6] text-[#651E32]">
                <ShoppingBag className="h-7 w-7" strokeWidth={1.4} />
              </div>

              <p className="mt-6 text-[9px] font-semibold tracking-[0.22em] text-[#A07C4A]">
                A LITTLE ROOM FOR SOMETHING BEAUTIFUL
              </p>
              <h2 className="mt-2 font-display text-3xl text-[#4A202D] sm:text-4xl">
                Your bag is waiting
              </h2>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#82736D]">
                Explore thoughtfully selected styles for celebrations,
                weddings, and all your special moments.
              </p>

              <Button
                asChild
                className="mt-7 h-12 rounded-sm bg-[#651E32] px-7 text-[10px] font-semibold tracking-[0.15em] text-white hover:bg-[#4B1726]"
              >
                <Link to="/shop">
                  EXPLORE THE COLLECTION
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-[#A07C4A]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>FIND SOMETHING THAT FEELS LIKE YOU</span>
              </div>
            </div>
          </section>
        ) : (
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-6 px-4 py-6 sm:px-7 sm:py-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8 lg:px-8">
            {/* Left column */}
            <section className="min-w-0 space-y-4">
              {/* Shipping progress */}
              <div className="border border-[#E9E0D6] bg-[#FFFEFC] p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3EDE5] text-[#8E6B3C]">
                    {shipping === 0 ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Truck className="h-4 w-4" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[#4A202D] sm:text-sm">
                      {shipping === 0
                        ? "You've unlocked free shipping!"
                        : `You're ${formatINR(remaining)} away from free shipping`}
                    </p>
                    <p className="mt-1 text-[10px] leading-5 text-[#82736D] sm:text-xs">
                      {shipping === 0
                        ? "A little something extra, on us."
                        : `Enjoy free shipping on orders above ${formatINR(threshold)}.`}
                    </p>

                    <div
                      className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#EDE5DB]"
                      role="progressbar"
                      aria-label="Progress towards free shipping"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(progress)}
                    >
                      <div
                        className="h-full rounded-full bg-[#8B6A3E] transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Cart items header */}
              <div className="flex items-center justify-between border-b border-[#E5DBD1] pb-3 pt-2">
                <h2 className="font-display text-2xl text-[#4A202D] sm:text-3xl">
                  Selected pieces
                </h2>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-1.5 text-[9px] font-semibold tracking-[0.1em] text-[#651E32] transition hover:text-[#A07C4A] sm:text-[10px]"
                >
                  CONTINUE SHOPPING
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Items */}
              <ul className="space-y-3">
                {items.map((item) => (
                  <li
                    key={item.variantId}
                    className="relative border border-[#E9E0D6] bg-[#FFFEFC] p-3 sm:p-5"
                  >
                    <div className="flex gap-3 sm:gap-5">
                      {/* Product image */}
                      <Link
                        to="/shop"
                        aria-label={`Continue shopping for ${item.name}`}
                        className="relative block aspect-[3/4] w-[104px] shrink-0 overflow-hidden bg-[#F2ECE4] sm:w-[144px]"
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            loading="lazy"
                            className="absolute inset-0 h-full w-full object-contain"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center px-2 text-center text-[9px] text-[#8B7C75]">
                            Image unavailable
                          </div>
                        )}
                      </Link>

                      {/* Product details */}
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="mb-1 text-[8px] font-semibold tracking-[0.16em] text-[#A07C4A] sm:text-[9px]">
                              SREEJA'S BRIDAL BOUTIQUE
                            </p>
                            <h3 className="break-words font-display text-lg leading-snug text-[#4A202D] sm:text-2xl">
                              {item.name}
                            </h3>
                          </div>

                          <button
                            type="button"
                            onClick={() => remove(item.variantId)}
                            aria-label={`Remove ${item.name} from bag`}
                            className="flex h-8 w-8 shrink-0 items-center justify-center text-[#8B7C75] transition hover:bg-[#F4EDE6] hover:text-[#651E32]"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        {(item.size || item.color) && (
                          <p className="mt-2 text-[10px] text-[#82736D] sm:text-xs">
                            {[
                              item.size ? `Size: ${item.size}` : "",
                              item.color ? `Colour: ${item.color}` : "",
                            ]
                              .filter(Boolean)
                              .join("  ·  ")}
                          </p>
                        )}

                        {item.sku && (
                          <p className="mt-1 text-[9px] text-[#9B8D85]">
                            Style code: {item.sku}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                          <span className="text-sm font-semibold text-[#651E32] sm:text-base">
                            {formatINR(item.price)}
                          </span>
                          <span className="text-[9px] text-[#82736D]">
                            per item
                          </span>
                        </div>

                        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                          <div className="inline-flex h-9 items-center border border-[#DED3C8] bg-white">
                            <button
                              type="button"
                              className="flex h-full w-9 items-center justify-center text-[#651E32] transition hover:bg-[#F4EDE6]"
                              aria-label={`Decrease quantity of ${item.name}`}
                              onClick={() =>
                                setQty(item.variantId, item.quantity - 1)
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </button>

                            <span
                              className="w-7 text-center text-xs font-medium tabular-nums"
                              aria-live="polite"
                            >
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              className="flex h-full w-9 items-center justify-center text-[#651E32] transition hover:bg-[#F4EDE6]"
                              aria-label={`Increase quantity of ${item.name}`}
                              onClick={() =>
                                setQty(item.variantId, item.quantity + 1)
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-[8px] tracking-[0.12em] text-[#82736D]">
                              ITEM TOTAL
                            </p>
                            <p className="mt-0.5 text-sm font-semibold text-[#4A202D] sm:text-base">
                              {formatINR(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Assurance strip */}
              <div className="grid grid-cols-1 gap-3 border border-[#E9E0D6] bg-[#F5F0E8] p-4 sm:grid-cols-2 sm:p-5">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-[#8E6B3C]" />
                  <div>
                    <p className="text-xs font-semibold text-[#4A202D]">
                      Boutique assistance
                    </p>
                    <p className="mt-1 text-[10px] text-[#82736D]">
                      We're here to help with your selection.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Gift className="h-5 w-5 shrink-0 text-[#8E6B3C]" />
                  <div>
                    <p className="text-xs font-semibold text-[#4A202D]">
                      Chosen for your moments
                    </p>
                    <p className="mt-1 text-[10px] text-[#82736D]">
                      Pieces to treasure and celebrate in.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Order summary */}
            <aside className="lg:sticky lg:top-28">
              <div className="border border-[#E4D9CE] bg-[#FFFEFC]">
                <div className="border-b border-[#E9E0D6] px-5 py-4 sm:px-6">
                  <p className="text-[9px] font-semibold tracking-[0.2em] text-[#A07C4A]">
                    ALMOST YOURS
                  </p>
                  <h2 className="mt-1 font-display text-2xl text-[#4A202D] sm:text-3xl">
                    Order Summary
                  </h2>
                </div>

                <div className="space-y-4 p-5 sm:p-6">
                  <div className="flex justify-between gap-3 text-xs">
                    <span className="text-[#82736D]">
                      Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
                    </span>
                    <span className="font-medium text-[#4A202D]">
                      {formatINR(subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3 text-xs">
                    <span className="text-[#82736D]">Shipping</span>
                    <span
                      className={
                        shipping === 0
                          ? "font-semibold text-[#55704B]"
                          : "font-medium text-[#4A202D]"
                      }
                    >
                      {shipping === 0 ? "FREE" : formatINR(shipping)}
                    </span>
                  </div>

                  {shipping > 0 && (
                    <p className="border-l-2 border-[#B08D57] bg-[#F7F1E9] px-3 py-2 text-[10px] leading-5 text-[#786B67]">
                      Add {formatINR(remaining)} more to your bag to unlock
                      free shipping.
                    </p>
                  )}

                  <div className="border-t border-dashed border-[#DCCFC1] pt-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[#4A202D]">
                          Estimated total
                        </p>
                        <p className="mt-1 text-[9px] text-[#82736D]">
                          Inclusive of listed product prices
                        </p>
                      </div>
                      <span className="text-xl font-semibold text-[#651E32]">
                        {formatINR(total)}
                      </span>
                    </div>
                  </div>

                  <Button
                    asChild
                    size="lg"
                    className="h-12 w-full rounded-sm bg-[#651E32] text-[10px] font-semibold tracking-[0.17em] text-white shadow-sm transition hover:bg-[#4B1726]"
                  >
                    <Link to="/checkout">
                      PROCEED TO CHECKOUT
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-[9px] text-[#82736D]">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#8E6B3C]" />
                    <span>Secure checkout experience</span>
                  </div>
                </div>
              </div>

              <Link
                to="/shop"
                className="mt-4 flex items-center justify-center gap-2 py-2 text-[10px] font-medium tracking-[0.08em] text-[#651E32] transition hover:text-[#A07C4A]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                DISCOVER MORE STYLES
              </Link>

              <div className="mt-5 flex items-center justify-center gap-2 border-t border-[#E5DBD1] pt-4 text-[9px] text-[#82736D]">
                <Heart className="h-3.5 w-3.5 text-[#A07C4A]" />
                <span>Made for your memorable moments</span>
              </div>
            </aside>
          </div>
        )}
      </main>
    </SiteLayout>
  );
}
