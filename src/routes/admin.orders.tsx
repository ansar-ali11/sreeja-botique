import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AdminHeader } from "./admin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listAllOrders, setOrderStatus } from "@/lib/api";
import { formatINR, type OrderStatus } from "@/lib/types";

export const Route = createFileRoute("/admin/orders")({ component: Orders });
const STATUSES: OrderStatus[] = ["PLACED", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

function Orders() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>("");
  const [open, setOpen] = useState<string>();
  const { data = [], isLoading } = useQuery({ queryKey: ["adminOrders", "all"], queryFn: () => listAllOrders(500) });
  const rows = filter ? data.filter((o) => o.orderStatus === filter) : data;
  const change = async (id: string, s: OrderStatus) => {
    try { await setOrderStatus(id, s); toast.success("Status updated"); qc.invalidateQueries({ queryKey: ["adminOrders"] }); }
    catch (err) { toast.error((err as Error).message); }
  };
  return (
    <>
      <AdminHeader title="Orders">
        <select aria-label="Filter status" className="h-9 rounded-md border bg-background px-3 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </AdminHeader>
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Date</TableHead><TableHead>Customer</TableHead><TableHead>Total</TableHead><TableHead>Payment</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={6}>Loading…</TableCell></TableRow>}
            {!isLoading && !rows.length && <TableRow><TableCell colSpan={6} className="text-muted-foreground">No orders.</TableCell></TableRow>}
            {rows.map((o) => (<>
              <TableRow key={o.id} className="cursor-pointer" onClick={() => setOpen(open === o.id ? undefined : o.id)}>
                <TableCell>#{o.id.slice(0, 8).toUpperCase()}</TableCell>
                <TableCell>{new Date(o.createdAt).toLocaleDateString("en-IN")}</TableCell>
                <TableCell>{o.shippingAddress.fullName}<br /><span className="text-xs text-muted-foreground">{o.shippingAddress.phone}</span></TableCell>
                <TableCell>{formatINR(o.total)}</TableCell>
                <TableCell className="text-xs">{o.paymentStatus}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <select aria-label="Order status" className="h-8 rounded border bg-background px-2 text-xs" value={o.orderStatus} onChange={(e) => change(o.id, e.target.value as OrderStatus)}>
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </TableCell>
              </TableRow>
              {open === o.id && (
                <TableRow key={o.id + "-d"}><TableCell colSpan={6} className="bg-muted/40 text-sm">
                  {o.items.map((i) => <div key={i.variantId}>{i.name} · {i.size} {i.color} · SKU {i.sku} × {i.quantity} — {formatINR(i.price * i.quantity)}</div>)}
                  <div className="mt-2 text-muted-foreground">{o.shippingAddress.line1}, {o.shippingAddress.line2} {o.shippingAddress.city}, {o.shippingAddress.state} {o.shippingAddress.pincode}{o.couponCode && ` · Coupon ${o.couponCode}`}</div>
                </TableCell></TableRow>
              )}
            </>))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
