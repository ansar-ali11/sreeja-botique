import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AdminHeader } from "./admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { listCoupons, saveCoupon } from "@/lib/api";
import { formatINR, type Coupon } from "@/lib/types";

export const Route = createFileRoute("/admin/coupons")({ component: Coupons });

function Coupons() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["coupons"], queryFn: listCoupons });
  const [c, setC] = useState<Partial<Coupon>>({ code: "", type: "PERCENT", value: 10, minOrder: 0, active: true });
  const [exp, setExp] = useState("");
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
   await saveCoupon({
  ...c,
  ...(exp ? { expiresAt: new Date(exp).getTime() } : {}),
}).catch((err) => toast.error(err.message));
    toast.success("Coupon saved"); setC({ ...c, code: "" }); qc.invalidateQueries({ queryKey: ["coupons"] });
  };
  return (
    <>
      <AdminHeader title="Coupons" />
      <form onSubmit={add} className="mb-6 grid max-w-3xl gap-2 rounded-md border bg-background p-4 sm:grid-cols-6">
        <Input required aria-label="Code" placeholder="CODE" className="sm:col-span-2" value={c.code} onChange={(e) => setC({ ...c, code: e.target.value.toUpperCase() })} />
        <select aria-label="Type" className="h-10 rounded-md border bg-background px-2 text-sm" value={c.type} onChange={(e) => setC({ ...c, type: e.target.value as Coupon["type"] })}><option value="PERCENT">% off</option><option value="FLAT">₹ off</option></select>
        <Input type="number" aria-label="Value" min={1} value={c.value} onChange={(e) => setC({ ...c, value: Number(e.target.value) })} />
        <Input type="number" aria-label="Minimum order" placeholder="Min order" value={c.minOrder} onChange={(e) => setC({ ...c, minOrder: Number(e.target.value) })} />
        <Input type="date" aria-label="Expires" value={exp} onChange={(e) => setExp(e.target.value)} />
        <Button className="sm:col-span-6 sm:w-fit">Create coupon</Button>
      </form>
      <ul className="max-w-3xl divide-y rounded-md border bg-background">
        {!data.length && <li className="p-4 text-sm text-muted-foreground">No coupons yet.</li>}
        {data.map((x) => (
          <li key={x.id} className="flex items-center gap-4 p-4 text-sm">
            <span className="font-mono font-medium">{x.code}</span>
            <span className="flex-1 text-muted-foreground">{x.type === "PERCENT" ? `${x.value}% off` : `${formatINR(x.value)} off`}{x.minOrder ? ` · min ${formatINR(x.minOrder)}` : ""}{x.expiresAt ? ` · until ${new Date(x.expiresAt).toLocaleDateString("en-IN")}` : ""}</span>
            <Switch checked={x.active} aria-label="Active" onCheckedChange={async (v) => { await saveCoupon({ id: x.id, active: v }); qc.invalidateQueries({ queryKey: ["coupons"] }); }} />
          </li>
        ))}
      </ul>
    </>
  );
}
