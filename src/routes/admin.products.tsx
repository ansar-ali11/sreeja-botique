import { createFileRoute, Link, Outlet, useMatchRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AdminHeader } from "./admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listCategories, listProducts, saveProduct } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatINR } from "@/lib/types";

export const Route = createFileRoute("/admin/products")({ component: Products });

function Products() {
  const isChild = useMatchRoute()({ to: "/admin/products/$id" });
  const { user } = useAuth();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const { data = [], isLoading } = useQuery({ queryKey: ["adminProducts"], queryFn: () => listProducts({ includeInactive: true }) });
  const { data: cats = [] } = useQuery({ queryKey: ["adminCategories"], queryFn: () => listCategories(true) });
  if (isChild) return <Outlet />;
  const rows = data.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.variants.some((v) => v.sku.toLowerCase().includes(q.toLowerCase())));
  const toggle = async (id: string, active: boolean) => {
    await saveProduct({ id, active }, user!.uid); // soft delete / restore
    toast.success(active ? "Product restored" : "Product hidden from store");
    qc.invalidateQueries({ queryKey: ["adminProducts"] });
  };
  return (
    <>
      <AdminHeader title="Products & Inventory"><Button asChild><Link to="/admin/products/$id" params={{ id: "new" }}>Add product</Link></Button></AdminHeader>
      <Input className="mb-4 max-w-xs" placeholder="Search name or SKU" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Category</TableHead><TableHead>Type</TableHead><TableHead>Price</TableHead><TableHead>Stock</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={7}>Loading…</TableCell></TableRow>}
            {!isLoading && !rows.length && <TableRow><TableCell colSpan={7} className="text-muted-foreground">No products yet — add your first one.</TableCell></TableRow>}
            {rows.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="flex items-center gap-3">{p.images[0] && <img src={p.images[0]} alt="" className="h-12 w-9 object-cover" />}{p.name}</TableCell>
                <TableCell>{cats.find((c) => c.id === p.categoryId)?.name ?? "—"}</TableCell>
                <TableCell className="text-xs">{p.productType === "BUY_ONLINE" ? "Buy online" : "Enquiry"}</TableCell>
                <TableCell>{formatINR(p.discountPrice || p.price)}</TableCell>
                <TableCell>{p.variants.reduce((n, v) => n + v.stock, 0)}</TableCell>
                <TableCell className="text-xs">{p.active ? "Live" : "Hidden"}</TableCell>
                <TableCell className="space-x-2 whitespace-nowrap text-right">
                  <Button size="sm" variant="outline" asChild><Link to="/admin/products/$id" params={{ id: p.id }}>Edit</Link></Button>
                  <Button size="sm" variant="ghost" onClick={() => toggle(p.id, !p.active)}>{p.active ? "Hide" : "Restore"}</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
