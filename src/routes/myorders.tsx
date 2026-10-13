import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Heart,
  Instagram,
  Mail,
  Package,
  RefreshCw,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth";
import { listMyOrders } from "@/lib/api";
import { formatINR, type OrderStatus } from "@/lib/types";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/myorders")({
  head: () => seo("My Orders", "View your order history."),
  component: () => (
    <RequireAuth>
      <MyOrders />
    </RequireAuth>
  ),
});

const STATUS_STYLES: Record<OrderStatus, string> = {
  PLACED: "border-[#D9C49C] bg-[#FBF5E8] text-[#85652D]",
  CONFIRMED: "border-[#D9C49C] bg-[#FBF5E8] text-[#85652D]",
  PROCESSING: "border-[#D9C49C] bg-[#FBF5E8] text-[#85652D]",
  SHIPPED: "border-[#C8D9E8] bg-[#F0F6FA] text-[#426785]",
  DELIVERED: "border-[#C6D9C7] bg-[#F0F7F0] text-[#456B49]",
  CANCELLED: "border-[#E5C6C6] bg-[#FCF0F0] text-[#963E47]",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  PLACED: "Order placed",
  CONFIRMED: "Confirmed",
  PROCESSING: "Being prepared",
  SHIPPED: "On the way",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

function MyOrders() {
  const { user } = useAuth();

  const {
    data: orders = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["myOrders", user?.uid],
    queryFn: () => {
      if (!user?.uid) {
        throw new Error("Please sign in to view your orders.");
      }
      return listMyOrders(user.uid);
    },
    enabled: !!user?.uid,
  });

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#29221F]">
      <div className="bg-[#641F32] px-4 py-2 text-center text-[9px] uppercase tracking-[0.22em] text-[#F5E9D3] sm:text-[10px]">
        Timeless elegance, crafted for your special moments
      </div>

      <header className="sticky top-0 z-40 border-b border-[#E8DED2] bg-[#FAF8F4]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="min-w-0 leading-tight" aria-label="Home">
            <span className="block font-display text-xl tracking-wide text-[#641F32] sm:text-2xl">
              Sreeja’s
            </span>
            <span className="mt-1 block text-[8px] uppercase tracking-[0.3em] text-[#987849] sm:text-[9px]">
              Bridal Boutique
            </span>
          </Link>

          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-7 md:flex"
          >
            <Link
              to="/"
              className="text-[10px] uppercase tracking-[0.16em] text-[#756C65] hover:text-[#641F32]"
            >
              Home
            </Link>
            <Link
              to="/shop"
              className="text-[10px] uppercase tracking-[0.16em] text-[#756C65] hover:text-[#641F32]"
            >
              Collections
            </Link>
            <Link
              to="/myorders"
              className="border-b border-[#987849] pb-1 text-[10px] uppercase tracking-[0.16em] text-[#641F32]"
            >
              My Orders
            </Link>
          </nav>

          <Link
            to="/shop"
            className="inline-flex h-10 shrink-0 items-center gap-2 bg-[#641F32] px-3 text-[9px] uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#4B1726] sm:px-5 sm:text-[10px] sm:tracking-[0.14em]"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Shop now
          </Link>
        </div>
      </header>

      <main className="min-h-[65vh] pb-20">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <section className="relative mb-9 overflow-hidden border border-[#E8DED2] bg-white px-5 py-9 sm:px-9 sm:py-11">
            <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full border border-[#C6A36A]/20" />
            <div className="pointer-events-none absolute -right-5 -top-9 h-40 w-40 rounded-full border border-[#C6A36A]/20" />

            <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-[#987849]">
                  Your personal collection
                </p>
                <h1 className="font-display text-4xl font-normal tracking-tight sm:text-5xl">
                  Your Orders
                </h1>
                <p className="mt-3 max-w-md text-sm leading-6 text-[#756C65]">
                  Every special piece, all in one place. Follow your orders
                  from confirmation to delivery.
                </p>
              </div>

              <Link
                to="/shop"
                className="inline-flex w-fit items-center gap-2 border-b border-[#C6A36A] pb-2 text-xs uppercase tracking-[0.14em] text-[#641F32] hover:text-[#987849]"
              >
                Discover the collection
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          {isLoading ? (
            <OrdersLoading />
          ) : isError ? (
            <section className="border border-[#E8DED2] bg-white px-5 py-14 text-center sm:px-8">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#F7F0E7]">
                <Package className="h-6 w-6 text-[#641F32]" />
              </div>
              <h2 className="font-display text-2xl">
                We couldn’t load your orders
              </h2>
              <p className="mx-auto mt-2 max-w-md break-words text-sm leading-6 text-[#756C65]">
                {error instanceof Error
                  ? error.message
                  : "Something went wrong while retrieving your order history."}
              </p>
              <button
                type="button"
                onClick={() => void refetch()}
                disabled={isFetching}
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 bg-[#641F32] px-6 text-xs uppercase tracking-[0.15em] text-white hover:bg-[#4B1726] disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
                />
                Try again
              </button>
            </section>
          ) : orders.length === 0 ? (
            <section className="border border-[#E8DED2] bg-white px-5 py-14 text-center sm:px-8 sm:py-20">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#E8DED2] bg-[#FAF8F4]">
                <ShoppingBag className="h-7 w-7 text-[#987849]" />
              </div>
              <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-[#987849]">
                A world of beautiful details awaits
              </p>
              <h2 className="font-display text-3xl font-normal sm:text-4xl">
                Your story starts here
              </h2>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#756C65]">
                You haven’t placed any orders yet. Explore our collection and
                find something made for your special moments.
              </p>
              <Link
                to="/shop"
                className="mt-7 inline-flex h-12 items-center justify-center gap-3 bg-[#641F32] px-7 text-xs tracking-[0.16em] text-white hover:bg-[#4B1726]"
              >
                EXPLORE THE COLLECTION
                <ArrowRight className="h-4 w-4" />
              </Link>
            </section>
          ) : (
            <>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-2xl">Order history</p>
                  <p className="mt-1 text-xs text-[#8B8179]">
                    Your purchases and delivery updates
                  </p>
                </div>

                <div className="border border-[#E8DED2] bg-white px-4 py-2 text-xs text-[#756C65]">
                  <span className="font-medium text-[#641F32]">
                    {orders.length}
                  </span>{" "}
                  {orders.length === 1 ? "order" : "orders"}
                </div>
              </div>

              <div className="space-y-5">
                {orders.map((order) => {
                  const status = order.orderStatus;
                  const statusClass =
                    STATUS_STYLES[status] ??
                    "border-[#E8DED2] bg-[#FAF8F4] text-[#756C65]";
                  const statusLabel = STATUS_LABELS[status] ?? status;
                  const itemCount = order.items.reduce(
                    (total, item) => total + item.quantity,
                    0,
                  );

                  return (
                    <article
                      key={order.id}
                      className="group border border-[#E8DED2] bg-white transition-shadow duration-300 hover:shadow-[0_10px_35px_rgba(67,39,31,0.06)]"
                    >
                      <div className="flex flex-col gap-4 border-b border-[#EFE7DE] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                          <div>
                            <p className="mb-1 text-[9px] uppercase tracking-[0.2em] text-[#987849]">
                              Order reference
                            </p>
                            <h2 className="text-sm font-medium tracking-[0.08em] text-[#641F32]">
                              #{order.id.slice(0, 8).toUpperCase()}
                            </h2>
                          </div>

                          <div className="hidden h-8 w-px bg-[#E8DED2] sm:block" />

                          <div>
                            <p className="mb-1 text-[9px] uppercase tracking-[0.2em] text-[#987849]">
                              Date placed
                            </p>
                            <p className="flex items-center gap-1.5 text-xs text-[#756C65]">
                              <CalendarDays className="h-3.5 w-3.5" />
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    },
                                  )
                                : "Date unavailable"}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`inline-flex w-fit items-center gap-2 border px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] ${statusClass}`}
                        >
                          {status === "DELIVERED" ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : status === "SHIPPED" ? (
                            <Truck className="h-3.5 w-3.5" />
                          ) : status === "CANCELLED" ? (
                            <Package className="h-3.5 w-3.5" />
                          ) : (
                            <Clock3 className="h-3.5 w-3.5" />
                          )}
                          {statusLabel}
                        </span>
                      </div>

                      <div className="px-5 py-5 sm:px-7">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                          <div className="flex min-w-0 flex-1 items-center">
                            <div className="flex shrink-0 items-center">
                              {order.items.slice(0, 3).map((item, index) => (
                                <div
                                  key={`${item.variantId}-${index}`}
                                  className={`relative flex h-[76px] w-[58px] items-center justify-center overflow-hidden border border-white bg-[#F7F3ED] ${
                                    index > 0 ? "-ml-3" : ""
                                  }`}
                                  style={{ zIndex: 3 - index }}
                                >
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    loading="lazy"
                                    className="h-full w-full object-contain p-0.5"
                                  />
                                </div>
                              ))}
                            </div>

                            <div className="ml-5 min-w-0">
                              <p className="font-display text-xl leading-snug">
                                {order.items.length === 1
                                  ? order.items[0]?.name ?? "Your selection"
                                  : `${order.items[0]?.name ?? "Your selection"} + ${order.items.length - 1} more`}
                              </p>
                              <p className="mt-2 text-xs text-[#756C65]">
                                {itemCount}{" "}
                                {itemCount === 1 ? "piece" : "pieces"} in this
                                order
                              </p>
                              <p className="mt-1 text-xs text-[#8B8179]">
                                {order.paymentMethod ??
                                  "Payment method unavailable"}
                                {" · "}
                                {order.paymentStatus}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-4 border-t border-[#EFE7DE] pt-4 sm:min-w-[190px] sm:flex-col sm:items-end sm:justify-center sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
                            <div>
                              <p className="mb-1 text-[9px] uppercase tracking-[0.18em] text-[#987849]">
                                Order total
                              </p>
                              <p className="font-display text-2xl text-[#641F32]">
                                {formatINR(Number(order.total))}
                              </p>
                            </div>

                            
<Link
  to="/order/$id"
  params={{ id: order.id }}
  className="inline-flex h-10 shrink-0 items-center justify-center gap-2 border border-[#641F32] px-4 text-[10px] uppercase tracking-[0.12em] text-[#641F32] transition-colors hover:bg-[#641F32] hover:text-white"
>
  View order
  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
</Link>

                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 border-t border-[#EFE7DE] bg-[#FCFAF7] px-5 py-3 sm:px-7">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#987849]" />
                        <p className="text-[10px] leading-5 tracking-wide text-[#756C65]">
                          Keep your order reference handy for any enquiries.
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="border-t border-[#E8DED2] bg-[#F3EEE6]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8 lg:py-14">
          <div>
            <Link to="/" className="inline-block leading-tight">
              <span className="block font-display text-2xl text-[#641F32]">
                Sreeja’s
              </span>
              <span className="mt-1 block text-[9px] uppercase tracking-[0.3em] text-[#987849]">
                Bridal Boutique
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-xs leading-6 text-[#756C65]">
              Thoughtfully selected pieces for your celebrations, traditions,
              and unforgettable moments.
            </p>
          </div>

          <div>
            <h2 className="mb-4 text-[10px] uppercase tracking-[0.2em] text-[#641F32]">
              Explore
            </h2>
            <div className="flex flex-col items-start gap-3 text-xs text-[#756C65]">
              <Link to="/" className="hover:text-[#641F32]">Home</Link>
              <Link to="/shop" className="hover:text-[#641F32]">
                Shop collections
              </Link>
              <Link to="/myorders" className="hover:text-[#641F32]">
                My orders
              </Link>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-[10px] uppercase tracking-[0.2em] text-[#641F32]">
              A personal touch
            </h2>
            <p className="text-xs leading-6 text-[#756C65]">
              Need help with an order? Keep your order reference ready when
              contacting the boutique.
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href="mailto:"
                aria-label="Email the boutique"
                className="flex h-9 w-9 items-center justify-center border border-[#DCCDBB] text-[#641F32] hover:bg-white"
              >
                <Mail className="h-4 w-4" />
              </a>
              <a
                href="https://www.instagram.com/sreejas_bridal_boutique?utm_source=ig_web_button_share_sheet&cplk=ZDNlZDc0MzIxNw=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center border border-[#DCCDBB] text-[#641F32] hover:bg-white"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <Link
                to="/shop"
                aria-label="Shop collections"
                className="flex h-9 w-9 items-center justify-center border border-[#DCCDBB] text-[#641F32] hover:bg-white"
              >
                <Heart className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-[#E1D6C9] px-4 py-4 text-center text-[9px] tracking-[0.12em] text-[#8B8179]">
          © {new Date().getFullYear()} Sreeja’s Bridal Boutique. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function OrdersLoading() {
  return (
    <div className="space-y-5" aria-label="Loading orders" aria-busy="true">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="animate-pulse border border-[#E8DED2] bg-white"
        >
          <div className="flex flex-wrap justify-between gap-4 border-b border-[#EFE7DE] px-5 py-5 sm:px-7">
            <div className="space-y-2">
              <div className="h-2 w-24 bg-[#EEE7DE]" />
              <div className="h-4 w-32 bg-[#EEE7DE]" />
            </div>
            <div className="h-7 w-28 bg-[#F3EDE4]" />
          </div>
          <div className="flex items-center gap-4 px-5 py-6 sm:px-7">
            <div className="h-[76px] w-[58px] bg-[#F3EDE4]" />
            <div className="flex-1 space-y-3">
              <div className="h-4 w-2/3 bg-[#EEE7DE]" />
              <div className="h-3 w-1/3 bg-[#EEE7DE]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
