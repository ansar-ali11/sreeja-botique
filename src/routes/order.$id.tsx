import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { SiteLayout, PageTitle, Loading, Empty } from "@/components/SiteLayout";
import { RequireAuth } from "@/components/RequireAuth";
import { getOrder } from "@/lib/api";
import { formatINR, type OrderStatus } from "@/lib/types";
import { seo } from "@/lib/seo";

const STEPS: OrderStatus[] = ["PLACED", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

export const Route = createFileRoute("/order/$id")({
  head: () => seo("Order Details", "Track your order status."),
  component: () => <SiteLayout><PageTitle title="Order Details" /><RequireAuth><OrderView /></RequireAuth></SiteLayout>,
});

function OrderView() {
  const { id } = Route.useParams();
  const { data: o, isLoading } = useQuery({ queryKey: ["order", id], queryFn: () => getOrder(id) });
  if (isLoading) return <Loading />;
  if (!o) return <Empty title="Order not found" />;
  const idx = STEPS.indexOf(o.orderStatus);
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <div className="flex justify-between text-sm"><span>#{o.id.slice(0, 8).toUpperCase()}</span><span>Payment: {o.paymentStatus}</span></div>
      {o.orderStatus === "CANCELLED" ? <p className="text-destructive">This order was cancelled.</p> : (
        <ol className="flex justify-between">
          {STEPS.map((s, i) => (
            <li key={s} className="flex flex-1 flex-col items-center gap-2 text-center text-[10px] tracking-widest">
              <span className={`flex h-8 w-8 items-center justify-center rounded-full border ${i <= idx ? "bg-primary text-primary-foreground" : ""}`}>{i <= idx ? <Check className="h-4 w-4" /> : i + 1}</span>{s}
            </li>
          ))}
        </ol>
      )}
      <ul className="divide-y border-y">
        {o.items.map((i) => (
          <li key={i.variantId} className="flex gap-4 py-3 text-sm">
            <img src={i.image} alt={i.name} className="h-20 w-16 object-cover" />
            <div className="flex-1"><p>{i.name}</p><p className="text-xs text-muted-foreground">{i.size} {i.color} · Qty {i.quantity}</p></div>
            <span>{formatINR(i.price * i.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="ml-auto max-w-xs space-y-1 text-sm">
        <Row l="Subtotal" v={o.subtotal} />{o.discount > 0 && <Row l={`Discount ${o.couponCode ?? ""}`} v={-o.discount} />}
        <Row l="Shipping" v={o.shipping} />{o.tax > 0 && <Row l="Tax" v={o.tax} />}
        <div className="border-t pt-1 font-medium"><Row l="Total" v={o.total} /></div>
      </div>
      <div className="text-sm"><p className="text-xs tracking-widest">SHIPPING TO</p><p>{o.shippingAddress.fullName}, {o.shippingAddress.line1}, {o.shippingAddress.city} {o.shippingAddress.pincode}</p></div>
    </div>
  );
}
const Row = ({ l, v }: { l: string; v: number }) => <div className="flex justify-between"><span>{l}</span><span>{formatINR(v)}</span></div>;
