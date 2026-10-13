import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock3,
  Package,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { SiteLayout, PageTitle, Loading, Empty } from "@/components/SiteLayout";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";
import { getOrder } from "@/lib/api";
import { formatINR, type OrderStatus } from "@/lib/types";
import { seo } from "@/lib/seo";

const STEPS: OrderStatus[] = [
  "PLACED",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

const STEP_LABELS: Record<OrderStatus, string> = {
  PLACED: "Order placed",
  CONFIRMED: "Confirmed",
  PROCESSING: "Preparing",
  SHIPPED: "On the way",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const Route = createFileRoute("/order/$id")({
  head: () => seo("Order Details", "Track your order status."),
  component: () => (
    <SiteLayout>
      <PageTitle title="Order Details" />
      <RequireAuth>
        <OrderView />
      </RequireAuth>
    </SiteLayout>
  ),
});

function OrderView() {
  const { id } = Route.useParams();

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrder(id),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[45vh] items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <Package className="mx-auto mb-5 h-10 w-10 text-[#8A6B45]" />
        <Empty title="Order not found">
          <p className="mb-5 text-sm text-[#756C65]">
            We couldn’t find this order. Please check the order link and try again.
          </p>
          <Button asChild className="bg-[#641F32] text-white hover:bg-[#4B1726]">
            <Link to="/shop">Continue shopping</Link>
          </Button>
        </Empty>
      </div>
    );
  }

  const currentStep = STEPS.indexOf(order.orderStatus);
  const cancelled = order.orderStatus === "CANCELLED";

  return (
    <main className="min-h-screen bg-[#FAF8F4] pb-20 text-[#29221F]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/shop"
          className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#756C65] transition-colors hover:text-[#641F32]"
        >
          <ArrowLeft className="h-4 w-4" />
          Continue shopping
        </Link>

        {/* Order confirmation */}
        <section className="relative mb-8 overflow-hidden border border-[#E8DED2] bg-white px-5 py-10 text-center sm:px-10 sm:py-12">
          <div className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full border border-[#C6A36A]/20" />
          <div className="pointer-events-none absolute -right-5 -top-7 h-32 w-32 rounded-full border border-[#C6A36A]/20" />

          <div className="relative mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[#C6A36A]/50 bg-[#FAF6EE]">
            {cancelled ? (
              <Package className="h-6 w-6 text-[#8B3948]" />
            ) : (
              <CheckCircle2 className="h-6 w-6 text-[#641F32]" />
            )}
          </div>

          <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-[#987849]">
            Sreeja’s Bridal Boutique
          </p>

          <h1 className="font-display text-3xl font-normal tracking-tight sm:text-4xl">
            {cancelled ? "Order cancelled" : "Thank you for your order"}
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#756C65]">
            {cancelled
              ? "This order has been cancelled. Please contact us if you need assistance."
              : "Your chosen pieces are one step closer to being yours. You can follow your order’s progress below."}
          </p>

          <div className="mt-7 inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-y border-[#E8DED2] py-3 text-xs">
            <span className="text-[#756C65]">ORDER REFERENCE</span>
            <span className="font-medium tracking-[0.12em] text-[#641F32]">
              #{order.id.slice(0, 8).toUpperCase()}
            </span>
            <span className="hidden text-[#D6C8B8] sm:inline">|</span>
            <span className="text-[#756C65]">PAYMENT</span>
            <span className="font-medium">{order.paymentStatus}</span>
          </div>
        </section>

        {/* Order progress */}
        {!cancelled && (
          <section className="mb-8 border border-[#E8DED2] bg-white p-5 sm:p-8">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center bg-[#F7F0E7]">
                <Truck className="h-5 w-5 text-[#641F32]" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-normal">
                  Order progress
                </h2>
                <p className="mt-1 text-xs text-[#8B8179]">
                  We’ll keep you informed as your order moves forward.
                </p>
              </div>
            </div>

            <ol className="grid grid-cols-5 gap-1 sm:gap-3">
              {STEPS.map((step, index) => {
                const completed = index <= currentStep;
                const active = index === currentStep;

                return (
                  <li key={step} className="relative min-w-0 text-center">
                    {index > 0 && (
                      <div
                        className={`absolute right-1/2 top-4 h-px w-full ${
                          index <= currentStep ? "bg-[#641F32]" : "bg-[#E8DED2]"
                        }`}
                      />
                    )}

                    <div className="relative z-10 mx-auto flex h-8 w-8 items-center justify-center rounded-full border text-xs transition-colors sm:h-9 sm:w-9">
                      {completed ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        index + 1
                      )}
                      <span className="sr-only">
                        {completed ? "Completed" : "Not completed"}
                      </span>
                    </div>

                    <p
                      className={`mt-3 break-words text-[9px] uppercase leading-4 tracking-[0.06em] sm:text-[10px] sm:tracking-[0.12em] ${
                        active
                          ? "font-semibold text-[#641F32]"
                          : completed
                            ? "text-[#51423B]"
                            : "text-[#A79C92]"
                      }`}
                    >
                      {STEP_LABELS[step]}
                    </p>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {/* Products and order information */}
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-8">
            <section className="border border-[#E8DED2] bg-white">
              <div className="flex items-center justify-between border-b border-[#E8DED2] px-5 py-5 sm:px-7">
                <div>
                  <p className="mb-1 text-[9px] uppercase tracking-[0.24em] text-[#987849]">
                    Your selection
                  </p>
                  <h2 className="font-display text-2xl font-normal">
                    Order items
                  </h2>
                </div>
                <span className="text-xs text-[#756C65]">
                  {order.items.length} {order.items.length === 1 ? "item" : "items"}
                </span>
              </div>

              <ul className="divide-y divide-[#EFE7DE] px-5 sm:px-7">
                {order.items.map((item) => (
                  <li
                    key={item.variantId}
                    className="flex gap-4 py-5 sm:gap-5"
                  >
                    <div className="flex h-28 w-20 shrink-0 items-center justify-center overflow-hidden bg-[#F7F3ED] sm:h-32 sm:w-24">
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        className="h-full w-full object-contain p-1"
                      />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-center">
                      <h3 className="font-display text-lg leading-snug sm:text-xl">
                        {item.name}
                      </h3>

                      <p className="mt-2 text-xs leading-5 text-[#756C65]">
                        {[item.size, item.color].filter(Boolean).join(" · ")}
                      </p>

                      <p className="mt-1 text-xs text-[#756C65]">
                        Quantity: {item.quantity}
                      </p>

                      <p className="mt-3 text-sm font-medium text-[#641F32]">
                        {formatINR(item.price * item.quantity)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* Delivery address */}
            <section className="border border-[#E8DED2] bg-white p-5 sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center bg-[#F7F0E7]">
                  <Truck className="h-5 w-5 text-[#641F32]" />
                </div>
                <div>
                  <p className="mb-1 text-[9px] uppercase tracking-[0.22em] text-[#987849]">
                    Delivery details
                  </p>
                  <h2 className="font-display text-2xl font-normal">
                    Shipping address
                  </h2>
                </div>
              </div>

              <div className="border-l-2 border-[#C6A36A] pl-4 text-sm leading-6">
                <p className="font-medium">{order.shippingAddress.fullName}</p>
                <p className="mt-1 text-[#756C65]">
                  {order.shippingAddress.line1}
                </p>
                <p className="text-[#756C65]">
                  {order.shippingAddress.city}, {order.shippingAddress.pincode}
                </p>
                {order.shippingAddress.phone && (
                  <p className="mt-2 text-xs text-[#756C65]">
                    Phone: {order.shippingAddress.phone}
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* Price summary */}
          <aside className="border border-[#E8DED2] bg-white lg:sticky lg:top-28">
            <div className="border-b border-[#E8DED2] px-6 py-5">
              <p className="mb-1 text-[9px] uppercase tracking-[0.24em] text-[#987849]">
                A little luxury
              </p>
              <h2 className="font-display text-2xl font-normal">
                Price summary
              </h2>
            </div>

            <div className="space-y-4 px-6 py-6 text-sm">
              <SummaryRow label="Subtotal" value={order.subtotal} />

              {order.discount > 0 && (
                <SummaryRow
                  label={`Discount${order.couponCode ? ` (${order.couponCode})` : ""}`}
                  value={-order.discount}
                  highlight
                />
              )}

              <SummaryRow label="Shipping" value={order.shipping} freeLabel />
              {order.tax > 0 && <SummaryRow label="Tax" value={order.tax} />}

              <div className="border-t border-[#E8DED2] pt-4">
                <div className="flex items-end justify-between gap-3">
                  <span className="text-xs uppercase tracking-[0.12em]">
                    Total paid / due
                  </span>
                  <span className="font-display text-2xl text-[#641F32]">
                    {formatINR(order.total)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 border border-[#E8DED2] bg-[#FAF8F4] p-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#987849]" />
                <p className="text-xs leading-5 text-[#756C65]">
                  Your order details and final total are recorded securely.
                </p>
              </div>

              {order.orderStatus !== "DELIVERED" && !cancelled && (
                <div className="flex gap-3 border border-[#E8DED2] p-3">
                  <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[#987849]" />
                  <p className="text-xs leading-5 text-[#756C65]">
                    Current status:{" "}
                    <span className="font-medium text-[#641F32]">
                      {STEP_LABELS[order.orderStatus] ?? order.orderStatus}
                    </span>
                  </p>
                </div>
              )}

              <Button
                asChild
                className="h-12 w-full rounded-none bg-[#641F32] text-xs tracking-[0.18em] text-white hover:bg-[#4B1726]"
              >
                <Link to="/shop">
                  EXPLORE THE COLLECTION
                </Link>
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function SummaryRow({
  label,
  value,
  highlight = false,
  freeLabel = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
  freeLabel?: boolean;
}) {
  return (
    <div className={`flex justify-between gap-4 ${highlight ? "text-[#641F32]" : "text-[#756C65]"}`}>
      <span>{label}</span>
      <span className={highlight ? "font-medium" : ""}>
        {freeLabel && value === 0 ? "Free" : formatINR(value)}
      </span>
    </div>
  );
}
