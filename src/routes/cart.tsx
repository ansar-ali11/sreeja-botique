import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Minus, Plus, X } from "lucide-react";
import { SiteLayout, PageTitle, Empty } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { getSettings } from "@/lib/api";
import { DEFAULT_SETTINGS, formatINR } from "@/lib/types";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/cart")({
  head: () => seo("Shopping Bag", "Review the pieces in your bag."),
  component: Cart,
});

function Cart() {
  const { items, setQty, remove, subtotal } = useCart();
  const { data: st = DEFAULT_SETTINGS } = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const shipping = subtotal >= st.freeShippingThreshold ? 0 : st.defaultShippingFee;
  return (
    <SiteLayout>
      <PageTitle title="Your Bag" />
      {items.length === 0 ? (
        <Empty title="Your bag is empty"><Link to="/shop" className="underline">Continue shopping</Link></Empty>
      ) : (
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[1fr_340px] lg:px-8">
          <ul className="divide-y">
            {items.map((i) => (
              <li key={i.variantId} className="flex gap-4 py-5">
                <img src={i.image} alt={i.name} className="h-32 w-24 bg-secondary object-cover" />
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between gap-2">
                    <h2 className="font-display text-lg">{i.name}</h2>
                    <button onClick={() => remove(i.variantId)} aria-label={`Remove ${i.name}`}><X className="h-4 w-4" /></button>
                  </div>
                  <p className="text-xs text-muted-foreground">{[i.size, i.color].filter(Boolean).join(" · ")}</p>
                  <p className="text-sm">{formatINR(i.price)}</p>
                  <div className="flex w-fit items-center border">
                    <button className="p-2" aria-label="Decrease" onClick={() => setQty(i.variantId, i.quantity - 1)}><Minus className="h-3 w-3" /></button>
                    <span className="w-8 text-center text-sm">{i.quantity}</span>
                    <button className="p-2" aria-label="Increase" onClick={() => setQty(i.variantId, i.quantity + 1)}><Plus className="h-3 w-3" /></button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <aside className="h-fit space-y-3 border bg-card p-6 text-sm">
            <h2 className="font-display text-2xl">Summary</h2>
            <div className="flex justify-between"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{shipping ? formatINR(shipping) : "Free"}</span></div>
            {shipping > 0 && <p className="text-xs text-muted-foreground">Free shipping on orders above {formatINR(st.freeShippingThreshold)}</p>}
            <div className="flex justify-between border-t pt-3 text-base font-medium"><span>Estimated total</span><span>{formatINR(subtotal + shipping)}</span></div>
            <Button asChild size="lg" className="w-full tracking-widest"><Link to="/checkout">CHECKOUT</Link></Button>
          </aside>
        </div>
      )}
    </SiteLayout>
  );
}
