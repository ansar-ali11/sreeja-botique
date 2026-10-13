
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  CreditCard,
  Gift,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Truck,
  X,
} from "lucide-react";

import { SiteLayout, PageTitle, Empty } from "@/components/SiteLayout";
import { RequireAuth } from "@/components/RequireAuth";
import { AddressForm } from "@/components/shop/AddressForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { findCoupon, getSettings, listAddresses } from "@/lib/api";
import { backendRequest } from "@/lib/backend";
import { DEFAULT_SETTINGS, formatINR, type Coupon } from "@/lib/types";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/checkout")({
  head: () => seo("Checkout", "Complete your order securely."),
  component: () => (
    <SiteLayout>
      <PageTitle title="Checkout" />
      <RequireAuth>
        <Checkout />
      </RequireAuth>
    </SiteLayout>
  ),
});

interface CreateOrderResult {
  orderId: string;
  total: number;
  paymentMethod: "COD";
  paymentStatus: "PENDING";
}

function Checkout() {
  const { user } = useAuth();
  const cart = useCart();
  const nav = useNavigate();
  const qc = useQueryClient();

  const { data: st = DEFAULT_SETTINGS } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

  const { data: addresses = [], isLoading: addressesLoading } = useQuery({
    queryKey: ["addresses", user!.uid],
    queryFn: () => listAddresses(user!.uid),
  });

  const [addrId, setAddrId] = useState<string>();
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [busy, setBusy] = useState(false);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  if (!cart.items.length) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Empty title="Your bag is empty">
          <Link
            to="/shop"
            className="font-medium text-[#651E32] underline underline-offset-4"
          >
            Continue shopping
          </Link>
        </Empty>
      </div>
    );
  }

  const selected = addresses.find(
    (address) => address.id === (addrId ?? addresses[0]?.id),
  );

  const sub = cart.subtotal;

  const discount =
    coupon && sub >= (coupon.minOrder ?? 0)
      ? Math.round(
          coupon.type === "PERCENT"
            ? (sub * coupon.value) / 100
            : Math.min(coupon.value, sub),
        )
      : 0;

  const shipping =
    sub - discount >= st.freeShippingThreshold
      ? 0
      : st.defaultShippingFee;

  const tax = Math.round(
    ((sub - discount) * (st.taxPercent ?? 0)) / 100,
  );

  const total = sub - discount + shipping + tax;
  const itemCount = cart.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  const apply = async () => {
    const normalizedCode = code.trim();

    if (!normalizedCode) {
      toast.error("Please enter a coupon code");
      return;
    }

    if (applyingCoupon || busy) return;

    setApplyingCoupon(true);

    try {
      const c = await findCoupon(normalizedCode).catch(() => null);

      if (!c) {
        setCoupon(null);
        toast.error("This coupon is not valid");
        return;
      }

      if (!c.active) {
        setCoupon(null);
        toast.error("This coupon is inactive");
        return;
      }

      if (c.expiresAt != null && c.expiresAt < Date.now()) {
        setCoupon(null);
        toast.error("This coupon has expired");
        return;
      }

      if (sub < (c.minOrder ?? 0)) {
        setCoupon(null);
        toast.error(
          `Minimum order ${formatINR(c.minOrder!)} for this coupon`,
        );
        return;
      }

      setCoupon(c);
      setCode(c.code);
      toast.success("Coupon applied successfully");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCode("");
    toast.success("Coupon removed");
  };

  const place = async () => {
    if (!selected) {
      toast.error("Please add a delivery address");
      return;
    }

    if (busy) return;

    setBusy(true);

    try {
      const result = await backendRequest<CreateOrderResult>(
        "/api/orders/cod",
        {
          items: cart.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
          address: selected,
          couponCode: coupon?.code,
        },
      );

      if (
        !result.orderId ||
        result.paymentMethod !== "COD" ||
        result.paymentStatus !== "PENDING"
      ) {
        throw new Error(
          "The order response was unexpected. Please check your orders before retrying.",
        );
      }

      cart.clear();

      await qc.invalidateQueries({ queryKey: ["myOrders"] });

      await nav({
        to: "/order/$id",
        params: { id: result.orderId },
      });

      toast.success("COD order placed successfully!");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not place your order",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF8F4] pb-12 text-[#39262C]">
      {/* Checkout heading */}
      <section className="border-b border-[#E9E0D6] bg-[#FFFEFC]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-7 sm:py-8 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[9px] font-semibold tracking-[0.22em] text-[#A07C4A]">
                ALMOST YOURS
              </p>
              <h1 className="mt-1 font-display text-3xl text-[#4A202D] sm:text-4xl">
                Secure Checkout
              </h1>
              <p className="mt-2 text-xs text-[#82736D]">
                Review your details before placing your order.
              </p>
            </div>

            <div className="hidden items-center gap-3 sm:flex">
              <div className="flex items-center gap-2 text-[10px] font-medium text-[#55704B]">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E9EFE4]">
                  <Check className="h-3.5 w-3.5" />
                </span>
                BAG
              </div>
              <div className="h-px w-8 bg-[#DCCFC1]" />
              <div className="flex items-center gap-2 text-[10px] font-semibold text-[#651E32]">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#651E32] text-white">
                  2
                </span>
                CHECKOUT
              </div>
              <div className="h-px w-8 bg-[#DCCFC1]" />
              <div className="flex items-center gap-2 text-[10px] text-[#9B8D85]">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#DCCFC1]">
                  3
                </span>
                ORDER
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-6 px-4 py-6 sm:px-7 sm:py-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8 lg:px-8">
        {/* Delivery and payment */}
        <section className="min-w-0 space-y-5">
          {/* Address section */}
          <div className="border border-[#E9E0D6] bg-[#FFFEFC]">
            <div className="flex items-center gap-3 border-b border-[#E9E0D6] px-4 py-4 sm:px-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F4EDE6] text-[#8E6B3C]">
                <MapPin className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="font-display text-2xl text-[#4A202D]">
                  Delivery address
                </h2>
                <p className="mt-0.5 text-[10px] text-[#82736D]">
                  Where should we send your order?
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {addressesLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-24 bg-[#F3EEE7]" />
                  <div className="h-24 bg-[#F3EEE7]" />
                </div>
              ) : addresses.length > 0 ? (
                <div
                  className="grid gap-3 sm:grid-cols-2"
                  role="radiogroup"
                  aria-label="Choose delivery address"
                >
                  {addresses.map((address) => {
                    const active = selected?.id === address.id;

                    return (
                      <label
                        key={address.id}
                        className={`relative cursor-pointer border p-4 transition-all duration-200 ${
                          active
                            ? "border-[#651E32] bg-[#FBF6F1] ring-1 ring-[#651E32]"
                            : "border-[#E5DBD1] hover:border-[#B08D57]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="addr"
                          className="sr-only"
                          checked={active}
                          onChange={() => setAddrId(address.id)}
                        />

                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                                active
                                  ? "border-[#651E32]"
                                  : "border-[#CFC2B7]"
                              }`}
                            >
                              {active && (
                                <span className="h-2 w-2 rounded-full bg-[#651E32]" />
                              )}
                            </span>
                            <span className="text-[9px] font-semibold tracking-[0.13em] text-[#A07C4A]">
                              DELIVERY ADDRESS
                            </span>
                          </div>

                          {active && (
                            <Check className="h-4 w-4 text-[#651E32]" />
                          )}
                        </div>

                        <p className="mt-3 break-words text-sm font-semibold text-[#4A202D]">
                          {address.fullName}
                        </p>
                        <p className="mt-1 break-words text-xs leading-5 text-[#82736D]">
                          {address.line1}, {address.city} {address.pincode}
                        </p>
                        <p className="mt-2 text-xs text-[#4A202D]">
                          {address.phone}
                        </p>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="border border-dashed border-[#DCCFC1] bg-[#FBF8F4] px-4 py-6 text-center">
                  <MapPin className="mx-auto h-6 w-6 text-[#A07C4A]" />
                  <p className="mt-3 text-sm font-medium text-[#4A202D]">
                    Add a delivery address
                  </p>
                  <p className="mt-1 text-xs text-[#82736D]">
                    We need an address to deliver your order.
                  </p>
                </div>
              )}

              <div className="mt-5 border-t border-[#EEE5DC] pt-5">
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-semibold text-[#651E32]">
                    <span className="inline-flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      ADD A NEW DELIVERY ADDRESS
                    </span>
                    <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                  </summary>

                  <div className="pt-4">
                    <AddressForm
                      onSaved={(address) => {
                        void qc.invalidateQueries({
                          queryKey: ["addresses"],
                        });
                        setAddrId(address.id);
                        toast.success("Delivery address saved");
                      }}
                    />
                  </div>
                </details>
              </div>
            </div>
          </div>

          {/* Payment section */}
          <div className="border border-[#E9E0D6] bg-[#FFFEFC]">
            <div className="flex items-center gap-3 border-b border-[#E9E0D6] px-4 py-4 sm:px-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F4EDE6] text-[#8E6B3C]">
                <CreditCard className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="font-display text-2xl text-[#4A202D]">
                  Payment method
                </h2>
                <p className="mt-0.5 text-[10px] text-[#82736D]">
                  Choose how you would like to pay.
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="flex items-start gap-3 border border-[#651E32] bg-[#FBF6F1] p-4">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[#651E32]">
                  <span className="h-2 w-2 rounded-full bg-[#651E32]" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[#4A202D]">
                      Cash on Delivery
                    </p>
                    <span className="bg-[#E9EFE4] px-2 py-1 text-[8px] font-semibold tracking-[0.1em] text-[#55704B]">
                      AVAILABLE
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-[#82736D]">
                    Pay when your order arrives at your doorstep.
                  </p>
                  <p className="mt-3 inline-flex items-center gap-1.5 text-[10px] text-[#55704B]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    No online payment required for this order
                  </p>
                </div>
              </div>

              <p className="mt-3 text-[10px] leading-5 text-[#82736D]">
                Online payments are not available yet. We will use Cash on
                Delivery for this order.
              </p>
            </div>
          </div>

          {/* Back to bag */}
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 py-2 text-[10px] font-semibold tracking-[0.12em] text-[#651E32] transition hover:text-[#A07C4A]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            RETURN TO SHOPPING BAG
          </Link>
        </section>

        {/* Order summary */}
        <aside className="min-w-0 lg:sticky lg:top-24">
          <div className="border border-[#E4D9CE] bg-[#FFFEFC]">
            <div className="border-b border-[#E9E0D6] px-5 py-4 sm:px-6">
              <p className="text-[9px] font-semibold tracking-[0.2em] text-[#A07C4A]">
                YOUR SELECTION
              </p>
              <h2 className="mt-1 font-display text-2xl text-[#4A202D] sm:text-3xl">
                Order summary
              </h2>
              <p className="mt-1 text-[10px] text-[#82736D]">
                {itemCount} {itemCount === 1 ? "item" : "items"} in your bag
              </p>
            </div>

            <div className="space-y-4 p-5 sm:p-6">
              {/* Items */}
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantId}`}
                    className="flex min-w-0 gap-3"
                  >
                    <div className="relative h-[82px] w-[64px] shrink-0 overflow-hidden bg-[#F2ECE4]">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-contain"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[8px] text-[#82736D]">
                          No image
                        </div>
                      )}
                      <span className="absolute bottom-1 right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[9px] font-semibold text-[#651E32] shadow-sm">
                        {item.quantity}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="break-words text-xs font-medium leading-5 text-[#4A202D]">
                        {item.name}
                      </p>
                      {(item.size || item.color) && (
                        <p className="mt-1 break-words text-[9px] text-[#82736D]">
                          {[item.size, item.color].filter(Boolean).join(" · ")}
                        </p>
                      )}
                      <p className="mt-2 text-xs font-semibold text-[#651E32]">
                        {formatINR(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="border-y border-[#E9E0D6] py-4">
                <div className="mb-3 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-[#A07C4A]" />
                  <p className="text-xs font-semibold text-[#4A202D]">
                    Apply a coupon
                  </p>
                </div>

                {coupon && discount > 0 ? (
                  <div className="flex items-center justify-between gap-3 border border-[#C9D7C0] bg-[#F1F5ED] p-3">
                    <div className="min-w-0">
                      <p className="break-all text-xs font-semibold text-[#55704B]">
                        {coupon.code}
                      </p>
                      <p className="mt-1 text-[10px] text-[#55704B]">
                        You saved {formatINR(discount)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      disabled={busy}
                      className="flex h-8 w-8 shrink-0 items-center justify-center text-[#55704B] hover:bg-white"
                      aria-label="Remove coupon"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      aria-label="Coupon code"
                      value={code}
                      disabled={busy || applyingCoupon}
                      onChange={(event) => setCode(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          void apply();
                        }
                      }}
                      className="h-10 min-w-0 rounded-sm border-[#DED3C8] bg-white text-xs uppercase placeholder:normal-case"
                    />
                    <Button
                      variant="outline"
                      onClick={() => void apply()}
                      disabled={busy || applyingCoupon}
                      className="h-10 rounded-sm border-[#651E32] px-4 text-[9px] font-semibold tracking-[0.08em] text-[#651E32] hover:bg-[#FBF6F1]"
                    >
                      {applyingCoupon ? "CHECKING..." : "APPLY"}
                    </Button>
                  </div>
                )}
              </div>

              {/* Price breakdown */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between gap-3">
                  <span className="text-[#82736D]">Subtotal</span>
                  <span className="font-medium text-[#4A202D]">
                    {formatINR(sub)}
                  </span>
                </div>

                {discount > 0 && coupon && (
                  <div className="flex justify-between gap-3 text-[#55704B]">
                    <span>Discount ({coupon.code})</span>
                    <span className="font-medium">
                      −{formatINR(discount)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between gap-3">
                  <span className="text-[#82736D]">Shipping</span>
                  <span
                    className={
                      shipping === 0
                        ? "font-semibold text-[#55704B]"
                        : "font-medium text-[#4A202D]"
                    }
                  >
                    {shipping ? formatINR(shipping) : "FREE"}
                  </span>
                </div>

                {tax > 0 && (
                  <div className="flex justify-between gap-3">
                    <span className="text-[#82736D]">
                      Tax ({st.taxPercent ?? 0}%)
                    </span>
                    <span className="font-medium text-[#4A202D]">
                      {formatINR(tax)}
                    </span>
                  </div>
                )}
              </div>

              <div className="border-t border-dashed border-[#DCCFC1] pt-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#4A202D]">
                      Total payable
                    </p>
                    <p className="mt-1 text-[9px] text-[#82736D]">
                      Cash on Delivery
                    </p>
                  </div>
                  <span className="text-xl font-semibold text-[#651E32]">
                    {formatINR(total)}
                  </span>
                </div>
              </div>

              <Button
                size="lg"
                className="h-12 w-full rounded-sm bg-[#651E32] text-[10px] font-semibold tracking-[0.15em] text-white shadow-sm transition hover:bg-[#4B1726]"
                disabled={busy || !selected || addressesLoading}
                onClick={() => void place()}
              >
                {busy ? (
                  "PLACING YOUR ORDER..."
                ) : (
                  <>
                    PLACE COD ORDER
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              {!selected && !addressesLoading && (
                <p className="text-center text-[10px] leading-5 text-[#A23B42]">
                  Add or select a delivery address to continue.
                </p>
              )}

              <div className="flex items-start justify-center gap-2 border-t border-[#EEE5DC] pt-4 text-[9px] leading-5 text-[#82736D]">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#A07C4A]" />
                <span>
                  Your order is submitted securely through our store's
                  checkout service.
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-[9px] text-[#82736D]">
            <Gift className="h-3.5 w-3.5 text-[#A07C4A]" />
            <span>Chosen with care, made for your special moments</span>
          </div>
        </aside>
      </div>
    </main>
  );
}
