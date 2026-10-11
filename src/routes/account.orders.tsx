import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout, PageTitle } from "@/components/SiteLayout";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth";
import { listMyOrders } from "@/lib/api";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/account/orders")({
  head: () => seo("My Orders", "View your order history."),
  component: () => (
    <SiteLayout>
      <PageTitle title="My Orders" />
      <RequireAuth>
        <MyOrders />
      </RequireAuth>
    </SiteLayout>
  ),
});

function MyOrders() {
  const { user } = useAuth();

  const {
    data: orders = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["myOrders", user!.uid],
    queryFn: () => listMyOrders(user!.uid),
    enabled: !!user?.uid,
  });

  if (isLoading) {
    return <p className="p-6">Loading your orders...</p>;
  }

  if (error) {
    return (
      <p className="p-6 text-destructive">
        Could not load your orders: {(error as Error).message}
      </p>
    );
  }

  if (!orders.length) {
    return (
      <div className="p-6 text-center">
        <p>You haven't placed any orders yet.</p>
        <Link
          to="/shop"
          className="mt-4 inline-block underline"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4">
      {orders.map((order) => (
        <article
          key={order.id}
          className="rounded-lg border border-border p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold">
                Order #{order.id}
              </h2>
              <p className="text-sm text-muted-foreground">
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString()
                  : "Date unavailable"}
              </p>
            </div>

            <p className="font-semibold">
              ₹{Number(order.total).toLocaleString("en-IN")}
            </p>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <p>
              Order status: <strong>{order.orderStatus}</strong>
            </p>
            <p>
              Payment: <strong>{order.paymentStatus}</strong>
            </p>
            <p>
              Method: <strong>{order.paymentMethod ?? "N/A"}</strong>
            </p>
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            {order.items.length} item(s)
          </p>

          <Link
            to="/order/$id"
            params={{ id: order.id }}
            className="mt-4 inline-block text-sm underline"
          >
            View order details
          </Link>
        </article>
      ))}
    </div>
  );
}
