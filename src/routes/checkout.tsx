
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
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

  const { data: addresses = [] } = useQuery({
    queryKey: ["addresses", user!.uid],
    queryFn: () => listAddresses(user!.uid),
  });

  const [addrId, setAddrId] = useState<string>();
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [busy, setBusy] = useState(false);

  if (!cart.items.length) {
    return (
      <Empty title="Your bag is empty">
        <Link to="/shop" className="underline">
          Continue shopping
        </Link>
      </Empty>
    );
  }

  const selected = addresses.find(
    (a) => a.id === (addrId ?? addresses[0]?.id)
  );

  const sub = cart.subtotal;

  const discount =
    coupon && sub >= (coupon.minOrder ?? 0)
      ? Math.round(
          coupon.type === "PERCENT"
            ? (sub * coupon.value) / 100
            : Math.min(coupon.value, sub)
        )
      : 0;

  const shipping =
    sub - discount >= st.freeShippingThreshold
      ? 0
      : st.defaultShippingFee;

  const tax = Math.round(
    ((sub - discount) * (st.taxPercent ?? 0)) / 100
  );

  const total = sub - discount + shipping + tax;

  const apply = async () => {
    const c = await findCoupon(code).catch(() => null);

    if (!c) {
      return toast.error("This coupon is not valid");
    }

    if (!c.active) {
      return toast.error("This coupon is inactive");
    }

    if (c.expiresAt != null && c.expiresAt < Date.now()) {
      return toast.error("This coupon has expired");
    }

    if (sub < (c.minOrder ?? 0)) {
      return toast.error(
        `Minimum order ${formatINR(c.minOrder!)} for this coupon`
      );
    }

    setCoupon(c);
    toast.success("Coupon applied");
  };

  const place = async () => {
    if (!selected) {
      return toast.error("Please add a delivery address");
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
        }
      );

      if (
        !result.orderId ||
        result.paymentMethod !== "COD" ||
        result.paymentStatus !== "PENDING"
      ) {
        throw new Error(
          "The order response was unexpected. Please check your orders before retrying."
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
          : "Could not place your order"
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[1fr_360px] lg:px-8">
      <section>
        <h2 className="mb-4 font-display text-2xl">
          Delivery address
        </h2>

        <div
          className="mb-4 grid gap-3 sm:grid-cols-2"
          role="radiogroup"
          aria-label="Choose delivery address"
        >
          {addresses.map((address) => (
            <label
              key={address.id}
              className={`cursor-pointer border p-4 text-sm ${
                selected?.id === address.id
                  ? "border-primary ring-1 ring-primary"
                  : ""
              }`}
            >
              <input
                type="radio"
                name="addr"
                className="sr-only"
                checked={selected?.id === address.id}
                onChange={() => setAddrId(address.id)}
              />

              <p className="font-medium">{address.fullName}</p>
              <p>
                {address.line1}, {address.city} {address.pincode}
              </p>
              <p>{address.phone}</p>
            </label>
          ))}
        </div>

        <AddressForm
          onSaved={(address) => {
            qc.invalidateQueries({ queryKey: ["addresses"] });
            setAddrId(address.id);
          }}
        />
      </section>

      <aside className="h-fit space-y-3 border bg-card p-6 text-sm">
        <h2 className="font-display text-2xl">Order summary</h2>

        {cart.items.map((item) => (
          <div
            key={`${item.productId}-${item.variantId}`}
            className="flex justify-between gap-2"
          >
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>{formatINR(item.price * item.quantity)}</span>
          </div>
        ))}

        <div className="flex gap-2 pt-2">
          <Input
            placeholder="Coupon code"
            aria-label="Coupon code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />

          <Button
            variant="outline"
            onClick={apply}
            disabled={busy}
          >
            Apply
          </Button>
        </div>

        <div className="space-y-1 border-t pt-3">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatINR(sub)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-primary">
              <span>Discount ({coupon!.code})</span>
              <span>−{formatINR(discount)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{shipping ? formatINR(shipping) : "Free"}</span>
          </div>

          {tax > 0 && (
            <div className="flex justify-between">
              <span>Tax</span>
              <span>{formatINR(tax)}</span>
            </div>
          )}

          <div className="flex justify-between pt-2 text-base font-medium">
            <span>Total</span>
            <span>{formatINR(total)}</span>
          </div>
        </div>

        <div className="rounded-md border p-3">
          <p className="font-medium">Payment method</p>
          <p className="mt-1">Cash on Delivery (COD)</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Pay when your order is delivered. Online payments are coming soon.
          </p>
        </div>

        <Button
          size="lg"
          className="w-full tracking-widest"
          disabled={busy || !selected}
          onClick={place}
        >
          {busy ? "PLACING ORDER..." : "PLACE COD ORDER"}
        </Button>
      </aside>
    </div>
  );
}