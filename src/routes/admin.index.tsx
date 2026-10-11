import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminHeader } from "./admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSalesStats, getSettings, listAllOrders, listProducts } from "@/lib/api";
import { formatINR } from "@/lib/types";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

function Dashboard() {
  const stats = useQuery({ queryKey: ["salesStats"], queryFn: getSalesStats });
  const orders = useQuery({ queryKey: ["adminOrders"], queryFn: () => listAllOrders(10) });
  const products = useQuery({ queryKey: ["adminProducts"], queryFn: () => listProducts({ includeInactive: true }) });
  const settings = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const month = new Date().toISOString().slice(0, 7);
  const cur = stats.data?.find((s) => s.id === month);
  const threshold = settings.data?.lowStockThreshold ?? 3;
  const low = (products.data ?? []).filter((p) => p.active && p.productType === "BUY_ONLINE").flatMap((p) => p.variants.filter((v) => v.stock <= threshold).map((v) => ({ p, v })));
  const pending = (orders.data ?? []).filter((o) => o.orderStatus === "PLACED" || o.orderStatus === "CONFIRMED").length;

  const kpi = [
    ["Revenue this month", formatINR(cur?.revenue ?? 0)],
    ["Orders this month", String(cur?.orders ?? 0)],
    ["Orders to process", String(pending)],
    ["Low-stock variants", String(low.length)],
  ];
  return (
    <>
      <AdminHeader title="Dashboard" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpi.map(([l, v]) => <Card key={l}><CardHeader className="pb-2"><CardTitle className="text-xs font-normal text-muted-foreground">{l}</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{v}</CardContent></Card>)}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-base">Recent orders</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
          {orders.data?.length ? orders.data.map((o) => <div key={o.id} className="flex justify-between"><span>#{o.id.slice(0, 8).toUpperCase()} · {o.shippingAddress.fullName}</span><span>{formatINR(o.total)} · {o.orderStatus}</span></div>) : <p className="text-muted-foreground">No orders yet.</p>}
          <Link to="/admin/orders" className="block pt-2 text-primary underline">All orders</Link>
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Low stock alerts</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
          {low.length ? low.slice(0, 12).map(({ p, v }) => <div key={v.id} className="flex justify-between"><span>{p.name} · {v.size} {v.color}</span><span className={v.stock === 0 ? "text-destructive" : ""}>{v.stock} left</span></div>) : <p className="text-muted-foreground">All variants are well stocked.</p>}
        </CardContent></Card>
      </div>
    </>
  );
}
